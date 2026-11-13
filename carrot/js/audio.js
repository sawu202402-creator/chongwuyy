/**
 * audio.js - 保卫萝卜官方原声音频引擎 (iPad / WebKit 终极防卡死与内存零泄露架构)
 * 采用 Web Audio API (AudioBuffer) 极速混音 + 严格音效去重防堆叠 + 静态对象池双缓冲
 * 彻底消灭 cloneNode 导致的 iOS WebKit media 崩溃与长局卡死
 */

class OfficialSoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.buffers = {};
        this.fallbackPool = {}; // 静态定长池（每个音效至多 2 个复用实例，严禁 cloneNode）
        this.poolIndex = {};
        this.lastPlayed = {};   // 最小播放间隔节流 (>= 40ms)，防止同帧密集爆音
        this.bgMusic = null;
        this.initialized = false;
        this.init();
    }

    init() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            try {
                this.ctx = new AudioContext();
            } catch (e) {
                console.warn('AudioContext creation deferred:', e);
            }
        }

        const sounds = [
            'TowerBulid', 'TowerUpdata', 'TowerSell', 'TowerSelect', 'TowerDeselect',
            'Bottle', 'Sun', 'Shit', 'Star', 'Fan', 'Rocket', 'Ball', 'FireBottle',
            'Pin', 'Arrow', 'PStar', 'Snow', 'Fish', 'Plane', 'Anchor', 'Cuttle', 'Mushroom', 'Buff',
            'carrot1', 'carrot2', 'carrot3',
            'Perfect', 'Lose', 'Crash', 'CountDown', 'GO', 'SelectFault'
        ];

        // 1. 初始化静态备用池 (每个音效最多 2 个 Audio 对象循环复用，绝不无节制 clone)
        sounds.forEach(name => {
            const path = `assets/music/${name}.mp3`;
            this.fallbackPool[name] = [
                new Audio(path),
                new Audio(path)
            ];
            this.fallbackPool[name].forEach(a => {
                a.preload = 'auto';
            });
            this.poolIndex[name] = 0;
            this.lastPlayed[name] = 0;

            // 2. 异步使用 Web Audio 解码为零开销 AudioBuffer
            if (this.ctx && typeof fetch !== 'undefined') {
                fetch(path)
                    .then(res => {
                        if (!res.ok) throw new Error('fetch error');
                        return res.arrayBuffer();
                    })
                    .then(arrayBuf => this.ctx.decodeAudioData(arrayBuf))
                    .then(decodedBuf => {
                        this.buffers[name] = decodedBuf;
                    })
                    .catch(() => {
                        // 降级使用 fallbackPool
                    });
            }
        });

        // 3. 背景音乐 (独占单一 Audio 实例)
        this.bgMusic = new Audio('assets/music/BGMusic01.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.32;
        this.bgMusic.preload = 'auto';

        // 4. iPad / WebKit 生命周期监听 (锁屏、切后台自动休眠，唤醒安全恢复)
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseAll();
                } else {
                    this.resumeContext();
                }
            });
            window.addEventListener('pagehide', () => this.pauseAll());
        }
    }

    resumeContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        if (!this.muted && this.bgMusic && this.bgMusic.paused) {
            this.bgMusic.play().catch(() => {});
        }
    }

    pauseAll() {
        if (this.bgMusic && !this.bgMusic.paused) {
            this.bgMusic.pause();
        }
        if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend().catch(() => {});
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.bgMusic) {
            if (this.muted) {
                this.bgMusic.pause();
            } else {
                this.bgMusic.play().catch(() => {});
            }
        }
        return this.muted;
    }

    play(name, volume = 0.8) {
        if (this.muted) return;

        // 节流保护：相同音效 40ms 内只播放一次，防止全屏多塔齐射导致系统音频通道爆满与卡死
        const now = Date.now();
        if (now - (this.lastPlayed[name] || 0) < 40) {
            return;
        }
        this.lastPlayed[name] = now;

        const targetVol = Math.min(1.0, Math.max(0.05, volume));

        // 方案 A: 极速 Web Audio API 播放 (内存零泄露，iOS 最优解)
        if (this.ctx && this.buffers[name]) {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
            try {
                const source = this.ctx.createBufferSource();
                source.buffer = this.buffers[name];
                const gain = this.ctx.createGain();
                gain.gain.value = targetVol;
                source.connect(gain);
                gain.connect(this.ctx.destination);
                source.start(0);

                // 播放完毕立即自动解绑断开，保证极速 GC
                source.onended = () => {
                    try {
                        source.disconnect();
                        gain.disconnect();
                    } catch (e) {}
                };
                return;
            } catch (e) {
                // 回退到方案 B
            }
        }

        // 方案 B: 静态定长池复用（绝不 cloneNode，只循环重置 currentTime）
        const pool = this.fallbackPool[name];
        if (pool && pool.length > 0) {
            const idx = this.poolIndex[name] % pool.length;
            this.poolIndex[name]++;
            const a = pool[idx];
            try {
                a.volume = targetVol;
                a.currentTime = 0;
                a.play().catch(() => {});
            } catch (e) {}
        }
    }

    playBuildTower() {
        this.play('TowerBulid', 0.85);
    }
    playTowerBuild() {
        this.playBuildTower();
    }

    playUpgrade() {
        this.play('TowerUpdata', 0.9);
    }
    playTowerUpgrade() {
        this.playUpgrade();
    }

    playSell() {
        this.play('TowerSell', 0.85);
    }
    playTowerSell() {
        this.playSell();
    }

    playShootBottle() {
        this.play('Bottle', 0.65);
    }

    playShootSun() {
        this.play('Sun', 0.7);
    }

    playShootShit() {
        this.play('Shit', 0.7);
    }

    playShootStar() {
        this.play('Star', 0.7);
    }

    playShootFan() {
        this.play('Fan', 0.7);
    }

    playShootRocket() {
        this.play('Rocket', 0.75);
    }

    playShootBall() {
        this.play('Ball', 0.7);
    }

    playShootFireBottle() {
        this.play('FireBottle', 0.7);
    }

    playShootPin() {
        this.play('Pin', 0.7);
    }

    playShootArrow() {
        this.play('Arrow', 0.7);
    }

    playShootBlueStar() {
        this.play('PStar', 0.7);
    }

    playShootSnow() {
        this.play('Snow', 0.75);
    }

    playShootFish() {
        this.play('Fish', 0.7);
    }

    playShootPlane() {
        this.play('Plane', 0.75);
    }

    playShootAnchor() {
        this.play('Anchor', 0.75);
    }

    playShootCuttle() {
        this.play('Cuttle', 0.7);
    }

    playShootMushroom() {
        this.play('Mushroom', 0.7);
    }

    playBuff() {
        this.play('Buff', 0.7);
    }

    playEnemyDead() {
        this.play('Crash', 0.6);
    }

    playBaseDamaged() {
        const rand = Math.floor(Math.random() * 3) + 1;
        this.play(`carrot${rand}`, 0.95);
    }

    playGainGold() {
        this.play('CountDown', 0.85);
    }

    playPropBreak() {
        this.play('Crash', 0.85);
    }

    playPropHit() {
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        if (!this._lastPropHit || now - this._lastPropHit > 90) {
            this._lastPropHit = now;
            this.play('TowerSelect', 0.45);
        }
    }

    playMathCorrect(combo = 1) {
        this.play('CountDown', 0.75);
    }

    playMathWrong() {
        this.play('SelectFault', 0.7);
    }

    playComboFanfare() {
        this.play('GO', 0.9);
    }

    playVictory() {
        this.play('Perfect', 1.0);
    }

    playGameOver() {
        this.play('Lose', 0.95);
    }

    playTone(freq, type, duration, startVol = 0.15) {
        if (this.muted || !this.ctx) return;
        this.resumeContext();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(startVol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }
}

export const sound = new OfficialSoundEngine();
