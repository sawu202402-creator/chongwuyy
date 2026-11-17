/**
 * worker.js - 数英星语游乐园 Cloudflare Worker + SQLite Durable Object 云端魔法信箱
 * 职责：
 * 1. /api/mailbox* 接口：跨设备同步小豌豆与川川在 iPad 游戏里的语音转文字留言，并接收游戏魔法师的真人级语音回信；
 * 2. 其余全部静态资源请求直接交由 Cloudflare Assets 边缘高速分发。
 */
import { DurableObject } from "cloudflare:workers";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store, no-cache, must-revalidate",
            ...CORS_HEADERS
        }
    });
}

function cleanStr(val, maxLen = 500) {
    if (val === undefined || val === null) return "";
    return String(val).trim().slice(0, maxLen);
}

export class MagicMailboxDO extends DurableObject {
    constructor(ctx, env) {
        super(ctx, env);
        ctx.blockConcurrencyWhile(async () => {
            this.ctx.storage.sql.exec(`
                CREATE TABLE IF NOT EXISTS kid_wishes (
                    id TEXT PRIMARY KEY,
                    kid_id TEXT NOT NULL,
                    kid_name TEXT NOT NULL,
                    kid_avatar TEXT NOT NULL,
                    app_source TEXT NOT NULL,
                    app_label TEXT NOT NULL,
                    text TEXT NOT NULL,
                    instant_reply_key TEXT DEFAULT '',
                    instant_reply_text TEXT DEFAULT '',
                    status TEXT DEFAULT 'pending',
                    created_at INTEGER NOT NULL,
                    created_str TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS magician_replies (
                    id TEXT PRIMARY KEY,
                    reply_to_id TEXT DEFAULT '',
                    target_kid TEXT DEFAULT 'both',
                    sender_name TEXT DEFAULT '游戏魔法师',
                    badge_title TEXT DEFAULT '✨ 魔法师回信',
                    text TEXT NOT NULL,
                    audio_url TEXT DEFAULT '',
                    created_at INTEGER NOT NULL,
                    created_str TEXT NOT NULL
                );
            `);
        });
    }

    _readAll() {
        const wishRows = this.ctx.storage.sql.exec(
            `SELECT id, kid_id AS kidId, kid_name AS kidName, kid_avatar AS kidAvatar,
                    app_source AS appSource, app_label AS appLabel, text,
                    instant_reply_key AS instantReplyKey, instant_reply_text AS instantReplyText,
                    status, created_at AS createdAt, created_str AS createdStr
             FROM kid_wishes
             ORDER BY created_at ASC
             LIMIT 200`
        ).toArray();

        const replyRows = this.ctx.storage.sql.exec(
            `SELECT id, reply_to_id AS replyToId, target_kid AS targetKid,
                    sender_name AS senderName, badge_title AS badgeTitle,
                    text, audio_url AS audioUrl, created_at AS createdAt, created_str AS createdStr
             FROM magician_replies
             ORDER BY created_at ASC
             LIMIT 200`
        ).toArray();

        return { wishes: wishRows, replies: replyRows };
    }

    _insertWish(raw) {
        if (!raw || typeof raw !== "object") return false;
        const text = cleanStr(raw.text, 600);
        if (!text) return false;
        const now = Date.now();
        const id = cleanStr(raw.id, 80) || `wish_${now}_${Math.random().toString(36).slice(2, 7)}`;
        const kidId = cleanStr(raw.kidId, 40) || "child_xiaowandou";
        const kidName = cleanStr(raw.kidName, 30) || "小宝贝";
        const kidAvatar = cleanStr(raw.kidAvatar, 16) || "🐰";
        const appSource = cleanStr(raw.appSource, 24) || "hub";
        const appLabel = cleanStr(raw.appLabel, 32) || "游乐园大厅";
        const instantReplyKey = cleanStr(raw.instantReplyKey, 48);
        const instantReplyText = cleanStr(raw.instantReplyText, 600);
        const createdAt = Number(raw.createdAt) > 0 ? Math.floor(Number(raw.createdAt)) : now;
        const createdStr = cleanStr(raw.createdStr, 32) || new Date(createdAt).toISOString().slice(5, 16).replace("T", " ");

        this.ctx.storage.sql.exec(
            `INSERT INTO kid_wishes
                (id, kid_id, kid_name, kid_avatar, app_source, app_label, text, instant_reply_key, instant_reply_text, status, created_at, created_str)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
             ON CONFLICT(id) DO NOTHING`,
            id, kidId, kidName, kidAvatar, appSource, appLabel, text, instantReplyKey, instantReplyText, createdAt, createdStr
        );

        // 保持最多保留最新 200 条小朋友语音留言
        this.ctx.storage.sql.exec(
            `DELETE FROM kid_wishes WHERE id NOT IN (
                SELECT id FROM kid_wishes ORDER BY created_at DESC LIMIT 200
            )`
        );
        return true;
    }

    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        try {
            if (request.method === "GET" && (path === "/api/mailbox" || path === "/api/mailbox/")) {
                const { wishes, replies } = this._readAll();
                return jsonResponse({ ok: true, wishes, replies, serverTime: Date.now() });
            }

            if (request.method === "POST" && path === "/api/mailbox/wish") {
                const body = await request.json().catch(() => ({}));
                const inserted = this._insertWish(body);
                if (!inserted) {
                    return jsonResponse({ ok: false, error: "empty_text" }, 400);
                }
                const { wishes, replies } = this._readAll();
                return jsonResponse({ ok: true, wishes, replies, serverTime: Date.now() });
            }

            if (request.method === "POST" && path === "/api/mailbox/sync") {
                const body = await request.json().catch(() => ({}));
                if (Array.isArray(body.wishes)) {
                    for (const w of body.wishes.slice(0, 50)) {
                        this._insertWish(w);
                    }
                }
                const { wishes, replies } = this._readAll();
                return jsonResponse({ ok: true, wishes, replies, serverTime: Date.now() });
            }

            if (request.method === "POST" && path === "/api/mailbox/reply") {
                const body = await request.json().catch(() => ({}));
                const text = cleanStr(body.text, 1000);
                if (!text) {
                    return jsonResponse({ ok: false, error: "empty_reply_text" }, 400);
                }
                const now = Date.now();
                const id = cleanStr(body.id, 80) || `reply_${now}`;
                const replyToId = cleanStr(body.replyToId, 200);
                const targetKid = cleanStr(body.targetKid, 32) || "both";
                const senderName = cleanStr(body.senderName, 32) || "游戏魔法师";
                const badgeTitle = cleanStr(body.badgeTitle, 48) || "🎉 愿望已实现";
                const audioUrl = cleanStr(body.audioUrl, 240);
                const createdAt = Number(body.createdAt) > 0 ? Math.floor(Number(body.createdAt)) : now;
                const createdStr = cleanStr(body.createdStr, 32) || new Date(createdAt).toISOString().slice(5, 16).replace("T", " ");

                this.ctx.storage.sql.exec(
                    `INSERT INTO magician_replies
                        (id, reply_to_id, target_kid, sender_name, badge_title, text, audio_url, created_at, created_str)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON CONFLICT(id) DO UPDATE SET
                        reply_to_id = excluded.reply_to_id,
                        target_kid = excluded.target_kid,
                        badge_title = excluded.badge_title,
                        text = excluded.text,
                        audio_url = excluded.audio_url`,
                    id, replyToId, targetKid, senderName, badgeTitle, text, audioUrl, createdAt, createdStr
                );

                if (replyToId) {
                    const ids = replyToId.split(",").map(s => s.trim()).filter(Boolean);
                    for (const wid of ids) {
                        this.ctx.storage.sql.exec(`UPDATE kid_wishes SET status = 'fulfilled' WHERE id = ?`, wid);
                    }
                }

                const { wishes, replies } = this._readAll();
                return jsonResponse({ ok: true, wishes, replies, serverTime: Date.now() });
            }

            if (request.method === "POST" && path === "/api/mailbox/status") {
                const body = await request.json().catch(() => ({}));
                const status = cleanStr(body.status, 24);
                if (Array.isArray(body.ids) && ["pending", "read", "fulfilled"].includes(status)) {
                    for (const wid of body.ids.slice(0, 100)) {
                        this.ctx.storage.sql.exec(`UPDATE kid_wishes SET status = ? WHERE id = ?`, status, cleanStr(wid, 80));
                    }
                }
                if (Array.isArray(body.deleteIds)) {
                    for (const wid of body.deleteIds.slice(0, 100)) {
                        this.ctx.storage.sql.exec(`DELETE FROM kid_wishes WHERE id = ?`, cleanStr(wid, 80));
                    }
                }
                const { wishes, replies } = this._readAll();
                return jsonResponse({ ok: true, wishes, replies, serverTime: Date.now() });
            }

            return jsonResponse({ ok: false, error: "not_found" }, 404);
        } catch (err) {
            return jsonResponse({ ok: false, error: String(err && err.message ? err.message : err) }, 500);
        }
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname.startsWith("/api/mailbox")) {
            if (request.method === "OPTIONS") {
                return new Response(null, { status: 204, headers: CORS_HEADERS });
            }
            if (env && env.MAGIC_MAILBOX) {
                const id = env.MAGIC_MAILBOX.idFromName("chongwuyy-family-room-v1");
                const stub = env.MAGIC_MAILBOX.get(id);
                return stub.fetch(request);
            }
            return jsonResponse({ ok: false, error: "mailbox_binding_unavailable" }, 503);
        }

        if (env && env.ASSETS) {
            return env.ASSETS.fetch(request);
        }
        return new Response("Not Found", { status: 404 });
    }
};
