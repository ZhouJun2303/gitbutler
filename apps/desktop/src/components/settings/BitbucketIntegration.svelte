<script lang="ts">
	import BitbucketUserLoginState from "$components/settings/BitbucketUserLoginState.svelte";
	import ReduxResult from "$components/shared/ReduxResult.svelte";
	import bitbucketLogoSvg from "$lib/assets/unsized-logos/bitbucket.svg?raw";
	import { BITBUCKET_USER_SERVICE } from "$lib/forge/bitbucket/bitbucketUserService.svelte";
	import { t } from "$lib/i18n/locale.svelte";
	import { OnboardingEvent, POSTHOG_WRAPPER } from "$lib/telemetry/posthog";
	import { inject } from "@gitbutler/core/context";

	import { AddForgeAccountButton, Button, CardGroup, Link, Textbox } from "@gitbutler/ui-svelte";
	import { fade } from "svelte/transition";

	const bitbucketUserService = inject(BITBUCKET_USER_SERVICE);
	const posthog = inject(POSTHOG_WRAPPER);

	const [clearAll, clearingAllResult] = bitbucketUserService.deleteAllBitbucketAccounts();
	const [storeApiToken, storeApiTokenResult] = bitbucketUserService.storeBitbucketApiToken;
	const accounts = bitbucketUserService.accounts();

	let showingFlow = $state<"apiToken">();

	let emailInput = $state<string>();
	let tokenInput = $state<string>();
	let emailError = $state<string>();
	let tokenErrorKind = $state<"missingScopes" | "invalidEmail" | undefined>();
	const tokenError = $derived(
		tokenErrorKind === "missingScopes"
			? t("integration.missingScopes")
			: tokenErrorKind === "invalidEmail"
				? t("integration.invalidEmail")
				: undefined,
	);

	function cleanupApiTokenFlow() {
		showingFlow = undefined;
		emailInput = undefined;
		tokenInput = undefined;
		emailError = undefined;
		tokenErrorKind = undefined;
	}

	async function deleteAllBitbucketAccounts() {
		await clearAll();
		startApiTokenFlow();
	}

	function startApiTokenFlow() {
		showingFlow = "apiToken";
	}

	async function storeBitbucketApiToken() {
		if (!emailInput || !tokenInput) return;
		emailError = undefined;
		tokenErrorKind = undefined;
		try {
			await storeApiToken({ email: emailInput, accessToken: tokenInput });
			posthog.captureOnboarding(OnboardingEvent.BitbucketStoreApiToken);
			cleanupApiTokenFlow();
		} catch (err: any) {
			console.error("Failed to store Bitbucket API token:", err);
			const message = String(err?.message ?? err);
			tokenErrorKind =
				message.includes("403") || message.includes("Forbidden") ? "missingScopes" : "invalidEmail";
			posthog.captureOnboarding(OnboardingEvent.BitbucketStoreApiTokenFailed);
		}
	}
</script>

<div class="stack-v gap-8">
	<CardGroup>
		<ReduxResult result={accounts.result}>
			<!-- IF ERROR -->
			{#snippet error()}
				<CardGroup.Item>
					{#snippet title()}
						{t("integration.bitbucketLoadFailed")}
					{/snippet}
					<Button
						style="pop"
						onclick={deleteAllBitbucketAccounts}
						loading={clearingAllResult.current.isLoading}>{t("integration.tryAgain")}</Button
					>
				</CardGroup.Item>
			{/snippet}

			<!-- ADD ACCOUNT(S) LIST -->
			{#snippet children(accounts)}
				{@const noAccounts = accounts.length === 0}
				{#each accounts as account}
					<BitbucketUserLoginState {account} />
				{/each}

				<CardGroup.Item background={accounts.length > 0 ? "var(--bg-2)" : undefined}>
					{#snippet iconSide()}
						<div class="icon-wrapper__logo">
							{@html bitbucketLogoSvg}
						</div>
					{/snippet}

					{#snippet title()}
						Bitbucket
					{/snippet}

					{#snippet caption()}
						{t("integration.allowsPr")}
					{/snippet}

					{#snippet actions()}
						{@render addProfileButton(noAccounts)}
					{/snippet}
				</CardGroup.Item>
			{/snippet}
		</ReduxResult>
	</CardGroup>

	<!-- API TOKEN FLOW -->
	{#if showingFlow === "apiToken"}
		<div in:fade={{ duration: 100 }}>
			<CardGroup>
				<CardGroup.Item>
					{#snippet title()}
						{t("integration.addBitbucket")}
					{/snippet}

					{#snippet caption()}
						{t("integration.bitbucketScopes")}
						<br />
						<Link href="https://id.atlassian.com/manage-profile/security/api-tokens"
							>{t("integration.bitbucketCreate")}</Link
						>
					{/snippet}

					<Textbox
						label={t("integration.atlassianEmail")}
						size="large"
						value={emailInput}
						placeholder="you@example.com"
						oninput={(value) => (emailInput = value)}
						error={emailError}
					/>
					<Textbox
						label={t("integration.apiToken")}
						size="large"
						type="password"
						value={tokenInput}
						placeholder="ATATT************************"
						oninput={(value) => (tokenInput = value)}
						error={tokenError}
					/>
				</CardGroup.Item>
				<CardGroup.Item>
					<div class="flex justify-end gap-6">
						<Button style="gray" kind="outline" onclick={cleanupApiTokenFlow}
							>{t("general.cancel")}</Button
						>
						<Button
							style="pop"
							disabled={!emailInput || !tokenInput}
							loading={storeApiTokenResult.current.isLoading}
							onclick={storeBitbucketApiToken}
						>
							{t("integration.addAccount")}
						</Button>
					</div>
				</CardGroup.Item>
			</CardGroup>
		</div>
	{/if}
</div>

<p class="text-12 text-body bitbucket-integration-settings__text">
	🔒 {t("integration.keychain")}
</p>

{#snippet addProfileButton(noAccounts: boolean)}
	<AddForgeAccountButton
		{noAccounts}
		disabled={showingFlow !== undefined}
		loading={storeApiTokenResult.current.isLoading}
		menuItems={[
			{ label: t("integration.addBitbucket"), icon: "lock-auth", onclick: startApiTokenFlow },
		]}
	/>
{/snippet}

<style lang="postcss">
	.icon-wrapper__logo {
		width: 28px;
		height: 28px;
	}

	.bitbucket-integration-settings__text {
		color: var(--text-2);
	}
</style>
