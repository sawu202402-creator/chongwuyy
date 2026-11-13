/**
 * shared/audioTTS.js - 跨游戏通用英语自然拼读朗读与中文应用题语音播报辅助模块
 */

class SharedSpeechHelper {
    constructor() {
        this.muted = false;
        this.enVoice = null;
        this.zhVoice = null;
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

    setMuted(flag) {
        this.muted = Boolean(flag);
        if (this.muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
            } catch (e) {}
        }
    }

    speakEnglish(text, slow = false) {
        if (this.muted || !text) return;
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(String(text));
            utter.lang = 'en-US';
            if (this.enVoice) utter.voice = this.enVoice;
            utter.rate = slow ? 0.70 : 0.94;
            utter.pitch = 1.08;
            utter.volume = 1.0;
            window.speechSynthesis.speak(utter);
        } catch (e) {}
    }

    speakChinese(text) {
        if (this.muted || !text) return;
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const cleanText = String(text).replace(/<[^>]+>/g, '');
            const utter = new SpeechSynthesisUtterance(cleanText);
            utter.lang = 'zh-CN';
            if (this.zhVoice) utter.voice = this.zhVoice;
            utter.rate = 0.96;
            utter.pitch = 1.08;
            window.speechSynthesis.speak(utter);
        } catch (e) {}
    }
}

export const sharedSpeech = new SharedSpeechHelper();
