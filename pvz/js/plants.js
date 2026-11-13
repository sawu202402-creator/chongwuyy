/**
 * plants.js - 原版 1:1 植物实体系统与 DOM 60fps 动态 GIF 动画层
 */
import { GAME_CONFIG } from './config.js?v=20261113_v2';
import { Projectile, ExplosionEffect, SunEntity, FumeCloud, HitSplat, FloatingText, JalapenoFireLine, StarProjectile, LobbedProjectile, HomingSpikeProjectile, CobRocketProjectile } from './projectiles.js?v=20261113_v2';
import { soundEngine } from './audio.js?v=20261113_v2';

// 蹦极僵尸尚在云端锁定预警/高空垂降初段/已撤离升空时，常规植物不提前空射或误跳；垂降进入视野 (>= -180px) 时全员集火！
function isUntargetableBungee(z) {
    return z.type === 'bungee' && (
        z.bungeePhase === 'init' ||
        z.bungeePhase === 'targeting' ||
        z.bungeePhase === 'ascending' ||
        z.bungeeOffsetY < -180
    );
}

export class Plant {
    constructor(type, row, col, x, y, entityLayer = null) {
        this.id = 'plant_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        this.type = type;
        this.row = row;
        this.col = col;
        this.x = x;
        this.y = y;
        this.config = GAME_CONFIG.plants[type] || GAME_CONFIG.plants.peashooter;
        this.hp = this.config.hp || 300;
        this.maxHp = this.hp;
        this.isDead = false;
        this.anim = this.config.anim;
        this.currentAnim = this.anim;
        this.age = 0;
        this.isSuperGatling = false;
        this.gatlingTimer = 0;
        this.domElement = null;
        this.isAsleep = false;
        this.isNocturnal = !!this.config.isNocturnal;
        this.isDiurnal = !!this.config.isDiurnal;
        this.zzzElement = null;

        if (entityLayer) {
            this.createDOM(entityLayer);
        }
    }

    createDOM(container) {
        if (!container) return;
        this.domElement = document.createElement('div');
        this.domElement.className = `plant-entity plant-${this.type} ${this.isAsleep ? 'is-asleep' : ''}`;
        this.domElement.setAttribute('data-id', this.id);
        
        // 大嘴花/霸王花特殊规格(130x114)，原版基准对齐
        if (this.type === 'chomper') {
            this.domElement.style.width = '130px';
            this.domElement.style.height = '114px';
            this.domElement.style.left = `${this.x - 45}px`;
            this.domElement.style.top = `${this.y - 65}px`;
        } else {
            // 普通植物原版草坪格宽82，高98。将植物水平居中、底部对齐草地
            this.domElement.style.left = `${this.x - 38}px`;
            this.domElement.style.top = `${this.y - 48}px`;
        }

        this.domImg = document.createElement('img');
        this.domImg.className = 'plant-gif';
        this.domImg.decoding = 'async';
        this.domImg.src = this.currentAnim;
        this.domElement.appendChild(this.domImg);

        if (this.isAsleep) {
            this.createZzzBubble();
        }

        container.appendChild(this.domElement);
    }

    putToSleep() {
        this.isAsleep = true;
        if (this.config.sleepAnim) {
            this.setAnim(this.config.sleepAnim);
        }
        if (this.domElement) {
            this.domElement.classList.add('is-asleep');
            this.createZzzBubble();
        }
    }

    createZzzBubble() {
        if (!this.domElement || this.zzzElement) return;
        this.zzzElement = document.createElement('div');
        this.zzzElement.className = 'plant-zzz-bubble';
        this.zzzElement.innerHTML = '<span>Z</span><span>z</span><span>z</span>';
        this.domElement.appendChild(this.zzzElement);
    }

    wakeUp(engine) {
        if (!this.isAsleep) return;
        this.isAsleep = false;
        this.setAnim(this.config.anim);
        if (this.domElement) {
            this.domElement.classList.remove('is-asleep');
            if (this.zzzElement && this.zzzElement.parentNode) {
                this.zzzElement.parentNode.removeChild(this.zzzElement);
                this.zzzElement = null;
            }
        }
        if (engine) {
            engine.floatingTexts.push(new FloatingText(this.x, this.y - 30, '✨ 唤醒啦!', '#2ecc71', 20));
            soundEngine.playSplat();
        }
    }

    setAnim(newSrc) {
        if (this.currentAnim !== newSrc) {
            this.currentAnim = newSrc;
            if (this.domImg) {
                this.domImg.src = newSrc;
            }
        }
    }

    takeDamage(amount, attacker = null) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.destroy();
        }
    }

    destroy() {
        this.isDead = true;
        if (this.hostLilypad) {
            this.hostLilypad.carriedPlant = null;
            this.hostLilypad = null;
        }
        if (this.hostSecondaryLilypad) {
            this.hostSecondaryLilypad.carriedPlant = null;
            this.hostSecondaryLilypad = null;
        }
        if (this.hostPot) {
            this.hostPot.carriedPlant = null;
            this.hostPot = null;
        }
        if (this.hostSecondaryPot) {
            this.hostSecondaryPot.carriedPlant = null;
            this.hostSecondaryPot = null;
        }
        if (this.zzzElement && this.zzzElement.parentNode) {
            this.zzzElement.parentNode.removeChild(this.zzzElement);
            this.zzzElement = null;
        }
        if (this.domElement && this.domElement.parentNode) {
            this.domElement.parentNode.removeChild(this.domElement);
            this.domElement = null;
        }
    }

    update(dt, engine) {
        if (this.isDead) return;
        this.engine = engine;
        this.age += dt;
        if (this.isSuperGatling) {
            this.gatlingTimer -= dt;
            if (this.gatlingTimer <= 0) {
                this.isSuperGatling = false;
                if (this.domElement) this.domElement.classList.remove('super-gatling');
            }
        }
    }

    render(ctx) {
        // 植物实体直接由 DOM 原生 60fps GIF 渲染，Canvas 仅绘制血量条提示
        if (this.isDead) return;
        if (this.type === 'wallnut' && this.hp < this.maxHp) {
            const barW = 46;
            const barH = 5;
            const pct = Math.max(0, this.hp / this.maxHp);
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(this.x - barW / 2, this.y - 40, barW, barH);
            ctx.fillStyle = pct > 0.5 ? '#2ecc71' : pct > 0.25 ? '#f39c12' : '#e74c3c';
            ctx.fillRect(this.x - barW / 2, this.y - 40, barW * pct, barH);
        }
    }
}

// 豌豆射手
export class PeashooterPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('peashooter', row, col, x, y, entityLayer);
        this.shootTimer = 0.5;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        this.shootTimer += dt;

        let interval = this.config.attackInterval || 1.425;
        if (this.isSuperGatling) {
            interval = 0.15;
            if (this.domElement) this.domElement.classList.add('super-gatling');
        } else if (engine.isSuperCharge) {
            interval *= 0.65;
        }

        if (this.shootTimer >= interval) {
            const hasZombieAhead = engine.zombies.some(z => 
                z.row === this.row && !z.isDead && !z.isHypnotized && !isUntargetableBungee(z) && z.x >= this.x && z.x <= 900
            );

            if (hasZombieAhead || this.isSuperGatling) {
                this.shootTimer = 0;
                engine.projectiles.push(
                    new Projectile(this.row, this.x + 30, this.y - 14, 'pea', this.config.damage, false)
                );
                soundEngine.playShoot();
            }
        }
    }
}

// 向日葵
export class SunflowerPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('sunflower', row, col, x, y, entityLayer);
        this.sunTimer = 0;
        this.hasProducedFirstSun = false;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        this.sunTimer += dt;
        const interval = this.hasProducedFirstSun ? (this.config.sunInterval || 24.0) : (this.config.firstSunTime || 7.0);

        if (this.sunTimer >= interval) {
            this.sunTimer = 0;
            this.hasProducedFirstSun = true;
            // 产出向日葵阳光并弹跳至向日葵正前方地面 (比花心略靠下，确保在植物前)
            const sunX = this.x + (Math.random() * 20 - 10);
            const sunY = this.y - 10;
            const targetY = this.y + 25;
            const sun = new SunEntity(sunX, sunY, targetY, 25, false, engine.sunLayer, engine);
            engine.suns.push(sun);
            soundEngine.playSun();
        }
    }
}

// 樱桃炸弹
export class CherryBombPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('cherrybomb', row, col, x, y, entityLayer);
        this.fuseTimer = 0;
        this.fuseTime = this.config.fuseTime || 1.2;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;
        this.fuseTimer += dt;
        const scale = 1.0 + (this.fuseTimer / this.fuseTime) * 0.45;
        if (this.domElement) {
            this.domElement.style.transform = `scale(${scale})`;
        }

        if (this.fuseTimer >= this.fuseTime) {
            this.explode(engine);
        }
    }

    explode(engine) {
        this.destroy();
        engine.explosions.push(new ExplosionEffect(this.x, this.y, 'cherry'));
        soundEngine.playExplosion();

        // 3x3 范围造成 1800 毁灭伤害
        const cellW = GAME_CONFIG.canvas.cellWidth;
        engine.zombies.forEach(z => {
            if (!z.isDead && Math.abs(z.row - this.row) <= 1) {
                const dist = Math.abs(z.x - this.x);
                if (dist <= cellW * 1.5) {
                    if (typeof z.blastDie === 'function') {
                        z.blastDie();
                    } else {
                        z.takeDamage(this.config.damage);
                    }
                }
            }
        });
    }
}

// 坚果墙
export class WallnutPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('wallnut', row, col, x, y, entityLayer);
    }

    takeDamage(amount) {
        super.takeDamage(amount);
        this.checkCrackState();
    }

    checkCrackState() {
        if (this.isDead) return;
        if (this.hp <= this.config.crackThreshold2) {
            this.setAnim(this.config.crack2Anim);
        } else if (this.hp <= this.config.crackThreshold1) {
            this.setAnim(this.config.crack1Anim);
        } else {
            this.setAnim(this.config.anim);
        }
    }

    update(dt, engine) {
        super.update(dt, engine);
        this.checkCrackState();
    }
}

// 土豆地雷
export class PotatoMinePlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('potatomine', row, col, x, y, entityLayer);
        this.isArmed = false;
        this.armTimer = 0;
        this.lastEngine = null;
        this.anim = this.config.unarmedAnim;
        this.setAnim(this.config.unarmedAnim);
    }

    takeDamage(amount, attacker = null) {
        // 已武装状态下若被任何敌方僵尸触碰/啃咬，立即引爆！
        if (this.isArmed && !this.isDead && attacker && !attacker.isDead && !attacker.isHypnotized && this.lastEngine) {
            this.explode(this.lastEngine, attacker);
            return;
        }
        super.takeDamage(amount, attacker);
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;
        this.lastEngine = engine;
        if (!this.isArmed) {
            this.armTimer += dt;
            if (this.armTimer >= (this.config.armTime || 15.0)) {
                this.isArmed = true;
                this.setAnim(this.config.armedAnim);
                soundEngine.playPlant();
                if (engine && engine.floatingTexts) {
                    engine.floatingTexts.push(new FloatingText(this.x, this.y - 28, '💥 地雷已就绪!', '#e67e22', 16));
                }
            }
        }
        if (this.isArmed && engine && engine.zombies) {
            // 僵尸驻足啃咬距离为 38px，触发半径设为 [-38, +48] 确保僵尸踏入即刻引爆（撑杆跳起跳中除外）
            const zombieOnTop = engine.zombies.find(z =>
                z.row === this.row &&
                !z.isDead &&
                !z.isDying &&
                !z.isHypnotized &&
                z.state !== 'jumping' &&
                !z.hasPole &&
                (z.x - this.x >= -38 && z.x - this.x <= 48)
            );
            if (zombieOnTop) {
                this.explode(engine, zombieOnTop);
            }
        }
    }

    explode(engine, triggerZombie = null) {
        if (this.isDead) return;
        this.destroy();
        engine.explosions.push(new ExplosionEffect(this.x, this.y, 'potato'));
        soundEngine.playExplosion();
        if (engine.floatingTexts) {
            engine.floatingTexts.push(new FloatingText(this.x, this.y - 46, '💥 SPUDOW!', '#f39c12', 22));
        }
        const dmg = this.config.damage || 1800;
        if (triggerZombie && !triggerZombie.isDead && !triggerZombie.isHypnotized) {
            if (typeof triggerZombie.blastDie === 'function') {
                triggerZombie.blastDie();
            } else {
                triggerZombie.takeDamage(dmg);
            }
        }
        engine.zombies.forEach(z => {
            if (!z.isDead && !z.isHypnotized && z.row === this.row && Math.abs(z.x - this.x) <= 65) {
                if (typeof z.blastDie === 'function') {
                    z.blastDie();
                } else {
                    z.takeDamage(dmg);
                }
            }
        });
    }
}

// 雪花豌豆
export class SnowPeaPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('snowpea', row, col, x, y, entityLayer);
        this.shootTimer = 0.5;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        this.shootTimer += dt;

        let interval = this.config.attackInterval || 1.425;
        if (engine.isSuperCharge) interval *= 0.65;

        if (this.shootTimer >= interval) {
            const hasZombieAhead = engine.zombies.some(z => 
                z.row === this.row && !z.isDead && !z.isHypnotized && !isUntargetableBungee(z) && z.x >= this.x && z.x <= 900
            );

            if (hasZombieAhead) {
                this.shootTimer = 0;
                engine.projectiles.push(
                    new Projectile(this.row, this.x + 30, this.y - 14, 'snow_pea', this.config.damage, true)
                );
                soundEngine.playShoot();
            }
        }
    }
}

// 大嘴花 (霸王花)
export class ChomperPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('chomper', row, col, x, y, entityLayer);
        this.state = 'idle';
        this.chewTimer = 0;
        this.biteTimer = 0;
        this.targetZombie = null;
        this.digestAnim = this.config.digestAnim || 'assets/plants/chomper_digest.gif';
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;

        if (this.state === 'bite') {
            this.biteTimer -= dt;
            if (this.biteTimer <= 0) {
                // 咬住结束，吞入腹中，进入闭嘴咀嚼消化状态
                this.state = 'chewing';
                this.setAnim(this.digestAnim);
                if (this.targetZombie && !this.targetZombie.isDead) {
                    this.targetZombie.destroy();
                    this.targetZombie = null;
                }
            }
        } else if (this.state === 'chewing') {
            this.chewTimer -= dt;
            if (this.chewTimer <= 0) {
                // 消化完毕，恢复常态摇摆待命
                this.state = 'idle';
                this.setAnim(this.config.anim);
            }
        } else if (this.state === 'idle') {
            const cellW = engine.cellW || GAME_CONFIG.canvas.cellWidth;
            // 索敌：前方1.5格内未死活体地面僵尸（含已垂降落地的蹦极僵尸；不可直接吞食飞行气球/地下矿工）
            const target = engine.zombies.find(z =>
                z.row === this.row && !z.isDead && !z.isDying && !z.isHypnotized &&
                !z.isFlying && !isUntargetableBungee(z) && !(z.type === 'digger' && z.diggerPhase === 'digging') &&
                (z.x - this.x) > -10 && (z.x - this.x) <= cellW * 1.5
            );
            if (target) {
                if (target.isVehicle || target.type === 'gargantuar') {
                    // 原版机制：对巨人与载具无法一口吞下，改为啃咬造成 40 伤害
                    target.takeDamage(40);
                    this.state = 'chewing';
                    this.chewTimer = 1.4;
                    this.setAnim(this.config.attackAnim);
                    soundEngine.playBite();
                } else {
                    this.swallow(target);
                }
            }
        }
    }

    swallow(target) {
        this.state = 'bite';
        this.targetZombie = target;
        this.biteTimer = 0.8; // 咬合动作持续约0.8秒
        this.chewTimer = this.config.chewTime || 40.0;
        this.setAnim(this.config.attackAnim);
        soundEngine.playBite();
    }
}

// 双发射手
export class RepeaterPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('repeater', row, col, x, y, entityLayer);
        this.shootTimer = 0.5;
        this.subShotPending = false;
        this.subShotDelay = 0.2;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        this.shootTimer += dt;

        let interval = this.config.attackInterval || 1.425;
        if (engine.isSuperCharge) interval *= 0.65;

        if (this.subShotPending) {
            this.subShotDelay -= dt;
            if (this.subShotDelay <= 0) {
                this.subShotPending = false;
                engine.projectiles.push(
                    new Projectile(this.row, this.x + 30, this.y - 14, 'pea', this.config.damage, false)
                );
                soundEngine.playShoot();
            }
        }

        if (this.shootTimer >= interval) {
            const hasZombieAhead = engine.zombies.some(z => 
                z.row === this.row && !z.isDead && !z.isHypnotized && !isUntargetableBungee(z) && z.x >= this.x && z.x <= 900
            );

            if (hasZombieAhead) {
                this.shootTimer = 0;
                engine.projectiles.push(
                    new Projectile(this.row, this.x + 30, this.y - 14, 'pea', this.config.damage, false)
                );
                soundEngine.playShoot();
                this.subShotPending = true;
                this.subShotDelay = 0.2;
            }
        }
    }
}

// 小喷菇 (0阳光近程射手)
export class PuffshroomPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('puffshroom', row, col, x, y, entityLayer);
        this.shootTimer = 0.5;
        this.range = this.config.range || 300;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        this.shootTimer += dt;
        let interval = this.config.attackInterval || 1.425;
        if (engine.isSuperCharge) interval *= 0.65;

        if (this.shootTimer >= interval) {
            const hasZombieAhead = engine.zombies.some(z =>
                z.row === this.row && !z.isDead && !z.isHypnotized && !isUntargetableBungee(z) && z.x >= this.x && z.x <= (this.x + this.range)
            );
            if (hasZombieAhead) {
                this.shootTimer = 0;
                engine.projectiles.push(
                    new Projectile(this.row, this.x + 14, this.y + 23, 'shroom', this.config.damage, false, this.range)
                );
                soundEngine.playShoot();
            }
        }
    }
}

// 阳光菇 (25阳光，由幼体小蘑菇 120 秒成长为大蘑菇)
export class SunshroomPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('sunshroom', row, col, x, y, entityLayer);
        this.sunTimer = 0;
        this.growTimer = 0;
        this.isGrown = false;
        this.hasProducedFirstSun = false;
    }

    wakeUp(engine) {
        super.wakeUp(engine);
        if (!this.isAsleep && this.isGrown) {
            this.setAnim(this.config.bigAnim || 'assets/plants/sunshroom_big.gif');
        }
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;

        // 120秒原版成长机制：从小阳光菇长大为大阳光菇
        if (!this.isGrown) {
            this.growTimer += dt;
            if (this.growTimer >= (this.config.growTime || 120.0)) {
                this.isGrown = true;
                this.setAnim(this.config.bigAnim || 'assets/plants/sunshroom_big.gif');
                engine.floatingTexts.push(new FloatingText(this.x, this.y - 35, '✨ 阳光菇长大了!', '#f1c40f', 18));
            }
        }

        this.sunTimer += dt;
        const interval = this.hasProducedFirstSun ? 24.0 : 7.0;
        if (this.sunTimer >= interval) {
            this.sunTimer = 0;
            this.hasProducedFirstSun = true;
            const sunVal = this.isGrown ? 25 : 15;
            const sunX = this.x + (Math.random() * 16 - 8);
            const sunY = this.y - 10;
            const targetY = this.y + 22;
            const sun = new SunEntity(sunX, sunY, targetY, sunVal, false, engine.sunLayer, engine);
            engine.suns.push(sun);
            soundEngine.playSun();
        }
    }
}

// 大喷菇 (75阳光，喷口前伸喷射 8 帧穿透性孢子气泡流)
export class FumeshroomPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('fumeshroom', row, col, x, y, entityLayer);
        this.shootTimer = 0.5;
        this.attackAnimTimer = 0;
        this.range = this.config.range || 340;
    }

    createDOM(container) {
        super.createDOM(container);
        if (this.domElement) {
            this.domElement.style.width = '90px';
            this.domElement.style.height = '82px';
            this.domElement.style.left = `${this.x - 42}px`;
            this.domElement.style.top = `${this.y - 49}px`;
        }
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;

        if (this.attackAnimTimer > 0) {
            this.attackAnimTimer -= dt;
            if (this.attackAnimTimer <= 0) {
                this.setAnim(this.config.anim);
            }
        }

        this.shootTimer += dt;
        let interval = this.config.attackInterval || 1.425;
        if (engine.isSuperCharge) interval *= 0.65;

        if (this.shootTimer >= interval) {
            const hasZombieAhead = engine.zombies.some(z =>
                z.row === this.row && !z.isDead && !z.isHypnotized && !isUntargetableBungee(z) && z.x >= this.x - 20 && z.x <= (this.x + this.range)
            );
            if (hasZombieAhead) {
                this.shootTimer = 0;
                this.attackAnimTimer = 0.54;
                this.setAnim(this.config.attackAnim || 'assets/plants/fumeshroom_attack.gif');
                engine.projectiles.push(
                    new FumeCloud(this.row, this.x + 28, this.y - 10, this.range, this.config.damage)
                );
                soundEngine.playShoot();
            }
        }
    }
}

// 墓碑吞噬者 (种在墓碑上吞噬)
export class GraveBusterPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('gravebuster', row, col, x, y, entityLayer);
        this.chewTimer = 0;
        this.chewTime = this.config.chewTime || 4.5;
        this.chipTimer = 0;
    }

    createDOM(container) {
        super.createDOM(container);
        if (this.domElement) {
            this.domElement.style.width = '78px';
            this.domElement.style.height = '88px';
            this.domElement.style.left = `${this.x - 39}px`;
            this.domElement.style.top = `${this.y - 42}px`;
            this.domElement.style.zIndex = '12';
        }
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        this.chewTimer += dt;
        this.chipTimer += dt;

        // 持续啃咬震动与碎石飞溅音效
        if (this.chipTimer >= 0.35) {
            this.chipTimer = 0;
            soundEngine.playBite();
            if (this.domElement) {
                this.domElement.style.transform = `scale(${1 + (Math.random() - 0.5) * 0.08}) translate(${(Math.random() - 0.5) * 4}px, ${(Math.random() - 0.5) * 4}px)`;
            }
            if (engine.hitSplats) {
                engine.hitSplats.push(new HitSplat(this.x + (Math.random() - 0.5) * 30, this.y + (Math.random() - 0.5) * 20, 'stone'));
            }
        }

        if (this.chewTimer >= this.chewTime) {
            this.destroy();
            if (engine.removeTombstone) {
                engine.removeTombstone(this.row, this.col);
            }
            // 掉落 25 阳光
            const sun = new SunEntity(this.x, this.y - 15, this.y + 20, 25, false, engine.sunLayer, engine);
            engine.suns.push(sun);
            soundEngine.playSun();
            engine.floatingTexts.push(new FloatingText(this.x, this.y - 20, '🪦 墓碑破除! +25 ☀️', '#2ecc71', 20));
        }
    }
}

// 魅惑菇 (被啃食后使僵尸倒戈；睡眠状态下被啃食不触发魅惑)
export class HypnoshroomPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('hypnoshroom', row, col, x, y, entityLayer);
    }

    takeDamage(amount, attacker = null) {
        if (!this.isAsleep && attacker && typeof attacker.hypnotize === 'function') {
            attacker.hypnotize();
            this.destroy();
            return;
        }
        super.takeDamage(amount, attacker);
    }
}

// 胆小菇 (远距射击，僵尸接近则抱头缩地)
export class ScaredyshroomPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('scaredyshroom', row, col, x, y, entityLayer);
        this.shootTimer = 0.5;
        this.isScared = false;
        this.scaredDistance = this.config.scaredDistance || 130;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;

        // 检测是否有敌方僵尸靠近 (前后 130px 范围，包含上下相邻行)
        const nearbyZombie = engine.zombies.some(z =>
            !z.isDead && !z.isHypnotized && !isUntargetableBungee(z) &&
            Math.abs(z.row - this.row) <= 1 &&
            Math.abs(z.x - this.x) <= this.scaredDistance
        );

        if (nearbyZombie) {
            if (!this.isScared) {
                this.isScared = true;
                this.setAnim(this.config.hideAnim || 'assets/plants/scaredyshroom_hide.gif');
            }
            return;
        } else {
            if (this.isScared) {
                this.isScared = false;
                this.setAnim(this.config.anim);
            }
        }

        this.shootTimer += dt;
        let interval = this.config.attackInterval || 1.425;
        if (engine.isSuperCharge) interval *= 0.65;

        if (this.shootTimer >= interval) {
            const hasZombieAhead = engine.zombies.some(z =>
                z.row === this.row && !z.isDead && !z.isHypnotized && !isUntargetableBungee(z) && z.x >= this.x && z.x <= 900
            );
            if (hasZombieAhead) {
                this.shootTimer = 0;
                engine.projectiles.push(
                    new Projectile(this.row, this.x + 22, this.y + 4, 'shroom', this.config.damage, false, 960)
                );
                soundEngine.playShoot();
            }
        }
    }
}

// 寒冰菇 (全场极冻与减速)
export class IceshroomPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('iceshroom', row, col, x, y, entityLayer);
        this.fuseTimer = 0;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        this.fuseTimer += dt;
        if (this.fuseTimer >= 0.5) {
            this.freezeAll(engine);
            this.destroy();
        }
    }

    freezeAll(engine) {
        engine.floatingTexts.push(new FloatingText(450, 200, '❄️ 全场极度深寒！', '#3498db', 32));
        soundEngine.playSplat();
        engine.explosions.push(new ExplosionEffect(this.x, this.y, 'ice'));
        engine.zombies.forEach(z => {
            if (!z.isDead) {
                z.takeDamage(20);
                if (typeof z.applyFreeze === 'function') {
                    z.applyFreeze(4.0, 10.0);
                } else {
                    z.slowTimer = 10.0;
                    z.isSlowed = true;
                }
            }
        });
    }
}

// 毁灭菇 (超广域核爆，1800伤害)
export class DoomshroomPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('doomshroom', row, col, x, y, entityLayer);
        this.fuseTimer = 0;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        this.fuseTimer += dt;
        if (this.fuseTimer >= 0.8) {
            this.nuke(engine);
            this.destroy();
        }
    }

    nuke(engine) {
        soundEngine.playBoom();
        soundEngine.playThunder();
        engine.explosions.push(new ExplosionEffect(this.x, this.y, 'doom'));

        // 留下毁灭菇弹坑 (原版阻碍该格子种植 180 秒)
        if (!engine.craters) engine.craters = [];
        engine.craters.push({
            row: this.row,
            col: this.col,
            x: this.x,
            y: this.y,
            maxLifespan: 180.0,
            lifespan: 180.0
        });

        const dmg = this.config.damage || 1800;
        engine.zombies.forEach(z => {
            if (!z.isDead) {
                const rowDiff = Math.abs(z.row - this.row);
                const colDiff = Math.abs(z.x - this.x) / engine.cellW;
                if (rowDiff <= 3 && colDiff <= 4.5) {
                    if (z.blastDie) {
                        z.blastDie();
                    } else {
                        z.takeDamage(dmg);
                    }
                }
            }
        });
    }
}

// 咖啡豆 (唤醒睡眠植物)
export class CoffeeBeanPlant extends Plant {
    constructor(row, col, x, y, entityLayer, targetPlant = null) {
        super('coffeebean', row, col, x, y, entityLayer);
        this.targetPlant = targetPlant;
        this.timer = 0;
        this.hasWoken = false;
        if (this.config.eatAnim) {
            this.setAnim(this.config.eatAnim);
        }
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;
        this.timer += dt;
        if (!this.hasWoken && this.timer >= 0.4) {
            this.hasWoken = true;
            if (this.targetPlant && !this.targetPlant.isDead) {
                this.targetPlant.wakeUp(engine);
            }
        }
        if (this.timer >= 0.9) {
            this.destroy();
        }
    }
}

// 睡莲 (水生承载底座)
export class LilyPadPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('lilypad', row, col, x, y, entityLayer);
        this.carriedPlant = null;
        this.isAquatic = true;
    }

    createDOM(container) {
        super.createDOM(container);
        if (this.domElement) {
            this.domElement.style.width = '82px';
            this.domElement.style.height = '56px';
            this.domElement.style.left = `${this.x - 41}px`;
            this.domElement.style.top = `${this.y - 14}px`; // 稳稳漂浮在水波中央
            this.domElement.style.zIndex = '5'; // 始终处于底座层
        }
    }

    destroy() {
        if (this.carriedPlant && !this.carriedPlant.isDead) {
            this.carriedPlant.destroy();
            this.carriedPlant = null;
        }
        super.destroy();
    }
}

// 窝瓜 (泰山压顶)
export class SquashPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('squash', row, col, x, y, entityLayer);
        this.state = 'idle'; // 'idle' | 'aiming' | 'jumping' | 'smashing'
        this.targetZombie = null;
        this.timer = 0;
        this.jumpTargetX = this.x;
        this.jumpStartY = this.y;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;

        if (this.state === 'idle') {
            // 索敌：同航道前方 1.5 格内，或后方 0.8 格内（等待蹦极僵尸垂降落地附近 >= -90px 后再起跳压扁）
            const cellW = engine.cellW || 82;
            const target = engine.zombies.find(z => 
                z.row === this.row && !z.isDead && !z.isDying && !z.isHypnotized &&
                !z.isFlying && !isUntargetableBungee(z) && !(z.type === 'bungee' && z.bungeeOffsetY < -90) &&
                (z.x >= this.x - cellW * 0.8 && z.x <= this.x + cellW * 1.5)
            );
            if (target) {
                this.targetZombie = target;
                this.state = 'aiming';
                this.timer = 0.35; // 怒目注视蓄力 0.35秒
                this.jumpTargetX = target.x;
                if (target.x < this.x && this.domElement) {
                    this.domElement.style.transform = 'scaleX(-1)';
                }
            }
        } else if (this.state === 'aiming') {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.state = 'jumping';
                this.timer = 0.45; // 腾空跃起
                this.setAnim(this.config.attackAnim || 'assets/plants/squash_attack.gif');
                if (this.targetZombie && !this.targetZombie.isDead) {
                    this.jumpTargetX = this.targetZombie.x;
                }
            }
        } else if (this.state === 'jumping') {
            this.timer -= dt;
            const progress = 1 - Math.max(0, this.timer) / 0.45;
            const curX = this.x + (this.jumpTargetX - this.x) * progress;
            const curY = this.jumpStartY - Math.sin(progress * Math.PI) * 70;
            if (this.domElement) {
                this.domElement.style.left = `${curX - 38}px`;
                this.domElement.style.top = `${curY - 48}px`;
            }

            if (this.timer <= 0) {
                this.state = 'smashing';
                this.smash(engine, curX);
            }
        }
    }

    smash(engine, impactX) {
        soundEngine.playSplat();
        soundEngine.playGroan();
        engine.floatingTexts.push(new FloatingText(impactX, this.y - 40, '💥 泰山压顶!', '#27ae60', 26));

        // 压扁周围 65px 范围内的所有地面僵尸 (原版碾压倒地，不误伤高空飞行的气球或云端蹦极)
        engine.zombies.forEach(z => {
            if (
                z.row === this.row && !z.isDead && !z.isDying && !z.isHypnotized &&
                !z.isFlying && !(z.type === 'bungee' && (z.bungeePhase === 'init' || z.bungeePhase === 'targeting' || z.bungeeOffsetY < -85)) &&
                Math.abs(z.x - impactX) <= 65
            ) {
                if (typeof z.mowerDie === 'function') {
                    z.mowerDie();
                } else {
                    z.die();
                }
            }
        });

        setTimeout(() => {
            this.destroy();
        }, 300);
    }
}

// 三线射手 (三路连珠火力)
export class ThreepeaterPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('threepeater', row, col, x, y, entityLayer);
        this.attackTimer = 0;
        this.attackInterval = this.config.attackInterval || 1.425;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;

        this.attackTimer += dt;
        const currentInterval = (engine.isSuperCharge || this.isSuperGatling) ? this.attackInterval * 0.6 : this.attackInterval;

        if (this.attackTimer >= currentInterval) {
            // 检测自身行以及上下两行是否有僵尸
            const targetRows = [this.row - 1, this.row, this.row + 1].filter(r => r >= 0 && r < engine.rows && engine.levelConfig.activeRows.includes(r));
            const hasEnemy = engine.zombies.some(z => 
                targetRows.includes(z.row) && !z.isDead && !z.isHypnotized && !isUntargetableBungee(z) && z.x > this.x && z.x < 960
            );

            if (hasEnemy) {
                this.attackTimer = 0;
                this.shootPeas(engine, targetRows);
            }
        }
    }

    shootPeas(engine, targetRows) {
        soundEngine.playShoot();
        targetRows.forEach(r => {
            const slopeY = (engine && typeof engine.getSurfaceOffsetY === 'function') ? engine.getSurfaceOffsetY(this.x) : 0;
            const bulletY = engine.gridStartY + r * engine.cellH + engine.cellH / 2 + slopeY - 8;
            engine.projectiles.push(
                new Projectile(r, this.x + 28, bulletY, 'pea', this.config.damage || 20)
            );
        });
    }
}

// 火爆辣椒 (整行烈火净化)
export class JalapenoPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('jalapeno', row, col, x, y, entityLayer);
        this.fuseTimer = 0;
        this.fuseTime = this.config.fuseTime || 0.9;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;

        this.fuseTimer += dt;
        const progress = this.fuseTimer / this.fuseTime;
        const scale = 1.0 + progress * 0.35;
        const shake = (Math.random() - 0.5) * progress * 8;
        if (this.domElement) {
            this.domElement.style.transform = `scale(${scale}) translate(${shake}px, 0)`;
        }

        if (this.fuseTimer >= this.fuseTime) {
            this.burnRow(engine);
        }
    }

    burnRow(engine) {
        this.destroy();
        soundEngine.playExplosion();
        soundEngine.playThunder();
        engine.floatingTexts.push(new FloatingText(450, this.y - 30, '🔥 烈焰燎原！整行净化！', '#e74c3c', 28));

        // 烈焰动画条
        engine.explosions.push(new JalapenoFireLine(this.row, this.y));

        // 消灭整行僵尸并化为灰烬
        engine.zombies.forEach(z => {
            if (z.row === this.row && !z.isDead) {
                if (z.blastDie) {
                    z.blastDie();
                } else {
                    z.takeDamage(this.config.damage || 1800);
                }
            }
        });
    }
}

// 火炬树桩 (引燃豌豆翻倍伤害)
export class TorchwoodPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('torchwood', row, col, x, y, entityLayer);
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;

        // 检查穿过自身的普通豌豆，将其点燃为双倍伤害的火球
        engine.projectiles.forEach(p => {
            if (!p.isDead && p.row === this.row && !p.isFire && (p.type === 'pea' || p.type === 'snow_pea')) {
                if (p.x >= this.x - 22 && p.x <= this.x + 36) {
                    p.type = 'fire_pea';
                    p.isFire = true;
                    p.damage *= 2;
                    p.anim = 'assets/projectiles/fire_pea.gif';
                    p.isSlow = false; // 烈焰破冰
                }
            }
        });
    }
}

// 高坚果 (8000超高耐久且拦截撑杆跳)
export class TallnutPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('tallnut', row, col, x, y, entityLayer);
        this.isTall = true;
    }

    createDOM(container) {
        super.createDOM(container);
        if (this.domElement) {
            this.domElement.style.top = `${this.y - 68}px`;
            this.domElement.style.height = '118px';
        }
    }

    takeDamage(amount, attacker) {
        super.takeDamage(amount, attacker);
        this.checkCrackState();
    }

    checkCrackState() {
        if (this.isDead) return;
        if (this.hp <= this.config.crackThreshold2) {
            this.setAnim(this.config.crack2Anim);
        } else if (this.hp <= this.config.crackThreshold1) {
            this.setAnim(this.config.crack1Anim);
        } else {
            this.setAnim(this.config.anim);
        }
    }

    update(dt, engine) {
        super.update(dt, engine);
        this.checkCrackState();
    }
}

// 海蘑菇 (0阳光水生蘑菇)
export class SeaShroomPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('seashroom', row, col, x, y, entityLayer);
        this.isAquatic = true;
        this.attackTimer = 0;
        this.range = this.config.range || 300;
        this.attackInterval = this.config.attackInterval || 1.425;
    }

    createDOM(container) {
        super.createDOM(container);
        if (this.domElement) {
            this.domElement.style.top = `${this.y - 28}px`; // 水生植物贴近水面
        }
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        this.attackTimer += dt;
        const currentInterval = (engine.isSuperCharge || this.isSuperGatling) ? this.attackInterval * 0.6 : this.attackInterval;
        if (this.attackTimer >= currentInterval) {
            const enemy = engine.zombies.find(z => 
                z.row === this.row && !z.isDead && !z.isHypnotized && !isUntargetableBungee(z) && z.x > this.x && (z.x - this.x) <= this.range
            );
            if (enemy) {
                this.attackTimer = 0;
                soundEngine.playShoot();
                engine.projectiles.push(
                    new Projectile(this.row, this.x + 20, this.y - 8, 'shroom', this.config.damage || 20, false, this.range)
                );
            }
        }
    }
}

// 杨桃 / 星星果 (五向飞星)
export class StarfruitPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('starfruit', row, col, x, y, entityLayer);
        this.attackTimer = 0;
        this.attackInterval = this.config.attackInterval || 1.425;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        this.attackTimer += dt;
        const currentInterval = (engine.isSuperCharge || this.isSuperGatling) ? this.attackInterval * 0.6 : this.attackInterval;
        if (this.attackTimer >= currentInterval) {
            const hasEnemy = engine.zombies.some(z => !z.isDead && !z.isHypnotized && !isUntargetableBungee(z));
            if (hasEnemy) {
                this.attackTimer = 0;
                soundEngine.playShoot();
                const spd = 360;
                const starConfigs = [
                    { vx: spd, vy: 0 },
                    { vx: -spd, vy: 0 },
                    { vx: 0, vy: -spd },
                    { vx: 0, vy: spd },
                    { vx: -spd * 0.75, vy: -spd * 0.65 }
                ];
                starConfigs.forEach(cfg => {
                    engine.projectiles.push(
                        new StarProjectile(this.x, this.y, cfg.vx, cfg.vy, this.config.damage || 20)
                    );
                });
            }
        }
    }
}

// 南瓜头 (套在植物外层的坚实铠甲)
export class PumpkinPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('pumpkin', row, col, x, y, entityLayer);
        this.isPumpkin = true;
        this.isPumpkinShell = true;
        this.protectedPlant = null;
    }

    createDOM(container) {
        super.createDOM(container);
        if (this.domElement) {
            this.domElement.style.width = '86px';
            this.domElement.style.height = '82px';
            this.domElement.style.left = `${this.x - 43}px`;
            this.domElement.style.top = `${this.y - 45}px`;
            this.domElement.style.zIndex = '18'; // 罩在植物外层
        }
    }

    takeDamage(amount, attacker) {
        super.takeDamage(amount, attacker);
        this.checkCrackState();
    }

    checkCrackState() {
        if (this.isDead) return;
        if (this.hp <= this.config.crackThreshold2) {
            this.setAnim(this.config.crack2Anim || 'assets/plants/pumpkin_cracked2.gif');
        } else if (this.hp <= this.config.crackThreshold1) {
            this.setAnim(this.config.crack1Anim || 'assets/plants/pumpkin_cracked1.gif');
        } else {
            this.setAnim(this.config.anim);
        }
    }

    destroy() {
        if (this.protectedPlant) {
            this.protectedPlant.pumpkin = null;
            this.protectedPlant = null;
        }
        super.destroy();
    }
}

// 磁力菇 (吸走铁质防具：铁桶、铁门、橄榄球盔、小丑盒、矿工镐、跳跳杆、金属梯)
export class MagnetShroomPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('magnetshroom', row, col, x, y, entityLayer);
        this.coolDownTimer = 0;
        this.attractInterval = 12.0;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        if (this.coolDownTimer > 0) {
            this.coolDownTimer -= dt;
            if (this.coolDownTimer <= 0) {
                this.coolDownTimer = 0;
                this.setAnim(this.config.anim);
            }
            return;
        }

        const metalShieldTypes = ['bucket', 'screendoor', 'football', 'jackbox', 'pickaxe', 'pogo', 'ladder'];
        const metalZombies = engine.zombies.filter(z =>
            !z.isDead && !z.isHypnotized && z.hasShield &&
            metalShieldTypes.includes(z.shieldType) &&
            Math.hypot(z.x - this.x, z.y - this.y) <= 360
        );

        if (metalZombies.length > 0) {
            metalZombies.sort((a, b) => Math.hypot(a.x - this.x, a.y - this.y) - Math.hypot(b.x - this.x, b.y - this.y));
            const target = metalZombies[0];
            target.breakShieldInstantly(engine);
            this.coolDownTimer = this.attractInterval;
            if (this.config.cooldownAnim) {
                this.setAnim(this.config.cooldownAnim);
            }
            soundEngine.playSplat();
            soundEngine.playThunder();
            engine.floatingTexts.push(new FloatingText(this.x, this.y - 35, '🧲 磁力吸走金属装备!', '#e74c3c', 19));
        }
    }
}

// 三叶草 (吹散浓雾 + 吹飞全场气球僵尸)
export class BloverPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('blover', row, col, x, y, entityLayer);
        this.timer = 0;
        this.blown = false;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;
        this.timer += dt;
        if (this.timer >= 0.35 && !this.blown) {
            this.blown = true;
            if (typeof engine.blowFogAway === 'function') {
                engine.blowFogAway(24.0);
            } else {
                engine.fogClearTimer = 24.0;
            }
            let blownCount = 0;
            engine.zombies.forEach(z => {
                if (!z.isDead && z.isFlying && typeof z.blowAway === 'function') {
                    z.blowAway(engine);
                    blownCount++;
                }
            });
            soundEngine.playShoot();
            const msg = blownCount > 0
                ? `💨 狂风吹飞 ${blownCount} 只气球僵尸！`
                : '💨 狂风大作！浓雾消散！';
            engine.floatingTexts.push(new FloatingText(this.x, this.y - 35, msg, '#2ecc71', 22));
        }
        if (this.timer >= 1.5) {
            this.destroy();
        }
    }
}

// 地刺 (平铺地面刺伤经过的僵尸，一击扎爆冰车与投石车轮胎)
export class SpikeweedPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('spikeweed', row, col, x, y, entityLayer);
        this.isFlat = true;
        this.attackTimer = 0.5;
        this.attackInterval = this.config.attackInterval || 0.7;
    }

    createDOM(container) {
        super.createDOM(container);
        if (this.domElement) {
            this.domElement.style.width = '82px';
            this.domElement.style.height = '36px';
            this.domElement.style.left = `${this.x - 41}px`;
            this.domElement.style.top = `${this.y + 4}px`;
            this.domElement.style.zIndex = '5';
        }
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;

        // 检测是否有冰车或投石车碾过：立即扎爆轮胎并同归于尽
        const vehicle = engine.zombies.find(z =>
            z.row === this.row && !z.isDead && !z.isDying && z.isVehicle && Math.abs(z.x - this.x) <= 44
        );
        if (vehicle) {
            soundEngine.playBoom();
            engine.explosions.push(new ExplosionEffect(vehicle.x, vehicle.y - 10, 'cherry'));
            engine.floatingTexts.push(new FloatingText(this.x, this.y - 32, '🛞 地刺扎爆轮胎!', '#e67e22', 22));
            vehicle.takeDamage(9999);
            this.destroy();
            return;
        }

        this.attackTimer += dt;
        if (this.attackTimer >= this.attackInterval) {
            let hitAny = false;
            engine.zombies.forEach(z => {
                if (
                    z.row === this.row && !z.isDead && !z.isHypnotized &&
                    !z.isFlying && !(z.type === 'digger' && z.diggerPhase === 'digging') &&
                    z.type !== 'bungee' &&
                    Math.abs(z.x - this.x) <= 38
                ) {
                    z.takeDamage(this.config.damage || 20);
                    hitAny = true;
                }
            });
            if (hitAny) {
                this.attackTimer = 0;
                soundEngine.playSplat();
            }
        }
    }
}

// 路灯花 (照亮浓雾视野，揭开右侧迷雾)
export class PlanternPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('plantern', row, col, x, y, entityLayer);
        this.isLightSource = true;
        this.lightRadius = this.config.lightRadius || 205;
    }
}

// 仙人掌 (发射尖刺，遇到气球僵尸时伸长身躯一刺击破气球)
export class CactusPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('cactus', row, col, x, y, entityLayer);
        this.shootTimer = 0.5;
        this.isStretched = false;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;

        const balloonAhead = engine.zombies.find(z =>
            z.row === this.row && !z.isDead && !z.isHypnotized && z.isFlying && z.x >= this.x - 10 && z.x <= 910
        );
        if (balloonAhead && !this.isStretched) {
            this.isStretched = true;
            if (this.domElement) {
                this.domElement.style.transformOrigin = 'bottom center';
                this.domElement.style.transform = 'scaleY(1.24)';
            }
        } else if (!balloonAhead && this.isStretched) {
            this.isStretched = false;
            if (this.domElement) {
                this.domElement.style.transform = '';
            }
        }

        this.shootTimer += dt;
        let interval = this.config.attackInterval || 1.425;
        if (engine.isSuperCharge || this.isSuperGatling) interval *= 0.6;

        if (this.shootTimer >= interval) {
            const hasEnemyAhead = balloonAhead || engine.zombies.some(z =>
                z.row === this.row && !z.isDead && !z.isHypnotized && !isUntargetableBungee(z) &&
                !(z.type === 'digger' && z.diggerPhase === 'digging') &&
                z.x >= this.x && z.x <= 900
            );
            if (hasEnemyAhead) {
                this.shootTimer = 0;
                const bulletY = balloonAhead ? (this.y - 36) : (this.y - 14);
                const p = new Projectile(this.row, this.x + 28, bulletY, 'thorn', this.config.damage || 20, false);
                p.canHitFlying = true;
                engine.projectiles.push(p);
                soundEngine.playShoot();
            }
        }
    }
}

// 裂荚射手 (前向单发豌豆 + 后向双连发豌豆，矿工僵尸克星)
export class SplitPeaPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('splitpea', row, col, x, y, entityLayer);
        this.shootTimer = 0.5;
        this.rearSubShotPending = false;
        this.rearSubShotDelay = 0;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;

        if (this.rearSubShotPending) {
            this.rearSubShotDelay -= dt;
            if (this.rearSubShotDelay <= 0) {
                this.rearSubShotPending = false;
                engine.projectiles.push(
                    new Projectile(this.row, this.x - 26, this.y - 14, 'pea', this.config.damage || 20, false, 960, -360)
                );
                soundEngine.playShoot();
            }
        }

        this.shootTimer += dt;
        let interval = this.config.attackInterval || 1.425;
        if (engine.isSuperCharge || this.isSuperGatling) interval *= 0.6;

        if (this.shootTimer >= interval) {
            const hasFront = engine.zombies.some(z =>
                z.row === this.row && !z.isDead && !z.isHypnotized && !z.isFlying && !isUntargetableBungee(z) &&
                !(z.type === 'digger' && z.diggerPhase === 'digging') &&
                z.x >= this.x && z.x <= 900
            );
            const hasRear = engine.zombies.some(z =>
                z.row === this.row && !z.isDead && !z.isHypnotized && !z.isFlying && !isUntargetableBungee(z) &&
                !(z.type === 'digger' && z.diggerPhase === 'digging') &&
                z.x < this.x && z.x >= 0
            );

            if (hasFront || hasRear) {
                this.shootTimer = 0;
                if (hasFront) {
                    engine.projectiles.push(
                        new Projectile(this.row, this.x + 28, this.y - 14, 'pea', this.config.damage || 20, false, 960, 360)
                    );
                }
                if (hasRear) {
                    engine.projectiles.push(
                        new Projectile(this.row, this.x - 26, this.y - 14, 'pea', this.config.damage || 20, false, 960, -360)
                    );
                    this.rearSubShotPending = true;
                    this.rearSubShotDelay = 0.18;
                }
                soundEngine.playShoot();
            }
        }
    }
}

// 抛投类植物通用基类 (还原原版投篮臂蓄力甩出动作、花盆抬升发射点与无视死亡尸体的精准索敌)
class CatapultBasePlant extends Plant {
    constructor(type, row, col, x, y, entityLayer) {
        super(type, row, col, x, y, entityLayer);
        this.attackInterval = this.config.attackInterval || 2.85;
        this.attackTimer = this.attackInterval * 0.62; // 落地后约 1.1s 即可完成首轮投射，告别漫长空等
        this.windupTimer = 0;
        this.animResetTimer = 0;
        this.pendingTarget = null;
        this.pendingType = 'cabbage';
        this.pendingDamage = this.config.damage || 40;
    }

    findLobTarget(engine) {
        const candidates = engine.zombies.filter(z =>
            z.row === this.row && !z.isDead && !z.isDying && !z.isHypnotized && !z.isFlying &&
            !(z.type === 'digger' && z.diggerPhase === 'digging') && !isUntargetableBungee(z) &&
            z.x >= this.x - 14 && z.x < 915
        );
        if (candidates.length === 0) return null;
        candidates.sort((a, b) => a.x - b.x);
        return candidates[0];
    }

    chooseShotSpec() {
        return { pType: 'cabbage', pDmg: this.config.damage || 40 };
    }

    triggerAttackAnim() {
        if (this.config.attackAnim) {
            this.currentAnim = this.config.attackAnim;
            if (this.domImg) {
                this.domImg.src = this.config.attackAnim;
            }
            this.animResetTimer = 0.78;
        }
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;

        if (this.animResetTimer > 0) {
            this.animResetTimer -= dt;
            if (this.animResetTimer <= 0) {
                this.setAnim(this.config.anim);
            }
        }

        // 投臂蓄力甩出瞬间释放高抛投掷物 (与 *_attack.gif 甩臂帧严丝合缝同步)
        if (this.windupTimer > 0) {
            this.windupTimer -= dt;
            if (this.windupTimer <= 0) {
                let target = this.pendingTarget;
                if (!target || target.isDead || target.isDying || isUntargetableBungee(target)) {
                    target = this.findLobTarget(engine);
                }
                if (target) {
                    const liftY = (this.hostPot || this.hostLilypad) ? 44 : 30;
                    const offsetX = (this.type === 'melonpult' || this.type === 'wintermelon') ? 18 : 14;
                    soundEngine.playShoot();
                    engine.projectiles.push(
                        new LobbedProjectile(this.row, this.x + offsetX, this.y - liftY, target, this.pendingType, this.pendingDamage)
                    );
                }
                this.pendingTarget = null;
            }
            return;
        }

        this.attackTimer += dt;
        const currentInterval = (engine.isSuperCharge || this.isSuperGatling) ? this.attackInterval * 0.5 : this.attackInterval;
        if (this.attackTimer >= currentInterval) {
            const enemy = this.findLobTarget(engine);
            if (enemy) {
                this.attackTimer = 0;
                const spec = this.chooseShotSpec();
                this.pendingTarget = enemy;
                this.pendingType = spec.pType;
                this.pendingDamage = spec.pDmg;
                this.windupTimer = 0.22;
                this.triggerAttackAnim();
            }
        }
    }
}

// 卷心菜投手 (抛物线越过屋顶与潜水限制)
export class CabbagePultPlant extends CatapultBasePlant {
    constructor(row, col, x, y, entityLayer) {
        super('cabbagepult', row, col, x, y, entityLayer);
    }

    chooseShotSpec() {
        return { pType: 'cabbage', pDmg: this.config.damage || 40 };
    }
}

// 花盆 (屋顶种植底座)
export class FlowerPotPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('flowerpot', row, col, x, y, entityLayer);
        this.isPot = true;
        this.carriedPlant = null;
    }

    createDOM(container) {
        super.createDOM(container);
        if (this.domElement) {
            this.domElement.style.width = '82px';
            this.domElement.style.height = '62px';
            this.domElement.style.left = `${this.x - 41}px`;
            this.domElement.style.top = `${this.y - 22}px`;
            this.domElement.style.zIndex = '5';
        }
    }

    destroy() {
        if (this.carriedPlant && !this.carriedPlant.isDead) {
            this.carriedPlant.destroy();
            this.carriedPlant = null;
        }
        super.destroy();
    }
}

// 玉米投手 (玉米+黄油定身)
export class KernelPultPlant extends CatapultBasePlant {
    constructor(row, col, x, y, entityLayer) {
        super('kernelpult', row, col, x, y, entityLayer);
    }

    chooseShotSpec() {
        const isButter = Math.random() < 0.28;
        return {
            pType: isButter ? 'butter' : 'corn',
            pDmg: isButter ? 40 : (this.config.damage || 20)
        };
    }
}

// 大蒜 (辛辣驱敌换道)
export class GarlicPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('garlic', row, col, x, y, entityLayer);
    }

    takeDamage(amount, attacker) {
        super.takeDamage(amount, attacker);
        if (attacker && !attacker.isDead && !attacker.isDying && !attacker.isVehicle) {
            attacker.biteTimer = 0;
            const engine = this.engine;
            const maxRow = engine ? (engine.rows - 1) : 4;
            const waterRows = (engine && engine.waterRows) ? engine.waterRows : [];
            const possibleRows = [attacker.row - 1, attacker.row + 1].filter(
                r => r >= 0 && r <= maxRow && !waterRows.includes(r)
            );
            if (possibleRows.length > 0) {
                attacker.row = possibleRows[Math.floor(Math.random() * possibleRows.length)];
                const slopeY = (engine && typeof engine.getSurfaceOffsetY === 'function') ? engine.getSurfaceOffsetY(attacker.x) : 0;
                attacker.y = attacker.gridStartY + attacker.row * attacker.cellH + attacker.cellH / 2 + slopeY;
                attacker.state = 'walk';
                soundEngine.playGroan();
            }
        }
    }
}

// 西瓜投手 (重击与3x3群伤溅射)
export class MelonPultPlant extends CatapultBasePlant {
    constructor(row, col, x, y, entityLayer) {
        super('melonpult', row, col, x, y, entityLayer);
    }

    chooseShotSpec() {
        return { pType: 'melon', pDmg: this.config.damage || 80 };
    }
}

// 缠绕水草 (泳池水生陷阱：瞬间把靠近的水中僵尸拽入水底秒杀)
export class TangleKelpPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('tanglekelp', row, col, x, y, entityLayer);
        this.grabbing = false;
        this.grabTimer = 0;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;
        if (this.grabbing) {
            this.grabTimer -= dt;
            if (this.grabTimer <= 0) {
                this.destroy();
            }
            return;
        }
        const target = engine.zombies.find(z =>
            z.row === this.row && !z.isDead && !z.isDying && !z.isHypnotized &&
            !z.isFlying && Math.abs(z.x - this.x) <= 44
        );
        if (target) {
            this.grabbing = true;
            this.grabTimer = 0.45;
            if (this.domImg) {
                this.domImg.src = 'assets/plants/tanglekelp_grab.png';
            }
            soundEngine.playSplat();
            if (engine.hitSplats) {
                engine.hitSplats.push(new HitSplat(target.x, target.y, 'snow'));
            }
            engine.floatingTexts.push(new FloatingText(this.x, this.y - 32, '🌿 水草缠绕拖入水底!', '#1abc9c', 20));
            target.destroy();
        }
    }
}

// 机枪射手 (无尽紫卡：4连发高速豌豆齐射)
export class GatlingPeaPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('gatlingpea', row, col, x, y, entityLayer);
        this.attackTimer = 0;
        this.attackInterval = this.config.attackInterval || 1.425;
        this.burstQueue = [];
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;
        this.attackTimer += dt;
        const currentInterval = (engine.isSuperCharge || this.isSuperGatling) ? this.attackInterval * 0.45 : this.attackInterval;

        for (let i = this.burstQueue.length - 1; i >= 0; i--) {
            this.burstQueue[i] -= dt;
            if (this.burstQueue[i] <= 0) {
                this.burstQueue.splice(i, 1);
                soundEngine.playShoot();
                engine.projectiles.push(new Projectile(this.row, this.x + 28, this.y - 14, 'pea', this.config.damage || 20));
            }
        }

        if (this.attackTimer >= currentInterval) {
            const hasTarget = engine.zombies.some(z =>
                z.row === this.row && !z.isDead && !z.isHypnotized && !z.isFlying && !isUntargetableBungee(z) &&
                !z.isSubmerged && !(z.type === 'digger' && z.diggerPhase === 'digging') &&
                z.x > this.x - 10 && z.x < 920
            );
            if (hasTarget) {
                this.attackTimer = 0;
                soundEngine.playShoot();
                engine.projectiles.push(new Projectile(this.row, this.x + 28, this.y - 14, 'pea', this.config.damage || 20));
                this.burstQueue.push(0.11, 0.22, 0.33);
            }
        }
    }
}

// 双子向日葵 (无尽紫卡：每次产出双份 25 阳光)
export class TwinSunflowerPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('twinsunflower', row, col, x, y, entityLayer);
        this.produceInterval = this.config.produceInterval || 24.0;
        this.produceTimer = this.produceInterval - 6.0;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;
        this.produceTimer += dt;
        if (this.produceTimer >= this.produceInterval) {
            this.produceTimer = 0;
            soundEngine.playSun();
            if (engine.sunLayer) {
                engine.suns.push(new SunEntity(this.x - 16, this.y - 18, this.y + 18, 25, false, engine.sunLayer, engine));
                engine.suns.push(new SunEntity(this.x + 18, this.y - 18, this.y + 18, 25, false, engine.sunLayer, engine));
            } else {
                engine.sun += 50;
            }
        }
    }
}

// 忧郁菇 (无尽紫卡：周围 3x3 八方向四连穿透孢子群伤)
export class GloomShroomPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('gloomshroom', row, col, x, y, entityLayer);
        this.isNocturnal = true;
        this.attackTimer = 0;
        this.attackInterval = this.config.attackInterval || 1.9;
        this.animResetTimer = 0;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        if (this.animResetTimer > 0) {
            this.animResetTimer -= dt;
            if (this.animResetTimer <= 0 && this.domImg) {
                this.domImg.src = this.config.anim;
            }
        }
        this.attackTimer += dt;
        const currentInterval = (engine.isSuperCharge || this.isSuperGatling) ? this.attackInterval * 0.5 : this.attackInterval;
        if (this.attackTimer >= currentInterval) {
            const targets = engine.zombies.filter(z =>
                !z.isDead && !z.isDying && !z.isHypnotized && !z.isFlying && !isUntargetableBungee(z) &&
                Math.abs(z.row - this.row) <= 1 && Math.abs(z.x - this.x) <= 135
            );
            if (targets.length > 0) {
                this.attackTimer = 0;
                this.animResetTimer = 0.45;
                if (this.domImg && this.config.attackAnim) {
                    this.domImg.src = this.config.attackAnim;
                }
                soundEngine.playFume();
                if (engine.projectiles) {
                    engine.projectiles.push(new FumeCloud(this.row, this.x - 95, this.y, 190, 0));
                }
                const dmg = this.config.damage || 80;
                targets.forEach(z => {
                    if (typeof z.takeFumeDamage === 'function') {
                        z.takeFumeDamage(dmg);
                    } else {
                        z.takeDamage(dmg);
                    }
                });
            }
        }
    }
}

// 地刺王 (无尽紫卡：双倍尖刺伤害，可连续扎爆 3 辆冰车/投石车)
export class SpikerockPlant extends SpikeweedPlant {
    constructor(row, col, x, y, entityLayer) {
        super(row, col, x, y, entityLayer);
        this.type = 'spikerock';
        this.config = GAME_CONFIG.plants.spikerock;
        this.hp = this.config.hp || 900;
        this.maxHp = this.hp;
        this.anim = this.config.anim;
        if (this.domImg) {
            this.domImg.src = this.anim;
        }
    }

    update(dt, engine) {
        Plant.prototype.update.call(this, dt, engine);
        if (this.isDead) return;

        const vehicle = engine.zombies.find(z =>
            z.row === this.row && !z.isDead && !z.isDying && z.isVehicle && Math.abs(z.x - this.x) <= 44
        );
        if (vehicle) {
            soundEngine.playBoom();
            engine.explosions.push(new ExplosionEffect(vehicle.x, vehicle.y - 10, 'cherry'));
            engine.floatingTexts.push(new FloatingText(this.x, this.y - 32, '🪨 地刺王扎爆巨轮!', '#f1c40f', 22));
            vehicle.takeDamage(9999);
            this.takeDamage(300);
            return;
        }

        this.attackTimer += dt;
        if (this.attackTimer >= this.attackInterval) {
            const victims = engine.zombies.filter(z =>
                z.row === this.row && !z.isDead && !z.isDying && !z.isHypnotized &&
                !z.isFlying && !(z.type === 'digger' && z.diggerPhase === 'digging') &&
                z.type !== 'bungee' &&
                Math.abs(z.x - this.x) <= 42
            );
            if (victims.length > 0) {
                this.attackTimer = 0;
                soundEngine.playSplat();
                victims.forEach(z => z.takeDamage(this.config.damage || 40));
            }
        }
    }
}

// 玉米加农炮 (Cob Cannon：占横向 2 格的终极重装神炮，点击炮身手动瞄准全屏任意位置发射 1800 伤害玉米洲际导弹)
export class CobCannonPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('cobcannon', row, col, x, y, entityLayer);
        this.isDoubleWide = true;
        this.colSpan = 2;
        this.isLoaded = true;
        this.reloadTime = this.config.reloadTime || 32.0;
        this.reloadTimer = 0;
        this.fireAnimTimer = 0;
        if (this.domElement) {
            this.domElement.classList.add('cob-ready');
        }
    }

    createDOM(container) {
        super.createDOM(container);
        if (this.domElement) {
            this.domElement.style.width = '156px';
            this.domElement.style.height = '112px';
            this.domElement.style.left = `${this.x - 38}px`;
            this.domElement.style.top = `${this.y - 64}px`;
            this.domElement.style.zIndex = '16';
            this.readyBadge = document.createElement('span');
            this.readyBadge.className = 'cob-ready-badge';
            this.readyBadge.innerText = '🎯 发射';
            this.domElement.appendChild(this.readyBadge);
        }
    }

    occupiesCell(row, col) {
        return this.row === row && (col === this.col || col === this.col + 1);
    }

    fireAt(targetX, targetY, engine) {
        if (!this.isLoaded || this.isDead) return false;
        this.isLoaded = false;
        this.reloadTimer = (engine && engine.isSuperCharge) ? this.reloadTime * 0.65 : this.reloadTime;
        this.fireAnimTimer = 0.44;
        this.setAnim(this.config.fireAnim || 'assets/plants/cobcannon_fire.gif');
        if (this.domElement) {
            this.domElement.classList.remove('cob-ready', 'cob-aiming');
        }
        soundEngine.playBoom();
        if (engine && engine.projectiles) {
            engine.projectiles.push(
                new CobRocketProjectile(this.x + 48, this.y - 36, targetX, targetY, this.config.damage || 1800)
            );
        }
        return true;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;

        if (this.fireAnimTimer > 0) {
            this.fireAnimTimer -= dt;
            if (this.fireAnimTimer <= 0 && !this.isLoaded) {
                this.setAnim(this.config.emptyAnim || 'assets/plants/cobcannon_empty.gif');
            }
        }

        if (!this.isLoaded) {
            const chargeMult = (engine && engine.isSuperCharge) ? 1.65 : 1.0;
            this.reloadTimer -= dt * chargeMult;
            if (this.reloadTimer <= 0) {
                this.reloadTimer = 0;
                this.isLoaded = true;
                this.setAnim(this.config.anim || 'assets/plants/cobcannon.gif');
                if (this.domElement) {
                    this.domElement.classList.add('cob-ready');
                }
                soundEngine.playPlant();
                if (engine && engine.floatingTexts) {
                    engine.floatingTexts.push(new FloatingText(this.x + 40, this.y - 48, '🌽 玉米大炮装填完毕!', '#2ecc71', 18));
                }
            }
        }
    }

    render(ctx) {
        super.render(ctx);
        if (this.isDead || this.isLoaded) return;
        const barW = 92;
        const barH = 6;
        const cx = this.x + 40;
        const pct = Math.max(0, Math.min(1, 1 - this.reloadTimer / this.reloadTime));
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(cx - barW / 2, this.y + 30, barW, barH);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(cx - barW / 2, this.y + 30, barW * pct, barH);
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - barW / 2, this.y + 30, barW, barH);
        ctx.restore();
    }
}

// 冰西瓜 (Winter Melon：80 重击 + 3x3 范围 26 溅射 + 10 秒群体冰减速)
export class WinterMelonPlant extends CatapultBasePlant {
    constructor(row, col, x, y, entityLayer) {
        super('wintermelon', row, col, x, y, entityLayer);
    }

    chooseShotSpec() {
        return { pType: 'winter_melon', pDmg: this.config.damage || 80 };
    }
}

// 香蒲 / 猫尾草 (Cattail：每次连发 2 枚全屏跨行追踪红刺，优先戳破气球僵尸)
export class CattailPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('cattail', row, col, x, y, entityLayer);
        this.attackInterval = this.config.attackInterval || 1.425;
        this.attackTimer = 0.6;
        this.secondSpikeTimer = -1;
        this.animResetTimer = 0;
    }

    findAnyLawnTarget(engine) {
        if (!engine || !engine.zombies) return null;
        const candidates = engine.zombies.filter(z =>
            !z.isDead && !z.isDying && !z.isHypnotized &&
            !(z.type === 'digger' && z.diggerPhase === 'digging') &&
            !(z.type === 'snorkel' && z.isSubmerged) &&
            !isUntargetableBungee(z) &&
            z.x >= -10 && z.x <= 920
        );
        if (candidates.length === 0) return null;
        candidates.sort((a, b) => {
            if (!!a.isFlying !== !!b.isFlying) return a.isFlying ? -1 : 1;
            return a.x - b.x;
        });
        return candidates[0];
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;

        if (this.animResetTimer > 0) {
            this.animResetTimer -= dt;
            if (this.animResetTimer <= 0) {
                this.setAnim(this.config.anim);
            }
        }

        if (this.secondSpikeTimer >= 0) {
            this.secondSpikeTimer -= dt;
            if (this.secondSpikeTimer <= 0) {
                this.secondSpikeTimer = -1;
                const t2 = this.findAnyLawnTarget(engine);
                if (t2) {
                    soundEngine.playShoot();
                    engine.projectiles.push(
                        new HomingSpikeProjectile(this.x + 12, this.y - 34, t2, this.config.damage || 20)
                    );
                }
            }
        }

        this.attackTimer += dt;
        const interval = (engine.isSuperCharge || this.isSuperGatling) ? this.attackInterval * 0.55 : this.attackInterval;
        if (this.attackTimer >= interval) {
            const target = this.findAnyLawnTarget(engine);
            if (target) {
                this.attackTimer = 0;
                this.secondSpikeTimer = 0.18;
                if (this.config.attackAnim) {
                    this.setAnim(this.config.attackAnim);
                    this.animResetTimer = 0.44;
                }
                soundEngine.playShoot();
                engine.projectiles.push(
                    new HomingSpikeProjectile(this.x + 12, this.y - 34, target, this.config.damage || 20)
                );
            }
        }
    }
}

// 叶子保护伞 (Umbrella Leaf：撑开弹性巨叶，自动弹飞 3x3 范围内的蹦极僵尸与投石车篮球)
export class UmbrellaLeafPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('umbrellaleaf', row, col, x, y, entityLayer);
        this.bounceAnimTimer = 0;
    }

    createDOM(container) {
        super.createDOM(container);
        if (this.domElement) {
            this.domElement.style.width = '92px';
            this.domElement.style.height = '88px';
            this.domElement.style.left = `${this.x - 46}px`;
            this.domElement.style.top = `${this.y - 52}px`;
        }
    }

    triggerBounce(engine) {
        this.bounceAnimTimer = 0.56;
        if (this.config.blockAnim) {
            this.setAnim(this.config.blockAnim);
        }
        soundEngine.playPlant();
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;
        if (this.bounceAnimTimer > 0) {
            this.bounceAnimTimer -= dt;
            if (this.bounceAnimTimer <= 0) {
                this.setAnim(this.config.anim);
            }
        }
    }
}

// 金盏花 (Marigold：定期产出闪亮银币 +15☀️ 与金币 +50☀️)
export class MarigoldPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('marigold', row, col, x, y, entityLayer);
        this.produceInterval = this.config.produceInterval || 22.0;
        this.produceTimer = this.produceInterval - 9.0;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;
        this.produceTimer += dt;
        if (this.produceTimer >= this.produceInterval) {
            this.produceTimer = 0;
            const isGold = Math.random() < 0.28;
            const val = isGold ? 50 : 15;
            const coinType = isGold ? 'gold' : 'silver';
            soundEngine.playSun();
            if (engine.sunLayer) {
                engine.suns.push(
                    new SunEntity(this.x + (Math.random() - 0.5) * 24, this.y - 18, this.y + 18, val, false, engine.sunLayer, engine, coinType)
                );
            } else {
                engine.sun += val;
            }
        }
    }
}

// 吸金磁 (Gold Magnet：全自动磁力吸附全屏阳光与金银钱币，一次最多连吸 5 枚)
export class GoldMagnetPlant extends Plant {
    constructor(row, col, x, y, entityLayer) {
        super('goldmagnet', row, col, x, y, entityLayer);
        this.pullInterval = 3.5;
        this.pullTimer = 2.0;
        this.pullAnimTimer = 0;
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead || this.isAsleep) return;

        if (this.pullAnimTimer > 0) {
            this.pullAnimTimer -= dt;
            if (this.pullAnimTimer <= 0) {
                this.setAnim(this.config.anim);
            }
        }

        this.pullTimer += dt;
        if (this.pullTimer >= this.pullInterval) {
            const uncollected = (engine.suns || []).filter(s => !s.isDead && !s.isCollecting);
            if (uncollected.length > 0) {
                this.pullTimer = 0;
                this.pullAnimTimer = 0.85;
                if (this.config.pullAnim) {
                    this.setAnim(this.config.pullAnim);
                }
                const batch = uncollected.slice(0, 5);
                batch.forEach(s => engine.collectSun(s));
                if (engine.floatingTexts) {
                    engine.floatingTexts.push(new FloatingText(this.x, this.y - 38, `🧲 自动吸金 x${batch.length}!`, '#f1c40f', 18));
                }
            }
        }
    }
}

// 模仿者 (Imitater：0.55 秒黑白旋转默剧变身动画后，化为所复制的目标植物银灰分身)
export class ImitaterPlant extends Plant {
    constructor(row, col, x, y, entityLayer, copiedType = 'wallnut') {
        super('imitater', row, col, x, y, entityLayer);
        this.copiedType = (copiedType && copiedType !== 'imitater' && GAME_CONFIG.plants[copiedType])
            ? copiedType
            : 'wallnut';
        this.morphTimer = 0.55;
        if (this.config.spinAnim) {
            this.setAnim(this.config.spinAnim);
        }
    }

    update(dt, engine) {
        super.update(dt, engine);
        if (this.isDead) return;
        this.morphTimer -= dt;
        if (this.morphTimer <= 0 && engine) {
            const lily1 = this.hostLilypad;
            const lily2 = this.hostSecondaryLilypad;
            const pot1 = this.hostPot;
            const pot2 = this.hostSecondaryPot;
            const shell = this.pumpkin;

            this.hostLilypad = null;
            this.hostSecondaryLilypad = null;
            this.hostPot = null;
            this.hostSecondaryPot = null;
            this.pumpkin = null;

            const clone = createPlant(this.copiedType, this.row, this.col, this.x, this.y, engine.entityLayer, engine.isNight);
            clone.isImitaterClone = true;
            if (clone.domElement) {
                clone.domElement.classList.add('imitater-clone');
            }
            if (lily1) {
                lily1.carriedPlant = clone;
                clone.hostLilypad = lily1;
                if (clone.domElement) {
                    clone.domElement.classList.add('planted-on-lilypad');
                    clone.domElement.style.zIndex = clone.isDoubleWide ? '16' : '15';
                }
            }
            if (lily2) {
                lily2.carriedPlant = clone;
                clone.hostSecondaryLilypad = lily2;
            }
            if (pot1) {
                pot1.carriedPlant = clone;
                clone.hostPot = pot1;
                if (clone.domElement) {
                    clone.domElement.classList.add('planted-on-pot');
                    clone.domElement.style.zIndex = clone.isDoubleWide ? '16' : '15';
                }
            }
            if (pot2) {
                pot2.carriedPlant = clone;
                clone.hostSecondaryPot = pot2;
            }
            if (shell && !shell.isDead) {
                shell.protectedPlant = clone;
                clone.pumpkin = shell;
            }

            engine.plants.push(clone);
            if (engine.hitSplats) {
                engine.hitSplats.push(new HitSplat(this.x, this.y, 'shroom'));
            }
            if (engine.floatingTexts) {
                engine.floatingTexts.push(new FloatingText(this.x, this.y - 36, `🎭 模仿变身：${clone.config.name}!`, '#dfe6e9', 18));
            }
            soundEngine.playPlant();
            this.destroy();
        }
    }
}

// 植物工厂函数
export function createPlant(type, row, col, x, y, entityLayer, isNight = false, targetPlant = null) {
    if (type === 'coffeebean') {
        return new CoffeeBeanPlant(row, col, x, y, entityLayer, targetPlant);
    }

    let p;
    switch (type) {
        case 'peashooter': p = new PeashooterPlant(row, col, x, y, entityLayer); break;
        case 'sunflower': p = new SunflowerPlant(row, col, x, y, entityLayer); break;
        case 'cherrybomb': p = new CherryBombPlant(row, col, x, y, entityLayer); break;
        case 'wallnut': p = new WallnutPlant(row, col, x, y, entityLayer); break;
        case 'potatomine': p = new PotatoMinePlant(row, col, x, y, entityLayer); break;
        case 'snowpea': p = new SnowPeaPlant(row, col, x, y, entityLayer); break;
        case 'chomper': p = new ChomperPlant(row, col, x, y, entityLayer); break;
        case 'repeater': p = new RepeaterPlant(row, col, x, y, entityLayer); break;
        case 'puffshroom': p = new PuffshroomPlant(row, col, x, y, entityLayer); break;
        case 'sunshroom': p = new SunshroomPlant(row, col, x, y, entityLayer); break;
        case 'fumeshroom': p = new FumeshroomPlant(row, col, x, y, entityLayer); break;
        case 'gravebuster': p = new GraveBusterPlant(row, col, x, y, entityLayer); break;
        case 'hypnoshroom': p = new HypnoshroomPlant(row, col, x, y, entityLayer); break;
        case 'scaredyshroom': p = new ScaredyshroomPlant(row, col, x, y, entityLayer); break;
        case 'iceshroom': p = new IceshroomPlant(row, col, x, y, entityLayer); break;
        case 'doomshroom': p = new DoomshroomPlant(row, col, x, y, entityLayer); break;
        case 'lilypad': p = new LilyPadPlant(row, col, x, y, entityLayer); break;
        case 'squash': p = new SquashPlant(row, col, x, y, entityLayer); break;
        case 'threepeater': p = new ThreepeaterPlant(row, col, x, y, entityLayer); break;
        case 'jalapeno': p = new JalapenoPlant(row, col, x, y, entityLayer); break;
        case 'torchwood': p = new TorchwoodPlant(row, col, x, y, entityLayer); break;
        case 'tallnut': p = new TallnutPlant(row, col, x, y, entityLayer); break;
        case 'seashroom': p = new SeaShroomPlant(row, col, x, y, entityLayer); break;
        case 'tanglekelp': p = new TangleKelpPlant(row, col, x, y, entityLayer); break;
        case 'spikeweed': p = new SpikeweedPlant(row, col, x, y, entityLayer); break;
        case 'spikerock': p = new SpikerockPlant(row, col, x, y, entityLayer); break;
        case 'gatlingpea': p = new GatlingPeaPlant(row, col, x, y, entityLayer); break;
        case 'twinsunflower': p = new TwinSunflowerPlant(row, col, x, y, entityLayer); break;
        case 'gloomshroom': p = new GloomShroomPlant(row, col, x, y, entityLayer); break;
        case 'plantern': p = new PlanternPlant(row, col, x, y, entityLayer); break;
        case 'cactus': p = new CactusPlant(row, col, x, y, entityLayer); break;
        case 'splitpea': p = new SplitPeaPlant(row, col, x, y, entityLayer); break;
        case 'starfruit': p = new StarfruitPlant(row, col, x, y, entityLayer); break;
        case 'pumpkin': p = new PumpkinPlant(row, col, x, y, entityLayer); break;
        case 'magnetshroom': p = new MagnetShroomPlant(row, col, x, y, entityLayer); break;
        case 'blover': p = new BloverPlant(row, col, x, y, entityLayer); break;
        case 'cabbagepult': p = new CabbagePultPlant(row, col, x, y, entityLayer); break;
        case 'flowerpot': p = new FlowerPotPlant(row, col, x, y, entityLayer); break;
        case 'kernelpult': p = new KernelPultPlant(row, col, x, y, entityLayer); break;
        case 'garlic': p = new GarlicPlant(row, col, x, y, entityLayer); break;
        case 'melonpult': p = new MelonPultPlant(row, col, x, y, entityLayer); break;
        case 'cobcannon': p = new CobCannonPlant(row, col, x, y, entityLayer); break;
        case 'wintermelon': p = new WinterMelonPlant(row, col, x, y, entityLayer); break;
        case 'cattail': p = new CattailPlant(row, col, x, y, entityLayer); break;
        case 'umbrellaleaf': p = new UmbrellaLeafPlant(row, col, x, y, entityLayer); break;
        case 'marigold': p = new MarigoldPlant(row, col, x, y, entityLayer); break;
        case 'goldmagnet': p = new GoldMagnetPlant(row, col, x, y, entityLayer); break;
        case 'imitater': p = new ImitaterPlant(row, col, x, y, entityLayer, typeof targetPlant === 'string' ? targetPlant : 'wallnut'); break;
        default: p = new PeashooterPlant(row, col, x, y, entityLayer); break;
    }

    if (!isNight && p.isNocturnal) {
        p.putToSleep();
    }
    return p;
}
