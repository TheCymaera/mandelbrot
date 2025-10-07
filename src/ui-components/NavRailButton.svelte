<script lang="ts">
	import { buttonVariants, buttonBehaviour } from "./buttonVariants.js";

	interface Props {
		color?: string,
		selected?: boolean,
		disabled?: boolean,
		onPress: () => void,
		label: string,
		displayLabel?: boolean,
		children?: import('svelte').Snippet
	}

	let {
		color = "",
		selected = false,
		disabled = false,
		onPress,
		label,
		displayLabel = true,
		children
	}: Props = $props();
</script>
<button 
	class="{buttonVariants.inkWell} flex flex-col items-center justify-center rounded-full"
	class:text-primary-500={selected} 
	use:buttonBehaviour
	onclick={onPress} 
	style:color={color} 
	disabled={disabled}
	title={label}
>
	{@render children?.()}
	{#if displayLabel}
		<span class="text-xs mt-1">{label}</span>
	{/if}
</button>
<style>
button {
	width: var(--helion-NavRail-width);
	height: var(--helion-NavRail-width);
}
</style>