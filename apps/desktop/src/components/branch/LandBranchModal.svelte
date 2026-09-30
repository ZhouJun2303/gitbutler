<script lang="ts">
	import { showError } from "$lib/error/showError";
	import { t } from "$lib/i18n/locale.svelte";
	import { STACK_SERVICE } from "$lib/stacks/stackService.svelte";
	import { inject } from "@gitbutler/core/context";
	import { AsyncButton, Button, Modal, chipToasts } from "@gitbutler/ui-svelte";

	type Props = {
		projectId: string;
		/** Remote-qualified name of the target branch (e.g. origin/master), shown for context. */
		targetBranchName: string | undefined;
	};

	const { projectId, targetBranchName }: Props = $props();
	const stackService = inject(STACK_SERVICE);

	let modalEl = $state<ReturnType<typeof Modal>>();
	let branchName = $state<string>();
	let wholeStack = $state(false);
	let lowerBranches = $state<string[]>([]);

	const targetLabel = $derived(targetBranchName ?? t("land.targetFallback"));
	const landedLabel = $derived(
		wholeStack
			? t("land.andBelow", { branch: branchName ?? "" })
			: t("land.quoted", { branch: branchName ?? "" }),
	);
	const lowerListLabel = $derived(lowerBranches.length > 0 ? ` (${lowerBranches.join(", ")})` : "");

	/**
	 * Passing `stack` lands the whole stack. The intent is carried by the argument itself, not by
	 * `lowerBranches` being non-empty — segments below can be unnamed (deleted branch refs) and
	 * still land.
	 */
	export function show(branch: string, stack?: { lowerBranches: string[] }) {
		branchName = branch;
		wholeStack = stack !== undefined;
		lowerBranches = stack?.lowerBranches ?? [];
		modalEl?.show();
	}

	async function land(): Promise<boolean> {
		if (!branchName) return false;
		try {
			const result = await stackService.landBranch({
				projectId,
				branch: branchName,
				noFf: false,
				wholeStack,
			});
			if (result.landed.type === "alreadyIntegrated") {
				chipToasts.success(t("land.already", { name: landedLabel, target: targetLabel }));
			} else {
				chipToasts.success(t("land.done", { name: landedLabel, target: targetLabel }));
			}
			if (result.reconcileSkipped) {
				chipToasts.warning(t("land.reconcile"));
			}
			return true;
		} catch (error) {
			showError(t("land.failed"), error);
			return false;
		}
	}
</script>

<Modal
	bind:this={modalEl}
	width="small"
	title={wholeStack ? t("land.stack") : t("land.branchTitle")}
>
	<p>
		{#if wholeStack}
			{t("land.wholeBefore")}
			<strong>{branchName}</strong>
			{t("land.wholeAfter", { extra: lowerListLabel, target: targetLabel })}
		{:else}
			{t("land.wholeBefore")}
			<strong>{branchName}</strong>
			{t("land.oneAfter", { target: targetLabel })}
		{/if}
	</p>
	{#snippet controls(close)}
		<Button kind="outline" type="reset" onclick={close}>{t("general.cancel")}</Button>
		<AsyncButton
			style="pop"
			action={async () => {
				if (await land()) close();
			}}>{t("branchMenu.land")}</AsyncButton
		>
	{/snippet}
</Modal>
