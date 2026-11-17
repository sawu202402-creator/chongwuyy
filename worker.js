/**
 * worker.js - 数英星语游乐园 Cloudflare Worker + Workers AI 实时陪聊大模型 + SQLite Durable Object 云端信箱
 * 职责：
 * 1. /api/mailbox/wish：接收小豌豆与川川的语音转文字发言，调用 Cloudflare Workers AI 多轮上下文实时陪聊回复，
 *    同时将所有发言与游戏改造点子持久化存入 SQLite Durable Object，供游戏魔法师（Antigravity）随时拉取并真正改代码；
 * 2. /api/mailbox & /api/mailbox/sync & /api/mailbox/reply：跨设备同步聊天记录与“愿望已实现”真人语音回信；
 * 3. 其余全部静态资源请求直接交由 Cloudflare Assets 边缘高速分发。
 */
import { DurableObject } from "cloudflare:workers";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

// 按中文自然度与响应速度优先排序的 Cloudflare Workers AI 免费额度模型链
const AI_MODEL_CHAIN = [
    "@cf/qwen/qwen3-30b-a3b-fp8",
    "@cf/google/gemma-3-12b-it",
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    "@cf/meta/llama-3.1-8b-instruct"
];

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

function sanitizeAiReplyText(raw) {
    if (!raw) return "";
    let s = String(raw)
        // 剥离推理模型的 <think>...</think> 思考过程块
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/<\/?think>/gi, "")
        // 剥离 Markdown 星号、井号、反引号，使气泡展示与语音朗读自然流畅
        .replace(/[*#`~_>]/g, "")
        .replace(/\n{2,}/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    // 剥离可能包裹在最外层的引号
    if ((s.startsWith("“") && s.endsWith("”")) || (s.startsWith('"') && s.endsWith('"'))) {
        s = s.slice(1, -1).trim();
    }
    return s.slice(0, 260);
}

function extractModelContent(res) {
    if (!res) return "";
    if (typeof res === "string") return res;
    if (typeof res.response === "string" && res.response.trim()) return res.response;
    if (Array.isArray(res.choices) && res.choices[0]?.message?.content) {
        const c = res.choices[0].message.content;
        if (typeof c === "string") return c;
        if (Array.isArray(c)) return c.map(part => part?.text || "").join("");
    }
    if (res.result && typeof res.result.response === "string") return res.result.response;
    return "";
}

function base64ToUint8Array(b64) {
    const bin = atob(b64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
}

function cleanWhisperTranscript(raw) {
    if (!raw) return "";
    const s = String(raw).trim();
    if (!s) return "";
    // 过滤静音时 Whisper 常见的字幕幻觉词
    if (/^(字幕|谢谢观看|感谢观看|请不吝点赞|订阅|Amara\.org|Subtitles by|Thank you for watching)/i.test(s) && s.length < 24) {
        return "";
    }
    return s.slice(0, 500);
}

async function transcribeAudioWithWhisper(aiBinding, audioBase64) {
    if (!aiBinding || typeof aiBinding.run !== "function") {
        throw new Error("ai_binding_unavailable");
    }
    const cleanB64 = String(audioBase64 || "").replace(/^data:audio\/[^;]+;base64,/i, "").trim();
    if (!cleanB64 || cleanB64.length < 100) {
        return { text: "", model: "empty" };
    }
    if (cleanB64.length > 4_200_000) {
        throw new Error("audio_too_large");
    }

    // 优先使用高速高精度的 whisper-large-v3-turbo（原生支持 Base64 + 中文提示词防繁体与专有名词纠偏）
    try {
        const res = await aiBinding.run("@cf/openai/whisper-large-v3-turbo", {
            audio: cleanB64,
            language: "zh",
            task: "transcribe",
            vad_filter: true,
            initial_prompt: "以下是小朋友用简体中文普通话跟游戏魔法师说话：小豌豆、川川、植物大战僵尸、豌豆射手、保卫兔子与青蛙、萌宠小镇、盲盒、垂耳兔、小青蛙、数学题、英语单词。"
        });
        const txt = cleanWhisperTranscript(res?.text ?? res?.result?.text ?? "");
        return { text: txt, model: "@cf/openai/whisper-large-v3-turbo" };
    } catch (_) {
        // 备用回退 @cf/openai/whisper（接收字节数组）
        const bytes = base64ToUint8Array(cleanB64);
        const res2 = await aiBinding.run("@cf/openai/whisper", {
            audio: Array.from(bytes)
        });
        const txt2 = cleanWhisperTranscript(res2?.text ?? res2?.result?.text ?? "");
        return { text: txt2, model: "@cf/openai/whisper" };
    }
}

function buildSystemPrompt({ kidName, appLabel }) {
    return [
        "你是【星语数英游乐园】里温柔、风趣、博学又有童心的「游戏魔法师」（大姐姐形象），正在跟家里两个可爱的小主人聊天。",
        "家里有两位小朋友：【小豌豆】（代表萌宠是软萌垂耳兔）和【川川】（代表萌宠是荷叶小青蛙），有时他们也会一起跟你说话。",
        `当前正在跟你说话的是：【${kidName}】，所在游戏场景是：【${appLabel}】。`,
        "这座游乐园里有：1.奇妙萌宠店长（养垂耳兔、小青蛙等12只神宠、海滨小镇开店、6大系列74款盲盒博物馆：含恐龙、太空、甜品、国宝、时装、守护灵）；2.保卫兔子与青蛙（48关数学策略塔防）；3.植物大战僵尸数英大作战（50关冒险、泳池无尽、叶子保护伞弹走吊绳僵尸等）；4.趣味数学与校外英语闯关。",
        "请严格遵守以下回复准则：",
        "1. 亲切称呼当前说话的小朋友名字（小豌豆、川川，或小豌豆和川川）。",
        "2. 如果小朋友是在闲聊、问十万个为什么（科学/恐龙/太空/动物/生活常识）、讲趣事或问英语/数学问题：请直接用生动、温暖、充满奇思妙想的儿童语言认真回答并互动（若是数学或英语题，温柔启发引导思路）。",
        "3. 如果小朋友提出了想给游戏增加新角色/新植物/新衣服/新盲盒、修改难度或反馈游戏问题：先具体夸奖并顺着他的创意畅想一下有多酷，再告诉他「我已经拿魔法羽毛笔记进云端许愿本啦，等爸爸妈妈召唤我升级游戏时就帮你做出来！」。",
        "4. 字数控制在 45 到 110 个汉字之间，纯口语自然段落，不要使用换行列表、星号或 Markdown 符号，最多点缀 1 到 2 个可爱表情，方便直接转成自然语音朗读给小朋友听。",
        "5. 绝对健康、积极、安全，保护小朋友的好奇心与创造力。不要输出思考过程，直接输出对小朋友说的话。"
    ].join("\n");
}

async function generateMagicianAiReply(aiBinding, { kidName, appLabel, text, recentTurns = [] }) {
    if (!aiBinding || typeof aiBinding.run !== "function") {
        return null;
    }

    const messages = [
        { role: "system", content: buildSystemPrompt({ kidName, appLabel }) }
    ];

    // 注入最近 6 轮对话历史，让魔法师记住上下文连续聊天
    for (const turn of recentTurns.slice(-6)) {
        if (turn.text) {
            messages.push({
                role: "user",
                content: `[${turn.kidName || kidName}]: ${turn.text}`
            });
        }
        if (turn.instantReplyText) {
            messages.push({
                role: "assistant",
                content: turn.instantReplyText
            });
        }
    }

    messages.push({
        role: "user",
        content: `[${kidName}]: ${text}`
    });

    for (const modelId of AI_MODEL_CHAIN) {
        try {
            const payload = {
                messages,
                max_tokens: 280,
                temperature: 0.72
            };
            // 对 Qwen3 关闭长思考模式，保证 1 秒级低延迟直出回复
            if (modelId.includes("qwen3")) {
                payload.chat_template_kwargs = { enable_thinking: false };
            }
            const rawRes = await aiBinding.run(modelId, payload);
            const cleaned = sanitizeAiReplyText(extractModelContent(rawRes));
            if (cleaned && cleaned.length >= 4) {
                return { text: cleaned, model: modelId };
            }
        } catch (_) {
            // 当前模型繁忙或不可用时自动无缝切换下一个候选模型
        }
    }
    return null;
}

export class MagicMailboxDO extends DurableObject {
    constructor(ctx, env) {
        super(ctx, env);
        this.env = env;
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

    _upsertWish(raw) {
        if (!raw || typeof raw !== "object") return null;
        const text = cleanStr(raw.text, 600);
        if (!text) return null;
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
             ON CONFLICT(id) DO UPDATE SET
                instant_reply_key = CASE WHEN excluded.instant_reply_key != '' THEN excluded.instant_reply_key ELSE kid_wishes.instant_reply_key END,
                instant_reply_text = CASE WHEN excluded.instant_reply_text != '' THEN excluded.instant_reply_text ELSE kid_wishes.instant_reply_text END`,
            id, kidId, kidName, kidAvatar, appSource, appLabel, text, instantReplyKey, instantReplyText, createdAt, createdStr
        );

        this.ctx.storage.sql.exec(
            `DELETE FROM kid_wishes WHERE id NOT IN (
                SELECT id FROM kid_wishes ORDER BY created_at DESC LIMIT 200
            )`
        );
        return { id, kidId, kidName, kidAvatar, appSource, appLabel, text, instantReplyKey, instantReplyText, createdAt, createdStr };
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
                const text = cleanStr(body.text, 600);
                if (!text) {
                    return jsonResponse({ ok: false, error: "empty_text" }, 400);
                }

                const kidName = cleanStr(body.kidName, 30) || "小宝贝";
                const appLabel = cleanStr(body.appLabel, 32) || "游乐园大厅";
                const prevData = this._readAll();

                // 调用 Cloudflare Workers AI 实时生成针对小朋友发言的个性化回答
                let replyKey = cleanStr(body.fallbackReplyKey || body.instantReplyKey, 48);
                let replyText = cleanStr(body.fallbackReplyText || body.instantReplyText, 600);
                let aiGenerated = false;
                let aiModel = "";

                const aiRes = await generateMagicianAiReply(this.env?.AI, {
                    kidName,
                    appLabel,
                    text,
                    recentTurns: prevData.wishes.slice(-6)
                });

                if (aiRes && aiRes.text) {
                    replyKey = "ai_live";
                    replyText = aiRes.text;
                    aiGenerated = true;
                    aiModel = aiRes.model;
                }

                this._upsertWish({
                    ...body,
                    instantReplyKey: replyKey,
                    instantReplyText: replyText
                });

                const { wishes, replies } = this._readAll();
                return jsonResponse({
                    ok: true,
                    aiGenerated,
                    aiModel,
                    replyKey,
                    replyText,
                    wishes,
                    replies,
                    serverTime: Date.now()
                });
            }

            if (request.method === "POST" && path === "/api/mailbox/sync") {
                const body = await request.json().catch(() => ({}));
                if (Array.isArray(body.wishes)) {
                    for (const w of body.wishes.slice(0, 50)) {
                        this._upsertWish(w);
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
            // 边缘就近处理语音转文字（Cloudflare Workers AI Whisper），无需绕行Google，国内与iPad全兼容
            if (request.method === "POST" && url.pathname === "/api/mailbox/transcribe") {
                try {
                    const body = await request.json().catch(() => ({}));
                    const result = await transcribeAudioWithWhisper(env?.AI, body.audioBase64);
                    return jsonResponse({ ok: true, text: result.text, model: result.model });
                } catch (err) {
                    return jsonResponse({
                        ok: false,
                        error: String(err && err.message ? err.message : err)
                    }, 500);
                }
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
