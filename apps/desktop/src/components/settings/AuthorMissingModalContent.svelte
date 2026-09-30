<script lang="ts">
	import { GIT_SERVICE } from "$lib/git/gitService";
	import { t } from "$lib/i18n/locale.svelte";
	import { inject } from "@gitbutler/core/context";
	import {
		TestId,
		ModalHeader,
		ModalFooter,
		Textbox,
		EmailTextbox,
		Button,
	} from "@gitbutler/ui-svelte";
	import { untrack } from "svelte";
	import type { AuthorMissingModalState } from "$lib/state/uiState.svelte";

	type Props = {
		data: AuthorMissingModalState;
		close: () => void;
	};

	const { data, close }: Props = $props();

	const gitService = inject(GIT_SERVICE);
	const [setAuthorInfo, settingInfo] = gitService.setAuthorInfo;

	let name = $state(untrack(() => data.authorName));
	let email = $state(untrack(() => data.authorEmail));
	let emailTextbox: any;

	async function handleSubmit() {
		if (!name || !email) {
			return;
		}
		if (!emailTextbox.isValid()) {
			emailTextbox.validate();
			return;
		}
		await setAuthorInfo({
			projectId: data.projectId,
			name,
			email,
		});
		close();
	}
</script>

<ModalHeader type="warning">{t("author.title")}</ModalHeader>
<div class="author-missing__content">
	{t("author.body")}

	<Textbox
		disabled={settingInfo.current.isLoading}
		placeholder={t("author.fullName")}
		label={t("author.name")}
		testId={TestId.GlobalModal_AuthorMissing_NameInput}
		bind:value={name}
		autofocus
	/>

	<EmailTextbox
		disabled={settingInfo.current.isLoading}
		placeholder="your.email@example.com"
		label={t("author.email")}
		testId={TestId.GlobalModal_AuthorMissing_EmailInput}
		bind:value={email}
		bind:this={emailTextbox}
	/>
</div>
<ModalFooter>
	<Button kind="outline" onclick={close} disabled={settingInfo.current.isLoading}
		>{t("general.cancel")}</Button
	>
	<Button
		testId={TestId.GlobalModal_AuthorMissing_ActionButton}
		style="pop"
		onclick={handleSubmit}
		loading={settingInfo.current.isLoading}
		disabled={!name || !email}
	>
		{settingInfo.current.isLoading ? t("author.saving") : t("author.save")}
	</Button>
</ModalFooter>

<style lang="postcss">
	.author-missing__content {
		display: flex;
		flex-direction: column;
		padding: 0 16px 16px 16px;
		gap: 16px;
	}
</style>
