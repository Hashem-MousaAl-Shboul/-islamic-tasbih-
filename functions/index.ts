// functions/index.ts — entrypoint for the Sabbah backend.
//
// Routes for the daily adhkar reminder scheduler (Cloudflare Durable Object
// sweeping every 15 minutes and sending pushes via the Expo Push API):
//   POST /reminders/register   { pushToken, userId?, locale?, tzOffsetMinutes, morning, evening }
//   POST /reminders/unregister { pushToken }
//   POST /reminders/test       { pushToken, delaySeconds? }
//   GET  /reminders/list       (debug: current registrations + next alarm)
//   GET  /ping

export { RemindersScheduler } from "./scheduler";

const DO_CLASS = "RemindersScheduler";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type Env = { DO: Fetcher };

function dispatchToScheduler(request: Request, env: Env, path: string): Promise<Response> {
  const wrapped = new Request(`https://internal${path}`, request);
  wrapped.headers.set("X-Rork-DO-Class", DO_CLASS);
  wrapped.headers.set("X-Rork-DO-Id", "global");
  return env.DO.fetch(wrapped);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === "/ping") {
      return Response.json({ ok: true, now: new Date().toISOString() }, { headers: CORS_HEADERS });
    }

    if (url.pathname.startsWith("/reminders/")) {
      const response = await dispatchToScheduler(request, env, url.pathname);
      const headers = new Headers(response.headers);
      for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
      return new Response(response.body, { status: response.status, headers });
    }

    return Response.json({ ok: false, error: "not found" }, { status: 404, headers: CORS_HEADERS });
  },
} satisfies ExportedHandler<Env>;
