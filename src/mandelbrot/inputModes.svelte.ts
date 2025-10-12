import { Vec2 } from '../math/Vec2';
import { Vec6 } from '../math/Vec6';
import { keyMap } from './keyMap';
import { snapToCardinalDirection, type Mandelbrot6DState } from './MandelbrotState.svelte';
import { PlaneMapping } from './PlaneMapping';

export interface InputModeOptions {
	horizontalAxis: Vec6;
	verticalAxis: Vec6;
	rotationPlaneMappings: PlaneMapping[];
	moveSpeed: number;
	velocityLerp: number;
	rotateSpeed: number;
	rotationalVelocityLerp: number;
	zoomSpeed: number;
}

export namespace InputModeOptions {
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
	} as InputModeOptions);

	export const JULIA = ()=>({
		horizontalAxis: Vec6.Z(),
		verticalAxis: Vec6.W(),
		rotationPlaneMappings: PlaneMapping.mandelbrotToJulia,
		moveSpeed: .3,
		velocityLerp: 10,
		rotateSpeed,
		rotationalVelocityLerp,
		zoomSpeed: 0,
	} as InputModeOptions);

	export const X = ()=>({
		horizontalAxis: Vec6.V(),
		verticalAxis: Vec6.U(),
		rotationPlaneMappings: PlaneMapping.mandelbrotToExponent,
		moveSpeed: .3,
		velocityLerp: 10,
		rotateSpeed,
		rotationalVelocityLerp,
		zoomSpeed: 0,
	} as InputModeOptions);

	export const JULIA_TO_X = ()=>({
		horizontalAxis: Vec6.V(),
		verticalAxis: Vec6.U(),
		rotationPlaneMappings: PlaneMapping.juliaToExponent,
		moveSpeed: .3,
		velocityLerp: 10,
		rotateSpeed,
		rotationalVelocityLerp,
		zoomSpeed: 0,
	} as InputModeOptions);
}



export class InputMode {
	options: InputModeOptions = $state()!;

	constructor(options: Readonly<InputModeOptions>) {
		this.options = options;
	}

	get canMoveJulia() {
		return this.options.horizontalAxis.equals(Vec6.Z()) && this.options.verticalAxis.equals(Vec6.W());
	}

	get canMoveExponent() {
		return this.options.horizontalAxis.equals(Vec6.V()) && this.options.verticalAxis.equals(Vec6.U());
	}

	getMovement(mandelbrot: Mandelbrot6DState) {
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

		const horizontalAxis = snapToCardinalDirection(mandelbrot.moveOnLocalAxes ? 
			mandelbrot.orientationMatrix.multiplyVec6(this.options.horizontalAxis) : 
			this.options.horizontalAxis);
		
		const verticalAxis = snapToCardinalDirection(mandelbrot.moveOnLocalAxes ? 
			mandelbrot.orientationMatrix.multiplyVec6(this.options.verticalAxis) : 
			this.options.verticalAxis);

		const targetVelocity =
			horizontalAxis.scale(moveDirection.x)
			.add(verticalAxis.scale(moveDirection.y))
			.scale(this.options.moveSpeed);

		const targetZoomVelocity = secondaryMovement * this.options.zoomSpeed;
		const targetRotationVelocity = secondaryMovement * this.options.rotateSpeed;

		return {
			targetVelocity,
			targetZoomVelocity,
			targetRotationVelocity: {
				planeMappings: this.options.rotationPlaneMappings,
				amount: targetRotationVelocity,
			},
			rotationPlanes: this.options.rotationPlaneMappings,
			velocityLerp: this.options.velocityLerp,
			rotationalVelocityLerp: this.options.rotationalVelocityLerp,
		}
	}
}