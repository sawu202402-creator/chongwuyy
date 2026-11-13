/**
 * mathEngine.js - 智能分阶数学口算 + 乘除法场景应用题 + 店长销量数据统计图表引擎
 * 完整沿用 shuxue / shuxuejs 核心口算算法，并专为《奇妙萌宠店长》扩充乘除法应用题与数据认知
 */

export class MathEngine {
    constructor(difficultyConfig = 'grade1_2') {
        this.currentSubMode = 'calc'; // 'calc' (口算心算) | 'word' (乘除与生活应用题) | 'data' (店长数据图表)
        this.setConfig(difficultyConfig);
        this.currentQuestion = null;
        this.combo = 0;
        this.maxCombo = 0;
        this.correctCount = 0;
        this.totalAttempted = 0;
        this.nextQuestion();
    }

    setSubMode(subMode) {
        this.currentSubMode = subMode || 'calc';
        return this.nextQuestion();
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
                maxMultiplier: Number(configOrKey.maxMultiplier) || 9,
                allowCarryBorrow: configOrKey.allowCarryBorrow !== false,
                allowFillBlank: configOrKey.allowFillBlank !== false,
                includeWordProblems: Boolean(configOrKey.includeWordProblems),
                includeDataCharts: Boolean(configOrKey.includeDataCharts)
            };
        }
        this.difficultyKey = this.config.presetGrade || 'grade1_2';
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

    nextQuestion(forcedMistake = null) {
        if (forcedMistake) {
            this.currentQuestion = {
                ...forcedMistake,
                id: 'rev_' + Date.now(),
                isReview: true,
                timestamp: Date.now()
            };
            return this.currentQuestion;
        }

        let q;
        if (this.currentSubMode === 'word') {
            q = this.generateWordProblem();
        } else if (this.currentSubMode === 'data') {
            q = this.generateDataChartQuestion();
        } else {
            // 在口算模式下，如果家长勾选了穿插应用题或数据图表题，按比例智能穿插
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

        q.id = 'mq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        q.timestamp = Date.now();
        this.currentQuestion = q;
        return q;
    }

    // ==================== 1. 原版 shuxue/shuxuejs 高质量加减乘除口算 ====================
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
        return { kind: 'calc', formula: expr, display: expr, answer, hint };
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
        return { kind: 'calc', formula: expr, display: expr, answer, hint };
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
            return { kind: 'calc', formula: `${a} × ${b} = ?`, display: `${a} × ${b} = ?`, answer: a * b, hint: '乘法口诀速算' };
        } else if (sub === 1) {
            const b = Math.floor(Math.random() * 8) + 2;
            const ans = Math.floor(Math.random() * 8) + 2;
            return { kind: 'calc', formula: `${b * ans} ÷ ${b} = ?`, display: `${b * ans} ÷ ${b} = ?`, answer: ans, hint: '表内除法整除' };
        } else if (sub === 2) {
            const a = Math.floor(Math.random() * 14) + 12;
            const b = Math.floor(Math.random() * 4) + 2;
            return { kind: 'calc', formula: `${a} × ${b} = ?`, display: `${a} × ${b} = ?`, answer: a * b, hint: '两位数乘一位数' };
        } else {
            return Math.random() > 0.5 ? this.generateAddition(100, true, true) : this.generateSubtraction(100, true, false);
        }
    }

    generateGrade5_6() {
        const sub = Math.floor(Math.random() * 3);
        if (sub === 0) {
            const a = Math.floor(Math.random() * 20) + 6;
            const b = Math.floor(Math.random() * 8) + 2;
            const c = Math.floor(Math.random() * 7) + 2;
            return { kind: 'calc', formula: `${a} + ${b} × ${c} = ?`, display: `${a} + ${b} × ${c} = ?`, answer: a + b * c, hint: '四则混合 (先乘除后加减)' };
        } else if (sub === 1) {
            const a = Math.floor(Math.random() * 9) + 3;
            const b = Math.floor(Math.random() * 8) + 2;
            const c = Math.floor(Math.random() * 6) + 2;
            return { kind: 'calc', formula: `(${a} + ${b}) × ${c} = ?`, display: `(${a} + ${b}) × ${c} = ?`, answer: (a + b) * c, hint: '括号优先巧算' };
        } else {
            const tricks = [
                { expr: '25 × 12 = ?', ans: 300 },
                { expr: '25 × 16 = ?', ans: 400 },
                { expr: '125 × 8 = ?', ans: 1000 },
                { expr: '15 × 15 = ?', ans: 225 },
                { expr: '35 × 4 = ?', ans: 140 }
            ];
            const t = tricks[Math.floor(Math.random() * tricks.length)];
            return { kind: 'calc', formula: t.expr, display: t.expr, answer: t.ans, hint: '简便巧算速算' };
        }
    }

    generateCustomCalcQuestion() {
        const cfg = this.config || {};
        const ops = (cfg.operations && cfg.operations.length > 0) ? cfg.operations : ['add'];
        const range = Number(cfg.range) || 20;
        const allowFill = cfg.allowFillBlank !== false;
        const allowCarry = cfg.allowCarryBorrow !== false;
        const limit = Math.max(2, Math.min(12, Number(cfg.maxMultiplier) || 9));
        const op = ops[Math.floor(Math.random() * ops.length)];
        const isFill = allowFill && Math.random() < 0.28;

        if (op === 'add') return this.generateAddition(range, allowCarry, isFill);
        if (op === 'sub') return this.generateSubtraction(range, allowCarry, isFill);
        if (op === 'mul') {
            const a = Math.floor(Math.random() * (limit - 1)) + 2;
            const b = Math.floor(Math.random() * (limit - 1)) + 2;
            const prod = a * b;
            if (isFill) {
                return { kind: 'calc', formula: `${a} × ( ? ) = ${prod}`, display: `${a} × ( ? ) = ${prod}`, answer: b, hint: `${limit}以内乘法填空` };
            }
            return { kind: 'calc', formula: `${a} × ${b} = ?`, display: `${a} × ${b} = ?`, answer: prod, hint: `${limit}以内乘法口诀` };
        }
        // div
        const b = Math.floor(Math.random() * (limit - 1)) + 2;
        const ans = Math.floor(Math.random() * (limit - 1)) + 2;
        const a = b * ans;
        if (isFill) {
            return { kind: 'calc', formula: `${a} ÷ ( ? ) = ${ans}`, display: `${a} ÷ ( ? ) = ${ans}`, answer: b, hint: `${limit}以内除法填空` };
        }
        return { kind: 'calc', formula: `${a} ÷ ${b} = ?`, display: `${a} ÷ ${b} = ?`, answer: ans, hint: `${limit}以内表内除法` };
    }

    // ==================== 2. 乘除法与两步生活应用题 (核心亮点!) ====================
    generateWordProblem() {
        const cfg = this.config || {};
        const limit = Math.max(4, Math.min(9, Number(cfg.maxMultiplier) || 9));
        const isHighGrade = cfg.presetGrade === 'grade5_6' || Number(cfg.range) >= 100;

        // 重点覆盖：1.乘法份数/总价  2.乘法倍数  3.等分除法  4.包含除法  5.两步乘加/乘减或进一装盒
        const types = isHighGrade
            ? ['mul_groups', 'mul_times', 'div_share', 'div_pack', 'twostep_buy', 'div_ceil_box']
            : ['mul_groups', 'mul_times', 'div_share', 'div_pack', 'twostep_buy'];
        const chosen = types[Math.floor(Math.random() * types.length)];

        const actors = [
            { name: '垂耳兔', icon: '🐰', shop: '阳光超市' },
            { name: '荷叶小青蛙', icon: '🐸', shop: '梦幻甜品店' },
            { name: '小白虎', icon: '🐯', shop: '元气汉堡屋' },
            { name: '胖胖竹熊', icon: '🐼', shop: '魔法书屋' },
            { name: '云朵独角兽', icon: '🦄', shop: '彩虹花店' }
        ];
        const items = [
            { name: '草莓蛋糕', unit: '块', box: '盒', icon: '🍰' },
            { name: '甜脆胡萝卜', unit: '根', box: '篮', icon: '🥕' },
            { name: '香脆甜甜圈', unit: '个', box: '盒', icon: '🍩' },
            { name: '彩色铅笔', unit: '支', box: '筒', icon: '✏️' },
            { name: '向日葵鲜花', unit: '朵', box: '束', icon: '🌻' },
            { name: '芝士汉堡', unit: '个', box: '袋', icon: '🍔' }
        ];

        const actor = actors[Math.floor(Math.random() * actors.length)];
        const item = items[Math.floor(Math.random() * items.length)];

        if (chosen === 'mul_groups') {
            const boxes = Math.floor(Math.random() * Math.min(5, limit - 1)) + 2; // 2~6盒
            const perBox = Math.floor(Math.random() * (limit - 1)) + 2;         // 每盒2~limit个
            const ans = boxes * perBox;
            const storyHtml = `${actor.icon} <strong>${actor.name}</strong>在${actor.shop}打包礼盒，<span class="wp-hl">每${item.box}装 ${perBox} ${item.unit}</span>${item.icon}${item.name}，装满 <span class="wp-hl">${boxes} ${item.box}</span>，<strong>一共需要多少${item.unit}${item.name}？</strong>`;
            const groupVisual = Array.from({ length: boxes }, () => `📦[${item.icon}×${perBox}]`).join(' + ');
            return {
                kind: 'word',
                hint: '📖 乘法应用题 · 每份数 × 份数',
                storyHtml,
                readText: `${actor.name}在${actor.shop}打包礼盒，每${item.box}装${perBox}${item.unit}${item.name}，装满${boxes}${item.box}，一共需要多少${item.unit}${item.name}？`,
                formula: `${perBox} × ${boxes} = ${ans}`,
                visualTip: `${groupVisual}  ➔  列式：${perBox} × ${boxes} = ${ans} (${item.unit})`,
                unitLabel: item.unit,
                answer: ans
            };
        }

        if (chosen === 'mul_times') {
            const base = Math.floor(Math.random() * (limit - 2)) + 3; // 3~limit
            const times = Math.floor(Math.random() * 4) + 2;          // 2~5倍
            const ans = base * times;
            const storyHtml = `${actor.icon} <strong>${actor.name}</strong>上午卖出了 <span class="wp-hl">${base} ${item.unit}</span>${item.icon}${item.name}，下午卖出的数量<span class="wp-hl">是上午的 ${times} 倍</span>。<strong>下午卖出了多少${item.unit}？</strong>`;
            return {
                kind: 'word',
                hint: '📖 倍数乘法应用题 · 求一个数的几倍',
                storyHtml,
                readText: `${actor.name}上午卖出了${base}${item.unit}${item.name}，下午卖出的数量是上午的${times}倍。下午卖出了多少${item.unit}？`,
                formula: `${base} × ${times} = ${ans}`,
                visualTip: `上午：[${item.icon}×${base}] ｜ 下午有 ${times} 个这么多 ➔ ${base} × ${times} = ${ans} (${item.unit})`,
                unitLabel: item.unit,
                answer: ans
            };
        }

        if (chosen === 'div_share') {
            // 等分除：总数平均分给 N 个小动物/货架，求每份几个
            const friends = Math.floor(Math.random() * Math.min(5, limit - 1)) + 2;
            const each = Math.floor(Math.random() * (limit - 1)) + 2;
            const total = friends * each;
            const storyHtml = `${actor.icon} <strong>${actor.name}</strong>烤好了 <span class="wp-hl">${total} ${item.unit}</span>${item.icon}${item.name}，要<span class="wp-hl">平均分给 ${friends} 位</span>小顾客，<strong>每位小顾客能分到几${item.unit}？</strong>`;
            return {
                kind: 'word',
                hint: '📖 等分除法应用题 · 平均分求每份',
                storyHtml,
                readText: `${actor.name}烤好了${total}${item.unit}${item.name}，要平均分给${friends}位小顾客，每位小顾客能分到几${item.unit}？`,
                formula: `${total} ÷ ${friends} = ${each}`,
                visualTip: `把 ${total} 平均分成 ${friends} 份 ➔ 列式：${total} ÷ ${friends} = ${each} (${item.unit})`,
                unitLabel: item.unit,
                answer: each
            };
        }

        if (chosen === 'div_pack') {
            // 包含除：总数每 K 个装一盒，能装几盒
            const perBox = Math.floor(Math.random() * (limit - 1)) + 2;
            const boxes = Math.floor(Math.random() * (limit - 1)) + 2;
            const total = perBox * boxes;
            const storyHtml = `${actor.icon} 店里刚进货 <span class="wp-hl">${total} ${item.unit}</span>${item.icon}${item.name}，如果<span class="wp-hl">每 ${perBox} ${item.unit}装满一${item.box}</span>，<strong>一共可以装满几${item.box}？</strong>`;
            return {
                kind: 'word',
                hint: '📖 包含除法应用题 · 求能装几盒',
                storyHtml,
                readText: `店里刚进货${total}${item.unit}${item.name}，如果每${perBox}${item.unit}装满一${item.box}，一共可以装满几${item.box}？`,
                formula: `${total} ÷ ${perBox} = ${boxes}`,
                visualTip: `每 ${perBox} 个装 1 ${item.box}，看 ${total} 里面有几个 ${perBox} ➔ ${total} ÷ ${perBox} = ${boxes} (${item.box})`,
                unitLabel: item.box,
                answer: boxes
            };
        }

        if (chosen === 'div_ceil_box') {
            // 进阶高频易错：有余数进一法装盒问题！
            const perBox = Math.floor(Math.random() * 5) + 4; // 每盒4~8个
            const fullBoxes = Math.floor(Math.random() * 5) + 3;
            const rem = Math.floor(Math.random() * (perBox - 1)) + 1;
            const total = perBox * fullBoxes + rem;
            const ans = fullBoxes + 1;
            const storyHtml = `🚚 <strong>进一法思考题</strong>：${actor.icon}${actor.name}要把 <span class="wp-hl">${total} ${item.unit}</span>${item.icon}${item.name}全部打包，每个箱子最多装 <span class="wp-hl">${perBox} ${item.unit}</span>，<strong>至少需要准备几个箱子才能全部装完？</strong>`;
            return {
                kind: 'word',
                hint: '📖 余数进一法应用题 · 剩下的也要1个箱子哦',
                storyHtml,
                readText: `${actor.name}要把${total}${item.unit}${item.name}全部打包，每个箱子最多装${perBox}${item.unit}，至少需要准备几个箱子才能全部装完？`,
                formula: `${total} ÷ ${perBox} = ${fullBoxes}(箱)……${rem}(${item.unit}) ➔ ${ans}箱`,
                visualTip: `${total} ÷ ${perBox} = ${fullBoxes} 箱还剩 ${rem} ${item.unit}，剩下的也需 1 箱 ➔ ${fullBoxes} + 1 = ${ans} (个)`,
                unitLabel: '个箱子',
                answer: ans
            };
        }

        // twostep_buy: 两步乘加买单问题
        const qty = Math.floor(Math.random() * 3) + 2; // 2~4个
        const price = Math.floor(Math.random() * (limit - 2)) + 3; // 3~limit元
        const drinkPrice = Math.floor(Math.random() * 6) + 3; // 3~8元
        const ans = qty * price + drinkPrice;
        const storyHtml = `🛒 <strong>收银买单题</strong>：${actor.icon}顾客买了 <span class="wp-hl">${qty} ${item.unit}</span>单价 <span class="wp-hl">${price} 元</span>的${item.icon}${item.name}，又买了 <span class="wp-hl">1 杯 ${drinkPrice} 元</span>的牛奶🥛，<strong>一共要付多少元？</strong>`;
        return {
            kind: 'word',
            hint: '📖 两步乘加应用题 · 先算乘法再相加',
            storyHtml,
            readText: `顾客买了${qty}${item.unit}单价${price}元的${item.name}，又买了1杯${drinkPrice}元的牛奶，一共要付多少元？`,
            formula: `${qty} × ${price} + ${drinkPrice} = ${ans}`,
            visualTip: `先算 ${qty} × ${price} = ${qty * price}(元)，再加上牛奶 ${drinkPrice}(元) = ${ans}(元)`,
            unitLabel: '元',
            answer: ans
        };
    }

    // ==================== 3. 店长销量数据统计图表认知 ====================
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

        // 随机选 3 种商品生成不重复销量
        const shuffled = [...goodsPool].sort(() => Math.random() - 0.5).slice(0, 3);
        const step = isHigh ? 5 : (isMid ? 2 : 1);

        if (isHigh && Math.random() < 0.45) {
            // 平均数问题：构造 3 的倍数之和确保整除!
            const avg = (Math.floor(Math.random() * 6) + 4) * 2; // 8~18
            const d = (Math.floor(Math.random() * 3) + 1) * 2;
            const vals = [avg - d, avg + d + 2, avg - 2];
            const bars = shuffled.map((g, idx) => ({ ...g, value: vals[idx] }));
            const maxScale = Math.max(...vals) + 4;
            return {
                kind: 'data',
                hint: '📊 数据分析 · 求平均销量',
                chartData: { title: '📈 今日三款明星甜品销量统计图', bars, maxScale },
                questionText: `看上方统计图，这 3 款甜品<strong>平均每款卖出多少份</strong>？`,
                readText: `看上方统计图，这三款甜品平均每款卖出多少份？`,
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
        // 确保第一个和第二个不同以便问差值
        if (rawNums[0] === rawNums[1]) rawNums[1] += 2;
        const bars = shuffled.map((g, i) => ({ ...g, value: rawNums[i] * step }));
        const maxScale = Math.max(...bars.map(b => b.value)) + step * 2;

        const qMode = Math.floor(Math.random() * 3);
        if (qMode === 0) {
            // 比多比少
            const sorted = [...bars].sort((a, b) => b.value - a.value);
            const big = sorted[0];
            const small = sorted[2];
            const ans = big.value - small.value;
            return {
                kind: 'data',
                hint: '📊 数据图表认知 · 读图比多少',
                chartData: { title: '📊 萌宠超市今日人气销量榜', bars, maxScale },
                questionText: `今天 <strong>${big.icon}${big.name}</strong> 比 <strong>${small.icon}${small.name}</strong> 多卖出了多少份？`,
                readText: `今天${big.name}比${small.name}多卖出了多少份？`,
                formula: `${big.value} - ${small.value} = ${ans}`,
                visualTip: `${big.name}(${big.value}) - ${small.name}(${small.value}) = ${ans} 份`,
                unitLabel: '份',
                answer: ans
            };
        } else if (qMode === 1) {
            // 两种商品合计
            const b1 = bars[0];
            const b2 = bars[1];
            const ans = b1.value + b2.value;
            return {
                kind: 'data',
                hint: '📊 数据图表认知 · 读图求合计',
                chartData: { title: '📊 萌宠超市今日人气销量榜', bars, maxScale },
                questionText: `今天 <strong>${b1.icon}${b1.name}</strong> 和 <strong>${b2.icon}${b2.name}</strong> 一共卖出多少份？`,
                readText: `今天${b1.name}和${b2.name}一共卖出多少份？`,
                formula: `${b1.value} + ${b2.value} = ${ans}`,
                visualTip: `${b1.name}(${b1.value}) + ${b2.name}(${b2.value}) = ${ans} 份`,
                unitLabel: '份',
                answer: ans
            };
        } else {
            // 三种全场总销量
            const ans = bars[0].value + bars[1].value + bars[2].value;
            return {
                kind: 'data',
                hint: '📊 数据图表认知 · 全店总销量汇总',
                chartData: { title: '📊 萌宠超市今日人气销量榜', bars, maxScale },
                questionText: `帮店长算一算，图表里<strong>这 3 种商品今天一共卖出多少份</strong>？`,
                readText: `帮店长算一算，图表里这三种商品今天一共卖出多少份？`,
                formula: `${bars[0].value} + ${bars[1].value} + ${bars[2].value} = ${ans}`,
                visualTip: `三项相加：${bars[0].value} + ${bars[1].value} + ${bars[2].value} = ${ans} 份`,
                unitLabel: '份',
                answer: ans
            };
        }
    }

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

        if (isCorrect) {
            this.correctCount++;
            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;

            if (q.isReview) {
                // 攻克历史错题直接奖励 2 枚徽章
                badgeEarned = 2;
            } else if (q.kind === 'word' || q.kind === 'data') {
                // 乘除应用题与销量数据图思考量更大：每题奖励 1 枚徽章（5连对以上奖励 2 枚）
                badgeEarned = this.combo >= 5 ? 2 : 1;
            } else {
                // 基础心算口算：集星制（每满 3 颗学习星合成 1 枚徽章；6连对以上每题得 2 星）
                starEarned = this.combo >= 6 ? 2 : 1;
            }

            // 连续答对满 15 题的倍数才额外掉落 1 张盲盒扭蛋券（受每日上限约束）
            if (this.combo > 0 && this.combo % 15 === 0) {
                gotGachaTicket = true;
            }
        } else {
            this.combo = 0;
        }

        return {
            isCorrect,
            userAns: userNum,
            expected,
            question: q,
            combo: this.combo,
            maxCombo: this.maxCombo,
            badgeEarned,
            starEarned,
            expEarned,
            gotGachaTicket
        };
    }
}

export const mathEngine = new MathEngine('grade1_2');
