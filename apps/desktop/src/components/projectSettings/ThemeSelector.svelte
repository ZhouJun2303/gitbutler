<script lang="ts">
	import { t } from "$lib/i18n/locale.svelte";
	import { Icon } from "@gitbutler/ui-svelte";
	import type { MessageKey } from "$lib/i18n/messages";
	import type { AppTheme, UiState } from "$lib/state/uiState.svelte";

	interface Props {
		uiState: UiState;
	}

	const { uiState }: Props = $props();

	const currentTheme = $derived(uiState.global.theme.current ?? "system");

	const themes: { nameKey: MessageKey; value: AppTheme; preview: string }[] = [
		{
			nameKey: "appearance.theme.light",
			value: "light",
			preview: "/images/theme-previews/light.svg",
		},
		{
			nameKey: "appearance.theme.dark",
			value: "dark",
			preview: "/images/theme-previews/dark.svg",
		},
		{
			nameKey: "appearance.theme.system",
			value: "system",
			preview: "/images/theme-previews/system.svg",
		},
	];
</script>

<fieldset class="cards-group">
	{#each themes as theme}
		<label
			class="theme-card"
			class:selected={theme.value === currentTheme}
			for="theme-{theme.value}"
		>
			<input
				class="hidden-input"
				type="radio"
				id="theme-{theme.value}"
				value={theme.value}
				checked={theme.value === currentTheme}
				onchange={() => uiState.global.theme.set(theme.value)}
			/>
			<div class="theme-card__preview">
				<i class="theme-card__icon"
					><Icon
						name="tick-circle"
						color={theme.value === "light" ? "var(--clr-pop-50)" : "var(--clr-pop-60)"}
					/></i
				>

				<img src={theme.preview} alt={t(theme.nameKey)} />
			</div>

			<span class="theme-card__label text-12 text-semibold">{t(theme.nameKey)}</span>
		</label>
	{/each}
</fieldset>

<style lang="postcss">
	.cards-group {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}

	.theme-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	.theme-card:hover {
		& .theme-card__label {
			background-color: var(--bg-2);
		}
	}

	.theme-card__preview {
		position: relative;
		width: 100%;
		height: auto;
		overflow: hidden;
		border: 1px solid var(--border-2);
		border-radius: var(--radius-m);

		& img {
			width: 100%;
			height: auto;
			border-radius: var(--radius-m);
		}
	}

	.theme-card__label {
		padding: 6px;
		border-radius: var(--radius-m);
		text-align: center;
	}

	.theme-card__icon {
		display: flex;
		z-index: 1;
		position: absolute;
		right: 8px;
		bottom: 8px;
		opacity: 0;
	}

	.hidden-input {
		z-index: -1;
		position: absolute;
		width: 0;
		height: 0;
	}

	/* MODIFIER */

	.theme-card.selected .theme-card__preview {
		border-color: var(--fill-pop-bg);
	}

	.theme-card.selected .theme-card__label {
		background-color: var(--chip-pop-bg);
	}

	.theme-card.selected .theme-card__icon {
		transform: scale(1);
		opacity: 1;
	}
</style>
