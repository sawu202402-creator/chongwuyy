/**
 * pvzEngine.js - 核心战场循环、波次推进、除草机与 DOM 实体混合架构
 */
import { GAME_CONFIG } from './config.js?v=20261113_v2';
import { assetsLoader } from './assetsLoader.js?v=20261113_v2';
import { soundEngine } from './audio.js?v=20261113_v2';
import { createPlant } from './plants.js?v=20261113_v2';
import { Zombie } from './zombies.js?v=20261113_v2';
import { SunEntity, FloatingText, HitSplat, StarProjectile, LobbedProjectile, BowlingNutEntity } from './projectiles.js?v=20261113_v2';

export class PvzEngine {
    constructor(canvas, entityLayer, onStateChange = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.entityLayer = entityLayer;
        this.sunLayer = (typeof document !== 'undefined') ? document.getElementById('sunLayer') : null;
        this.fxCanvas = (typeof document !== 'undefined') ? document.getElementById('fxCanvas') : null;
        this.fxCtx = this.fxCanvas ? this.fxCanvas.getContext('2d') : null;
        this.fogCanvas = (typeof document !== 'undefined') ? document.getElementById('fogCanvas') : null;
        this.fogCtx = this.fogCanvas ? this.fogCanvas.getContext('2d') : null;
        this.onStateChange = onStateChange;

        this.levelId = '1-1';
        this.levelConfig = GAME_CONFIG.levels['1-1'];
        this.sun = GAME_CONFIG.initialSun;
        this.lives = GAME_CONFIG.maxLives;

        this.gridStartX = GAME_CONFIG.canvas.gridStartX;
        this.gridStartY = GAME_CONFIG.canvas.gridStartY;
        this.cellW = GAME_CONFIG.canvas.cellWidth;
        this.cellH = GAME_CONFIG.canvas.cellHeight;
        this.rows = GAME_CONFIG.canvas.rows;
        this.cols = GAME_CONFIG.canvas.cols;

        // 实体容器
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.hitSplats = [];
        this.explosions = [];
        this.suns = [];
        this.floatingTexts = [];
        this.lawnMowers = [];
        this.tombstones = [];
        this.craters = [];
        this.bowlingNuts = [];
        this.conveyorBelt = [];
        this.conveyorItems = [];
        this.conveyorUidSeq = 0;
        this.conveyorTrackOffset = 0;
        this.conveyorTimer = 0;
        this.conveyorInterval = 3.2;
        this.selectedConveyorIdx = null;
        this.isBowling = false;
        this.isNight = false;
        this.isFog = false;
        this.isRoof = false;
        this.isEndless = false;
        this.endlessFlags = 0;
        this._activeEndlessWave = null;
        this.fogClearTimer = 0;
        this.fogSlideX = 0;
        this.fogAge = 0;
        this._fogPuffCanvases = null;
        this._fxCanvasDirty = true;
        this._fogCanvasDirty = true;
        this._lastFogRenderAge = -1;

        // 植物卡片槽与冷却表
        this.activePlants = [];
        this.cardCooldowns = {};
        this.selectedCard = null;
        this.isShovelActive = false;

        // 2-5 锤僵尸特别试炼状态
        this.isWhackAZombie = false;
        this.malletCursor = { x: -100, y: -100, swingTimer: 0 };
        this.whackEffects = [];
        this.graveSpawnTimer = 0;

        // 波次推进状态
        this.waveIndex = 0;
        this.waveTimer = 0;
        this.totalWaves = 0;
        this.isWaitingWave = true;
        this.flagWaveBannerTimer = 0;
        this.flagWaveText = '';
        this.isFlagWarning = false;
        this.flagWarningTimer = 0;
        this.clearedGraceTimer = -1;

        // 自然阳光掉落计时 (初始2.5s，第一颗在7.5s掉落，后续每10秒)
        this.skySunTimer = 2.5;
        this.skySunInterval = 10.0;

        // 超载状态
        this.isSuperCharge = false;
        this.superChargeTimer = 0;

        // 运行状态
        this.isPaused = false;
        this.isGameOver = false;
        this.isVictory = false;

        this.loadLevel('1-1');
        this.bindEvents();
    }

    getSurfaceOffsetY(x) {
        if (!this.isRoof) return 0;
        if (x < 445) {
            return (445 - Math.max(12, x)) * 0.262;
        }
        if (x <= 760) {
            return 0;
        }
        return (x - 760) * 0.26;
    }

    loadLevel(levelId) {
        this.levelId = levelId;
        this.levelConfig = GAME_CONFIG.levels[levelId] || GAME_CONFIG.levels['1-1'];
        this.sun = this.levelConfig.isConveyorBelt ? 0 : (this.levelConfig.initialSun ?? GAME_CONFIG.initialSun);
        this.lives = GAME_CONFIG.maxLives;

        // 关卡环境与地形属性 (World 2 黑夜、World 3 泳池、World 4 浓雾泳池、World 5 倾斜屋顶、5-10 月夜屋顶、World 6 无尽模式)
        this.isNight = !!(this.levelConfig.isNight || this.levelConfig.world === 2 || this.levelConfig.world === 4);
        this.isFog = !!this.levelConfig.isFog;
        this.isRoof = !!this.levelConfig.isRoof;
        this.isEndless = !!this.levelConfig.isEndless;
        this.endlessFlags = 0;
        this._activeEndlessWave = null;
        this.fogClearTimer = 0;
        this.fogSlideX = this.isFog ? 480 : 0; // 开局浓雾从右侧缓缓漫入草坪
        this.fogAge = 0;
        this._fxCanvasDirty = true;
        this._fogCanvasDirty = true;
        this._lastFogRenderAge = -1;
        this.waterRows = this.levelConfig.waterRows || [];

        // 泳池 / 屋顶 / 草坪 网格坐标精确对位
        if (this.levelConfig.isPool || this.waterRows.length > 0) {
            this.rows = this.levelConfig.rowCount || 6;
            this.cols = 9;
            this.gridStartX = 80;
            this.cellW = 80;
            this.gridStartY = 82;
            this.cellH = 85;
        } else if (this.isRoof) {
            this.rows = 5;
            this.cols = 9;
            this.gridStartX = 40;
            this.cellW = 80;
            this.gridStartY = 82;
            this.cellH = 85;
        } else {
            this.rows = GAME_CONFIG.canvas.rows;
            this.cols = GAME_CONFIG.canvas.cols;
            this.gridStartX = GAME_CONFIG.canvas.gridStartX;
            this.cellW = GAME_CONFIG.canvas.cellWidth;
            this.gridStartY = GAME_CONFIG.canvas.gridStartY;
            this.cellH = GAME_CONFIG.canvas.cellHeight;
        }

        // 清理实体图层中的旧 DOM 与前景浓雾画布
        if (this.entityLayer) {
            this.entityLayer.innerHTML = '';
        }
        if (this.sunLayer) {
            this.sunLayer.innerHTML = '';
        }
        if (this.fxCtx && this.fxCanvas) {
            this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
        }
        if (this.fogCtx && this.fogCanvas) {
            this.fogCtx.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
        }
        this.suns.forEach(s => s.destroy());

        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.hitSplats = [];
        this.explosions = [];
        this.suns = [];
        this.floatingTexts = [];

        // 初始化黑夜墓碑
        this.tombstones = (this.levelConfig.tombstones || []).map(t => {
            const pos = this.getGridCoords(t.col, t.row);
            return {
                row: t.row,
                col: t.col,
                x: pos.x,
                y: pos.y
            };
        });
        this.craters = [];

        // 初始化各场景专属推车 (草坪除草机 / 泳池清洁车 / 屋顶推车)
        this.lawnMowers = [];
        const isPoolStage = !!(this.levelConfig.isPool || this.waterRows.length > 0);
        this.levelConfig.activeRows.forEach(row => {
            const cleanerType = this.isRoof
                ? 'roof'
                : (isPoolStage && this.waterRows.includes(row) ? 'pool' : 'lawn');
            const startX = this.isRoof ? 18 : (isPoolStage ? 34 : 10);
            const baseY = this.gridStartY + row * this.cellH + this.cellH / 2;
            this.lawnMowers.push({
                row: row,
                cleanerType: cleanerType,
                x: startX,
                baseY: baseY,
                y: baseY + this.getSurfaceOffsetY(startX),
                state: 'ready',
                speed: 450
            });
        });

        // 屋顶关卡开局预置花盆阵列 (原版默认左侧 3~4 列整齐摆放花盆)
        if (this.isRoof) {
            const potCols = this.levelConfig.initialPotsCols || [0, 1, 2];
            this.levelConfig.activeRows.forEach(row => {
                potCols.forEach(col => {
                    const pos = this.getGridCoords(col, row);
                    const pot = createPlant('flowerpot', row, col, pos.x, pos.y, this.entityLayer, this.isNight);
                    this.plants.push(pot);
                });
            });
        }

        // 初始化本关出战卡组与冷却表
        this.activePlants = [...(this.levelConfig.allowedPlants || ['peashooter'])];
        this.cardCooldowns = {};
        this.activePlants.forEach(pId => {
            this.cardCooldowns[pId] = 0;
        });

        // 锤僵尸模式重置 (2-5 Whack a Zombie)
        this.isWhackAZombie = !!this.levelConfig.isWhackAZombie;
        this.malletCursor = { x: -100, y: -100, swingTimer: 0 };
        this.whackEffects = [];
        this.graveSpawnTimer = 0;

        this.waveIndex = 0;
        this.waveTimer = 0;
        this.totalWaves = (this.levelConfig.waves || []).length;
        this.isWaitingWave = true;
        this.isFlagWarning = false;
        this.flagWarningTimer = 0;
        this.clearedGraceTimer = -1;
        this.flagWaveBannerTimer = 0;
        this.flagWaveText = '';
        this.skySunTimer = 2.5;
        this.skySunInterval = this.isNight ? 0 : 10.0;

        this.isPaused = false;
        this.isGameOver = false;
        this.isVictory = false;
        this.isSuperCharge = false;

        this.selectedCard = null;
        this.selectedConveyorIdx = null;
        this.isShovelActive = false;
        this.aimingCobCannon = null;
        this.cobAimCursor = { x: 450, y: 300 };

        // 保龄球与传送带系统重置
        this.isBowling = !!this.levelConfig.isBowling;
        this.bowlingNuts = [];
        this.conveyorBelt = [];
        this.conveyorItems = [];
        this.conveyorUidSeq = 0;
        this.conveyorTrackOffset = 0;
        this.conveyorTimer = 0;
        this.conveyorInterval = this.isBowling ? 2.05 : 3.4;
        this.lastWaveInitialHp = 0;

        // 初始装载传送带卡片 (从右侧入口缓缓滑入)
        if (this.levelConfig.isConveyorBelt) {
            if (this.isBowling) {
                this.spawnConveyorCard('bowling_nut', 360);
                this.spawnConveyorCard('bowling_nut', 430);
                this.spawnConveyorCard('bowling_rednut', 500);
            } else {
                const pool = this.levelConfig.conveyorCards || this.levelConfig.allowedPlants || ['peashooter'];
                if (pool && pool.length > 0) {
                    this.spawnConveyorCard(pool[0], 390);
                    this.spawnConveyorCard(pool[1] || pool[0], 470);
                }
            }
        }

        if (this.onStateChange) {
            this.onStateChange('level_loaded', { levelId, title: this.levelConfig.title });
        }
    }

    setCustomDeck(plantIds) {
        if (!Array.isArray(plantIds) || plantIds.length === 0) return;
        this.activePlants = [...plantIds];
        this.cardCooldowns = {};
        this.activePlants.forEach(pId => {
            this.cardCooldowns[pId] = 0;
        });
        this.selectedCard = null;
        this.cancelCobAim();
        if (this.onStateChange) {
            this.onStateChange('deck_updated', { activePlants: this.activePlants });
        }
    }

    resolveImitaterTarget() {
        const deck = this.activePlants || [];
        const idx = deck.indexOf('imitater');
        if (idx > 0 && deck[idx - 1] !== 'imitater' && GAME_CONFIG.plants[deck[idx - 1]]) {
            return deck[idx - 1];
        }
        if (idx >= 0 && idx + 1 < deck.length && deck[idx + 1] !== 'imitater' && GAME_CONFIG.plants[deck[idx + 1]]) {
            return deck[idx + 1];
        }
        const firstValid = deck.find(id => id !== 'imitater' && GAME_CONFIG.plants[id]);
        return firstValid || 'wallnut';
    }

    getEffectiveCardConfig(cardId) {
        if (cardId === 'imitater') {
            const copiedId = this.resolveImitaterTarget();
            const copiedConf = GAME_CONFIG.plants[copiedId] || GAME_CONFIG.plants.wallnut;
            return {
                ...GAME_CONFIG.plants.imitater,
                cost: copiedConf.cost,
                cooldown: copiedConf.cooldown || 7.5,
                isNocturnal: !!copiedConf.isNocturnal,
                copiedId,
                copiedName: copiedConf.name
            };
        }
        return GAME_CONFIG.plants[cardId] || null;
    }

    cancelCobAim() {
        if (this.aimingCobCannon && this.aimingCobCannon.domElement) {
            this.aimingCobCannon.domElement.classList.remove('cob-aiming');
        }
        this.aimingCobCannon = null;
    }

    getNormalPlantAt(row, col) {
        return this.plants.find(p =>
            !p.isDead &&
            p.row === row &&
            !['lilypad', 'flowerpot', 'pumpkin'].includes(p.type) &&
            (p.col === col || (p.isDoubleWide && p.col + 1 === col))
        ) || null;
    }

    spawnConveyorCard(specificType = null, initialX = null) {
        if (!this.levelConfig.isConveyorBelt) return;
        if (!this.conveyorItems) this.conveyorItems = [];
        if (this.conveyorItems.length >= 8) return;

        let type = specificType;
        if (!type) {
            if (this.isBowling) {
                type = Math.random() < 0.24 ? 'bowling_rednut' : 'bowling_nut';
            } else {
                const pool = this.levelConfig.conveyorCards || this.levelConfig.allowedPlants || ['peashooter'];
                type = pool[Math.floor(Math.random() * pool.length)];
            }
        }

        const lastX = this.conveyorItems.length > 0 ? this.conveyorItems[this.conveyorItems.length - 1].x : 0;
        const spawnX = initialX !== null ? initialX : Math.max(515, lastX + 58);
        this.conveyorUidSeq = (this.conveyorUidSeq || 0) + 1;
        this.conveyorItems.push({
            uid: `conv_${this.conveyorUidSeq}`,
            type: type,
            x: spawnX
        });
        this.conveyorBelt = this.conveyorItems.map(it => it.type);
        if (this.onStateChange) {
            this.onStateChange('conveyor_updated', this.conveyorBelt);
        }
    }

    consumeConveyorCard(type, index = null) {
        if (!this.conveyorItems) return;
        if (index !== null && index >= 0 && index < this.conveyorItems.length && this.conveyorItems[index].type === type) {
            this.conveyorItems.splice(index, 1);
        } else {
            const idx = this.conveyorItems.findIndex(it => it.type === type);
            if (idx !== -1) {
                this.conveyorItems.splice(idx, 1);
            }
        }
        this.conveyorBelt = this.conveyorItems.map(it => it.type);
        this.selectedConveyorIdx = null;
        if (this.onStateChange) {
            this.onStateChange('conveyor_updated', this.conveyorBelt);
        }
    }

    bindEvents() {
        const updatePointer = (e) => {
            if (!this.isWhackAZombie && !this.aimingCobCannon) return;
            const rect = this.canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const px = (e.clientX - rect.left) * scaleX;
            const py = (e.clientY - rect.top) * scaleY;
            if (this.isWhackAZombie) {
                this.malletCursor.x = px;
                this.malletCursor.y = py;
            }
            if (this.aimingCobCannon) {
                this.cobAimCursor = { x: px, y: py };
            }
        };

        const handleRightCancel = (e) => {
            if (this.aimingCobCannon || this.selectedCard || this.isShovelActive) {
                e.preventDefault();
                this.cancelCobAim();
                this.selectedCard = null;
                this.isShovelActive = false;
                if (this.onStateChange) this.onStateChange('shovel_deactivated');
            }
        };

        this.canvas.addEventListener('mousemove', updatePointer);
        this.canvas.addEventListener('contextmenu', handleRightCancel);
        this.canvas.addEventListener('click', (e) => {
            if (this.isPaused || this.isGameOver || this.isVictory) return;
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;

            this.handleClick(clickX, clickY);
        });

        if (this.entityLayer) {
            this.entityLayer.addEventListener('mousemove', updatePointer);
            this.entityLayer.addEventListener('contextmenu', handleRightCancel);
            this.entityLayer.addEventListener('click', (e) => {
                if (this.isPaused || this.isGameOver || this.isVictory) return;
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                const clickX = (e.clientX - rect.left) * scaleX;
                const clickY = (e.clientY - rect.top) * scaleY;

                this.handleClick(clickX, clickY);
            });
        }
    }

    whackAt(x, y, damage = 300) {
        this.malletCursor.x = x;
        this.malletCursor.y = y;
        this.malletCursor.swingTimer = 0.22;
        soundEngine.playMalletWhack();

        const targets = this.zombies.filter(z =>
            !z.isDead && !z.isDying && !z.isHypnotized && Math.hypot(z.x - x, z.y - y) <= 66
        );
        this.whackEffects.push({
            x,
            y,
            age: 0,
            lifespan: 0.28,
            hit: targets.length > 0
        });

        targets.forEach((z, idx) => {
            z.takeDamage(damage);
            this.hitSplats.push(new HitSplat(z.x, z.y - 10, 'stone'));
            if (idx === 0) {
                this.floatingTexts.push(new FloatingText(z.x, z.y - 38, '🔨 重锤痛击!', '#f39c12', 20));
            }
            const needGuaranteedSun = this.sun < 50 && this.suns.length === 0;
            if (needGuaranteedSun || Math.random() < 0.38) {
                const dropSun = new SunEntity(
                    z.x,
                    Math.max(70, z.y - 28),
                    Math.min(545, z.y + 18),
                    25,
                    false,
                    this.sunLayer,
                    this
                );
                this.suns.push(dropSun);
            }
        });
        return targets.length;
    }

    handleClick(x, y) {
        // 1. 优先检测点击拾取阳光/钱币
        for (let i = this.suns.length - 1; i >= 0; i--) {
            const sun = this.suns[i];
            if (sun.contains(x, y)) {
                this.collectSun(sun);
                return;
            }
        }

        // 1.2 玉米加农炮瞄准发射态：点击战场任意目标位置立即发射洲际玉米导弹（再次点击大炮自身则取消瞄准）
        if (this.aimingCobCannon) {
            if (this.selectedCard || this.isShovelActive || this.aimingCobCannon.isDead || !this.aimingCobCannon.isLoaded) {
                this.cancelCobAim();
            } else {
                const aimCell = this.getCellAt(x, y);
                if (aimCell && this.aimingCobCannon.occupiesCell(aimCell.row, aimCell.col)) {
                    this.cancelCobAim();
                    this.floatingTexts.push(new FloatingText(x, y - 30, '❎ 已取消瞄准', '#bdc3c7', 16));
                    return;
                }
                const targetX = Math.max(40, Math.min(885, x));
                const targetY = Math.max(70, Math.min(565, y));
                this.aimingCobCannon.fireAt(targetX, targetY, this);
                this.aimingCobCannon = null;
                return;
            }
        }

        // 1.5 2-5 锤僵尸模式：未选中卡片或铲子时，点击草坪直接挥动木槌敲击僵尸
        if (this.isWhackAZombie && !this.selectedCard && !this.isShovelActive) {
            this.whackAt(x, y);
            return;
        }

        // 2. 网格种植 / 铲除 / 点击玉米加农炮上膛瞄准逻辑
        const cell = this.getCellAt(x, y);
        if (!cell) {
            this.selectedCard = null;
            this.isShovelActive = false;
            this.cancelCobAim();
            return;
        }

        if (!this.levelConfig.activeRows.includes(cell.row)) {
            this.floatingTexts.push(new FloatingText(x, y, '🚫 此行未开放', '#e74c3c', 16));
            return;
        }

        // 2.2 未持卡也未拿铲子时：检测是否点击了场上已装填的玉米加农炮 -> 激活全屏准星瞄准！
        if (!this.selectedCard && !this.isShovelActive) {
            const cob = this.plants.find(p => !p.isDead && p.type === 'cobcannon' && typeof p.occupiesCell === 'function' && p.occupiesCell(cell.row, cell.col));
            if (cob) {
                if (cob.isLoaded) {
                    this.aimingCobCannon = cob;
                    this.cobAimCursor = { x, y };
                    if (cob.domElement) cob.domElement.classList.add('cob-aiming');
                    soundEngine.playPlant();
                    this.floatingTexts.push(new FloatingText(cob.x + 40, cob.y - 52, '🎯 点击草坪任意位置发射玉米导弹!', '#f1c40f', 19));
                } else {
                    this.floatingTexts.push(new FloatingText(cob.x + 40, cob.y - 45, `⏳ 玉米炮装填中 (${Math.ceil(cob.reloadTimer)}s)`, '#f39c12', 16));
                }
                return;
            }
        }

        // 铲子模式 (优先级：南瓜外罩 -> 常规植物[含双格玉米炮] -> 花盆/睡莲底座)
        if (this.isShovelActive) {
            const pumpkinPlant = this.plants.find(p => p.row === cell.row && p.col === cell.col && p.type === 'pumpkin' && !p.isDead);
            const mainPlant = this.getNormalPlantAt(cell.row, cell.col);
            const basePlant = this.plants.find(p => p.row === cell.row && p.col === cell.col && (p.type === 'lilypad' || p.type === 'flowerpot') && !p.isDead);
            const targetP = pumpkinPlant || mainPlant || basePlant;
            if (targetP) {
                if (targetP === this.aimingCobCannon) {
                    this.cancelCobAim();
                }
                const pIdx = this.plants.indexOf(targetP);
                if (pIdx !== -1) {
                    targetP.destroy();
                    this.plants.splice(pIdx, 1);
                    soundEngine.playPlant();
                    this.floatingTexts.push(new FloatingText(x, y, '🪓 已铲除', '#bdc3c7', 16));
                }
            }
            this.isShovelActive = false;
            if (this.onStateChange) this.onStateChange('shovel_deactivated');
            return;
        }

        // 种植植物模式
        if (this.selectedCard) {
            // 特殊模式：坚果保龄球 (Wall-nut Bowling)
            if (this.isBowling) {
                const boundaryX = this.gridStartX + 2.7 * this.cellW;
                if (x > boundaryX || cell.col > 2) {
                    this.floatingTexts.push(new FloatingText(x, y, '⚠️ 只能在红线左侧发射保龄球!', '#e74c3c', 18));
                    soundEngine.playMathWrong();
                    return;
                }

                // 在该行红线左侧快速发射保龄坚果
                const startX = this.gridStartX + 25;
                const startY = this.gridStartY + cell.row * this.cellH + this.cellH / 2;
                soundEngine.playBowlingRoll();
                this.bowlingNuts.push(new BowlingNutEntity(this.selectedCard, cell.row, startX, startY, this));
                this.floatingTexts.push(new FloatingText(startX + 30, startY - 25, '🎳 滚出!', '#e67e22', 18));

                this.consumeConveyorCard(this.selectedCard, this.selectedConveyorIdx);
                this.selectedCard = null;
                this.selectedConveyorIdx = null;
                return;
            }

            const isImitaterCard = (this.selectedCard === 'imitater');
            const plantConf = this.getEffectiveCardConfig(this.selectedCard);
            if (!plantConf) return;
            const checkType = isImitaterCard ? plantConf.copiedId : this.selectedCard;

            if (!this.levelConfig.isConveyorBelt && this.sun < plantConf.cost) {
                this.floatingTexts.push(new FloatingText(x, y, '☀️ 阳光不足!', '#e74c3c', 18));
                return;
            }

            // ================= 特例 A：玉米加农炮 (1x2 横向双格重炮，支持直接双格种植或叠种在玉米投手上) =================
            if (checkType === 'cobcannon') {
                const leftCol = (cell.col >= this.cols - 1) ? (this.cols - 2) : cell.col;
                const rightCol = leftCol + 1;
                const isWaterRow = (this.waterRows || []).includes(cell.row);

                const hasCrater = this.craters && this.craters.some(c => c.row === cell.row && (c.col === leftCol || c.col === rightCol) && c.lifespan > 0);
                if (hasCrater) {
                    this.floatingTexts.push(new FloatingText(x, y, '🕳️ 弹坑尚未恢复，无法架设玉米炮!', '#e74c3c', 16));
                    return;
                }
                const hasTomb = this.tombstones && this.tombstones.some(t => t.row === cell.row && (t.col === leftCol || t.col === rightCol));
                if (hasTomb) {
                    this.floatingTexts.push(new FloatingText(x, y, '🪦 墓碑阻挡，请先清除相邻两格!', '#e74c3c', 16));
                    return;
                }

                const pot1 = this.plants.find(p => p.row === cell.row && p.col === leftCol && p.type === 'flowerpot' && !p.isDead);
                const pot2 = this.plants.find(p => p.row === cell.row && p.col === rightCol && p.type === 'flowerpot' && !p.isDead);
                const lily1 = this.plants.find(p => p.row === cell.row && p.col === leftCol && p.type === 'lilypad' && !p.isDead);
                const lily2 = this.plants.find(p => p.row === cell.row && p.col === rightCol && p.type === 'lilypad' && !p.isDead);

                if (this.isRoof && (!pot1 || !pot2)) {
                    this.floatingTexts.push(new FloatingText(x, y, '🪴 架设玉米炮需要相邻 2 个花盆!', '#e67e22', 17));
                    return;
                }
                if (isWaterRow && (!lily1 || !lily2)) {
                    this.floatingTexts.push(new FloatingText(x, y, '💧 水面架设玉米炮需要相邻 2 片睡莲!', '#3498db', 17));
                    return;
                }

                const pLeft = this.getNormalPlantAt(cell.row, leftCol);
                const pRight = this.getNormalPlantAt(cell.row, rightCol);
                if ((pLeft && pLeft.type !== 'kernelpult') || (pRight && pRight.type !== 'kernelpult')) {
                    this.floatingTexts.push(new FloatingText(x, y, '🌽 玉米加农炮需要相邻2格空位或玉米投手!', '#e67e22', 17));
                    return;
                }

                // 若下方有原版前置玉米投手，优雅吸收升级
                [pLeft, pRight].forEach(kp => {
                    if (kp && !kp.isDead) {
                        kp.destroy();
                        const idx = this.plants.indexOf(kp);
                        if (idx !== -1) this.plants.splice(idx, 1);
                    }
                });

                if (!this.levelConfig.isConveyorBelt) {
                    this.sun -= plantConf.cost;
                    this.cardCooldowns[this.selectedCard] = plantConf.cooldown;
                }

                const gridPos = this.getGridCoords(leftCol, cell.row);
                const cobObj = isImitaterCard
                    ? createPlant('imitater', cell.row, leftCol, gridPos.x, gridPos.y, this.entityLayer, this.isNight, 'cobcannon')
                    : createPlant('cobcannon', cell.row, leftCol, gridPos.x, gridPos.y, this.entityLayer, this.isNight);

                if (lily1 && lily2) {
                    lily1.carriedPlant = cobObj;
                    lily2.carriedPlant = cobObj;
                    cobObj.hostLilypad = lily1;
                    cobObj.hostSecondaryLilypad = lily2;
                    if (cobObj.domElement) {
                        cobObj.domElement.classList.add('planted-on-lilypad');
                        cobObj.domElement.style.top = `${gridPos.y - 68}px`;
                    }
                } else if (pot1 && pot2) {
                    pot1.carriedPlant = cobObj;
                    pot2.carriedPlant = cobObj;
                    cobObj.hostPot = pot1;
                    cobObj.hostSecondaryPot = pot2;
                    if (cobObj.domElement) {
                        cobObj.domElement.classList.add('planted-on-pot');
                        cobObj.domElement.style.top = `${gridPos.y - 72}px`;
                    }
                }

                this.plants.push(cobObj);
                soundEngine.playPlant();
                this.floatingTexts.push(new FloatingText(gridPos.x + 40, gridPos.y - 44, '🌽 玉米加农炮就位!(点击炮身发射)', '#f1c40f', 18));
                if (this.levelConfig.isConveyorBelt) {
                    this.consumeConveyorCard(this.selectedCard, this.selectedConveyorIdx);
                }
                this.selectedCard = null;
                this.selectedConveyorIdx = null;
                if (this.onStateChange) this.onStateChange('plant_placed', { plantType: 'cobcannon' });
                return;
            }

            // 毁灭菇弹坑阻挡 (弹坑未完全愈合前无法种植)
            const craterOnCell = this.craters && this.craters.find(c => c.row === cell.row && c.col === cell.col && c.lifespan > 0);
            if (craterOnCell) {
                this.floatingTexts.push(new FloatingText(x, y, '🕳️ 弹坑尚未恢复，无法种植!', '#e74c3c', 16));
                return;
            }

            // 墓碑阻挡与吞噬逻辑
            const tombOnCell = this.tombstones && this.tombstones.find(t => t.row === cell.row && t.col === cell.col);
            if (tombOnCell && checkType !== 'gravebuster') {
                this.floatingTexts.push(new FloatingText(x, y, '🪦 墓碑阻挡，请先清除!', '#e74c3c', 16));
                return;
            }
            if (!tombOnCell && checkType === 'gravebuster') {
                this.floatingTexts.push(new FloatingText(x, y, '🪦 只能种在墓碑上!', '#e74c3c', 16));
                return;
            }

            const existingSleepTarget = this.getNormalPlantAt(cell.row, cell.col) || this.plants.find(p => p.row === cell.row && p.col === cell.col && !p.isDead);
            // 咖啡豆特殊种植逻辑 (只能种在睡眠中的植物上)
            if (checkType === 'coffeebean') {
                if (!existingSleepTarget) {
                    this.floatingTexts.push(new FloatingText(x, y, '☕ 只能种在睡觉的植物上!', '#e74c3c', 16));
                    return;
                }
                if (!existingSleepTarget.isAsleep) {
                    this.floatingTexts.push(new FloatingText(x, y, '😊 植物没有在睡觉哦!', '#f39c12', 16));
                    return;
                }
                if (!this.levelConfig.isConveyorBelt) {
                    this.sun -= plantConf.cost;
                    this.cardCooldowns[this.selectedCard] = plantConf.cooldown;
                }
                const gridPos = this.getGridCoords(cell.col, cell.row);
                const bean = createPlant('coffeebean', cell.row, cell.col, gridPos.x, gridPos.y, this.entityLayer, this.isNight, existingSleepTarget);
                this.plants.push(bean);
                soundEngine.playPlant();
                if (this.levelConfig.isConveyorBelt) {
                    this.consumeConveyorCard(this.selectedCard, this.selectedConveyorIdx);
                }
                this.selectedCard = null;
                this.selectedConveyorIdx = null;
                if (this.onStateChange) this.onStateChange('plant_placed', { plantType: 'coffeebean' });
                return;
            }

            // 实体检索 (水生底座、屋顶花盆、南瓜防护罩、常规植物)
            const isWaterRow = (this.waterRows || []).includes(cell.row);
            const lilyOnCell = this.plants.find(p => p.row === cell.row && p.col === cell.col && p.type === 'lilypad' && !p.isDead);
            const potOnCell = this.plants.find(p => p.row === cell.row && p.col === cell.col && p.type === 'flowerpot' && !p.isDead);
            const pumpkinOnCell = this.plants.find(p => p.row === cell.row && p.col === cell.col && p.type === 'pumpkin' && !p.isDead);
            let normalPlantOnCell = this.getNormalPlantAt(cell.row, cell.col);

            // 原版紫卡进化兼容：既支持空地直接种植，也支持直接叠种在对应基础植物上完成原版升级！
            const UPGRADE_BASE_MAP = {
                wintermelon: 'melonpult',
                gatlingpea: 'repeater',
                twinsunflower: 'sunflower',
                gloomshroom: 'fumeshroom',
                spikerock: 'spikeweed',
                goldmagnet: 'magnetshroom'
            };
            const canUpgradeExisting = !!(normalPlantOnCell && UPGRADE_BASE_MAP[checkType] === normalPlantOnCell.type);

            // 1. 南瓜头种植检测 (可套在已有植物外层防护)
            if (checkType === 'pumpkin') {
                if (pumpkinOnCell) {
                    this.floatingTexts.push(new FloatingText(x, y, '🎃 此处已有南瓜头', '#e67e22', 16));
                    return;
                }
                if (isWaterRow && !lilyOnCell && !(normalPlantOnCell && normalPlantOnCell.type === 'cattail')) {
                    this.floatingTexts.push(new FloatingText(x, y, '💧 水面需要先种植睡莲!', '#3498db', 18));
                    return;
                }
                if (this.isRoof && !potOnCell) {
                    this.floatingTexts.push(new FloatingText(x, y, '🪴 屋顶需要先种植花盆!', '#e67e22', 18));
                    return;
                }
            } else if (this.isRoof) {
                // 2. 屋顶关卡种植规则 (必须有花盆底座，且地刺/地刺王无法种在屋顶花盆中)
                if (checkType === 'spikeweed' || checkType === 'spikerock') {
                    this.floatingTexts.push(new FloatingText(x, y, '🚫 地刺只能直接种在草地/陆地上!', '#e67e22', 18));
                    return;
                }
                if (checkType === 'seashroom' || checkType === 'tanglekelp' || checkType === 'lilypad' || checkType === 'cattail') {
                    this.floatingTexts.push(new FloatingText(x, y, '🚫 水生植物只能种在泳池水中!', '#3498db', 18));
                    return;
                }
                if (checkType === 'flowerpot') {
                    if (potOnCell) {
                        this.floatingTexts.push(new FloatingText(x, y, '🪴 此处已有花盆', '#e67e22', 16));
                        return;
                    }
                } else {
                    if (!potOnCell) {
                        this.floatingTexts.push(new FloatingText(x, y, '🪴 屋顶需要先种植花盆!', '#e67e22', 18));
                        return;
                    }
                    if (normalPlantOnCell && !canUpgradeExisting) {
                        this.floatingTexts.push(new FloatingText(x, y, '🌱 花盆中已有植物', '#e67e22', 16));
                        return;
                    }
                }
            } else if (isWaterRow) {
                // 3. 水路种植检测
                if (checkType === 'spikeweed' || checkType === 'spikerock') {
                    this.floatingTexts.push(new FloatingText(x, y, '🚫 地刺不能种在水路睡莲上!', '#3498db', 18));
                    return;
                }
                if (checkType === 'cattail') {
                    // 香蒲：既可直接种在水面，也可直接叠种在睡莲上！
                    if (normalPlantOnCell) {
                        this.floatingTexts.push(new FloatingText(x, y, '🌊 此处水面已有植物', '#3498db', 16));
                        return;
                    }
                } else if (checkType === 'seashroom' || checkType === 'tanglekelp') {
                    // 海蘑菇 / 缠绕水草：水生植物，直接种在水中，不需要睡莲
                    if (lilyOnCell || normalPlantOnCell) {
                        this.floatingTexts.push(new FloatingText(x, y, '🌊 此处水面已有植物', '#3498db', 16));
                        return;
                    }
                } else if (checkType === 'lilypad') {
                    if (lilyOnCell || normalPlantOnCell) {
                        this.floatingTexts.push(new FloatingText(x, y, '🌱 此处已有睡莲/水生植物', '#3498db', 16));
                        return;
                    }
                } else {
                    if (!lilyOnCell) {
                        this.floatingTexts.push(new FloatingText(x, y, '💧 水面需要先种植睡莲!', '#3498db', 18));
                        return;
                    }
                    if (normalPlantOnCell && !canUpgradeExisting) {
                        this.floatingTexts.push(new FloatingText(x, y, '🌱 睡莲上已有植物', '#e67e22', 16));
                        return;
                    }
                }
            } else {
                // 4. 普通陆地种植检测
                if (checkType === 'flowerpot') {
                    this.floatingTexts.push(new FloatingText(x, y, '🪴 花盆只能在屋顶关卡种植!', '#e67e22', 18));
                    return;
                }
                if (checkType === 'lilypad') {
                    this.floatingTexts.push(new FloatingText(x, y, '🚫 睡莲只能种在水中!', '#3498db', 18));
                    return;
                }
                if (checkType === 'seashroom' || checkType === 'tanglekelp' || checkType === 'cattail') {
                    this.floatingTexts.push(new FloatingText(x, y, '🚫 水生植物只能种在水中!', '#3498db', 18));
                    return;
                }
                if (normalPlantOnCell && !canUpgradeExisting) {
                    this.floatingTexts.push(new FloatingText(x, y, '🌱 此处已有植物', '#e67e22', 16));
                    return;
                }
            }

            // 若触发了紫卡原位升级，移除被升级的基础植物并继承其外层南瓜保护关系
            if (canUpgradeExisting && normalPlantOnCell) {
                normalPlantOnCell.destroy();
                const oldIdx = this.plants.indexOf(normalPlantOnCell);
                if (oldIdx !== -1) this.plants.splice(oldIdx, 1);
                normalPlantOnCell = null;
            }

            if (!this.levelConfig.isConveyorBelt) {
                this.sun -= plantConf.cost;
                this.cardCooldowns[this.selectedCard] = plantConf.cooldown;
            }

            const gridPos = this.getGridCoords(cell.col, cell.row);
            const plantObj = isImitaterCard
                ? createPlant('imitater', cell.row, cell.col, gridPos.x, gridPos.y, this.entityLayer, this.isNight, checkType)
                : createPlant(this.selectedCard, cell.row, cell.col, gridPos.x, gridPos.y, this.entityLayer, this.isNight);

            if (checkType === 'pumpkin') {
                if (normalPlantOnCell) {
                    plantObj.protectedPlant = normalPlantOnCell;
                    normalPlantOnCell.pumpkin = plantObj;
                }
            } else {
                if (pumpkinOnCell) {
                    pumpkinOnCell.protectedPlant = plantObj;
                    plantObj.pumpkin = pumpkinOnCell;
                }
                if (lilyOnCell && checkType !== 'lilypad') {
                    if (checkType === 'cattail' && !isImitaterCard) {
                        // 原版香蒲吸收下方的睡莲融为一体
                        lilyOnCell.destroy();
                        const lIdx = this.plants.indexOf(lilyOnCell);
                        if (lIdx !== -1) this.plants.splice(lIdx, 1);
                    } else {
                        lilyOnCell.carriedPlant = plantObj;
                        plantObj.hostLilypad = lilyOnCell;
                        if (plantObj.domElement) {
                            plantObj.domElement.classList.add('planted-on-lilypad');
                            plantObj.domElement.style.zIndex = '15';
                            plantObj.domElement.style.top = `${gridPos.y - 50}px`;
                        }
                    }
                } else if (potOnCell && checkType !== 'flowerpot') {
                    potOnCell.carriedPlant = plantObj;
                    plantObj.hostPot = potOnCell;
                    if (plantObj.domElement) {
                        plantObj.domElement.classList.add('planted-on-pot');
                        plantObj.domElement.style.zIndex = '15';
                        const potLift = checkType === 'tallnut' ? 74 : (checkType === 'chomper' ? 70 : 54);
                        plantObj.domElement.style.top = `${gridPos.y - potLift}px`;
                    }
                }
            }
            this.plants.push(plantObj);
            if (plantObj.isAsleep) {
                this.floatingTexts.push(new FloatingText(gridPos.x, gridPos.y - 32, '💤 植物睡眠中 (需咖啡豆)', '#9b59b6', 16));
            }
            soundEngine.playPlant();

            if (this.levelConfig.isConveyorBelt) {
                this.consumeConveyorCard(this.selectedCard, this.selectedConveyorIdx);
            }
            this.selectedCard = null;
            this.selectedConveyorIdx = null;
            if (this.onStateChange) this.onStateChange('plant_placed', { plantType: plantConf.id });
        }
    }

    collectSun(sun) {
        soundEngine.playSun();
        this.sun += sun.value;
        this.floatingTexts.push(new FloatingText(sun.x, sun.y - 20, `+${sun.value} ☀️`, '#f1c40f', 20));
        sun.collect();
        if (this.onStateChange) this.onStateChange('sun_changed', { sun: this.sun });
    }

    removeTombstone(row, col) {
        if (!this.tombstones) return;
        this.tombstones = this.tombstones.filter(t => !(t.row === row && t.col === col));
    }

    getCellAt(canvasX, canvasY) {
        const slopeY = this.getSurfaceOffsetY(canvasX);
        const adjY = canvasY - slopeY;
        if (canvasX < this.gridStartX || canvasX >= this.gridStartX + this.cols * this.cellW ||
            adjY < this.gridStartY || adjY >= this.gridStartY + this.rows * this.cellH) {
            return null;
        }
        const col = Math.floor((canvasX - this.gridStartX) / this.cellW);
        const row = Math.floor((adjY - this.gridStartY) / this.cellH);
        return { col, row };
    }

    getGridCoords(col, row) {
        const x = this.gridStartX + col * this.cellW + this.cellW / 2;
        return {
            x: x,
            y: this.gridStartY + row * this.cellH + this.cellH / 2 + this.getSurfaceOffsetY(x)
        };
    }

    handleMathAnswerResult(result) {
        if (!result) return;

        if (result.isCorrect) {
            this.sun += result.bonusSun;
            if (this.onStateChange) this.onStateChange('sun_changed', { sun: this.sun });

            const targetX = 200 + Math.random() * 450;
            const targetY = 150 + Math.random() * 320;
            const isSuper = result.bonusSun >= 75;
            const sunEntity = new SunEntity(targetX, 0, targetY, result.bonusSun, isSuper, this.sunLayer, this);
            sunEntity.collect();
            this.suns.push(sunEntity);
            soundEngine.playMathCorrect();

            this.floatingTexts.push(
                new FloatingText(targetX, targetY - 30, `+${result.bonusSun} ☀️ 口算奖励!`, '#f1c40f', 24)
            );

            // 传送带与保龄球关卡口算奖励：传送带急速送达卡片！
            if (this.levelConfig.isConveyorBelt) {
                if (this.isBowling) {
                    const cardType = (result.combo >= 3) ? 'bowling_rednut' : 'bowling_nut';
                    this.spawnConveyorCard(cardType);
                    this.floatingTexts.push(
                        new FloatingText(targetX, targetY - 55, cardType === 'bowling_rednut' ? '🎳 连击大奖！送达赤红爆炸核弹坚果！' : '🎳 传送带急速送达保龄坚果！', '#e67e22', 20)
                    );
                } else {
                    this.spawnConveyorCard();
                }
            }

            // 2-5 锤僵尸关卡口算联动奖励：触发口算神槌自动暴击场上僵尸！
            if (this.isWhackAZombie) {
                const liveTargets = this.zombies
                    .filter(z => !z.isDead && !z.isDying && !z.isHypnotized)
                    .sort((a, b) => a.x - b.x)
                    .slice(0, 2);
                liveTargets.forEach(z => this.whackAt(z.x, z.y, 350));
                if (liveTargets.length > 0) {
                    this.floatingTexts.push(new FloatingText(450, 165, '⚡ 口算神槌追击！', '#f39c12', 24));
                }
            }

            if (result.isShieldBreak) {
                this.breakAllShields(result.shieldType);
            }

            if (result.isComboCharge) {
                this.isSuperCharge = true;
                this.superChargeTimer = GAME_CONFIG.chargeDuration;
                soundEngine.playUlt();
                this.floatingTexts.push(new FloatingText(450, 200, '🔥 连击超载狂暴！攻速大增！', '#ff793f', 26));
            }

            if (result.isComboUlt) {
                this.triggerSuperComboUlt();
            }
        } else {
            soundEngine.playMathWrong();
            this.isSuperCharge = false;
        }
    }

    breakAllShields(shieldType = null) {
        this.zombies.forEach(z => {
            if (!z.isDead && z.hasShield) {
                if (!shieldType || z.shieldType === shieldType) {
                    z.breakShieldInstantly(this);
                }
            }
        });
    }

    triggerSuperComboUlt() {
        soundEngine.playUlt();
        const ultTypeRoll = Math.random();
        if (ultTypeRoll < 0.45) {
            this.floatingTexts.push(new FloatingText(450, 180, '🌪️ 【觉醒】豌豆加特林暴风雨！', '#2ecc71', 28));
            this.plants.forEach(p => {
                if (p.type === 'peashooter' || p.type === 'repeater') {
                    p.isSuperGatling = true;
                    p.gatlingTimer = 4.0;
                }
            });
        } else if (ultTypeRoll < 0.8) {
            this.floatingTexts.push(new FloatingText(450, 180, '❄️ 【觉醒】绝对零度全场急冻！', '#3498db', 28));
            this.zombies.forEach(z => {
                if (!z.isDead) {
                    z.slowTimer = 8.0;
                    z.isSlowed = true;
                    if (z.domElement) z.domElement.classList.add('slowed');
                    z.takeDamage(40);
                }
            });
        } else {
            this.floatingTexts.push(new FloatingText(450, 180, '☀️ 【觉醒】太阳风暴天降甘霖！', '#f1c40f', 28));
            for (let i = 0; i < 6; i++) {
                const sx = 150 + Math.random() * 550;
                const sy = 120 + Math.random() * 350;
                this.suns.push(new SunEntity(sx, 0, sy, 50, true, this.sunLayer, this));
            }
        }
    }

    update(dt) {
        if (this.isPaused || this.isGameOver || this.isVictory) return;

        Object.keys(this.cardCooldowns).forEach(k => {
            if (this.cardCooldowns[k] > 0) {
                this.cardCooldowns[k] = Math.max(0, this.cardCooldowns[k] - dt);
            }
        });

        if (this.isSuperCharge) {
            this.superChargeTimer -= dt;
            if (this.superChargeTimer <= 0) {
                this.isSuperCharge = false;
            }
        }

        if (!this.levelConfig.isConveyorBelt && this.skySunInterval > 0) {
            this.skySunTimer += dt;
            if (this.skySunTimer >= this.skySunInterval) {
                this.skySunTimer = 0;
                const dropX = 180 + Math.random() * 550;
                const targetY = 120 + Math.random() * 360;
                this.suns.push(new SunEntity(dropX, 0, targetY, GAME_CONFIG.sunValueNatural, false, this.sunLayer, this));
            }
        }

        if (this.fogClearTimer > 0) {
            this.fogClearTimer = Math.max(0, this.fogClearTimer - dt);
        }
        if (this.isFog) {
            this.fogAge += dt;
            if (this.fogClearTimer > 3.6) {
                // 三叶草狂风大作：将整片浓雾向右疾速吹出屏幕右侧！
                this.fogSlideX = Math.min(580, this.fogSlideX + dt * 760);
            } else {
                // 开局漫入 或 三叶草风停后浓雾从右侧边缘缓缓重新聚拢漫回
                this.fogSlideX = Math.max(0, this.fogSlideX - dt * 155);
            }
        }

        if (this.flagWaveBannerTimer > 0) {
            this.flagWaveBannerTimer = Math.max(0, this.flagWaveBannerTimer - dt);
        }

        // 更新毁灭菇弹坑倒计时
        if (this.craters && this.craters.length > 0) {
            this.craters.forEach(c => {
                c.lifespan -= dt;
            });
            this.craters = this.craters.filter(c => c.lifespan > 0);
        }

        // 传送带机械履带滚动与卡片平滑左移堆叠动画
        if (this.levelConfig.isConveyorBelt) {
            this.conveyorTrackOffset = (this.conveyorTrackOffset + dt * 76) % 40;
            if (this.conveyorItems && this.conveyorItems.length > 0) {
                for (let i = 0; i < this.conveyorItems.length; i++) {
                    const minSlotX = i === 0 ? 6 : (this.conveyorItems[i - 1].x + 54);
                    const targetX = Math.max(6 + i * 54, minSlotX);
                    if (this.conveyorItems[i].x > targetX) {
                        this.conveyorItems[i].x = Math.max(targetX, this.conveyorItems[i].x - dt * 92);
                    }
                }
            }
            this.conveyorTimer += dt;
            if (this.conveyorTimer >= this.conveyorInterval && this.conveyorItems.length < 7) {
                this.conveyorTimer = 0;
                this.spawnConveyorCard();
            }
        }

        // 2-5 锤僵尸木槌动画与定期增生墓碑机制
        if (this.malletCursor && this.malletCursor.swingTimer > 0) {
            this.malletCursor.swingTimer = Math.max(0, this.malletCursor.swingTimer - dt);
        }
        if (this.whackEffects && this.whackEffects.length > 0) {
            this.whackEffects.forEach(ef => { ef.age += dt; });
            this.whackEffects = this.whackEffects.filter(ef => ef.age < ef.lifespan);
        }
        if (this.isWhackAZombie && this.waveIndex < this.totalWaves && this.tombstones.length < 10) {
            this.graveSpawnTimer += dt;
            if (this.graveSpawnTimer >= 14.0) {
                this.graveSpawnTimer = 0;
                const candidates = [];
                for (let r of this.levelConfig.activeRows) {
                    for (let c = 4; c <= 8; c++) {
                        const hasTomb = this.tombstones.some(t => t.row === r && t.col === c);
                        const hasPlant = this.plants.some(p => p.row === r && p.col === c && !p.isDead);
                        const hasCrater = this.craters.some(cr => cr.row === r && cr.col === c && cr.lifespan > 0);
                        if (!hasTomb && !hasPlant && !hasCrater) {
                            candidates.push({ row: r, col: c });
                        }
                    }
                }
                if (candidates.length > 0) {
                    const pick = candidates[Math.floor(Math.random() * candidates.length)];
                    const pos = this.getGridCoords(pick.col, pick.row);
                    this.tombstones.push({ row: pick.row, col: pick.col, x: pos.x, y: pos.y });
                    this.floatingTexts.push(new FloatingText(pos.x, pos.y - 26, '🪦 新墓碑隆起!', '#9b59b6', 17));
                }
            }
        }

        // 保龄球物理模拟与碰撞更新
        if (this.bowlingNuts && this.bowlingNuts.length > 0) {
            this.bowlingNuts.forEach(bn => bn.update(dt, this));
            this.bowlingNuts = this.bowlingNuts.filter(bn => !bn.isDead);
        }

        this.updateWaves(dt);

        this.plants.forEach(p => p.update(dt, this));
        this.zombies.forEach(z => z.update(dt, this));
        this.projectiles.forEach(pr => pr.update(dt, this));
        this.hitSplats.forEach(hs => hs.update(dt));
        this.explosions.forEach(ex => ex.update(dt));
        this.suns.forEach(s => s.update(dt, 160, 30));
        this.floatingTexts.forEach(ft => ft.update(dt));
        this.updateLawnMowers(dt);

        this.checkBulletCollisions();
        this.checkZombieBreach();

        this.plants = this.plants.filter(p => !p.isDead);
        this.zombies = this.zombies.filter(z => !z.isDead);
        this.projectiles = this.projectiles.filter(pr => !pr.isDead);
        this.hitSplats = this.hitSplats.filter(hs => !hs.isDead);
        this.explosions = this.explosions.filter(ex => !ex.isDead);
        this.suns = this.suns.filter(s => !s.isDead);
        this.floatingTexts = this.floatingTexts.filter(ft => !ft.isDead);

        this.checkVictoryCondition();
    }

    blowFogAway(duration = 24.0) {
        this.fogClearTimer = Math.max(this.fogClearTimer, duration);
    }

    generateEndlessWave(waveNum) {
        const activeRows = this.levelConfig.activeRows || [0, 1, 2, 3, 4];
        const waterRows = this.waterRows || [];
        const landRows = activeRows.filter(r => !waterRows.includes(r));
        const hasWater = waterRows.length > 0;
        const isFlag = (waveNum % 10 === 0);

        const landPool = ['normal', 'conehead'];
        const waterPool = hasWater ? ['ducky'] : [];

        if (waveNum >= 4) {
            landPool.push('buckethead', 'polevault', 'newspaper');
            if (hasWater) waterPool.push('snorkel');
            if (this.isRoof) landPool.push('bungee');
        }
        if (waveNum >= 8) {
            landPool.push('screendoor', 'football');
            if (!this.isRoof) landPool.push('dancing', 'zomboni');
            if (this.isRoof) landPool.push('ladder');
            if (hasWater) waterPool.push('dolphin');
        }
        if (waveNum >= 13) {
            landPool.push('pogo', 'jackinthebox', 'balloon');
            if (!this.isRoof) landPool.push('digger');
            if (this.isRoof || waveNum >= 18) landPool.push('catapult');
        }
        if (waveNum >= 20) {
            landPool.push('gargantuar');
        }

        const pickRow = (type) => {
            const zc = GAME_CONFIG.zombies[type] || GAME_CONFIG.zombies.normal;
            if (zc.isAquatic || zc.isWaterOnly) {
                return waterRows[Math.floor(Math.random() * waterRows.length)];
            }
            if (zc.isFlying || type === 'bungee') {
                return activeRows[Math.floor(Math.random() * activeRows.length)];
            }
            return landRows[Math.floor(Math.random() * landRows.length)];
        };

        const zombies = [];
        if (waveNum <= 2) {
            zombies.push({ type: 'normal', row: pickRow('normal') });
        } else if (waveNum === 3) {
            const t = (hasWater && Math.random() < 0.5) ? 'ducky' : 'conehead';
            zombies.push({ type: t, row: pickRow(t) });
        } else {
            const baseCount = isFlag
                ? Math.min(18, 6 + Math.floor(waveNum / 3))
                : Math.min(12, 2 + Math.floor(waveNum / 4));
            if (isFlag) {
                zombies.push({ type: 'flag', row: pickRow('flag') });
                // 高阶无尽旗帜波保底刷出伽刚特尔巨人压阵
                if (waveNum >= 20) {
                    const gargCount = Math.min(4, Math.floor(waveNum / 15));
                    for (let g = 0; g < gargCount; g++) {
                        zombies.push({ type: 'gargantuar', row: pickRow('gargantuar') });
                    }
                }
            }
            for (let i = 0; i < baseCount; i++) {
                const useWater = hasWater && waterPool.length > 0 && Math.random() < 0.28;
                const pool = useWater ? waterPool : landPool;
                const picked = pool[Math.floor(Math.random() * pool.length)];
                zombies.push({ type: picked, row: pickRow(picked) });
            }
        }

        return {
            delay: waveNum <= 2 ? 24 : (isFlag ? 27 : 22),
            isFlag,
            zombies
        };
    }

    spawnWaveZombies(currentWave) {
        let waveHpSum = 0;
        if (currentWave.isGraveWave && this.tombstones && this.tombstones.length > 0) {
            currentWave.zombies.forEach((zData, idx) => {
                const sameRowTomb = this.tombstones.find(t => t.row === zData.row);
                const tomb = sameRowTomb || this.tombstones[(idx + Math.floor(Math.random() * this.tombstones.length)) % this.tombstones.length];
                const spawnX = tomb.x + (Math.random() - 0.5) * 18;
                const zombie = new Zombie(zData.type, tomb.row, spawnX, this.entityLayer);
                zombie.waveBornIndex = this.waveIndex;
                waveHpSum += (zombie.hp + (zombie.armorHp || 0));
                this.zombies.push(zombie);
                if (idx < 3) {
                    this.floatingTexts.push(new FloatingText(tomb.x, tomb.y - 30, '🪦 钻出!', '#9b59b6', 17));
                }
            });
            this.lastWaveInitialHp = waveHpSum;
            return;
        }
        const activeRows = this.levelConfig.activeRows || [0, 1, 2, 3, 4];
        const waterRows = this.waterRows || [];
        const landRows = activeRows.filter(r => !waterRows.includes(r));

        currentWave.zombies.forEach((zData, idx) => {
            let zType = zData.type;
            let zConf = GAME_CONFIG.zombies[zType] || GAME_CONFIG.zombies.normal;
            let isAquatic = !!(zConf.isAquatic || zConf.isWaterOnly);
            if (isAquatic && waterRows.length === 0) {
                zType = 'normal';
                zConf = GAME_CONFIG.zombies.normal;
                isAquatic = false;
            }
            let spawnRow = zData.row;
            if (!activeRows.includes(spawnRow)) {
                spawnRow = activeRows[Math.floor(Math.random() * activeRows.length)];
            }
            if (isAquatic) {
                if (!waterRows.includes(spawnRow)) {
                    spawnRow = waterRows[Math.floor(Math.random() * waterRows.length)];
                }
            } else if (!zConf.isFlying && zType !== 'bungee' && waterRows.includes(spawnRow) && landRows.length > 0) {
                spawnRow = landRows[Math.floor(Math.random() * landRows.length)];
            }
            const startX = zType === 'bungee' ? 500 : (900 + Math.random() * 50 + Math.min(70, idx * 12));
            const zombie = new Zombie(zType, spawnRow, startX, this.entityLayer);
            zombie.waveBornIndex = this.waveIndex;
            waveHpSum += (zombie.hp + (zombie.armorHp || 0));
            this.zombies.push(zombie);
        });
        this.lastWaveInitialHp = waveHpSum;
    }

    updateWaves(dt) {
        const waves = this.levelConfig.waves || [];
        if (!this.isEndless && this.waveIndex >= waves.length) return;

        const currentWave = this.isEndless
            ? (this._activeEndlessWave || (this._activeEndlessWave = this.generateEndlessWave(this.waveIndex + 1)))
            : waves[this.waveIndex];

        // 1. 旗帜大波预警声光倒计时 (3.5秒预警，横幅震撼展开，完毕后僵尸正式出击)
        if (this.isFlagWarning) {
            this.flagWarningTimer -= dt;
            if (this.flagWarningTimer <= 0) {
                this.isFlagWarning = false;
                this.spawnWaveZombies(currentWave);

                // 黑夜关卡墓碑突袭：从每个尚未清除的墓碑中钻出一只僵尸！
                if (!currentWave.isGraveWave && this.isNight && this.tombstones && this.tombstones.length > 0) {
                    this.tombstones.forEach(tomb => {
                        const ambushType = Math.random() < 0.4 ? 'conehead' : 'normal';
                        const ambushZ = new Zombie(ambushType, tomb.row, tomb.x, this.entityLayer);
                        this.zombies.push(ambushZ);
                        this.floatingTexts.push(new FloatingText(tomb.x, tomb.y - 30, '🪦 破土而出!', '#9b59b6', 18));
                    });
                }

                this.waveIndex++;
                this._activeEndlessWave = null;
                this.waveTimer = 0;
                this.clearedGraceTimer = -1;
                if (this.isEndless) {
                    this.endlessFlags = Math.floor(this.waveIndex / 10);
                    this.sun += 100;
                    this.floatingTexts.push(
                        new FloatingText(450, 155, `🚩 第 ${this.endlessFlags} 面旗帜突破！奖励 +100 ☀️！`, '#f1c40f', 24)
                    );
                    if (this.onStateChange) {
                        this.onStateChange('endless_flag', {
                            flags: this.endlessFlags,
                            wave: this.waveIndex
                        });
                    }
                }
                if (this.onStateChange) {
                    this.onStateChange('wave_advanced', {
                        current: this.waveIndex,
                        total: this.isEndless ? 0 : this.totalWaves,
                        flags: this.endlessFlags
                    });
                }
            }
            return;
        }

        this.waveTimer += dt;

        // 2. 检查场上是否还有存活且具攻击力的僵尸 (未掉头且未倒下)
        const hasActiveZombies = this.zombies.some(z => !z.isDead && !z.isDying && !z.hasLostHead);

        let shouldTriggerWave = false;

        // 原版官方节奏核心 (对标 Board.cpp 压血线与红字前清场机制)：
        // 1) 第 1 波绝对不早产，必须等待完整开局备战期 (22~25s)
        // 2) 若下一波是旗帜大波 (currentWave.isFlag)：必须将场上存活僵尸全部清光 (或达到 42s 最大超时) 才吹响大波号角！
        // 3) 常规波次：当场上僵尸全灭，或上一波僵尸剩余总血量被打至 55% 以下 (压血线机制) 时，经 2.4~2.8s 缓冲即推进下一波！
        if (this.waveIndex > 0) {
            if (currentWave.isFlag) {
                if (!hasActiveZombies) {
                    if (this.clearedGraceTimer < 0) {
                        this.clearedGraceTimer = 3.0;
                    } else {
                        this.clearedGraceTimer -= dt;
                        if (this.clearedGraceTimer <= 0) {
                            shouldTriggerWave = true;
                            this.clearedGraceTimer = -1;
                        }
                    }
                } else {
                    this.clearedGraceTimer = -1;
                    if (this.waveTimer >= 42.0) {
                        shouldTriggerWave = true;
                    }
                }
            } else {
                let prevWaveRemHp = 0;
                this.zombies.forEach(z => {
                    if (!z.isDead && !z.isDying && !z.hasLostHead && z.waveBornIndex === this.waveIndex - 1) {
                        prevWaveRemHp += (z.hp + (z.armorHp || 0));
                    }
                });
                const hpThresholdMet = this.waveTimer >= 5.0 && this.lastWaveInitialHp > 0 && prevWaveRemHp <= this.lastWaveInitialHp * 0.55;
                if (!hasActiveZombies || hpThresholdMet) {
                    if (this.clearedGraceTimer < 0) {
                        this.clearedGraceTimer = (this.isWhackAZombie || this.isBowling) ? 2.0 : 2.8;
                    } else {
                        this.clearedGraceTimer -= dt;
                        if (this.clearedGraceTimer <= 0) {
                            shouldTriggerWave = true;
                            this.clearedGraceTimer = -1;
                        }
                    }
                } else {
                    this.clearedGraceTimer = -1;
                }
                if (!shouldTriggerWave && this.waveTimer >= currentWave.delay) {
                    shouldTriggerWave = true;
                }
            }
        } else if (this.waveTimer >= currentWave.delay) {
            shouldTriggerWave = true;
        }

        if (shouldTriggerWave) {
            if (currentWave.isFlag) {
                // 旗帜波预警启动：播放3.5秒红金经典警报横幅与低频双音调警报，暂缓生成僵尸
                this.isFlagWarning = true;
                this.flagWarningTimer = 3.5;
                this.flagWaveBannerTimer = 3.5;
                if (this.isEndless) {
                    const nextFlag = Math.floor((this.waveIndex + 1) / 10);
                    this.flagWaveText = `🚩 第 ${nextFlag} 面旗帜！大波僵尸来袭！`;
                } else {
                    const isFinal = (this.waveIndex === waves.length - 1);
                    this.flagWaveText = isFinal ? '🧟 最后一波！' : '🧟 一大波僵尸正在逼近！';
                }
                soundEngine.playHugeWave();
            } else {
                // 普通波次正常出击
                this.spawnWaveZombies(currentWave);

                this.waveIndex++;
                this._activeEndlessWave = null;
                this.waveTimer = 0;
                this.clearedGraceTimer = -1;
                if (this.onStateChange) {
                    this.onStateChange('wave_advanced', {
                        current: this.waveIndex,
                        total: this.isEndless ? 0 : this.totalWaves,
                        flags: this.endlessFlags
                    });
                }
            }
        }
    }

    updateLawnMowers(dt) {
        this.lawnMowers.forEach(mower => {
            if (mower.state === 'active') {
                mower.x += mower.speed * dt;
                mower.y = mower.baseY + this.getSurfaceOffsetY(mower.x);
                this.zombies.forEach(z => {
                    if (!z.isDead && !z.isDying && z.type !== 'bungee' && z.row === mower.row && Math.abs(z.x - mower.x) <= 46) {
                        if (typeof z.mowerDie === 'function') {
                            z.mowerDie();
                        } else {
                            z.die();
                        }
                    }
                });
                if (mower.x > 910) {
                    mower.state = 'gone';
                }
            }
        });
    }

    checkBulletCollisions() {
        this.projectiles.forEach(bullet => {
            if (bullet.isDead) return;
            // 抛物线投掷物与穿透烟雾由其自身结算
            if (bullet.isLobbed || typeof bullet.hitZombies !== 'undefined') return;

            // 屋顶斜坡阻挡机制：种植在左侧斜坡 (startX < 385) 的水平直射子弹会被升起的屋脊瓦面挡住！
            if (this.isRoof && bullet.type !== 'star' && bullet.speed > 0 && bullet.startX < 385) {
                const roofBlockX = Math.min(445, bullet.startX + 150);
                if (bullet.x >= roofBlockX) {
                    bullet.isDead = true;
                    this.hitSplats.push(new HitSplat(roofBlockX, bullet.y, bullet.type));
                    return;
                }
            }

            // 杨桃五向飞星 (2D 欧几里得距离碰撞)
            if (bullet.type === 'star') {
                const hitZombie = this.zombies.find(z =>
                    !z.isDead && !z.isHypnotized &&
                    !(z.type === 'digger' && z.diggerPhase === 'digging') &&
                    !(z.type === 'bungee' && (z.bungeePhase === 'init' || z.bungeePhase === 'targeting' || z.bungeeOffsetY < -190)) &&
                    Math.hypot(z.x - bullet.x, z.y - bullet.y) <= 28
                );
                if (hitZombie) {
                    bullet.isDead = true;
                    hitZombie.takeDamage(bullet.damage);
                    this.hitSplats.push(new HitSplat(bullet.x, bullet.y, 'pea'));
                    soundEngine.playSplat();
                }
                return;
            }

            const hitZombie = this.zombies.find(z => {
                if (z.row !== bullet.row || z.isDead || z.isHypnotized) return false;
                if (z.type === 'digger' && z.diggerPhase === 'digging') return false;
                if (z.type === 'snorkel' && z.isSubmerged) return false;
                if (z.type === 'bungee' && (z.bungeePhase === 'init' || z.bungeePhase === 'targeting' || z.bungeeOffsetY < -190)) return false;
                if (z.isFlying && !(bullet.canHitFlying || bullet.type === 'thorn')) return false;
                return Math.abs(z.x - bullet.x) <= 24;
            });
            if (hitZombie) {
                bullet.isDead = true;
                if (hitZombie.isFlying && (bullet.canHitFlying || bullet.type === 'thorn') && typeof hitZombie.popBalloon === 'function') {
                    hitZombie.popBalloon(this);
                } else {
                    hitZombie.takeDamage(bullet.damage, bullet.isSlow);
                }
                this.hitSplats.push(new HitSplat(bullet.x, bullet.y, bullet.type));
                soundEngine.playSplat();
            }
        });
    }

    checkZombieBreach() {
        const triggerLineX = Math.max(40, this.gridStartX - 4);
        this.zombies.forEach(z => {
            if (z.isDead || z.type === 'bungee' || (z.type === 'digger' && z.diggerPhase)) return;
            if (z.x <= triggerLineX) {
                const mower = this.lawnMowers.find(m => m.row === z.row);
                if (mower && mower.state === 'ready') {
                    if (z.isFlying && typeof z.popBalloon === 'function') {
                        z.popBalloon(this);
                    }
                    mower.state = 'active';
                    soundEngine.playMower();
                    const cleanerLabel = mower.cleanerType === 'pool' ? '🚤 泳池车出击!' : (mower.cleanerType === 'roof' ? '🧹 屋顶车出击!' : '🚜 启动出击!');
                    this.floatingTexts.push(new FloatingText(mower.x + 35, mower.y - 25, cleanerLabel, '#27ae60', 18));
                } else if (!mower || mower.state === 'gone') {
                    if (z.x <= 10 && !z.isDying) {
                        z.destroy();
                        this.lives--;
                        soundEngine.playLose();
                        this.floatingTexts.push(new FloatingText(30, z.y, '💔 突破防线 -1', '#e74c3c', 22));
                        if (this.onStateChange) this.onStateChange('lives_changed', { lives: this.lives });

                        if (this.lives <= 0) {
                            this.isGameOver = true;
                            if (this.onStateChange) {
                                this.onStateChange('game_over', {
                                    levelId: this.levelId,
                                    isEndless: this.isEndless,
                                    wave: this.waveIndex,
                                    flags: this.endlessFlags
                                });
                            }
                        }
                    }
                }
            }
        });
    }

    checkVictoryCondition() {
        if (this.isEndless) return;
        const waves = this.levelConfig.waves || [];
        if (this.waveIndex >= waves.length && this.zombies.length === 0 && !this.isGameOver && !this.isVictory) {
            this.isVictory = true;
            soundEngine.playVictory();
            if (this.onStateChange) {
                this.onStateChange('victory', {
                    levelId: this.levelId,
                    rewardPlant: this.levelConfig.rewardPlant,
                    rewardText: this.levelConfig.rewardText
                });
            }
        }
    }

    ensureFogPuffSprites() {
        if (this._fogPuffCanvases || typeof document === 'undefined') {
            return this._fogPuffCanvases;
        }
        const presets = [
            // 4 款不同形态的多核蓬松云团纹理（边缘 100% 高斯径向羽化归零，彻底杜绝生硬几何圆边）
            [
                { x: 110, y: 82, r: 68, c: [216, 230, 246], a: 0.44 },
                { x: 74, y: 88, r: 54, c: [204, 222, 242], a: 0.38 },
                { x: 146, y: 86, r: 56, c: [198, 218, 240], a: 0.38 },
                { x: 96, y: 62, r: 48, c: [232, 242, 252], a: 0.36 },
                { x: 128, y: 66, r: 46, c: [226, 238, 250], a: 0.34 },
                { x: 112, y: 100, r: 52, c: [164, 188, 216], a: 0.34 }
            ],
            [
                { x: 108, y: 80, r: 66, c: [208, 226, 244], a: 0.42 },
                { x: 68, y: 82, r: 50, c: [222, 236, 250], a: 0.36 },
                { x: 148, y: 90, r: 54, c: [188, 210, 236], a: 0.38 },
                { x: 118, y: 58, r: 46, c: [236, 245, 255], a: 0.34 },
                { x: 90, y: 98, r: 50, c: [168, 192, 220], a: 0.34 }
            ],
            [
                { x: 112, y: 84, r: 70, c: [196, 216, 238], a: 0.44 },
                { x: 76, y: 74, r: 52, c: [226, 238, 252], a: 0.36 },
                { x: 144, y: 76, r: 52, c: [218, 232, 248], a: 0.36 },
                { x: 108, y: 102, r: 54, c: [156, 182, 212], a: 0.36 }
            ],
            [
                { x: 110, y: 78, r: 64, c: [228, 240, 252], a: 0.40 },
                { x: 78, y: 92, r: 52, c: [192, 214, 238], a: 0.36 },
                { x: 142, y: 88, r: 54, c: [202, 220, 242], a: 0.36 },
                { x: 112, y: 60, r: 44, c: [240, 248, 255], a: 0.32 }
            ]
        ];
        this._fogPuffCanvases = presets.map(lobes => {
            const c = document.createElement('canvas');
            c.width = 220;
            c.height = 160;
            const pctx = c.getContext('2d');
            lobes.forEach(lb => {
                const g = pctx.createRadialGradient(lb.x, lb.y, lb.r * 0.08, lb.x, lb.y, lb.r);
                const [r, gr, b] = lb.c;
                g.addColorStop(0.0, `rgba(${r}, ${gr}, ${b}, ${lb.a})`);
                g.addColorStop(0.45, `rgba(${r}, ${gr}, ${b}, ${(lb.a * 0.58).toFixed(3)})`);
                g.addColorStop(0.78, `rgba(${r}, ${gr}, ${b}, ${(lb.a * 0.18).toFixed(3)})`);
                g.addColorStop(1.0, `rgba(${r}, ${gr}, ${b}, 0)`);
                pctx.fillStyle = g;
                pctx.beginPath();
                pctx.arc(lb.x, lb.y, lb.r, 0, Math.PI * 2);
                pctx.fill();
            });
            return c;
        });
        return this._fogPuffCanvases;
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. 绘制等比例背景 (900x600 真实草坪视窗)
        const bgImg = assetsLoader.getImage(this.levelConfig.bg);
        if (bgImg && bgImg.complete) {
            ctx.drawImage(bgImg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 2. 原版场景推车渲染 (草坪除草机 / 泳池两栖清洁车 / 屋顶斜坡推车)
        const lawnMowerImg = assetsLoader.getImage('assets/ui/lawnmower.png');
        const poolCleanerImg = assetsLoader.getImage('assets/ui/pool_cleaner.png');
        const poolWaterImg = assetsLoader.getImage('assets/ui/pool_cleaner_water.png');
        const roofCleanerImg = assetsLoader.getImage('assets/ui/roof_cleaner.png');

        this.lawnMowers.forEach(mower => {
            if (mower.state === 'gone') return;
            let cImg = lawnMowerImg;
            if (mower.cleanerType === 'roof') {
                cImg = roofCleanerImg || lawnMowerImg;
            } else if (mower.cleanerType === 'pool') {
                cImg = (mower.state === 'active' && mower.x >= this.gridStartX - 10)
                    ? (poolWaterImg || poolCleanerImg || lawnMowerImg)
                    : (poolCleanerImg || lawnMowerImg);
            }

            if (cImg && cImg.complete) {
                ctx.save();
                if (mower.cleanerType === 'roof') {
                    const angle = mower.x < 445 ? -Math.atan(0.262) : (mower.x > 760 ? Math.atan(0.26) : 0);
                    ctx.translate(mower.x + 28, mower.y);
                    ctx.rotate(angle);
                    ctx.drawImage(cImg, -34, -30, 68, 52);
                } else if (mower.cleanerType === 'pool') {
                    ctx.drawImage(cImg, mower.x - 6, mower.y - 26, 68, 52);
                } else {
                    ctx.drawImage(cImg, mower.x - 5, mower.y - 28, 70, 54);
                }
                ctx.restore();
            } else {
                ctx.save();
                ctx.beginPath();
                ctx.arc(mower.x + 15, mower.y, 20, 0, Math.PI * 2);
                ctx.fillStyle = mower.state === 'active' ? '#e74c3c' : '#7f8c8d';
                ctx.fill();
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.restore();
            }
        });

        // 2.5 毁灭菇核爆弹坑 (焦黑坑洞，随着时间缓慢愈合变浅)
        if (this.craters && this.craters.length > 0) {
            const craterImg = assetsLoader.getImage('assets/backgrounds/crater.png');
            this.craters.forEach(c => {
                const alpha = Math.min(1.0, c.lifespan / 8.0);
                ctx.save();
                ctx.globalAlpha = alpha;
                if (craterImg && craterImg.complete) {
                    ctx.drawImage(craterImg, c.x - 38, c.y - 12, 76, 52);
                } else {
                    ctx.fillStyle = 'rgba(25, 20, 15, 0.85)';
                    ctx.beginPath();
                    ctx.ellipse(c.x, c.y + 10, 36, 18, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(10, 8, 5, 0.95)';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
                ctx.restore();
            });
        }

        // 2.8 坚果保龄球红色警戒线 (原版经典发射界线)
        if (this.isBowling) {
            const bx = this.gridStartX + 2.7 * this.cellW;
            const topY = this.gridStartY;
            const bottomY = this.gridStartY + this.rows * this.cellH;

            ctx.save();
            // 警戒红光晕染
            ctx.strokeStyle = 'rgba(231, 76, 60, 0.4)';
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(bx, topY);
            ctx.lineTo(bx, bottomY);
            ctx.stroke();

            // 鲜红警戒虚线
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 4;
            ctx.setLineDash([14, 8]);
            ctx.beginPath();
            ctx.moveTo(bx, topY);
            ctx.lineTo(bx, bottomY);
            ctx.stroke();
            ctx.setLineDash([]);

            // 顶部发射提示标
            ctx.fillStyle = '#e74c3c';
            ctx.font = '900 13px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('◀ 红线左侧发射保龄球', bx - 8, topY - 8);
            ctx.restore();
        }

        // 3. 黑夜墓碑渲染 (位于植物与背景之间，支持墓碑吞噬者蚕食沉降效果)
        if (this.tombstones && this.tombstones.length > 0) {
            const tombImg = assetsLoader.getImage('assets/backgrounds/tombstone.png');
            this.tombstones.forEach(tomb => {
                const buster = this.plants.find(p => p.row === tomb.row && p.col === tomb.col && p.type === 'gravebuster' && !p.isDead);
                const sinkRatio = buster ? Math.min(1.0, buster.chewTimer / buster.chewTime) : 0;
                const visibleH = 88 * (1.0 - sinkRatio);
                const offsetY = 88 * sinkRatio;

                ctx.save();
                if (buster && visibleH > 0) {
                    ctx.beginPath();
                    ctx.rect(tomb.x - 45, tomb.y - 42 + offsetY, 90, visibleH);
                    ctx.clip();
                }
                if (tombImg && tombImg.complete) {
                    ctx.drawImage(tombImg, tomb.x - 38, tomb.y - 42, 76, 88);
                } else {
                    ctx.fillStyle = '#7f8c8d';
                    ctx.fillRect(tomb.x - 30, tomb.y - 35, 60, 75);
                }
                ctx.restore();
            });
        }

        // 3.8 批量单次绘制植物与陆地僵尸贴地接触暗影 (替代移动端昂贵的 45+ 动态 GIF CSS drop-shadow 高斯模糊卷积)
        if (this.plants.length > 0 || this.zombies.length > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
            ctx.beginPath();
            for (let i = 0; i < this.plants.length; i++) {
                const p = this.plants[i];
                if (p.isDead || p.isFlat || p.hostPot || p.hostLilypad || p.isPumpkin) continue;
                if (p.type === 'lilypad') continue;
                const rx = p.isDoubleWide ? 62 : 28;
                const sx = p.isDoubleWide ? p.x + this.cellW * 0.5 : p.x;
                ctx.moveTo(sx + rx, p.y + 24);
                ctx.ellipse(sx, p.y + 24, rx, 9, 0, 0, Math.PI * 2);
            }
            for (let i = 0; i < this.zombies.length; i++) {
                const z = this.zombies[i];
                if (z.isDead || z.isFlying || z.type === 'bungee' || z.inPoolWater) continue;
                if (z.type === 'digger' && z.diggerPhase === 'digging') continue;
                const isWaterLane = this.waterRows && this.waterRows.includes(z.row) && z.x <= this.gridStartX + this.cols * this.cellW - 4;
                if (isWaterLane) continue;
                const zrx = z.type === 'gargantuar' ? 42 : (z.isVehicle ? 46 : 25);
                const zy = z.y + 34;
                ctx.moveTo(z.x + zrx, zy);
                ctx.ellipse(z.x, zy, zrx, 9, 0, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.restore();
        }

        // 4. 底层画布绘制植物血条、保龄坚果以及高空抛投物的贴地/贴瓦面真实投影
        this.plants.forEach(p => p.render(ctx));
        if (this.bowlingNuts && this.bowlingNuts.length > 0) {
            this.bowlingNuts.forEach(bn => bn.render(ctx));
        }
        this.projectiles.forEach(pr => {
            if (typeof pr.renderShadow === 'function') {
                pr.renderShadow(ctx);
            }
        });
        this.suns.forEach(s => s.render(ctx));

        // 4.1 空中弹道与打击特效画布 (#fxCanvas, z-index: 35)：空闲帧零 clearRect 开销
        const fxCtx = this.fxCtx || ctx;
        const hasMalletCursor = !!(this.isWhackAZombie && !this.selectedCard && !this.isShovelActive && this.malletCursor && this.malletCursor.x >= 0);
        const hasCobCursor = !!(this.aimingCobCannon && !this.aimingCobCannon.isDead && this.aimingCobCannon.isLoaded && this.cobAimCursor);
        const hasBungeeFx = this.zombies.some(z => !z.isDead && !z.isDying && z.type === 'bungee' && z.bungeePhase && z.bungeePhase !== 'init');
        const hasFxContent = (
            this.projectiles.length > 0 ||
            this.hitSplats.length > 0 ||
            this.explosions.length > 0 ||
            this.floatingTexts.length > 0 ||
            (this.whackEffects && this.whackEffects.length > 0) ||
            hasBungeeFx ||
            hasMalletCursor ||
            hasCobCursor
        );

        if (hasFxContent) {
            if (this.fxCtx && this.fxCanvas) {
                this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
                this._fxCanvasDirty = true;
            }

            // 4.15 原版蹦极僵尸红白同心圆靶心预警与高空弹力吊绳渲染
            if (hasBungeeFx) {
                for (let i = 0; i < this.zombies.length; i++) {
                    const bz = this.zombies[i];
                    if (bz.isDead || bz.isDying || bz.type !== 'bungee' || !bz.bungeePhase || bz.bungeePhase === 'init') continue;

                    // 地面锁定红白同心圆靶心 (升空撤离阶段消失)
                    if (bz.bungeePhase !== 'ascending') {
                        const pulse = 1 + Math.sin((bz.bungeeAge || 0) * 9.0) * 0.06;
                        const tx = bz.x;
                        const ty = bz.y + 14;
                        fxCtx.save();
                        fxCtx.globalAlpha = 0.92;
                        const rings = [
                            { rx: 28 * pulse, ry: 14 * pulse, color: '#e74c3c' },
                            { rx: 20 * pulse, ry: 10 * pulse, color: '#ffffff' },
                            { rx: 12 * pulse, ry: 6 * pulse, color: '#e74c3c' },
                            { rx: 5 * pulse, ry: 2.6 * pulse, color: '#ffffff' }
                        ];
                        for (let r = 0; r < rings.length; r++) {
                            fxCtx.fillStyle = rings[r].color;
                            fxCtx.beginPath();
                            fxCtx.ellipse(tx, ty, rings[r].rx, rings[r].ry, 0, 0, Math.PI * 2);
                            fxCtx.fill();
                        }
                        fxCtx.strokeStyle = '#922b21';
                        fxCtx.lineWidth = 1.5;
                        fxCtx.beginPath();
                        fxCtx.ellipse(tx, ty, 28 * pulse, 14 * pulse, 0, 0, Math.PI * 2);
                        fxCtx.stroke();
                        fxCtx.restore();
                    }

                    // 从屏幕顶端垂下的蹦极弹力绳
                    const harnessY = bz.y - 42 + (bz.bungeeRenderOffsetY ?? bz.bungeeOffsetY ?? 0);
                    if (harnessY > 0 && bz.bungeePhase !== 'targeting') {
                        fxCtx.save();
                        fxCtx.strokeStyle = '#2f3640';
                        fxCtx.lineWidth = 3.2;
                        fxCtx.beginPath();
                        fxCtx.moveTo(bz.x + 2, 0);
                        fxCtx.lineTo(bz.x + 2, harnessY);
                        fxCtx.stroke();
                        fxCtx.strokeStyle = '#dcdde1';
                        fxCtx.lineWidth = 1.4;
                        fxCtx.beginPath();
                        fxCtx.moveTo(bz.x + 1.5, 0);
                        fxCtx.lineTo(bz.x + 1.5, harnessY);
                        fxCtx.stroke();
                        fxCtx.restore();
                    }
                }
            }

            this.projectiles.forEach(pr => pr.render(fxCtx));
            this.hitSplats.forEach(hs => hs.render(fxCtx));
            this.explosions.forEach(ex => ex.render(fxCtx));
            this.floatingTexts.forEach(ft => ft.render(fxCtx));

            // 4.2 2-5 锤僵尸木槌震波与挥锤准星渲染 (同样位于前景特效层)
            if (this.whackEffects && this.whackEffects.length > 0) {
                this.whackEffects.forEach(ef => {
                    const p = ef.age / ef.lifespan;
                    const alpha = Math.max(0, 1 - p);
                    fxCtx.save();
                    fxCtx.strokeStyle = ef.hit ? `rgba(241, 196, 15, ${alpha})` : `rgba(189, 195, 199, ${alpha * 0.7})`;
                    fxCtx.lineWidth = ef.hit ? 5 : 3;
                    fxCtx.beginPath();
                    fxCtx.ellipse(ef.x, ef.y + 8, 18 + p * 38, 10 + p * 20, 0, 0, Math.PI * 2);
                    fxCtx.stroke();
                    fxCtx.restore();
                });
            }
            if (hasMalletCursor) {
                const malletImg = assetsLoader.getImage('assets/ui/mallet.png');
                if (malletImg && malletImg.complete) {
                    fxCtx.save();
                    fxCtx.translate(this.malletCursor.x + 22, this.malletCursor.y - 6);
                    const swingAngle = this.malletCursor.swingTimer > 0
                        ? -0.75 * Math.sin((this.malletCursor.swingTimer / 0.22) * Math.PI)
                        : 0.28;
                    fxCtx.rotate(swingAngle);
                    fxCtx.drawImage(malletImg, -46, -68, 76, 76);
                    fxCtx.restore();
                }
            }

            // 4.3 玉米加农炮战术准星与 3x3 轰炸范围预览圈
            if (hasCobCursor) {
                const tx = this.cobAimCursor.x;
                const ty = this.cobAimCursor.y;
                const pulse = 1 + Math.sin(performance.now() * 0.01) * 0.06;
                fxCtx.save();

                // 3x3 爆破覆盖范围虚线警示环
                fxCtx.setLineDash([8, 6]);
                fxCtx.strokeStyle = 'rgba(231, 76, 60, 0.55)';
                fxCtx.fillStyle = 'rgba(231, 76, 60, 0.11)';
                fxCtx.lineWidth = 2.2;
                fxCtx.beginPath();
                fxCtx.ellipse(tx, ty, 118, 98, 0, 0, Math.PI * 2);
                fxCtx.fill();
                fxCtx.stroke();
                fxCtx.setLineDash([]);

                // 经典红金十字准星
                fxCtx.translate(tx, ty);
                fxCtx.scale(pulse, pulse);
                fxCtx.strokeStyle = '#ff3838';
                fxCtx.lineWidth = 3.5;
                fxCtx.beginPath();
                fxCtx.arc(0, 0, 22, 0, Math.PI * 2);
                fxCtx.stroke();

                fxCtx.strokeStyle = '#ffd32a';
                fxCtx.lineWidth = 2;
                fxCtx.beginPath();
                fxCtx.arc(0, 0, 10, 0, Math.PI * 2);
                fxCtx.stroke();

                fxCtx.strokeStyle = '#ff3838';
                fxCtx.lineWidth = 3;
                fxCtx.beginPath();
                fxCtx.moveTo(-30, 0); fxCtx.lineTo(-13, 0);
                fxCtx.moveTo(13, 0);  fxCtx.lineTo(30, 0);
                fxCtx.moveTo(0, -30); fxCtx.lineTo(0, -13);
                fxCtx.moveTo(0, 13);  fxCtx.lineTo(0, 30);
                fxCtx.stroke();

                fxCtx.fillStyle = '#ffd32a';
                fxCtx.beginPath();
                fxCtx.arc(0, 0, 3.5, 0, Math.PI * 2);
                fxCtx.fill();
                fxCtx.restore();
            }
        } else if (this.fxCtx && this.fxCanvas && this._fxCanvasDirty) {
            this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
            this._fxCanvasDirty = false;
        }

        // 4.5. 前景浓雾与波次横幅层渲染 (非浓雾且无横幅关卡完全跳过 clearRect；浓雾层采用 30fps 持久帧缓冲节流降低 75% 像素填充率)
        const fgCtx = this.fogCtx || ctx;
        const hasBanner = this.flagWaveBannerTimer > 0;
        if (!this.isFog && !hasBanner) {
            if (this.fogCtx && this.fogCanvas && this._fogCanvasDirty) {
                this.fogCtx.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
                this._fogCanvasDirty = false;
            }
            return;
        }

        if (this.isFog && !hasBanner && this.fogCtx && this.fogCanvas) {
            const curFogAge = this.fogAge || 0;
            if (this._lastFogRenderAge >= 0 && (curFogAge - this._lastFogRenderAge) < 0.032) {
                return;
            }
            this._lastFogRenderAge = curFogAge;
        }

        if (this.fogCtx && this.fogCanvas) {
            this.fogCtx.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
            this._fogCanvasDirty = true;
        }

        if (this.isFog) {
            const slideX = this.fogSlideX || 0;
            const baseStartCol = (this.levelId === '4-1' || this.levelId === '4-2') ? 5 : 4;
            const fogEdgeX = this.gridStartX + baseStartCol * this.cellW - 28 + slideX;

            if (fogEdgeX < this.canvas.width + 40) {
                fgCtx.save();
                // 1) 柔和羽化雾底（模拟夜幕水汽弥漫，无任何硬边）
                const gradStart = Math.max(0, fogEdgeX - 36);
                const gradEnd = Math.min(this.canvas.width + 120, fogEdgeX + 190);
                const fogGrad = fgCtx.createLinearGradient(gradStart, 0, gradEnd, 0);
                fogGrad.addColorStop(0.0, 'rgba(168, 192, 220, 0.0)');
                fogGrad.addColorStop(0.32, 'rgba(166, 190, 218, 0.58)');
                fogGrad.addColorStop(0.68, 'rgba(156, 182, 212, 0.88)');
                fogGrad.addColorStop(1.0, 'rgba(144, 170, 202, 0.94)');
                fgCtx.fillStyle = fogGrad;
                fgCtx.fillRect(gradStart, 0, this.canvas.width - gradStart, this.canvas.height);

                // 2) 高效低重绘率蓬松云雾团（疏密优化网格排布，保持完整蓬松层次感）
                const puffs = this.ensureFogPuffSprites();
                const t = (this.fogAge || 0);
                if (puffs && puffs.length > 0) {
                    const fogWidthCols = Math.ceil(((9 - baseStartCol + 1) * 80) / 112);
                    for (let r = 0; r < 6; r++) {
                        for (let c = 0; c <= fogWidthCols; c++) {
                            const seed = (r + 1) * 13.7 + c * 7.3;
                            const puffImg = puffs[(r * 3 + c * 5) % puffs.length];
                            const driftX = Math.sin(t * 0.75 + seed) * 14 + Math.cos(t * 0.42 + seed * 0.5) * 6;
                            const driftY = Math.cos(t * 0.65 + seed * 1.1) * 7;
                            const breathe = 1.0 + Math.sin(t * 0.9 + seed * 0.8) * 0.06;

                            const cx = fogEdgeX + 38 + c * 112 + (r % 2 === 0 ? 0 : 34) + driftX;
                            const cy = 54 + r * 98 + driftY;
                            if (cx - 135 > this.canvas.width) continue;

                            const pw = 256 * breathe;
                            const ph = 186 * breathe;
                            fgCtx.globalAlpha = c === 0 ? 0.78 : 0.92;
                            fgCtx.drawImage(puffImg, cx - pw / 2, cy - ph / 2, pw, ph);
                        }
                    }
                    fgCtx.globalAlpha = 1.0;
                }

                // 3) 路灯花 (Plantern) 与火炬树桩 (Torchwood) 驱散周围浓雾视野
                const lightPlants = this.plants.filter(
                    p => !p.isDead && !p.isAsleep && (p.isLightSource || p.type === 'plantern' || p.type === 'torchwood')
                );
                if (lightPlants.length > 0 && this.fogCtx) {
                    fgCtx.globalCompositeOperation = 'destination-out';
                    lightPlants.forEach(lp => {
                        const r = lp.lightRadius || (lp.type === 'torchwood' ? 115 : 215);
                        const holeGrad = fgCtx.createRadialGradient(lp.x, lp.y, r * 0.30, lp.x, lp.y, r);
                        holeGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
                        holeGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.88)');
                        holeGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
                        fgCtx.fillStyle = holeGrad;
                        fgCtx.beginPath();
                        fgCtx.arc(lp.x, lp.y, r, 0, Math.PI * 2);
                        fgCtx.fill();
                    });
                    fgCtx.globalCompositeOperation = 'source-over';
                    lightPlants.forEach(lp => {
                        const r = lp.lightRadius || (lp.type === 'torchwood' ? 115 : 215);
                        const warmGrad = fgCtx.createRadialGradient(lp.x, lp.y, 8, lp.x, lp.y, r * 0.85);
                        warmGrad.addColorStop(0, 'rgba(255, 236, 150, 0.20)');
                        warmGrad.addColorStop(1, 'rgba(255, 220, 120, 0.0)');
                        fgCtx.fillStyle = warmGrad;
                        fgCtx.beginPath();
                        fgCtx.arc(lp.x, lp.y, r * 0.85, 0, Math.PI * 2);
                        fgCtx.fill();
                    });
                }
                fgCtx.restore();
            }
        }

        // 5. 大波僵尸横幅 (原版红金震撼警报横幅与全屏警示，绘制在前景层最上方)
        if (hasBanner) {
            fgCtx.save();
            const elapsed = 3.5 - this.flagWaveBannerTimer;

            // 全屏红色危机呼吸闪烁 (Red Alert Vignette)
            const flashAlpha = Math.max(0, Math.sin(elapsed * 7) * 0.18);
            fgCtx.fillStyle = `rgba(220, 20, 20, ${flashAlpha})`;
            fgCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // 横幅居中与弹性呼吸
            const bannerY = 240;
            const bannerH = 88;
            const centerY = bannerY + bannerH / 2;
            const scale = 1.0 + Math.sin(elapsed * 6.5) * 0.035;

            fgCtx.translate(this.canvas.width / 2, centerY);
            fgCtx.scale(scale, scale);
            fgCtx.translate(-this.canvas.width / 2, -centerY);

            // 横幅背景：深血红至炽烈红的三段渐变 + 左右边缘暗角
            const bgGrad = fgCtx.createLinearGradient(0, bannerY, 0, bannerY + bannerH);
            bgGrad.addColorStop(0, '#3a0202');
            bgGrad.addColorStop(0.18, '#850a0a');
            bgGrad.addColorStop(0.5, '#bd1010');
            bgGrad.addColorStop(0.82, '#850a0a');
            bgGrad.addColorStop(1, '#320202');
            fgCtx.fillStyle = bgGrad;
            fgCtx.fillRect(0, bannerY, this.canvas.width, bannerH);

            // 左右边缘暗影羽化
            const fadeLeft = fgCtx.createLinearGradient(0, bannerY, 120, bannerY);
            fadeLeft.addColorStop(0, 'rgba(10, 2, 2, 0.7)');
            fadeLeft.addColorStop(1, 'rgba(10, 2, 2, 0)');
            fgCtx.fillStyle = fadeLeft;
            fgCtx.fillRect(0, bannerY, 120, bannerH);

            const fadeRight = fgCtx.createLinearGradient(this.canvas.width - 120, bannerY, this.canvas.width, bannerY);
            fadeRight.addColorStop(0, 'rgba(10, 2, 2, 0)');
            fadeRight.addColorStop(1, 'rgba(10, 2, 2, 0.7)');
            fgCtx.fillStyle = fadeRight;
            fgCtx.fillRect(this.canvas.width - 120, bannerY, 120, bannerH);

            // 顶部与底部双重纯正镀金边框
            fgCtx.strokeStyle = '#ffd700';
            fgCtx.lineWidth = 3.5;
            fgCtx.beginPath();
            fgCtx.moveTo(0, bannerY);
            fgCtx.lineTo(this.canvas.width, bannerY);
            fgCtx.moveTo(0, bannerY + bannerH);
            fgCtx.lineTo(this.canvas.width, bannerY + bannerH);
            fgCtx.stroke();

            // 内缘精致金线
            fgCtx.strokeStyle = '#b8860b';
            fgCtx.lineWidth = 1.5;
            fgCtx.beginPath();
            fgCtx.moveTo(0, bannerY + 5);
            fgCtx.lineTo(this.canvas.width, bannerY + 5);
            fgCtx.moveTo(0, bannerY + bannerH - 5);
            fgCtx.lineTo(this.canvas.width, bannerY + bannerH - 5);
            fgCtx.stroke();

            // 边框金色菱形铆钉点缀
            fgCtx.fillStyle = '#ffec8b';
            for (let rx = 24; rx < this.canvas.width; rx += 48) {
                fgCtx.beginPath();
                fgCtx.arc(rx, bannerY + 2.5, 2.5, 0, Math.PI * 2);
                fgCtx.fill();
                fgCtx.beginPath();
                fgCtx.arc(rx, bannerY + bannerH - 2.5, 2.5, 0, Math.PI * 2);
                fgCtx.fill();
            }

            // 文字渲染：正统PVZ立体加粗描边 + 偏移立体投影 (零 shadowBlur 模糊开销)
            fgCtx.font = '900 42px "Microsoft YaHei", "SimHei", "PingFang SC", "Arial Black", sans-serif';
            fgCtx.textAlign = 'center';
            fgCtx.textBaseline = 'middle';

            fgCtx.lineJoin = 'round';
            fgCtx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
            fgCtx.lineWidth = 10;
            fgCtx.strokeText(this.flagWaveText, this.canvas.width / 2, centerY + 4);

            fgCtx.strokeStyle = '#050202';
            fgCtx.lineWidth = 9;
            fgCtx.strokeText(this.flagWaveText, this.canvas.width / 2, centerY);

            const textGrad = fgCtx.createLinearGradient(0, centerY - 22, 0, centerY + 22);
            textGrad.addColorStop(0, '#fff48d');
            textGrad.addColorStop(0.35, '#ffcc00');
            textGrad.addColorStop(0.7, '#ff5a1f');
            textGrad.addColorStop(1, '#d81212');
            fgCtx.fillStyle = textGrad;
            fgCtx.fillText(this.flagWaveText, this.canvas.width / 2, centerY);

            fgCtx.restore();
        }
    }
}
