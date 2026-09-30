<script lang="ts">
	import ProjectSetup from "$components/onboarding/ProjectSetup.svelte";
	import FullviewLoading from "$components/shared/FullviewLoading.svelte";
	import ProblemLoadingRepo from "$components/views/ProblemLoadingRepo.svelte";
	import { BASE_BRANCH_SERVICE } from "$lib/baseBranch/baseBranchService.svelte";
	import { t } from "$lib/i18n/locale.svelte";
	import { inject } from "@gitbutler/core/context";

	const { projectId }: { projectId: string } = $props();
	const baseBranchService = inject(BASE_BRANCH_SERVICE);
	const remoteBranchesQuery = $derived(baseBranchService.remoteBranches(projectId));
</script>

{#if remoteBranchesQuery.result.isLoading}
	<!--TODO: Add project id -->
	<FullviewLoading />
{:else if remoteBranchesQuery.result.isSuccess}
	{@const remoteBranches = remoteBranchesQuery.response}
	{#if !remoteBranches || remoteBranches.length === 0}
		<ProblemLoadingRepo {projectId} error={t("error.noBase")} />
	{:else}
		<ProjectSetup {projectId} {remoteBranches} />
	{/if}
{:else if remoteBranchesQuery.result.isError}
	<ProblemLoadingRepo {projectId} error={t("error.noBase")} />
{/if}
