import { Vec2 } from '../math/Vec2.js';
import { Vec6 } from '../math/Vec6.js';
import { Mat6 } from '../math/Mat6.js';
import { inputMap } from './inputMap.svelte.js';
import { juliaWiseInputScheme, mandelbrotToExponentMappings, mandelbrotToJuliaMappings, xWiseInputScheme, type InputScheme, type PlaneMapping } from './inputSchemes.js';
import { mandelbrotPreset } from './orientationPresets.js';
import { expLerpFactor, lerp } from '../math/utilities.js';
import { Vec3 } from '../math/Vec3.js';

export enum IndicatorSetting {
	Always,
	Never,
	WhenToolSelected,
}

export class Mandelbrot6DState {
	static readonly RIGHT_VECTOR = new Vec6(1, 0, 0, 0, 0, 0);
	static readonly UP_VECTOR = new Vec6(0, 1, 0, 0, 0, 0);

	position = $state(mandelbrotPreset.position);
	velocity = new Vec6(0, 0, 0, 0, 0, 0);
	
	upVector = $state(Mandelbrot6DState.UP_VECTOR);
	rightVector = $state(Mandelbrot6DState.RIGHT_VECTOR);
	zoomLevel = $state(0);

	zoom = $state(mandelbrotPreset.zoom);
	zoomVelocity = $state(0);
	rotationVelocity = $state(0);

	// Indicator settings
	zIndicatorSize = $state(0.0025);
	eIndicatorSize = $state(0.0025);

	zIndicatorSetting = $state(IndicatorSetting.WhenToolSelected);
	eIndicatorSetting = $state(IndicatorSetting.WhenToolSelected);

	speedScale = $state(1.0);
	springScale = $state(1.0);

	orientationMatrix = Mat6.identity().set(mandelbrotPreset.orientationMatrix);

	moveOnLocalAxes = $state(true);
	rotateOnLocalAxes = $state(true);

	private lastTime = 0;

	get zIndicatorEffectiveSize() {
		return indicatorEffectiveSize(this.zIndicatorSize, this.zIndicatorSetting, juliaWiseInputScheme, this.zoomLevel);
	}

	get eIndicatorEffectiveSize() {
		return indicatorEffectiveSize(this.eIndicatorSize, this.eIndicatorSetting, xWiseInputScheme, this.zoomLevel);
	}

	/**
	 * Rotate the camera by the specified plane mappings and amount.
	 */
	rotateByPlaneMappings(mappings: PlaneMapping[], amount: number, local = false) {
		if (!amount || mappings.length === 0) return;

		// 6D rotation
		const oldMat = this.orientationMatrix.clone();
		for (const mapping of mappings) {
			const { axis1, axis2 } = mapping;
			const rotationMatrix = !local ?
				Mat6.rotationFromAxisIndices(axis1, axis2, amount) :
				Mat6.rotationFromAxes(
					oldMat.multiplyVec6(Vec6.fromIndex(axis1)),
					oldMat.multiplyVec6(Vec6.fromIndex(axis2)),
					amount
				)
			this.orientationMatrix = rotationMatrix.multiply(this.orientationMatrix);
		}
	}

	/**
	 * Update state
	 */
	update(currentTime: number): void {
		// Calculate delta time
		const deltaTime = (this.lastTime === 0 ? 0 : (currentTime - this.lastTime) / 1000);
		this.lastTime = currentTime;
		
		// Process input
		let moveDirection = new Vec2(0, 0);
		let secondaryMovement = 0;
		
		if (inputMap.isMovingLeft) moveDirection.x -= 1.0;
		if (inputMap.isMovingRight) moveDirection.x += 1.0;
		
		if (inputMap.isMovingUp) moveDirection.y += 1.0;
		if (inputMap.isMovingDown) moveDirection.y -= 1.0;
		
		if (inputMap.isSneaking) secondaryMovement -= 1.0;
		if (inputMap.isJumping) secondaryMovement += 1.0;
		
		// Normalize movement direction
		if (moveDirection.length() > 0.0) {
			moveDirection = moveDirection.normalize();
		}
		
		// Calculate target velocity
		const inputScheme = inputMap.scheme;
		const horizontalAxis = this.moveOnLocalAxes ? 
			this.orientationMatrix.multiplyVec6(inputScheme.horizontalAxis) : 
			inputScheme.horizontalAxis;
		
		const verticalAxis = this.moveOnLocalAxes ? 
			this.orientationMatrix.multiplyVec6(inputScheme.verticalAxis) : 
			inputScheme.verticalAxis;

		const targetVelocity =
			horizontalAxis.scale(moveDirection.x)
			.add(verticalAxis.scale(moveDirection.y))
			.scale(this.speedScale);

		const targetZoomVelocity = secondaryMovement * inputScheme.zoomSpeed * this.speedScale;
		const targetRotationVelocity = secondaryMovement * inputScheme.rotateSpeed * this.speedScale;

		// Accelerate towards target velocity
		const velocityLerp = expLerpFactor(applySpringSettings(inputScheme.velocityLerp, this.springScale), deltaTime);
		const rotationVelocityLerp = expLerpFactor(applySpringSettings(inputScheme.rotationVelocityLerp, this.springScale), deltaTime);
		this.velocity = this.velocity.mix(targetVelocity, velocityLerp);
		this.zoomVelocity = lerp(this.zoomVelocity, targetZoomVelocity, velocityLerp);
		this.rotationVelocity = lerp(this.rotationVelocity, targetRotationVelocity, rotationVelocityLerp);

		// Apply velocity
		this.zoom += this.zoomVelocity * deltaTime;
		this.zoomLevel = Math.pow(2, this.zoom);

		const scaledVelocity = this.velocity.scale(deltaTime);
		this.position = new Vec6(
			this.position.x + scaledVelocity.x / this.zoomLevel,
			this.position.y + scaledVelocity.y / this.zoomLevel,
			this.position.z + scaledVelocity.z,
			this.position.w + scaledVelocity.w,
			this.position.v + scaledVelocity.v,
			this.position.u + scaledVelocity.u
		);

		this.rotateByPlaneMappings(inputScheme.rotationPlanes, this.rotationVelocity * deltaTime, this.rotateOnLocalAxes);

		// Zero velocities if small to prevent constant UI updates
		const margin = 0.02;
		if (this.velocity.length() < margin) {
			this.velocity = new Vec6(0, 0, 0, 0, 0, 0);
		}
		if (Math.abs(this.zoomVelocity) < margin) {
			this.zoomVelocity = 0;
		}
		if (Math.abs(this.rotationVelocity) < margin) {
			this.rotationVelocity = 0;
		}

		// Update the right / up vectors
		this.rightVector = this.orientationMatrix.multiplyVec6(Mandelbrot6DState.RIGHT_VECTOR);
		this.upVector = this.orientationMatrix.multiplyVec6(Mandelbrot6DState.UP_VECTOR);
	}

	clearVelocities() {
		this.velocity = new Vec6(0, 0, 0, 0, 0, 0);
		this.zoomVelocity = 0;
		this.rotationVelocity = 0;
	}
}

export class InterpolatedMandelbrotState {
	static readonly RIGHT_VECTOR = new Vec6(1, 0, 0, 0, 0, 0);
	static readonly UP_VECTOR = new Vec6(0, 1, 0, 0, 0, 0);
	static readonly MANDELBROT_INTERPOLATION = new Vec3(0, 1, 0);

	readonly upVector = InterpolatedMandelbrotState.UP_VECTOR;
	readonly rightVector = InterpolatedMandelbrotState.RIGHT_VECTOR;

	readonly moveOnLocalAxes = false;
	readonly rotateOnLocalAxes = false;

	position = $state(mandelbrotPreset.position);
	velocity = new Vec6(0, 0, 0, 0, 0, 0);
	
	zoomLevel = $state(0);

	zoom = $state(mandelbrotPreset.zoom);
	zoomVelocity = $state(0);
	rotationVelocity = $state(0);

	// Indicator settings
	zIndicatorSize = $state(0.0025 * 2);
	eIndicatorSize = $state(0.0025 * 2);

	zIndicatorSetting = $state(IndicatorSetting.WhenToolSelected);
	eIndicatorSetting = $state(IndicatorSetting.WhenToolSelected);

	speedScale = $state(1.0);
	springScale = $state(1.0);

	lerpRotation = $state(new Vec2(0, 0));
	lerp = $state(InterpolatedMandelbrotState.MANDELBROT_INTERPOLATION);

	private lastTime = 0;

	get zIndicatorEffectiveSize() {
		return indicatorEffectiveSize(this.zIndicatorSize, this.zIndicatorSetting, juliaWiseInputScheme, this.zoomLevel);
	}

	get eIndicatorEffectiveSize() {
		return indicatorEffectiveSize(this.eIndicatorSize, this.eIndicatorSetting, xWiseInputScheme, this.zoomLevel);
	}

	/**
	 * Rotate the camera by the specified plane mappings and amount.
	 */
	rotateByPlaneMappings(mappings: PlaneMapping[], amount: number) {
		const normalizedAmount = amount / mappings.length;
		for (const mapping of mappings) {
			const { axis1, axis2 } = mapping;
			
			const isJuliaWise = mandelbrotToJuliaMappings.some(m => m.axis1 === axis1 && m.axis2 === axis2);
			
			if (isJuliaWise) {
				this.lerpRotation.y += normalizedAmount;
			}

			const isXWise = mandelbrotToExponentMappings.some(m => m.axis1 === axis1 && m.axis2 === axis2);

			if (isXWise) {
				this.lerpRotation.x += normalizedAmount;
			}
		}
	}

	/**
	 * Update state
	 */
	update(currentTime: number): void {
		// Calculate delta time
		const deltaTime = (this.lastTime === 0 ? 0 : (currentTime - this.lastTime) / 1000);
		this.lastTime = currentTime;
		
		// Process input
		let moveDirection = new Vec2(0, 0);
		let secondaryMovement = 0;
		
		if (inputMap.isMovingLeft) moveDirection.x -= 1.0;
		if (inputMap.isMovingRight) moveDirection.x += 1.0;
		
		if (inputMap.isMovingUp) moveDirection.y += 1.0;
		if (inputMap.isMovingDown) moveDirection.y -= 1.0;
		
		if (inputMap.isSneaking) secondaryMovement -= 1.0;
		if (inputMap.isJumping) secondaryMovement += 1.0;
		
		// Normalize movement direction
		if (moveDirection.length() > 0.0) {
			moveDirection = moveDirection.normalize();
		}
		
		// Calculate target velocity
		const inputScheme = inputMap.scheme;
		const targetVelocity =
			inputMap.scheme.horizontalAxis.scale(moveDirection.x)
			.add(inputMap.scheme.verticalAxis.scale(moveDirection.y))
			.scale(this.speedScale);

		const targetZoomVelocity = secondaryMovement * inputScheme.zoomSpeed * this.speedScale;
		const targetRotationVelocity = secondaryMovement * inputScheme.rotateSpeed * this.speedScale;

		// Accelerate towards target velocity
		const velocityLerp = expLerpFactor(applySpringSettings(inputScheme.velocityLerp, this.springScale), deltaTime);
		const rotationVelocityLerp = expLerpFactor(applySpringSettings(inputScheme.rotationVelocityLerp, this.springScale), deltaTime);
		this.velocity = this.velocity.mix(targetVelocity, velocityLerp);
		this.zoomVelocity = lerp(this.zoomVelocity, targetZoomVelocity, velocityLerp);
		this.rotationVelocity = lerp(this.rotationVelocity, targetRotationVelocity, rotationVelocityLerp);

		// Apply velocity
		this.zoom += this.zoomVelocity * deltaTime;
		this.zoomLevel = Math.pow(2, this.zoom);

		const scaledVelocity = this.velocity.scale(deltaTime);
		this.position = new Vec6(
			this.position.x + scaledVelocity.x / this.zoomLevel,
			this.position.y + scaledVelocity.y / this.zoomLevel,
			this.position.z + scaledVelocity.z,
			this.position.w + scaledVelocity.w,
			this.position.v + scaledVelocity.v,
			this.position.u + scaledVelocity.u
		);

		this.rotateByPlaneMappings(inputScheme.rotationPlanes, this.rotationVelocity * deltaTime);

		// Zero velocities if small to prevent constant UI updates
		const margin = 0.02;
		if (this.velocity.length() < margin) {
			this.velocity = new Vec6(0, 0, 0, 0, 0, 0);
		}
		if (Math.abs(this.zoomVelocity) < margin) {
			this.zoomVelocity = 0;
		}
		if (Math.abs(this.rotationVelocity) < margin) {
			this.rotationVelocity = 0;
		}

		// Wrap rotation
		this.lerpRotation.x = wrapAngle(this.lerpRotation.x);
		this.lerpRotation.y = wrapAngle(this.lerpRotation.y);

		// Update the right / up vectors
		this.lerp = this.pitchYawToDirection(this.lerpRotation.x, this.lerpRotation.y);

		// trigger reactivity
		this.lerpRotation = this.lerpRotation.clone();
	}

	clearVelocities() {
		this.velocity = new Vec6(0, 0, 0, 0, 0, 0);
		this.zoomVelocity = 0;
		this.rotationVelocity = 0;
	}

	private pitchYawToDirection(pitch: number, yaw: number): Vec3 {
		const y = Math.cos(pitch) * Math.cos(yaw);
		const x =  Math.cos(pitch) * Math.sin(yaw);
		const z = Math.sin(pitch);
		return new Vec3(x, y, z);
	}
}


function indicatorEffectiveSize(indicatorSize: number, setting: IndicatorSetting, tool: InputScheme, zoomLevel: number): number {
	if (setting === IndicatorSetting.Never) return 0;
	if (setting === IndicatorSetting.WhenToolSelected && 
		(inputMap.scheme.horizontalAxis !== tool.horizontalAxis &&
		inputMap.scheme.verticalAxis !== tool.verticalAxis)) {
		return 0;
	}
	return indicatorSize / zoomLevel;
}

/**
 * Adjust exp-lerp based on user settings
 */
function applySpringSettings(value: number, springScale: number): number {
	const scale = springScale;
	if (!isFinite(scale)) return 0;
	return value ** scale;
}

function wrapAngle(angle: number): number {
	return ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
}