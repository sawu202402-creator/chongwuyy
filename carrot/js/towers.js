/**
 * towers.js - 保卫萝卜官方原版四大防御塔渲染与射击体系
 * 瓶子炮 (Bottle)、太阳花 (Sun)、便便塔 (Shit)、星星塔 (Star)
 * 严格按照官方原版武器朝向、底座属性、攻击模式与特色动画定制
 */

import { TOWER_TYPES } from './config.js?v=20260928_props_v6';
import { sound } from './audio.js?v=20260928_props_v6';

const TOWER_ASSET_VER = '20260925_fb_upright_v4';
function loadImg(src) {
    const img = new Image();
    img.src = src.includes('?') ? `${src}&v=${TOWER_ASSET_VER}` : `${src}?v=${TOWER_ASSET_VER}`;
    return img;
}

// 官方专用平台底座
const platforms = {
    bottle: loadImg('assets/official/towers/bottle_platform.png'),
    star: loadImg('assets/official/towers/star_platform.png'),
    fan: loadImg('assets/official/towers/fan_platform.png'),
    rocket: loadImg('assets/official/towers/rocket_platform.png'),
    ball: loadImg('assets/official/towers/ball_platform.png'),
    firebottle: loadImg('assets/official/towers/firebottle_platform.png'),
    pin: loadImg('assets/official/towers/pin_platform.png'),
    fish: loadImg('assets/official/towers/fish_platform.png'),
    plane: loadImg('assets/official/towers/plane_platform.png'),
    arrow: loadImg('assets/official/towers/arrow_platform.png'),
    anchor: loadImg('assets/official/towers/anchor_platform.png'),
    bluestar: loadImg('assets/official/towers/bluestar_platform.png'),
    cuttle: loadImg('assets/official/towers/cuttle_platform.png'),
    snow: loadImg('assets/official/towers/snow_platform.png')
};

// 官方多等级炮台精灵图
const officialTowerSprites = {
    ADD_RAPID: [
        loadImg('assets/official/towers/sprites/bottle_lv1.png'), // 水平朝右瓶身
        loadImg('assets/official/towers/sprites/bottle_lv2.png'),
        loadImg('assets/official/towers/sprites/bottle_lv3.png')
    ],
    DIV_FROST: [
        loadImg('assets/official/towers/sprites/shit_lv1.png'),   // 正直金冠小便便
        loadImg('assets/official/towers/sprites/shit_lv2.png'),
        loadImg('assets/official/towers/sprites/shit_lv3.png')
    ],
    MUL_CANNON: [
        loadImg('assets/official/towers/sprites/sun_petals_1.png'), // 太阳花旋转花瓣
        loadImg('assets/official/towers/sprites/sun_petals_2.png'),
        loadImg('assets/official/towers/sprites/sun_petals_3.png')
    ],
    GEOM_LASER: [
        loadImg('assets/official/towers/sprites/star_lv1.png'),   // 飞天金晶五角星
        loadImg('assets/official/towers/sprites/star_lv2.png'),
        loadImg('assets/official/towers/sprites/star_lv3.png')
    ],
    FAN: [
        loadImg('assets/official/towers/sprites/fan_lv1.png'),    // 绿色旋风叶片
        loadImg('assets/official/towers/sprites/fan_lv2.png'),
        loadImg('assets/official/towers/sprites/fan_lv3.png')
    ],
    ROCKET: [
        loadImg('assets/official/towers/sprites/rocket_lv1.png'), // 重型导弹发射架
        loadImg('assets/official/towers/sprites/rocket_lv2.png'),
        loadImg('assets/official/towers/sprites/rocket_lv3.png')
    ],
    BALL: [
        loadImg('assets/official/towers/sprites/ball_lv1.png'),   // 官方紫水晶魔法球
        loadImg('assets/official/towers/sprites/ball_lv2.png'),
        loadImg('assets/official/towers/sprites/ball_lv3.png')
    ],
    FIRE_BOTTLE: [
        loadImg('assets/official/towers/sprites/firebottle_lv1.png'), // 官方火瓶子/汽油瓶
        loadImg('assets/official/towers/sprites/firebottle_lv2.png'),
        loadImg('assets/official/towers/sprites/firebottle_lv3.png')
    ],
    PIN: [
        loadImg('assets/official/towers/sprites/pin_lv1.png'),        // 毒针塔
        loadImg('assets/official/towers/sprites/pin_lv2.png'),
        loadImg('assets/official/towers/sprites/pin_lv3.png')
    ],
    ARROW: [
        loadImg('assets/official/towers/sprites/arrow_lv1.png'),      // 多重箭
        loadImg('assets/official/towers/sprites/arrow_lv2.png'),
        loadImg('assets/official/towers/sprites/arrow_lv3.png')
    ],
    BLUE_STAR: [
        loadImg('assets/official/towers/sprites/bluestar_lv1.png'),   // 冰冻星
        loadImg('assets/official/towers/sprites/bluestar_lv2.png'),
        loadImg('assets/official/towers/sprites/bluestar_lv3.png')
    ],
    SNOW: [
        loadImg('assets/official/towers/sprites/snow_lv1.png'),       // 雪花塔
        loadImg('assets/official/towers/sprites/snow_lv2.png'),
        loadImg('assets/official/towers/sprites/snow_lv3.png')
    ],
    FISH: [
        loadImg('assets/official/towers/sprites/fish_lv1.png'),       // 鱼刺塔
        loadImg('assets/official/towers/sprites/fish_lv2.png'),
        loadImg('assets/official/towers/sprites/fish_lv3.png')
    ],
    PLANE: [
        loadImg('assets/official/towers/sprites/plane_lv1.png'),      // 玩具飞机
        loadImg('assets/official/towers/sprites/plane_lv2.png'),
        loadImg('assets/official/towers/sprites/plane_lv3.png')
    ],
    ANCHOR: [
        loadImg('assets/official/towers/sprites/anchor_lv1.png'),     // 船锚炸弹
        loadImg('assets/official/towers/sprites/anchor_lv2.png'),
        loadImg('assets/official/towers/sprites/anchor_lv3.png')
    ],
    CUTTLE: [
        loadImg('assets/official/towers/sprites/cuttle_lv1.png'),     // 章鱼炮
        loadImg('assets/official/towers/sprites/cuttle_lv2.png'),
        loadImg('assets/official/towers/sprites/cuttle_lv3.png')
    ],
    MUSHROOM: [
        loadImg('assets/official/towers/sprites/mushroom_lv1.png'),   // 蘑菇塔
        loadImg('assets/official/towers/sprites/mushroom_lv2.png'),
        loadImg('assets/official/towers/sprites/mushroom_lv3.png')
    ],
    BUFF: [
        loadImg('assets/official/towers/sprites/buff_lv1.png'),       // 水晶增益塔
        loadImg('assets/official/towers/sprites/buff_lv2.png'),
        loadImg('assets/official/towers/sprites/buff_lv3.png')
    ]
};

// 官方激光/电弧光束贴图
const ballBeams = [
    loadImg('assets/official/towers/bullets/ball_beam1.png'),
    loadImg('assets/official/towers/bullets/ball_beam2.png'),
    loadImg('assets/official/towers/bullets/ball_beam3.png')
];

// 官方火瓶子烈焰喷射与命中贴图
const fireFlames = [
    loadImg('assets/official/towers/bullets/fire_flame1.png'),
    loadImg('assets/official/towers/bullets/fire_flame2.png')
];
const fireHitImg = loadImg('assets/official/towers/bullets/fire_hit.png');

// 太阳花专属正面萌笑小脸蛋 & 火箭弹载具图
const sunFaceImg = loadImg('assets/official/towers/sun_face.png');
const rocketMissileImg = loadImg('assets/official/towers/bullets/rocket_bullet.png');

export class Tower {
    constructor(typeKey, x, y, slotId) {
        this.typeKey = typeKey;
        this.config = TOWER_TYPES[typeKey];
        this.x = x;
        this.y = y;
        this.slotId = slotId;

        this.level = 1;
        this.maxLevel = 3;

        // 数值体系
        this.range = this.config.range;
        this.damage = this.config.damage;
        this.fireRate = this.config.fireRate;
        this.cooldown = 0;

        // 旋转与索敌 (默认指向正右 0 度)
        this.target = null;
        this.angle = 0;

        // 特色动作动画计时器
        this.recoil = 0;   // 瓶子后坐力 / 太阳花闪光
        this.squash = 0;   // 便便弹性挤压

        // 魔法球/电塔专属多目标锁定列表
        this.activeBeamTargets = [];
    }

    upgrade() {
        if (this.level >= this.maxLevel) return false;
        this.level++;
        this.range = Math.round(this.range * 1.15);
        this.damage = Math.round(this.damage * 1.35);
        this.fireRate = Math.max(0.12, this.fireRate * 0.88);
        sound.playTowerUpgrade();
        return true;
    }

    getUpgradeCost() {
        return Math.round(this.config.upgradeCost * (1 + (this.level - 1) * 0.6));
    }

    getSellValue() {
        const total = this.config.cost + (this.level - 1) * this.config.upgradeCost;
        return Math.round(total * 0.7);
    }

    findTarget(enemies, targetedEnemy = null, targetedProp = null) {
        // 1. 优先集火玩家手动点击锁定的目标怪
        if (targetedEnemy && !targetedEnemy.isDead && !targetedEnemy.reachedEnd) {
            const dist = Math.hypot(targetedEnemy.x - this.x, targetedEnemy.y - this.y);
            if (dist <= this.range) {
                return targetedEnemy;
            }
        }

        // 2. 优先集火玩家主动点击锁定的装饰物道具 (必须手动点击选中，且在当前塔的有效射程内)
        if (targetedProp && !targetedProp.isDead) {
            const dist = Math.hypot(targetedProp.x - this.x, targetedProp.y - this.y);
            const reach = this.range + Math.min(targetedProp.width, targetedProp.height) * 0.42;
            if (dist <= reach) {
                return targetedProp;
            }
        }

        // 3. 正常打射程内进度最前的怪 (默认核心逻辑：只攻击怪物)
        let best = null;
        let maxProgress = -1;
        if (enemies) {
            for (const e of enemies) {
                if (e.isDead || e.reachedEnd) continue;
                const dist = Math.hypot(e.x - this.x, e.y - this.y);
                if (dist <= this.range) {
                    const progress = e.waypointIndex * 1000 + (1000 - dist);
                    if (progress > maxProgress) {
                        maxProgress = progress;
                        best = e;
                    }
                }
            }
        }
        if (best) return best;

        // 严格遵守规则：未主动点击装饰物时，绝不自动打道具，无怪则待机
        return null;
    }

    findMultipleTargets(enemies, targetedEnemy = null, maxCount = 1, targetedProp = null) {
        if ((!enemies || enemies.length === 0) && !targetedProp) return [];
        const inRange = [];

        // 优先集火选中的目标怪
        if (targetedEnemy && !targetedEnemy.isDead && !targetedEnemy.reachedEnd) {
            const dist = Math.hypot(targetedEnemy.x - this.x, targetedEnemy.y - this.y);
            if (dist <= this.range) {
                inRange.push(targetedEnemy);
            }
        }

        // 优先集火主动选中的道具 (只有主动锁定且在射程内才攻击)
        if (targetedProp && !targetedProp.isDead && !inRange.includes(targetedProp)) {
            const dist = Math.hypot(targetedProp.x - this.x, targetedProp.y - this.y);
            const reach = this.range + Math.min(targetedProp.width, targetedProp.height) * 0.42;
            if (dist <= reach) {
                inRange.push(targetedProp);
            }
        }

        const candidates = [];
        if (enemies) {
            for (const e of enemies) {
                if (e.isDead || e.reachedEnd || inRange.includes(e)) continue;
                const dist = Math.hypot(e.x - this.x, e.y - this.y);
                if (dist <= this.range) {
                    candidates.push({ target: e, progress: e.waypointIndex * 1000 + (1000 - dist) });
                }
            }
        }

        candidates.sort((a, b) => b.progress - a.progress);
        for (const item of candidates) {
            if (inRange.length >= maxCount) break;
            inRange.push(item.target);
        }

        return inRange;
    }

    hasAnyTargetInRange(enemies, targetedProp = null) {
        // 1. 如果玩家主动点击锁定了道具，且在射程内
        if (targetedProp && !targetedProp.isDead) {
            const dist = Math.hypot(targetedProp.x - this.x, targetedProp.y - this.y);
            const reach = this.range + Math.min(targetedProp.width, targetedProp.height) * 0.42;
            if (dist <= reach) {
                return true;
            }
        }
        // 2. 检查是否有存活怪兽在射程内
        if (enemies) {
            for (const e of enemies) {
                if (e.isDead || e.reachedEnd) continue;
                if (Math.hypot(e.x - this.x, e.y - this.y) <= this.range) {
                    return true;
                }
            }
        }
        return false;
    }

    update(dt, enemies, projectileSystem, isSuperCharged = false, targetedEnemy = null, allTowers = null, targetedProp = null, props = null) {
        const rateFactor = (isSuperCharged ? 1.45 : 1.0) * (this.isBuffed ? 1.25 : 1.0);
        if (this.cooldown > 0) {
            this.cooldown -= dt * rateFactor;
        }

        if (this.recoil > 0) {
            this.recoil -= dt;
        }
        if (this.squash > 0) {
            this.squash -= dt;
        }

        // 水晶增益塔 (BUFF)：被动光环增幅范围内所有防御塔攻击力与攻速
        if (this.typeKey === 'BUFF') {
            if (allTowers) {
                for (const t of allTowers) {
                    if (t !== this && Math.hypot(t.x - this.x, t.y - this.y) <= this.range) {
                        t.isBuffed = true;
                    }
                }
            }
            return;
        }

        // 雪花塔：360 度全屏冰封冲击波
        if (this.typeKey === 'SNOW') {
            if (this.hasAnyTargetInRange(enemies, targetedProp)) {
                if (this.cooldown <= 0) {
                    sound.playShootSnow();
                    this.recoil = 0.25;
                    const dmg = Math.round(this.damage * (isSuperCharged ? 1.5 : 1.0) * (this.isBuffed ? 1.3 : 1.0));
                    projectileSystem.addSnowWave(this.x, this.y, this.range, dmg, this.config.freezeDuration || 1.8);
                    this.cooldown = this.fireRate;
                }
            }
            return;
        }

        // 蘑菇塔：360 度毒孢子迷雾，减速并标记怪兽掉落双倍金币
        if (this.typeKey === 'MUSHROOM') {
            if (this.hasAnyTargetInRange(enemies, targetedProp)) {
                if (this.cooldown <= 0) {
                    sound.playShootMushroom();
                    this.recoil = 0.25;
                    const dmg = Math.round(this.damage * (isSuperCharged ? 1.5 : 1.0) * (this.isBuffed ? 1.3 : 1.0));
                    projectileSystem.addMushroomWave(this.x, this.y, this.range, dmg, this.config.slowPercent || 0.45, this.config.slowDuration || 3.0);
                    this.cooldown = this.fireRate;
                }
            }
            return;
        }

        // 章鱼炮：全屏 360 度发射无死角珍珠弹幕！
        if (this.typeKey === 'CUTTLE') {
            if (this.hasAnyTargetInRange(enemies, targetedProp)) {
                if (this.cooldown <= 0) {
                    sound.playShootCuttle();
                    this.recoil = 0.2;
                    const isCrit = isSuperCharged || Math.random() < 0.15;
                    const dmg = Math.round(this.damage * (isCrit ? 1.5 : 1.0) * (this.isBuffed ? 1.3 : 1.0));
                    const count = this.level === 1 ? 8 : (this.level === 2 ? 12 : 16);
                    const speed = 420;
                    for (let k = 0; k < count; k++) {
                        const ang = (Math.PI * 2 / count) * k;
                        projectileSystem.addProjectile({
                            type: 'cuttle_bullet',
                            x: this.x,
                            y: this.y,
                            vx: Math.cos(ang) * speed,
                            vy: Math.sin(ang) * speed,
                            damage: dmg,
                            isCrit: isCrit,
                            life: 1.8
                        });
                    }
                    this.cooldown = this.fireRate;
                }
            }
            return;
        }

        // 太阳花攻击机制：360度全方位范围判定，无需单体锁头
        if (this.typeKey === 'MUL_CANNON') {
            if (this.hasAnyTargetInRange(enemies, targetedProp)) {
                if (this.cooldown <= 0) {
                    this.shoot(projectileSystem, isSuperCharged);
                    this.cooldown = this.fireRate;
                }
            }
            return;
        }

        // 魔法球 (电塔) 机制：高频持续电光射线，升级后分支多道电弧同时打击多个敌人
        if (this.typeKey === 'BALL') {
            const maxTargets = this.level === 1 ? 1 : (this.level === 2 ? 2 : 3);
            this.activeBeamTargets = this.findMultipleTargets(enemies, targetedEnemy, maxTargets, targetedProp);

            if (this.activeBeamTargets.length > 0) {
                const primeTarget = this.activeBeamTargets[0];
                const dx = primeTarget.x - this.x;
                const dy = primeTarget.y - this.y;
                this.angle = Math.atan2(dy, dx);

                if (this.cooldown <= 0) {
                    sound.playShootBall();
                    this.cooldown = this.fireRate; // 约 0.22s 高频电击周期

                    const isCrit = isSuperCharged || Math.random() < 0.15;
                    const dmg = Math.round(this.damage * (isCrit ? 1.4 : 1.0));

                    this.activeBeamTargets.forEach(enemy => {
                        if (enemy && !enemy.isDead && !enemy.reachedEnd) {
                            enemy.takeDamage(dmg, isCrit);
                            if (projectileSystem) {
                                projectileSystem.createExplosion(enemy.x, enemy.y, '#e056fd', 6, 2.0);
                                if (Math.random() < 0.35) {
                                    projectileSystem.addFloatingText(enemy.x, enemy.y, `-${dmg} ⚡`, '#e056fd', isCrit ? 18 : 13, isCrit);
                                }
                            }
                        }
                    });
                }
            } else {
                this.activeBeamTargets = [];
            }
            return;
        }

        // 火瓶子 (汽油瓶) 机制：持续喷射强力烈焰，目标越近或聚焦越久伤害越高，伴随小范围溅射灼烧
        if (this.typeKey === 'FIRE_BOTTLE') {
            this.target = this.findTarget(enemies, targetedEnemy, targetedProp);
            if (this.target && !this.target.isDead && !this.target.reachedEnd) {
                const dx = this.target.x - this.x;
                const dy = this.target.y - this.y;
                this.angle = Math.atan2(dy, dx);

                if (this.cooldown <= 0) {
                    sound.playShootFireBottle();
                    this.cooldown = this.fireRate; // 约 0.16s 高频烈焰周期

                    const isCrit = isSuperCharged || Math.random() < 0.20;
                    const dmg = Math.round(this.damage * (isCrit ? 1.45 : 1.0));

                    this.target.takeDamage(dmg, isCrit);

                    // 汽油瓶轻微溅射效果 (对目标周围 50px 的小怪造成 35% 灼烧伤害)
                    const splashRad = 48 + (this.level - 1) * 8;
                    for (const other of enemies) {
                        if (other !== this.target && !other.isDead && !other.reachedEnd) {
                            if (Math.hypot(other.x - this.target.x, other.y - this.target.y) <= splashRad) {
                                other.takeDamage(Math.round(dmg * 0.35), false);
                            }
                        }
                    }

                    if (projectileSystem) {
                        projectileSystem.createExplosion(this.target.x, this.target.y, '#ff4757', 6, 2.2);
                        if (Math.random() < 0.4) {
                            projectileSystem.addFloatingText(this.target.x, this.target.y, `-${dmg} 🔥`, '#ff6b6b', isCrit ? 18 : 13, isCrit);
                        }
                    }
                }
            }
            return;
        }

        // 其他单体 / 导向武器：优先集火锁定目标，或追踪进度最靠前的目标
        this.target = this.findTarget(enemies, targetedEnemy, targetedProp);
        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            this.angle = Math.atan2(dy, dx); // 精准朝向怪物

            if (this.cooldown <= 0) {
                this.shoot(projectileSystem, isSuperCharged);
                this.cooldown = this.fireRate;
            }
        }
    }

    shoot(projectileSystem, isSuperCharged) {
        const isCrit = isSuperCharged || Math.random() < 0.15;
        const damage = Math.round(this.damage * (isCrit ? 1.5 : 1.0));

        // 1. 太阳花：360度全方位扩散烈焰日环 (同时重创射程内全部小怪与障碍)
        if (this.typeKey === 'MUL_CANNON') {
            sound.playShootSun();
            this.recoil = 0.22;
            projectileSystem.addSunWave(this.x, this.y, this.range, damage, isCrit);
            return;
        }

        if (!this.target) return;

        // 2. 绿瓶子炮：后坐力微颤 + 极速高爆火球弹
        if (this.typeKey === 'ADD_RAPID') {
            sound.playShootBottle();
            this.recoil = 0.09;
            projectileSystem.addProjectile({
                type: 'bottle_bullet',
                x: this.x + Math.cos(this.angle) * 16,
                y: this.y + Math.sin(this.angle) * 16,
                target: this.target,
                speed: 460,
                damage: damage,
                isCrit: isCrit
            });
        }
        // 3. 便便塔：向下弹性深蹲 + 投掷减速软泥弹
        else if (this.typeKey === 'DIV_FROST') {
            sound.playShootShit();
            this.squash = 0.18;
            projectileSystem.addProjectile({
                type: 'shit_bullet',
                x: this.x,
                y: this.y,
                target: this.target,
                speed: 340,
                damage: damage,
                slowPercent: this.config.slowPercent,
                slowDuration: this.config.slowDuration,
                isCrit: isCrit
            });
        }
        // 4. 星星塔：飞旋自转五角星弹 + 击中 AoE 群体溅射
        else if (this.typeKey === 'GEOM_LASER') {
            sound.playShootStar();
            this.recoil = 0.12;
            projectileSystem.addProjectile({
                type: 'star_bullet',
                x: this.x,
                y: this.y,
                target: this.target,
                speed: 400,
                damage: damage,
                splashRadius: this.config.splashRadius,
                isCrit: isCrit
            });
        }
        // 5. 风扇塔：直线贯穿高旋叶片
        else if (this.typeKey === 'FAN') {
            sound.playShootFan();
            this.recoil = 0.22;
            const speed = 520;
            projectileSystem.addProjectile({
                type: 'fan_bullet',
                x: this.x,
                y: this.y,
                vx: Math.cos(this.angle) * speed,
                vy: Math.sin(this.angle) * speed,
                damage: damage,
                isCrit: isCrit,
                hitEnemies: new Set(),
                life: 2.2
            });
        }
        // 6. 火箭塔：发射精准制导超重型高爆火箭
        else if (this.typeKey === 'ROCKET') {
            sound.playShootRocket();
            this.recoil = 0.32;
            projectileSystem.addProjectile({
                type: 'rocket_bullet',
                x: this.x + Math.cos(this.angle) * 18,
                y: this.y + Math.sin(this.angle) * 18,
                target: this.target,
                targetX: this.target.x,
                targetY: this.target.y,
                speed: 420,
                damage: damage,
                splashRadius: this.config.splashRadius,
                isCrit: isCrit,
                angle: this.angle
            });
        }
        // 7. 毒针塔：单体淬毒飞针，造成持续猛毒 DoT + 减速
        else if (this.typeKey === 'PIN') {
            sound.playShootPin();
            this.recoil = 0.12;
            projectileSystem.addProjectile({
                type: 'pin_bullet',
                x: this.x + Math.cos(this.angle) * 14,
                y: this.y + Math.sin(this.angle) * 14,
                target: this.target,
                speed: 480,
                damage: damage,
                slowPercent: this.config.slowPercent,
                slowDuration: this.config.slowDuration,
                dotTicks: this.config.dotTicks,
                dotDamage: this.config.dotDamage,
                angle: this.angle,
                isCrit: isCrit
            });
        }
        // 8. 多重箭：扇形多发飞箭散射
        else if (this.typeKey === 'ARROW') {
            sound.playShootArrow();
            this.recoil = 0.18;
            const arrowCount = this.level === 1 ? 3 : (this.level === 2 ? 4 : 5);
            const spread = 0.45;
            const speed = 460;
            for (let k = 0; k < arrowCount; k++) {
                const offset = (k / (arrowCount - 1) - 0.5) * spread;
                const ang = this.angle + offset;
                projectileSystem.addProjectile({
                    type: 'arrow_bullet',
                    x: this.x + Math.cos(ang) * 12,
                    y: this.y + Math.sin(ang) * 12,
                    vx: Math.cos(ang) * speed,
                    vy: Math.sin(ang) * speed,
                    angle: ang,
                    damage: damage,
                    isCrit: isCrit,
                    life: 1.6
                });
            }
        }
        // 9. 冰冻星：极寒霜星弹，产生大范围减速冰环
        else if (this.typeKey === 'BLUE_STAR') {
            sound.playShootBlueStar();
            this.recoil = 0.14;
            projectileSystem.addProjectile({
                type: 'bluestar_bullet',
                x: this.x,
                y: this.y,
                target: this.target,
                speed: 390,
                damage: damage,
                splashRadius: this.config.splashRadius,
                slowPercent: this.config.slowPercent,
                isCrit: isCrit
            });
        }
        // 10. 鱼刺塔：高额暴击尖刺 + 几率眩晕原地定身
        else if (this.typeKey === 'FISH') {
            sound.playShootFish();
            this.recoil = 0.24;
            projectileSystem.addProjectile({
                type: 'fish_bullet',
                x: this.x + Math.cos(this.angle) * 14,
                y: this.y + Math.sin(this.angle) * 14,
                target: this.target,
                speed: 520,
                damage: damage,
                stunChance: this.config.stunChance,
                stunDuration: this.config.stunDuration,
                angle: this.angle,
                isCrit: isCrit
            });
        }
        // 11. 玩具飞机：直线横贯全屏强力穿透光束
        else if (this.typeKey === 'PLANE') {
            sound.playShootPlane();
            this.recoil = 0.28;
            const speed = 720;
            projectileSystem.addProjectile({
                type: 'plane_laser',
                x: this.x,
                y: this.y,
                vx: Math.cos(this.angle) * speed,
                vy: Math.sin(this.angle) * speed,
                angle: this.angle,
                damage: damage,
                isCrit: isCrit,
                hitEnemies: new Set(),
                life: 1.8
            });
        }
        // 12. 船锚炸弹：重锚轰炸，命中后分叉 2~3 枚碎裂飞锚追击
        else if (this.typeKey === 'ANCHOR') {
            sound.playShootAnchor();
            this.recoil = 0.26;
            projectileSystem.addProjectile({
                type: 'anchor_bullet',
                x: this.x + Math.cos(this.angle) * 14,
                y: this.y + Math.sin(this.angle) * 14,
                target: this.target,
                speed: 400,
                damage: damage,
                isCrit: isCrit
            });
        }
    }

    draw(ctx, time, isSelected = false) {
        // 1. 选中时绘制保卫萝卜官方虚线射程圈
        if (isSelected) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(46, 213, 115, 0.15)';
            ctx.fill();
            ctx.strokeStyle = '#2ed573';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 6]);
            ctx.stroke();
            ctx.restore();
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        // 2. 地面柔和阴影 (保卫萝卜纯正无痕投影)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(0, 16, 25, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // 水晶增益塔常驻脉冲光环
        if (this.typeKey === 'BUFF') {
            const pulse = Math.sin(time * 3) * 0.15 + 0.85;
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, this.range, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(253, 203, 110, ${0.08 * pulse})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(253, 203, 110, ${0.45 * pulse})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 6]);
            ctx.stroke();
            ctx.restore();
        }

        // 受到水晶塔增益时的金色脉动护环
        if (this.isBuffed) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 10, 26, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.restore();
        }

        // 3. 官方底座平台渲染
        const platMap = {
            ADD_RAPID: platforms.bottle,
            GEOM_LASER: platforms.star,
            FAN: platforms.fan,
            ROCKET: platforms.rocket,
            BALL: platforms.ball,
            FIRE_BOTTLE: platforms.firebottle,
            PIN: platforms.pin,
            FISH: platforms.fish,
            PLANE: platforms.plane,
            ARROW: platforms.arrow,
            ANCHOR: platforms.anchor,
            BLUE_STAR: platforms.bluestar,
            CUTTLE: platforms.cuttle,
            SNOW: platforms.snow
        };
        const pImg = platMap[this.typeKey];
        if (pImg && pImg.complete && pImg.naturalWidth > 0) {
            ctx.drawImage(pImg, -26, -26, 52, 52);
        }

        // 4. 炮身精灵与动作动画
        const levelIdx = Math.min(2, Math.max(0, this.level - 1));
        const sprites = officialTowerSprites[this.typeKey];
        const sprite = sprites ? sprites[levelIdx] : null;

        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            // A. 瓶子炮：炮口对准目标 (sprite 默认水平朝右，以 this.angle 无偏移旋转)
            if (this.typeKey === 'ADD_RAPID') {
                ctx.save();
                ctx.rotate(this.angle);
                // 开炮后坐力弹性挤压
                if (this.recoil > 0) {
                    ctx.scale(0.85, 1.15);
                }
                const targetDim = 52 + (this.level - 1) * 7;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // B. 便便塔：正面向前坐立 (不随敌人角度转动！)，具有呼吸和开炮深蹲弹起
            else if (this.typeKey === 'DIV_FROST') {
                ctx.save();
                // 呼吸与挤压
                const idleSquash = Math.sin(time * 4) * 0.05;
                const shootSquash = this.squash > 0 ? (this.squash * 2.2) : 0;
                const sx = 1 + idleSquash + shootSquash;
                const sy = 1 - idleSquash - shootSquash;
                ctx.scale(sx, sy);

                const targetDim = 50 + (this.level - 1) * 6;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // C. 太阳花：后层花瓣持续旋转 + 前层笑脸正立面向玩家
            else if (this.typeKey === 'MUL_CANNON') {
                // 后层：顺滑旋转的花瓣
                ctx.save();
                ctx.rotate(time * 2.0);
                const targetDim = 56 + (this.level - 1) * 8;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();

                // 前层：正立明艳萌笑小脸蛋
                if (sunFaceImg.complete && sunFaceImg.naturalWidth > 0) {
                    const faceSize = 42 + (this.level - 1) * 4;
                    ctx.drawImage(sunFaceImg, -faceSize / 2, -faceSize / 2, faceSize, faceSize);
                }

                // 释放日环时的太阳光晕爆闪
                if (this.recoil > 0) {
                    ctx.save();
                    ctx.fillStyle = 'rgba(255, 235, 59, 0.45)';
                    ctx.beginPath();
                    ctx.arc(0, 0, 28, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
            // D. 星星塔：金光闪烁旋转
            else if (this.typeKey === 'GEOM_LASER') {
                ctx.save();
                ctx.rotate(time * 1.6);
                const targetDim = 52 + (this.level - 1) * 7;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // E. 风扇塔：外壳座立，内部风叶飞速旋转，开炮时狂风呼啸
            else if (this.typeKey === 'FAN') {
                ctx.save();
                const spinSpeed = (this.recoil > 0 ? 22.0 : 4.5);
                ctx.rotate(time * spinSpeed);
                const targetDim = 46 + (this.level - 1) * 7;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // F. 火箭塔：发射架精准旋转对准敌人，发射后坐力微震，装填就绪展示大火箭
            else if (this.typeKey === 'ROCKET') {
                ctx.save();
                ctx.rotate(this.angle + Math.PI / 2);
                if (this.recoil > 0) {
                    ctx.translate(0, this.recoil * 14);
                }
                const targetDim = 52 + (this.level - 1) * 8;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // G. 魔法球 (电塔)：紫水晶球浮空微悬浮 + 充能电弧脉冲光环
            else if (this.typeKey === 'BALL') {
                ctx.save();
                const floatY = Math.sin(time * 3.5) * 2.5;
                ctx.translate(0, floatY);

                if (this.activeBeamTargets && this.activeBeamTargets.length > 0) {
                    ctx.save();
                    ctx.fillStyle = 'rgba(224, 86, 253, 0.35)';
                    ctx.beginPath();
                    ctx.arc(0, 0, 24 + Math.sin(time * 12) * 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }

                const targetDim = 52 + (this.level - 1) * 8;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // H. 火瓶子 (汽油瓶)：待机时笔直站立！开火时朝目标倾斜喷射高能火舌并伴随微颤
            else if (this.typeKey === 'FIRE_BOTTLE') {
                ctx.save();
                const isAttacking = this.target && !this.target.isDead && !this.target.reachedEnd;
                if (isAttacking) {
                    // 攻击状态：瓶口朝向怪物 (瓶口在贴图正上方，旋转角为 this.angle + PI/2)
                    ctx.rotate(this.angle + Math.PI / 2);
                    const tremble = (Math.random() - 0.5) * 2.0;
                    ctx.translate(tremble, (Math.random() - 0.5) * 2.0);
                } else {
                    // 待机状态：稳稳笔直端坐于底盘上，伴随微弱舒缓的呼吸起伏
                    const idleFloat = Math.sin(time * 3.5) * 1.2;
                    ctx.translate(0, idleFloat);
                }
                const targetDim = 52 + (this.level - 1) * 8;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // I. 水晶增益塔 (BUFF)：金色晶核悬浮旋转 + 光环向外脉动扩散
            else if (this.typeKey === 'BUFF') {
                ctx.save();
                const floatY = Math.sin(time * 3) * 2.0;
                ctx.translate(0, floatY);
                const targetDim = 52 + (this.level - 1) * 7;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // J. 蘑菇塔 (MUSHROOM)：端坐于地图上，呼吸萌动与开火弹性起伏
            else if (this.typeKey === 'MUSHROOM') {
                ctx.save();
                const idleSquash = Math.sin(time * 3.5) * 0.05;
                const shootRecoil = this.recoil > 0 ? 0.15 : 0;
                ctx.scale(1 + idleSquash - shootRecoil, 1 - idleSquash + shootRecoil);
                const targetDim = 52 + (this.level - 1) * 7;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // K. 雪花塔 (SNOW)：端坐于底盘上，六角冰晶缓慢旋转
            else if (this.typeKey === 'SNOW') {
                ctx.save();
                ctx.rotate(time * 1.2);
                if (this.recoil > 0) {
                    ctx.scale(1.15, 1.15);
                }
                const targetDim = 52 + (this.level - 1) * 7;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // L. 冰冻星 (BLUE_STAR)：端坐于粉色底座上，冰蓝色五角星持续顺滑旋转
            else if (this.typeKey === 'BLUE_STAR') {
                ctx.save();
                ctx.rotate(time * 1.6);
                if (this.recoil > 0) {
                    ctx.scale(1.12, 1.12);
                }
                const targetDim = 52 + (this.level - 1) * 7;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // M. 章鱼炮 (CUTTLE)：粉萌章鱼端坐于青蓝底盘上，呼吸弹性起伏，开炮时全向射击
            else if (this.typeKey === 'CUTTLE') {
                ctx.save();
                const idleSquash = Math.sin(time * 3.5) * 0.05;
                const shootRecoil = this.recoil > 0 ? (this.recoil * 0.22) : 0;
                ctx.scale(1 + idleSquash + shootRecoil, 1 - idleSquash - shootRecoil);
                const targetDim = 52 + (this.level - 1) * 7;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // N. 毒针塔 (PIN)：立于紫色圆盘底盘上，待机笔直呼吸，开火时针头对准怪物
            else if (this.typeKey === 'PIN') {
                ctx.save();
                const isAttacking = this.target && !this.target.isDead && !this.target.reachedEnd;
                if (isAttacking) {
                    ctx.rotate(this.angle + Math.PI / 2);
                    if (this.recoil > 0) {
                        ctx.translate(0, this.recoil * 6);
                        ctx.scale(1.08, 0.92);
                    }
                } else {
                    const idleFloat = Math.sin(time * 3.5) * 1.2;
                    ctx.translate(0, idleFloat);
                }
                const targetDim = 52 + (this.level - 1) * 7;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // O. 鱼刺塔 (FISH)：立于绿色圆盘底盘上，待机笔直呼吸，开火时尖刺头部突刺戳向怪物
            else if (this.typeKey === 'FISH') {
                ctx.save();
                const isAttacking = this.target && !this.target.isDead && !this.target.reachedEnd;
                if (isAttacking) {
                    ctx.rotate(this.angle + Math.PI / 2);
                    if (this.recoil > 0) {
                        ctx.translate(0, -this.recoil * 12);
                        ctx.scale(0.88, 1.15);
                    }
                } else {
                    const idleFloat = Math.sin(time * 3.5) * 1.5;
                    ctx.translate(0, idleFloat);
                }
                const targetDim = 52 + (this.level - 1) * 7;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            // P. 旋转瞄准型武器 (多重箭、飞机、船锚)：精准朝向怪物 (贴图默认朝右 angle = 0)
            else {
                ctx.save();
                ctx.rotate(this.angle);
                if (this.recoil > 0) {
                    ctx.translate(-this.recoil * 6, 0);
                    ctx.scale(0.92, 1.08);
                }
                const targetDim = 52 + (this.level - 1) * 7;
                const scale = targetDim / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const dw = sprite.naturalWidth * scale;
                const dh = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
        }

        // 5. 等级标识 (Lv.1~Lv.2 显示金色小星星，Lv.3 顶级显示官方 MAX 金色徽章)
        if (this.level >= this.maxLevel) {
            ctx.save();
            ctx.fillStyle = '#ff9f43';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(-16, -34, 32, 14, 7);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('MAX', 0, -27);
            ctx.restore();
        } else {
            for (let i = 0; i < this.level; i++) {
                const starAngle = -Math.PI / 2 + (i - (this.level - 1) / 2) * 0.45;
                const sx = Math.cos(starAngle) * 26;
                const sy = Math.sin(starAngle) * 26;
                ctx.fillStyle = '#ffd32a';
                ctx.strokeStyle = '#d48806';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }

        ctx.restore();

        // 6. 绘制魔法球/电塔的连线追踪电弧射线 (绘制在全局坐标系中，位于炮台上方)
        if (this.typeKey === 'BALL' && this.activeBeamTargets && this.activeBeamTargets.length > 0) {
            this.renderElectricBeams(ctx);
        }

        // 7. 绘制火瓶子的持续猛烈烈焰光柱 (绘制在全局坐标系中，位于炮台上方)
        if (this.typeKey === 'FIRE_BOTTLE' && this.target && !this.target.isDead && !this.target.reachedEnd) {
            this.renderFlameStream(ctx);
        }
    }

    renderElectricBeams(ctx) {
        if (!this.activeBeamTargets || this.activeBeamTargets.length === 0) return;

        ctx.save();
        const startX = this.x;
        const startY = this.y - 4; // 水晶球球心位置

        const time = performance.now() * 0.001;
        const beamFrameIdx = Math.floor(time * 16) % 3;
        const beamImg = ballBeams[beamFrameIdx];

        this.activeBeamTargets.forEach((target, idx) => {
            if (!target || target.isDead || target.reachedEnd) return;

            const endX = target.x;
            const endY = target.y;
            const dx = endX - startX;
            const dy = endY - startY;
            const dist = Math.hypot(dx, dy);
            if (dist < 4) return;
            const ang = Math.atan2(dy, dx);

            // 1. 底层：高亮紫色/品红电离光芒外发光
            ctx.save();
            ctx.strokeStyle = idx === 0 ? 'rgba(224, 86, 253, 0.45)' : 'rgba(162, 155, 254, 0.4)';
            ctx.lineWidth = 8 + Math.sin(time * 25 + idx) * 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.restore();

            // 2. 贴图层：如果有官方闪电贴图，沿朝向绘制拉伸闪电纹理
            if (beamImg && beamImg.complete && beamImg.naturalWidth > 0) {
                ctx.save();
                ctx.translate(startX, startY);
                ctx.rotate(ang);
                const beamH = 16 + (this.level - 1) * 4;
                ctx.globalAlpha = 0.85;
                ctx.drawImage(beamImg, 0, -beamH / 2, dist, beamH);
                ctx.restore();
            }

            // 3. 动态折线闪电核心 (让电弧生动跳跃)
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(startX, startY);

            const segments = Math.max(3, Math.floor(dist / 28));
            for (let i = 1; i < segments; i++) {
                const ratio = i / segments;
                const px = startX + dx * ratio;
                const py = startY + dy * ratio;
                const jitter = (Math.random() - 0.5) * 10;
                const nx = -dy / dist;
                const ny = dx / dist;
                ctx.lineTo(px + nx * jitter, py + ny * jitter);
            }
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.restore();

            // 4. 目标受击电光火花球
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(endX, endY, 6 + Math.random() * 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(224, 86, 253, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(endX, endY, 12 + Math.random() * 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });

        ctx.restore();
    }

    renderFlameStream(ctx) {
        if (!this.target || this.target.isDead || this.target.reachedEnd) return;

        ctx.save();
        const startX = this.x + Math.cos(this.angle) * 16;
        const startY = this.y + Math.sin(this.angle) * 16;
        const endX = this.target.x;
        const endY = this.target.y;
        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.hypot(dx, dy);
        if (dist < 4) { ctx.restore(); return; }
        const ang = Math.atan2(dy, dx);

        const time = performance.now() * 0.001;
        const flameIdx = Math.floor(time * 20) % 2;
        const flameImg = fireFlames[flameIdx];

        // 1. 底层：炙热赤红/橙黄烈焰外发光
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 71, 87, 0.45)';
        ctx.lineWidth = 14 + Math.sin(time * 30) * 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 230, 0, 0.75)';
        ctx.lineWidth = 6 + Math.sin(time * 35) * 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();

        // 2. 贴图层：官方火舌喷射贴图，旋转拉伸
        if (flameImg && flameImg.complete && flameImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(startX, startY);
            ctx.rotate(ang);
            const flameH = 22 + (this.level - 1) * 6;
            ctx.globalAlpha = 0.92;
            ctx.drawImage(flameImg, 0, -flameH / 2, dist, flameH);
            ctx.restore();
        }

        // 3. 目标爆燃受击火球
        ctx.save();
        if (fireHitImg && fireHitImg.complete && fireHitImg.naturalWidth > 0) {
            const hitSize = 36 + Math.sin(time * 25) * 8;
            ctx.drawImage(fireHitImg, endX - hitSize / 2, endY - hitSize / 2, hitSize, hitSize);
        } else {
            ctx.fillStyle = 'rgba(255, 200, 0, 0.9)';
            ctx.beginPath();
            ctx.arc(endX, endY, 10 + Math.random() * 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.restore();
    }
}
