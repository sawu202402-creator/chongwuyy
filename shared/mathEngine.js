/**
 * shared/mathEngine.js - 全平台统一数学学习与战斗联动引擎（升级 9 大趣味互动题型 + 自定义题型池 + 大随机/单项目直达）
 * 同时支持：
 * 1. calc: 心算口算 (加减乘除、凑十破十进退位、逆向填空、1~6年级分阶、巧算公因数公倍数)
 * 2. word: 乘除法与两步生活应用题 (份数乘法、倍数乘法、等分除、包含除、进一法余数装盒、两步买单)
 * 3. data: 数据统计图表认知 (横向多彩条形统计图：比多少、求合计、全店汇总、求平均数)
 * 4. compare: 天平比大小 (视觉天平左右算式对决，< / = / > 符号推理)
 * 5. bond_pop: 凑数消消乐 (6泡泡3对不重样配对：凑10/凑20/凑100或乘法凑积点击消除)
 * 6. operator_detective: 符号小侦探 (推理唯一成立的 + / - / × / ÷ 运算符号)
 * 7. sequence_train: 规律小火车 (5节车厢等差/递增差/翻倍/平方/斐波那契数列推理)
 * 8. clock_money: 钟表与购物 (SVG 指针钟面认读+经过时间推算，以及超市钱币组合与找零)
 * 9. pyramid_grid: 金字塔与方格 (三层加法数砖金字塔逆推 + 彩色方格纸面积与周长计数)
 */

export const MATH_QUESTION_TYPES = [
    { id: 'calc',               name: '⚡ 心算口算',     shortName: '⚡ 口算',     icon: '⚡', diffTag: '基础', diffLevel: 'easy',   desc: '加减乘除、凑十破十、逆向填空与巧算' },
    { id: 'word',               name: '📖 乘除应用题',   shortName: '📖 应用题',   icon: '📖', diffTag: '读题', diffLevel: 'medium', desc: '情景故事、倍数等分、进一法与两步买单' },
    { id: 'data',               name: '📊 数据统计图',   shortName: '📊 统计图',   icon: '📊', diffTag: '图表', diffLevel: 'medium', desc: '条形统计图：比多少、求合计与平均数' },
    { id: 'compare',            name: '⚖️ 天平比大小',   shortName: '⚖️ 比大小',   icon: '⚖️', diffTag: '简单', diffLevel: 'easy',   desc: '天平两端算式PK，判断 < 、 = 还是 >' },
    { id: 'bond_pop',           name: '🎯 凑数消消乐',   shortName: '🎯 凑数',     icon: '🎯', diffTag: '简单', diffLevel: 'easy',   desc: '点击两数凑10/20/100或凑乘积消除泡泡' },
    { id: 'operator_detective', name: '🔍 符号小侦探',   shortName: '🔍 填符号',   icon: '🔍', diffTag: '适中', diffLevel: 'medium', desc: '推理等式里唯一正确的 + - × ÷ 符号' },
    { id: 'sequence_train',     name: '🚂 规律小火车',   shortName: '🚂 找规律',   icon: '🚂', diffTag: '适中', diffLevel: 'medium', desc: '观察5节数字车厢规律，选出缺失数字' },
    { id: 'clock_money',        name: '🕒 钟表与购物',   shortName: '🕒 钟表钱币', icon: '🕒', diffTag: '适中', diffLevel: 'medium', desc: '认读指针钟表与经过时间、超市买单找零' },
    { id: 'pyramid_grid',       name: '🧱 金字塔与方格', shortName: '🧱 数砖周长', icon: '🧱', diffTag: '进阶', diffLevel: 'hard',   desc: '三层加法数砖金字塔与方格纸面积周长' }
];

export const ALL_MATH_TYPE_IDS = MATH_QUESTION_TYPES.map(t => t.id);

export class MathEngine {
    constructor(difficultyConfig = 'grade1_2') {
        this.currentSubMode = 'calc'; // 'random' | any id in ALL_MATH_TYPE_IDS
        this._recentKinds = [];
        this._clockMoneyToggle = 0;
        this._pyramidGridToggle = 0;
        this._seqCounter = 0;
        this.setConfig(difficultyConfig);
        this.currentQuestion = null;
        this.combo = 0;
        this.maxCombo = 0;
        this.correctCount = 0;
        this.totalAttempted = 0;
        this.roundQuestions = [];
        this.mistakes = [];
        this.superChargeActive = false;
        this.superChargeTimer = 0;
        this._lastWasReview = false;
        this._lastExpr = '';
        this.mistakesProvider = null; // () => Array<mistakeObj>
        this.nextQuestion();
    }

    setMistakesProvider(fn) {
        this.mistakesProvider = typeof fn === 'function' ? fn : null;
    }

    resetRoundStats() {
        this.combo = 0;
        this.maxCombo = 0;
        this.correctCount = 0;
        this.totalAttempted = 0;
        this.roundQuestions = [];
        this.mistakes = [];
        this.superChargeActive = false;
        this.superChargeTimer = 0;
        this._lastWasReview = false;
        this._lastExpr = '';
        this.nextQuestion();
    }

    setSubMode(subMode) {
        this.currentSubMode = subMode || 'calc';
        return this.nextQuestion();
    }

    setCategoryFilter(mode) {
        this.currentSubMode = mode || 'calc';
        return this.currentQuestion;
    }

    getEnabledTypes() {
        const list = this.config?.enabledTypes;
        if (Array.isArray(list) && list.length > 0) {
            const valid = list.filter(id => ALL_MATH_TYPE_IDS.includes(id));
            if (valid.length > 0) return valid;
        }
        return [...ALL_MATH_TYPE_IDS];
    }

    setConfig(configOrKey) {
        if (typeof configOrKey === 'string') {
            this.config = {
                mode: 'preset',
                presetGrade: configOrKey,
                operations: configOrKey === 'grade1_2' ? ['add', 'sub'] :
                            configOrKey === 'grade3_4' ? ['mul', 'div', 'add', 'sub'] : ['add', 'sub', 'mul', 'div'],
                range: configOrKey === 'grade1_2' ? 20 : configOrKey === 'grade3_4' ? 100 : 1000,
                maxMultiplier: configOrKey === 'grade1_2' ? 5 : 9,
                allowCarryBorrow: true,
                allowFillBlank: true,
                includeWordProblems: false,
                includeDataCharts: false,
                enabledTypes: [...ALL_MATH_TYPE_IDS]
            };
        } else if (configOrKey && typeof configOrKey === 'object') {
            let cleanTypes = Array.isArray(configOrKey.enabledTypes)
                ? configOrKey.enabledTypes.filter(id => ALL_MATH_TYPE_IDS.includes(id))
                : [];
            if (cleanTypes.length === 0) cleanTypes = [...ALL_MATH_TYPE_IDS];
            this.config = {
                mode: configOrKey.mode || 'custom',
                presetGrade: configOrKey.presetGrade || 'grade1_2',
                operations: (configOrKey.operations && configOrKey.operations.length > 0) ? configOrKey.operations : ['add', 'sub'],
                range: Number(configOrKey.range) || 20,
                maxMultiplier: Number(configOrKey.maxMultiplier) || (Number(configOrKey.range) <= 25 ? 5 : 9),
                allowCarryBorrow: configOrKey.allowCarryBorrow !== false,
                allowFillBlank: configOrKey.allowFillBlank !== false,
                includeWordProblems: Boolean(configOrKey.includeWordProblems),
                includeDataCharts: Boolean(configOrKey.includeDataCharts),
                enabledTypes: cleanTypes
            };
        }
        this.difficultyKey = this.config.presetGrade || 'grade1_2';
    }

    setDifficulty(keyOrConfig) {
        this.setConfig(keyOrConfig);
        return this.nextQuestion();
    }

    static formatSummary(cfg) {
        if (!cfg) return '20以内加减法';
        if (cfg.mode === 'preset') {
            if (cfg.presetGrade === 'grade1_2') return '🌱 1~2年级 (20以内加减)';
            if (cfg.presetGrade === 'grade3_4') return '⚡ 3~4年级 (乘除与心算)';
            if (cfg.presetGrade === 'grade5_6') return '🔥 5~6年级 (四则与进阶)';
        }
        const opNames = [];
        const ops = cfg.operations || ['add'];
        if (ops.includes('add')) opNames.push('加');
        if (ops.includes('sub')) opNames.push('减');
        if (ops.includes('mul')) opNames.push('乘');
        if (ops.includes('div')) opNames.push('除');
        const opStr = opNames.length > 0 ? opNames.join('') : '加法';
        const mulLimitStr = (ops.includes('mul') || ops.includes('div')) ? `·${cfg.maxMultiplier || 9}内乘除` : '';
        const typeCnt = Array.isArray(cfg.enabledTypes) ? cfg.enabledTypes.length : ALL_MATH_TYPE_IDS.length;
        return `${cfg.range || 20}内${opStr}${mulLimitStr}·${typeCnt}题型`;
    }

    getDifficultySummary() {
        return MathEngine.formatSummary(this.config);
    }

    _pickRandomMathKind() {
        const pool = this.getEnabledTypes();
        if (pool.length <= 1) return pool[0] || 'calc';
        // 避免同一种题型连续出现超过2次，保持节奏丰富
        const lastTwoSame = this._recentKinds.length >= 2 &&
            this._recentKinds[this._recentKinds.length - 1] === this._recentKinds[this._recentKinds.length - 2];
        const filtered = lastTwoSame
            ? pool.filter(k => k !== this._recentKinds[this._recentKinds.length - 1])
            : pool;
        const candidates = filtered.length > 0 ? filtered : pool;
        const picked = candidates[Math.floor(Math.random() * candidates.length)];
        this._recentKinds.push(picked);
        if (this._recentKinds.length > 6) this._recentKinds.shift();
        return picked;
    }

    _generateByKind(kind) {
        switch (kind) {
            case 'word':               return this.generateWordProblem();
            case 'data':               return this.generateDataChartQuestion();
            case 'compare':            return this.generateCompareQuestion();
            case 'bond_pop':           return this.generateBondPopQuestion();
            case 'operator_detective': return this.generateOperatorDetectiveQuestion();
            case 'sequence_train':     return this.generateSequenceTrainQuestion();
            case 'clock_money':        return this.generateClockMoneyQuestion();
            case 'pyramid_grid':       return this.generatePyramidGridQuestion();
            case 'calc':
            default: {
                if (this.config.mode === 'custom') return this.generateCustomCalcQuestion();
                if (this.difficultyKey === 'grade3_4') return this.generateGrade3_4();
                if (this.difficultyKey === 'grade5_6') return this.generateGrade5_6();
                return this.generateGrade1_2();
            }
        }
    }

    nextQuestion(forcedOrShield = null) {
        // 1. PvZ 僵尸护盾定制算式支持
        if (typeof forcedOrShield === 'string') {
            const sq = this.generateShieldSpecificQuestion(forcedOrShield);
            sq.id = 'sq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
            sq.timestamp = Date.now();
            this.currentQuestion = sq;
            return sq;
        }

        // 2. 错题本定向复习支持
        if (forcedOrShield && typeof forcedOrShield === 'object') {
            const rawAns = forcedOrShield.answer ?? forcedOrShield.expected;
            const numAns = Number(rawAns);
            const ans = (!forcedOrShield.isInteractiveWidget && !Number.isNaN(numAns)) ? numAns : rawAns;
            const rq = {
                ...forcedOrShield,
                kind: forcedOrShield.kind || 'calc',
                answer: ans,
                expr: forcedOrShield.expr || forcedOrShield.formula || '复习题',
                formula: forcedOrShield.formula || forcedOrShield.expr || '复习题',
                display: forcedOrShield.display || forcedOrShield.formula || forcedOrShield.expr || '复习题',
                hint: forcedOrShield.hint ? `🔄 ${forcedOrShield.hint}` : '🔄 错题重温 · 消灭它！',
                id: 'rev_' + Date.now(),
                isReview: true,
                timestamp: Date.now()
            };
            this._lastWasReview = true;
            this._lastExpr = rq.expr;
            this.currentQuestion = rq;
            return rq;
        }

        // 3. 艾宾浩斯错题穿插复习：平时闯关以 16% 概率自动回捞当前模式下的历史错题（不连续出现两次）
        if (this.mistakesProvider && !this._lastWasReview && Math.random() < 0.16) {
            try {
                const rawList = this.mistakesProvider() || [];
                const targetKind = this.currentSubMode || 'calc';
                const enabledSet = new Set(this.getEnabledTypes());
                const eligible = rawList.filter(m => {
                    const mKind = m.kind || 'calc';
                    const expr = m.expr || m.formula || '';
                    if (!expr || expr === this._lastExpr) return false;
                    if (m.isInteractiveWidget) {
                        if (mKind === 'bond_pop') return false;
                        if (targetKind === 'random') return enabledSet.has(mKind);
                        return targetKind === mKind;
                    }
                    const ans = Number(m.answer ?? m.expected);
                    if (!Number.isInteger(ans) || ans < 0) return false;
                    if (targetKind === 'random') return enabledSet.has(mKind);
                    if (targetKind === 'word') return mKind === 'word' && (m.storyHtml || m.questionText || m.questionHtml);
                    if (targetKind === 'data') return mKind === 'data' && (m.chartData || m.chart);
                    return targetKind === 'calc' && mKind === 'calc';
                });
                if (eligible.length > 0) {
                    const pick = eligible[Math.floor(Math.random() * eligible.length)];
                    const rawAns = pick.answer ?? pick.expected;
                    const ans = pick.isInteractiveWidget ? rawAns : Number(rawAns);
                    const exprStr = pick.expr || pick.formula || '';
                    const autoRev = {
                        ...pick,
                        kind: pick.kind || 'calc',
                        answer: ans,
                        expr: exprStr,
                        formula: pick.formula || exprStr,
                        display: pick.display || (pick.formula || exprStr).replace(/\( \? \)/g, '?'),
                        hint: '🔄 错题重温 · 答对移出错题本！',
                        id: 'arev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
                        isReview: true,
                        timestamp: Date.now()
                    };
                    this._lastWasReview = true;
                    this._lastExpr = exprStr;
                    this.currentQuestion = autoRev;
                    return autoRev;
                }
            } catch (e) {}
        }

        this._lastWasReview = false;

        let q;
        if (this.currentSubMode === 'random') {
            const chosenKind = this._pickRandomMathKind();
            q = this._generateByKind(chosenKind);
        } else if (ALL_MATH_TYPE_IDS.includes(this.currentSubMode) && this.currentSubMode !== 'calc') {
            q = this._generateByKind(this.currentSubMode);
        } else {
            // 'calc' 模式（兼容旧版勾选穿插应用题/数据图）
            const roll = Math.random();
            if (this.config.includeWordProblems && roll < 0.22) {
                q = this.generateWordProblem();
            } else if (this.config.includeDataCharts && roll >= 0.22 && roll < 0.40) {
                q = this.generateDataChartQuestion();
            } else {
                q = this._generateByKind('calc');
            }
        }

        if (!q.expr) q.expr = q.formula || q.display || '';
        if (!q.formula) q.formula = q.expr;
        if (!q.display) q.display = q.formula.replace(/\( \? \)/g, '?');
        q.id = 'mq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        q.timestamp = Date.now();
        this._lastExpr = q.expr;
        this.currentQuestion = q;
        return q;
    }

    // ==================== 1. 高质量加减乘除口算 ====================
    generateAddition(range = 20, allowCarry = true, isFillBlank = false) {
        let a, b, hint = '';
        const shouldCarry = allowCarry && (Math.random() < 0.75);

        if (range <= 10) {
            a = Math.floor(Math.random() * 8) + 1;
            b = Math.floor(Math.random() * (10 - a)) + 1;
            hint = '10以内加法';
        } else if (range <= 20) {
            if (shouldCarry) {
                a = Math.floor(Math.random() * 8) + 2;
                const minB = 11 - a;
                b = Math.floor(Math.random() * (9 - minB + 1)) + minB;
                hint = '20以内进位加法 (凑十法)';
            } else {
                if (Math.random() < 0.4) {
                    a = Math.floor(Math.random() * 7) + 1;
                    b = Math.floor(Math.random() * (9 - a)) + 1;
                } else {
                    a = Math.floor(Math.random() * 8) + 11;
                    const maxB = 9 - (a % 10);
                    b = Math.floor(Math.random() * Math.max(1, maxB)) + 1;
                }
                hint = '20以内不进位加法';
            }
        } else if (range <= 100) {
            if (shouldCarry) {
                const maxTensSum = Math.max(2, Math.floor(range / 10) - 2);
                const aTens = Math.floor(Math.random() * Math.max(1, maxTensSum - 1)) + 1;
                const aOnes = Math.floor(Math.random() * 8) + 2;
                a = aTens * 10 + aOnes;
                const bTens = Math.floor(Math.random() * Math.max(1, maxTensSum - aTens));
                const minBOnes = 10 - aOnes;
                const bOnes = Math.floor(Math.random() * (9 - minBOnes + 1)) + minBOnes;
                b = bTens * 10 + bOnes;
                hint = `${range}以内进位加法`;
            } else {
                const maxTens = Math.max(2, Math.floor(range / 10) - 2);
                const aTens = Math.floor(Math.random() * (maxTens - 1)) + 1;
                const aOnes = Math.floor(Math.random() * 8) + 1;
                a = aTens * 10 + aOnes;
                const bTens = Math.floor(Math.random() * Math.max(1, maxTens - aTens));
                const bOnes = Math.floor(Math.random() * (9 - aOnes)) + 1;
                b = bTens * 10 + bOnes;
                hint = `${range}以内不进位加法`;
            }
        } else {
            a = Math.floor(Math.random() * 420) + 60;
            b = Math.floor(Math.random() * (950 - a)) + 30;
            hint = '千以内加法速算';
        }

        const sum = a + b;
        let expr = `${a} + ${b} = ?`;
        let answer = sum;
        if (isFillBlank) {
            if (Math.random() > 0.5) {
                expr = `${a} + ( ? ) = ${sum}`;
                answer = b;
            } else {
                expr = `( ? ) + ${b} = ${sum}`;
                answer = a;
            }
            hint += ' · 逆向填空';
        }
        return { kind: 'calc', expr, formula: expr, display: expr.replace(/\( \? \)/g, '?'), answer, hint, type: 'add' };
    }

    generateSubtraction(range = 20, allowCarry = true, isFillBlank = false) {
        let a, b, hint = '';
        const shouldBorrow = allowCarry && (Math.random() < 0.75);

        if (range <= 10) {
            a = Math.floor(Math.random() * 9) + 2;
            b = Math.floor(Math.random() * (a - 1)) + 1;
            hint = '10以内减法';
        } else if (range <= 20) {
            if (shouldBorrow) {
                a = Math.floor(Math.random() * 8) + 11;
                const minB = (a % 10) + 1;
                b = Math.floor(Math.random() * (9 - minB + 1)) + minB;
                hint = '20以内退位减法 (破十法)';
            } else {
                if (Math.random() < 0.4) {
                    a = Math.floor(Math.random() * 8) + 2;
                    b = Math.floor(Math.random() * (a - 1)) + 1;
                } else {
                    a = Math.floor(Math.random() * 8) + 11;
                    b = Math.floor(Math.random() * (a % 10)) + 1;
                }
                hint = '20以内不退位减法';
            }
        } else if (range <= 100) {
            if (shouldBorrow) {
                const maxTens = Math.max(3, Math.floor(range / 10) - 1);
                const aTens = Math.floor(Math.random() * (maxTens - 2)) + 2;
                const aOnes = Math.floor(Math.random() * 8);
                a = aTens * 10 + aOnes;
                const bTens = Math.floor(Math.random() * (aTens - 1));
                const minBOnes = aOnes + 1;
                const bOnes = Math.floor(Math.random() * (9 - minBOnes + 1)) + minBOnes;
                b = bTens * 10 + bOnes;
                hint = `${range}以内退位减法`;
            } else {
                const maxTens = Math.max(3, Math.floor(range / 10) - 1);
                const aTens = Math.floor(Math.random() * (maxTens - 2)) + 2;
                const aOnes = Math.floor(Math.random() * 7) + 2;
                a = aTens * 10 + aOnes;
                const bTens = Math.floor(Math.random() * (aTens - 1)) + 1;
                const bOnes = Math.floor(Math.random() * (aOnes - 1)) + 1;
                b = bTens * 10 + bOnes;
                hint = `${range}以内不退位减法`;
            }
        } else {
            a = Math.floor(Math.random() * 650) + 180;
            b = Math.floor(Math.random() * (a - 60)) + 35;
            hint = '千以内减法速算';
        }

        const diff = a - b;
        let expr = `${a} - ${b} = ?`;
        let answer = diff;
        if (isFillBlank) {
            if (Math.random() > 0.5) {
                expr = `${a} - ( ? ) = ${diff}`;
                answer = b;
            } else {
                expr = `( ? ) - ${b} = ${diff}`;
                answer = a;
            }
            hint += ' · 逆向填空';
        }
        return { kind: 'calc', expr, formula: expr, display: expr.replace(/\( \? \)/g, '?'), answer, hint, type: 'sub' };
    }

    generateGrade1_2() {
        const allowCarry = this.config?.allowCarryBorrow !== false;
        const allowFill = this.config?.allowFillBlank !== false;
        const roll = Math.random();
        if (roll < 0.42) return this.generateAddition(20, allowCarry, false);
        if (roll < 0.84) return this.generateSubtraction(20, allowCarry, false);
        return Math.random() > 0.5
            ? this.generateAddition(20, allowCarry, allowFill)
            : this.generateSubtraction(20, allowCarry, allowFill);
    }

    generateGrade3_4() {
        const sub = Math.floor(Math.random() * 4);
        if (sub === 0) {
            const a = Math.floor(Math.random() * 8) + 2;
            const b = Math.floor(Math.random() * 8) + 2;
            const expr = `${a} × ${b} = ?`;
            return { kind: 'calc', expr, formula: expr, display: expr, answer: a * b, hint: '乘法口诀速算', type: 'grade3_4' };
        } else if (sub === 1) {
            const b = Math.floor(Math.random() * 8) + 2;
            const ans = Math.floor(Math.random() * 8) + 2;
            const expr = `${b * ans} ÷ ${b} = ?`;
            return { kind: 'calc', expr, formula: expr, display: expr, answer: ans, hint: '表内除法整除', type: 'grade3_4' };
        } else if (sub === 2) {
            const a = Math.floor(Math.random() * 14) + 12;
            const b = Math.floor(Math.random() * 4) + 2;
            const expr = `${a} × ${b} = ?`;
            return { kind: 'calc', expr, formula: expr, display: expr, answer: a * b, hint: '两位数乘一位数', type: 'grade3_4' };
        } else {
            return Math.random() > 0.5 ? this.generateAddition(100, true, true) : this.generateSubtraction(100, true, false);
        }
    }

    generateGrade5_6() {
        const sub = Math.floor(Math.random() * 4);
        if (sub === 0) {
            const a = Math.floor(Math.random() * 20) + 6;
            const b = Math.floor(Math.random() * 8) + 2;
            const c = Math.floor(Math.random() * 7) + 2;
            const expr = `${a} + ${b} × ${c} = ?`;
            return { kind: 'calc', expr, formula: expr, display: expr, answer: a + b * c, hint: '四则混合 (先乘除后加减)', type: 'grade5_6' };
        } else if (sub === 1) {
            const a = Math.floor(Math.random() * 9) + 3;
            const b = Math.floor(Math.random() * 8) + 2;
            const c = Math.floor(Math.random() * 6) + 2;
            const expr = `(${a} + ${b}) × ${c} = ?`;
            return { kind: 'calc', expr, formula: expr, display: expr, answer: (a + b) * c, hint: '括号优先巧算', type: 'grade5_6' };
        } else if (sub === 2) {
            const pairs = [
                { a: 6, b: 8, gcd: 2, lcm: 24 },
                { a: 12, b: 18, gcd: 6, lcm: 36 },
                { a: 8, b: 12, gcd: 4, lcm: 24 },
                { a: 15, b: 20, gcd: 5, lcm: 60 },
                { a: 9, b: 12, gcd: 3, lcm: 36 }
            ];
            const chosen = pairs[Math.floor(Math.random() * pairs.length)];
            const askGcd = Math.random() > 0.5;
            const expr = askGcd ? `${chosen.a} 和 ${chosen.b} 的最大公因数是?` : `${chosen.a} 和 ${chosen.b} 的最小公倍数是?`;
            const answer = askGcd ? chosen.gcd : chosen.lcm;
            return { kind: 'calc', expr, formula: expr, display: expr, answer, hint: askGcd ? '公因数心算' : '公倍数心算', type: 'grade5_6' };
        } else {
            const tricks = [
                { expr: '25 × 12 = ?', ans: 300 },
                { expr: '25 × 16 = ?', ans: 400 },
                { expr: '125 × 8 = ?', ans: 1000 },
                { expr: '15 × 15 = ?', ans: 225 },
                { expr: '35 × 4 = ?', ans: 140 }
            ];
            const t = tricks[Math.floor(Math.random() * tricks.length)];
            return { kind: 'calc', expr: t.expr, formula: t.expr, display: t.expr, answer: t.ans, hint: '简便巧算速算', type: 'grade5_6' };
        }
    }

    generateCustomCalcQuestion() {
        const cfg = this.config || {};
        const ops = (cfg.operations && cfg.operations.length > 0) ? cfg.operations : ['add'];
        const range = Number(cfg.range) || 20;
        const allowFill = cfg.allowFillBlank !== false;
        const allowCarry = cfg.allowCarryBorrow !== false;
        const limit = Math.max(2, Math.min(12, Number(cfg.maxMultiplier) || (range <= 25 ? 5 : 9)));
        const op = ops[Math.floor(Math.random() * ops.length)];
        const isFill = allowFill && Math.random() < 0.28;

        if (op === 'add') return this.generateAddition(range, allowCarry, isFill);
        if (op === 'sub') return this.generateSubtraction(range, allowCarry, isFill);
        if (op === 'mul') {
            const a = Math.floor(Math.random() * (limit - 1)) + 2;
            const b = Math.floor(Math.random() * (limit - 1)) + 2;
            const prod = a * b;
            if (isFill) {
                const expr = `${a} × ( ? ) = ${prod}`;
                return { kind: 'calc', expr, formula: expr, display: `${a} × ? = ${prod}`, answer: b, hint: `${limit}以内乘法填空`, type: 'mul' };
            }
            const expr = `${a} × ${b} = ?`;
            return { kind: 'calc', expr, formula: expr, display: expr, answer: prod, hint: `${limit}以内乘法口诀`, type: 'mul' };
        }
        const b = Math.floor(Math.random() * (limit - 1)) + 2;
        const ans = Math.floor(Math.random() * (limit - 1)) + 2;
        const a = b * ans;
        if (isFill) {
            const expr = `${a} ÷ ( ? ) = ${ans}`;
            return { kind: 'calc', expr, formula: expr, display: `${a} ÷ ? = ${ans}`, answer: b, hint: `${limit}以内除法填空`, type: 'div' };
        }
        const expr = `${a} ÷ ${b} = ?`;
        return { kind: 'calc', expr, formula: expr, display: expr, answer: ans, hint: `${limit}以内表内除法`, type: 'div' };
    }

    // ==================== 2. 乘除法与两步生活应用题 ====================
    generateWordProblem() {
        const cfg = this.config || {};
        const limit = Math.max(4, Math.min(9, Number(cfg.maxMultiplier) || 9));
        const isHighGrade = cfg.presetGrade === 'grade5_6' || Number(cfg.range) >= 100;

        const types = isHighGrade
            ? ['mul_groups', 'mul_times', 'div_share', 'div_pack', 'twostep_buy', 'div_ceil_box']
            : ['mul_groups', 'mul_times', 'div_share', 'div_pack', 'twostep_buy'];
        const chosen = types[Math.floor(Math.random() * types.length)];

        const actors = [
            { name: '垂耳兔', icon: '🐰', shop: '阳光超市' },
            { name: '荷叶小青蛙', icon: '🐸', shop: '梦幻甜品店' },
            { name: '向日葵', icon: '🌻', shop: '阳光草坪站' },
            { name: '胖胖竹熊', icon: '🐼', shop: '魔法书屋' },
            { name: '云朵独角兽', icon: '🦄', shop: '彩虹花店' }
        ];
        const items = [
            { name: '草莓蛋糕', unit: '块', box: '盒', icon: '🍰' },
            { name: '甜脆胡萝卜', unit: '根', box: '篮', icon: '🥕' },
            { name: '阳光能量球', unit: '颗', box: '袋', icon: '☀️' },
            { name: '香脆甜甜圈', unit: '个', box: '盒', icon: '🍩' },
            { name: '彩色铅笔', unit: '支', box: '筒', icon: '✏️' },
            { name: '芝士汉堡', unit: '个', box: '袋', icon: '🍔' }
        ];

        const actor = actors[Math.floor(Math.random() * actors.length)];
        const item = items[Math.floor(Math.random() * items.length)];

        if (chosen === 'mul_groups') {
            const boxes = Math.floor(Math.random() * Math.min(5, limit - 1)) + 2;
            const perBox = Math.floor(Math.random() * (limit - 1)) + 2;
            const ans = boxes * perBox;
            const storyHtml = `${actor.icon} <strong>${actor.name}</strong>在${actor.shop}准备补给，<span class="wp-hl">每${item.box}装 ${perBox} ${item.unit}</span>${item.icon}${item.name}，装满 <span class="wp-hl">${boxes} ${item.box}</span>，<strong>一共需要多少${item.unit}${item.name}？</strong>`;
            const groupVisual = Array.from({ length: boxes }, () => `📦[${item.icon}×${perBox}]`).join(' + ');
            return {
                kind: 'word',
                hint: '📖 乘法应用题 · 每份数 × 份数',
                storyHtml,
                readText: `${actor.name}在${actor.shop}准备补给，每${item.box}装${perBox}${item.unit}${item.name}，装满${boxes}${item.box}，一共需要多少${item.unit}${item.name}？`,
                expr: `[应用题] ${perBox} × ${boxes}`,
                formula: `${perBox} × ${boxes} = ${ans}`,
                visualTip: `${groupVisual} ➔ 列式：${perBox} × ${boxes} = ${ans} (${item.unit})`,
                unitLabel: item.unit,
                answer: ans
            };
        }

        if (chosen === 'mul_times') {
            const base = Math.floor(Math.random() * (limit - 2)) + 3;
            const times = Math.floor(Math.random() * 4) + 2;
            const ans = base * times;
            const storyHtml = `${actor.icon} <strong>${actor.name}</strong>上午收集了 <span class="wp-hl">${base} ${item.unit}</span>${item.icon}${item.name}，下午收集的数量<span class="wp-hl">是上午的 ${times} 倍</span>。<strong>下午收集了多少${item.unit}？</strong>`;
            return {
                kind: 'word',
                hint: '📖 倍数乘法应用题 · 求一个数的几倍',
                storyHtml,
                readText: `${actor.name}上午收集了${base}${item.unit}${item.name}，下午收集的数量是上午的${times}倍。下午收集了多少${item.unit}？`,
                expr: `[应用题] ${base} 的 ${times} 倍`,
                formula: `${base} × ${times} = ${ans}`,
                visualTip: `上午：[${item.icon}×${base}] ｜ 下午有 ${times} 份 ➔ ${base} × ${times} = ${ans} (${item.unit})`,
                unitLabel: item.unit,
                answer: ans
            };
        }

        if (chosen === 'div_share') {
            const friends = Math.floor(Math.random() * Math.min(5, limit - 1)) + 2;
            const each = Math.floor(Math.random() * (limit - 1)) + 2;
            const total = friends * each;
            const storyHtml = `${actor.icon} <strong>${actor.name}</strong>准备了 <span class="wp-hl">${total} ${item.unit}</span>${item.icon}${item.name}，要<span class="wp-hl">平均分给 ${friends} 位</span>小队友，<strong>每位小队友能分到几${item.unit}？</strong>`;
            return {
                kind: 'word',
                hint: '📖 等分除法应用题 · 平均分求每份',
                storyHtml,
                readText: `${actor.name}准备了${total}${item.unit}${item.name}，要平均分给${friends}位小队友，每位小队友能分到几${item.unit}？`,
                expr: `[应用题] ${total} ÷ ${friends}`,
                formula: `${total} ÷ ${friends} = ${each}`,
                visualTip: `把 ${total} 平均分成 ${friends} 份 ➔ 列式：${total} ÷ ${friends} = ${each} (${item.unit})`,
                unitLabel: item.unit,
                answer: each
            };
        }

        if (chosen === 'div_pack') {
            const perBox = Math.floor(Math.random() * (limit - 1)) + 2;
            const boxes = Math.floor(Math.random() * (limit - 1)) + 2;
            const total = perBox * boxes;
            const storyHtml = `${actor.icon} 仓库新到 <span class="wp-hl">${total} ${item.unit}</span>${item.icon}${item.name}，如果<span class="wp-hl">每 ${perBox} ${item.unit}装满一${item.box}</span>，<strong>一共可以装满几${item.box}？</strong>`;
            return {
                kind: 'word',
                hint: '📖 包含除法应用题 · 求能装几盒',
                storyHtml,
                readText: `仓库新到${total}${item.unit}${item.name}，如果每${perBox}${item.unit}装满一${item.box}，一共可以装满几${item.box}？`,
                expr: `[应用题] ${total} ÷ ${perBox}`,
                formula: `${total} ÷ ${perBox} = ${boxes}`,
                visualTip: `每 ${perBox} 个装 1 ${item.box}，看 ${total} 里有几个 ${perBox} ➔ ${total} ÷ ${perBox} = ${boxes} (${item.box})`,
                unitLabel: item.box,
                answer: boxes
            };
        }

        if (chosen === 'div_ceil_box') {
            const perBox = Math.floor(Math.random() * 5) + 4;
            const fullBoxes = Math.floor(Math.random() * 5) + 3;
            const rem = Math.floor(Math.random() * (perBox - 1)) + 1;
            const total = perBox * fullBoxes + rem;
            const ans = fullBoxes + 1;
            const storyHtml = `🚚 <strong>进一法思考题</strong>：${actor.icon}${actor.name}要把 <span class="wp-hl">${total} ${item.unit}</span>${item.icon}${item.name}全部运走，每个箱子最多装 <span class="wp-hl">${perBox} ${item.unit}</span>，<strong>至少需要准备几个箱子？</strong>`;
            return {
                kind: 'word',
                hint: '📖 余数进一法应用题 · 剩下的也要1个箱子',
                storyHtml,
                readText: `${actor.name}要把${total}${item.unit}${item.name}全部运走，每个箱子最多装${perBox}${item.unit}，至少需要准备几个箱子？`,
                expr: `[进一法] ${total} ÷ ${perBox} 进一`,
                formula: `${total} ÷ ${perBox} = ${fullBoxes}(箱)……${rem}(${item.unit}) ➔ ${ans}箱`,
                visualTip: `${total} ÷ ${perBox} = ${fullBoxes} 箱余 ${rem} ${item.unit}，剩下的也需 1 箱 ➔ ${fullBoxes} + 1 = ${ans} (个)`,
                unitLabel: '个箱子',
                answer: ans
            };
        }

        const qty = Math.floor(Math.random() * 3) + 2;
        const price = Math.floor(Math.random() * (limit - 2)) + 3;
        const drinkPrice = Math.floor(Math.random() * 6) + 3;
        const ans = qty * price + drinkPrice;
        const storyHtml = `🛒 <strong>两步买单题</strong>：${actor.icon}买了 <span class="wp-hl">${qty} ${item.unit}</span>单价 <span class="wp-hl">${price} 元</span>的${item.icon}${item.name}，又买了 <span class="wp-hl">1 杯 ${drinkPrice} 元</span>的牛奶🥛，<strong>一共要付多少元？</strong>`;
        return {
            kind: 'word',
            hint: '📖 两步乘加应用题 · 先算乘法再相加',
            storyHtml,
            readText: `买了${qty}${item.unit}单价${price}元的${item.name}，又买了1杯${drinkPrice}元的牛奶，一共要付多少元？`,
            expr: `[应用题] ${qty} × ${price} + ${drinkPrice}`,
            formula: `${qty} × ${price} + ${drinkPrice} = ${ans}`,
            visualTip: `先算 ${qty} × ${price} = ${qty * price}(元)，再加牛奶 ${drinkPrice}(元) = ${ans}(元)`,
            unitLabel: '元',
            answer: ans
        };
    }

    // ==================== 3. 数据统计图表认知 ====================
    generateDataChartQuestion() {
        const isMid = this.config?.presetGrade === 'grade3_4' || Number(this.config?.range) >= 50;
        const isHigh = this.config?.presetGrade === 'grade5_6' || Number(this.config?.range) >= 200;

        const goodsPool = [
            { name: '草莓蛋糕', icon: '🍰', color: '#ff6b9d' },
            { name: '胡萝卜汁', icon: '🥕', color: '#ff9f43' },
            { name: '香草冰棍', icon: '🍦', color: '#48dbfb' },
            { name: '芝士汉堡', icon: '🍔', color: '#feca57' },
            { name: '甜甜圈', icon: '🍩', color: '#a55eea' },
            { name: '苹果派', icon: '🍎', color: '#ff5252' }
        ];

        const shuffled = [...goodsPool].sort(() => Math.random() - 0.5).slice(0, 3);
        const step = isHigh ? 5 : (isMid ? 2 : 1);

        if (isHigh && Math.random() < 0.45) {
            const avg = (Math.floor(Math.random() * 6) + 4) * 2;
            const d = (Math.floor(Math.random() * 3) + 1) * 2;
            const vals = [avg - d, avg + d + 2, avg - 2];
            const bars = shuffled.map((g, idx) => ({ ...g, value: vals[idx] }));
            const maxScale = Math.max(...vals) + 4;
            return {
                kind: 'data',
                hint: '📊 数据分析 · 求平均数',
                chartData: { title: '📈 今日三款明星补给统计图', bars, maxScale },
                questionText: `看上方统计图，这 3 款补给<strong>平均每款卖出多少份</strong>？`,
                readText: `看上方统计图，这三款补给平均每款卖出多少份？`,
                expr: `[数据图] (${vals.join('+')})÷3`,
                formula: `(${vals.join(' + ')}) ÷ 3 = ${avg}`,
                visualTip: `总和 ${vals[0] + vals[1] + vals[2]} ÷ 3 款 = 平均每款 ${avg} 份`,
                unitLabel: '份',
                answer: avg
            };
        }

        const rawNums = [
            Math.floor(Math.random() * 4) + 3,
            Math.floor(Math.random() * 4) + 7,
            Math.floor(Math.random() * 4) + 5
        ];
        if (rawNums[0] === rawNums[1]) rawNums[1] += 2;
        const bars = shuffled.map((g, i) => ({ ...g, value: rawNums[i] * step }));
        const maxScale = Math.max(...bars.map(b => b.value)) + step * 2;

        const qMode = Math.floor(Math.random() * 3);
        if (qMode === 0) {
            const sorted = [...bars].sort((a, b) => b.value - a.value);
            const big = sorted[0];
            const small = sorted[2];
            const ans = big.value - small.value;
            return {
                kind: 'data',
                hint: '📊 数据图表认知 · 读图比多少',
                chartData: { title: '📊 萌宠能量站今日统计榜', bars, maxScale },
                questionText: `<strong>${big.icon}${big.name}</strong> 比 <strong>${small.icon}${small.name}</strong> 多多少份？`,
                readText: `看统计图，${big.name}比${small.name}多多少份？`,
                expr: `[数据图] ${big.value} - ${small.value}`,
                formula: `${big.value} - ${small.value} = ${ans}`,
                visualTip: `${big.name}(${big.value}) - ${small.name}(${small.value}) = ${ans} 份`,
                unitLabel: '份',
                answer: ans
            };
        } else if (qMode === 1) {
            const b1 = bars[0];
            const b2 = bars[1];
            const ans = b1.value + b2.value;
            return {
                kind: 'data',
                hint: '📊 数据图表认知 · 读图求合计',
                chartData: { title: '📊 萌宠能量站今日统计榜', bars, maxScale },
                questionText: `<strong>${b1.icon}${b1.name}</strong> 和 <strong>${b2.icon}${b2.name}</strong> 一共多少份？`,
                readText: `看统计图，${b1.name}和${b2.name}一共多少份？`,
                expr: `[数据图] ${b1.value} + ${b2.value}`,
                formula: `${b1.value} + ${b2.value} = ${ans}`,
                visualTip: `${b1.name}(${b1.value}) + ${b2.name}(${b2.value}) = ${ans} 份`,
                unitLabel: '份',
                answer: ans
            };
        } else {
            const ans = bars[0].value + bars[1].value + bars[2].value;
            return {
                kind: 'data',
                hint: '📊 数据图表认知 · 三项总和汇总',
                chartData: { title: '📊 萌宠能量站今日统计榜', bars, maxScale },
                questionText: `图表里<strong>这 3 种物品一共多少份</strong>？`,
                readText: `看统计图，图表里这三种物品一共多少份？`,
                expr: `[数据图] ${bars[0].value}+${bars[1].value}+${bars[2].value}`,
                formula: `${bars[0].value} + ${bars[1].value} + ${bars[2].value} = ${ans}`,
                visualTip: `三项相加：${bars[0].value} + ${bars[1].value} + ${bars[2].value} = ${ans} 份`,
                unitLabel: '份',
                answer: ans
            };
        }
    }

    // ==================== 3B. 新增 6 大趣味互动数学题型 ====================

    _makeMiniExpr(targetVal = null) {
        const range = Number(this.config?.range) || 20;
        const ops = (this.config?.operations && this.config.operations.length > 0) ? this.config.operations : ['add', 'sub'];
        const maxMul = Math.max(2, Math.min(9, Number(this.config?.maxMultiplier) || (range <= 25 ? 5 : 9)));

        if (targetVal !== null && Number.isInteger(targetVal) && targetVal >= 4) {
            // 为目标值反向构造一个等值算式，确保 "=" 也能自然出现
            if (ops.includes('mul') && targetVal <= maxMul * maxMul) {
                for (let f = 2; f <= maxMul; f++) {
                    if (targetVal % f === 0 && targetVal / f >= 2 && targetVal / f <= maxMul) {
                        return { label: `${f} × ${targetVal / f}`, val: targetVal };
                    }
                }
            }
            if (Math.random() < 0.5 && targetVal >= 3) {
                const a = Math.floor(Math.random() * (targetVal - 2)) + 1;
                return { label: `${a} + ${targetVal - a}`, val: targetVal };
            }
            const extra = Math.floor(Math.random() * Math.min(9, Math.max(2, Math.floor(range * 0.25)))) + 2;
            return { label: `${targetVal + extra} - ${extra}`, val: targetVal };
        }

        const op = ops[Math.floor(Math.random() * ops.length)];
        if (op === 'mul') {
            const a = Math.floor(Math.random() * (maxMul - 1)) + 2;
            const b = Math.floor(Math.random() * (maxMul - 1)) + 2;
            return { label: `${a} × ${b}`, val: a * b };
        }
        if (op === 'div') {
            const b = Math.floor(Math.random() * (maxMul - 1)) + 2;
            const q = Math.floor(Math.random() * (maxMul - 1)) + 2;
            return { label: `${b * q} ÷ ${b}`, val: q };
        }
        if (op === 'sub') {
            const cap = Math.min(range, 120);
            const a = Math.floor(Math.random() * Math.max(6, cap - 5)) + 5;
            const b = Math.floor(Math.random() * Math.max(1, a - 2)) + 1;
            return { label: `${a} - ${b}`, val: a - b };
        }
        const cap = Math.min(range, 120);
        const a = Math.floor(Math.random() * Math.max(4, Math.floor(cap * 0.55))) + 2;
        const b = Math.floor(Math.random() * Math.max(4, Math.floor(cap * 0.4))) + 1;
        return { label: `${a} + ${b}`, val: a + b };
    }

    generateCompareQuestion() {
        const left = this._makeMiniExpr();
        let right;
        const wantEqual = Math.random() < 0.28 && left.val >= 4;
        if (wantEqual) {
            right = this._makeMiniExpr(left.val);
            if (right.label === left.label) {
                right = { label: `${left.val + 2} - 2`, val: left.val };
            }
        } else {
            // 让两边数值接近但不同，更有思考乐趣
            const delta = (Math.floor(Math.random() * 4) + 1) * (Math.random() < 0.5 ? 1 : -1);
            const target = Math.max(2, left.val + delta);
            right = this._makeMiniExpr(target === left.val ? left.val + 2 : target);
        }

        const ans = left.val < right.val ? '<' : (left.val > right.val ? '>' : '=');
        const ansWord = ans === '<' ? '小于' : (ans === '>' ? '大于' : '等于');
        return {
            kind: 'compare',
            isInteractiveWidget: true,
            hint: '⚖️ 天平比大小 · 算一算两边谁更重？',
            leftExpr: left.label,
            leftVal: left.val,
            rightExpr: right.label,
            rightVal: right.val,
            choices: ['<', '=', '>'],
            answer: ans,
            readText: `天平比大小：左边是 ${left.label}，右边是 ${right.label}，中间填小于、等于还是大于？`,
            expr: `[比大小] ${left.label} ○ ${right.label}`,
            formula: `${left.label} ${ans} ${right.label}`,
            display: `${left.label} ○ ${right.label}`,
            visualTip: `左边 ${left.label} = ${left.val}，右边 ${right.label} = ${right.val}，所以填 ${ans}（${ansWord}）！`
        };
    }

    generateBondPopQuestion() {
        const range = Number(this.config?.range) || 20;
        const ops = this.config?.operations || ['add', 'sub'];
        const useMul = ops.includes('mul') && Math.random() < 0.34;

        let bondOp = '+';
        let targetValue = 10;
        let selectedPairs = [];

        if (useMul) {
            bondOp = '×';
            const mulConfigs = [
                { target: 12, pairs: [[1, 12], [2, 6], [3, 4]] },
                { target: 18, pairs: [[1, 18], [2, 9], [3, 6]] },
                { target: 24, pairs: [[2, 12], [3, 8], [4, 6]] },
                { target: 36, pairs: [[2, 18], [3, 12], [4, 9]] }
            ];
            const picked = mulConfigs[Math.floor(Math.random() * mulConfigs.length)];
            targetValue = picked.target;
            selectedPairs = picked.pairs;
        } else {
            if (range <= 12) {
                targetValue = 10;
                const pool = [[1, 9], [2, 8], [3, 7], [4, 6]];
                selectedPairs = pool.sort(() => Math.random() - 0.5).slice(0, 3);
            } else if (range <= 30) {
                targetValue = Math.random() < 0.35 ? 10 : 20;
                if (targetValue === 10) {
                    const pool = [[1, 9], [2, 8], [3, 7], [4, 6]];
                    selectedPairs = pool.sort(() => Math.random() - 0.5).slice(0, 3);
                } else {
                    const pool = [[2, 18], [3, 17], [4, 16], [5, 15], [6, 14], [7, 13], [8, 12], [9, 11]];
                    selectedPairs = pool.sort(() => Math.random() - 0.5).slice(0, 3);
                }
            } else {
                targetValue = Math.random() < 0.45 ? 50 : 100;
                if (targetValue === 50) {
                    const pool = [[5, 45], [10, 40], [12, 38], [15, 35], [18, 32], [20, 30], [22, 28]];
                    selectedPairs = pool.sort(() => Math.random() - 0.5).slice(0, 3);
                } else {
                    const pool = [[10, 90], [15, 85], [20, 80], [25, 75], [30, 70], [35, 65], [40, 60], [45, 55]];
                    selectedPairs = pool.sort(() => Math.random() - 0.5).slice(0, 3);
                }
            }
        }

        const rawBubbles = [];
        selectedPairs.forEach((pair, idx) => {
            rawBubbles.push({ id: `bp_${idx}_a`, value: pair[0], pairId: idx });
            rawBubbles.push({ id: `bp_${idx}_b`, value: pair[1], pairId: idx });
        });
        for (let i = rawBubbles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rawBubbles[i], rawBubbles[j]] = [rawBubbles[j], rawBubbles[i]];
        }

        const badgeText = bondOp === '×' ? `两数相乘得 ${targetValue}` : `两数相加凑 ${targetValue}`;
        const pairDesc = selectedPairs.map(p => `${p[0]}${bondOp}${p[1]}=${targetValue}`).join('，');
        return {
            kind: 'bond_pop',
            isInteractiveWidget: true,
            hint: `🎯 凑数消消乐 · 点击${badgeText}的一对泡泡消除！`,
            bondOp,
            targetValue,
            targetBadgeText: badgeText,
            bubbles: rawBubbles,
            answer: targetValue,
            readText: `凑数消消乐：请依次找出${badgeText}的三组数字泡泡！`,
            expr: `[凑数消消乐] ${badgeText}`,
            formula: pairDesc,
            display: badgeText,
            visualTip: `配对答案：${pairDesc}`
        };
    }

    generateOperatorDetectiveQuestion() {
        const range = Number(this.config?.range) || 20;
        const cfgOps = (this.config?.operations && this.config.operations.length > 0) ? this.config.operations : ['add', 'sub'];
        const maxMul = Math.max(2, Math.min(9, Number(this.config?.maxMultiplier) || (range <= 25 ? 5 : 9)));
        const opMap = { add: '+', sub: '-', mul: '×', div: '÷' };

        let a = 6, b = 3, c = 9, ansOp = '+';

        for (let attempt = 0; attempt < 40; attempt++) {
            const pickKey = cfgOps[Math.floor(Math.random() * cfgOps.length)];
            const sym = opMap[pickKey] || '+';
            if (sym === '+') {
                a = Math.floor(Math.random() * Math.min(40, Math.max(6, range - 4))) + 3;
                b = Math.floor(Math.random() * Math.min(30, Math.max(4, range - a))) + 2;
                c = a + b;
            } else if (sym === '-') {
                a = Math.floor(Math.random() * Math.min(50, Math.max(8, range))) + 5;
                b = Math.floor(Math.random() * Math.max(2, a - 3)) + 2;
                c = a - b;
            } else if (sym === '×') {
                a = Math.floor(Math.random() * (maxMul - 1)) + 2;
                b = Math.floor(Math.random() * (maxMul - 1)) + 2;
                c = a * b;
            } else {
                b = Math.floor(Math.random() * (maxMul - 1)) + 2;
                c = Math.floor(Math.random() * (maxMul - 1)) + 2;
                a = b * c;
            }

            // 严格验证 4 个运算符中只有唯一 1 个能使 a [op] b = c 成立（避免 2+2=2×2=4 或 4-2=4÷2=2 多解）
            const validOps = [];
            if (a + b === c) validOps.push('+');
            if (a - b === c) validOps.push('-');
            if (a * b === c) validOps.push('×');
            if (b !== 0 && a % b === 0 && (a / b) === c) validOps.push('÷');

            if (validOps.length === 1) {
                ansOp = validOps[0];
                break;
            }
        }

        return {
            kind: 'operator_detective',
            isInteractiveWidget: true,
            hint: '🔍 符号小侦探 · 推理问号里藏着哪个运算符号？',
            numA: a,
            numB: b,
            resultC: c,
            choices: ['+', '-', '×', '÷'],
            answer: ansOp,
            readText: `符号小侦探：${a} 什么 ${b} 等于 ${c}？请选出正确的加减乘除符号！`,
            expr: `[符号侦探] ${a} [ ? ] ${b} = ${c}`,
            formula: `${a} ${ansOp} ${b} = ${c}`,
            display: `${a} [ ? ] ${b} = ${c}`,
            visualTip: `验证：${a} ${ansOp} ${b} = ${c}，唯一正确的符号是“${ansOp}”！`
        };
    }

    generateSequenceTrainQuestion() {
        const range = Number(this.config?.range) || 20;
        const idx = (this._seqCounter++) % 4;
        let cars = [];
        let ruleHint = '';

        if (range <= 25) {
            if (idx === 0) {
                const step = Math.floor(Math.random() * 3) + 2; // +2, +3, +4
                const start = Math.floor(Math.random() * 5) + 1;
                cars = [0, 1, 2, 3, 4].map(i => start + i * step);
                ruleHint = `每次往后 +${step}`;
            } else if (idx === 1) {
                const step = Math.floor(Math.random() * 2) + 2; // -2, -3
                const start = 14 + Math.floor(Math.random() * 6);
                cars = [0, 1, 2, 3, 4].map(i => start - i * step);
                ruleHint = `每次往后 -${step}`;
            } else if (idx === 2) {
                const start = Math.floor(Math.random() * 4) + 1;
                // +1, +2, +3, +4 递增规律
                cars = [start, start + 1, start + 3, start + 6, start + 10];
                ruleHint = `相邻差依次是 +1, +2, +3, +4`;
            } else {
                const step = 5;
                const start = Math.random() < 0.5 ? 5 : 2;
                cars = [0, 1, 2, 3, 4].map(i => start + i * step);
                ruleHint = `每次往后 +${step}`;
            }
        } else if (range <= 100) {
            if (idx === 0) {
                const step = Math.floor(Math.random() * 6) + 6; // +6..+11
                const start = Math.floor(Math.random() * 12) + 4;
                cars = [0, 1, 2, 3, 4].map(i => start + i * step);
                ruleHint = `等差递增：每次 +${step}`;
            } else if (idx === 1) {
                const start = Math.floor(Math.random() * 3) + 2; // 2,4,8,16,32 or 3,6,12,24,48
                cars = [0, 1, 2, 3, 4].map(i => start * Math.pow(2, i));
                ruleHint = `翻倍规律：每次 ×2`;
            } else if (idx === 2) {
                const start = Math.floor(Math.random() * 8) + 2;
                cars = [start, start + 2, start + 5, start + 9, start + 14];
                ruleHint = `相邻差依次 +2, +3, +4, +5`;
            } else {
                const step = Math.floor(Math.random() * 5) + 5;
                const start = 55 + Math.floor(Math.random() * 25);
                cars = [0, 1, 2, 3, 4].map(i => start - i * step);
                ruleHint = `等差递减：每次 -${step}`;
            }
        } else {
            if (idx === 0) {
                const base = Math.floor(Math.random() * 3) + 1;
                cars = [0, 1, 2, 3, 4].map(i => (base + i) * (base + i));
                ruleHint = `平方数规律：n × n`;
            } else if (idx === 1) {
                const a0 = Math.floor(Math.random() * 4) + 2;
                const a1 = a0 + Math.floor(Math.random() * 3) + 1;
                cars = [a0, a1, a0 + a1, a1 + (a0 + a1), (a0 + a1) + a1 + (a0 + a1)];
                ruleHint = `前两节车厢相加等于后一节`;
            } else if (idx === 2) {
                const start = Math.floor(Math.random() * 3) + 2;
                cars = [start];
                for (let i = 1; i < 5; i++) cars.push(cars[i - 1] * 2 + 1);
                ruleHint = `规律：前数 ×2 + 1`;
            } else {
                const step = Math.floor(Math.random() * 12) + 15;
                const start = Math.floor(Math.random() * 30) + 20;
                cars = [0, 1, 2, 3, 4].map(i => start + i * step);
                ruleHint = `等差规律：每次 +${step}`;
            }
        }

        const blankIndex = [2, 3, 4][Math.floor(Math.random() * 3)];
        const answer = cars[blankIndex];
        const distractorSet = new Set([answer]);
        const offsets = [1, -1, 2, -2, 3, -3, 5, -5, 4, -4];
        for (const off of offsets) {
            if (distractorSet.size >= 4) break;
            const cand = answer + off;
            if (cand > 0 && cand !== answer) distractorSet.add(cand);
        }
        const choices = [...distractorSet].sort((x, y) => x - y);
        const displaySeq = cars.map((v, i) => (i === blankIndex ? '?' : v)).join(' → ');

        return {
            kind: 'sequence_train',
            isInteractiveWidget: true,
            hint: '🚂 规律小火车 · 找出车厢数字的变化秘密！',
            cars,
            blankIndex,
            ruleHint,
            choices,
            answer,
            readText: `规律小火车：车厢数字依次是 ${cars.map((v, i) => (i === blankIndex ? '问号' : v)).join('，')}，问号车厢应该是几？`,
            expr: `[找规律] ${displaySeq}`,
            formula: cars.join(' → '),
            display: displaySeq,
            visualTip: `${ruleHint} ➔ 完整车厢：${cars.join(' → ')}`
        };
    }

    generateClockMoneyQuestion() {
        const range = Number(this.config?.range) || 20;
        const isClock = (this._clockMoneyToggle++ % 2) === 0;

        if (isClock) {
            const hour = Math.floor(Math.random() * 12) + 1;
            let minute = 0;
            let deltaMinutes = 0;

            if (range <= 25) {
                minute = Math.random() < 0.5 ? 0 : 30;
            } else if (range <= 100) {
                const mins = [0, 15, 30, 45, 10, 20, 40, 50];
                minute = mins[Math.floor(Math.random() * mins.length)];
                if (Math.random() < 0.4) {
                    deltaMinutes = Math.random() < 0.5 ? 15 : 30;
                }
            } else {
                const mins = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
                minute = mins[Math.floor(Math.random() * mins.length)];
                deltaMinutes = [20, 25, 35, 40, 45][Math.floor(Math.random() * 5)];
            }

            const fmt = (h, m) => {
                const normH = ((h - 1 + 120) % 12) + 1;
                return `${normH}:${String(m).padStart(2, '0')}`;
            };

            const totalMins = hour * 60 + minute + deltaMinutes;
            const ansH = Math.floor(totalMins / 60);
            const ansM = totalMins % 60;
            const ansStr = fmt(ansH, ansM);
            const shownStr = fmt(hour, minute);

            const choiceSet = new Set([ansStr]);
            const candidates = [
                fmt(ansH + 1, ansM),
                fmt(ansH - 1, ansM),
                fmt(ansH, (ansM + 30) % 60),
                fmt(ansH + (ansM >= 30 ? 1 : 0), (ansM + 15) % 60),
                fmt(Math.max(1, Math.floor(minute / 5) || 12), (hour * 5) % 60),
                fmt(ansH + 2, ansM)
            ];
            for (const c of candidates) {
                if (choiceSet.size >= 4) break;
                if (c !== ansStr) choiceSet.add(c);
            }
            const choices = [...choiceSet].sort(() => Math.random() - 0.5);

            const promptHtml = deltaMinutes > 0
                ? `看左图钟面现在的时间，<strong>再过 ${deltaMinutes} 分钟</strong>是几点几分？`
                : `仔细看时针（短针）和分针（长针），<strong>现在钟面上是几点几分</strong>？`;
            const readText = deltaMinutes > 0
                ? `看钟面现在的时间，再过${deltaMinutes}分钟是几点几分？`
                : `看时针和分针，现在钟面上是几点几分？`;

            return {
                kind: 'clock_money',
                subKind: 'clock',
                isInteractiveWidget: true,
                hint: deltaMinutes > 0 ? '🕒 时间推算 · 先认钟面，再往后拨分钟' : '🕒 认识钟表 · 短针看时，长针每大格5分',
                hour,
                minute,
                deltaMinutes,
                promptHtml,
                choices,
                answer: ansStr,
                readText,
                expr: deltaMinutes > 0 ? `[钟表] ${shownStr} 再过 ${deltaMinutes}分` : `[钟表认读] 钟面 ${shownStr}`,
                formula: deltaMinutes > 0 ? `${shownStr} + ${deltaMinutes}分 = ${ansStr}` : `钟面时间 = ${ansStr}`,
                display: deltaMinutes > 0 ? `${shownStr} + ${deltaMinutes}分` : `认读钟面`,
                visualTip: deltaMinutes > 0
                    ? `现在是 ${shownStr}，再过 ${deltaMinutes} 分钟就是 ${ansStr}！`
                    : `短针指向 ${hour} 点方向，长针对应 ${String(minute).padStart(2, '0')} 分，合起来是 ${ansStr}！`
            };
        }

        // 超市钱币与找零挑战
        const shopGoods = [
            { name: '草莓盲盒', icon: '🍓' },
            { name: '玩具小熊', icon: '🧸' },
            { name: '水彩画笔', icon: '🎨' },
            { name: '纸杯蛋糕', icon: '🧁' },
            { name: '恐龙模型', icon: '🦖' },
            { name: '迷你足球', icon: '⚽' }
        ].sort(() => Math.random() - 0.5);

        let paidNote = 20;
        let items = [];
        if (range <= 25) {
            paidNote = Math.random() < 0.45 ? 10 : 20;
            const p1 = paidNote === 10 ? (Math.floor(Math.random() * 6) + 3) : (Math.floor(Math.random() * 9) + 6);
            items = [{ ...shopGoods[0], price: p1 }];
        } else if (range <= 100) {
            paidNote = Math.random() < 0.5 ? 50 : 100;
            const p1 = Math.floor(Math.random() * 18) + 8;
            const p2 = Math.floor(Math.random() * 16) + 6;
            items = [
                { ...shopGoods[0], price: p1 },
                { ...shopGoods[1], price: p2 }
            ];
        } else {
            paidNote = 100;
            const p1 = Math.floor(Math.random() * 28) + 18;
            const p2 = Math.floor(Math.random() * 26) + 15;
            items = [
                { ...shopGoods[0], price: p1 },
                { ...shopGoods[1], price: p2 }
            ];
        }

        const totalCost = items.reduce((s, it) => s + it.price, 0);
        const changeVal = paidNote - totalCost;
        const ansStr = `${changeVal} 元`;

        const numSet = new Set([changeVal]);
        for (const off of [2, -2, 10, -10, 5, -5, 1, -1, 8]) {
            if (numSet.size >= 4) break;
            const cand = changeVal + off;
            if (cand > 0 && cand < paidNote && cand !== changeVal) numSet.add(cand);
        }
        const choices = [...numSet].sort((a, b) => a - b).map(v => `${v} 元`);
        const itemSummary = items.map(i => `${i.icon}${i.name} ${i.price}元`).join(' + ');

        return {
            kind: 'clock_money',
            subKind: 'money',
            isInteractiveWidget: true,
            hint: '💴 萌宠超市收银员 · 先算总价再算找零',
            items,
            paidNote,
            totalCost,
            promptHtml: `买了 ${itemSummary}，付出一张 <strong>💴 ${paidNote} 元</strong>纸币，<strong>应找回多少元</strong>？`,
            choices,
            answer: ansStr,
            readText: `超市购物：买了${items.map(i => `${i.price}元的${i.name}`).join('和')}，付了${paidNote}元，应找回多少元？`,
            expr: `[购物找零] 付${paidNote}元 - (${items.map(i => i.price).join('+')})元`,
            formula: `${paidNote} - ${totalCost} = ${changeVal} (元)`,
            display: `付${paidNote}元 找零?`,
            visualTip: `商品共 ${totalCost} 元，${paidNote} - ${totalCost} = 找回 ${changeVal} 元！`
        };
    }

    generatePyramidGridQuestion() {
        const range = Number(this.config?.range) || 20;
        const isPyramid = (this._pyramidGridToggle++ % 2) === 0;

        if (isPyramid) {
            const maxBase = range <= 25 ? 6 : (range <= 100 ? 18 : 42);
            const minBase = range <= 25 ? 1 : (range <= 100 ? 4 : 11);
            const b0 = Math.floor(Math.random() * (maxBase - minBase + 1)) + minBase;
            const b1 = Math.floor(Math.random() * (maxBase - minBase + 1)) + minBase;
            const b2 = Math.floor(Math.random() * (maxBase - minBase + 1)) + minBase;
            const m0 = b0 + b1;
            const m1 = b1 + b2;
            const top = m0 + m1;

            // 随机决定隐藏哪块数砖（保证高年级也有逆推挑战）
            const targetKey = range <= 25
                ? (Math.random() < 0.55 ? 'top' : 'm0')
                : ['top', 'm0', 'b0', 'b2'][Math.floor(Math.random() * 4)];

            const valMap = { top, m0, m1, b0, b1, b2 };
            // 进阶时隐藏顶砖且同时把 m0 设为需要心算过渡的暗格，趣味翻倍
            const hideHelperM0 = (range > 25 && targetKey === 'top' && Math.random() < 0.45);
            const answer = valMap[targetKey];

            const numSet = new Set([answer]);
            for (const off of [1, -1, 2, -2, 4, -4, 6, -3, 5]) {
                if (numSet.size >= 4) break;
                const c = answer + off;
                if (c > 0 && c !== answer) numSet.add(c);
            }
            const choices = [...numSet].sort((a, b) => a - b);

            return {
                kind: 'pyramid_grid',
                subKind: 'pyramid',
                isInteractiveWidget: true,
                hint: '🧱 数砖金字塔 · 相邻两块下层砖相加 = 上方砖',
                pyramid: {
                    top: targetKey === 'top' ? '?' : top,
                    m0: targetKey === 'm0' ? '?' : (hideHelperM0 ? '·' : m0),
                    m1: targetKey === 'm1' ? '?' : m1,
                    b0: targetKey === 'b0' ? '?' : b0,
                    b1: targetKey === 'b1' ? '?' : b1,
                    b2: targetKey === 'b2' ? '?' : b2
                },
                promptHtml: `规则：<strong>底下相邻两数相加 = 上面的数</strong>，请问金色 <strong>[ ? ]</strong> 砖是几？`,
                choices,
                answer,
                readText: `数砖金字塔：底下相邻两块砖相加等于上面的砖，请问问号那块砖应该填几？`,
                expr: `[数砖金字塔] 底(${b0},${b1},${b2}) 求 ?`,
                formula: `${b0}+${b1}=${m0}, ${b1}+${b2}=${m1}, ${m0}+${m1}=${top}`,
                display: `数砖金字塔 [ ? ]`,
                visualTip: `左中 ${b0}+${b1}=${m0}，右中 ${b1}+${b2}=${m1}，顶层 ${m0}+${m1}=${top} ➔ [ ? ] = ${answer}！`
            };
        }

        // 彩色方格纸：数面积 或 算周长
        const gridCols = 6;
        const gridRows = 4;
        const askPerimeter = range > 25 && Math.random() < 0.55;
        const cells = [];

        if (Math.random() < 0.55) {
            // 规则长方形 + 可选凸起小方块（构成趣味 L 形或 T 形）
            const w = Math.floor(Math.random() * 3) + 2; // 2..4
            const h = Math.floor(Math.random() * 2) + 2; // 2..3
            for (let r = 0; r < h; r++) {
                for (let c = 1; c < 1 + w; c++) {
                    cells.push([r + 1, c]);
                }
            }
            if (Math.random() < 0.65) {
                // 在上方加 1~2 块相连方块构成阶梯图形
                cells.push([0, 1]);
                if (w >= 3 && Math.random() < 0.5) cells.push([0, 2]);
            }
        } else {
            // L 型拼图
            const armW = Math.floor(Math.random() * 3) + 3; // 3..5
            const armH = Math.floor(Math.random() * 2) + 2; // 2..3
            for (let c = 1; c < 1 + armW; c++) cells.push([gridRows - 1, c]);
            for (let r = gridRows - armH; r < gridRows - 1; r++) cells.push([r, 1]);
        }

        const cellKeySet = new Set(cells.map(([r, c]) => `${r}_${c}`));
        const area = cellKeySet.size;
        let perimeter = 0;
        cellKeySet.forEach(k => {
            const [r, c] = k.split('_').map(Number);
            if (!cellKeySet.has(`${r - 1}_${c}`)) perimeter++;
            if (!cellKeySet.has(`${r + 1}_${c}`)) perimeter++;
            if (!cellKeySet.has(`${r}_${c - 1}`)) perimeter++;
            if (!cellKeySet.has(`${r}_${c + 1}`)) perimeter++;
        });

        const ansNum = askPerimeter ? perimeter : area;
        const unit = askPerimeter ? '厘米' : '格';
        const ansStr = `${ansNum} ${unit}`;

        const numSet = new Set([ansNum]);
        for (const off of [2, -2, 1, -1, 4, -3, 3]) {
            if (numSet.size >= 4) break;
            const c = ansNum + off;
            if (c >= 4 && c !== ansNum) numSet.add(c);
        }
        const choices = [...numSet].sort((a, b) => a - b).map(v => `${v} ${unit}`);

        return {
            kind: 'pyramid_grid',
            subKind: 'grid',
            isInteractiveWidget: true,
            hint: askPerimeter ? '📐 方格图形周长 · 数一数外圈一共有几条边' : '🟩 方格图形面积 · 数一数涂色小方格有几个',
            gridRows,
            gridCols,
            cells: [...cellKeySet].map(k => k.split('_').map(Number)),
            askPerimeter,
            promptHtml: askPerimeter
                ? `每个小方格边长 1 厘米，涂色图形外圈的<strong>【周长】是多少厘米</strong>？`
                : `数一数，图中彩色拼图一共占了<strong>多少个小方格（面积）</strong>？`,
            choices,
            answer: ansStr,
            readText: askPerimeter
                ? `每个小方格边长1厘米，涂色图形的周长是多少厘米？`
                : `数一数，彩色拼图一共占了多少个小方格？`,
            expr: askPerimeter ? `[方格周长] ${area}格拼图求周长` : `[方格面积] 数彩色方格`,
            formula: askPerimeter ? `外圈边数周长 = ${perimeter} 厘米` : `彩色方格数 = ${area} 格`,
            display: askPerimeter ? `求图形周长` : `求涂色格数`,
            visualTip: askPerimeter
                ? `沿着图形最外圈数一圈，共有 ${perimeter} 段边长，周长是 ${perimeter} 厘米！（面积是 ${area} 格）`
                : `逐行数一数涂色方块，一共占了 ${area} 个小方格！`
        };
    }

    // ==================== 4. 塔防怪兽数盾 & 僵尸护盾联动 ====================
    generateShieldWeakness() {
        const cfg = this.config || {};
        const ops = (cfg.operations && cfg.operations.length > 0) ? cfg.operations : ['add'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        const range = Number(cfg.range) || 20;
        const maxMul = Math.max(2, Math.min(9, Number(cfg.maxMultiplier) || (range <= 25 ? 5 : 9)));
        const allowCarry = cfg.allowCarryBorrow !== false;

        let expr = '';
        let answer = 0;
        let hint = '';

        if (op === 'add') {
            const addRes = this.generateAddition(range, allowCarry, Math.random() > 0.4);
            expr = addRes.expr.replace(/\( \? \)/g, '?');
            answer = addRes.answer;
            hint = `${range}以内加法护盾`;
        } else if (op === 'sub') {
            const subRes = this.generateSubtraction(range, allowCarry, Math.random() > 0.4);
            expr = subRes.expr.replace(/\( \? \)/g, '?');
            answer = subRes.answer;
            hint = `${range}以内减法护盾`;
        } else if (op === 'mul') {
            const a = Math.floor(Math.random() * (maxMul - 1)) + 2;
            const b = Math.floor(Math.random() * (maxMul - 1)) + 2;
            const prod = a * b;
            if (Math.random() > 0.4) {
                expr = `${a} × ? = ${prod}`;
                answer = b;
            } else {
                expr = `${a} × ${b} = ?`;
                answer = prod;
            }
            hint = `${maxMul}以内乘法护盾`;
        } else {
            const b = Math.floor(Math.random() * (maxMul - 1)) + 2;
            const ans = Math.floor(Math.random() * (maxMul - 1)) + 2;
            const a = b * ans;
            if (Math.random() > 0.4) {
                expr = `${a} ÷ ? = ${ans}`;
                answer = b;
            } else {
                expr = `${a} ÷ ${b} = ?`;
                answer = ans;
            }
            hint = `${maxMul}以内除法护盾`;
        }

        return { expr, answer, hint, opType: op, damageMultiplier: 3.5 };
    }

    loadCustomProblem(q) {
        this.currentQuestion = {
            kind: 'calc',
            expr: q.expr,
            formula: q.expr,
            display: q.expr,
            answer: q.answer,
            hint: q.hint || '🎯 击破锁定怪物的弱点护盾！',
            isShieldNuke: !!q.isShieldNuke,
            enemyRef: q.enemyRef || null,
            type: 'weakness_shield',
            timestamp: Date.now()
        };
        return this.currentQuestion;
    }

    generateShieldSpecificQuestion(shieldType) {
        const shieldName = shieldType === 'buckethead' ? '铁桶' : (shieldType === 'conehead' ? '路障' : '防具');
        if (this.difficultyKey === 'grade1_2') {
            const isAdd = Math.random() < 0.5;
            const res = isAdd ? this.generateAddition(20, true, false) : this.generateSubtraction(20, true, false);
            return {
                kind: 'calc',
                formula: res.formula,
                display: res.display,
                expr: res.expr,
                answer: res.answer,
                hint: `⚡ 破盾雷击算式！算出 ${res.display} 击碎${shieldName}！`,
                isShieldTarget: true,
                shieldType
            };
        } else if (this.difficultyKey === 'grade3_4') {
            const a = Math.floor(Math.random() * 8) + 2;
            const b = Math.floor(Math.random() * 8) + 2;
            const expr = `${a} × ${b} = ?`;
            return {
                kind: 'calc',
                formula: expr,
                display: `${a} × ${b}`,
                expr,
                answer: a * b,
                hint: `⚡ 破盾雷击！乘法口诀 ${a}×${b} 击碎${shieldName}！`,
                isShieldTarget: true,
                shieldType
            };
        } else {
            const a = Math.floor(Math.random() * 20) + 10;
            const b = Math.floor(Math.random() * 5) + 2;
            const c = Math.floor(Math.random() * 15) + 5;
            const expr = `${a} × ${b} + ${c} = ?`;
            return {
                kind: 'calc',
                formula: expr,
                display: `${a} × ${b} + ${c}`,
                expr,
                answer: a * b + c,
                hint: `⚡ 高阶破盾！四则心算直击${shieldName}要害！`,
                isShieldTarget: true,
                shieldType
            };
        }
    }

    // ==================== 5. 答案校验与徽章/金币/阳光奖励计算 ====================

    /**
     * 萌宠店长 (/pet/) 标准校验接口 (不主动切下一题，由 UI 控制反馈节奏)
     */
    checkAnswer(input) {
        if (!this.currentQuestion) this.nextQuestion();
        const userNum = parseInt(String(input).trim(), 10);
        const q = this.currentQuestion;
        const expected = q.answer;
        const isCorrect = userNum === expected;

        this.totalAttempted++;
        let badgeEarned = 0;
        let starEarned = 0;
        let expEarned = 0;
        let gotGachaTicket = false;

        const record = {
            id: q.id || ('q_' + Date.now()),
            expr: q.expr || q.formula,
            formula: q.formula || q.expr,
            answer: expected,
            expected,
            userAnswer: userNum,
            userAns: userNum,
            isCorrect,
            time: Date.now()
        };
        this.roundQuestions.push(record);

        if (isCorrect) {
            this.correctCount++;
            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;

            if (q.isReview) {
                badgeEarned = 2;
            } else if (q.kind === 'word' || q.kind === 'data') {
                badgeEarned = this.combo >= 5 ? 2 : 1;
            } else {
                starEarned = this.combo >= 6 ? 2 : 1;
            }

            if (this.combo > 0 && this.combo % 15 === 0) {
                gotGachaTicket = true;
            }
        } else {
            this.combo = 0;
            this.mistakes.push(record);
        }

        return {
            isCorrect,
            userAns: userNum,
            expected,
            question: q,
            formula: q.formula || q.expr,
            combo: this.combo,
            maxCombo: this.maxCombo,
            badgeEarned,
            starEarned,
            expEarned,
            gotGachaTicket
        };
    }

    /**
     * 保卫兔蛙塔防 (/carrot/) 校验接口 (兼容原版 submitAnswer)
     */
    submitAnswer(inputVal) {
        if (!this.currentQuestion) this.nextQuestion();
        const parsed = parseInt(String(inputVal).trim(), 10);
        if (isNaN(parsed)) {
            return { correct: false, reason: 'invalid_input' };
        }

        const q = this.currentQuestion;
        const baseRes = this.checkAnswer(parsed);
        const isRich = (q.kind === 'word' || q.kind === 'data');
        const isShieldNuke = !!q.isShieldNuke;
        const enemyRef = q.enemyRef || null;

        if (baseRes.isCorrect) {
            let fanfare = false;
            if (this.combo >= 5 && this.combo % 5 === 0) {
                this.superChargeActive = true;
                this.superChargeTimer = 8.0;
                fanfare = true;
            }

            const baseGold = isShieldNuke ? 30 : (isRich ? 24 : 15);
            const goldGain = baseGold + Math.min(this.combo * 2, isRich ? 26 : 20);
            this.nextQuestion();

            return {
                correct: true,
                combo: this.combo,
                superCharged: this.superChargeActive,
                fanfare,
                goldGain,
                isRich,
                isShieldNuke,
                enemyRef,
                question: q,
                badgeEarned: baseRes.badgeEarned,
                starEarned: baseRes.starEarned,
                gotGachaTicket: baseRes.gotGachaTicket
            };
        } else {
            return {
                correct: false,
                combo: 0,
                expected: q.answer,
                question: q
            };
        }
    }

    /**
     * 植物大战僵尸 (/pvz/) 校验接口 (自动切下一题并计算阳光/破盾/大招)
     */
    checkPvzAnswer(inputVal) {
        if (!this.currentQuestion) this.nextQuestion();
        const q = this.currentQuestion;
        const baseRes = this.checkAnswer(inputVal);
        const isRich = (q.kind === 'word' || q.kind === 'data');

        let bonusSun = 0;
        let isComboCharge = false;
        let isComboUlt = false;
        let isShieldBreak = false;

        if (baseRes.isCorrect) {
            if (this.combo >= 5) {
                bonusSun = 100;
                isComboUlt = true;
            } else if (this.combo >= 3 || isRich) {
                bonusSun = 75;
                if (this.combo >= 3) {
                    isComboCharge = true;
                    this.superChargeActive = true;
                    this.superChargeTimer = 6.0;
                }
            } else {
                bonusSun = 50;
            }
            if (q.isShieldTarget || isRich) {
                isShieldBreak = true;
            }
        } else {
            this.superChargeActive = false;
        }

        this.nextQuestion();
        return {
            ...baseRes,
            isRich,
            bonusSun,
            isComboCharge,
            isComboUlt,
            isShieldBreak,
            shieldType: q.shieldType || null
        };
    }

    /**
     * 6大互动数学题型统一结算接口（同时返回萌宠徽章、保卫萝卜金币、植物大战僵尸阳光等全字段）
     */
    evaluateInteractiveAttempt(isCorrect, userAnsLabel = '', advanceNext = false) {
        if (!this.currentQuestion) this.nextQuestion();
        const q = this.currentQuestion;
        this.totalAttempted++;

        let badgeEarned = 0;
        let starEarned = 0;
        let gotGachaTicket = false;
        let fanfare = false;

        const record = {
            id: q.id || ('iq_' + Date.now()),
            expr: q.expr || q.formula,
            formula: q.formula || q.expr,
            answer: q.answer,
            expected: q.answer,
            userAnswer: userAnsLabel,
            userAns: userAnsLabel,
            isCorrect,
            isInteractiveWidget: true,
            kind: q.kind,
            time: Date.now()
        };
        this.roundQuestions.push(record);

        if (isCorrect) {
            this.correctCount++;
            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;

            if (q.isReview) {
                badgeEarned = 2;
            } else if (['clock_money', 'pyramid_grid', 'sequence_train'].includes(q.kind)) {
                badgeEarned = this.combo >= 5 ? 2 : 1;
            } else {
                starEarned = this.combo >= 5 ? 2 : 1;
                if (this.combo >= 4 && this.combo % 4 === 0) badgeEarned = 1;
            }

            if (this.combo > 0 && this.combo % 15 === 0) {
                gotGachaTicket = true;
            }
            if (this.combo >= 5 && this.combo % 5 === 0) {
                this.superChargeActive = true;
                this.superChargeTimer = 8.0;
                fanfare = true;
            } else if (this.combo >= 3) {
                this.superChargeActive = true;
                this.superChargeTimer = 6.0;
            }

            const goldGain = 22 + Math.min(this.combo * 2, 24);
            const bonusSun = this.combo >= 5 ? 100 : 75;
            const isComboCharge = this.combo >= 3;
            const isComboUlt = this.combo >= 5;
            const isShieldBreak = true;

            if (advanceNext) this.nextQuestion();

            return {
                correct: true,
                isCorrect: true,
                userAns: userAnsLabel,
                expected: q.answer,
                question: q,
                formula: q.formula || q.expr,
                combo: this.combo,
                maxCombo: this.maxCombo,
                superCharged: this.superChargeActive,
                fanfare,
                goldGain,
                bonusSun,
                isRich: true,
                isComboCharge,
                isComboUlt,
                isShieldBreak,
                badgeEarned,
                starEarned,
                gotGachaTicket
            };
        } else {
            this.combo = 0;
            this.superChargeActive = false;
            if (q.kind !== 'bond_pop') {
                this.mistakes.push(record);
            }
            return {
                correct: false,
                isCorrect: false,
                userAns: userAnsLabel,
                expected: q.answer,
                question: q,
                combo: 0
            };
        }
    }

    /**
     * 供塔防/僵尸模式下的【少儿英语】答题同步写入本局连击与战报统计
     */
    recordEnglishBattleAttempt({ isCorrect, wordObj, userAns = '', isVocabCampFinish = false }) {
        this.totalAttempted++;
        const exprLabel = `[英语] ${wordObj ? wordObj.word : ''} (${wordObj ? wordObj.zh : ''})`;
        const rec = {
            id: 'en_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
            expr: exprLabel,
            formula: exprLabel,
            answer: wordObj ? wordObj.word : '',
            expected: wordObj ? wordObj.word : '',
            userAnswer: userAns || (isCorrect ? (wordObj ? wordObj.word : '✓') : '✗'),
            userAns: userAns || (isCorrect ? (wordObj ? wordObj.word : '✓') : '✗'),
            isCorrect,
            time: Date.now()
        };
        this.roundQuestions.push(rec);

        if (isCorrect) {
            this.correctCount++;
            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;
            let fanfare = false;
            if ((this.combo >= 5 && this.combo % 5 === 0) || isVocabCampFinish) {
                this.superChargeActive = true;
                this.superChargeTimer = 8.0;
                fanfare = true;
            }
            return {
                correct: true,
                isCorrect: true,
                combo: this.combo,
                maxCombo: this.maxCombo,
                superCharged: this.superChargeActive,
                fanfare,
                goldGain: isVocabCampFinish ? 45 : (16 + Math.min(this.combo * 2, 20)),
                bonusSun: isVocabCampFinish ? 100 : (this.combo >= 5 ? 100 : (this.combo >= 3 ? 75 : 50)),
                isComboCharge: this.combo >= 3,
                isComboUlt: isVocabCampFinish || this.combo >= 5,
                isShieldBreak: isVocabCampFinish || this.combo >= 3
            };
        } else {
            this.combo = 0;
            this.superChargeActive = false;
            this.mistakes.push(rec);
            return {
                correct: false,
                isCorrect: false,
                combo: 0
            };
        }
    }

    update(dt) {
        if (this.superChargeActive) {
            this.superChargeTimer -= dt;
            if (this.superChargeTimer <= 0) {
                this.superChargeActive = false;
            }
        }
    }
}

export const mathEngine = new MathEngine('grade1_2');
