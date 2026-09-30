<script lang="ts">
	import CommitFailedFileEntry from "$components/commit/CommitFailedFileEntry.svelte";
	import AppScrollableContainer from "$components/shared/AppScrollableContainer.svelte";
	import { t } from "$lib/i18n/locale.svelte";
	import { REJECTTION_REASONS } from "$lib/stacks/stackService.svelte";
	import { type RejectionReason } from "$lib/state/uiState.svelte";
	import { Icon, ModalHeader, TestId, Tooltip } from "@gitbutler/ui-svelte";
	import { untrack } from "svelte";
	import type { MessageKey } from "$lib/i18n/messages";
	import type { CommitFailedModalState } from "$lib/state/uiState.svelte";

	type Props = {
		data: CommitFailedModalState;
		oncloseclick?: () => void;
	};

	const { data, oncloseclick }: Props = $props();

	function rejectionKey(reason: RejectionReason): MessageKey {
		switch (reason) {
			case "cherryPickMergeConflict":
				return "commitFail.cherryPick";
			case "noEffectiveChanges":
				return "commitFail.noEffective";
			case "workspaceMergeConflict":
				return "commitFail.workspace";
			case "workspaceMergeConflictOfUnrelatedFile":
				return "commitFail.unrelated";
			case "worktreeFileMissingForObjectConversion":
				return "commitFail.missingFile";
			case "fileToLargeOrBinary":
				return "commitFail.tooLarge";
			case "pathNotFoundInBaseTree":
				return "commitFail.pathMissing";
			case "unsupportedDirectoryEntry":
				return "commitFail.badDir";
			case "unsupportedTreeEntry":
				return "commitFail.badTree";
			case "missingDiffSpecAssociation":
				return "commitFail.missingSpec";
		}
	}

	type ReasonGroup = {
		reason: RejectionReason;
		paths: string[];
	};

	function groupByReason(data: CommitFailedModalState): ReasonGroup[] {
		const grouped: Partial<Record<RejectionReason, string[]>> = {};

		for (const [path, reason] of Object.entries(data.pathsToRejectedChanges)) {
			if (!grouped[reason]) {
				grouped[reason] = [];
			}
			grouped[reason].push(path);
		}

		const result: ReasonGroup[] = [];
		for (const reason of REJECTTION_REASONS) {
			const paths = grouped[reason];
			if (!paths) continue;
			result.push({ reason, paths });
		}

		return result;
	}

	const groupedData = groupByReason(untrack(() => data));

	let isScrollTopVisible = $state(true);
</script>

<div class="commit-failed__wrapper">
	<ModalHeader
		sticky={!isScrollTopVisible}
		type={data.newCommitId ? "warning" : "danger"}
		closeButton
		{oncloseclick}
		closeButtonTestId={TestId.GlobalModalActionButton}
		>{data.newCommitId ? t("commitFail.partialTitle") : t("commitFail.failedTitle")}</ModalHeader
	>
	<AppScrollableContainer
		onscrollTop={(visible) => {
			isScrollTopVisible = visible;
		}}
	>
		<div class="commit-failed__content">
			<div class="text-13 commit-failed__description">
				{#if data.newCommitId}
					{t("commitFail.createdBefore")}
					<i class="commit-failed__text-icon"><Icon name="commit" /></i>
					<Tooltip text={data.commitTitle ? data.commitTitle : t("commitFail.noTitle")}
						><span class="h-dotted-underline text-semibold">{data.newCommitId.substring(0, 7)}</span
						></Tooltip
					>
					{t("commitFail.createdAfter")}
				{:else}
					{t("commitFail.notCreated")}
				{/if}
			</div>

			<div class="commit-failed__reasons">
				{#each groupedData as { reason, paths } (reason)}
					<hr class="commit-failed__reasons-divider" />

					<p class="text-13">
						{t("commitFail.cause")} <span class="text-bold">{t(rejectionKey(reason))}</span>
					</p>

					<div class="commit-failed__reason-file-list">
						{#each paths as path (path)}
							<CommitFailedFileEntry {path} {reason} projectId={data.projectId} />
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</AppScrollableContainer>
</div>

<style lang="postcss">
	.commit-failed__wrapper {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.commit-failed__content {
		display: flex;
		flex-direction: column;
		padding: 0 16px 16px 16px;
		gap: 16px;
	}

	.commit-failed__text-icon {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		transform: translateY(4px);
		color: var(--text-2);
	}

	/* Groups */
	.commit-failed__reasons {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.commit-failed__reasons-divider {
		margin: 0 -16px;
		border: 0;
		border-top: 1px solid var(--border-2);
	}

	.commit-failed__reason-file-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
