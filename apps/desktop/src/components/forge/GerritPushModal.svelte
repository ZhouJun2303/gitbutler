<script lang="ts" module>
	export type GerritPushModalProps = {
		projectId: string;
		stackId?: string;
		branchName: string;
		multipleBranches: boolean;
		isLastBranchInStack?: boolean;
		isFirstBranchInStack?: boolean;
		onPush: (gerritFlags: import("$lib/stacks/stack").GerritPushFlag[]) => void;
	};
</script>

<script lang="ts">
	import { t } from "$lib/i18n/locale.svelte";
	import {
		Button,
		Modal,
		Select,
		SelectItem,
		Textbox,
		TagInput,
		Toggle,
	} from "@gitbutler/ui-svelte";
	import { untrack } from "svelte";
	import type { GerritPushFlag } from "$lib/stacks/stack";

	const {
		projectId: _projectId,
		stackId: _stackId,
		branchName,
		multipleBranches: _multipleBranches,
		isLastBranchInStack: _isLastBranchInStack,
		isFirstBranchInStack: _isFirstBranchInStack,
		onPush,
	}: GerritPushModalProps = $props();

	let modal = $state<Modal>();

	// Status section - WIP or Ready (default Ready)
	let status = $state<"wip" | "ready">("ready");

	// Topic section
	let topicValue = $state(untrack(() => branchName));

	// Tags section
	let tags = $state<Array<{ id: string; label: string }>>([]);
	let tagInputValue = $state("");

	// Private section
	let isPrivate = $state(false);

	// Validate topic input to allow only alphanumeric characters, dashes, and underscores
	function validateTopicInput(value: string): string {
		return value.replace(/[^a-zA-Z0-9-_]/g, "");
	}

	function handleTopicInput(value: string) {
		topicValue = validateTopicInput(value);
	}

	function buildGerritFlags(): GerritPushFlag[] {
		const flags: GerritPushFlag[] = [];

		// Always include status (wip or ready)
		flags.push({ type: status });

		// Include topic if has value
		if (topicValue.trim()) {
			flags.push({ type: "topic", subject: topicValue.trim() });
		}

		// Include hashtags if has values
		tags.forEach((tag) => {
			flags.push({ type: "hashtag", subject: tag.label });
		});

		// Include private if enabled
		if (isPrivate) {
			flags.push({ type: "private" });
		}

		return flags;
	}

	function handlePush() {
		const flags = buildGerritFlags();
		onPush(flags);
		modal?.close();
	}

	const canPush = $derived(true);

	export function show() {
		// Reset form state
		status = "ready";
		topicValue = branchName;
		tags = [];
		tagInputValue = "";
		isPrivate = false;
		modal?.show();
	}

	export function close() {
		modal?.close();
	}
</script>

<Modal bind:this={modal} title={t("gerritPush.title")} width={400} onSubmit={() => handlePush()}>
	<div class="push-options">
		<!-- Status Section -->
		<Select
			label={t("gerritPush.status")}
			value={status}
			options={[
				{ label: t("gerritPush.ready"), value: "ready" },
				{ label: t("gerritPush.wip"), value: "wip" },
			]}
			onselect={(value) => {
				status = value as "ready" | "wip";
			}}
		>
			{#snippet itemSnippet({ item, highlighted })}
				<SelectItem selected={item.value === status} {highlighted}>
					{item.label}
				</SelectItem>
			{/snippet}
		</Select>

		<!-- Topic Section -->
		<Textbox
			label={t("gerritPush.topic")}
			bind:value={topicValue}
			oninput={handleTopicInput}
			placeholder={t("gerritPush.topicPlaceholder")}
			wide
		/>

		<!-- Tags Section -->
		<TagInput
			label={t("gerritPush.tags")}
			bind:tags
			bind:value={tagInputValue}
			helperText={t("gerritPush.tagsHelp")}
			wide
		/>
	</div>

	{#snippet controls(close)}
		<label class="toggle-wrapper">
			<Toggle id="private-toggle" bind:checked={isPrivate} />
			<span class="text-13 text-body clr-text-2">{t("gerritPush.private")}</span>
		</label>
		<div class="flex-1 flex justify-end gap-8">
			<Button kind="outline" onclick={close}>{t("general.cancel")}</Button>
			<Button style="pop" type="submit" disabled={!canPush}>{t("push.push")}</Button>
		</div>
	{/snippet}
</Modal>

<style lang="postcss">
	.push-options {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.toggle-wrapper {
		display: flex;
		align-items: center;
		gap: 10px;

		& label {
			cursor: pointer;
		}
	}
</style>
