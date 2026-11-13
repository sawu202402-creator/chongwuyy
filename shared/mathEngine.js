/**
 * shared/mathEngine.js - 全平台统一数学学习与战斗联动引擎
 * 同时支持：
 * 1. 心算口算 (加减乘除、凑十破十进退位、逆向填空、1~6年级分阶、巧算公因数公倍数)
 * 2. 乘除法与两步生活应用题 (份数乘法、倍数乘法、等分除、包含除、进一法余数装盒、两步买单，带语音读题与算理图解)
 * 3. 数据统计图表认知 (横向多彩条形统计图：比多少、求合计、全店汇总、求平均数)
 * 4. 塔防/植物大战僵尸战斗联动 (怪兽数盾弱点生成、锁定破盾核爆、连击狂暴超载、本局战报轨迹统计)
 */

export class MathEngine {
    constructor(difficultyConfig = 'grade1_2') {
        this.currentSubMode = 'calc'; // 'calc' | 'word' | 'data'
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
        this.nextQuestion();
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
                includeDataCharts: false
            };
        } else if (configOrKey && typeof configOrKey === 'object') {
            this.config = {
                mode: configOrKey.mode || 'custom',
                presetGrade: configOrKey.presetGrade || 'grade1_2',
                operations: (configOrKey.operations && configOrKey.operations.length > 0) ? configOrKey.operations : ['add', 'sub'],
                range: Number(configOrKey.range) || 20,
                maxMultiplier: Number(configOrKey.maxMultiplier) || (Number(configOrKey.range) <= 25 ? 5 : 9),
                allowCarryBorrow: configOrKey.allowCarryBorrow !== false,
                allowFillBlank: configOrKey.allowFillBlank !== false,
                includeWordProblems: Boolean(configOrKey.includeWordProblems),
                includeDataCharts: Boolean(configOrKey.includeDataCharts)
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
        return `${cfg.range || 20}内${opStr}${mulLimitStr}`;
    }

    getDifficultySummary() {
        return MathEngine.formatSummary(this.config);
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
            const rq = {
                ...forcedOrShield,
                expr: forcedOrShield.expr || forcedOrShield.formula || '复习题',
                formula: forcedOrShield.formula || forcedOrShield.expr || '复习题',
                display: forcedOrShield.display || forcedOrShield.formula || forcedOrShield.expr || '复习题',
                id: 'rev_' + Date.now(),
                isReview: true,
                timestamp: Date.now()
            };
            this.currentQuestion = rq;
            return rq;
        }

        let q;
        if (this.currentSubMode === 'word') {
            q = this.generateWordProblem();
        } else if (this.currentSubMode === 'data') {
            q = this.generateDataChartQuestion();
        } else {
            const roll = Math.random();
            if (this.config.includeWordProblems && roll < 0.22) {
                q = this.generateWordProblem();
            } else if (this.config.includeDataCharts && roll >= 0.22 && roll < 0.40) {
                q = this.generateDataChartQuestion();
            } else if (this.config.mode === 'custom') {
                q = this.generateCustomCalcQuestion();
            } else {
                if (this.difficultyKey === 'grade3_4') q = this.generateGrade3_4();
                else if (this.difficultyKey === 'grade5_6') q = this.generateGrade5_6();
                else q = this.generateGrade1_2();
            }
        }

        if (!q.expr) q.expr = q.formula || q.display || '';
        if (!q.formula) q.formula = q.expr;
        if (!q.display) q.display = q.formula.replace(/\( \? \)/g, '?');
        q.id = 'mq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        q.timestamp = Date.now();
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
