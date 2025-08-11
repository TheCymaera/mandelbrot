<script lang="ts">
	import { onMount } from 'svelte';
	import { MandelbrotRenderer } from '../mandelbrot/MandelbrotRenderer.js';
	import { MandelbrotState } from '../mandelbrot/MandelbrotState.svelte.js';
	import { inputMap } from '../mandelbrot/inputMap.svelte.js';
	import NumberField from '../ui-components/NumberField.svelte';
	import Button from '../ui-components/Button.svelte';
	import CircleButton from '../ui-components/CircleButton.svelte';
	import { fa5_solid_bars, fa5_solid_info, fa5_solid_times } from 'fontawesome-svgs';
	import { Vec6 } from '../math/Vec6.js';
	import { Mat6 } from '../math/Mat6.js';
	import { juliaWiseInputScheme, mandelbrotToExponentMappings, mandelbrotToJuliaMappings, regularInputScheme, xWiseInputScheme, type InputScheme, type PlaneMapping } from '../mandelbrot/inputSchemes.js';
	import { deepEquals } from '../utilities/deepEquals.js';
	import SelectField from '../ui-components/SelectField.svelte';
	
	let canvas: HTMLCanvasElement;
	let renderer: MandelbrotRenderer;
	let mandelbrot = $state(new MandelbrotState());
	let animationFrame: number;

	// Sidebar state
	let sidebarOpen = $state(true);
	const sidebarWidth = 400;

	onMount(() => {
		// Create renderer
		renderer = new MandelbrotRenderer(canvas);

		Object.assign(globalThis, {
			mandelbrot,
			renderer,
			inputMap,
		});
		
		// Set up resize observer for the canvas container
		const canvasContainer = canvas.parentElement!;
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				
				canvas.width = width;
				canvas.height = height;

				renderer.resize(width, height);
				renderer.render(mandelbrot); // re-render to prevent flickering
			}
		});
		resizeObserver.observe(canvasContainer);
		
		// Start animation loop
		function animate(currentTime: number) {
			mandelbrot.update(currentTime);
			renderer.render(mandelbrot);
			animationFrame = requestAnimationFrame(animate);
		}
		
		// Start animation
		animate(0);
		
		return () => {
			resizeObserver.disconnect();
			cancelAnimationFrame(animationFrame);
			renderer.destroy();
		}
	});

	function prettyPrintJson(data: unknown) {
		return JSON.stringify(data, function (k, v) {
			if (v instanceof Array) return JSON.stringify(v);
			return v;
		}, 2)
		.replace(/\\/g, '')
		.replace(/\"\[/g, '[')
		.replace(/\]\"/g,']')
		.replace(/\"\{/g, '{')
		.replace(/\}\"/g,'}');
	}

	const jsonString = $derived(prettyPrintJson({
		position: mandelbrot.position.toArray(),
		orientationMatrix: mandelbrot.orientationMatrix.toArray(),
		zoom: mandelbrot.zoom,
	}));

	
	let jsonError = $state('');
	
	function processJsonDump(jsonDump: string) {
		try {
			const data = JSON.parse(jsonDump) as Partial<MandelbrotState>;

			// Validate data structure
			if (!data.position || !Array.isArray(data.position) || data.position.length !== 6) {
				throw new Error('Invalid position data');
			}
			
			// Apply data
			mandelbrot.position = Vec6.fromMaybeArray(data.position);
			mandelbrot.orientationMatrix = Mat6.fromMaybeArray(data.orientationMatrix);
			mandelbrot.zoom = data.zoom ?? mandelbrot.zoom;

			mandelbrot.clearVelocities();

			jsonError = '';
		} catch (error) {
			jsonError = error instanceof Error ? error.message : 'Invalid JSON format';
		}
	}

	function getInputSchemeName(type: InputScheme): string {
		if (type === regularInputScheme) return 'Classic';
		if (type === juliaWiseInputScheme) return 'Julia-wise';
		if (type === xWiseInputScheme) return 'X-wise';
		return 'Custom';
	}

	const rotations: {name: string, rotation: PlaneMapping[]}[] = [
		{ name: "None (Zoom)", rotation: regularInputScheme.rotationPlanes },
		{ name: "Mandelbrot to Julia", rotation: mandelbrotToJuliaMappings },
		{ name: "Mandelbrot to Exponent", rotation: mandelbrotToExponentMappings },
		{ name: "XY plane", rotation: [{ axis1: 0, axis2: 1 }] },
		{ name: "XZ plane", rotation: [{ axis1: 0, axis2: 2 }] },
		{ name: "XW plane", rotation: [{ axis1: 0, axis2: 3 }] },
		{ name: "XV plane", rotation: [{ axis1: 0, axis2: 4 }] },
		{ name: "XU plane", rotation: [{ axis1: 0, axis2: 5 }] },
		{ name: "YZ plane", rotation: [{ axis1: 1, axis2: 2 }] },
		{ name: "YW plane", rotation: [{ axis1: 1, axis2: 3 }] },
		{ name: "YV plane", rotation: [{ axis1: 1, axis2: 4 }] },
		{ name: "YU plane", rotation: [{ axis1: 1, axis2: 5 }] },
		{ name: "ZW plane (No Effect)", rotation: [{ axis1: 2, axis2: 3 }] },
		{ name: "ZV plane (No Effect)", rotation: [{ axis1: 2, axis2: 4 }] },
		{ name: "ZU plane (No Effect)", rotation: [{ axis1: 2, axis2: 5 }] },
		{ name: "WV plane (No Effect)", rotation: [{ axis1: 3, axis2: 4 }] },
		{ name: "WU plane (No Effect)", rotation: [{ axis1: 3, axis2: 5 }] },
		{ name: "VU plane (No Effect)", rotation: [{ axis1: 4, axis2: 5 }] },
	]

	function getAxisName(axis: Vec6) {
		if (axis.x > 0) return 'X';
		if (axis.y > 0) return 'Y';
		if (axis.z > 0) return 'Z';
		if (axis.w > 0) return 'W';
		if (axis.v > 0) return 'V';
		return 'U';
	}

</script>
<main class="w-full h-screen bg-background overflow-hidden relative flex">
	<!-- Canvas container that adjusts to sidebar -->
	<div class="relative flex-1 transition-all duration-300" style="margin-left: {sidebarOpen ? sidebarWidth + 'px' : '0px'}">
		<div class="
			absolute top-0 left-0 flex flex-col gap-4 p-4
			w-min h-full
			opacity-0 hover:opacity-100 transition-opacity delay-50 duration-500
		">
			<CircleButton 
				onPress={()=>(sidebarOpen = !sidebarOpen)}
				label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
			>
				{@html sidebarOpen ? fa5_solid_times : fa5_solid_bars}
			</CircleButton>
			<CircleButton 
				onPress={()=>location.hash = "#info"}
			>
				{@html fa5_solid_info}
			</CircleButton>
		</div>
		<canvas 
			bind:this={canvas}
			class="w-full h-full block outline-none"
			tabindex="0"
		></canvas>
	</div>
	
	<!-- Collapsible sidebar -->
	<div class="absolute top-0 left-0 h-full bg-surface p-4 transition-transform duration-300 overflow-y-auto
		{sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
		style="width: {sidebarWidth}px;"
	>
		<!-- Input Scheme -->
		<div class="mb-6">
			<h3 class="text-lg font-semibold mb-2">Input Scheme</h3>
			
			<div class="grid grid-cols-3 gap-2 text-sm mb-4">
				{#each [regularInputScheme, juliaWiseInputScheme, xWiseInputScheme] as type}
					<Button 
						onPress={() => inputMap.scheme = type}
						className="w-full p-2! rounded! "
						variant={deepEquals(inputMap.scheme, type) ? 'filled' : 'outlined'}
					>
						{getInputSchemeName(type)}
					</Button>
				{/each}
			</div>

			{#snippet kbd(text: string)}
				<kbd class="
					bg-surfaceContainer text-onSurfaceContainer rounded px-3 ml-1 font-mono
				">{text}</kbd>
			{/snippet}

			<div class="text-sm mb-3">
				<div class="flex items-center mb-1">
					Press {@render kbd("1")}, {@render kbd("2")}, or {@render kbd("3")} to switch modes
				</div>

				<div class="flex items-center mb-1">
					<div>
						Move Local {getAxisName(inputMap.scheme.horizontalAxis)}
					</div>

					{@render kbd("W")}
					{@render kbd("D")}
				</div>

				<div class="flex items-center mb-1">
					<div>
						Move Local {getAxisName(inputMap.scheme.verticalAxis)}
					</div>
					{@render kbd("A")}
					{@render kbd("S")}
				</div>

				<div class="flex items-center mb-1">
					{inputMap.scheme.zoomSpeed ? "Zoom In / Out" : "Rotate"}

					{@render kbd("Space")}
					{@render kbd("Shift")}
				</div>
			</div>

			<div class="text-sm mb-3 font-mono bg-surfaceContainer p-2 rounded">
				z = (p.z, p.w) <span class="opacity-30">// Julia</span><br>
				c = (p.x, p.y) <span class="opacity-30">// Classic Mandelbrot</span><br>
				e = (p.v, p.u) <span class="opacity-30">// X</span>
			</div>

			<div class="text-sm mb-3 font-mono bg-surfaceContainer p-2 rounded">
				z = z ^ e + c
			</div>

		</div>

		<!-- Controls -->
		<div class="mb-6">
			<h3 class="text-lg font-semibold mb-2">Controls</h3>
			<div class="grid grid-cols-2 gap-2">
				<NumberField 
					label="Speed"
					bind:value={mandelbrot.speedScale}
				/>
				<NumberField 
					label="Spring"
					bind:value={mandelbrot.springScale}
				/>
				<div class="col-span-2">
					<SelectField
						label="Rotational Plane"
						value={inputMap.scheme.rotationPlanes}
						options={rotations.map(r => ({ value: r.rotation, label: r.name }))}
						onChange={e => {
							inputMap.scheme.rotationPlanes = e.value;
							inputMap.scheme.zoomSpeed = e.value.length == 0 ? regularInputScheme.zoomSpeed : 0;
							console.log(inputMap.scheme.rotationPlanes, inputMap.scheme.zoomSpeed);
						}}
					/>
				</div>
			</div>
		</div>

		<!-- Indicators -->
		<div class="mb-6">
			<h3 class="text-lg font-semibold mb-2">Indicators</h3>
			<div class="grid grid-cols-2 gap-2">
				<NumberField 
					label="Z Indicator Size"
					bind:value={mandelbrot.zIndicatorSize}
				/>
				<NumberField 
					label="E Indicator Size"
					bind:value={mandelbrot.eIndicatorSize}
				/>
			</div>
			<small class="text-xs opacity-80 ml-2">
				Set to 0 to disable.
			</small>
		</div>


		<!-- Display Right/Up vectors -->
		<div class="mb-6">
			<h3 class="text-lg font-semibold mb-2">Camera</h3>
			{#snippet vector(options: { vector: Vec6, readonly: boolean})}
				<div class="grid grid-cols-2 gap-2">
					<NumberField
						label="X"
						hideLabel={true}
						readonly={options.readonly}
						value={options.vector.x}
						onInput={e => options.vector.x = e.value}
					/>
					<NumberField
						label="Y"
						hideLabel={true}
						readonly={options.readonly}
						value={options.vector.y}
						onInput={e => options.vector.y = e.value}
					/>
					<NumberField
						label="Z"
						hideLabel={true}
						readonly={options.readonly}
						value={options.vector.z}
						onInput={e => options.vector.z = e.value}
					/>
					<NumberField
						label="W"
						hideLabel={true}
						readonly={options.readonly}
						value={options.vector.w}
						onInput={e => options.vector.w = e.value}
					/>
					<NumberField
						label="V"
						hideLabel={true}
						readonly={options.readonly}
						value={options.vector.v}
						onInput={e => options.vector.v = e.value}
					/>
					<NumberField
						label="U"
						hideLabel={true}
						readonly={options.readonly}
						value={options.vector.u}
						onInput={e => options.vector.u = e.value}
					/>
				</div>
			{/snippet}

			<h4 class="font-semibold mb-2">Position</h4>
			{@render vector({ vector: mandelbrot.position, readonly: false })}
			<br>

			<h4 class="font-semibold mb-2">Zoom</h4>
			<NumberField 
				label="Zoom" 
				bind:value={mandelbrot.zoom} 
				hideLabel={true}
				className="w-full"
			/>
			<br>

			<h4 class="font-semibold mb-2">
				Right Vector 
				<small class="text-xs opacity-80">(Read Only)</small>
			</h4>
			{@render vector({ vector: mandelbrot.rightVector, readonly: true })}
			<br>

			<h4 class="font-semibold mb-2">
				Up Vector
				<small class="text-xs opacity-80">(Read Only)</small>
			</h4>
			{@render vector({ vector: mandelbrot.upVector, readonly: true })}
		</div>

		<!-- JSON Dump -->
		<div class="mb-6">
			<h3 class="text-lg font-semibold mb-2">JSON Dump</h3>
			<small class="text-xs opacity-80 text-balance">
				Copy this JSON to save the current state, or paste it to load a state.
			</small>
			<div class="mb-2"></div>
			<textarea
				id="json-dump"
				value={jsonString}
				oninput={function() {
					processJsonDump(this.value as string);
				}}
				placeholder="Paste JSON parameters here..."
				class="
					w-full p-3 font-mono whitespace-pre resize-none
					border-[.08rem] border-containerBorder rounded-md bg-transparent
					focus-visible:outline-[3px] outline-primary-500 outline-offset-[-3px]
				"
				rows={jsonString.split('\n').length + 1}
			></textarea>

			{#if jsonError}
				<div class="text-red-500 text-sm mt-2">
					Error: {jsonError}
				</div>
			{/if}
		</div>
	</div>
</main>