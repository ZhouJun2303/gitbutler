import { usesNativeFetch } from "$lib/ai/nativeFetch";
import { describe, expect, test } from "vitest";

describe("usesNativeFetch", () => {
	test("keeps official hosts on the browser fetch", () => {
		expect(usesNativeFetch("https://api.openai.com/v1", true)).toBe(false);
		expect(usesNativeFetch("https://openrouter.ai/api/v1", true)).toBe(false);
		expect(usesNativeFetch(undefined, true)).toBe(false);
	});

	test("uses the desktop proxy for a custom endpoint inside Tauri", () => {
		expect(usesNativeFetch("https://code.52bcy.com/v1", true)).toBe(true);
		expect(usesNativeFetch("http://127.0.0.1:8080/v1", true)).toBe(true);
	});

	test("stays on the browser fetch outside the desktop app", () => {
		expect(usesNativeFetch("https://code.52bcy.com/v1", false)).toBe(false);
	});
});
