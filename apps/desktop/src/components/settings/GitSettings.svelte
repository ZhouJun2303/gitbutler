<script lang="ts">
	import { GIT_CONFIG_SERVICE } from "$lib/config/gitConfigService";
	import { t } from "$lib/i18n/locale.svelte";
	import { SETTINGS_SERVICE } from "$lib/settings/appSettings";
	import { inject } from "@gitbutler/core/context";
	import { CardGroup, Link, Select, SelectItem, Toggle } from "@gitbutler/ui-svelte";
	import { onMount } from "svelte";

	const gitConfig = inject(GIT_CONFIG_SERVICE);
	const settingsService = inject(SETTINGS_SERVICE);
	const settings = settingsService.appSettings;

	let annotateCommits = $state(true);
	let fetchFrequency = $state<number>(-1);

	const fetchFrequencyOptions = $derived([
		{ label: t("git.fetch.1"), value: "1", minutes: 1 },
		{ label: t("git.fetch.5"), value: "5", minutes: 5 },
		{ label: t("git.fetch.10"), value: "10", minutes: 10 },
		{ label: t("git.fetch.15"), value: "15", minutes: 15 },
		{ label: t("git.fetch.none"), value: "none", minutes: -1 },
	]);

	function toggleCommitterSigning() {
		annotateCommits = !annotateCommits;
		gitConfig.set("gitbutler.gitbutlerCommitter", annotateCommits ? "1" : "0");
	}

	async function updateFetchFrequency(value: string) {
		const option = fetchFrequencyOptions.find((opt) => opt.value === value);
		if (option) {
			fetchFrequency = option.minutes;
			await settingsService.updateFetch({ autoFetchIntervalMinutes: option.minutes });
		}
	}

	const selectedValue = $derived(
		fetchFrequencyOptions.find((opt) => opt.minutes === fetchFrequency)?.value ?? "none",
	);

	onMount(async () => {
		annotateCommits = (await gitConfig.get("gitbutler.gitbutlerCommitter")) === "1";
	});

	$effect(() => {
		if ($settings?.fetch) {
			fetchFrequency = $settings.fetch.autoFetchIntervalMinutes;
		}
	});
</script>

<CardGroup.Item standalone labelFor="committerSigning">
	{#snippet title()}
		{t("git.committerTitle")}
	{/snippet}
	{#snippet caption()}
		{t("git.committerCaption")}
		<Link
			href="https://github.com/gitbutlerapp/gitbutler-docs/blob/d81a23779302c55f8b20c75bf7842082815b4702/content/docs/features/virtual-branches/committer-mark.mdx"
		>
			{t("git.learnMore")}
		</Link>
	{/snippet}
	{#snippet actions()}
		<Toggle id="committerSigning" checked={annotateCommits} onclick={toggleCommitterSigning} />
	{/snippet}
</CardGroup.Item>

<CardGroup.Item standalone labelFor="fetchFrequency" alignment="center">
	{#snippet title()}
		{t("git.fetchFrequency")}
	{/snippet}
	{#snippet actions()}
		<Select
			id="fetchFrequency"
			options={fetchFrequencyOptions}
			value={selectedValue}
			onselect={updateFetchFrequency}
		>
			{#snippet itemSnippet({ item, highlighted })}
				<SelectItem selected={item.value === selectedValue} {highlighted}>
					{item.label}
				</SelectItem>
			{/snippet}
		</Select>
	{/snippet}
</CardGroup.Item>
