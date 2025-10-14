import { expLerpFactor, lerp } from '../math/numbers';
import { Vec2 } from '../math/Vec2';
import { Vec6 } from '../math/Vec6';
import { keyMap } from './keyMap';
import { snapToCardinalDirection, type Mandelbrot6DState, type MandelbrotBehavior } from './MandelbrotState.svelte';
import { PlaneMapping } from './PlaneMapping';

export interface CameraControllerOptions {
	horizontalAxis: Vec6;
	verticalAxis: Vec6;
	rotationPlaneMappings: PlaneMapping[];
	moveSpeed: number;
	velocityLerp: number;
	rotateSpeed: number;
	rotationalVelocityLerp: number;
	zoomSpeed: number;
}

export namespace CameraControllerOptions {
	const rotateSpeed = 0.2;
	const rotationalVelocityLerp = 10;

	export const REGULAR = ()=>({
		horizontalAxis: Vec6.X(),
		verticalAxis: Vec6.Y(),
		rotationPlaneMappings: [],
		moveSpeed: .6,
		velocityLerp: 5,
		rotateSpeed,
		rotationalVelocityLerp,
		zoomSpeed: -2.0,
	} as CameraControllerOptions);

	export const JULIA = ()=>({
		horizontalAxis: Vec6.Z(),
		verticalAxis: Vec6.W(),
		rotationPlaneMappings: PlaneMapping.mandelbrotToJulia,
		moveSpeed: .3,
		velocityLerp: 10,
		rotateSpeed,
		rotationalVelocityLerp,
		zoomSpeed: 0,
	} as CameraControllerOptions);

	export const X = ()=>({
		horizontalAxis: Vec6.V(),
		verticalAxis: Vec6.U(),
		rotationPlaneMappings: PlaneMapping.mandelbrotToExponent,
		moveSpeed: .3,
		velocityLerp: 10,
		rotateSpeed,
		rotationalVelocityLerp,
		zoomSpeed: 0,
	} as CameraControllerOptions);

	export const JULIA_TO_X = ()=>({
		horizontalAxis: Vec6.V(),
		verticalAxis: Vec6.U(),
		rotationPlaneMappings: PlaneMapping.juliaToExponent,
		moveSpeed: .3,
		velocityLerp: 10,
		rotateSpeed,
		rotationalVelocityLerp,
		zoomSpeed: 0,
	} as CameraControllerOptions);
}



export class CameraController implements MandelbrotBehavior {
	options: CameraControllerOptions = $state()!;

	velocity = new Vec6(0, 0, 0, 0, 0, 0);
	zoomVelocity = 0;
	rotationVelocity = {
		planeMappings: [] as PlaneMapping[],
		amount: 0,
	}

	speedScale = $state(1.0);
	springScale = $state(1.0);

	moveOnLocalAxes = $state(true);
	rotateOnLocalPlanes = $state(false);

	constructor(options: Readonly<CameraControllerOptions>) {
		this.options = options;
	}

	get canMoveJulia() {
		return this.options.horizontalAxis.equals(Vec6.Z()) && this.options.verticalAxis.equals(Vec6.W());
	}

	get canMoveExponent() {
		return this.options.horizontalAxis.equals(Vec6.V()) && this.options.verticalAxis.equals(Vec6.U());
	}

	update({mandelbrot, deltaTime}: { mandelbrot: Mandelbrot6DState, deltaTime: number}) {
		// Process input
		let moveDirection = new Vec2(0, 0);
		let secondaryMovement = 0;
		
		if (keyMap.isMovingLeft) moveDirection.x -= 1.0;
		if (keyMap.isMovingRight) moveDirection.x += 1.0;

		if (keyMap.isMovingUp) moveDirection.y += 1.0;
		if (keyMap.isMovingDown) moveDirection.y -= 1.0;

		if (keyMap.isSneaking) secondaryMovement -= 1.0;
		if (keyMap.isJumping) secondaryMovement += 1.0;

		// Normalize movement direction
		if (moveDirection.length() > 0.0) {
			moveDirection = moveDirection.normalize();
		}

		const horizontalAxis = snapToCardinalDirection(this.moveOnLocalAxes ? 
			mandelbrot.orientationMatrix.multiplyVec6(this.options.horizontalAxis) : 
			this.options.horizontalAxis);
		
		const verticalAxis = snapToCardinalDirection(this.moveOnLocalAxes ? 
			mandelbrot.orientationMatrix.multiplyVec6(this.options.verticalAxis) : 
			this.options.verticalAxis);

		const targetVelocity =
			horizontalAxis.scale(moveDirection.x)
			.add(verticalAxis.scale(moveDirection.y))
			.scale(this.options.moveSpeed * this.speedScale);

		const targetZoomVelocity = secondaryMovement * this.options.zoomSpeed * this.speedScale;
		const targetRotationVelocity = secondaryMovement * this.options.rotateSpeed * this.speedScale;

		// Accelerate towards target velocity
		const velocityLerp = expLerpFactor(this.options.velocityLerp / this.springScale, deltaTime);
		const rotationVelocityLerp = expLerpFactor(this.options.rotationalVelocityLerp / this.springScale, deltaTime);
		this.velocity = this.velocity.lerp(targetVelocity, velocityLerp);
		this.zoomVelocity = lerp(this.zoomVelocity, targetZoomVelocity, velocityLerp);
		this.rotationVelocity = {
			planeMappings: this.options.rotationPlaneMappings,
			amount: lerp(this.rotationVelocity.amount, targetRotationVelocity, rotationVelocityLerp),
		}

		// Apply velocity
		mandelbrot.zoom += this.zoomVelocity * deltaTime;

		const scaledVelocity = this.velocity.scale(deltaTime / mandelbrot.zoomLevel);
		mandelbrot.position = mandelbrot.position.add(scaledVelocity);

		mandelbrot.rotateByPlaneMappings(this.rotationVelocity.planeMappings, this.rotationVelocity.amount * deltaTime, this.rotateOnLocalPlanes);

		// Zero velocities if small to prevent constant UI updates
		const margin = 0.02;
		if (this.velocity.length() < margin && targetVelocity.isZero()) {
			this.velocity = new Vec6(0, 0, 0, 0, 0, 0);
		}
		if (Math.abs(this.zoomVelocity) < margin && targetZoomVelocity === 0) {
			this.zoomVelocity = 0;
		}
		if (Math.abs(this.rotationVelocity.amount) < margin && targetRotationVelocity === 0) {
			this.rotationVelocity.amount = 0;
		}
	}

	clearVelocities() {
		this.velocity = new Vec6(0, 0, 0, 0, 0, 0);
		this.zoomVelocity = 0;
		this.rotationVelocity.amount = 0;
	}
}