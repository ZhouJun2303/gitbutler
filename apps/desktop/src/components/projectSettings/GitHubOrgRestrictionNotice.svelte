<script lang="ts">
	import { t } from "$lib/i18n/locale.svelte";
	import { InfoMessage, Link } from "@gitbutler/ui-svelte";

	import type { Code } from "@gitbutler/but-sdk";

	const { errorCode }: { errorCode: Code | undefined } = $props();
</script>

{#if errorCode === "GitHubOrgOAuthRestricted"}
	<InfoMessage style="warning" filled outlined={false}>
		{#snippet title()}
			{t("notice.orgBlocked")}
		{/snippet}
		{#snippet content()}
			{t("notice.orgBlockedHelp")}
			<Link
				href="https://docs.gitbutler.com/features/forge-integration/github-integration?utm_source=gitbutler-app&utm_medium=settings-banner&utm_campaign=org-oauth-restriction#connect-a-github-account"
				>{t("forgeAccount.docs")}</Link
			>.
		{/snippet}
	</InfoMessage>
{:else if errorCode === "GitHubOrgSamlRestricted"}
	<InfoMessage style="warning" filled outlined={false}>
		{#snippet title()}
			{t("notice.saml")}
		{/snippet}
		{#snippet content()}
			{t("notice.samlHelp")}
		{/snippet}
	</InfoMessage>
{:else if errorCode === "GitHubTokenLifetimeRestricted"}
	<InfoMessage style="warning" filled outlined={false}>
		{#snippet title()}
			{t("notice.tokenLife")}
		{/snippet}
		{#snippet content()}
			{t("notice.tokenLifeHelp")}
		{/snippet}
	</InfoMessage>
{/if}
