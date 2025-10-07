import { Mat6 } from "../math/Mat6";
import { Vec6 } from "../math/Vec6";
import type { Mandelbrot6DState } from "./MandelbrotState.svelte";
import { SimplifiedRotation } from "./SimplifiedRotation.svelte";

export type Preset = {
	position: Vec6;
	orientationMatrix: Mat6;
	zoom: number;
} | {
	position: Vec6;
	simplifiedRotation: SimplifiedRotation;
	zoom: number;
}

export namespace Preset {
	export type JSON = {
		position: number[];
		orientationMatrix: number[];
		zoom: number;
	} | {
		position: number[];
		simplifiedRotation: SimplifiedRotation.Params;
		zoom: number;
	}

	export function fromMaybeJSON(json: unknown): Preset {
		return fromJSON(json as JSON);
	}


	export function fromJSON(json: JSON): Preset {
		if (!json || typeof json !== "object") throw new Error("Invalid JSON object");
		if (!("position" in json)) throw new Error("Missing position in JSON");
		if (!("zoom" in json)) throw new Error("Missing zoom in JSON");

		if (!("orientationMatrix" in json) && !("simplifiedRotation" in json)) {
			throw new Error("Missing orientationMatrix or simplifiedRotation in JSON");
		}

		const zoom = new Number(json.zoom).valueOf();
		const position = Vec6.fromMaybeArray(json.position);

		if ("simplifiedRotation" in json) {
			return {
				position,
				zoom,
				simplifiedRotation: SimplifiedRotation.fromMaybeObject(json.simplifiedRotation),
			};
		}

		const orientationMatrix = Mat6.fromMaybeArray(json.orientationMatrix);

		return {
			position,
			zoom,
			orientationMatrix,
		};
	}

	export function toJSON(mandelbrot: Mandelbrot6DState): JSON {
		if (mandelbrot.simplifiedRotationActive) {
			return {
				position: mandelbrot.position.toArray(),
				zoom: mandelbrot.zoom,
				simplifiedRotation: mandelbrot.simplifiedRotation,
			};
		} else {
			return {
				position: mandelbrot.position.toArray(),
				zoom: mandelbrot.zoom,
				orientationMatrix: mandelbrot.orientationMatrix.toArray(),
			};
		}
	}

	export function apply(state: Mandelbrot6DState, preset: Preset) {
		state.position = preset.position;
		state.zoom = preset.zoom;

		if ("simplifiedRotation" in preset) {
			state.simplifiedRotationActive = true;
			state.simplifiedRotation = new SimplifiedRotation(preset.simplifiedRotation);
			state.orientationMatrix = state.simplifiedRotation.toMatrix();
		} else {
			state.simplifiedRotationActive = false;
			state.orientationMatrix = preset.orientationMatrix;
		}
	}

	export function isApplied(state: Mandelbrot6DState, preset: Preset): boolean {
		if (!state.position.equals(preset.position)) return false;
		if (state.zoom !== preset.zoom) return false;

		if ("simplifiedRotation" in preset) {
			return state.simplifiedRotationActive && state.simplifiedRotation.equals(new SimplifiedRotation(preset.simplifiedRotation));
		} else {
			return !state.simplifiedRotationActive && state.orientationMatrix.equals(preset.orientationMatrix);
		}
	}
}

export interface PresetInfo {
	name: string;
	preset: Preset;
}

export const mandelbrotPreset: Preset = {
		position: new Vec6(0,0, 0,0, 2,0),
		zoom: -2.2,
		simplifiedRotation: new SimplifiedRotation({
			juliaWise: 0,
			exponentWise: 0,
			juliaToExponentWise: 0,
		}),
	};

export const juliaPreset: Preset = {
	...mandelbrotPreset,
	simplifiedRotation: new SimplifiedRotation({
		juliaWise: Math.PI / 2,
		exponentWise: 0,
		juliaToExponentWise: 0,
	}),
};

export const xPreset: Preset = {
	position: new Vec6(0,0, 0,0, 2,0),
	zoom: -2.2,
	simplifiedRotation: new SimplifiedRotation({
		juliaWise: 0,
		exponentWise: Math.PI / 2,
		juliaToExponentWise: 0,
	}),
};

const mandelbrotSword = Preset.fromJSON({
	"position": [-1.310949560220873,0,-1.5494966055881196,0,2,0],
	"zoom": -1.296219141247366,
	"simplifiedRotation": {
		"juliaWise": 0,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaPetals = Preset.fromJSON({
	"position": [0.2892743051580473,-0.5197771566971138,0,0,2,0],
	"zoom": -1.7994011311807947,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaCurls = Preset.fromJSON({
	"position": [-0.8159936291755259,-0.13020024924844117,0,0,2,0],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaGalaxies = Preset.fromJSON({
	"position": [0.1839207226160746,-0.6619047237755258,0,0,2,0],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaBulbs = Preset.fromJSON({
	"position": [-0.8375108818118879,0,0,0,2,0],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaSmallBulbs = Preset.fromJSON({
	"position": [-1.2882336060546342,0,0,0,2,0],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const juliaAntennae = Preset.fromJSON({
	"position": [-1.4674475644162892,0,0,0,2,0],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaHorizontalGalaxies = Preset.fromJSON({
	"position": [-0.7247274657158581,-0.4523451324073482,0,0,2,0],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaSeahorseSkeleton = Preset.fromJSON({
	"position": [-0.7475448410071079,-0.10684853451264147,0,0,2,0],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const timBurtonSet = Preset.fromJSON({
	"position": [-0.22322677604072652,-0.17126447007732226,-0.021679006395384438,0,1.4990743130992423,-0.19944458456539718],
	"zoom": -3.095733624329744,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const noiseSet = Preset.fromJSON({
	"position": [-0.9434067271788583,0,0,0,2.200807995162978,0],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const brainSet = Preset.fromJSON({
	"position": [-0.3092771023245796,0,0,0,1.6707165936355606,0],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const lightSet = Preset.fromJSON({
	"position": [-0.3665782709145376,0,0.03657169114636437,0,1.6816248838020487,-0.07902171808045404],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const timBurtonSet3 = Preset.fromJSON({
	"position": [-0.3657230931197434,0,0.03657169114636437,0,1.7260324535864953,0.5162766191450395],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const timBurtonSet2 = Preset.fromJSON({
	"position": [-0.21808896875624717,-0.3904246089172682,0.03460283233463018,0,1.6939762392931175,-0.010842689067551028],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const lightningSet = Preset.fromJSON({
	"position": [-0.18124450752628926,-0.37855663195868455,0.3553590371898867,0.39540066659353024,1.655852012843836,0.28548709783626947],
	"zoom": -1.399271130051621,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const hyperbolicTentacle = Preset.fromJSON({
	"position": [0,-0.021333498478316556,0,0,1.097530361658081,-0.4128089591058801],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const stickBug = Preset.fromJSON({
	"position": [-0.8592962892571958,-0.13500783301270336,0,0,1.882497719193608,-0.4401793753698278],
	"zoom": -2.5630158311215094,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})


const crystalSeahorse = Preset.fromJSON({
	"position": [-0.6935703104571997,-0.16808696624172537,0,0,1.9771868506694374,-0.0009608538210499722],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})


const hyperbolicJuliaCurls = Preset.fromJSON({
	"position": [-0.6840866568383059,-0.16808696624172537,0,0,1.9932456536724243,0.008274680953126192],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const crystalCurls = Preset.fromJSON({
	"position": [-0.42616171636331074,-0.07077348924167673,0,0,1.81527956881325,0.03477538725099522],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const lightningCurls = Preset.fromJSON({
	"position": [-0.5675385248086954,-0.11640812771547229,0,0,1.8457114317499528,0.05414909845832626],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const noiseFans = Preset.fromJSON({
	"position": [-0.7120138112449429,-0.18859812406839832,0,0,2.164169878851226,0.2327772914523044],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})



const chaoticInsetJuliaCurls = Preset.fromJSON({
	"position": [-0.8211703852540941,0,0,0,2.468589188208372,0],
	"zoom": -2.2,
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});


export const basicPresets: PresetInfo[] = [
	{ name: "Mandelbrot", preset: mandelbrotPreset },
	{ name: "Julia", preset: juliaPreset },
	{ name: "X", preset: xPreset },
];

export const mandelbrotPresets: PresetInfo[] = [
	{ name: "Classic Mandelbrot", preset: mandelbrotPreset },
	{ name: "Mandelbrot Sword", preset: mandelbrotSword },
];

export const juliaPresets: PresetInfo[] = [
	{ name: "Julia Black Hole", preset: juliaPreset },
	{ name: "Julia Galaxies", preset: juliaGalaxies },
	{ name: "Julia Horizontal Galaxies", preset: juliaHorizontalGalaxies },
	{ name: "Julia Petals", preset: juliaPetals },
	{ name: "Julia Curls", preset: juliaCurls },
	{ name: "Julia Seahorse Skeleton", preset: juliaSeahorseSkeleton },
	{ name: "Julia Bulbs", preset: juliaBulbs },
	{ name: "Julia Small Bulbs", preset: juliaSmallBulbs },
	{ name: "Julia Antennae", preset: juliaAntennae },
];

export const hyperbolicJuliaPresets: PresetInfo[] = [
	{ name: "Noise Set", preset: noiseSet },
	{ name: "Noise Fans", preset: noiseFans },

	{ name: "Brain Set", preset: brainSet },
	{ name: "Light Set", preset: lightSet },

	{ name: "Tim Burton Set", preset: timBurtonSet },
	{ name: "Tim Burton Set 2", preset: timBurtonSet2 },
	{ name: "Tim Burton Set 3", preset: timBurtonSet3 },
	{ name: "Lightning Set", preset: lightningSet },
	{ name: "Hyperbolic Tentacle", preset: hyperbolicTentacle },

	{ name: "Stick Bug", preset: stickBug },

	{ name: "Crystal Seahorse", preset: crystalSeahorse },

	{ name: "Hyperbolic Julia Curls", preset: hyperbolicJuliaCurls },

	{ name: "Crystal Curls", preset: crystalCurls },
	{ name: "Lightning Curls", preset: lightningCurls },

	{ name: "Chaotic Inset Julia Curls", preset: chaoticInsetJuliaCurls },
];