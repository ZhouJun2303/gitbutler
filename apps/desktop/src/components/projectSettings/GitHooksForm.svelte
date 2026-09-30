<script lang="ts">
	import ReduxResult from "$components/shared/ReduxResult.svelte";
	import SettingsSection from "$components/shared/SettingsSection.svelte";
	import { projectRunCommitHooks } from "$lib/config/config";
	import { t } from "$lib/i18n/locale.svelte";
	import { PROJECTS_SERVICE } from "$lib/project/projectsService";
	import { inject } from "@gitbutler/core/context";
	import { CardGroup, Toggle } from "@gitbutler/ui-svelte";
	import type { Project } from "$lib/project/project";

	const { projectId }: { projectId: string } = $props();
	const runCommitHooks = $derived(projectRunCommitHooks(projectId));
	const projectsService = inject(PROJECTS_SERVICE);
	const projectQuery = $derived(projectsService.getProject(projectId));

	async function onHuskyHooksEnabledClick(project: Project, value: boolean) {
		await projectsService.updateProject({ ...project, husky_hooks_enabled: value });
	}
</script>

<SettingsSection>
	<CardGroup>
		<CardGroup.Item labelFor="runHooks">
			{#snippet title()}
				{t("hooks.runTitle")}
			{/snippet}
			{#snippet caption()}
				{t("hooks.runCaption")}
			{/snippet}
			{#snippet actions()}
				<Toggle id="runHooks" bind:checked={$runCommitHooks} />
			{/snippet}
		</CardGroup.Item>
	</CardGroup>

	<ReduxResult {projectId} result={projectQuery.result}>
		{#snippet children(project)}
			<CardGroup>
				<CardGroup.Item labelFor="huskyHooks">
					{#snippet title()}
						{t("hooks.huskyTitle")}
					{/snippet}
					{#snippet caption()}
						⚠️ {t("hooks.huskyWarn")}
						<br />
						{t("hooks.huskyCaption")}
					{/snippet}
					{#snippet actions()}
						<Toggle
							id="huskyHooks"
							checked={project.husky_hooks_enabled}
							onchange={(checked) => onHuskyHooksEnabledClick(project, checked)}
						/>
					{/snippet}
				</CardGroup.Item>
			</CardGroup>
		{/snippet}
	</ReduxResult>
</SettingsSection>
