/**
 * audio.js - 真人级神经网络卡通角色配音引擎 + 柔和自然木琴/水滴微音效 + 英语美音教学朗读
 * 采用预烘焙高表现力 Neural TTS 萌娃/少年/少女真声 MP3 (Web Audio 零延迟解码缓存)，彻底告别机械电子合成音！
 */

import { sharedSpeech } from '../../shared/audioTTS.js';
import { getPetVoiceProfile } from './config.js';

const VOICE_ASSET_VER = 'nv1';

// 每只萌宠点击时的轻柔自然微触感基频 (纯正弦波柔和水滴/木琴泛音，绝不使用刺耳锯齿波/方波)
const PET_SOFT_TOUCH_NOTES = {
    rabbit:       [659.25, 880.00],
    frog:         [493.88, 739.99],
    shiba:        [587.33, 783.99],
    panda:        [440.00, 587.33],
    tiger:        [392.00, 523.25],
    unicorn:      [698.46, 1046.50],
    succulent:    [659.25, 987.77],
    pixiu:        [587.33, 880.00],
    astro_rabbit: [659.25, 987.77],
    prince_frog:  [523.25, 783.99],
    star_dragon:  [440.00, 659.25],
    mecha_cat:    [739.99, 987.77]
};

class SoundAndSpeechEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.lastPlayed = {};
        this.enVoice = null;
        this.zhVoice = null;

        // 神经网络真人卡通配音缓存与并发控制
        this.voiceBufferCache = new Map();
        this.voiceFetchPromises = new Map();
        this.activeVoiceSource = null;
        this.activeVoiceGain = null;
        this.fallbackHtmlAudio = null;
        this._voiceDelayTimer = null;
        this._voiceToken = 0;
        this._autoClipCounter = 0;
        this.lastPlayedVoiceInfo = null;

        this.initVoices();
    }

    initVoices() {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const load = () => {
            const voices = window.speechSynthesis.getVoices() || [];
            this.enVoice =
                voices.find(v => /Samantha|Ava|Allison|Google US English/i.test(v.name)) ||
                voices.find(v => v.lang === 'en-US') ||
                voices.find(v => v.lang && v.lang.startsWith('en')) ||
                null;
            this.zhVoice =
                voices.find(v => /Tingting|Ting-Ting|Meijia|Google 普通话/i.test(v.name)) ||
                voices.find(v => v.lang === 'zh-CN') ||
                voices.find(v => v.lang && v.lang.startsWith('zh')) ||
                null;
        };
        load();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = load;
        }
    }

    ensureContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                try {
                    this.ctx = new AudioCtx();
                } catch (e) {
                    return null;
                }
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    toggleMute() {
        this.muted = !this.muted;
        sharedSpeech.setMuted(this.muted);
        if (this.muted) {
            this.stopActivePetAudio();
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        }
        return this.muted;
    }

    stopActivePetAudio() {
        this._voiceToken++;
        if (this._voiceDelayTimer) {
            clearTimeout(this._voiceDelayTimer);
            this._voiceDelayTimer = null;
        }
        if (this.activeVoiceGain && this.activeVoiceSource && this.ctx) {
            try {
                const now = this.ctx.currentTime;
                const g = this.activeVoiceGain;
                const src = this.activeVoiceSource;
                g.gain.cancelScheduledValues(now);
                g.gain.setValueAtTime(Math.max(0.001, g.gain.value || 1), now);
                g.gain.linearRampToValueAtTime(0.0001, now + 0.022);
                src.stop(now + 0.026);
            } catch (e) {}
        }
        this.activeVoiceSource = null;
        this.activeVoiceGain = null;
        if (this.fallbackHtmlAudio) {
            try {
                this.fallbackHtmlAudio.pause();
                this.fallbackHtmlAudio.currentTime = 0;
            } catch (e) {}
        }
    }

    throttle(name, ms = 45) {
        const now = performance.now();
        if (this.lastPlayed[name] && now - this.lastPlayed[name] < ms) return false;
        this.lastPlayed[name] = now;
        return true;
    }

    _cleanup(osc, gain) {
        osc.onended = () => {
            try {
                osc.disconnect();
                gain.disconnect();
            } catch (e) {}
        };
    }

    _getClipUrl(petId, clipKey) {
        return `assets/voices/${petId}/${clipKey}.mp3?v=${VOICE_ASSET_VER}`;
    }

    async _loadAudioBuffer(url) {
        if (this.voiceBufferCache.has(url)) {
            return this.voiceBufferCache.get(url);
        }
        if (this.voiceFetchPromises.has(url)) {
            return this.voiceFetchPromises.get(url);
        }
        const promise = (async () => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const arr = await res.arrayBuffer();
            const ctx = this.ensureContext();
            if (!ctx) throw new Error('No AudioContext');
            const decoded = await ctx.decodeAudioData(arr.slice(0));
            this.voiceBufferCache.set(url, decoded);
            return decoded;
        })();
        this.voiceFetchPromises.set(url, promise);
        try {
            return await promise;
        } finally {
            this.voiceFetchPromises.delete(url);
        }
    }

    /**
     * 后台静默预热当前出战宠物的核心语音包，点按即刻 0 延迟开口
     */
    preloadPetVoices(petId = 'rabbit') {
        if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
        const profile = getPetVoiceProfile(petId);
        const coreKeys = ['tap_0', 'tap_1', 'feed_0', 'stage_1', 'en_0'];
        if (profile.clips?.includes('lotus')) coreKeys.push('lotus');
        coreKeys.forEach(k => {
            if (!profile.clips || profile.clips.includes(k)) {
                const url = this._getClipUrl(petId, k);
                if (!this.voiceBufferCache.has(url) && !this.voiceFetchPromises.has(url)) {
                    fetch(url)
                        .then(r => (r.ok ? r.arrayBuffer() : null))
                        .then(buf => {
                            if (buf && this.ctx) {
                                return this.ctx.decodeAudioData(buf.slice(0)).then(dec => {
                                    this.voiceBufferCache.set(url, dec);
                                });
                            }
                        })
                        .catch(() => {});
                }
            }
        });
    }

    _resolveValidClipKey(petId, requestedKey = '', preferEnglish = false) {
        const profile = getPetVoiceProfile(petId);
        const validSet = profile.clips || [];
        if (requestedKey && validSet.includes(requestedKey)) {
            return requestedKey;
        }
        const idx = this._autoClipCounter++;
        if (preferEnglish) {
            const enChoices = validSet.filter(k => k.startsWith('en_'));
            if (enChoices.length) return enChoices[idx % enChoices.length];
        }
        const tapChoices = validSet.filter(k => k.startsWith('tap_'));
        if (tapChoices.length) return tapChoices[idx % tapChoices.length];
        return validSet[0] || 'tap_0';
    }

    async _playNeuralClip(petId, clipKey, { fallbackText = '', fallbackLang = 'zh-CN', token = 0 } = {}) {
        if (this.muted || token !== this._voiceToken) return;
        const profile = getPetVoiceProfile(petId);
        const url = this._getClipUrl(petId, clipKey);
        const actor = fallbackLang.startsWith('en') ? profile.enActor : profile.zhActor;

        try {
            const buffer = await this._loadAudioBuffer(url);
            if (this.muted || token !== this._voiceToken) return;
            const ctx = this.ensureContext();
            if (ctx && buffer) {
                const src = ctx.createBufferSource();
                const gain = ctx.createGain();
                src.buffer = buffer;
                gain.gain.setValueAtTime(1.08, ctx.currentTime);
                src.connect(gain);
                gain.connect(ctx.destination);
                src.onended = () => {
                    if (this.activeVoiceSource === src) {
                        this.activeVoiceSource = null;
                        this.activeVoiceGain = null;
                    }
                    try {
                        src.disconnect();
                        gain.disconnect();
                    } catch (e) {}
                };
                this.activeVoiceSource = src;
                this.activeVoiceGain = gain;
                src.start(0);
                this.lastPlayedVoiceInfo = {
                    petId,
                    clipKey,
                    url,
                    actor,
                    mode: 'neural-mp3',
                    duration: Number(buffer.duration.toFixed(2)),
                    ts: Date.now()
                };
                return;
            }
        } catch (err) {
            // 若 WebAudio 解码受限，优先尝试 HTMLAudioElement 播放真实配音 MP3
            if (typeof Audio !== 'undefined' && !this.muted && token === this._voiceToken) {
                try {
                    if (!this.fallbackHtmlAudio) {
                        this.fallbackHtmlAudio = new Audio();
                    }
                    this.fallbackHtmlAudio.src = url;
                    this.fallbackHtmlAudio.volume = 1.0;
                    await this.fallbackHtmlAudio.play();
                    this.lastPlayedVoiceInfo = {
                        petId,
                        clipKey,
                        url,
                        actor,
                        mode: 'neural-html-audio',
                        ts: Date.now()
                    };
                    return;
                } catch (e2) {}
            }
        }

        // 极端离线兜底：使用自然舒适音高的人声朗读，绝不拉伸出机械金属声
        if (fallbackText && !this.muted && token === this._voiceToken) {
            this.lastPlayedVoiceInfo = {
                petId,
                clipKey,
                url,
                actor,
                mode: 'tts-fallback',
                ts: Date.now()
            };
            sharedSpeech.speakPetCharacter(fallbackText, {
                lang: fallbackLang,
                pitch: profile.pitch,
                rate: profile.rate,
                preferAltVoice: profile.preferAltVoice,
                delayMs: 0
            });
        }
    }

    // 英语地道朗读 (共享 iPadOS 解锁与自然音色引擎，支持常速与慢速自然拼读跟读)
    speakEnglish(text, slow = false, phonics = '') {
        if (this.muted || !text) return;
        this.stopActivePetAudio();
        sharedSpeech.speakEnglish(text, slow, phonics);
    }

    // 中文应用题温柔语音读题
    speakChinese(text) {
        if (this.muted || !text) return;
        this.stopActivePetAudio();
        sharedSpeech.speakChinese(text);
    }

    // 果冻按键清脆波普音
    playTap() {
        if (this.muted || !this.throttle('tap', 30)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.055);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        this._cleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.065);
    }

    // 答对欢快大和弦 (C5-E5-G5-C6)
    playCorrect() {
        if (this.muted) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.055);
            gain.gain.setValueAtTime(0.26, now + idx * 0.055);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34 + idx * 0.055);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._cleanup(osc, gain);
            osc.start(now + idx * 0.055);
            osc.stop(now + 0.38 + idx * 0.055);
        });
    }

    // 答错温柔Q弹提示音 (不制造挫败感)
    playWrong() {
        if (this.muted) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.22);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        this._cleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.24);
    }

    // 投喂萌宠/摸摸头软萌圆润水滴音
    playFeed() {
        if (this.muted || !this.throttle('feed', 80)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        [440, 587.33, 880].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.065);
            gain.gain.setValueAtTime(0.18, now + i * 0.065);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24 + i * 0.065);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._cleanup(osc, gain);
            osc.start(now + i * 0.065);
            osc.stop(now + 0.27 + i * 0.065);
        });
    }

    /**
     * 温润柔和的木琴/水滴互动触感微音 (彻底移除刺耳锯齿波/方波合成器叫声)
     */
    playSoftPetTouch(petId = 'rabbit') {
        if (this.muted || !this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const pair = PET_SOFT_TOUCH_NOTES[petId] || PET_SOFT_TOUCH_NOTES.rabbit;
        pair.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const t0 = now + idx * 0.042;
            osc.frequency.setValueAtTime(freq, t0);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.06, t0 + 0.075);
            gain.gain.setValueAtTime(0.001, t0);
            gain.gain.linearRampToValueAtTime(0.11, t0 + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.095);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._cleanup(osc, gain);
            osc.start(t0);
            osc.stop(t0 + 0.105);
        });
    }

    // 单独触发萌宠轻柔招呼（如卸下饰品时）
    playPetVoice(petId = 'rabbit') {
        if (this.muted || !this.throttle('petVoice', 80)) return;
        this.playSoftPetTouch(petId);
    }

    /**
     * 萌宠角色自然真声开口说话：轻柔水滴微触感 + 真人神经网络萌娃/少年/少女角色配音！
     */
    speakAsPet(petId = 'rabbit', { clipKey = '', zhText = '', enText = '', preferEnglish = false, withCry = true } = {}) {
        if (this.muted) return;
        sharedSpeech.cancelAllSpeech();
        this.stopActivePetAudio();
        const token = this._voiceToken;

        if (withCry) {
            this.playSoftPetTouch(petId);
        }

        const useEn = preferEnglish && Boolean(enText);
        const resolvedClip = this._resolveValidClipKey(petId, clipKey, useEn);
        const fallbackText = useEn ? enText : (zhText || enText);
        const fallbackLang = useEn ? 'en-US' : 'zh-CN';

        const delay = withCry ? 45 : 0;
        if (delay > 0) {
            this._voiceDelayTimer = setTimeout(() => {
                this._voiceDelayTimer = null;
                this._playNeuralClip(petId, resolvedClip, { fallbackText, fallbackLang, token });
            }, delay);
        } else {
            this._playNeuralClip(petId, resolvedClip, { fallbackText, fallbackLang, token });
        }
    }

    // 店铺收银/巡店金币叮当音效
    playCoinChime() {
        if (this.muted || !this.throttle('coin', 90)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        [987.77, 1318.51, 1975.53].forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.06);
            gain.gain.setValueAtTime(0.22, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._cleanup(osc, gain);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.28);
        });
    }

    // 投喂美食专属“软萌气泡咀嚼 + 角色满足真声感叹”音效
    playEatSound(petId = 'rabbit', yummyLine = '', clipKey = '') {
        if (this.muted || !this.throttle('eat', 120)) return;
        sharedSpeech.cancelAllSpeech();
        this.stopActivePetAudio();
        const token = this._voiceToken;

        if (this.ensureContext()) {
            const now = this.ctx.currentTime;
            // 柔和圆润气泡咀嚼微音 (纯 sine 软包络，温暖不刺耳)
            [0, 0.105, 0.21].forEach((t, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                const baseF = 310 + idx * 42;
                osc.frequency.setValueAtTime(baseF, now + t);
                osc.frequency.exponentialRampToValueAtTime(baseF * 1.42, now + t + 0.068);
                gain.gain.setValueAtTime(0.001, now + t);
                gain.gain.linearRampToValueAtTime(0.16, now + t + 0.012);
                gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.08);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                this._cleanup(osc, gain);
                osc.start(now + t);
                osc.stop(now + t + 0.088);
            });
        }

        const profile = getPetVoiceProfile(petId);
        const feedClips = (profile.clips || []).filter(k => k.startsWith('feed_'));
        const resolvedClip = (clipKey && profile.clips?.includes(clipKey))
            ? clipKey
            : (feedClips.length ? feedClips[this._autoClipCounter++ % feedClips.length] : 'feed_0');

        this._voiceDelayTimer = setTimeout(() => {
            this._voiceDelayTimer = null;
            this._playNeuralClip(petId, resolvedClip, {
                fallbackText: yummyLine,
                fallbackLang: 'zh-CN',
                token
            });
        }, 270);
    }

    // 升级 / 满级毕业 / 店铺建成华丽礼花凯歌
    playLevelUp() {
        if (this.muted) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const notes = [
            { f: 523.25, t: 0, d: 0.12 },
            { f: 659.25, t: 0.10, d: 0.12 },
            { f: 783.99, t: 0.20, d: 0.12 },
            { f: 1046.50, t: 0.30, d: 0.35 },
            { f: 1318.51, t: 0.44, d: 0.45 }
        ];
        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, now + n.t);
            gain.gain.setValueAtTime(0.30, now + n.t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._cleanup(osc, gain);
            osc.start(now + n.t);
            osc.stop(now + n.t + n.d + 0.03);
        });
    }

    // 盲盒扭蛋机转动与开箱惊喜音效
    playGachaOpen() {
        if (this.muted) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const climb = [392, 440, 493.88, 587.33, 659.25, 783.99, 1046.5, 1567.98];
        climb.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = idx >= 6 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.06);
            gain.gain.setValueAtTime(0.24, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + (idx >= 6 ? 0.45 : 0.14));
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._cleanup(osc, gain);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + (idx >= 6 ? 0.48 : 0.16));
        });
    }
}

export const soundEngine = new SoundAndSpeechEngine();
