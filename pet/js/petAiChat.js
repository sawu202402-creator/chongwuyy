/**
 * pet/js/petAiChat.js - 🐾 12萌宠专属 AI 语音/文字陪聊屋 & 舞台鲜活台词生成器
 *
 * 核心能力：
 * 1. 让【垂耳兔、荷叶小青蛙、奶油小柴、胖胖竹熊、白虎、独角兽、多肉精灵、貔貅、宇航员兔兔、皇冠王子蛙、星空幻龙、未来机械喵】
 *    全部拥有独立 AI 性格、口头禅与对话记忆，彻底告别只有固定三四句话的单调体验！
 * 2. 支持直接点麦克风对萌宠说话（复用 Cloudflare Whisper 云端中文识别，国内网络与 iPad 全兼容）；
 * 3. 萌宠不仅能陪聊、讲冒险故事、出脑筋急转弯、考英语单词，还知道自己穿了什么衣服、几级、身边跟着哪只盲盒小精灵、以及小主人今天答对了几道题！
 * 4. 舞台支持一键「✨ 换句新话」及多次摸头后自动触发 AI 新鲜台词，离线也有丰富情境台词兜底。
 */

import {
    getPetById,
    getShopById,
    getAccessoryById,
    getPetVoiceProfile
} from './config.js';
import { getCompanionById } from '../../shared/blindboxCatalog.js';
import { sharedSpeech } from '../../shared/audioTTS.js';

const PET_CHAT_STORAGE_KEY = 'chongwuyy_pet_ai_chats_v1';

const PET_QUICK_CHIPS = [
    { icon: '🥕', label: '你今天想吃啥？', text: '你今天肚子饿不饿，最想吃什么好吃的呀？' },
    { icon: '📖', label: '讲个冒险小故事', text: '快给我讲一个你在萌宠小镇发生的奇妙冒险小故事吧！' },
    { icon: '🔤', label: '考我个好玩英语词', text: '来考我一个有趣的英语单词吧，教教我怎么记！' },
    { icon: '🎲', label: '出个脑筋急转弯', text: '给我出一个适合小朋友的趣味脑筋急转弯猜谜吧！' },
    { icon: '🌟', label: '夸夸今天努力的我', text: '看看我今天的学习表现，快用你的专属方式夸夸我吧！' }
];

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function nowTimeStr() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mi}`;
}

function arrayBufferToBase64(ab) {
    const u8 = new Uint8Array(ab);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < u8.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, u8.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

function base64ToArrayBuffer(b64) {
    const clean = String(b64 || '').replace(/^data:audio\/[^;]+;base64,/i, '').trim();
    const bin = atob(clean);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8.buffer;
}

function encodePcmToWav16kBase64(channelData, srcSampleRate = 48000) {
    const totalLen = channelData ? channelData.length : 0;
    if (!totalLen) return { base64: '', maxPeak: 0 };

    let maxPeak = 0;
    for (let i = 0; i < totalLen; i++) {
        const a = Math.abs(channelData[i]);
        if (a > maxPeak) maxPeak = a;
    }

    const targetRate = 16000;
    const ratio = srcSampleRate > targetRate ? (srcSampleRate / targetRate) : 1;
    const outSamples = Math.max(1, Math.floor(totalLen / ratio));
    const wavBytes = new ArrayBuffer(44 + outSamples * 2);
    const view = new DataView(wavBytes);

    const writeAscii = (pos, s) => {
        for (let i = 0; i < s.length; i++) view.setUint8(pos + i, s.charCodeAt(i));
    };
    writeAscii(0, 'RIFF');
    view.setUint32(4, 36 + outSamples * 2, true);
    writeAscii(8, 'WAVE');
    writeAscii(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, targetRate, true);
    view.setUint32(28, targetRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeAscii(36, 'data');
    view.setUint32(40, outSamples * 2, true);

    const normGain = (maxPeak > 0.012 && maxPeak < 0.35) ? Math.min(3.2, 0.55 / maxPeak) : 1.0;
    let bytePos = 44;
    for (let i = 0; i < outSamples; i++) {
        const start = Math.floor(i * ratio);
        const end = Math.min(totalLen, Math.floor((i + 1) * ratio));
        let sum = 0;
        let cnt = 0;
        for (let j = start; j < end; j++) {
            sum += channelData[j];
            cnt++;
        }
        const sample = cnt > 0 ? (sum / cnt) * normGain : channelData[start] * normGain;
        const clamped = Math.max(-1, Math.min(1, sample));
        view.setInt16(bytePos, clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF, true);
        bytePos += 2;
    }

    return {
        base64: arrayBufferToBase64(wavBytes),
        maxPeak
    };
}

/**
 * 离线/本地环境下的高丰富度情境萌宠回复兜底生成器（结合宠物口头禅、装扮、伙伴、时间与答题数）
 */
export function buildLocalRichPetReply(petMeta, ctx, userText = '', mode = 'chat') {
    const tag = (petMeta.voiceTag || petMeta.emoji || '✨').replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '') || '噗啾';
    const kid = ctx.kidName || '小店长';
    const food = petMeta.foodName || '美味零食';
    const accPart = (ctx.accessoryName && ctx.accessoryName !== '无配饰')
        ? `我戴着【${ctx.accessoryName}】是不是超神气呀？`
        : '';
    const compPart = ctx.companionName
        ? `刚才【${ctx.companionName}】还在我耳边夸你聪明呢！`
        : '';
    const studyPart = ctx.todayCorrect > 0
        ? `${kid}今天已经答对 ${ctx.todayCorrect} 道题啦，太厉害啰！`
        : `待会儿我们一起做几道题赢徽章好不好呀？`;

    if (mode === 'spontaneous') {
        const hour = new Date().getHours();
        const timeGreeting = hour < 11 ? '早安阳光暖洋洋' : (hour < 18 ? '午后微风真舒服' : '星空亮晶晶的晚上好呀');
        const pool = [
            `${tag}～${timeGreeting}，${kid}！${accPart || `摸摸我的头，${petMeta.name}最喜欢陪你闯关啦！`} ${petMeta.emoji}`,
            `${tag}！我刚才偷偷数了数，${studyPart}闻到【${food}】的香味我口水都流出来啦～😋`,
            `${tag}～${compPart || `在【${ctx.shopName || '萌宠小镇'}】当小店长超开心，有${kid}陪着每天都像过节！`} ✨`,
            `${tag}！你知道吗？我升到【${ctx.stageTitle}】之后，连做梦都在跟${kid}一起环游星海呢！🌟`
        ];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    const q = String(userText || '').trim();
    if (/吃|饿|食物|零食|味道/.test(q)) {
        return `${tag}～说到吃的我眼睛都亮成小星星啦！我最爱吃香喷喷的【${food}】，${kid}每次答对题喂我一口，我浑身都充满魔法能量！${petMeta.emoji}`;
    }
    if (/故事|冒险|小镇/.test(q)) {
        return `${tag}！昨天夜里我和小镇伙伴去彩虹海滩寻宝，发现了一颗会唱歌的海螺，海螺里全在夸${kid}是个超级聪明的小探险家呢！🐚✨`;
    }
    if (/英语|单词|考我|english/i.test(q)) {
        return `${tag}～来考考${kid}！我的英文名字叫“${petMeta.enName}”，那你知道“彩虹 Rainbow”怎么读吗？大声念出来给我听听吧！🌈`;
    }
    if (/急转弯|猜谜|谜语/.test(q)) {
        return `${tag}～听好啰：什么东西越洗越脏，不洗反而干干净净呢？嘻嘻，答案是“水”！${kid}猜对了吗？💧😆`;
    }
    if (/夸|棒|厉害|题/.test(q)) {
        return `${tag}！必须给${kid}颁一朵超级大红花！${studyPart}${accPart}我会一直做你最忠实的小跟班！💖`;
    }
    return `${tag}～听到${kid}跟我说“${q.slice(0, 22)}”，${petMeta.name}开心得原地转了三个圈圈！${accPart || studyPart}你还有什么悄悄话想告诉我呀？${petMeta.emoji}`;
}

export class PetAiChatController {
    constructor({ profileManager, soundEngine, onUpdateStageSpeech, onTriggerStageAnim } = {}) {
        this.profileManager = profileManager;
        this.soundEngine = soundEngine;
        this.onUpdateStageSpeech = onUpdateStageSpeech;
        this.onTriggerStageAnim = onTriggerStageAnim;

        this.histories = this._loadHistories();
        this.recentStageLines = [];
        this.isOpen = false;
        this.isRecording = false;
        this.isTranscribing = false;
        this.isThinking = false;
        this.autoSpeak = true;
        this._recorder = null;
        this._recTimer = null;
        this._recSeconds = 0;
        this._ttsCache = new Map();
        this._activePetSrc = null;
        this._speakToken = 0;

        this.overlayEl = null;
        this.dom = {};
    }

    _shouldUseCloudApi() {
        if (typeof window === 'undefined') return false;
        if (window.__ENABLE_LOCAL_MAILBOX_API === true) return true;
        return window.location.protocol === 'https:';
    }

    _loadHistories() {
        try {
            const raw = localStorage.getItem(PET_CHAT_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch (_) {}
        return {};
    }

    _saveHistories() {
        try {
            localStorage.setItem(PET_CHAT_STORAGE_KEY, JSON.stringify(this.histories));
        } catch (_) {}
    }

    _getPetContext() {
        const u = this.profileManager.getActiveUser();
        const isShopMode = u.stageMode === 'shop';
        const petId = isShopMode ? (u.shops[u.activeShopId]?.managerPetId || u.activePetId) : u.activePetId;
        const petMeta = getPetById(petId);
        const pState = u.pets?.[petId] || { level: 1, accessory: 'none' };
        const stageLevel = Math.min(5, Math.max(1, pState.level || 1));
        const stageTitle = petMeta.stageTitles?.[stageLevel - 1] || petMeta.name;
        const accObj = pState.accessory && pState.accessory !== 'none' ? getAccessoryById(pState.accessory) : null;
        const compObj = u.activeCompanionId ? getCompanionById(u.activeCompanionId) : null;
        const shopObj = u.activeShopId ? getShopById(u.activeShopId) : null;

        return {
            kidId: u.id,
            kidName: u.name,
            kidAvatar: u.avatar || '🐰',
            petId: petMeta.id,
            petMeta,
            petName: petMeta.name,
            voiceTag: petMeta.voiceTag || petMeta.emoji,
            stageLevel,
            stageTitle,
            foodName: petMeta.foodName,
            accessoryId: pState.accessory || 'none',
            accessoryName: accObj ? accObj.name : '无配饰',
            companionName: compObj ? compObj.name : '',
            shopName: shopObj ? shopObj.name : '',
            todayCorrect: Number(u.dailyState?.questionsCorrect) || 0,
            todayBadges: Number(u.dailyState?.badgesEarned) || 0
        };
    }

    _getConversationList(kidId, petId) {
        const key = `${kidId}__${petId}`;
        if (!Array.isArray(this.histories[key])) {
            this.histories[key] = [];
        }
        return this.histories[key];
    }

    _appendMessage(kidId, petId, msg) {
        const list = this._getConversationList(kidId, petId);
        list.push(msg);
        if (list.length > 40) {
            this.histories[`${kidId}__${petId}`] = list.slice(-40);
        }
        this._saveHistories();
    }

    stopPetAiVoice() {
        this._speakToken++;
        if (this._activePetSrc) {
            try { this._activePetSrc.stop(); } catch (_) {}
            this._activePetSrc = null;
        }
        sharedSpeech.cancelAllSpeech();
    }

    async speakPetLine(petId, text, audioBase64 = '') {
        if (!text || (this.soundEngine && this.soundEngine.muted)) return;
        this.stopPetAiVoice();
        const token = this._speakToken;
        const profile = getPetVoiceProfile(petId);
        if (this.soundEngine) {
            this.soundEngine.stopActivePetAudio();
            this.soundEngine.playPetSoftTouch?.(petId);
        }

        const cacheKey = `${petId}::${text}`;
        let b64 = audioBase64 || this._ttsCache.get(cacheKey) || '';
        if (audioBase64) {
            this._ttsCache.set(cacheKey, audioBase64);
        }

        // 在线环境优先请求与萌宠预录语音包 100% 同款声线的神经网络真人 MP3
        if (!b64 && this._shouldUseCloudApi()) {
            try {
                const res = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, role: petId })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.ok && data.audioBase64) {
                        b64 = data.audioBase64;
                        this._ttsCache.set(cacheKey, b64);
                    }
                }
            } catch (_) {}
        }

        if (token !== this._speakToken) return;

        if (b64) {
            try {
                const ctx = this.soundEngine ? this.soundEngine.ensureContext() : null;
                if (ctx) {
                    const ab = base64ToArrayBuffer(b64);
                    const decoded = await ctx.decodeAudioData(ab.slice(0));
                    if (token !== this._speakToken) return;
                    const src = ctx.createBufferSource();
                    src.buffer = decoded;
                    src.connect(ctx.destination);
                    this._activePetSrc = src;
                    src.onended = () => {
                        if (this._activePetSrc === src) this._activePetSrc = null;
                    };
                    src.start(0);
                    return;
                }
            } catch (_) {}

            try {
                const audio = new Audio(`data:audio/mpeg;base64,${b64}`);
                await audio.play();
                return;
            } catch (_) {}
        }

        // 仅在彻底断网离线时才回退系统语音
        sharedSpeech.speakPetCharacter(text, {
            lang: 'zh-CN',
            pitch: profile.pitch || 1.04,
            rate: profile.rate || 1.0,
            preferAltVoice: Boolean(profile.preferAltVoice),
            delayMs: 30
        });
    }

    /**
     * 舞台一键「✨ 换句新鲜话」或多次摸头后触发的 AI 即兴鲜活台词
     */
    async triggerSpontaneousStageLine({ trigger = 'tap', speakAloud = true } = {}) {
        const ctx = this._getPetContext();
        let line = '';
        let audioBase64 = '';

        if (this._shouldUseCloudApi()) {
            try {
                if (this.onUpdateStageSpeech) {
                    this.onUpdateStageSpeech(`${ctx.petMeta.emoji} ${ctx.petName}正在歪着小脑袋想悄悄话…✨`, 4000);
                }
                const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
                const timer = ctrl ? setTimeout(() => ctrl.abort(), 8500) : null;
                const res = await fetch('/api/pet/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: ctrl ? ctrl.signal : undefined,
                    body: JSON.stringify({
                        ...ctx,
                        petMeta: undefined,
                        mode: 'spontaneous',
                        trigger,
                        recentLines: this.recentStageLines.slice(-5)
                    })
                });
                if (timer) clearTimeout(timer);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.ok && data.text) {
                        line = String(data.text).trim();
                        audioBase64 = data.audioBase64 || '';
                    }
                }
            } catch (_) {}
        }

        if (!line) {
            line = buildLocalRichPetReply(ctx.petMeta, ctx, '', 'spontaneous');
        }

        this.recentStageLines.push(line);
        if (this.recentStageLines.length > 10) this.recentStageLines.shift();

        if (this.onUpdateStageSpeech) {
            this.onUpdateStageSpeech(line, 9000);
        }
        if (this.onTriggerStageAnim) {
            this.onTriggerStageAnim(ctx.petMeta);
        }
        if (speakAloud && this.autoSpeak) {
            this.speakPetLine(ctx.petId, line, audioBase64);
        }
        return line;
    }

    /* ==================== 萌宠专属 AI 聊天屋弹窗 ==================== */
    _ensureModalDom() {
        if (this.overlayEl && document.body.contains(this.overlayEl)) return;

        const overlay = document.createElement('div');
        overlay.className = 'pet-ai-modal-overlay';
        overlay.id = 'petAiChatOverlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        const chipsHtml = PET_QUICK_CHIPS.map((c, idx) =>
            `<button type="button" class="pai-chip-btn" data-pai-chip="${idx}">${c.icon} ${escapeHtml(c.label)}</button>`
        ).join('');

        overlay.innerHTML = `
            <div class="pai-dialog-card" id="paiDialogCard">
                <header class="pai-header" id="paiHeader">
                    <div class="pai-header-left">
                        <div class="pai-pet-avatar-ring" id="paiAvatarRing">
                            <img src="assets/pets/rabbit.png" alt="萌宠头像" class="pai-pet-avatar-img" id="paiPetAvatarImg" />
                        </div>
                        <div>
                            <div class="pai-title-row">
                                <span id="paiPetTitle">🐰 垂耳兔 · 专属悄悄话屋</span>
                                <span class="pai-lv-pill" id="paiLvPill">Lv.1 糯米睡睡兔</span>
                            </div>
                            <div class="pai-sub-status" id="paiSubStatus">✨ 我认识你、记得你的衣服和今天做的每一道题哟！</div>
                        </div>
                    </div>

                    <div class="pai-header-right">
                        <button type="button" class="pai-voice-toggle" id="paiVoiceToggle">🔊 萌宠配音: 开</button>
                        <button type="button" class="pai-close-btn" id="paiCloseBtn" title="关闭">✕</button>
                    </div>
                </header>

                <div class="pai-chat-stream" id="paiChatStream"></div>

                <footer class="pai-composer">
                    <div class="pai-chips-bar" id="paiChipsBar">
                        <span class="pai-chip-lbl">🐾 逗它玩：</span>
                        ${chipsHtml}
                    </div>

                    <div class="pai-rec-banner" id="paiRecBanner">
                        <span id="paiRecText">🎙️ 正在录音跟萌宠说话… 说完点红色按钮转文字，或直接点右侧发送！</span>
                    </div>

                    <div class="pai-input-row">
                        <button type="button" class="pai-mic-btn" id="paiMicBtn">
                            <span id="paiMicIcon">🎙️</span>
                            <span id="paiMicLabel">按此说话</span>
                        </button>

                        <input
                            type="text"
                            id="paiTextInput"
                            class="pai-text-input"
                            maxlength="300"
                            placeholder="点左边🎙️对萌宠说话，或在这里打字聊天…"
                        />

                        <button type="button" class="pai-send-btn" id="paiSendBtn" disabled>
                            <span>🚀</span>
                            <span id="paiSendLabel">发送</span>
                        </button>
                    </div>
                </footer>
            </div>
        `;

        document.body.appendChild(overlay);
        this.overlayEl = overlay;

        this.dom = {
            card: overlay.querySelector('#paiDialogCard'),
            header: overlay.querySelector('#paiHeader'),
            avatarRing: overlay.querySelector('#paiAvatarRing'),
            avatarImg: overlay.querySelector('#paiPetAvatarImg'),
            petTitle: overlay.querySelector('#paiPetTitle'),
            lvPill: overlay.querySelector('#paiLvPill'),
            subStatus: overlay.querySelector('#paiSubStatus'),
            voiceToggle: overlay.querySelector('#paiVoiceToggle'),
            closeBtn: overlay.querySelector('#paiCloseBtn'),
            chatStream: overlay.querySelector('#paiChatStream'),
            chipsBar: overlay.querySelector('#paiChipsBar'),
            recBanner: overlay.querySelector('#paiRecBanner'),
            recText: overlay.querySelector('#paiRecText'),
            micBtn: overlay.querySelector('#paiMicBtn'),
            micIcon: overlay.querySelector('#paiMicIcon'),
            micLabel: overlay.querySelector('#paiMicLabel'),
            textInput: overlay.querySelector('#paiTextInput'),
            sendBtn: overlay.querySelector('#paiSendBtn'),
            sendLabel: overlay.querySelector('#paiSendLabel')
        };

        this._bindEvents();
    }

    _bindEvents() {
        const d = this.dom;
        this.overlayEl.addEventListener('click', (e) => {
            if (e.target === this.overlayEl) this.close();
        });
        d.closeBtn.addEventListener('click', () => this.close());

        d.voiceToggle.addEventListener('click', () => {
            this.autoSpeak = !this.autoSpeak;
            d.voiceToggle.textContent = this.autoSpeak ? '🔊 萌宠配音: 开' : '🔇 萌宠配音: 关';
            if (!this.autoSpeak) sharedSpeech.cancelAllSpeech();
        });

        d.chipsBar.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-pai-chip]');
            if (!btn || this.isThinking) return;
            const chip = PET_QUICK_CHIPS[Number(btn.dataset.paiChip)];
            if (!chip) return;
            d.textInput.value = chip.text;
            this._syncButtons();
            this.submitUserMessage();
        });

        d.textInput.addEventListener('input', () => this._syncButtons());
        d.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!d.sendBtn.disabled) this.submitUserMessage();
            }
        });

        d.micBtn.addEventListener('click', () => {
            if (this.isTranscribing) return;
            if (this.isRecording) {
                this.stopRecording({ transcribeNow: true });
            } else {
                this.startRecording();
            }
        });

        d.sendBtn.addEventListener('click', () => {
            this.submitUserMessage();
        });

        d.chatStream.addEventListener('click', (e) => {
            const speakBtn = e.target.closest('[data-pai-speak]');
            if (!speakBtn) return;
            const ctx = this._getPetContext();
            this.speakPetLine(ctx.petId, speakBtn.dataset.paiSpeak || '');
            this._bounceModalAvatar();
        });
    }

    _syncButtons() {
        if (!this.dom.textInput) return;
        const hasTxt = this.dom.textInput.value.trim().length > 0;
        this.dom.sendBtn.disabled = this.isThinking || this.isTranscribing || (!hasTxt && !this.isRecording);
        this.dom.sendLabel.textContent = this.isRecording ? '说完直发' : '发送';
    }

    _bounceModalAvatar() {
        if (!this.dom.avatarRing) return;
        this.dom.avatarRing.classList.remove('pai-talking-bounce');
        void this.dom.avatarRing.offsetWidth;
        this.dom.avatarRing.classList.add('pai-talking-bounce');
        setTimeout(() => {
            if (this.dom.avatarRing) this.dom.avatarRing.classList.remove('pai-talking-bounce');
        }, 900);
    }

    open() {
        this._ensureModalDom();
        const ctx = this._getPetContext();
        const d = this.dom;

        d.card.style.setProperty('--pai-accent', ctx.petMeta.auraColor || '#8b5cf6');
        d.avatarImg.src = ctx.petMeta.img;
        d.petTitle.textContent = `${ctx.petMeta.emoji} ${ctx.petName} · 悄悄话互动屋`;
        d.lvPill.textContent = `Lv.${ctx.stageLevel} ${ctx.stageTitle}`;

        const tags = [];
        if (ctx.accessoryName && ctx.accessoryName !== '无配饰') tags.push(`🎀 穿戴：${ctx.accessoryName}`);
        if (ctx.companionName) tags.push(`🧚 伙伴：${ctx.companionName}`);
        tags.push(`❤️ 小主人：${ctx.kidAvatar}${ctx.kidName}`);
        d.subStatus.textContent = tags.join(' · ');
        d.textInput.placeholder = `对${ctx.petName}说点什么吧（点左边🎙️语音说话或直接点上方气泡）…`;

        // 若是第一次跟这只萌宠打开聊天屋，放入一句专属开场问候
        const list = this._getConversationList(ctx.kidId, ctx.petId);
        if (list.length === 0) {
            const greetText = `${ctx.petMeta.voiceTag || ctx.petMeta.emoji}～${ctx.kidName}你来找我聊天啦！我是你的【${ctx.stageTitle}】${ctx.petName}，最喜欢吃${ctx.foodName}！你想听我讲故事、猜谜语，还是跟我说悄悄话呀？`;
            this._appendMessage(ctx.kidId, ctx.petId, {
                role: 'pet',
                text: greetText,
                time: nowTimeStr()
            });
        }

        this.isOpen = true;
        this.overlayEl.classList.add('pai-open');
        this.renderMessages();
        this._syncButtons();
        this._bounceModalAvatar();

        const latest = this._getConversationList(ctx.kidId, ctx.petId).slice(-1)[0];
        if (latest && latest.role === 'pet' && this.autoSpeak) {
            this.speakPetLine(ctx.petId, latest.text);
        }
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        if (this.isRecording) {
            this.stopRecording({ transcribeNow: false });
        }
        this.stopPetAiVoice();
        if (this.overlayEl) {
            this.overlayEl.classList.remove('pai-open');
        }
    }

    renderMessages() {
        if (!this.dom.chatStream) return;
        const ctx = this._getPetContext();
        const list = this._getConversationList(ctx.kidId, ctx.petId);

        const html = list.map((m) => {
            if (m.role === 'pet') {
                return `
                    <div class="pai-msg-row pai-from-pet">
                        <img src="${escapeHtml(ctx.petMeta.img)}" alt="${escapeHtml(ctx.petName)}" class="pai-msg-pet-thumb" />
                        <div class="pai-bubble pai-pet-bubble">
                            <div class="pai-bubble-meta">${escapeHtml(ctx.petName)} · ${escapeHtml(m.time || '')}</div>
                            <div class="pai-bubble-text">${escapeHtml(m.text)}</div>
                            <button type="button" class="pai-replay-btn" data-pai-speak="${escapeHtml(m.text)}">🔊 再听一遍</button>
                        </div>
                    </div>
                `;
            }
            return `
                <div class="pai-msg-row pai-from-kid">
                    <div class="pai-kid-avatar">${escapeHtml(ctx.kidAvatar)}</div>
                    <div class="pai-bubble pai-kid-bubble">
                        <div class="pai-bubble-meta">${escapeHtml(ctx.kidName)} · ${escapeHtml(m.time || '')}</div>
                        <div class="pai-bubble-text">${escapeHtml(m.text)}</div>
                    </div>
                </div>
            `;
        });

        if (this.isThinking) {
            html.push(`
                <div class="pai-msg-row pai-from-pet">
                    <img src="${escapeHtml(ctx.petMeta.img)}" alt="${escapeHtml(ctx.petName)}" class="pai-msg-pet-thumb" />
                    <div class="pai-bubble pai-pet-bubble pai-thinking">
                        ${escapeHtml(ctx.petMeta.emoji)} ${escapeHtml(ctx.petName)}正在摇着小耳朵想怎么回你… ✨
                    </div>
                </div>
            `);
        }

        this.dom.chatStream.innerHTML = html.join('');
        this.dom.chatStream.scrollTop = this.dom.chatStream.scrollHeight;
    }

    async submitUserMessage() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try { window.speechSynthesis.resume(); } catch (_) {}
        }
        if (this.isRecording) {
            await this.stopRecording({ transcribeNow: true });
        }
        const text = this.dom.textInput ? this.dom.textInput.value.trim() : '';
        if (!text || this.isThinking) return;

        const ctx = this._getPetContext();
        this.dom.textInput.value = '';
        this._appendMessage(ctx.kidId, ctx.petId, {
            role: 'user',
            text,
            time: nowTimeStr()
        });

        this.isThinking = true;
        this._syncButtons();
        this.renderMessages();

        let replyText = '';
        let replyAudioBase64 = '';
        const historyBefore = this._getConversationList(ctx.kidId, ctx.petId).slice(-7, -1);

        if (this._shouldUseCloudApi()) {
            try {
                const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
                const timer = ctrl ? setTimeout(() => ctrl.abort(), 9500) : null;
                const res = await fetch('/api/pet/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: ctrl ? ctrl.signal : undefined,
                    body: JSON.stringify({
                        ...ctx,
                        petMeta: undefined,
                        mode: 'chat',
                        userText: text,
                        history: historyBefore
                    })
                });
                if (timer) clearTimeout(timer);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.ok && data.text) {
                        replyText = String(data.text).trim();
                        replyAudioBase64 = data.audioBase64 || '';
                    }
                }
            } catch (_) {}
        }

        if (!replyText) {
            replyText = buildLocalRichPetReply(ctx.petMeta, ctx, text, 'chat');
        }

        this.isThinking = false;
        this._appendMessage(ctx.kidId, ctx.petId, {
            role: 'pet',
            text: replyText,
            time: nowTimeStr()
        });
        this._syncButtons();
        this.renderMessages();
        this._bounceModalAvatar();

        // 同步更新舞台中央的萌宠对话云！
        if (this.onUpdateStageSpeech) {
            this.onUpdateStageSpeech(replyText, 12000);
        }
        if (this.isOpen && this.autoSpeak) {
            this.speakPetLine(ctx.petId, replyText, replyAudioBase64);
        }
    }

    /* ==================== 复用云端 Whisper 麦克风直录语音转文字 ==================== */
    async startRecording() {
        if (this.isRecording || this.isTranscribing) return;
        sharedSpeech.cancelAllSpeech();
        if (this.soundEngine) this.soundEngine.stopActivePetAudio();

        const ctx = this._getPetContext();
        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function' || !this._shouldUseCloudApi()) {
            this.dom.recBanner.classList.add('pai-active');
            this.dom.recText.textContent = '💡 当前为本地离线环境，可直接点上方快捷话题或点输入框用键盘 🎤 听写跟萌宠聊天哦！';
            this.dom.textInput.focus();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: true }
            });
            const mimeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
            const chosenMime = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported)
                ? (mimeCandidates.find(m => MediaRecorder.isTypeSupported(m)) || '')
                : '';
            const recOpts = chosenMime ? { mimeType: chosenMime, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 };
            const mediaRecorder = new MediaRecorder(stream, recOpts);
            const blobParts = [];
            mediaRecorder.ondataavailable = (ev) => {
                if (ev.data && ev.data.size > 0) blobParts.push(ev.data);
            };
            mediaRecorder.start();

            this._recorder = { stream, mediaRecorder, blobParts, startedAt: Date.now() };
            this.isRecording = true;
            this._recSeconds = 0;

            this.dom.micBtn.classList.add('pai-recording');
            this.dom.micIcon.textContent = '⏹️';
            this.dom.micLabel.textContent = '说完点我(0s)';
            this.dom.recBanner.classList.add('pai-active');
            this.dom.recText.textContent = `🎙️ ${ctx.petName}正竖起耳朵听你说话！说完点红色按钮，或直接点右侧「🚀 说完直发」！`;
            this._syncButtons();

            if (this._recTimer) clearInterval(this._recTimer);
            this._recTimer = setInterval(() => {
                if (!this.isRecording) return;
                this._recSeconds += 1;
                this.dom.micLabel.textContent = `说完点我(${this._recSeconds}s)`;
                if (this._recSeconds >= 25) {
                    this.stopRecording({ transcribeNow: true });
                }
            }, 1000);
        } catch (err) {
            this.isRecording = false;
            this.dom.recBanner.classList.add('pai-active');
            this.dom.recText.textContent = '⚠️ 请允许浏览器访问麦克风，或点输入框按键盘左下角 🎤 语音输入哦！';
            this._syncButtons();
        }
    }

    async stopRecording({ transcribeNow = true } = {}) {
        if (this._recTimer) {
            clearInterval(this._recTimer);
            this._recTimer = null;
        }
        if (!this._recorder) return '';

        const recObj = this._recorder;
        this._recorder = null;
        this.isRecording = false;
        this.dom.micBtn.classList.remove('pai-recording');

        await new Promise((resolve) => {
            if (!recObj.mediaRecorder || recObj.mediaRecorder.state === 'inactive') {
                resolve();
                return;
            }
            recObj.mediaRecorder.onstop = () => resolve();
            try { recObj.mediaRecorder.stop(); } catch (_) { resolve(); }
        });
        try { recObj.stream.getTracks().forEach(t => t.stop()); } catch (_) {}

        if (!transcribeNow) {
            this.dom.recBanner.classList.remove('pai-active');
            this.dom.micIcon.textContent = '🎙️';
            this.dom.micLabel.textContent = '按此说话';
            this._syncButtons();
            return '';
        }

        let rawBlob = null;
        const elapsedSec = (Date.now() - recObj.startedAt) / 1000;
        if (recObj.blobParts.length > 0 && elapsedSec >= 0.25) {
            const mime = recObj.mediaRecorder.mimeType || 'audio/webm';
            const b = new Blob(recObj.blobParts, { type: mime });
            if (b.size > 120) rawBlob = b;
        }

        if (!rawBlob) {
            this.dom.micIcon.textContent = '🎙️';
            this.dom.micLabel.textContent = '按此说话';
            this.dom.recText.textContent = '🎙️ 刚才声音有点轻没录到，靠近一点再说一次吧～';
            this._syncButtons();
            return '';
        }

        this.isTranscribing = true;
        this.dom.micIcon.textContent = '⏳';
        this.dom.micLabel.textContent = '极速识别…';
        this.dom.recText.textContent = '⚡ 正在极速识别语音…';
        this._syncButtons();

        let recognized = '';
        try {
            const res = await fetch('/api/mailbox/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': rawBlob.type || 'audio/webm' },
                body: rawBlob
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.ok && data.text) recognized = String(data.text).trim();
            }
        } catch (_) {}

        this.isTranscribing = false;
        this.dom.micIcon.textContent = '🎙️';
        this.dom.micLabel.textContent = '按此说话';

        if (recognized) {
            const prev = this.dom.textInput.value.trim();
            this.dom.textInput.value = (prev ? `${prev}，${recognized}` : recognized).slice(0, 300);
            this.dom.recBanner.classList.remove('pai-active');
        } else {
            this.dom.recText.textContent = '🎙️ 刚才没听清，再按一下话筒试试吧～';
        }
        this._syncButtons();
        return recognized;
    }
}
