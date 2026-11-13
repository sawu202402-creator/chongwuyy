/**
 * gameEngine.js - 塔防核心逻辑循环、波次生成器与物理结算
 */

import { GAME_CONFIG, TOWER_TYPES } from './config.js?v=20261022_authentic_props_v9';
import { GameMap, MapProp } from './map.js?v=20261022_authentic_props_v9';
import { Tower } from './towers.js?v=20261022_authentic_props_v9';
import { Enemy } from './enemies.js?v=20261022_authentic_props_v9';
import { ProjectileSystem } from './projectiles.js?v=20261022_authentic_props_v9';
import { sound } from './audio.js?v=20261022_authentic_props_v9';

export class GameEngine {
    constructor(canvas, mathEngine, onStateChange) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mathEngine = mathEngine;
        this.onStateChange = onStateChange || (() => {});

        this.map = new GameMap(GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
        this.projectileSystem = new ProjectileSystem();

        // 核心数值
        this.lives = GAME_CONFIG.initialLives;
        this.gold = GAME_CONFIG.initialGold;
        this.wave = 0;
        this.maxWaves = 10;
        this.state = 'IDLE'; // IDLE, PREPARING, WAVE_RUNNING, VICTORY, GAME_OVER, PAUSED
        this.currentLevel = 1;

        // 实体列表
        this.towers = [];
        this.enemies = [];
        this.selectedTower = null;
        this.selectedSlot = null;
        this.targetedEnemy = null; // 官方集火/算式锁定目标怪物
        this.targetedProp = null;  // 玩家手动集火锁定道具
        this.allPropsClearedRewarded = false;

        // 波次生成计时器
        this.waveBreakTimer = 0;
        this.enemySpawnQueue = [];
        this.spawnTimer = 0;

        // 动画时间戳
        this.lastTime = performance.now();
        this.running = false;
        this.animationFrameId = null;

        // 连击全场特效
        this.time = 0;
    }

    // 载入并切换指定关卡 (1 ~ 12)
    loadLevel(levelId) {
        this.currentLevel = levelId;
        this.map.setLevel(levelId);
        const config = this.map.currentLevelConfig;
        this.maxWaves = config?.maxWaves || (levelId <= 3 ? 15 : (levelId <= 8 ? 18 : 20));
        this.startNewGame();
    }

    stopLoop() {
        this.running = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    // 重置并启动新游戏
    startNewGame() {
        this.stopLoop();
        this._roundRecorded = false;
        if (this.mathEngine && this.mathEngine.resetRoundStats) {
            this.mathEngine.resetRoundStats();
        }
        this.lives = GAME_CONFIG.initialLives;
        this.gold = GAME_CONFIG.initialGold;
        this.wave = 0;
        this.maxWaves = this.map.currentLevelConfig?.maxWaves || (this.currentLevel <= 3 ? 15 : (this.currentLevel <= 8 ? 18 : 20));
        this.towers = [];
        this.enemies = [];
        this.selectedTower = null;
        this.selectedSlot = null;
        this.targetedEnemy = null;
        this.targetedProp = null;
        this.allPropsClearedRewarded = false;
        if (!this.projectileSystem) {
            this.projectileSystem = new ProjectileSystem();
        } else {
            this.projectileSystem.clear();
        }

        // 重新初始化地图配置与道具障碍物
        this.map.setLevel(this.currentLevel);

        // 重置槽位
        for (const slot of this.map.towerSlots) {
            slot.occupied = false;
            slot.tower = null;
        }

        this.state = 'PREPARING';
        this.waveBreakTimer = 4.0; // 首次准备 4 秒
        this.notifyState();

        this.running = true;
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame(t => this.loop(t));
    }

    // 暂停/恢复
    togglePause() {
        if (this.state === 'PAUSED') {
            this.state = this.previousState || 'WAVE_RUNNING';
            this.lastTime = performance.now();
        } else if (this.state === 'WAVE_RUNNING' || this.state === 'PREPARING') {
            this.previousState = this.state;
            this.state = 'PAUSED';
        }
        this.notifyState();
    }

    // 提前触发下一波
    callNextWaveImmediately() {
        if (this.state === 'PREPARING') {
            this.waveBreakTimer = 0;
            this.startNextWave();
        }
    }

    // 开始下一波敌人
    startNextWave() {
        this.wave++;
        this.state = 'WAVE_RUNNING';
        this.enemySpawnQueue = this.generateWaveQueue(this.wave);
        this.spawnTimer = 0.5;
        this.notifyState();
    }

    // 智能波次怪物阵容编排 (支持 15~20 波梯级演进)
    // 关卡波次怪兽生成队列 (深度对齐四大主题特色怪兽、关卡梯次与波次多变战术)
    generateWaveQueue(wave) {
        const queue = [];
        const lvl = Number(this.currentLevel) || 1;

        // 1. 获取当前主题怪物体系 (天际/丛林/沙漠/深海)
        let themeKey = 'SKY';
        let monsters = {
            basic: 'SLIME',
            fast: 'RABBIT',
            tank: 'GOLEM',
            special: 'SHIELD_MATH',
            boss: 'BOSS_DEMON'
        };

        if (lvl >= 13 && lvl <= 24) {
            themeKey = 'JUNGLE';
            monsters = {
                basic: 'JUNGLE_SLIME',
                fast: 'JUNGLE_BAT',
                tank: 'JUNGLE_GOLEM',
                special: 'JUNGLE_CYCLOPS',
                boss: 'BOSS_JUNGLE'
            };
        } else if (lvl >= 25 && lvl <= 36) {
            themeKey = 'DESERT';
            monsters = {
                basic: 'DESERT_SLIME',
                fast: 'DESERT_STAR',
                tank: 'DESERT_GOLEM',
                special: 'DESERT_DEVIL',
                boss: 'BOSS_DESERT'
            };
        } else if (lvl >= 37) {
            themeKey = 'DEEPSEA';
            monsters = {
                basic: 'SEA_SLIME',
                fast: 'SEA_JELLY',
                tank: 'SEA_CONCH',
                special: 'SEA_URCHIN',
                boss: 'BOSS_DEEPSEA'
            };
        }

        // 2. 关卡内的层级与阶段 (subLevel 1~12)
        const subLevel = ((lvl - 1) % 12) + 1;
        const isThemeBossLevel = (subLevel === 12);
        const isMidBossLevel = (subLevel === 6);

        // 3. 特殊波次判定 (决战波次 / 首领波次 / 精英突击)
        const isFinalWave = (wave === this.maxWaves);
        const isPreFinalWave = (wave === this.maxWaves - 1);
        const isMidWave = (wave === Math.floor(this.maxWaves / 2));

        if (isFinalWave) {
            // === 最终决战波次 ===
            if (isThemeBossLevel) {
                // 章节第 12 关终极大决战：专属终极领主君临 + 精锐护卫队
                for (let i = 0; i < 4; i++) queue.push({ type: monsters.fast, delay: 0.7 });
                for (let i = 0; i < 2; i++) queue.push({ type: monsters.tank, delay: 1.2 });
                queue.push({ type: monsters.boss, delay: 2.2 });
                for (let i = 0; i < 3; i++) queue.push({ type: monsters.special, delay: 1.0, hasMathShield: true });
                for (let i = 0; i < 4; i++) queue.push({ type: monsters.fast, delay: 0.6 });
            } else if (isMidBossLevel) {
                // 章节第 6 关半程首领试炼
                for (let i = 0; i < 4; i++) queue.push({ type: monsters.fast, delay: 0.7 });
                queue.push({ type: monsters.boss, delay: 2.0 });
                for (let i = 0; i < 3; i++) queue.push({ type: monsters.tank, delay: 1.2 });
                for (let i = 0; i < 3; i++) queue.push({ type: monsters.special, delay: 1.0, hasMathShield: true });
            } else {
                // 常规关卡决战波次：精英混编强力突击
                for (let i = 0; i < 6; i++) queue.push({ type: monsters.fast, delay: 0.6 });
                for (let i = 0; i < 3; i++) queue.push({ type: monsters.tank, delay: 1.1 });
                for (let i = 0; i < 4; i++) queue.push({ type: monsters.special, delay: 1.0, hasMathShield: (i % 2 === 0) });
                for (let i = 0; i < 5; i++) queue.push({ type: monsters.basic, delay: 0.8 });
            }
        } else if (isPreFinalWave) {
            // === 决战前夕大狂潮 ===
            const rushCount = 6 + Math.floor(subLevel / 2);
            for (let i = 0; i < rushCount; i++) queue.push({ type: monsters.fast, delay: 0.55 });
            for (let i = 0; i < 3; i++) queue.push({ type: monsters.tank, delay: 1.2 });
            for (let i = 0; i < 3; i++) queue.push({ type: monsters.special, delay: 1.0, hasMathShield: true });
        } else if (isMidWave && (subLevel >= 4)) {
            // === 关卡中期高潮波 ===
            for (let i = 0; i < 4; i++) queue.push({ type: monsters.fast, delay: 0.8 });
            queue.push({ type: monsters.tank, delay: 1.5 });
            queue.push({ type: monsters.special, delay: 1.2, hasMathShield: true });
            queue.push({ type: monsters.tank, delay: 1.5 });
            for (let i = 0; i < 4; i++) queue.push({ type: monsters.basic, delay: 0.9 });
        } else if (wave === 1) {
            // === 第 1 波：热身探路 (带 1 个趣味心算护盾怪) ===
            const count = 4 + (subLevel >= 6 ? 2 : 0);
            for (let i = 0; i < 2; i++) queue.push({ type: monsters.basic, delay: 1.6 });
            queue.push({ type: monsters.special, delay: 1.8, hasMathShield: true });
            for (let i = 0; i < count - 2; i++) queue.push({ type: monsters.basic, delay: 1.5 });
        } else if (wave === 2) {
            // === 第 2 波：疾速突击者登场 ===
            for (let i = 0; i < 4; i++) queue.push({ type: monsters.basic, delay: 1.2 });
            for (let i = 0; i < 3 + Math.floor(subLevel / 3); i++) queue.push({ type: monsters.fast, delay: 0.9 });
        } else if (wave === 3) {
            // === 第 3 波：特种/数盾协同 ===
            for (let i = 0; i < 3; i++) queue.push({ type: monsters.basic, delay: 1.1 });
            queue.push({ type: monsters.special, delay: 1.4, hasMathShield: true });
            for (let i = 0; i < 3; i++) queue.push({ type: monsters.fast, delay: 0.9 });
            queue.push({ type: monsters.special, delay: 1.4, hasMathShield: true });
        } else {
            // === 动态波次演化 (根据关卡编号与波次交替不同战术组合) ===
            const pattern = (lvl * 3 + wave * 5) % 4;
            const totalCount = 7 + Math.floor(wave * 1.2) + Math.floor(subLevel * 0.5);

            if (pattern === 0) {
                // 战术 A: 极速怪兽冲刺狂潮
                for (let i = 0; i < totalCount; i++) {
                    const isSpecial = (i === 3 || i === 7);
                    if (isSpecial) {
                        queue.push({ type: monsters.special, delay: 1.1, hasMathShield: true });
                    } else if (i % 2 === 0) {
                        queue.push({ type: monsters.fast, delay: 0.65 });
                    } else {
                        queue.push({ type: monsters.basic, delay: 0.85 });
                    }
                }
            } else if (pattern === 1) {
                // 战术 B: 重装铁壁推进流
                queue.push({ type: monsters.tank, delay: 1.8 });
                for (let i = 0; i < Math.floor(totalCount / 2); i++) {
                    queue.push({ type: monsters.basic, delay: 0.9 });
                }
                queue.push({ type: monsters.special, delay: 1.3, hasMathShield: true });
                queue.push({ type: monsters.tank, delay: 1.8 });
                for (let i = 0; i < Math.floor(totalCount / 2); i++) {
                    queue.push({ type: monsters.fast, delay: 0.75 });
                }
            } else if (pattern === 2) {
                // 战术 C: 精英交错突围
                for (let i = 0; i < totalCount; i++) {
                    if (i % 4 === 0) {
                        queue.push({ type: monsters.special, delay: 1.2, hasMathShield: (i % 8 === 0) });
                    } else if (i % 3 === 0) {
                        queue.push({ type: monsters.tank, delay: 1.5 });
                    } else if (i % 2 === 0) {
                        queue.push({ type: monsters.fast, delay: 0.7 });
                    } else {
                        queue.push({ type: monsters.basic, delay: 0.9 });
                    }
                }
            } else {
                // 战术 D: 心算智勇冲刺
                for (let i = 0; i < totalCount; i++) {
                    if (i === 2 || i === 5 || i === 8) {
                        queue.push({ type: monsters.special, delay: 1.3, hasMathShield: true });
                    } else if (i % 2 === 0) {
                        queue.push({ type: monsters.basic, delay: 0.9 });
                    } else {
                        queue.push({ type: monsters.fast, delay: 0.75 });
                    }
                }
            }
        }
        return queue;
    }

    // 建造防御塔
    buildTower(typeKey, slot) {
        if (!slot || slot.occupied) return false;
        const config = TOWER_TYPES[typeKey];
        if (!config || this.gold < config.cost) return false;

        this.gold -= config.cost;
        const tower = new Tower(typeKey, slot.x, slot.y, slot.id);
        slot.occupied = true;
        slot.tower = tower;
        this.towers.push(tower);
        this.selectedTower = tower;
        this.selectedSlot = null;

        sound.playBuildTower();
        this.projectileSystem.createExplosion(slot.x, slot.y, config.color, 14, 2.5);
        this.projectileSystem.addFloatingText(slot.x, slot.y, `-${config.cost}G`, '#ffd32a', 15);

        this.notifyState();
        return true;
    }

    // 升级防御塔
    upgradeSelectedTower() {
        if (!this.selectedTower) return false;
        const cost = this.selectedTower.getUpgradeCost();
        if (this.gold < cost) return false;

        if (this.selectedTower.upgrade()) {
            this.gold -= cost;
            sound.playTowerUpgrade();
            this.projectileSystem.createExplosion(this.selectedTower.x, this.selectedTower.y, '#ffd32a', 20, 3.5);
            this.projectileSystem.addFloatingText(this.selectedTower.x, this.selectedTower.y, `强化 Lv.${this.selectedTower.level}!`, '#2ed573', 17, true);
            this.notifyState();
            return true;
        }
        return false;
    }

    // 出售防御塔
    sellSelectedTower() {
        if (!this.selectedTower) return false;
        const sellValue = this.selectedTower.getSellValue();
        this.gold += sellValue;
        sound.playTowerSell();

        // 释放槽位
        const slot = this.map.towerSlots.find(s => s.id === this.selectedTower.slotId);
        if (slot) {
            slot.occupied = false;
            slot.tower = null;
        }

        const idx = this.towers.indexOf(this.selectedTower);
        if (idx !== -1) {
            this.towers.splice(idx, 1);
        }

        this.projectileSystem.createExplosion(this.selectedTower.x, this.selectedTower.y, '#dfe4ea', 12, 2.0);
        this.projectileSystem.addFloatingText(this.selectedTower.x, this.selectedTower.y, `+${sellValue}G`, '#ffd32a', 15);
        this.selectedTower = null;

        this.notifyState();
        return true;
    }

    // 答题联动：处理答题正确
    handleMathAnswerCorrect(res) {
        // 1. 奖励金币
        this.gold += res.goldGain;
        sound.playMathCorrect(res.combo);

        if (res.fanfare) {
            sound.playComboFanfare();
            this.projectileSystem.addFloatingText(GAME_CONFIG.canvasWidth / 2, 100, `★ COMBO x${res.combo} 魔法狂暴! ★`, '#ff4757', 26, true);
        }

        // 2. 弱点锁定破盾核爆 or 智慧神圣天击
        if (res.isShieldNuke && res.enemyRef && !res.enemyRef.isDead) {
            const target = res.enemyRef;
            const nukeDmg = target.breakShield();
            this.projectileSystem.createExplosion(target.x, target.y, '#fd79a8', 35, 5.0);
            this.projectileSystem.addFloatingText(target.x, target.y, `🎯 弱点破盾! -${nukeDmg}`, '#fd79a8', 22, true);
            sound.playComboFanfare();
            document.querySelector('.chalkboard-card')?.classList.remove('targeting-enemy');
            if (this.targetedEnemy === target) {
                this.targetedEnemy = null;
            }
        } else if (this.enemies.length > 0) {
            // 优先选择数盾怪破盾
            const shieldMonsters = this.enemies.filter(e => e.hasMathShield && !e.isDead);
            if (shieldMonsters.length > 0) {
                const target = shieldMonsters[0];
                const nukeDmg = target.breakShield();
                this.projectileSystem.createExplosion(target.x, target.y, '#fd79a8', 25, 4.0);
                this.projectileSystem.addFloatingText(target.x, target.y, `破盾神算! -${nukeDmg}`, '#fd79a8', 19, true);
            } else {
                // 击打走在最前的一只怪
                const leadEnemy = this.enemies.find(e => !e.isDead);
                if (leadEnemy) {
                    const holyDamage = 45 + Math.min(res.combo * 8, 80);
                    leadEnemy.takeDamage(holyDamage, true);
                    this.projectileSystem.createExplosion(leadEnemy.x, leadEnemy.y, '#ffd32a', 18, 3.5);
                    this.projectileSystem.addFloatingText(leadEnemy.x, leadEnemy.y, `神算天击! -${holyDamage}`, '#ffd32a', 17, true);
                }
            }
        }

        // 2.5 若玩家锁定了道具，答对题目发动心算暴击重击道具
        if (this.targetedProp && !this.targetedProp.isDead) {
            const p = this.targetedProp;
            const holyCrit = 160 + Math.min(res.combo * 15, 90);
            p.takeDamage(holyCrit, true);
            this.projectileSystem.createExplosion(p.x, p.y, '#ff4757', 22, 4.0);
            this.projectileSystem.addFloatingText(p.x, p.y - 30, `⚡ 心算暴击! -${holyCrit}`, '#ff4757', 22, true);
        }

        this.notifyState();
    }

    handleMathAnswerWrong() {
        sound.playMathWrong();
        this.notifyState();
    }

    // 状态更新通知
    notifyState() {
        this.onStateChange({
            state: this.state,
            lives: this.lives,
            gold: this.gold,
            wave: this.wave,
            maxWaves: this.maxWaves,
            waveBreakTimer: Math.ceil(this.waveBreakTimer),
            selectedTower: this.selectedTower,
            selectedSlot: this.selectedSlot,
            combo: this.mathEngine.combo,
            superCharged: this.mathEngine.superChargeActive,
            currentLevel: this.currentLevel,
            levelName: this.map.currentLevelConfig.name
        });
    }

    // 核心主循环 (iPad WebKit 稳帧与零堆积保护)
    loop(currentTime) {
        if (!this.running) return;

        const rawDt = (currentTime - this.lastTime) / 1000;
        const dt = Math.max(0, Math.min(rawDt, 0.1));
        this.lastTime = currentTime;
        this.time += dt;

        try {
            this.update(dt);
            this.render();
        } catch (err) {
            console.error('游戏主循环捕获异常，已自我保护恢复:', err);
        }

        if (this.running) {
            this.animationFrameId = requestAnimationFrame(t => this.loop(t));
        }
    }

    update(dt) {
        if (this.state === 'PAUSED' || this.isPaused || this.state === 'VICTORY' || this.state === 'GAME_OVER' || (window.mapEditor && window.mapEditor.isEditing)) {
            return;
        }

        let stateDirty = false;
        this.mathEngine.update(dt);

        // 1. 波次休息倒计时
        if (this.state === 'PREPARING') {
            const prevSec = Math.ceil(this.waveBreakTimer);
            this.waveBreakTimer -= dt;
            if (this.waveBreakTimer <= 0) {
                this.startNextWave();
            } else if (Math.ceil(this.waveBreakTimer) !== prevSec) {
                stateDirty = true;
            }
        }

        // 2. 刷怪生成
        if (this.state === 'WAVE_RUNNING') {
            if (this.enemySpawnQueue.length > 0) {
                this.spawnTimer -= dt;
                if (this.spawnTimer <= 0) {
                    const item = this.enemySpawnQueue.shift();
                    if (this.map.waypoints && this.map.waypoints.length > 0) {
                        const enemy = new Enemy(item.type, this.map.waypoints, this.wave, this.mathEngine, item.hasMathShield);
                        this.enemies.push(enemy);
                    }
                    this.spawnTimer = item.delay || 1.0;
                }
            }
        }

        // 3. 更新敌人
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.update(dt);

            if (e.isDead) {
                // 击杀掉落金币与音效 (蘑菇塔附着怪兽奖励翻倍)
                const bountyMul = e.hasMushroomBounty ? 2 : 1;
                const earned = e.reward * bountyMul;
                this.gold += earned;
                sound.playEnemyDead();
                this.projectileSystem.createExplosion(e.x, e.y, e.color, 14, 2.8);
                this.projectileSystem.addFloatingText(e.x, e.y, `+${earned}G${e.hasMushroomBounty ? ' 🍄' : ''}`, '#ffd32a', 14);
                if (this.targetedEnemy === e) {
                    this.targetedEnemy = null;
                    document.querySelector('.chalkboard-card')?.classList.remove('targeting-enemy');
                }
                this.enemies.splice(i, 1);
                stateDirty = true;
                continue;
            }

            if (e.reachedEnd) {
                // 怪物冲进终点啃咬萝卜，扣除生命并触发受击与叫声
                this.lives -= (e.isBoss ? 5 : 1);
                this.map.triggerCarrotHurt(0.5);
                sound.playBaseDamaged();
                this.projectileSystem.createExplosion(this.map.baseCrystal.x, this.map.baseCrystal.y, '#ff4757', 18, 3.5);
                this.projectileSystem.addFloatingText(this.map.baseCrystal.x, this.map.baseCrystal.y, `基地受损! -${e.isBoss ? 5 : 1} 生命`, '#ff4757', 18, true);
                if (this.targetedEnemy === e) {
                    this.targetedEnemy = null;
                    document.querySelector('.chalkboard-card')?.classList.remove('targeting-enemy');
                }
                this.enemies.splice(i, 1);
                stateDirty = true;

                if (this.lives <= 0) {
                    this.lives = 0;
                    this.state = 'GAME_OVER';
                    sound.playGameOver();
                    this.notifyState();
                    return;
                }
            }
        }

        // 3.5 更新关卡障碍道具
        if (this.map.props && this.map.props.length > 0) {
            for (let i = this.map.props.length - 1; i >= 0; i--) {
                const prop = this.map.props[i];
                prop.update(dt);
                if (prop.hp <= 0 && !prop.isDead) {
                    this.handlePropDestruction(prop);
                    stateDirty = true;
                }
            }
        }

        // 4. 更新防御塔 (支持集火锁敌、打击道具与水晶光环增益)
        const isSuperCharged = this.mathEngine.superChargeActive;
        for (const tower of this.towers) {
            tower.isBuffed = false;
        }
        for (const tower of this.towers) {
            tower.update(dt, this.enemies, this.projectileSystem, isSuperCharged, this.targetedEnemy, this.towers, this.targetedProp, this.map.props);
        }

        // 5. 更新弹道、粒子与浮动文字
        this.projectileSystem.update(dt, this.enemies, this.map.props);

        // 6. 检测当前波次完成
        if (this.state === 'WAVE_RUNNING' && this.enemySpawnQueue.length === 0 && this.enemies.length === 0) {
            if (this.wave >= this.maxWaves) {
                this.state = 'VICTORY';
                sound.playVictory();
                stateDirty = true;
            } else {
                this.state = 'PREPARING';
                this.waveBreakTimer = GAME_CONFIG.timePerWaveBreak;
                stateDirty = true;
            }
        }

        // 帧末合批通知 DOM (避免怪兽同帧批量阵亡时引发数十次昂贵 DOM 重绘)
        if (stateDirty) {
            this.notifyState();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. 地图背景、道路、建塔底座与场景道具
        this.map.draw(this.ctx, this.time, this.lives, this.targetedProp);

        // 2. 绘制防御塔
        for (const tower of this.towers) {
            tower.draw(this.ctx, this.time, tower === this.selectedTower);
        }

        // 3. 绘制怪物 (包含集火瞄准标记)
        for (const enemy of this.enemies) {
            enemy.draw(this.ctx, this.time, enemy === this.targetedEnemy);
        }

        // 4. 绘制投射物与特效
        this.projectileSystem.draw(this.ctx);

        // 5. 绘制超载光环边缘全屏提示
        if (this.mathEngine.superChargeActive) {
            this.ctx.save();
            this.ctx.strokeStyle = `rgba(255, 71, 87, ${0.35 + Math.sin(this.time * 8) * 0.25})`;
            this.ctx.lineWidth = 10;
            this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }

        // 6. 编辑器模式专属高亮与拐点序号图层
        if (this.onRenderOverlay) {
            this.onRenderOverlay(this.ctx, this.time);
        }
    }

    // 点击画布交互 (选塔、选槽位)
    handleCanvasClick(px, py) {
        // 先检查是否点击了已建塔
        for (const t of this.towers) {
            const dist = Math.hypot(t.x - px, t.y - py);
            if (dist <= 24) {
                this.selectedTower = t;
                this.selectedSlot = null;
                this.notifyState();
                return;
            }
        }

        // 再检查是否点击了空建筑槽位
        const slot = this.map.findSlotAt(px, py);
        if (slot && !slot.occupied) {
            this.selectedSlot = slot;
            this.selectedTower = null;
            this.notifyState();
            return;
        }

        // 点空白处取消选中
        this.selectedTower = null;
        this.selectedSlot = null;
        this.notifyState();
    }

    // 道具打掉后的结算处理 (金币飞散、隐藏宝物出现、解锁地块、全清成就)
    handlePropDestruction(prop) {
        prop.isDead = true;
        if (this.targetedProp === prop) {
            this.targetedProp = null;
        }

        // 1. 金币奖励
        this.gold += prop.rewardGold;
        sound.playGainGold();
        this.projectileSystem.addFloatingText(prop.x, prop.y - 12, `+${prop.rewardGold} 🪙`, '#ffd32a', 24, true);

        // 2. 爆炸烟花粒子
        this.projectileSystem.createExplosion(prop.x, prop.y, '#ffd32a', 20, 4.2);
        this.projectileSystem.createExplosion(prop.x, prop.y, '#ff4757', 18, 3.5);
        this.projectileSystem.createExplosion(prop.x, prop.y, '#2ed573', 14, 3.0);

        // 3. 地块解锁：将道具所占用的所有格子自动转为可用建塔槽位（保卫萝卜经典机制）
        for (let dc = 0; dc < prop.wCells; dc++) {
            for (let dr = 0; dr < prop.hCells; dr++) {
                const c = prop.c + dc;
                const r = prop.r + dr;
                const exists = this.map.towerSlots.some(s => s.c === c && s.r === r);
                if (!exists) {
                    this.map.towerSlots.push({
                        id: this.map.towerSlots.length + 1,
                        c: c,
                        r: r,
                        x: c * 80 + 40,
                        y: r * 80 + 40,
                        occupied: false,
                        tower: null
                    });
                }
            }
        }

        // 4. 隐藏武器惊喜！
        if (prop.hiddenTower) {
            sound.playVictory();
            let targetSlot = null;
            if (prop.hiddenTower.slotC !== undefined && prop.hiddenTower.slotR !== undefined) {
                targetSlot = this.map.towerSlots.find(s => s.c === prop.hiddenTower.slotC && s.r === prop.hiddenTower.slotR);
            }
            if (!targetSlot || targetSlot.occupied) {
                targetSlot = this.map.towerSlots.find(s => prop.coversCell(s.c, s.r) && !s.occupied);
            }
            if (targetSlot) {
                const tower = new Tower(prop.hiddenTower.typeKey, targetSlot.x, targetSlot.y, targetSlot.id);
                if (prop.hiddenTower.level && prop.hiddenTower.level > 1) {
                    for (let lv = 1; lv < prop.hiddenTower.level; lv++) {
                        tower.upgrade();
                    }
                }
                targetSlot.occupied = true;
                targetSlot.tower = tower;
                this.towers.push(tower);
                this.projectileSystem.createExplosion(targetSlot.x, targetSlot.y, '#2ed573', 25, 4.5);
                this.projectileSystem.addFloatingText(targetSlot.x, targetSlot.y - 45, `🎁 隐藏宝物: ${tower.config.name} Lv.${tower.level}!`, '#2ed573', 22, true);
            }
        }

        // 5. 地块解锁提示与基座闪烁
        this.map.triggerSlotHint(3.5);
        this.projectileSystem.addFloatingText(prop.x, prop.y + 26, '✨ 地块已解锁!', '#00d2d3', 16, true);

        // 6. 检查是否全清道具
        if (this.map.props && this.map.props.length > 0) {
            const allCleared = this.map.props.every(p => p.isDead);
            if (allCleared && !this.allPropsClearedRewarded) {
                this.allPropsClearedRewarded = true;
                this.gold += 300;
                sound.playVictory();
                this.projectileSystem.addFloatingText(this.canvas.width / 2, 180, '🏆 道具全清! 奖励 +300 金币! 🏆', '#ff9f43', 28, true);
                this.projectileSystem.createExplosion(this.canvas.width / 2, 180, '#ff9f43', 35, 5.0);
            }
        }
    }
}
