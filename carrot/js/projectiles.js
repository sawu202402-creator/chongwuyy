import { sound } from './audio.js?v=20260928_props_v6';

const BULLET_ASSET_VER = '20260925_all18_v1';
function loadImg(src) {
    const img = new Image();
    img.src = src.includes('?') ? `${src}&v=${BULLET_ASSET_VER}` : `${src}?v=${BULLET_ASSET_VER}`;
    return img;
}

const bulletImgs = {
    bottle: loadImg('assets/official/towers/bullets/bottle_bullet.png'),
    shit: loadImg('assets/official/towers/bullets/shit_bullet.png'),
    star: loadImg('assets/official/towers/bullets/star_bullet.png'),
    starBlast: loadImg('assets/official/towers/bullets/star_blast.png'),
    sunWave: loadImg('assets/official/towers/sun_wave.png'),
    fan: loadImg('assets/official/towers/bullets/fan_bullet.png'),
    rocket: loadImg('assets/official/towers/bullets/rocket_bullet.png'),
    pin: loadImg('assets/official/towers/bullets/pin_bullet.png'),
    arrow: loadImg('assets/official/towers/bullets/arrow_bullet.png'),
    bluestar: loadImg('assets/official/towers/bullets/bluestar_bullet.png'),
    snowWave: loadImg('assets/official/towers/bullets/snow_wave.png'),
    fish: loadImg('assets/official/towers/bullets/fish_bullet.png'),
    planeLaser: loadImg('assets/official/towers/bullets/plane_laser.png'),
    anchor: loadImg('assets/official/towers/bullets/anchor_bullet.png'),
    anchorShard: loadImg('assets/official/towers/bullets/anchor_shard.png'),
    cuttle: loadImg('assets/official/towers/bullets/cuttle_bullet.png'),
    mushroomWave: loadImg('assets/official/towers/bullets/mushroom_wave.png')
};

export class ProjectileSystem {
    constructor() {
        this.projectiles = [];
        this.sunWaves = [];      // 太阳花 360 度扩散日环
        this.snowWaves = [];     // 雪花塔 360 度冰封冲击波
        this.mushroomWaves = []; // 蘑菇塔 360 度毒孢子迷雾
        this.particles = [];
        this.floatingTexts = [];
    }

    clear() {
        this.projectiles = [];
        this.sunWaves = [];
        this.snowWaves = [];
        this.mushroomWaves = [];
        this.particles = [];
        this.floatingTexts = [];
    }

    addProjectile(p) {
        if (this.projectiles.length > 60) {
            this.projectiles.shift();
        }
        this.projectiles.push(p);
    }

    addSunWave(x, y, maxRadius, damage, isCrit = false) {
        if (this.sunWaves.length > 8) this.sunWaves.shift();
        this.sunWaves.push({
            x, y,
            radius: 18,
            maxRadius,
            damage,
            isCrit,
            hitEnemies: new Set(),
            life: 0.35,
            maxLife: 0.35
        });
    }

    addSnowWave(x, y, maxRadius, damage, freezeDuration = 1.8) {
        if (this.snowWaves.length > 6) this.snowWaves.shift();
        this.snowWaves.push({
            x, y,
            radius: 20,
            maxRadius,
            damage,
            freezeDuration,
            hitEnemies: new Set(),
            life: 0.45,
            maxLife: 0.45
        });
    }

    addMushroomWave(x, y, maxRadius, damage, slowPercent = 0.45, slowDuration = 3.0) {
        if (this.mushroomWaves.length > 6) this.mushroomWaves.shift();
        this.mushroomWaves.push({
            x, y,
            radius: 20,
            maxRadius,
            damage,
            slowPercent,
            slowDuration,
            hitEnemies: new Set(),
            life: 0.4,
            maxLife: 0.4
        });
    }

    createExplosion(x, y, color = '#ffd32a', count = 12, maxSpeed = 3.2) {
        // iPad 性能优化：限制全场粒子上限，防止长局粒子爆炸引发 WebKit 掉帧与白屏卡死
        if (this.particles.length > 70) {
            this.particles.splice(0, this.particles.length - 60);
        }
        const spawnCount = Math.min(count, 10);
        for (let i = 0; i < spawnCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * maxSpeed + 0.8;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                radius: Math.random() * 3 + 1.5,
                alpha: 1,
                life: Math.random() * 0.35 + 0.25
            });
        }
    }

    addFloatingText(x, y, text, color = '#ffd32a', fontSize = 16, isCrit = false) {
        // iPad 性能优化：限制全屏飘字上限
        if (this.floatingTexts.length > 20) {
            this.floatingTexts.shift();
        }
        this.floatingTexts.push({
            x: x + (Math.random() * 14 - 7),
            y: y - 10,
            text,
            color,
            fontSize,
            isCrit,
            alpha: 1,
            vy: -1.2,
            life: 0.75
        });
    }

    update(dt, enemies, props = []) {
        // 1. 更新投射物
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];

            // A. 直线穿透 / 射线弹 (风扇叶片、飞机贯通激光)
            if (p.type === 'fan_bullet' || p.type === 'plane_laser') {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life = (p.life || 2.2) - dt;
                if (p.type === 'fan_bullet') {
                    p.spin = (p.spin || 0) + 14.0 * dt;
                }

                // 沿途穿透碰撞所有接触的怪兽 (每个怪兽只伤一次)
                for (const e of enemies) {
                    if (e.isDead || e.reachedEnd || p.hitEnemies.has(e)) continue;
                    const hitRadius = p.type === 'plane_laser' ? 34 : 26;
                    const dist = Math.hypot(e.x - p.x, e.y - p.y);
                    if (dist <= hitRadius + (e.radius || 24)) {
                        p.hitEnemies.add(e);
                        e.takeDamage(p.damage, p.isCrit);
                        const expColor = p.type === 'plane_laser' ? '#a55eea' : '#2ed573';
                        this.createExplosion(e.x, e.y, expColor, 10, 2.5);
                        const icon = p.type === 'plane_laser' ? '✈️' : '🪭';
                        this.addFloatingText(e.x, e.y, `-${p.damage} ${icon}`, expColor, p.isCrit ? 18 : 14, p.isCrit);
                    }
                }

                // 穿透碰撞场景道具
                if (props && props.length > 0) {
                    for (const prop of props) {
                        if (prop.isDead || p.hitEnemies.has(prop)) continue;
                        const hitRadius = p.type === 'plane_laser' ? 34 : 26;
                        const dist = Math.hypot(prop.x - p.x, prop.y - p.y);
                        if (dist <= hitRadius + Math.min(prop.width, prop.height) / 2) {
                            p.hitEnemies.add(prop);
                            prop.takeDamage(p.damage, p.isCrit);
                            const expColor = p.type === 'plane_laser' ? '#a55eea' : '#2ed573';
                            this.createExplosion(prop.x, prop.y, expColor, 10, 2.5);
                            const icon = p.type === 'plane_laser' ? '✈️' : '🪭';
                            this.addFloatingText(prop.x, prop.y, `-${p.damage} ${icon}`, expColor, p.isCrit ? 18 : 14, p.isCrit);
                        }
                    }
                }

                // 出界或寿命结束即销毁
                if (p.life <= 0 || p.x < -100 || p.x > 1060 || p.y < -100 || p.y > 660) {
                    this.projectiles.splice(i, 1);
                }
                continue;
            }

            // A2. 扇形/散弹直线弹 (多重箭 arrow_bullet、章鱼珍珠 cuttle_bullet)
            if (p.type === 'arrow_bullet' || p.type === 'cuttle_bullet') {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life = (p.life || 1.8) - dt;

                let hit = false;
                for (const e of enemies) {
                    if (e.isDead || e.reachedEnd) continue;
                    const dist = Math.hypot(e.x - p.x, e.y - p.y);
                    if (dist <= 18 + (e.radius || 20)) {
                        e.takeDamage(p.damage, p.isCrit);
                        const color = p.type === 'arrow_bullet' ? '#20bf6b' : '#ff9f43';
                        this.createExplosion(e.x, e.y, color, 10, 2.4);
                        const tag = p.type === 'arrow_bullet' ? '🏹' : '🐙';
                        this.addFloatingText(e.x, e.y, `-${p.damage} ${tag}`, color, p.isCrit ? 17 : 14, p.isCrit);
                        hit = true;
                        break;
                    }
                }

                if (hit || p.life <= 0 || p.x < -50 || p.x > 1010 || p.y < -50 || p.y > 610) {
                    this.projectiles.splice(i, 1);
                }
                continue;
            }

            // B. 重型制导追踪火箭 (带尾迹白烟与高爆范围杀伤)
            if (p.type === 'rocket_bullet') {
                let tx = p.targetX;
                let ty = p.targetY;
                if (p.target && !p.target.isDead && !p.target.reachedEnd) {
                    tx = p.target.x;
                    ty = p.target.y;
                    p.targetX = tx;
                    p.targetY = ty;
                }

                const dx = tx - p.x;
                const dy = ty - p.y;
                const dist = Math.hypot(dx, dy);
                p.angle = Math.atan2(dy, dx);

                // 产生尾焰轻烟粒子
                p.smokeTimer = (p.smokeTimer || 0) + dt;
                if (p.smokeTimer >= 0.04) {
                    p.smokeTimer = 0;
                    this.particles.push({
                        x: p.x - Math.cos(p.angle) * 16,
                        y: p.y - Math.sin(p.angle) * 16,
                        vx: (Math.random() - 0.5) * 0.6,
                        vy: (Math.random() - 0.5) * 0.6,
                        color: Math.random() < 0.5 ? '#f1f2f6' : '#ced6e0',
                        radius: Math.random() * 3 + 2,
                        alpha: 0.65,
                        life: 0.35
                    });
                }

                const step = p.speed * dt;

                // 官方原版特色：飞行途中穿透碾压沿途碰到的其他怪兽 (50% 穿透伤)
                p.piercedEnemies = p.piercedEnemies || new Set();
                for (const e of enemies) {
                    if (e.isDead || e.reachedEnd || e === p.target || p.piercedEnemies.has(e)) continue;
                    const d = Math.hypot(e.x - p.x, e.y - p.y);
                    if (d <= 18 + (e.radius || 20)) {
                        p.piercedEnemies.add(e);
                        const pierceDmg = Math.round(p.damage * 0.5);
                        e.takeDamage(pierceDmg, p.isCrit);
                        this.createExplosion(e.x, e.y, '#ff9f43', 8, 2.0);
                        this.addFloatingText(e.x, e.y, `-${pierceDmg} 🚀`, '#ff6b6b', 13);
                    }
                }

                if (dist <= step || dist < 16) {
                    this.hitTarget(p, enemies);
                    this.projectiles.splice(i, 1);
                } else {
                    p.x += (dx / dist) * step;
                    p.y += (dy / dist) * step;
                }
                continue;
            }

            // C. 常规单体追踪弹 (瓶子炮、便便、星星)
            if (!p.target || p.target.isDead) {
                this.projectiles.splice(i, 1);
                continue;
            }

            const dx = p.target.x - p.x;
            const dy = p.target.y - p.y;
            const dist = Math.hypot(dx, dy);

            const step = p.speed * dt;
            const hitThreshold = (p.target && p.target.wCells ? Math.min(p.target.width, p.target.height) * 0.36 : 14);
            if (dist <= step || dist <= hitThreshold) {
                this.hitTarget(p, enemies, props);
                this.projectiles.splice(i, 1);
            } else {
                p.x += (dx / dist) * step;
                p.y += (dy / dist) * step;
                p.angle = Math.atan2(dy, dx);
            }
        }

        // 2. 更新太阳花全方位 360 度扩散日环
        for (let i = this.sunWaves.length - 1; i >= 0; i--) {
            const w = this.sunWaves[i];
            w.life -= dt;
            const progress = 1 - (w.life / w.maxLife);
            w.radius = 18 + (w.maxRadius - 18) * progress;

            // 检查日环触碰的全部怪兽
            for (const e of enemies) {
                if (e.isDead || e.reachedEnd || w.hitEnemies.has(e)) continue;
                const d = Math.hypot(e.x - w.x, e.y - w.y);
                if (d <= w.radius + 16) {
                    w.hitEnemies.add(e);
                    e.takeDamage(w.damage, w.isCrit);
                    this.createExplosion(e.x, e.y, '#ffa502', 14, 2.8);
                    this.addFloatingText(e.x, e.y, `-${w.damage} ☀️`, '#ff9f43', w.isCrit ? 19 : 14, w.isCrit);
                }
            }

            // 检查日环触碰的场景道具
            if (props && props.length > 0) {
                for (const prop of props) {
                    if (prop.isDead || w.hitEnemies.has(prop)) continue;
                    const d = Math.hypot(prop.x - w.x, prop.y - w.y);
                    if (d <= w.radius + Math.min(prop.width, prop.height) / 2) {
                        w.hitEnemies.add(prop);
                        prop.takeDamage(w.damage, w.isCrit);
                        this.createExplosion(prop.x, prop.y, '#ffa502', 12, 2.5);
                        this.addFloatingText(prop.x, prop.y, `-${w.damage} ☀️`, '#ff9f43', w.isCrit ? 19 : 14, w.isCrit);
                    }
                }
            }

            if (w.life <= 0) {
                this.sunWaves.splice(i, 1);
            }
        }

        // 2B. 更新雪花塔全屏 360 度冰封冲击波
        for (let i = this.snowWaves.length - 1; i >= 0; i--) {
            const w = this.snowWaves[i];
            w.life -= dt;
            const progress = 1 - (w.life / w.maxLife);
            w.radius = 20 + (w.maxRadius - 20) * progress;

            for (const e of enemies) {
                if (e.isDead || e.reachedEnd || w.hitEnemies.has(e)) continue;
                const d = Math.hypot(e.x - w.x, e.y - w.y);
                if (d <= w.radius + 18) {
                    w.hitEnemies.add(e);
                    e.takeDamage(w.damage);
                    e.applyFreeze(w.freezeDuration || 1.8);
                    this.createExplosion(e.x, e.y, '#48dbfb', 14, 2.5);
                    this.addFloatingText(e.x, e.y, `冰封! ❄️`, '#0abde3', 15);
                }
            }

            if (w.life <= 0) {
                this.snowWaves.splice(i, 1);
            }
        }

        // 2C. 更新蘑菇塔 360 度毒孢子迷雾 (附带赏金标记)
        for (let i = this.mushroomWaves.length - 1; i >= 0; i--) {
            const w = this.mushroomWaves[i];
            w.life -= dt;
            const progress = 1 - (w.life / w.maxLife);
            w.radius = 20 + (w.maxRadius - 20) * progress;

            for (const e of enemies) {
                if (e.isDead || e.reachedEnd || w.hitEnemies.has(e)) continue;
                const d = Math.hypot(e.x - w.x, e.y - w.y);
                if (d <= w.radius + 18) {
                    w.hitEnemies.add(e);
                    e.takeDamage(w.damage);
                    e.applySlow(w.slowPercent || 0.45, w.slowDuration || 3.0);
                    e.hasMushroomBounty = true;
                    this.createExplosion(e.x, e.y, '#10ac84', 12, 2.5);
                    this.addFloatingText(e.x, e.y, `赏金标记! 🍄`, '#1dd1a1', 14);
                }
            }

            if (w.life <= 0) {
                this.mushroomWaves.splice(i, 1);
            }
        }

        // 3. 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.life -= dt;
            pt.alpha = Math.max(0, pt.life / 0.5);
            if (pt.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 4. 更新飘字
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.life -= dt;
            ft.alpha = Math.max(0, ft.life / 0.8);
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    hitTarget(p, enemies, props = []) {
        if (p.type === 'rocket_bullet') {
            // 火箭炮重型群体范围高爆杀伤
            this.createExplosion(p.x, p.y, '#ff4757', 26, 4.8);
            this.createExplosion(p.x, p.y, '#ffa502', 18, 3.2);
            const splashRadius = p.splashRadius || 75;
            for (const e of enemies) {
                if (e.isDead || e.reachedEnd) continue;
                const d = Math.hypot(e.x - p.x, e.y - p.y);
                if (d <= splashRadius) {
                    const isDirect = (p.target && e === p.target);
                    const dmg = isDirect ? p.damage : Math.round(p.damage * 0.75);
                    e.takeDamage(dmg, p.isCrit);
                    this.addFloatingText(e.x, e.y, `-${dmg} 🚀`, '#ff4757', p.isCrit ? 19 : 14, p.isCrit);
                }
            }
            if (props && props.length > 0) {
                for (const prop of props) {
                    if (prop.isDead) continue;
                    const d = Math.hypot(prop.x - p.x, prop.y - p.y);
                    if (d <= splashRadius + Math.min(prop.width, prop.height) / 2) {
                        const isDirect = (p.target && prop === p.target);
                        const dmg = isDirect ? p.damage : Math.round(p.damage * 0.75);
                        prop.takeDamage(dmg, p.isCrit);
                        sound.playPropHit();
                        if (p.isCrit) {
                            this.addFloatingText(prop.x, prop.y - 14, `-${dmg} 🚀`, '#ff4757', 18, true);
                        }
                    }
                }
            }
        } else if (p.type === 'star_bullet') {
            // 星星塔范围 AoE 溅射爆炸
            this.createExplosion(p.x, p.y, '#ffd32a', 22, 3.8);
            const splashRadius = p.splashRadius || 60;
            for (const e of enemies) {
                const d = Math.hypot(e.x - p.x, e.y - p.y);
                if (d <= splashRadius) {
                    const dmg = (e === p.target) ? p.damage : Math.round(p.damage * 0.7);
                    e.takeDamage(dmg, p.isCrit);
                    this.addFloatingText(e.x, e.y, `-${dmg} ⭐`, '#ffd32a', p.isCrit ? 18 : 14, p.isCrit);
                }
            }
            if (props && props.length > 0) {
                for (const prop of props) {
                    if (prop.isDead) continue;
                    const d = Math.hypot(prop.x - p.x, prop.y - p.y);
                    if (d <= splashRadius + Math.min(prop.width, prop.height) / 2) {
                        const dmg = (prop === p.target) ? p.damage : Math.round(p.damage * 0.7);
                        prop.takeDamage(dmg, p.isCrit);
                        sound.playPropHit();
                        if (p.isCrit) {
                            this.addFloatingText(prop.x, prop.y - 14, `-${dmg} ⭐`, '#ffd32a', 18, true);
                        }
                    }
                }
            }
        } else if (p.type === 'shit_bullet') {
            // 便便泥浆强力减速 50%
            const isProp = Boolean(p.target && p.target.wCells);
            if (isProp) {
                sound.playPropHit();
                this.createExplosion(p.x, p.y, '#833471', 14, 2.4);
                p.target.takeDamage(p.damage, p.isCrit);
                if (p.isCrit) {
                    this.addFloatingText(p.target.x, p.target.y - 14, `-${p.damage} 💩`, '#833471', 17, true);
                }
            } else {
                this.createExplosion(p.x, p.y, '#833471', 16, 2.5);
                p.target.takeDamage(p.damage, p.isCrit);
                p.target.applySlow(p.slowPercent || 0.5, p.slowDuration || 2.5);
                this.addFloatingText(p.target.x, p.target.y, `-${p.damage} 💩`, '#833471', 14);
            }
        } else if (p.type === 'pin_bullet') {
            // 毒针塔：单体伤害 + 强力减速 + 5次猛毒 DoT
            const isProp = Boolean(p.target && p.target.wCells);
            if (isProp) {
                sound.playPropHit();
                this.createExplosion(p.x, p.y, '#a55eea', 14, 2.4);
                p.target.takeDamage(p.damage, p.isCrit);
                if (p.isCrit) {
                    this.addFloatingText(p.target.x, p.target.y - 14, `-${p.damage} 💉`, '#8854d0', 17, true);
                }
            } else {
                this.createExplosion(p.x, p.y, '#a55eea', 16, 2.8);
                p.target.takeDamage(p.damage, p.isCrit);
                p.target.applySlow(p.slowPercent || 0.35, p.slowDuration || 3.0);
                p.target.applyPoison(p.dotTicks || 5, p.dotDamage || 10);
                this.addFloatingText(p.target.x, p.target.y, `-${p.damage} 💉`, '#8854d0', 14);
            }
        } else if (p.type === 'bluestar_bullet') {
            // 冰冻星：范围冰爆溅射，大范围减速 55%
            this.createExplosion(p.x, p.y, '#00d2d3', 24, 3.8);
            const splashRadius = p.splashRadius || 75;
            for (const e of enemies) {
                if (e.isDead || e.reachedEnd) continue;
                const d = Math.hypot(e.x - p.x, e.y - p.y);
                if (d <= splashRadius) {
                    const dmg = (e === p.target) ? p.damage : Math.round(p.damage * 0.7);
                    e.takeDamage(dmg, p.isCrit);
                    e.applySlow(p.slowPercent || 0.55, p.slowDuration || 2.5);
                    this.addFloatingText(e.x, e.y, `-${dmg} ❄️`, '#00d2d3', p.isCrit ? 18 : 14, p.isCrit);
                }
            }
        } else if (p.type === 'fish_bullet') {
            // 鱼刺塔：高额单体穿刺 + 35% 几率击晕眩晕 1.2s
            const isProp = Boolean(p.target && p.target.wCells);
            if (isProp) {
                sound.playPropHit();
                this.createExplosion(p.x, p.y, '#ff9ff3', 15, 2.6);
                p.target.takeDamage(p.damage, p.isCrit);
                if (p.isCrit) {
                    this.addFloatingText(p.target.x, p.target.y - 14, `-${p.damage} 🐟`, '#f368e0', 18, true);
                }
            } else {
                this.createExplosion(p.x, p.y, '#ff9ff3', 18, 3.2);
                p.target.takeDamage(p.damage, p.isCrit);
                if (Math.random() < (p.stunChance || 0.35)) {
                    p.target.applyStun(p.stunDuration || 1.2);
                    this.addFloatingText(p.target.x, p.target.y - 18, '眩晕! 💫', '#ff9ff3', 16);
                }
                this.addFloatingText(p.target.x, p.target.y, `-${p.damage} 🐟`, '#f368e0', p.isCrit ? 19 : 15, p.isCrit);
            }
        } else if (p.type === 'anchor_bullet') {
            // 船锚炸弹：重锚轰击，命中后碎裂分叉 2~3 枚飞锚追击场上其他怪兽！
            this.createExplosion(p.x, p.y, '#ee5253', 22, 3.6);
            p.target.takeDamage(p.damage, p.isCrit);
            this.addFloatingText(p.target.x, p.target.y, `-${p.damage} ⚓`, '#ff6b6b', 16);

            // 分叉碎裂飞锚
            const others = enemies.filter(e => !e.isDead && !e.reachedEnd && e !== p.target);
            for (let k = 0; k < Math.min(3, others.length); k++) {
                const subTarget = others[k];
                this.projectiles.push({
                    type: 'anchor_shard',
                    x: p.x,
                    y: p.y,
                    speed: 420,
                    damage: Math.round(p.damage * 0.6),
                    target: subTarget,
                    isCrit: false
                });
            }
        } else if (p.type === 'anchor_shard') {
            this.createExplosion(p.x, p.y, '#ee5253', 12, 2.2);
            p.target.takeDamage(p.damage, p.isCrit);
            this.addFloatingText(p.target.x, p.target.y, `-${p.damage} ⚓`, '#ff6b6b', 13);
        } else {
            // 瓶子炮高速暴击火能弹
            const isProp = Boolean(p.target && p.target.wCells);
            if (isProp) {
                sound.playPropHit();
                this.createExplosion(p.x, p.y, '#2ed573', 13, 2.6);
                p.target.takeDamage(p.damage, p.isCrit);
                if (p.isCrit) {
                    this.addFloatingText(p.target.x, p.target.y - 14, `-${p.damage} 💥`, '#ffd32a', 18, true);
                }
            } else {
                this.createExplosion(p.x, p.y, '#2ed573', 12, 2.6);
                p.target.takeDamage(p.damage, p.isCrit);
                this.addFloatingText(p.target.x, p.target.y, `-${p.damage}`, p.isCrit ? '#ffd32a' : '#ffffff', p.isCrit ? 17 : 14, p.isCrit);
            }
        }
    }

    draw(ctx) {
        ctx.save();

        // 1. 绘制太阳花 360 度烈焰日环波纹
        for (const w of this.sunWaves) {
            ctx.save();
            ctx.translate(w.x, w.y);
            const alpha = Math.max(0, w.life / w.maxLife);
            ctx.globalAlpha = alpha * 0.9;
            const img = bulletImgs.sunWave;
            if (img.complete && img.naturalWidth > 0) {
                const dia = w.radius * 2;
                ctx.drawImage(img, -w.radius, -w.radius, dia, dia);
            } else {
                ctx.strokeStyle = '#ffa502';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(0, 0, w.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        // 2. 绘制子弹投射物
        for (const p of this.projectiles) {
            ctx.save();
            ctx.translate(p.x, p.y);

            if (p.type === 'bottle_bullet') {
                // 瓶子炮官方火球能量弹 (指向运动方向)
                ctx.rotate(p.angle || 0);
                const img = bulletImgs.bottle;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -14, -8, 28, 16);
                } else {
                    ctx.fillStyle = '#2ed573';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 9, 4.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (p.type === 'shit_bullet') {
                // 便便泥浆弹
                ctx.rotate((p.angle || 0) + Math.PI / 2);
                const img = bulletImgs.shit;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -11, -12, 22, 24);
                } else {
                    ctx.fillStyle = '#833471';
                    ctx.beginPath();
                    ctx.arc(0, 0, 7, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (p.type === 'star_bullet') {
                // 星星弹 (飞旋自转)
                p.spin = (p.spin || 0) + 0.3;
                ctx.rotate(p.spin);
                const img = bulletImgs.star;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -11, -11, 22, 22);
                } else {
                    ctx.fillStyle = '#ffd32a';
                    ctx.beginPath();
                    ctx.arc(0, 0, 7, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (p.type === 'fan_bullet') {
                // 风扇叶片飞速旋动穿透
                ctx.rotate(p.spin || 0);
                const img = bulletImgs.fan;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -15, -15, 30, 30);
                } else {
                    ctx.fillStyle = '#2ed573';
                    ctx.beginPath();
                    ctx.arc(0, 0, 10, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (p.type === 'rocket_bullet') {
                // 重型火箭弹 (沿航向飞行，鼻尖朝前，带火焰尾羽)
                ctx.rotate((p.angle || 0) + Math.PI / 2);
                const img = bulletImgs.rocket;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -13, -24, 26, 48);
                } else {
                    ctx.fillStyle = '#ff4757';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 7, 16, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (p.type === 'pin_bullet') {
                ctx.rotate(p.angle || 0);
                const img = bulletImgs.pin;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -14, -6, 28, 12);
                } else {
                    ctx.fillStyle = '#a55eea';
                    ctx.fillRect(-10, -3, 20, 6);
                }
            } else if (p.type === 'arrow_bullet') {
                ctx.rotate(p.angle || 0);
                const img = bulletImgs.arrow;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -12, -12, 24, 24);
                } else {
                    ctx.fillStyle = '#20bf6b';
                    ctx.fillRect(-8, -2, 16, 4);
                }
            } else if (p.type === 'bluestar_bullet') {
                p.spin = (p.spin || 0) + 0.3;
                ctx.rotate(p.spin);
                const img = bulletImgs.bluestar;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -12, -12, 24, 24);
                } else {
                    ctx.fillStyle = '#00d2d3';
                    ctx.beginPath();
                    ctx.arc(0, 0, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (p.type === 'fish_bullet') {
                ctx.rotate(p.angle || 0);
                const img = bulletImgs.fish;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -16, -11, 32, 22);
                } else {
                    ctx.fillStyle = '#ff9ff3';
                    ctx.fillRect(-12, -4, 24, 8);
                }
            } else if (p.type === 'plane_laser') {
                ctx.rotate(p.angle || 0);
                const img = bulletImgs.planeLaser;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -24, -10, 48, 20);
                } else {
                    ctx.fillStyle = '#5f27cd';
                    ctx.fillRect(-20, -5, 40, 10);
                }
            } else if (p.type === 'anchor_bullet') {
                p.spin = (p.spin || 0) + 0.25;
                ctx.rotate(p.spin);
                const img = bulletImgs.anchor;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -15, -15, 30, 30);
                } else {
                    ctx.fillStyle = '#ee5253';
                    ctx.fillRect(-10, -10, 20, 20);
                }
            } else if (p.type === 'anchor_shard') {
                p.spin = (p.spin || 0) + 0.35;
                ctx.rotate(p.spin);
                const img = bulletImgs.anchorShard;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -10, -10, 20, 20);
                } else {
                    ctx.fillStyle = '#ff6b6b';
                    ctx.fillRect(-6, -6, 12, 12);
                }
            } else if (p.type === 'cuttle_bullet') {
                const img = bulletImgs.cuttle;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -9, -9, 18, 18);
                } else {
                    ctx.fillStyle = '#ff9f43';
                    ctx.beginPath();
                    ctx.arc(0, 0, 7, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        // 3. 绘制雪花塔冲击波与蘑菇塔孢子云
        for (const w of this.snowWaves) {
            ctx.save();
            ctx.translate(w.x, w.y);
            const alpha = Math.max(0, w.life / w.maxLife);
            ctx.globalAlpha = alpha * 0.95;
            const img = bulletImgs.snowWave;
            if (img.complete && img.naturalWidth > 0) {
                const dia = w.radius * 2;
                ctx.drawImage(img, -w.radius, -w.radius, dia, dia);
            }
            ctx.restore();
        }

        for (const w of this.mushroomWaves) {
            ctx.save();
            ctx.translate(w.x, w.y);
            const alpha = Math.max(0, w.life / w.maxLife);
            ctx.globalAlpha = alpha * 0.9;
            const img = bulletImgs.mushroomWave;
            if (img.complete && img.naturalWidth > 0) {
                const dia = w.radius * 2;
                ctx.drawImage(img, -w.radius, -w.radius, dia, dia);
            }
            ctx.restore();
        }
        ctx.restore();

        // 粒子
        ctx.save();
        for (const pt of this.particles) {
            ctx.globalAlpha = pt.alpha;
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // 飘字 (使用 strokeText 替代昂贵且引发 iPad WebKit 显存泄露的 shadowBlur)
        ctx.save();
        for (const ft of this.floatingTexts) {
            ctx.globalAlpha = ft.alpha;
            ctx.font = `${ft.isCrit ? '900 ' : '700 '}${ft.fontSize}px "Fredoka", sans-serif`;
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.lineWidth = 3;
            ctx.strokeText(ft.text, ft.x, ft.y);
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.restore();
    }
}
