/**
 * shared/smartChalkboard.js - 保卫兔蛙(/carrot/) 与 植物大战僵尸(/pvz/) 通用多学科智慧小黑板控制器
 * 升级版支持：
 * 1. 🎲 统一数英大随机入口（按小朋友各自勾选启用的数学9题型 + 英语8题型智能穿插）
 * 2. 🔢 数学单科随机 & 全部 9 个单项目独立直达入口
 * 3. 🔤 英语单科随机 & 全部 8 个单项目独立直达入口 + 📖 5词魔法背诵营（20主题·360词洗牌防重）
 * 4. 实时打通【小豌豆 / 川川】全局萌宠徽章、每日防沉迷上限、盲盒券与错题/生词本！
 */
import {
    WORD_PACKS,
    ENGLISH_QUESTION_TYPES,
    ALL_ENGLISH_TYPE_IDS,
    COURSE_LESSONS,
    COURSE_SUB_MODES,
    ALL_COURSE_SUB_IDS,
    getPrimaryCourseLesson,
    EnglishEngine,
    englishEngine
} from './englishEngine.js';
import {
    MATH_QUESTION_TYPES,
    ALL_MATH_TYPE_IDS
} from './mathEngine.js';
import {
    renderMathInteractiveWidget,
    renderEnglishQuizWidget,
    renderCourseReadAloudBoard
} from './questionWidgets.js';
import { openRandomFilterModal } from './randomFilterModal.js';
import { sharedSpeech } from './audioTTS.js';

export class SmartChalkboard {
    /**
     * @param {Object} opts
     * @param {'carrot'|'pvz'} opts.hostType - 宿主游戏类型
     * @param {import('./mathEngine.js').MathEngine} opts.mathEngine - 共享数学引擎实例
     * @param {import('./unifiedProfile.js').UserProfileManager} opts.profileManager - 统一档案实例
     * @param {(battleRes: any, meta: any) => void} opts.onEnglishBattleResult - 互动题/英语题触发宿主战场奖励回调
     * @param {() => void} [opts.onSoundResume] - 唤醒 WebAudio 回调
     */
    constructor(opts) {
        this.hostType = opts.hostType || 'carrot';
        this.mathEngine = opts.mathEngine;
        this.profileManager = opts.profileManager;
        this.onEnglishBattleResult = opts.onEnglishBattleResult || (() => {});
        this.onSoundResume = opts.onSoundResume || (() => {});
        this.shouldConfirmExit = opts.shouldConfirmExit || (() => false);

        if (this.mathEngine && typeof this.mathEngine.setMistakesProvider === 'function') {
            this.mathEngine.setMistakesProvider(() => this.profileManager.getActiveUser()?.mathMistakes || []);
        }
        if (typeof englishEngine.setMistakesProvider === 'function') {
            englishEngine.setMistakesProvider(() => {
                const u = this.profileManager.getActiveUser();
                return {
                    wordMastery: u?.wordMastery || {},
                    englishMistakes: u?.englishMistakes || []
                };
            });
        }

        // entryMode: 'grand_random' | 'math_random' | 'english_random' | 'vocab_camp' | any math type id | any english type id
        this.entryMode = 'grand_random';
        this.mode = 'grand_random';
        this._grandActiveSubject = 'math'; // 在 grand_random 下当前这道题属于 'math' 还是 'english'
        this._grandStreakSubject = '';
        this._grandStreakCount = 0;

        this.selectedPackId = 'all';
        this.showVisualTip = false;
        this._enLock = false;
        this._numericKeypadVisible = true;

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
            hubLink.addEventListener('click', (e) => {
                if (this.shouldConfirmExit() && !confirm('当前战斗正在进行中，确定要离开本局返回游乐园大厅吗？')) {
                    e.preventDefault();
                }
            });
            hudLeft.insertBefore(hubLink, hudLeft.firstChild);

            const petPill = document.createElement('a');
            petPill.id = 'portalPetBadgePill';
            petPill.href = '../pet/index.html';
            petPill.className = 'portal-pet-badge-pill';
            petPill.title = '点击前往《奇妙萌宠店长》用徽章投喂兔兔和小青蛙！';
            petPill.addEventListener('click', (e) => {
                if (this.shouldConfirmExit() && !confirm('当前战斗正在进行中，确定要前往《萌宠店长》吗？（已获得的徽章已实时保存）')) {
                    e.preventDefault();
                }
            });
            hudLeft.appendChild(petPill);
            this.petBadgePillEl = petPill;
        } else {
            this.petBadgePillEl = document.getElementById('portalPetBadgePill');
        }

        if (!this.cardEl || !this.bbInnerEl) return;

        // 2. 注入一级大入口切换栏 [🎲 大随机 | 🔢 数学(9) | 🔤 英语(9) | 🎓 英语课]
        const tabsWrap = document.createElement('div');
        tabsWrap.className = 'smart-mode-tabs';
        tabsWrap.id = 'smartModeTabs';
        tabsWrap.innerHTML = `
            <button type="button" class="smart-mode-tab active" data-topcat="grand">🎲 大随机</button>
            <button type="button" class="smart-mode-tab" data-topcat="math">🔢 数学</button>
            <button type="button" class="smart-mode-tab" data-topcat="english">🔤 英语</button>
            <button type="button" class="smart-mode-tab" data-topcat="course">🎓 英语课</button>
        `;
        this.cardEl.insertBefore(tabsWrap, this.bbInnerEl);
        this.tabsWrap = tabsWrap;

        // 2B. 注入单行横向滚动【单项目直达胶囊条】
        const subStrip = document.createElement('div');
        subStrip.className = 'smart-sub-entry-strip';
        subStrip.id = 'smartSubEntryStrip';
        this.cardEl.insertBefore(subStrip, this.bbInnerEl);
        this.subStripEl = subStrip;

        tabsWrap.addEventListener('click', (e) => {
            const btn = e.target.closest('.smart-mode-tab');
            if (!btn) return;
            this.onSoundResume();
            const cat = btn.getAttribute('data-topcat');
            if (cat === 'grand') this.switchMode('grand_random');
            else if (cat === 'math') this.switchMode('math_random');
            else if (cat === 'english') this.switchMode('english_random');
            else if (cat === 'course') this.switchMode('course_all');
        });

        subStrip.addEventListener('click', (e) => {
            const filterBtn = e.target.closest('[data-filter-modal]');
            if (filterBtn) {
                this.onSoundResume();
                openRandomFilterModal({
                    profileManager: this.profileManager,
                    onSaved: () => {
                        this.syncFromActiveProfile();
                    }
                });
                return;
            }
            const pill = e.target.closest('.smart-entry-pill');
            if (!pill) return;
            this.onSoundResume();
            const emode = pill.getAttribute('data-emode');
            if (emode) this.switchMode(emode);
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

        // 4. 注入互动数学舞台 (#smartMathWidgetPanel)
        const mathWidgetPanel = document.createElement('div');
        mathWidgetPanel.className = 'smart-english-panel';
        mathWidgetPanel.id = 'smartMathWidgetPanel';
        this.bbInnerEl.insertAdjacentElement('afterend', mathWidgetPanel);
        this.mathWidgetPanelEl = mathWidgetPanel;

        // 5. 注入少儿英语（9题型闪电闯关 + 5词背诵营 + 校外英语课次切换）面板
        const enPanel = document.createElement('div');
        enPanel.className = 'smart-english-panel';
        enPanel.id = 'smartEnglishPanel';

        const totalWordsCount = WORD_PACKS.reduce((s, p) => s + p.words.length, 0);
        const packOptionsHtml = [
            `<option value="all">🌟 全部20主题 (${totalWordsCount}词)</option>`,
            ...WORD_PACKS.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`)
        ].join('');

        const latestLesson = COURSE_LESSONS[0];
        const courseLessonOptionsHtml = [
            `<option value="latest">📚 最新: ${latestLesson ? `${latestLesson.code} (${latestLesson.dateLabel})` : 'S1U1W1'}</option>`,
            ...(COURSE_LESSONS.length > 1 ? [`<option value="all_courses">🌟 全部已学课次 (${COURSE_LESSONS.length}课)</option>`] : []),
            ...COURSE_LESSONS.map(l => `<option value="${l.id}">📖 ${l.code} · ${l.dateLabel}</option>`)
        ].join('');

        enPanel.innerHTML = `
            <div class="smart-en-top-row">
                <span class="qw-mode-tag" id="smartEnModeLabel">🔤 英语闯关</span>
                <select class="smart-en-pack-select" id="smartEnPackSelect" title="选择英语主题词包">
                    ${packOptionsHtml}
                </select>
                <select class="smart-en-pack-select" id="smartCourseLessonSelect" title="选择校外英语课作业期数" style="display:none;">
                    ${courseLessonOptionsHtml}
                </select>
            </div>
            <div id="smartEnStage"></div>
        `;

        mathWidgetPanel.insertAdjacentElement('afterend', enPanel);
        this.enPanelEl = enPanel;
        this.enStageEl = enPanel.querySelector('#smartEnStage');
        this.enModeLabelEl = enPanel.querySelector('#smartEnModeLabel');
        this.enPackSelectEl = enPanel.querySelector('#smartEnPackSelect');
        this.courseLessonSelectEl = enPanel.querySelector('#smartCourseLessonSelect');

        this.enPackSelectEl.addEventListener('change', () => {
            this.selectedPackId = this.enPackSelectEl.value;
            englishEngine.setConfig({ packId: this.selectedPackId });
            const active = this.profileManager.getActiveUser();
            if (active) {
                this.profileManager.updateUserSettings(active.id, {
                    englishConfig: { ...(active.englishConfig || {}), packId: this.selectedPackId }
                });
            }
            if (this.entryMode === 'vocab_camp') {
                englishEngine.startVocabStudySession(this.selectedPackId, active?.wordMastery || {});
            } else {
                const forced = ALL_ENGLISH_TYPE_IDS.includes(this.entryMode) ? this.entryMode : 'random';
                englishEngine.nextQuickQuestion(null, forced);
            }
            this.renderEnglishStage(true);
        });

        this.courseLessonSelectEl.addEventListener('change', () => {
            const lessonId = this.courseLessonSelectEl.value || 'latest';
            englishEngine.setConfig({ courseLessonId: lessonId });
            const active = this.profileManager.getActiveUser();
            if (active) {
                this.profileManager.updateUserSettings(active.id, {
                    englishConfig: { ...(active.englishConfig || {}), courseLessonId: lessonId }
                });
            }
            if (this.entryMode !== 'course_readcard') {
                const sub = ALL_COURSE_SUB_IDS.includes(this.entryMode) ? this.entryMode : 'course_all';
                englishEngine.nextQuickQuestion(null, sub);
            }
            this.renderEnglishStage(true);
        });
    }

    syncFromActiveProfile() {
        const user = this.profileManager.getActiveUser();
        if (!user) return;
        if (this.mathEngine && user.mathConfig) {
            this.mathEngine.setConfig(user.mathConfig);
        }
        const enCfg = user.englishConfig || { level: 'level1_listen', wordDifficulty: 'easy', packId: 'all' };
        this.selectedPackId = enCfg.packId || 'all';
        const courseLessonId = enCfg.courseLessonId || 'latest';
        englishEngine.setConfig({
            level: enCfg.level || 'level1_listen',
            wordDifficulty: enCfg.wordDifficulty || 'easy',
            courseAllowHardDictation: Boolean(enCfg.courseAllowHardDictation),
            packId: this.selectedPackId,
            courseLessonId,
            courseSubMode: enCfg.courseSubMode || 'course_all',
            enabledTypes: enCfg.enabledTypes
        });
        const hudAvatarEl = document.getElementById('hudKidAvatar') || document.getElementById('currentUserAvatar');
        if (hudAvatarEl) hudAvatarEl.textContent = user.avatar || '🐰';
        const hudNameEl = document.getElementById('hudKidName') || document.getElementById('currentUserName');
        if (hudNameEl) hudNameEl.textContent = user.name || '小豌豆';
        const bbKidAvatarEl = document.getElementById('bbKidAvatar');
        if (bbKidAvatarEl) bbKidAvatarEl.textContent = user.avatar || '🐰';
        const bbKidNameEl = document.getElementById('bbKidName');
        if (bbKidNameEl) bbKidNameEl.textContent = user.name || '小豌豆';
        if (this.enPackSelectEl) {
            this.enPackSelectEl.value = this.selectedPackId;
        }
        if (this.courseLessonSelectEl) {
            this.courseLessonSelectEl.value = courseLessonId;
        }
        this.updateTopBadgePill();
        const pref = user.preferredSmartMode || 'grand_random';
        this.switchMode(pref, false);
    }

    _getTopCategory(mode = this.entryMode) {
        if (mode === 'grand_random') return 'grand';
        if (mode === 'course_special' || ALL_COURSE_SUB_IDS.includes(mode)) return 'course';
        if (mode === 'english' || mode === 'english_random' || mode === 'vocab_camp' || ALL_ENGLISH_TYPE_IDS.includes(mode)) {
            return 'english';
        }
        return 'math';
    }

    _renderSubEntryStrip() {
        if (!this.subStripEl) return;
        const u = this.profileManager.getActiveUser();
        const mathCount = u?.mathConfig?.enabledTypes?.length || ALL_MATH_TYPE_IDS.length;
        const enCount = u?.englishConfig?.enabledTypes?.length || ALL_ENGLISH_TYPE_IDS.length;
        const topCat = this._getTopCategory();

        let pills = [];
        if (topCat === 'grand') {
            pills = [
                { id: 'grand_random', label: `🎲 数英大随机(数${mathCount}+英${enCount})` },
                { id: 'course_all', label: '🎓 校外英语课' },
                { id: 'math_random', label: '🔢 切数学随机' },
                { id: 'english_random', label: '🔤 切英语随机' },
                { id: 'vocab_camp', label: '📖 5词背诵' }
            ];
        } else if (topCat === 'course') {
            pills = COURSE_SUB_MODES.map(m => ({ id: m.id, label: m.shortName }));
        } else if (topCat === 'math') {
            pills = [
                { id: 'math_random', label: `🎲 数学随机(${mathCount}项)` },
                ...MATH_QUESTION_TYPES.map(t => ({ id: t.id, label: t.shortName }))
            ];
        } else {
            pills = [
                { id: 'english_random', label: `🎲 英语随机(${enCount}项)` },
                { id: 'vocab_camp', label: '📖 5词背诵' },
                ...ENGLISH_QUESTION_TYPES.filter(t => t.id !== 'course_special').map(t => ({ id: t.id, label: t.shortName }))
            ];
        }

        const effectiveActive = (this.entryMode === 'course_special') ? 'course_all' : this.entryMode;
        const filterBtnHtml = `
            <button type="button" class="smart-entry-pill smart-sub-pill filter-cfg-btn" data-filter-modal="1" title="一键降低英语难度 / 选择哪些题型在随机题目里不出现">
                🎛️ 筛题/降难
            </button>
        `;
        this.subStripEl.innerHTML = filterBtnHtml + pills.map(p => `
            <button type="button" class="smart-entry-pill ${effectiveActive === p.id ? 'active' : ''}" data-emode="${p.id}">
                ${p.label}
            </button>
        `).join('');
    }

    _syncBottomDiffTag() {
        const diffEl = document.getElementById('bbKidDiffBadge') || document.getElementById('bbKidDiffTag');
        if (!diffEl) return;
        const u = this.profileManager.getActiveUser();
        if (!u) return;
        const topCat = this._getTopCategory();
        if (topCat === 'grand') {
            diffEl.textContent = `🎲 大随机(数${u.mathConfig?.enabledTypes?.length || 9}+英${u.englishConfig?.enabledTypes?.length || 9})`;
        } else if (topCat === 'course') {
            const lesson = getPrimaryCourseLesson(u.englishConfig?.courseLessonId || 'latest');
            diffEl.textContent = `🎓 校外课 · ${lesson?.code || 'S1U1W1'} (${lesson?.dateLabel || ''})`;
        } else if (topCat === 'english') {
            diffEl.textContent = EnglishEngine.formatSummary(u.englishConfig);
        } else if (this.mathEngine && typeof this.mathEngine.getDifficultySummary === 'function') {
            diffEl.textContent = this.mathEngine.getDifficultySummary();
        }
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

    /**
     * 供宿主键盘事件判断是否屏蔽数字键盘快捷输入：仅当显示数字输入框时才放行键盘数字输入
     */
    isEnglishActive() {
        return !this._numericKeypadVisible;
    }

    _rollGrandNextSubject() {
        if (this._grandStreakCount >= 2) {
            const next = this._grandStreakSubject === 'math' ? 'english' : 'math';
            this._grandStreakSubject = next;
            this._grandStreakCount = 1;
            return next;
        }
        const next = Math.random() < 0.54 ? 'math' : 'english';
        if (next === this._grandStreakSubject) {
            this._grandStreakCount += 1;
        } else {
            this._grandStreakSubject = next;
            this._grandStreakCount = 1;
        }
        return next;
    }

    _prepareNextGrandQuestion(autoSpeak = false) {
        this._grandActiveSubject = this._rollGrandNextSubject();
        if (this._grandActiveSubject === 'english') {
            englishEngine.nextQuickQuestion(null, 'random');
            this.renderEnglishStage(autoSpeak);
        } else {
            this.mathEngine.setCategoryFilter('random');
            this.mathEngine.nextQuestion();
            this._renderCurrentMathView();
        }
    }

    switchMode(rawMode, persistPref = true) {
        let newMode = rawMode || 'grand_random';
        if (newMode === 'english') newMode = 'english_random';
        if (newMode === 'math') newMode = 'math_random';

        const isValid = ['grand_random', 'math_random', 'english_random', 'vocab_camp'].includes(newMode) ||
            ALL_MATH_TYPE_IDS.includes(newMode) ||
            ALL_ENGLISH_TYPE_IDS.includes(newMode) ||
            ALL_COURSE_SUB_IDS.includes(newMode);
        if (!isValid) newMode = 'grand_random';

        this.entryMode = newMode;
        this.mode = newMode;
        this.showVisualTip = false;

        if (persistPref && typeof this.profileManager.setPreferredSmartMode === 'function') {
            this.profileManager.setPreferredSmartMode(newMode);
        }

        const topCat = this._getTopCategory(newMode);
        if (this.tabsWrap) {
            this.tabsWrap.querySelectorAll('.smart-mode-tab').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-topcat') === topCat);
            });
        }
        this._renderSubEntryStrip();
        this._syncBottomDiffTag();
        if (this.feedbackEl) {
            this.feedbackEl.className = 'bb-feedback';
            this.feedbackEl.textContent = '';
        }

        if (newMode === 'grand_random') {
            this._prepareNextGrandQuestion(false);
            return;
        }

        if (topCat === 'english' || topCat === 'course') {
            const u = this.profileManager.getActiveUser();
            if (newMode === 'vocab_camp') {
                if (!englishEngine.studySession) {
                    englishEngine.startVocabStudySession(this.selectedPackId, u?.wordMastery || {});
                }
            } else if (newMode !== 'course_readcard') {
                const forced = (ALL_ENGLISH_TYPE_IDS.includes(newMode) || ALL_COURSE_SUB_IDS.includes(newMode))
                    ? newMode
                    : 'random';
                englishEngine.nextQuickQuestion(null, forced);
            }
            this.renderEnglishStage(true);
            return;
        }

        // 数学模式 ('math_random' 或 9 个具体题型 ID)
        const targetMathSub = newMode === 'math_random' ? 'random' : newMode;
        this.mathEngine.setCategoryFilter(targetMathSub);
        const curQ = this.mathEngine.currentQuestion;
        if (!curQ || (targetMathSub !== 'random' && curQ.kind !== targetMathSub) || curQ.isShieldNuke || curQ.isShieldTarget) {
            this.mathEngine.nextQuestion();
        }
        this._renderCurrentMathView();
    }

    _setPanelVisibility({ showNumericMath = false, showInteractiveMath = false, showEnglish = false }) {
        this._numericKeypadVisible = Boolean(showNumericMath);
        if (this.bbInnerEl) this.bbInnerEl.style.display = showNumericMath ? '' : 'none';
        if (this.answerBoxEl) this.answerBoxEl.style.display = showNumericMath ? '' : 'none';
        if (this.keypadEl) this.keypadEl.style.display = showNumericMath ? '' : 'none';
        if (this.mathWidgetPanelEl) this.mathWidgetPanelEl.classList.toggle('active', Boolean(showInteractiveMath));
        if (this.enPanelEl) this.enPanelEl.classList.toggle('active', Boolean(showEnglish));
        if (this.cardEl) {
            const curQ = this.mathEngine?.currentQuestion;
            const isPureCalc = showNumericMath && (!curQ || curQ.kind === 'calc');
            this.cardEl.classList.toggle('compact-rich-mode', !isPureCalc);
        }
    }

    /**
     * 当宿主游戏外部刷新小黑板（例如点击了数盾怪兽加载专属算式，或数字键盘答完一题后刷新）时调用
     */
    renderMathQuestion() {
        const q = this.mathEngine.currentQuestion;

        // 1. 战场破盾算式最高优先级：临时展示数字口算面板，不覆盖玩家的 entryMode 偏好！
        if (q && (q.isShieldNuke || q.isShieldTarget)) {
            this._renderNumericMathDOM(q);
            return;
        }

        // 2. 若玩家处于【🎲 大随机】，刚答完一道数字数学题后推进下一题（可能抽中英语或互动数学）
        if (this.entryMode === 'grand_random') {
            this._prepareNextGrandQuestion(true);
            return;
        }

        // 3. 若玩家处于英语或英语课专项分支，保持英语视图
        const curTopCat = this._getTopCategory();
        if (curTopCat === 'english' || curTopCat === 'course') {
            this.renderEnglishStage(false);
            return;
        }

        // 4. 数学分支（数学随机 或 单项目）
        this._renderCurrentMathView();
    }

    _renderCurrentMathView() {
        const q = this.mathEngine.currentQuestion;
        if (!q) return;

        if (q.isInteractiveWidget && !q.isShieldNuke && !q.isShieldTarget) {
            this._setPanelVisibility({ showInteractiveMath: true });
            renderMathInteractiveWidget(this.mathWidgetPanelEl, q, {
                theme: 'dark',
                onTapSound: () => this.onSoundResume(),
                onEvaluate: (isCorrect, userAnsLabel) => {
                    this._handleInteractiveMathAnswer(isCorrect, userAnsLabel);
                }
            });
            return;
        }

        this._renderNumericMathDOM(q);
    }

    _renderNumericMathDOM(q) {
        this._setPanelVisibility({ showNumericMath: true });
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
            this.hintEl.textContent = q.hint
                ? (q.hint.startsWith('🎯') || q.hint.startsWith('⚡') || q.hint.startsWith('🔄') ? q.hint : `🎯 ${q.hint}`)
                : '🎯 口算速算挑战';
        }
    }

    _handleInteractiveMathAnswer(isCorrect, userAnsLabel) {
        const res = this.mathEngine.evaluateInteractiveAttempt(isCorrect, userAnsLabel, false);
        const badgeSuffix = this.recordMathProgress(res);

        // 复用宿主战场奖励通道（发放塔防金币/暴击 或 植物大战僵尸阳光/破盾）
        this.onEnglishBattleResult(res, {
            isEnglish: false,
            isInteractiveMath: true,
            question: res.question,
            badgeSuffix
        });

        const delayMs = isCorrect ? 520 : 1100;
        setTimeout(() => {
            if (this.entryMode === 'grand_random') {
                this._prepareNextGrandQuestion(true);
            } else {
                this.mathEngine.nextQuestion();
                this._renderCurrentMathView();
            }
        }, delayMs);
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
     * 将宿主游戏的数学作答结果同步写入统一徽章系统与错题本
     */
    recordMathProgress(res) {
        const isCorrect = Boolean(res && (res.correct || res.isCorrect));
        const q = (res && res.question) || this.mathEngine.currentQuestion;

        if (isCorrect) {
            if (q && q.isReview) {
                this.profileManager.resolveMathMistake(q);
            }
            const gameTag = this.hostType === 'carrot' ? '兔蛙塔防' : '植物战僵尸';
            const typeMeta = MATH_QUESTION_TYPES.find(t => t.id === q?.kind);
            const kindTag = typeMeta ? typeMeta.shortName.replace(/^[^\s]+\s*/, '') : '心算';
            const prog = this.profileManager.awardLearningProgress({
                title: `⚔️ [${gameTag}·${kindTag}] 答对 ${q?.expr || q?.formula || '题目'}`,
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

    // ==================== 少儿英语渲染与交互闭环 (8大题型 + 5词背诵营) ====================

    renderEnglishStage(autoSpeak = false) {
        if (!this.enStageEl) return;
        this._setPanelVisibility({ showEnglish: true });
        this._enLock = false;

        const isCourseCategory = this._getTopCategory() === 'course';
        if (this.enPackSelectEl) this.enPackSelectEl.style.display = isCourseCategory ? 'none' : '';
        if (this.courseLessonSelectEl) this.courseLessonSelectEl.style.display = isCourseCategory ? '' : 'none';

        if (this.entryMode === 'course_readcard') {
            const u = this.profileManager.getActiveUser();
            const lesson = getPrimaryCourseLesson(u?.englishConfig?.courseLessonId || 'latest');
            if (this.enModeLabelEl) this.enModeLabelEl.textContent = `📹 视频朗读跟读 · ${lesson.code}`;
            this.enStageEl.style.maxHeight = '290px';
            this.enStageEl.style.overflowY = 'auto';
            renderCourseReadAloudBoard(this.enStageEl, lesson, {
                theme: 'dark',
                compact: true,
                onTapSound: () => this.onSoundResume(),
                speakFn: (txt, slow, ph) => sharedSpeech.speakEnglish(txt, slow, ph),
                isChecked: (key) => Boolean(this.profileManager.getActiveUser()?.courseReadChecks?.[key]?.checked),
                onToggleCheck: (key) => {
                    this.profileManager.toggleCourseReadCheck(key);
                    this.updateTopBadgePill();
                }
            });
            return;
        }
        this.enStageEl.style.maxHeight = '';
        this.enStageEl.style.overflowY = '';

        if (this.entryMode === 'vocab_camp') {
            if (this.enModeLabelEl) this.enModeLabelEl.textContent = '📖 5词背诵营';
            const sess = englishEngine.studySession;
            if (!sess) {
                const u = this.profileManager.getActiveUser();
                englishEngine.startVocabStudySession(this.selectedPackId, u?.wordMastery || {});
            }
            const curSess = englishEngine.studySession;
            if (curSess.phase === 'study') {
                this._renderVocabStudyCard(curSess, autoSpeak);
            } else {
                const q = curSess.quizQueue[curSess.quizIdx];
                this._renderEnglishQuizCard(q, autoSpeak, `🔥 背词检验 (${curSess.quizIdx + 1}/${curSess.quizQueue.length})`);
            }
            return;
        }

        const forced = (ALL_ENGLISH_TYPE_IDS.includes(this.entryMode) || ALL_COURSE_SUB_IDS.includes(this.entryMode))
            ? this.entryMode
            : 'random';
        const expectedMode = ALL_COURSE_SUB_IDS.includes(forced) ? 'course_special' : forced;
        if (!englishEngine.currentQuiz || (expectedMode !== 'random' && englishEngine.currentQuiz.mode !== expectedMode)) {
            englishEngine.nextQuickQuestion(null, forced);
        }
        const curQuiz = englishEngine.currentQuiz;
        const subMeta = COURSE_SUB_MODES.find(m => m.id === this.entryMode);
        const tMeta = ENGLISH_QUESTION_TYPES.find(t => t.id === curQuiz?.mode);
        if (this.enModeLabelEl) {
            if (this.entryMode === 'grand_random') {
                this.enModeLabelEl.textContent = `🎲 大随机 · ${tMeta ? tMeta.shortName : '英语'}`;
            } else if (subMeta) {
                this.enModeLabelEl.textContent = subMeta.name;
            } else {
                this.enModeLabelEl.textContent = tMeta ? tMeta.name : '⚡ 英语闪电闯关';
            }
        }
        this._renderEnglishQuizCard(curQuiz, autoSpeak, subMeta ? subMeta.name : (tMeta ? tMeta.name : '⚡ 英语闯关'));
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
            sharedSpeech.speakEnglish(w.word, true, w.phonics);
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
        renderEnglishQuizWidget(this.enStageEl, q, {
            badgeTitle,
            autoSpeak,
            theme: 'dark',
            onTapSound: () => this.onSoundResume(),
            speakFn: (txt, slow, ph) => sharedSpeech.speakEnglish(txt, slow, ph),
            onEvaluate: (isCorrect, userAns) => {
                if (this._enLock) return;
                this._handleEnglishAnswer(isCorrect, q.wordObj, userAns);
            }
        });
    }

    _handleEnglishAnswer(isCorrect, wordObj, userAns) {
        this._enLock = true;
        const curQ = englishEngine.currentQuiz;
        const confirmSpeech = curQ?.answerEn || curQ?.expectedSentence || wordObj?.word || '';
        if (confirmSpeech && curQ?.courseSubType !== 'qa_match') {
            sharedSpeech.speakEnglish(confirmSpeech, false);
        }

        const isVocabMode = this.entryMode === 'vocab_camp' && Boolean(englishEngine.studySession);
        let isCampFinish = false;

        if (isVocabMode) {
            const sess = englishEngine.studySession;
            if (isCorrect) {
                sess.correctInSession++;
                if (wordObj?.id && Array.isArray(sess.passedWordIds) && !sess.passedWordIds.includes(wordObj.id)) {
                    sess.passedWordIds.push(wordObj.id);
                }
            } else {
                // 背词营答错：将该生词追加到本轮检验队尾换角度重考，不糊弄通关！
                englishEngine.enqueueCampRetryIfWrong(curQ);
            }
            if (sess.quizIdx >= sess.quizQueue.length - 1) {
                isCampFinish = true;
            }
        }

        const isReviewWord = !isVocabMode && Boolean(englishEngine.currentQuiz?.isReview);
        this.profileManager.updateWordProgress(wordObj, isCorrect, (isCampFinish || isReviewWord) ? 2 : 1);

        const evalRes = englishEngine.evaluateResult(isCorrect, wordObj, isReviewWord);
        const battleRes = this.mathEngine.recordEnglishBattleAttempt({
            isCorrect,
            wordObj,
            userAns,
            isVocabCampFinish: isCampFinish
        });

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

        this.onEnglishBattleResult(battleRes, {
            isEnglish: true,
            wordObj,
            isCampFinish,
            badgeSuffix
        });

        // 答对保留 720ms 瞄一眼揭晓的释义；答错延长至 1750ms 让孩子看清标绿的正确单词与中文意思
        const delayMs = isCorrect ? (isCampFinish ? 1150 : 720) : 1750;
        setTimeout(() => {
            if (this.entryMode === 'grand_random') {
                this._prepareNextGrandQuestion(true);
                return;
            }
            if (isVocabMode && englishEngine.studySession) {
                const sess = englishEngine.studySession;
                if (isCampFinish) {
                    const u = this.profileManager.getActiveUser();
                    englishEngine.startVocabStudySession(this.selectedPackId, u?.wordMastery || {});
                    this.renderEnglishStage(true);
                } else {
                    sess.quizIdx++;
                    this.renderEnglishStage(true);
                }
            } else {
                const forced = (ALL_ENGLISH_TYPE_IDS.includes(this.entryMode) || ALL_COURSE_SUB_IDS.includes(this.entryMode))
                    ? this.entryMode
                    : 'random';
                englishEngine.nextQuickQuestion(null, forced);
                this.renderEnglishStage(true);
            }
        }, delayMs);
    }
}
