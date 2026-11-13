/**
 * audio.js - 纯 Web Audio API 高保真程序化音频合成引擎
 * 零外部音频依赖，零网络延迟，零跨域报错，iOS/Android/PC 全平台纯净运行
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.lastPlayed = {};
        this.init();
    }

    init() {
        // 延迟至首次用户交互时再创建 AudioContext，避免移动端自动播放限制警告与首屏音频线程开销
    }

    ensureContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                try {
                    this.ctx = new AudioContext();
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

    resume() {
        this.ensureContext();
    }

    _bindAutoCleanup(osc, gain) {
        osc.onended = () => {
            try {
                osc.disconnect();
                gain.disconnect();
            } catch (e) {}
        };
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    throttle(name, ms = 40) {
        const now = performance.now();
        if (this.lastPlayed[name] && now - this.lastPlayed[name] < ms) {
            return false;
        }
        this.lastPlayed[name] = now;
        return true;
    }

    // 种植植物时原木顿音
    playPlant() {
        if (this.muted || !this.throttle('plant', 35)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        this._bindAutoCleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.13);
    }

    // 豌豆射击弹射音
    playShoot() {
        if (this.muted || !this.throttle('shoot', 65)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(210, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        this._bindAutoCleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.09);
    }

    // 豌豆命中碎裂音
    playSplat() {
        if (this.muted || !this.throttle('splat', 55)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.07);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        this._bindAutoCleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    // 僵尸啃咬音 (咔嚓咀嚼)
    playBite() {
        if (this.muted || !this.throttle('bite', 120)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        this._bindAutoCleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.11);
    }

    // 拾取阳光清脆水晶和弦 (Ding-Shimmer)
    playSunCollect() {
        this.playSun();
    }

    playSun() {
        if (this.muted || !this.throttle('sun', 70)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        [880, 1174, 1760].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.04);
            gain.gain.setValueAtTime(0.25, now + i * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + i * 0.04);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            this._bindAutoCleanup(osc, gain);
            osc.start(now + i * 0.04);
            osc.stop(now + 0.4 + i * 0.04);
        });
    }

    // 数学答对激励欢快大和弦 (C5-E5-G5-C6)
    playMathCorrect() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            gain.gain.setValueAtTime(0.3, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + idx * 0.06);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.06);
            osc.stop(now + 0.4 + idx * 0.06);
        });
    }

    // 数学答错温柔弹簧音 (Boing)
    playMathWrong() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.22);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
    }

    // 天雷击碎数理护盾 (Thunder Crash)
    playThunder() {
        if (this.muted || !this.throttle('thunder', 80)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        // 噪声与低频双震荡
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        this._bindAutoCleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.46);
    }

    playGroan() {
        if (this.muted || !this.throttle('groan', 400)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.15);
        osc.frequency.linearRampToValueAtTime(65, now + 0.35);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        this._bindAutoCleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.36);
    }

    playBoom() {
        this.playExplosion();
    }

    // 一大波僵尸逼近：经典双音调警报与低频轰鸣
    playHugeWave() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        // 警报高低交替音 (Siren Wailing)
        const oscSiren = this.ctx.createOscillator();
        const gainSiren = this.ctx.createGain();
        oscSiren.type = 'sawtooth';
        oscSiren.frequency.setValueAtTime(480, now);
        oscSiren.frequency.linearRampToValueAtTime(720, now + 0.35);
        oscSiren.frequency.linearRampToValueAtTime(480, now + 0.7);
        oscSiren.frequency.linearRampToValueAtTime(720, now + 1.05);
        oscSiren.frequency.linearRampToValueAtTime(420, now + 1.4);
        gainSiren.gain.setValueAtTime(0.35, now);
        gainSiren.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
        oscSiren.connect(gainSiren);
        gainSiren.connect(this.ctx.destination);
        oscSiren.start(now);
        oscSiren.stop(now + 1.65);

        // 低频压迫轰鸣
        const oscSub = this.ctx.createOscillator();
        const gainSub = this.ctx.createGain();
        oscSub.type = 'triangle';
        oscSub.frequency.setValueAtTime(85, now);
        oscSub.frequency.exponentialRampToValueAtTime(35, now + 1.2);
        gainSub.gain.setValueAtTime(0.65, now);
        gainSub.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
        oscSub.connect(gainSub);
        gainSub.connect(this.ctx.destination);
        oscSub.start(now);
        oscSub.stop(now + 1.35);
    }

    // 坚果保龄球发射与滚地原木低鸣
    playBowlingRoll() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
    }

    // 保龄球撞击僵尸：原版清脆重木击球与球瓶击倒音
    playBowlingStrike() {
        if (this.muted || !this.throttle('bowling_strike', 60)) return;
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        // 瞬间撞击高音
        const oscHigh = this.ctx.createOscillator();
        const gainHigh = this.ctx.createGain();
        oscHigh.type = 'sine';
        oscHigh.frequency.setValueAtTime(950, now);
        oscHigh.frequency.exponentialRampToValueAtTime(220, now + 0.12);
        gainHigh.gain.setValueAtTime(0.6, now);
        gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        oscHigh.connect(gainHigh);
        gainHigh.connect(this.ctx.destination);
        oscHigh.start(now);
        oscHigh.stop(now + 0.13);

        // 重击木质低沉共鸣
        const oscLow = this.ctx.createOscillator();
        const gainLow = this.ctx.createGain();
        oscLow.type = 'triangle';
        oscLow.frequency.setValueAtTime(220, now);
        oscLow.frequency.exponentialRampToValueAtTime(55, now + 0.22);
        gainLow.gain.setValueAtTime(0.7, now);
        gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        oscLow.connect(gainLow);
        gainLow.connect(this.ctx.destination);
        oscLow.start(now);
        oscLow.stop(now + 0.23);
    }

    // 樱桃炸弹 / 土豆地雷 爆炸震撼低音
    playExplosion() {
        if (this.muted || !this.throttle('explosion', 80)) return;
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.5);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        this._bindAutoCleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.56);
    }

    // 连对觉醒大招激昂号角
    playUlt() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const chords = [440, 554.37, 659.25, 880];
        chords.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.85);
        });
    }

    // 除草机轰鸣启动
    playMower() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.linearRampToValueAtTime(190, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(60, now + 1.2);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.25);
    }

    // 胜利华丽凯歌
    playVictory() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx) return;
        const notes = [
            { f: 523.25, d: 0.15 },
            { f: 659.25, d: 0.15 },
            { f: 783.99, d: 0.15 },
            { f: 1046.50, d: 0.4 }
        ];
        let offset = 0;
        const now = this.ctx.currentTime;
        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, now + offset);
            gain.gain.setValueAtTime(0.4, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + n.d);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + offset);
            osc.stop(now + offset + n.d + 0.05);
            offset += n.d * 0.85;
        });
    }

    // 2-5 木槌砸击音效
    playMalletWhack() {
        if (this.muted || !this.throttle('whack', 45)) return;
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // 低频木槌闷响
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(190, now);
        osc1.frequency.exponentialRampToValueAtTime(52, now + 0.14);
        gain1.gain.setValueAtTime(0.55, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.16);

        // 清脆敲头泛音
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, now);
        osc2.frequency.exponentialRampToValueAtTime(180, now + 0.08);
        gain2.gain.setValueAtTime(0.32, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.1);
    }

    // 舞王僵尸迪斯科伴舞登场律动音
    playDisco() {
        if (this.muted || !this.throttle('disco', 300)) return;
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const riff = [
            { f: 329.63, t: 0, d: 0.12 },
            { f: 392.00, t: 0.11, d: 0.12 },
            { f: 493.88, t: 0.22, d: 0.14 },
            { f: 659.25, t: 0.35, d: 0.28 }
        ];
        riff.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(n.f, now + n.t);
            gain.gain.setValueAtTime(0.18, now + n.t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + n.t);
            osc.stop(now + n.t + n.d + 0.02);
        });
    }

    // 关卡失败温馨重试音
    playLose() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [440, 415.3, 392, 349.23].forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.18);
            gain.gain.setValueAtTime(0.28, now + idx * 0.18);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * 0.22);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.18);
            osc.stop(now + (idx + 1) * 0.23);
        });
    }
}

export const soundEngine = new SoundEngine();
