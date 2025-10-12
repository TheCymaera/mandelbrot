import { Vec6 } from "../math/Vec6";

export interface PlaneMapping {
	axis1: number;
	axis2: number;
}

export namespace PlaneMapping {
	export const mandelbrotToJulia: PlaneMapping[] = [
		{ axis1: Vec6.X_INDEX, axis2: Vec6.Z_INDEX },
		{ axis1: Vec6.Y_INDEX, axis2: Vec6.W_INDEX },
	]

	export const mandelbrotToExponent: PlaneMapping[] = [
		{ axis1: Vec6.X_INDEX, axis2: Vec6.V_INDEX },
		{ axis1: Vec6.Y_INDEX, axis2: Vec6.U_INDEX },
	]

	export const juliaToExponent: PlaneMapping[] = [
		{ axis1: Vec6.Z_INDEX, axis2: Vec6.V_INDEX },
		{ axis1: Vec6.W_INDEX, axis2: Vec6.U_INDEX },
	]
}