/**
 * zombies.js - 原版 1:1 僵尸实体系统与 DOM 60fps 动态 GIF 动画层 (完整支持第 1~5 大关全兵种与屋顶斜坡)
 */
import { GAME_CONFIG } from './config.js?v=20261113_v2';
import { soundEngine } from './audio.js?v=20261113_v2';
import { FloatingText, LobbedProjectile, ExplosionEffect, HitSplat } from './projectiles.js?v=20261113_v2';

export class Zombie {
    constructor(type = 'normal', row = 2, startX = 900, entityLayer = null) {
        this.id = 'zombie_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        this.type = type;
        this.row = row;
        this.config = GAME_CONFIG.zombies[type] || GAME_CONFIG.zombies.normal;
        this.x = startX;
        this.cellH = GAME_CONFIG.canvas.cellHeight;
        this.cellW = GAME_CONFIG.canvas.cellWidth;
        this.gridStartY = GAME_CONFIG.canvas.gridStartY;
        this.y = this.gridStartY + row * this.cellH + this.cellH / 2;
        this.hp = this.config.hp || 270;
        this.armorHp = this.config.armorHp || 0;
        this.headLossThreshold = this.config.headLossThreshold || 70;
        this.maxTotalHp = this.hp + this.armorHp;
        this.speed = this.config.speed || 18;
        this.dps = this.config.dps || 100;
        this.biteDamage = this.config.biteDamage || 25;
        this.biteInterval = this.config.biteInterval || 0.25;
        this.biteTimer = 0;
        this.age = 0;

        this.state = 'walk';
        this.isDead = false;
        this.isDying = false;
        this.dyingTimer = 0;
        this.dyingDuration = 1.0;

        this.hasLostHead = false;
        this.slowTimer = 0;
        this.isSlowed = false;
        this.hitFlashTimer = 0;
        this.freezeTimer = 0;
        this.butterTimer = 0;
        this.isHypnotized = false;

        // 兵种专属状态属性
        this.isAquatic = !!(this.config.isAquatic || this.config.isWaterOnly);
        this.inPoolWater = false;
        this.isVehicle = !!this.config.isVehicle;
        this.isFlying = !!this.config.isFlying;
        this.isBlownAway = false;
        this.isSubmerged = false;

        // 撑杆跳 / 海豚骑手跳跃机制
        this.hasPole = (this.type === 'polevault');
        this.hasDolphin = (this.type === 'dolphin');
        if (this.type === 'dolphin') {
            this.speed = this.config.landSpeed || 20;
        }
        this.jumpTimer = 0;
        this.jumpStartX = 0;
        this.jumpTargetX = 0;

        // 读报僵尸失报问号停顿与狂暴状态
        this.isEnraged = false;
        this.enrageTimer = 0;

        // 舞王僵尸太空步与伴舞召唤状态机
        this.dancePhase = this.type === 'dancing' ? 'moonwalk' : null;
        this.moonwalkTimer = 2.8;
        this.summonTimer = 0;
        this.summonCooldown = 1.5;
        this.backupDancers = { front: null, back: null, up: null, down: null };
        if (this.type === 'dancing') {
            this.speed = this.config.moonwalkSpeed || 48;
        }

        // 小丑僵尸炸弹引信
        this.jackFuse = 7.0 + Math.random() * 4.0;

        // 矿工僵尸掘地绕后状态 ('digging' | 'dizzy' | 'backwards')
        this.diggerPhase = this.type === 'digger' ? 'digging' : null;
        this.diggerDizzyTimer = 0;
        if (this.type === 'digger') {
            this.speed = this.config.digSpeed || 54;
        }

        // 蹦极僵尸从天而降状态 ('init' | 'targeting' | 'descending' | 'hanging' | 'grabbing' | 'ascending')
        this.bungeePhase = this.type === 'bungee' ? 'init' : null;
        this.bungeeTimer = 0;
        this.bungeeAge = 0;
        this.bungeeOffsetY = this.type === 'bungee' ? -360 : 0;
        this.bungeeRenderOffsetY = this.bungeeOffsetY;
        this.bungeeTargetPlant = null;

        // 投石车僵尸篮球弹药
        this.basketballs = this.config.basketballs || 8;
        this.catapultTimer = 1.4;

        // 伽刚特尔巨人重锤蓄力与投掷小鬼
        this.smashTimer = 0;
        this.smashTarget = null;
        this.hasThrownImp = false;

        // 动画资产初始化 (水生僵尸在岸边石板路上先抱圈/抱海豚步行，跨入池水瞬间再切换游泳/冲浪形态)
        if (this.isAquatic) {
            this.walkAnim = this.config.landWalkAnim || this.config.walkAnims[0];
        } else if (this.type === 'polevault') {
            this.walkAnim = this.config.runAnim || 'assets/zombies/polevault_run.gif';
        } else if (this.type === 'digger') {
            this.walkAnim = this.config.digAnim || 'assets/zombies/digger_dig.gif';
        } else {
            this.walkAnim = this.config.walkAnims[Math.floor(Math.random() * this.config.walkAnims.length)];
        }
        this.attackAnim = this.config.attackAnim || this.walkAnim;
        this.headAnim = this.config.headAnim || 'assets/zombies/zombie_head.gif';
        this.dieAnim = this.config.dieAnim || 'assets/zombies/zombie_die.gif';
        this.charredAnim = this.config.charredAnim || 'assets/zombies/zombie_charred.gif';
        this.currentAnim = this.type === 'dancing' ? (this.config.moonwalkAnim || this.walkAnim) : this.walkAnim;

        // 防具与铁器标记
        this.hasShield = !!this.config.hasShield && this.armorHp > 0;
        this.shieldType = this.config.shieldType || null;

        this.domElement = null;
        this.domImg = null;
        this.domShield = null;
        this.domButter = null;
        this.entityLayer = entityLayer;

        if (entityLayer) {
            this.createDOM(entityLayer);
        }
    }

    createDOM(container) {
        if (!container) return;
        this.domElement = document.createElement('div');
        this.domElement.className = `zombie-entity zombie-${this.type}`;
        this.domElement.setAttribute('data-id', this.id);
        this._lastDomX = null;
        this._lastDomY = null;
        this._inWaterClass = false;
        this._isHitFlashing = false;

        this.domImg = document.createElement('img');
        this.domImg.className = 'zombie-gif';
        this.domImg.decoding = 'async';
        this.domImg.src = this.currentAnim;
        this.domElement.appendChild(this.domImg);

        this.updateDOMPosition(null, this.bungeeOffsetY);
        container.appendChild(this.domElement);
    }

    updateDOMPosition(engine, extraOffsetY = 0) {
        if (!this.domElement) return;
        const slopeY = (engine && typeof engine.getSurfaceOffsetY === 'function') ? engine.getSurfaceOffsetY(this.x) : 0;
        const isWaterLane = !!(engine && engine.waterRows && engine.waterRows.includes(this.row));
        const poolRightX = (engine && ((engine.gridStartX || 80) + (engine.cols || 9) * (engine.cellW || 80) - 4)) || 796;
        const waterDip = (isWaterLane && this.isAquatic && this.inPoolWater) ? 8 : 0;
        const shouldBeInWater = !!(isWaterLane && !this.isAquatic && !this.isFlying && this.type !== 'bungee' && this.x <= poolRightX);
        if (this._inWaterClass !== shouldBeInWater) {
            this._inWaterClass = shouldBeInWater;
            this.domElement.classList.toggle('in-water', shouldBeInWater);
        }
        const rx = Math.round((this.x - 105) * 2) * 0.5;
        const ry = Math.round((this.gridStartY + this.row * this.cellH - 46 + slopeY + waterDip + extraOffsetY) * 2) * 0.5;
        if (this._lastDomX !== rx || this._lastDomY !== ry) {
            this._lastDomX = rx;
            this._lastDomY = ry;
            this.domElement.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        }
    }

    setAnim(newSrc) {
        if (newSrc && this.currentAnim !== newSrc) {
            this.currentAnim = newSrc;
            if (this.domImg) {
                this.domImg.src = newSrc;
            }
        }
    }

    onArmorBroken(prevShield) {
        this.armorHp = 0;
        this.hasShield = false;
        if (this.domShield) this.domShield.style.display = 'none';

        this.spawnFallingArmor(prevShield);

        if (this.type === 'newspaper') {
            this.isEnraged = true;
            this.state = 'enraging';
            this.enrageTimer = this.config.enragePauseDuration || 1.35;
            const nextSpeed = this.config.rageSpeed || 52;
            this.speed = this.isHypnotized ? -Math.abs(nextSpeed) : nextSpeed;
            this.dps = this.config.rageDps || 165;
            this.biteInterval = this.config.rageBiteInterval || 0.15;
            this.walkAnim = this.config.rageAnim || 'assets/zombies/newspaper_rage_walk.gif';
            this.attackAnim = this.config.rageAttackAnim || this.walkAnim;
            this.setAnim(this.config.lostPaperAnim || 'assets/zombies/newspaper_lost.gif');
            soundEngine.playGroan();
        } else if (this.type === 'football') {
            this.walkAnim = this.config.noHelmetWalkAnim || 'assets/zombies/football_nohelmet_walk.gif';
            this.attackAnim = this.config.noHelmetAttackAnim || 'assets/zombies/football_nohelmet_attack.gif';
            this.setAnim(this.state === 'attack' ? this.attackAnim : this.walkAnim);
        } else if (this.type === 'digger') {
            // 矿工镐被磁力菇吸走：切换无镐行走/啃食动画，若在地下掘进则立即钻出地面！
            this.walkAnim = this.config.noShieldWalkAnim || 'assets/zombies/digger_nopick_walk.gif';
            this.attackAnim = this.config.noShieldAttackAnim || 'assets/zombies/digger_nopick_attack.gif';
            if (this.diggerPhase === 'digging') {
                this.diggerPhase = 'dizzy';
                this.diggerDizzyTimer = 0.85;
                this.speed = this.config.walkSpeed || 18;
            }
            this.setAnim(this.state === 'attack' ? this.attackAnim : this.walkAnim);
        } else if (this.type === 'pogo') {
            this.speed = this.config.walkSpeed || 18;
            if (this.domElement) this.domElement.classList.remove('zombie-pogo');
            this.walkAnim = this.config.noShieldWalkAnim || 'assets/zombies/pogo_walk.gif';
            this.attackAnim = this.config.noShieldAttackAnim || 'assets/zombies/pogo_attack.gif';
            this.setAnim(this.state === 'attack' ? this.attackAnim : this.walkAnim);
        } else if (this.type === 'ladder') {
            this.speed = this.config.walkSpeed || 18;
            this.walkAnim = this.config.noShieldWalkAnim || 'assets/zombies/ladder_noladder_walk.gif';
            this.attackAnim = this.config.noShieldAttackAnim || 'assets/zombies/ladder_noladder_attack.gif';
            this.setAnim(this.state === 'attack' ? this.attackAnim : this.walkAnim);
        } else if (this.type === 'jackinthebox') {
            this.speed = 20;
            this.walkAnim = GAME_CONFIG.zombies.normal.walkAnims[0];
            this.attackAnim = GAME_CONFIG.zombies.normal.attackAnim;
            this.setAnim(this.state === 'attack' ? this.attackAnim : this.walkAnim);
        } else {
            this.walkAnim = GAME_CONFIG.zombies.normal.walkAnims[0];
            this.attackAnim = GAME_CONFIG.zombies.normal.attackAnim;
            this.setAnim(this.state === 'attack' ? this.attackAnim : this.walkAnim);
        }
    }

    popBalloon(engine) {
        if (!this.isFlying) return;
        this.isFlying = false;
        this.speed = this.config.walkSpeed || 18;
        if (this.domElement) {
            this.domElement.classList.remove('zombie-balloon');
        }
        this.walkAnim = this.config.groundWalkAnim || 'assets/zombies/balloon_walk.gif';
        this.attackAnim = this.config.attackAnim || 'assets/zombies/balloon_attack.gif';
        this.setAnim(this.walkAnim);
        soundEngine.playSplat();
        if (engine && engine.floatingTexts) {
            engine.floatingTexts.push(new FloatingText(this.x, this.y - 45, '🎈 气球击破! 坠落地面!', '#2ecc71', 19));
        }
    }

    blowAway(engine) {
        if (this.isDead || this.isBlownAway) return;
        this.isBlownAway = true;
        this.state = 'blown';
    }

    applyButter(sec = 4.0) {
        if (this.isDead || this.isDying) return;
        this.butterTimer = Math.max(this.butterTimer, sec);
        if (this.domElement && !this.domButter) {
            this.domButter = document.createElement('img');
            this.domButter.src = 'assets/projectiles/butter_hat.png';
            this.domButter.className = 'zombie-butter-hat';
            this.domElement.appendChild(this.domButter);
        }
        if (this.domButter) {
            this.domButter.style.display = 'block';
        }
    }

    takeDamage(amount, isSlow = false) {
        if (this.isDead || this.isDying) return;

        this.hitFlashTimer = 0.08;
        if (this.domElement && !this._isHitFlashing) {
            this._isHitFlashing = true;
            this.domElement.classList.add('hit-flash');
        }

        // 原版机制：前向护盾（铁栅门/报纸/金属梯）与机械载具（冰车/投石车）不受寒冰减速
        const shieldBlocksChill = this.isVehicle || (
            this.hasShield && this.armorHp > 0 &&
            (this.shieldType === 'screendoor' || this.shieldType === 'newspaper' || this.shieldType === 'ladder')
        );
        if (isSlow && !shieldBlocksChill) {
            this.slowTimer = 10.0;
            this.isSlowed = true;
            if (this.domElement) this.domElement.classList.add('slowed');
        }

        if (this.armorHp > 0) {
            this.armorHp -= amount;
            if (this.armorHp <= 0) {
                const overflow = -this.armorHp;
                const prevShield = this.shieldType;
                // 原版 PVZ1 护甲分类法则：
                // 一类头戴防具（路障/铁桶/橄榄球头盔）碎裂时溢出伤害继续扣减本体 HP；
                // 二类手持前盾（报纸/铁栅门/金属梯）碎裂时吸收当次冲击，不向本体溢出（如坚果撞碎报纸后触发读报狂暴，需第2颗坚果击杀）
                const isFrontShield = (prevShield === 'newspaper' || prevShield === 'screendoor' || prevShield === 'ladder');
                soundEngine.playSplat();
                this.onArmorBroken(prevShield);
                if (!isFrontShield) {
                    this.hp -= overflow;
                }
            }
        } else {
            this.hp -= amount;
        }

        if (!this.isVehicle && this.type !== 'bungee' && this.hp <= this.headLossThreshold && !this.hasLostHead) {
            this.hasLostHead = true;
            this.spawnFallingHead();
            if (this.config.lostHeadWalkAnim) {
                this.walkAnim = this.config.lostHeadWalkAnim;
                this.setAnim(this.walkAnim);
            }
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    takeFumeDamage(amount) {
        if (this.isDead || this.isDying) return;
        // 大喷菇孢子雾：穿透铁栅门、金属梯与报纸直击本体
        if (this.hasShield && (this.shieldType === 'screendoor' || this.shieldType === 'ladder')) {
            this.takePiercingDamage(amount);
            return;
        }
        if (this.hasShield && this.shieldType === 'newspaper') {
            if (this.armorHp > 0) {
                this.armorHp -= amount;
                if (this.armorHp <= 0) {
                    const prevShield = this.shieldType;
                    soundEngine.playSplat();
                    this.onArmorBroken(prevShield);
                }
            }
            this.takePiercingDamage(amount);
            return;
        }
        this.takeDamage(amount, false);
    }

    takePiercingDamage(amount) {
        if (this.isDead || this.isDying) return;
        this.hitFlashTimer = 0.09;
        if (this.domElement && !this._isHitFlashing) {
            this._isHitFlashing = true;
            this.domElement.classList.add('hit-flash');
        }

        this.hp -= amount;
        if (!this.isVehicle && this.type !== 'bungee' && this.hp <= this.headLossThreshold && !this.hasLostHead) {
            this.hasLostHead = true;
            this.spawnFallingHead();
            if (this.config.lostHeadWalkAnim) {
                this.walkAnim = this.config.lostHeadWalkAnim;
                this.setAnim(this.walkAnim);
            }
        }
        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    hypnotize() {
        if (this.isHypnotized || this.isDead || this.isDying || this.isVehicle || this.type === 'gargantuar' || this.type === 'bungee') return;
        this.isHypnotized = true;
        this.speed = -Math.abs(this.speed || 18);
        if (this.domImg) {
            this.domImg.style.transformOrigin = this.type === 'football' ? '122px center' : '105px center';
            this.domImg.style.transform = 'scaleX(-1)';
            this.domImg.style.filter = 'hue-rotate(280deg) saturate(1.55) brightness(1.08)';
        }
    }

    applyFreeze(freezeSec = 4.0, slowSec = 10.0) {
        if (this.isVehicle) return;
        this.freezeTimer = freezeSec;
        this.slowTimer = freezeSec + slowSec;
        this.isSlowed = true;
        if (this.domElement) {
            this.domElement.classList.add('frozen');
        }
    }

    spawnFallingArmor(shieldType) {
        if (!this.entityLayer) return;
        const armorEl = document.createElement('div');
        armorEl.className = `armor-drop-entity armor-${shieldType || 'cone'}`;
        armorEl.style.left = `${this.x - 20}px`;
        armorEl.style.top = `${this.y - 55}px`;
        const dropMap = {
            bucket: 'assets/zombies/bucket_drop.png',
            newspaper: 'assets/zombies/newspaper_drop.png',
            screendoor: 'assets/zombies/screendoor_drop.png',
            football: 'assets/zombies/football_drop.png',
            jackbox: 'assets/zombies/jackbox_drop.png',
            pickaxe: 'assets/zombies/pickaxe_drop.png',
            pogo: 'assets/zombies/pogo_drop.png',
            ladder: 'assets/zombies/ladder_drop.png',
            cone: 'assets/zombies/cone_drop.png'
        };
        const imgSrc = dropMap[shieldType] || 'assets/zombies/cone_drop.png';
        armorEl.innerHTML = `<img src="${imgSrc}" />`;
        this.entityLayer.appendChild(armorEl);

        setTimeout(() => {
            if (armorEl.parentNode) armorEl.parentNode.removeChild(armorEl);
        }, 800);
    }

    spawnFallingHead() {
        if (!this.entityLayer) return;
        const headEl = document.createElement('div');
        headEl.className = 'head-drop-entity';
        headEl.style.left = `${this.x - 30}px`;
        headEl.style.top = `${this.y - 50}px`;
        headEl.innerHTML = `<img src="${this.headAnim}" class="head-gif" />`;
        this.entityLayer.appendChild(headEl);

        setTimeout(() => {
            if (headEl.parentNode) headEl.parentNode.removeChild(headEl);
        }, 800);
    }

    breakShieldInstantly(engine) {
        if (!this.hasShield || this.armorHp <= 0) return;
        const prevShield = this.shieldType;
        this.onArmorBroken(prevShield);

        if (engine && engine.floatingTexts) {
            engine.floatingTexts.push(
                new FloatingText(this.x, this.y - 45, '💥 破除防具!', '#ff3838', 20)
            );
        }
        soundEngine.playThunder();
    }

    die(isCharred = false) {
        if (this.isDying || this.isDead) return;
        this.isDying = true;
        this.state = 'dying';

        if (this.domShield) this.domShield.style.display = 'none';
        if (this.domButter) this.domButter.style.display = 'none';

        if (this.isVehicle) {
            soundEngine.playBoom();
            if ((this.type === 'zomboni' || this.type === 'catapult') && this.dieAnim) {
                this.dyingDuration = this.type === 'zomboni' ? 1.9 : 1.5;
                this.setAnim(this.dieAnim);
                setTimeout(() => this.destroy(), this.dyingDuration * 1000);
            } else {
                this.dyingDuration = 0.55;
                if (this.domElement) {
                    this.domElement.style.opacity = '0.4';
                }
                setTimeout(() => this.destroy(), 550);
            }
            return;
        }

        if (isCharred) {
            this.dyingDuration = 2.4;
            this.setAnim(this.charredAnim);
            if (this.domElement) {
                this.domElement.classList.add('charred-die');
            }
        } else {
            this.setAnim(this.dieAnim);
        }

        setTimeout(() => {
            this.destroy();
        }, this.dyingDuration * 1000);
    }

    blastDie(damage = 1800) {
        if (this.isDying || this.isDead) return;
        const totalHp = this.hp + (this.armorHp || 0);
        if (totalHp > damage) {
            this.takeDamage(damage);
            return;
        }
        this.hp = 0;
        this.armorHp = 0;
        this.die(true);
    }

    mowerDie() {
        if (this.isDying || this.isDead) return;
        this.hp = 0;
        this.armorHp = 0;
        if (this.hasShield) {
            this.hasShield = false;
            if (this.domShield) this.domShield.style.display = 'none';
            this.spawnFallingArmor(this.shieldType);
        }
        if (this.domButter) this.domButter.style.display = 'none';
        if (!this.isVehicle && !this.hasLostHead) {
            this.hasLostHead = true;
            this.spawnFallingHead();
        }
        this.isDying = true;
        this.state = 'dying';
        this.dyingDuration = 0.85;
        if (!this.isVehicle) {
            this.setAnim(this.dieAnim);
        }
        if (this.domElement) {
            this.domElement.classList.add('mower-die');
        }
        soundEngine.playSplat();
        setTimeout(() => {
            this.destroy();
        }, this.dyingDuration * 1000);
    }

    destroy() {
        this.isDead = true;
        if (this.domElement && this.domElement.parentNode) {
            this.domElement.parentNode.removeChild(this.domElement);
            this.domElement = null;
        }
    }

    getBackupSlots(engine) {
        const activeRows = (engine && engine.levelConfig && engine.levelConfig.activeRows) || [0, 1, 2, 3, 4];
        const waterRows = (engine && engine.waterRows) || [];
        const dir = this.isHypnotized ? 1 : -1;
        const rawSlots = {
            front: { row: this.row, dx: 68 * dir },
            back: { row: this.row, dx: -68 * dir },
            up: { row: this.row - 1, dx: 0 },
            down: { row: this.row + 1, dx: 0 }
        };
        const valid = {};
        Object.keys(rawSlots).forEach(k => {
            const s = rawSlots[k];
            if (activeRows.includes(s.row) && !waterRows.includes(s.row)) {
                valid[k] = s;
            }
        });
        return valid;
    }

    hasMissingBackup(engine) {
        const slots = this.getBackupSlots(engine);
        return Object.keys(slots).some(k => {
            const d = this.backupDancers[k];
            return !d || d.isDead || d.isDying;
        });
    }

    summonBackupDancers(engine) {
        if (!engine || !engine.zombies) return;
        const slots = this.getBackupSlots(engine);
        let spawned = 0;
        Object.keys(slots).forEach(k => {
            const cur = this.backupDancers[k];
            if (!cur || cur.isDead || cur.isDying) {
                const s = slots[k];
                const spawnX = Math.max(90, Math.min(890, this.x + s.dx));
                const dancer = new Zombie('backup_dancer', s.row, spawnX, this.entityLayer);
                if (this.isHypnotized) {
                    dancer.hypnotize();
                }
                this.backupDancers[k] = dancer;
                engine.zombies.push(dancer);
                spawned++;
            }
        });
        if (spawned > 0) {
            soundEngine.playDisco();
            if (engine.floatingTexts) {
                engine.floatingTexts.push(
                    new FloatingText(this.x, this.y - 45, '🕺 迪斯科伴舞登场!', '#f368e0', 18)
                );
            }
        }
    }

    /**
     * 查找当前格可阻挡/啃食的目标植物（忽略平铺地刺；优先啃南瓜壳 -> 承载植物 -> 睡莲/花盆底座）
     */
    findTargetPlant(engine, backwards = false) {
        const cw = (engine && engine.cellW) ? engine.cellW : 80;
        const candidates = engine.plants.filter(p => {
            if (p.row !== this.row || p.isDead || p.isFlat) return false;
            const leftX = p.x;
            const rightX = p.isDoubleWide ? p.x + cw : p.x;
            if (backwards) {
                return rightX >= this.x - 12 && this.x >= leftX - 38 && this.x <= rightX + 38;
            }
            return leftX <= this.x + 12 && this.x >= leftX - 38 && this.x <= rightX + 38;
        });
        if (candidates.length === 0) return null;

        // 若该格已架设金属梯子，普通步行僵尸直接翻越而不停留啃食
        const hasClimbedLadder = !this.isVehicle && this.type !== 'gargantuar' && !backwards &&
            candidates.some(p => p.hasLadder);
        if (hasClimbedLadder) {
            return null;
        }

        const pumpkin = candidates.find(p => p.isPumpkin);
        if (pumpkin) return pumpkin;
        const mainPlant = candidates.find(p => !p.isPot && p.type !== 'lilypad');
        if (mainPlant) return mainPlant;
        return candidates[0];
    }

    update(dt, engine) {
        if (this.isDead) return;
        this.age += dt;
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= dt;
            if (this.hitFlashTimer <= 0 && this._isHitFlashing) {
                this._isHitFlashing = false;
                if (this.domElement) this.domElement.classList.remove('hit-flash');
            }
        }

        // 同步引擎网格与屋顶斜坡高度 + 水生僵尸严格水路约束 & 岸边入水溅水变身机制
        if (engine) {
            if (engine.cellH) this.cellH = engine.cellH;
            if (engine.cellW) this.cellW = engine.cellW;
            if (engine.gridStartY) this.gridStartY = engine.gridStartY;

            if (this.isAquatic) {
                const wRows = engine.waterRows || [];
                if (wRows.length === 0) {
                    // 非泳池关卡绝不允许出现水生僵尸：自动回退为普通僵尸
                    this.type = 'normal';
                    this.config = GAME_CONFIG.zombies.normal;
                    this.isAquatic = false;
                    this.inPoolWater = false;
                    this.hasDolphin = false;
                    this.isSubmerged = false;
                    this.speed = this.config.speed || 18;
                    this.walkAnim = this.config.walkAnims[0];
                    this.attackAnim = this.config.attackAnim;
                    this.setAnim(this.walkAnim);
                } else if (!wRows.includes(this.row)) {
                    // 严格锁定在泳池水路 (row 2 / 3)
                    this.row = wRows[this.row < wRows[0] ? 0 : wRows.length - 1];
                }
            }

            const slopeY = (typeof engine.getSurfaceOffsetY === 'function') ? engine.getSurfaceOffsetY(this.x) : 0;
            this.y = this.gridStartY + this.row * this.cellH + this.cellH / 2 + slopeY;

            // 原版 PVZ1 入水变身细节：在右侧石板岸上 (x > 796) 正常步行，跨过池沿进入水池瞬间溅起水花切换救生圈/潜水/骑海豚！
            if (this.isAquatic && (engine.waterRows || []).includes(this.row)) {
                const poolRightX = (engine.gridStartX || 80) + (engine.cols || 9) * (engine.cellW || 80) - 4;
                if (!this.inPoolWater && this.x <= poolRightX) {
                    this.inPoolWater = true;
                    soundEngine.playSplat();
                    if (engine.hitSplats) {
                        engine.hitSplats.push(new HitSplat(this.x - 10, this.y + 10, 'snow'));
                    }
                    if (this.type === 'ducky') {
                        this.walkAnim = this.config.walkAnims[0];
                    } else if (this.type === 'snorkel') {
                        this.isSubmerged = true;
                        this.walkAnim = this.config.walkAnims[0];
                    } else if (this.type === 'dolphin') {
                        const swimSpd = this.config.speed || 48;
                        this.speed = this.isHypnotized ? -Math.abs(swimSpd) : swimSpd;
                        this.walkAnim = this.hasDolphin
                            ? (this.config.rideAnim || this.config.walkAnims[0])
                            : (this.config.swimAnim || this.config.walkAnims[0]);
                    }
                    if (this.state === 'walk' && !this.hasLostHead) {
                        this.setAnim(this.walkAnim);
                    }
                }
            }
        }

        // 三叶草狂风吹飞气球僵尸
        if (this.isBlownAway) {
            this.x += 680 * dt;
            this.updateDOMPosition(engine, -24);
            if (this.x > 980) {
                this.destroy();
            }
            return;
        }

        // 蹦极僵尸首帧锁定地面格子与红白靶心坐标 (即使随后被寒冰菇极冻，也已具备准确靶心位置)
        if (this.type === 'bungee' && this.bungeePhase === 'init' && engine && !this.isDying) {
            const rowPlants = engine.plants.filter(p => p.row === this.row && !p.isDead && !p.isFlat);
            if (rowPlants.length > 0) {
                const mainPlants = rowPlants.filter(p => !p.isPot && p.type !== 'lilypad' && !p.isPumpkin);
                const pool = mainPlants.length > 0 ? mainPlants : rowPlants;
                const chosen = pool[Math.floor(Math.random() * pool.length)];
                this.bungeeTargetPlant = chosen;
                this.x = chosen.x;
            } else {
                const randCol = 1 + Math.floor(Math.random() * 4);
                this.x = (engine.gridStartX || 40) + randCol * this.cellW + this.cellW / 2;
            }
            const slopeY = (typeof engine.getSurfaceOffsetY === 'function') ? engine.getSurfaceOffsetY(this.x) : 0;
            this.y = this.gridStartY + this.row * this.cellH + this.cellH / 2 + slopeY;
            this.bungeeOffsetY = -360;
            this.bungeeRenderOffsetY = -360;
            this.bungeeTimer = 0.85;
            this.bungeePhase = 'targeting';
            soundEngine.playGroan();
            if (engine.floatingTexts) {
                engine.floatingTexts.push(new FloatingText(this.x, this.y - 46, '🎯 蹦极锁定!', '#e67e22', 20));
            }
        }

        const pinnedExtraOffsetY = this.type === 'bungee'
            ? (this.bungeeRenderOffsetY ?? this.bungeeOffsetY ?? 0)
            : (this.type === 'digger' && this.diggerPhase === 'digging' ? 14 : 0);

        // 黄油定身控制
        if (this.butterTimer > 0) {
            this.butterTimer -= dt;
            if (this.butterTimer <= 0 && this.domButter) {
                this.domButter.style.display = 'none';
            }
            this.updateDOMPosition(engine, pinnedExtraOffsetY);
            return;
        }

        // 寒冰菇极冻定身控制
        if (this.freezeTimer > 0) {
            this.freezeTimer -= dt;
            if (this.freezeTimer <= 0 && this.domElement) {
                this.domElement.classList.remove('frozen');
            }
            this.updateDOMPosition(engine, pinnedExtraOffsetY);
            return;
        }

        if (this.slowTimer > 0) {
            this.slowTimer -= dt;
            if (this.slowTimer <= 0) {
                this.isSlowed = false;
                if (this.domElement) this.domElement.classList.remove('slowed');
            }
        }

        if (this.isDying) {
            return;
        }

        // ================= 1. 蹦极僵尸从天而降偷窃植物 (1:1 对齐原版 Zombie.cpp UpdateZombieBungee) =================
        // 原版节奏：0.85s 地面红白靶心预警 -> ~1.85s 顺滑垂降 -> 3.0s 原地悬停待命 (mPhaseCounter=300) -> 0.95s 双手抱紧 -> 240px/s 缩绳升空
        if (this.type === 'bungee' && engine) {
            const effDt = this.isSlowed ? dt * 0.5 : dt;
            this.bungeeAge = (this.bungeeAge || 0) + effDt;

            const tryUmbrellaBounce = () => {
                const targetCol = this.bungeeTargetPlant
                    ? this.bungeeTargetPlant.col
                    : Math.round((this.x - (engine.gridStartX || 40) - this.cellW / 2) / this.cellW);
                const umbrella = engine.plants.find(u =>
                    !u.isDead && u.type === 'umbrellaleaf' &&
                    Math.abs(u.row - this.row) <= 1 &&
                    (Math.abs(u.col - targetCol) <= 1 || (this.bungeeTargetPlant && this.bungeeTargetPlant.isDoubleWide && Math.abs(u.col - (targetCol + 1)) <= 1))
                );
                if (!umbrella) return false;
                if (typeof umbrella.triggerBounce === 'function') {
                    umbrella.triggerBounce(engine);
                }
                this.bungeeTargetPlant = null;
                this.bungeePhase = 'ascending';
                this.bungeeRenderOffsetY = this.bungeeOffsetY;
                this.setAnim(this.config.walkAnims[0]);
                if (engine.floatingTexts) {
                    engine.floatingTexts.push(new FloatingText(umbrella.x, umbrella.y - 44, '☂️ 保护伞弹飞蹦极!', '#2ecc71', 20));
                }
                this.updateDOMPosition(engine, this.bungeeRenderOffsetY);
                return true;
            };

            if (this.bungeePhase === 'targeting') {
                this.bungeeTimer -= effDt;
                this.bungeeRenderOffsetY = this.bungeeOffsetY;
                if (this.bungeeTimer <= 0) {
                    this.bungeePhase = 'descending';
                    this.setAnim(this.config.walkAnims[0]);
                }
            } else if (this.bungeePhase === 'descending') {
                this.setAnim(this.config.walkAnims[0]);
                this.bungeeOffsetY = Math.min(0, this.bungeeOffsetY + 180 * effDt);
                this.bungeeRenderOffsetY = this.bungeeOffsetY;
                if (this.bungeeOffsetY >= -28 && tryUmbrellaBounce()) {
                    return;
                }
                if (this.bungeeOffsetY >= 0) {
                    this.bungeeOffsetY = 0;
                    this.bungeeRenderOffsetY = 0;
                    this.bungeePhase = 'hanging';
                    this.bungeeTimer = 3.0; // 原版 PHASE_BUNGEE_AT_BOTTOM 300cs (3.0秒) 悬停破绽期
                }
            } else if (this.bungeePhase === 'hanging') {
                if (tryUmbrellaBounce()) {
                    return;
                }
                this.bungeeTimer -= effDt;
                const damper = Math.max(0, this.bungeeTimer / 3.0);
                this.bungeeRenderOffsetY = -Math.abs(Math.sin(this.bungeeAge * 7.5)) * 7 * damper;
                if (this.bungeeTimer <= 0) {
                    this.bungeeRenderOffsetY = 0;
                    this.bungeePhase = 'grabbing';
                    this.bungeeTimer = 0.95;
                    this.setAnim(this.config.grabAnim || 'assets/zombies/bungee_grab.gif');
                }
            } else if (this.bungeePhase === 'grabbing') {
                if (tryUmbrellaBounce()) {
                    return;
                }
                this.bungeeTimer -= effDt;
                this.bungeeRenderOffsetY = 0;
                if (this.bungeeTimer <= 0) {
                    const targetCol = this.bungeeTargetPlant
                        ? this.bungeeTargetPlant.col
                        : Math.round((this.x - (engine.gridStartX || 40) - this.cellW / 2) / this.cellW);
                    const cellPlants = engine.plants.filter(
                        p => !p.isDead && !p.isFlat && p.row === this.row && (p.col === targetCol || (p.isDoubleWide && p.col + 1 === targetCol))
                    );
                    const victim = cellPlants.find(p => !p.isPot && p.type !== 'lilypad' && !p.isPumpkin)
                        || cellPlants[0]
                        || (this.bungeeTargetPlant && !this.bungeeTargetPlant.isDead ? this.bungeeTargetPlant : null);
                    if (victim && !victim.isDead) {
                        victim.destroy();
                        soundEngine.playSplat();
                        if (engine.floatingTexts) {
                            engine.floatingTexts.push(new FloatingText(this.x, this.y - 45, '😱 植物被抓走了!', '#e74c3c', 20));
                        }
                    }
                    this.bungeePhase = 'ascending';
                    this.setAnim(this.config.walkAnims[0]);
                }
            } else if (this.bungeePhase === 'ascending') {
                this.bungeeOffsetY -= 240 * effDt;
                this.bungeeRenderOffsetY = this.bungeeOffsetY;
                if (this.bungeeOffsetY <= -360) {
                    this.destroy();
                    return;
                }
            }
            this.updateDOMPosition(engine, this.bungeeRenderOffsetY);
            return;
        }

        // ================= 2. 矿工僵尸地下掘进与绕后反噬 =================
        if (this.type === 'digger' && this.diggerPhase && !this.isHypnotized && engine) {
            if (this.diggerPhase === 'digging') {
                const curSpd = this.isSlowed ? (this.config.digSpeed || 54) * 0.5 : (this.config.digSpeed || 54);
                this.x -= curSpd * dt;
                const leftEdge = (engine.gridStartX || 40) + 18;
                if (this.x <= leftEdge) {
                    this.x = leftEdge;
                    this.diggerPhase = 'dizzy';
                    this.diggerDizzyTimer = 1.1;
                    this.walkAnim = this.config.surfacedWalkAnim || 'assets/zombies/digger_walk.gif';
                    this.setAnim(this.walkAnim);
                    if (engine.floatingTexts) {
                        engine.floatingTexts.push(new FloatingText(this.x + 25, this.y - 42, '⛏️ 矿工从后方钻出!', '#f39c12', 19));
                    }
                }
                this.updateDOMPosition(engine, 14);
                return;
            } else if (this.diggerPhase === 'dizzy') {
                this.diggerDizzyTimer -= dt;
                if (this.diggerDizzyTimer <= 0) {
                    this.diggerPhase = 'backwards';
                    this.speed = this.config.walkSpeed || 18;
                    if (this.domImg) {
                        this.domImg.style.transform = 'scaleX(-1)';
                    }
                }
                this.updateDOMPosition(engine);
                return;
            } else if (this.diggerPhase === 'backwards') {
                if (this.hasLostHead) {
                    this.x += (this.speed * 0.6) * dt;
                    this.hp -= dt * 20;
                    if (this.hp <= 0) this.die();
                    this.updateDOMPosition(engine);
                    return;
                }
                const rearPlant = this.findTargetPlant(engine, true);
                if (rearPlant) {
                    if (this.state !== 'attack') {
                        this.state = 'attack';
                        this.setAnim(this.attackAnim);
                    }
                    this.biteTimer += dt;
                    const biteRate = this.isSlowed ? this.biteInterval * 2 : this.biteInterval;
                    if (this.biteTimer >= biteRate) {
                        this.biteTimer = 0;
                        rearPlant.takeDamage(this.biteDamage, this);
                        soundEngine.playBite();
                    }
                } else {
                    if (this.state !== 'walk') {
                        this.state = 'walk';
                        this.setAnim(this.walkAnim);
                    }
                    const curSpd = this.isSlowed ? this.speed * 0.5 : this.speed;
                    this.x += curSpd * dt;
                    if (this.x > 940) {
                        this.destroy();
                        return;
                    }
                }
                this.updateDOMPosition(engine);
                return;
            }
        }

        // ================= 3. 小丑僵尸音乐盒随机引爆 =================
        if (this.type === 'jackinthebox' && this.hasShield && !this.hasLostHead && !this.isHypnotized && engine) {
            if (this.x <= 680) {
                this.jackFuse -= dt;
                if (this.jackFuse <= 0.65 && this.config.openAnim) {
                    this.setAnim(this.config.openAnim);
                }
                if (this.jackFuse <= 0 || this.x <= 240) {
                    soundEngine.playBoom();
                    soundEngine.playThunder();
                    engine.explosions.push(new ExplosionEffect(this.x, this.y, 'cherry'));
                    if (engine.floatingTexts) {
                        engine.floatingTexts.push(new FloatingText(this.x, this.y - 48, '🤡 惊吓魔盒自爆!', '#e74c3c', 22));
                    }
                    engine.plants.forEach(p => {
                        if (!p.isDead && Math.abs(p.row - this.row) <= 1 && Math.abs(p.x - this.x) <= 110) {
                            p.destroy();
                        }
                    });
                    this.destroy();
                    return;
                }
            }
        }

        // ================= 4. 气球僵尸空中漂浮前进 =================
        if (this.type === 'balloon' && this.isFlying && !this.isHypnotized) {
            const curSpd = this.isSlowed ? this.speed * 0.5 : this.speed;
            this.x -= curSpd * dt;
            const bob = Math.sin(this.age * 3.8) * 5 - 18;
            this.updateDOMPosition(engine, bob);
            return;
        }

        // ================= 5. 投石车僵尸远程抛投篮球与碾压 =================
        if (this.type === 'catapult' && engine) {
            if (this.catapultShootAnimTimer > 0) {
                this.catapultShootAnimTimer -= dt;
                if (this.catapultShootAnimTimer <= 0) {
                    this.setAnim(this.config.walkAnims[0]);
                }
            }
            const rowPlants = engine.plants.filter(p => p.row === this.row && !p.isDead && !p.isFlat);
            if (this.x > 690 || this.basketballs <= 0 || rowPlants.length === 0) {
                // 向前行驶并碾压非地刺植物
                if (!this.catapultShootAnimTimer || this.catapultShootAnimTimer <= 0) {
                    this.setAnim(this.config.walkAnims[0]);
                }
                this.x -= this.speed * dt;
                const crushPlant = this.findTargetPlant(engine, false);
                if (crushPlant) {
                    crushPlant.takeDamage(9999, this);
                    soundEngine.playSplat();
                }
            } else {
                // 原地抛投篮球攻击本行最左侧植物
                this.catapultTimer -= dt;
                if (this.catapultTimer <= 0) {
                    this.catapultTimer = 2.8;
                    this.basketballs--;
                    this.catapultShootAnimTimer = 0.85;
                    this.setAnim(this.config.shootAnim || 'assets/zombies/catapult_shoot.gif');
                    rowPlants.sort((a, b) => a.x - b.x);
                    const targetP = rowPlants[0];
                    soundEngine.playShoot();
                    engine.projectiles.push(
                        new LobbedProjectile(this.row, this.x + 12, this.y - 54, targetP, 'basketball', 75)
                    );
                }
            }
            this.updateDOMPosition(engine);
            return;
        }

        // ================= 6. 冰车僵尸碾压推进 =================
        if (this.type === 'zomboni' && engine) {
            this.x -= this.speed * dt;
            const crushPlant = this.findTargetPlant(engine, false);
            if (crushPlant) {
                crushPlant.takeDamage(9999, this);
                soundEngine.playSplat();
            }
            this.updateDOMPosition(engine);
            return;
        }

        // 读报僵尸报纸被打碎后的原地问号愤怒停顿 (原版 ~1.35s)
        if (this.state === 'enraging') {
            this.enrageTimer -= dt;
            if (this.enrageTimer > 0) {
                this.updateDOMPosition(engine);
                return;
            }
            this.state = 'walk';
            this.setAnim(this.walkAnim);
            if (engine && engine.floatingTexts) {
                engine.floatingTexts.push(new FloatingText(this.x, this.y - 45, '😡 报纸碎了！狂暴冲锋！', '#e74c3c', 18));
            }
        }

        // 舞王僵尸太空步入场与聚光灯召唤伴舞状态机
        if (this.type === 'dancing' && !this.hasLostHead && engine) {
            if (this.dancePhase === 'moonwalk') {
                this.moonwalkTimer -= dt;
                const hasObstacle = this.isHypnotized
                    ? engine.zombies.some(z => !z.isDead && !z.isDying && !z.isHypnotized && z.row === this.row && Math.abs(z.x - this.x) <= 45)
                    : (engine.plants.some(p => p.row === this.row && !p.isDead && !p.isFlat && p.x <= this.x && Math.abs(p.x - this.x) <= 45) ||
                       engine.zombies.some(z => !z.isDead && !z.isDying && z.isHypnotized && z.row === this.row && Math.abs(z.x - this.x) <= 45));
                if (this.moonwalkTimer <= 0 || hasObstacle || (!this.isHypnotized && this.x <= 680)) {
                    this.dancePhase = 'summon';
                    this.summonTimer = 1.15;
                    const baseSpd = this.config.speed || 16;
                    this.speed = this.isHypnotized ? -Math.abs(baseSpd) : baseSpd;
                    this.setAnim(this.config.summonAnim || 'assets/zombies/dancing_summon.gif');
                    soundEngine.playDisco();
                    this.updateDOMPosition(engine);
                    return;
                }
            } else if (this.dancePhase === 'summon') {
                this.summonTimer -= dt;
                this.setAnim(this.config.summonAnim || 'assets/zombies/dancing_summon.gif');
                if (this.summonTimer <= 0) {
                    this.summonBackupDancers(engine);
                    this.dancePhase = 'dance_walk';
                    this.summonCooldown = 7.0;
                    this.state = 'walk';
                    this.setAnim(this.walkAnim);
                }
                this.updateDOMPosition(engine);
                return;
            } else if (this.dancePhase === 'dance_walk') {
                this.summonCooldown -= dt;
                if (this.summonCooldown <= 0 && this.state !== 'attack' && this.hasMissingBackup(engine)) {
                    this.dancePhase = 'summon';
                    this.summonTimer = 1.15;
                    this.setAnim(this.config.summonAnim || 'assets/zombies/dancing_summon.gif');
                    soundEngine.playDisco();
                    this.updateDOMPosition(engine);
                    return;
                }
            }
        }

        // 倒戈魅惑状态 (反向向右走，与其他僵尸双向互啃)
        if (this.isHypnotized) {
            const enemyZombie = !this.hasLostHead && engine.zombies.find(z =>
                !z.isDead && !z.isDying && !z.isHypnotized && z.row === this.row && Math.abs(z.x - this.x) <= 35
            );
            if (enemyZombie) {
                if (this.state !== 'attack') {
                    this.state = 'attack';
                    this.setAnim(this.attackAnim);
                }
                this.biteTimer += dt;
                const biteRate = this.isSlowed ? this.biteInterval * 2 : this.biteInterval;
                if (this.biteTimer >= biteRate) {
                    this.biteTimer = 0;
                    enemyZombie.takeDamage(this.biteDamage);
                    soundEngine.playBite();
                }
            } else {
                const desiredWalk = (this.type === 'dancing' && this.dancePhase === 'moonwalk')
                    ? (this.config.moonwalkAnim || this.walkAnim)
                    : this.walkAnim;
                if (this.state !== 'walk' || this.currentAnim !== desiredWalk) {
                    this.state = 'walk';
                    this.setAnim(desiredWalk);
                }
                const baseMove = this.isSlowed ? Math.abs(this.speed) * 0.5 : Math.abs(this.speed);
                this.x += (this.hasLostHead ? baseMove * 0.75 : baseMove) * dt;
                if (this.hasLostHead) {
                    this.hp -= dt * 20;
                    if (this.hp <= 0) {
                        this.hp = 0;
                        this.die();
                    }
                }
                if (this.x > 960) {
                    this.destroy();
                }
            }
            this.updateDOMPosition(engine);
            return;
        }

        // 撑杆跳 / 海豚骑手腾空飞跃动画
        if (this.state === 'jumping') {
            this.jumpTimer -= dt;
            const totalDur = this.type === 'dolphin' ? 0.78 : 0.85;
            const progress = 1 - Math.max(0, this.jumpTimer) / totalDur;
            this.x = this.jumpStartX + (this.jumpTargetX - this.jumpStartX) * progress;
            const jumpArc = Math.sin(progress * Math.PI) * 48;
            this.updateDOMPosition(engine, -jumpArc);
            if (this.jumpTimer <= 0) {
                if (this.type === 'dolphin') {
                    this.hasDolphin = false;
                    this.speed = this.config.swimSpeed || 18;
                    this.walkAnim = this.config.swimAnim || 'assets/zombies/dolphin_swim.gif';
                } else {
                    this.hasPole = false;
                    this.speed = this.config.walkSpeed || 18;
                    this.walkAnim = 'assets/zombies/polevault_walk.gif';
                    this.attackAnim = 'assets/zombies/polevault_attack.gif';
                }
                this.state = 'walk';
                this.setAnim(this.walkAnim);
            }
            return;
        }

        // 伽刚特尔巨人半血投掷小鬼僵尸（投掷后背篓内小鬼同步消失！）
        if (this.type === 'gargantuar' && !this.hasThrownImp && this.hp <= this.maxTotalHp * 0.5 && this.x > 340 && engine) {
            this.hasThrownImp = true;
            this.walkAnim = this.config.noImpWalkAnim || this.walkAnim;
            this.attackAnim = this.config.noImpAttackAnim || this.attackAnim;
            this.setAnim(this.state === 'smashing' ? this.attackAnim : this.walkAnim);
            const landX = Math.max((engine.gridStartX || 40) + 140, this.x - 230);
            const imp = new Zombie('imp', this.row, landX, this.entityLayer);
            engine.zombies.push(imp);
            soundEngine.playGroan();
            if (engine.floatingTexts) {
                engine.floatingTexts.push(new FloatingText(landX, this.y - 45, '👶 巨人投掷小鬼僵尸!', '#e67e22', 19));
            }
        }

        // 伽刚特尔巨人挥舞电线杆重砸动画
        if (this.type === 'gargantuar' && this.state === 'smashing') {
            this.smashTimer -= dt;
            if (this.smashTimer <= 0) {
                if (this.smashTarget && !this.smashTarget.isDead) {
                    this.smashTarget.takeDamage(1800, this);
                    soundEngine.playBoom();
                }
                this.smashTarget = null;
                this.state = 'walk';
                this.setAnim(this.walkAnim);
            }
            this.updateDOMPosition(engine);
            return;
        }

        // 失去头部状态 (不能再啃咬植物或僵尸)
        if (this.hasLostHead) {
            if (this.state !== 'walk') {
                this.state = 'walk';
                this.setAnim(this.walkAnim);
            }
            const curSpeed = (this.isSlowed ? this.speed * 0.5 : this.speed) * 0.75;
            this.x -= curSpeed * dt;
            this.hp -= dt * 20;
            if (this.hp <= 0) {
                this.hp = 0;
                this.die();
            }
            this.updateDOMPosition(engine);
            return;
        }

        // 优先检测同行魅惑倒戈僵尸
        const hypnoTarget = engine && engine.zombies.find(z =>
            !z.isDead && !z.isDying && z.isHypnotized && z.row === this.row && Math.abs(z.x - this.x) <= 35
        );
        if (hypnoTarget) {
            if (this.hasPole) {
                this.hasPole = false;
                this.speed = this.config.walkSpeed || 18;
                this.walkAnim = 'assets/zombies/polevault_walk.gif';
                this.attackAnim = 'assets/zombies/polevault_attack.gif';
            }
            this.isSubmerged = false;
            if (this.state !== 'attack') {
                this.state = 'attack';
                this.setAnim(this.attackAnim);
            }
            this.biteTimer += dt;
            const biteRate = this.isSlowed ? this.biteInterval * 2 : this.biteInterval;
            if (this.biteTimer >= biteRate) {
                this.biteTimer = 0;
                hypnoTarget.takeDamage(this.biteDamage);
                soundEngine.playBite();
            }
            this.updateDOMPosition(engine);
            return;
        }

        // 检测前方植物
        const targetPlant = engine ? this.findTargetPlant(engine, false) : null;

        if (targetPlant) {
            // 1. 撑杆跳或海豚骑手首次跳跃判定
            if (this.hasPole || (this.hasDolphin && this.inPoolWater)) {
                if (targetPlant.isTall) {
                    if (this.hasDolphin) {
                        this.hasDolphin = false;
                        this.speed = this.config.swimSpeed || 18;
                        this.walkAnim = this.config.swimAnim || 'assets/zombies/dolphin_swim.gif';
                    } else {
                        this.hasPole = false;
                        this.speed = this.config.walkSpeed || 18;
                        this.walkAnim = 'assets/zombies/polevault_walk.gif';
                        this.attackAnim = 'assets/zombies/polevault_attack.gif';
                    }
                    this.state = 'attack';
                    this.setAnim(this.attackAnim);
                    engine.floatingTexts.push(new FloatingText(this.x, this.y - 45, '🛑 高坚果拦截！', '#e74c3c', 19));
                    soundEngine.playSplat();
                } else {
                    this.state = 'jumping';
                    this.jumpTimer = this.hasDolphin ? 0.78 : 0.85;
                    this.jumpStartX = this.x;
                    this.jumpTargetX = targetPlant.x - 48;
                    this.setAnim(this.config.jumpAnim || 'assets/zombies/polevault_jump.gif');
                    soundEngine.playGroan();
                    this.updateDOMPosition(engine);
                    return;
                }
            }

            // 2. 跳跳僵尸弹跳越过植物（遇高坚果撞落跳跳杆）
            if (this.type === 'pogo' && this.hasShield && this.shieldType === 'pogo') {
                if (targetPlant.isTall) {
                    this.onArmorBroken('pogo');
                    engine.floatingTexts.push(new FloatingText(this.x, this.y - 45, '🛑 高坚果撞落跳跳杆!', '#e74c3c', 19));
                    soundEngine.playSplat();
                } else {
                    this.x = targetPlant.x - 44;
                    soundEngine.playShoot();
                    this.updateDOMPosition(engine, -18);
                    return;
                }
            }

            // 3. 扶梯僵尸在坚果/南瓜头上架设金属梯子
            if (this.type === 'ladder' && this.hasShield && this.shieldType === 'ladder') {
                targetPlant.hasLadder = true;
                if (targetPlant.domElement) {
                    targetPlant.domElement.classList.add('has-ladder');
                }
                this.armorHp = 0;
                this.hasShield = false;
                this.speed = this.config.walkSpeed || 18;
                this.walkAnim = this.config.noShieldWalkAnim || 'assets/zombies/ladder_noladder_walk.gif';
                this.attackAnim = this.config.noShieldAttackAnim || 'assets/zombies/ladder_noladder_attack.gif';
                this.setAnim(this.walkAnim);
                this.x = targetPlant.x - 40;
                soundEngine.playSplat();
                if (engine.floatingTexts) {
                    engine.floatingTexts.push(new FloatingText(targetPlant.x, targetPlant.y - 42, '🪜 架设扶梯!', '#f39c12', 19));
                }
                this.updateDOMPosition(engine, -12);
                return;
            }

            // 4. 伽刚特尔巨人挥杆重击秒杀植物
            if (this.type === 'gargantuar') {
                this.state = 'smashing';
                this.smashTimer = 0.90;
                this.smashTarget = targetPlant;
                this.setAnim(this.attackAnim);
                this.updateDOMPosition(engine);
                return;
            }

            // 5. 常规啃咬植物（潜水僵尸浮出水面啃咬）
            if (this.type === 'snorkel') {
                this.isSubmerged = false;
            }
            if (this.state !== 'attack') {
                this.state = 'attack';
                this.setAnim(this.attackAnim);
            }
            this.biteTimer += dt;
            const biteRate = this.isSlowed ? this.biteInterval * 2 : this.biteInterval;
            if (this.biteTimer >= biteRate) {
                this.biteTimer = 0;
                targetPlant.takeDamage(this.biteDamage, this);
                soundEngine.playBite();
            }
        } else {
            if (this.type === 'snorkel') {
                this.isSubmerged = !!this.inPoolWater;
            }
            const desiredWalk = (this.type === 'dancing' && this.dancePhase === 'moonwalk')
                ? (this.config.moonwalkAnim || this.walkAnim)
                : this.walkAnim;
            if (this.state !== 'walk' || this.currentAnim !== desiredWalk) {
                this.state = 'walk';
                this.setAnim(desiredWalk);
            }
            const curSpeed = this.isSlowed ? this.speed * 0.5 : this.speed;
            this.x -= curSpeed * dt;
        }

        // 跳跳僵尸弹跳起伏 & 架梯植物翻越抬升效果
        let extraY = 0;
        if (this.type === 'pogo' && this.hasShield && this.shieldType === 'pogo') {
            extraY = -Math.abs(Math.sin(this.age * 7.5)) * 22;
        } else if (engine && engine.plants.some(p => !p.isDead && p.row === this.row && p.hasLadder && Math.abs(p.x - this.x) <= 28)) {
            extraY = -18;
        }

        this.updateDOMPosition(engine, extraY);
    }

    render(ctx) {
        // 实体由 DOM 渲染，Canvas 不需要绘制静态图像
    }
}
