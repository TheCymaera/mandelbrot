import { Vec6 } from "../math/Vec6";

export interface PlaneMapping {
	axis1: number;
	axis2: number;
}

export interface InputMode {
	horizontalAxis: Vec6;
	verticalAxis: Vec6;
	rotationPlanes: PlaneMapping[];
	moveSpeed: number;
	velocityLerp: number;
	rotateSpeed: number;
	rotationalVelocityLerp: number;
	zoomSpeed: number;
}

export const mandelbrotToJuliaMappings: PlaneMapping[] = [
	{ axis1: 0, axis2: 2 },
	{ axis1: 1, axis2: 3 },
]

export const mandelbrotToExponentMappings: PlaneMapping[] = [
	{ axis1: 0, axis2: 4 },
	{ axis1: 1, axis2: 5 },
]

export const juliaToExponentMappings: PlaneMapping[] = [
	{ axis1: 2, axis2: 4 },
	{ axis1: 3, axis2: 5 },
]

const rotateSpeed = 0.2;
const rotationalVelocityLerp = 10;

export const regularInputMode: InputMode = {
	horizontalAxis: new Vec6(1, 0, 0, 0, 0, 0),
	verticalAxis: new Vec6(0, 1, 0, 0, 0, 0),
	rotationPlanes: [],
	moveSpeed: .6,
	velocityLerp: 5,
	rotateSpeed,
	rotationalVelocityLerp,
	zoomSpeed: -2.0,
}

export const juliaWiseInputMode: InputMode = {
	horizontalAxis: new Vec6(0, 0, 1, 0, 0, 0),
	verticalAxis: new Vec6(0, 0, 0, 1, 0, 0),
	rotationPlanes: mandelbrotToJuliaMappings,
	moveSpeed: .3,
	velocityLerp: 10,
	rotateSpeed,
	rotationalVelocityLerp,
	zoomSpeed: 0,
}

export const xWiseInputMode: InputMode = {
	horizontalAxis: new Vec6(0, 0, 0, 0, 1, 0),
	verticalAxis: new Vec6(0, 0, 0, 0, 0, 1),
	rotationPlanes: mandelbrotToExponentMappings,
	moveSpeed: .3,
	velocityLerp: 10,
	rotateSpeed,
	rotationalVelocityLerp,
	zoomSpeed: 0,
}