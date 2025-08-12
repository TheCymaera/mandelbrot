import { Mat6 } from "../math/Mat6";
import { Vec6 } from "../math/Vec6";

export interface Preset {
	name: string;
	orientationMatrix: Mat6;
	position: Vec6;
	zoom: number;
}


function fromJSON(name: string, json: { position: number[], orientationMatrix: number[], zoom: number }): Preset {
	return {
		name,
		orientationMatrix: Mat6.fromMaybeArray(json.orientationMatrix),
		position: Vec6.fromMaybeArray(json.position),
		zoom: json.zoom
	};
}

export const mandelbrotPreset: Preset = {
	name: "Mandelbrot (Identity)",
	orientationMatrix: Mat6.identity(),
	position: new Vec6(0,0, 0,0, 2,0),
	zoom: -2.2
};

export const juliaPreset: Preset = {
	...mandelbrotPreset,
	name: "Julia (XY → ZW)",
	orientationMatrix: Mat6.createPlaneMapping(0, 1, 2, 3)
};

export const xPreset: Preset = {
	...mandelbrotPreset,
	name: "X (XY → VU)",
	orientationMatrix: Mat6.createPlaneMapping(0, 1, 4, 5),
};

export const halloweenOrientation: Preset = fromJSON("Tim Burton Set", {
	"position": [-0.2,-0.358,0,0,1.82,-0.15],
	"orientationMatrix": [0.15613827463660174,0,-0.9724009672242185,0,0.1733701189216852,0,0,0.15613827463660174,0,-0.9724009672242185,0,0.1733701189216852,0.2798190822074983,0,0.2118785401777537,0,0.936380673361382,0,0,0.2798190822074983,0,0.2118785401777537,0,0.936380673361382,-0.9472708801742349,0,-0.09769259518283437,0,0.30517869588223917,0,0,-0.9472708801742349,0,-0.09769259518283437,0,0.30517869588223917],
	"zoom": -1.8752568045196396
});

export const presets: Preset[] = [
	mandelbrotPreset,
	juliaPreset,
	xPreset,
	halloweenOrientation
];