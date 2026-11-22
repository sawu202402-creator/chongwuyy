/**
 * shared/questionWidgets.js - 全平台共享【数学6大新互动题型 + 英语8大互动题型 + 题型多选配置器】组件库
 * 同时服务于：
 * - SmartChalkboard (/carrot/ 保卫兔蛙、/pvz/ 植物大战僵尸)
 * - PetWonderTownApp (/pet/ 奇妙萌宠店长)
 * - PortalHubApp (/ 游戏大厅题型配置)
 */
import { sharedSpeech } from './audioTTS.js';
import { EnglishEngine } from './englishEngine.js';
import { normalizeChineseInput } from './chineseEngine.js';

/**
 * 绘制清晰的 SVG 指针式圆盘钟表（含 1~12 刻度数字、分针格线、时针与分针）
 */
export function buildAnalogClockSvg(hour = 3, minute = 0, size = 96) {
    const cx = 50;
    const cy = 50;
    const r = 45;
    const minAngle = (minute % 60) * 6;
    const hourAngle = ((hour % 12) + (minute % 60) / 60) * 30;

    const polar = (deg, radius) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return {
            x: (cx + radius * Math.cos(rad)).toFixed(2),
            y: (cy + radius * Math.sin(rad)).toFixed(2)
        };
    };

    let ticks = '';
    for (let i = 0; i < 60; i++) {
        const isMajor = i % 5 === 0;
        const p1 = polar(i * 6, isMajor ? r - 5.5 : r - 3);
        const p2 = polar(i * 6, r - 1);
        ticks += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${isMajor ? '#2d3436' : '#b2bec3'}" stroke-width="${isMajor ? 2 : 1}" stroke-linecap="round"/>`;
    }

    let nums = '';
    for (let h = 1; h <= 12; h++) {
        const p = polar(h * 30, r - 12.5);
        nums += `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="central" font-size="9.2" font-weight="900" fill="#2d3436">${h}</text>`;
    }

    const hp = polar(hourAngle, 21);
    const mp = polar(minAngle, 31);

    return `
        <svg class="qw-clock-svg" width="${size}" height="${size}" viewBox="0 0 100 100" aria-label="钟表">
            <circle cx="50" cy="50" r="47" fill="#fffdf7" stroke="#f39c12" stroke-width="4"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="#ffeaa7" stroke-width="1.5"/>
            ${ticks}
            ${nums}
            <line x1="50" y1="50" x2="${hp.x}" y2="${hp.y}" stroke="#e17055" stroke-width="4.2" stroke-linecap="round"/>
            <line x1="50" y1="50" x2="${mp.x}" y2="${mp.y}" stroke="#0984e3" stroke-width="2.8" stroke-linecap="round"/>
            <circle cx="50" cy="50" r="3.6" fill="#d63031"/>
        </svg>
    `;
}

/**
 * 渲染 6 大互动数学题型舞台（天平比大小、凑数消消乐、符号小侦探、规律小火车、钟表与购物、金字塔与方格）
 * @param {HTMLElement} containerEl
 * @param {Object} q - mathEngine 生成的互动题目对象
 * @param {Object} hooks - { onEvaluate(isCorrect, userAnsLabel), onTapSound(), theme: 'dark'|'light' }
 */
export function renderMathInteractiveWidget(containerEl, q, hooks = {}) {
    if (!containerEl || !q) return;
    const onEvaluate = typeof hooks.onEvaluate === 'function' ? hooks.onEvaluate : () => {};
    const onTap = typeof hooks.onTapSound === 'function' ? hooks.onTapSound : () => {};
    const themeClass = hooks.theme === 'light' ? 'qw-theme-light' : 'qw-theme-dark';

    let locked = false;
    let showTip = false;

    const headerHtml = `
        <div class="qw-top-tools">
            <span class="qw-mode-tag">${q.hint || '趣味互动数学'}</span>
            <div class="qw-tool-btns">
                <button type="button" class="qw-mini-btn" data-qw-read="1">🔊 读题</button>
                <button type="button" class="qw-mini-btn tip" data-qw-tip="1">💡 思路</button>
            </div>
        </div>
    `;

    const tipFooterHtml = `
        <div class="qw-tip-drawer" data-qw-tipbox="1" style="display:none;">${q.visualTip || ''}</div>
    `;

    const bindCommonTools = () => {
        const readBtn = containerEl.querySelector('[data-qw-read]');
        const tipBtn = containerEl.querySelector('[data-qw-tip]');
        const tipBox = containerEl.querySelector('[data-qw-tipbox]');
        if (readBtn) {
            readBtn.onclick = (e) => {
                e.stopPropagation();
                onTap();
                sharedSpeech.speakChinese(q.readText || q.hint || '');
            };
        }
        if (tipBtn && tipBox) {
            tipBtn.onclick = (e) => {
                e.stopPropagation();
                onTap();
                showTip = !showTip;
                tipBox.style.display = showTip ? 'block' : 'none';
            };
        }
    };

    const markMathChoiceResult = (clickedBtn, ok, expectedVal) => {
        clickedBtn.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) {
            containerEl.querySelectorAll('.qw-choice-btn').forEach(b => {
                if (String(b.getAttribute('data-val')) === String(expectedVal)) {
                    b.classList.add('correct');
                }
            });
            const tipBox = containerEl.querySelector('[data-qw-tipbox]');
            if (tipBox && tipBox.textContent.trim()) {
                tipBox.style.display = 'block';
            }
        }
    };

    // 1. ⚖️ 天平比大小
    if (q.kind === 'compare') {
        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                ${headerHtml}
                <div class="qw-balance-card">
                    <div class="qw-balance-beam" id="qwBeamRow">
                        <div class="qw-pan left">${q.leftExpr}</div>
                        <div class="qw-fulcrum" id="qwCompareSlot">❓</div>
                        <div class="qw-pan right">${q.rightExpr}</div>
                    </div>
                    <div class="qw-sub-caption">算一算左右两边结果，点击下方正确符号：</div>
                </div>
                <div class="qw-choice-row cols-3">
                    <button type="button" class="qw-choice-btn sym" data-val="<">&lt;<span class="qw-sym-sub">小于</span></button>
                    <button type="button" class="qw-choice-btn sym" data-val="=">=<span class="qw-sym-sub">等于</span></button>
                    <button type="button" class="qw-choice-btn sym" data-val=">">&gt;<span class="qw-sym-sub">大于</span></button>
                </div>
                ${tipFooterHtml}
            </div>
        `;
        bindCommonTools();
        const slotEl = containerEl.querySelector('#qwCompareSlot');
        const beamEl = containerEl.querySelector('#qwBeamRow');
        containerEl.querySelectorAll('.qw-choice-btn').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                locked = true;
                onTap();
                const picked = btn.getAttribute('data-val');
                const ok = picked === q.answer;
                if (slotEl) slotEl.textContent = q.answer;
                if (beamEl) {
                    beamEl.classList.add(q.answer === '<' ? 'tilt-right' : (q.answer === '>' ? 'tilt-left' : 'tilt-even'));
                }
                markMathChoiceResult(btn, ok, q.answer);
                onEvaluate(ok, picked);
            };
        });
        return;
    }

    // 2. 🎯 凑数消消乐 (6个数字泡泡 = 3对)
    if (q.kind === 'bond_pop') {
        let selectedBubble = null;
        const poppedIds = new Set();

        const renderBubbles = () => {
            const poppedPairs = poppedIds.size / 2;
            const bubblesHtml = q.bubbles.map(b => {
                const isPopped = poppedIds.has(b.id);
                const isSel = selectedBubble && selectedBubble.id === b.id;
                return `
                    <button type="button"
                        class="qw-pop-bubble ${isPopped ? 'popped' : ''} ${isSel ? 'selected' : ''}"
                        data-bid="${b.id}" ${isPopped ? 'disabled' : ''}>
                        ${b.value}
                    </button>
                `;
            }).join('');

            containerEl.innerHTML = `
                <div class="qw-stage-wrap ${themeClass}">
                    ${headerHtml}
                    <div class="qw-bond-banner">
                        <span>🎯 目标：<strong>${q.targetBadgeText}</strong></span>
                        <span class="qw-bond-prog">已消 ${poppedPairs} / 3 组</span>
                    </div>
                    <div class="qw-bubble-grid">${bubblesHtml}</div>
                    ${tipFooterHtml}
                </div>
            `;
            bindCommonTools();

            containerEl.querySelectorAll('.qw-pop-bubble').forEach(btn => {
                btn.onclick = () => {
                    if (locked) return;
                    const bid = btn.getAttribute('data-bid');
                    const curObj = q.bubbles.find(x => x.id === bid);
                    if (!curObj || poppedIds.has(bid)) return;
                    onTap();

                    if (!selectedBubble) {
                        selectedBubble = curObj;
                        renderBubbles();
                        return;
                    }
                    if (selectedBubble.id === curObj.id) {
                        selectedBubble = null;
                        renderBubbles();
                        return;
                    }

                    const v1 = selectedBubble.value;
                    const v2 = curObj.value;
                    const isMatch = q.bondOp === '×'
                        ? (v1 * v2 === q.targetValue)
                        : (v1 + v2 === q.targetValue);

                    if (isMatch) {
                        poppedIds.add(selectedBubble.id);
                        poppedIds.add(curObj.id);
                        selectedBubble = null;
                        renderBubbles();
                        if (poppedIds.size >= q.bubbles.length) {
                            locked = true;
                            onEvaluate(true, q.targetBadgeText);
                        }
                    } else {
                        btn.classList.add('wrong');
                        selectedBubble = null;
                        setTimeout(() => {
                            if (!locked) renderBubbles();
                        }, 320);
                    }
                };
            });
        };
        renderBubbles();
        return;
    }

    // 3. 🔍 符号小侦探
    if (q.kind === 'operator_detective') {
        const opLabels = [
            { sym: '+', desc: '加号' },
            { sym: '-', desc: '减号' },
            { sym: '×', desc: '乘号' },
            { sym: '÷', desc: '除号' }
        ];
        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                ${headerHtml}
                <div class="qw-detective-eq">
                    <span class="qw-eq-num">${q.numA}</span>
                    <span class="qw-eq-hole" id="qwOpHole">❓</span>
                    <span class="qw-eq-num">${q.numB}</span>
                    <span class="qw-eq-sign">=</span>
                    <span class="qw-eq-num res">${q.resultC}</span>
                </div>
                <div class="qw-choice-row cols-4">
                    ${opLabels.map(o => `
                        <button type="button" class="qw-choice-btn sym" data-val="${o.sym}">
                            ${o.sym}<span class="qw-sym-sub">${o.desc}</span>
                        </button>
                    `).join('')}
                </div>
                ${tipFooterHtml}
            </div>
        `;
        bindCommonTools();
        const holeEl = containerEl.querySelector('#qwOpHole');
        containerEl.querySelectorAll('.qw-choice-btn').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                locked = true;
                onTap();
                const picked = btn.getAttribute('data-val');
                const ok = picked === q.answer;
                if (holeEl) holeEl.textContent = q.answer;
                markMathChoiceResult(btn, ok, q.answer);
                onEvaluate(ok, picked);
            };
        });
        return;
    }

    // 4. 🚂 规律小火车
    if (q.kind === 'sequence_train') {
        const carsHtml = q.cars.map((val, idx) => {
            const isBlank = idx === q.blankIndex;
            return `
                <div class="qw-train-car ${isBlank ? 'blank' : ''}" id="${isBlank ? 'qwTrainBlankCar' : ''}">
                    <span class="qw-car-val">${isBlank ? '?' : val}</span>
                </div>
            `;
        }).join('<span class="qw-car-link">━</span>');

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                ${headerHtml}
                <div class="qw-train-track">
                    <span class="qw-locomotive">🚂</span>
                    <div class="qw-cars-strip">${carsHtml}</div>
                </div>
                <div class="qw-choice-row cols-4">
                    ${q.choices.map(c => `<button type="button" class="qw-choice-btn" data-val="${c}">${c}</button>`).join('')}
                </div>
                ${tipFooterHtml}
            </div>
        `;
        bindCommonTools();
        const blankCar = containerEl.querySelector('#qwTrainBlankCar .qw-car-val');
        containerEl.querySelectorAll('.qw-choice-btn').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                locked = true;
                onTap();
                const picked = Number(btn.getAttribute('data-val'));
                const ok = picked === Number(q.answer);
                if (blankCar) blankCar.textContent = String(q.answer);
                markMathChoiceResult(btn, ok, q.answer);
                onEvaluate(ok, String(picked));
            };
        });
        return;
    }

    // 5. 🕒 钟表与购物
    if (q.kind === 'clock_money') {
        let visualBlock = '';
        if (q.subKind === 'clock') {
            visualBlock = `
                <div class="qw-clock-money-box">
                    <div class="qw-clock-wrap">${buildAnalogClockSvg(q.hour, q.minute, 88)}</div>
                    <div class="qw-cm-prompt">${q.promptHtml}</div>
                </div>
            `;
        } else {
            const tagsHtml = (q.items || []).map(it => `
                <span class="qw-price-tag">${it.icon} ${it.name} <strong>¥${it.price}</strong></span>
            `).join('');
            visualBlock = `
                <div class="qw-clock-money-box money">
                    <div class="qw-money-tags">
                        ${tagsHtml}
                        <span class="qw-paid-bill">💴 付 ${q.paidNote} 元</span>
                    </div>
                    <div class="qw-cm-prompt">${q.promptHtml}</div>
                </div>
            `;
        }

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                ${headerHtml}
                ${visualBlock}
                <div class="qw-choice-row cols-2">
                    ${q.choices.map(c => `<button type="button" class="qw-choice-btn" data-val="${c}">${c}</button>`).join('')}
                </div>
                ${tipFooterHtml}
            </div>
        `;
        bindCommonTools();
        containerEl.querySelectorAll('.qw-choice-btn').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                locked = true;
                onTap();
                const picked = btn.getAttribute('data-val');
                const ok = String(picked) === String(q.answer);
                markMathChoiceResult(btn, ok, q.answer);
                onEvaluate(ok, picked);
            };
        });
        return;
    }

    // 6. 🧱 金字塔与方格
    if (q.kind === 'pyramid_grid') {
        let visualBlock = '';
        if (q.subKind === 'pyramid') {
            const p = q.pyramid;
            const brick = (val) => {
                const cls = val === '?' ? 'target' : (val === '·' ? 'helper' : '');
                return `<div class="qw-pyr-brick ${cls}">${val === '·' ? '💭' : val}</div>`;
            };
            visualBlock = `
                <div class="qw-pyr-grid-box">
                    <div class="qw-pyramid-tower">
                        <div class="qw-pyr-row">${brick(p.top)}</div>
                        <div class="qw-pyr-row">${brick(p.m0)}${brick(p.m1)}</div>
                        <div class="qw-pyr-row">${brick(p.b0)}${brick(p.b1)}${brick(p.b2)}</div>
                    </div>
                    <div class="qw-cm-prompt">${q.promptHtml}</div>
                </div>
            `;
        } else {
            const activeSet = new Set((q.cells || []).map(([r, c]) => `${r}_${c}`));
            let cellsHtml = '';
            for (let r = 0; r < q.gridRows; r++) {
                for (let c = 0; c < q.gridCols; c++) {
                    const on = activeSet.has(`${r}_${c}`);
                    cellsHtml += `<div class="qw-grid-cell ${on ? 'filled' : ''}"></div>`;
                }
            }
            visualBlock = `
                <div class="qw-pyr-grid-box">
                    <div class="qw-unit-grid" style="grid-template-columns: repeat(${q.gridCols}, 20px);">
                        ${cellsHtml}
                    </div>
                    <div class="qw-cm-prompt">${q.promptHtml}</div>
                </div>
            `;
        }

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                ${headerHtml}
                ${visualBlock}
                <div class="qw-choice-row ${q.subKind === 'pyramid' ? 'cols-4' : 'cols-2'}">
                    ${q.choices.map(c => `<button type="button" class="qw-choice-btn" data-val="${c}">${c}</button>`).join('')}
                </div>
                ${tipFooterHtml}
            </div>
        `;
        bindCommonTools();
        containerEl.querySelectorAll('.qw-choice-btn').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                locked = true;
                onTap();
                const picked = btn.getAttribute('data-val');
                const ok = String(picked) === String(q.answer);
                markMathChoiceResult(btn, ok, q.answer);
                onEvaluate(ok, picked);
            };
        });
    }
}

/**
 * 渲染全部 8 大少儿英语互动题型（听音选图、看图识词、单词消消乐、情景句填空、自然拼读积木、英语小谜语、连词成句火车、果冻字母拼写）
 * @param {HTMLElement} containerEl
 * @param {Object} q - englishEngine 生成的题目对象
 * @param {Object} hooks - { badgeTitle, autoSpeak, speakFn(text, slow, phonics), onEvaluate(isCorrect, userAnsStr), onTapSound(), theme: 'dark'|'light' }
 */
export function renderEnglishQuizWidget(containerEl, q, hooks = {}) {
    if (!containerEl || !q) return;
    const speak = typeof hooks.speakFn === 'function'
        ? hooks.speakFn
        : (txt, slow, ph) => sharedSpeech.speakEnglish(txt, slow, ph);
    const onEvaluate = typeof hooks.onEvaluate === 'function' ? hooks.onEvaluate : () => {};
    const onTap = typeof hooks.onTapSound === 'function' ? hooks.onTapSound : () => {};
    const themeClass = hooks.theme === 'light' ? 'qw-theme-light' : 'qw-theme-dark';
    const badgeTitle = hooks.badgeTitle || '⚡ 英语闪电闯关';

    let locked = false;
    const w = q.wordObj || { word: '', zh: '', icon: '🔤', phonics: '' };

    const bindVoiceBtns = (mainText, phonicsStr = '') => {
        const fastBtn = containerEl.querySelector('[data-en-speak="fast"]');
        const slowBtn = containerEl.querySelector('[data-en-speak="slow"]');
        if (fastBtn) {
            fastBtn.onclick = (e) => {
                e.stopPropagation();
                onTap();
                speak(mainText, false, '');
            };
        }
        if (slowBtn) {
            slowBtn.onclick = (e) => {
                e.stopPropagation();
                onTap();
                speak(mainText, true, phonicsStr);
            };
        }
    };

    /**
     * 统一揭晓作答反馈：
     * 1) 作答前选项绝不泄露答案（纯英文选项不带中文/图案；纯中文图案选项不带英文）；
     * 2) 作答后瞬间浮现选项隐藏的对应释义/词形（.qw-grid-answered），且若选错必定将真正正确项高亮标绿（.correct）！
     */
    const revealEnglishChoiceFeedback = (clickedBtn, ok, isRightOptionFn) => {
        clickedBtn.classList.add(ok ? 'correct' : 'wrong');
        const gridEl = containerEl.querySelector('.qw-en-grid');
        if (gridEl) gridEl.classList.add('qw-grid-answered');
        if (!ok && typeof isRightOptionFn === 'function') {
            containerEl.querySelectorAll('.qw-en-opt').forEach(b => {
                if (isRightOptionFn(b)) b.classList.add('correct');
            });
        }
    };

    // 0. 🎓 校外英语课后专项（听音写词 / 高频词与原句听写 / 课文问答）
    if (q.mode === 'course_special') {
        renderCourseSpecialQuestion(containerEl, q, {
            speak,
            onEvaluate,
            onTap,
            themeClass,
            autoSpeak: Boolean(hooks.autoSpeak),
            revealEnglishChoiceFeedback
        });
        return;
    }

    // 1. 🎧 听音选图（音 -> 义：作答前看图+中文，作答后在卡片下方浮现英文词形）
    if (q.mode === 'listen_pic') {
        const optsHtml = q.options.map(opt => `
            <button type="button" class="qw-en-opt" data-id="${opt.id}" data-word="${opt.word}">
                <span class="qw-en-opt-emoji">${opt.icon}</span>
                <span class="qw-en-opt-sub">${opt.zh}</span>
                <span class="qw-en-opt-reveal">${opt.word}</span>
            </button>
        `).join('');

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                <div class="qw-en-card">
                    <div class="qw-en-top">
                        <span>${badgeTitle}</span>
                        <span>${q.hint || '🎧 听音选图'}</span>
                    </div>
                    <div class="qw-en-voice-row">
                        <button type="button" class="qw-voice-btn primary" data-en-speak="fast">🔊 点击听单词发音</button>
                        <button type="button" class="qw-voice-btn slow" data-en-speak="slow">🐢 拼读慢放</button>
                    </div>
                </div>
                <div class="qw-en-grid">${optsHtml}</div>
            </div>
        `;
        bindVoiceBtns(q.speakText || w.word, w.phonics);
        if (hooks.autoSpeak) speak(q.speakText || w.word, false, '');

        containerEl.querySelectorAll('.qw-en-opt').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                locked = true;
                onTap();
                const pickedId = btn.getAttribute('data-id');
                const pickedWord = btn.getAttribute('data-word') || '';
                const ok = pickedId === q.answerId;
                revealEnglishChoiceFeedback(btn, ok, b => b.getAttribute('data-id') === q.answerId);
                onEvaluate(ok, pickedWord);
            };
        });
        return;
    }

    // 2. 🃏 看图选词（义 -> 形：作答前纯英文选项、不提前自动报答案音；作答后揭晓自然拼读与中文+发音）
    if (q.mode === 'match_word') {
        const optsHtml = q.options.map(opt => `
            <button type="button" class="qw-en-opt" data-id="${opt.id}" data-word="${opt.word}">
                <span class="qw-en-opt-word">${opt.word}</span>
                <span class="qw-en-opt-reveal">${opt.icon || ''} ${opt.zh || ''}</span>
            </button>
        `).join('');

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                <div class="qw-en-card compact">
                    <div class="qw-en-top">
                        <span>${badgeTitle}</span>
                        <span>${q.hint || '🃏 看图选词'}</span>
                    </div>
                    <div class="qw-en-hero-row">
                        <span class="qw-en-big-emoji">${w.icon}</span>
                        <span class="qw-en-hero-zh">${w.zh}</span>
                        <button type="button" class="qw-voice-btn" data-en-speak="fast" title="想不起来可点此听发音提示">💡 发音提示</button>
                        <button type="button" class="qw-voice-btn slow" data-en-speak="slow">🐢 慢读</button>
                    </div>
                </div>
                <div class="qw-en-grid">${optsHtml}</div>
            </div>
        `;
        bindVoiceBtns(w.word, w.phonics);

        containerEl.querySelectorAll('.qw-en-opt').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                locked = true;
                onTap();
                const pickedId = btn.getAttribute('data-id');
                const pickedWord = btn.getAttribute('data-word') || '';
                const ok = pickedId === q.answerId;
                revealEnglishChoiceFeedback(btn, ok, b => b.getAttribute('data-id') === q.answerId);
                onEvaluate(ok, pickedWord);
            };
        });
        return;
    }

    // 2B. 👀 看词识义（形 -> 义：题干只给大号纯英文单词，独立回想中文图案，作答后再朗读核对）
    if (q.mode === 'word_meaning') {
        const optsHtml = q.options.map(opt => `
            <button type="button" class="qw-en-opt" data-id="${opt.id}" data-word="${opt.word}">
                <span class="qw-en-opt-emoji">${opt.icon}</span>
                <span class="qw-en-opt-sub">${opt.zh}</span>
                <span class="qw-en-opt-reveal">${opt.word}</span>
            </button>
        `).join('');

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                <div class="qw-en-card compact">
                    <div class="qw-en-top">
                        <span>${badgeTitle}</span>
                        <span>${q.hint || '👀 看词识义'}</span>
                    </div>
                    <div class="qw-en-hero-row">
                        <span class="qw-en-hero-pureword">${w.word}</span>
                        <button type="button" class="qw-voice-btn" data-en-speak="fast" title="不会读可以点此听音">🔊 听读音</button>
                        <button type="button" class="qw-voice-btn slow" data-en-speak="slow">🐢 拼读</button>
                    </div>
                </div>
                <div class="qw-en-grid">${optsHtml}</div>
            </div>
        `;
        bindVoiceBtns(w.word, w.phonics);

        containerEl.querySelectorAll('.qw-en-opt').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                locked = true;
                onTap();
                const pickedId = btn.getAttribute('data-id');
                const pickedWord = btn.getAttribute('data-word') || '';
                const ok = pickedId === q.answerId;
                revealEnglishChoiceFeedback(btn, ok, b => b.getAttribute('data-id') === q.answerId);
                onEvaluate(ok, pickedWord);
            };
        });
        return;
    }

    // 3. 🫧 单词消消乐配对 (3对中英泡泡)
    if (q.mode === 'bubble_pair') {
        let selectedBubble = null;
        const poppedIds = new Set();

        const renderPairBoard = () => {
            const doneCount = poppedIds.size / 2;
            const gridHtml = q.bubbles.map(b => {
                const isPopped = poppedIds.has(b.bubbleId);
                const isSel = selectedBubble && selectedBubble.bubbleId === b.bubbleId;
                const inner = b.side === 'en'
                    ? `<span class="qw-pair-en">${b.label}</span>`
                    : `<span class="qw-pair-zh"><span>${b.icon}</span><span>${b.label}</span></span>`;
                return `
                    <button type="button"
                        class="qw-pop-bubble pair-${b.side} ${isPopped ? 'popped' : ''} ${isSel ? 'selected' : ''}"
                        data-bid="${b.bubbleId}" ${isPopped ? 'disabled' : ''}>
                        ${inner}
                    </button>
                `;
            }).join('');

            containerEl.innerHTML = `
                <div class="qw-stage-wrap ${themeClass}">
                    <div class="qw-bond-banner">
                        <span>🫧 单词消消乐：点选配对的【英语】与【图案】</span>
                        <span class="qw-bond-prog">${doneCount} / ${q.pairCount}</span>
                    </div>
                    <div class="qw-bubble-grid">${gridHtml}</div>
                </div>
            `;

            containerEl.querySelectorAll('.qw-pop-bubble').forEach(btn => {
                btn.onclick = () => {
                    if (locked) return;
                    const bid = btn.getAttribute('data-bid');
                    const cur = q.bubbles.find(x => x.bubbleId === bid);
                    if (!cur || poppedIds.has(bid)) return;
                    onTap();
                    if (cur.side === 'en' && cur.speakWord) {
                        speak(cur.speakWord, false, '');
                    }

                    if (!selectedBubble) {
                        selectedBubble = cur;
                        renderPairBoard();
                        return;
                    }
                    if (selectedBubble.bubbleId === cur.bubbleId) {
                        selectedBubble = null;
                        renderPairBoard();
                        return;
                    }

                    if (selectedBubble.pairId === cur.pairId && selectedBubble.side !== cur.side) {
                        poppedIds.add(selectedBubble.bubbleId);
                        poppedIds.add(cur.bubbleId);
                        selectedBubble = null;
                        renderPairBoard();
                        if (poppedIds.size >= q.bubbles.length) {
                            locked = true;
                            onEvaluate(true, w.word);
                        }
                    } else {
                        btn.classList.add('wrong');
                        selectedBubble = null;
                        setTimeout(() => {
                            if (!locked) renderPairBoard();
                        }, 300);
                    }
                };
            });
        };

        renderPairBoard();
        if (hooks.autoSpeak) speak(w.word, false, '');
        return;
    }

    // 4. 💬 情景句填空（作答前纯英文选项绝不印中文/图标，作答后才揭晓中文释义与标绿正确项）
    if (q.mode === 'cloze_sentence') {
        const optsHtml = q.options.map(opt => `
            <button type="button" class="qw-en-opt" data-id="${opt.id}" data-word="${opt.word}">
                <span class="qw-en-opt-word">${opt.word}</span>
                <span class="qw-en-opt-reveal">${opt.icon || ''} ${opt.zh || ''}</span>
            </button>
        `).join('');

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                <div class="qw-en-card compact">
                    <div class="qw-en-top">
                        <span>${badgeTitle}</span>
                        <div style="display:flex;gap:4px;">
                            <button type="button" class="qw-mini-btn" data-en-speak="fast">💡 听句提示</button>
                            <button type="button" class="qw-mini-btn" data-en-speak="slow">🐢 慢读</button>
                        </div>
                    </div>
                    <div class="qw-cloze-en">${w.icon} ${q.maskedSentence}</div>
                    <div class="qw-cloze-zh">${q.sentenceZh || ''}</div>
                </div>
                <div class="qw-en-grid">${optsHtml}</div>
            </div>
        `;
        bindVoiceBtns(q.speakText || w.sentence, '');

        containerEl.querySelectorAll('.qw-en-opt').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                locked = true;
                onTap();
                const pickedId = btn.getAttribute('data-id');
                const pickedWord = btn.getAttribute('data-word') || '';
                const ok = pickedId === q.answerId;
                revealEnglishChoiceFeedback(btn, ok, b => b.getAttribute('data-id') === q.answerId);
                onEvaluate(ok, pickedWord);
            };
        });
        return;
    }

    // 5. 🔤 自然拼读积木（默认收起拼写答案胶囊防照抄，可点「💡 拼读提示」或拼错自动展开）
    if (q.mode === 'phonics_chunks') {
        const pickedBlocks = [];
        let showPhonicsHint = false;
        let wrongBanner = '';

        const renderPhonicsUI = () => {
            const slotsHtml = q.expectedChunks.map((_, idx) => {
                const filled = pickedBlocks[idx];
                return `
                    <button type="button" class="qw-chunk-slot ${filled ? 'filled' : ''}" data-sidx="${idx}">
                        ${filled ? filled.chunk : '__'}
                    </button>
                `;
            }).join('<span class="qw-chunk-dash">-</span>');

            const usedIds = new Set(pickedBlocks.map(b => b.blockId));
            const blocksHtml = q.blocks.map(b => `
                <button type="button" class="qw-chunk-tile ${usedIds.has(b.blockId) ? 'used' : ''}" data-bid="${b.blockId}">
                    ${b.chunk}
                </button>
            `).join('');

            const firstChunk = q.expectedChunks?.[0] || '';
            const guideHtml = firstChunk
                ? (showPhonicsHint
                    ? `<span class="qw-phonics-guide-pill" title="首音节积木提示">首块积木：【${firstChunk}】…（共${q.expectedChunks.length}块）</span>`
                    : `<button type="button" class="qw-mini-btn tip" data-ph-hint="1">💡 首块提示</button>`)
                : '';

            containerEl.innerHTML = `
                <div class="qw-stage-wrap ${themeClass}">
                    <div class="qw-en-card compact">
                        <div class="qw-en-top">
                            <span>🔤 自然拼读积木</span>
                            <div style="display:flex;gap:4px;">
                                <button type="button" class="qw-mini-btn" data-en-speak="fast">🔊 听词</button>
                                <button type="button" class="qw-mini-btn" data-en-speak="slow">🐢 慢速拼读</button>
                            </div>
                        </div>
                        <div class="qw-en-hero-row">
                            <span class="qw-en-big-emoji">${w.icon}</span>
                            <span class="qw-en-hero-zh">${w.zh} <small style="opacity:0.75;">${w.ipa || ''}</small></span>
                            ${guideHtml}
                        </div>
                        <div class="qw-chunk-slots-row">${slotsHtml}</div>
                        ${wrongBanner ? `<div class="qw-wrong-answer-banner">${wrongBanner}</div>` : ''}
                    </div>
                    <div class="qw-chunk-pool">${blocksHtml}</div>
                </div>
            `;
            bindVoiceBtns(w.word, w.phonics);

            containerEl.querySelector('[data-ph-hint]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                onTap();
                showPhonicsHint = true;
                speak(w.word, true, w.phonics);
                renderPhonicsUI();
            });

            containerEl.querySelectorAll('.qw-chunk-slot.filled').forEach(slotBtn => {
                slotBtn.onclick = () => {
                    if (locked) return;
                    onTap();
                    const sidx = Number(slotBtn.getAttribute('data-sidx'));
                    pickedBlocks.splice(sidx, 1);
                    renderPhonicsUI();
                };
            });

            containerEl.querySelectorAll('.qw-chunk-tile').forEach(tileBtn => {
                tileBtn.onclick = () => {
                    if (locked || pickedBlocks.length >= q.expectedChunks.length) return;
                    const bid = tileBtn.getAttribute('data-bid');
                    const block = q.blocks.find(x => x.blockId === bid);
                    if (!block || usedIds.has(bid)) return;
                    onTap();
                    pickedBlocks.push(block);
                    renderPhonicsUI();

                    if (pickedBlocks.length === q.expectedChunks.length) {
                        locked = true;
                        const userWord = pickedBlocks.map(x => x.chunk).join('').toLowerCase();
                        const ok = userWord === q.expectedWord.toLowerCase();
                        if (!ok) {
                            showPhonicsHint = true;
                            wrongBanner = `✅ 正确拼写：${w.word}（${q.expectedChunks.join('·')}）`;
                            renderPhonicsUI();
                        }
                        onEvaluate(ok, userWord);
                    }
                };
            });
        };

        renderPhonicsUI();
        if (hooks.autoSpeak) speak(w.word, false, '');
        return;
    }

    // 6. 🕵️ 英语小谜语（作答前纯英文选项无中文无Emoji泄露，作答后揭晓词义并标绿正确项）
    if (q.mode === 'riddle_qa') {
        const optsHtml = q.options.map(opt => `
            <button type="button" class="qw-en-opt" data-id="${opt.id}" data-word="${opt.word}">
                <span class="qw-en-opt-word">${opt.word}</span>
                <span class="qw-en-opt-reveal">${opt.icon || ''} ${opt.zh || ''}</span>
            </button>
        `).join('');

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                <div class="qw-en-card compact">
                    <div class="qw-en-top">
                        <span>🕵️ 英语小侦探猜谜</span>
                        <button type="button" class="qw-mini-btn" data-en-speak="fast">🔊 听线索</button>
                    </div>
                    <div class="qw-riddle-en">${q.riddleEn}</div>
                    <div class="qw-cloze-zh">${q.riddleZh || ''}</div>
                </div>
                <div class="qw-en-grid">${optsHtml}</div>
            </div>
        `;
        bindVoiceBtns(q.speakText || w.word, '');
        if (hooks.autoSpeak && w.riddle) speak(w.riddle, false, '');

        containerEl.querySelectorAll('.qw-en-opt').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                locked = true;
                onTap();
                const pickedId = btn.getAttribute('data-id');
                const pickedWord = btn.getAttribute('data-word') || '';
                const ok = pickedId === q.answerId;
                revealEnglishChoiceFeedback(btn, ok, b => b.getAttribute('data-id') === q.answerId);
                onEvaluate(ok, pickedWord);
            };
        });
        return;
    }

    // 7. 🚂 连词成句火车
    if (q.mode === 'word_order') {
        const prefillN = Math.max(0, Number(q.prefilledCount) || 0);
        const chosenCarriages = [];
        let wrongSenBanner = '';
        for (let i = 0; i < prefillN; i++) {
            const matchC = q.carriages.find(c => c.orderIdx === i)
                || q.carriages.find(c => c.text === q.expectedTokens[i] && !chosenCarriages.includes(c));
            if (matchC) chosenCarriages.push(matchC);
        }

        const renderWordTrain = () => {
            const usedSet = new Set(chosenCarriages.map(c => c.carriageId));
            const trackHtml = q.expectedTokens.map((_, idx) => {
                const placed = chosenCarriages[idx];
                const isPrefilled = idx < prefillN && Boolean(placed);
                return `
                    <button type="button" class="qw-wo-slot ${placed ? 'filled' : ''} ${isPrefilled ? 'prefilled' : ''}" data-idx="${idx}" ${isPrefilled ? 'title="第1节提示词已放好"' : ''}>
                        ${placed ? placed.text : `${idx + 1}`}
                    </button>
                `;
            }).join('');

            const poolHtml = q.carriages.map(c => `
                <button type="button" class="qw-wo-chip ${usedSet.has(c.carriageId) ? 'used' : ''}" data-cid="${c.carriageId}">
                    ${c.text}
                </button>
            `).join('');

            containerEl.innerHTML = `
                <div class="qw-stage-wrap ${themeClass}">
                    <div class="qw-en-card compact">
                        <div class="qw-en-top">
                            <span>🚂 连词成句小火车</span>
                            <button type="button" class="qw-mini-btn" data-en-speak="fast">🔊 听原句</button>
                        </div>
                        <div class="qw-cloze-zh">${w.icon} ${q.sentenceZh}</div>
                        <div class="qw-wo-track"><span>🚂</span>${trackHtml}</div>
                        ${wrongSenBanner ? `<div class="qw-wrong-answer-banner">${wrongSenBanner}</div>` : ''}
                    </div>
                    <div class="qw-chunk-pool">${poolHtml}</div>
                </div>
            `;
            bindVoiceBtns(q.speakText || q.expectedSentence, '');

            containerEl.querySelectorAll('.qw-wo-slot.filled').forEach(btn => {
                btn.onclick = () => {
                    if (locked) return;
                    const idx = Number(btn.getAttribute('data-idx'));
                    if (idx < prefillN) return;
                    onTap();
                    chosenCarriages.splice(idx, 1);
                    renderWordTrain();
                };
            });

            containerEl.querySelectorAll('.qw-wo-chip').forEach(btn => {
                btn.onclick = () => {
                    if (locked || chosenCarriages.length >= q.expectedTokens.length) return;
                    const cid = btn.getAttribute('data-cid');
                    const obj = q.carriages.find(x => x.carriageId === cid);
                    if (!obj || usedSet.has(cid)) return;
                    onTap();
                    chosenCarriages.push(obj);
                    renderWordTrain();

                    if (chosenCarriages.length === q.expectedTokens.length) {
                        locked = true;
                        const userSen = chosenCarriages.map(x => x.text).join(' ');
                        const ok = userSen === q.expectedSentence;
                        if (!ok) {
                            wrongSenBanner = `✅ 正确原句：${q.expectedSentence}`;
                            renderWordTrain();
                        }
                        onEvaluate(ok, userSen);
                    }
                };
            });
        };

        renderWordTrain();
        if (hooks.autoSpeak) speak(q.speakText || q.expectedSentence, false, '');
        return;
    }

    // 8. 🧩 果冻字母拼写 (默认兜底)
    const filledMap = {};
    let wrongSpellBanner = '';
    const renderSpell = () => {
        const slotsHtml = q.chars.map((ch, idx) => {
            if (!q.missingIndices.includes(idx)) {
                return `<span class="smart-spell-slot">${ch}</span>`;
            }
            const filled = filledMap[idx];
            return `<span class="smart-spell-slot missing ${filled ? 'filled' : ''}" data-slot="${idx}">${filled ? filled.char : '_'}</span>`;
        }).join('');

        const usedIds = Object.values(filledMap).map(v => v.tileId);
        const tilesHtml = q.tiles.map(t => `
            <button type="button" class="smart-letter-tile ${usedIds.includes(t.tileId) ? 'used' : ''}" data-tid="${t.tileId}">
                ${t.char}
            </button>
        `).join('');

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                <div class="qw-en-card compact">
                    <div class="qw-en-top">
                        <span>${badgeTitle}</span>
                        <div style="display:flex;gap:4px;">
                            <button type="button" class="qw-mini-btn" data-en-speak="fast">🔊 发音</button>
                            <button type="button" class="qw-mini-btn" data-en-speak="slow">🐢 慢读</button>
                        </div>
                    </div>
                    <div class="qw-en-hero-row">
                        <span class="qw-en-big-emoji">${w.icon}</span>
                        <span class="qw-en-hero-zh">${w.zh}</span>
                    </div>
                    <div class="smart-spell-slots">${slotsHtml}</div>
                    ${wrongSpellBanner ? `<div class="qw-wrong-answer-banner">${wrongSpellBanner}</div>` : ''}
                </div>
                <div class="smart-spell-tiles">${tilesHtml}</div>
            </div>
        `;
        bindVoiceBtns(w.word, w.phonics);

        containerEl.querySelectorAll('.smart-spell-slot.missing.filled').forEach(slotEl => {
            slotEl.onclick = () => {
                if (locked) return;
                onTap();
                const idx = Number(slotEl.getAttribute('data-slot'));
                delete filledMap[idx];
                renderSpell();
            };
        });

        containerEl.querySelectorAll('.smart-letter-tile').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                const tid = btn.getAttribute('data-tid');
                const tile = q.tiles.find(x => x.tileId === tid);
                const nextIdx = q.missingIndices.find(i => !filledMap[i]);
                if (!tile || nextIdx === undefined) return;
                onTap();
                filledMap[nextIdx] = tile;
                renderSpell();

                if (q.missingIndices.every(i => Boolean(filledMap[i]))) {
                    locked = true;
                    const userWord = q.chars.map((c, i) => (filledMap[i] ? filledMap[i].char : c)).join('');
                    const ok = userWord.toLowerCase() === q.expectedWord;
                    if (!ok) {
                        wrongSpellBanner = `✅ 正确拼写：${w.word}`;
                        renderSpell();
                    }
                    onEvaluate(ok, userWord);
                }
            };
        });
    };

    renderSpell();
    if (hooks.autoSpeak) speak(w.word, false, '');
}

/**
 * 渲染可自由勾选启用哪些题型的胶囊多选面板（强制至少保留 1 项，附带【全选】与【基础推荐】快捷按钮）
 * @param {HTMLElement} containerEl
 * @param {Array} typesMeta - MATH_QUESTION_TYPES 或 ENGLISH_QUESTION_TYPES
 * @param {Array<string>} selectedIds
 * @param {Function} onChange - (nextSelectedIds) => void
 * @param {Array<string>} basicPresetIds - 点击“基础推荐”时勾选的题型
 */
export function renderEnabledTypesSelector(containerEl, typesMeta, selectedIds, onChange, basicPresetIds = []) {
    if (!containerEl) return;
    const allIds = typesMeta.map(t => t.id);
    let current = Array.isArray(selectedIds) && selectedIds.length > 0
        ? selectedIds.filter(id => allIds.includes(id))
        : [...allIds];
    if (current.length === 0) current = [...allIds];

    const draw = () => {
        const set = new Set(current);
        const blockedCount = allIds.length - current.length;
        const pillsHtml = typesMeta.map(t => {
            const active = set.has(t.id);
            const diffBadge = t.diffTag
                ? `<span class="qw-diff-tag diff-${t.diffLevel || 'easy'}">${t.diffTag}</span>`
                : '';
            const stateBadge = `<span class="qw-state-flag">${active ? '随机出现' : '不出现'}</span>`;
            return `
                <button type="button" class="qw-type-check-pill ${active ? 'active' : 'excluded'}" data-tid="${t.id}" title="${t.desc || t.name}">
                    <span class="qw-chk-mark">${active ? '✅' : '🚫'}</span>
                    <span class="qw-pill-main-txt">${t.name}</span>
                    ${diffBadge}
                    ${stateBadge}
                </button>
            `;
        }).join('');

        const hasCourseSpecial = allIds.includes('course_special');
        containerEl.innerHTML = `
            <div class="qw-type-selector-wrap">
                <div class="qw-type-quick-bar">
                    <span class="qw-type-count">
                        已开启 <strong>${current.length}</strong> 项${blockedCount > 0 ? ` · <span class="qw-blocked-tip">🚫 已屏蔽 ${blockedCount} 项不在随机中出现</span>` : '（全部开启）'}
                    </span>
                    <div class="qw-type-quick-btns">
                        ${basicPresetIds.length > 0 ? `<button type="button" class="qw-tiny-act easy-rec" data-qact="basic">🌱 只留简单题</button>` : ''}
                        <button type="button" class="qw-tiny-act" data-qact="all">☑️ 全开 (${allIds.length})</button>
                        ${hasCourseSpecial ? `<button type="button" class="qw-tiny-act course-only" data-qact="course_only">🎓 仅校外课</button>` : ''}
                    </div>
                </div>
                <div class="qw-type-pills-grid">${pillsHtml}</div>
            </div>
        `;

        containerEl.querySelectorAll('.qw-type-check-pill').forEach(btn => {
            btn.onclick = () => {
                const tid = btn.getAttribute('data-tid');
                if (set.has(tid)) {
                    if (current.length <= 1) return; // 至少保留 1 个题型
                    current = current.filter(x => x !== tid);
                } else {
                    current = [...current, tid];
                }
                onChange([...current]);
                draw();
            };
        });

        containerEl.querySelector('[data-qact="all"]')?.addEventListener('click', () => {
            current = [...allIds];
            onChange([...current]);
            draw();
        });

        containerEl.querySelector('[data-qact="basic"]')?.addEventListener('click', () => {
            current = basicPresetIds.filter(id => allIds.includes(id));
            if (current.length === 0) current = [allIds[0]];
            onChange([...current]);
            draw();
        });

        containerEl.querySelector('[data-qact="course_only"]')?.addEventListener('click', () => {
            current = ['course_special'];
            onChange([...current]);
            draw();
        });
    };

    draw();
}

/**
 * 校外英语课专项考题渲染器（覆盖：启蒙听音认词 / 高频词选填 / 盲听全词拼写 / 高频词默写 / 必背原句听写 / 课文问答Q&A / 课文填空 / 长句排序）
 */
function renderCourseSpecialQuestion(containerEl, q, ctx) {
    const { speak, onEvaluate, onTap, themeClass, autoSpeak, revealEnglishChoiceFeedback } = ctx;
    let locked = false;

    // A0. 👂 自然拼读听音认词 & 🎯 高频词认读选填（作答前纯英文选项零中文泄露，作答后揭晓词义与自然拼读+标绿正确项）
    if (q.courseSubType === 'phonics_listen_pick' || q.courseSubType === 'sight_cloze_pick') {
        const isSightPick = q.courseSubType === 'sight_cloze_pick';
        let showCue = false;

        const drawCoursePick = () => {
            const optsHtml = (q.options || []).map(opt => {
                const postReveal = opt.phonics
                    ? `${EnglishEngine.renderPhonicsHtml(opt.phonics)} · ${opt.icon || ''}${opt.zh || ''}`
                    : `${opt.icon || ''} ${opt.zh || ''}`;
                return `
                    <button type="button" class="qw-en-opt" data-cid="${opt.id}" data-cword="${opt.word}">
                        <span class="qw-en-opt-word">${opt.word}</span>
                        <span class="qw-en-opt-reveal">${postReveal}</span>
                    </button>
                `;
            }).join('');

            const bodyHtml = isSightPick
                ? `
                    <div class="qw-cloze-en">${q.maskedSentence}</div>
                    <div class="qw-cloze-zh">${q.sentenceZh || ''}</div>
                `
                : `
                    <div class="qw-course-meaning-row">
                        ${showCue
                            ? `<span style="font-size:1.15rem;font-weight:900;">${q.meaningCue}</span>`
                            : `<button type="button" class="qw-mini-btn tip" data-cpcue="1">💡 看词义提示</button>`}
                        ${q.ipa ? `<span class="qw-ipa-pill">${q.ipa}</span>` : ''}
                    </div>
                `;

            containerEl.innerHTML = `
                <div class="qw-stage-wrap ${themeClass}">
                    <div class="qw-en-card compact qw-course-card">
                        <div class="qw-en-top">
                            <span class="qw-course-tag">${q.hint}</span>
                        </div>
                        <div class="qw-en-voice-row compact">
                            <button type="button" class="qw-voice-btn primary" data-cpspeak="fast">${isSightPick ? '💡 听原句提示' : '🔊 听纯正发音'}</button>
                            <button type="button" class="qw-voice-btn slow" data-cpspeak="slow">🐢 慢速拼读</button>
                        </div>
                        ${bodyHtml}
                    </div>
                    <div class="qw-en-grid">${optsHtml}</div>
                </div>
            `;

            containerEl.querySelector('[data-cpspeak="fast"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                onTap();
                speak(q.speakText, false, '');
            });
            containerEl.querySelector('[data-cpspeak="slow"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                onTap();
                speak(q.wordOnlySpeak || q.speakText, true, q.phonicsHint || '');
            });
            containerEl.querySelector('[data-cpcue="1"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                onTap();
                showCue = true;
                drawCoursePick();
            });
            containerEl.querySelectorAll('.qw-en-opt').forEach(btn => {
                btn.onclick = () => {
                    if (locked) return;
                    locked = true;
                    onTap();
                    const pickedId = btn.getAttribute('data-cid');
                    const pickedWord = btn.getAttribute('data-cword') || '';
                    const ok = pickedId === q.answerId || pickedWord.toLowerCase() === q.expectedWord;
                    if (typeof revealEnglishChoiceFeedback === 'function') {
                        revealEnglishChoiceFeedback(
                            btn,
                            ok,
                            b => b.getAttribute('data-cid') === q.answerId || (b.getAttribute('data-cword') || '').toLowerCase() === q.expectedWord
                        );
                    } else {
                        btn.classList.add(ok ? 'correct' : 'wrong');
                    }
                    onEvaluate(ok, pickedWord);
                };
            });
        };

        drawCoursePick();
        // 听音认词自动播发音；高频词选句填空不自动念出答案原句（作答后自动朗读完整原句）
        if (autoSpeak && !isSightPick) speak(q.speakText, false, '');
        return;
    }

    // A. 👂 听音写词抽查 & ✍️ 高频词全字母默写（带「💡 提示1字母」辅助防卡壳）
    if (q.courseSubType === 'phonics_dictation' || q.courseSubType === 'sight_word_spell') {
        const isSight = q.courseSubType === 'sight_word_spell';
        const pickedTiles = [];
        let revealAnswer = '';

        const finishIfComplete = () => {
            if (pickedTiles.length === q.chars.length) {
                locked = true;
                const userWord = pickedTiles.map(x => x.char).join('').toLowerCase();
                const ok = userWord === q.expectedWord;
                if (!ok) {
                    revealAnswer = `💡 正确默写：${q.expectedWord}`;
                    drawDictation();
                }
                onEvaluate(ok, userWord);
            }
        };

        const drawDictation = () => {
            const usedSet = new Set(pickedTiles.map(t => t.tileId));
            const slotsHtml = q.chars.map((_, idx) => {
                const filled = pickedTiles[idx];
                return `
                    <button type="button" class="smart-spell-slot missing ${filled ? 'filled' : ''}" data-dslot="${idx}">
                        ${filled ? filled.char : '_'}
                    </button>
                `;
            }).join('');

            const tilesHtml = q.tiles.map(t => `
                <button type="button" class="smart-letter-tile ${usedSet.has(t.tileId) ? 'used' : ''}" data-dtid="${t.tileId}">
                    ${t.char}
                </button>
            `).join('');

            const contextHtml = isSight
                ? `<div class="qw-cloze-en">${q.maskedSentence}</div><div class="qw-cloze-zh">${q.sentenceZh || ''} · ${q.meaningCue}</div>`
                : `<div class="qw-course-meaning-row"><span>${q.meaningCue}</span>${q.ipa ? `<span class="qw-ipa-pill">${q.ipa}</span>` : ''}</div>`;

            containerEl.innerHTML = `
                <div class="qw-stage-wrap ${themeClass}">
                    <div class="qw-en-card compact qw-course-card">
                        <div class="qw-en-top">
                            <span class="qw-course-tag">${q.hint}</span>
                            <div style="display:flex;gap:4px;">
                                <button type="button" class="qw-mini-btn hint-letter" data-dact="hint" ${locked || pickedTiles.length >= Math.max(1, q.chars.length - 1) ? 'disabled' : ''} title="最多提示前几个字母，最后一个字母留给你自己拼出来哦！">💡 提示1字母</button>
                                <button type="button" class="qw-mini-btn" data-dact="back" ${pickedTiles.length === 0 || locked ? 'disabled' : ''}>⌫ 退格</button>
                            </div>
                        </div>
                        <div class="qw-en-voice-row compact">
                            <button type="button" class="qw-voice-btn primary" data-dspeak="fast">${isSight ? '🔊 听词与原句' : '🔊 听词发音'}</button>
                            <button type="button" class="qw-voice-btn slow" data-dspeak="slow">🐢 慢速拼读</button>
                        </div>
                        ${contextHtml}
                        <div class="smart-spell-slots ${q.chars.length >= 8 ? 'long-word' : ''}">${slotsHtml}</div>
                        ${revealAnswer ? `<div class="qw-course-reveal">${revealAnswer}</div>` : ''}
                    </div>
                    <div class="smart-spell-tiles ${q.chars.length >= 8 ? 'long-word' : ''}">${tilesHtml}</div>
                </div>
            `;

            containerEl.querySelector('[data-dspeak="fast"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                onTap();
                speak(q.speakText, false, '');
            });
            containerEl.querySelector('[data-dspeak="slow"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                onTap();
                speak(q.wordOnlySpeak || q.speakText, true, q.phonicsHint || '');
            });
            containerEl.querySelector('[data-dact="hint"]')?.addEventListener('click', () => {
                if (locked || pickedTiles.length >= Math.max(1, q.chars.length - 1)) return;
                onTap();
                // 若前面有填错的字母，先自动修正退回至正确前缀处
                while (pickedTiles.length > 0 && pickedTiles[pickedTiles.length - 1].char.toLowerCase() !== q.chars[pickedTiles.length - 1]) {
                    pickedTiles.pop();
                }
                const nextChar = q.chars[pickedTiles.length];
                const curUsed = new Set(pickedTiles.map(t => t.tileId));
                const nextTile = q.tiles.find(t => !curUsed.has(t.tileId) && t.char.toLowerCase() === nextChar);
                if (nextTile) {
                    pickedTiles.push(nextTile);
                    drawDictation();
                    finishIfComplete();
                }
            });
            containerEl.querySelector('[data-dact="back"]')?.addEventListener('click', () => {
                if (locked || pickedTiles.length === 0) return;
                onTap();
                pickedTiles.pop();
                drawDictation();
            });
            containerEl.querySelectorAll('[data-dslot]').forEach(slotBtn => {
                slotBtn.onclick = () => {
                    if (locked) return;
                    const idx = Number(slotBtn.getAttribute('data-dslot'));
                    if (idx < pickedTiles.length) {
                        onTap();
                        pickedTiles.splice(idx, 1);
                        drawDictation();
                    }
                };
            });
            containerEl.querySelectorAll('[data-dtid]').forEach(tileBtn => {
                tileBtn.onclick = () => {
                    if (locked || pickedTiles.length >= q.chars.length) return;
                    const tid = tileBtn.getAttribute('data-dtid');
                    const tile = q.tiles.find(x => x.tileId === tid);
                    if (!tile || usedSet.has(tid)) return;
                    onTap();
                    pickedTiles.push(tile);
                    drawDictation();
                    finishIfComplete();
                };
            });
        };

        drawDictation();
        if (autoSpeak) speak(q.speakText, false, '');
        return;
    }

    // B. 📝 主教材必背原句听写（听读完整英文句 -> 按顺序点选全部单词）
    if (q.courseSubType === 'sight_sentence_order') {
        const chosen = [];
        let wrongCourseSen = '';
        const drawSenDictation = () => {
            const usedSet = new Set(chosen.map(c => c.carriageId));
            const trackHtml = q.expectedTokens.map((_, idx) => {
                const placed = chosen[idx];
                return `
                    <button type="button" class="qw-wo-slot ${placed ? 'filled' : ''}" data-sidx="${idx}">
                        ${placed ? placed.text : `${idx + 1}`}
                    </button>
                `;
            }).join('');

            const poolHtml = q.carriages.map(c => `
                <button type="button" class="qw-wo-chip ${usedSet.has(c.carriageId) ? 'used' : ''}" data-scid="${c.carriageId}">
                    ${c.text}
                </button>
            `).join('');

            containerEl.innerHTML = `
                <div class="qw-stage-wrap ${themeClass}">
                    <div class="qw-en-card compact qw-course-card">
                        <div class="qw-en-top">
                            <span class="qw-course-tag">${q.hint}</span>
                            <div style="display:flex;gap:4px;">
                                <button type="button" class="qw-mini-btn" data-sspeak="fast">🔊 听原句</button>
                                <button type="button" class="qw-mini-btn" data-sspeak="slow">🐢 慢读</button>
                            </div>
                        </div>
                        <div class="qw-cloze-zh">📌 必背句（含高频词 <strong>${q.targetSightWord}</strong>）：${q.sentenceZh}</div>
                        <div class="qw-wo-track">${trackHtml}</div>
                        ${wrongCourseSen ? `<div class="qw-wrong-answer-banner">${wrongCourseSen}</div>` : ''}
                    </div>
                    <div class="qw-chunk-pool">${poolHtml}</div>
                </div>
            `;

            containerEl.querySelector('[data-sspeak="fast"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                onTap();
                speak(q.speakText, false, '');
            });
            containerEl.querySelector('[data-sspeak="slow"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                onTap();
                speak(q.speakText, true, '');
            });
            containerEl.querySelectorAll('.qw-wo-slot.filled').forEach(btn => {
                btn.onclick = () => {
                    if (locked) return;
                    onTap();
                    const idx = Number(btn.getAttribute('data-sidx'));
                    chosen.splice(idx, 1);
                    drawSenDictation();
                };
            });
            containerEl.querySelectorAll('.qw-wo-chip').forEach(btn => {
                btn.onclick = () => {
                    if (locked || chosen.length >= q.expectedTokens.length) return;
                    const cid = btn.getAttribute('data-scid');
                    const obj = q.carriages.find(x => x.carriageId === cid);
                    if (!obj || usedSet.has(cid)) return;
                    onTap();
                    chosen.push(obj);
                    drawSenDictation();

                    if (chosen.length === q.expectedTokens.length) {
                        locked = true;
                        const userSen = chosen.map(x => x.text).join(' ');
                        const ok = userSen === q.expectedSentence;
                        if (!ok) {
                            wrongCourseSen = `✅ 正确原句：${q.expectedSentence}`;
                            drawSenDictation();
                        }
                        onEvaluate(ok, userSen);
                    }
                };
            });
        };

        drawSenDictation();
        if (autoSpeak) speak(q.speakText, false, '');
        return;
    }

    // C. 📖 课文阅读问答对答 (Q -> 选正确 A)
    if (q.courseSubType === 'qa_match') {
        const choicesHtml = q.choices.map(ch => `
            <button type="button" class="qw-qa-ans-btn" data-cid="${ch.id}" data-ok="${ch.isCorrect ? '1' : '0'}">
                <span class="qw-qa-prefix">A:</span>
                <span>${ch.text}</span>
            </button>
        `).join('');

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                <div class="qw-en-card compact qw-course-card">
                    <div class="qw-en-top">
                        <span class="qw-course-tag">${q.hint}</span>
                        <button type="button" class="qw-mini-btn" data-qspeak="q">🔊 听提问</button>
                    </div>
                    <div class="qw-qa-question">Q: ${q.questionEn}</div>
                    <div class="qw-cloze-zh">${q.questionZh}</div>
                </div>
                <div class="qw-qa-list">${choicesHtml}</div>
            </div>
        `;
        containerEl.querySelector('[data-qspeak="q"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            onTap();
            speak(q.questionSpeak || q.questionEn, false, '');
        });
        if (autoSpeak) speak(q.questionSpeak || q.questionEn, false, '');

        containerEl.querySelectorAll('.qw-qa-ans-btn').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                locked = true;
                onTap();
                const ok = btn.getAttribute('data-ok') === '1';
                btn.classList.add(ok ? 'correct' : 'wrong');
                if (!ok) {
                    containerEl.querySelector('.qw-qa-ans-btn[data-ok="1"]')?.classList.add('correct');
                }
                speak(q.answerEn, false, '');
                onEvaluate(ok, btn.textContent.trim());
            };
        });
        return;
    }

    // D. 🗣️ 课文答句关键词补全 (qa_cloze)
    if (q.courseSubType === 'qa_cloze') {
        const optsHtml = q.options.map(opt => `
            <button type="button" class="qw-en-opt" data-opt="${opt}">
                <span class="qw-en-opt-word">${opt}</span>
            </button>
        `).join('');

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                <div class="qw-en-card compact qw-course-card">
                    <div class="qw-en-top">
                        <span class="qw-course-tag">${q.hint}</span>
                        <button type="button" class="qw-mini-btn" data-cspeak="q">🔊 听问题</button>
                    </div>
                    <div class="qw-cloze-zh" style="font-weight:900;">Q: ${q.questionEn}</div>
                    <div class="qw-cloze-en">A: ${q.clozeSentence}</div>
                    <div class="qw-cloze-zh">${q.answerZh}</div>
                </div>
                <div class="qw-en-grid">${optsHtml}</div>
            </div>
        `;
        containerEl.querySelector('[data-cspeak="q"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            onTap();
            speak(q.questionEn, false, '');
        });
        if (autoSpeak) speak(q.questionEn, false, '');

        containerEl.querySelectorAll('.qw-en-opt').forEach(btn => {
            btn.onclick = () => {
                if (locked) return;
                locked = true;
                onTap();
                const picked = btn.getAttribute('data-opt') || '';
                const ok = picked === q.expectedOption;
                if (typeof revealEnglishChoiceFeedback === 'function') {
                    revealEnglishChoiceFeedback(btn, ok, b => b.getAttribute('data-opt') === q.expectedOption);
                } else {
                    btn.classList.add(ok ? 'correct' : 'wrong');
                }
                onEvaluate(ok, picked);
            };
        });
        return;
    }

    // E. 🎬 视频长答句三段顺序排排看 (First -> Then -> At last)
    if (q.courseSubType === 'qa_story_steps') {
        const pickedSteps = [];
        const drawSteps = () => {
            const usedIds = new Set(pickedSteps.map(s => s.stepId));
            const progressHtml = q.orderedSteps.map((_, idx) => {
                const placed = pickedSteps[idx];
                return `
                    <div class="qw-step-slot ${placed ? 'filled' : ''}" data-pidx="${idx}">
                        <span class="qw-step-num">${idx + 1}</span>
                        <span class="qw-step-txt">${placed ? placed.en : '点击下方第 ' + (idx + 1) + ' 句英文...'}</span>
                    </div>
                `;
            }).join('');

            const poolHtml = q.stepCards.map(sc => `
                <button type="button" class="qw-qa-ans-btn ${usedIds.has(sc.stepId) ? 'used' : ''}" data-stid="${sc.stepId}">
                    <span>${sc.en}</span>
                </button>
            `).join('');

            containerEl.innerHTML = `
                <div class="qw-stage-wrap ${themeClass}">
                    <div class="qw-en-card compact qw-course-card">
                        <div class="qw-en-top">
                            <span class="qw-course-tag">${q.hint}</span>
                            <button type="button" class="qw-mini-btn" data-stspeak="all">🔊 听完整段落</button>
                        </div>
                        <div class="qw-cloze-zh" style="font-weight:900;">Q: ${q.questionEn}</div>
                        <div class="qw-steps-box">${progressHtml}</div>
                    </div>
                    <div class="qw-qa-list">${poolHtml}</div>
                </div>
            `;

            containerEl.querySelector('[data-stspeak="all"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                onTap();
                speak(q.answerEn, false, '');
            });
            containerEl.querySelectorAll('.qw-step-slot.filled').forEach(slotEl => {
                slotEl.onclick = () => {
                    if (locked) return;
                    onTap();
                    const idx = Number(slotEl.getAttribute('data-pidx'));
                    pickedSteps.splice(idx, 1);
                    drawSteps();
                };
            });
            containerEl.querySelectorAll('[data-stid]').forEach(btn => {
                btn.onclick = () => {
                    if (locked || pickedSteps.length >= q.orderedSteps.length) return;
                    const stid = btn.getAttribute('data-stid');
                    const obj = q.stepCards.find(x => x.stepId === stid);
                    if (!obj || usedIds.has(stid)) return;
                    onTap();
                    speak(obj.en, false, '');
                    pickedSteps.push(obj);
                    drawSteps();

                    if (pickedSteps.length === q.orderedSteps.length) {
                        locked = true;
                        const ok = pickedSteps.every((s, idx) => s.orderIdx === idx);
                        onEvaluate(ok, pickedSteps.map(s => s.en).join(' '));
                    }
                };
            });
        };

        drawSteps();
        if (autoSpeak) speak(q.questionEn, false, '');
    }
}

/**
 * 📹 视频作业朗读跟读 & 听写词句全览打卡面板（可嵌入大厅特训舱、萌宠店长或智慧小黑板）
 */
export function renderCourseReadAloudBoard(containerEl, lesson, hooks = {}) {
    if (!containerEl || !lesson) return;
    const speak = typeof hooks.speakFn === 'function'
        ? hooks.speakFn
        : (txt, slow, ph) => sharedSpeech.speakEnglish(txt, slow, ph);
    const onTap = typeof hooks.onTapSound === 'function' ? hooks.onTapSound : () => {};
    const getChecked = typeof hooks.isChecked === 'function' ? hooks.isChecked : () => false;
    const onToggleCheck = typeof hooks.onToggleCheck === 'function' ? hooks.onToggleCheck : () => {};
    const compact = Boolean(hooks.compact);
    const themeClass = hooks.theme === 'dark' ? 'qw-theme-dark' : 'qw-theme-light';

    let storyOpen = false;

    const draw = () => {
        // 0. 若本课带有课堂学案流程图（如 S1·分级 Class Party 群视频复述作业），置顶渲染 4 格流程图教练卡！
        let retellFlowHtml = '';
        if (lesson.retellFlow && Array.isArray(lesson.retellFlow.boxes)) {
            const rf = lesson.retellFlow;
            const wbHtml = Array.isArray(rf.wordBank) && rf.wordBank.length > 0
                ? `<div class="qw-rc-wb-bar"><span>Word bank：</span>${rf.wordBank.map(w => `<button type="button" class="qw-rc-wb-pill" data-speak-en="${w.replace(/"/g, '&quot;')}">${w}</button>`).join('')}</div>`
                : '';
            const boxesHtml = rf.boxes.map((bx, idx) => {
                const fKey = `${lesson.id}_${bx.id}`;
                const fDone = getChecked(fKey);
                const arrowHtml = idx < rf.boxes.length - 1 ? '<div class="qw-rc-flow-arrow">➜</div>' : '';
                return `
                    <div class="qw-rc-flow-step-wrap">
                        <div class="qw-rc-flow-box ${fDone ? 'done' : ''}">
                            <div class="qw-rc-qrow">
                                <span class="qw-rc-flow-badge">第 ${bx.step} 格</span>
                                <button type="button" class="qw-rc-chk ${fDone ? 'checked' : ''}" data-chk="${fKey}">
                                    ${fDone ? '✅ 已熟读' : '⬜ 打卡'}
                                </button>
                            </div>
                            <div class="qw-rc-flow-en">${bx.htmlEn || bx.en}</div>
                            <div class="qw-rc-zh">${bx.zh}</div>
                            <div class="qw-rc-btns">
                                <button type="button" class="qw-rc-btn primary" data-speak-en="${bx.en.replace(/"/g, '&quot;')}">🔊 读本格</button>
                                <button type="button" class="qw-rc-btn slow" data-speak-slow="${bx.en.replace(/"/g, '&quot;')}">🐢 慢读</button>
                            </div>
                        </div>
                        ${arrowHtml}
                    </div>
                `;
            }).join('');

            retellFlowHtml = `
                <div class="qw-rc-flow-head">
                    <div class="qw-rc-sec-title" style="flex:1;">${rf.title}</div>
                    <div class="qw-rc-btns" style="margin:0;">
                        <button type="button" class="qw-rc-btn primary" data-speak-en="${(rf.fullSpeakText || '').replace(/"/g, '&quot;')}">🔊 整篇连读示范</button>
                        <button type="button" class="qw-rc-btn slow" data-speak-slow="${(rf.fullSpeakText || '').replace(/"/g, '&quot;')}">🐢 整篇慢读</button>
                    </div>
                </div>
                ${wbHtml}
                <div class="qw-rc-flow-grid">${boxesHtml}</div>
            `;
        }

        // 0B. 若本课附带分级绘本完整原文（P2–P11 双章点读 + 派对分工记录表），提供一键展开逐页点读！
        let storyReaderHtml = '';
        if (lesson.storyChapters && Array.isArray(lesson.storyChapters.chapters)) {
            const sc = lesson.storyChapters;
            const chartHtml = Array.isArray(sc.partyChart) && sc.partyChart.length > 0
                ? `<div class="qw-rc-chart-strip">
                    <span class="qw-rc-chart-lbl">📋 Class Party 分工表：</span>
                    ${sc.partyChart.map(c => `<span class="qw-rc-chart-pill"><strong>${c.name}</strong> → ${c.item}</span>`).join('')}
                   </div>`
                : '';
            const chapsHtml = sc.chapters.map(ch => `
                <div class="qw-rc-chap-block">
                    <div class="qw-rc-chap-title">📘 ${ch.title}</div>
                    <div class="qw-rc-page-list">
                        ${(ch.pages || []).map(pg => `
                            <div class="qw-rc-page-card">
                                <div class="qw-rc-qrow">
                                    <span class="qw-rc-page-num">${pg.page}</span>
                                    <div class="qw-rc-btns" style="margin:0;">
                                        <button type="button" class="qw-rc-btn primary" data-speak-en="${pg.en.replace(/"/g, '&quot;')}">🔊 点读</button>
                                        <button type="button" class="qw-rc-btn slow" data-speak-slow="${pg.en.replace(/"/g, '&quot;')}">🐢 慢读</button>
                                    </div>
                                </div>
                                <div class="qw-rc-page-en">${pg.en}</div>
                                <div class="qw-rc-zh">${pg.zh}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            storyReaderHtml = `
                <details class="qw-rc-story-details" ${storyOpen ? 'open' : ''}>
                    <summary class="qw-rc-story-summary">📚 展开《${lesson.storyTitle}》分级绘本全文点读 (P2–P11 + 黑板分工表)</summary>
                    <div class="qw-rc-story-body">
                        ${sc.meta ? `<div class="qw-rc-story-meta">💡 ${sc.meta}</div>` : ''}
                        ${chartHtml}
                        ${chapsHtml}
                    </div>
                </details>
            `;
        }

        const qaCardsHtml = (lesson.qaList || []).map(qa => {
            const checkKey = `${lesson.id}_${qa.id}`;
            const done = getChecked(checkKey);
            const subSentencesHtml = (qa.sentences && qa.sentences.length > 1)
                ? `<div class="qw-rc-substeps">${qa.sentences.map(s => `
                    <button type="button" class="qw-rc-sent-chip" data-speak-en="${s.en.replace(/"/g, '&quot;')}">
                        🔊 ${s.en}
                    </button>
                `).join('')}</div>`
                : '';

            return `
                <div class="qw-rc-item ${done ? 'done' : ''}">
                    <div class="qw-rc-qrow">
                        <span class="qw-rc-qtxt"><strong>Q${qa.index}:</strong> ${qa.q}</span>
                        <button type="button" class="qw-rc-chk ${done ? 'checked' : ''}" data-chk="${checkKey}">
                            ${done ? '✅ 已熟读' : '⬜ 打卡'}
                        </button>
                    </div>
                    <div class="qw-rc-atxt"><strong>A:</strong> ${qa.a}</div>
                    <div class="qw-rc-zh">${qa.qZh} → ${qa.aZh}</div>
                    ${subSentencesHtml}
                    <div class="qw-rc-btns">
                        <button type="button" class="qw-rc-btn" data-speak-en="${(qa.qSpeak || qa.q).replace(/"/g, '&quot;')}">🔊 读问句</button>
                        <button type="button" class="qw-rc-btn primary" data-speak-en="${qa.a.replace(/"/g, '&quot;')}">🔊 读答句</button>
                        <button type="button" class="qw-rc-btn slow" data-speak-slow="${qa.a.replace(/"/g, '&quot;')}">🐢 慢速跟读</button>
                    </div>
                </div>
            `;
        }).join('');

        const sightHtml = (lesson.sightWords || []).map(sw => `
            <div class="qw-rc-sight-card">
                <div class="qw-rc-sight-top">
                    <span class="qw-rc-sw-word">${sw.icon} ${sw.word} <small>${sw.ipa || ''}</small></span>
                    <button type="button" class="qw-rc-btn primary" data-speak-en="${`${sw.word}. ${sw.sentence}`.replace(/"/g, '&quot;')}">🔊 读词+句</button>
                </div>
                <div class="qw-rc-sight-sen">${sw.sentence}</div>
                <div class="qw-rc-zh">${sw.zh} · ${sw.sentenceZh}</div>
            </div>
        `).join('');

        const phonicsHtml = (lesson.phonicsWords || []).map(pw => `
            <button type="button" class="qw-rc-ph-chip" data-ph-word="${pw.ttsWord || pw.word}" data-ph-chunks="${pw.phonics}">
                <span class="qw-rc-ph-en">${pw.word}</span>
                <span class="qw-rc-ph-zh">${pw.icon}${pw.zh}</span>
            </button>
        `).join('');

        const qaSecTitle = lesson.qaSectionTitle || '📹 2. 视频作业：课文问答朗读跟读（点按钮跟读，熟读后打勾）';
        const sightSecTitle = lesson.sightSectionTitle || '✍️ 3. 主教材高频词与必背听写句 (Words to Know)';
        const phSecTitle = `👂 4. ${lesson.phonicsRuleTitle || '自然拼读听音写词抽查'}（点击听慢速拼读）`;

        containerEl.innerHTML = `
            <div class="qw-rc-board ${themeClass} ${compact ? 'compact' : ''}">
                ${retellFlowHtml}
                ${storyReaderHtml}
                <div class="qw-rc-sec-title">${qaSecTitle}</div>
                <div class="qw-rc-qa-list">${qaCardsHtml}</div>
                <div class="qw-rc-sec-title">${sightSecTitle}</div>
                <div class="qw-rc-sight-grid">${sightHtml}</div>
                <div class="qw-rc-sec-title">${phSecTitle}</div>
                <div class="qw-rc-ph-grid">${phonicsHtml}</div>
            </div>
        `;

        const detailsEl = containerEl.querySelector('.qw-rc-story-details');
        if (detailsEl) {
            detailsEl.addEventListener('toggle', () => {
                storyOpen = detailsEl.open;
            });
        }

        containerEl.querySelectorAll('[data-speak-en]').forEach(btn => {
            btn.onclick = () => {
                onTap();
                speak(btn.getAttribute('data-speak-en'), false, '');
            };
        });
        containerEl.querySelectorAll('[data-speak-slow]').forEach(btn => {
            btn.onclick = () => {
                onTap();
                speak(btn.getAttribute('data-speak-slow'), true, '');
            };
        });
        containerEl.querySelectorAll('[data-ph-word]').forEach(btn => {
            btn.onclick = () => {
                onTap();
                speak(btn.getAttribute('data-ph-word'), true, btn.getAttribute('data-ph-chunks') || '');
            };
        });
        containerEl.querySelectorAll('[data-chk]').forEach(btn => {
            btn.onclick = () => {
                onTap();
                onToggleCheck(btn.getAttribute('data-chk'));
                draw();
            };
        });
    };

    draw();
}

function ensureChineseWidgetStyles() {
    if (typeof document === 'undefined' || document.getElementById('cwyyChineseWidgetStyles')) return;
    const style = document.createElement('style');
    style.id = 'cwyyChineseWidgetStyles';
    style.textContent = `
        .qw-cn-card {
            border-radius: 14px;
            padding: 10px 12px;
            margin-bottom: 8px;
            text-align: center;
            background: rgba(255, 255, 255, 0.10);
            border: 1.5px solid rgba(255, 255, 255, 0.2);
        }
        .qw-theme-light .qw-cn-card {
            background: linear-gradient(180deg, #fffdf9 0%, #fff7ed 100%);
            border: 2px solid #fed7aa;
            color: #2d3436;
        }
        .qw-cn-meta-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 6px;
        }
        .qw-cn-pinyin-pill {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 10px;
            border-radius: 999px;
            background: rgba(251, 191, 36, 0.22);
            border: 1.5px solid #fbbf24;
            color: #fde68a;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.5px;
        }
        .qw-theme-light .qw-cn-pinyin-pill {
            background: #fef3c7;
            color: #b45309;
            border-color: #f59e0b;
        }
        .qw-cn-src-pill {
            display: inline-flex;
            padding: 2px 9px;
            border-radius: 999px;
            background: rgba(167, 139, 250, 0.24);
            border: 1.5px solid rgba(196, 181, 253, 0.6);
            color: #ede9fe;
            font-size: 11.5px;
            font-weight: 800;
        }
        .qw-theme-light .qw-cn-src-pill {
            background: #ede9fe;
            color: #5b21b6;
            border-color: #c4b5fd;
        }
        .qw-cn-prompt-big {
            font-size: 21px;
            font-weight: 900;
            line-height: 1.45;
            letter-spacing: 1px;
            margin: 4px 0;
        }
        .qw-cn-prompt-sentence {
            font-size: 16.5px;
            font-weight: 900;
            line-height: 1.5;
            margin: 4px 0;
        }
        .qw-cn-blank-slot {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 34px;
            height: 32px;
            padding: 0 6px;
            margin: 0 2px;
            border-radius: 8px;
            border: 2px dashed #fbbf24;
            background: rgba(251, 191, 36, 0.16);
            color: #fde047;
            font-weight: 900;
            vertical-align: middle;
        }
        .qw-theme-light .qw-cn-blank-slot {
            background: #fffbeb;
            border-color: #f59e0b;
            color: #d97706;
        }
        .qw-cn-blank-slot.filled-ok {
            border-style: solid;
            border-color: #10b981;
            background: #10b981;
            color: #ffffff;
        }
        .qw-cn-blank-slot.filled-err {
            border-style: solid;
            border-color: #ef4444;
            background: #ef4444;
            color: #ffffff;
        }
        .qw-cn-highlight {
            display: inline-block;
            padding: 0 5px;
            margin: 0 2px;
            border-radius: 7px;
            background: rgba(244, 63, 94, 0.28);
            border-bottom: 3px solid #fb7185;
            color: #ffe4e6;
            font-weight: 900;
        }
        .qw-theme-light .qw-cn-highlight {
            background: #ffe4e6;
            color: #be123c;
            border-bottom-color: #f43f5e;
        }
        .qw-cn-meaning {
            font-size: 12px;
            font-weight: 700;
            opacity: 0.9;
            margin-top: 4px;
        }
        .qw-cn-free-row {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 6px;
        }
        .qw-cn-free-input {
            flex: 1;
            min-width: 0;
            height: 40px;
            border-radius: 12px;
            border: 2.5px solid #fbbf24;
            background: #ffffff;
            color: #1e293b;
            font-size: 17px;
            font-weight: 900;
            padding: 0 12px;
            text-align: center;
            outline: none;
            font-family: inherit;
        }
        .qw-cn-free-input:focus {
            border-color: #8b5cf6;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.25);
        }
        .qw-cn-mic-btn {
            height: 40px;
            padding: 0 10px;
            border-radius: 12px;
            border: 2px solid #c084fc;
            background: linear-gradient(135deg, #f3e8ff 0%, #fae8ff 100%);
            color: #6b21a8;
            font-size: 12.5px;
            font-weight: 900;
            cursor: pointer;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .qw-cn-mic-btn.recording {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border-color: #fca5a5;
            color: #ffffff;
        }
        .qw-cn-submit-btn {
            height: 40px;
            padding: 0 15px;
            border-radius: 12px;
            border: none;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
            box-shadow: 0 3px 0 #047857;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .qw-cn-submit-btn:active {
            transform: translateY(1px);
        }
        .qw-cn-reveal-bar {
            margin-top: 6px;
            padding: 6px 10px;
            border-radius: 10px;
            font-size: 12.5px;
            font-weight: 900;
            text-align: center;
            display: none;
        }
        .qw-cn-reveal-bar.ok {
            display: block;
            background: rgba(16, 185, 129, 0.22);
            border: 1.5px solid #34d399;
            color: #a7f3d0;
        }
        .qw-theme-light .qw-cn-reveal-bar.ok {
            background: #ecfdf5;
            color: #047857;
            border-color: #6ee7b7;
        }
        .qw-cn-reveal-bar.err {
            display: block;
            background: rgba(239, 68, 68, 0.22);
            border: 1.5px solid #fca5a5;
            color: #fecaca;
        }
        .qw-theme-light .qw-cn-reveal-bar.err {
            background: #fef2f2;
            color: #b91c1c;
            border-color: #fca5a5;
        }
        .qw-cn-pair-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        .qw-cn-pair-col {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .qw-cn-bubble {
            padding: 8px 10px;
            border-radius: 12px;
            border: 2px solid rgba(255, 255, 255, 0.28);
            background: rgba(255, 255, 255, 0.13);
            color: #ffffff;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
            transition: all 0.14s ease;
        }
        .qw-theme-light .qw-cn-bubble {
            background: #ffffff;
            border-color: #cbd5e1;
            color: #1e293b;
            box-shadow: 0 2px 0 #e2e8f0;
        }
        .qw-cn-bubble.selected {
            border-color: #fbbf24;
            background: rgba(251, 191, 36, 0.32);
            transform: scale(1.02);
        }
        .qw-theme-light .qw-cn-bubble.selected {
            background: #fef3c7;
            border-color: #f59e0b;
            color: #92400e;
        }
        .qw-cn-bubble.matched {
            border-color: #10b981;
            background: rgba(16, 185, 129, 0.35);
            opacity: 0.45;
            pointer-events: none;
        }
        .qw-cn-bubble.wrong {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.35);
        }
        .qw-cn-train-slots {
            min-height: 40px;
            padding: 7px 10px;
            border-radius: 12px;
            border: 2px dashed rgba(251, 191, 36, 0.65);
            background: rgba(0, 0, 0, 0.18);
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 5px;
            margin-bottom: 8px;
        }
        .qw-theme-light .qw-cn-train-slots {
            background: #fffbeb;
            border-color: #f59e0b;
        }
        .qw-cn-tile-pool {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 6px;
        }
        .qw-cn-tile {
            padding: 6px 11px;
            border-radius: 10px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.16);
            color: #ffffff;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
        }
        .qw-theme-light .qw-cn-tile {
            background: #ffffff;
            border-color: #c4b5fd;
            color: #3b0764;
            box-shadow: 0 2px 0 #ddd6fe;
        }
        .qw-cn-tile.used {
            opacity: 0.32;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 渲染统编版小学语文 8 大题型通用组件（含小豌豆点名的无选项词语填空 & 无选项佳句默写）
 */
export function renderChineseQuizWidget(containerEl, q, hooks = {}) {
    if (!containerEl || !q) return;
    ensureChineseWidgetStyles();

    const onEvaluate = typeof hooks.onEvaluate === 'function' ? hooks.onEvaluate : () => {};
    const onTap = typeof hooks.onTapSound === 'function' ? hooks.onTapSound : () => {};
    const speakZh = typeof hooks.speakChineseFn === 'function'
        ? hooks.speakChineseFn
        : (txt) => sharedSpeech.speakChinese(txt);
    const themeClass = hooks.theme === 'light' ? 'qw-theme-light' : 'qw-theme-dark';
    const badgeTitle = hooks.badgeTitle || '📖 趣味语文闯关';

    let locked = false;
    let showTip = false;

    const topToolsHtml = `
        <div class="qw-top-tools">
            <span class="qw-mode-tag">${badgeTitle}</span>
            <div class="qw-tool-btns">
                <button type="button" class="qw-mini-btn" data-cn-read="1">🔊 读题</button>
                <button type="button" class="qw-mini-btn tip" data-cn-tip="1">💡 提示</button>
            </div>
        </div>
    `;
    const tipDrawerHtml = `
        <div class="qw-tip-drawer" data-cn-tipbox="1" style="display:none;">💡 ${q.visualTip || ''}</div>
    `;

    const bindTopTools = () => {
        const readBtn = containerEl.querySelector('[data-cn-read]');
        const tipBtn = containerEl.querySelector('[data-cn-tip]');
        const tipBox = containerEl.querySelector('[data-cn-tipbox]');
        if (readBtn) {
            readBtn.onclick = (e) => {
                e.stopPropagation();
                onTap();
                // 填空题读题时绝不读出答案，只读提示语！
                speakZh(q.promptReadText || q.readText || '');
            };
        }
        if (tipBtn && tipBox) {
            tipBtn.onclick = (e) => {
                e.stopPropagation();
                onTap();
                showTip = !showTip;
                tipBox.style.display = showTip ? 'block' : 'none';
            };
        }
    };

    // ==================== 1 & 2. 无选项自主输入：词语填空 / 课文古诗佳句默写 ====================
    if (q.mode === 'cn_word_fill' || q.mode === 'cn_sentence_fill') {
        const isSentence = q.mode === 'cn_sentence_fill';
        const formattedPrompt = String(q.promptText || '').replace(/（\s*）/g, '<span class="qw-cn-blank-slot" data-cn-slot="1">？</span>');
        const canCloudVoice = typeof window !== 'undefined' &&
            (window.location.protocol === 'https:' || window.__ENABLE_LOCAL_MAILBOX_API === true) &&
            typeof MediaRecorder !== 'undefined' &&
            navigator?.mediaDevices?.getUserMedia;

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                ${topToolsHtml}
                <div class="qw-cn-card">
                    <div class="qw-cn-meta-row">
                        ${q.sourceTitle ? `<span class="qw-cn-src-pill">${q.sourceTitle}</span>` : `<span class="qw-cn-src-pill">✍️ 无选项自主填空</span>`}
                        ${q.pinyinHint ? `<span class="qw-cn-pinyin-pill">📌 拼音：[ ${q.pinyinHint} ]</span>` : ''}
                    </div>
                    <div class="${isSentence ? 'qw-cn-prompt-sentence' : 'qw-cn-prompt-big'}">${formattedPrompt}</div>
                    ${q.meaningHint ? `<div class="qw-cn-meaning">📖 词义：${q.meaningHint}</div>` : ''}
                </div>
                <div class="qw-cn-free-row">
                    <input
                        type="text"
                        class="qw-cn-free-input"
                        data-cn-input="1"
                        maxlength="16"
                        placeholder="无选项！自己手写或拼音填字…"
                        autocomplete="off"
                        autocorrect="off"
                        spellcheck="false"
                    />
                    ${canCloudVoice ? `<button type="button" class="qw-cn-mic-btn" data-cn-mic="1" title="点击说出要填的汉字">🎙️ 语音填</button>` : ''}
                    <button type="button" class="qw-cn-submit-btn" data-cn-submit="1">确认 ✓</button>
                </div>
                <div class="qw-cn-reveal-bar" data-cn-reveal="1"></div>
                ${tipDrawerHtml}
            </div>
        `;
        bindTopTools();

        const inputEl = containerEl.querySelector('[data-cn-input]');
        const submitBtn = containerEl.querySelector('[data-cn-submit]');
        const micBtn = containerEl.querySelector('[data-cn-mic]');
        const revealBar = containerEl.querySelector('[data-cn-reveal]');

        let composing = false;
        inputEl.addEventListener('compositionstart', () => { composing = true; });
        inputEl.addEventListener('compositionend', () => { composing = false; });

        const submitFreeAnswer = () => {
            if (locked) return;
            const rawVal = inputEl.value.trim();
            if (!rawVal) {
                inputEl.focus();
                return;
            }
            locked = true;
            onTap();
            const cleaned = normalizeChineseInput(rawVal);
            const accepted = Array.isArray(q.acceptedAnswers) && q.acceptedAnswers.length > 0
                ? q.acceptedAnswers
                : [normalizeChineseInput(q.answer)];
            const ok = Boolean(cleaned && accepted.includes(cleaned));

            const slots = containerEl.querySelectorAll('[data-cn-slot]');
            const ansChars = [...String(q.answer)];
            slots.forEach((sl, idx) => {
                sl.textContent = ansChars[idx] || q.answer;
                sl.classList.add(ok ? 'filled-ok' : 'filled-err');
            });

            if (revealBar) {
                if (ok) {
                    revealBar.className = 'qw-cn-reveal-bar ok';
                    revealBar.textContent = `🎉 填写全对！${q.fullText}`;
                } else {
                    revealBar.className = 'qw-cn-reveal-bar err';
                    revealBar.textContent = `💡 正确写法是：【${q.answer}】 → ${q.fullText}`;
                }
            }
            if (q.readText) {
                speakZh(q.readText);
            }
            onEvaluate(ok, rawVal);
        };

        submitBtn.onclick = () => submitFreeAnswer();
        inputEl.addEventListener('keydown', (e) => {
            e.stopPropagation(); // 阻止冒泡触发宿主数字快捷键
            if (e.key === 'Enter' && !composing && !e.isComposing && e.keyCode !== 229) {
                e.preventDefault();
                submitFreeAnswer();
            }
        });

        // 可选语音转汉字辅助按钮
        if (micBtn) {
            let activeRec = null;
            micBtn.onclick = async () => {
                if (locked) return;
                onTap();
                if (activeRec && activeRec.state !== 'inactive') {
                    activeRec.stop();
                    return;
                }
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: true }
                    });
                    const parts = [];
                    const rec = new MediaRecorder(stream);
                    activeRec = rec;
                    micBtn.classList.add('recording');
                    micBtn.textContent = '⏹️ 说完点我';
                    rec.ondataavailable = (ev) => {
                        if (ev.data && ev.data.size > 0) parts.push(ev.data);
                    };
                    rec.onstop = async () => {
                        try { stream.getTracks().forEach(t => t.stop()); } catch (_) {}
                        micBtn.classList.remove('recording');
                        micBtn.textContent = '⏳ 识别中';
                        try {
                            const blob = new Blob(parts, { type: rec.mimeType || 'audio/webm' });
                            const res = await fetch('/api/mailbox/transcribe', {
                                method: 'POST',
                                headers: { 'Content-Type': blob.type || 'audio/webm' },
                                body: blob
                            });
                            if (res.ok) {
                                const data = await res.json();
                                if (data?.ok && data?.text) {
                                    inputEl.value = normalizeChineseInput(data.text);
                                }
                            }
                        } catch (_) {}
                        micBtn.textContent = '🎙️ 语音填';
                        activeRec = null;
                    };
                    rec.start();
                } catch (_) {
                    micBtn.textContent = '🎙️ 语音填';
                }
            };
        }
        return;
    }

    // ==================== 6. ⚖️ 量词与近反义词气泡配对消消乐 ====================
    if (q.mode === 'cn_measure_antonym') {
        let selectedSide = null; // 'left' | 'right'
        let selectedBtn = null;
        let matchedCount = 0;
        let wrongCount = 0;
        const totalPairs = q.pairs.length;

        containerEl.innerHTML = `
            <div class="qw-stage-wrap ${themeClass}">
                ${topToolsHtml}
                <div class="qw-cn-card" style="padding:7px 10px;">
                    <div class="qw-cn-meaning" style="margin:0;font-weight:900;">🫧 ${q.subLabel}（点左再点右配对消除）</div>
                </div>
                <div class="qw-cn-pair-grid">
                    <div class="qw-cn-pair-col">
                        ${q.leftItems.map(it => `<button type="button" class="qw-cn-bubble" data-side="left" data-pid="${it.pairId}">${it.text}</button>`).join('')}
                    </div>
                    <div class="qw-cn-pair-col">
                        ${q.rightItems.map(it => `<button type="button" class="qw-cn-bubble" data-side="right" data-pid="${it.pairId}">${it.text}</button>`).join('')}
                    </div>
                </div>
                ${tipDrawerHtml}
            </div>
        `;
        bindTopTools();

        containerEl.querySelectorAll('.qw-cn-bubble').forEach(btn => {
            btn.onclick = () => {
                if (locked || btn.classList.contains('matched')) return;
                onTap();
                const side = btn.getAttribute('data-side');
                const pid = btn.getAttribute('data-pid');

                if (!selectedBtn || selectedSide === side) {
                    containerEl.querySelectorAll('.qw-cn-bubble.selected').forEach(b => b.classList.remove('selected'));
                    selectedSide = side;
                    selectedBtn = btn;
                    btn.classList.add('selected');
                    return;
                }

                const firstPid = selectedBtn.getAttribute('data-pid');
                const prevBtn = selectedBtn;
                selectedBtn = null;
                selectedSide = null;
                prevBtn.classList.remove('selected');

                if (firstPid === pid) {
                    prevBtn.classList.add('matched');
                    btn.classList.add('matched');
                    matchedCount += 1;
                    if (matchedCount >= totalPairs) {
                        locked = true;
                        onEvaluate(true, q.answer);
                    }
                } else {
                    wrongCount += 1;
                    prevBtn.classList.add('wrong');
                    btn.classList.add('wrong');
                    setTimeout(() => {
                        prevBtn.classList.remove('wrong');
                        btn.classList.remove('wrong');
                    }, 420);
                    if (wrongCount >= 2) {
                        locked = true;
                        onEvaluate(false, '配对失误');
                    }
                }
            };
        });
        return;
    }

    // ==================== 7. 🚂 连词成句与标点小卫士 ====================
    if (q.mode === 'cn_sentence_order') {
        const pickedIndices = [];

        const drawOrderStage = () => {
            const pickedTextHtml = pickedIndices.length === 0
                ? `<span style="opacity:0.65;font-size:12.5px;font-weight:700;">👇 按顺序点击下方词块排成通顺句子（含标点）</span>`
                : pickedIndices.map((tilePos, orderIdx) => {
                    const tileObj = q.shuffledTiles[tilePos];
                    return `<button type="button" class="qw-cn-tile" data-remove-pos="${orderIdx}">${tileObj.text}</button>`;
                }).join('');

            const poolHtml = q.shuffledTiles.map((tile, pos) => {
                const isUsed = pickedIndices.includes(pos);
                return `<button type="button" class="qw-cn-tile ${isUsed ? 'used' : ''}" data-pick-pos="${pos}">${tile.text}</button>`;
            }).join('');

            containerEl.innerHTML = `
                <div class="qw-stage-wrap ${themeClass}">
                    ${topToolsHtml}
                    <div class="qw-cn-train-slots">${pickedTextHtml}</div>
                    <div class="qw-cn-tile-pool">${poolHtml}</div>
                    ${pickedIndices.length > 0 ? `<div style="text-align:right;margin-top:6px;"><button type="button" class="qw-mini-btn" data-cn-reset="1">🔄 清空重排</button></div>` : ''}
                    <div class="qw-cn-reveal-bar" data-cn-reveal="1"></div>
                    ${tipDrawerHtml}
                </div>
            `;
            bindTopTools();

            containerEl.querySelectorAll('[data-pick-pos]').forEach(btn => {
                btn.onclick = () => {
                    if (locked) return;
                    onTap();
                    const pos = Number(btn.getAttribute('data-pick-pos'));
                    if (pickedIndices.includes(pos)) return;
                    pickedIndices.push(pos);
                    drawOrderStage();

                    if (pickedIndices.length === q.shuffledTiles.length) {
                        locked = true;
                        const built = pickedIndices.map(p => q.shuffledTiles[p].text).join('');
                        const ok = built === q.answer;
                        const rev = containerEl.querySelector('[data-cn-reveal]');
                        if (rev) {
                            rev.className = `qw-cn-reveal-bar ${ok ? 'ok' : 'err'}`;
                            rev.textContent = ok ? `🎉 排句完美：${q.answer}` : `💡 正确语序：${q.answer}`;
                        }
                        speakZh(q.answer);
                        onEvaluate(ok, built);
                    }
                };
            });

            containerEl.querySelectorAll('[data-remove-pos]').forEach(btn => {
                btn.onclick = () => {
                    if (locked) return;
                    onTap();
                    const rIdx = Number(btn.getAttribute('data-remove-pos'));
                    pickedIndices.splice(rIdx, 1);
                    drawOrderStage();
                };
            });

            const resetBtn = containerEl.querySelector('[data-cn-reset]');
            if (resetBtn) {
                resetBtn.onclick = () => {
                    if (locked) return;
                    onTap();
                    pickedIndices.length = 0;
                    drawOrderStage();
                };
            }
        };

        drawOrderStage();
        return;
    }

    // ==================== 3 / 4 / 5 / 8. 拼音辨析 / 多音字 / 形近字 / 古诗接龙 ====================
    let cardBodyHtml = '';
    if (q.mode === 'cn_pinyin_tone' || q.mode === 'cn_polyphone') {
        const highlighted = String(q.promptText || '').replace(/【([^】]+)】/g, '<span class="qw-cn-highlight">$1</span>');
        const subCaption = q.mode === 'cn_polyphone'
            ? `请结合句子意思，选出加点字「${q.targetChar}」的正确读音：`
            : `请选出加点字「${q.targetChar}」完全正确的拼音：`;
        cardBodyHtml = `
            <div class="qw-cn-card">
                <div class="${q.mode === 'cn_polyphone' ? 'qw-cn-prompt-sentence' : 'qw-cn-prompt-big'}">${highlighted}</div>
                <div class="qw-cn-meaning">${subCaption}</div>
            </div>
        `;
    } else if (q.mode === 'cn_confusable') {
        const highlighted = String(q.promptText || '').replace(/（\s*）/g, '<span class="qw-cn-blank-slot">？</span>');
        cardBodyHtml = `
            <div class="qw-cn-card">
                <div class="qw-cn-prompt-sentence">${highlighted}</div>
                <div class="qw-cn-meaning">火眼金睛辨一辨，括号里应该选哪个字？</div>
            </div>
        `;
    } else {
        // cn_poem_match
        cardBodyHtml = `
            <div class="qw-cn-card">
                <div class="qw-cn-meta-row">
                    <span class="qw-cn-src-pill">${q.poemTitle || '必背古诗名句'}</span>
                </div>
                <div class="qw-cn-prompt-sentence">${q.promptText}</div>
                <div class="qw-cn-meaning">${q.promptLabel || '请选出配对的诗句：'}</div>
            </div>
        `;
    }

    const opts = q.options || [];
    const gridColsClass = opts.length === 2 ? 'cols-2' : (opts.length === 3 ? (q.mode === 'cn_poem_match' ? 'cols-1' : 'cols-3') : 'cols-2');
    const choicesHtml = opts.map(opt => `
        <button type="button" class="qw-choice-btn" data-val="${String(opt).replace(/"/g, '&quot;')}" style="${q.mode === 'cn_poem_match' ? 'font-size:14.5px;padding:9px 12px;' : 'font-size:17px;'}">
            ${opt}
        </button>
    `).join('');

    containerEl.innerHTML = `
        <div class="qw-stage-wrap ${themeClass}">
            ${topToolsHtml}
            ${cardBodyHtml}
            <div class="qw-choice-row ${gridColsClass}" style="${q.mode === 'cn_poem_match' ? 'display:flex;flex-direction:column;gap:6px;' : ''}">
                ${choicesHtml}
            </div>
            ${tipDrawerHtml}
        </div>
    `;
    bindTopTools();

    containerEl.querySelectorAll('.qw-choice-btn').forEach(btn => {
        btn.onclick = () => {
            if (locked) return;
            locked = true;
            onTap();
            const val = btn.getAttribute('data-val');
            const ok = val === q.answer;
            btn.classList.add(ok ? 'correct' : 'wrong');
            if (!ok) {
                containerEl.querySelectorAll('.qw-choice-btn').forEach(b => {
                    if (b.getAttribute('data-val') === q.answer) b.classList.add('correct');
                });
                const tipBox = containerEl.querySelector('[data-cn-tipbox]');
                if (tipBox) tipBox.style.display = 'block';
            }
            if (q.readText) {
                speakZh(q.readText);
            }
            onEvaluate(ok, val);
        };
    });
}
