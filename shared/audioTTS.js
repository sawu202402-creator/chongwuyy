/**
 * shared/audioTTS.js - 跨游戏通用英语自然拼读朗读与中文应用题语音播报辅助模块
 * 针对 iPadOS / iOS Safari 专项强化：
 * 1. 首次触屏自动预热唤醒 SpeechSynthesis 与 WebAudio，消除 iPad 首次点读无声/延迟；
 * 2. 自动优选 Apple 高清自然人声（Samantha / Nicky / Ava / Tingting），过滤机械音；
 * 3. 修复 Safari 切后台后 speechSynthesis 卡死 paused 状态的经典问题；
 * 4. 慢速模式支持“自然拼读拆音节 -> 完整单词”跟读教学节奏。
 */

class SharedSpeechHelper {
    constructor() {
        this.muted = false;
        this.enVoice = null;
        this.zhVoice = null;
        this.warmedUp = false;
        this._slowTimer = null;
        this.initVoices();
        this._bindFirstGestureWarmup();
    }

    initVoices() {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const load = () => {
            const voices = window.speechSynthesis.getVoices() || [];
            if (!voices.length) return;

            // 优先匹配 iPadOS / macOS / Chrome 高自然度美式英语女声，排除机械特效音
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

            const zhCandidates = voices.filter(v => v.lang && /^zh/i.test(v.lang));
            this.zhVoice =
                zhCandidates.find(v => /Premium|Enhanced|Natural/i.test(v.name)) ||
                zhCandidates.find(v => /Tingting|Ting-Ting|Yu-shu|Meijia|Google 普通话/i.test(v.name)) ||
                zhCandidates.find(v => /zh[-_]CN/i.test(v.lang)) ||
                zhCandidates[0] ||
                null;
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
            if ('speechSynthesis' in window) {
                try {
                    window.speechSynthesis.resume();
                    const silent = new SpeechSynthesisUtterance(' ');
                    silent.volume = 0.01;
                    silent.rate = 2.0;
                    window.speechSynthesis.speak(silent);
                } catch (e) {}
            }
            window.removeEventListener('pointerdown', warmup, true);
            window.removeEventListener('touchstart', warmup, true);
            window.removeEventListener('keydown', warmup, true);
        };
        window.addEventListener('pointerdown', warmup, true);
        window.addEventListener('touchstart', warmup, true);
        window.addEventListener('keydown', warmup, true);

        // 页面从后台切回时自动恢复 speechSynthesis 队列
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && 'speechSynthesis' in window) {
                try { window.speechSynthesis.resume(); } catch (e) {}
            }
        });
    }

    setMuted(flag) {
        this.muted = Boolean(flag);
        if (this._slowTimer) {
            clearTimeout(this._slowTimer);
            this._slowTimer = null;
        }
        if (this.muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
            } catch (e) {}
        }
    }

    speakEnglish(text, slow = false, phonics = '') {
        if (this.muted || !text) return;
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        if (this._slowTimer) {
            clearTimeout(this._slowTimer);
            this._slowTimer = null;
        }
        try {
            if (!this.enVoice) this.initVoices();
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();

            // 慢速拼读教学模式：如果有音节拆解（如 r-a-bb-i-t），先慢读一遍再清晰复读一遍完整词
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

    speakChinese(text) {
        if (this.muted || !text) return;
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        if (this._slowTimer) {
            clearTimeout(this._slowTimer);
            this._slowTimer = null;
        }
        try {
            if (!this.zhVoice) this.initVoices();
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
            const cleanText = String(text).replace(/<[^>]+>/g, '');
            const utter = new SpeechSynthesisUtterance(cleanText);
            utter.lang = 'zh-CN';
            if (this.zhVoice) utter.voice = this.zhVoice;
            utter.rate = 0.96;
            utter.pitch = 1.06;
            utter.volume = 1.0;
            window.speechSynthesis.speak(utter);
        } catch (e) {}
    }
}

export const sharedSpeech = new SharedSpeechHelper();
