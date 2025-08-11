import { Mat6 } from "../math/Mat6";
import { Vec6 } from "../math/Vec6";
import type { Vec2 } from "../math/Vec2";

export interface Preset6D {
	name: string;
	orientationMatrix: Mat6;
	position: Vec6;
	zoom: number;
}

export interface PresetInterpolated {
	name: string;
	lerpRotation: Vec2;
	position: Vec6;
	zoom: number;
}

export type Preset = Preset6D | PresetInterpolated;

function fromJSON(name: string, json: { position: number[], orientationMatrix: number[], zoom: number }): Preset {
	return {
		name,
		orientationMatrix: Mat6.fromMaybeArray(json.orientationMatrix),
		position: Vec6.fromMaybeArray(json.position),
		zoom: json.zoom
	};
}

export const mandelbrotPreset: Preset6D = {
	name: "Mandelbrot (Identity)",
	orientationMatrix: Mat6.identity(),
	position: new Vec6(0,0, 0,0, 2,0),
	zoom: -2.2
};

export const juliaPreset: Preset6D = {
	...mandelbrotPreset,
	name: "Julia (XY → ZW)",
	orientationMatrix: Mat6.createPlaneMapping(0, 1, 2, 3)
};

export const xPreset: Preset6D = {
	...mandelbrotPreset,
	name: "X (XY → VU)",
	orientationMatrix: Mat6.createPlaneMapping(0, 1, 4, 5),
};

export const halloweenOrientation: Preset = fromJSON("Tim Burton Set", {
	"position": [-0.3085717445229524,-0.5354889209291201,-0.3400582929898391,0.17467291152008402,1.880368369481325,-0.22039732296514908],
	"orientationMatrix": [0.0888967731944443,0,-0.9869906589614995,0,0.13396567783715843,0,0,0.0888967731944443,0,-0.9869906589614995,0,0.13396567783715843,0.5019766920732547,0,0.16056317542539614,0,0.8498463786547092,0,0,0.5019766920732547,0,0.16056317542539614,0,0.8498463786547092,-0.8603003919159982,0,-0.008300952961340284,0,0.5097198542818625,0,0,-0.8603003919159982,0,-0.008300952961340284,0,0.5097198542818625],
	"zoom": -3.095733624329744
});

export const presets: Preset[] = [
	mandelbrotPreset,
	juliaPreset,
	xPreset,
	halloweenOrientation
];