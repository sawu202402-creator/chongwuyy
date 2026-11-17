/**
 * shared/magicMailbox.js - 🪄 游戏魔法师传声屋（语音输入转文字 + 真人级语音播报 + Cloudflare 云端同步）
 *
 * 核心能力：
 * 1. 让【小豌豆 🐰】与【川川 🐸】（或兄妹俩一起）在任意游戏界面随时点击「🪄 魔法对话」说出自己的新想法；
 * 2. 支持 iPadOS / Safari / Chrome 原生语音识别（SpeechRecognition / webkitSpeechRecognition）实时转文字，
 *    并提供灵感贴纸与可编辑文本框兜底；
 * 3. 秒回互动 + 真实改造双结合：小朋友发送后，0.55 秒内收到点名呼叫“小豌豆/川川”的温柔真人级语音鼓励，
 *    同时自动上传到 Cloudflare Worker + SQLite Durable Object 云端信箱；
 * 4. 当游戏魔法师（Antigravity）真正把小朋友的点子写进游戏并发布回信后，顶部亮起红点与横幅提醒，
 *    点开即可看到金光闪闪的「🎉 愿望已实现！」回信并收听专属真人语音 MP3！
 */

import { profileManager } from './unifiedProfile.js';
import { sharedSpeech } from './audioTTS.js';
import {
    WELCOME_LETTER,
    INSTANT_REPLY_CLIPS,
    MAGICIAN_LETTERS,
    detectSpeakerPrefix,
    matchInstantReply
} from './aiReplies/letters.js';

const MAILBOX_STORAGE_KEY = 'chongwuyy_magic_mailbox_v1';
const AUDIO_BASE_URL = new URL('./aiReplies/audio/', import.meta.url).href;

const APP_LABELS = {
    hub: '游乐园大厅',
    pet: '奇妙萌宠小镇',
    carrot: '保卫兔兔与青蛙',
    pvz: '植物大战僵尸'
};

const INSPIRATION_CHIPS = [
    { icon: '🌱', label: '加新植物/炮塔', prefix: '我想在游戏里新加一个：' },
    { icon: '👗', label: '加萌宠新装扮', prefix: '我想给小萌宠做一件新衣服：' },
    { icon: '🎁', label: '加新盲盒宝贝', prefix: '我希望盲盒里能抽到：' },
    { icon: '📚', label: '题目难度建议', prefix: '我觉得现在的数学或英语题：' },
    { icon: '🛠️', label: '发现小问题', prefix: '魔法师，我发现了一个小问题：' },
    { icon: '👋', label: '找魔法师聊天', prefix: '嗨魔法师！我想跟你说：' }
];

function nowTimeStr() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${mm}/${dd} ${hh}:${mi}`;
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function resolveAudioHref(audioFileOrUrl = '') {
    if (!audioFileOrUrl) return '';
    if (/^https?:\/\//i.test(audioFileOrUrl) || audioFileOrUrl.startsWith('/')) {
        return audioFileOrUrl;
    }
    if (audioFileOrUrl.startsWith('shared/aiReplies/audio/')) {
        const fname = audioFileOrUrl.replace('shared/aiReplies/audio/', '');
        return AUDIO_BASE_URL + fname;
    }
    return AUDIO_BASE_URL + audioFileOrUrl;
}

class MagicMailboxController {
    constructor() {
        this.appSource = 'hub';
        this.onOpenPause = null;
        this.onCloseResume = null;
        this.state = this._loadLocalState();
        this.cloudReplies = [];
        this.cloudOnline = false;
        this.selectedSpeaker = 'pea'; // 'pea' | 'chuan' | 'both'
        this.isOpen = false;
        this.isRecording = false;
        this.recognition = null;
        this._recBaseText = '';
        this._recFinalText = '';
        this._playingKey = null;
        this._audioEl = null;
        this._audioCtx = null;

        this.triggerButtons = new Set();
        this.overlayEl = null;
        this.bannerEl = null;
        this.dom = {};
    }

    _loadLocalState() {
        const fallback = {
            wishes: [],
            readReplyIds: [],
            autoVoice: true,
            welcomePlayed: false
        };
        try {
            const raw = localStorage.getItem(MAILBOX_STORAGE_KEY);
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            return {
                wishes: Array.isArray(parsed.wishes) ? parsed.wishes : [],
                readReplyIds: Array.isArray(parsed.readReplyIds) ? parsed.readReplyIds : [],
                autoVoice: parsed.autoVoice !== false,
                welcomePlayed: Boolean(parsed.welcomePlayed)
            };
        } catch (_) {
            return fallback;
        }
    }

    _saveLocalState() {
        try {
            localStorage.setItem(MAILBOX_STORAGE_KEY, JSON.stringify(this.state));
        } catch (_) {}
    }

    _shouldUseCloudApi() {
        if (typeof window === 'undefined') return false;
        if (window.__ENABLE_LOCAL_MAILBOX_API === true) return true;
        return window.location.protocol === 'https:';
    }

    _syncActiveSpeakerFromProfile() {
        try {
            const u = profileManager.getActiveUser();
            if (u) {
                const p = detectSpeakerPrefix(u.id, u.name);
                if (p === 'pea' || p === 'chuan') {
                    this.selectedSpeaker = p;
                }
            }
        } catch (_) {}
    }

    _getSpeakerMeta(speakerKey = this.selectedSpeaker) {
        const users = profileManager.getUsers ? profileManager.getUsers() : [];
        const peaUser = users.find(u => u.id === 'child_xiaowandou' || /豌豆/.test(u.name));
        const chuanUser = users.find(u => u.id === 'child_chuan' || /川/.test(u.name));

        if (speakerKey === 'chuan') {
            return {
                speakerKey: 'chuan',
                kidId: chuanUser ? chuanUser.id : 'child_chuan',
                kidName: chuanUser ? chuanUser.name : '川川',
                kidAvatar: chuanUser ? chuanUser.avatar : '🐸'
            };
        }
        if (speakerKey === 'both') {
            return {
                speakerKey: 'both',
                kidId: 'both',
                kidName: '小豌豆 & 川川',
                kidAvatar: '🐰🐸'
            };
        }
        return {
            speakerKey: 'pea',
            kidId: peaUser ? peaUser.id : 'child_xiaowandou',
            kidName: peaUser ? peaUser.name : '小豌豆',
            kidAvatar: peaUser ? peaUser.avatar : '🐰'
        };
    }

    _getAllMagicianReplies() {
        const map = new Map();
        for (const item of MAGICIAN_LETTERS) {
            if (item && item.id) {
                map.set(item.id, {
                    ...item,
                    audioHref: resolveAudioHref(item.audioFile || item.audioUrl || '')
                });
            }
        }
        for (const item of this.cloudReplies) {
            if (item && item.id) {
                const prev = map.get(item.id) || {};
                map.set(item.id, {
                    ...prev,
                    ...item,
                    audioHref: resolveAudioHref(item.audioFile || item.audioUrl || prev.audioFile || '')
                });
            }
        }
        return Array.from(map.values()).sort((a, b) => (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0));
    }

    getUnreadRepliesCount() {
        const readSet = new Set(this.state.readReplyIds || []);
        const replies = this._getAllMagicianReplies();
        let unread = replies.filter(r => !readSet.has(r.id)).length;
        if (!this.state.welcomePlayed) {
            unread += 1;
        }
        return unread;
    }

    getUnreadFulfilledReplies() {
        const readSet = new Set(this.state.readReplyIds || []);
        return this._getAllMagicianReplies().filter(r => !readSet.has(r.id));
    }

    /**
     * 在任意游戏页面挂载魔法传声屋入口按钮与弹窗
     */
    init({
        appSource = 'hub',
        mountButton = null,
        insertBeforeEl = null,
        containerEl = null,
        compact = false,
        buttonLabel = '魔法对话',
        onOpenPause = null,
        onCloseResume = null
    } = {}) {
        this.appSource = appSource || 'hub';
        this.onOpenPause = typeof onOpenPause === 'function' ? onOpenPause : null;
        this.onCloseResume = typeof onCloseResume === 'function' ? onCloseResume : null;
        this._syncActiveSpeakerFromProfile();

        if (mountButton) {
            this.bindTriggerButton(mountButton);
        } else if (containerEl) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = 'btnMagicMailbox';
            btn.className = `mm-hud-trigger-btn${compact ? ' mm-compact' : ''}`;
            btn.title = '跟游戏魔法师语音说话提点子，或收听魔法师给小豌豆和川川的语音回信！';
            btn.innerHTML = `
                <span class="mm-hud-trigger-icon">🪄</span>
                <span class="mm-hud-trigger-text">${escapeHtml(buttonLabel)}</span>
                <span class="mm-unread-badge" data-mm-badge style="display:none;">1</span>
            `;
            if (insertBeforeEl && insertBeforeEl.parentNode === containerEl) {
                containerEl.insertBefore(btn, insertBeforeEl);
            } else {
                containerEl.appendChild(btn);
            }
            this.bindTriggerButton(btn);
        }

        this._ensureModalDom();
        this._refreshAllBadges();

        // 后台静默同步云端留言与最新回信
        setTimeout(() => {
            this.syncWithCloud({ silent: true });
        }, 450);

        return this;
    }

    bindTriggerButton(btn) {
        if (!btn || this.triggerButtons.has(btn)) return;
        this.triggerButtons.add(btn);
        btn.addEventListener('click', () => {
            this.open();
        });
        this._refreshAllBadges();
    }

    _refreshAllBadges() {
        const unreadCount = this.getUnreadRepliesCount();
        this.triggerButtons.forEach((btn) => {
            const badge = btn.querySelector('[data-mm-badge]');
            if (badge) {
                if (unreadCount > 0) {
                    badge.style.display = 'inline-flex';
                    badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
                } else {
                    badge.style.display = 'none';
                }
            }
        });

        // 若有真实新回信未读，弹出顶部温馨提示横条
        const realUnread = this.getUnreadFulfilledReplies();
        if (realUnread.length > 0 && !this.isOpen) {
            this._showNewLetterBanner(realUnread[realUnread.length - 1]);
        } else if (this.bannerEl) {
            this.bannerEl.remove();
            this.bannerEl = null;
        }
    }

    _showNewLetterBanner(latestReply) {
        if (this.bannerEl) return;
        const div = document.createElement('div');
        div.className = 'mm-new-letter-banner';
        div.innerHTML = `
            <span>💌 叮咚！游戏魔法师发来了新回信：<strong>${escapeHtml(latestReply.badgeTitle || '愿望已实现')}</strong></span>
            <span class="mm-banner-open-pill">🔊 点我收听</span>
        `;
        div.addEventListener('click', () => {
            div.remove();
            this.bannerEl = null;
            this.open();
        });
        document.body.appendChild(div);
        this.bannerEl = div;
    }

    _ensureModalDom() {
        if (this.overlayEl && document.body.contains(this.overlayEl)) return;

        const overlay = document.createElement('div');
        overlay.className = 'mm-modal-overlay';
        overlay.id = 'magicMailboxOverlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', '游戏魔法师传声屋');

        const chipsHtml = INSPIRATION_CHIPS.map((c, idx) =>
            `<button type="button" class="mm-prompt-chip" data-chip-idx="${idx}">${c.icon} ${escapeHtml(c.label)}</button>`
        ).join('');

        overlay.innerHTML = `
            <div class="mm-dialog-card">
                <header class="mm-dialog-header">
                    <div class="mm-header-left">
                        <div class="mm-magician-orb" aria-hidden="true">🪄</div>
                        <div class="mm-header-titles">
                            <div class="mm-header-title">
                                <span>游戏魔法师 · 奇思妙想对话框</span>
                                <span class="mm-sync-pill" id="mmSyncStatusPill" title="点击立即刷新云端信箱">💾 本地守护中</span>
                            </div>
                            <div class="mm-header-sub">说出你的新想法，魔法师真的会帮小豌豆和川川做进游戏里，还会语音回信哟！</div>
                        </div>
                    </div>

                    <div class="mm-speaker-bar" id="mmSpeakerBar">
                        <span class="mm-speaker-label">我是：</span>
                        <button type="button" class="mm-speaker-chip active" data-speaker="pea">🐰 小豌豆</button>
                        <button type="button" class="mm-speaker-chip" data-speaker="chuan">🐸 川川</button>
                        <button type="button" class="mm-speaker-chip" data-speaker="both">🐰🐸 一起说</button>
                    </div>

                    <div class="mm-header-right">
                        <button type="button" class="mm-auto-voice-btn" id="mmAutoVoiceBtn" title="开关魔法师自动语音播报">🔊 自动语音: 开</button>
                        <button type="button" class="mm-close-btn" id="mmCloseBtn" title="关闭对话框">✕</button>
                    </div>
                </header>

                <div class="mm-chat-stream" id="mmChatStream"></div>

                <footer class="mm-composer-area">
                    <div class="mm-chips-row" id="mmChipsRow">
                        <span class="mm-chip-hint-lbl">✨ 灵感贴纸：</span>
                        ${chipsHtml}
                    </div>

                    <div class="mm-recognizing-banner" id="mmRecBanner">
                        <span id="mmRecBannerText">🎙️ 正在认真听小豌豆说话，说完点红色按钮或直接点发送即可…</span>
                        <span class="mm-rec-live-dots"><span></span><span></span><span></span><span></span></span>
                    </div>

                    <div class="mm-input-controls-row">
                        <button type="button" class="mm-mic-btn" id="mmMicBtn">
                            <span id="mmMicBtnIcon">🎙️</span>
                            <span id="mmMicBtnText">点我说话</span>
                        </button>

                        <div class="mm-text-input-wrap">
                            <textarea
                                id="mmTextInput"
                                class="mm-text-input"
                                rows="1"
                                maxlength="500"
                                placeholder="点左边🎙️大话筒直接说出想法，也可以在这里打字或用键盘🎤听写…"
                            ></textarea>
                            <button type="button" class="mm-clear-input-btn" id="mmClearInputBtn" title="清空输入">✕</button>
                        </div>

                        <button type="button" class="mm-send-btn" id="mmSendBtn" disabled>
                            <span>🚀</span>
                            <span>发送愿望</span>
                        </button>
                    </div>

                    <div class="mm-status-toast">
                        <span id="mmStatusHint">💡 提示：说出想要的植物、炮塔、萌宠新裙子或盲盒，魔法师都能收到！</span>
                        <button type="button" class="mm-copy-backup-btn" id="mmCopyAllWishesBtn">📋 复制全部留言发给爸妈</button>
                    </div>
                </footer>
            </div>
        `;

        document.body.appendChild(overlay);
        this.overlayEl = overlay;

        this.dom = {
            syncPill: overlay.querySelector('#mmSyncStatusPill'),
            speakerBar: overlay.querySelector('#mmSpeakerBar'),
            autoVoiceBtn: overlay.querySelector('#mmAutoVoiceBtn'),
            closeBtn: overlay.querySelector('#mmCloseBtn'),
            chatStream: overlay.querySelector('#mmChatStream'),
            chipsRow: overlay.querySelector('#mmChipsRow'),
            recBanner: overlay.querySelector('#mmRecBanner'),
            recBannerText: overlay.querySelector('#mmRecBannerText'),
            micBtn: overlay.querySelector('#mmMicBtn'),
            micBtnIcon: overlay.querySelector('#mmMicBtnIcon'),
            micBtnText: overlay.querySelector('#mmMicBtnText'),
            textInput: overlay.querySelector('#mmTextInput'),
            clearInputBtn: overlay.querySelector('#mmClearInputBtn'),
            sendBtn: overlay.querySelector('#mmSendBtn'),
            statusHint: overlay.querySelector('#mmStatusHint'),
            copyAllBtn: overlay.querySelector('#mmCopyAllWishesBtn')
        };

        this._bindModalEvents();
        this._updateSpeakerButtons();
        this._updateAutoVoiceBtn();
    }

    _bindModalEvents() {
        const d = this.dom;

        this.overlayEl.addEventListener('click', (e) => {
            if (e.target === this.overlayEl) this.close();
        });

        d.closeBtn.addEventListener('click', () => this.close());

        d.syncPill.addEventListener('click', () => {
            d.statusHint.textContent = '🔄 正在连接云端魔法信箱同步最新消息…';
            this.syncWithCloud({ silent: false, forceAttempt: true });
        });

        d.speakerBar.addEventListener('click', (e) => {
            const chip = e.target.closest('[data-speaker]');
            if (!chip) return;
            this.selectedSpeaker = chip.dataset.speaker;
            this._updateSpeakerButtons();
        });

        d.autoVoiceBtn.addEventListener('click', () => {
            this.state.autoVoice = !this.state.autoVoice;
            this._saveLocalState();
            this._updateAutoVoiceBtn();
            if (!this.state.autoVoice) {
                this.stopAllVoice();
            }
        });

        d.chipsRow.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-chip-idx]');
            if (!btn) return;
            const chip = INSPIRATION_CHIPS[Number(btn.dataset.chipIdx)];
            if (!chip) return;
            const cur = d.textInput.value.trim();
            if (!cur) {
                d.textInput.value = chip.prefix;
            } else if (!cur.startsWith(chip.prefix)) {
                d.textInput.value = `${chip.prefix}${cur}`;
            }
            this._syncInputButtons();
            d.textInput.focus();
        });

        d.textInput.addEventListener('input', () => {
            this._syncInputButtons();
        });

        d.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!d.sendBtn.disabled) {
                    this.submitCurrentWish();
                }
            }
        });

        d.clearInputBtn.addEventListener('click', () => {
            if (this.isRecording) this.stopSpeechRecognition();
            d.textInput.value = '';
            this._recBaseText = '';
            this._recFinalText = '';
            this._syncInputButtons();
            d.textInput.focus();
        });

        d.micBtn.addEventListener('click', () => {
            if (this.isRecording) {
                this.stopSpeechRecognition();
            } else {
                this.startSpeechRecognition();
            }
        });

        d.sendBtn.addEventListener('click', () => {
            this.submitCurrentWish();
        });

        d.chatStream.addEventListener('click', (e) => {
            const playBtn = e.target.closest('[data-mm-play-key]');
            if (!playBtn) return;
            const playKey = playBtn.dataset.mmPlayKey;
            const audioHref = playBtn.dataset.mmAudio || '';
            const text = playBtn.dataset.mmText || '';
            const speaker = playBtn.dataset.mmSpeaker || 'magician';

            if (this._playingKey === playKey) {
                this.stopAllVoice();
                return;
            }

            if (speaker === 'magician') {
                this.playMagicianVoice({ key: playKey, audioHref, text });
            } else {
                this.playKidEchoVoice({ key: playKey, speaker, text });
            }
        });

        d.copyAllBtn.addEventListener('click', async () => {
            const wishes = this.state.wishes || [];
            if (wishes.length === 0) {
                d.statusHint.textContent = '📭 还没有留言记录，先点🎙️大话筒说一句你的奇思妙想吧！';
                return;
            }
            const lines = wishes.slice(-20).map((w, i) =>
                `${i + 1}. [${w.createdStr}] ${w.kidAvatar}${w.kidName} (${w.appLabel}): ${w.text}`
            );
            const fullText = `🪄【小豌豆与川川的游戏愿望清单】\n` + lines.join('\n');
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(fullText);
                    d.statusHint.textContent = `✅ 已复制最近 ${lines.length} 条愿望！可以直接粘贴发给爸爸妈妈或魔法师啦！`;
                } else {
                    throw new Error('clipboard_unavailable');
                }
            } catch (_) {
                d.textInput.value = fullText;
                this._syncInputButtons();
                d.statusHint.textContent = '📋 已整理到输入框中，长按全选即可复制！';
            }
        });
    }

    _updateSpeakerButtons() {
        if (!this.dom.speakerBar) return;
        const meta = this._getSpeakerMeta(this.selectedSpeaker);
        this.dom.speakerBar.querySelectorAll('[data-speaker]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.speaker === this.selectedSpeaker);
        });
        if (this.dom.textInput && !this.isRecording) {
            this.dom.textInput.placeholder = `${meta.kidAvatar} ${meta.kidName}想对游戏魔法师说什么？点左边🎙️说话自动变文字…`;
        }
    }

    _updateAutoVoiceBtn() {
        if (!this.dom.autoVoiceBtn) return;
        if (this.state.autoVoice) {
            this.dom.autoVoiceBtn.textContent = '🔊 自动语音: 开';
            this.dom.autoVoiceBtn.classList.remove('mm-muted');
        } else {
            this.dom.autoVoiceBtn.textContent = '🔇 自动语音: 关';
            this.dom.autoVoiceBtn.classList.add('mm-muted');
        }
    }

    _syncInputButtons() {
        if (!this.dom.textInput) return;
        const hasText = this.dom.textInput.value.trim().length > 0;
        this.dom.sendBtn.disabled = !hasText;
        this.dom.clearInputBtn.classList.toggle('mm-visible', hasText);
    }

    open() {
        this._ensureModalDom();
        this._syncActiveSpeakerFromProfile();
        this._updateSpeakerButtons();

        if (this.bannerEl) {
            this.bannerEl.remove();
            this.bannerEl = null;
        }

        if (this.onOpenPause) {
            try { this.onOpenPause(); } catch (_) {}
        }

        this.isOpen = true;
        this.overlayEl.classList.add('mm-open');

        // 记录进入前未读的真实回信，用于自动播报最新回信
        const unreadRealReplies = this.getUnreadFulfilledReplies();
        const firstTimeWelcome = !this.state.welcomePlayed;

        // 标记所有当前可见回信与欢迎信已读
        this.state.welcomePlayed = true;
        const allReplies = this._getAllMagicianReplies();
        const readSet = new Set(this.state.readReplyIds || []);
        allReplies.forEach(r => readSet.add(r.id));
        this.state.readReplyIds = Array.from(readSet);
        this._saveLocalState();
        this._refreshAllBadges();

        this.renderChatStream();

        // 打开时同步一次云端最新回信
        this.syncWithCloud({ silent: true });

        // 自动播报：若有未读的“愿望已实现”真实回信，优先播报最新一封；否则首次打开播报欢迎信
        if (this.state.autoVoice) {
            if (unreadRealReplies.length > 0) {
                const newest = unreadRealReplies[unreadRealReplies.length - 1];
                setTimeout(() => {
                    if (this.isOpen) {
                        this.playMagicianVoice({
                            key: `reply_${newest.id}`,
                            audioHref: newest.audioHref,
                            text: newest.text
                        });
                    }
                }, 260);
            } else if (firstTimeWelcome) {
                setTimeout(() => {
                    if (this.isOpen) {
                        this.playMagicianVoice({
                            key: 'welcome_01',
                            audioHref: resolveAudioHref(WELCOME_LETTER.audioFile),
                            text: WELCOME_LETTER.text
                        });
                    }
                }, 260);
            }
        }
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        if (this.isRecording) {
            this.stopSpeechRecognition();
        }
        this.stopAllVoice();
        if (this.overlayEl) {
            this.overlayEl.classList.remove('mm-open');
        }
        if (this.onCloseResume) {
            try { this.onCloseResume(); } catch (_) {}
        }
    }

    renderChatStream() {
        const stream = this.dom.chatStream;
        if (!stream) return;

        const wishes = Array.isArray(this.state.wishes) ? this.state.wishes : [];
        const wishById = new Map(wishes.map(w => [w.id, w]));
        const replies = this._getAllMagicianReplies();

        // 合并构建时间线事件：1. 置顶欢迎信；2. 小朋友愿望 + 即时秒回；3. 魔法师真实改造回信
        const timeline = [];
        for (const w of wishes) {
            timeline.push({
                sortTs: Number(w.createdAt) || 0,
                kind: 'kid_wish',
                wish: w
            });
            if (w.instantReplyText) {
                const clip = INSTANT_REPLY_CLIPS[w.instantReplyKey];
                timeline.push({
                    sortTs: (Number(w.createdAt) || 0) + 1,
                    kind: 'instant_reply',
                    key: `inst_${w.id}`,
                    createdStr: w.createdStr,
                    text: w.instantReplyText,
                    audioHref: clip ? resolveAudioHref(clip.audioFile) : ''
                });
            }
        }

        for (const r of replies) {
            const quotedWish = r.replyToId ? wishById.get(r.replyToId.split(',')[0].trim()) : null;
            timeline.push({
                sortTs: Number(r.createdAt) || Date.now(),
                kind: 'magician_reply',
                reply: r,
                quotedWish
            });
        }

        timeline.sort((a, b) => a.sortTs - b.sortTs);

        const htmlParts = [];

        // 1. 置顶欢迎语音卡
        const welcomeAudio = resolveAudioHref(WELCOME_LETTER.audioFile);
        htmlParts.push(this._renderMagicianBubble({
            playKey: 'welcome_01',
            badgeClass: 'mm-tag-welcome',
            badgeText: WELCOME_LETTER.badgeTitle,
            timeStr: WELCOME_LETTER.createdStr,
            text: WELCOME_LETTER.text,
            audioHref: welcomeAudio,
            isSpecial: false
        }));

        // 2. 动态时间线
        for (const item of timeline) {
            if (item.kind === 'kid_wish') {
                htmlParts.push(this._renderKidBubble(item.wish));
            } else if (item.kind === 'instant_reply') {
                htmlParts.push(this._renderMagicianBubble({
                    playKey: item.key,
                    badgeClass: 'mm-tag-instant',
                    badgeText: '⚡ 魔法工坊秒收',
                    timeStr: item.createdStr,
                    text: item.text,
                    audioHref: item.audioHref,
                    isSpecial: false
                }));
            } else if (item.kind === 'magician_reply') {
                const r = item.reply;
                htmlParts.push(this._renderMagicianBubble({
                    playKey: `reply_${r.id}`,
                    badgeClass: 'mm-tag-fulfilled',
                    badgeText: r.badgeTitle || '🎉 愿望已实现！',
                    timeStr: r.createdStr || '',
                    text: r.text,
                    audioHref: r.audioHref || '',
                    isSpecial: true,
                    quotedWish: item.quotedWish
                }));
            }
        }

        stream.innerHTML = htmlParts.join('');
        stream.scrollTop = stream.scrollHeight;
        this._syncPlayingBtnHighlight();
    }

    _renderMagicianBubble({ playKey, badgeClass, badgeText, timeStr, text, audioHref, isSpecial, quotedWish = null }) {
        const quoteHtml = quotedWish
            ? `<div class="mm-quote-wish">🌟 回应 ${escapeHtml(quotedWish.kidAvatar)} ${escapeHtml(quotedWish.kidName)} 的愿望：“${escapeHtml(quotedWish.text)}”</div>`
            : '';

        return `
            <div class="mm-msg-row mm-from-magician${isSpecial ? ' mm-is-special-reply' : ''}">
                <div class="mm-avatar-circle" aria-hidden="true">🪄</div>
                <div class="mm-bubble-wrap">
                    <div class="mm-meta-line">
                        <span>游戏魔法师</span>
                        <span class="mm-badge-tag ${badgeClass}">${escapeHtml(badgeText)}</span>
                        <span>${escapeHtml(timeStr)}</span>
                    </div>
                    <div class="mm-bubble-box">
                        ${quoteHtml}
                        <div>${escapeHtml(text)}</div>
                        <button
                            type="button"
                            class="mm-voice-play-btn"
                            data-mm-play-key="${escapeHtml(playKey)}"
                            data-mm-speaker="magician"
                            data-mm-audio="${escapeHtml(audioHref)}"
                            data-mm-text="${escapeHtml(text)}"
                        >
                            <span class="mm-wave-bars"><i></i><i></i><i></i><i></i></span>
                            <span class="mm-play-lbl">🔊 点我听语音</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    _renderKidBubble(wish) {
        const spk = detectSpeakerPrefix(wish.kidId, wish.kidName);
        const isFulfilled = wish.status === 'fulfilled';
        const statusHtml = isFulfilled
            ? `<span class="mm-badge-tag mm-tag-fulfilled">🌟 魔法师已实现！</span>`
            : (wish.syncedCloud
                ? `<span class="mm-badge-tag mm-tag-cloud">☁️ 已送达魔法师</span>`
                : `<span class="mm-badge-tag mm-tag-cloud">📮 已记入许愿本</span>`);

        const playKey = `kid_${wish.id}`;
        return `
            <div class="mm-msg-row mm-from-kid mm-kid-${spk}">
                <div class="mm-avatar-circle" aria-hidden="true">${escapeHtml(wish.kidAvatar || '🐰')}</div>
                <div class="mm-bubble-wrap">
                    <div class="mm-meta-line">
                        <span>${escapeHtml(wish.kidName || '小宝贝')}</span>
                        <span>📍${escapeHtml(wish.appLabel || '游乐园')}</span>
                        <span>${escapeHtml(wish.createdStr || '')}</span>
                        ${statusHtml}
                    </div>
                    <div class="mm-bubble-box">
                        <div>${escapeHtml(wish.text)}</div>
                        <button
                            type="button"
                            class="mm-voice-play-btn"
                            data-mm-play-key="${escapeHtml(playKey)}"
                            data-mm-speaker="${spk}"
                            data-mm-audio=""
                            data-mm-text="${escapeHtml(wish.text)}"
                        >
                            <span class="mm-wave-bars"><i></i><i></i><i></i><i></i></span>
                            <span class="mm-play-lbl">🔊 读我的话</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /* ==================== 语音识别转文字 (Speech-to-Text) ==================== */
    startSpeechRecognition() {
        const SpeechRec = typeof window !== 'undefined'
            ? (window.SpeechRecognition || window.webkitSpeechRecognition)
            : null;

        // 开始录音前先停掉正在播放的语音，避免话筒把自己播报的声音录进去
        this.stopAllVoice();

        if (!SpeechRec) {
            this.dom.statusHint.textContent = '💡 当前浏览器不支持直接语音按钮，请点输入框后按 iPad 键盘左下角的小话筒 🎤 说话转文字哦！';
            this.dom.textInput.focus();
            return;
        }

        try {
            if (this.recognition) {
                try { this.recognition.abort(); } catch (_) {}
                this.recognition = null;
            }

            const meta = this._getSpeakerMeta(this.selectedSpeaker);
            const rec = new SpeechRec();
            rec.lang = 'zh-CN';
            rec.continuous = true;
            rec.interimResults = true;
            rec.maxAlternatives = 1;

            this._recBaseText = this.dom.textInput.value.trim();
            if (this._recBaseText && !/[：:，,。！？!\s]$/.test(this._recBaseText)) {
                this._recBaseText += '，';
            }
            this._recFinalText = '';

            rec.onstart = () => {
                this.isRecording = true;
                this._playSparkleTone([523.25, 659.25]);
                this.dom.micBtn.classList.add('mm-recording');
                this.dom.micBtnIcon.textContent = '⏹️';
                this.dom.micBtnText.textContent = '说完点此';
                this.dom.recBanner.classList.add('mm-active');
                this.dom.recBannerText.textContent = `🎙️ 正在听 ${meta.kidAvatar} ${meta.kidName} 说话（边说边变文字，说完点红色按钮或直接点发送）…`;
            };

            rec.onresult = (event) => {
                let interim = '';
                let newlyFinal = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const res = event.results[i];
                    const transcript = res[0] ? res[0].transcript : '';
                    if (res.isFinal) {
                        newlyFinal += transcript;
                    } else {
                        interim += transcript;
                    }
                }
                if (newlyFinal) {
                    this._recFinalText += newlyFinal;
                }
                const combined = `${this._recBaseText}${this._recFinalText}${interim}`.slice(0, 500);
                this.dom.textInput.value = combined;
                this._syncInputButtons();
            };

            rec.onerror = (event) => {
                const errCode = event && event.error ? event.error : '';
                if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
                    this.dom.statusHint.textContent = '⚠️ 请在浏览器弹窗中点“允许使用麦克风”，或点输入框后按 iPad 键盘左下角 🎤 听写！';
                } else if (errCode === 'no-speech') {
                    this.dom.statusHint.textContent = '🎙️ 刚才没听清小宝贝的声音，靠近一点再按大话筒说一次吧～';
                } else if (errCode !== 'aborted') {
                    this.dom.statusHint.textContent = '💡 语音识别已结束，可以直接检查文字或使用键盘 🎤 补充哦！';
                }
            };

            rec.onend = () => {
                this.isRecording = false;
                this.dom.micBtn.classList.remove('mm-recording');
                this.dom.micBtnIcon.textContent = '🎙️';
                this.dom.micBtnText.textContent = '点我说话';
                this.dom.recBanner.classList.remove('mm-active');
                this._syncInputButtons();
            };

            this.recognition = rec;
            rec.start();
        } catch (err) {
            this.isRecording = false;
            this.dom.statusHint.textContent = '💡 请点输入框后使用 iPad 键盘左下角的小话筒 🎤 语音输入哦！';
            this.dom.textInput.focus();
        }
    }

    stopSpeechRecognition() {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (_) {}
        }
        this.isRecording = false;
        if (this.dom.micBtn) {
            this.dom.micBtn.classList.remove('mm-recording');
            this.dom.micBtnIcon.textContent = '🎙️';
            this.dom.micBtnText.textContent = '点我说话';
            this.dom.recBanner.classList.remove('mm-active');
        }
    }

    /* ==================== 提交愿望 + 真人语音秒回 + 云端投递 ==================== */
    async submitCurrentWish() {
        if (this.isRecording) {
            this.stopSpeechRecognition();
        }
        const rawText = this.dom.textInput ? this.dom.textInput.value.trim() : '';
        if (!rawText) return;

        const meta = this._getSpeakerMeta(this.selectedSpeaker);
        const matchedClip = matchInstantReply({
            kidId: meta.kidId,
            kidName: meta.kidName,
            text: rawText
        });

        const now = Date.now();
        const wish = {
            id: `wish_${now}_${Math.random().toString(36).slice(2, 6)}`,
            kidId: meta.kidId,
            kidName: meta.kidName,
            kidAvatar: meta.kidAvatar,
            appSource: this.appSource,
            appLabel: APP_LABELS[this.appSource] || '游乐园大厅',
            text: rawText,
            instantReplyKey: matchedClip.key,
            instantReplyText: matchedClip.text,
            status: 'pending',
            syncedCloud: false,
            createdAt: now,
            createdStr: nowTimeStr()
        };

        this.state.wishes.push(wish);
        if (this.state.wishes.length > 150) {
            this.state.wishes = this.state.wishes.slice(-150);
        }
        this._saveLocalState();

        // 清空输入框并播放魔法投递水晶音效
        this.dom.textInput.value = '';
        this._recBaseText = '';
        this._recFinalText = '';
        this._syncInputButtons();
        this._playSparkleTone([587.33, 783.99, 1046.5]);

        this.renderChatStream();
        this.dom.statusHint.textContent = `✨ 已收到 ${meta.kidAvatar} ${meta.kidName} 的好点子，正在飞向云端魔法工坊…`;

        // 0.5 秒后自动播放点名专属真人语音鼓励！
        if (this.state.autoVoice) {
            setTimeout(() => {
                if (this.isOpen) {
                    this.playMagicianVoice({
                        key: `inst_${wish.id}`,
                        audioHref: resolveAudioHref(matchedClip.audioFile),
                        text: matchedClip.text
                    });
                }
            }, 480);
        }

        // 同步到 Cloudflare 云端信箱
        await this._postWishToCloud(wish);
    }

    async _postWishToCloud(wish) {
        if (!this._shouldUseCloudApi()) {
            return;
        }
        try {
            const res = await fetch('/api/mailbox/wish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wish)
            });
            if (!res.ok) return;
            const data = await res.json();
            if (data && data.ok) {
                this.cloudOnline = true;
                this._mergeCloudPayload(data);
                if (this.dom.statusHint) {
                    this.dom.statusHint.textContent = `☁️ 太棒啦！${wish.kidName}的话已经同步到云端，爸爸妈妈喊魔法师就能立刻看到啦！`;
                }
                if (this.isOpen) {
                    this.renderChatStream();
                }
            }
        } catch (_) {}
    }

    async syncWithCloud({ silent = true, forceAttempt = false } = {}) {
        if (!forceAttempt && !this._shouldUseCloudApi()) {
            this._updateSyncPillUI(false);
            return;
        }
        try {
            const localWishes = Array.isArray(this.state.wishes) ? this.state.wishes.slice(-40) : [];
            const res = await fetch('/api/mailbox/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wishes: localWishes })
            });
            if (!res.ok) {
                this._updateSyncPillUI(false);
                if (!silent && this.dom.statusHint) {
                    this.dom.statusHint.textContent = '💾 当前处于本地模式，部署到线上后会自动开启跨设备云端同步！';
                }
                return;
            }
            const data = await res.json();
            if (data && data.ok) {
                this.cloudOnline = true;
                this._mergeCloudPayload(data);
                this._updateSyncPillUI(true);
                if (!silent && this.dom.statusHint) {
                    this.dom.statusHint.textContent = '☁️ 云端魔法信箱同步完成！所有留言与回信均为最新状态。';
                }
                if (this.isOpen) {
                    this.renderChatStream();
                }
                this._refreshAllBadges();
            }
        } catch (_) {
            this._updateSyncPillUI(false);
            if (!silent && this.dom.statusHint) {
                this.dom.statusHint.textContent = '💾 当前离线或本地环境，留言已安全保存在本机，联网后会自动上传！';
            }
        }
    }

    _mergeCloudPayload(data) {
        const cloudWishes = Array.isArray(data.wishes) ? data.wishes : [];
        const cloudReplies = Array.isArray(data.replies) ? data.replies : [];

        // 合并云端与本地的愿望列表（保留云端 fulfilled 状态与多设备历史）
        const byId = new Map();
        for (const w of (this.state.wishes || [])) {
            if (w && w.id) byId.set(w.id, { ...w });
        }
        for (const cw of cloudWishes) {
            if (!cw || !cw.id) continue;
            const existing = byId.get(cw.id) || {};
            byId.set(cw.id, {
                ...existing,
                ...cw,
                syncedCloud: true
            });
        }
        this.state.wishes = Array.from(byId.values())
            .sort((a, b) => (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0))
            .slice(-150);

        this.cloudReplies = cloudReplies;

        // 对照静态 MAGICIAN_LETTERS 中已实现的 replyToId 更新本地 wish 状态
        const fulfilledWishIds = new Set();
        for (const r of this._getAllMagicianReplies()) {
            if (r.replyToId) {
                r.replyToId.split(',').map(s => s.trim()).filter(Boolean).forEach(id => fulfilledWishIds.add(id));
            }
        }
        for (const w of this.state.wishes) {
            if (fulfilledWishIds.has(w.id)) {
                w.status = 'fulfilled';
            }
        }

        this._saveLocalState();
    }

    _updateSyncPillUI(online) {
        this.cloudOnline = Boolean(online);
        if (!this.dom.syncPill) return;
        if (online) {
            this.dom.syncPill.textContent = '☁️ 云端已连通';
            this.dom.syncPill.classList.add('mm-online');
        } else {
            this.dom.syncPill.textContent = '💾 本地守护中';
            this.dom.syncPill.classList.remove('mm-online');
        }
    }

    /* ==================== 真人级 MP3 语音播报 + 自然人声兜底 ==================== */
    playMagicianVoice({ key, audioHref = '', text = '' }) {
        this.stopAllVoice();
        this._playingKey = key;
        this._syncPlayingBtnHighlight();

        const onDone = () => {
            if (this._playingKey === key) {
                this._playingKey = null;
                this._syncPlayingBtnHighlight();
            }
        };

        if (audioHref) {
            try {
                const audio = new Audio(audioHref);
                audio.preload = 'auto';
                this._audioEl = audio;
                audio.onended = onDone;
                audio.onerror = () => {
                    this._audioEl = null;
                    this._fallbackSpeakText(text, { pitch: 1.04, rate: 0.98, preferAltVoice: false }, onDone);
                };
                const playPromise = audio.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.catch(() => {
                        this._audioEl = null;
                        this._fallbackSpeakText(text, { pitch: 1.04, rate: 0.98, preferAltVoice: false }, onDone);
                    });
                }
                return;
            } catch (_) {}
        }

        this._fallbackSpeakText(text, { pitch: 1.04, rate: 0.98, preferAltVoice: false }, onDone);
    }

    playKidEchoVoice({ key, speaker = 'pea', text = '' }) {
        this.stopAllVoice();
        this._playingKey = key;
        this._syncPlayingBtnHighlight();

        const isChuan = speaker === 'chuan';
        this._fallbackSpeakText(
            text,
            { pitch: isChuan ? 1.0 : 1.08, rate: 0.98, preferAltVoice: isChuan },
            () => {
                if (this._playingKey === key) {
                    this._playingKey = null;
                    this._syncPlayingBtnHighlight();
                }
            }
        );
    }

    _fallbackSpeakText(text, { pitch = 1.04, rate = 0.98, preferAltVoice = false } = {}, onDone = null) {
        if (!text) {
            if (onDone) onDone();
            return;
        }
        sharedSpeech.speakPetCharacter(text, {
            lang: 'zh-CN',
            pitch,
            rate,
            preferAltVoice
        });
        const estMs = Math.min(18000, Math.max(1800, text.length * 220));
        this._fallbackTimer = setTimeout(() => {
            if (onDone) onDone();
        }, estMs);
    }

    stopAllVoice() {
        if (this._fallbackTimer) {
            clearTimeout(this._fallbackTimer);
            this._fallbackTimer = null;
        }
        if (this._audioEl) {
            try {
                this._audioEl.pause();
                this._audioEl.currentTime = 0;
            } catch (_) {}
            this._audioEl = null;
        }
        sharedSpeech.cancelAllSpeech();
        this._playingKey = null;
        this._syncPlayingBtnHighlight();
    }

    _syncPlayingBtnHighlight() {
        if (!this.dom.chatStream) return;
        this.dom.chatStream.querySelectorAll('[data-mm-play-key]').forEach((btn) => {
            const active = this._playingKey && btn.dataset.mmPlayKey === this._playingKey;
            btn.classList.toggle('mm-playing', Boolean(active));
            const lbl = btn.querySelector('.mm-play-lbl');
            if (lbl) {
                if (active) {
                    lbl.textContent = '⏹️ 正在播报…';
                } else {
                    lbl.textContent = btn.dataset.mmSpeaker === 'magician' ? '🔊 点我听语音' : '🔊 读我的话';
                }
            }
        });
    }

    _playSparkleTone(freqs = [523.25, 659.25, 783.99]) {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            if (!this._audioCtx) this._audioCtx = new Ctx();
            if (this._audioCtx.state === 'suspended') {
                this._audioCtx.resume().catch(() => {});
            }
            const now = this._audioCtx.currentTime;
            freqs.forEach((f, idx) => {
                const osc = this._audioCtx.createOscillator();
                const gain = this._audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now + idx * 0.065);
                gain.gain.setValueAtTime(0.001, now + idx * 0.065);
                gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.065 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.065 + 0.22);
                osc.connect(gain);
                gain.connect(this._audioCtx.destination);
                osc.start(now + idx * 0.065);
                osc.stop(now + idx * 0.065 + 0.24);
            });
        } catch (_) {}
    }
}

export const magicMailbox = new MagicMailboxController();
