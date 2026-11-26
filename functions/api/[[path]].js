/**
 * Cloudflare Pages Function — First-Party API Proxy (/api/*)
 * Khi website chuyển lên Cloudflare Pages (fpttelecomvn.click),
 * Function này giúp gọi cùng domain (/api/chat, /api/lead, /api/poll, /api/leads)
 * hoặc chuyển tiếp trực tiếp qua Service Binding CHATBOT_WORKER / Worker URL.
 */

const DEFAULT_WORKER_ORIGIN = "https://man-chatbot.tvm19624.workers.dev";

export async function onRequest(context) {
  const { request, env } = context;
  const incomingUrl = new URL(request.url);
  const targetOrigin = (env.WORKER_ORIGIN || DEFAULT_WORKER_ORIGIN).replace(
    /\/+$/,
    "",
  );
  const targetUrl = `${targetOrigin}${incomingUrl.pathname}${incomingUrl.search}`;

  // Bảo toàn Client IP thực qua header CF-Connecting-IP và Authorization
  const forwardHeaders = new Headers(request.headers);
  const clientIp = request.headers.get("CF-Connecting-IP");
  if (clientIp) {
    forwardHeaders.set("X-Forwarded-For", clientIp);
  }

  const init = {
    method: request.method,
    headers: forwardHeaders,
    redirect: "follow",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  // Ưu tiên dùng Cloudflare Service Binding nếu đã cấu hình trong Dashboard
  if (env.CHATBOT_WORKER && typeof env.CHATBOT_WORKER.fetch === "function") {
    return env.CHATBOT_WORKER.fetch(new Request(targetUrl, init));
  }

  return fetch(targetUrl, init);
}
