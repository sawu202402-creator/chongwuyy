#!/usr/bin/env node
/**
 * scripts/mailbox_cli.mjs - 🪄 游戏魔法师（Antigravity）专用云端信箱收发与真人语音回信工具
 *
 * 用法：
 *   1. 绑定线上网址（只需一次）：
 *      node scripts/mailbox_cli.mjs set-url https://chongwuyy.xxx.workers.dev
 *   2. 拉取查看小豌豆与川川最新语音留言：
 *      node scripts/mailbox_cli.mjs pull [--url https://...]
 *   3. 生成真人语音 MP3 并写入回信（同时支持静态写入 letters.js 与实时推送云端）：
 *      node scripts/mailbox_cli.mjs reply --to <wishId> --kid <pea|chuan|both> --badge "🎉 愿望已实现！" --text "回信内容..."
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = '/home/better/IdeaProjects/chongwuyy';
const CONFIG_FILE = path.join(ROOT, '.mailbox-config.json');
const LETTERS_FILE = path.join(ROOT, 'shared', 'aiReplies', 'letters.js');
const AUDIO_DIR = path.join(ROOT, 'shared', 'aiReplies', 'audio');

function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }
    } catch (_) {}
    return { baseUrl: '' };
}

function saveConfig(cfg) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
}

function parseArgs(argv) {
    const out = { _: [] };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith('--')) {
            const key = a.slice(2);
            const next = argv[i + 1];
            if (next && !next.startsWith('--')) {
                out[key] = next;
                i++;
            } else {
                out[key] = true;
            }
        } else {
            out._.push(a);
        }
    }
    return out;
}

function normalizeUrl(u) {
    if (!u) return '';
    let s = String(u).trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    return s;
}

function nowTimeStr() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${mm}/${dd} ${hh}:${mi}`;
}

async function cmdPull(args) {
    const cfg = loadConfig();
    const baseUrl = normalizeUrl(args.url || process.env.MAILBOX_URL || cfg.baseUrl);
    if (!baseUrl) {
        console.error('❌ 尚未配置线上游乐园网址！请先运行：\n   node scripts/mailbox_cli.mjs set-url https://<你的线上网址>');
        process.exit(1);
    }
    if (args.url && baseUrl !== cfg.baseUrl) {
        saveConfig({ ...cfg, baseUrl });
    }

    const res = await fetch(`${baseUrl}/api/mailbox`, {
        headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const wishes = Array.isArray(data.wishes) ? data.wishes : [];
    const replies = Array.isArray(data.replies) ? data.replies : [];

    console.log(`\n🪄 云端魔法信箱同步成功 (${baseUrl})`);
    console.log(`   共收到留言 ${wishes.length} 条 · 云端已发回信 ${replies.length} 封\n`);

    if (wishes.length === 0) {
        console.log('📭 目前还没有新的小朋友语音留言哦！');
        return;
    }

    for (const w of wishes) {
        const statusTag = w.status === 'fulfilled' ? '✅[已实现]' : (w.status === 'read' ? '👀[已读]' : '🌟[新消息]');
        console.log(`${statusTag} [${w.createdStr}] ${w.kidAvatar} ${w.kidName} (📍${w.appLabel}) [ID: ${w.id}]`);
        console.log(`   💬 小朋友说：“${w.text}”`);
        if (w.instantReplyText) {
            const tag = w.instantReplyKey === 'ai_live' ? '🧠 AI实时陪聊' : '⚡ 预置回应';
            console.log(`   ${tag}：“${w.instantReplyText}”`);
        }
        console.log('');
    }
}

async function cmdReply(args) {
    const text = String(args.text || '').trim();
    if (!text) {
        console.error('❌ 请提供 --text "回信内容"');
        process.exit(1);
    }
    const id = args.id || `reply_${Date.now()}`;
    const replyToId = String(args.to || '');
    const targetKid = String(args.kid || 'both');
    const badgeTitle = String(args.badge || '🎉 愿望已实现！');
    const createdStr = nowTimeStr();
    const audioFile = `${id}.mp3`;
    const audioPath = path.join(AUDIO_DIR, audioFile);

    fs.mkdirSync(AUDIO_DIR, { recursive: true });

    // 1. 使用 edge-tts 生成温柔自然的真人语音 MP3
    const edgeBin = '/tmp/tts_venv/bin/edge-tts';
    if (fs.existsSync(edgeBin) && !args['skip-tts']) {
        console.log(`🎙️ 正在生成游戏魔法师真人语音: ${audioFile} ...`);
        execFileSync(edgeBin, [
            '--voice', 'zh-CN-XiaoxiaoNeural',
            '--rate=+4%',
            '--pitch=+2Hz',
            '--text', text,
            '--write-media', audioPath
        ], { stdio: 'inherit' });
    }

    // 2. 写入 shared/aiReplies/letters.js 永久保存
    const entry = {
        id,
        replyToId,
        targetKid,
        senderName: '游戏魔法师',
        badgeTitle,
        createdAt: Date.now(),
        createdStr,
        audioFile: fs.existsSync(audioPath) ? audioFile : '',
        text
    };

    if (fs.existsSync(LETTERS_FILE)) {
        const src = fs.readFileSync(LETTERS_FILE, 'utf8');
        const marker = 'export const MAGICIAN_LETTERS = [';
        const idx = src.indexOf(marker);
        if (idx !== -1) {
            const insertPos = idx + marker.length;
            const formatted = `\n    ${JSON.stringify(entry, null, 4).replace(/\n/g, '\n    ')},`;
            const updated = src.slice(0, insertPos) + formatted + src.slice(insertPos);
            fs.writeFileSync(LETTERS_FILE, updated, 'utf8');
            console.log(`📝 已写入静态语音回信库 shared/aiReplies/letters.js (${id})`);
        }
    }

    // 3. 若已绑定云端网址且未禁用 --no-cloud，同步推送云端（纯文字与线上已存在音频即时生效）
    const cfg = loadConfig();
    const baseUrl = normalizeUrl(args.url || process.env.MAILBOX_URL || cfg.baseUrl);
    if (baseUrl && !args['no-cloud']) {
        try {
            const res = await fetch(`${baseUrl}/api/mailbox/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...entry,
                    audioUrl: entry.audioFile ? `shared/aiReplies/audio/${entry.audioFile}` : ''
                })
            });
            if (res.ok) {
                console.log(`☁️ 已同步推送到云端魔法信箱 (${baseUrl})`);
            }
        } catch (err) {
            console.warn(`⚠️ 云端即时推送跳过（将于 git push 后随静态部署自动生效）: ${err.message}`);
        }
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const cmd = args._[0] || 'pull';

    if (cmd === 'set-url') {
        const url = normalizeUrl(args._[1] || args.url);
        if (!url) {
            console.error('❌ 用法: node scripts/mailbox_cli.mjs set-url https://...');
            process.exit(1);
        }
        const cfg = loadConfig();
        saveConfig({ ...cfg, baseUrl: url });
        console.log(`✅ 已保存线上游乐园网址: ${url}`);
        return;
    }

    if (cmd === 'pull') {
        await cmdPull(args);
        return;
    }

    if (cmd === 'reply') {
        await cmdReply(args);
        return;
    }

    console.log('支持的命令: set-url | pull | reply');
}

main().catch(err => {
    console.error('❌ 执行出错:', err.message || err);
    process.exit(1);
});
