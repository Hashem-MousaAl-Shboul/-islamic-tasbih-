// functions/scheduler.ts — daily morning/evening adhkar reminder scheduler.
//
// A singleton Durable Object ("RemindersScheduler", id "global") keeps one
// SQLite row per device push token and sweeps every 15 minutes via a platform
// alarm (env.DO.setAlarm). For each registration whose local time falls inside
// the current sweep window, it sends a push through the Expo Push API, then
// re-arms the alarm. Delivery is deduped per (token, slot, local date), so
// alarm retries never double-send. Once per day, the sweep also prunes
// registrations whose device has not re-registered in 90 days.

import { DurableObject } from "cloudflare:workers";

const SWEEP_INTERVAL_MS = 15 * 60_000;

/** Registrations not re-registered within this window are purged. */
const STALE_AFTER_MS = 90 * 24 * 60 * 60_000;
/** Stale-cleanup runs at most once per day, inside the regular sweep. */
const CLEANUP_INTERVAL_MS = 24 * 60 * 60_000;

/** Hard cap on stored device registrations — prevents unbounded table growth. */
const MAX_REGISTRATIONS = 5000;
/** Largest request body the routes will accept. */
const MAX_BODY_BYTES = 16_384;

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const ANDROID_CHANNEL_ID = "adhkar-reminders";
const ACCENT_COLOR = "#D4A853";

export interface Registration {
  push_token: string;
  user_id: string | null;
  locale: string;
  morning_enabled: number;
  morning_hour: number;
  morning_minute: number;
  morning_title: string;
  morning_body: string;
  evening_enabled: number;
  evening_hour: number;
  evening_minute: number;
  evening_title: string;
  evening_body: string;
  tz_offset_minutes: number;
  last_morning_key: string | null;
  last_evening_key: string | null;
}

type Env = {
  DO: Fetcher & {
    setAlarm(className: string, id: string, scheduledTime: number | Date): Promise<void>;
    getAlarm(className: string, id: string): Promise<number | null>;
    deleteAlarm(className: string, id: string): Promise<void>;
  };
  EXPO_ACCESS_TOKEN?: string;
};

interface SlotConfig {
  enabled: boolean;
  hour: number;
  minute: number;
  title: string;
  body: string;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? Math.round(value) : parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function str(value: unknown, maxLen: number, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return value.slice(0, maxLen);
}

// Expo push tokens come in two shapes: ExponentPushToken[uuid] (Expo Go /
// older clients) and ExpoPushToken[hex] (EAS builds). Anything else is garbage.
const EXPO_PUSH_TOKEN_RE = /^Expo(nent)?PushToken\[[A-Za-z0-9_-]{8,}\]$/;

function isValidPushToken(token: string): boolean {
  return EXPO_PUSH_TOKEN_RE.test(token);
}

export class RemindersScheduler extends DurableObject<Env> {
  /** In-memory sliding-window rate limiter: key -> hit timestamps. */
  private rateHits = new Map<string, number[]>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS registrations (
        push_token TEXT PRIMARY KEY,
        user_id TEXT,
        locale TEXT NOT NULL DEFAULT '',
        morning_enabled INTEGER NOT NULL DEFAULT 0,
        morning_hour INTEGER NOT NULL DEFAULT 6,
        morning_minute INTEGER NOT NULL DEFAULT 0,
        morning_title TEXT NOT NULL DEFAULT '',
        morning_body TEXT NOT NULL DEFAULT '',
        evening_enabled INTEGER NOT NULL DEFAULT 0,
        evening_hour INTEGER NOT NULL DEFAULT 18,
        evening_minute INTEGER NOT NULL DEFAULT 0,
        evening_title TEXT NOT NULL DEFAULT '',
        evening_body TEXT NOT NULL DEFAULT '',
        tz_offset_minutes INTEGER NOT NULL DEFAULT 0,
        last_morning_key TEXT,
        last_evening_key TEXT,
        updated_at INTEGER NOT NULL DEFAULT 0
      )
    `);
  }

  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    // Accept both the stripped sub-path (/register) and the public path
    // (/reminders/register) depending on how the request was dispatched.
    const path = url.pathname.replace(/^\/reminders/, "") || "/";

    if (request.method === "POST" && path === "/register") {
      if (!this.allow(request, "register", 10, 5 * 60_000)) {
        return Response.json({ ok: false, error: "too many requests" }, { status: 429 });
      }
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) {
        return Response.json({ ok: false, error: "payload too large" }, { status: 413 });
      }
      let body: Record<string, unknown>;
      try {
        body = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        return Response.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
      }
      const token = str(body.pushToken, 512);
      if (!token) return Response.json({ ok: false, error: "pushToken is required" }, { status: 400 });
      if (!isValidPushToken(token)) {
        return Response.json({ ok: false, error: "invalid pushToken format" }, { status: 400 });
      }
      // Enforce the registration cap for new tokens only; existing devices
      // keep being able to update their schedule.
      const exists =
        this.ctx.storage.sql
          .exec("SELECT 1 FROM registrations WHERE push_token = ? LIMIT 1", token)
          .toArray().length > 0;
      if (!exists && this.activeCount() >= MAX_REGISTRATIONS) {
        return Response.json({ ok: false, error: "registration limit reached" }, { status: 429 });
      }

      const morning: SlotConfig = this.parseSlot(body.morning, 6, 0);
      const evening: SlotConfig = this.parseSlot(body.evening, 18, 0);

      this.ctx.storage.sql.exec(
        `INSERT INTO registrations (
           push_token, user_id, locale,
           morning_enabled, morning_hour, morning_minute, morning_title, morning_body,
           evening_enabled, evening_hour, evening_minute, evening_title, evening_body,
           tz_offset_minutes, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(push_token) DO UPDATE SET
           user_id = excluded.user_id,
           locale = excluded.locale,
           morning_enabled = excluded.morning_enabled,
           morning_hour = excluded.morning_hour,
           morning_minute = excluded.morning_minute,
           morning_title = excluded.morning_title,
           morning_body = excluded.morning_body,
           evening_enabled = excluded.evening_enabled,
           evening_hour = excluded.evening_hour,
           evening_minute = excluded.evening_minute,
           evening_title = excluded.evening_title,
           evening_body = excluded.evening_body,
           tz_offset_minutes = excluded.tz_offset_minutes,
           updated_at = excluded.updated_at`,
        token,
        str(body.userId, 128) || null,
        str(body.locale, 12),
        morning.enabled ? 1 : 0,
        morning.hour,
        morning.minute,
        morning.title,
        morning.body,
        evening.enabled ? 1 : 0,
        evening.hour,
        evening.minute,
        evening.title,
        evening.body,
        clampInt(body.tzOffsetMinutes, -840, 840, 0),
        Date.now(),
      );

      await this.ensureAlarmArmed();
      return Response.json({ ok: true });
    }

    if (request.method === "POST" && path === "/unregister") {
      if (!this.allow(request, "unregister", 10, 5 * 60_000)) {
        return Response.json({ ok: false, error: "too many requests" }, { status: 429 });
      }
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) {
        return Response.json({ ok: false, error: "payload too large" }, { status: 413 });
      }
      let body: Record<string, unknown>;
      try {
        body = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        body = {};
      }
      const token = str(body.pushToken, 512);
      if (isValidPushToken(token)) {
        this.ctx.storage.sql.exec("DELETE FROM registrations WHERE push_token = ?", token);
      }
      const count = this.activeCount();
      if (count === 0) {
        await this.env.DO.deleteAlarm("RemindersScheduler", this.ownId());
      }
      return Response.json({ ok: true });
    }

    if (request.method === "POST" && path === "/test") {
      // Strictly limited: a test push reaches an arbitrary device, so it must
      // not be usable to spam.
      if (!this.allow(request, "test", 5, 60 * 60_000)) {
        return Response.json({ ok: false, error: "too many requests" }, { status: 429 });
      }
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) {
        return Response.json({ ok: false, error: "payload too large" }, { status: 413 });
      }
      let body: Record<string, unknown>;
      try {
        body = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        body = {};
      }
      const token = str(body.pushToken, 512);
      if (!token) return Response.json({ ok: false, error: "pushToken is required" }, { status: 400 });
      if (!isValidPushToken(token)) {
        return Response.json({ ok: false, error: "invalid pushToken format" }, { status: 400 });
      }
      const delay = clampInt(body.delaySeconds, 1, 3600, 10);
      // A test alarm overwrites the sweep alarm; onAlarm always re-arms the
      // sweep afterwards, so this is safe.
      await this.env.DO.setAlarm("RemindersScheduler", this.ownId(), Date.now() + delay * 1000);
      await this.ctx.storage.put("test", { token, at: Date.now() });
      return Response.json({ ok: true, firesAt: Date.now() + delay * 1000 });
    }

    // No public listing endpoint: registration data is per-device and must
    // never be readable by third parties.
    return new Response(`not found: ${request.method} ${path}`, { status: 404 });
  }

  async onAlarm(info: { scheduledTime: number; retryCount: number; isRetry: boolean }): Promise<void> {
    await this.cleanupStaleRegistrations();

    const pendingTest = await this.ctx.storage.get<{ token: string; at: number }>("test");
    if (pendingTest && typeof pendingTest.token === "string" && pendingTest.token.length > 0) {
      await this.ctx.storage.delete("test");
      await this.sendPush(
        pendingTest.token,
        "Sabbah / صباح",
        "Test reminder — push reminders are working ✅",
        pendingTest.token,
      );
    }

    const now = Date.now();
    const rows = this.ctx.storage.sql
      .exec<Registration>("SELECT * FROM registrations")
      .toArray();

    for (const row of rows) {
      const tz = row.tz_offset_minutes;
      // Shift "now" into the device's local time, then read local date/time.
      const localNow = new Date(now + tz * 60_000);
      const localDateKey = localNow.toISOString().slice(0, 10);
      const localDayStartUtcMs = Date.UTC(
        localNow.getUTCFullYear(),
        localNow.getUTCMonth(),
        localNow.getUTCDate(),
      );

      for (const slot of ["morning", "evening"] as const) {
        const enabled = slot === "morning" ? row.morning_enabled : row.evening_enabled;
        if (!enabled) continue;

        const hour = slot === "morning" ? row.morning_hour : row.evening_hour;
        const minute = slot === "morning" ? row.morning_minute : row.evening_minute;
        const title = slot === "morning" ? row.morning_title : row.evening_title;
        const body = slot === "morning" ? row.morning_body : row.evening_body;
        const lastKey = slot === "morning" ? row.last_morning_key : row.last_evening_key;

        // Due time for this slot today, in real UTC ms (undo the tz shift).
        const dueRealMs = localDayStartUtcMs + hour * 3_600_000 + minute * 60_000 - tz * 60_000;
        const isDue = now >= dueRealMs && now < dueRealMs + SWEEP_INTERVAL_MS;
        if (!isDue || lastKey === localDateKey) continue;

        const sent = await this.sendPush(row.push_token, title, body, row.push_token);
        // Mark as sent even when the push API rejects an unknown device, so we
        // never retry the same slot all day; sweep retries (at-least-once)
        // also land here because the key is now set.
        this.ctx.storage.sql.exec(
          slot === "morning"
            ? "UPDATE registrations SET last_morning_key = ? WHERE push_token = ?"
            : "UPDATE registrations SET last_evening_key = ? WHERE push_token = ?",
          localDateKey,
          row.push_token,
        );
        if (!sent) {
          console.warn(`[scheduler] push failed for ${row.push_token.slice(-12)} (${slot})`);
        }
      }
    }

    if (this.activeCount() > 0 || pendingTest) {
      await this.ensureAlarmArmed();
    }
    void info;
  }

  /**
   * Purges registrations from devices that have not re-registered in 90 days
   * (app uninstalled without unregistering, etc.). Runs at most once per day
   * inside the regular sweep to keep the table light.
   */
  private async cleanupStaleRegistrations(): Promise<void> {
    const last = await this.ctx.storage.get<number>("lastCleanupAt");
    const now = Date.now();
    if (last && now - last < CLEANUP_INTERVAL_MS) return;

    const cutoff = now - STALE_AFTER_MS;
    const stale = this.ctx.storage.sql
      .exec<{ n: number }>(
        "SELECT COUNT(*) AS n FROM registrations WHERE updated_at < ?",
        cutoff,
      )
      .toArray();
    const count = stale[0]?.n ?? 0;
    if (count > 0) {
      this.ctx.storage.sql.exec("DELETE FROM registrations WHERE updated_at < ?", cutoff);
      console.log(`[scheduler] pruned ${count} stale registration(s) older than 90 days`);
    }
    await this.ctx.storage.put("lastCleanupAt", now);
  }

  /** Sliding-window limiter. Returns false when the caller is over quota. */
  private allow(request: Request, action: string, limit: number, windowMs: number): boolean {
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const key = `${action}:${ip}`;
    const now = Date.now();
    const hits = (this.rateHits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (hits.length >= limit) {
      this.rateHits.set(key, hits);
      return false;
    }
    hits.push(now);
    this.rateHits.set(key, hits);
    if (this.rateHits.size > 2000) {
      for (const [k, v] of this.rateHits) {
        if (!v.some((t) => now - t < windowMs)) this.rateHits.delete(k);
      }
    }
    return true;
  }

  private parseSlot(raw: unknown, fallbackHour: number, fallbackMinute: number): SlotConfig {
    const slot = (raw ?? {}) as Record<string, unknown>;
    return {
      enabled: slot.enabled === true,
      hour: clampInt(slot.hour, 0, 23, fallbackHour),
      minute: clampInt(slot.minute, 0, 59, fallbackMinute),
      title: str(slot.title, 160),
      body: str(slot.body, 240),
    };
  }

  private ownId(): string {
    return this.ctx.id.name || "global";
  }

  private activeCount(): number {
    const result = this.ctx.storage.sql
      .exec<{ n: number }>("SELECT COUNT(*) AS n FROM registrations")
      .toArray();
    return result[0]?.n ?? 0;
  }

  private async ensureAlarmArmed(): Promise<void> {
    const existing = await this.env.DO.getAlarm("RemindersScheduler", this.ownId());
    const now = Date.now();
    if (existing === null || existing - now > SWEEP_INTERVAL_MS || existing <= now) {
      await this.env.DO.setAlarm("RemindersScheduler", this.ownId(), now + SWEEP_INTERVAL_MS);
    }
  }

  private async sendPush(token: string, title: string, body: string, pushToken: string): Promise<boolean> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (this.env.EXPO_ACCESS_TOKEN) {
        headers.Authorization = `Bearer ${this.env.EXPO_ACCESS_TOKEN}`;
      }

      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          to: token,
          title,
          body,
          sound: "default",
          channelId: ANDROID_CHANNEL_ID,
          color: ACCENT_COLOR,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { data?: { status?: string; details?: { error?: string } } }
        | null;

      if (!response.ok) {
        console.warn(`[scheduler] expo push http ${response.status}`, JSON.stringify(payload));
        return false;
      }

      const ticket = payload?.data;
      if (ticket?.status === "error") {
        const reason = ticket.details?.error ?? "unknown";
        console.warn(`[scheduler] expo push ticket error: ${reason}`);
        if (reason === "DeviceNotRegistered") {
          this.ctx.storage.sql.exec("DELETE FROM registrations WHERE push_token = ?", pushToken);
        }
        return false;
      }

      console.log(`[scheduler] push sent to ...${token.slice(-12)}: "${title}"`);
      return true;
    } catch (e) {
      console.warn("[scheduler] expo push request failed:", e);
      return false;
    }
  }
}
