<script module lang="ts">
	export type PrStatusInfoType = "loading" | "open" | "merged" | "closed" | "draft";
</script>

<script lang="ts">
	import Badge from "$components/Badge.svelte";
	import { uiText } from "$lib/i18n/locale.svelte";
	import { type IconName } from "$lib/icons/names";
	import type { ComponentColorType } from "$lib/utils/colorTypes";

	interface Props {
		status: PrStatusInfoType;
	}

	type StatusInfo = {
		text: string;
		icon: IconName;
		style?: ComponentColorType;
	};

	const { status }: Props = $props();

	const prStatusInfo: StatusInfo = $derived.by(() => {
		switch (status) {
			case "loading":
				return { text: uiText("pr.loading"), icon: "spinner", style: "gray" };
			case "merged":
				return { text: uiText("pr.merged"), icon: "pr-tick", style: "purple" };
			case "closed":
				return { text: uiText("pr.closed"), icon: "pr-cross", style: "danger" };
			case "draft":
				return { text: uiText("pr.draft"), icon: "pr-draft", style: "gray" };
			default:
				return { text: uiText("pr.open"), icon: "pr", style: "safe" };
		}
	});
</script>

<Badge style={prStatusInfo.style} kind="soft" reversedDirection size="icon" icon={prStatusInfo.icon}
	>{prStatusInfo.text}</Badge
>
