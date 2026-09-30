<script lang="ts">
	import { t } from "$lib/i18n/locale.svelte";
	import { SETTINGS_SERVICE } from "$lib/settings/appSettings";
	import { inject } from "@gitbutler/core/context";
	import { CardGroup, Link, TestId, Toggle } from "@gitbutler/ui-svelte";

	const settingsService = inject(SETTINGS_SERVICE);
	const appSettings = $derived(settingsService.appSettings);
	const errorReportingEnabled = $derived($appSettings?.telemetry.appErrorReportingEnabled);
	const metricsEnabled = $derived($appSettings?.telemetry.appMetricsEnabled);
</script>

<div class="analytics-settings__content">
	<p class="text-13 text-body analytics-settings__text">
		{t("telemetry.intro")}
		<Link href="https://gitbutler.com/privacy">{t("telemetry.privacy")}</Link>
	</p>
	<p class="text-13 text-body analytics-settings__text">
		{t("telemetry.ask")}
		<Link href="https://discord.gg/MmFkmaJ42D">{t("telemetry.discord")}</Link>.
	</p>
</div>

<CardGroup testId={TestId.OnboardingPageAnalyticsSettings}>
	<CardGroup.Item labelFor="errorReportingToggle">
		{#snippet title()}
			{t("telemetry.errors")}
		{/snippet}
		{#snippet caption()}
			{t("telemetry.errorsCaption")}
		{/snippet}
		{#snippet actions()}
			<Toggle
				id="errorReportingToggle"
				testId={TestId.OnboardingPageAnalyticsSettingsErrorReportingToggle}
				checked={errorReportingEnabled}
				onclick={() =>
					settingsService.updateTelemetry({
						appErrorReportingEnabled: !errorReportingEnabled,
					})}
			/>
		{/snippet}
	</CardGroup.Item>

	<CardGroup.Item labelFor="metricsEnabledToggle">
		{#snippet title()}
			{t("telemetry.metrics")}
		{/snippet}
		{#snippet caption()}
			{t("telemetry.metricsCaption")}
		{/snippet}
		{#snippet actions()}
			<Toggle
				id="metricsEnabledToggle"
				testId={TestId.OnboardingPageAnalyticsSettingsTelemetryToggle}
				checked={metricsEnabled}
				onclick={() =>
					settingsService.updateTelemetry({
						appMetricsEnabled: !metricsEnabled,
					})}
			/>
		{/snippet}
	</CardGroup.Item>
</CardGroup>

<style lang="postcss">
	.analytics-settings__content {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.analytics-settings__text {
		margin-bottom: 10px;
		color: var(--text-2);
	}
</style>
