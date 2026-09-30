<script lang="ts" generics="TAccount">
	import { t } from "$lib/i18n/locale.svelte";
	import { useSettingsModal } from "$lib/settings/settingsModal.svelte";
	import { Button, CardGroup, Link, Select, SelectItem } from "@gitbutler/ui-svelte";
	import type { Component, Snippet } from "svelte";

	type Props = {
		projectId: string;
		displayName: string;
		accounts: TAccount[];
		preferredAccount: TAccount | undefined;
		accountToString: (account: TAccount) => string;
		stringToAccount: (value: string) => TAccount | null;
		getUsername: (account: TAccount) => string;
		updatePreferredAccount: (projectId: string, account: TAccount) => void;
		AccountBadge: Component<{ account: TAccount; class?: string }>;
		docsUrl: string;
		requestType: "pull request" | "merge request";
		/** Degraded-integration notice rendered below the account select. */
		notice?: Snippet;
	};

	const {
		projectId,
		displayName,
		accounts,
		preferredAccount,
		accountToString,
		stringToAccount,
		getUsername,
		updatePreferredAccount,
		AccountBadge,
		docsUrl,
		requestType,
		notice,
	}: Props = $props();

	const { openGeneralSettings } = useSettingsModal();
	const hasAccounts = $derived(accounts.length > 0 && preferredAccount);

	function handleAccountChange(value: string) {
		const parsedAccount = stringToAccount(value);
		if (!parsedAccount) return;
		updatePreferredAccount(projectId, parsedAccount);
	}
</script>

<CardGroup.Item>
	{#snippet title()}
		{#if hasAccounts}
			{t("forgeAccount.configure", { name: displayName })}
		{:else}
			{t("forgeAccount.connect", { name: displayName })}
		{/if}
	{/snippet}

	{#snippet caption()}
		{t("forgeAccount.enableBefore", {
			request: requestType === "merge request" ? t("forgeBanner.mrs") : t("forgeBanner.prs"),
		})}
		<Link href={docsUrl}>{t("forgeAccount.docs")}</Link>
	{/snippet}

	{#if !hasAccounts}
		<div class="flex">
			<Button onclick={() => openGeneralSettings("integrations")} style="pop" icon="link"
				>{t("forgeAccount.setup")}</Button
			>
		</div>
	{:else}
		{@const account = preferredAccount!}
		{@const accountStr = accountToString(account)}
		<Select
			label={t("forgeAccount.accountFor", { name: displayName })}
			value={accountStr}
			options={accounts.map((acc) => ({
				label: getUsername(acc),
				value: accountToString(acc),
			}))}
			onselect={handleAccountChange}
			disabled={accounts.length <= 1}
			wide
		>
			{#snippet itemSnippet({ item, highlighted })}
				{@const itemAccount = item.value && stringToAccount(item.value)}
				<SelectItem selected={item.value === accountStr} {highlighted}>
					{item.label}

					{#if itemAccount}
						<AccountBadge account={itemAccount} class="m-l-4" />
					{/if}
				</SelectItem>
			{/snippet}
		</Select>
	{/if}

	{#if notice}
		{@render notice()}
	{/if}
</CardGroup.Item>
