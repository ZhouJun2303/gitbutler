<script lang="ts">
	import CloudForm from "$components/projectSettings/CloudForm.svelte";
	import GeneralSettings from "$components/projectSettings/GeneralSettings.svelte";
	import GitForm from "$components/projectSettings/GitForm.svelte";
	import PreferencesForm from "$components/projectSettings/PreferencesForm.svelte";
	import SettingsModalLayout from "$components/settings/SettingsModalLayout.svelte";
	import { t } from "$lib/i18n/locale.svelte";
	import { projectSettingsPages } from "$lib/settings/projectSettingsPages";
	import type { MessageKey } from "$lib/i18n/messages";
	import type { ProjectSettingsModalState, ProjectSettingsPageId } from "$lib/state/uiState.svelte";

	type Props = {
		data: ProjectSettingsModalState;
	};

	const { data }: Props = $props();

	const pageLabelKey = {
		project: "settings.page.project",
		git: "settings.page.git",
		ai: "settings.page.projectAi",
		experimental: "settings.page.experimental",
	} as const satisfies Record<(typeof projectSettingsPages)[number]["id"], MessageKey>;

	const pages = $derived(
		projectSettingsPages.map((page) => ({
			...page,
			label: t(pageLabelKey[page.id]),
		})),
	);

	let currentSelectedId = $derived(data.selectedId || pages.at(0)?.id);

	function selectPage(pageId: ProjectSettingsPageId) {
		currentSelectedId = pageId;
	}
</script>

<SettingsModalLayout
	title={t("settings.projectTitle")}
	{pages}
	selectedId={currentSelectedId}
	onSelectPage={selectPage}
>
	{#snippet content({ currentPage })}
		{#if currentPage}
			{#if currentPage.id === "project"}
				<GeneralSettings projectId={data.projectId} />
			{:else if currentPage.id === "git"}
				<GitForm projectId={data.projectId} />
			{:else if currentPage.id === "ai"}
				<CloudForm projectId={data.projectId} />
			{:else if currentPage.id === "experimental"}
				<PreferencesForm projectId={data.projectId} />
			{:else}
				{t("settings.notFound").replace("{page}", currentPage.id)}
			{/if}
		{:else}
			{t("settings.notFound").replace("{page}", String(currentSelectedId ?? ""))}
		{/if}
	{/snippet}
</SettingsModalLayout>
