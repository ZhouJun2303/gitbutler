<script lang="ts">
	import { t } from "$lib/i18n/locale.svelte";
	import { Badge } from "@gitbutler/ui-svelte";
	import type { BitbucketAccountIdentifier } from "@gitbutler/but-sdk";

	type Props = {
		account: BitbucketAccountIdentifier;
		class?: string;
	};

	const { account, class: className }: Props = $props();

	export function badgeText(account: BitbucketAccountIdentifier): string | null {
		switch (account.type) {
			case "apiToken":
				return t("forge.apiToken");
		}
	}

	export function tooltipText(account: BitbucketAccountIdentifier): string {
		switch (account.type) {
			case "apiToken":
				return t("forge.bitbucketToken");
		}
	}
</script>

<Badge class={className} tooltip={tooltipText(account)}>
	{badgeText(account)}
</Badge>
