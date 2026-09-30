import { detectLanguage, translate } from "$lib/i18n/messages";
import { setUiLanguage } from "@gitbutler/ui-svelte";
import type { AppLanguage, MessageKey } from "$lib/i18n/messages";

const initialLanguage = detectLanguage();
let language = $state<AppLanguage>(initialLanguage);
setUiLanguage(initialLanguage);

if (typeof document !== "undefined") {
	document.documentElement.lang = initialLanguage === "zh" ? "zh-CN" : "en";
}

export function getLanguage(): AppLanguage {
	return language;
}

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
	let text: string = translate(language, key);
	if (!vars) return text;
	for (const [name, value] of Object.entries(vars)) {
		text = text.replaceAll(`{${name}}`, String(value));
	}
	return text;
}

export function setAppLanguage(next: AppLanguage) {
	language = next;
	setUiLanguage(next);
	if (typeof document !== "undefined") {
		document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
	}
}
