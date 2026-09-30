<script lang="ts">
	import AiPromptSelect from "$components/projectSettings/AIPromptSelect.svelte";
	import AccessTokenSignIn from "$components/shared/AccessTokenSignIn.svelte";
	import SettingsSection from "$components/shared/SettingsSection.svelte";
	import { projectAiExperimentalFeaturesEnabled, projectAiGenEnabled } from "$lib/config/config";
	import { t } from "$lib/i18n/locale.svelte";
	import { useSettingsModal } from "$lib/settings/settingsModal.svelte";
	import { USER_SERVICE } from "$lib/user/userService.svelte";
	import { inject } from "@gitbutler/core/context";
	import { Button, CardGroup, Spacer, Toggle } from "@gitbutler/ui-svelte";

	const { projectId }: { projectId: string } = $props();

	const userService = inject(USER_SERVICE);
	const { openGeneralSettings } = useSettingsModal();

	const aiGenEnabled = $derived(projectAiGenEnabled(projectId));
	const experimentalAiGenEnabled = $derived(projectAiExperimentalFeaturesEnabled(projectId));
</script>

<SettingsSection>
	{#snippet description()}
		{t("projectAi.about")}
	{/snippet}

	<Spacer />

	{#if !userService.user}
		<AccessTokenSignIn />
		<Spacer />
	{/if}

	<CardGroup>
		<CardGroup.Item labelFor="aiGenEnabled">
			{#snippet title()}
				{t("projectAi.enable")}
			{/snippet}
			{#snippet caption()}
				{t("projectAi.enableCaption")}
			{/snippet}
			{#snippet actions()}
				<Toggle
					id="aiGenEnabled"
					checked={$aiGenEnabled}
					onclick={() => {
						$aiGenEnabled = !$aiGenEnabled;
					}}
				/>
			{/snippet}
		</CardGroup.Item>
	</CardGroup>

	{#if $aiGenEnabled}
		<CardGroup>
			<CardGroup.Item labelFor="aiExperimental">
				{#snippet title()}
					{t("projectAi.experimental")}
				{/snippet}
				{#snippet caption()}
					{t("projectAi.experimentalCaption")}
				{/snippet}
				{#snippet actions()}
					<Toggle
						id="aiExperimental"
						checked={$experimentalAiGenEnabled}
						onclick={() => {
							$experimentalAiGenEnabled = !$experimentalAiGenEnabled;
						}}
					/>
				{/snippet}
			</CardGroup.Item>
		</CardGroup>
	{/if}

	<CardGroup>
		<CardGroup.Item>
			{#snippet title()}
				{t("projectAi.custom")}
			{/snippet}

			<AiPromptSelect {projectId} promptUse="commits" />
			<AiPromptSelect {projectId} promptUse="branches" />

			<Spacer margin={8} />

			<p class="text-12 text-body">
				{t("projectAi.customHelp")}
			</p>
			<Button kind="outline" icon="edit" onclick={() => openGeneralSettings("ai")}
				>{t("projectAi.customize")}</Button
			>
		</CardGroup.Item>
	</CardGroup>
</SettingsSection>
