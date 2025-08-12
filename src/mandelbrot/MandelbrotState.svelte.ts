import { Vec2 } from '../math/Vec2.js';
import { Vec6 } from '../math/Vec6.js';
import { Mat6 } from '../math/Mat6.js';
import { inputMap } from './inputMap.svelte.js';
import { juliaToExponentMappings, juliaWiseInputScheme, mandelbrotToExponentMappings, mandelbrotToJuliaMappings, xWiseInputScheme, type InputScheme, type PlaneMapping } from './inputSchemes.js';
import { mandelbrotPreset } from './orientationPresets.js';
import { expLerpFactor, lerp } from '../math/utilities.js';
import { Vec3 } from '../math/Vec3.js';

export enum IndicatorSetting {
	Always,
	Never,
	WhenToolSelected,
}

const MOVE_SPEED = .6;
const ROTATE_SPEED = 0.2;
const VELOCITY_LERP = 5;
const ROTATIONAL_VELOCITY_LERP = 10;

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
	rotateOnLocalAxes = $state(false);

	simplifiedRotation = $state({
		active: true,
		juliaWise: 0,
		exponentWise: 0,
		juliaToExponentWise: 0,
	});

	private lastTime = 0;

	get zIndicatorEffectiveSize() {
		return this.#indicatorEffectiveSize(this.zIndicatorSize, this.zIndicatorSetting, juliaWiseInputScheme);
	}

	get eIndicatorEffectiveSize() {
		return this.#indicatorEffectiveSize(this.eIndicatorSize, this.eIndicatorSetting, xWiseInputScheme);
	}

	/**
	 * Rotate the camera by the specified plane mappings and amount.
	 */
	rotateByPlaneMappings(mappings: PlaneMapping[], amount: number, local = false) {
		if (!amount || mappings.length === 0) return;

		const normalizedAmount = amount / mappings.length;
		const oldMat = this.orientationMatrix.clone();
		for (const mapping of mappings) {
			// update orientation matrix
			const { axis1, axis2 } = mapping;
			const rotationMatrix = !local ?
				Mat6.rotationFromAxisIndices(axis1, axis2, amount) :
				Mat6.rotationFromAxes(
					oldMat.multiplyVec6(Vec6.fromIndex(axis1)),
					oldMat.multiplyVec6(Vec6.fromIndex(axis2)),
					amount
				)
			this.orientationMatrix = rotationMatrix.multiply(this.orientationMatrix);

			// update simplified rotation
			const isJuliaWise = mandelbrotToJuliaMappings.some(m => m.axis1 === axis1 && m.axis2 === axis2);
			const isExponentWise = mandelbrotToExponentMappings.some(m => m.axis1 === axis1 && m.axis2 === axis2);
			const isJuliaToExponentWise = juliaToExponentMappings.some(m => m.axis1 === axis1 && m.axis2 === axis2);

			if (isJuliaWise) {
				this.simplifiedRotation.juliaWise += normalizedAmount;
			}
			if (isExponentWise) {
				this.simplifiedRotation.exponentWise += normalizedAmount;
			}
			if (isJuliaToExponentWise) {
				this.simplifiedRotation.juliaToExponentWise += normalizedAmount;
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
		const horizontalAxis = quantizeToAxis(this.moveOnLocalAxes ? 
			this.orientationMatrix.multiplyVec6(inputScheme.horizontalAxis) : 
			inputScheme.horizontalAxis);
		
		const verticalAxis = quantizeToAxis(this.moveOnLocalAxes ? 
			this.orientationMatrix.multiplyVec6(inputScheme.verticalAxis) : 
			inputScheme.verticalAxis);

		const targetVelocity =
			horizontalAxis.scale(moveDirection.x)
			.add(verticalAxis.scale(moveDirection.y))
			.scale(this.speedScale * MOVE_SPEED);

		const targetZoomVelocity = secondaryMovement * inputScheme.zoomSpeed * this.speedScale;
		const targetRotationVelocity = secondaryMovement * ROTATE_SPEED * this.speedScale;

		// Accelerate towards target velocity
		const velocityLerp = expLerpFactor(VELOCITY_LERP / this.springScale, deltaTime);
		const rotationVelocityLerp = expLerpFactor(ROTATIONAL_VELOCITY_LERP / this.springScale, deltaTime);
		this.velocity = this.velocity.mix(targetVelocity, velocityLerp);
		this.zoomVelocity = lerp(this.zoomVelocity, targetZoomVelocity, velocityLerp);
		this.rotationVelocity = lerp(this.rotationVelocity, targetRotationVelocity, rotationVelocityLerp);

		// Apply velocity
		this.zoom += this.zoomVelocity * deltaTime;
		this.zoomLevel = Math.pow(2, this.zoom);

		const scaledVelocity = this.velocity.scale(deltaTime / this.zoomLevel);
		this.position = this.position.add(scaledVelocity);

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

		// Update simplified rotation
		if (this.simplifiedRotation.active) {
			this.simplifiedRotation.juliaWise = wrapAngle(this.simplifiedRotation.juliaWise);
			this.simplifiedRotation.exponentWise = wrapAngle(this.simplifiedRotation.exponentWise);
			this.simplifiedRotation.juliaToExponentWise = wrapAngle(this.simplifiedRotation.juliaToExponentWise);


			this.orientationMatrix = Mat6.identity()
				.multiply(Mat6.rotationFromAxisIndices(2, 4, this.simplifiedRotation.juliaToExponentWise))
				.multiply(Mat6.rotationFromAxisIndices(3, 5, this.simplifiedRotation.juliaToExponentWise))
				.multiply(Mat6.rotationFromAxisIndices(0, 4, this.simplifiedRotation.exponentWise))
				.multiply(Mat6.rotationFromAxisIndices(1, 5, this.simplifiedRotation.exponentWise))
				.multiply(Mat6.rotationFromAxisIndices(0, 2, this.simplifiedRotation.juliaWise))
				.multiply(Mat6.rotationFromAxisIndices(1, 3, this.simplifiedRotation.juliaWise));
		}


		// Update the right / up vectors
		this.rightVector = quantizeToAxis(this.orientationMatrix.multiplyVec6(Mandelbrot6DState.RIGHT_VECTOR));
		this.upVector = quantizeToAxis(this.orientationMatrix.multiplyVec6(Mandelbrot6DState.UP_VECTOR));
	}

	clearVelocities() {
		this.velocity = new Vec6(0, 0, 0, 0, 0, 0);
		this.zoomVelocity = 0;
		this.rotationVelocity = 0;
	}

	#indicatorEffectiveSize(indicatorSize: number, setting: IndicatorSetting, tool: InputScheme): number {
		if (setting === IndicatorSetting.Never) return 0;
		if (setting === IndicatorSetting.WhenToolSelected && 
			(inputMap.scheme.horizontalAxis !== tool.horizontalAxis &&
			inputMap.scheme.verticalAxis !== tool.verticalAxis)) {
			return 0;
		}
		return indicatorSize / this.zoomLevel;
	}
}


function wrapAngle(angle: number): number {
	return ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
}

function quantizeToAxis(vec: Vec6): Vec6 {
	const threshold = 0.00001; // Tolerance for snapping to axes
	const components = [vec.x, vec.y, vec.z, vec.w, vec.v, vec.u];
	
	// Find the component with the largest absolute value
	let maxIndex = 0;
	let maxValue = Math.abs(components[0]!);
	
	for (let i = 1; i < components.length; i++) {
		const absValue = Math.abs(components[i]!);
		if (absValue > maxValue) {
			maxValue = absValue;
			maxIndex = i;
		}
	}
	
	// Check if the vector is close to a single axis
	let isCloseToAxis = true;
	for (let i = 0; i < components.length; i++) {
		if (i !== maxIndex && Math.abs(components[i]!) > threshold) {
			isCloseToAxis = false;
			break;
		}
	}
	
	// If close to an axis, snap to the nearest unit axis vector
	if (isCloseToAxis && maxValue > threshold) {
		const sign = Math.sign(components[maxIndex]!);
		return Vec6.fromIndex(maxIndex).scale(sign);
	}
	
	// Otherwise, return the original vector
	return vec;
}