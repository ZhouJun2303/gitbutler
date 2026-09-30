<script lang="ts">
	import GoToSettingsButton from "$components/settings/GoToSettingsButton.svelte";
	import { t } from "$lib/i18n/locale.svelte";
	import { CardGroup, Icon } from "@gitbutler/ui-svelte";

	interface Props {
		title?: string;
		message?: string;
	}

	const { title: titleLabel, message }: Props = $props();
</script>

<CardGroup>
	<CardGroup.Item>
		{#snippet iconSide()}
			<Icon name="warning" color="var(--fill-warn-bg)" />
		{/snippet}
		{#snippet title()}
			{titleLabel ?? t("auth.required")}
		{/snippet}
		{#snippet caption()}
			{message ?? t("auth.message")}
		{/snippet}
		{#snippet actions()}
			<GoToSettingsButton />
		{/snippet}
	</CardGroup.Item>
</CardGroup>
