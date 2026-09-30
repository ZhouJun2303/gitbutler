<script lang="ts">
	import {
		autoSelectBranchNameFeature,
		autoSelectBranchCreationFeature,
		stagingBehaviorFeature,
		type StagingBehavior,
	} from "$lib/config/uiFeatureFlags";
	import { t } from "$lib/i18n/locale.svelte";
	import { persisted } from "@gitbutler/shared/persisted";
	import { CardGroup, RadioButton, Toggle, Spacer } from "@gitbutler/ui-svelte";

	const addToLeftmost = persisted<boolean>(false, "branch-placement-leftmost");
	function onStagingBehaviorFormChange(form: HTMLFormElement) {
		const formData = new FormData(form);
		const selectedStagingBehavior = formData.get("stagingBehaviorType") as StagingBehavior | null;
		if (!selectedStagingBehavior) return;
		stagingBehaviorFeature.set(selectedStagingBehavior);
	}
</script>

<CardGroup.Item standalone labelFor="add-leftmost">
	{#snippet title()}
		{t("lanes.leftTitle")}
	{/snippet}
	{#snippet caption()}
		{t("lanes.leftCaption")}
	{/snippet}
	{#snippet actions()}
		<Toggle
			id="add-leftmost"
			checked={$addToLeftmost}
			onclick={() => ($addToLeftmost = !$addToLeftmost)}
		/>
	{/snippet}
</CardGroup.Item>

<CardGroup>
	<CardGroup.Item labelFor="auto-select-creation">
		{#snippet title()}
			{t("lanes.autoCreateTitle")}
		{/snippet}
		{#snippet caption()}
			{t("lanes.autoCreateCaption")}
		{/snippet}
		{#snippet actions()}
			<Toggle
				id="auto-select-creation"
				checked={$autoSelectBranchCreationFeature}
				onclick={() => ($autoSelectBranchCreationFeature = !$autoSelectBranchCreationFeature)}
			/>
		{/snippet}
	</CardGroup.Item>
	<CardGroup.Item labelFor="auto-select-rename">
		{#snippet title()}
			{t("lanes.autoRenameTitle")}
		{/snippet}
		{#snippet caption()}
			{t("lanes.autoRenameCaption")}
		{/snippet}
		{#snippet actions()}
			<Toggle
				id="auto-select-rename"
				checked={$autoSelectBranchNameFeature}
				onclick={() => ($autoSelectBranchNameFeature = !$autoSelectBranchNameFeature)}
			/>
		{/snippet}
	</CardGroup.Item>
</CardGroup>

<Spacer />

<div class="stack-v gap-8">
	<h2 class="text-15 text-bold">{t("lanes.stagingTitle")}</h2>
	<p class="text-12 text-body clr-text-2">
		{t("lanes.stagingCaption")}
	</p>
</div>

<CardGroup>
	<form class="stack-v" onchange={(e) => onStagingBehaviorFormChange(e.currentTarget)}>
		<CardGroup.Item labelFor="stage-all">
			{#snippet title()}
				{t("lanes.stageAllTitle")}
			{/snippet}
			{#snippet caption()}
				{t("lanes.stageAllCaption")}
			{/snippet}
			{#snippet actions()}
				<RadioButton
					name="stagingBehaviorType"
					value="all"
					id="stage-all"
					checked={$stagingBehaviorFeature === "all"}
				/>
			{/snippet}
		</CardGroup.Item>

		<CardGroup.Item labelFor="stage-selection">
			{#snippet title()}
				{t("lanes.stagePickedTitle")}
			{/snippet}
			{#snippet caption()}
				{t("lanes.stagePickedCaption")}
			{/snippet}
			{#snippet actions()}
				<RadioButton
					name="stagingBehaviorType"
					value="selection"
					id="stage-selection"
					checked={$stagingBehaviorFeature === "selection"}
				/>
			{/snippet}
		</CardGroup.Item>

		<CardGroup.Item labelFor="stage-none">
			{#snippet title()}
				{t("lanes.stageNoneTitle")}
			{/snippet}
			{#snippet caption()}
				{t("lanes.stageNoneCaption")}
			{/snippet}
			{#snippet actions()}
				<RadioButton
					name="stagingBehaviorType"
					value="none"
					id="stage-none"
					checked={$stagingBehaviorFeature === "none"}
				/>
			{/snippet}
		</CardGroup.Item>
	</form>
</CardGroup>
