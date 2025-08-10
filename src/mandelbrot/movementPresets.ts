import { Vec6 } from "../math/Vec6";

export interface PlaneMapping {
	axis1: number;
	axis2: number;
}

export interface InputScheme {
	horizontalAxis: Vec6;
	verticalAxis: Vec6;
	rotationPlanes: PlaneMapping[];

	zoomSpeed: number;
	rotateSpeed: number;
	velocityLerp: number;
	rotationVelocityLerp: number;
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

export const regularInputScheme: InputScheme = {
	horizontalAxis: new Vec6(1, 0, 0, 0, 0, 0).scale(.8),
	verticalAxis: new Vec6(0, 1, 0, 0, 0, 0).scale(.8),
	rotationPlanes: [],
	
	velocityLerp: 3.5,
	rotationVelocityLerp: 0,

	zoomSpeed: 2.0,
	rotateSpeed: .2,
}

export const juliaWardInputScheme: InputScheme = {
	horizontalAxis: new Vec6(0, 0, 1, 0, 0, 0).scale(.8),
	verticalAxis: new Vec6(0, 0, 0, 1, 0, 0).scale(.8),
	rotationPlanes: mandelbrotToJuliaMappings,
	
	velocityLerp: 5,
	rotationVelocityLerp: 10,

	zoomSpeed: 0,
	rotateSpeed: .2,
}

export const xWardInputScheme: InputScheme = {
	horizontalAxis: new Vec6(0, 0, 0, 0, 1, 0).scale(.8),
	verticalAxis: new Vec6(0, 0, 0, 0, 0, 1).scale(.8),
	rotationPlanes: mandelbrotToExponentMappings,

	velocityLerp: 5,
	rotationVelocityLerp: 10,

	zoomSpeed: 0,
	rotateSpeed: .2,
}