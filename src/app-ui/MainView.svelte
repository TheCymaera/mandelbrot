<script lang="ts">
	import { onMount } from 'svelte';
	import { MandelbrotRenderer } from '../mandelbrot/MandelbrotRenderer.js';
	import { IndicatorSetting, Mandelbrot6DState } from '../mandelbrot/MandelbrotState.svelte.js';
	import { inputMap } from '../mandelbrot/inputMap.svelte.js';
	import NumberField from '../ui-components/NumberField.svelte';
	import Button from '../ui-components/Button.svelte';
	import CircleButton from '../ui-components/CircleButton.svelte';
	import { fa5_brands_github, fa5_solid_bars, fa5_solid_info, fa5_solid_times } from 'fontawesome-svgs';
	import { Vec6 } from '../math/Vec6.js';
	import { Mat6 } from '../math/Mat6.js';
	import { juliaToExponentMappings, juliaWiseInputMode, mandelbrotToExponentMappings, mandelbrotToJuliaMappings, regularInputMode, xWiseInputMode, type InputMode, type PlaneMapping } from '../mandelbrot/inputModes.js';
	import { deepEquals } from '../utilities/deepEquals.js';
	import SelectField from '../ui-components/SelectField.svelte';
	import CheckboxField from '../ui-components/CheckboxField.svelte';
	import { githubRepositoryLink } from './links.js';
	
	let canvas: HTMLCanvasElement;
	let renderer: MandelbrotRenderer;

	let mandelbrot = $state(new Mandelbrot6DState());
	let animationFrame: number;
	let rotateBy = $state(90);

	// Sidebar state
	let sidebarOpen = $state(true);

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

	const jsonString = $derived.by(()=>{
		return prettyPrintJson({
			position: mandelbrot.position.toArray(),
			zoom: mandelbrot.zoom,
			
			orientationMatrix: mandelbrot.simplifiedRotationActive ? undefined :
				mandelbrot.orientationMatrix.toArray(),
			
			simplifiedRotation: !mandelbrot.simplifiedRotationActive ? undefined : 
				mandelbrot.simplifiedRotation
		});
	});

	
	let jsonError = $state('');
	
	function loadJsonDump(jsonDump: string) {
		try {
			const data = JSON.parse(jsonDump) as Partial<Mandelbrot6DState>;

			// Validate data structure
			if (!data.position || !Array.isArray(data.position) || data.position.length !== 6) {
				throw new Error('Invalid position data');
			}
			
			// Apply data
			mandelbrot.position = Vec6.fromMaybeArray(data.position);
			mandelbrot.zoom = data.zoom ?? mandelbrot.zoom;

			if (data.orientationMatrix) {
				mandelbrot.simplifiedRotationActive = false;
				mandelbrot.orientationMatrix = Mat6.fromMaybeArray(data.orientationMatrix);
			}

			if (data.simplifiedRotation) {
				mandelbrot.simplifiedRotationActive = true;
				mandelbrot.simplifiedRotation = data.simplifiedRotation;
			}

			mandelbrot.clearVelocities();

			jsonError = '';
		} catch (error) {
			jsonError = error instanceof Error ? error.message : 'Invalid JSON format';
		}
	}

	function getInputModeName(type: InputMode): string {
		if (type === regularInputMode) return 'Classic';
		if (type === juliaWiseInputMode) return 'Julia Plane';
		if (type === xWiseInputMode) return 'X Plane';
		return 'Custom';
	}

	const rotations: {name: string, rotation: PlaneMapping[], isSimplified?: boolean }[] = [
		{ name: "None (Zoom)", rotation: regularInputMode.rotationPlanes, isSimplified: true },
		{ name: "Mandelbrot to Julia", rotation: mandelbrotToJuliaMappings, isSimplified: true },
		{ name: "Mandelbrot to Exponent", rotation: mandelbrotToExponentMappings, isSimplified: true },
		{ name: "Julia to Exponent", rotation: juliaToExponentMappings, isSimplified: true },
		{ name: "XY plane", rotation: [{ axis1: Vec6.X_INDEX, axis2: Vec6.Y_INDEX }] },
		{ name: "XZ plane", rotation: [{ axis1: Vec6.X_INDEX, axis2: Vec6.Z_INDEX }] },
		{ name: "XW plane", rotation: [{ axis1: Vec6.X_INDEX, axis2: Vec6.W_INDEX }] },
		{ name: "XV plane", rotation: [{ axis1: Vec6.X_INDEX, axis2: Vec6.V_INDEX }] },
		{ name: "XU plane", rotation: [{ axis1: Vec6.X_INDEX, axis2: Vec6.U_INDEX }] },
		{ name: "YZ plane", rotation: [{ axis1: Vec6.Y_INDEX, axis2: Vec6.Z_INDEX }] },
		{ name: "YW plane", rotation: [{ axis1: Vec6.Y_INDEX, axis2: Vec6.W_INDEX }] },
		{ name: "YV plane", rotation: [{ axis1: Vec6.Y_INDEX, axis2: Vec6.V_INDEX }] },
		{ name: "YU plane", rotation: [{ axis1: Vec6.Y_INDEX, axis2: Vec6.U_INDEX }] },
		{ name: "ZW plane", rotation: [{ axis1: Vec6.Z_INDEX, axis2: Vec6.W_INDEX }] },
		{ name: "ZV plane", rotation: [{ axis1: Vec6.Z_INDEX, axis2: Vec6.V_INDEX }] },
		{ name: "ZU plane", rotation: [{ axis1: Vec6.Z_INDEX, axis2: Vec6.U_INDEX }] },
		{ name: "WV plane", rotation: [{ axis1: Vec6.W_INDEX, axis2: Vec6.V_INDEX }] },
		{ name: "WU plane", rotation: [{ axis1: Vec6.W_INDEX, axis2: Vec6.U_INDEX }] },
		{ name: "VU plane", rotation: [{ axis1: Vec6.V_INDEX, axis2: Vec6.U_INDEX }] },
	]


	function getAxisIndex(axis: Vec6) {
		if (axis.x > 0) return Vec6.X_INDEX;
		if (axis.y > 0) return Vec6.Y_INDEX;
		if (axis.z > 0) return Vec6.Z_INDEX;
		if (axis.w > 0) return Vec6.W_INDEX;
		if (axis.v > 0) return Vec6.V_INDEX;
		return Vec6.U_INDEX;
	}


	function getAxisNameFromIndex(index: number) {
		return ["X", "Y", "Z", "W", "V"][index] ?? "U";
	}

	function getAxisName(vec: Vec6) {
		return getAxisNameFromIndex(getAxisIndex(vec));
	}
</script>
<main 
	style:--sidebar-width="400px"
	style:--sidebar-height="50%"
	class="inset-0 bg-background overflow-hidden relative"
>
	<div class="
		absolute transition-all duration-300
		inset-0
		{sidebarOpen ? `
			bottom-[var(--sidebar-height)] md:bottom-0
			md:left-[var(--sidebar-width)]
		` : ""}
	">
		<div class="
			absolute top-0 left-0 flex flex-col gap-4 p-4
			w-min h-full
			md:opacity-0 hover:opacity-100 transition-opacity delay-50 duration-500
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
			<a tabindex="-1" href="{githubRepositoryLink}" target="_blank">
				<CircleButton onPress={()=>{}}>
					{@html fa5_brands_github}
				</CircleButton>
			</a>
		</div>
		<canvas 
			bind:this={canvas}
			class="w-full h-full block outline-none"
			tabindex="0"
		></canvas>
	</div>
	
	<!-- Collapsible sidebar -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="
			absolute bottom-0 left-0 bg-surface transition-transform duration-300 overflow-y-auto
			w-full h-[var(--sidebar-height)]
			md:w-[var(--sidebar-width)] md:h-full
			{sidebarOpen ? 
				`translate-x-0 translate-y-0` : 
				'translate-y-full md:translate-y-0 md:-translate-x-full'
			}
		"
		onkeydown={(e)=>{
			if (e.code === "Space" || e.code === "Shift") {
				e.preventDefault();
			}
		}}
	>
		<div class="p-4">
			{@render sidebarMain()}
		</div>
	</div>
</main>

{#snippet sidebarMain()}
	<!-- Input Mode -->
	<div class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Input Mode</h3>
		
		<div class="grid grid-cols-3 gap-2 text-sm mb-4">
			{#each [regularInputMode, juliaWiseInputMode, xWiseInputMode] as type}
				<Button 
					onPress={() => inputMap.mode = type}
					className="w-full p-2! rounded! "
					variant={deepEquals(inputMap.mode, type) ? 'filled' : 'outlined'}
				>
					{getInputModeName(type)}
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
					Move {mandelbrot.moveOnLocalAxes ? "Local " : ""}{getAxisName(inputMap.mode.horizontalAxis)}
				</div>

				{@render kbd("W")}
				{@render kbd("D")}
			</div>

			<div class="flex items-center mb-1">
				<div>
					Move {mandelbrot.moveOnLocalAxes ? "Local " : ""}{getAxisName(inputMap.mode.verticalAxis)}
				</div>
				{@render kbd("A")}
				{@render kbd("S")}
			</div>

			<div class="flex items-center mb-1">
				{inputMap.mode.zoomSpeed ? "Zoom In / Out" : "Rotate"}

				{@render kbd("Shift")}
				{@render kbd("Space")}
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
		<div class="grid grid-cols-2 gap-2 mb-2">
			<NumberField 
				label="Speed"
				bind:value={mandelbrot.speedScale}
			/>
			<NumberField 
				label="Spring"
				bind:value={mandelbrot.springScale}
			/>

			<SelectField
				label="Horizontal Axis"
				bind:value={
					()=>getAxisIndex(inputMap.mode.horizontalAxis),
					(value)=>inputMap.mode.horizontalAxis = Vec6.fromIndex(value)
				}
				options={
					new Array(6).fill(0).map((_, i) => ({
						value: i,
						label: getAxisNameFromIndex(i)
					}))
				}
			/>

			<SelectField
				label="Vertical Axis"
				bind:value={
					()=>getAxisIndex(inputMap.mode.verticalAxis),
					(value)=>inputMap.mode.verticalAxis = Vec6.fromIndex(value)
				}
				options={
					new Array(6).fill(0).map((_, i) => ({
						value: i,
						label: getAxisNameFromIndex(i)
					}))
				}
			/>

			<CheckboxField
				label="Move on Local Axes"
				className="col-span-2"
				bind:checked={mandelbrot.moveOnLocalAxes}
			/>

			<CheckboxField
				label="Use Simplified Rotation"
				className="col-span-2"
				bind:checked={mandelbrot.simplifiedRotationActive}
			/>

			<SelectField
				label="Rotational Plane"
				className="col-span-2"
				value={inputMap.mode.rotationPlanes}
				options={
					rotations
					.filter(i => !mandelbrot.simplifiedRotationActive || i.isSimplified)
					.map(r => ({ value: r.rotation, label: r.name }))
				}
				onChange={e => {
					inputMap.mode.rotationPlanes = e.value;
					inputMap.mode.zoomSpeed = e.value.length == 0 ? regularInputMode.zoomSpeed : 0;
					console.log(inputMap.mode.rotationPlanes, inputMap.mode.zoomSpeed);
				}}
			/>

			{#if !mandelbrot.simplifiedRotationActive}
				<CheckboxField
					label="Rotate on Local Axes"
					className="col-span-2"
					bind:checked={mandelbrot.rotateOnLocalAxes}
				/>
			{/if}
		</div>
	</div>

	<!-- Camera -->
	<div class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Position</h3>
		{@render vector({ vector: mandelbrot.position, readonly: false })}

		<h3 class="text-lg font-semibold mb-2">Zoom</h3>
		<NumberField 
			label="Zoom" 
			bind:value={mandelbrot.zoom} 
			hideLabel={true}
			className="w-full"
		/>
	</div>


	<div class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Rotation</h3>
		{#if !mandelbrot.simplifiedRotationActive}
			<div class="col-span-2 grid grid-cols-[1fr_min-content] gap-2 items-end mb-3">
				<NumberField 
					label="Rotate By"
					bind:value={rotateBy}
				/>
				<Button
					className="w-20 p-2! rounded!"
					disabled={inputMap.mode.rotationPlanes.length === 0}
					onPress={() => {
						const inRadians = rotateBy * (Math.PI / 180);
						mandelbrot.rotateByPlaneMappings(inputMap.mode.rotationPlanes, inRadians)
					}}
				>
					Rotate
				</Button>
			</div>
			
			<Button
				className="px-5! p-2! rounded! mt-2"
				onPress={() => {
					mandelbrot.orientationMatrix = Mat6.identity();
				}}
			>
				Reset Rotation
			</Button>
			<br>
		{:else}
			{@const degToRad = (n: number) => n * (Math.PI / 180)}
			{@const radToDeg = (n: number) => n * (180 / Math.PI)}
			<div class="grid grid-cols-2 gap-2">
				<NumberField 
					label="Julia-wise°" 
					bind:value={
						()=>radToDeg(mandelbrot.simplifiedRotation.juliaWise),
						v=>mandelbrot.simplifiedRotation.juliaWise = degToRad(v)
					}
					className="w-full"
				/>
				<NumberField 
					label="X-wise°" 
					bind:value={
						()=>radToDeg(mandelbrot.simplifiedRotation.exponentWise),
						v=>mandelbrot.simplifiedRotation.exponentWise = degToRad(v)
					}
					className="w-full"
				/>
				<NumberField 
					label="Julia-to-X-wise°" 
					bind:value={
						()=>radToDeg(mandelbrot.simplifiedRotation.juliaToExponentWise),
						v=>mandelbrot.simplifiedRotation.juliaToExponentWise = degToRad(v)
					}
					className="w-full"
				/>
			</div>
		{/if}
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

	<!-- Render settings -->
	<div class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Indicators</h3>
		<div class="grid grid-cols-2 gap-2 mb-2">
			<NumberField 
				label="Z Indicator Size"
				bind:value={mandelbrot.zIndicatorSize}
			/>
			<NumberField 
				label="E Indicator Size"
				bind:value={mandelbrot.eIndicatorSize}
			/>
		</div>
		<SelectField 
			label="Show Indicator"
			className="mb-2"
			bind:value={
				()=>mandelbrot.zIndicatorSetting,
				(value)=> {
					mandelbrot.zIndicatorSetting = value;
					mandelbrot.eIndicatorSetting = value;
				}
			}
			options={[
				{ value: IndicatorSetting.Never, label: "Never" },
				{ value: IndicatorSetting.Always, label: "Always" },
				{ value: IndicatorSetting.WhenToolSelected, label: "When Plane Selected" },
			]}
		/>
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
				loadJsonDump(this.value as string);
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
{/snippet}


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