<script lang="ts">
	import { t } from "$lib/i18n/locale.svelte";
	import { Button, Modal, TestId } from "@gitbutler/ui-svelte";

	interface Props {
		projectTitle?: string;
		isDeleting?: boolean;
		noModal?: boolean;
		outlineStyle?: boolean;
		onDeleteClicked: () => Promise<void>;
	}

	const {
		projectTitle = "#",
		isDeleting,
		noModal,
		outlineStyle,
		onDeleteClicked,
	}: Props = $props();

	export function show() {
		modal?.show();
	}
	export function close() {
		modal?.close();
	}

	function handleClick() {
		if (noModal) {
			onDeleteClicked();
		} else {
			modal?.show();
		}
	}

	let modal = $state<Modal>();
</script>

<Button
	testId={TestId.ProjectDeleteButton}
	style="danger"
	kind={outlineStyle ? "outline" : "solid"}
	icon="bin"
	reversedDirection
	onclick={handleClick}
>
	{t("project.removeAction")}
</Button>

<Modal
	bind:this={modal}
	width="small"
	onSubmit={(close) => {
		onDeleteClicked().then(close);
	}}
>
	<div class="remove-project-description">
		<p class="text-14 text-body">
			{t("project.removeAskBefore")}
			<span class="text-bold">{projectTitle}</span>
			{t("project.removeAskAfter")}
		</p>

		<p class="text-12 text-body details-text">
			{t("project.removeDetails")}
		</p>
	</div>

	{#snippet controls()}
		<Button
			testId={TestId.ProjectDeleteModalConfirm}
			style="danger"
			kind="outline"
			reversedDirection
			loading={isDeleting}
			icon="bin"
			type="submit"
		>
			{t("project.removeShort")}
		</Button>
		<Button style="pop" onclick={close}>{t("general.cancel")}</Button>
	{/snippet}
</Modal>

<style lang="postcss">
	.remove-project-description {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.details-text {
		opacity: 0.5;
	}
</style>
