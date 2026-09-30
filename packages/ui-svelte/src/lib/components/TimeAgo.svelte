<script lang="ts">
	import Tooltip from "$lib/components/Tooltip.svelte";
	import { getUiLanguage } from "$lib/i18n/locale.svelte";
	import { createTimeAgoStore, getAbsoluteTimestamp } from "$lib/utils/timeAgo";

	interface Props {
		date?: Date;
		addSuffix?: boolean;
		showTooltip?: boolean;
		capitalize?: boolean;
	}

	const { date, addSuffix, showTooltip = true, capitalize = false }: Props = $props();
	const language = $derived(getUiLanguage());
	const store = $derived.by(() => {
		void language;
		return createTimeAgoStore(date, addSuffix);
	});
	const absoluteTime = $derived.by(() => {
		void language;
		return date ? getAbsoluteTimestamp(date) : "";
	});

	function formatText(value: string | undefined): string {
		if (!value) return "";
		if (!capitalize) return value;
		return `${value[0].toUpperCase()}${value.slice(1)}`;
	}
</script>

{#if store}
	{#if showTooltip && date}
		<Tooltip text={absoluteTime}>
			<span>{formatText($store)}</span>
		</Tooltip>
	{:else}
		{formatText($store)}
	{/if}
{/if}
