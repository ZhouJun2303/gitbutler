import { Channel, invoke, isTauri } from "@tauri-apps/api/core";

const browserHosts = new Set(["api.openai.com", "openrouter.ai"]);

/** Custom endpoints are fetched by the desktop process so webview CORS does not apply. */
export function usesNativeFetch(baseURL: string | undefined, inTauri: boolean): boolean {
	const trimmed = baseURL?.trim();
	if (!inTauri || !trimmed) return false;
	try {
		return !browserHosts.has(new URL(trimmed).hostname);
	} catch {
		return false;
	}
}

type ProxyEvent =
	| { kind: "head"; status: number; headers: { name: string; value: string }[] }
	| { kind: "chunk"; data: string }
	| { kind: "end" }
	| { kind: "error"; message: string };

export function nativeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	if (!isTauri()) return globalThis.fetch(input, init);
	return proxyFetch(input, init);
}

async function proxyFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	if (init?.signal?.aborted) {
		throw new DOMException("The operation was aborted.", "AbortError");
	}

	const request = input instanceof Request ? input : undefined;
	const url =
		typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
	const method = init?.method ?? request?.method ?? "GET";
	const headers = headerEntries(init?.headers ?? request?.headers);
	const body = await encodeBody(init?.body ?? (request ? await request.arrayBuffer() : undefined));

	return new Promise((resolve, reject) => {
		let settled = false;
		let failed = false;
		let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
		const stream = new ReadableStream<Uint8Array>({
			start(next) {
				controller = next;
			},
		});

		const fail = (error: unknown) => {
			if (failed) return;
			failed = true;
			const message = error instanceof Error ? error.message : String(error);
			const wrapped = new TypeError(message);
			if (!settled) {
				reject(wrapped);
				return;
			}
			try {
				controller?.error(wrapped);
			} catch {
				// The reader may already have cancelled the stream.
			}
		};

		const channel = new Channel<ProxyEvent>((event) => {
			if (event.kind === "head") {
				settled = true;
				const responseHeaders = new Headers();
				for (const header of event.headers) {
					try {
						responseHeaders.append(header.name, header.value);
					} catch {
						// The browser forbids a few response headers, such as Set-Cookie.
					}
				}
				resolve(new Response(stream, { status: event.status, headers: responseHeaders }));
				return;
			}
			if (event.kind === "chunk") {
				controller?.enqueue(decodeBase64(event.data));
				return;
			}
			if (event.kind === "error") {
				fail(event.message);
				return;
			}
			try {
				controller?.close();
			} catch {
				// Already closed or failed.
			}
		});

		void invoke("proxy_ai_fetch", {
			request: { url, method, headers, body },
			channel,
		}).catch((error: unknown) => fail(error));
	});
}

function headerEntries(headers: HeadersInit | undefined): { name: string; value: string }[] {
	if (!headers) return [];
	if (headers instanceof Headers) {
		return [...headers.entries()].map(([name, value]) => ({ name, value }));
	}
	if (Array.isArray(headers)) {
		return headers.map(([name, value]) => ({ name, value }));
	}
	return Object.entries(headers).map(([name, value]) => ({ name, value }));
}

async function encodeBody(body: BodyInit | null | undefined): Promise<string | null> {
	if (body == null) return null;
	if (typeof body === "string") return encodeBase64(new TextEncoder().encode(body));
	if (body instanceof Uint8Array) return encodeBase64(body);
	if (body instanceof ArrayBuffer) return encodeBase64(new Uint8Array(body));
	if (body instanceof Blob) return encodeBase64(new Uint8Array(await body.arrayBuffer()));
	if (body instanceof URLSearchParams)
		return encodeBase64(new TextEncoder().encode(body.toString()));
	if (typeof body === "object" && "getReader" in body) {
		const reader = body.getReader();
		const chunks: Uint8Array[] = [];
		let length = 0;
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			if (!value) continue;
			chunks.push(value);
			length += value.byteLength;
		}
		const merged = new Uint8Array(length);
		let offset = 0;
		for (const chunk of chunks) {
			merged.set(chunk, offset);
			offset += chunk.byteLength;
		}
		return encodeBase64(merged);
	}
	return encodeBase64(new TextEncoder().encode(String(body)));
}

function encodeBase64(bytes: Uint8Array): string {
	let binary = "";
	const size = 0x8000;
	for (let index = 0; index < bytes.length; index += size) {
		binary += String.fromCharCode(...bytes.subarray(index, index + size));
	}
	return btoa(binary);
}

function decodeBase64(value: string): Uint8Array {
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index++) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes;
}
