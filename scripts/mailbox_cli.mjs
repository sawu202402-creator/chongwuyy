#!/usr/bin/env node
/**
 * scripts/mailbox_cli.mjs - 🪄 游戏魔法师（Antigravity）专用云端信箱收发工具
 *
 * 用法：
 *   1. 绑定线上网址（只需一次）：
 *      node scripts/mailbox_cli.mjs set-url https://52shuxue.cc
 *   2. 拉取查看小豌豆与川川最新语音留言：
 *      node scripts/mailbox_cli.mjs pull [--url https://...]
 *   3. 直接推送文字回信到云端（前端直接调 /api/tts 实时神经网络朗读，无需预合成静态 MP3）：
 *      node scripts/mailbox_cli.mjs reply --to <wishId> --kid <pea|chuan|both> --badge "🎉 愿望已实现！" --text "回信内容..."
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/home/better/IdeaProjects/chongwuyy';
const CONFIG_FILE = path.join(ROOT, '.mailbox-config.json');

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
    const cfg = loadConfig();
    const baseUrl = normalizeUrl(args.url || process.env.MAILBOX_URL || cfg.baseUrl);
    if (!baseUrl) {
        console.error('❌ 尚未配置线上游乐园网址！请先运行 set-url');
        process.exit(1);
    }

    const id = args.id || `reply_${Date.now()}`;
    const replyToId = String(args.to || '');
    const targetKid = String(args.kid || 'both');
    const badgeTitle = String(args.badge || '🎉 愿望已实现！');
    const createdStr = nowTimeStr();

    const entry = {
        id,
        replyToId,
        targetKid,
        senderName: '游戏魔法师',
        badgeTitle,
        createdAt: Date.now(),
        createdStr,
        audioUrl: '', // 前端直接走 /api/tts 动态合成朗读文字，无需静态 MP3
        text
    };

    const res = await fetch(`${baseUrl}/api/mailbox/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    console.log(`☁️ 已推送纯文字回信到云端魔法信箱 (${baseUrl}) [ID: ${id}]，前端将直接通过 /api/tts 实时朗读！`);
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
