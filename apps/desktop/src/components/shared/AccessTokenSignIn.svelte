<script lang="ts">
	import signinSvg from "$lib/assets/token.svg?raw";
	import { t } from "$lib/i18n/locale.svelte";
	import { USER_SERVICE } from "$lib/user/userService.svelte";
	import { inject } from "@gitbutler/core/context";
	import { CardGroup, Textbox, Spacer, AsyncButton } from "@gitbutler/ui-svelte";

	const userService = inject(USER_SERVICE);

	let accessToken = $state("");
</script>

{#if !userService.user}
	<CardGroup.Item standalone>
		<div class="token-content">
			<div class="token-svg">
				{@html signinSvg}
			</div>

			<div class="info-section">
				<h2 class="text-15 text-bold m-b-6">{t("token.title")}</h2>

				<p class="text-12 text-body clr-text-2">
					{t("token.signInHelp")}
				</p>

				<div class="flex gap-8 m-t-12">
					<AsyncButton
						style="pop"
						icon="login"
						action={async () => {
							await userService.openLoginPage();
						}}
					>
						{t("token.login")}
					</AsyncButton>

					<AsyncButton
						kind="outline"
						icon="copy"
						action={async () => {
							await userService.copyLoginPageLink();
						}}
					>
						{t("token.copyLink")}
					</AsyncButton>
				</div>

				<Spacer dotted margin={16} />

				<div class="token-fields">
					<Textbox
						size="large"
						type="password"
						value={accessToken}
						placeholder="•••••••••••••••••••••••••"
						oninput={(value: string) => (accessToken = value)}
					/>
					<AsyncButton
						style="pop"
						disabled={accessToken.trim().length === 0}
						action={async () => {
							await userService.setUserAccessToken(accessToken.trim(), true);
							accessToken = "";
						}}
					>
						{t("token.authorize")}
					</AsyncButton>
				</div>

				<p class="text-12 text-body clr-text-2 m-t-16">
					{t("token.required")}
				</p>
			</div>
		</div>
	</CardGroup.Item>
{/if}

<style lang="postcss">
	.token-svg {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 110px;
		height: 100px;
		border-radius: var(--radius-m);
		background-color: var(--art-scene-bg);
	}

	.token-content {
		display: flex;
		gap: 24px;
	}

	.info-section {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.token-fields {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
</style>
