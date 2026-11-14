/**
 * shared/questionWidgets.js - 全平台共享【数学6大新互动题型 + 英语8大互动题型 + 题型多选配置器】组件库
 * 同时服务于：
 * - SmartChalkboard (/carrot/ 保卫兔蛙、/pvz/ 植物大战僵尸)
 * - PetWonderTownApp (/pet/ 奇妙萌宠店长)
 * - PortalHubApp (/ 游戏大厅题型配置)
 */
import { sharedSpeech } from './audioTTS.js';
import { EnglishEngine } from './englishEngine.js';

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

            const guideHtml = w.phonics
                ? (showPhonicsHint
                    ? `<span class="qw-phonics-guide-pill" title="自然拼读提示">${EnglishEngine.renderPhonicsHtml(w.phonics)}</span>`
                    : `<button type="button" class="qw-mini-btn tip" data-ph-hint="1">💡 拼读提示</button>`)
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
                                <button type="button" class="qw-mini-btn hint-letter" data-dact="hint" ${locked || pickedTiles.length >= q.chars.length ? 'disabled' : ''}>💡 提示1字母</button>
                                <button type="button" class="qw-mini-btn" data-dact="back" ${pickedTiles.length === 0 || locked ? 'disabled' : ''}>⌫ 退格</button>
                            </div>
                        </div>
                        <div class="qw-en-voice-row compact">
                            <button type="button" class="qw-voice-btn primary" data-dspeak="fast">${isSight ? '🔊 听词与原句' : '🔊 听词发音'}</button>
                            <button type="button" class="qw-voice-btn slow" data-dspeak="slow">🐢 慢速拼读</button>
                        </div>
                        ${contextHtml}
                        <div class="smart-spell-slots">${slotsHtml}</div>
                        ${revealAnswer ? `<div class="qw-course-reveal">${revealAnswer}</div>` : ''}
                    </div>
                    <div class="smart-spell-tiles">${tilesHtml}</div>
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
                if (locked || pickedTiles.length >= q.chars.length) return;
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
                        <button type="button" class="qw-mini-btn" data-cspeak="ans">💡 听答句提示</button>
                    </div>
                    <div class="qw-cloze-zh" style="font-weight:900;">Q: ${q.questionEn}</div>
                    <div class="qw-cloze-en">A: ${q.clozeSentence}</div>
                    <div class="qw-cloze-zh">${q.answerZh}</div>
                </div>
                <div class="qw-en-grid">${optsHtml}</div>
            </div>
        `;
        containerEl.querySelector('[data-cspeak="ans"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            onTap();
            speak(q.answerEn, false, '');
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

    const draw = () => {
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

        containerEl.innerHTML = `
            <div class="qw-rc-board ${themeClass} ${compact ? 'compact' : ''}">
                <div class="qw-rc-sec-title">📹 2. 视频作业：课文问答朗读跟读（点按钮跟读，熟读后打勾）</div>
                <div class="qw-rc-qa-list">${qaCardsHtml}</div>
                <div class="qw-rc-sec-title">✍️ 3. 主教材高频词与必背听写句 (Words to Know)</div>
                <div class="qw-rc-sight-grid">${sightHtml}</div>
                <div class="qw-rc-sec-title">👂 4. ${lesson.phonicsRuleTitle || '自然拼读听音写词抽查'}（点击听慢速拼读）</div>
                <div class="qw-rc-ph-grid">${phonicsHtml}</div>
            </div>
        `;

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
