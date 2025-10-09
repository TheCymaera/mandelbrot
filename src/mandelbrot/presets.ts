import { Vec6 } from "../math/Vec6";
import { Preset } from "./Preset";
import { SimplifiedRotation } from "./SimplifiedRotation.svelte";


export interface PresetInfo {
	name: string;
	preset: Preset;
}

export const mandelbrotPreset = new Preset({
	position: new Vec6(0,0, 0,0, 2,0),
	zoom: -2.2,
	escapeRadius: Infinity,
	simplifiedRotation: new SimplifiedRotation({
		juliaWise: 0,
		exponentWise: 0,
		juliaToExponentWise: 0,
	}),
});

export const juliaPreset = new Preset({
	...mandelbrotPreset,
	escapeRadius: Infinity,
	simplifiedRotation: new SimplifiedRotation({
		juliaWise: Math.PI / 2,
		exponentWise: 0,
		juliaToExponentWise: 0,
	}),
});

export const xPreset = new Preset({
	position: new Vec6(0,0, 0,0, 2,0),
	zoom: -2.2,
	escapeRadius: Infinity,
	simplifiedRotation: new SimplifiedRotation({
		juliaWise: 0,
		exponentWise: Math.PI / 2,
		juliaToExponentWise: 0,
	}),
});

const mandelbrotSword = Preset.fromJSON({
	"position": [-1.310949560220873,0,-1.5494966055881196,0,2,0],
	"zoom": -1.296219141247366,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 0,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const mandelbrotGalaxies = Preset.fromJSON({
	"position": [0.1607335596984232,-0.6010408296697332,-0.47452755551124787,-0.2677114813307161,2,0],
	"zoom": 5.9688923907607245,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 0,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaVerticalPetals = Preset.fromJSON({
	"position": [0.2892743051580473,-0.5197771566971138,0,0,2,0],
	"zoom": -2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaHorizontalPetals = Preset.fromJSON({
	"position": [-0.623354145014734,0.44195760315614485,0,0,2,0],
	"zoom": -2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaCurls = Preset.fromJSON({
	"position": [-0.8159936291755259,-0.13020024924844117,0,0,2,0],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaVerticalGalaxies = Preset.fromJSON({
	"position": [0.1839207226160746,-0.6619047237755258,0,0,2,0],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaBulbs = Preset.fromJSON({
	"position": [-0.8375108818118879,0,0,0,2,0],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaSmallBulbs = Preset.fromJSON({
	"position": [-1.2882336060546342,0,0,0,2,0],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const juliaAntennae = Preset.fromJSON({
	"position": [-1.4674475644162892,0,0,0,2,0],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaHorizontalGalaxies = Preset.fromJSON({
	"position": [-0.7247274657158581,-0.4523451324073482,0,0,2,0],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaSeahorse = Preset.fromJSON({
	"position": [0.3029516721417338,0.020792363446607003,0,0,2,0],
	"zoom": -2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const juliaSeahorseSkeletons = Preset.fromJSON({
	"position": [-0.7475448410071079,-0.10684853451264147,0,0,2,0],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const timBurtonSet = Preset.fromJSON({
	"position": [-0.22322677604072652,-0.17126447007732226,-0.021679006395384438,0,1.4990743130992423,-0.19944458456539718],
	"zoom": -3.095733624329744,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const noiseSet = Preset.fromJSON({
	"position": [-0.9434067271788583,0,0,0,2.200807995162978,0],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const brainSet = Preset.fromJSON({
	"position": [-0.3092771023245796,0,0,0,1.6707165936355606,0],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const lightSet = Preset.fromJSON({
	"position": [-0.3665782709145376,0,0.03657169114636437,0,1.6816248838020487,-0.07902171808045404],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const timBurtonSet3 = Preset.fromJSON({
	"position": [-0.3657230931197434,0,0.03657169114636437,0,1.7260324535864953,0.5162766191450395],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const timBurtonSet2 = Preset.fromJSON({
	"position": [-0.21808896875624717,-0.3904246089172682,0.03460283233463018,0,1.6939762392931175,-0.010842689067551028],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const lightningSet = Preset.fromJSON({
	"position": [-0.18124450752628926,-0.37855663195868455,0.3553590371898867,0.39540066659353024,1.655852012843836,0.28548709783626947],
	"zoom": -1.399271130051621,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const tentacle = Preset.fromJSON({
	"position": [0,-0.021333498478316556,0,0,1.097530361658081,-0.4128089591058801],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const stickBug = Preset.fromJSON({
	"position": [-0.8592962892571958,-0.13500783301270336,0,0,1.882497719193608,-0.4401793753698278],
	"zoom": -2.5630158311215094,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})


const crystalSeahorse = Preset.fromJSON({
	"position": [-0.6935703104571997,-0.16808696624172537,0,0,1.9771868506694374,-0.0009608538210499722],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})


const juliaCurls2 = Preset.fromJSON({
	"position": [-0.7412291617118753,-0.11524932913172192,0,0,2.0009330439099533,-0.0002624922048258694],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const skeletonCurls = Preset.fromJSON({
	"position": [-0.42616171636331074,-0.07077348924167673,0,0,1.81527956881325,0.03477538725099522],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const lightningCurls = Preset.fromJSON({
	"position": [-0.5675385248086954,-0.11640812771547229,0,0,1.8457114317499528,0.05414909845832626],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const noiseFans = Preset.fromJSON({
	"position": [-0.7120138112449429,-0.18859812406839832,0,0,2.164169878851226,0.2327772914523044],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
})

const crystalGalaxies = Preset.fromJSON({
	"position": [-0.7247274657158581,-0.4523451324073482,0,0,1.951931343706008,-0.04076321533457684],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});


const chaoticInsetTendrils = Preset.fromJSON({
	"position": [-0.8211703852540941,0,0,0,2.468589188208372,0],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const chaoticCirclet = Preset.fromJSON({
	"position": [0.6998502967609382,-0.5197771566971138,0,0,8.925454662238137,0],
	"zoom": -1.7994011311807947,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const skeletonCurls2 = Preset.fromJSON({
    "position": [-0.2963771023245796,0.012900000000000002,0,0,1.6707165936355606,0],
	"zoom": -1.7994011311807947,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5707963267948966,
		"exponentWise": 0,
		"juliaToExponentWise": 0
	}
});

const kraken = Preset.fromJSON({
	"position": [0.30570085227996846,0,-1.8718778512064057e-17,0,2,0],
	"zoom": -2.2,
	"escapeRadius": "Infinity",
	"orientationMatrix": [6.085092880864076e-17,0,0.9091358754682789,0,0.41649965178440385,0,0,6.085092880864076e-17,0,0.9091358754682789,0,0.41649965178440385,-0.9937710832381651,0,0.046415021159678015,0,-0.10131475672571655,0,0,-0.9937710832381651,0,0.046415021159678015,0,-0.10131475672571655,-0.11144072020426117,0,-0.41390531012210535,0,0.9034729437747872,0,0,-0.11144072020426117,0,-0.41390531012210535,0,0.9034729437747872]
});

const lightTentacle = Preset.fromJSON({
	"position": [0.15407023317611832,-0.3337259992935214,0.3553590371898867,0.39540066659353024,1.655852012843836,0.28548709783626947],
	"zoom": -2.3106875237851714,
	"escapeRadius": "Infinity",
	"simplifiedRotation": {
		"juliaWise": 1.5731192098407991,
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
	//{ name: "Mandelbrot Galaxies", preset: mandelbrotGalaxies },
];

export const juliaPresets: PresetInfo[] = [
	{ name: "Black Hole", preset: juliaPreset },
	{ name: "Vertical Galaxies", preset: juliaVerticalGalaxies },
	{ name: "Horizontal Galaxies", preset: juliaHorizontalGalaxies },
	{ name: "Vertical Petals", preset: juliaVerticalPetals },
	{ name: "Horizontal Petals", preset: juliaHorizontalPetals },
	{ name: "Curls 1", preset: juliaCurls },
	{ name: "Curls 2", preset: juliaCurls2 },
	{ name: "Seahorse", preset: juliaSeahorse },
	{ name: "Seahorse Skeletons", preset: juliaSeahorseSkeletons },
	{ name: "Bulbs", preset: juliaBulbs },
	{ name: "Small Bulbs", preset: juliaSmallBulbs },
	{ name: "Antennae", preset: juliaAntennae },
];

export const hyperbolicJuliaPresets: PresetInfo[] = [
	{ name: "Noise Set", preset: noiseSet },
	{ name: "Noise Fans", preset: noiseFans },

	{ name: "Brain Set", preset: brainSet },
	{ name: "Light Set", preset: lightSet },

	{ name: "Tim Burton Set 1", preset: timBurtonSet },
	{ name: "Tim Burton Set 2", preset: timBurtonSet2 },
	{ name: "Tim Burton Set 3", preset: timBurtonSet3 },

	{ name: "Lightning Set", preset: lightningSet },

	{ name: "Tentacle", preset: tentacle },
	{ name: "Light Tentacle", preset: lightTentacle },

	{ name: "Stick Bug", preset: stickBug },

	{ name: "Crystal Seahorse Skeletons", preset: crystalSeahorse },

	{ name: "Skeleton Curls 1", preset: skeletonCurls },
	{ name: "Skeleton Curls 2", preset: skeletonCurls2 },

	{ name: "Lightning Curls", preset: lightningCurls },


	{ name: "Crystal Galaxies", preset: crystalGalaxies },

	{ name: "Chaotic Inset Tendrils", preset: chaoticInsetTendrils },
	{ name: "Chaotic Circlet", preset: chaoticCirclet },

];

export const specialPresets: PresetInfo[] = [
	{ name: "Kraken", preset: kraken },
];