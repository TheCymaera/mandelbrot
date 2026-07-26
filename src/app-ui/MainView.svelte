<script lang="ts">
	import { onMount } from 'svelte';
	import { MandelbrotRenderer } from '../mandelbrot/MandelbrotRenderer.js';
	import { IndicatorSetting, Mandelbrot6DState } from '../mandelbrot/MandelbrotState.svelte.js';
	import NumberField from '../helion/NumberField.svelte';
	import { fa5_brands_github, fa5_solid_bars, fa5_solid_book, fa5_solid_code, fa5_solid_info, fa5_solid_paintBrush, fa5_solid_play, fa5_solid_times, fa6_solid_upDownLeftRight } from 'fontawesome-svgs';
	import { Vec6 } from '../math/Vec6.js';
	import { Mat6 } from '../math/Mat6.js';
	import { deepEquals } from '../utilities/deepEquals.js';
	import SelectField from '../helion/SelectField.svelte';
	import CheckboxField from '../helion/CheckboxField.svelte';
	import { githubRepositoryLink } from './links.js';
	import NavRail from '../helion/NavRail.svelte';
	import { basicPresets, hyperbolicJuliaPresets, juliaPresets, mandelbrotPresets, reducedBailoutRadiusPresets, specialPresets, type PresetInfo } from '../mandelbrot/presets.js';
	import { MandelbrotLerp } from '../mandelbrot/MandelbrotLerp.js';
	import { linear } from 'svelte/easing';
	import { easeInOutBezier } from '../math/easing.js';
	import NavRailSpacer from '../helion/NavRailSpacer.svelte';
	import RangeSlider from '../helion/RangeSlider.svelte';
	import { Preset } from '../mandelbrot/Preset.js';
	import { CameraController, CameraControllerOptions } from '../mandelbrot/CameraController.svelte.js';
	import { keyMap } from '../mandelbrot/keyMap.js';
	import { PlaneMapping } from '../mandelbrot/PlaneMapping.js';
	import { PointerInput } from '../mandelbrot/PointerInput.js';
	import { MediaQuery } from 'svelte/reactivity';
	import type { Vec2 } from '../math/Vec2.js';
	
	let canvas: HTMLCanvasElement;
	let renderer: MandelbrotRenderer;

	let mandelbrot = $state(new Mandelbrot6DState());
	let animationFrame: number;
	let rotateBy = $state(90);

	let loadPresetLerpDuration = $state(1);
	let loadPresetLerpEase = $state(easeInOutBezier);

	// Sidebar state
	let sidebarOpen = $state(true);


	keyMap.onHalfSpeed = () => {
		mandelbrot.cameraController.speedScale *= 0.5;
		mandelbrot.cameraController.speedScale = Math.max(mandelbrot.cameraController.speedScale, 1e-6);
	};

	keyMap.onDoubleSpeed = () => {
		mandelbrot.cameraController.speedScale *= 2.0;
		mandelbrot.cameraController.speedScale = Math.min(mandelbrot.cameraController.speedScale, 1e6);
	};


	keyMap.onChooseInputMode = (id) => {
		const modes = [
			CameraControllerOptions.REGULAR,
			CameraControllerOptions.JULIA,
			CameraControllerOptions.X,
			CameraControllerOptions.JULIA_TO_X,
		];
		const mode = modes[id];
		if (mode) mandelbrot.cameraController.options = mode();
	};


	onMount(() => {
		// Create renderer
		renderer = new MandelbrotRenderer(canvas);

		Object.assign(globalThis, {
			mandelbrot,
			renderer,
		});
		
		// Set up resize observer for the canvas container
		const canvasContainer = canvas.parentElement!;
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const dpr = window.devicePixelRatio || 1;
				const width = (entry.contentRect.width * dpr) | 0;
				const height = (entry.contentRect.height * dpr) | 0;
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
			cancelAnimationFrame(animationFrame);
			renderer.destroy();
		}
	});

	onMount(()=>{
		// Pointer input
		function getPointerDirectionSign() {
			const isParallelToScreen =
				mandelbrot.cameraController.options.horizontalAxis.equals(Vec6.X()) && 
				mandelbrot.cameraController.options.verticalAxis.equals(Vec6.Y());

			return isParallelToScreen ? -1 : 1;
		}

		function screenPositionToWorldPosition(position: Vec2) {
			const rect = canvas.getBoundingClientRect();

			const aspectRatio = rect.width / rect.height;
			const normalizedX = ((position.x - rect.left) / rect.width) - 0.5;
			const normalizedY = 0.5 - ((position.y - rect.top) / rect.height);

			const axes = mandelbrot.cameraController.getMovementAxes(mandelbrot);
			const offset = axes.horizontal.scale(normalizedX / mandelbrot.zoomLevel)
				.add(axes.vertical.scale(normalizedY / (mandelbrot.zoomLevel * aspectRatio)));
			
			return offset.add(mandelbrot.position);
		}

		const pointerInput = new PointerInput(canvas);

		pointerInput.onPointerCapture = ()=>canvas.style.cursor = 'grabbing';
		pointerInput.onPointerRelease = ()=>canvas.style.cursor = '';

		pointerInput.onMouseWheelGesture = (event) => {
			const oldPosition = screenPositionToWorldPosition(event.position);
			
			mandelbrot.zoom += event.delta.y * -0.001;

			const newPosition = screenPositionToWorldPosition(event.position);
			const delta = oldPosition.subtract(newPosition);
			mandelbrot.position = mandelbrot.position.add(delta);
			mandelbrot.cameraController.zoomVelocity = 0;
		};

		pointerInput.onDragGesture = (event) => {
			const oldPosition = screenPositionToWorldPosition(event.previous);
			const newPosition = screenPositionToWorldPosition(event.current);
			const delta = newPosition.subtract(oldPosition).scale(getPointerDirectionSign());

			mandelbrot.position = mandelbrot.position.add(delta);
			mandelbrot.cameraController.clearVelocities();
		};

		pointerInput.onPinchGesture = (event) => {
			const cameraController = mandelbrot.cameraController;
			mandelbrot.cameraController.clearVelocities();

			const oldMidpoint = screenPositionToWorldPosition(event.previousMidpoint);

			// zoom (if enabled)
			if (cameraController.options.zoomSpeed !== 0) {
				mandelbrot.zoom += event.zoomDelta;
			}

			// rotate
			mandelbrot.rotateByPlaneMappings(
				cameraController.options.rotationPlaneMappings,
				event.angleDelta,
				cameraController.rotateOnLocalPlanes,
			);
			
			// pan (if not rotating)
			if (cameraController.options.rotationPlaneMappings.length === 0) {
				const newMidpoint = screenPositionToWorldPosition(event.currentMidpoint);

				const delta = oldMidpoint.subtract(newMidpoint);
				mandelbrot.position = mandelbrot.position.add(delta);
			}
		};

		return () => {
			pointerInput.destroy();
		};
	})

	function prettyPrintJson(data: unknown) {
		return JSON.stringify(data, function (k, v) {
			if (v instanceof Array) return JSON.stringify(v);
			return v;
		}, "\t")
		.replace(/\\/g, '')
		.replace(/\"\[/g, '[')
		.replace(/\]\"/g,']')
		.replace(/\"\{/g, '{')
		.replace(/\}\"/g,'}');
	}

	let jsonError = $state('');
	
	function loadJsonDump(jsonDump: string) {
		try {
			const data = JSON.parse(jsonDump);
			const preset = Preset.fromMaybeJSON(data);
			preset.apply(mandelbrot);
			mandelbrot.cameraController.clearVelocities();
			jsonError = '';
		} catch (error) {
			jsonError = error instanceof Error ? error.message : 'Invalid JSON format';
		}
	}

	const rotations: {name: string, rotation: PlaneMapping[], isSimplified?: boolean }[] = [
		{ name: "None (Zoom)", rotation: [], isSimplified: true },
		{ name: "Mandelbrot to Julia", rotation: PlaneMapping.mandelbrotToJulia, isSimplified: true },
		{ name: "Mandelbrot to Exponent", rotation: PlaneMapping.mandelbrotToExponent, isSimplified: true },
		{ name: "Julia to Exponent", rotation: PlaneMapping.juliaToExponent, isSimplified: true },
		...PlaneMapping.all.map(i => ({ 
			name: getAxisNameFromIndex(i.axis1) + getAxisNameFromIndex(i.axis2) + " Plane",
			rotation: [i]
		})),
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

	let sidebarSection: "controls" | "rendering" | "preset" | "json" | "animation" = $state("controls");

	const showExperimentalFeatures = location.search.includes("experimental");
	const deviceSupportsHover = new MediaQuery("(hover: hover)");
</script>
<main 
	style:--sidebar-width="450px"
	style:--sidebar-height="50%"
	class="inset-0 bg-background overflow-hidden relative"
>
	<div class="
		absolute transition-all duration-300
		inset-0
		{sidebarOpen ? `
			bottom-(--sidebar-height) md:bottom-0
			md:left-(--sidebar-width)
		` : ""}
	">
		<div class="
			absolute top-0 left-0 flex flex-col gap-4 p-4
			w-min h-full
			hover:opacity-100 transition-opacity delay-50 duration-500
			{deviceSupportsHover.current ? "opacity-0" : ""}
		">
			<button 
				onclick={()=>(sidebarOpen = !sidebarOpen)}
				class="helion-floating-action-button"
				title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
			>
				{@html sidebarOpen ? fa5_solid_times : fa5_solid_bars}
			</button>
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
			absolute bottom-0 left-0 bg-surface transition-transform duration-300
			w-full h-(--sidebar-height)
			md:w-(--sidebar-width) md:h-full
			grid grid-cols-[min-content_1fr]
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
		<NavRail placement="left">
			<button
				class="helion-nav-rail-button"
				aria-current={sidebarSection === 'controls'}
				onclick={() => (sidebarSection = 'controls')}
			>
				{@html fa6_solid_upDownLeftRight}
				<span class="text-xs">Position</span>
			</button>

			<button
				class="helion-nav-rail-button"
				aria-current={sidebarSection === 'rendering'}
				onclick={() => (sidebarSection = 'rendering')}
			>
				{@html fa5_solid_paintBrush}
				<span class="text-xs">Display</span>
			</button>

			<button
				class="helion-nav-rail-button"
				aria-current={sidebarSection === 'preset'}
				onclick={() => (sidebarSection = 'preset')}
			>
				{@html fa5_solid_book}
				<span class="text-xs">Presets</span>
			</button>

			<button
				class="helion-nav-rail-button"
				hidden={!showExperimentalFeatures}
				aria-current={sidebarSection === 'animation'}
				onclick={() => (sidebarSection = 'animation')}
			>
				{@html fa5_solid_play}
				<span class="text-xs">Animation</span>
			</button>

			<button
				class="helion-nav-rail-button"
				aria-current={sidebarSection === 'json'}
				onclick={() => (sidebarSection = 'json')}
			>
				{@html fa5_solid_code}
				<span class="text-xs">JSON</span>
			</button>

			<NavRailSpacer />

			<a
				class="helion-nav-rail-button"
				href="#info"
			>
				{@html fa5_solid_info}
				<span class="text-xs">Info</span>
			</a>

			<a
				class="helion-nav-rail-button"
				href={githubRepositoryLink}
				target="_blank"
			>
				{@html fa5_brands_github}
				<span class="text-xs">GitHub</span>
			</a>
		</NavRail>
		<div class="p-4 overflow-y-auto">
			{@render {
				controls: controlSettings,
				rendering: renderSettings,
				preset: presetSettings,
				json: jsonDump,
				animation: animationSettings
			}[sidebarSection]()}
		</div>
	</div>
</main>

{#snippet controlSettings()}
	<!-- Input Mode -->
	<div class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Input Mode</h3>
		
		<div class="grid grid-cols-3 gap-2 text-sm mb-4">
			{#each [
				{ name: 'Mandelbrot', mode: CameraControllerOptions.REGULAR },
				{ name: 'Julia', mode: CameraControllerOptions.JULIA },
				{ name: 'X', mode: CameraControllerOptions.X },
			] as { name, mode } }
				<button
					onclick={() => mandelbrot.cameraController.options = mode()}
					class="
						w-full p-2! rounded!
						{deepEquals(mandelbrot.cameraController.options, mode()) ? 'helion-filled-button' : 'helion-outlined-button'}
					"
				>
					{name}
				</button>
			{/each}
		</div>

		{#snippet kbd(text: string)}
			<kbd class="
				bg-codeContainer text-onCodeContainer rounded px-3 ml-1 font-mono
			">{text}</kbd>
		{/snippet}

		<div class="text-sm mb-3">
			<div class="flex items-center mb-1">
				Press {@render kbd("1")}, {@render kbd("2")}, {@render kbd("3")}, or {@render kbd("4")} to switch modes
			</div>

			<div class="flex items-center mb-1">
				<div>
					Move {mandelbrot.cameraController.moveOnLocalAxes ? "Local " : ""}{getAxisName(mandelbrot.cameraController.options.horizontalAxis)}
				</div>

				{@render kbd("W")}
				{@render kbd("D")}
			</div>

			<div class="flex items-center mb-1">
				<div>
					Move {mandelbrot.cameraController.moveOnLocalAxes ? "Local " : ""}{getAxisName(mandelbrot.cameraController.options.verticalAxis)}
				</div>
				{@render kbd("A")}
				{@render kbd("S")}
			</div>

			<div class="flex items-center mb-1">
				{mandelbrot.cameraController.options.zoomSpeed ? "Zoom In / Out" : "Rotate"}

				{@render kbd("Shift")}
				{@render kbd("Space")}
			</div>

			<div class="flex items-center mb-1">
				<div>
					Adjust Speed
				</div>
				{@render kbd("]")}
				{@render kbd("[")}
			</div>
		</div>

		<div class="text-sm mb-3 font-mono bg-codeContainer p-2 rounded">
			z = p.z + p.w * i <span class="opacity-30">// Julia</span><br>
			c = p.x + p.y * i <span class="opacity-30">// Mandelbrot</span><br>
			e = p.v + p.u * i <span class="opacity-30">// X</span>
		</div>

		<div class="text-sm mb-3 font-mono bg-codeContainer p-2 rounded">
			z = z ^ e + c
		</div>

		<a class="text-primary-500 underline text-sm" href="#info">Mathematical Background</a>
	</div>

	<!-- Controls -->
	<div class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Controls</h3>
		<div class="grid grid-cols-2 gap-2 mb-2">
			<NumberField 
				label="Speed"
				bind:value={mandelbrot.cameraController.speedScale}
			/>
			<NumberField 
				label="Spring"
				bind:value={mandelbrot.cameraController.springScale}
			/>

			<SelectField
				label="Horizontal Axis"
				bind:value={
					()=>getAxisIndex(mandelbrot.cameraController.options.horizontalAxis),
					(value)=>mandelbrot.cameraController.options.horizontalAxis = Vec6.fromIndex(value)
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
					()=>getAxisIndex(mandelbrot.cameraController.options.verticalAxis),
					(value)=>mandelbrot.cameraController.options.verticalAxis = Vec6.fromIndex(value)
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
				bind:checked={mandelbrot.cameraController.moveOnLocalAxes}
			/>

			<CheckboxField
				label="Use Simplified Rotation"
				className="col-span-2"
				bind:checked={mandelbrot.simplifiedRotationActive}
			/>

			<SelectField
				label="Rotational Plane"
				className="col-span-2"
				value={rotations.find(r => deepEquals(r.rotation, mandelbrot.cameraController.options.rotationPlaneMappings))!.rotation}
				options={
					rotations
					.filter(i => !mandelbrot.simplifiedRotationActive || i.isSimplified)
					.map(r => ({ value: r.rotation, label: r.name }))
				}
				onChange={e => {
					mandelbrot.cameraController.options.rotationPlaneMappings = e.value;
					mandelbrot.cameraController.options.zoomSpeed = e.value.length == 0 ? CameraControllerOptions.REGULAR().zoomSpeed : 0;
				}}
			/>

			{#if !mandelbrot.simplifiedRotationActive}
				<CheckboxField
					label="Rotate on Local Axes"
					className="col-span-2"
					bind:checked={mandelbrot.cameraController.rotateOnLocalPlanes}
				/>
			{/if}
		</div>
	</div>

	<!-- Camera -->
	<div class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Position</h3>
		{@render vector({ vector: mandelbrot.position, readonly: false })}
	</div>

	<div class="mb-6">
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
				<button
					class="helion-filled-button w-20 p-2! rounded!"
					disabled={mandelbrot.cameraController.options.rotationPlaneMappings.length === 0}
					onclick={() => {
						const inRadians = rotateBy * (Math.PI / 180);
						mandelbrot.rotateByPlaneMappings(mandelbrot.cameraController.options.rotationPlaneMappings, inRadians, mandelbrot.cameraController.rotateOnLocalPlanes);
					}}
				>
					Rotate
				</button>
			</div>
			
			<button
				class="helion-filled-button px-5! p-2! rounded! mt-2"
				onclick={() => {
					mandelbrot.orientationMatrix = Mat6.identity();
				}}
			>
				Reset Rotation
			</button>
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
{/snippet}

{#snippet renderSettings()}
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

	<div class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Iteration Settings</h3>
		<div class="grid grid-cols-2 gap-2 mb-2">
			<NumberField 
				label="Iterations Base"
				bind:value={mandelbrot.iterationsBase}
			/>
			<NumberField 
				label="Iterations per Zoom"
				bind:value={mandelbrot.iterationsPerZoom}
			/>
			<NumberField 
				label="Iterations Min"
				bind:value={mandelbrot.iterationsMin}
			/>
			<NumberField 
				label="Iterations Max"
				bind:value={mandelbrot.iterationsMax}
			/>
		</div>

		<div class="text-sm opacity-80 mb-2">
			Computed Max Iterations: {mandelbrot.maxIterationsComputed}
		</div>

		<div>
			<NumberField 
				label="Bailout Radius"
				bind:value={mandelbrot.bailoutRadius}
			/>
		</div>
	</div>

	<div class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Smoothing Settings <small class="text-sm opacity-80">(Experimental)</small></h3>

		<p class="text-sm opacity-80 mt-2">
			These settings are experimental and may change in future versions.
		</p>

		<CheckboxField 
			label="Enable Smoothing"
			className="mb-2"
			bind:checked={mandelbrot.smoothingEnabled}
		/>
		{#if mandelbrot.smoothingEnabled}
			<NumberField 
				label="Smoothing Radius"
				className="mb-2"
				bind:value={mandelbrot.smoothingRadius}
			/>
		{/if}
	</div>
{/snippet}

{#snippet jsonDump()}
	{@const jsonString = prettyPrintJson(Preset.fromState(mandelbrot).toJSON())}
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
			class="w-full p-3 font-mono whitespace-pre resize-none helion-box-field"
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

{#snippet presetSettings()}
	{#snippet presetButton({preset}: {preset: PresetInfo})}
		{@const isApplied = preset.preset.isApplied(mandelbrot) ||
			mandelbrot.behaviors.find(b => b instanceof MandelbrotLerp)?.end === preset.preset
		}
		<button
			class="w-full p-2! rounded! mb-2 {isApplied ? 'helion-filled-button' : 'helion-outlined-button'}"
			onclick={() => {
				mandelbrot.behaviors = mandelbrot.behaviors.filter(b => !(b instanceof MandelbrotLerp));
				mandelbrot.behaviors.push(new MandelbrotLerp({
					start: Preset.fromState(mandelbrot),
					end: preset.preset,
					duration: loadPresetLerpDuration,
					easing: loadPresetLerpEase,
				}))
				mandelbrot.cameraController.clearVelocities();
			}}
		>
			{preset.name}
		</button>
	{/snippet}

	<div class="grid grid-cols-3 gap-2 mb-6">
		{#each basicPresets as preset}
			{@render presetButton({ preset })}
		{/each}
	</div>

	<div class="grid grid-cols-2 gap-2 mb-6">
		<NumberField 
			label="Transition Seconds"
			bind:value={
				() => loadPresetLerpDuration,
				(v) => loadPresetLerpDuration = Math.max(0, v)
			}
			className="w-full"
		/>

		<SelectField
			label="Easing Function"
			bind:value={loadPresetLerpEase}
			options={[
				{ value: linear, label: "Linear" },
				{ value: easeInOutBezier, label: "Ease In Out" },
			]}
		/>
	</div>


	{#each [
		{ name: "Mandelbrot", presets: mandelbrotPresets },
		{ name: "Julia", presets: juliaPresets },
		{ name: "Hyperbolic Julia", presets: hyperbolicJuliaPresets },
		{ name: "Reduced Bailout Radius", presets: reducedBailoutRadiusPresets },
		{ name: "Full Rotation", presets: specialPresets },
	] as presetSection}
		<h3 class="text-lg font-semibold mb-2">{presetSection.name}</h3>
		{#each presetSection.presets as preset}
			{@render presetButton({ preset })}
		{/each}
		<div class="mb-6"></div>
	{/each}
{/snippet}

{#snippet animationSettings()}
	<div class="mb-6">
		<h3 class="text-lg font-semibold mb-2">Animation</h3>
			<div class="mb-2">
				<label class="block text-sm font-medium mb-1" for="animation-offset-x">Animation Offset</label>
				<div id="animation-offset-x">{@render vector({ vector: mandelbrot.animationOffset, readonly: false })}</div>
			</div>
			<div class="mb-2">
				<RangeSlider
					label="Animation Progress"
					bind:value={mandelbrot.animationProgress}
					min={-1}
					max={1}
					step={0.001}
				/>
				<div class="text-xs text-center mt-1">{(mandelbrot.animationProgress * 100).toFixed(1)}%</div>
			</div>
	</div>
{/snippet}

