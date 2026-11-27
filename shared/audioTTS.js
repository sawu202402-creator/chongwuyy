/**
 * shared/audioTTS.js - 跨游戏通用英语自然拼读朗读与中文真人神经网络语音（Edge Neural TTS）播报模块
 * 针对 iPadOS / iOS Safari 专项强化：
 * 1. 在线环境中文朗读优先走 /api/tts 实时神经网络真人女声（zh-CN-XiaoxiaoNeural 语文老师标准播音腔），彻底告别系统机械电子音；
 * 2. 点击手势内同步解锁 WebAudio 与 HTMLAudio + 题目渲染时后台静默预热缓存，iPad Safari 点【🔊 读题】零延迟秒出声；
 * 3. 断网或纯静态离线环境下自动平滑降级为浏览器本地精选语音，永不静音报错；
 * 4. 英语慢速模式支持“自然拼读慢读 -> 常速复读”跟读教学节奏。
 */

function base64ToArrayBuffer(b64) {
    const clean = String(b64 || '').replace(/^data:audio\/[^;]+;base64,/, '');
    const binary = atob(clean);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function cleanChineseForTts(raw) {
    if (!raw) return '';
    return String(raw)
        .replace(/<[^>]+>/g, '')
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
        .replace(/[✦✧★☆♪♫]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 580);
}

class SharedSpeechHelper {
    constructor() {
        this.muted = false;
        this.enVoice = null;
        this.enAltDeepVoice = null;
        this.zhVoice = null;
        this.zhAltDeepVoice = null;
        this.warmedUp = false;
        this._slowTimer = null;
        this._petTimer = null;

        // 云端真人神经网络语音状态与缓存
        this._audioCtx = null;
        this._activeBufferSrc = null;
        this._activeHtmlAudio = null;
        this._sharedHtmlAudio = null;
        this._sharedAudioUnlocked = false;
        this._zhSpeakToken = 0;
        this._ttsMemCache = new Map();
        this._inflightTtsMap = new Map();
        this._cloudTtsUnavailable = false;
        this._lastPlaybackMode = 'idle'; // 'neural-mp3' | 'speechSynthesis' | 'idle'

        this.initVoices();
        this._bindFirstGestureWarmup();
    }

    _shouldUseCloudTts() {
        if (typeof window === 'undefined' || typeof fetch !== 'function') return false;
        if (window.__DISABLE_CLOUD_TTS === true || this._cloudTtsUnavailable) return false;
        if (window.__ENABLE_LOCAL_MAILBOX_API === true) return true;
        return window.location.protocol === 'https:' || window.location.protocol === 'http:';
    }

    _unlockAudioInGesture() {
        if (typeof window === 'undefined') return;
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (Ctx) {
                if (!this._audioCtx) this._audioCtx = new Ctx();
                if (this._audioCtx.state === 'suspended') {
                    this._audioCtx.resume().catch(() => {});
                }
                const silentBuf = this._audioCtx.createBuffer(1, 1, 22050);
                const src = this._audioCtx.createBufferSource();
                src.buffer = silentBuf;
                src.connect(this._audioCtx.destination);
                src.start(0);
            }
        } catch (_) {}

        try {
            if (!this._sharedAudioUnlocked) {
                if (!this._sharedHtmlAudio && typeof Audio !== 'undefined') {
                    this._sharedHtmlAudio = new Audio();
                    this._sharedHtmlAudio.preload = 'auto';
                    this._sharedHtmlAudio.setAttribute('playsinline', 'true');
                }
                if (this._sharedHtmlAudio && !this._activeHtmlAudio) {
                    this._sharedHtmlAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
                    const p = this._sharedHtmlAudio.play();
                    if (p && typeof p.then === 'function') {
                        p.then(() => {
                            this._sharedAudioUnlocked = true;
                            if (!this._activeHtmlAudio) {
                                try { this._sharedHtmlAudio.pause(); } catch (_) {}
                            }
                        }).catch(() => {});
                    }
                }
            }
        } catch (_) {}
    }

    initVoices() {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const load = () => {
            const voices = window.speechSynthesis.getVoices() || [];
            if (!voices.length) return;

            const enCandidates = voices.filter(v =>
                v.lang && /^en(-US|_US|-GB|_GB)?$/i.test(v.lang) &&
                !/Fred|Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Pipe Organ|Trinoids|Whisper|Zarvox/i.test(v.name)
            );
            this.enVoice =
                enCandidates.find(v => /Premium|Enhanced|Natural/i.test(v.name) && /Samantha|Ava|Nicky|Allison/i.test(v.name)) ||
                enCandidates.find(v => /Samantha|Nicky|Ava|Allison|Google US English|Alex/i.test(v.name)) ||
                enCandidates.find(v => /en[-_]US/i.test(v.lang)) ||
                enCandidates[0] ||
                voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) ||
                null;

            this.enAltDeepVoice =
                enCandidates.find(v => /Daniel|Aaron|Arthur|Alex|Guy|Christopher|Eric|Google UK English Male|Rishi/i.test(v.name)) ||
                enCandidates.find(v => this.enVoice && v.name !== this.enVoice.name) ||
                this.enVoice;

            const zhCandidates = voices.filter(v => v.lang && /^zh/i.test(v.lang));
            this.zhVoice =
                zhCandidates.find(v => /Premium|Enhanced|Natural/i.test(v.name)) ||
                zhCandidates.find(v => /Tingting|Ting-Ting|Yu-shu|Meijia|Xiaoxiao|Xiaoyi|Google 普通话/i.test(v.name)) ||
                zhCandidates.find(v => /zh[-_]CN/i.test(v.lang)) ||
                zhCandidates[0] ||
                null;

            this.zhAltDeepVoice =
                zhCandidates.find(v => /Yunxi|Yunjian|Kangkang|Sin-ji|Li-mu|Yu-shu/i.test(v.name) && (!this.zhVoice || v.name !== this.zhVoice.name)) ||
                zhCandidates.find(v => this.zhVoice && v.name !== this.zhVoice.name) ||
                this.zhVoice;
        };
        load();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = load;
        }
    }

    _bindFirstGestureWarmup() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        const warmup = () => {
            if (this.warmedUp) return;
            this.warmedUp = true;
            this.initVoices();
            this._unlockAudioInGesture();
            if ('speechSynthesis' in window) {
                try {
                    window.speechSynthesis.resume();
                } catch (e) {}
            }
            window.removeEventListener('pointerdown', warmup, true);
            window.removeEventListener('touchstart', warmup, true);
            window.removeEventListener('keydown', warmup, true);
        };
        window.addEventListener('pointerdown', warmup, true);
        window.addEventListener('touchstart', warmup, true);
        window.addEventListener('keydown', warmup, true);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && 'speechSynthesis' in window) {
                try { window.speechSynthesis.resume(); } catch (e) {}
            }
        });
    }

    setMuted(flag) {
        this.muted = Boolean(flag);
        if (this.muted) {
            this.cancelAllSpeech();
        }
    }

    _stopNeuralAudioOnly() {
        if (this._activeBufferSrc) {
            try {
                this._activeBufferSrc.onended = null;
                this._activeBufferSrc.stop(0);
                this._activeBufferSrc.disconnect();
            } catch (_) {}
            this._activeBufferSrc = null;
        }
        if (this._activeHtmlAudio) {
            try {
                this._activeHtmlAudio.onended = null;
                this._activeHtmlAudio.onerror = null;
                this._activeHtmlAudio.pause();
            } catch (_) {}
            this._activeHtmlAudio = null;
        }
    }

    cancelAllSpeech() {
        this._zhSpeakToken++;
        if (this._slowTimer) {
            clearTimeout(this._slowTimer);
            this._slowTimer = null;
        }
        if (this._petTimer) {
            clearTimeout(this._petTimer);
            this._petTimer = null;
        }
        this._stopNeuralAudioOnly();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch (e) {}
        }
    }

    async _fetchNeuralTtsBase64(cleanText, role = 'chinese_teacher') {
        if (!cleanText || !this._shouldUseCloudTts()) return '';
        const cacheKey = `${role}::${cleanText}`;
        if (this._ttsMemCache.has(cacheKey)) {
            return this._ttsMemCache.get(cacheKey);
        }
        if (this._inflightTtsMap.has(cacheKey)) {
            return this._inflightTtsMap.get(cacheKey);
        }

        const p = (async () => {
            try {
                const res = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: cleanText, role })
                });
                if (res.status === 404 || res.status === 405 || res.status === 501) {
                    this._cloudTtsUnavailable = true;
                    return '';
                }
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.ok && data.audioBase64) {
                        if (this._ttsMemCache.size >= 120) {
                            const oldest = this._ttsMemCache.keys().next().value;
                            if (oldest !== undefined) this._ttsMemCache.delete(oldest);
                        }
                        this._ttsMemCache.set(cacheKey, data.audioBase64);
                        return data.audioBase64;
                    }
                }
            } catch (_) {}
            return '';
        })();

        this._inflightTtsMap.set(cacheKey, p);
        try {
            return await p;
        } finally {
            this._inflightTtsMap.delete(cacheKey);
        }
    }

    /**
     * 题目渲染时静默预热合成真人语音缓存，小朋友点击【🔊 读题】时零延迟秒出声
     */
    prefetchChinese(text, role = 'chinese_teacher') {
        if (this.muted || !text || !this._shouldUseCloudTts()) return;
        const cleanText = cleanChineseForTts(text);
        if (!cleanText) return;
        this._fetchNeuralTtsBase64(cleanText, role).catch(() => {});
    }

    async _playNeuralMp3Base64(b64, token) {
        if (!b64 || token !== this._zhSpeakToken || this.muted) return false;

        // 1. 优先通过已手势解锁的 WebAudio 解码播放（完全不受 iPadOS Safari 异步回调自动播放拦截限制）
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (Ctx) {
                if (!this._audioCtx) this._audioCtx = new Ctx();
                if (this._audioCtx.state === 'suspended') {
                    await Promise.race([
                        this._audioCtx.resume().catch(() => {}),
                        new Promise(r => setTimeout(r, 160))
                    ]);
                }
                if (this._audioCtx.state === 'running') {
                    const ab = base64ToArrayBuffer(b64);
                    if (ab && ab.byteLength > 80 && token === this._zhSpeakToken) {
                        const decoded = await this._audioCtx.decodeAudioData(ab.slice(0));
                        if (token !== this._zhSpeakToken || this.muted) return true;
                        this._stopNeuralAudioOnly();
                        const src = this._audioCtx.createBufferSource();
                        src.buffer = decoded;
                        src.connect(this._audioCtx.destination);
                        this._activeBufferSrc = src;
                        this._lastPlaybackMode = 'neural-mp3';
                        src.onended = () => {
                            if (this._activeBufferSrc === src) this._activeBufferSrc = null;
                        };
                        src.start(0);
                        return true;
                    }
                }
            }
        } catch (_) {}

        // 2. 次选复用已手势解锁的单例 HTMLAudio 播放
        try {
            const audio = this._sharedHtmlAudio || (typeof Audio !== 'undefined' ? new Audio() : null);
            if (audio && token === this._zhSpeakToken && !this.muted) {
                audio.setAttribute('playsinline', 'true');
                audio.src = `data:audio/mpeg;base64,${b64}`;
                this._activeHtmlAudio = audio;
                audio.onended = () => {
                    if (this._activeHtmlAudio === audio) this._activeHtmlAudio = null;
                };
                audio.onerror = () => {
                    if (this._activeHtmlAudio === audio) this._activeHtmlAudio = null;
                };
                await audio.play();
                this._lastPlaybackMode = 'neural-mp3';
                return true;
            }
        } catch (_) {
            this._activeHtmlAudio = null;
        }

        return false;
    }

    _fallbackLocalChinese(cleanText) {
        if (this.muted || !cleanText) return;
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        try {
            if (!this.zhVoice) this.initVoices();
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
            const utter = new SpeechSynthesisUtterance(cleanText);
            utter.lang = 'zh-CN';
            if (this.zhVoice) utter.voice = this.zhVoice;
            utter.rate = 0.96;
            utter.pitch = 1.04;
            utter.volume = 1.0;
            this._lastPlaybackMode = 'speechSynthesis';
            window.speechSynthesis.speak(utter);
        } catch (e) {}
    }

    speakEnglish(text, slow = false, phonics = '') {
        if (this.muted || !text) return;
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        this.cancelAllSpeech();
        try {
            if (!this.enVoice) this.initVoices();
            window.speechSynthesis.resume();

            const cleanWord = String(text).trim();
            if (slow && phonics && cleanWord.indexOf(' ') === -1) {
                const firstUtter = new SpeechSynthesisUtterance(cleanWord);
                firstUtter.lang = 'en-US';
                if (this.enVoice) firstUtter.voice = this.enVoice;
                firstUtter.rate = 0.64;
                firstUtter.pitch = 1.06;
                firstUtter.volume = 1.0;
                window.speechSynthesis.speak(firstUtter);

                this._slowTimer = setTimeout(() => {
                    if (this.muted) return;
                    try {
                        const secondUtter = new SpeechSynthesisUtterance(cleanWord);
                        secondUtter.lang = 'en-US';
                        if (this.enVoice) secondUtter.voice = this.enVoice;
                        secondUtter.rate = 0.90;
                        secondUtter.pitch = 1.08;
                        secondUtter.volume = 1.0;
                        window.speechSynthesis.speak(secondUtter);
                    } catch (e) {}
                }, 850);
                return;
            }

            const utter = new SpeechSynthesisUtterance(cleanWord);
            utter.lang = 'en-US';
            if (this.enVoice) utter.voice = this.enVoice;
            utter.rate = slow ? 0.68 : 0.92;
            utter.pitch = 1.06;
            utter.volume = 1.0;
            window.speechSynthesis.speak(utter);
        } catch (e) {}
    }

    /**
     * 中文真人朗读（语文读题/古诗朗诵/数学应用题读题统一入口）：
     * 在线环境优先播放 Edge Neural TTS (zh-CN-XiaoxiaoNeural) 真人老师 MP3，断网才降级本地语音。
     */
    async speakChinese(text, opts = {}) {
        if (this.muted || !text) return false;
        if (typeof window === 'undefined') return false;

        // 同步在点击手势内解锁音频上下文
        this._unlockAudioInGesture();
        this.cancelAllSpeech();

        const cleanText = cleanChineseForTts(text);
        if (!cleanText) return false;

        const token = this._zhSpeakToken;
        const role = opts.role || 'chinese_teacher';

        if (this._shouldUseCloudTts()) {
            const b64 = await this._fetchNeuralTtsBase64(cleanText, role);
            if (token !== this._zhSpeakToken || this.muted) return false;
            if (b64) {
                const played = await this._playNeuralMp3Base64(b64, token);
                if (played || token !== this._zhSpeakToken) return true;
            }
        }

        if (token === this._zhSpeakToken && !this.muted) {
            this._fallbackLocalChinese(cleanText);
        }
        return false;
    }

    /**
     * 萌宠角色专属变声朗读：支持不同宠物的音高(pitch)、语速(rate)、声线(preferAltVoice)与Emoji净化
     */
    speakPetCharacter(text, { lang = 'zh-CN', pitch = 1.1, rate = 1.0, preferAltVoice = false, delayMs = 0 } = {}) {
        if (this.muted || !text) return;
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        this.cancelAllSpeech();

        const cleanText = String(text)
            .replace(/<[^>]+>/g, '')
            .replace(/\^_\^/g, '')
            .replace(/\p{Extended_Pictographic}/gu, '')
            .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
            .replace(/[✦✧★☆♪♫【】]/g, '')
            .trim();
        if (!cleanText) return;

        const runSpeak = () => {
            if (this.muted) return;
            try {
                if (!this.enVoice && !this.zhVoice) this.initVoices();
                window.speechSynthesis.resume();
                const utter = new SpeechSynthesisUtterance(cleanText);
                const isZh = /^zh/i.test(lang);
                utter.lang = isZh ? 'zh-CN' : 'en-US';
                const chosenVoice = isZh
                    ? (preferAltVoice ? (this.zhAltDeepVoice || this.zhVoice) : this.zhVoice)
                    : (preferAltVoice ? (this.enAltDeepVoice || this.enVoice) : this.enVoice);
                if (chosenVoice) utter.voice = chosenVoice;
                utter.pitch = Math.max(0.92, Math.min(1.12, Number(pitch) || 1.02));
                utter.rate = Math.max(0.92, Math.min(1.06, Number(rate) || 0.98));
                utter.volume = 1.0;
                window.speechSynthesis.speak(utter);
            } catch (e) {}
        };

        if (delayMs > 0) {
            this._petTimer = setTimeout(runSpeak, delayMs);
        } else {
            runSpeak();
        }
    }
}

export const sharedSpeech = new SharedSpeechHelper();
