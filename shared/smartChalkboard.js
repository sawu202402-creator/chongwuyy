/**
 * shared/smartChalkboard.js - 保卫兔蛙(/carrot/) 与 植物大战僵尸(/pvz/) 通用多学科智慧小黑板控制器
 * 支持：⚡ 心算口算 | 📖 乘除与两步应用题 | 📊 数据统计图表 | 🔤 少儿英语（闪电闯关 + 5词背诵营）
 * 并实时打通【小豌豆 / 川川】全局萌宠徽章、每日30枚防沉迷上限、盲盒券与错题/生词本！
 */
import { WORD_PACKS, EnglishEngine, englishEngine } from './englishEngine.js';
import { sharedSpeech } from './audioTTS.js';

export class SmartChalkboard {
    /**
     * @param {Object} opts
     * @param {'carrot'|'pvz'} opts.hostType - 宿主游戏类型
     * @param {import('./mathEngine.js').MathEngine} opts.mathEngine - 共享数学引擎实例
     * @param {import('./unifiedProfile.js').UserProfileManager} opts.profileManager - 统一档案实例
     * @param {(battleRes: any, meta: { isEnglish: boolean, wordObj?: any, isCampFinish?: boolean, badgeSuffix?: string }) => void} opts.onEnglishBattleResult - 英语答题触发宿主战场奖励回调
     * @param {() => void} [opts.onSoundResume] - 唤醒 WebAudio 回调
     */
    constructor(opts) {
        this.hostType = opts.hostType || 'carrot';
        this.mathEngine = opts.mathEngine;
        this.profileManager = opts.profileManager;
        this.onEnglishBattleResult = opts.onEnglishBattleResult || (() => {});
        this.onSoundResume = opts.onSoundResume || (() => {});

        this.mode = 'calc'; // 'calc' | 'word' | 'data' | 'english'
        this.enSubMode = 'quiz'; // 'quiz' | 'vocab'
        this.selectedPackId = 'all';
        this.showVisualTip = false;
        this.spellSlotsState = []; // 拼写题已填槽位 [{ idx, char, tileId }]
        this._enLock = false;

        this.mountDOM();
        this.syncFromActiveProfile();
    }

    mountDOM() {
        this.cardEl = document.querySelector('.chalkboard-card');
        this.bbInnerEl = this.cardEl ? this.cardEl.querySelector('.blackboard-inner') : null;
        this.hintEl = document.getElementById('questionHint');
        this.formulaEl = document.getElementById('questionFormula');
        this.answerBoxEl = this.cardEl ? this.cardEl.querySelector('.bb-answer-box') : null;
        this.answerInputEl = document.getElementById('answerInput');
        this.submitBtnEl = document.getElementById('btnSubmitAnswer');
        this.feedbackEl = document.getElementById('feedbackMsg');
        this.keypadEl = document.getElementById('virtualKeypad');

        // 1. 顶部原木横梁注入【🏠 大厅】与【🏅 萌宠徽章 · 今日进度】胶囊
        const hudLeft = document.querySelector('.hud-left-group');
        if (hudLeft && !document.getElementById('portalHubBtn')) {
            const hubLink = document.createElement('a');
            hubLink.id = 'portalHubBtn';
            hubLink.href = '../index.html';
            hubLink.className = 'portal-hub-btn';
            hubLink.title = '返回三合一数英游乐园大厅（切换萌宠店长 / 兔蛙塔防 / 植物大战僵尸）';
            hubLink.innerHTML = '<span>🏠</span><span>大厅</span>';
            hudLeft.insertBefore(hubLink, hudLeft.firstChild);

            const petPill = document.createElement('a');
            petPill.id = 'portalPetBadgePill';
            petPill.href = '../pet/index.html';
            petPill.className = 'portal-pet-badge-pill';
            petPill.title = '点击前往《奇妙萌宠店长》用徽章投喂兔兔和小青蛙！';
            hudLeft.appendChild(petPill);
            this.petBadgePillEl = petPill;
        } else {
            this.petBadgePillEl = document.getElementById('portalPetBadgePill');
        }

        if (!this.cardEl || !this.bbInnerEl) return;

        // 2. 在小黑板上方注入 4 学科切换条 [⚡ 口算 | 📖 应用 | 📊 图表 | 🔤 英语]
        const tabsWrap = document.createElement('div');
        tabsWrap.className = 'smart-mode-tabs';
        tabsWrap.id = 'smartModeTabs';
        tabsWrap.innerHTML = `
            <button type="button" class="smart-mode-tab active" data-smode="calc">⚡ 口算</button>
            <button type="button" class="smart-mode-tab" data-smode="word">📖 应用</button>
            <button type="button" class="smart-mode-tab" data-smode="data">📊 图表</button>
            <button type="button" class="smart-mode-tab" data-smode="english">🔤 英语</button>
        `;
        this.cardEl.insertBefore(tabsWrap, this.bbInnerEl);
        this.tabsWrap = tabsWrap;

        tabsWrap.addEventListener('click', (e) => {
            const btn = e.target.closest('.smart-mode-tab');
            if (!btn) return;
            this.onSoundResume();
            const targetMode = btn.getAttribute('data-smode');
            this.switchMode(targetMode);
        });

        // 3. 在答案框中注入应用题/图表题单位徽章
        if (this.answerBoxEl && this.submitBtnEl && !document.getElementById('smartUnitBadge')) {
            const unitEl = document.createElement('span');
            unitEl.id = 'smartUnitBadge';
            unitEl.className = 'smart-unit-badge';
            unitEl.style.display = 'none';
            this.answerBoxEl.insertBefore(unitEl, this.submitBtnEl);
            this.unitBadgeEl = unitEl;
        }

        // 4. 注入少儿英语（闪电闯关 + 5词背诵营）面板
        const enPanel = document.createElement('div');
        enPanel.className = 'smart-english-panel';
        enPanel.id = 'smartEnglishPanel';

        const packOptionsHtml = [
            `<option value="all">📚 全部词库 (${WORD_PACKS.reduce((s, p) => s + p.words.length, 0)})</option>`,
            ...WORD_PACKS.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`)
        ].join('');

        enPanel.innerHTML = `
            <div class="smart-en-top-row">
                <div class="smart-en-subtabs">
                    <button type="button" class="smart-en-subbtn active" data-ensub="quiz">🎯 闪电闯关</button>
                    <button type="button" class="smart-en-subbtn" data-ensub="vocab">📖 背单词</button>
                </div>
                <select class="smart-en-pack-select" id="smartEnPackSelect" title="选择英语主题词包">
                    ${packOptionsHtml}
                </select>
            </div>
            <div id="smartEnStage"></div>
        `;

        this.bbInnerEl.insertAdjacentElement('afterend', enPanel);
        this.enPanelEl = enPanel;
        this.enStageEl = enPanel.querySelector('#smartEnStage');
        this.enPackSelectEl = enPanel.querySelector('#smartEnPackSelect');

        enPanel.querySelector('.smart-en-subtabs').addEventListener('click', (e) => {
            const subBtn = e.target.closest('.smart-en-subbtn');
            if (!subBtn) return;
            this.onSoundResume();
            const sub = subBtn.getAttribute('data-ensub');
            this.switchEnglishSubMode(sub);
        });

        this.enPackSelectEl.addEventListener('change', () => {
            this.selectedPackId = this.enPackSelectEl.value;
            englishEngine.setConfig({ packId: this.selectedPackId });
            const active = this.profileManager.getActiveUser();
            if (active) {
                this.profileManager.updateUserSettings(active.id, {
                    englishConfig: { ...(active.englishConfig || {}), packId: this.selectedPackId }
                });
            }
            if (this.enSubMode === 'vocab') {
                const packForCamp = this.selectedPackId === 'all' ? 'pack_animals' : this.selectedPackId;
                englishEngine.startVocabStudySession(packForCamp, active?.wordMastery || {});
            } else {
                englishEngine.nextQuickQuestion();
            }
            this.renderEnglishStage(true);
        });
    }

    syncFromActiveProfile() {
        const user = this.profileManager.getActiveUser();
        if (!user) return;
        const enCfg = user.englishConfig || { level: 'level2_match', packId: 'all' };
        this.selectedPackId = enCfg.packId || 'all';
        englishEngine.setConfig({
            level: enCfg.level || 'level2_match',
            packId: this.selectedPackId
        });
        if (this.enPackSelectEl) {
            this.enPackSelectEl.value = this.selectedPackId;
        }
        this.updateTopBadgePill();
    }

    updateTopBadgePill() {
        if (!this.petBadgePillEl) return;
        const u = this.profileManager.getActiveUser();
        if (!u) return;
        const ds = this.profileManager.getDailyStatus(u);
        this.petBadgePillEl.classList.toggle('is-capped', ds.isCapped);
        if (ds.isCapped) {
            this.petBadgePillEl.innerHTML = `<span>🏅 ${u.badges}</span><span>· 今日已满(${ds.cap})</span>`;
            this.petBadgePillEl.title = `${u.name}今日已拿满 ${ds.cap} 枚徽章！点击去《萌宠店长》投喂宠物或升级店铺吧！`;
        } else {
            this.petBadgePillEl.innerHTML = `<span>🏅 ${u.badges}</span><span>· 今日 ${ds.earned}/${ds.cap}</span>`;
            this.petBadgePillEl.title = `${u.name}当前可用 ${u.badges} 枚萌宠徽章（今日已获 ${ds.earned}/${ds.cap} 枚，攒星 ${ds.starProgress}/3），点击前往萌宠小镇！`;
        }
    }

    isEnglishActive() {
        return this.mode === 'english';
    }

    switchMode(newMode) {
        if (!['calc', 'word', 'data', 'english'].includes(newMode)) return;
        this.mode = newMode;
        this.showVisualTip = false;

        if (this.tabsWrap) {
            this.tabsWrap.querySelectorAll('.smart-mode-tab').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-smode') === newMode);
            });
        }

        if (this.cardEl) {
            this.cardEl.classList.toggle('compact-rich-mode', newMode !== 'calc');
        }

        if (newMode === 'english') {
            if (this.bbInnerEl) this.bbInnerEl.style.display = 'none';
            if (this.answerBoxEl) this.answerBoxEl.style.display = 'none';
            if (this.keypadEl) this.keypadEl.style.display = 'none';
            if (this.enPanelEl) this.enPanelEl.classList.add('active');

            if (this.enSubMode === 'vocab') {
                if (!englishEngine.studySession) {
                    const u = this.profileManager.getActiveUser();
                    const packForCamp = this.selectedPackId === 'all' ? 'pack_animals' : this.selectedPackId;
                    englishEngine.startVocabStudySession(packForCamp, u?.wordMastery || {});
                }
            } else if (!englishEngine.currentQuiz) {
                englishEngine.nextQuickQuestion();
            }
            this.renderEnglishStage(true);
            return;
        }

        // 数学三模式 (calc / word / data)
        if (this.enPanelEl) this.enPanelEl.classList.remove('active');
        if (this.bbInnerEl) this.bbInnerEl.style.display = '';
        if (this.answerBoxEl) this.answerBoxEl.style.display = '';
        if (this.keypadEl) this.keypadEl.style.display = '';

        this.mathEngine.setCategoryFilter(newMode);
        const curQ = this.mathEngine.currentQuestion;
        if (!curQ || curQ.kind !== newMode || curQ.isShieldNuke) {
            this.mathEngine.nextQuestion();
        }
        this.renderMathQuestion();
    }

    switchEnglishSubMode(subMode) {
        this.enSubMode = subMode === 'vocab' ? 'vocab' : 'quiz';
        if (this.enPanelEl) {
            this.enPanelEl.querySelectorAll('.smart-en-subbtn').forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-ensub') === this.enSubMode);
            });
        }
        const u = this.profileManager.getActiveUser();
        if (this.enSubMode === 'vocab') {
            const packForCamp = this.selectedPackId === 'all' ? 'pack_animals' : this.selectedPackId;
            englishEngine.startVocabStudySession(packForCamp, u?.wordMastery || {});
        } else {
            englishEngine.nextQuickQuestion();
        }
        this.renderEnglishStage(true);
    }

    /**
     * 当宿主游戏外部刷新小黑板（例如点击了数盾怪兽加载专属算式，或答完一题后刷新）时调用
     */
    renderMathQuestion() {
        const q = this.mathEngine.currentQuestion;
        if (!q) return;

        // 若玩家在战场上点击了数盾怪兽，强制切回 ⚡ 口算 视图展示破盾算式
        if ((q.isShieldNuke || q.isShieldTarget) && this.mode !== 'calc') {
            this.mode = 'calc';
            if (this.tabsWrap) {
                this.tabsWrap.querySelectorAll('.smart-mode-tab').forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-smode') === 'calc');
                });
            }
            if (this.enPanelEl) this.enPanelEl.classList.remove('active');
            if (this.bbInnerEl) this.bbInnerEl.style.display = '';
            if (this.answerBoxEl) this.answerBoxEl.style.display = '';
            if (this.keypadEl) this.keypadEl.style.display = '';
            if (this.cardEl) this.cardEl.classList.remove('compact-rich-mode');
        }

        if (this.mode === 'english') {
            this.renderEnglishStage(false);
            return;
        }

        this.showVisualTip = false;
        if (this.answerInputEl) {
            this.answerInputEl.value = '';
        }

        if (!this.formulaEl || !this.hintEl) return;

        if (q.kind === 'word') {
            this.hintEl.style.display = 'none';
            this.formulaEl.style.fontSize = '14px';
            this.formulaEl.style.fontWeight = '700';
            if (this.unitBadgeEl) {
                this.unitBadgeEl.style.display = q.unitLabel ? 'inline-flex' : 'none';
                this.unitBadgeEl.textContent = q.unitLabel || '';
            }
            this._renderWordProblemHtml(q);
        } else if (q.kind === 'data') {
            this.hintEl.style.display = 'none';
            this.formulaEl.style.fontSize = '13px';
            this.formulaEl.style.fontWeight = '700';
            if (this.unitBadgeEl) {
                this.unitBadgeEl.style.display = q.unitLabel ? 'inline-flex' : 'none';
                this.unitBadgeEl.textContent = q.unitLabel || '';
            }
            this._renderDataChartHtml(q);
        } else {
            this.hintEl.style.display = '';
            this.formulaEl.style.fontSize = '';
            this.formulaEl.style.fontWeight = '';
            if (this.unitBadgeEl) {
                this.unitBadgeEl.style.display = 'none';
            }
            const label = this.hostType === 'carrot' ? (q.expr || q.formula) : (q.formula || q.expr);
            this.formulaEl.textContent = label;
            this.hintEl.textContent = q.hint ? (q.hint.startsWith('🎯') || q.hint.startsWith('⚡') ? q.hint : `🎯 ${q.hint}`) : '🎯 口算速算挑战';
        }
    }

    _renderWordProblemHtml(q) {
        const rewardHint = this.hostType === 'carrot' ? '答对得1.5倍金币+1🏅' : '答对掉75☀️破盾+1🏅';
        this.formulaEl.innerHTML = `
            <div class="smart-bb-toolbar">
                <span class="smart-bb-tag">${q.hint || '📖 乘除应用题'} (${rewardHint})</span>
                <div class="smart-bb-actions">
                    <button type="button" class="smart-mini-btn" id="btnSmartReadZh">🔊 读题</button>
                    <button type="button" class="smart-mini-btn" id="btnSmartShowTip">💡 图解</button>
                </div>
            </div>
            <div class="smart-word-story">${q.storyHtml}</div>
            <div class="smart-visual-tip" id="smartVisualTipBox" style="display:none;">${q.visualTip || ''}</div>
        `;
        const btnRead = this.formulaEl.querySelector('#btnSmartReadZh');
        const btnTip = this.formulaEl.querySelector('#btnSmartShowTip');
        const tipBox = this.formulaEl.querySelector('#smartVisualTipBox');
        if (btnRead) {
            btnRead.addEventListener('click', (e) => {
                e.stopPropagation();
                sharedSpeech.speakChinese(q.readText || q.storyHtml);
            });
        }
        if (btnTip && tipBox) {
            btnTip.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showVisualTip = !this.showVisualTip;
                tipBox.style.display = this.showVisualTip ? 'block' : 'none';
            });
        }
    }

    _renderDataChartHtml(q) {
        const chart = q.chartData || q.chart || { title: '数据统计图', maxScale: 20, bars: [] };
        const maxVal = Math.max(1, chart.maxScale || 20);
        const rowsHtml = (chart.bars || []).map(b => {
            const pct = Math.min(100, Math.max(10, Math.round((b.value / maxVal) * 100)));
            const labelTxt = b.name || b.label || '';
            return `
                <div class="smart-chart-row">
                    <span class="smart-chart-label">${b.icon || ''} ${labelTxt}</span>
                    <div class="smart-chart-track">
                        <div class="smart-chart-fill" style="width:${pct}%; background:${b.color || '#54a0ff'};"></div>
                    </div>
                    <span class="smart-chart-val">${b.value}</span>
                </div>
            `;
        }).join('');

        const qHtml = q.questionText || q.questionHtml || '';
        this.formulaEl.innerHTML = `
            <div class="smart-bb-toolbar">
                <span class="smart-bb-tag">${q.hint || '📊 数据图表题'}</span>
                <div class="smart-bb-actions">
                    <button type="button" class="smart-mini-btn" id="btnSmartReadZh">🔊 读题</button>
                    <button type="button" class="smart-mini-btn" id="btnSmartShowTip">💡 提示</button>
                </div>
            </div>
            <div class="smart-chart-box">
                <div class="smart-chart-title">${chart.title}（单位：${q.unitLabel || '份'}）</div>
                ${rowsHtml}
                <div class="smart-chart-q">${qHtml}</div>
            </div>
            <div class="smart-visual-tip" id="smartVisualTipBox" style="display:none;">${q.visualTip || ''}</div>
        `;
        const btnRead = this.formulaEl.querySelector('#btnSmartReadZh');
        const btnTip = this.formulaEl.querySelector('#btnSmartShowTip');
        const tipBox = this.formulaEl.querySelector('#smartVisualTipBox');
        if (btnRead) {
            btnRead.addEventListener('click', (e) => {
                e.stopPropagation();
                sharedSpeech.speakChinese(q.readText || qHtml);
            });
        }
        if (btnTip && tipBox) {
            btnTip.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showVisualTip = !this.showVisualTip;
                tipBox.style.display = this.showVisualTip ? 'block' : 'none';
            });
        }
    }

    /**
     * 将宿主游戏（保卫兔蛙 / 植物大战僵尸）的数学作答结果同步写入统一徽章系统与错题本
     * @returns {string} 附加在反馈区的徽章奖励提示后缀
     */
    recordMathProgress(res) {
        const isCorrect = Boolean(res && (res.correct || res.isCorrect));
        const q = (res && res.question) || this.mathEngine.currentQuestion;

        if (isCorrect) {
            if (q && q.isReview) {
                this.profileManager.resolveMathMistake(q);
            }
            const gameTag = this.hostType === 'carrot' ? '兔蛙塔防' : '植物战僵尸';
            const kindTag = q?.kind === 'word' ? '应用题' : (q?.kind === 'data' ? '数据图' : '心算');
            const prog = this.profileManager.awardLearningProgress({
                title: `⚔️ [${gameTag}·${kindTag}] 答对 ${q?.expr || q?.formula || '算式'}`,
                subjectTag: `${gameTag}·${kindTag}`,
                badges: res.badgeEarned || 0,
                stars: res.starEarned || 0,
                gotTicket: Boolean(res.gotGachaTicket),
                combo: res.combo || 0,
                isMath: true
            });
            this.updateTopBadgePill();
            if (prog.actualBadges > 0) {
                return ` · 🏅+${prog.actualBadges}徽章`;
            }
            if (prog.alreadyAtCap) {
                return ' · 今日徽章已满';
            }
            return ` · ⭐攒星${prog.starProgress}/3`;
        } else {
            if (q) {
                this.profileManager.recordMathMistake(q, res?.userAns);
            }
            return '';
        }
    }

    // ==================== 少儿英语渲染与交互闭环 ====================

    renderEnglishStage(autoSpeak = false) {
        if (!this.enStageEl) return;
        this._enLock = false;

        if (this.enSubMode === 'vocab') {
            const sess = englishEngine.studySession;
            if (!sess) {
                const u = this.profileManager.getActiveUser();
                const packForCamp = this.selectedPackId === 'all' ? 'pack_animals' : this.selectedPackId;
                englishEngine.startVocabStudySession(packForCamp, u?.wordMastery || {});
            }
            const curSess = englishEngine.studySession;
            if (curSess.phase === 'study') {
                this._renderVocabStudyCard(curSess, autoSpeak);
            } else {
                const q = curSess.quizQueue[curSess.quizIdx];
                this._renderEnglishQuizCard(q, autoSpeak, `🔥 背词检验 (${curSess.quizIdx + 1}/${curSess.quizQueue.length})`);
            }
        } else {
            if (!englishEngine.currentQuiz) {
                englishEngine.nextQuickQuestion();
            }
            this._renderEnglishQuizCard(englishEngine.currentQuiz, autoSpeak, '⚡ 英语闪电闯关');
        }
    }

    _renderVocabStudyCard(sess, autoSpeak) {
        const w = sess.words[sess.studyIdx];
        const isLast = sess.studyIdx >= sess.words.length - 1;
        const phonicsHtml = EnglishEngine.renderPhonicsHtml(w.phonics);

        this.enStageEl.innerHTML = `
            <div class="smart-en-card">
                <div class="smart-en-progress">${sess.packIcon} ${sess.packName} · 记单词 (${sess.studyIdx + 1}/${sess.words.length})</div>
                <div class="smart-en-emoji">${w.icon}</div>
                <div class="smart-en-word">${w.word}</div>
                <div class="smart-en-phonics">${phonicsHtml}</div>
                <div class="smart-en-zh">${w.zh}</div>
                <div class="smart-en-sentence">${w.sentence}（${w.sentenceZh}）</div>
                <div class="smart-en-audio-row">
                    <button type="button" class="smart-mini-btn" id="btnEnSpeakNormal">🔊 发音</button>
                    <button type="button" class="smart-mini-btn" id="btnEnSpeakSlow">🐢 慢读拼读</button>
                </div>
            </div>
            <div class="smart-en-nav-row" style="margin-top:6px;">
                ${sess.studyIdx > 0 ? '<button type="button" class="smart-en-secondary-btn" id="btnEnPrevWord">⬅ 上一个</button>' : ''}
                <button type="button" class="smart-en-primary-btn" id="btnEnNextWord">
                    ${isLast ? '记熟啦！开始闯关领大奖 🚀' : '记住了，下一个 ➔'}
                </button>
            </div>
        `;

        if (this.feedbackEl) {
            this.feedbackEl.className = 'bb-feedback';
            this.feedbackEl.textContent = '📖 先跟读记住 5 个新单词，完成检验送大量金币/阳光 + 3枚萌宠徽章！';
        }

        if (autoSpeak) {
            sharedSpeech.speakEnglish(w.word, false);
        }

        this.enStageEl.querySelector('#btnEnSpeakNormal')?.addEventListener('click', () => {
            sharedSpeech.speakEnglish(w.word, false);
        });
        this.enStageEl.querySelector('#btnEnSpeakSlow')?.addEventListener('click', () => {
            sharedSpeech.speakEnglish(w.word, true);
        });
        this.enStageEl.querySelector('#btnEnPrevWord')?.addEventListener('click', () => {
            if (sess.studyIdx > 0) {
                sess.studyIdx--;
                this.renderEnglishStage(true);
            }
        });
        this.enStageEl.querySelector('#btnEnNextWord')?.addEventListener('click', () => {
            this.onSoundResume();
            if (!isLast) {
                sess.studyIdx++;
                this.renderEnglishStage(true);
            } else {
                sess.phase = 'quiz';
                sess.quizIdx = 0;
                this.renderEnglishStage(true);
            }
        });
    }

    _renderEnglishQuizCard(q, autoSpeak, badgeTitle) {
        if (!q) return;
        const w = q.wordObj;

        if (q.mode === 'listen_pic' || q.mode === 'match_word') {
            const isListen = q.mode === 'listen_pic';
            const promptHtml = isListen
                ? `
                    <div class="smart-en-emoji">🎧</div>
                    <div class="smart-en-zh" style="color:#ffeaa7;">听发音选出正确的图案</div>
                `
                : `
                    <div class="smart-en-emoji">${w.icon}</div>
                    <div class="smart-en-zh">${w.zh}</div>
                `;

            const optsHtml = q.options.map(opt => {
                if (isListen) {
                    return `
                        <button type="button" class="smart-en-opt-btn" data-opt-id="${opt.id}">
                            <span class="smart-en-opt-icon">${opt.icon}</span>
                            <span class="smart-en-opt-sub">${opt.zh}</span>
                        </button>
                    `;
                }
                return `
                    <button type="button" class="smart-en-opt-btn" data-opt-id="${opt.id}">
                        <span class="smart-en-opt-word">${opt.word}</span>
                        <span class="smart-en-opt-sub">${opt.phonicsHtml}</span>
                    </button>
                `;
            }).join('');

            this.enStageEl.innerHTML = `
                <div class="smart-en-card">
                    <div class="smart-en-progress">${badgeTitle}</div>
                    ${promptHtml}
                    <div class="smart-en-audio-row">
                        <button type="button" class="smart-mini-btn" id="btnEnQuizSpeak">🔊 再听一遍</button>
                        <button type="button" class="smart-mini-btn" id="btnEnQuizSlow">🐢 慢速</button>
                    </div>
                </div>
                <div class="smart-en-options-grid" style="margin-top:6px;">
                    ${optsHtml}
                </div>
            `;

            if (autoSpeak) {
                sharedSpeech.speakEnglish(q.speakText || w.word, false);
            }

            this.enStageEl.querySelector('#btnEnQuizSpeak')?.addEventListener('click', () => {
                sharedSpeech.speakEnglish(q.speakText || w.word, false);
            });
            this.enStageEl.querySelector('#btnEnQuizSlow')?.addEventListener('click', () => {
                sharedSpeech.speakEnglish(q.speakText || w.word, true);
            });

            this.enStageEl.querySelectorAll('.smart-en-opt-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (this._enLock) return;
                    this.onSoundResume();
                    const pickedId = btn.getAttribute('data-opt-id');
                    const isCorrect = pickedId === q.answerId;
                    btn.classList.add(isCorrect ? 'correct' : 'wrong');
                    if (!isCorrect) {
                        this.enStageEl.querySelector(`.smart-en-opt-btn[data-opt-id="${q.answerId}"]`)?.classList.add('correct');
                    }
                    this._handleEnglishAnswer(isCorrect, w, pickedId);
                });
            });
            return;
        }

        // 拼写填空模式 spell_word
        this.spellSlotsState = q.missingIndices.map(idx => ({ idx, char: '', tileId: null }));
        this._renderSpellQuizDOM(q, badgeTitle);
        if (autoSpeak) {
            sharedSpeech.speakEnglish(q.speakText || w.word, false);
        }
    }

    _renderSpellQuizDOM(q, badgeTitle) {
        const w = q.wordObj;
        const slotsHtml = q.chars.map((ch, idx) => {
            const slotObj = this.spellSlotsState.find(s => s.idx === idx);
            if (!slotObj) {
                return `<span class="smart-spell-slot">${ch}</span>`;
            }
            if (slotObj.char) {
                return `<span class="smart-spell-slot missing filled" data-slot-idx="${idx}" title="点击退回字母">${slotObj.char}</span>`;
            }
            return `<span class="smart-spell-slot missing" data-slot-idx="${idx}">_</span>`;
        }).join('');

        const usedTileIds = new Set(this.spellSlotsState.map(s => s.tileId).filter(Boolean));
        const tilesHtml = q.tiles.map(t => `
            <button type="button" class="smart-letter-tile ${usedTileIds.has(t.tileId) ? 'used' : ''}" data-tile-id="${t.tileId}" data-char="${t.char}">
                ${t.char}
            </button>
        `).join('');

        this.enStageEl.innerHTML = `
            <div class="smart-en-card">
                <div class="smart-en-progress">${badgeTitle}</div>
                <div class="smart-en-emoji">${w.icon}</div>
                <div class="smart-en-zh">${w.zh}</div>
                <div class="smart-spell-slots">${slotsHtml}</div>
                <div class="smart-en-audio-row">
                    <button type="button" class="smart-mini-btn" id="btnEnQuizSpeak">🔊 听单词</button>
                    <button type="button" class="smart-mini-btn" id="btnEnSpellClear">🔄 重拼</button>
                </div>
            </div>
            <div class="smart-spell-tiles" style="margin-top:6px;">
                ${tilesHtml}
            </div>
        `;

        this.enStageEl.querySelector('#btnEnQuizSpeak')?.addEventListener('click', () => {
            sharedSpeech.speakEnglish(w.word, false);
        });
        this.enStageEl.querySelector('#btnEnSpellClear')?.addEventListener('click', () => {
            if (this._enLock) return;
            this.spellSlotsState.forEach(s => { s.char = ''; s.tileId = null; });
            this._renderSpellQuizDOM(q, badgeTitle);
        });

        this.enStageEl.querySelectorAll('.smart-spell-slot.filled').forEach(slotEl => {
            slotEl.addEventListener('click', () => {
                if (this._enLock) return;
                const sIdx = Number(slotEl.getAttribute('data-slot-idx'));
                const found = this.spellSlotsState.find(s => s.idx === sIdx);
                if (found) {
                    found.char = '';
                    found.tileId = null;
                    this._renderSpellQuizDOM(q, badgeTitle);
                }
            });
        });

        this.enStageEl.querySelectorAll('.smart-letter-tile').forEach(tileBtn => {
            tileBtn.addEventListener('click', () => {
                if (this._enLock) return;
                this.onSoundResume();
                const emptySlot = this.spellSlotsState.find(s => !s.char);
                if (!emptySlot) return;
                emptySlot.char = tileBtn.getAttribute('data-char');
                emptySlot.tileId = tileBtn.getAttribute('data-tile-id');
                this._renderSpellQuizDOM(q, badgeTitle);

                // 检查是否全部填满
                if (this.spellSlotsState.every(s => Boolean(s.char))) {
                    const assembled = q.chars.map((origCh, i) => {
                        const st = this.spellSlotsState.find(s => s.idx === i);
                        return st ? st.char : origCh;
                    }).join('').toLowerCase();
                    const isCorrect = assembled === q.expectedWord;
                    this._handleEnglishAnswer(isCorrect, w, assembled);
                }
            });
        });
    }

    _handleEnglishAnswer(isCorrect, wordObj, userAns) {
        this._enLock = true;
        sharedSpeech.speakEnglish(wordObj.word, false);

        const isVocabMode = this.enSubMode === 'vocab' && Boolean(englishEngine.studySession);
        let isCampFinish = false;

        if (isVocabMode) {
            const sess = englishEngine.studySession;
            if (isCorrect) sess.correctInSession++;
            if (sess.quizIdx >= sess.quizQueue.length - 1) {
                isCampFinish = true;
            }
        }

        // 1. 更新英语词库熟练度 & 错词本
        this.profileManager.updateWordProgress(wordObj, isCorrect, isCampFinish ? 2 : 1);

        // 2. 同步写入战场连击与金币/阳光/破盾结算
        const evalRes = englishEngine.evaluateResult(isCorrect, wordObj, false);
        const battleRes = this.mathEngine.recordEnglishBattleAttempt({
            isCorrect,
            wordObj,
            userAns,
            isVocabCampFinish: isCampFinish
        });

        // 3. 发放全局萌宠徽章/星星进度
        let badgeSuffix = '';
        if (isCorrect) {
            const gameTag = this.hostType === 'carrot' ? '兔蛙塔防' : '植物战僵尸';
            const u = this.profileManager.getActiveUser();
            const dsBefore = this.profileManager.getDailyStatus(u);
            const firstDailyCampTicket = isCampFinish && dsBefore.vocabCampCount === 0;

            const prog = this.profileManager.awardLearningProgress({
                title: isCampFinish
                    ? `🎓 [${gameTag}·背词营] 完成 5 词特训！`
                    : `🔤 [${gameTag}·英语] 答对单词 ${wordObj.word}`,
                subjectTag: `${gameTag}·英语`,
                badges: isCampFinish ? 3 : (evalRes.badgeEarned || 0),
                stars: isCampFinish ? 0 : (evalRes.starEarned || 1),
                gotTicket: Boolean(evalRes.gotGachaTicket || firstDailyCampTicket),
                isVocabCampFinish: isCampFinish,
                combo: battleRes.combo || 1,
                isMath: false
            });
            this.updateTopBadgePill();
            if (prog.actualBadges > 0) {
                badgeSuffix = ` · 🏅+${prog.actualBadges}徽章`;
            } else if (!prog.alreadyAtCap) {
                badgeSuffix = ` · ⭐攒星${prog.starProgress}/3`;
            }
            if (prog.actualTicket) {
                badgeSuffix += ' · 🎟️+1盲盒券!';
            }
        }

        // 4. 触发宿主游戏(保卫兔蛙金币天击 / 植物大战僵尸阳光大招)
        this.onEnglishBattleResult(battleRes, {
            isEnglish: true,
            wordObj,
            isCampFinish,
            badgeSuffix
        });

        // 5. 推进下一题
        const delayMs = isCorrect ? (isCampFinish ? 1100 : 520) : 1150;
        setTimeout(() => {
            if (isVocabMode && englishEngine.studySession) {
                const sess = englishEngine.studySession;
                if (isCampFinish) {
                    const u = this.profileManager.getActiveUser();
                    const packForCamp = this.selectedPackId === 'all' ? 'pack_animals' : this.selectedPackId;
                    englishEngine.startVocabStudySession(packForCamp, u?.wordMastery || {});
                    this.renderEnglishStage(true);
                } else {
                    sess.quizIdx++;
                    this.renderEnglishStage(true);
                }
            } else {
                englishEngine.nextQuickQuestion();
                this.renderEnglishStage(true);
            }
        }, delayMs);
    }
}
