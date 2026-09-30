<script lang="ts">
	import { t } from "$lib/i18n/locale.svelte";
	import { Modal, Button } from "@gitbutler/ui-svelte";

	type Props = {
		fileName: string;
		onConfirm: () => void;
		onCancel: () => void;
	};

	const { fileName, onConfirm, onCancel }: Props = $props();

	let modal: Modal | undefined = $state();

	export function show() {
		modal?.show();
	}

	export function hide() {
		modal?.close();
	}
</script>

<Modal bind:this={modal} width="small" type="warning" title={t("editPatch.title")}>
	<p class="text-base-body-13 text-light">
		{t("editPatch.before")} <span class="text-bold">{fileName}</span>
		{t("editPatch.after")}
	</p>

	{#snippet controls()}
		<Button kind="outline" onclick={onCancel}>{t("general.cancel")}</Button>
		<Button style="pop" onclick={onConfirm}>{t("editPatch.resolve")}</Button>
	{/snippet}
</Modal>
