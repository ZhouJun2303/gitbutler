<script lang="ts">
	import AIPromptEdit from "$components/settings/AIPromptEdit.svelte";
	import AiCredentialCheck from "$components/settings/AiCredentialCheck.svelte";
	import AuthorizationBanner from "$components/settings/AuthorizationBanner.svelte";
	import SettingsSection from "$components/shared/SettingsSection.svelte";
	import { AISecretHandle, AI_SERVICE, GitAIConfigKey, KeyOption } from "$lib/ai/service";
	import { OpenAIModelName, AnthropicModelName, ModelKind } from "$lib/ai/types";
	import { GIT_CONFIG_SERVICE } from "$lib/config/gitConfigService";
	import { t } from "$lib/i18n/locale.svelte";
	import { SECRET_SERVICE } from "$lib/secrets/secretsService";
	import { USER_SERVICE } from "$lib/user/userService.svelte";
	import { inject } from "@gitbutler/core/context";
	import {
		CardGroup,
		Icon,
		InfoMessage,
		Link,
		RadioButton,
		Select,
		SelectItem,
		Spacer,
		Textbox,
	} from "@gitbutler/ui-svelte";

	import { onMount, tick } from "svelte";
	import { run } from "svelte/legacy";

	const gitConfigService = inject(GIT_CONFIG_SERVICE);
	const secretsService = inject(SECRET_SERVICE);
	const aiService = inject(AI_SERVICE);
	const userService = inject(USER_SERVICE);
	let initialized = false;

	let modelKind: ModelKind | undefined = $state();
	let openAIKeyOption: KeyOption | undefined = $state();
	let anthropicKeyOption: KeyOption | undefined = $state();
	let openAIKey: string | undefined = $state();
	let openAICustomEndpoint: string | undefined = $state();
	const customOpenAIModel = "custom";

	let openAIModelName: string | undefined = $state();
	let openAIModelChoice: string | undefined = $state();
	let openAICustomModelDraft = $state("");
	let anthropicKey: string | undefined = $state();
	let anthropicModelName: AnthropicModelName | undefined = $state();
	let diffLengthLimit: number | undefined = $state();
	let ollamaEndpoint: string | undefined = $state();
	let ollamaModel: string | undefined = $state();
	let lmStudioEndpoint: string | undefined = $state();
	let lmStudioModel: string | undefined = $state();
	let openRouterKey: string | undefined = $state();
	let openRouterModel: string | undefined = $state();

	async function setConfiguration(key: GitAIConfigKey, value: string | undefined) {
		if (!initialized) return;
		gitConfigService.set(key, value || "");
	}

	async function setSecret(handle: AISecretHandle, secret: string | undefined) {
		if (!initialized) return;
		await secretsService.set(handle, secret || "");
	}

	onMount(async () => {
		modelKind = await aiService.getModelKind();

		openAIKeyOption = await aiService.getOpenAIKeyOption();
		openAIModelName = await aiService.getOpenAIModelName();
		openAIModelChoice = openAIModelChoiceFor(openAIModelName);
		openAICustomModelDraft = isPresetOpenAIModel(openAIModelName) ? "" : (openAIModelName ?? "");
		openAIKey = await aiService.getOpenAIKey();
		openAICustomEndpoint = await aiService.getOpenAICustomEndpoint();

		anthropicKeyOption = await aiService.getAnthropicKeyOption();
		anthropicModelName = await aiService.getAnthropicModelName();
		anthropicKey = await aiService.getAnthropicKey();

		diffLengthLimit = await aiService.getDiffLengthLimit();

		ollamaEndpoint = await aiService.getOllamaEndpoint();
		ollamaModel = await aiService.getOllamaModelName();

		lmStudioEndpoint = await aiService.getLMStudioEndpoint();
		lmStudioModel = await aiService.getLMStudioModelName();

		openRouterKey = await aiService.getOpenRouterKey();
		openRouterModel = await aiService.getOpenRouterModelName();

		// Ensure reactive declarations have finished running before we set initialized to true
		await tick();

		initialized = true;
	});

	const keyOptions = $derived([
		{
			label: t("ai.butlerApi"),
			value: KeyOption.ButlerAPI,
		},
		{
			label: t("ai.ownKey"),
			value: KeyOption.BringYourOwn,
		},
	]);

	const openAIPresetModels = Object.values(OpenAIModelName);

	function isPresetOpenAIModel(model: string | undefined): model is OpenAIModelName {
		return !!model && openAIPresetModels.includes(model as OpenAIModelName);
	}

	function openAIModelChoiceFor(model: string | undefined) {
		return isPresetOpenAIModel(model) ? model : customOpenAIModel;
	}

	function selectOpenAIModel(value: string) {
		openAIModelChoice = value;
		if (value === customOpenAIModel) {
			openAICustomModelDraft = isPresetOpenAIModel(openAIModelName) ? "" : (openAIModelName ?? "");
			return;
		}
		openAIModelName = value;
	}

	const openAIModelOptions = $derived([
		{
			label: t("ai.gpt54"),
			value: OpenAIModelName.GPT54,
		},
		{
			label: t("ai.gpt54Mini"),
			value: OpenAIModelName.GPT54Mini,
		},
		{
			label: t("ai.gpt54Nano"),
			value: OpenAIModelName.GPT54Nano,
		},
		{
			label: t("ai.customModel"),
			value: customOpenAIModel,
		},
	]);

	const anthropicModelOptions = $derived([
		{
			label: t("ai.haiku"),
			value: AnthropicModelName.Haiku,
		},
		{
			label: t("ai.sonnet"),
			value: AnthropicModelName.Sonnet,
		},
		{
			label: t("ai.opus"),
			value: AnthropicModelName.Opus,
		},
	]);

	let form = $state<HTMLFormElement>();

	function onFormChange(form: HTMLFormElement) {
		const formData = new FormData(form);
		modelKind = formData.get("modelKind") as ModelKind;
	}
	run(() => {
		setConfiguration(GitAIConfigKey.ModelProvider, modelKind);
	});
	run(() => {
		setConfiguration(GitAIConfigKey.OpenAIKeyOption, openAIKeyOption);
	});
	run(() => {
		setConfiguration(GitAIConfigKey.OpenAIModelName, openAIModelName);
	});
	run(() => {
		setConfiguration(GitAIConfigKey.OpenAICustomEndpoint, openAICustomEndpoint);
	});
	run(() => {
		setSecret(AISecretHandle.OpenAIKey, openAIKey);
	});
	run(() => {
		setConfiguration(GitAIConfigKey.AnthropicKeyOption, anthropicKeyOption);
	});
	run(() => {
		setConfiguration(GitAIConfigKey.AnthropicModelName, anthropicModelName);
	});
	run(() => {
		setConfiguration(GitAIConfigKey.DiffLengthLimit, diffLengthLimit?.toString());
	});
	run(() => {
		setSecret(AISecretHandle.AnthropicKey, anthropicKey);
	});
	run(() => {
		setConfiguration(GitAIConfigKey.OllamaEndpoint, ollamaEndpoint);
	});
	run(() => {
		setConfiguration(GitAIConfigKey.OllamaModelName, ollamaModel);
	});
	run(() => {
		setConfiguration(GitAIConfigKey.LMStudioEndpoint, lmStudioEndpoint);
	});
	run(() => {
		setConfiguration(GitAIConfigKey.LMStudioModelName, lmStudioModel);
	});
	run(() => {
		setSecret(AISecretHandle.OpenRouterKey, openRouterKey);
	});
	run(() => {
		setConfiguration(GitAIConfigKey.OpenRouterModelName, openRouterModel);
	});
	run(() => {
		if (form) form.modelKind.value = modelKind;
	});
</script>

{#snippet shortNote(text: string)}
	<div class="ai-settings__short-note">
		<Icon name="info" size={14} />
		<p class="text-12 text-body">{text}</p>
	</div>
{/snippet}

<p class="text-13 text-body ai-settings__about-text">
	{t("ai.about")}
</p>

<CardGroup>
	<form class="git-radio" bind:this={form} onchange={(e) => onFormChange(e.currentTarget)}>
		<CardGroup.Item labelFor="open-ai">
			{#snippet title()}
				{t("ai.openAI")}
			{/snippet}
			{#snippet actions()}
				<RadioButton name="modelKind" id="open-ai" value={ModelKind.OpenAI} />
			{/snippet}
		</CardGroup.Item>
		{#if modelKind === ModelKind.OpenAI}
			<CardGroup.Item>
				<Select
					value={openAIKeyOption}
					options={keyOptions}
					wide
					label={t("ai.ownKeyQuestion")}
					onselect={(value) => {
						openAIKeyOption = value as KeyOption;
					}}
				>
					{#snippet itemSnippet({ item, highlighted })}
						<SelectItem selected={item.value === openAIKeyOption} {highlighted}>
							{item.label}
						</SelectItem>
					{/snippet}
				</Select>

				{#if openAIKeyOption === KeyOption.ButlerAPI}
					{#if !userService.user}
						<AuthorizationBanner message={t("ai.signIn")} />
					{:else}
						{@render shortNote(t("ai.openaiNote"))}
					{/if}
				{/if}

				{#if openAIKeyOption === KeyOption.BringYourOwn}
					<Textbox
						label={t("ai.apiKey")}
						type="password"
						bind:value={openAIKey}
						required
						placeholder="sk-..."
					/>

					<Select
						value={openAIModelChoice}
						options={openAIModelOptions}
						label={t("ai.modelVersion")}
						wide
						onselect={selectOpenAIModel}
					>
						{#snippet itemSnippet({ item, highlighted })}
							<SelectItem selected={item.value === openAIModelChoice} {highlighted}>
								{item.label}
							</SelectItem>
						{/snippet}
					</Select>

					{#if openAIModelChoice === customOpenAIModel}
						<Textbox
							label={t("ai.modelName")}
							bind:value={openAICustomModelDraft}
							placeholder="gpt-4.1"
							oninput={(value: string) => {
								const model = value.trim();
								if (model) openAIModelName = model;
							}}
						/>
					{/if}

					<Textbox
						label={t("ai.customEndpoint")}
						bind:value={openAICustomEndpoint}
						placeholder="https://api.openai.com/v1"
					/>
				{/if}
			</CardGroup.Item>
		{/if}

		<CardGroup.Item labelFor="anthropic">
			{#snippet title()}
				{t("ai.anthropic")}
			{/snippet}
			{#snippet actions()}
				<RadioButton name="modelKind" id="anthropic" value={ModelKind.Anthropic} />
			{/snippet}
		</CardGroup.Item>
		{#if modelKind === ModelKind.Anthropic}
			<CardGroup.Item>
				<Select
					value={anthropicKeyOption}
					options={keyOptions}
					wide
					label={t("ai.ownKeyQuestion")}
					onselect={(value) => {
						anthropicKeyOption = value as KeyOption;
					}}
				>
					{#snippet itemSnippet({ item, highlighted })}
						<SelectItem selected={item.value === anthropicKeyOption} {highlighted}>
							{item.label}
						</SelectItem>
					{/snippet}
				</Select>

				{#if anthropicKeyOption === KeyOption.ButlerAPI}
					{#if !userService.user}
						<AuthorizationBanner message={t("ai.signIn")} />
					{:else}
						{@render shortNote(t("ai.anthropicNote"))}
					{/if}
				{/if}

				{#if anthropicKeyOption === KeyOption.BringYourOwn}
					<Textbox
						label={t("ai.apiKey")}
						type="password"
						bind:value={anthropicKey}
						required
						placeholder="sk-ant-api03-..."
					/>

					<Select
						value={anthropicModelName}
						options={anthropicModelOptions}
						label={t("ai.modelVersion")}
						onselect={(value) => {
							anthropicModelName = value as AnthropicModelName;
						}}
					>
						{#snippet itemSnippet({ item, highlighted })}
							<SelectItem selected={item.value === anthropicModelName} {highlighted}>
								{item.label}
							</SelectItem>
						{/snippet}
					</Select>
				{/if}
			</CardGroup.Item>
		{/if}

		<CardGroup.Item labelFor="ollama">
			{#snippet title()}
				{t("ai.ollama")}
			{/snippet}
			{#snippet actions()}
				<RadioButton name="modelKind" id="ollama" value={ModelKind.Ollama} />
			{/snippet}
		</CardGroup.Item>
		{#if modelKind === ModelKind.Ollama}
			<CardGroup.Item>
				<Textbox
					label={t("ai.endpoint")}
					bind:value={ollamaEndpoint}
					placeholder="http://127.0.0.1:11434"
				/>
				<Textbox label={t("ai.model")} bind:value={ollamaModel} placeholder="llama3" />
				<InfoMessage filled outlined={false}>
					{#snippet title()}
						{t("ai.ollamaTitle")}
					{/snippet}
					{#snippet content()}
						{t("ai.ollamaBefore")}
						<b>{t("ai.ollamaBold")}</b>
						<br />
						{t("ai.ollamaSee")}
						<Link href="https://docs.gitbutler.com/troubleshooting/custom-csp"
							>{t("ai.ollamaDocs")}</Link
						>
					{/snippet}
				</InfoMessage>
			</CardGroup.Item>
		{/if}

		<CardGroup.Item labelFor="lmstudio">
			{#snippet title()}
				{t("ai.lmstudio")}
			{/snippet}
			{#snippet actions()}
				<RadioButton name="modelKind" id="lmstudio" value={ModelKind.LMStudio} />
			{/snippet}
		</CardGroup.Item>
		{#if modelKind === ModelKind.LMStudio}
			<CardGroup.Item>
				<Textbox
					label={t("ai.endpoint")}
					bind:value={lmStudioEndpoint}
					placeholder="http://127.0.0.1:1234"
				/>
				<Textbox label={t("ai.model")} bind:value={lmStudioModel} placeholder="default" />
				<InfoMessage filled outlined={false}>
					{#snippet title()}
						{t("ai.lmstudioTitle")}
					{/snippet}
					{#snippet content()}
						<div class="ai-settings__section-text-block">
							<p>{t("ai.lmstudioIntro")}</p>

							<p>
								1. <span class="text-bold">{t("ai.lmstudioCsp")}</span>{t("ai.lmstudioCspAfter")}
								<Link href="https://docs.gitbutler.com/troubleshooting/custom-csp"
									>{t("ai.gbDocs")}</Link
								>
							</p>

							<p>
								2. <span class="text-bold">{t("ai.lmstudioCors")}</span>{t("ai.lmstudioCorsAfter")}
								<Link href="https://lmstudio.ai/docs/cli/server-start#enable-cors-support"
									>{t("ai.lmstudioDocs")}</Link
								>
							</p>
						</div>
					{/snippet}
				</InfoMessage>
			</CardGroup.Item>
		{/if}

		<CardGroup.Item labelFor="openrouter">
			{#snippet title()}
				{t("ai.openRouter")}
			{/snippet}
			{#snippet actions()}
				<RadioButton name="modelKind" id="openrouter" value={ModelKind.OpenRouter} />
			{/snippet}
		</CardGroup.Item>
		{#if modelKind === ModelKind.OpenRouter}
			<CardGroup.Item>
				<Textbox
					label="API key"
					type="password"
					bind:value={openRouterKey}
					required
					placeholder="sk-or-..."
				/>

				<Textbox
					label={t("ai.model")}
					bind:value={openRouterModel}
					placeholder="openai/gpt-4.1-mini"
				/>
			</CardGroup.Item>
		{/if}

		<CardGroup.Item>
			<AiCredentialCheck />
		</CardGroup.Item>
	</form>
</CardGroup>

<Spacer />

<CardGroup.Item standalone>
	{#snippet title()}
		{t("ai.contextTitle")}
	{/snippet}
	{#snippet caption()}
		{t("ai.contextCaption")}
	{/snippet}
	{#snippet actions()}
		<Textbox
			type="number"
			width={80}
			textAlign="center"
			value={diffLengthLimit?.toString()}
			minVal={100}
			oninput={(value: string) => {
				diffLengthLimit = parseInt(value);
			}}
			placeholder="5000"
		/>
	{/snippet}
</CardGroup.Item>

<Spacer />

<SettingsSection>
	{#snippet title()}
		{t("ai.promptsTitle")}
	{/snippet}
	{#snippet description()}
		{t("ai.promptsDescription")}
	{/snippet}

	<div class="prompt-groups">
		<AIPromptEdit promptUse="commits" />
		<Spacer margin={12} />
		<AIPromptEdit promptUse="branches" />
	</div>
</SettingsSection>

<style>
	.ai-settings__about-text {
		margin-bottom: 12px;
		color: var(--text-2);
	}

	.prompt-groups {
		display: flex;
		flex-direction: column;
		margin-top: 16px;
		gap: 12px;
	}

	.ai-settings__short-note {
		display: flex;
		align-items: center;
		padding: 6px 10px;
		gap: 8px;
		border-radius: var(--radius-m);
		background-color: var(--bg-2);
		color: var(--text-2);
	}

	.ai-settings__section-text-block {
		display: flex;
		flex-direction: column;
	}
</style>
