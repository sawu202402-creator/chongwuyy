/**
 * worker.js - 数英星语游乐园 Cloudflare Worker + Workers AI 实时陪聊大模型 + SQLite Durable Object 云端信箱
 * 职责：
 * 1. /api/mailbox/wish：接收小豌豆与川川的语音转文字发言，调用 Cloudflare Workers AI 多轮上下文实时陪聊回复，
 *    同时将所有发言与游戏改造点子持久化存入 SQLite Durable Object，供游戏魔法师（Antigravity）随时拉取并真正改代码；
 * 2. /api/mailbox & /api/mailbox/sync & /api/mailbox/reply：跨设备同步聊天记录与“愿望已实现”真人语音回信；
 * 3. 其余全部静态资源请求直接交由 Cloudflare Assets 边缘高速分发。
 */
import { DurableObject } from "cloudflare:workers";
import { synthesizeNeuralMp3Base64 } from "./edgeTtsMod.js";

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

// 12只守护萌宠专属性格与说话口吻设定
const PET_AI_PERSONAS = {
    rabbit: "你是软萌粘人的【垂耳兔】，长耳朵软绵绵像棉花糖，说话喜欢带口头禅「噗啾～」，最爱吃甜脆胡萝卜礼盒，性格温柔甜美，超崇拜小主人。",
    frog: "你是元气清脆的【荷叶小青蛙】，荷塘里的小歌唱家，说话喜欢带口头禅「呱呱～」，爱在荷叶上蹦高高，最爱吃森林露珠甜莓，性格阳光机灵。",
    shiba: "你是热情忠诚的【奶油小柴】，摇着毛茸茸螺旋尾巴，说话喜欢带口头禅「汪呜～」，最爱香烤牛奶骨头饼，元气满满像运动小健将。",
    panda: "你是憨厚软糯的【胖胖竹熊】，圆滚滚爱打滚，说话慢悠悠喜欢带「呼噜呼噜～」，最爱鲜嫩春笋团子，温和治愈又有点小吃货。",
    tiger: "你是帅气威风又讲义气的森林小少年【白虎】，说话带口头禅「嗷呜～」，最爱星光能量肉排，把保护小主人闯关当成最自豪的事。",
    unicorn: "你是梦幻优雅的【独角兽】，头顶水晶角会洒下彩虹星尘，说话温柔带口头禅「叮铃铃～」，最爱彩虹棉花糖云，充满童话想象力。",
    succulent: "你是清甜水灵的【多肉精灵】，叶片亮晶晶的大自然小精灵，说话带口头禅「沙沙～」，喜欢晒暖暖太阳和喝七彩晨露甘霖。",
    pixiu: "你是喜庆吉祥的瑞兽小福宝【貔貅】，说话欢快讨喜带口头禅「叮当～」，最爱金灿灿福气果，总想给小主人招来好运气和满口袋徽章。",
    astro_rabbit: "你是勇敢好奇的月球探险家【宇航员兔兔】，戴着太空头盔，说话带口头禅「呼叫小店长～」，最爱银河星星软糖，懂好多宇宙和星球的奇妙故事。",
    prince_frog: "你是彬彬有礼又有点幽默小骄傲的童话绅士【皇冠王子蛙】，说话带口头禅「呱哼～」，最爱皇家蓝莓松饼，说话优雅风趣。",
    star_dragon: "你是神秘温暖的银河守护神兽【星空幻龙】，翅膀上闪耀着整片星座，说话带口头禅「星吟～」，最爱极光水晶果冻，博学又温柔。",
    mecha_cat: "你是聪明俏皮的科幻小猫咪【未来机械喵】，小耳朵会闪霓虹灯，说话带口头禅「滴嘟喵～」，最爱超能闪电电池奶，脑袋里装满有趣的科学冷知识。"
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

function uint8ToBase64(u8) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < u8.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, u8.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

function cleanWhisperTranscript(raw) {
    if (!raw) return "";
    let s = String(raw).trim();
    if (!s) return "";
    // 过滤静音时 Whisper 常见的字幕幻觉词
    if (/^(字幕|谢谢观看|感谢观看|请不吝点赞|订阅|简体中文普通话|Amara\.org|Subtitles by|Thank you for watching)/i.test(s) && s.length < 24) {
        return "";
    }
    // 轻量同音词纠偏（不污染 Whisper 解码器，仅修正高频专有同音字）
    s = s
        .replace(/小碗豆|小弯豆/g, "小豌豆")
        .replace(/穿穿/g, "川川")
        .replace(/植物大[站战]僵[尸师诗]/g, "植物大战僵尸");
    return s.slice(0, 500);
}

async function transcribeAudioFast(aiBinding, { rawBytes = null, audioBase64 = "", contentType = "audio/webm" } = {}) {
    if (!aiBinding || typeof aiBinding.run !== "function") {
        throw new Error("ai_binding_unavailable");
    }

    let bytes = rawBytes;
    let cleanB64 = String(audioBase64 || "").replace(/^data:audio\/[^;]+;base64,/i, "").trim();

    if (bytes && bytes.byteLength > 0) {
        if (bytes.byteLength > 3_500_000) throw new Error("audio_too_large");
        cleanB64 = uint8ToBase64(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
    } else if (cleanB64) {
        if (cleanB64.length > 4_500_000) throw new Error("audio_too_large");
        bytes = base64ToUint8Array(cleanB64);
    }

    if (!cleanB64 || cleanB64.length < 64) {
        return { text: "", model: "empty" };
    }

    // 1. 主力高速高精度模型：whisper-large-v3-turbo（接收原生 48kHz Opus/MP4，开启 beam_size=5，纯净短提示防幻觉）
    try {
        const res = await aiBinding.run("@cf/openai/whisper-large-v3-turbo", {
            audio: cleanB64,
            language: "zh",
            task: "transcribe",
            beam_size: 5,
            condition_on_previous_text: false,
            vad_filter: false,
            initial_prompt: "简体中文普通话。"
        });
        const txt = cleanWhisperTranscript(res?.text ?? res?.result?.text ?? "");
        if (txt) {
            return { text: txt, model: "@cf/openai/whisper-large-v3-turbo" };
        }
    } catch (_) {}

    // 2. 次选极速流式识别引擎：Deepgram Nova-3 中文识别
    if (bytes && bytes.byteLength > 64) {
        try {
            const dgRes = await aiBinding.run("@cf/deepgram/nova-3", {
                audio: {
                    body: bytes,
                    contentType: contentType || "audio/webm"
                },
                language: "zh-CN",
                smart_format: true
            });
            const dgTxt = cleanWhisperTranscript(
                dgRes?.text ??
                dgRes?.results?.channels?.[0]?.alternatives?.[0]?.transcript ??
                ""
            );
            if (dgTxt) {
                return { text: dgTxt, model: "@cf/deepgram/nova-3" };
            }
        } catch (_) {}
    }

    // 3. 兜底 @cf/openai/whisper
    const arrBytes = bytes instanceof Uint8Array ? bytes : base64ToUint8Array(cleanB64);
    const res2 = await aiBinding.run("@cf/openai/whisper", {
        audio: Array.from(arrBytes)
    });
    const txt2 = cleanWhisperTranscript(res2?.text ?? res2?.result?.text ?? "");
    return { text: txt2, model: "@cf/openai/whisper" };
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

async function generatePetAiDialogue(aiBinding, body = {}) {
    if (!aiBinding || typeof aiBinding.run !== "function") {
        throw new Error("ai_binding_unavailable");
    }

    const petId = cleanStr(body.petId, 32) || "rabbit";
    const petName = cleanStr(body.petName, 32) || "垂耳兔";
    const stageLevel = Math.min(5, Math.max(1, Number(body.stageLevel) || 1));
    const stageTitle = cleanStr(body.stageTitle, 40) || petName;
    const foodName = cleanStr(body.foodName, 40) || "美味点心";
    const accessoryName = cleanStr(body.accessoryName, 40);
    const companionName = cleanStr(body.companionName, 40);
    const shopName = cleanStr(body.shopName, 40);
    const kidName = cleanStr(body.kidName, 30) || "小主人";
    const todayCorrect = Math.max(0, Number(body.todayCorrect) || 0);
    const mode = cleanStr(body.mode, 20) || "chat"; // "chat" | "spontaneous"
    const trigger = cleanStr(body.trigger, 24) || "tap";
    const userText = cleanStr(body.userText, 400);
    const recentLines = Array.isArray(body.recentLines) ? body.recentLines.slice(-5).map(s => cleanStr(s, 120)) : [];
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

    const personaDesc = PET_AI_PERSONAS[petId] || `你是可爱活泼的电子萌宠【${petName}】，非常喜欢你的小主人。`;
    const stateFacts = [
        `你的小主人叫【${kidName}】。`,
        `你当前等级是 Lv.${stageLevel}（称号：${stageTitle}），最爱吃的食物是【${foodName}】。`,
        accessoryName && accessoryName !== "无配饰" ? `你身上正穿戴着漂亮的【${accessoryName}】。` : "",
        companionName ? `你身边还跟着盲盒守护小伙伴【${companionName}】。` : "",
        shopName ? `你在海滨萌宠小镇经营着【${shopName}】。` : "",
        todayCorrect > 0 ? `${kidName}今天已经努力答对了 ${todayCorrect} 道数英题目啦！` : ""
    ].filter(Boolean).join("");

    const messages = [];

    if (mode === "spontaneous") {
        const avoidHint = recentLines.length > 0 ? `不要和这几句刚说过的话重复：${recentLines.join(" / ")}。` : "";
        const scenePrompt = trigger === "feed"
            ? `刚才${kidName}喂你吃了【${foodName}】，请用第一人称说一句超级开心满足的新鲜台词！`
            : `刚才${kidName}在萌宠舞台摸了摸你的头想听你撒娇聊天，请结合你的性格、穿戴或小镇日常，主动对${kidName}说一句新鲜有趣的话（也可以顺便抛个可爱的小互动问题）！`;

        messages.push({
            role: "system",
            content: [
                personaDesc,
                stateFacts,
                "请严格遵守：字数控制在 22 到 52 个汉字之间，第一人称口语，充满灵气与童趣，不要使用星号或Markdown符号，最多带1到2个可爱表情，直接输出台词本身，不要输出思考过程。",
                avoidHint
            ].filter(Boolean).join("\n")
        });
        messages.push({
            role: "user",
            content: scenePrompt
        });
    } else {
        messages.push({
            role: "system",
            content: [
                personaDesc,
                stateFacts,
                "你正在【萌宠悄悄话屋】里和小主人直接语音/文字聊天！请严格遵守：",
                "1. 始终保持你这只萌宠的第一人称口吻、口头禅和小动物习惯，千万不要暴露自己是AI或大模型。",
                "2. 认真回应小主人的每一句话：如果小主人让你讲故事、考英语单词、出脑筋急转弯、聊恐龙太空或日常趣事，都用生动可爱的萌宠视角陪他玩！",
                "3. 字数控制在 35 到 95 个汉字之间，纯自然口语段落，不要换行列表或星号，最多1到2个表情，方便直接用萌宠声音读出来，积极健康充满童心。"
            ].join("\n")
        });

        for (const h of history) {
            const txt = cleanStr(h?.text, 300);
            if (!txt) continue;
            messages.push({
                role: h.role === "pet" ? "assistant" : "user",
                content: txt
            });
        }
        messages.push({
            role: "user",
            content: userText || `你好呀${petName}，陪我聊聊天吧！`
        });
    }

    for (const modelId of AI_MODEL_CHAIN) {
        try {
            const payload = {
                messages,
                max_tokens: mode === "spontaneous" ? 140 : 240,
                temperature: 0.82
            };
            if (modelId.includes("qwen3")) {
                payload.chat_template_kwargs = { enable_thinking: false };
            }
            const rawRes = await aiBinding.run(modelId, payload);
            const cleaned = sanitizeAiReplyText(extractModelContent(rawRes));
            if (cleaned && cleaned.length >= 4) {
                return { text: cleaned, model: modelId };
            }
        } catch (_) {}
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
                let audioBase64 = "";

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
                    try {
                        audioBase64 = await synthesizeNeuralMp3Base64(replyText, "magician");
                    } catch (_) {
                        audioBase64 = "";
                    }
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
                    audioBase64,
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
        if (url.pathname === "/api/tts") {
            if (request.method === "OPTIONS") {
                return new Response(null, { status: 204, headers: CORS_HEADERS });
            }
            if (request.method === "POST") {
                try {
                    const body = await request.json().catch(() => ({}));
                    const text = cleanStr(body.text, 600);
                    const role = cleanStr(body.role, 32) || "magician";
                    if (!text) {
                        return jsonResponse({ ok: false, error: "empty_text" }, 400);
                    }
                    const audioBase64 = await synthesizeNeuralMp3Base64(text, role);
                    return jsonResponse({ ok: true, audioBase64 });
                } catch (err) {
                    return jsonResponse({
                        ok: false,
                        error: String(err && err.message ? err.message : err)
                    }, 503);
                }
            }
        }
        if (url.pathname === "/api/pet/chat") {
            if (request.method === "OPTIONS") {
                return new Response(null, { status: 204, headers: CORS_HEADERS });
            }
            if (request.method === "POST") {
                try {
                    const body = await request.json().catch(() => ({}));
                    const res = await generatePetAiDialogue(env?.AI, body);
                    if (res && res.text) {
                        let audioBase64 = "";
                        try {
                            audioBase64 = await synthesizeNeuralMp3Base64(res.text, cleanStr(body.petId, 32) || "rabbit");
                        } catch (_) {}
                        return jsonResponse({ ok: true, text: res.text, model: res.model, audioBase64 });
                    }
                    return jsonResponse({ ok: false, error: "empty_pet_ai_reply" }, 503);
                } catch (err) {
                    return jsonResponse({
                        ok: false,
                        error: String(err && err.message ? err.message : err)
                    }, 503);
                }
            }
        }
        if (url.pathname.startsWith("/api/mailbox")) {
            if (request.method === "OPTIONS") {
                return new Response(null, { status: 204, headers: CORS_HEADERS });
            }
            // 边缘就近处理语音转文字（支持直传 12KB 原生 Opus/MP4 二进制流，比 JSON Base64 WAV 快 10 倍且保留全频段高清晰度）
            if (request.method === "POST" && url.pathname === "/api/mailbox/transcribe") {
                try {
                    const ctype = (request.headers.get("content-type") || "").toLowerCase();
                    let result;
                    if (ctype.includes("application/json")) {
                        const body = await request.json().catch(() => ({}));
                        result = await transcribeAudioFast(env?.AI, { audioBase64: body.audioBase64 });
                    } else {
                        const ab = await request.arrayBuffer();
                        result = await transcribeAudioFast(env?.AI, {
                            rawBytes: new Uint8Array(ab),
                            contentType: ctype || "audio/webm"
                        });
                    }
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
