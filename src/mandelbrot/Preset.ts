import { Mat6 } from "../math/Mat6";
import { lerp } from "../math/numbers";
import { Vec6 } from "../math/Vec6";
import { Mandelbrot6DState } from "./MandelbrotState.svelte";
import { SimplifiedRotation } from "./SimplifiedRotation.svelte";


export class Preset {
	position?: Vec6;
	orientationMatrix?: Mat6;
	simplifiedRotation?: SimplifiedRotation;
	zoom?: number;
	bailoutRadius?: number;
	smoothingEnabled?: boolean;
	smoothingRadius?: number;

	constructor(params: Partial<Preset>) {
		if (params.position) this.position = params.position;
		if (params.orientationMatrix) this.orientationMatrix = params.orientationMatrix;
		if (params.simplifiedRotation) this.simplifiedRotation = params.simplifiedRotation;
		if (params.zoom !== undefined) this.zoom = params.zoom;
		if (params.bailoutRadius !== undefined) this.bailoutRadius = params.bailoutRadius;
	}

	static fromJSON(json: Preset.JSON): Preset {
		return Preset.fromMaybeJSON(json);
	}

	static fromMaybeJSON(json: unknown): Preset {
		if (!json || typeof json !== "object") throw new Error("Invalid JSON object");

		// Backwards compatibility: auto-rename escapeRadius to bailoutRadius
		if ("escapeRadius" in json && !("bailoutRadius" in json)) {
			// @ts-expect-error Creating new property
			json.bailoutRadius = json.escapeRadius;
			delete json.escapeRadius;
		}

		const preset = new Preset({});
		if ("position" in json) preset.position = Vec6.fromMaybeArray(json.position);
		if ("zoom" in json) preset.zoom = new Number(json.zoom).valueOf();
		if ("orientationMatrix" in json) preset.orientationMatrix = Mat6.fromMaybeArray(json.orientationMatrix);
		if ("simplifiedRotation" in json) preset.simplifiedRotation = SimplifiedRotation.fromMaybeObject(json.simplifiedRotation);
		if ("bailoutRadius" in json) {
			preset.bailoutRadius = json.bailoutRadius === "Infinity" ? Infinity : new Number(json.bailoutRadius).valueOf();
		}
		if ("smoothingEnabled" in json) preset.smoothingEnabled = json.smoothingEnabled === true;
		if ("smoothingRadius" in json) preset.smoothingRadius = new Number(json.smoothingRadius).valueOf();
		return preset;
	}

	static fromState(mandelbrot: Mandelbrot6DState): Preset {
		const preset = new Preset({});
		preset.position = mandelbrot.position;
		preset.zoom = mandelbrot.zoom;
		preset.bailoutRadius = mandelbrot.bailoutRadius;
		preset.smoothingEnabled = mandelbrot.smoothingEnabled;
		preset.smoothingRadius = mandelbrot.smoothingRadius;
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
		if (this.bailoutRadius !== undefined) {
			json.bailoutRadius = this.bailoutRadius === Infinity ? "Infinity" : this.bailoutRadius;
		}
		if (this.smoothingEnabled) {
			json.smoothingEnabled = true;
			json.smoothingRadius = this.smoothingRadius; // Only include if enabled
		}
		if (this.simplifiedRotation) {
			json.simplifiedRotation = this.simplifiedRotation.toJSON();
		} else if (this.orientationMatrix) {
			json.orientationMatrix = this.orientationMatrix.toArray();
		}
		return json;
	}

	apply(state: Mandelbrot6DState) {
		if (this.position) state.position = this.position;
		if (this.zoom !== undefined) state.zoom = this.zoom;
		if (this.bailoutRadius !== undefined) state.bailoutRadius = this.bailoutRadius;
		if (this.smoothingEnabled !== undefined) state.smoothingEnabled = this.smoothingEnabled;
		if (this.smoothingRadius !== undefined) state.smoothingRadius = this.smoothingRadius;
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
		if (this.bailoutRadius !== undefined && state.bailoutRadius !== this.bailoutRadius) return false;
		if (this.simplifiedRotation) {
			const isEqual = state.simplifiedRotationActive && state.simplifiedRotation.equals(this.simplifiedRotation);
			if (!isEqual) return false;
		}
		if (this.orientationMatrix) {
			const isEqual = !state.simplifiedRotationActive && state.orientationMatrix.equals(this.orientationMatrix);
			if (!isEqual) return false;
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
			preset.zoom = lerp(this.zoom, target.zoom, t);
		}

		if (this.bailoutRadius !== undefined && target.bailoutRadius !== undefined) {
			if (this.bailoutRadius === Infinity || target.bailoutRadius === Infinity) {
				preset.bailoutRadius = target.bailoutRadius;
			} else {
				preset.bailoutRadius = lerp(this.bailoutRadius, target.bailoutRadius, t);
			}
		}

		if (this.simplifiedRotation && target.simplifiedRotation) {
			preset.simplifiedRotation = this.simplifiedRotation.lerp(target.simplifiedRotation, t);
		} else {
			const startMatrix = this.orientationMatrix || this.simplifiedRotation?.toMatrix() || Mat6.identity();
			const endMatrix = target.orientationMatrix || target.simplifiedRotation?.toMatrix() || Mat6.identity();

			preset.orientationMatrix = startMatrix.clone().perElementLerp(endMatrix, t);
		}

		return preset;
	}
}

export namespace Preset {
	export type JSON = {
		position?: number[];
		orientationMatrix?: number[];
		simplifiedRotation?: SimplifiedRotation.Params;
		zoom?: number;
		bailoutRadius?: number | "Infinity";
		smoothingEnabled?: boolean;
		smoothingRadius?: number;
	}
}