import { Vec6 } from "../math/Vec6";

export interface PlaneMapping {
	axis1: number;
	axis2: number;
}

export interface InputMode {
	horizontalAxis: Vec6;
	verticalAxis: Vec6;
	minMovementScale: number;

	rotationPlanes: PlaneMapping[];
	moveSpeed: number;
	velocityLerp: number;
	rotateSpeed: number;
	rotationalVelocityLerp: number;
	zoomSpeed: number;
}

export const mandelbrotToJuliaMappings: PlaneMapping[] = [
	{ axis1: Vec6.X_INDEX, axis2: Vec6.Z_INDEX },
	{ axis1: Vec6.Y_INDEX, axis2: Vec6.W_INDEX },
]

export const mandelbrotToExponentMappings: PlaneMapping[] = [
	{ axis1: Vec6.X_INDEX, axis2: Vec6.V_INDEX },
	{ axis1: Vec6.Y_INDEX, axis2: Vec6.U_INDEX },
]

export const juliaToExponentMappings: PlaneMapping[] = [
	{ axis1: Vec6.Z_INDEX, axis2: Vec6.V_INDEX },
	{ axis1: Vec6.W_INDEX, axis2: Vec6.U_INDEX },
]

const rotateSpeed = 0.2;
const rotationalVelocityLerp = 10;
const minMovementScale = .1;

export const regularInputMode: InputMode = {
	horizontalAxis: Vec6.X(),
	verticalAxis: Vec6.Y(),
	minMovementScale: -Infinity,
	rotationPlanes: [],
	moveSpeed: .6,
	velocityLerp: 5,
	rotateSpeed,
	rotationalVelocityLerp,
	zoomSpeed: -2.0,
}

export const juliaWiseInputMode: InputMode = {
	horizontalAxis: Vec6.Z(),
	verticalAxis: Vec6.W(),
	minMovementScale,
	rotationPlanes: mandelbrotToJuliaMappings,
	moveSpeed: .3,
	velocityLerp: 10,
	rotateSpeed,
	rotationalVelocityLerp,
	zoomSpeed: 0,
}

export const xWiseInputMode: InputMode = {
	horizontalAxis: Vec6.V(),
	verticalAxis: Vec6.U(),
	minMovementScale,
	rotationPlanes: mandelbrotToExponentMappings,
	moveSpeed: .3,
	velocityLerp: 10,
	rotateSpeed,
	rotationalVelocityLerp,
	zoomSpeed: 0,
}

export const juliaToExponentMode: InputMode = {
	horizontalAxis: Vec6.V(),
	verticalAxis: Vec6.U(),
	minMovementScale,
	rotationPlanes: juliaToExponentMappings,
	moveSpeed: .3,
	velocityLerp: 10,
	rotateSpeed,
	rotationalVelocityLerp,
	zoomSpeed: 0,
}