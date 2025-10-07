import { easeInOutBezier } from "../math/easing";
import type { Mandelbrot6DState, MandelbrotBehavior } from "./MandelbrotState.svelte";
import { Preset } from "./Preset";

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
		}

		this.start.lerp(this.end, t).apply(context.mandelbrot);
	}
}