import { Mat6 } from "../math/Mat6";
import { Vec6 } from "../math/Vec6";
import { Mandelbrot6DState } from "./MandelbrotState.svelte";
import { SimplifiedRotation } from "./SimplifiedRotation.svelte";


export class Preset {
	position?: Vec6;
	orientationMatrix?: Mat6;
	simplifiedRotation?: SimplifiedRotation;
	zoom?: number;
	escapeRadius?: number;

	constructor(params: Partial<Preset>) {
		if (params.position) this.position = params.position;
		if (params.orientationMatrix) this.orientationMatrix = params.orientationMatrix;
		if (params.simplifiedRotation) this.simplifiedRotation = params.simplifiedRotation;
		if (params.zoom !== undefined) this.zoom = params.zoom;
		if (params.escapeRadius !== undefined) this.escapeRadius = params.escapeRadius;
	}

	static fromJSON(json: Preset.JSON): Preset {
		return Preset.fromMaybeJSON(json);
	}

	static fromMaybeJSON(json: unknown): Preset {
		if (!json || typeof json !== "object") throw new Error("Invalid JSON object");
		const preset = new Preset({});

		if ("position" in json) preset.position = Vec6.fromMaybeArray(json.position);
		if ("zoom" in json) preset.zoom = new Number(json.zoom).valueOf();
		if ("orientationMatrix" in json) preset.orientationMatrix = Mat6.fromMaybeArray(json.orientationMatrix);
		if ("simplifiedRotation" in json) preset.simplifiedRotation = SimplifiedRotation.fromMaybeObject(json.simplifiedRotation);
		if ("escapeRadius" in json) {
			preset.escapeRadius = json.escapeRadius === "Infinity" ? Infinity : new Number(json.escapeRadius).valueOf();
		}
		return preset;
	}

	static fromState(mandelbrot: Mandelbrot6DState): Preset {
		const preset = new Preset({});
		preset.position = mandelbrot.position;
		preset.zoom = mandelbrot.zoom;
		preset.escapeRadius = mandelbrot.escapeRadius;
		if (mandelbrot.simplifiedRotationActive) {
			preset.simplifiedRotation = mandelbrot.simplifiedRotation;
		} else {
			preset.orientationMatrix = mandelbrot.orientationMatrix;
		}
		return preset;
	}

	toJSON(): Preset.JSON {
		const json: Preset.JSON = {};
		if (this.position) json.position = this.position.toArray();
		if (this.zoom !== undefined) json.zoom = this.zoom;
		if (this.escapeRadius !== undefined) {
			json.escapeRadius = this.escapeRadius === Infinity ? "Infinity" : this.escapeRadius;
		}
		if (this.simplifiedRotation) {
			json.simplifiedRotation = this.simplifiedRotation;
		} else if (this.orientationMatrix) {
			json.orientationMatrix = this.orientationMatrix.toArray();
		}
		return json;
	}

	apply(state: Mandelbrot6DState) {
		if (this.position) state.position = this.position;
		if (this.zoom !== undefined) state.zoom = this.zoom;
		if (this.escapeRadius !== undefined) state.escapeRadius = this.escapeRadius;
		if (this.simplifiedRotation) {
			state.simplifiedRotationActive = true;
			state.simplifiedRotation = this.simplifiedRotation;
			state.orientationMatrix = state.simplifiedRotation.toMatrix();
		} else if (this.orientationMatrix) {
			state.simplifiedRotationActive = false;
			state.orientationMatrix = this.orientationMatrix;
		}
	}

	isApplied(state: Mandelbrot6DState): boolean {
		if (this.position && !state.position.equals(this.position)) return false;
		if (this.zoom !== undefined && state.zoom !== this.zoom) return false;
		if (this.escapeRadius !== undefined && state.escapeRadius !== this.escapeRadius) return false;
		if (this.simplifiedRotation) {
			return state.simplifiedRotationActive && state.simplifiedRotation.equals(this.simplifiedRotation);
		}
		if (this.orientationMatrix) {
			return !state.simplifiedRotationActive && state.orientationMatrix.equals(this.orientationMatrix);
		}
		return true;
	}

	lerp(target: Preset, t: number): Preset {
		if (t >= 1.0) return target;
		
		const preset = new Preset({});

		if (this.position && target.position) {
			preset.position = this.position.lerp(target.position, t);
		}

		if (this.zoom !== undefined && target.zoom !== undefined) {
			preset.zoom = this.zoom + (target.zoom - this.zoom) * t;
		}

		if (this.escapeRadius !== undefined && target.escapeRadius !== undefined) {
			preset.escapeRadius = (this.escapeRadius + (target.escapeRadius - this.escapeRadius) * t) || Infinity;
		}

		if (this.simplifiedRotation && target.simplifiedRotation) {
			preset.simplifiedRotation = this.simplifiedRotation.lerp(target.simplifiedRotation, t);
		}

		// Orientation matrix lerp not supported

		return preset;
	}
}

export namespace Preset {
	export type JSON = {
		position?: number[];
		orientationMatrix?: number[];
		simplifiedRotation?: SimplifiedRotation.Params;
		zoom?: number;
		escapeRadius?: number | "Infinity";
	}
}