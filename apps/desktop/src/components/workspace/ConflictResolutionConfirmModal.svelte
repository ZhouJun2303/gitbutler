<script lang="ts">
	import { t } from "$lib/i18n/locale.svelte";
	import { AsyncButton, Button, Modal } from "@gitbutler/ui-svelte";

	interface Props {
		onSubmit: () => void;
	}

	const { onSubmit }: Props = $props();

	let modalEl = $state<ReturnType<typeof Modal>>();

	export function show() {
		modalEl?.show();
	}
	export function close() {
		modalEl?.close();
	}
</script>

<Modal bind:this={modalEl} width="small">
	<div>
		<p>{t("conflictAsk.bottomUp")}</p>
		<br />
		<p>{t("conflictAsk.confirm")}</p>
	</div>
	{#snippet controls(close)}
		<Button kind="outline" type="reset" onclick={close}>{t("general.cancel")}</Button>
		<AsyncButton
			style="pop"
			action={async () => {
				await onSubmit();
				close();
			}}>{t("conflictAsk.yes")}</AsyncButton
		>
	{/snippet}
</Modal>
