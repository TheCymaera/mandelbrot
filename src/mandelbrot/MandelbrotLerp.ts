import { easeInOutBezier } from "../math/easing";
import type { Mandelbrot6DState, MandelbrotBehavior } from "./MandelbrotState.svelte";
import type { Preset } from "./presets";

export class MandelbrotLerp implements MandelbrotBehavior {
	start: Preset;
	end: Preset;
	
	duration: number;
	elapsedTime: number = 0;
	shouldRemove: boolean = false;

	easing = easeInOutBezier;

	constructor(options: { start: Preset; end: Preset; duration: number; easing: (t: number) => number }) {
		this.start = options.start;
		this.end = options.end;
		this.duration = options.duration;
		this.easing = options.easing;
	}

	update(context: { mandelbrot: Mandelbrot6DState; currentTime: number; deltaTime: number; }): void {
		this.elapsedTime += context.deltaTime;
		const t = this.easing(Math.min(this.elapsedTime / this.duration, 1.0));

		if (t >= 1.0) {
			this.shouldRemove = true;
			context.mandelbrot.position = this.end.position;
			context.mandelbrot.zoom = this.end.zoom;
			if ("orientationMatrix" in this.end) {
				context.mandelbrot.orientationMatrix = this.end.orientationMatrix;
			} else {
				context.mandelbrot.simplifiedRotation = this.end.simplifiedRotation;
			}
			return;
		}

		context.mandelbrot.position = this.start.position.lerp(this.end.position, t);
		context.mandelbrot.zoom = this.start.zoom + (this.end.zoom - this.start.zoom) * t;


		if ("orientationMatrix" in this.start || "orientationMatrix" in this.end) {
			return; // not supported
		}

		context.mandelbrot.simplifiedRotation = this.start.simplifiedRotation.lerp(this.end.simplifiedRotation, t);
	}
}