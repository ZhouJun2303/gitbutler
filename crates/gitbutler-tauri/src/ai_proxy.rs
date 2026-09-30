//! Proxies OpenAI-compatible HTTP calls from the webview.
//!
//! The desktop UI runs on `http://localhost`, so a browser `fetch` to a custom
//! endpoint is subject to that endpoint's CORS policy. Performing the request
//! here avoids that check.

use std::time::Duration;

use base64::Engine as _;
use futures::StreamExt;
use tauri::ipc::Channel;

const MAX_REQUEST_BODY: usize = 10 * 1024 * 1024;
const MAX_RESPONSE_BODY: usize = 20 * 1024 * 1024;

#[derive(serde::Deserialize)]
pub struct ProxyRequest {
    url: String,
    method: String,
    headers: Vec<HeaderPair>,
    body: Option<String>,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct HeaderPair {
    name: String,
    value: String,
}

#[derive(Clone, serde::Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum ProxyEvent {
    Head {
        status: u16,
        headers: Vec<HeaderPair>,
    },
    Chunk {
        data: String,
    },
    End,
    Error {
        message: String,
    },
}

#[tauri::command(async)]
pub async fn proxy_ai_fetch(
    request: ProxyRequest,
    channel: Channel<ProxyEvent>,
) -> Result<(), String> {
    execute(request, |event| {
        channel.send(event).map_err(|err| err.to_string())
    })
    .await
}

async fn execute(
    request: ProxyRequest,
    mut emit: impl FnMut(ProxyEvent) -> Result<(), String>,
) -> Result<(), String> {
    let url = validate_url(&request.url)?;
    let method = reqwest::Method::from_bytes(request.method.as_bytes())
        .map_err(|err| format!("Unsupported HTTP method: {err}"))?;
    let body = decode_body(request.body.as_deref())?;

    let mut headers = reqwest::header::HeaderMap::new();
    for header in request.headers {
        if is_hop_by_hop(&header.name) || header.name.eq_ignore_ascii_case("host") {
            continue;
        }
        let name = reqwest::header::HeaderName::from_bytes(header.name.as_bytes())
            .map_err(|err| format!("Invalid header name: {err}"))?;
        let value = reqwest::header::HeaderValue::from_str(&header.value)
            .map_err(|err| format!("Invalid header value: {err}"))?;
        headers.append(name, value);
    }

    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .connect_timeout(Duration::from_secs(30))
        .build()
        .map_err(|err| err.to_string())?;

    let response = client
        .request(method, url)
        .headers(headers)
        .body(body)
        .send()
        .await
        .map_err(|err| err.to_string())?;

    let status = response.status().as_u16();
    let response_headers = response
        .headers()
        .iter()
        .filter(|(name, _)| !is_hop_by_hop(name.as_str()))
        .filter_map(|(name, value)| {
            value.to_str().ok().map(|value| HeaderPair {
                name: name.as_str().to_owned(),
                value: value.to_owned(),
            })
        })
        .collect();
    emit(ProxyEvent::Head {
        status,
        headers: response_headers,
    })?;

    let mut received = 0usize;
    let mut stream = response.bytes_stream();
    while let Some(next) = stream.next().await {
        let chunk = next.map_err(|err| err.to_string())?;
        received = received.saturating_add(chunk.len());
        if received > MAX_RESPONSE_BODY {
            let message = "AI response exceeded the size limit".to_owned();
            emit(ProxyEvent::Error {
                message: message.clone(),
            })?;
            return Err(message);
        }
        if chunk.is_empty() {
            continue;
        }
        emit(ProxyEvent::Chunk {
            data: base64::engine::general_purpose::STANDARD.encode(chunk),
        })?;
    }
    emit(ProxyEvent::End)?;
    Ok(())
}

fn decode_body(body: Option<&str>) -> Result<Vec<u8>, String> {
    let Some(body) = body else {
        return Ok(Vec::new());
    };
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(body)
        .map_err(|err| format!("Invalid request body: {err}"))?;
    if bytes.len() > MAX_REQUEST_BODY {
        return Err("AI request exceeded the size limit".to_owned());
    }
    Ok(bytes)
}

fn validate_url(raw: &str) -> Result<url::Url, String> {
    let url = url::Url::parse(raw).map_err(|err| format!("Invalid endpoint URL: {err}"))?;
    match url.scheme() {
        "http" | "https" => {}
        _ => return Err("Only http and https endpoints are supported".to_owned()),
    }
    if url.host_str().is_none() {
        return Err("Endpoint URL is missing a host".to_owned());
    }
    Ok(url)
}

fn is_hop_by_hop(name: &str) -> bool {
    matches!(
        name.to_ascii_lowercase().as_str(),
        "connection"
            | "keep-alive"
            | "proxy-authenticate"
            | "proxy-authorization"
            | "te"
            | "trailer"
            | "transfer-encoding"
            | "upgrade"
            | "content-length"
            | "content-encoding"
            | "set-cookie"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_custom_https_endpoints() {
        assert!(
            validate_url("https://code.52bcy.com/v1/chat/completions").is_ok(),
            "custom https endpoints are called by the desktop process"
        );
    }

    #[test]
    fn rejects_non_http_urls() {
        assert!(
            validate_url("file:///tmp/secret").is_err(),
            "the proxy must not read local files"
        );
    }

    #[tokio::test]
    async fn streams_the_response_body() {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
            .await
            .expect("bind a local http server");
        let address = listener.local_addr().expect("read the bound address");
        tokio::spawn(async move {
            let (mut socket, _) = listener.accept().await.expect("accept the proxy request");
            let request = read_http_request(&mut socket).await;
            assert!(
                request.starts_with("POST /v1/chat/completions "),
                "the proxy forwards the chat completions path"
            );
            assert!(
                request
                    .to_ascii_lowercase()
                    .contains("authorization: bearer test-key"),
                "the proxy forwards the caller authorization header"
            );
            let body = "data: hi\n\n";
            let response = format!(
                "HTTP/1.1 200 OK\r\ncontent-type: text/event-stream\r\ncontent-length: {}\r\n\r\n{body}",
                body.len()
            );
            tokio::io::AsyncWriteExt::write_all(&mut socket, response.as_bytes())
                .await
                .expect("write the sse response");
        });

        let mut events = Vec::new();
        let request = ProxyRequest {
            url: format!("http://{address}/v1/chat/completions"),
            method: "POST".to_owned(),
            headers: vec![HeaderPair {
                name: "Authorization".to_owned(),
                value: "Bearer test-key".to_owned(),
            }],
            body: Some(base64::engine::general_purpose::STANDARD.encode(b"{\"model\":\"custom\"}")),
        };
        let result = tokio::time::timeout(
            Duration::from_secs(5),
            execute(request, |event| {
                events.push(event);
                Ok(())
            }),
        )
        .await;

        assert!(
            result.is_ok(),
            "the local endpoint answered before the timeout"
        );
        result
            .expect("timeout result")
            .expect("proxy request succeeds");
        assert!(
            matches!(events.first(), Some(ProxyEvent::Head { status: 200, .. })),
            "the status line is delivered before the body"
        );
        let body = events.iter().fold(String::new(), |mut body, event| {
            if let ProxyEvent::Chunk { data } = event {
                let bytes = base64::engine::general_purpose::STANDARD
                    .decode(data)
                    .expect("chunk is base64");
                body.push_str(&String::from_utf8(bytes).expect("sse body is utf-8"));
            }
            body
        });
        assert_eq!(body, "data: hi\n\n", "sse bytes are forwarded unchanged");
        assert!(
            matches!(events.last(), Some(ProxyEvent::End)),
            "the stream closes after the body"
        );
    }

    async fn read_http_request(socket: &mut tokio::net::TcpStream) -> String {
        let mut received = Vec::new();
        let mut buffer = [0u8; 1024];
        loop {
            let read = tokio::io::AsyncReadExt::read(socket, &mut buffer)
                .await
                .expect("read the incoming request");
            assert!(read > 0, "the client closed before sending a request");
            received.extend_from_slice(&buffer[..read]);
            let text = String::from_utf8_lossy(&received);
            let Some(header_end) = text.find("\r\n\r\n") else {
                continue;
            };
            let headers = &text[..header_end];
            let content_length = headers.lines().find_map(|line| {
                let (name, value) = line.split_once(':')?;
                name.eq_ignore_ascii_case("content-length")
                    .then(|| value.trim().parse::<usize>().ok())
                    .flatten()
            });
            let body_start = header_end + 4;
            if received.len() >= body_start + content_length.unwrap_or(0) {
                return text.into_owned();
            }
        }
    }
}
