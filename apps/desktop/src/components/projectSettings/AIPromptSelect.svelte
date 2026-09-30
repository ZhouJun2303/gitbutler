<script lang="ts">
	import { PROMPT_SERVICE } from "$lib/ai/aiPromptService";
	import { t } from "$lib/i18n/locale.svelte";
	import { inject } from "@gitbutler/core/context";
	import { Select, SelectItem } from "@gitbutler/ui-svelte";
	import { onMount, untrack } from "svelte";
	import type { Prompts, UserPrompt } from "$lib/ai/types";
	import type { Persisted } from "@gitbutler/shared/persisted";

	type Props = {
		projectId: string;
		promptUse: "commits" | "branches";
	};

	const { projectId, promptUse }: Props = $props();

	const promptService = inject(PROMPT_SERVICE);

	let prompts: Prompts;
	let selectedPromptId = $state<Persisted<string | undefined>>();

	if (untrack(() => promptUse) === "commits") {
		prompts = promptService.commitPrompts;
		selectedPromptId = promptService.selectedCommitPromptId(untrack(() => projectId));
	} else {
		prompts = promptService.branchPrompts;
		selectedPromptId = promptService.selectedBranchPromptId(untrack(() => projectId));
	}

	let userPrompts = prompts.userPrompts;
	let allPrompts: UserPrompt[] = $state([]);

	const defaultId = crypto.randomUUID();

	function setAllPrompts(userPrompts: UserPrompt[]) {
		allPrompts = [
			{ name: "Default Prompt", id: defaultId, prompt: prompts.defaultPrompt },
			...userPrompts,
		];
	}

	onMount(() => {
		setAllPrompts($userPrompts);
	});

	const promptOptions = $derived(
		allPrompts.map((prompt) => ({
			label: prompt.id === defaultId ? t("ai.defaultPrompt") : prompt.name,
			value: prompt.id,
		})),
	);

	$effect(() => {
		if (!$selectedPromptId || !promptService.findPrompt(allPrompts, $selectedPromptId)) {
			$selectedPromptId = defaultId;
		}
	});
</script>

<Select
	value={$selectedPromptId}
	options={promptOptions}
	label={promptUse === "commits" ? t("ai.commitMessage") : t("ai.branchName")}
	wide={true}
	searchable
	disabled={allPrompts.length === 1}
	onselect={(value) => {
		$selectedPromptId = value;
	}}
>
	{#snippet itemSnippet({ item, highlighted })}
		<SelectItem selected={item.value === $selectedPromptId} {highlighted}>
			{item.label}
		</SelectItem>
	{/snippet}
</Select>
