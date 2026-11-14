/**
 * audio.js - 纯 Web Audio API 欢快音效合成 + Web Speech API 英语美音/中文读题朗读引擎
 * 零外部音频文件依赖，iPad Safari / Chrome / PC 全平台零报错顺畅运行
 */

import { sharedSpeech } from '../../shared/audioTTS.js';

class SoundAndSpeechEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.lastPlayed = {};
        this.enVoice = null;
        this.zhVoice = null;
        this.initVoices();
    }

    initVoices() {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const load = () => {
            const voices = window.speechSynthesis.getVoices() || [];
            // 优先挑选 iPad / iOS / Chrome 自然清晰的美式/英式女声
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
        if (this.muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        return this.muted;
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

    // 英语地道朗读 (共享 iPadOS 解锁与自然音色引擎，支持常速与慢速自然拼读跟读)
    speakEnglish(text, slow = false, phonics = '') {
        if (this.muted || !text) return;
        sharedSpeech.speakEnglish(text, slow, phonics);
    }

    // 中文应用题温柔语音读题
    speakChinese(text) {
        if (this.muted || !text) return;
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
        gain.gain.setValueAtTime(0.18, now);
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
            gain.gain.setValueAtTime(0.28, now + idx * 0.055);
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
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        this._cleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.24);
    }

    // 投喂萌宠/摸摸头软萌音效
    playFeed() {
        if (this.muted || !this.throttle('feed', 80)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        [440, 587.33, 880].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.07);
            gain.gain.setValueAtTime(0.25, now + i * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28 + i * 0.07);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._cleanup(osc, gain);
            osc.start(now + i * 0.07);
            osc.stop(now + 0.31 + i * 0.07);
        });
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
            gain.gain.setValueAtTime(0.34, now + n.t);
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
            gain.gain.setValueAtTime(0.26, now + idx * 0.06);
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
