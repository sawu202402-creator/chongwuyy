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
    CHINESE_GRADES,
    CHINESE_QUESTION_TYPES,
    ALL_CHINESE_TYPE_IDS,
    ChineseEngine,
    chineseEngine
} from './chineseEngine.js';
import {
    renderMathInteractiveWidget,
    renderEnglishQuizWidget,
    renderCourseReadAloudBoard,
    renderChineseQuizWidget
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
        this.onBeforeExit = opts.onBeforeExit || (() => {});

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
        if (typeof chineseEngine.setMistakesProvider === 'function') {
            chineseEngine.setMistakesProvider(() => this.profileManager.getActiveUser()?.chineseMistakes || []);
        }

        // entryMode: 'grand_random' | 'math_random' | 'chinese_random' | 'english_random' | 'vocab_camp' | any single type id
        this.entryMode = 'grand_random';
        this.mode = 'grand_random';
        this._grandActiveSubject = 'math'; // 'math' | 'chinese' | 'english'
        this._grandStreakSubject = '';
        this._grandStreakCount = 0;

        this.selectedPackId = 'all';
        this.showVisualTip = false;
        this._enLock = false;
        this._cnLock = false;
        this._interactiveMathLock = false;
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
                    return;
                }
                this.onBeforeExit();
            });
            hudLeft.insertBefore(hubLink, hudLeft.firstChild);

            const petPill = document.createElement('a');
            petPill.id = 'portalPetBadgePill';
            petPill.href = '../pet/index.html';
            petPill.className = 'portal-pet-badge-pill';
            petPill.title = '点击前往《奇妙萌宠店长》用徽章投喂兔兔和小青蛙！';
            petPill.addEventListener('click', (e) => {
                if (this.shouldConfirmExit() && !confirm('当前战斗正在进行中，确定要前往《萌宠店长》吗？（已获得的徽章与做题数已实时保存）')) {
                    e.preventDefault();
                    return;
                }
                this.onBeforeExit();
            });
            hudLeft.appendChild(petPill);
            this.petBadgePillEl = petPill;
        } else {
            this.petBadgePillEl = document.getElementById('portalPetBadgePill');
        }

        if (!this.cardEl || !this.bbInnerEl) return;

        // 2. 注入一级大入口切换栏 [🎲 大随机 | 🔢 数学 | 📖 语文 | 🔤 英语 | 🎓 英语课]
        const tabsWrap = document.createElement('div');
        tabsWrap.className = 'smart-mode-tabs';
        tabsWrap.id = 'smartModeTabs';
        tabsWrap.innerHTML = `
            <button type="button" class="smart-mode-tab active" data-topcat="grand">🎲 随机</button>
            <button type="button" class="smart-mode-tab" data-topcat="math">🔢 数学</button>
            <button type="button" class="smart-mode-tab" data-topcat="chinese">📖 语文</button>
            <button type="button" class="smart-mode-tab" data-topcat="english">🔤 英语</button>
            <button type="button" class="smart-mode-tab" data-topcat="course">🎓 英语课</button>
        `;
        this.cardEl.insertBefore(tabsWrap, this.bbInnerEl);
        this.tabsWrap = tabsWrap;

        // 2B. 注入单行横向滚动【单项目直达胶囊条】（支持触控滑动与鼠标拖拽横滑）
        const subStrip = document.createElement('div');
        subStrip.className = 'smart-sub-entry-strip';
        subStrip.id = 'smartSubEntryStrip';
        this.cardEl.insertBefore(subStrip, this.bbInnerEl);
        this.subStripEl = subStrip;

        let isDownStrip = false;
        let startXStrip = 0;
        let scrollLeftStrip = 0;
        let draggedStrip = false;
        subStrip.addEventListener('pointerdown', (ev) => {
            if (ev.pointerType === 'touch') return;
            isDownStrip = true;
            draggedStrip = false;
            startXStrip = ev.pageX - subStrip.offsetLeft;
            scrollLeftStrip = subStrip.scrollLeft;
        });
        window.addEventListener('pointerup', () => { isDownStrip = false; });
        subStrip.addEventListener('pointermove', (ev) => {
            if (!isDownStrip) return;
            const x = ev.pageX - subStrip.offsetLeft;
            const walk = x - startXStrip;
            if (Math.abs(walk) > 5) {
                draggedStrip = true;
                subStrip.scrollLeft = scrollLeftStrip - walk;
            }
        });

        tabsWrap.addEventListener('click', (e) => {
            const btn = e.target.closest('.smart-mode-tab');
            if (!btn) return;
            this.onSoundResume();
            const cat = btn.getAttribute('data-topcat');
            if (cat === 'grand') this.switchMode('grand_random');
            else if (cat === 'math') this.switchMode('math_random');
            else if (cat === 'chinese') this.switchMode('chinese_random');
            else if (cat === 'english') this.switchMode('english_random');
            else if (cat === 'course') this.switchMode('course_all');
        });

        subStrip.addEventListener('click', (e) => {
            if (draggedStrip) {
                draggedStrip = false;
                return;
            }
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
            `<option value="latest">🌟 最新：${latestLesson ? `${latestLesson.code}(${latestLesson.dateLabel})` : 'S1U1W1'}</option>`,
            ...(COURSE_LESSONS.length > 1 ? [`<option value="all_courses">📚 全部课次 (${COURSE_LESSONS.length}课)</option>`] : []),
            ...COURSE_LESSONS.map(l => `<option value="${l.id}">📖 ${l.code}(${l.dateLabel})《${l.storyTitle}》</option>`)
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

        // 6. 注入统编版小学语文（一年级上册 & 二年级上册 · 8大题型 · 含无选项自主填空）面板
        const cnPanel = document.createElement('div');
        cnPanel.className = 'smart-english-panel';
        cnPanel.id = 'smartChinesePanel';
        cnPanel.innerHTML = `
            <div class="smart-en-top-row">
                <span class="qw-mode-tag" id="smartCnModeLabel">📖 趣味语文</span>
                <select class="smart-en-pack-select" id="smartCnGradeSelect" title="选择统编版语文年级词句库">
                    ${CHINESE_GRADES.map(g => `<option value="${g.id}">${g.fullName}</option>`).join('')}
                </select>
            </div>
            <div id="smartCnStage"></div>
        `;
        enPanel.insertAdjacentElement('afterend', cnPanel);
        this.cnPanelEl = cnPanel;
        this.cnStageEl = cnPanel.querySelector('#smartCnStage');
        this.cnModeLabelEl = cnPanel.querySelector('#smartCnModeLabel');
        this.cnGradeSelectEl = cnPanel.querySelector('#smartCnGradeSelect');

        this.cnGradeSelectEl.addEventListener('change', () => {
            const nextGrade = this.cnGradeSelectEl.value || 'grade2_1';
            chineseEngine.setConfig({ grade: nextGrade });
            const active = this.profileManager.getActiveUser();
            if (active) {
                this.profileManager.updateUserSettings(active.id, {
                    chineseConfig: { ...(active.chineseConfig || {}), grade: nextGrade }
                });
            }
            const forced = ALL_CHINESE_TYPE_IDS.includes(this.entryMode) ? this.entryMode : null;
            chineseEngine.nextQuestion(forced);
            this.renderChineseStage();
            this._syncBottomDiffTag();
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
        const cnCfg = user.chineseConfig || { grade: 'grade2_1', includeInGrandRandom: true, enabledTypes: ALL_CHINESE_TYPE_IDS };
        chineseEngine.setConfig(cnCfg);
        if (this.cnGradeSelectEl) {
            this.cnGradeSelectEl.value = cnCfg.grade || 'grade2_1';
        }
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
        if (mode === 'chinese' || mode === 'chinese_random' || ALL_CHINESE_TYPE_IDS.includes(mode)) {
            return 'chinese';
        }
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
        const cnCount = u?.chineseConfig?.enabledTypes?.length || ALL_CHINESE_TYPE_IDS.length;
        const cnInGrand = u?.chineseConfig?.includeInGrandRandom !== false;
        const topCat = this._getTopCategory();

        let pills = [];
        if (topCat === 'grand') {
            pills = [
                { id: 'grand_random', label: cnInGrand ? `🎲 语数英大随机(数${mathCount}+语${cnCount}+英${enCount})` : `🎲 数英大随机(数${mathCount}+英${enCount})` },
                { id: 'chinese_random', label: '📖 切语文随机' },
                { id: 'course_all', label: '🎓 校外英语课' },
                { id: 'math_random', label: '🔢 切数学随机' },
                { id: 'english_random', label: '🔤 切英语随机' },
                { id: 'vocab_camp', label: '📖 5词背诵' }
            ];
        } else if (topCat === 'chinese') {
            pills = [
                { id: 'chinese_random', label: `🎲 语文随机(${cnCount}项)` },
                ...CHINESE_QUESTION_TYPES.map(t => ({ id: t.id, label: t.shortName }))
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
            const cnIn = u.chineseConfig?.includeInGrandRandom !== false;
            diffEl.textContent = cnIn
                ? `🎲 大随机(数${u.mathConfig?.enabledTypes?.length || 9}+语${u.chineseConfig?.enabledTypes?.length || 8}+英${u.englishConfig?.enabledTypes?.length || 6})`
                : `🎲 大随机(数${u.mathConfig?.enabledTypes?.length || 9}+英${u.englishConfig?.enabledTypes?.length || 6})`;
        } else if (topCat === 'chinese') {
            diffEl.textContent = `📖 语文 · ${ChineseEngine.formatSummary(u.chineseConfig)}`;
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
        const qs = typeof this.profileManager.getQuestionStats === 'function'
            ? this.profileManager.getQuestionStats(u)
            : { todayAttempted: ds.questionsAttempted || 0, totalAttempted: 0 };
        const roundTotal = this.mathEngine?.totalAttempted || 0;
        this.petBadgePillEl.classList.toggle('is-capped', ds.isCapped);
        if (ds.isCapped) {
            this.petBadgePillEl.innerHTML = `<span>🏅 ${u.badges}</span><span>· 今日已满</span><span>· 📝${qs.todayAttempted}题</span>`;
            this.petBadgePillEl.title = `${u.name}今日已拿满 ${ds.cap} 枚徽章｜本局已做 ${roundTotal} 题｜今日累计 ${qs.todayAttempted} 题｜全平台总计 ${qs.totalAttempted} 题`;
        } else {
            this.petBadgePillEl.innerHTML = `<span>🏅 ${u.badges}</span><span>· ${ds.earned}/${ds.cap}</span><span>· 📝${qs.todayAttempted}题</span>`;
            this.petBadgePillEl.title = `${u.name}可用 ${u.badges} 枚徽章（今日 ${ds.earned}/${ds.cap}，攒星 ${ds.starProgress}/3）｜本局已做 ${roundTotal} 题｜今日累计 ${qs.todayAttempted} 题｜全平台总计 ${qs.totalAttempted} 题`;
        }
    }

    /**
     * 供宿主键盘事件判断是否屏蔽数字键盘快捷输入：仅当显示数字输入框时才放行键盘数字输入
     */
    isEnglishActive() {
        return !this._numericKeypadVisible;
    }

    _rollGrandNextSubject() {
        const u = this.profileManager.getActiveUser();
        const includeCn = u?.chineseConfig?.includeInGrandRandom !== false;
        const pool = includeCn ? ['math', 'chinese', 'english'] : ['math', 'english'];

        let candidates = pool;
        if (this._grandStreakCount >= 2) {
            candidates = pool.filter(s => s !== this._grandStreakSubject);
        }
        const next = candidates[Math.floor(Math.random() * candidates.length)] || 'math';
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
        if (this._grandActiveSubject === 'chinese') {
            chineseEngine.nextQuestion(null);
            this.renderChineseStage();
        } else if (this._grandActiveSubject === 'english') {
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
        if (newMode === 'chinese') newMode = 'chinese_random';

        const isValid = ['grand_random', 'math_random', 'chinese_random', 'english_random', 'vocab_camp'].includes(newMode) ||
            ALL_MATH_TYPE_IDS.includes(newMode) ||
            ALL_CHINESE_TYPE_IDS.includes(newMode) ||
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

        if (topCat === 'chinese') {
            const forced = ALL_CHINESE_TYPE_IDS.includes(newMode) ? newMode : null;
            chineseEngine.nextQuestion(forced);
            this.renderChineseStage();
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

    _setPanelVisibility({ showNumericMath = false, showInteractiveMath = false, showEnglish = false, showChinese = false }) {
        this._numericKeypadVisible = Boolean(showNumericMath);
        if (this.bbInnerEl) this.bbInnerEl.style.display = showNumericMath ? '' : 'none';
        if (this.answerBoxEl) this.answerBoxEl.style.display = showNumericMath ? '' : 'none';
        if (this.keypadEl) this.keypadEl.style.display = showNumericMath ? '' : 'none';
        if (this.mathWidgetPanelEl) this.mathWidgetPanelEl.classList.toggle('active', Boolean(showInteractiveMath));
        if (this.enPanelEl) this.enPanelEl.classList.toggle('active', Boolean(showEnglish));
        if (this.cnPanelEl) this.cnPanelEl.classList.toggle('active', Boolean(showChinese));
        if (this.cardEl) {
            const curQ = this.mathEngine?.currentQuestion;
            const isPureCalc = showNumericMath && (!curQ || curQ.kind === 'calc');
            this.cardEl.classList.toggle('compact-rich-mode', !isPureCalc);
        }
    }

    /**
     * 当宿主游戏外部刷新小黑板（例如点击了数盾怪兽加载专属算式，或数字键盘答完一题后刷新）时调用
     */
    renderMathQuestion(options = {}) {
        const advanceGrand = options.advanceGrand !== false;
        const q = this.mathEngine.currentQuestion;
        this._interactiveMathLock = false;

        // 1. 战场破盾算式最高优先级：临时展示数字口算面板，不覆盖玩家的 entryMode 偏好！
        if (q && (q.isShieldNuke || q.isShieldTarget)) {
            this._renderNumericMathDOM(q);
            return;
        }

        // 2. 若玩家处于【🎲 大随机】，刚答对一道数字数学题后推进下一题（可能抽中英语或互动数学）；若答错保留当前数学题重算则不跳走
        if (this.entryMode === 'grand_random') {
            if (advanceGrand) {
                this._prepareNextGrandQuestion(true);
            } else {
                this._renderCurrentMathView();
            }
            return;
        }

        // 3. 若玩家处于语文、英语或英语课专项分支，保持对应视图
        const curTopCat = this._getTopCategory();
        if (curTopCat === 'chinese') {
            this.renderChineseStage();
            return;
        }
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
        if (this._interactiveMathLock) return;
        this._interactiveMathLock = true;
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
            this._interactiveMathLock = false;
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
            const questTickets = (prog.questEvents || []).reduce((s, ev) => s + (ev.ticketAdded || 0), 0);
            const questTip = questTickets > 0
                ? ` · 🏆三科全完+${questTickets}🎟️盲盒券!`
                : ((prog.questEvents && prog.questEvents.length > 0) ? ' · 📅单科打卡完成(+2🏅)!' : '');
            if (prog.actualBadges > 0) {
                return ` · 🏅+${prog.actualBadges}徽章${questTip}`;
            }
            if (prog.alreadyAtCap) {
                return ` · 今日徽章已满${questTip}`;
            }
            return ` · ⭐攒星${prog.starProgress}/3${questTip}`;
        } else {
            this.profileManager.recordQuestionAttempt({ isMath: true, isCorrect: false, combo: 0 });
            if (q) {
                this.profileManager.recordMathMistake(q, res?.userAns);
            }
            this.updateTopBadgePill();
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

            const isCourseQ = Boolean(
                englishEngine.currentQuiz?.mode === 'course_special' ||
                this._getTopCategory() === 'course'
            );
            const prog = this.profileManager.awardLearningProgress({
                title: isCampFinish
                    ? `🎓 [${gameTag}·背词营] 完成 5 词特训！`
                    : (isCourseQ
                        ? `🎓 [${gameTag}·校外英语课] 答对 ${wordObj.word}`
                        : `🔤 [${gameTag}·英语] 答对单词 ${wordObj.word}`),
                subjectTag: isCourseQ ? `${gameTag}·英语课` : `${gameTag}·英语`,
                badges: isCampFinish ? 3 : (evalRes.badgeEarned || 0),
                stars: isCampFinish ? 0 : (evalRes.starEarned || 1),
                gotTicket: Boolean(evalRes.gotGachaTicket || firstDailyCampTicket),
                isVocabCampFinish: isCampFinish,
                combo: battleRes.combo || 1,
                isMath: false,
                isCourseSpecial: isCourseQ
            });
            this.updateTopBadgePill();
            if (prog.actualBadges > 0) {
                badgeSuffix = ` · 🏅+${prog.actualBadges}徽章`;
            } else if (!prog.alreadyAtCap) {
                badgeSuffix = ` · ⭐攒星${prog.starProgress}/3`;
            }
            const questTickets = (prog.questEvents || []).reduce((s, ev) => s + (ev.ticketAdded || 0), 0);
            if (questTickets > 0) {
                badgeSuffix += ` · 🏆三科全完+${questTickets}🎟️盲盒券!`;
            } else if (prog.questEvents && prog.questEvents.length > 0) {
                badgeSuffix += ' · 📅单科打卡完成(+2🏅)!';
            } else if (prog.actualTicket) {
                badgeSuffix += ' · 🎟️+1盲盒券!';
            }
        } else {
            this.profileManager.recordQuestionAttempt({ isMath: false, isCorrect: false, combo: 0 });
            this.updateTopBadgePill();
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

    // ==================== 统编版小学语文 8 大题型渲染与战斗奖励闭环 ====================
    renderChineseStage() {
        if (!this.cnStageEl) return;
        this._setPanelVisibility({ showChinese: true });
        this._cnLock = false;

        const forced = ALL_CHINESE_TYPE_IDS.includes(this.entryMode) ? this.entryMode : null;
        if (!chineseEngine.currentQuestion || (forced && chineseEngine.currentQuestion.mode !== forced)) {
            chineseEngine.nextQuestion(forced);
        }
        const q = chineseEngine.currentQuestion;
        if (!q) return;

        const tMeta = CHINESE_QUESTION_TYPES.find(t => t.id === q.mode);
        const badgeTitle = this.entryMode === 'grand_random'
            ? `🎲 大随机 · ${tMeta ? tMeta.shortName : '语文'}`
            : (tMeta ? tMeta.name : '📖 趣味语文');
        if (this.cnModeLabelEl) {
            this.cnModeLabelEl.textContent = badgeTitle;
        }

        renderChineseQuizWidget(this.cnStageEl, q, {
            badgeTitle,
            theme: 'dark',
            onTapSound: () => this.onSoundResume(),
            speakChineseFn: (txt) => sharedSpeech.speakChinese(txt),
            onEvaluate: (isCorrect, userAns) => {
                if (this._cnLock) return;
                this._handleChineseAnswer(isCorrect, q, userAns);
            }
        });
    }

    _handleChineseAnswer(isCorrect, q, userAns) {
        this._cnLock = true;
        const evalRes = chineseEngine.evaluateResult(isCorrect, q, userAns);
        const battleRes = this.mathEngine.recordEnglishBattleAttempt({
            isCorrect,
            wordObj: { id: q.id, word: q.answer, zh: q.displayKey || q.promptText },
            userAns,
            isVocabCampFinish: false
        });

        let badgeSuffix = '';
        if (isCorrect) {
            if (q.isReview) {
                this.profileManager.resolveChineseMistake(q);
            }
            const gameTag = this.hostType === 'carrot' ? '兔蛙塔防' : '植物战僵尸';
            const tMeta = CHINESE_QUESTION_TYPES.find(t => t.id === q.mode);
            const modeTag = tMeta ? tMeta.shortName.replace(/^[^\s]+\s*/, '') : '语文';
            const prog = this.profileManager.awardLearningProgress({
                title: `📖 [${gameTag}·${modeTag}] 答对 ${q.displayKey || q.answer}`,
                subjectTag: `${gameTag}·语文`,
                badges: evalRes.badgeEarned || 0,
                stars: evalRes.starEarned || 1,
                gotTicket: Boolean(evalRes.gotGachaTicket),
                combo: battleRes.combo || 1,
                isMath: false,
                isChinese: true
            });
            this.updateTopBadgePill();
            if (prog.actualBadges > 0) {
                badgeSuffix = ` · 🏅+${prog.actualBadges}徽章`;
            } else if (!prog.alreadyAtCap) {
                badgeSuffix = ` · ⭐攒星${prog.starProgress}/3`;
            }
            const cnQuestTickets = (prog.questEvents || []).reduce((s, ev) => s + (ev.ticketAdded || 0), 0);
            if (cnQuestTickets > 0) {
                badgeSuffix += ` · 🏆三科全完+${cnQuestTickets}🎟️盲盒券!`;
            } else if (prog.questEvents && prog.questEvents.length > 0) {
                badgeSuffix += ' · 📅单科打卡完成(+2🏅)!';
            } else if (prog.actualTicket) {
                badgeSuffix += ' · 🎟️+1盲盒券!';
            }
        } else {
            this.profileManager.recordQuestionAttempt({ isMath: false, isChinese: true, isCorrect: false, combo: 0 });
            this.profileManager.recordChineseMistake(q, userAns);
            this.updateTopBadgePill();
        }

        this.onEnglishBattleResult(battleRes, {
            isEnglish: true, // 复用宿主奖励特效与反馈栏更新通道
            isChinese: true,
            wordObj: { word: q.answer, zh: q.fullText || q.displayKey },
            isCampFinish: false,
            badgeSuffix
        });

        const delayMs = isCorrect ? 850 : 1850;
        setTimeout(() => {
            if (this.entryMode === 'grand_random') {
                this._prepareNextGrandQuestion(false);
                return;
            }
            const forced = ALL_CHINESE_TYPE_IDS.includes(this.entryMode) ? this.entryMode : null;
            chineseEngine.nextQuestion(forced);
            this.renderChineseStage();
        }, delayMs);
    }
}
