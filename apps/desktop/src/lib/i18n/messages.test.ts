import { detectLanguage, en, isAppLanguage, translate, zh } from "$lib/i18n/messages";
import { describe, expect, test, vi } from "vitest";
import type { MessageKey } from "$lib/i18n/messages";

describe("translate", () => {
	test("returns the English string", () => {
		expect(translate("en", "language.label")).toBe("Language");
	});

	test("returns the Chinese string", () => {
		expect(translate("zh", "language.label")).toBe("语言");
	});

	test("covers every English key in Chinese", () => {
		const englishKeys = Object.keys(en).sort();
		const chineseKeys = Object.keys(zh).sort();
		expect(chineseKeys).toEqual(englishKeys);
		for (const key of englishKeys) {
			expect(zh[key as MessageKey].length).toBeGreaterThan(0);
		}
	});
});

describe("isAppLanguage", () => {
	test("accepts en and zh", () => {
		expect(isAppLanguage("en")).toBe(true);
		expect(isAppLanguage("zh")).toBe(true);
	});

	test("rejects unknown values", () => {
		expect(isAppLanguage("fr")).toBe(false);
		expect(isAppLanguage(undefined)).toBe(false);
	});
});

describe("detectLanguage", () => {
	test("returns zh when the browser language is Chinese", () => {
		vi.stubGlobal("navigator", { language: "zh-CN" });
		expect(detectLanguage()).toBe("zh");
		vi.unstubAllGlobals();
	});

	test("returns en for other languages", () => {
		vi.stubGlobal("navigator", { language: "en-US" });
		expect(detectLanguage()).toBe("en");
		vi.unstubAllGlobals();
	});
});
