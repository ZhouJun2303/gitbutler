<script lang="ts">
	import BranchIntegrationModal from "$components/branch/BranchIntegrationModal.svelte";
	import { t } from "$lib/i18n/locale.svelte";
	import { Button, Modal, TestId } from "@gitbutler/ui-svelte";

	type Props = {
		projectId: string;
		branchRef: string;
		branchName: string;
	};

	const { projectId, branchRef, branchName }: Props = $props();

	let integrationModal = $state<Modal>();

	function kickOffIntegration() {
		integrationModal?.show();
	}
</script>

<BranchIntegrationModal bind:modalRef={integrationModal} {projectId} {branchRef} {branchName} />

<div class="upstream-integration-actions">
	<p class="text-12 text-body clr-text-2">
		{t("integrate.diverged")}
		<br />
		{t("upstream.updateLocal")}
	</p>
	<Button
		style="warning"
		testId={TestId.UpstreamCommitsIntegrateButton}
		onclick={kickOffIntegration}
	>
		{t("upstream.updateButton")}
	</Button>
</div>

<style lang="postcss">
	.upstream-integration-actions {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
</style>
