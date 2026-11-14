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

    // 不同宠物的专属特色叫声/互动音效 (Web Audio 纯合成)
    playPetVoice(petId = 'rabbit') {
        if (this.muted || !this.throttle('petVoice', 100)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        const playSweep = (type, fStart, fEnd, tOffset, dur, vol = 0.24) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(fStart, now + tOffset);
            osc.frequency.exponentialRampToValueAtTime(Math.max(40, fEnd), now + tOffset + dur);
            gain.gain.setValueAtTime(vol, now + tOffset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + tOffset + dur + 0.02);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._cleanup(osc, gain);
            osc.start(now + tOffset);
            osc.stop(now + tOffset + dur + 0.03);
        };

        if (petId === 'frog' || petId === 'prince_frog') {
            // 呱呱～双连清脆蛙鸣
            playSweep('triangle', 220, 460, 0, 0.085, 0.26);
            playSweep('triangle', 250, 560, 0.12, 0.11, 0.28);
            if (petId === 'prince_frog') playSweep('sine', 880, 1318, 0.24, 0.14, 0.18);
        } else if (petId === 'rabbit' || petId === 'astro_rabbit') {
            // 噗啾～Q弹蹦跳铃音
            playSweep('sine', 480, 920, 0, 0.09, 0.25);
            playSweep('sine', 660, 1180, 0.10, 0.12, 0.24);
            if (petId === 'astro_rabbit') playSweep('triangle', 1320, 990, 0.22, 0.12, 0.16);
        } else if (petId === 'shiba') {
            // 汪汪～元气短促双吠
            playSweep('triangle', 340, 620, 0, 0.075, 0.27);
            playSweep('triangle', 390, 720, 0.11, 0.095, 0.27);
        } else if (petId === 'panda') {
            // 呼噜～圆润竹木琴音
            playSweep('sine', 330, 440, 0, 0.11, 0.26);
            playSweep('sine', 440, 587, 0.12, 0.14, 0.25);
        } else if (petId === 'tiger') {
            // 嗷呜～霸气又软萌的小虎啸
            playSweep('sawtooth', 190, 340, 0, 0.14, 0.16);
            playSweep('triangle', 340, 220, 0.13, 0.16, 0.22);
        } else if (petId === 'mecha_cat') {
            // 滴嘟喵～赛博电子猫音
            playSweep('square', 784, 1046, 0, 0.055, 0.12);
            playSweep('square', 1046, 1318, 0.065, 0.055, 0.12);
            playSweep('sine', 920, 620, 0.14, 0.16, 0.24);
        } else if (petId === 'unicorn' || petId === 'star_dragon') {
            // 叮铃/星吟～梦幻竖琴泛音琶音
            [587.33, 783.99, 987.77, 1318.51].forEach((f, idx) => {
                playSweep('sine', f, f * 1.03, idx * 0.055, 0.22, 0.20);
            });
        } else if (petId === 'succulent') {
            // 沙沙滴答～晨露水珠清音
            playSweep('sine', 620, 1240, 0, 0.08, 0.24);
            playSweep('sine', 880, 1480, 0.11, 0.11, 0.20);
        } else if (petId === 'pixiu') {
            // 叮当～招财金铃清脆双响
            playSweep('triangle', 1046.5, 1567.98, 0, 0.14, 0.22);
            playSweep('triangle', 1318.5, 1975.5, 0.11, 0.18, 0.20);
        } else {
            this.playFeed();
        }
    }

    // 投喂美食专属“咔嚓嚼嚼 + 满足欢叫”音效
    playEatSound(petId = 'rabbit') {
        if (this.muted || !this.throttle('eat', 120)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        // 三声Q弹咀嚼音 (nom-nom-nom)
        [0, 0.13, 0.26].forEach((t, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const baseF = 260 + idx * 45;
            osc.frequency.setValueAtTime(baseF, now + t);
            osc.frequency.exponentialRampToValueAtTime(baseF * 1.65, now + t + 0.075);
            gain.gain.setValueAtTime(0.24, now + t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.085);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._cleanup(osc, gain);
            osc.start(now + t);
            osc.stop(now + t + 0.09);
        });
        // 紧接宠物特色欢快叫声
        setTimeout(() => this.playPetVoice(petId), 360);
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
