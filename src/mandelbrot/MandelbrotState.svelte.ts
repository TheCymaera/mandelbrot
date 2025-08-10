import { Vec3 } from '../math/Vector.js';
import { Vec6 } from '../math/Vec6.js';
import { Mat6 } from '../math/Mat6.js';
import { inputMap } from './InputMap.svelte.js';

/**
 * State update logic ported from update.fsh
 */
export class MandelbrotState {
	static readonly RIGHT_VECTOR = new Vec6(1, 0, 0, 0, 0, 0);
	static readonly UP_VECTOR = new Vec6(0, 1, 0, 0, 0, 0);

	position = $state(new Vec6(0, 0, 0, 0, 2, 0));
	velocity = new Vec6(0, 0, 0, 0, 0, 0);
	
	upVector = $state(new Vec6(0, 1, 0, 0, 0, 0));
	rightVector = $state(new Vec6(1, 0, 0, 0, 0, 0));
	zoomLevel = $state(1.0);

	zoom = $state(-2.0);
	zoomVelocity = $state(0);
	rotationVelocity = $state(0);

	// Indicator settings
	zIndicatorSize = $state(0.0025);
	eIndicatorSize = $state(0.0025);

	speedScale = $state(1.0);
	springScale = $state(1.0);

	orientationMatrix = new Mat6();
	
	private lastTime = 0;
	
	/**
	 * Calculates a frame-rate independent lerp
	 */
	private expLerp(lerpAmount: number, deltaTime: number): number {
		return 1 - Math.exp(-lerpAmount * deltaTime);
	}

	/**
	 * Adjust exp-lerp based on user settings
	 */
	private applySpringSettings(value: number): number {
		const scale = this.springScale;
		if (!isFinite(scale)) return 0;
		return value ** scale;
	}

	/**
	 * Mix two numbers
	 */
	private mix(a: number, b: number, lerp: number): number {
		return a + (b - a) * lerp;
	}

	/**
	 * Update state
	 */
	update(currentTime: number): void {
		// Calculate delta time
		const deltaTime = (this.lastTime === 0 ? 0 : (currentTime - this.lastTime) / 1000);
		this.lastTime = currentTime;
		
		if (deltaTime === 0) return;
		
		// Process input
		let moveDirection = new Vec3(0, 0, 0);
		
		if (inputMap.isMovingLeft) moveDirection.x -= 1.0;
		if (inputMap.isMovingRight) moveDirection.x += 1.0;
		
		if (inputMap.isMovingUp) moveDirection.y += 1.0;
		if (inputMap.isMovingDown) moveDirection.y -= 1.0;
		
		if (inputMap.isSneaking) moveDirection.z += 1.0;
		if (inputMap.isJumping) moveDirection.z -= 1.0;
		
		// Normalize movement direction
		if (moveDirection.length() > 0.0) {
			moveDirection = moveDirection.normalize();
		}
		
		// Calculate target velocity
		const inputScheme = inputMap.inputScheme;
		const horizontalAxis = this.orientationMatrix.multiplyVec6(inputScheme.horizontalAxis);
		const verticalAxis = this.orientationMatrix.multiplyVec6(inputScheme.verticalAxis);

		const targetVelocity =
			horizontalAxis.scale(moveDirection.x)
			.add(verticalAxis.scale(moveDirection.y))
			.scale(this.speedScale);

		const targetZoomVelocity = moveDirection.z * inputScheme.zoomSpeed * this.speedScale;
		const targetRotationVelocity = moveDirection.z * inputScheme.rotateSpeed * this.speedScale;

		// Accelerate towards target velocity
		const velocityLerp = this.expLerp(this.applySpringSettings(inputScheme.velocityLerp), deltaTime);
		const rotationVelocityLerp = this.expLerp(this.applySpringSettings(inputScheme.rotationVelocityLerp), deltaTime);
		this.velocity = this.velocity.mix(targetVelocity, velocityLerp);
		this.zoomVelocity = this.mix(this.zoomVelocity, targetZoomVelocity, velocityLerp);
		this.rotationVelocity = this.mix(this.rotationVelocity, targetRotationVelocity, rotationVelocityLerp);

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

		for (const planeMappings of inputScheme.rotationPlanes) {
			const amount = this.rotationVelocity * deltaTime;
			if (!amount) continue;

			const rotationMatrix = Mat6.createPlaneRotation(planeMappings.axis1, planeMappings.axis2, amount);
			console.log(rotationMatrix);
			this.orientationMatrix = this.orientationMatrix.multiply(rotationMatrix);
		}
		
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
		this.rightVector = this.orientationMatrix.multiplyVec6(MandelbrotState.RIGHT_VECTOR);
		this.upVector = this.orientationMatrix.multiplyVec6(MandelbrotState.UP_VECTOR);

	}
}
