<script lang="ts">
	import Button from '../ui-components/Button.svelte';
	import { githubRepositoryLink, homeLink, youtubeEmbedLink } from './links.js';
</script>

<div class="bg-surface text-onSurface p-6 rounded-lg max-w-2xl mx-auto">
	<h1 class="text-2xl font-bold mb-4">6D Mandelbrot Set Explorer</h1>


	<div class="mb-4 opacity-80">
		This tool allows you to explore the Mandelbrot Set, Julia Sets, and the X Set in a unified 6-dimensional space by rotating between them.
	</div>

	<div class="mb-4 opacity-80">
		A Mandelbrot iteration is defined as:
		<div class="p-3 block font-mono bg-surfaceContainer text-onSurfaceContainer my-2">
			zₙ₊₁ = zₙ ^ e + c
		</div>
	</div>

	<div class="mb-4 opacity-80">
		Classic Mandelbrot Sets fix z₁ and e while varying c over the complex plane, whereas Julia Sets fix c and e and vary z₁ instead. These two planes can be thought of as orthogonal to each other in a unified 4-dimensional space.
	</div>

	<div class="mb-4 opacity-80">
		In <a 
			href="https://www.youtube.com/watch?v=Ed1gsyxxwM0" 
			target="_blank" 
			class="text-primary-500 hover:underline"
		>2swap's YouTube video</a>, he coins the "X Set", which varies the exponent e while fixing all other values, thus adding a third orthogonal plane.
	</div>

	<div class="mb-4 opacity-80">
		Using 6-dimensional right and up vectors, we can slice a 2D viewport through this 6D fractal.
		Each pixel in the viewport corresponds to a point p in 6D space:
		<div class="p-3 font-mono bg-surfaceContainer text-onSurfaceContainer my-2">
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
		We can apply the same principle to rotate from the Mandelbrot plane toward the exponent plane <small class="opacity-80">(XV, YU)</small>, or from the Julia plane toward the exponent plane <small class="opacity-80">(ZW, VU)</small>.
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
