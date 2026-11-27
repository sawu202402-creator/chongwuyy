/**
 * shared/chineseEngine.js - 统编版小学语文【一年级上册 & 二年级上册 · 8大题型】共享学习引擎
 * --------------------------------------------------------------------------
 * 特性：
 * 1. 支持按孩子独立设置年级：grade1_1（一年级上册）/ grade2_1（二年级上册）/ mixed_1_2（混合巩固）。
 * 2. 支持 8 大题型自由多选组合与单项目直达，内置洗牌抽袋（Bag-Shuffle）防重机制，整池轮空前绝不重复！
 * 3. 完美实现小豌豆点名的【无选项自主词语填空 (cn_word_fill)】与【无选项课文佳句/古诗默写 (cn_sentence_fill)】，
 *    智能兼容“仅填括号内生字（如：清）”与“连同整词/整句输入（如：山清水秀）”，严查错别字！
 * 4. 所有题目的提示（visualTip）严格只给结构/部首/语境启发，绝不泄露答案！
 */

import {
    CHINESE_GRADES,
    CHINESE_QUESTION_TYPES,
    ALL_CHINESE_TYPE_IDS,
    CN_WORD_FILL_BANK,
    CN_SENTENCE_FILL_BANK,
    CN_PINYIN_BANK,
    CN_POLYPHONE_BANK,
    CN_CONFUSABLE_BANK,
    CN_PAIR_POOLS,
    CN_SENTENCE_ORDER_BANK,
    CN_POEM_MATCH_BANK
} from './chineseData.js';

export {
    CHINESE_GRADES,
    CHINESE_QUESTION_TYPES,
    ALL_CHINESE_TYPE_IDS
};

export const DEFAULT_CHINESE_TYPES = [...ALL_CHINESE_TYPE_IDS];

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function normalizeChineseInput(raw) {
    return String(raw || '')
        .replace(/[\s，,。.？?！!、；;：:“”"‘’'（）()【】\[\]《》<>·—\-]/g, '')
        .trim();
}

export function sanitizeChineseEnabledTypes(list) {
    if (Array.isArray(list)) {
        const filtered = list.filter(id => ALL_CHINESE_TYPE_IDS.includes(id));
        if (filtered.length > 0) return [...new Set(filtered)];
    }
    return [...DEFAULT_CHINESE_TYPES];
}

export function sanitizeChineseGrade(grade) {
    if (['grade1_1', 'grade2_1', 'mixed_1_2'].includes(grade)) return grade;
    return 'grade2_1';
}

export class ChineseEngine {
    constructor(config = {}) {
        this.config = {
            grade: 'grade2_1',
            enabledTypes: [...DEFAULT_CHINESE_TYPES],
            includeInGrandRandom: true,
            ...config
        };
        this.currentQuestion = null;
        this.combo = 0;
        this.questionCounter = 0;
        this._bags = new Map();
        this._recentIds = [];
        this._lastMode = '';
        this.mistakesProvider = null;
    }

    setMistakesProvider(fn) {
        this.mistakesProvider = typeof fn === 'function' ? fn : null;
    }

    setConfig(cfg = {}) {
        if (!cfg || typeof cfg !== 'object') return;
        if (cfg.grade) this.config.grade = sanitizeChineseGrade(cfg.grade);
        if (cfg.enabledTypes) this.config.enabledTypes = sanitizeChineseEnabledTypes(cfg.enabledTypes);
        if (typeof cfg.includeInGrandRandom === 'boolean') {
            this.config.includeInGrandRandom = cfg.includeInGrandRandom;
        }
    }

    static formatSummary(cfg = {}) {
        const gradeId = sanitizeChineseGrade(cfg?.grade);
        const gMeta = CHINESE_GRADES.find(g => g.id === gradeId) || CHINESE_GRADES[1];
        const enabled = sanitizeChineseEnabledTypes(cfg?.enabledTypes);
        const shortG = gradeId === 'grade1_1' ? '🌱一上' : (gradeId === 'grade2_1' ? '🌿二上' : '🌈一二混合');
        return `${shortG}·${enabled.length}题型`;
    }

    _getPoolForBank(bankObj, grade = this.config.grade) {
        if (grade === 'grade1_1') return bankObj.grade1_1 || [];
        if (grade === 'grade2_1') return bankObj.grade2_1 || [];
        return [...(bankObj.grade1_1 || []), ...(bankObj.grade2_1 || [])];
    }

    _drawFromBag(bagKey, sourceItems) {
        if (!Array.isArray(sourceItems) || sourceItems.length === 0) return null;
        let bag = this._bags.get(bagKey);
        if (!bag || bag.length === 0) {
            bag = shuffleArray(sourceItems);
            // 防止洗牌重装袋时新袋第一题恰好等于上一题
            if (bag.length > 1 && this._recentIds.includes(bag[0].id)) {
                const swapIdx = bag.findIndex(x => !this._recentIds.includes(x.id));
                if (swapIdx > 0) {
                    [bag[0], bag[swapIdx]] = [bag[swapIdx], bag[0]];
                }
            }
            this._bags.set(bagKey, bag);
        }
        const picked = bag.shift();
        if (picked?.id) {
            this._recentIds.push(picked.id);
            if (this._recentIds.length > 12) this._recentIds.shift();
        }
        return picked;
    }

    _pickNextMode(forcedMode = null) {
        if (forcedMode && ALL_CHINESE_TYPE_IDS.includes(forcedMode)) {
            this._lastMode = forcedMode;
            return forcedMode;
        }
        const enabled = sanitizeChineseEnabledTypes(this.config.enabledTypes);
        if (enabled.length === 1) return enabled[0];
        const candidates = enabled.filter(m => m !== this._lastMode);
        const picked = candidates[Math.floor(Math.random() * candidates.length)] || enabled[0];
        this._lastMode = picked;
        return picked;
    }

    nextQuestion(forcedMode = null, forcedMistake = null) {
        this.questionCounter += 1;
        const grade = sanitizeChineseGrade(this.config.grade);

        // 支持错题靶向重温（每 5 题穿插 1 道历史语文错题，或显式传入 forcedMistake）
        if (forcedMistake && forcedMistake.rawQuestion) {
            const rq = { ...forcedMistake.rawQuestion, isReview: true };
            this.currentQuestion = rq;
            return rq;
        }
        if (!forcedMode && this.mistakesProvider && this.questionCounter % 5 === 0) {
            const mistakes = this.mistakesProvider() || [];
            if (mistakes.length > 0 && mistakes[0]?.rawQuestion) {
                const rq = { ...mistakes[0].rawQuestion, isReview: true };
                this.currentQuestion = rq;
                return rq;
            }
        }

        const mode = this._pickNextMode(forcedMode);
        let q = null;

        if (mode === 'cn_word_fill') {
            q = this._buildWordFillQuestion(grade);
        } else if (mode === 'cn_sentence_fill') {
            q = this._buildSentenceFillQuestion(grade);
        } else if (mode === 'cn_pinyin_tone') {
            q = this._buildPinyinQuestion(grade);
        } else if (mode === 'cn_polyphone') {
            q = this._buildPolyphoneQuestion(grade);
        } else if (mode === 'cn_confusable') {
            q = this._buildConfusableQuestion(grade);
        } else if (mode === 'cn_measure_antonym') {
            q = this._buildMeasureAntonymQuestion(grade);
        } else if (mode === 'cn_sentence_order') {
            q = this._buildSentenceOrderQuestion(grade);
        } else {
            q = this._buildPoemMatchQuestion(grade);
        }

        this.currentQuestion = q;
        return q;
    }

    _buildWordFillQuestion(grade) {
        const pool = this._getPoolForBank(CN_WORD_FILL_BANK, grade);
        const item = this._drawFromBag(`word_fill_${grade}`, pool);
        const accepted = [
            normalizeChineseInput(item.answer),
            normalizeChineseInput(item.fullWord)
        ].filter(Boolean);
        return {
            id: item.id,
            subject: 'chinese',
            mode: 'cn_word_fill',
            isFreeTextInput: true, // 严格无选项！自主手写/打字/语音输入
            grade,
            promptText: item.prompt,
            pinyinHint: item.pinyin,
            meaningHint: item.meaning,
            answer: item.answer,
            fullText: item.fullWord,
            acceptedAnswers: [...new Set(accepted)],
            readText: `${item.fullWord}。词义提示：${item.meaning}`,
            promptReadText: `词语填空：${item.prompt.replace(/（\s*）+/g, '什么')}。意思是：${item.meaning}。`,
            visualTip: item.tip,
            displayKey: `${item.fullWord}（填：${item.answer}）`
        };
    }

    _buildSentenceFillQuestion(grade) {
        const pool = this._getPoolForBank(CN_SENTENCE_FILL_BANK, grade);
        const item = this._drawFromBag(`sentence_fill_${grade}`, pool);
        const fullSentencePlain = item.sentence.replace(/（\s*）+/g, item.answer);
        const accepted = [
            normalizeChineseInput(item.answer),
            normalizeChineseInput(item.fullClause),
            normalizeChineseInput(fullSentencePlain)
        ].filter(Boolean);
        return {
            id: item.id,
            subject: 'chinese',
            mode: 'cn_sentence_fill',
            isFreeTextInput: true, // 严格无选项！自主手写/打字/语音输入
            grade,
            sourceTitle: item.source,
            promptText: item.sentence,
            pinyinHint: item.pinyin,
            answer: item.answer,
            fullText: fullSentencePlain,
            acceptedAnswers: [...new Set(accepted)],
            readText: `${item.source}。${fullSentencePlain}`,
            promptReadText: `${item.source}：${item.sentence.replace(/（\s*）+/g, '，空缺，')}`,
            visualTip: item.tip,
            displayKey: `${fullSentencePlain}（填：${item.answer}）`
        };
    }

    _buildPinyinQuestion(grade) {
        const pool = this._getPoolForBank(CN_PINYIN_BANK, grade);
        const item = this._drawFromBag(`pinyin_${grade}`, pool);
        return {
            id: item.id,
            subject: 'chinese',
            mode: 'cn_pinyin_tone',
            isFreeTextInput: false,
            grade,
            targetChar: item.char,
            promptText: item.context,
            answer: item.answer,
            options: shuffleArray(item.options),
            readText: item.context.replace(/[【】]/g, ''),
            visualTip: item.tip,
            displayKey: `${item.char}（${item.answer}）`
        };
    }

    _buildPolyphoneQuestion(grade) {
        const pool = this._getPoolForBank(CN_POLYPHONE_BANK, grade);
        const item = this._drawFromBag(`polyphone_${grade}`, pool);
        return {
            id: item.id,
            subject: 'chinese',
            mode: 'cn_polyphone',
            isFreeTextInput: false,
            grade,
            targetChar: item.target,
            promptText: item.sentence,
            answer: item.answer,
            options: shuffleArray(item.options),
            readText: item.sentence.replace(/[【】]/g, ''),
            visualTip: item.tip,
            displayKey: `${item.target} 读 ${item.answer}`
        };
    }

    _buildConfusableQuestion(grade) {
        const pool = this._getPoolForBank(CN_CONFUSABLE_BANK, grade);
        const item = this._drawFromBag(`confusable_${grade}`, pool);
        const fullPlain = item.sentence.replace(/（\s*）/g, item.answer);
        return {
            id: item.id,
            subject: 'chinese',
            mode: 'cn_confusable',
            isFreeTextInput: false,
            grade,
            promptText: item.sentence,
            answer: item.answer,
            options: shuffleArray(item.options),
            readText: fullPlain,
            visualTip: item.tip,
            displayKey: `${fullPlain}（选：${item.answer}）`
        };
    }

    _buildMeasureAntonymQuestion(grade) {
        const pool = this._getPoolForBank(CN_PAIR_POOLS, grade);
        const group = this._drawFromBag(`pair_${grade}`, pool);
        const pickedPairs = shuffleArray(group.pairs).slice(0, 3);
        return {
            id: `${group.id}_${this.questionCounter}`,
            subject: 'chinese',
            mode: 'cn_measure_antonym',
            isFreeTextInput: false,
            grade,
            subLabel: group.subLabel,
            pairs: pickedPairs,
            leftItems: shuffleArray(pickedPairs.map((p, idx) => ({ pairId: idx, text: p.left }))),
            rightItems: shuffleArray(pickedPairs.map((p, idx) => ({ pairId: idx, text: p.right }))),
            answer: pickedPairs.map(p => `${p.left.replace(/（.*）/, '')}—${p.right}`).join('，'),
            promptReadText: `${group.subLabel}：左边有 ${pickedPairs.map(p => p.left.replace(/（.*）/, '')).join('、')}，请连线找到右边对应的好朋友吧！`,
            readText: pickedPairs.map(p => `${p.left.replace(/（.*）/, '')}配${p.right}`).join('，'),
            visualTip: '先点左边一个气泡，再点右边和它最搭配的好朋友气泡就能消除啦！',
            displayKey: group.subLabel
        };
    }

    _buildSentenceOrderQuestion(grade) {
        const pool = this._getPoolForBank(CN_SENTENCE_ORDER_BANK, grade);
        const item = this._drawFromBag(`order_${grade}`, pool);
        const expected = item.segments.join('');
        let shuffled = shuffleArray(item.segments.map((seg, idx) => ({ idx, text: seg })));
        if (shuffled.map(x => x.text).join('') === expected && shuffled.length > 1) {
            [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
        }
        return {
            id: item.id,
            subject: 'chinese',
            mode: 'cn_sentence_order',
            isFreeTextInput: false,
            grade,
            segments: item.segments,
            shuffledTiles: shuffled,
            answer: expected,
            readText: expected,
            promptReadText: `连词成句：${item.hint}。请把下面打乱的词块排成通顺的一句话：${shuffled.map(s => s.text).filter(t => !/^[。！？，]$/.test(t)).join('、')}。`,
            visualTip: `${item.hint}（开头词提示：「${item.segments[0]}」）`,
            displayKey: expected
        };
    }

    _buildPoemMatchQuestion(grade) {
        const pool = this._getPoolForBank(CN_POEM_MATCH_BANK, grade);
        const item = this._drawFromBag(`poem_${grade}`, pool);
        const opts = shuffleArray([item.answer, ...item.distractors]);
        return {
            id: item.id,
            subject: 'chinese',
            mode: 'cn_poem_match',
            isFreeTextInput: false,
            grade,
            poemTitle: item.title,
            promptLabel: item.promptLabel,
            promptText: item.promptLine,
            answer: item.answer,
            options: opts,
            readText: item.fullRead,
            promptReadText: `${item.title}。${item.promptLine}`,
            visualTip: `回忆${item.title}的韵脚与意境，注意不要串到别的古诗里哟！`,
            displayKey: `${item.promptLine}${item.answer}`
        };
    }

    /**
     * 判分无选项自主填空题（支持只填缺字 或 填完整词语/分句）
     */
    checkFreeTextAnswer(question, rawUserInput) {
        const q = question || this.currentQuestion;
        if (!q) return false;
        const cleaned = normalizeChineseInput(rawUserInput);
        if (!cleaned) return false;
        const accepted = Array.isArray(q.acceptedAnswers) && q.acceptedAnswers.length > 0
            ? q.acceptedAnswers
            : [normalizeChineseInput(q.answer)];
        return accepted.includes(cleaned);
    }

    evaluateResult(isCorrect, question = null, userAns = '') {
        const q = question || this.currentQuestion;
        const isHardFreeFill = Boolean(q && q.isFreeTextInput);
        if (isCorrect) {
            this.combo += 1;
            // 无选项自主填空难度更高（小豌豆专属设计！），奖励更丰厚：直接得 1 枚徽章 + 2 颗学习星！
            const starEarned = q?.isReview ? 3 : (isHardFreeFill ? 2 : 1);
            const badgeEarned = q?.isReview ? 2 : (isHardFreeFill ? 1 : (this.combo % 3 === 0 ? 1 : 0));
            const gotGachaTicket = (this.combo > 0 && this.combo % 6 === 0);
            return {
                isCorrect: true,
                correct: true,
                combo: this.combo,
                starEarned,
                badgeEarned,
                gotGachaTicket,
                question: q,
                userAns
            };
        }
        this.combo = 0;
        return {
            isCorrect: false,
            correct: false,
            combo: 0,
            starEarned: 0,
            badgeEarned: 0,
            gotGachaTicket: false,
            question: q,
            userAns
        };
    }
}

export const chineseEngine = new ChineseEngine();
