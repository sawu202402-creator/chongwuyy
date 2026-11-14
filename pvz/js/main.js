/**
 * main.js - 游戏全局协调控制器、事件总线与主循环
 * 深度融合原版 1:1 植物大战僵尸战场与儿童趣味心算学习引擎
 */
import { GAME_CONFIG, AVATAR_LIST, DIFFICULTY_PRESETS } from './config.js?v=20261113_v2';
import { assetsLoader } from './assetsLoader.js?v=20261113_v2';
import { soundEngine } from './audio.js?v=20261113_v2';
import { mathEngine, MATH_QUESTION_TYPES, ALL_MATH_TYPE_IDS } from './mathEngine.js?v=20261114_modes_v1';
import { profileManager } from './profileManager.js?v=20261113_3in1_v1';
import { PvzEngine } from './pvzEngine.js?v=20261113_v2';
import { createPlant } from './plants.js?v=20261113_v2';
import { Zombie } from './zombies.js?v=20261113_v2';
import { SmartChalkboard } from '../../shared/smartChalkboard.js';
import { sharedSpeech } from '../../shared/audioTTS.js';
import { ENGLISH_LEVELS, WORD_PACKS, ALL_WORDS, ENGLISH_QUESTION_TYPES, ALL_ENGLISH_TYPE_IDS } from '../../shared/englishEngine.js';
import { renderEnabledTypesSelector } from '../../shared/questionWidgets.js';
import { DAILY_BADGE_CAP_OPTIONS, DEFAULT_DAILY_BADGE_CAP } from '../../pet/js/config.js';
import { requireParentGate } from '../../shared/parentGate.js';

window.createPlant = createPlant;
window.Zombie = Zombie;

class GameApp {
    constructor() {
        this.canvas = document.getElementById('battleCanvas');
        this.pvzEngine = null;
        this.mathEngine = mathEngine;
        this.profileManager = profileManager;
        this.soundEngine = soundEngine;
        this.inputBuffer = '';
        this.gameSpeed = 1;
        this.lastTime = performance.now();
        this._hudCache = {};
        this._cardDomCache = [];
        this._conveyorTrackEl = null;
        this._conveyorUidMap = new Map();

        // 档案弹窗内部编辑暂存状态
        this.editingKidId = null; // null 表示编辑当前选中孩子
        this.selectedAvatar = '🐰';
        this.selectedRange = 20;
        this.selectedMultiplier = 5;
        this.selectedPresetGrade = 'grade1_2';
        this.selectedEnLevel = 'level2_match';
        this.selectedEnPack = 'all';
        this.selectedDailyBadgeCap = DEFAULT_DAILY_BADGE_CAP;
        this.selectedMathTypes = [...ALL_MATH_TYPE_IDS];
        this.selectedEnTypes = [...ALL_ENGLISH_TYPE_IDS];
        this.activeDiffTab = 'custom'; // 'custom' | 'preset'
        this.viewingRecordsKidId = null;

        // 绑定 DOM 元素
        this.dom = {
            gameApp: document.getElementById('game-app'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingBarFill: document.getElementById('loadingBarFill'),
            loadingHintText: document.getElementById('loadingHintText'),
            entityLayer: document.getElementById('entityLayer'),

            // HUD
            hudUserAvatar: document.getElementById('hudUserAvatar'),
            hudUserName: document.getElementById('hudUserName'),
            sunVal: document.getElementById('sunVal'),
            livesVal: document.getElementById('livesVal'),
            waveVal: document.getElementById('waveVal'),
            syringeFluid: document.getElementById('syringeFluid'),
            comboBadge: document.getElementById('comboBadge'),
            comboCount: document.getElementById('comboCount'),
            btnEndlessMode: document.getElementById('btnEndlessMode'),
            btnSelectLevel: document.getElementById('btnSelectLevel'),
            btnSpeedToggle: document.getElementById('btnSpeedToggle'),
            btnFullscreen: document.getElementById('btnFullscreen'),
            btnPause: document.getElementById('btnPause'),
            btnMute: document.getElementById('btnMute'),
            btnUserProfile: document.getElementById('btnUserProfile'),
            btnScoreRecords: document.getElementById('btnScoreRecords') || document.getElementById('btnMistakes'),

            // 卡牌栏与铲子
            cardsList: document.getElementById('cardsList'),
            whackModeBadge: document.getElementById('whackModeBadge'),
            btnOpenSeedChooser: document.getElementById('btnOpenSeedChooser'),
            shovelSlot: document.getElementById('shovelSlot'),

            // 战前选卡台 (Seed Chooser)
            seedChooserModal: document.getElementById('seedChooserModal'),
            seedChooserTitle: document.getElementById('seedChooserTitle'),
            seedChooserSub: document.getElementById('seedChooserSub'),
            seedChooserZombies: document.getElementById('seedChooserZombies'),
            seedSelectedCount: document.getElementById('seedSelectedCount'),
            seedSelectedSlots: document.getElementById('seedSelectedSlots'),
            seedSleepWarning: document.getElementById('seedSleepWarning'),
            seedPoolGrid: document.getElementById('seedPoolGrid'),
            btnRecommendDeck: document.getElementById('btnRecommendDeck'),
            btnConfirmSeedDeck: document.getElementById('btnConfirmSeedDeck'),

            // 小黑板
            mascotEmoji: document.getElementById('mascotEmoji'),
            mascotTalk: document.getElementById('mascotTalk'),
            questionHint: document.getElementById('questionHint'),
            questionFormula: document.getElementById('questionFormula'),
            answerInput: document.getElementById('answerInput'),
            btnSubmitAnswer: document.getElementById('btnSubmitAnswer'),
            feedbackMsg: document.getElementById('feedbackMsg'),
            virtualKeypad: document.getElementById('virtualKeypad'),
            bbKidAvatar: document.getElementById('bbKidAvatar'),
            bbKidName: document.getElementById('bbKidName'),
            bbKidDiffTag: document.getElementById('bbKidDiffTag'),
            btnBbKidGear: document.getElementById('btnBbKidGear'),

            // 关卡选择弹窗
            levelModal: document.getElementById('levelModal'),
            levelGrid: document.getElementById('levelGrid'),
            btnCloseLevelModal: document.getElementById('btnCloseLevelModal'),

            // 小朋友档案与难度设置大弹窗 (对标 shuxue)
            userProfileModal: document.getElementById('userProfileModal'),
            btnAddNewKid: document.getElementById('btnAddNewKid'),
            kidProfilesList: document.getElementById('kidProfilesList'),
            profileEditModeTag: document.getElementById('profileEditModeTag'),
            btnDeleteKid: document.getElementById('btnDeleteKid'),
            inputKidName: document.getElementById('inputKidName'),
            avatarSelectGrid: document.getElementById('avatarSelectGrid'),
            tabBtnCustom: document.getElementById('tabBtnCustom'),
            tabBtnPreset: document.getElementById('tabBtnPreset'),
            tabContentCustom: document.getElementById('tabContentCustom'),
            tabContentPreset: document.getElementById('tabContentPreset'),
            chkOp_add: document.getElementById('chkOp_add'),
            chkOp_sub: document.getElementById('chkOp_sub'),
            chkOp_mul: document.getElementById('chkOp_mul'),
            chkOp_div: document.getElementById('chkOp_div'),
            rangesGrid: document.getElementById('rangesGrid'),
            multipliersGrid: document.getElementById('multipliersGrid'),
            blockMultiplierLimit: document.getElementById('blockMultiplierLimit'),
            chkOptFillBlank: document.getElementById('chkOptFillBlank'),
            chkOptCarryBorrow: document.getElementById('chkOptCarryBorrow'),
            presetGradeCards: document.getElementById('presetGradeCards'),
            pvzEnLevelGrid: document.getElementById('pvzEnLevelGrid'),
            pvzEnPackSelect: document.getElementById('pvzEnPackSelect'),
            pvzDailyCapGrid: document.getElementById('pvzDailyCapGrid'),
            btnSaveUserProfile: document.getElementById('btnSaveUserProfile'),
            btnCancelUserProfile: document.getElementById('btnCancelUserProfile'),

            // 战报与错题攻坚大弹窗 (对标 shuxue)
            scoreRecordsModal: document.getElementById('scoreRecordsModal'),
            recordsKidSelector: document.getElementById('recordsKidSelector'),
            tabBtnHistoryList: document.getElementById('tabBtnHistoryList'),
            tabBtnMistakesBook: document.getElementById('tabBtnMistakesBook'),
            recordsHistoryContent: document.getElementById('recordsHistoryContent'),
            recordsMistakesContent: document.getElementById('recordsMistakesContent'),
            historyListBox: document.getElementById('historyListBox'),
            mistakesListBox: document.getElementById('mistakesListBox'),
            btnClearKidHistory: document.getElementById('btnClearKidHistory'),
            btnCloseRecordsModal: document.getElementById('btnCloseRecordsModal'),

            // 胜利与失败结算弹窗
            victoryModal: document.getElementById('victoryModal'),
            victoryRewardText: document.getElementById('victoryRewardText'),
            reportTotalQ: document.getElementById('reportTotalQ'),
            reportAccuracy: document.getElementById('reportAccuracy'),
            reportMaxCombo: document.getElementById('reportMaxCombo'),
            btnNextLevel: document.getElementById('btnNextLevel'),
            btnReplayVictory: document.getElementById('btnReplayVictory'),
            defeatModal: document.getElementById('defeatModal'),
            defeatModalIcon: document.getElementById('defeatModalIcon'),
            defeatModalTitle: document.getElementById('defeatModalTitle'),
            defeatModalDesc: document.getElementById('defeatModalDesc'),
            btnRetryLevel: document.getElementById('btnRetryLevel'),
            btnSelectLevelFromDefeat: document.getElementById('btnSelectLevelFromDefeat')
        };

        this.smartBoard = new SmartChalkboard({
            hostType: 'pvz',
            mathEngine: this.mathEngine,
            profileManager: this.profileManager,
            shouldConfirmExit: () => Boolean(
                this.pvzEngine &&
                !this.pvzEngine.isGameOver &&
                !this.pvzEngine.isVictory &&
                this.pvzEngine.waveIndex >= 1
            ),
            onSoundResume: () => soundEngine.resume(),
            onEnglishBattleResult: (battleRes, meta) => {
                if (this.pvzEngine) {
                    this.pvzEngine.handleMathAnswerResult(battleRes);
                }
                if (battleRes.isCorrect) {
                    const prefix = meta.isInteractiveMath
                        ? '🎉 数学答对！'
                        : (meta.isCampFinish ? '🎉 5词背诵营通关！' : `🎉 英语答对【${meta.wordObj?.word || ''}】！`);
                    this.dom.feedbackMsg.innerText = `${prefix}+${battleRes.bonusSun} 阳光${meta.badgeSuffix || ''}`;
                    this.dom.mascotEmoji.innerText = '🌻';
                    this.dom.mascotTalk.innerText = '太棒啦！互动闯关也能召唤大阳光与觉醒大招！';
                } else {
                    this.dom.feedbackMsg.innerText = meta.isInteractiveMath
                        ? `差一点哦~ 正确答案是 ${battleRes.expected}，再试一题！`
                        : `差一点哦~ 正确单词是 ${meta.wordObj?.word || ''} (${meta.wordObj?.zh || ''})`;
                    this.dom.mascotEmoji.innerText = '🌿';
                    this.dom.mascotTalk.innerText = '没关系，仔细看看再来一次！';
                }
            }
        });
        window.smartBoard = this.smartBoard;

        this.init();
    }

    collectPlantAssets(pId, outSet) {
        const p = GAME_CONFIG.plants[pId];
        if (!p) return;
        ['anim', 'attackAnim', 'digestAnim', 'cooldownAnim', 'icon', 'crack1Anim', 'crack2Anim',
         'unarmedAnim', 'armedAnim', 'mashedAnim', 'boomAnim', 'bigAnim', 'hideAnim', 'sleepAnim',
         'eatAnim', 'bulletAnim', 'splatAnim', 'cloudAnim', 'emptyAnim', 'fireAnim', 'blockAnim',
         'pullAnim', 'spinAnim'].forEach(k => {
            if (p[k]) outSet.add(p[k]);
        });
    }

    collectZombieAssets(zType, outSet) {
        const z = GAME_CONFIG.zombies[zType];
        if (!z) return;
        if (Array.isArray(z.walkAnims)) z.walkAnims.forEach(a => a && outSet.add(a));
        ['attackAnim', 'headAnim', 'dieAnim', 'charredAnim', 'openAnim', 'lostPaperAnim', 'rageAnim', 'rageAttackAnim',
         'noHelmetWalkAnim', 'noHelmetAttackAnim', 'moonwalkAnim', 'summonAnim',
         'runAnim', 'jumpAnim', 'walkAnim', 'landWalkAnim', 'rideAnim', 'swimAnim', 'digAnim', 'surfacedWalkAnim',
         'lostHeadWalkAnim', 'lostHeadAttackAnim', 'grabAnim', 'shootAnim',
         'noShieldWalkAnim', 'noShieldAttackAnim', 'noImpWalkAnim', 'noImpAttackAnim'].forEach(k => {
            if (z[k]) outSet.add(z[k]);
        });
    }

    getLevelAssets(lvlId, customDeck = null) {
        const conf = GAME_CONFIG.levels[lvlId] || GAME_CONFIG.levels['1-1'];
        const set = new Set();
        if (conf.bg) set.add(conf.bg);
        if (conf.world === 2) set.add('assets/backgrounds/tombstone.png');
        if (Array.isArray(conf.waterRows) && conf.waterRows.length > 0) set.add('assets/ui/pool_cleaner.png');
        if (conf.isRoof) set.add('assets/ui/roof_cleaner.png');
        if (conf.isConveyorBelt) set.add('assets/ui/conveyor_track.png');
        if (conf.isWhackAZombie) set.add('assets/ui/mallet.png');

        const plants = Array.isArray(customDeck) && customDeck.length > 0
            ? customDeck
            : (conf.allowedPlants || ['peashooter', 'sunflower']);
        plants.forEach(pId => this.collectPlantAssets(pId, set));
        if (conf.isBowling) {
            set.add('assets/plants/wallnut.gif');
            set.add('assets/plants/wallnut_red.png');
            set.add('assets/cards/card_rednut.png');
        }

        const zTypes = new Set(['normal', 'flag']);
        if (conf.isEndless) {
            ['conehead', 'buckethead', 'polevault', 'newspaper', 'football', 'zomboni', 'pogo', 'catapult', 'gargantuar', 'imp'].forEach(t => zTypes.add(t));
            if (Array.isArray(conf.waterRows) && conf.waterRows.length > 0) {
                ['ducky', 'snorkel', 'dolphin'].forEach(t => zTypes.add(t));
            }
        } else {
            (conf.waves || []).forEach(w => {
                (w.zombies || []).forEach(z => z && z.type && zTypes.add(z.type));
            });
        }
        if (zTypes.has('dancing')) zTypes.add('backup_dancer');
        if (zTypes.has('gargantuar')) zTypes.add('imp');
        zTypes.forEach(zt => this.collectZombieAssets(zt, set));
        return Array.from(set);
    }

    async init() {
        this.updateProfileUI();
        this.fitToScreen();
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) {
                profileManager.data = profileManager.load();
                profileManager.ensureIntegrity();
                this.updateProfileUI();
                this.syncQuestionToBlackboard();
            }
        });

        // 第一梯队：首屏核心 UI + 通用弹道特效 + 全植物轻量卡面图标 + 第 1-1 关完整战斗资产 (H5 秒开且低内存峰值)
        const criticalSet = new Set([
            'assets/ui/sun.gif',
            'assets/ui/shovel.png',
            'assets/ui/trophy.png',
            'assets/ui/lawnmower.png',
            'assets/ui/coin_gold.png',
            'assets/ui/coin_silver.png',
            'assets/projectiles/pea.gif',
            'assets/projectiles/pea_splat.gif',
            'assets/projectiles/snow_pea.gif',
            'assets/projectiles/fire_pea.gif',
            'assets/projectiles/shroom_bullet.gif',
            'assets/projectiles/shroom_splat.gif',
            'assets/projectiles/cherry_boom.gif',
            'assets/projectiles/spudow.gif',
            'assets/projectiles/cabbage.png',
            'assets/projectiles/corn.png',
            'assets/projectiles/butter.png',
            'assets/projectiles/butter_hat.png',
            'assets/projectiles/melon.png',
            'assets/projectiles/winter_melon.png',
            'assets/projectiles/star.png',
            'assets/projectiles/cactus_thorn.png',
            'assets/projectiles/cattail_thorn.png',
            'assets/projectiles/cob_rocket.png',
            'assets/projectiles/basketball.png',
            'assets/zombies/zombie_head.gif',
            'assets/zombies/zombie_die.gif',
            'assets/zombies/zombie_charred.gif',
            'assets/zombies/cone_drop.png',
            'assets/zombies/bucket_drop.png'
        ]);

        // 卡牌静态小图标体积轻巧，预先载入确保选卡台秒开无白框
        Object.values(GAME_CONFIG.plants).forEach(p => {
            if (p.icon) criticalSet.add(p.icon);
        });
        const savedLvl = (profileManager.getLastPvzLevel && profileManager.getLastPvzLevel()) || '1-1';
        const initialLevelId = GAME_CONFIG.levels[savedLvl] ? savedLvl : '1-1';
        this.getLevelAssets(initialLevelId).forEach(a => criticalSet.add(a));

        await assetsLoader.preloadAll(Array.from(criticalSet), (loaded, total, pct) => {
            if (this.dom.loadingBarFill) this.dom.loadingBarFill.style.width = `${pct}%`;
            if (this.dom.loadingHintText) this.dom.loadingHintText.innerText = `资源极速加载中 ${pct}% (${loaded}/${total})`;
        }, 10);

        if (this.dom.loadingOverlay) {
            this.dom.loadingOverlay.style.display = 'none';
        }

        // 初始化核心战场 (传入 canvas, entityLayer, 状态回调)
        this.pvzEngine = new PvzEngine(
            this.canvas,
            this.dom.entityLayer,
            (evt, data) => this.handleEngineState(evt, data)
        );
        window.pvzGame = this.pvzEngine;

        // 绑定 UI 交互
        this.bindDOMEvents();
        this.initProfileModalControls();
        if (initialLevelId !== '1-1') {
            this.loadNewLevel(initialLevelId, { skipConfirm: true });
        } else {
            this.renderCardsList();
            this.syncQuestionToBlackboard();
        }

        // 第二梯队：仅在非低内存设备上利用空闲时间温和预热后续世界资源；手机端在切关/选卡时按关卡精准加载，避免一次性驻留 250+ 动态 GIF 撑爆移动端显存
        const isConstrainedMobile = (typeof navigator !== 'undefined' && navigator.deviceMemory && navigator.deviceMemory <= 4) ||
            (typeof window !== 'undefined' && (window.innerWidth <= 960 || ('ontouchstart' in window && window.innerWidth <= 1180)));
        if (!isConstrainedMobile) {
            const deferredSet = new Set([
                'assets/backgrounds/day_3row_viewport.jpg',
                'assets/backgrounds/day_5row_viewport.jpg',
                'assets/backgrounds/night_viewport.jpg',
                'assets/backgrounds/pool_viewport.jpg',
                'assets/backgrounds/fog_viewport.jpg',
                'assets/backgrounds/roof_viewport.jpg',
                'assets/backgrounds/roof_night_viewport.jpg',
                'assets/backgrounds/tombstone.png',
                'assets/backgrounds/crater.png',
                'assets/projectiles/doom_cloud.png',
                'assets/projectiles/jalapeno_fire.gif',
                'assets/ui/pool_cleaner.png',
                'assets/ui/pool_cleaner_water.png',
                'assets/ui/roof_cleaner.png'
            ]);
            Object.keys(GAME_CONFIG.plants).forEach(pId => this.collectPlantAssets(pId, deferredSet));
            Object.keys(GAME_CONFIG.zombies).forEach(zt => this.collectZombieAssets(zt, deferredSet));
            assetsLoader.preloadInBackground(Array.from(deferredSet), 5);
        } else {
            // 手机/平板轻量预热第 1 大关常用资产
            const world1Set = new Set(['assets/backgrounds/day_3row_viewport.jpg', 'assets/backgrounds/day_5row_viewport.jpg']);
            ['peashooter', 'sunflower', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater'].forEach(pId => this.collectPlantAssets(pId, world1Set));
            ['normal', 'conehead', 'buckethead', 'polevault'].forEach(zt => this.collectZombieAssets(zt, world1Set));
            assetsLoader.preloadInBackground(Array.from(world1Set), 4);
        }

        // 启动主渲染循环
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(currentTime) {
        const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
        this.lastTime = currentTime;

        if (this.pvzEngine) {
            this.pvzEngine.update(dt * (this.gameSpeed || 1));
            this.pvzEngine.render();
            this.updateHUD();
            this.updateCardCooldowns();
            this.updateConveyorAnimation();
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    updateConveyorAnimation() {
        if (!this.pvzEngine || !this.pvzEngine.levelConfig.isConveyorBelt) return;
        if (this._conveyorTrackEl) {
            const rx = Math.round((this.pvzEngine.conveyorTrackOffset || 0) * 2) * 0.5;
            if (this._lastTrackOffset !== rx) {
                this._lastTrackOffset = rx;
                this._conveyorTrackEl.style.backgroundPosition = `-${rx.toFixed(1)}px 0px`;
            }
        }
        const items = this.pvzEngine.conveyorItems || [];
        for (let idx = 0; idx < items.length; idx++) {
            const item = items[idx];
            const entry = this._conveyorUidMap.get(String(item.uid));
            if (entry) {
                const cx = Math.round(item.x * 2) * 0.5;
                if (entry.lastX !== cx) {
                    entry.lastX = cx;
                    entry.cardEl.style.setProperty('--card-x', `${cx.toFixed(1)}px`);
                }
                if (entry.cIdx !== idx) {
                    entry.cIdx = idx;
                    entry.cardEl.setAttribute('data-conveyor-idx', idx);
                }
            }
        }
    }

    updateHUD() {
        if (!this.pvzEngine) return;
        const hc = this._hudCache;

        let sunText;
        if (this.pvzEngine.levelConfig.isBowling) {
            sunText = '🎳保龄';
        } else if (this.pvzEngine.levelConfig.isConveyorBelt) {
            sunText = 'FREE';
        } else {
            sunText = String(this.pvzEngine.sun);
        }
        if (hc.sunText !== sunText) {
            hc.sunText = sunText;
            this.dom.sunVal.innerText = sunText;
        }

        const lives = this.pvzEngine.lives;
        if (hc.lives !== lives) {
            hc.lives = lives;
            this.dom.livesVal.innerText = lives;
        }

        const curWave = this.pvzEngine.waveIndex;
        const totalWave = this.pvzEngine.totalWaves;
        let waveText;
        let pct;
        if (this.pvzEngine.isEndless) {
            const flags = this.pvzEngine.endlessFlags || 0;
            waveText = `第${curWave}波·🚩${flags}`;
            pct = ((curWave % 10) / 10) * 100;
        } else {
            waveText = `${curWave}/${totalWave}`;
            pct = totalWave > 0 ? (curWave / totalWave) * 100 : 0;
        }
        if (hc.waveText !== waveText) {
            hc.waveText = waveText;
            this.dom.waveVal.innerText = waveText;
        }
        const widthStr = `${pct.toFixed(1)}%`;
        if (hc.syringeWidth !== widthStr) {
            hc.syringeWidth = widthStr;
            this.dom.syringeFluid.style.width = widthStr;
        }

        // 连对勋章
        const combo = mathEngine.combo;
        if (hc.combo !== combo) {
            hc.combo = combo;
            this.dom.comboCount.innerText = `x${combo}`;
            const showCombo = combo >= 3;
            if (hc.showCombo !== showCombo) {
                hc.showCombo = showCombo;
                this.dom.comboBadge.style.display = showCombo ? 'flex' : 'none';
            }
        }
    }

    updateCardCooldowns() {
        if (!this.pvzEngine || !this._cardDomCache || this._cardDomCache.length === 0) return;
        const isConveyor = !!this.pvzEngine.levelConfig.isConveyorBelt;
        const selectedCard = this.pvzEngine.selectedCard;
        const selectedConvIdx = this.pvzEngine.selectedConveyorIdx;
        const curSun = this.pvzEngine.sun;

        for (let i = 0; i < this._cardDomCache.length; i++) {
            const entry = this._cardDomCache[i];
            const { cardEl, overlayEl, pId, conf } = entry;
            if (!conf) continue;

            if (isConveyor) {
                if (overlayEl && entry.lastScaleY !== 0) {
                    entry.lastScaleY = 0;
                    overlayEl.style.transform = 'scaleY(0)';
                }
                if (entry.isDisabled !== false) {
                    entry.isDisabled = false;
                    cardEl.classList.remove('disabled');
                }
                const wantSelected = (selectedCard === pId && selectedConvIdx === entry.cIdx);
                if (entry.isSelected !== wantSelected) {
                    entry.isSelected = wantSelected;
                    cardEl.classList.toggle('selected', wantSelected);
                }
                continue;
            }

            const cdRemain = this.pvzEngine.cardCooldowns[pId] || 0;
            const cdTotal = conf.cooldown || 7.5;

            let scaleY = 0;
            let wantDisabled = false;
            if (cdRemain > 0) {
                scaleY = Math.min(1, Math.max(0, Math.round((cdRemain / cdTotal) * 200) / 200));
                wantDisabled = true;
            } else if (curSun < conf.cost) {
                wantDisabled = true;
            }

            if (overlayEl && entry.lastScaleY !== scaleY) {
                entry.lastScaleY = scaleY;
                overlayEl.style.transform = `scaleY(${scaleY})`;
            }
            if (entry.isDisabled !== wantDisabled) {
                entry.isDisabled = wantDisabled;
                cardEl.classList.toggle('disabled', wantDisabled);
            }

            const wantSelected = (selectedCard === pId);
            if (entry.isSelected !== wantSelected) {
                entry.isSelected = wantSelected;
                cardEl.classList.toggle('selected', wantSelected);
            }
        }
    }

    getSelectablePool(levelConf) {
        if (!levelConf || levelConf.isConveyorBelt || levelConf.isWhackAZombie) return [];
        if (Array.isArray(levelConf.selectablePlants) && levelConf.selectablePlants.length > 0) {
            return levelConf.selectablePlants;
        }
        if (levelConf.world >= 3) {
            const levelIds = Object.keys(GAME_CONFIG.levels);
            const curIdx = levelIds.indexOf(levelConf.id);
            const pool = new Set(['peashooter', 'sunflower', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater']);
            (levelConf.allowedPlants || []).forEach(p => pool.add(p));
            levelIds.slice(0, curIdx >= 0 ? curIdx : levelIds.length).forEach(id => {
                const rew = GAME_CONFIG.levels[id] && GAME_CONFIG.levels[id].rewardPlant;
                if (rew && GAME_CONFIG.plants[rew] && !['bowling_nut', 'bowling_rednut'].includes(rew)) {
                    pool.add(rew);
                }
            });
            // 解锁戴夫商店高阶紫卡与功能植物供选卡台自由搭配
            ['cobcannon', 'wintermelon', 'twinsunflower', 'gatlingpea', 'gloomshroom', 'goldmagnet', 'imitater', 'marigold'].forEach(p => {
                if (GAME_CONFIG.plants[p]) pool.add(p);
            });
            if (!levelConf.isRoof) {
                pool.add('spikerock');
            }
            if (Array.isArray(levelConf.waterRows) && levelConf.waterRows.length > 0) {
                pool.add('cattail');
            }
            return Array.from(pool);
        }
        return [];
    }

    renderCardsList() {
        if (!this.pvzEngine) return;
        this.dom.cardsList.innerHTML = '';
        this._cardDomCache = [];
        this._conveyorTrackEl = null;
        this._conveyorUidMap.clear();
        this._lastTrackOffset = null;

        const pool = this.getSelectablePool(this.pvzEngine.levelConfig);
        if (this.dom.whackModeBadge) {
            this.dom.whackModeBadge.style.display = this.pvzEngine.isWhackAZombie ? 'flex' : 'none';
        }
        if (this.dom.btnOpenSeedChooser) {
            this.dom.btnOpenSeedChooser.style.display = pool.length > 8 ? 'flex' : 'none';
        }

        const isConveyor = !!this.pvzEngine.levelConfig.isConveyorBelt;
        this.dom.cardsList.classList.toggle('conveyor-mode', isConveyor);

        // 传送带关卡 (如 1-5 坚果保龄球、3-5、5-5、各章 X-10 决战)：展示机械滚动传送带与平滑滑入卡片
        if (isConveyor) {
            const track = document.createElement('div');
            track.className = 'conveyor-belt-track';
            const offset = this.pvzEngine.conveyorTrackOffset || 0;
            track.style.backgroundPosition = `-${offset.toFixed(1)}px 0px`;
            this.dom.cardsList.appendChild(track);
            this._conveyorTrackEl = track;

            const beltItems = this.pvzEngine.conveyorItems || [];
            beltItems.forEach((item, idx) => {
                const pId = item.type;
                const conf = GAME_CONFIG.plants[pId];
                if (!conf) return;

                const isSelected = (this.pvzEngine.selectedCard === pId && this.pvzEngine.selectedConveyorIdx === idx);

                const card = document.createElement('div');
                card.className = `plant-card conveyor-card ${isSelected ? 'selected' : ''}`;
                card.setAttribute('data-id', pId);
                card.setAttribute('data-uid', item.uid);
                card.setAttribute('data-conveyor-idx', idx);
                card.style.setProperty('--card-x', `${item.x.toFixed(1)}px`);
                card.setAttribute('title', `${conf.name} (传送带免费卡片)`);
                card.innerHTML = `
                    <div class="card-cooldown-overlay"></div>
                    <img src="${conf.icon}" alt="${conf.name}" class="card-seed-img" decoding="async" />
                    <span class="card-conveyor-tag">FREE</span>
                `;

                const overlayEl = card.firstElementChild;
                const cacheEntry = {
                    cardEl: card,
                    overlayEl,
                    pId,
                    conf,
                    cIdx: idx,
                    uid: String(item.uid),
                    lastX: Math.round(item.x * 2) * 0.5,
                    lastScaleY: 0,
                    isDisabled: false,
                    isSelected
                };
                this._cardDomCache.push(cacheEntry);
                this._conveyorUidMap.set(String(item.uid), cacheEntry);

                card.addEventListener('click', () => {
                    const curIdx = cacheEntry.cIdx;
                    soundEngine.playPlant();
                    if (this.pvzEngine.selectedCard === pId && this.pvzEngine.selectedConveyorIdx === curIdx) {
                        this.pvzEngine.selectedCard = null;
                        this.pvzEngine.selectedConveyorIdx = null;
                    } else {
                        this.pvzEngine.selectedCard = pId;
                        this.pvzEngine.selectedConveyorIdx = curIdx;
                        this.pvzEngine.isShovelActive = false;
                        this.dom.shovelSlot.classList.remove('active');
                    }
                    this.updateCardCooldowns();
                });

                this.dom.cardsList.appendChild(card);
            });
            return;
        }

        const allowed = (this.pvzEngine.activePlants && this.pvzEngine.activePlants.length > 0)
            ? this.pvzEngine.activePlants
            : (this.pvzEngine.levelConfig.allowedPlants || ['peashooter']);
        const isNight = !!this.pvzEngine.isNight;

        allowed.forEach(pId => {
            const conf = (this.pvzEngine.getEffectiveCardConfig && this.pvzEngine.getEffectiveCardConfig(pId)) || GAME_CONFIG.plants[pId];
            if (!conf) return;

            const isAsleepInLevel = !isNight && !!conf.isNocturnal;
            const imitaterLabel = (pId === 'imitater' && conf.copiedName)
                ? `<span class="card-imitater-badge">${conf.cost}·${conf.copiedName.slice(0, 2)}</span>`
                : '';

            const card = document.createElement('div');
            card.className = `plant-card ${isAsleepInLevel ? 'plant-card-sleep' : ''}`;
            card.setAttribute('data-id', pId);
            card.setAttribute('title', pId === 'imitater'
                ? `模仿者 → 复制【${conf.copiedName}】(${conf.cost}☀️)`
                : (isAsleepInLevel ? `${conf.name} (白天处于睡眠状态，种下后需咖啡豆唤醒)` : conf.name));
            card.innerHTML = `
                <div class="card-cooldown-overlay"></div>
                <img src="${conf.icon}" alt="${conf.name}" class="card-seed-img" decoding="async" />
                ${imitaterLabel}
                ${isAsleepInLevel ? '<span class="card-sleep-badge" title="白天休眠需咖啡豆">💤 睡</span>' : ''}
                ${this.pvzEngine.levelConfig.isConveyorBelt ? '<span class="card-conveyor-tag">FREE</span>' : ''}
            `;

            const overlayEl = card.firstElementChild;
            this._cardDomCache.push({
                cardEl: card,
                overlayEl,
                pId,
                conf,
                cIdx: -1,
                lastScaleY: 0,
                isDisabled: false,
                isSelected: false
            });

            card.addEventListener('click', () => {
                if (card.classList.contains('disabled')) {
                    soundEngine.playMathWrong();
                    return;
                }
                soundEngine.playPlant();
                if (this.pvzEngine.cancelCobAim) this.pvzEngine.cancelCobAim();
                // 切换选中状态
                if (this.pvzEngine.selectedCard === pId) {
                    this.pvzEngine.selectedCard = null;
                } else {
                    this.pvzEngine.selectedCard = pId;
                    this.pvzEngine.isShovelActive = false;
                    this.dom.shovelSlot.classList.remove('active');
                }
            });

            this.dom.cardsList.appendChild(card);
        });
    }

    bindDOMEvents() {
        // 铲子点击切换
        this.dom.shovelSlot.addEventListener('click', () => {
            this.pvzEngine.isShovelActive = !this.pvzEngine.isShovelActive;
            if (this.pvzEngine.cancelCobAim) this.pvzEngine.cancelCobAim();
            if (this.pvzEngine.isShovelActive) {
                this.dom.shovelSlot.classList.add('active');
                this.pvzEngine.selectedCard = null;
                soundEngine.playPlant();
            } else {
                this.dom.shovelSlot.classList.remove('active');
            }
        });

        // 虚拟键盘按键
        this.dom.virtualKeypad.addEventListener('click', (e) => {
            const btn = e.target.closest('.cookie-key');
            if (!btn) return;
            const key = btn.getAttribute('data-key');
            this.handleKeyInput(key);
        });

        // 提交答案
        this.dom.btnSubmitAnswer.addEventListener('click', () => {
            this.submitCurrentAnswer();
        });

        // 物理键盘监听
        window.addEventListener('keydown', (e) => {
            if (this.smartBoard && this.smartBoard.isEnglishActive()) return;
            if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement !== this.dom.answerInput) {
                return;
            }
            if (e.key >= '0' && e.key <= '9') {
                this.handleKeyInput(e.key);
            } else if (e.key === 'Backspace') {
                this.handleKeyInput('backspace');
            } else if (e.key === 'Escape') {
                if (this.pvzEngine && this.pvzEngine.aimingCobCannon && this.pvzEngine.cancelCobAim) {
                    this.pvzEngine.cancelCobAim();
                }
                this.handleKeyInput('clear');
            } else if (e.key === 'Enter') {
                this.submitCurrentAnswer();
            }
        });

        if (this.dom.btnSpeedToggle) {
            this.dom.btnSpeedToggle.addEventListener('click', () => {
                this.gameSpeed = this.gameSpeed === 2 ? 1 : 2;
                this.dom.btnSpeedToggle.innerText = this.gameSpeed === 2 ? '🔥 2x' : '⚡ 1x';
                this.dom.btnSpeedToggle.classList.toggle('speed-2x', this.gameSpeed === 2);
                soundEngine.playPlant();
            });
        }

        if (this.dom.btnFullscreen) {
            this.dom.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
            document.addEventListener('fullscreenchange', () => this.syncFullscreenBtn());
            document.addEventListener('webkitfullscreenchange', () => this.syncFullscreenBtn());
        }

        // 窗口尺寸变化与屏幕旋转自适应
        window.addEventListener('resize', () => this.fitToScreen());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.fitToScreen(), 200);
        });

        this.dom.btnPause.addEventListener('click', () => {
            this.pvzEngine.isPaused = !this.pvzEngine.isPaused;
            this.dom.btnPause.innerText = this.pvzEngine.isPaused ? '▶️' : '⏸️';
        });

        this.dom.btnMute.addEventListener('click', () => {
            const muted = soundEngine.toggleMute();
            sharedSpeech.setMuted(muted);
            this.dom.btnMute.innerText = muted ? '🔇' : '🔊';
        });

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

        // 关卡选择弹窗与无尽模式快捷入口
        this.dom.btnSelectLevel.addEventListener('click', () => {
            this.openLevelModal();
        });
        if (this.dom.btnEndlessMode) {
            this.dom.btnEndlessMode.addEventListener('click', () => {
                const curId = this.pvzEngine && this.pvzEngine.levelId;
                const targetEndless = (curId && GAME_CONFIG.levels[curId] && GAME_CONFIG.levels[curId].isEndless)
                    ? curId
                    : 'endless_pool';
                this.loadNewLevel(targetEndless, { openChooser: true });
            });
        }
        this.dom.btnCloseLevelModal.addEventListener('click', () => {
            this.dom.levelModal.style.display = 'none';
        });

        // 小朋友档案与难度设置
        this.dom.btnUserProfile.addEventListener('click', () => this.openProfileModal());
        this.dom.btnBbKidGear.addEventListener('click', () => this.openProfileModal());
        const bbKidFooter = document.getElementById('bbKidFooter');
        if (bbKidFooter) {
            bbKidFooter.addEventListener('click', () => this.openProfileModal());
        }

        // 战报与错题本
        if (this.dom.btnScoreRecords) {
            this.dom.btnScoreRecords.addEventListener('click', () => this.openRecordsModal());
        }
        this.dom.btnCloseRecordsModal.addEventListener('click', () => {
            this.dom.scoreRecordsModal.style.display = 'none';
        });
        this.dom.btnClearKidHistory.addEventListener('click', () => {
            requireParentGate(() => {
                const cur = this.viewingRecordsKidId || profileManager.getActiveUser().id;
                profileManager.clearUserHistory(cur);
                this.renderScoreRecords(cur);
            }, { profileManager, title: '🔒 家长确认：清空战报与错题' });
        });

        // 选卡台按钮事件
        if (this.dom.btnOpenSeedChooser) {
            this.dom.btnOpenSeedChooser.addEventListener('click', () => {
                this.openSeedChooserModal();
            });
        }
        if (this.dom.btnRecommendDeck) {
            this.dom.btnRecommendDeck.addEventListener('click', () => {
                const rec = (this.pvzEngine.levelConfig.allowedPlants || []).slice(0, 8);
                this.pendingDeck = [...rec];
                soundEngine.playPlant();
                this.renderSeedChooserModal();
            });
        }
        if (this.dom.btnConfirmSeedDeck) {
            this.dom.btnConfirmSeedDeck.addEventListener('click', () => {
                this.confirmSeedDeck();
            });
        }

        // 胜利与失败结算按钮
        this.dom.btnNextLevel.addEventListener('click', () => {
            this.dom.victoryModal.style.display = 'none';
            const parts = this.pvzEngine.levelId.split('-');
            const curWorld = parseInt(parts[0], 10);
            const curIdx = parseInt(parts[1], 10);
            let nextLevel = this.pvzEngine.levelId;
            if (curIdx < 10) {
                nextLevel = `${curWorld}-${curIdx + 1}`;
            } else if (curWorld < 5) {
                nextLevel = `${curWorld + 1}-1`;
            }
            this.loadNewLevel(nextLevel, { openChooser: true });
        });

        this.dom.btnReplayVictory.addEventListener('click', () => {
            this.dom.victoryModal.style.display = 'none';
            this.loadNewLevel(this.pvzEngine.levelId);
        });

        this.dom.btnRetryLevel.addEventListener('click', () => {
            this.dom.defeatModal.style.display = 'none';
            this.loadNewLevel(this.pvzEngine.levelId);
        });

        this.dom.btnSelectLevelFromDefeat.addEventListener('click', () => {
            this.dom.defeatModal.style.display = 'none';
            this.openLevelModal();
        });
    }

    handleKeyInput(key) {
        soundEngine.resume();
        if (key === 'clear') {
            this.inputBuffer = '';
        } else if (key === 'backspace') {
            this.inputBuffer = this.inputBuffer.slice(0, -1);
        } else if (this.inputBuffer.length < 5) {
            this.inputBuffer += key;
        }
        this.dom.answerInput.value = this.inputBuffer;
    }

    submitCurrentAnswer() {
        if (this.smartBoard && this.smartBoard.isEnglishActive()) return;
        if (!this.inputBuffer.trim()) return;
        const res = mathEngine.checkPvzAnswer(this.inputBuffer);
        const badgeSuffix = this.smartBoard ? this.smartBoard.recordMathProgress(res) : '';
        this.inputBuffer = '';
        this.dom.answerInput.value = '';

        // 将结果同步传给核心战场引擎 (掉落阳光、连击狂暴、护盾击碎)
        if (this.pvzEngine) {
            this.pvzEngine.handleMathAnswerResult(res);
        }

        // 更新黑板反馈
        if (res.isCorrect) {
            this.dom.feedbackMsg.innerText = `🎉 太棒啦！+${res.bonusSun} 阳光${badgeSuffix}`;
            this.dom.mascotEmoji.innerText = '🌻';
            this.dom.mascotTalk.innerText = '太聪明啦！继续算对积攒狂暴与大招！';
        } else {
            this.dom.feedbackMsg.innerText = `差一点点哦~ 正确答案是 ${res.expected}，再试一题！`;
            this.dom.mascotEmoji.innerText = '🌿';
            this.dom.mascotTalk.innerText = '没关系，慢慢算，向日葵支持你！';
        }

        this.syncQuestionToBlackboard();
    }

    syncQuestionToBlackboard() {
        if (this.smartBoard) {
            this.smartBoard.renderMathQuestion();
            return;
        }
        const q = mathEngine.currentQuestion;
        if (!q) return;
        this.dom.questionFormula.innerText = q.formula;
        this.dom.questionHint.innerText = q.hint || '🎯 口算速算挑战';
    }

    toggleFullscreen() {
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

    syncFullscreenBtn() {
        if (!this.dom.btnFullscreen) return;
        const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
        this.dom.btnFullscreen.innerText = isFull ? '🗗' : '⛶';
        this.dom.btnFullscreen.title = isFull ? '退出全屏' : '进入全屏沉浸模式 (隐藏浏览器边框)';
        setTimeout(() => this.fitToScreen(), 100);
    }

    /**
     * 屏幕自适应等比缩放引擎
     * 解决 iPad / 平板 / 笔记本全屏或普通模式下画面过大、右侧计算器溢出屏幕的问题
     * 保持 900x600 战场与 320px 算术黑板 1:1 并排完整可视，且触控与点击坐标 100% 精准
     */
    fitToScreen() {
        const app = this.dom.gameApp || document.getElementById('game-app');
        if (!app) return;

        const baseW = 1250;
        const baseH = 760;
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
            document.body.style.overflow = 'hidden';
            document.body.style.paddingTop = `${topMargin}px`;
            document.body.style.paddingBottom = '0px';
            document.body.style.paddingLeft = '0px';
            document.body.style.paddingRight = '0px';
        } else {
            app.style.transformOrigin = 'top center';
            app.style.transform = '';
            app.style.width = '100%';
            app.style.maxWidth = '1250px';
            document.body.style.overflow = '';
            document.body.style.padding = '8px 12px';
        }
    }

    updateProfileUI() {
        const p = profileManager.getActiveUser();
        if (!p) return;
        this.dom.hudUserAvatar.innerText = p.avatar || '🐰';
        this.dom.hudUserName.innerText = p.name;
        this.dom.bbKidAvatar.innerText = p.avatar || '🐰';
        this.dom.bbKidName.innerText = p.name;
        mathEngine.setDifficulty(p.difficulty);
        this.dom.bbKidDiffTag.innerText = mathEngine.getDifficultySummary();
        if (this.smartBoard) {
            this.smartBoard.syncFromActiveProfile();
        }
    }

    // ==========================================
    // 小朋友档案与心算难度设置模块 (完全对标 shuxue)
    // ==========================================
    initProfileModalControls() {
        // 新增小朋友按钮
        this.dom.btnAddNewKid.addEventListener('click', () => {
            this.editingKidId = 'NEW';
            this.selectedAvatar = AVATAR_LIST[Math.floor(Math.random() * AVATAR_LIST.length)];
            this.dom.inputKidName.value = '';
            this.activeDiffTab = 'custom';
            this.selectedRange = 20;
            this.selectedMultiplier = 5;
            this.selectedPresetGrade = 'grade1_2';
            this.renderProfileModalForm();
        });

        // 删除当前编辑小朋友
        this.dom.btnDeleteKid.addEventListener('click', () => {
            if (this.editingKidId && this.editingKidId !== 'NEW') {
                const targetUser = profileManager.getUser(this.editingKidId);
                if (!targetUser) return;
                requireParentGate(() => {
                    if (confirm(`确定要删除【${targetUser.name}】的档案吗？`)) {
                        profileManager.deleteUser(this.editingKidId);
                        this.editingKidId = profileManager.getActiveUser().id;
                        this.updateProfileUI();
                        this.renderProfileModalForm();
                    }
                }, { profileManager, title: '🔒 家长确认：删除孩子档案' });
            }
        });

        // 选项卡切换：自定义 vs 预设
        this.dom.tabBtnCustom.addEventListener('click', () => {
            this.activeDiffTab = 'custom';
            this.dom.tabBtnCustom.classList.add('active');
            this.dom.tabBtnPreset.classList.remove('active');
            this.dom.tabContentCustom.style.display = 'block';
            this.dom.tabContentPreset.style.display = 'none';
        });

        this.dom.tabBtnPreset.addEventListener('click', () => {
            this.activeDiffTab = 'preset';
            this.dom.tabBtnPreset.classList.add('active');
            this.dom.tabBtnCustom.classList.remove('active');
            this.dom.tabContentPreset.style.display = 'block';
            this.dom.tabContentCustom.style.display = 'none';
        });

        // 乘除法关联显示乘法上限
        const toggleMulBlock = () => {
            const hasMulDiv = this.dom.chkOp_mul.checked || this.dom.chkOp_div.checked;
            this.dom.blockMultiplierLimit.style.opacity = hasMulDiv ? '1' : '0.5';
        };
        this.dom.chkOp_mul.addEventListener('change', toggleMulBlock);
        this.dom.chkOp_div.addEventListener('change', toggleMulBlock);

        // 取消与保存
        this.dom.btnCancelUserProfile.addEventListener('click', () => {
            this.dom.userProfileModal.style.display = 'none';
        });

        this.dom.btnSaveUserProfile.addEventListener('click', () => {
            requireParentGate(() => {
                this.saveUserProfileSettings();
            }, { profileManager, title: '🔒 家长验证：保存难度与上限设置' });
        });

        // 战报选项卡切换
        this.dom.tabBtnHistoryList.addEventListener('click', () => {
            this.dom.tabBtnHistoryList.classList.add('active');
            this.dom.tabBtnMistakesBook.classList.remove('active');
            this.dom.recordsHistoryContent.style.display = 'block';
            this.dom.recordsMistakesContent.style.display = 'none';
        });

        this.dom.tabBtnMistakesBook.addEventListener('click', () => {
            this.dom.tabBtnMistakesBook.classList.add('active');
            this.dom.tabBtnHistoryList.classList.remove('active');
            this.dom.recordsMistakesContent.style.display = 'block';
            this.dom.recordsHistoryContent.style.display = 'none';
        });
    }

    openProfileModal() {
        const curUser = profileManager.getActiveUser();
        this.editingKidId = curUser.id;
        this.renderProfileModalForm();
        this.dom.userProfileModal.style.display = 'flex';
    }

    renderProfileModalForm() {
        const users = profileManager.getUsers();
        const isNew = this.editingKidId === 'NEW';
        const targetUser = isNew ? null : profileManager.getUser(this.editingKidId) || profileManager.getActiveUser();

        // 1. 渲染小朋友列表标签
        this.dom.kidProfilesList.innerHTML = '';
        users.forEach(u => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `btn-jelly-pill ${(!isNew && u.id === targetUser.id) ? 'active' : ''}`;
            btn.innerHTML = `<span>${u.avatar}</span> <span>${u.name}</span>`;
            btn.addEventListener('click', () => {
                this.editingKidId = u.id;
                profileManager.setActiveUser(u.id);
                this.updateProfileUI();
                const targetLvl = u.lastPvzLevel || '1-1';
                if (this.pvzEngine && this.pvzEngine.waveIndex < 1 && GAME_CONFIG.levels[targetLvl] && this.pvzEngine.levelId !== targetLvl) {
                    this.loadNewLevel(targetLvl, { skipConfirm: true });
                }
                this.renderProfileModalForm();
            });
            this.dom.kidProfilesList.appendChild(btn);
        });

        // 2. 标题与删除按钮状态
        if (isNew) {
            this.dom.profileEditModeTag.innerText = '➕ 正在新增小勇士档案';
            this.dom.btnDeleteKid.style.display = 'none';
            this.dom.inputKidName.value = '';
        } else {
            this.dom.profileEditModeTag.innerText = `✏️ 正在编辑：${targetUser.name}`;
            this.dom.btnDeleteKid.style.display = users.length > 1 ? 'block' : 'none';
            this.dom.inputKidName.value = targetUser.name;
            this.selectedAvatar = targetUser.avatar;
            const diff = targetUser.difficulty || {};
            this.activeDiffTab = diff.mode === 'preset' ? 'preset' : 'custom';
            this.selectedRange = diff.range || 20;
            this.selectedMultiplier = diff.maxMultiplier || 5;
            this.selectedPresetGrade = diff.presetGrade || 'grade1_2';
        }

        // 3. 渲染 12 个萌宠头像
        this.dom.avatarSelectGrid.innerHTML = '';
        AVATAR_LIST.forEach(av => {
            const avBtn = document.createElement('div');
            avBtn.className = `avatar-item ${av === this.selectedAvatar ? 'selected' : ''}`;
            avBtn.innerText = av;
            avBtn.addEventListener('click', () => {
                this.selectedAvatar = av;
                this.dom.avatarSelectGrid.querySelectorAll('.avatar-item').forEach(el => el.classList.remove('selected'));
                avBtn.classList.add('selected');
            });
            this.dom.avatarSelectGrid.appendChild(avBtn);
        });

        // 4. 选项卡同步
        if (this.activeDiffTab === 'custom') {
            this.dom.tabBtnCustom.classList.add('active');
            this.dom.tabBtnPreset.classList.remove('active');
            this.dom.tabContentCustom.style.display = 'block';
            this.dom.tabContentPreset.style.display = 'none';
        } else {
            this.dom.tabBtnPreset.classList.add('active');
            this.dom.tabBtnCustom.classList.remove('active');
            this.dom.tabContentPreset.style.display = 'block';
            this.dom.tabContentCustom.style.display = 'none';
        }

        // 5. 自定义模式：运算多选框
        const diff = targetUser ? (targetUser.difficulty || {}) : {};
        const ops = diff.operations || ['add', 'sub'];
        this.dom.chkOp_add.checked = ops.includes('add');
        this.dom.chkOp_sub.checked = ops.includes('sub');
        this.dom.chkOp_mul.checked = ops.includes('mul');
        this.dom.chkOp_div.checked = ops.includes('div');

        // 6. 数值范围胶囊 [10, 20, 50, 100, 1000]
        const ranges = [10, 20, 50, 100, 1000];
        this.dom.rangesGrid.innerHTML = '';
        ranges.forEach(r => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = `range-pill range-pill-btn ${r === this.selectedRange ? 'selected' : ''}`;
            pill.innerText = `${r}以内`;
            pill.addEventListener('click', () => {
                this.selectedRange = r;
                this.activeDiffTab = 'custom';
                this.dom.rangesGrid.querySelectorAll('.range-pill, .range-pill-btn').forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
            });
            this.dom.rangesGrid.appendChild(pill);
        });

        // 7. 乘法倍数上限胶囊 [5, 9, 12]
        const mults = [5, 9, 12];
        this.dom.multipliersGrid.innerHTML = '';
        mults.forEach(m => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = `range-pill range-pill-btn ${m === this.selectedMultiplier ? 'selected' : ''}`;
            pill.innerText = `${m}以内乘法`;
            pill.addEventListener('click', () => {
                this.selectedMultiplier = m;
                this.activeDiffTab = 'custom';
                this.dom.multipliersGrid.querySelectorAll('.range-pill, .range-pill-btn').forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
            });
            this.dom.multipliersGrid.appendChild(pill);
        });

        // 8. 额外启发开关
        this.dom.chkOptFillBlank.checked = diff.allowFillBlank !== false;
        this.dom.chkOptCarryBorrow.checked = diff.allowCarryBorrow !== false;

        // 9. 渲染预设年级卡片
        this.dom.presetGradeCards.innerHTML = '';
        Object.values(DIFFICULTY_PRESETS).forEach(preset => {
            const card = document.createElement('div');
            card.className = `preset-card diff-card ${preset.id === this.selectedPresetGrade ? 'selected' : ''}`;
            card.setAttribute('data-preset', preset.id);
            card.innerHTML = `
                <div class="preset-title diff-card-title">${preset.name}</div>
                <div class="preset-desc diff-card-desc">${preset.desc}</div>
            `;
            card.addEventListener('click', () => {
                this.selectedPresetGrade = preset.id;
                this.activeDiffTab = 'preset';
                this.dom.presetGradeCards.querySelectorAll('.preset-card, .diff-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
            this.dom.presetGradeCards.appendChild(card);
        });

        // 10. 渲染数学启用题型(9种)、英语启用题型(8种)、默认词包与每日徽章上限（四端 100% 对齐）
        this.selectedMathTypes = (targetUser && Array.isArray(targetUser.difficulty?.enabledTypes) && targetUser.difficulty.enabledTypes.length > 0)
            ? [...targetUser.difficulty.enabledTypes]
            : [...ALL_MATH_TYPE_IDS];

        const pvzMathTypesBox = document.getElementById('pvzMathTypesBox');
        if (pvzMathTypesBox) {
            renderEnabledTypesSelector(
                pvzMathTypesBox,
                MATH_QUESTION_TYPES,
                this.selectedMathTypes,
                (nextIds) => { this.selectedMathTypes = nextIds; },
                ['calc', 'compare', 'bond_pop', 'sequence_train', 'clock_money']
            );
        }

        const enConf = targetUser ? (targetUser.englishConfig || {}) : {};
        this.selectedEnLevel = enConf.level || 'level2_match';
        this.selectedEnPack = enConf.packId || 'all';
        this.selectedEnTypes = (Array.isArray(enConf.enabledTypes) && enConf.enabledTypes.length > 0)
            ? [...enConf.enabledTypes]
            : [...ALL_ENGLISH_TYPE_IDS];
        this.selectedDailyBadgeCap = (targetUser && targetUser.dailyBadgeCap) || DEFAULT_DAILY_BADGE_CAP;

        const pvzEnTypesBox = document.getElementById('pvzEnTypesBox');
        const drawPvzEnTypes = () => {
            if (!pvzEnTypesBox) return;
            renderEnabledTypesSelector(
                pvzEnTypesBox,
                ENGLISH_QUESTION_TYPES,
                this.selectedEnTypes,
                (nextIds) => { this.selectedEnTypes = nextIds; },
                ['listen_pic', 'match_word', 'bubble_pair', 'riddle_qa']
            );
        };
        drawPvzEnTypes();

        if (this.dom.pvzEnLevelGrid) {
            this.dom.pvzEnLevelGrid.innerHTML = '';
            Object.values(ENGLISH_LEVELS).forEach(lv => {
                const pill = document.createElement('button');
                pill.type = 'button';
                pill.className = `range-pill range-pill-btn ${lv.id === this.selectedEnLevel ? 'selected' : ''}`;
                pill.innerText = lv.name;
                pill.addEventListener('click', () => {
                    this.selectedEnLevel = lv.id;
                    if (Array.isArray(lv.presetTypes) && lv.presetTypes.length > 0) {
                        this.selectedEnTypes = [...lv.presetTypes];
                        drawPvzEnTypes();
                    }
                    this.dom.pvzEnLevelGrid.querySelectorAll('.range-pill, .range-pill-btn').forEach(p => p.classList.remove('selected'));
                    pill.classList.add('selected');
                });
                this.dom.pvzEnLevelGrid.appendChild(pill);
            });
        }

        if (this.dom.pvzEnPackSelect) {
            this.dom.pvzEnPackSelect.innerHTML = [
                `<option value="all">🌟 全部20主题 (${ALL_WORDS.length}词)</option>`,
                ...WORD_PACKS.map(pk => `<option value="${pk.id}">${pk.icon} ${pk.name}</option>`)
            ].join('');
            this.dom.pvzEnPackSelect.value = this.selectedEnPack;
            this.dom.pvzEnPackSelect.onchange = () => {
                this.selectedEnPack = this.dom.pvzEnPackSelect.value;
            };
        }

        if (this.dom.pvzDailyCapGrid) {
            this.dom.pvzDailyCapGrid.innerHTML = '';
            DAILY_BADGE_CAP_OPTIONS.forEach(cap => {
                const pill = document.createElement('button');
                pill.type = 'button';
                pill.className = `range-pill range-pill-btn ${cap === this.selectedDailyBadgeCap ? 'selected' : ''}`;
                pill.innerText = cap === 30 ? `每日上限 ${cap}🏅(推荐)` : `每日上限 ${cap}🏅`;
                pill.addEventListener('click', () => {
                    this.selectedDailyBadgeCap = cap;
                    this.dom.pvzDailyCapGrid.querySelectorAll('.range-pill, .range-pill-btn').forEach(p => p.classList.remove('selected'));
                    pill.classList.add('selected');
                });
                this.dom.pvzDailyCapGrid.appendChild(pill);
            });
        }
    }

    saveUserProfileSettings() {
        const name = (this.dom.inputKidName.value || '小宝贝').trim();
        const avatar = this.selectedAvatar || '🐰';

        // 运算类型检查 (防空)
        const ops = [];
        if (this.dom.chkOp_add.checked) ops.push('add');
        if (this.dom.chkOp_sub.checked) ops.push('sub');
        if (this.dom.chkOp_mul.checked) ops.push('mul');
        if (this.dom.chkOp_div.checked) ops.push('div');
        if (ops.length === 0) ops.push('add');

        const difficulty = {
            mode: this.activeDiffTab,
            presetGrade: this.selectedPresetGrade,
            operations: ops,
            range: this.selectedRange,
            maxMultiplier: this.selectedMultiplier,
            allowCarryBorrow: this.dom.chkOptCarryBorrow.checked,
            allowFillBlank: this.dom.chkOptFillBlank.checked,
            enabledTypes: this.selectedMathTypes
        };
        const prevEc = (this.editingKidId && this.editingKidId !== 'NEW')
            ? (profileManager.getUser(this.editingKidId)?.englishConfig || {})
            : {};
        const englishConfig = {
            ...prevEc,
            level: this.selectedEnLevel || 'level2_match',
            packId: (this.dom.pvzEnPackSelect && this.dom.pvzEnPackSelect.value) || this.selectedEnPack || 'all',
            enabledTypes: this.selectedEnTypes
        };
        const dailyBadgeCap = this.selectedDailyBadgeCap || DEFAULT_DAILY_BADGE_CAP;

        if (this.editingKidId === 'NEW') {
            const created = profileManager.addUser({ name, avatar, difficulty, englishConfig });
            if (profileManager.updateUserSettings) {
                profileManager.updateUserSettings(created.id, { dailyBadgeCap });
            }
        } else if (profileManager.updateUserSettings) {
            profileManager.updateUserSettings(this.editingKidId, { name, avatar, dailyBadgeCap, difficulty, englishConfig });
        } else {
            profileManager.updateUser(this.editingKidId, { name, avatar, difficulty, englishConfig });
        }

        this.updateProfileUI();
        this.syncQuestionToBlackboard();
        this.dom.userProfileModal.style.display = 'none';
        soundEngine.playVictory();
    }

    // ==========================================
    // 战报与错题攻坚本展示 (完全对标 shuxue)
    // ==========================================
    openRecordsModal() {
        const curUser = profileManager.getActiveUser();
        this.viewingRecordsKidId = curUser.id;
        this.renderScoreRecords(curUser.id);
        this.dom.scoreRecordsModal.style.display = 'flex';
    }

    renderScoreRecords(userId) {
        const users = profileManager.getUsers();
        const user = profileManager.getUser(userId) || profileManager.getActiveUser();
        this.viewingRecordsKidId = user.id;

        // 1. 小朋友筛选器
        this.dom.recordsKidSelector.innerHTML = '';
        users.forEach(u => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `btn-jelly-pill ${u.id === user.id ? 'active' : ''}`;
            btn.innerHTML = `<span>${u.avatar}</span> <span>${u.name}</span>`;
            btn.addEventListener('click', () => {
                this.renderScoreRecords(u.id);
            });
            this.dom.recordsKidSelector.appendChild(btn);
        });

        // 2. 渲染历史答题战报
        const history = user.history || [];
        this.dom.historyListBox.innerHTML = '';
        if (history.length === 0) {
            this.dom.historyListBox.innerHTML = `
                <div style="text-align:center; padding:35px 20px; color:#bdc3c7; font-size:15px;">
                    🌱 ${user.name} 还没有出战记录哦，快去后院草坪答题打僵尸吧！
                </div>
            `;
        } else {
            history.forEach(h => {
                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `
                    <div class="history-item-header">
                        <span class="history-level-tag">🗺️ 关卡 ${h.levelId}</span>
                        <span class="history-date">${h.date}</span>
                    </div>
                    <div class="history-stats-grid">
                        <div class="h-stat-pill">答题：<strong>${h.correct}/${h.total}</strong></div>
                        <div class="h-stat-pill">正确率：<strong style="color:${h.accuracy >= 80 ? '#2ecc71' : '#e67e22'}">${h.accuracy}%</strong></div>
                        <div class="h-stat-pill">最高连击：<strong style="color:#f1c40f">🔥 x${h.maxCombo}</strong></div>
                    </div>
                `;
                this.dom.historyListBox.appendChild(item);
            });
        }

        // 3. 渲染错题攻坚本（数学 + 英语双科错题）
        const mathMistakes = user.mathMistakes || user.mistakes || [];
        const enMistakes = user.englishMistakes || [];
        this.dom.mistakesListBox.innerHTML = '';
        if (mathMistakes.length === 0 && enMistakes.length === 0) {
            this.dom.mistakesListBox.innerHTML = `
                <div style="text-align:center; padding:35px 20px; color:#2ecc71; font-weight:700; font-size:16px;">
                    🎉 太棒了！当前没有任何数学或英语错题记录，${user.name} 超厉害！（也可在游戏大厅一键重练消错题哦）
                </div>
            `;
        } else {
            mathMistakes.forEach(m => {
                const item = document.createElement('div');
                item.className = 'mistake-item';
                item.innerHTML = `
                    <span class="mistake-formula">🧮 ${m.formula}</span>
                    <span class="mistake-answer">正确答案：<strong>${m.expected}</strong></span>
                `;
                this.dom.mistakesListBox.appendChild(item);
            });
            enMistakes.forEach(em => {
                const item = document.createElement('div');
                item.className = 'mistake-item';
                item.innerHTML = `
                    <span class="mistake-formula">🔤 ${em.emoji || '📘'} ${em.word}</span>
                    <span class="mistake-answer">释义：<strong>${em.zh || ''}</strong></span>
                `;
                this.dom.mistakesListBox.appendChild(item);
            });
        }
    }

    openLevelModal() {
        this.dom.levelGrid.innerHTML = '';

        // 顶部置顶：原版生存无尽模式专区
        const activeUser = profileManager.getActiveUser() || {};
        const bestFlags = activeUser.bestEndlessFlags || 0;
        const bestWave = activeUser.bestEndlessWave || 0;
        const endlessHeader = document.createElement('div');
        endlessHeader.className = 'level-group-header';
        endlessHeader.style.gridColumn = '1 / -1';
        endlessHeader.style.padding = '9px 12px';
        endlessHeader.style.margin = '2px 0 6px 0';
        endlessHeader.style.background = 'linear-gradient(90deg, rgba(243,156,18,0.28), rgba(230,126,34,0.14))';
        endlessHeader.style.border = '1px solid rgba(241,196,15,0.45)';
        endlessHeader.style.borderRadius = '8px';
        endlessHeader.style.fontWeight = 'bold';
        endlessHeader.style.fontSize = '14px';
        endlessHeader.style.color = '#ffeaa7';
        endlessHeader.innerText = bestWave > 0
            ? `♾️ 生存模式：原版无尽挑战 (最高纪录：🚩 ${bestFlags} 旗 · 第 ${bestWave} 波)`
            : '♾️ 生存模式：原版无尽挑战 (无限波次 · 自由选卡 · 每 10 波一面旗帜)';
        this.dom.levelGrid.appendChild(endlessHeader);

        const endlessCards = [
            { id: 'endless_pool', badge: '♾️ 泳池无尽', sub: '原版经典六行泳池' },
            { id: 'endless_day', badge: '♾️ 草坪无尽', sub: '白天五行草坪生存' },
            { id: 'endless_roof', badge: '♾️ 屋顶无尽', sub: '斜坡屋顶投石决战' }
        ];
        endlessCards.forEach(ec => {
            const conf = GAME_CONFIG.levels[ec.id];
            if (!conf) return;
            const card = document.createElement('div');
            card.className = `level-card level-card-endless ${ec.id === this.pvzEngine.levelId ? 'active' : ''}`;
            card.innerHTML = `
                <div class="level-card-id">${ec.badge}</div>
                <div class="level-card-name">${ec.sub}</div>
            `;
            card.addEventListener('click', () => {
                this.dom.levelModal.style.display = 'none';
                this.loadNewLevel(ec.id, { openChooser: true });
            });
            this.dom.levelGrid.appendChild(card);
        });

        const pvzRecords = (profileManager.getPvzRecords && profileManager.getPvzRecords()) || {};

        const worlds = [
            { id: 1, name: '☀️ 第一大关：白天草坪 (1-1 ~ 1-10)' },
            { id: 2, name: '🌙 第二大关：黑夜墓地 (2-1 ~ 2-10)' },
            { id: 3, name: '🌊 第三大关：碧波泳池 (3-1 ~ 3-10)' },
            { id: 4, name: '🌫️ 第四大关：浓雾迷阵 (4-1 ~ 4-10)' },
            { id: 5, name: '🏠 第五大关：屋顶决战 (5-1 ~ 5-10)' }
        ];

        worlds.forEach(w => {
            const worldLvlIds = Object.keys(GAME_CONFIG.levels).filter(id => GAME_CONFIG.levels[id].world === w.id);
            const clearedInWorld = worldLvlIds.filter(id => pvzRecords[id] && pvzRecords[id].cleared).length;

            const groupHeader = document.createElement('div');
            groupHeader.className = 'level-group-header';
            groupHeader.style.gridColumn = '1 / -1';
            groupHeader.style.padding = '8px 12px';
            groupHeader.style.margin = '10px 0 4px 0';
            groupHeader.style.background = 'rgba(255,255,255,0.08)';
            groupHeader.style.borderRadius = '8px';
            groupHeader.style.fontWeight = 'bold';
            groupHeader.style.fontSize = '14px';
            groupHeader.style.color = '#f1c40f';
            groupHeader.style.display = 'flex';
            groupHeader.style.justifyContent = 'space-between';
            groupHeader.style.alignItems = 'center';
            groupHeader.innerHTML = `<span>${w.name}</span><span style="font-size:12px; color:#ffeaa7;">${activeUser.avatar || '🐰'} ${activeUser.name || ''} 通关 ${clearedInWorld}/${worldLvlIds.length} 🏆</span>`;
            this.dom.levelGrid.appendChild(groupHeader);

            worldLvlIds.forEach(lvlId => {
                const conf = GAME_CONFIG.levels[lvlId];
                const waveCount = Array.isArray(conf.waves) ? conf.waves.length : 0;
                const flagCount = waveCount >= 20 ? 2 : 1;
                const rec = pvzRecords[lvlId];
                const isCleared = Boolean(rec && rec.cleared);
                const card = document.createElement('div');
                card.className = `level-card ${lvlId === this.pvzEngine.levelId ? 'active' : ''} ${isCleared ? 'cleared' : ''}`;
                card.innerHTML = `
                    <div class="level-card-id">${lvlId} <span style="font-size:10px;opacity:0.78;">(${waveCount}波·${flagCount}🚩)</span></div>
                    <div class="level-card-name">${conf.title.split('：')[1] || conf.title}</div>
                    ${isCleared ? `<div class="level-cleared-badge">🏆 已通关</div>` : ''}
                `;
                card.addEventListener('click', () => {
                    this.dom.levelModal.style.display = 'none';
                    this.loadNewLevel(lvlId, { openChooser: true });
                });
                this.dom.levelGrid.appendChild(card);
            });
        });
        this.dom.levelModal.style.display = 'flex';
    }

    openSeedChooserModal() {
        if (!this.pvzEngine || !this.dom.seedChooserModal) return;
        const conf = this.pvzEngine.levelConfig;
        const pool = this.getSelectablePool(conf);
        if (pool.length === 0) return;

        this.pvzEngine.isPaused = true;
        if (this.dom.btnPause) this.dom.btnPause.innerText = '▶️';

        const curActive = (this.pvzEngine.activePlants && this.pvzEngine.activePlants.length > 0)
            ? this.pvzEngine.activePlants
            : (conf.allowedPlants || []);
        this.pendingDeck = curActive.filter(id => pool.includes(id)).slice(0, 8);
        if (this.pendingDeck.length === 0) {
            this.pendingDeck = pool.slice(0, Math.min(8, pool.length));
        }

        if (this.dom.seedChooserTitle) {
            this.dom.seedChooserTitle.innerText = `🌱 战前选卡台 — ${conf.title}`;
        }

        // 渲染来袭僵尸预览
        if (this.dom.seedChooserZombies) {
            this.dom.seedChooserZombies.innerHTML = '';
            const zTypes = new Set();
            if (conf.isEndless) {
                ['normal', 'conehead', 'buckethead', 'football', 'zomboni', 'pogo', 'catapult', 'gargantuar'].forEach(t => zTypes.add(t));
                if (Array.isArray(conf.waterRows) && conf.waterRows.length > 0) {
                    ['ducky', 'snorkel', 'dolphin'].forEach(t => zTypes.add(t));
                }
            } else {
                (conf.waves || []).forEach(w => {
                    (w.zombies || []).forEach(z => {
                        if (z.type !== 'flag') zTypes.add(z.type);
                    });
                });
            }
            if (zTypes.has('dancing')) zTypes.add('backup_dancer');
            Array.from(zTypes).forEach(zt => {
                const zConf = GAME_CONFIG.zombies[zt];
                if (!zConf) return;
                const previewAnim = zConf.moonwalkAnim || zConf.landWalkAnim || (zConf.walkAnims && zConf.walkAnims[0]) || 'assets/zombies/zombie_walk.gif';
                const chip = document.createElement('div');
                chip.className = 'zombie-preview-chip';
                chip.innerHTML = `<img src="${previewAnim}" alt="${zConf.name}" /><span>${zConf.name}</span>`;
                this.dom.seedChooserZombies.appendChild(chip);
            });
        }

        this.renderSeedChooserModal();
        this.dom.seedChooserModal.style.display = 'flex';
    }

    renderSeedChooserModal() {
        if (!this.pvzEngine) return;
        const conf = this.pvzEngine.levelConfig;
        const pool = this.getSelectablePool(conf);
        const isNight = !!this.pvzEngine.isNight;
        const maxSlots = 8;

        if (this.dom.seedSelectedCount) {
            this.dom.seedSelectedCount.innerText = String(this.pendingDeck.length);
        }

        // 1. 渲染顶部 8 个卡槽
        if (this.dom.seedSelectedSlots) {
            this.dom.seedSelectedSlots.innerHTML = '';
            for (let i = 0; i < maxSlots; i++) {
                const slot = document.createElement('div');
                const pId = this.pendingDeck[i];
                if (pId && GAME_CONFIG.plants[pId]) {
                    const pConf = GAME_CONFIG.plants[pId];
                    slot.className = 'seed-slot-item filled';
                    slot.setAttribute('data-slot-id', pId);
                    slot.setAttribute('title', `点击移除 ${pConf.name}`);
                    slot.innerHTML = `<img src="${pConf.icon}" alt="${pConf.name}" />`;
                    slot.addEventListener('click', () => {
                        this.pendingDeck.splice(i, 1);
                        soundEngine.playPlant();
                        this.renderSeedChooserModal();
                    });
                } else {
                    slot.className = 'seed-slot-item';
                    slot.innerText = `${i + 1}`;
                }
                this.dom.seedSelectedSlots.appendChild(slot);
            }
        }

        // 2. 检测白天携带夜行蘑菇但未带咖啡豆
        if (this.dom.seedSleepWarning) {
            const hasSleepingShroom = !isNight && this.pendingDeck.some(id => GAME_CONFIG.plants[id] && GAME_CONFIG.plants[id].isNocturnal);
            const hasCoffee = this.pendingDeck.includes('coffeebean');
            this.dom.seedSleepWarning.style.display = (hasSleepingShroom && !hasCoffee) ? 'block' : 'none';
        }

        // 3. 渲染植物池
        if (this.dom.seedPoolGrid) {
            this.dom.seedPoolGrid.innerHTML = '';
            pool.forEach(pId => {
                const pConf = GAME_CONFIG.plants[pId];
                if (!pConf) return;
                const picked = this.pendingDeck.includes(pId);
                const sleepInDay = !isNight && !!pConf.isNocturnal;

                const item = document.createElement('div');
                item.className = `seed-pool-card ${picked ? 'picked' : ''}`;
                item.setAttribute('data-pool-id', pId);
                item.innerHTML = `
                    <img src="${pConf.icon}" alt="${pConf.name}" />
                    ${sleepInDay ? '<span class="card-sleep-badge">💤 睡</span>' : ''}
                    <span class="seed-pool-name">${pConf.name}</span>
                `;
                item.addEventListener('click', () => {
                    const idx = this.pendingDeck.indexOf(pId);
                    if (idx !== -1) {
                        this.pendingDeck.splice(idx, 1);
                        soundEngine.playPlant();
                    } else if (this.pendingDeck.length < maxSlots) {
                        this.pendingDeck.push(pId);
                        soundEngine.playPlant();
                    } else {
                        soundEngine.playMathWrong();
                    }
                    this.renderSeedChooserModal();
                });
                this.dom.seedPoolGrid.appendChild(item);
            });
        }

        if (this.dom.btnConfirmSeedDeck) {
            this.dom.btnConfirmSeedDeck.disabled = this.pendingDeck.length === 0;
            this.dom.btnConfirmSeedDeck.style.opacity = this.pendingDeck.length === 0 ? '0.5' : '1';
        }
    }

    confirmSeedDeck() {
        if (!this.pvzEngine || !this.pendingDeck || this.pendingDeck.length === 0) return;
        const deckAssets = new Set();
        this.pendingDeck.forEach(pId => this.collectPlantAssets(pId, deckAssets));
        assetsLoader.preloadAll(Array.from(deckAssets), null, 8);
        this.pvzEngine.setCustomDeck(this.pendingDeck);
        if (this.dom.seedChooserModal) {
            this.dom.seedChooserModal.style.display = 'none';
        }
        this.pvzEngine.isPaused = false;
        if (this.dom.btnPause) this.dom.btnPause.innerText = '⏸️';
        soundEngine.playPlant();
    }

    loadNewLevel(lvlId, options = {}) {
        if (!this.pvzEngine) return;
        const skipConfirm = Boolean(options && options.skipConfirm);
        if (!skipConfirm && lvlId !== this.pvzEngine.levelId && !this.pvzEngine.isGameOver && !this.pvzEngine.isVictory && this.pvzEngine.waveIndex >= 2) {
            if (!window.confirm(`当前正在第 ${this.pvzEngine.levelId} 关战斗中，确定切换关卡吗？（已获徽章与学习数据已自动保存）`)) {
                return;
            }
        }
        if (this.dom.seedChooserModal) {
            this.dom.seedChooserModal.style.display = 'none';
        }
        // 按当前关卡精准预加载背景、出战植物与本关波次僵尸，兼顾流畅切换与低内存占用
        assetsLoader.preloadAll(this.getLevelAssets(lvlId), null, 8);
        this.pvzEngine.loadLevel(lvlId);
        if (profileManager.setLastPvzLevel) {
            profileManager.setLastPvzLevel(lvlId);
        }
        this._hudCache = {};
        if (this.dom.btnPause) this.dom.btnPause.innerText = '⏸️';
        this.renderCardsList();

        const conf = this.pvzEngine.levelConfig || {};
        if (conf.isEndless) {
            const endlessNames = {
                endless_pool: '♾️ 泳池无尽 ▾',
                endless_day: '♾️ 草坪无尽 ▾',
                endless_roof: '♾️ 屋顶无尽 ▾'
            };
            this.dom.btnSelectLevel.innerText = endlessNames[lvlId] || '♾️ 无尽模式 ▾';
            if (this.dom.btnEndlessMode) this.dom.btnEndlessMode.classList.add('active-endless');
        } else {
            this.dom.btnSelectLevel.innerText = `🗺️ 第 ${lvlId} 关 ▾`;
            if (this.dom.btnEndlessMode) this.dom.btnEndlessMode.classList.remove('active-endless');
        }

        mathEngine.resetRoundStats();
        this.syncQuestionToBlackboard();

        if (options && options.openChooser) {
            const pool = this.getSelectablePool(this.pvzEngine.levelConfig);
            if (pool.length > 8) {
                this.openSeedChooserModal();
            }
        }
    }

    handleEngineState(evt, data) {
        if (evt === 'conveyor_updated' || evt === 'deck_updated') {
            this.renderCardsList();
            return;
        }
        if (evt === 'endless_flag' && data) {
            profileManager.recordEndlessProgress(data.flags || 0, data.wave || 0);
            return;
        }

        const total = mathEngine.totalAttempted;
        const correct = mathEngine.correctCount;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
        const maxCombo = mathEngine.maxCombo;

        if (evt === 'victory') {
            // 记录战报与孩子独立通关奖杯
            const clearedLvl = (data && data.levelId) || this.pvzEngine.levelId;
            if (profileManager.recordPvzLevelClear && clearedLvl && !String(clearedLvl).startsWith('endless')) {
                profileManager.recordPvzLevelClear(clearedLvl, accuracy);
            }
            profileManager.recordGameRound({
                levelId: clearedLvl,
                total,
                correct,
                accuracy,
                maxCombo,
                mistakes: mathEngine.mistakes
            });

            this.dom.victoryRewardText.innerText = data.rewardText || '恭喜守卫成功！';
            this.dom.reportTotalQ.innerText = total;
            this.dom.reportAccuracy.innerText = `${accuracy}%`;
            this.dom.reportMaxCombo.innerText = `🔥 x${maxCombo}`;
            this.dom.victoryModal.style.display = 'flex';
        } else if (evt === 'game_over') {
            const isEndless = !!(data && data.isEndless);
            const survivedWaves = (data && data.survivedWaves) || 0;
            const endlessFlags = (data && data.endlessFlags) || 0;
            if (isEndless) {
                profileManager.recordEndlessProgress(endlessFlags, survivedWaves);
            }
            profileManager.recordGameRound({
                levelId: this.pvzEngine.levelId,
                total,
                correct,
                accuracy,
                maxCombo,
                endlessWaves: isEndless ? survivedWaves : undefined,
                endlessFlags: isEndless ? endlessFlags : undefined,
                mistakes: mathEngine.mistakes
            });

            if (isEndless) {
                const activeUser = profileManager.getActiveUser() || {};
                if (this.dom.defeatModalIcon) this.dom.defeatModalIcon.innerText = '♾️';
                if (this.dom.defeatModalTitle) this.dom.defeatModalTitle.innerText = '无尽生存战报结算！';
                if (this.dom.defeatModalDesc) {
                    this.dom.defeatModalDesc.innerText = `本局坚守 第 ${survivedWaves} 波 · 夺下 🚩 ${endlessFlags} 面旗帜！(历史最高：🚩 ${activeUser.bestEndlessFlags || endlessFlags} 旗 · 第 ${activeUser.bestEndlessWave || survivedWaves} 波)`;
                }
            } else {
                if (this.dom.defeatModalIcon) this.dom.defeatModalIcon.innerText = '🧟‍♂️';
                if (this.dom.defeatModalTitle) this.dom.defeatModalTitle.innerText = '僵尸吃掉了你的脑子！';
                if (this.dom.defeatModalDesc) {
                    this.dom.defeatModalDesc.innerText = '别灰心！深呼吸，心算更快一点就能守住防线啦！';
                }
            }
            this.dom.defeatModal.style.display = 'flex';
        }
    }
}

// 页面加载完成后启动
window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new GameApp();
});
