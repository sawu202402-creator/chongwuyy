/**
 * audio.js - 纯 Web Audio API 欢快音效合成 + Web Speech API 英语美音/中文读题朗读引擎
 * 零外部音频文件依赖，iPad Safari / Chrome / PC 全平台零报错顺畅运行
 */

import { sharedSpeech } from '../../shared/audioTTS.js';
import { getPetVoiceProfile } from './config.js';

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

    // 不同宠物的专属高辨识度共振峰拟声 + 角色专属声线朗读
    playPetVoice(petId = 'rabbit') {
        if (this.muted || !this.throttle('petVoice', 90)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        const playSweep = (type, fStart, fEnd, tOffset, dur, vol = 0.36) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(Math.max(40, fStart), now + tOffset);
            osc.frequency.exponentialRampToValueAtTime(Math.max(40, fEnd), now + tOffset + dur);
            gain.gain.setValueAtTime(0.001, now + tOffset);
            gain.gain.linearRampToValueAtTime(vol, now + tOffset + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, now + tOffset + dur + 0.025);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._cleanup(osc, gain);
            osc.start(now + tOffset);
            osc.stop(now + tOffset + dur + 0.035);
        };

        const playFormantCall = (type, fStart, fEnd, filterStart, filterEnd, qVal, tOffset, dur, vol = 0.42) => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(Math.max(40, fStart), now + tOffset);
            osc.frequency.exponentialRampToValueAtTime(Math.max(40, fEnd), now + tOffset + dur);
            filter.type = 'bandpass';
            filter.Q.setValueAtTime(qVal, now + tOffset);
            filter.frequency.setValueAtTime(filterStart, now + tOffset);
            filter.frequency.exponentialRampToValueAtTime(filterEnd, now + tOffset + dur);
            gain.gain.setValueAtTime(0.001, now + tOffset);
            gain.gain.linearRampToValueAtTime(vol, now + tOffset + 0.018);
            gain.gain.exponentialRampToValueAtTime(0.001, now + tOffset + dur + 0.03);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            osc.onended = () => {
                try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch (e) {}
            };
            osc.start(now + tOffset);
            osc.stop(now + tOffset + dur + 0.04);
        };

        if (petId === 'frog' || petId === 'prince_frog') {
            // 逼真鸣囊共振“呱～呱！”双蛙鸣 + 荷塘水珠清音
            playFormantCall('sawtooth', 145, 225, 340, 960, 4.2, 0, 0.12, 0.48);
            playFormantCall('sawtooth', 160, 265, 380, 1120, 4.5, 0.15, 0.14, 0.50);
            playSweep('sine', 640, 1320, 0.28, 0.08, 0.24);
            if (petId === 'prince_frog') {
                [523.25, 659.25, 783.99].forEach((f, idx) => playSweep('triangle', f, f * 1.01, 0.24 + idx * 0.045, 0.14, 0.22));
            }
        } else if (petId === 'rabbit') {
            // 软萌高音“噗啾啾～”三连兔鸣
            playSweep('sine', 780, 1360, 0, 0.075, 0.36);
            playSweep('sine', 960, 1620, 0.085, 0.085, 0.38);
            playSweep('triangle', 1180, 1480, 0.18, 0.09, 0.26);
        } else if (petId === 'astro_rabbit') {
            // NASA 太空通讯“哔—嘟！”电波 + 太空兔啾啾音
            playSweep('sine', 2475, 2475, 0, 0.065, 0.24);
            playSweep('sine', 880, 1520, 0.08, 0.09, 0.34);
            playSweep('triangle', 1320, 1980, 0.18, 0.11, 0.28);
        } else if (petId === 'shiba') {
            // 元气奶柴“汪！汪呜！”短促双吠
            playFormantCall('sawtooth', 260, 520, 550, 1350, 3.2, 0, 0.09, 0.46);
            playFormantCall('sawtooth', 300, 610, 620, 1500, 3.2, 0.12, 0.11, 0.48);
        } else if (petId === 'panda') {
            // 憨萌竹熊“嗯～呼噜”低柔撒娇音 + 清脆竹节声
            playFormantCall('triangle', 210, 310, 360, 680, 3.0, 0, 0.15, 0.46);
            playFormantCall('sine', 290, 230, 480, 360, 2.5, 0.14, 0.16, 0.42);
            playSweep('triangle', 740, 520, 0.26, 0.05, 0.25);
        } else if (petId === 'tiger') {
            // 小白虎王“嗷——呜！”浑厚虎啸 + 雷电火花
            playFormantCall('sawtooth', 115, 250, 280, 820, 3.5, 0, 0.16, 0.48);
            playFormantCall('sawtooth', 240, 135, 760, 320, 3.5, 0.15, 0.19, 0.46);
        } else if (petId === 'mecha_cat') {
            // 赛博电子音 + 逼真“喵～呜”共振峰猫叫
            playSweep('square', 987.77, 1318.5, 0, 0.05, 0.16);
            playFormantCall('sawtooth', 520, 880, 850, 1850, 4.0, 0.06, 0.12, 0.40);
            playFormantCall('triangle', 860, 510, 1750, 820, 3.8, 0.17, 0.15, 0.38);
        } else if (petId === 'unicorn') {
            // 梦幻水晶竖琴滑音 + 仙驹轻鸣
            [587.33, 739.99, 880, 1174.66, 1479.98].forEach((f, idx) => {
                playSweep('sine', f, f * 1.02, idx * 0.045, 0.22, 0.26);
            });
        } else if (petId === 'star_dragon') {
            // 深空星海龙吟五度和弦 + 流星泛音
            playSweep('triangle', 196, 293.66, 0, 0.28, 0.34);
            playSweep('sine', 392, 587.33, 0.04, 0.28, 0.28);
            playSweep('sine', 1174.66, 1760, 0.16, 0.20, 0.22);
        } else if (petId === 'succulent') {
            // 森林晨露水珠双连清脆叮咚
            playSweep('sine', 540, 1320, 0, 0.085, 0.36);
            playSweep('sine', 820, 1760, 0.10, 0.11, 0.32);
        } else if (petId === 'pixiu') {
            // 招财金铃喜庆三连脆响
            [1046.5, 1318.5, 1567.98, 2093].forEach((f, idx) => {
                playSweep('triangle', f, f * 1.01, idx * 0.055, 0.18, 0.28);
            });
        } else {
            this.playFeed();
        }
    }

    /**
     * 先播放宠物专属拟声叫声，随后用该宠物的专属变声音高/语速/声线说出角色台词！
     */
    speakAsPet(petId = 'rabbit', { zhText = '', enText = '', preferEnglish = false, withCry = true } = {}) {
        if (this.muted) return;
        sharedSpeech.cancelAllSpeech();
        if (withCry) {
            this.playPetVoice(petId);
        }
        const profile = getPetVoiceProfile(petId);
        const useEn = preferEnglish && Boolean(enText);
        const text = useEn ? enText : (zhText || enText);
        if (!text) return;
        sharedSpeech.speakPetCharacter(text, {
            lang: useEn ? 'en-US' : 'zh-CN',
            pitch: profile.pitch,
            rate: profile.rate,
            preferAltVoice: profile.preferAltVoice,
            delayMs: withCry ? 340 : 40
        });
    }

    // 店铺收银/巡店金币叮当音效
    playCoinChime() {
        if (this.muted || !this.throttle('coin', 90)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        [987.77, 1318.51, 1975.53].forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + idx * 0.065);
            gain.gain.setValueAtTime(0.30, now + idx * 0.065);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.28);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._cleanup(osc, gain);
            osc.start(now + idx * 0.065);
            osc.stop(now + idx * 0.065 + 0.31);
        });
    }

    // 投喂美食专属“咔嚓嚼嚼 + 满足欢叫 + 角色美味发言”音效
    playEatSound(petId = 'rabbit', yummyLine = '') {
        if (this.muted || !this.throttle('eat', 120)) return;
        sharedSpeech.cancelAllSpeech();
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
            gain.gain.setValueAtTime(0.30, now + t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.085);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._cleanup(osc, gain);
            osc.start(now + t);
            osc.stop(now + t + 0.09);
        });
        // 紧接宠物特色欢快叫声 + 专属变声美味发言
        setTimeout(() => this.playPetVoice(petId), 340);
        if (yummyLine) {
            const profile = getPetVoiceProfile(petId);
            sharedSpeech.speakPetCharacter(yummyLine, {
                lang: 'zh-CN',
                pitch: profile.pitch,
                rate: profile.rate,
                preferAltVoice: profile.preferAltVoice,
                delayMs: 680
            });
        }
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
