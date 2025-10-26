<script lang="ts" module>
	import { fa5_solid_times } from 'fontawesome-svgs';
	import Button from '../ui-components/Button.svelte';
	import { githubRepositoryLink, homeLink, minecraftYouTubeCode } from './links.js';
	import IconButton from '../ui-components/IconButton.svelte';

	function syntaxHighlight(colors: readonly (readonly [RegExp, string])[], snippet: string): string {
		let coloredSnippet = snippet;

		for (const [regex, colorClass] of colors) {
			//const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
			coloredSnippet = coloredSnippet.replaceAll(regex, (match) => {
				return `<span class="${colorClass}">${match}</span>`;
			});
		}

		return coloredSnippet;
	}

	const colors = [
		// comments
		[/\/\/.*$/gm, `opacity-30`],
		// variables
		[/(matrix|cos|sin|axisIndex.|angle|rotationMatrix)(?!\()/g, `text-cyan-100`],
		// constants
		[/._INDEX|PI/g, `text-blue-300`],
		// numbers
		[/[0-9]*(?=;|\))/g, `text-green-200`],
		// named parameters
		[/(row|column):/g, `text-green-200`],
		// keywords
		[/static|const|let|fn|return/g, `text-cyan-500`],
		// functions
		[/[A-Za-z0-9]*(?=\()/g, `text-amber-200`],
		// types/classes
		[/Mat6|Vec6|float|int/g, `text-green-400`],
	] as const;


	const codeSnippet = syntaxHighlight(colors, `
const Vec6.X_INDEX = 0;
const Vec6.Y_INDEX = 1;
const Vec6.Z_INDEX = 2;
const Vec6.W_INDEX = 3;
const Vec6.V_INDEX = 4;
const Vec6.U_INDEX = 5;

static fn Mat6.rotationFromAxisIndices(axisIndex1: int, axisIndex2: int, angle: float) {
	let matrix = Mat6.identity();
	let cos = cos(angle);
	let sin = sin(angle);

	matrix[row: axisIndex1, column: axisIndex1] = cos;
	matrix[row: axisIndex1, column: axisIndex2] = -sin;
	matrix[row: axisIndex2, column: axisIndex1] = sin;
	matrix[row: axisIndex2, column: axisIndex2] = cos;

	return matrix;
}

// Example usage:
let rotationMatrix = Mat6.rotationFromAxisIndices(Vec6.X_INDEX, Vec6.Z_INDEX, PI / 2);
	`).trim();

	export function infoWindowOpened() {
		return window.location.hash === "#info";
	}

	let xzRot = $state(0);
	let ywRot = $state(0);
	const rotTransitionMilliseconds = "500ms ease-in-out";

	const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	async function playAnimation() {
		while (true) {
			xzRot = 0;
			ywRot = 0;
			await sleep(2000);
			xzRot = 90;
			await sleep(1000);
			ywRot = 90;
			await sleep(2000);
		}
	}

	playAnimation();
</script>

<div class="bg-surface text-onSurface/80 p-6 rounded-lg [text-wrap:pretty]">
	<h1 class="text-2xl text-onSurface font-bold mb-4 pr-7">6D Mandelbrot Set Explorer</h1>


	<IconButton 
		className="absolute! top-6 right-6 text-xl"
		label="Close"
		onPress={() => window.location.hash = ""}
	>
		{@html fa5_solid_times}
	</IconButton>


	<div class="mb-4">
		This tool lets you explore a 6-dimensional generalization of the Mandelbrot Set which contains the classical Mandelbrot Set, Julia Sets, and the X Sets on orthogonal planes.
	</div>

	<div class="mb-4">
		It is inspired by <a 
			href="https://www.youtube.com/watch?v=Ed1gsyxxwM0" 
			target="_blank" 
			class="text-primary-500 hover:underline"
		>2swap's YouTube video</a>.
	</div>

	<div class="mb-4">
		I also made a <a 
			href="https://youtu.be/{minecraftYouTubeCode}"
			target="_blank" 
			class="text-primary-500 hover:underline"
		>YouTube video</a> in which I create a Minecraft version of this explorer.
	</div>

	<h2 class="text-xl text-onSurface font-bold mb-2">Mathematical Background</h2>
	
	<div class="mb-4">
		A Mandelbrot iteration is defined as:
		<div class="p-3 block font-mono bg-surfaceContainer text-onSurfaceContainer/75 my-2">
			zₙ₊₁ = zₙ ^ 2 + c
		</div>
	</div>

	<div class="mb-4">
		A classic Mandelbrot Set fixes z₁ while varying c over the complex plane, whereas Julia Sets fix c and vary z₁ instead. These two sets are orthogonal slices of a 4-dimensional fractal called the Julibrot.
	</div>

	<div class="mb-4">
		In his video, <a 
			href="https://www.youtube.com/watch?v=Ed1gsyxxwM0" 
			target="_blank" 
			class="text-primary-500 hover:underline"
		>2swap</a> generalizes the Julibrot to 6-dimensions by making the exponent a complex variable e, creating what he coined the "X Set".
		<div class="p-3 block font-mono bg-surfaceContainer text-onSurfaceContainer/75 my-2">
			zₙ₊₁ = zₙ ^ e + c
		</div>
	</div>

	<h2 class="text-xl text-onSurface font-bold mb-2">Navigation</h2>
	<div class="mb-4">
		Using 6-dimensional vectors, we can slice a 2D viewport through this 6D space. Each pixel in the viewport corresponds to a point p with six coordinates <small class="opacity-80">(x, y, z, w, v, u)</small>, which we can map to the three complex values used in the iteration:
		<div class="p-3 font-mono bg-surfaceContainer text-onSurfaceContainer/75 my-2 overflow-auto whitespace-nowrap">
			z = p.z + p.w * i <span class="opacity-30">// Julia</span><br>
			c = p.x + p.y * i <span class="opacity-30">// Mandelbrot</span><br>
			e = p.v + p.u * i <span class="opacity-30">// X</span>
		</div>

		<div class="p-3 font-mono bg-surfaceContainer text-onSurfaceContainer/75 my-2">
			z = z ^ e + c
		</div>
	</div>

	<div class="mb-6">
		In 6D space, there are 15 cardinal rotation planes:
		<div class="text-sm opacity-80 mt-1">XY, XZ, XW, XV, XU, YZ, YW, YV, YU, ZW, ZV, ZU, WV, WU, VU</div>
	</div>

	<div class="mb-6">
		To figure out how to rotate from one set to another, we can focus on their right and up vectors: <br>
		<ul class="list-disc list-inside my-2">
			<li>Mandelbrot Set: Right is X, up is Y.</li>
			<li>Julia Set: Right is Z, up is W.</li>
			<li>X Set: Right is V, up is U.</li>
		</ul>

		Suppose we want to rotate from the Mandelbrot Set to the Julia Set. We can map X → Z and Y → W by rotating 90° within the XZ plane and the YW plane.

		<div class="flex justify-evenly gap-4 mt-4">
			{@render visualizePlaneMapping("X","Z", xzRot)}
			{@render visualizePlaneMapping("Y","W", ywRot)}
		</div>
	</div>

	<div class="mb-6">
		<!--<details class="mb-2 pointer-cursor">-->
			<div>An easy way to rotate 6D vectors is to use a 6x6 rotation matrix:</div>
			<div class="p-3 font-mono bg-surfaceContainer text-onSurfaceContainer my-2 overflow-auto whitespace-pre">{@html codeSnippet}</div>
		<!--</details>-->
	</div>

	<h2 class="text-xl text-onSurface font-bold mb-2">Minecraft Version</h2>
	
	<div class="mb-6">
		<div class="aspect-video max-w-140 mb-2">
			<iframe 
				class="w-full h-full rounded"
				src="https://www.youtube.com/embed/{minecraftYouTubeCode}" 
				title="Minecraft Text Display Models Explanation" 
				frameborder="0" 
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
				allowfullscreen>
			</iframe>
		</div>
	</div>

	<h2 class="text-xl text-onSurface font-bold mb-2">Source Code</h2>
	
	<div class="mb-6">
		<a 
			href="{githubRepositoryLink}" 
			target="_blank" 
			class="text-primary-500 hover:underline"
		>
			{githubRepositoryLink}
		</a>
	</div>

	
	<div class="mb-6">
		<h2 class="text-xl text-onSurface font-bold mb-2">Other Tools</h2>
		<a 
			href="{homeLink}" 
			target="_blank" 
			class="text-primary-500 hover:underline"
		>
			{homeLink}
		</a>
	</div>
	
	<div class="mt-6 text-right">
		<Button 
			variant="filled" 
			onPress={() => window.location.hash = ""}
		>
			Close
		</Button>
	</div>
</div>

{#snippet visualizePlaneMapping(axis1: string, axis2: string, rotationDeg: number)}
	<svg 
		class="relative flex-1 aspect-square max-w-50" 
		viewBox="-1 -1 2 2" 
		fill="none" 
		stroke="currentColor" 
		stroke-width=".03" 
		stroke-linecap="round" 
		stroke-linejoin="round" 
		aria-hidden="true"
	>
		<!-- axis labels -->
		<g 
			class="text-onSurface/80 text-sm font-mono"
			fill="currentColor"
		>
			<text 
				text-anchor="end"
				dominant-baseline="middle"
				transform="translate(1, 0) scale(0.012)"
			>
				{axis1}
			</text>

			<text 
				text-anchor="middle"
				dominant-baseline="hanging"
				transform="translate(0, -1) scale(0.012)"
			>
				{axis2}
			</text>

			<text 
				text-anchor="middle"
				dominant-baseline="auto"
				transform="translate(0, 0.97) scale(0.011)"
			>
				{axis1}{axis2} Plane
			</text>
		</g>

		<!-- grid -->
		<g  
			class="text-onSurface/50"
			stroke-width=".005"
			transform="scale(.8)"
		>
			<line 
				x1="0" y1="-1" x2="0" y2="1"
				stroke-width=".005"
			/>

			<line 
				x1="-1" y1="0" x2="1" y2="0"
			/>
		</g>
		
		<!-- arrow -->
		<g 
			class="text-primary-400"
			style="
				transition: transform {rotTransitionMilliseconds};
				transform: scale(.7) rotate({-rotationDeg}deg)
			"
		>
			<path d="M0 0L1 0"></path>
			<path d="M0.8 -0.2L1 0L0.8 0.2"></path>
		</g>
	</svg>
{/snippet}