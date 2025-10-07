import { Vec2 } from '../math/Vec2.js';
import { Vec6 } from '../math/Vec6.js';
import { Mat6 } from '../math/Mat6.js';
import { inputMap } from './inputMap.svelte.js';
import { juliaToExponentMappings, juliaWiseInputMode, mandelbrotToExponentMappings, mandelbrotToJuliaMappings, xWiseInputMode, type PlaneMapping } from './inputModes.js';
import { mandelbrotPreset } from './presets.js';
import { expLerpFactor, lerp } from '../math/utilities.js';
import { SimplifiedRotation } from './SimplifiedRotation.svelte.js';

export enum IndicatorSetting {
	Always,
	Never,
	WhenToolSelected,
}

export interface MandelbrotBehavior {
	update(context: { mandelbrot: Mandelbrot6DState, currentTime: number, deltaTime: number }): void;
	shouldRemove?: boolean;
}
	
export class Mandelbrot6DState {
	static readonly RIGHT_VECTOR = new Vec6(1, 0, 0, 0, 0, 0);
	static readonly UP_VECTOR = new Vec6(0, 1, 0, 0, 0, 0);

	position = $state(mandelbrotPreset.position);
	relativePosition = $state(this.position);
	velocity = new Vec6(0, 0, 0, 0, 0, 0);

	//drift = $state(new Vec6(0, 0, 0, 0, 0, 0));
	
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

	// Iteration controls
	iterationsBase = $state(100);
	iterationsPerZoom = $state(50);
	iterationsMin = $state(100);
	iterationsMax = $state(5000);
	escapeRadius = $state(Infinity);

	orientationMatrix = Mat6.identity();

	moveOnLocalAxes = $state(true);
	rotateOnLocalAxes = $state(false);

	simplifiedRotationActive = $state(true);
	simplifiedRotation = $state(new SimplifiedRotation({
		juliaWise: 0,
		exponentWise: 0,
		juliaToExponentWise: 0,
	}));

	behaviors: MandelbrotBehavior[] = [];

	private lastTime = 0;

	get zIndicatorEffectiveSize() {
		return this.#indicatorEffectiveSize(this.zIndicatorSize, this.zIndicatorSetting, juliaWiseInputMode.horizontalAxis, juliaWiseInputMode.verticalAxis);
	}

	get eIndicatorEffectiveSize() {
		return this.#indicatorEffectiveSize(this.eIndicatorSize, this.eIndicatorSetting, xWiseInputMode.horizontalAxis, xWiseInputMode.verticalAxis);
	}

	get escapeRadiusSquared() {
		const r = this.escapeRadius;
		return r * r;
	}

	get maxIterationsComputed() {
		const value = Math.round(this.iterationsBase + this.zoom * this.iterationsPerZoom);
		return Math.max(this.iterationsMin, Math.min(this.iterationsMax, value));
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
		const inputMode = inputMap.mode;
		const horizontalAxis = snapToCardinalDirection(this.moveOnLocalAxes ? 
			this.orientationMatrix.multiplyVec6(inputMode.horizontalAxis) : 
			inputMode.horizontalAxis);
		
		const verticalAxis = snapToCardinalDirection(this.moveOnLocalAxes ? 
			this.orientationMatrix.multiplyVec6(inputMode.verticalAxis) : 
			inputMode.verticalAxis);

		const targetVelocity =
			horizontalAxis.scale(moveDirection.x)
			.add(verticalAxis.scale(moveDirection.y))
			.scale(this.speedScale * inputMode.moveSpeed);

		const targetZoomVelocity = secondaryMovement * inputMode.zoomSpeed * this.speedScale;
		const targetRotationVelocity = secondaryMovement * inputMode.rotateSpeed * this.speedScale;

		// Accelerate towards target velocity
		const velocityLerp = expLerpFactor(inputMode.velocityLerp / this.springScale, deltaTime);
		const rotationVelocityLerp = expLerpFactor(inputMode.rotationalVelocityLerp / this.springScale, deltaTime);
		this.velocity = this.velocity.lerp(targetVelocity, velocityLerp);
		this.zoomVelocity = lerp(this.zoomVelocity, targetZoomVelocity, velocityLerp);
		this.rotationVelocity = lerp(this.rotationVelocity, targetRotationVelocity, rotationVelocityLerp);

		// Apply velocity
		this.zoom += this.zoomVelocity * deltaTime;
		this.zoomLevel = Math.pow(2, this.zoom);

		const scaledVelocity = this.velocity.scale(deltaTime / Math.max(this.zoomLevel, inputMode.minMovementScale));
		this.position = this.position.add(scaledVelocity);
		//this.position = this.position.add(this.drift.scale(deltaTime));

		this.rotateByPlaneMappings(inputMode.rotationPlanes, this.rotationVelocity * deltaTime, this.rotateOnLocalAxes);

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

		// Update behaviors
		for (const behavior of this.behaviors) {
			behavior.update({ mandelbrot: this, currentTime, deltaTime });
		}
		this.behaviors = this.behaviors.filter(b => !b.shouldRemove);

		// Update simplified rotation
		if (this.simplifiedRotationActive) {
			this.simplifiedRotation.normalize();
			this.orientationMatrix = this.simplifiedRotation.toMatrix();
		}

		// Update the right / up vectors
		this.rightVector = snapToCardinalDirection(this.orientationMatrix.multiplyVec6(Mandelbrot6DState.RIGHT_VECTOR));
		this.upVector = snapToCardinalDirection(this.orientationMatrix.multiplyVec6(Mandelbrot6DState.UP_VECTOR));
		this.relativePosition = this.orientationMatrix.multiplyTransposeVec6(this.position);
	}

	clearVelocities() {
		this.velocity = new Vec6(0, 0, 0, 0, 0, 0);
		this.zoomVelocity = 0;
		this.rotationVelocity = 0;
	}

	#indicatorEffectiveSize(indicatorSize: number, setting: IndicatorSetting, horizontalAxis: Vec6, verticalAxis: Vec6): number {
		if (setting === IndicatorSetting.Never) return 0;
		if (setting === IndicatorSetting.WhenToolSelected && 
			(!inputMap.mode.horizontalAxis.equals(horizontalAxis)  &&
			!inputMap.mode.verticalAxis.equals(verticalAxis))) {
			return 0;
		}
		return indicatorSize / this.zoomLevel;
	}
}

function snapToCardinalDirection(vec: Vec6, threshold = 0.000001): Vec6 {
	if (vec.x > 1 - threshold) return Vec6.X();
	if (vec.x < -1 + threshold) return Vec6.NEG_X();
	if (vec.y > 1 - threshold) return Vec6.Y();
	if (vec.y < -1 + threshold) return Vec6.NEG_Y();
	if (vec.z > 1 - threshold) return Vec6.Z();
	if (vec.z < -1 + threshold) return Vec6.NEG_Z();
	if (vec.w > 1 - threshold) return Vec6.W();
	if (vec.w < -1 + threshold) return Vec6.NEG_W();
	if (vec.v > 1 - threshold) return Vec6.V();
	if (vec.v < -1 + threshold) return Vec6.NEG_V();
	if (vec.u > 1 - threshold) return Vec6.U();
	if (vec.u < -1 + threshold) return Vec6.NEG_U();
	return vec;
}