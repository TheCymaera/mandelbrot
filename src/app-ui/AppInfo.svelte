<script lang="ts">
	import Button from '../ui-components/Button.svelte';
	import { githubRepositoryLink, homeLink, youtubeEmbedLink } from './links.js';

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
		[/(row|col):/g, `text-green-200`],
		// keywords
		[/const|let|fn|return/g, `text-cyan-500`],
		// functions
		[/[A-Za-z0-9]*(?=\()/g, `text-amber-200`],
		// types/classes
		[/Mat6|Vec6/g, `text-green-400`],
	] as const;


	const codeSnippet = syntaxHighlight(colors, `
const Vec6.X_INDEX = 0;
const Vec6.Y_INDEX = 1;
const Vec6.Z_INDEX = 2;
const Vec6.W_INDEX = 3;
const Vec6.V_INDEX = 4;
const Vec6.U_INDEX = 5;

fn Mat6.rotationFromAxisIndices(axisIndex1, axisIndex2, angle) {
	let matrix = Mat6.identity();
	let cos = cos(angle);
	let sin = sin(angle);

	matrix[row: axisIndex1, col: axisIndex1] = cos;
	matrix[row: axisIndex1, col: axisIndex2] = -sin;
	matrix[row: axisIndex2, col: axisIndex1] = sin;
	matrix[row: axisIndex2, col: axisIndex2] = cos;

	return matrix;
}

// Example usage:
let rotationMatrix = Mat6.rotationFromAxisIndices(Vec6.X_INDEX, Vec6.Z_INDEX, PI / 2);
	`).trim()

</script>

<div class="bg-surface text-onSurface p-6 rounded-lg max-w-2xl mx-auto">
	<h1 class="text-2xl font-bold mb-4">6D Mandelbrot Set Explorer</h1>


	<div class="mb-4 opacity-80">
		This tool allows you to explore the Mandelbrot Sets, Julia Sets, and the X Sets in a unified 6-dimensional space by rotating between them.
	</div>

	<div class="mb-4 opacity-80">
		A Mandelbrot iteration is defined as:
		<div class="p-3 block font-mono bg-surfaceContainer text-onSurfaceContainer my-2">
			zₙ₊₁ = zₙ ^ e + c
		</div>
	</div>

	<div class="mb-4 opacity-80">
		A classic Mandelbrot Set fixes z₁ and e while varying c over the complex plane, whereas Julia Sets fix c, e and vary z₁ instead. These two planes (z,e) can be thought of as orthogonal to each other in a unified 4-dimensional space.
	</div>

	<div class="mb-4 opacity-80">
		In <a 
			href="https://www.youtube.com/watch?v=Ed1gsyxxwM0" 
			target="_blank" 
			class="text-primary-500 hover:underline"
		>2swap's YouTube video</a>, he coins the "X Set", which varies the exponent e while fixing the other values, thus adding a third orthogonal plane.
	</div>

	<div class="mb-4 opacity-80">
		Using 6-dimensional right and up vectors, we can slice a 2D viewport through this 6D fractal.
		Each pixel in the viewport corresponds to a point p in 6D space:
		<div class="p-3 font-mono bg-surfaceContainer text-onSurfaceContainer my-2 overflow-auto whitespace-nowrap">
			z = p.z + p.w * i <span class="opacity-30">// Julia</span><br>
			c = p.x + p.y * i <span class="opacity-30">// Mandelbrot</span><br>
			e = p.v + p.u * i <span class="opacity-30">// X</span>
		</div>

		<div class="p-3 font-mono bg-surfaceContainer text-onSurfaceContainer my-2">
			z = z ^ e + c
		</div>
	</div>

	<div class="mb-6 opacity-80">
		In 6D space, there are 15 cardinal rotation planes:
		<div class="text-sm opacity-80">XY, XZ, XW, XV, XU, YZ, YW, YV, YU, ZW, ZV, ZU, WV, WU, VU</div>
	</div>

	<div class="mb-6 opacity-80">
		To figure out what rotation gets us from a Mandelbrot Set to a Julia Set, we can focus on the left and up vectors. In the Mandelbrot Set, they are the X and Y axes, whereas in a Julia Set, they are the Z and W axes. We can map X→Z and Y→W by rotating 90° on the XZ plane and the YW plane.
	</div>

	<div class="mb-6 opacity-80">
		We can apply the same principle to rotate from the Mandelbrot plane toward the exponent plane <small class="opacity-80">(XV, YU)</small>, or from the Julia plane toward the exponent plane <small class="opacity-80">(ZV, WU)</small>.
	</div>

	<div class="mb-6 opacity-80">
		<!--<details class="mb-2 pointer-cursor">-->
			<div>An easy way to rotate 6D vectors is to use a 6x6 rotation matrix:</div>
			<div class="p-3 font-mono bg-surfaceContainer text-onSurfaceContainer my-2 overflow-auto whitespace-pre">{@html codeSnippet}</div>
		<!--</details>-->
	</div>
	
	<div class="mb-6">
		<h2 class="text-xl font-bold mb-2">Minecraft Version</h2>
		<div class="aspect-video max-w-140 mb-2">
			<iframe 
				class="w-full h-full rounded"
				src="{youtubeEmbedLink}" 
				title="Minecraft Text Display Models Explanation" 
				frameborder="0" 
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
				allowfullscreen>
			</iframe>
		</div>
	</div>
	
	<div class="mb-6">
		<h2 class="text-xl font-bold mb-2">GitHub Repository</h2>
		<a 
			href="{githubRepositoryLink}" 
			target="_blank" 
			class="text-primary-500 hover:underline"
		>
			{githubRepositoryLink}
		</a>
	</div>

	
	<div class="mb-6">
		<h2 class="text-xl font-bold mb-2">Other Tools</h2>
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
