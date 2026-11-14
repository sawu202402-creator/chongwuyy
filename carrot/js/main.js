/**
 * main.js - 保卫萝卜风游戏入口控制器与气泡交互绑定
 */

import { 
    GAME_CONFIG, 
    DIFFICULTY_LEVELS, 
    TOWER_TYPES, 
    AVATAR_OPTIONS, 
    MATH_OPERATIONS, 
    MATH_RANGES, 
    MULTIPLIER_RANGES,
    DEFAULT_USER_PROFILES 
} from './config.js?v=20261113_opt_v1';
import { LEVEL_CONFIGS, ensureStageConfigLoaded } from './map.js?v=20261113_opt_v1';
import { sound } from './audio.js?v=20261113_opt_v1';
import { assetsManager } from './assetsLoader.js?v=20261113_opt_v1';
import { MathEngine, MATH_QUESTION_TYPES, ALL_MATH_TYPE_IDS } from './mathEngine.js?v=20261114_modes_v1';
import { GameEngine } from './gameEngine.js?v=20261113_opt_v1';
import { MapEditor } from './editor.js?v=20261113_opt_v1';
import { LevelSelectManager } from './levelSelect.js?v=20261113_opt_v1';
import { profileManager } from '../../shared/unifiedProfile.js';
import { SmartChalkboard } from '../../shared/smartChalkboard.js';
import { sharedSpeech } from '../../shared/audioTTS.js';
import { ENGLISH_LEVELS, WORD_PACKS, ALL_WORDS, ENGLISH_QUESTION_TYPES, ALL_ENGLISH_TYPE_IDS } from '../../shared/englishEngine.js';
import { renderEnabledTypesSelector } from '../../shared/questionWidgets.js';
import { DAILY_BADGE_CAP_OPTIONS } from '../../pet/js/config.js';
import { requireParentGate } from '../../shared/parentGate.js';

// DOM 元素
const canvas = document.getElementById('battleCanvas');
const canvasContainer = document.getElementById('canvasContainer');
const livesValEl = document.getElementById('livesVal');
const goldValEl = document.getElementById('goldVal');
const waveValEl = document.getElementById('waveVal');
const syringeFluid = document.getElementById('syringeFluid');
const comboBadgeEl = document.getElementById('comboBadge');
const comboCountEl = document.getElementById('comboCount');
const btnMute = document.getElementById('btnMute');
const btnPause = document.getElementById('btnPause');
const btnSpeedToggle = document.getElementById('btnSpeedToggle');
const btnFullscreen = document.getElementById('btnFullscreen');
const gameAppEl = document.getElementById('game-app');
const btnEditorGrid = document.getElementById('btnEditorGrid');
const btnSelectLevel = document.getElementById('btnSelectLevel');
const btnNextLevel = document.getElementById('btnNextLevel');
const endMedalRow = document.getElementById('endMedalRow');

// 关卡选择弹窗元素
const levelSelectModal = document.getElementById('levelSelectModal');
const levelSelectGrid = document.getElementById('levelSelectGrid');
const btnCloseLevelModal = document.getElementById('btnCloseLevelModal');
const btnOpenLevelModalFromStart = document.getElementById('btnOpenLevelModalFromStart');
const startModalLevelTitle = document.getElementById('startModalLevelTitle');

// 波次提示
const waveBanner = document.getElementById('waveBanner');
const waveCountdownEl = document.getElementById('waveCountdown');
const btnCallWave = document.getElementById('btnCallWave');

// 保卫萝卜：就地弹出气泡菜单与管理气泡
const bubblePicker = document.getElementById('bubblePicker');
const bubbleGrid = document.getElementById('bubbleGrid');
const towerManageBubbles = document.getElementById('towerManageBubbles');
const btnUpgradeBubble = document.getElementById('btnUpgradeBubble');
const btnSellBubble = document.getElementById('btnSellBubble');
const bubbleUpgradeText = document.getElementById('bubbleUpgradeText');
const bubbleSellText = document.getElementById('bubbleSellText');

// 右侧小黑板
const rabbitTalk = document.getElementById('rabbitTalk');
const frogTalk = document.getElementById('frogTalk');
const questionHint = document.getElementById('questionHint');
const questionFormula = document.getElementById('questionFormula');
const answerInput = document.getElementById('answerInput');
const btnSubmitAnswer = document.getElementById('btnSubmitAnswer');
const feedbackMsg = document.getElementById('feedbackMsg');
const virtualKeypad = document.getElementById('virtualKeypad');

// 模态弹窗
const startModal = document.getElementById('startModal');
const endModal = document.getElementById('endModal');
const endModalTitle = document.getElementById('endModalTitle');
const endModalDesc = document.getElementById('endModalDesc');
const statTotalQuestions = document.getElementById('statTotalQuestions');
const statCorrectCount = document.getElementById('statCorrectCount');
const statMaxCombo = document.getElementById('statMaxCombo');
const statAccuracy = document.getElementById('statAccuracy');
const btnRestart = document.getElementById('btnRestart');
const btnStartGame = document.getElementById('btnStartGame');
const diffCards = document.querySelectorAll('.diff-jelly-card');

// 小朋友用户档案与难度设置相关元素
const btnUserProfile = document.getElementById('btnUserProfile');
const hudUserAvatar = document.getElementById('hudUserAvatar');
const hudUserName = document.getElementById('hudUserName');
const hudUserDiffTag = document.getElementById('hudUserDiffTag');

const btnStartKidEdit = document.getElementById('btnStartKidEdit');
const btnStartKidGear = document.getElementById('btnStartKidGear');
const startKidAvatar = document.getElementById('startKidAvatar');
const startKidName = document.getElementById('startKidName');
const startKidDiffSummary = document.getElementById('startKidDiffSummary');

const userProfileModal = document.getElementById('userProfileModal');
const btnCloseProfileModal = document.getElementById('btnCloseProfileModal');
const btnSaveUserProfile = document.getElementById('btnSaveUserProfile');
const btnCancelUserProfile = document.getElementById('btnCancelUserProfile');
const inputKidName = document.getElementById('inputKidName');
const avatarSelectGrid = document.getElementById('avatarSelectGrid');

const kidProfilesList = document.getElementById('kidProfilesList');
const btnAddNewKid = document.getElementById('btnAddNewKid');
const profileEditModeTag = document.getElementById('profileEditModeTag');
const btnDeleteKid = document.getElementById('btnDeleteKid');

// 黑板下方出战小朋友记录栏
const bbKidFooter = document.getElementById('bbKidFooter');
const bbKidAvatar = document.getElementById('bbKidAvatar');
const bbKidName = document.getElementById('bbKidName');
const bbKidDiffBadge = document.getElementById('bbKidDiffBadge');
const bbSyncBadge = document.getElementById('bbSyncBadge');
const btnBbKidGear = document.getElementById('btnBbKidGear');

const tabBtnCustom = document.getElementById('tabBtnCustom');
const tabBtnPreset = document.getElementById('tabBtnPreset');
const tabContentCustom = document.getElementById('tabContentCustom');
const tabContentPreset = document.getElementById('tabContentPreset');

const chkOp_add = document.getElementById('chkOp_add');
const chkOp_sub = document.getElementById('chkOp_sub');
const chkOp_mul = document.getElementById('chkOp_mul');
const chkOp_div = document.getElementById('chkOp_div');
const rangesGrid = document.getElementById('rangesGrid');
const chkOptFillBlank = document.getElementById('chkOptFillBlank');
const chkOptCarryBorrow = document.getElementById('chkOptCarryBorrow');
const presetGradeCards = document.getElementById('presetGradeCards');
const multipliersGrid = document.getElementById('multipliersGrid');
const blockMultiplierLimit = document.getElementById('blockMultiplierLimit');

// 战报与答题记录模态弹窗元素
const scoreRecordsModal = document.getElementById('scoreRecordsModal');
const btnScoreRecords = document.getElementById('btnScoreRecords');
const btnEndViewDetails = document.getElementById('btnEndViewDetails');
const btnProfileViewRecords = document.getElementById('btnProfileViewRecords');
const btnCloseRecordsModal = document.getElementById('btnCloseRecordsModal');
const recordsKidSelector = document.getElementById('recordsKidSelector');
const recMetricSessions = document.getElementById('recMetricSessions');
const recMetricQuestions = document.getElementById('recMetricQuestions');
const recMetricAccuracy = document.getElementById('recMetricAccuracy');
const recMetricCombo = document.getElementById('recMetricCombo');
const tabBtnHistoryList = document.getElementById('tabBtnHistoryList');
const tabBtnMistakesBook = document.getElementById('tabBtnMistakesBook');
const mistakesBadgeCount = document.getElementById('mistakesBadgeCount');
const recordsTabViewHistory = document.getElementById('recordsTabViewHistory');
const recordsTabViewMistakes = document.getElementById('recordsTabViewMistakes');
const recordsHistoryList = document.getElementById('recordsHistoryList');
const mistakesBookContainer = document.getElementById('mistakesBookContainer');
const btnClearKidHistory = document.getElementById('btnClearKidHistory');

// 统一档案中心由 ../../shared/unifiedProfile.js 提供（跨萌宠店长、兔蛙塔防、植物大战僵尸三游互通）

// 小朋友答题战报与成长成绩单管理类
class ScoreRecordsManager {
    constructor(profileMgr) {
        this.profileMgr = profileMgr;
        this.selectedUserId = null;
        this.activeTab = 'history'; // 'history' | 'mistakes'
        this.initEvents();
    }

    initEvents() {
        if (btnScoreRecords) {
            btnScoreRecords.addEventListener('click', () => {
                sound.resumeContext();
                this.openModal();
            });
        }
        if (btnEndViewDetails) {
            btnEndViewDetails.addEventListener('click', () => {
                sound.resumeContext();
                endModal.classList.remove('show');
                this.openModal();
            });
        }
        if (btnProfileViewRecords) {
            btnProfileViewRecords.addEventListener('click', () => {
                sound.resumeContext();
                userProfileModal.classList.remove('show');
                const targetId = (typeof editingUserId !== 'undefined' && editingUserId) ? editingUserId : this.profileMgr.data.activeUserId;
                this.openModal(targetId);
            });
        }
        if (btnCloseRecordsModal) {
            btnCloseRecordsModal.addEventListener('click', () => {
                this.closeModal();
            });
        }
        if (tabBtnHistoryList) {
            tabBtnHistoryList.addEventListener('click', () => {
                this.switchTab('history');
            });
        }
        if (tabBtnMistakesBook) {
            tabBtnMistakesBook.addEventListener('click', () => {
                this.switchTab('mistakes');
            });
        }
        if (btnClearKidHistory) {
            btnClearKidHistory.addEventListener('click', () => {
                const targetKid = this.profileMgr.getUser(this.selectedUserId);
                const name = targetKid ? targetKid.name : '该小朋友';
                if (confirm(`确定要清空【${name}】的所有做题与战报记录吗？`)) {
                    this.profileMgr.clearUserHistory(this.selectedUserId);
                    this.render();
                }
            });
        }
    }

    openModal(targetUserId = null) {
        this.selectedUserId = targetUserId || this.profileMgr.data.activeUserId;
        this.activeTab = 'history';
        this.render();
        if (scoreRecordsModal) {
            scoreRecordsModal.classList.add('show');
        }
    }

    closeModal() {
        if (scoreRecordsModal) {
            scoreRecordsModal.classList.remove('show');
        }
    }

    switchTab(tab) {
        this.activeTab = tab;
        if (tab === 'history') {
            if (tabBtnHistoryList) tabBtnHistoryList.classList.add('active');
            if (tabBtnMistakesBook) tabBtnMistakesBook.classList.remove('active');
            if (recordsTabViewHistory) recordsTabViewHistory.style.display = 'block';
            if (recordsTabViewMistakes) recordsTabViewMistakes.style.display = 'none';
        } else {
            if (tabBtnHistoryList) tabBtnHistoryList.classList.remove('active');
            if (tabBtnMistakesBook) tabBtnMistakesBook.classList.add('active');
            if (recordsTabViewHistory) recordsTabViewHistory.style.display = 'none';
            if (recordsTabViewMistakes) recordsTabViewMistakes.style.display = 'block';
        }
    }

    render() {
        const users = this.profileMgr.getUsers();
        if (!users || users.length === 0) return;

        if (!this.selectedUserId || !users.some(u => u.id === this.selectedUserId)) {
            this.selectedUserId = this.profileMgr.data.activeUserId;
        }

        const currentKid = this.profileMgr.getUser(this.selectedUserId) || users[0];

        // 1. 渲染小朋友切换条
        if (recordsKidSelector) {
            recordsKidSelector.innerHTML = '';
            users.forEach(u => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = `kid-select-chip ${u.id === currentKid.id ? 'active' : ''}`;
                chip.innerHTML = `<span class="chip-avatar">${u.avatar || '🐰'}</span><span>${u.name || '宝贝'}</span>`;
                chip.addEventListener('click', () => {
                    sound.resumeContext();
                    this.selectedUserId = u.id;
                    this.render();
                });
                recordsKidSelector.appendChild(chip);
            });
        }

        const history = currentKid.history || [];

        // 2. 统计宏观数据
        const totalSessions = history.length;
        let totalQuestions = 0;
        let totalCorrect = 0;
        let maxStreak = 0;
        const allMistakes = [];

        history.forEach(round => {
            const st = round.stats || {};
            const qAttempted = st.totalAttempted || 0;
            const qCorrect = st.correctCount || 0;
            totalQuestions += qAttempted;
            totalCorrect += qCorrect;
            if ((st.maxCombo || 0) > maxStreak) {
                maxStreak = st.maxCombo;
            }

            // 收集错题
            if (round.questions && round.questions.length > 0) {
                round.questions.forEach(q => {
                    if (!q.isCorrect) {
                        allMistakes.push({
                            ...q,
                            levelName: round.levelName || `第 ${round.levelId} 关`,
                            dateStr: round.dateStr || ''
                        });
                    }
                });
            }
        });

        const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 100;

        if (recMetricSessions) recMetricSessions.textContent = totalSessions;
        if (recMetricQuestions) recMetricQuestions.textContent = totalQuestions;
        if (recMetricAccuracy) recMetricAccuracy.textContent = `${overallAccuracy}%`;
        if (recMetricCombo) recMetricCombo.textContent = `x${maxStreak}`;
        if (mistakesBadgeCount) mistakesBadgeCount.textContent = allMistakes.length;

        // 3. 渲染历史对局列表
        this.renderHistoryList(history);

        // 4. 渲染错题攻坚本
        this.renderMistakesBook(allMistakes);

        // 确保 Tab 显示正确
        this.switchTab(this.activeTab);
    }

    renderHistoryList(history) {
        if (!recordsHistoryList) return;
        recordsHistoryList.innerHTML = '';

        if (!history || history.length === 0) {
            recordsHistoryList.innerHTML = `
                <div class="records-empty-state">
                    <div class="empty-emoji">🥕</div>
                    <div class="empty-title">还没有答题记录哦</div>
                    <div class="empty-tip">快去保护小兔子和小青蛙，在趣味防御战中大显身手吧！</div>
                </div>
            `;
            return;
        }

        history.forEach((round, index) => {
            const st = round.stats || {};
            const isVic = round.result === 'VICTORY';
            const card = document.createElement('div');
            card.className = 'history-record-card';

            const questions = round.questions || [];
            const questionsCount = questions.length;

            card.innerHTML = `
                <div class="record-card-top">
                    <div class="record-level-tag">
                        <span>🗺️</span>
                        <span>${round.levelName || `第 ${round.levelId} 关`}</span>
                        <span class="record-result-badge ${isVic ? 'victory' : 'defeat'}">
                            ${isVic ? '🎉 胜利通关' : '🛡️ 守卫力竭'}
                        </span>
                    </div>
                    <div class="record-time-text">${round.dateStr || ''}</div>
                </div>
                <div class="record-metrics-strip">
                    <span>做题: <strong>${st.totalAttempted || 0}</strong></span>
                    <span>答对: <strong style="color:#00b894;">${st.correctCount || 0}</strong></span>
                    <span>正确率: <strong style="color:#0984e3;">${st.accuracy || 0}%</strong></span>
                    <span>最高连击: <strong style="color:#e17055;">x${st.maxCombo || 0}</strong></span>
                    ${questionsCount > 0 ? `<button type="button" class="record-toggle-details-btn" data-round-idx="${index}">查看本局算式 (${questionsCount}道) ▾</button>` : ''}
                </div>
                ${questionsCount > 0 ? `
                    <div class="record-questions-drawer" id="drawer_round_${index}">
                        <div class="questions-chip-grid">
                            ${questions.map(q => {
                                const ok = q.isCorrect;
                                return `
                                    <div class="question-chip ${ok ? 'correct' : 'wrong'}" title="${ok ? '回答正确' : `你的答案: ${q.userAnswer}, 正确答案: ${q.answer}`}">
                                        <span>${q.expr}</span>
                                        ${ok 
                                            ? `<span>= ${q.answer} ✔️</span>` 
                                            : `<span class="chip-wrong-mark">≠ ${q.userAnswer !== undefined && q.userAnswer !== null && !isNaN(q.userAnswer) ? q.userAnswer : '空'} ❌</span><span class="chip-correct-val">(正解: ${q.answer})</span>`}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            `;

            recordsHistoryList.appendChild(card);
        });

        // 绑定折叠开关事件
        recordsHistoryList.querySelectorAll('.record-toggle-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-round-idx');
                const drawer = document.getElementById(`drawer_round_${idx}`);
                if (drawer) {
                    const isOpen = drawer.classList.contains('open');
                    if (isOpen) {
                        drawer.classList.remove('open');
                        e.currentTarget.textContent = e.currentTarget.textContent.replace('▴', '▾');
                    } else {
                        drawer.classList.add('open');
                        e.currentTarget.textContent = e.currentTarget.textContent.replace('▾', '▴');
                    }
                }
            });
        });
    }

    renderMistakesBook(mistakes) {
        if (!mistakesBookContainer) return;
        mistakesBookContainer.innerHTML = '';

        if (!mistakes || mistakes.length === 0) {
            mistakesBookContainer.innerHTML = `
                <div class="records-empty-state">
                    <div class="empty-emoji">🌟</div>
                    <div class="empty-title">太厉害了，目前零错题！</div>
                    <div class="empty-tip">心算准确率极高，继续保持神勇表现！</div>
                </div>
            `;
            return;
        }

        mistakes.forEach(m => {
            const card = document.createElement('div');
            card.className = 'mistake-item-card';
            card.innerHTML = `
                <div class="mistake-formula-box">
                    <div class="mistake-formula-title">${m.expr} = ?</div>
                    <div class="mistake-meta-info">关卡: ${m.levelName} · 记录时间: ${m.dateStr || ''}</div>
                </div>
                <div class="mistake-answer-compare">
                    <div class="compare-badge kid-answer">
                        <span class="sub-label">你的回答</span>
                        <span>${m.userAnswer !== undefined && m.userAnswer !== null && !isNaN(m.userAnswer) ? m.userAnswer : '未填'} ❌</span>
                    </div>
                    <div class="compare-badge right-answer">
                        <span class="sub-label">正确答案</span>
                        <span>${m.answer} ✔️</span>
                    </div>
                </div>
            `;
            mistakesBookContainer.appendChild(card);
        });
    }
}

const scoreRecordsManager = new ScoreRecordsManager(profileManager);
window.scoreRecordsManager = scoreRecordsManager;
const initialUser = profileManager.getActiveUser();

// 初始化引擎
let activeSlotForBubble = null; // 当前正在弹出建塔气泡的基座

const mathEngine = new MathEngine(initialUser.difficulty);
const gameEngine = new GameEngine(canvas, mathEngine, onGameStateChange);
const mapEditor = new MapEditor(gameEngine);
const smartBoard = new SmartChalkboard({
    hostType: 'carrot',
    mathEngine,
    profileManager,
    onSoundResume: () => sound.resumeContext(),
    shouldConfirmExit: () => Boolean(
        gameEngine &&
        (gameEngine.state === 'WAVE_RUNNING' || gameEngine.state === 'PREP') &&
        gameEngine.wave >= 2
    ),
    onEnglishBattleResult: (battleRes, meta) => {
        if (battleRes.correct) {
            feedbackMsg.className = 'bb-feedback correct';
            const prefix = meta.isInteractiveMath
                ? `✓ 数学答对！`
                : (meta.isCampFinish ? '🎉 5词背诵营通关！' : `✓ 英语答对【${meta.wordObj?.word || ''}】！`);
            feedbackMsg.textContent = `${prefix}+${battleRes.goldGain}G${meta.badgeSuffix || ''}`;
            triggerMascotReaction('correct', battleRes.combo);
            gameEngine.handleMathAnswerCorrect(battleRes);
        } else {
            feedbackMsg.className = 'bb-feedback wrong';
            feedbackMsg.textContent = meta.isInteractiveMath
                ? `✗ 答错啦，正确答案是 ${battleRes.expected}，继续加油！`
                : `✗ 选错啦，正确单词是 ${meta.wordObj?.word || ''} (${meta.wordObj?.zh || ''})`;
            gameEngine.handleMathAnswerWrong();
            triggerMascotReaction('wrong');
        }
    }
});
window.smartBoard = smartBoard;
gameEngine.onRenderOverlay = (ctx, time) => mapEditor.renderOverlay(time);
window.gameEngine = gameEngine;
window.mathEngine = mathEngine;
window.mapEditor = mapEditor;
window.profileManager = profileManager;
gameEngine.renderBubbleButtons = renderBubbleButtons;
gameEngine.renderLevelSelectGrid = () => {};

function setupCanvasResolution() {
    canvas.width = GAME_CONFIG.canvasWidth;
    canvas.height = GAME_CONFIG.canvasHeight;
}
setupCanvasResolution();

// 官方防御塔气泡建塔菜单圆形图标映射
const officialTowerIcons = {
    ADD_RAPID: 'assets/official/towers/icons/bottle_icon.png?v=20260925_all18_v1',
    MUL_CANNON: 'assets/official/towers/icons/sun_icon.png?v=20260925_all18_v1',
    DIV_FROST: 'assets/official/towers/icons/shit_icon.png?v=20260925_all18_v1',
    GEOM_LASER: 'assets/official/towers/icons/star_icon.png?v=20260925_all18_v1',
    FAN: 'assets/official/towers/icons/fan_icon.png?v=20260925_all18_v1',
    ROCKET: 'assets/official/towers/icons/rocket_icon.png?v=20260925_all18_v1',
    BALL: 'assets/official/towers/icons/ball_icon.png?v=20260925_all18_v1',
    FIRE_BOTTLE: 'assets/official/towers/icons/firebottle_icon.png?v=20260925_all18_v1',
    PIN: 'assets/official/towers/icons/pin_icon.png?v=20260925_all18_v1',
    ARROW: 'assets/official/towers/icons/arrow_icon.png?v=20260925_all18_v1',
    BLUE_STAR: 'assets/official/towers/icons/bluestar_icon.png?v=20260925_all18_v1',
    SNOW: 'assets/official/towers/icons/snow_icon.png?v=20260925_all18_v1',
    FISH: 'assets/official/towers/icons/fish_icon.png?v=20260925_all18_v1',
    PLANE: 'assets/official/towers/icons/plane_icon.png?v=20260925_all18_v1',
    ANCHOR: 'assets/official/towers/icons/anchor_icon.png?v=20260925_all18_v1',
    CUTTLE: 'assets/official/towers/icons/cuttle_icon.png?v=20260925_all18_v1',
    MUSHROOM: 'assets/official/towers/icons/mushroom_icon.png?v=20260925_all18_v1',
    BUFF: 'assets/official/towers/icons/buff_icon.png?v=20260925_all18_v1'
};

function getDisplayLevelName(lvl) {
    if (lvl > 36) return `4-${lvl - 36}`;
    if (lvl > 24) return `3-${lvl - 24}`;
    if (lvl > 12) return `2-${lvl - 12}`;
    return `1-${lvl}`;
}

// 渲染保卫萝卜官方气泡群 (按关卡配置的 availableTowers 动态渲染专属武器)
function renderBubbleButtons() {
    bubbleGrid.innerHTML = '';
    const currentConfig = gameEngine?.map?.currentLevelConfig;
    const allowed = currentConfig?.availableTowers || Object.keys(TOWER_TYPES);

    allowed.forEach(typeKey => {
        const tower = TOWER_TYPES[typeKey];
        if (!tower) return;
        const btn = document.createElement('button');
        btn.className = 'tower-bubble-btn';
        btn.id = `bubble-btn-${tower.id}`;
        btn.title = `${tower.name} (${tower.cost}G)`;
        const iconSrc = officialTowerIcons[tower.id] || '';
        btn.dataset.cost = String(tower.cost);
        btn.innerHTML = `
            <img src="${iconSrc}" class="bubble-tower-img" alt="${tower.name} (${tower.cost}G)" />
        `;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            sound.resumeContext();
            if (activeSlotForBubble) {
                if (gameEngine.gold < tower.cost) {
                    sound.playSelectFault();
                    gameEngine.projectileSystem.addFloatingText(
                        activeSlotForBubble.x,
                        activeSlotForBubble.y - 24,
                        `金币不足 (${tower.cost}🪙)`,
                        '#ff4757',
                        15,
                        true
                    );
                    rabbitTalk.textContent = `还差 ${tower.cost - gameEngine.gold} 金币！快答一道题吧！🪙`;
                    return;
                }
                const built = gameEngine.buildTower(tower.id, activeSlotForBubble);
                if (built) {
                    hideBubblePicker();
                }
            }
        });
        bubbleGrid.appendChild(btn);
    });
}
renderBubbleButtons();

// 显示建塔气泡
function showBubblePickerAt(slot) {
    activeSlotForBubble = slot;
    hideTowerManageBubbles();
    renderBubbleButtons();

    // 智能边界限制：防止边缘槽位弹出的气泡菜单超出画布容器被截断
    let px = slot.x;
    // 默认在基座正上方浮起
    let py = slot.y - 48;

    // 气泡菜单根据可用防御塔数量动态计算宽度
    const currentConfig = gameEngine?.map?.currentLevelConfig;
    const numTowers = (currentConfig?.availableTowers || Object.keys(TOWER_TYPES)).length;
    const halfWidth = Math.max(80, (numTowers * 72 + 30) / 2);
    const halfHeight = 46;

    // 水平左右防截断 (留 12px 安全边距)
    if (px - halfWidth < 12) {
        px = halfWidth + 12;
    } else if (px + halfWidth > GAME_CONFIG.canvasWidth - 12) {
        px = GAME_CONFIG.canvasWidth - halfWidth - 12;
    }

    // 垂直上下防截断：如果顶部太近则在槽位下方弹出
    if (slot.y < 105) {
        py = slot.y + 52;
    } else if (py - halfHeight < 12) {
        py = halfHeight + 12;
    } else if (py + halfHeight > GAME_CONFIG.canvasHeight - 12) {
        py = GAME_CONFIG.canvasHeight - halfHeight - 12;
    }

    // 计算基座在 Canvas Container 上的相对百分比位置
    const percentX = (px / GAME_CONFIG.canvasWidth) * 100;
    const percentY = (py / GAME_CONFIG.canvasHeight) * 100;

    bubblePicker.style.left = `${percentX}%`;
    bubblePicker.style.top = `${percentY}%`;
    bubblePicker.classList.add('active');

    updateBubbleCostState();
}

// 隐藏建塔气泡
function hideBubblePicker() {
    bubblePicker.classList.remove('active');
    activeSlotForBubble = null;
}

// 显示已建塔管理气泡 (升级与出售)
function showTowerManageBubblesAt(tower) {
    hideBubblePicker();

    // 智能边界限制：升级出售气泡菜单防截断 (总宽约 260px，半宽 135px)
    let px = tower.x;
    let py = tower.y - 45;
    const halfWidth = 145;
    const halfHeight = 35;

    if (px - halfWidth < 12) {
        px = halfWidth + 12;
    } else if (px + halfWidth > GAME_CONFIG.canvasWidth - 12) {
        px = GAME_CONFIG.canvasWidth - halfWidth - 12;
    }

    if (tower.y < 95) {
        py = tower.y + 50;
    } else if (py - halfHeight < 12) {
        py = halfHeight + 12;
    } else if (py + halfHeight > GAME_CONFIG.canvasHeight - 12) {
        py = GAME_CONFIG.canvasHeight - halfHeight - 12;
    }

    const percentX = (px / GAME_CONFIG.canvasWidth) * 100;
    const percentY = (py / GAME_CONFIG.canvasHeight) * 100;

    towerManageBubbles.style.left = `${percentX}%`;
    towerManageBubbles.style.top = `${percentY}%`;

    // 升级信息
    if (tower.level < tower.maxLevel) {
        const cost = tower.getUpgradeCost();
        btnUpgradeBubble.style.display = 'flex';
        btnUpgradeBubble.classList.remove('max-level');
        bubbleUpgradeText.textContent = `升级 Lv.${tower.level + 1} (${cost}🪙)`;
        btnUpgradeBubble.disabled = gameEngine.gold < cost;
        btnUpgradeBubble.style.opacity = gameEngine.gold < cost ? '0.5' : '1';
    } else {
        btnUpgradeBubble.style.display = 'flex';
        btnUpgradeBubble.classList.add('max-level');
        bubbleUpgradeText.textContent = `★ 已达顶级 (MAX)`;
        btnUpgradeBubble.disabled = true;
        btnUpgradeBubble.style.opacity = '0.9';
    }

    // 出售信息
    bubbleSellText.textContent = `拆除 (+${tower.getSellValue()}🪙)`;

    towerManageBubbles.classList.add('active');
}

function hideTowerManageBubbles() {
    towerManageBubbles.classList.remove('active');
}

// 更新气泡金币可买状态
function updateBubbleCostState() {
    Object.values(TOWER_TYPES).forEach(tower => {
        const btn = document.getElementById(`bubble-btn-${tower.id}`);
        if (btn) {
            if (gameEngine.gold < tower.cost) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        }
    });
}

// 刷新右侧数学/应用题/图表/英语题目卡片
function updateQuestionUI() {
    smartBoard.renderMathQuestion();
}

// 触发萌宠助教互动
function triggerMascotReaction(type, combo = 0) {
    if (type === 'correct') {
        if (combo >= 5) {
            rabbitTalk.textContent = `😎 ${combo}连击！超载啦！`;
            frogTalk.textContent = `🐸 呱！兔蛙无敌！`;
        } else {
            const rabbitCheers = ['算得太棒啦！🥕', '兔兔开心！', '胡萝卜加足！'];
            const frogCheers = ['呱呱！厉害！', '荷叶泡泡准备！', '守住乐园！'];
            rabbitTalk.textContent = rabbitCheers[Math.floor(Math.random() * rabbitCheers.length)];
            frogTalk.textContent = frogCheers[Math.floor(Math.random() * frogCheers.length)];
        }
    } else if (type === 'wrong') {
        rabbitTalk.textContent = '没关系，再试一次！';
        frogTalk.textContent = '呱！别灰心！';
    }

    setTimeout(() => {
        rabbitTalk.textContent = '兔兔在认真看题~';
        frogTalk.textContent = '呱！保护乐园！';
    }, 2800);
}

// 提交答案
function handleAnswerSubmit() {
    sound.resumeContext();
    if (smartBoard.isEnglishActive()) return;
    const val = answerInput.value.trim();
    if (!val) return;

    const res = mathEngine.submitAnswer(val);
    const badgeSuffix = smartBoard.recordMathProgress(res);
    if (res.correct) {
        feedbackMsg.className = 'bb-feedback correct';
        if (res.isShieldNuke) {
            feedbackMsg.textContent = `💥 弱点命中！破盾神击！+${res.goldGain}G${badgeSuffix}`;
            rabbitTalk.textContent = '🎯 算太准啦！一击破盾！🥕';
            frogTalk.textContent = '🐸 呱！神算弱点秒杀！';
            document.querySelector('.chalkboard-card')?.classList.remove('targeting-enemy');
        } else if (gameEngine.targetedProp && !gameEngine.targetedProp.isDead) {
            feedbackMsg.textContent = `⚡ 心算暴击！重创【${gameEngine.targetedProp.name}】！+${res.goldGain}G${badgeSuffix}`;
            rabbitTalk.textContent = `⚡ 答对啦！心算暴击砸向【${gameEngine.targetedProp.name}】！`;
            frogTalk.textContent = '🐸 呱！再答几道就能打爆它！';
        } else {
            feedbackMsg.textContent = `✓ 太棒了！+${res.goldGain}G ${res.combo > 1 ? `连击 x${res.combo}` : ''}${badgeSuffix}`;
            triggerMascotReaction('correct', res.combo);
        }
        gameEngine.handleMathAnswerCorrect(res);
    } else {
        feedbackMsg.className = 'bb-feedback wrong';
        feedbackMsg.textContent = `✗ 算错啦，连击清空，再仔细算算哦！`;
        gameEngine.handleMathAnswerWrong();
        triggerMascotReaction('wrong');
    }

    updateQuestionUI();
}

// 监听游戏状态变更
function onGameStateChange(status) {
    livesValEl.textContent = status.lives;
    goldValEl.textContent = status.gold;
    waveValEl.textContent = `${status.wave}/${status.maxWaves}`;

    // 更新水银注射器进度条
    if (syringeFluid) {
        const progress = Math.max(10, Math.min(100, (status.wave / status.maxWaves) * 100));
        syringeFluid.style.width = `${progress}%`;
    }

    // 连击徽章
    if (status.combo > 1) {
        comboBadgeEl.classList.add('active');
        comboCountEl.textContent = `x${status.combo}`;
    } else {
        comboBadgeEl.classList.remove('active');
    }

    // 波次倒计时
    if (status.state === 'PREPARING') {
        waveBanner.style.display = 'flex';
        waveCountdownEl.textContent = `备战中 (${status.waveBreakTimer}s)`;
    } else {
        waveBanner.style.display = 'none';
    }

    // 更新关卡指示与倍速/暂停状态
    if (btnSelectLevel && status.currentLevel) {
        btnSelectLevel.textContent = `🗺️ 第 ${getDisplayLevelName(status.currentLevel)} 关 ▾`;
    }
    if (btnSpeedToggle) {
        const spd = status.gameSpeed || 1;
        btnSpeedToggle.textContent = `⚡ ${spd}x`;
        btnSpeedToggle.classList.toggle('speed-2x', spd === 2);
    }
    if (btnPause && status.state) {
        btnPause.textContent = status.state === 'PAUSED' ? '▶️' : '⏸️';
    }

    updateBubbleCostState();

    // 塔被选中或更新
    if (status.selectedTower) {
        showTowerManageBubblesAt(status.selectedTower);
    } else if (!activeSlotForBubble) {
        hideTowerManageBubbles();
    }

    // 胜负结算
    if (status.state === 'VICTORY' || status.state === 'GAME_OVER') {
        hideBubblePicker();
        hideTowerManageBubbles();
        showEndModal(status.state === 'VICTORY');
    }
}

// 结算弹窗
function showEndModal(isVictory) {
    endModal.classList.add('show');
    if (isVictory) {
        const maxLives = gameEngine.maxLives || 10;
        const livesLeft = gameEngine.lives;
        const allCleared = Boolean(gameEngine.allPropsCleared);
        const honor = levelSelectManager.recordLevelCompletion(
            gameEngine.map.currentLevelConfig.id,
            livesLeft,
            maxLives,
            allCleared
        );

        let carrotBadgeHtml = '';
        let carrotName = '铜萝卜守护奖章 🥉🥕';
        if (honor.earnedCarrot === 'gold') {
            carrotName = '满血金萝卜特级奖杯 🥇🥕';
            carrotBadgeHtml = `<span class="end-medal-pill end-medal-gold">🥇 金萝卜达成 (${livesLeft}/${maxLives}❤️ 无伤)</span>`;
        } else if (honor.earnedCarrot === 'silver') {
            carrotName = '闪耀银萝卜守护奖杯 🥈🥕';
            carrotBadgeHtml = `<span class="end-medal-pill end-medal-silver">🥈 银萝卜达成 (${livesLeft}/${maxLives}❤️)</span>`;
        } else {
            carrotBadgeHtml = `<span class="end-medal-pill end-medal-bronze">🥉 铜萝卜通关 (${livesLeft}/${maxLives}❤️)</span>`;
        }
        if (allCleared) {
            carrotBadgeHtml += `<span class="end-medal-pill end-medal-allclear">💎 道具全清奖章</span>`;
        }

        if (endMedalRow) {
            endMedalRow.innerHTML = carrotBadgeHtml;
            endMedalRow.style.display = 'flex';
        }

        endModalTitle.textContent = honor.earnedCarrot === 'gold' ? '🏆 金萝卜大胜利！' : '🎉 乐园大胜利！';
        endModalDesc.textContent = `你成功守卫了${gameEngine.map.currentLevelConfig.name}！荣获【${carrotName}】${allCleared ? '与【道具全清水晶章】' : ''}！`;
        if (btnNextLevel) {
            btnNextLevel.style.display = 'inline-block';
            if (gameEngine.currentLevel < 48) {
                const nextLvl = gameEngine.currentLevel + 1;
                const nextDisplay = getDisplayLevelName(nextLvl);
                btnNextLevel.textContent = `挑战第 ${nextDisplay} 关 🚀`;
            } else {
                btnNextLevel.textContent = '🏆 全主题大满贯通关！重返第 1-1 关 🔄';
            }
        }
    } else {
        if (endMedalRow) {
            endMedalRow.innerHTML = '';
            endMedalRow.style.display = 'none';
        }
        endModalTitle.textContent = '⚔️ 基地失守了';
        endModalDesc.textContent = '怪兽啃掉了阿波，但你的心算能力突飞猛进，再来一局必夺金萝卜！';
        if (btnNextLevel) {
            btnNextLevel.style.display = 'none';
        }
    }

    const total = mathEngine.totalAttempted;
    const correct = mathEngine.correctCount;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    statTotalQuestions.textContent = total;
    statCorrectCount.textContent = correct;
    statMaxCombo.textContent = `x${mathEngine.maxCombo}`;
    statAccuracy.textContent = `${accuracy}%`;

    // 自动记录本局小朋友的答题成绩与做题轨迹（防单局多次弹窗重复记录）
    if (!gameEngine._roundRecorded) {
        gameEngine._roundRecorded = true;
        const activeKid = profileManager.getActiveUser();
        const roundRecord = {
            id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            userId: activeKid ? activeKid.id : 'user_default',
            userName: activeKid ? activeKid.name : '小勇士',
            userAvatar: activeKid ? activeKid.avatar : '🐰',
            timestamp: Date.now(),
            dateStr: new Date().toLocaleString('zh-CN', { hour12: false }),
            levelId: gameEngine.map.currentLevelConfig?.id || gameEngine.currentLevel,
            levelName: gameEngine.map.currentLevelConfig?.name || `第 ${gameEngine.currentLevel} 关`,
            result: isVictory ? 'VICTORY' : 'DEFEAT',
            waveReached: gameEngine.wave,
            maxWaves: gameEngine.maxWaves || 10,
            stats: {
                totalAttempted: total,
                correctCount: correct,
                wrongCount: Math.max(0, total - correct),
                accuracy: accuracy,
                maxCombo: mathEngine.maxCombo,
                scoreEarned: (correct * 10) + (isVictory ? 100 : 0)
            },
            questions: (mathEngine.roundQuestions && mathEngine.roundQuestions.length > 0)
                ? JSON.parse(JSON.stringify(mathEngine.roundQuestions))
                : []
        };
        profileManager.recordGameRound(roundRecord);
    }
}

// 点击画布事件 (保卫萝卜怪物锁头/弱点解算、就地建塔与管理、道具集火)
canvas.addEventListener('click', (e) => {
    if (mapEditor && mapEditor.isEditing) return;
    sound.resumeContext();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    // 0. 优先检测是否点击了怪物 (支持直接点击怪物或弱点算式进行集火锁头与答题破盾)
    let clickedMonster = null;
    // 优先匹配弱点数盾怪（玩家最迫切想要点击并解算的怪物）
    for (let i = gameEngine.enemies.length - 1; i >= 0; i--) {
        const enemy = gameEngine.enemies[i];
        if (enemy.hasMathShield && enemy.isHit(px, py)) {
            clickedMonster = enemy;
            break;
        }
    }
    // 若未点到数盾怪，再匹配其他普通怪兽
    if (!clickedMonster) {
        for (let i = gameEngine.enemies.length - 1; i >= 0; i--) {
            const enemy = gameEngine.enemies[i];
            if (enemy.isHit(px, py)) {
                clickedMonster = enemy;
                break;
            }
        }
    }

    if (clickedMonster) {
        gameEngine.targetedEnemy = clickedMonster;
        gameEngine.targetedProp = null;
        sound.play('TowerSelect');

        // 如果是有数盾弱点的怪物，将怪物的算式直接精准加载到右侧小黑板上！
        if (clickedMonster.hasMathShield && clickedMonster.shieldProblem) {
            mathEngine.loadCustomProblem({
                expr: clickedMonster.shieldProblem.expr,
                answer: clickedMonster.shieldProblem.answer,
                hint: `🎯 锁定弱点【${clickedMonster.config.name || '数盾怪'}】(答对核爆破盾！)`,
                isShieldNuke: true,
                enemyRef: clickedMonster
            });
            updateQuestionUI();

            const card = document.querySelector('.chalkboard-card');
            if (card) {
                card.classList.add('targeting-enemy');
            }
            rabbitTalk.textContent = '🎯 锁定怪兽算式啦！快算！';
            frogTalk.textContent = '🐸 呱！破盾核弹准备就绪！';
            gameEngine.projectileSystem.addFloatingText(clickedMonster.x, clickedMonster.y - 45, '🎯 弱点已同步小黑板!', '#fd79a8', 20, true);
        } else {
            gameEngine.projectileSystem.addFloatingText(clickedMonster.x, clickedMonster.y - 30, '🎯 集火目标!', '#ff3838', 16, true);
        }

        // 清理已展开的建筑悬浮气泡、选中塔与已锁定的场景道具
        gameEngine.selectedTower = null;
        gameEngine.selectedSlot = null;
        gameEngine.targetedProp = null;
        hideBubblePicker();
        hideTowerManageBubbles();
        gameEngine.notifyState();
        return;
    }

    // 1. 检查是否点击了已建防御塔
    for (const t of gameEngine.towers) {
        const dist = Math.hypot(t.x - px, t.y - py);
        if (dist <= 28) {
            gameEngine.selectedTower = t;
            gameEngine.selectedSlot = null;
            gameEngine.targetedEnemy = null;
            gameEngine.targetedProp = null;
            document.querySelector('.chalkboard-card')?.classList.remove('targeting-enemy');
            sound.play('TowerSelect');
            showTowerManageBubblesAt(t);
            gameEngine.notifyState();
            return;
        }
    }

    // 2. 检查是否点击了关卡场景道具 (先于空基座检查，防止道具覆盖的格子被误判为空建塔槽位)
    const prop = gameEngine.map.findPropAt(px, py);
    if (prop) {
        gameEngine.targetedProp = (gameEngine.targetedProp === prop) ? null : prop;
        if (gameEngine.targetedProp) {
            sound.play('TowerSelect');
            gameEngine.projectileSystem.addFloatingText(prop.x, prop.y - 30, `🎯 锁定道具: ${prop.name}!`, '#ff4757', 18, true);
            rabbitTalk.textContent = `🎯 锁定【${prop.name}】！答对题目可对其造成心算暴击！`;
            frogTalk.textContent = '🐸 呱！集火它，打爆有大奖！';
        } else {
            sound.playTone(440, 'sine', 0.1, 0.1);
        }
        gameEngine.targetedEnemy = null;
        gameEngine.selectedSlot = null;
        gameEngine.selectedTower = null;
        document.querySelector('.chalkboard-card')?.classList.remove('targeting-enemy');
        hideBubblePicker();
        hideTowerManageBubbles();
        gameEngine.notifyState();
        return;
    }

    // 2.5 保卫萝卜1经典彩蛋：点击终点胡萝卜阿波，阿波摇晃眨眼并发出呆萌叫声！
    if (gameEngine.map.isCarrotHit && gameEngine.map.isCarrotHit(px, py)) {
        gameEngine.map.triggerCarrotWiggle(0.65);
        sound.playCarrotTap();
        gameEngine.projectileSystem.addFloatingText(
            gameEngine.map.baseCrystal.x,
            gameEngine.map.baseCrystal.y - 36,
            `🥕 阿波元气满满! (${gameEngine.lives}/${gameEngine.maxLives || 10}❤️)`,
            '#ff9f43',
            15,
            true
        );
        hideBubblePicker();
        hideTowerManageBubbles();
        return;
    }

    // 3. 检查是否点击了空基座 (弹出保卫萝卜气泡建塔)
    const slot = gameEngine.map.findSlotAt(px, py);
    if (slot && !slot.occupied) {
        gameEngine.selectedSlot = slot;
        gameEngine.selectedTower = null;
        gameEngine.targetedEnemy = null;
        gameEngine.targetedProp = null;
        document.querySelector('.chalkboard-card')?.classList.remove('targeting-enemy');
        sound.play('TowerSelect');
        showBubblePickerAt(slot);
        gameEngine.notifyState();
        return;
    }

    // 4. 点击了空白处，隐藏所有气泡并取消选中，并短暂提示建塔槽位2秒后淡出消失
    gameEngine.selectedTower = null;
    gameEngine.selectedSlot = null;
    gameEngine.targetedEnemy = null;
    gameEngine.targetedProp = null;
    gameEngine.map.triggerSlotHint(2.0);
    document.querySelector('.chalkboard-card')?.classList.remove('targeting-enemy');
    hideBubblePicker();
    hideTowerManageBubbles();
    gameEngine.notifyState();
});

// 鼠标悬停感知：怪物与道具出现准星指示，槽位与防御塔出现手型指示
canvas.addEventListener('mousemove', (e) => {
    if (mapEditor && mapEditor.isEditing) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    // 是否悬停在怪物上 (展示准星光标)
    const hoverEnemy = gameEngine.enemies.some(m => m.isHit(px, py));
    if (hoverEnemy) {
        canvas.style.cursor = 'crosshair';
        gameEngine.map.hoveredSlot = null;
        return;
    }

    // 是否悬停在道具上 (展示准星光标)
    const hoverProp = gameEngine.map.findPropAt(px, py);
    if (hoverProp) {
        canvas.style.cursor = 'crosshair';
        gameEngine.map.hoveredSlot = null;
        return;
    }

    // 是否悬停在防御塔、胡萝卜阿波或可用底座上
    const hoverTower = gameEngine.towers.some(t => Math.hypot(t.x - px, t.y - py) <= 28);
    const hoverCarrot = gameEngine.map.isCarrotHit && gameEngine.map.isCarrotHit(px, py);
    const hoverSlot = gameEngine.map.findSlotAt(px, py);
    gameEngine.map.hoveredSlot = (hoverSlot && !hoverSlot.occupied) ? hoverSlot : null;

    if (hoverTower || hoverCarrot || hoverSlot) {
        canvas.style.cursor = 'pointer';
        return;
    }

    canvas.style.cursor = 'default';
});

canvas.addEventListener('mouseleave', () => {
    gameEngine.map.hoveredSlot = null;
});

// 升级与出售气泡按钮事件
btnUpgradeBubble.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.resumeContext();
    if (gameEngine.selectedTower) {
        gameEngine.upgradeSelectedTower();
        if (gameEngine.selectedTower) {
            showTowerManageBubblesAt(gameEngine.selectedTower);
        }
    }
});

btnSellBubble.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.resumeContext();
    if (gameEngine.selectedTower) {
        gameEngine.sellSelectedTower();
        hideTowerManageBubbles();
    }
});

// 答题与键盘输入 (针对 iPad 平板深度优化：绝不弹出系统软键盘，同时支持屏幕彩色按键与外接物理键盘)
btnSubmitAnswer.addEventListener('click', () => {
    sound.resumeContext();
    handleAnswerSubmit();
});

// 防止在 iPad / 移动端点击输入框唤起系统虚拟软键盘
answerInput.addEventListener('focus', (e) => {
    e.preventDefault();
    answerInput.blur();
});
answerInput.addEventListener('click', (e) => {
    e.preventDefault();
    answerInput.blur();
});

// 屏幕虚拟饼干数字键盘 (0~9, 清空, 退格)
virtualKeypad.addEventListener('click', (e) => {
    sound.resumeContext();
    const target = e.target.closest('.cookie-key');
    if (!target) return;

    const key = target.dataset.key;
    if (key === 'backspace') {
        answerInput.value = answerInput.value.slice(0, -1);
    } else if (key === 'clear') {
        answerInput.value = '';
    } else if (key !== undefined) {
        answerInput.value += key;
    }
    // 注意：严禁在此调用 answerInput.focus()，以防 iPad 弹出遮挡半屏的系统软键盘
});

// 全局键盘监听 (兼顾 PC 键盘、笔记本键盘以及 iPad 妙控键盘/蓝牙外接键盘)
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (startModal.classList.contains('show') || endModal.classList.contains('show')) return;
    if (smartBoard.isEnglishActive()) return;
    
    // 如果焦点在档案弹窗的名字输入框中，正常允许输入中文姓名，不拦截
    if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement !== answerInput) {
        return;
    }

    if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        sound.resumeContext();
        answerInput.value += e.key;
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        sound.resumeContext();
        answerInput.value = answerInput.value.slice(0, -1);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        sound.resumeContext();
        handleAnswerSubmit();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        answerInput.value = '';
    }
});

// 迎战下一波
btnCallWave.addEventListener('click', () => {
    sound.resumeContext();
    gameEngine.callNextWaveImmediately();
});

// 暂停与静音
btnMute.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    sharedSpeech.setMuted(isMuted);
    btnMute.textContent = isMuted ? '🔇' : '🔊';
});

btnPause.addEventListener('click', () => {
    sound.resumeContext();
    gameEngine.togglePause();
    btnPause.textContent = gameEngine.state === 'PAUSED' ? '▶️' : '⏸️';
});

if (btnSpeedToggle) {
    btnSpeedToggle.addEventListener('click', () => {
        sound.resumeContext();
        const spd = gameEngine.toggleSpeed();
        btnSpeedToggle.textContent = `⚡ ${spd}x`;
        btnSpeedToggle.classList.toggle('speed-2x', spd === 2);
    });
}

if (btnEditorGrid) {
    btnEditorGrid.addEventListener('click', () => {
        gameEngine.map.showGrid = !gameEngine.map.showGrid;
        btnEditorGrid.textContent = gameEngine.map.showGrid ? '📐 网格: 开' : '📐 网格: 关';
        btnEditorGrid.classList.toggle('active', gameEngine.map.showGrid);
    });
}

// 全屏沉浸模式切换 (隐藏 iOS / iPadOS Safari 及各浏览器地址栏与边框)
if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => toggleFullscreen());
    document.addEventListener('fullscreenchange', () => syncFullscreenBtn());
    document.addEventListener('webkitfullscreenchange', () => syncFullscreenBtn());
}

function toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const root = document.documentElement;
        if (root.requestFullscreen) {
            root.requestFullscreen().catch(() => {});
        } else if (root.webkitRequestFullscreen) {
            root.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

function syncFullscreenBtn() {
    if (!btnFullscreen) return;
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
    btnFullscreen.innerText = isFull ? '🗗' : '⛶';
    btnFullscreen.title = isFull ? '退出全屏' : '进入全屏沉浸模式 (隐藏浏览器边框)';
    setTimeout(() => fitToScreen(), 100);
}

// 防止 iOS Safari 独立 WebApp (添加到主屏幕) 内部发生跳转时被系统强制弹出浏览器地址栏
if (window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches) {
    document.addEventListener('click', (e) => {
        let target = e.target;
        while (target && target.nodeName !== 'A') {
            target = target.parentNode;
        }
        if (target && target.nodeName === 'A' && target.getAttribute('href')) {
            const href = target.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                e.preventDefault();
                window.location.href = href;
            }
        }
    }, false);
}

/**
 * 屏幕自适应等比缩放引擎 (参照 shuxuejs iPadOS / 平板全屏解决方案)
 * 解决 iPad / 平板全屏或添加到主屏幕后画面过大、右侧计算器溢出屏幕或不能完整可视的问题
 * 保持 960x560 战场与右侧算术黑板 1:1 并排完整可视，且触控与点击坐标 100% 精准
 */
export function fitToScreen() {
    const app = gameAppEl || document.getElementById('game-app');
    if (!app) return;

    const baseW = 1290;
    const baseH = 720;
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // 预留平板防误触及安全区边距
    const padX = 16;
    const padY = 16;
    const availW = Math.max(320, winW - padX);
    const availH = Math.max(320, winH - padY);

    const scaleX = availW / baseW;
    const scaleY = availH / baseH;
    const scale = Math.min(scaleX, scaleY, 1);

    if (scale < 0.995) {
        app.style.transformOrigin = 'top center';
        app.style.transform = `scale(${scale})`;
        app.style.width = `${baseW}px`;
        app.style.maxWidth = 'none';

        const scaledH = Math.ceil(baseH * scale);
        const topMargin = Math.max(0, Math.floor((winH - scaledH) / 2));
        if (document.body) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingTop = `${topMargin}px`;
            document.body.style.paddingBottom = '0px';
            document.body.style.paddingLeft = '0px';
            document.body.style.paddingRight = '0px';
        }
    } else {
        app.style.transformOrigin = 'top center';
        app.style.transform = '';
        app.style.width = '100%';
        app.style.maxWidth = '1300px';
        if (document.body) {
            document.body.style.overflow = '';
            document.body.style.padding = '8px 12px';
        }
    }
}

// 窗口尺寸变化与屏幕旋转自适应
window.addEventListener('resize', () => fitToScreen());
window.addEventListener('orientationchange', () => {
    setTimeout(() => fitToScreen(), 200);
});
export const levelSelectManager = new LevelSelectManager(sound, async (stageNum) => {
    if (
        gameEngine &&
        (gameEngine.state === 'WAVE_RUNNING' || gameEngine.state === 'PREP') &&
        gameEngine.wave >= 2 &&
        stageNum !== gameEngine.currentLevel
    ) {
        if (!confirm('当前关卡已战斗多波，确定要放弃本局进度切换到新关卡吗？')) {
            return;
        }
    }
    startModal.classList.remove('show');
    endModal.classList.remove('show');
    const user = profileManager.getActiveUser();
    if (user && user.difficulty) {
        mathEngine.setDifficulty(user.difficulty);
    }
    syncUserProfileUI();
    updateQuestionUI();
    await switchLevel(stageNum, true);
});

function openLevelSelectModal() {
    sound.resumeContext();
    sound.play('MenuSelect');
    const currentLvl = gameEngine?.map?.currentLevelConfig?.id || gameEngine?.currentLevel || 1;
    levelSelectManager.open(currentLvl);
}

function closeLevelSelectModal() {
    levelSelectManager.close();
}

// 防御塔能力图鉴与新解锁炮塔引导弹窗
const btnTowerAlmanac = document.getElementById('btnTowerAlmanac');
const towerAlmanacModal = document.getElementById('towerAlmanacModal');
const towerAlmanacTitle = document.getElementById('towerAlmanacTitle');
const towerAlmanacSub = document.getElementById('towerAlmanacSub');
const towerAlmanacGrid = document.getElementById('towerAlmanacGrid');
const btnCloseTowerAlmanac = document.getElementById('btnCloseTowerAlmanac');

function openTowerAlmanac(highlightKeys = null, isNewUnlock = false) {
    if (!towerAlmanacModal || !towerAlmanacGrid) return;
    const keysToShow = (Array.isArray(highlightKeys) && highlightKeys.length > 0)
        ? highlightKeys
        : Object.keys(TOWER_TYPES);

    if (towerAlmanacTitle) {
        towerAlmanacTitle.textContent = isNewUnlock
            ? '✨ 解锁新防御塔啦！'
            : '📖 保卫萝卜 · 18种防御塔全图鉴';
    }
    if (towerAlmanacSub) {
        const curAllowed = new Set(gameEngine?.map?.currentLevelConfig?.availableTowers || []);
        towerAlmanacSub.textContent = isNewUnlock
            ? '快看看本关新登场的强力伙伴有什么独门本领吧！'
            : `绿框标注为本关可直接建造的炮塔（打碎深海贝壳/宝箱还可能爆出隐藏神塔哦！）`;
        towerAlmanacGrid.innerHTML = keysToShow.map(k => {
            const t = TOWER_TYPES[k];
            if (!t) return '';
            const iconSrc = officialTowerIcons[t.id] || '';
            const inThisStage = curAllowed.has(k);
            return `
                <div style="display:flex;gap:10px;align-items:center;background:#fffdf6;border:2.5px solid ${inThisStage ? '#2ed573' : '#e5d5b5'};border-radius:16px;padding:10px 12px;text-align:left;">
                    <img src="${iconSrc}" alt="${t.name}" style="width:52px;height:52px;object-fit:contain;flex-shrink:0;" />
                    <div>
                        <div style="font-size:15px;font-weight:900;color:#3d2200;">
                            ${t.symbol} ${t.name}
                            <span style="font-size:12px;color:#e67e22;">🪙${t.cost}</span>
                            ${inThisStage ? '<span style="font-size:11px;background:#e8f8f5;color:#00b894;padding:1px 6px;border-radius:99px;">本关可用</span>' : ''}
                        </div>
                        <div style="font-size:12px;color:#636e72;line-height:1.35;margin-top:3px;">${t.desc}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    towerAlmanacModal.classList.add('show');
}

if (btnTowerAlmanac) {
    btnTowerAlmanac.addEventListener('click', () => {
        sound.resumeContext();
        sound.play('MenuSelect');
        openTowerAlmanac(null, false);
    });
}
if (btnCloseTowerAlmanac) {
    btnCloseTowerAlmanac.addEventListener('click', () => {
        sound.resumeContext();
        towerAlmanacModal?.classList.remove('show');
    });
}
if (towerAlmanacModal) {
    towerAlmanacModal.addEventListener('click', (e) => {
        if (e.target === towerAlmanacModal) towerAlmanacModal.classList.remove('show');
    });
}

function checkNewTowerAlmanacForStage(lvl) {
    const cfg = LEVEL_CONFIGS[lvl];
    if (!cfg || !Array.isArray(cfg.availableTowers)) return;
    const u = profileManager.getActiveUser();
    // 第1关默认将初始双塔标记为已认识，不额外遮挡开局倒计时；从第2关起遇到新炮塔弹出趣味图鉴卡！
    if ((u?.carrotSeenTowers?.length || 0) === 0 && lvl === 1) {
        profileManager.markCarrotTowersSeen(cfg.availableTowers);
        return;
    }
    const newlySeen = profileManager.markCarrotTowersSeen(cfg.availableTowers);
    if (newlySeen.length > 0) {
        openTowerAlmanac(newlySeen, true);
    }
}

// 关卡切换调度函数 (支持 1 ~ 48 全关卡按需分片秒载)
async function switchLevel(lvl, checkNewTowers = false, persistToProfile = true) {
    sound.resumeContext();
    await ensureStageConfigLoaded(lvl);
    if (persistToProfile) {
        profileManager.setLastCarrotStage(lvl);
    }
    levelSelectManager.activeStageNum = lvl;
    gameEngine.loadLevel(lvl);
    renderBubbleButtons();
    if (mapEditor && mapEditor.isEditing) {
        mapEditor.onLevelChanged(lvl);
    }
    const cfg = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];
    const displayLevelName = getDisplayLevelName(lvl);
    if (btnSelectLevel) {
        btnSelectLevel.textContent = `🗺️ 第 ${displayLevelName} 关 ▾`;
    }
    if (startModalLevelTitle) {
        const cleanName = cfg.name.includes(': ') ? cfg.name.split(': ')[1] : cfg.name;
        const towerSymbols = (cfg.availableTowers || []).map(t => TOWER_TYPES[t]?.symbol || '').join(' ');
        startModalLevelTitle.textContent = `🗺️ 当前出击：第 ${displayLevelName} 关 ${cleanName} (${towerSymbols} · ${cfg.maxWaves || 15}波)`;
    }
    document.querySelectorAll('.level-grid-item').forEach(el => {
        el.classList.toggle('active', el.id === `level-grid-item-${lvl}`);
    });
    rabbitTalk.textContent = `第 ${displayLevelName} 关加油！🥕`;
    frogTalk.textContent = `呱！${displayLevelName} 关开战！`;
    if (checkNewTowers) {
        checkNewTowerAlmanacForStage(lvl);
    }
}

// 绑定关卡弹窗触发
if (btnSelectLevel) {
    btnSelectLevel.addEventListener('click', openLevelSelectModal);
}
if (btnOpenLevelModalFromStart) {
    btnOpenLevelModalFromStart.addEventListener('click', openLevelSelectModal);
}
if (levelSelectModal) {
    levelSelectModal.addEventListener('click', (e) => {
        if (e.target === levelSelectModal) closeLevelSelectModal();
    });
}

// 绑定关卡编辑器切换
const btnToggleEditor = document.getElementById('btnToggleEditor');
if (btnToggleEditor) {
    btnToggleEditor.addEventListener('click', () => {
        sound.resumeContext();
        mapEditor.toggle();
    });
}

if (btnNextLevel) {
    btnNextLevel.addEventListener('click', async () => {
        sound.resumeContext();
        endModal.classList.remove('show');
        const nextLvl = gameEngine.currentLevel < 48 ? gameEngine.currentLevel + 1 : 1;
        await switchLevel(nextLvl, true);
    });
}

// =========================================================================
// 小朋友用户档案与心算难度交互绑定
// =========================================================================

let modalEditAvatar = '🐰';
let modalEditRange = 20;
let modalEditMultiplier = 5;
let modalEditTab = 'custom';
let modalEditPreset = 'grade1_2';
let modalEditEnLevel = 'level2_match';
let modalEditEnPack = 'all';
let modalEditDailyCap = 30;
let modalEditMathTypes = [...ALL_MATH_TYPE_IDS];
let modalEditEnTypes = [...ALL_ENGLISH_TYPE_IDS];

function syncUserProfileUI() {
    const user = profileManager.getActiveUser();
    const diffSummary = mathEngine.getDifficultySummary();

    // 1. 顶部 HUD
    if (hudUserAvatar) hudUserAvatar.textContent = user.avatar || '🐰';
    if (hudUserName) hudUserName.textContent = user.name || '小豌豆';
    if (btnUserProfile) btnUserProfile.title = `小朋友：${user.name} (${diffSummary})，点击切换/编辑`;

    // 2. 开局弹窗
    if (startKidAvatar) startKidAvatar.textContent = user.avatar || '🐰';
    if (startKidName) startKidName.textContent = `小勇士：${user.name || '小豌豆'}`;
    if (startKidDiffSummary) startKidDiffSummary.textContent = `🎯 难度：${diffSummary}`;

    // 3. 右侧小黑板
    if (questionHint) {
        questionHint.textContent = `🎯 ${user.name}的心算挑战 (${diffSummary}) ⚙️`;
        questionHint.title = '点击快速调整难度';
        questionHint.style.cursor = 'pointer';
    }

    // 4. 黑板下方出战档案记录栏 (在下面清晰记录)
    if (bbKidAvatar) bbKidAvatar.textContent = user.avatar || '🐰';
    if (bbKidName) bbKidName.textContent = user.name || '小豌豆';
    if (bbKidDiffBadge) bbKidDiffBadge.textContent = diffSummary;
    smartBoard.syncFromActiveProfile();

    // 5. 同步 startModal 中的卡片选中态
    if (diffCards && diffCards.length > 0) {
        diffCards.forEach(c => {
            if (user.difficulty?.mode === 'preset') {
                c.classList.toggle('selected', c.dataset.diff === user.difficulty.presetGrade);
            } else {
                c.classList.remove('selected');
            }
        });
    }
}

let editingUserId = null;

function renderKidProfilesBar() {
    if (!kidProfilesList) return;
    kidProfilesList.innerHTML = '';
    const users = profileManager.getUsers();
    const activeUser = profileManager.getActiveUser();

    users.forEach(u => {
        const tab = document.createElement('div');
        tab.className = `kid-profile-tab ${u.id === editingUserId ? 'active' : ''}`;
        const isCurrentActive = u.id === activeUser.id;
        const diffSummary = MathEngine.formatSummary(u.difficulty);
        
        tab.innerHTML = `
            <span class="kid-tab-avatar">${u.avatar || '🐰'}</span>
            <span class="kid-tab-name">${u.name || '小朋友'}</span>
            ${isCurrentActive ? '<span style="color:#00b894;font-size:11px;">(出战中)</span>' : ''}
        `;
        tab.title = `点击切换/编辑：${u.name} (${diffSummary || ''})`;
        tab.addEventListener('click', () => {
            sound.resumeContext();
            editingUserId = u.id;
            profileManager.setActiveUser(u.id);
            mathEngine.setDifficulty(u.difficulty);
            syncUserProfileUI();
            updateQuestionUI();
            populateUserForm(u, false);
            renderKidProfilesBar();
            // 同步切换到该小朋友上次挑战的保卫萝卜关卡
            const targetStage = u.lastCarrotStage || 1;
            if (gameEngine && gameEngine.currentLevel !== targetStage && gameEngine.state !== 'WAVE_RUNNING') {
                switchLevel(targetStage, false, false);
            }
        });
        kidProfilesList.appendChild(tab);
    });
}

function populateUserForm(user, isNew = false) {
    modalEditAvatar = user.avatar || '🐰';
    modalEditTab = user.difficulty?.mode === 'preset' ? 'preset' : 'custom';
    modalEditRange = user.difficulty?.range || 20;
    modalEditMultiplier = user.difficulty?.maxMultiplier || 5;
    modalEditPreset = user.difficulty?.presetGrade || 'grade1_2';
    modalEditEnLevel = user.englishConfig?.level || 'level2_match';
    modalEditEnPack = user.englishConfig?.packId || 'all';
    modalEditDailyCap = user.dailyBadgeCap || 30;
    modalEditMathTypes = Array.isArray(user.difficulty?.enabledTypes) && user.difficulty.enabledTypes.length > 0
        ? [...user.difficulty.enabledTypes]
        : [...ALL_MATH_TYPE_IDS];
    modalEditEnTypes = Array.isArray(user.englishConfig?.enabledTypes) && user.englishConfig.enabledTypes.length > 0
        ? [...user.englishConfig.enabledTypes]
        : [...ALL_ENGLISH_TYPE_IDS];

    // 填入名字
    if (inputKidName) {
        inputKidName.value = isNew ? '' : (user.name || '');
        inputKidName.placeholder = isNew ? '输入新小朋友名字 (如: 欢欢 / 妹妹)' : '输入孩子名字 (如: 乐乐)';
    }

    // 模式标签与操作按钮
    if (profileEditModeTag) {
        profileEditModeTag.textContent = isNew ? '✨ 正在添加新小朋友' : `✏️ 正在编辑：${user.name || '小朋友'}`;
    }
    if (btnSaveUserProfile) {
        btnSaveUserProfile.textContent = isNew ? '添加并出战 ✔️' : '保存并应用 ✔️';
    }
    if (btnProfileViewRecords) {
        btnProfileViewRecords.style.display = isNew ? 'none' : 'inline-block';
        const count = (user.history && Array.isArray(user.history)) ? user.history.length : 0;
        btnProfileViewRecords.textContent = `📊 答题战报 (${count}场)`;
    }

    if (btnDeleteKid) {
        const canDelete = !isNew && profileManager.getUsers().length > 1;
        btnDeleteKid.style.display = canDelete ? 'inline-block' : 'none';
        if (canDelete) {
            btnDeleteKid.textContent = `🗑️ 删除【${user.name}】`;
        }
    }

    // 渲染头像选择器
    if (avatarSelectGrid) {
        avatarSelectGrid.innerHTML = '';
        AVATAR_OPTIONS.forEach(opt => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `avatar-chip ${opt.emoji === modalEditAvatar ? 'selected' : ''}`;
            btn.textContent = opt.emoji;
            btn.title = opt.name;
            btn.addEventListener('click', () => {
                modalEditAvatar = opt.emoji;
                avatarSelectGrid.querySelectorAll('.avatar-chip').forEach(c => c.classList.remove('selected'));
                btn.classList.add('selected');
            });
            avatarSelectGrid.appendChild(btn);
        });
    }

    // 选项卡切换
    switchProfileTab(modalEditTab);

    // 填入自定义复选框
    const ops = user.difficulty?.operations || ['add', 'sub'];
    if (chkOp_add) chkOp_add.checked = ops.includes('add');
    if (chkOp_sub) chkOp_sub.checked = ops.includes('sub');
    if (chkOp_mul) chkOp_mul.checked = ops.includes('mul');
    if (chkOp_div) chkOp_div.checked = ops.includes('div');

    if (chkOptFillBlank) chkOptFillBlank.checked = user.difficulty?.allowFillBlank !== false;
    if (chkOptCarryBorrow) chkOptCarryBorrow.checked = user.difficulty?.allowCarryBorrow !== false;

    // 渲染数值范围选项
    if (rangesGrid) {
        rangesGrid.innerHTML = '';
        MATH_RANGES.forEach(r => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `range-chip ${r.value === modalEditRange ? 'selected' : ''}`;
            btn.innerHTML = `${r.label} <small style="opacity:0.8;font-size:11px;">(${r.desc})</small>`;
            btn.addEventListener('click', () => {
                modalEditRange = r.value;
                rangesGrid.querySelectorAll('.range-chip').forEach(c => c.classList.remove('selected'));
                btn.classList.add('selected');
            });
            rangesGrid.appendChild(btn);
        });
    }

    // 渲染乘除法乘数上限选项
    if (multipliersGrid && typeof MULTIPLIER_RANGES !== 'undefined') {
        multipliersGrid.innerHTML = '';
        MULTIPLIER_RANGES.forEach(m => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `range-chip ${m.value === modalEditMultiplier ? 'selected' : ''}`;
            btn.innerHTML = `${m.label} <small style="opacity:0.8;font-size:11px;">(${m.desc})</small>`;
            btn.addEventListener('click', () => {
                modalEditMultiplier = m.value;
                multipliersGrid.querySelectorAll('.range-chip').forEach(c => c.classList.remove('selected'));
                btn.classList.add('selected');
            });
            multipliersGrid.appendChild(btn);
        });
    }

    // 根据是否勾选乘除法动态显示/隐藏乘法上限选项
    const updateMultiplierVisibility = () => {
        if (blockMultiplierLimit) {
            const hasMulOrDiv = !!(chkOp_mul?.checked || chkOp_div?.checked);
            blockMultiplierLimit.style.display = hasMulOrDiv ? 'block' : 'none';
        }
    };
    updateMultiplierVisibility();
    if (chkOp_mul) chkOp_mul.onchange = updateMultiplierVisibility;
    if (chkOp_div) chkOp_div.onchange = updateMultiplierVisibility;

    // 渲染预设学段卡片
    if (presetGradeCards) {
        presetGradeCards.innerHTML = '';
        Object.values(DIFFICULTY_LEVELS).forEach(lvl => {
            const card = document.createElement('div');
            card.className = `preset-card-item ${lvl.id === modalEditPreset ? 'selected' : ''}`;
            card.innerHTML = `
                <div>
                    <div class="preset-card-title">${lvl.badge} ${lvl.name}</div>
                    <div class="preset-card-desc">${lvl.desc}</div>
                </div>
                <span style="font-size:18px;">✔️</span>
            `;
            card.addEventListener('click', () => {
                modalEditPreset = lvl.id;
                presetGradeCards.querySelectorAll('.preset-card-item').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
            presetGradeCards.appendChild(card);
        });
    }

    // 渲染数学启用题型多选 (9种)
    const carrotMathTypesBox = document.getElementById('carrotMathTypesBox');
    if (carrotMathTypesBox) {
        renderEnabledTypesSelector(
            carrotMathTypesBox,
            MATH_QUESTION_TYPES,
            modalEditMathTypes,
            (nextIds) => { modalEditMathTypes = nextIds; },
            ['calc', 'compare', 'bond_pop', 'sequence_train', 'clock_money']
        );
    }

    // 渲染少儿英语题型、词包与每日徽章上限（与大厅/萌宠店/PVZ 100%对齐）
    const carrotEnTypesBox = document.getElementById('carrotEnTypesBox');
    const drawCarrotEnTypes = () => {
        if (!carrotEnTypesBox) return;
        renderEnabledTypesSelector(
            carrotEnTypesBox,
            ENGLISH_QUESTION_TYPES,
            modalEditEnTypes,
            (nextIds) => { modalEditEnTypes = nextIds; },
            ['listen_pic', 'match_word', 'bubble_pair', 'riddle_qa']
        );
    };
    drawCarrotEnTypes();

    const enLevelGrid = document.getElementById('carrotEnLevelGrid');
    if (enLevelGrid) {
        enLevelGrid.innerHTML = '';
        Object.values(ENGLISH_LEVELS).forEach(lvl => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `range-chip ${lvl.id === modalEditEnLevel ? 'selected' : ''}`;
            btn.textContent = lvl.name;
            btn.addEventListener('click', () => {
                modalEditEnLevel = lvl.id;
                if (Array.isArray(lvl.presetTypes) && lvl.presetTypes.length > 0) {
                    modalEditEnTypes = [...lvl.presetTypes];
                    drawCarrotEnTypes();
                }
                enLevelGrid.querySelectorAll('.range-chip').forEach(c => c.classList.remove('selected'));
                btn.classList.add('selected');
            });
            enLevelGrid.appendChild(btn);
        });
    }

    const enPackSelect = document.getElementById('carrotEnPackSelect');
    if (enPackSelect) {
        const packOpts = [
            `<option value="all">🌟 全部20主题 (${ALL_WORDS.length}词)</option>`,
            ...WORD_PACKS.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`)
        ].join('');
        enPackSelect.innerHTML = packOpts;
        enPackSelect.value = modalEditEnPack;
        enPackSelect.onchange = () => {
            modalEditEnPack = enPackSelect.value;
        };
    }

    const capGrid = document.getElementById('carrotDailyCapGrid');
    if (capGrid) {
        capGrid.innerHTML = '';
        DAILY_BADGE_CAP_OPTIONS.forEach(cap => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `range-chip ${cap === modalEditDailyCap ? 'selected' : ''}`;
            btn.textContent = `每日上限 ${cap}🏅`;
            btn.addEventListener('click', () => {
                modalEditDailyCap = cap;
                capGrid.querySelectorAll('.range-chip').forEach(c => c.classList.remove('selected'));
                btn.classList.add('selected');
            });
            capGrid.appendChild(btn);
        });
    }
}

function openUserProfileModal(targetUserId = null) {
    sound.resumeContext();
    const active = profileManager.getActiveUser();
    editingUserId = targetUserId || active.id;
    const target = profileManager.getUser(editingUserId) || active;
    editingUserId = target.id;

    populateUserForm(target, false);
    renderKidProfilesBar();

    if (userProfileModal) {
        userProfileModal.classList.add('show');
    }
}

function switchProfileTab(tabName) {
    modalEditTab = tabName;
    if (tabBtnCustom) tabBtnCustom.classList.toggle('active', tabName === 'custom');
    if (tabBtnPreset) tabBtnPreset.classList.toggle('active', tabName === 'preset');
    if (tabContentCustom) tabContentCustom.style.display = tabName === 'custom' ? 'block' : 'none';
    if (tabContentPreset) tabContentPreset.style.display = tabName === 'preset' ? 'block' : 'none';
}

function closeUserProfileModal() {
    if (userProfileModal) {
        userProfileModal.classList.remove('show');
    }
}

function saveUserProfileModal() {
    sound.resumeContext();
    const rawName = (inputKidName?.value || '').trim();
    const isNew = editingUserId === '__NEW__';
    const fallbackName = isNew ? `宝贝${profileManager.getUsers().length + 1}` : '乐乐';
    const name = rawName || fallbackName;
    const avatar = modalEditAvatar || '🐰';

    let diff = {};
    if (modalEditTab === 'custom') {
        const ops = [];
        if (chkOp_add?.checked) ops.push('add');
        if (chkOp_sub?.checked) ops.push('sub');
        if (chkOp_mul?.checked) ops.push('mul');
        if (chkOp_div?.checked) ops.push('div');
        if (ops.length === 0) {
            ops.push('add');
            if (chkOp_add) chkOp_add.checked = true;
        }

        diff = {
            mode: 'custom',
            operations: ops,
            range: modalEditRange,
            maxMultiplier: modalEditMultiplier,
            allowFillBlank: !!chkOptFillBlank?.checked,
            allowCarryBorrow: !!chkOptCarryBorrow?.checked,
            enabledTypes: modalEditMathTypes
        };
    } else {
        const pLvl = DIFFICULTY_LEVELS[modalEditPreset];
        diff = {
            mode: 'preset',
            presetGrade: modalEditPreset,
            maxMultiplier: pLvl?.defaultMultiplier || 5,
            enabledTypes: modalEditMathTypes
        };
    }

    const prevEc = (!isNew && editingUserId)
        ? (profileManager.getUser(editingUserId)?.englishConfig || {})
        : {};
    const englishConfig = {
        ...prevEc,
        level: modalEditEnLevel || 'level2_match',
        packId: modalEditEnPack || 'all',
        enabledTypes: modalEditEnTypes
    };

    if (isNew) {
        const created = profileManager.addUser({
            name,
            avatar,
            difficulty: diff,
            englishConfig
        });
        profileManager.updateUserSettings(created.id, { dailyBadgeCap: modalEditDailyCap });
        profileManager.setActiveUser(created.id);
    } else {
        profileManager.updateUserSettings(editingUserId, {
            name,
            avatar,
            dailyBadgeCap: modalEditDailyCap,
            difficulty: diff,
            englishConfig
        });
        profileManager.setActiveUser(editingUserId);
    }

    const current = profileManager.getActiveUser();
    mathEngine.setDifficulty(current.difficulty);
    if (gameEngine && gameEngine.enemies) {
        for (const enemy of gameEngine.enemies) {
            if (enemy.hasMathShield) {
                enemy.initMathShield();
            }
        }
    }
    syncUserProfileUI();
    updateQuestionUI();
    closeUserProfileModal();

    if (feedbackMsg) {
        feedbackMsg.textContent = `🎉 小朋友【${current.name}】已就绪，当前难度：${mathEngine.getDifficultySummary()}！`;
        feedbackMsg.style.color = '#2ed573';
    }
}

// 绑定用户设置相关事件
if (btnUserProfile) btnUserProfile.addEventListener('click', () => openUserProfileModal());
if (btnStartKidEdit) btnStartKidEdit.addEventListener('click', () => openUserProfileModal());
if (btnStartKidGear) btnStartKidGear.addEventListener('click', (e) => {
    e.stopPropagation();
    openUserProfileModal();
});
if (btnAddNewKid) btnAddNewKid.addEventListener('click', () => {
    sound.resumeContext();
    editingUserId = '__NEW__';
    // 自动为新小朋友挑一个没被用过的萌宠
    const usedAvatars = new Set(profileManager.getUsers().map(u => u.avatar));
    const freeOpt = AVATAR_OPTIONS.find(opt => !usedAvatars.has(opt.emoji)) || AVATAR_OPTIONS[0];
    const newUserTemplate = {
        name: '',
        avatar: freeOpt.emoji,
        difficulty: {
            mode: 'custom',
            presetGrade: 'grade1_2',
            operations: ['add', 'sub'],
            range: 20,
            maxMultiplier: 5,
            allowCarryBorrow: true,
            allowFillBlank: true
        }
    };
    populateUserForm(newUserTemplate, true);
    renderKidProfilesBar();
    if (inputKidName) inputKidName.focus();
});
if (btnDeleteKid) btnDeleteKid.addEventListener('click', () => {
    sound.resumeContext();
    if (editingUserId && editingUserId !== '__NEW__') {
        const target = profileManager.getUser(editingUserId);
        if (!target) return;
        requireParentGate(() => {
            if (confirm(`确定要删除小朋友【${target.name}】的档案吗？`)) {
                profileManager.deleteUser(editingUserId);
                const active = profileManager.getActiveUser();
                editingUserId = active.id;
                mathEngine.setDifficulty(active.difficulty);
                syncUserProfileUI();
                updateQuestionUI();
                populateUserForm(active, false);
                renderKidProfilesBar();
            }
        }, { profileManager, actionLabel: '删除档案需家长确认' });
    }
});
if (questionHint) questionHint.addEventListener('click', () => openUserProfileModal());
if (bbKidFooter) bbKidFooter.addEventListener('click', () => openUserProfileModal());
if (btnBbKidGear) btnBbKidGear.addEventListener('click', (e) => {
    e.stopPropagation();
    openUserProfileModal();
});
if (btnCloseProfileModal) btnCloseProfileModal.addEventListener('click', closeUserProfileModal);
if (btnCancelUserProfile) btnCancelUserProfile.addEventListener('click', closeUserProfileModal);
if (btnSaveUserProfile) btnSaveUserProfile.addEventListener('click', () => {
    requireParentGate(() => saveUserProfileModal(), {
        profileManager,
        actionLabel: '保存难度与每日上限修改'
    });
});
if (tabBtnCustom) tabBtnCustom.addEventListener('click', () => switchProfileTab('custom'));
if (tabBtnPreset) tabBtnPreset.addEventListener('click', () => switchProfileTab('preset'));
if (userProfileModal) {
    userProfileModal.addEventListener('click', (e) => {
        if (e.target === userProfileModal) closeUserProfileModal();
    });
}

// 难度选择 (StartModal 快捷卡片 — 家长守护验证防误点改简单)
diffCards.forEach(card => {
    card.addEventListener('click', () => {
        const diffKey = card.dataset.diff;
        const curDiff = profileManager.getActiveUser()?.difficulty;
        if (curDiff?.mode === 'preset' && curDiff?.presetGrade === diffKey) return;
        requireParentGate(() => {
            diffCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const pLvl = DIFFICULTY_LEVELS[diffKey];
            const newDiff = {
                mode: 'preset',
                presetGrade: diffKey,
                maxMultiplier: pLvl?.defaultMultiplier || 5
            };
            profileManager.updateActiveUser({ difficulty: newDiff });
            mathEngine.setDifficulty(newDiff);
            syncUserProfileUI();
            updateQuestionUI();
        }, { profileManager, actionLabel: '切换预设年级难度需家长确认' });
    });
});

// 开始游戏
btnStartGame.addEventListener('click', async () => {
    sound.resumeContext();
    startModal.classList.remove('show');
    const user = profileManager.getActiveUser();
    mathEngine.setDifficulty(user.difficulty);
    syncUserProfileUI();
    await ensureStageConfigLoaded(gameEngine.currentLevel || 1);
    gameEngine.startNewGame();
    updateQuestionUI();
    checkNewTowerAlmanacForStage(gameEngine.currentLevel || 1);
});

// 再来一局
btnRestart.addEventListener('click', () => {
    sound.resumeContext();
    endModal.classList.remove('show');
    syncUserProfileUI();
    startModal.classList.add('show');
});

// 初始化启动并加载原画贴图
startModal.classList.add('show');
syncUserProfileUI();

// iPad / iOS 触屏第一次轻触自动解锁 Web Audio 声音引擎
window.addEventListener('touchstart', () => {
    sound.resumeContext();
}, { once: true, passive: true });

// iPad / iOS 生命周期自适应：后台/锁屏自动暂停休眠，唤醒对齐时钟，杜绝 WebKit 堆积冻结
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (gameEngine && gameEngine.state === 'WAVE_RUNNING') {
            gameEngine.togglePause();
        }
        if (sound) sound.pauseAll();
    } else {
        if (sound) sound.resumeContext();
        if (gameEngine) gameEngine.lastTime = performance.now();
    }
});
window.addEventListener('pagehide', () => {
    if (sound) sound.pauseAll();
    if (gameEngine) gameEngine.stopLoop();
});
window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
        profileManager.data = profileManager.load();
        profileManager.ensureIntegrity();
        const user = profileManager.getActiveUser();
        mathEngine.setDifficulty(user.difficulty);
        syncUserProfileUI();
        updateQuestionUI();
    }
});

fitToScreen();
mathEngine.nextQuestion();
updateQuestionUI();

// 自动恢复当前宝贝上次挑战的保卫萝卜关卡
const resumeStage = initialUser?.lastCarrotStage || 1;
if (resumeStage > 1) {
    switchLevel(resumeStage, false, false);
} else {
    switchLevel(1, false, false);
}

assetsManager.loadAll().then(() => {
    console.log('Carrot Fantasy 商业级贴图资源已全部就绪！');
});
