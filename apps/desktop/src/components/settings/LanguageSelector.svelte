<script lang="ts">
	import { getLanguage, setAppLanguage, t } from "$lib/i18n/locale.svelte";
	import { isAppLanguage } from "$lib/i18n/messages";
	import { UI_STATE } from "$lib/state/uiState.svelte";
	import { inject } from "@gitbutler/core/context";
	import { CardGroup, Select, SelectItem } from "@gitbutler/ui-svelte";
	import type { AppLanguage } from "$lib/i18n/messages";

	const uiState = inject(UI_STATE);
	const language = uiState.global.language;

	const options: Array<{ label: string; value: AppLanguage }> = [
		{ label: "English", value: "en" },
		{ label: "中文", value: "zh" },
	];

	const selected = $derived(isAppLanguage(language.current) ? language.current : getLanguage());

	function choose(next: string) {
		if (!isAppLanguage(next)) return;
		setAppLanguage(next);
		language.set(next);
	}
</script>

<CardGroup.Item alignment="center" standalone>
	{#snippet title()}
		{t("language.label")}
	{/snippet}
	{#snippet caption()}
		{t("language.caption")}
	{/snippet}
	{#snippet actions()}
		<Select maxWidth={140} value={selected} {options} onselect={choose}>
			{#snippet itemSnippet({ item, highlighted })}
				<SelectItem selected={item.value === selected} {highlighted}>
					{item.label}
				</SelectItem>
			{/snippet}
		</Select>
	{/snippet}
</CardGroup.Item>
