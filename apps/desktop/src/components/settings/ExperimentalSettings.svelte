<script lang="ts">
	import { fModeEnabled } from "$lib/config/uiFeatureFlags";
	import { t } from "$lib/i18n/locale.svelte";
	import { SETTINGS_SERVICE } from "$lib/settings/appSettings";
	import { USER_SERVICE } from "$lib/user/userService.svelte";
	import { inject } from "@gitbutler/core/context";
	import { CardGroup, Toggle } from "@gitbutler/ui-svelte";

	const settingsService = inject(SETTINGS_SERVICE);
	const settingsStore = settingsService.appSettings;

	const userService = inject(USER_SERVICE);
</script>

<p class="text-12 text-body experimental-settings__text">
	{t("experimental.intro")}
	<br />
	{t("experimental.useAtRisk")}
</p>

<CardGroup>
	<CardGroup.Item labelFor="f-mode">
		{#snippet title()}
			{t("experimental.fMode")}
		{/snippet}
		{#snippet caption()}
			{t("experimental.fModeCaption")}
		{/snippet}
		{#snippet actions()}
			<Toggle
				id="f-mode"
				checked={$fModeEnabled}
				onclick={() => fModeEnabled.set(!$fModeEnabled)}
			/>
		{/snippet}
	</CardGroup.Item>

	{#if userService.user?.role === "admin"}
		<CardGroup.Item labelFor="single-branch">
			{#snippet title()}
				{t("experimental.singleBranch")}
			{/snippet}
			{#snippet caption()}
				{t("experimental.singleBranchCaption")}
			{/snippet}
			{#snippet actions()}
				<Toggle
					id="single-branch"
					checked={$settingsStore?.featureFlags.singleBranch}
					onclick={() =>
						settingsService.updateFeatureFlags({
							singleBranch: !$settingsStore?.featureFlags.singleBranch,
						})}
				/>
			{/snippet}
		</CardGroup.Item>
	{/if}

	<CardGroup.Item labelFor="worktree-manipulation">
		{#snippet title()}
			{t("experimental.worktree")}
		{/snippet}
		{#snippet caption()}
			{t("experimental.worktreeCaption")}
		{/snippet}
		{#snippet actions()}
			<Toggle
				id="worktree-manipulation"
				checked={$settingsStore?.featureFlags.worktreeManipulation}
				onclick={() =>
					settingsService.updateFeatureFlags({
						worktreeManipulation: !$settingsStore?.featureFlags.worktreeManipulation,
					})}
			/>
		{/snippet}
	</CardGroup.Item>
</CardGroup>

<style>
	.experimental-settings__text {
		margin-bottom: 10px;
		color: var(--text-2);
	}
</style>
