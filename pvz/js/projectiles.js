/**
 * projectiles.js - 子弹、投掷物、爆炸粒子、飘字与阳光飞行动画系统
 */
import { assetsLoader } from './assetsLoader.js?v=20261113_v2';
import { soundEngine } from './audio.js?v=20261113_v2';

export class Projectile {
    constructor(row, x, y, type = 'pea', damage = 20, isSlow = false, maxRange = 960, customSpeed = null) {
        this.row = row;
        this.startX = x;
        this.x = x;
        this.y = y;
        this.type = type;
        this.damage = damage;
        this.isSlow = isSlow;
        this.maxRange = maxRange;
        this.speed = customSpeed !== null ? customSpeed : (type === 'shroom' ? 320 : (type === 'thorn' ? 420 : 360)); // 像素/秒
        this.radius = 12;
        this.isDead = false;
        this.isFire = type === 'fire_pea';
        if (type === 'snow_pea') {
            this.anim = 'assets/projectiles/snow_pea.gif';
        } else if (type === 'shroom') {
            this.anim = 'assets/projectiles/shroom_bullet.gif';
        } else if (type === 'fire_pea') {
            this.anim = 'assets/projectiles/fire_pea.gif';
        } else if (type === 'thorn') {
            this.anim = 'assets/projectiles/cactus_thorn.png';
        } else {
            this.anim = 'assets/projectiles/pea.gif';
        }
    }

    update(dt) {
        this.x += this.speed * dt;
        if (this.x < -40 || this.x > 960 || Math.abs(this.x - this.startX) >= this.maxRange) {
            this.isDead = true;
        }
    }

    render(ctx) {
        const img = assetsLoader.getImage(this.anim);
        if (this.isFire) {
            if (img && img.complete) {
                ctx.save();
                if (this.speed < 0) {
                    ctx.translate(this.x, this.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(img, -24, -14, 48, 28);
                } else {
                    ctx.drawImage(img, this.x - 24, this.y - 14, 48, 28);
                }
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 14, 0, Math.PI * 2);
                ctx.fillStyle = '#e74c3c';
                ctx.fill();
            }
            return;
        }

        if (img && img.complete) {
            if (this.type === 'shroom') {
                // 原版 66x32 紫色孢子弹：球体中心在右侧 (45, 10.5)，左侧带紫色拖尾烟雾
                ctx.drawImage(img, this.x - 33, this.y - 8, 48, 23);
            } else if (this.type === 'thorn') {
                ctx.drawImage(img, this.x - 15, this.y - 8, 30, 16);
            } else {
                ctx.drawImage(img, this.x - 14, this.y - 14, 28, 28);
            }
        } else {
            // 兜底绘制球形子弹
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.type === 'shroom' ? '#9b59b6' : (this.isSlow ? '#38ef7d' : '#2ecc71');
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        }
    }
}

// 命中击碎火花 / 豌豆飞溅 / 孢子碎裂 / 西瓜爆浆 / 黄油飞溅效果
export class HitSplat {
    constructor(x, y, type = 'pea') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.age = 0;
        this.lifespan = (type === 'melon' || type === 'winter_melon') ? 0.36 : (type === 'butter' ? 0.28 : 0.2);
        this.isDead = false;
        this.anim = type === 'shroom' ? 'assets/projectiles/shroom_splat.gif' : 'assets/projectiles/pea_splat.gif';
    }

    update(dt) {
        this.age += dt;
        if (this.age >= this.lifespan) {
            this.isDead = true;
        }
    }

    render(ctx) {
        const p = Math.min(1, this.age / this.lifespan);
        const alpha = Math.max(0, 1 - p);

        if (this.type === 'melon' || this.type === 'winter_melon') {
            const isWinter = this.type === 'winter_melon';
            ctx.save();
            ctx.globalAlpha = alpha;
            // 3x3 西瓜汁 / 极寒冰瓜霜环扩散冲击波
            ctx.strokeStyle = isWinter ? 'rgba(72, 219, 251, 0.82)' : 'rgba(231, 76, 60, 0.72)';
            ctx.lineWidth = 3.8;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y + 8, 22 + p * 58, 12 + p * 28, 0, 0, Math.PI * 2);
            ctx.stroke();

            // 飞溅的瓜皮与瓜瓤/冰晶碎块
            for (let i = 0; i < 8; i++) {
                const ang = (i / 8) * Math.PI * 2 + 0.3;
                const dist = 8 + p * 44;
                const sx = this.x + Math.cos(ang) * dist;
                const sy = this.y + Math.sin(ang) * dist * 0.75 + p * p * 14;
                ctx.fillStyle = isWinter
                    ? (i % 2 === 0 ? '#74b9ff' : '#0984e3')
                    : (i % 2 === 0 ? '#e74c3c' : '#27ae60');
                ctx.beginPath();
                ctx.arc(sx, sy, (1 - p * 0.45) * (i % 2 === 0 ? 6.5 : 5.5), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            return;
        }

        if (this.type === 'butter' || this.type === 'corn' || this.type === 'basketball') {
            const mainColor = this.type === 'basketball' ? '#e67e22' : (this.type === 'butter' ? '#f1c40f' : '#f9ca24');
            ctx.save();
            ctx.globalAlpha = alpha;
            for (let i = 0; i < 6; i++) {
                const ang = (i / 6) * Math.PI * 2 + 0.4;
                const dist = 6 + p * (this.type === 'butter' ? 28 : 20);
                ctx.fillStyle = mainColor;
                ctx.beginPath();
                ctx.arc(
                    this.x + Math.cos(ang) * dist,
                    this.y + Math.sin(ang) * dist * 0.8,
                    (1 - p * 0.4) * (this.type === 'butter' ? 5.5 : 4),
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
            ctx.restore();
            return;
        }

        const img = assetsLoader.getImage(this.anim);
        if (img && img.complete && this.type !== 'dirt' && this.type !== 'nut' && this.type !== 'stone') {
            ctx.save();
            ctx.globalAlpha = Math.min(1, alpha * 1.25);
            const sz = this.type === 'cabbage' ? 46 : 40;
            ctx.drawImage(img, this.x - sz / 2, this.y - sz / 2, sz, sz);
            ctx.restore();
        } else {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 16 * (1 - p * 0.6), 0, Math.PI * 2);
            ctx.fillStyle = this.type === 'snow'
                ? 'rgba(74, 189, 255, 0.85)'
                : (this.type === 'shroom'
                    ? 'rgba(155, 89, 182, 0.85)'
                    : (this.type === 'dirt' || this.type === 'nut'
                        ? 'rgba(189, 155, 118, 0.7)'
                        : 'rgba(46, 204, 113, 0.85)'));
            ctx.fill();
            ctx.restore();
        }
    }
}

// 大喷菇穿透孢子云雾 (原版 343x496 纵向 8 帧逐帧动画精灵条)
export class FumeCloud {
    constructor(row, x, y, range = 340, damage = 20) {
        this.row = row;
        this.x = x;
        this.y = y;
        this.range = range;
        this.damage = damage;
        this.age = 0;
        this.lifespan = 0.64;
        this.isDead = false;
        this.anim = 'assets/projectiles/fume_cloud.gif';
        this.hitZombies = new Set();
    }

    update(dt, engine) {
        this.age += dt;
        if (this.age >= this.lifespan) {
            this.isDead = true;
            return;
        }

        // 贯穿攻击：直线 range 距离内所有敌方僵尸受伤害（穿透铁栅门/报纸等前向护盾，不无视铁桶/路障/橄榄球头盔）
        if (engine && engine.zombies) {
            engine.zombies.forEach(z => {
                if (
                    z.row === this.row && !z.isDead && !z.isHypnotized && !this.hitZombies.has(z.id) &&
                    !(z.type === 'bungee' && (z.bungeePhase === 'init' || z.bungeePhase === 'targeting' || z.bungeeOffsetY < -190))
                ) {
                    if (z.x >= this.x - 20 && z.x <= this.x + this.range) {
                        this.hitZombies.add(z.id);
                        if (typeof z.takeFumeDamage === 'function') {
                            z.takeFumeDamage(this.damage);
                        } else {
                            z.takeDamage(this.damage);
                        }
                    }
                }
            });
        }
    }

    render(ctx) {
        const img = assetsLoader.getImage(this.anim);
        if (img && img.complete && img.naturalHeight >= 400) {
            // 原版 ShroomBullet/FumeCloud 为纵向拼接的 8 帧条带 (每帧 343x62)
            const totalFrames = 8;
            const frameW = img.naturalWidth || 343;
            const frameH = Math.floor(img.naturalHeight / totalFrames);
            const frameIdx = Math.min(totalFrames - 1, Math.floor((this.age / this.lifespan) * totalFrames));
            const fadeAlpha = this.age > this.lifespan * 0.78
                ? Math.max(0.2, (this.lifespan - this.age) / (this.lifespan * 0.22))
                : 0.96;
            ctx.save();
            ctx.globalAlpha = fadeAlpha;
            ctx.drawImage(
                img,
                0, frameIdx * frameH, frameW, frameH,
                this.x, this.y - frameH / 2, this.range, frameH
            );
            ctx.restore();
        } else if (img && img.complete) {
            const h = 62;
            ctx.drawImage(img, this.x, this.y - h / 2, this.range, h);
        } else {
            ctx.save();
            ctx.fillStyle = 'rgba(165, 55, 253, 0.45)';
            ctx.fillRect(this.x, this.y - 25, this.range, 50);
            ctx.restore();
        }
    }
}

// 爆炸效果 (樱桃炸弹 / 土豆地雷 / 毁灭菇核爆)
export class ExplosionEffect {
    constructor(x, y, type = 'cherry') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.age = 0;
        this.lifespan = type === 'doom' ? 2.4 : (type === 'potato' ? 0.85 : (type === 'cherry' ? 0.75 : 0.6));
        this.isDead = false;
        if (type === 'doom') {
            this.anim = 'assets/projectiles/doom_cloud.png';
        } else if (type === 'cherry') {
            this.anim = 'assets/projectiles/cherry_boom.gif';
        } else {
            this.anim = 'assets/projectiles/spudow.gif';
            this.mashedAnim = 'assets/projectiles/potatomine_mashed.gif';
        }
    }

    update(dt) {
        this.age += dt;
        if (this.age >= this.lifespan) {
            this.isDead = true;
        }
    }

    render(ctx) {
        if (this.type === 'ice') {
            const alpha = Math.max(0, (this.lifespan - this.age) / this.lifespan);
            ctx.save();
            ctx.fillStyle = `rgba(130, 215, 255, ${0.45 * alpha})`;
            ctx.fillRect(0, 0, ctx.canvas.width || 960, ctx.canvas.height || 640);
            ctx.restore();
            return;
        }

        if (this.type === 'doom') {
            // 1. 前 0.4 秒全屏强光白闪/紫闪
            if (this.age < 0.4) {
                const flashAlpha = (0.4 - this.age) / 0.4;
                ctx.save();
                ctx.fillStyle = `rgba(235, 210, 255, ${0.85 * flashAlpha})`;
                ctx.fillRect(0, 0, ctx.canvas.width || 960, ctx.canvas.height || 640);
                ctx.restore();
            }

            // 2. 拔地而起的巨型暗紫核爆蘑菇云
            const img = assetsLoader.getImage(this.anim);
            if (img && img.complete) {
                ctx.save();
                // 向上膨胀升腾动画
                const growProgress = Math.min(1.0, this.age / 0.7);
                const scale = 0.35 + 0.65 * Math.sin(growProgress * Math.PI / 2);
                const riseY = (1 - growProgress) * 40;
                
                // 晚期消散淡出
                let alpha = 1.0;
                if (this.age > 1.4) {
                    alpha = Math.max(0, (this.lifespan - this.age) / (this.lifespan - 1.4));
                }
                ctx.globalAlpha = alpha;
                
                const cloudW = 280 * scale;
                const cloudH = 345 * scale;
                // 蘑菇云底部坐落于爆炸中心
                ctx.drawImage(img, this.x - cloudW / 2, this.y - cloudH + 30 + riseY, cloudW, cloudH);
                ctx.restore();
            }
            return;
        }

        if (this.type === 'potato') {
            const mashedImg = assetsLoader.getImage(this.mashedAnim || 'assets/projectiles/potatomine_mashed.gif');
            const spudowImg = assetsLoader.getImage(this.anim);
            const alpha = this.age > this.lifespan * 0.7
                ? Math.max(0, (this.lifespan - this.age) / (this.lifespan * 0.3))
                : 1.0;
            const popScale = Math.min(1.08, 0.65 + (this.age / 0.18) * 0.43);
            ctx.save();
            ctx.globalAlpha = alpha;
            if (mashedImg && mashedImg.complete) {
                const mw = 132 * popScale;
                const mh = 93 * popScale;
                ctx.drawImage(mashedImg, this.x - mw / 2, this.y - mh / 2 + 4, mw, mh);
            }
            if (spudowImg && spudowImg.complete) {
                const sw = 168;
                const sh = 52;
                const rise = Math.min(14, this.age * 24);
                ctx.drawImage(spudowImg, this.x - sw / 2, this.y - 54 - rise, sw, sh);
            }
            ctx.restore();
            return;
        }

        const img = assetsLoader.getImage(this.anim);
        const w = this.type === 'cherry' ? 180 : 130;
        const h = this.type === 'cherry' ? 180 : 130;
        if (img && img.complete) {
            ctx.drawImage(img, this.x - w / 2, this.y - h / 2, w, h);
        } else {
            const alpha = 1 - this.age / this.lifespan;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, w / 2, 0, Math.PI * 2);
            ctx.fillStyle = this.type === 'cherry' ? '#ff4757' : '#e67e22';
            ctx.fill();
            ctx.restore();
        }
    }
}

// 阳光与钱币实体 (自然掉落 / 向日葵产出 / 金盏花银币金币 / 算术超级阳光)
export class SunEntity {
    constructor(startX, startY, targetY, value = 25, isMathSuper = false, container = null, engine = null, coinType = null) {
        this.x = startX;
        this.y = startY;
        this.targetY = targetY;
        this.value = value;
        this.isMathSuper = isMathSuper;
        this.coinType = coinType; // null | 'silver' | 'gold'
        this.isCoin = !!coinType;
        this.speedY = isMathSuper ? 130 : (this.isCoin ? 95 : 75);
        this.anim = coinType === 'gold'
            ? 'assets/ui/coin_gold.png'
            : (coinType === 'silver' ? 'assets/ui/coin_silver.png' : 'assets/ui/sun.gif');
        this.isSmallSun = !isMathSuper && !this.isCoin && value < 25;
        // 原版规格：银币 50px(r25)，金币 56px(r28)，小阳光 56px(r28)，标准阳光 78px(r39)，超级阳光 96px(r48)
        this.radius = isMathSuper ? 48 : (coinType === 'gold' ? 28 : (coinType === 'silver' ? 25 : (this.isSmallSun ? 28 : 39)));
        this.age = 0;
        this.lifespan = 12.0; // 地面停留12秒未拾取自动飞入收集
        this.isCollecting = false;
        this.collectProgress = 0;
        this.isDead = false;
        this.scale = 0.5; // 出生弹性放大
        this.container = container || (typeof document !== 'undefined' ? document.getElementById('sunLayer') : null);
        this.engine = engine;
        this.domElement = null;

        if (this.container) {
            this.createDOM();
        }
    }

    createDOM() {
        if (!this.container || typeof document === 'undefined') return;
        this.domElement = document.createElement('div');
        const extraCls = this.isCoin
            ? ` coin-entity ${this.coinType === 'gold' ? 'gold-coin' : 'silver-coin'}`
            : (this.isMathSuper ? ' super-sun' : (this.isSmallSun ? ' small-sun' : ''));
        this.domElement.className = `sun-entity${extraCls}`;
        this.domElement.innerHTML = `
            <img src="${this.anim}" class="sun-img" alt="${this.isCoin ? 'coin' : 'sun'}" />
            <span class="sun-badge">+${this.value}</span>
        `;
        this.updateDOMTransform();

        const collectHandler = (e) => {
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            if (this.engine) {
                this.engine.collectSun(this);
            } else {
                this.collect();
            }
        };

        this.domElement.addEventListener('pointerdown', collectHandler);
        this.container.appendChild(this.domElement);
    }

    updateDOMTransform() {
        if (!this.domElement) return;
        const rx = Math.round((this.x - this.radius) * 2) * 0.5;
        const ry = Math.round((this.y - this.radius) * 2) * 0.5;
        const rs = Math.round(this.scale * 100) / 100;
        if (this._lastX !== rx || this._lastY !== ry || this._lastS !== rs) {
            this._lastX = rx;
            this._lastY = ry;
            this._lastS = rs;
            this.domElement.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${rs})`;
        }
        if (this.isCollecting) {
            this.domElement.style.opacity = Math.max(0.1, 1.0 - this.collectProgress * 0.9);
        }
    }

    update(dt, targetHudX = 80, targetHudY = 20) {
        this.age += dt;
        if (this.scale < 1.0) {
            this.scale = Math.min(1.0, this.scale + dt * 4);
        }

        if (this.isCollecting) {
            this.collectProgress += dt * 3.2;
            if (this.collectProgress >= 1.0) {
                this.destroy();
                return;
            } else {
                // 抛物线飞向 HUD 阳光池
                this.x += (targetHudX - this.x) * (dt * 8);
                this.y += (targetHudY - this.y) * (dt * 8);
                this.scale = Math.max(0.15, 1.0 - this.collectProgress * 0.85);
                this.updateDOMTransform();
            }
            return;
        }

        // 下落状态
        if (this.y < this.targetY) {
            this.y += this.speedY * dt;
        }

        this.updateDOMTransform();

        if (this.age >= this.lifespan) {
            if (this.engine) {
                this.engine.collectSun(this);
            } else {
                this.collect();
            }
        }
    }

    collect() {
        if (!this.isCollecting) {
            this.isCollecting = true;
            this.collectProgress = 0;
        }
    }

    destroy() {
        this.isDead = true;
        if (this.domElement && this.domElement.parentNode) {
            this.domElement.parentNode.removeChild(this.domElement);
            this.domElement = null;
        }
    }

    // 命中点击判定
    contains(px, py) {
        if (this.isCollecting || this.isDead) return false;
        const dx = px - this.x;
        const dy = py - this.y;
        return (dx * dx + dy * dy) <= (this.radius * 1.35) * (this.radius * 1.35);
    }

    render(ctx) {
        // 如果已在 DOM sunLayer 中渲染，Canvas 无需重复绘制
        if (this.domElement) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        if (this.isMathSuper) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.45)';
            ctx.fill();
        }

        const img = assetsLoader.getImage(this.anim);
        const size = this.radius * 2;
        if (img && img.complete) {
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#f1c40f';
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#e67e22';
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('☀️', 0, 0);
        }

        ctx.fillStyle = '#fff';
        ctx.font = '900 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 4;
        ctx.fillText(`+${this.value}`, 0, this.radius + 14);

        ctx.restore();
    }
}

// 战区浮动文字 (如: "+50 ☀️", "💥 破盾!", "⚡ 狂暴!")
export class FloatingText {
    constructor(x, y, text, color = '#f1c40f', fontSize = 20) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.fontSize = fontSize;
        this.age = 0;
        this.lifespan = 1.2;
        this.isDead = false;
    }

    update(dt) {
        this.age += dt;
        this.y -= 25 * dt; // 慢慢向上飘
        if (this.age >= this.lifespan) {
            this.isDead = true;
        }
    }

    render(ctx) {
        const alpha = Math.max(0, 1 - (this.age / this.lifespan));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `900 ${this.fontSize}px sans-serif`;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3.5;
        ctx.textAlign = 'center';
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// 火爆辣椒整行烈焰效果
export class JalapenoFireLine {
    constructor(row, y) {
        this.row = row;
        this.y = y;
        this.age = 0;
        this.lifespan = 0.95;
        this.isDead = false;
        this.anim = 'assets/projectiles/jalapeno_fire.gif';
    }

    update(dt) {
        this.age += dt;
        if (this.age >= this.lifespan) {
            this.isDead = true;
        }
    }

    render(ctx) {
        const img = assetsLoader.getImage(this.anim);
        if (img && img.complete) {
            ctx.drawImage(img, 0, this.y - 75, 900, 150);
        } else {
            ctx.save();
            ctx.fillStyle = 'rgba(231, 76, 60, 0.75)';
            ctx.fillRect(0, this.y - 40, 900, 80);
            ctx.restore();
        }
    }
}

// 杨桃五向飞星
export class StarProjectile {
    constructor(startX, startY, vx, vy, damage = 20) {
        this.type = 'star';
        this.x = startX;
        this.y = startY;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.radius = 14;
        this.rotation = 0;
        this.isDead = false;
        this.anim = 'assets/projectiles/star.png';
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += 10 * dt;
        if (this.x < -30 || this.x > 960 || this.y < -30 || this.y > 630) {
            this.isDead = true;
        }
    }

    render(ctx) {
        const img = assetsLoader.getImage(this.anim);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        if (img && img.complete) {
            ctx.drawImage(img, -14, -14, 28, 28);
        } else {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// 抛物线投掷物 (卷心菜、玉米粒、黄油、西瓜、投石车篮球 —— 真实高抛弧线弹道、屋脊贴地投影与残影轨迹)
export class LobbedProjectile {
    constructor(row, startX, startY, targetEntity, type = 'cabbage', damage = 40) {
        this.row = row;
        this.startX = startX;
        this.startY = startY;
        this.x = startX;
        this.y = startY;
        this.type = type;
        this.damage = damage;
        this.isEnemyBasketball = (type === 'basketball');
        this.targetZombie = this.isEnemyBasketball ? null : targetEntity;
        this.targetPlant = this.isEnemyBasketball ? targetEntity : null;
        this.targetX = targetEntity ? targetEntity.x : (this.isEnemyBasketball ? startX - 320 : startX + 320);
        this.targetY = targetEntity ? (targetEntity.y - 16) : startY;
        this.groundY = startY + 28;
        this.t = 0;
        const initSpan = Math.abs(this.targetX - startX);
        this.duration = this.isEnemyBasketball
            ? 1.02
            : Math.max(0.76, Math.min(1.04, 0.68 + initSpan / 1650));
        this.arcHeight = Math.max(92, Math.min(142, 74 + initSpan * 0.12));
        this.rotation = 0;
        this.spinSpeed = this.isEnemyBasketball ? -8.5 : ((type === 'melon' || type === 'winter_melon') ? 6.8 : 9.2);
        this.trail = [{ x: startX, y: startY, rot: 0 }];
        this.isDead = false;
        this.isLobbed = true;

        if (type === 'butter') {
            this.anim = 'assets/projectiles/butter.png';
        } else if (type === 'corn') {
            this.anim = 'assets/projectiles/corn.png';
        } else if (type === 'melon') {
            this.anim = 'assets/projectiles/melon.png';
        } else if (type === 'winter_melon') {
            this.anim = 'assets/projectiles/winter_melon.png';
        } else if (type === 'basketball') {
            this.anim = 'assets/projectiles/basketball.png';
        } else {
            this.anim = 'assets/projectiles/cabbage.png';
        }
    }

    update(dt, engine) {
        this.t += dt / this.duration;
        this.rotation += dt * this.spinSpeed;
        if (this.targetZombie && !this.targetZombie.isDead && !this.targetZombie.isDying) {
            this.targetX = this.targetZombie.x - 4;
            this.targetY = this.targetZombie.y - 18;
        } else if (this.targetPlant && !this.targetPlant.isDead) {
            this.targetX = this.targetPlant.x;
            this.targetY = this.targetPlant.y - 12;
        }

        const t = Math.min(1.0, this.t);
        this.x = this.startX + (this.targetX - this.startX) * t;
        const linearY = this.startY + (this.targetY - this.startY) * t;

        // 动态适配高抛拱高：既保证在屋顶关完美越过最高屋脊，又防止第 0 行投掷物飞出 900x600 画面顶端消失
        const midLinearY = (this.startY + this.targetY) * 0.5;
        let effectiveArc = this.arcHeight;
        if (engine && engine.isRoof) {
            const ridgeSurfaceY = (engine.gridStartY || 82) + this.row * (engine.cellH || 85) + (engine.cellH || 85) * 0.5;
            const minClearanceArc = Math.max(0, midLinearY - (ridgeSurfaceY - 46));
            effectiveArc = Math.max(effectiveArc, minClearanceArc);
        }
        const maxViewportArc = Math.max(52, midLinearY - 18);
        effectiveArc = Math.min(effectiveArc, maxViewportArc);

        const parabola = 4 * effectiveArc * t * (1 - t);
        this.y = linearY - parabola;

        // 计算真实贴地/贴瓦面投影纵坐标 (让玩家在 2.5D 斜坡与草坪上一眼看清高抛高度差)
        if (engine && typeof engine.getSurfaceOffsetY === 'function') {
            const baseSurfaceY = (engine.gridStartY || 80) + this.row * (engine.cellH || 98) + (engine.cellH || 98) * 0.5;
            this.groundY = baseSurfaceY + engine.getSurfaceOffsetY(this.x) + 14;
        } else {
            this.groundY = linearY + 26;
        }

        // 记录高帧率弹道残影采样点
        const lastPt = this.trail[this.trail.length - 1];
        if (!lastPt || Math.hypot(this.x - lastPt.x, this.y - lastPt.y) >= 10) {
            this.trail.push({ x: this.x, y: this.y, rot: this.rotation });
            if (this.trail.length > 8) {
                this.trail.shift();
            }
        }

        if (this.t >= 1.0) {
            this.isDead = true;
            this.onImpact(engine);
        }
    }

    applyLobbedHit(zombie, dmg) {
        if (!zombie || zombie.isDead || zombie.isDying) return;
        // 原版 PVZ1 机制：抛投植物从头顶越过前向护盾（铁栅门/扶梯僵尸金属梯/报纸），直接打击僵尸本体（头顶防具如路障/铁桶/橄榄球头盔仍正常承伤）
        if (typeof zombie.takeFumeDamage === 'function') {
            zombie.takeFumeDamage(dmg);
        } else {
            zombie.takeDamage(dmg);
        }
    }

    onImpact(engine) {
        if (!engine) return;

        if (this.isEnemyBasketball) {
            soundEngine.playSplat();
            if (this.targetPlant && !this.targetPlant.isDead) {
                // 优先检测 3x3 范围内是否有叶子保护伞 (Umbrella Leaf) 撑开巨叶弹开篮球！
                const targetCol = this.targetPlant.col;
                const umbrella = engine.plants ? engine.plants.find(u =>
                    !u.isDead && u.type === 'umbrellaleaf' &&
                    Math.abs(u.row - this.row) <= 1 &&
                    (Math.abs(u.col - targetCol) <= 1 || (this.targetPlant.isDoubleWide && Math.abs(u.col - (targetCol + 1)) <= 1))
                ) : null;
                if (umbrella) {
                    if (typeof umbrella.triggerBounce === 'function') {
                        umbrella.triggerBounce(engine);
                    }
                    if (engine.floatingTexts) {
                        engine.floatingTexts.push(new FloatingText(umbrella.x, umbrella.y - 42, '☂️ 保护伞弹飞篮球!', '#2ecc71', 19));
                    }
                    engine.hitSplats.push(new HitSplat(this.x, this.y - 18, 'basketball'));
                    return;
                }

                // 若该格套有南瓜头，优先砸伤南瓜头
                const pumpkin = engine.plants ? engine.plants.find(
                    p => !p.isDead && p.col === this.targetPlant.col && p.row === this.targetPlant.row && (p.isPumpkin || p.isPumpkinShell || p.type === 'pumpkin')
                ) : null;
                if (pumpkin) {
                    pumpkin.takeDamage(this.damage);
                } else {
                    this.targetPlant.takeDamage(this.damage);
                }
            }
            engine.hitSplats.push(new HitSplat(this.x, this.y, 'basketball'));
            return;
        }

        // 若锁定的僵尸在半空中已倒下或蹦极已高飞撤离，自动命中落点处同行的相邻存活僵尸
        const isHighBungee = (z) => z.type === 'bungee' && (z.bungeePhase === 'init' || z.bungeePhase === 'targeting' || z.bungeeOffsetY < -190);
        let directTarget = (this.targetZombie && !this.targetZombie.isDead && !this.targetZombie.isDying && !(this.targetZombie.type === 'bungee' && this.targetZombie.bungeeOffsetY < -190))
            ? this.targetZombie
            : null;
        if (!directTarget && engine.zombies) {
            directTarget = engine.zombies.find(z =>
                z.row === this.row && !z.isDead && !z.isDying && !z.isHypnotized &&
                !z.isFlying && !isHighBungee(z) && Math.abs(z.x - this.x) <= 44
            ) || null;
        }

        if (this.type === 'melon' || this.type === 'winter_melon') {
            const isWinter = (this.type === 'winter_melon');
            soundEngine.playBoom();
            const chillZombie = (z) => {
                if (!isWinter || !z || z.isDead || z.isDying) return;
                z.slowTimer = Math.max(z.slowTimer || 0, 10.0);
                z.isSlowed = true;
                if (z.domElement) z.domElement.classList.add('slowed');
            };
            // 西瓜 / 冰西瓜造成 80 直接伤害 + 周围 3x3 范围 26 溅射伤害（冰西瓜附带 10s 群体冰减速）
            if (directTarget) {
                this.applyLobbedHit(directTarget, this.damage);
                chillZombie(directTarget);
            }
            engine.zombies.forEach(z => {
                if (z === directTarget || z.isDead || z.isDying || z.isHypnotized || z.isFlying || isHighBungee(z)) return;
                if (Math.abs(z.row - this.row) <= 1 && Math.abs(z.x - this.x) <= 94) {
                    this.applyLobbedHit(z, 26);
                    chillZombie(z);
                }
            });
            engine.hitSplats.push(new HitSplat(this.x, this.y, isWinter ? 'winter_melon' : 'melon'));
        } else if (this.type === 'butter') {
            soundEngine.playSplat();
            if (directTarget) {
                this.applyLobbedHit(directTarget, this.damage);
                if (!directTarget.isDead && !directTarget.isDying) {
                    if (typeof directTarget.applyButter === 'function') {
                        directTarget.applyButter(4.0);
                    } else {
                        directTarget.freezeTimer = 4.0;
                    }
                    engine.floatingTexts.push(new FloatingText(directTarget.x, directTarget.y - 44, '🧈 黄油定身!', '#f39c12', 19));
                }
            }
            engine.hitSplats.push(new HitSplat(this.x, this.y, 'butter'));
        } else {
            soundEngine.playSplat();
            if (directTarget) {
                this.applyLobbedHit(directTarget, this.damage);
            }
            engine.hitSplats.push(new HitSplat(this.x, this.y, this.type === 'corn' ? 'corn' : 'cabbage'));
        }
    }

    renderShadow(ctx) {
        if (this.isDead) return;
        const height = Math.max(0, this.groundY - this.y);
        const heightFactor = Math.max(0.42, 1 - height / 260);
        const isHeavyMelon = (this.type === 'melon' || this.type === 'winter_melon');
        const rx = (isHeavyMelon ? 18 : 13) * heightFactor;
        const ry = (isHeavyMelon ? 7 : 5) * heightFactor;
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${(0.34 * heightFactor).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.groundY, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    render(ctx) {
        const img = assetsLoader.getImage(this.anim);
        const isHeavyMelon = (this.type === 'melon' || this.type === 'winter_melon');
        const drawW = isHeavyMelon ? 42 : (this.type === 'cabbage' ? 35 : (this.type === 'butter' ? 34 : (this.type === 'basketball' ? 34 : 28)));
        const drawH = isHeavyMelon ? 32 : (this.type === 'cabbage' ? 32 : (this.type === 'butter' ? 35 : (this.type === 'basketball' ? 34 : 29)));

        // 1. 绘制柔和抛物线运动流线与渐隐残影，让高抛弹道弧线清晰醒目
        if (this.trail.length >= 2) {
            const trailColor = this.type === 'winter_melon'
                ? '72, 219, 251'
                : (this.type === 'butter'
                    ? '255, 226, 89'
                    : (this.type === 'corn'
                        ? '250, 211, 58'
                        : (this.type === 'basketball'
                            ? '243, 156, 18'
                            : (this.type === 'melon' ? '46, 204, 113' : '120, 224, 90'))));
            ctx.save();
            ctx.lineCap = 'round';
            for (let i = 1; i < this.trail.length; i++) {
                const p0 = this.trail[i - 1];
                const p1 = this.trail[i];
                const ratio = i / this.trail.length;
                ctx.strokeStyle = `rgba(${trailColor}, ${(ratio * 0.44).toFixed(3)})`;
                ctx.lineWidth = (isHeavyMelon ? 7 : 5) * ratio;
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.stroke();
            }
            ctx.restore();
        }

        // 2. 绘制旋转飞行的投掷物实体 (已由 renderShadow 绘制贴地投影，跳过高开销移动端 shadowBlur)
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        if (img && img.complete) {
            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, drawW * 0.42, 0, Math.PI * 2);
            ctx.fillStyle = this.type === 'winter_melon'
                ? '#0984e3'
                : (this.type === 'butter' ? '#f1c40f' : (this.type === 'basketball' ? '#e67e22' : (this.type === 'melon' ? '#27ae60' : '#2ecc71')));
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#1e272e';
            ctx.stroke();
        }
        ctx.restore();
    }
}

// 坚果保龄球实体 (原版 1:1 滚动、斜向反弹折射、赤红触敌核爆)
export class BowlingNutEntity {
    constructor(type, row, startX, startY, engine) {
        this.id = 'bowling_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        this.type = type; // 'bowling_nut' | 'bowling_rednut'
        this.row = row;
        this.targetRow = row;
        this.x = startX;
        this.y = startY;
        this.engine = engine;
        this.vx = 420; // 滚动冲刺速度
        this.vy = 0;   // 斜向反弹纵向速率
        this.rotation = 0;
        this.radius = 34;
        this.damage = type === 'bowling_rednut' ? 1800 : 500;
        this.isDead = false;
        this.hitZombies = new Set();
        this.dustTimer = 0;
    }

    update(dt, engine) {
        if (this.isDead) return;

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += dt * 720; // 滚动自转

        // 尘土粒子效果
        this.dustTimer += dt;
        if (this.dustTimer >= 0.08) {
            this.dustTimer = 0;
            if (engine.hitSplats) {
                engine.hitSplats.push(new HitSplat(this.x - 22, this.y + 16, 'dirt'));
            }
        }

        // 斜向反弹平滑过渡到目标轨道
        if (this.vy !== 0) {
            const targetY = engine.gridStartY + this.targetRow * engine.cellH + engine.cellH / 2;
            if ((this.vy > 0 && this.y >= targetY) || (this.vy < 0 && this.y <= targetY)) {
                this.y = targetY;
                this.row = this.targetRow;
                this.vy = 0; // 恢复平直滚动
            }
        }

        // 上下草坪边界弹射
        const minY = engine.gridStartY + engine.cellH / 2;
        const maxY = engine.gridStartY + (engine.rows - 1) * engine.cellH + engine.cellH / 2;
        if (this.y <= minY && this.vy < 0) {
            this.targetRow = 1;
            this.vy = 180;
        } else if (this.y >= maxY && this.vy > 0) {
            this.targetRow = engine.rows - 2;
            this.vy = -180;
        }

        // 僵尸碰撞检测 (严格对齐原版 PVZ1 保龄球碰撞与防具血量层级)
        engine.zombies.forEach(z => {
            if (this.isDead || z.isDead || z.isDying || z.state === 'jumping' || this.hitZombies.has(z.id)) return;

            // 原版细节：手持撑杆的撑杆跳僵尸遇到迎面滚来的普通保龄坚果时，会撑杆腾空跃过第一颗坚果！
            if (this.type === 'bowling_nut' && z.type === 'polevault' && z.hasPole && !z.hasLostHead &&
                z.x >= this.x - 8 && z.x - this.x <= 66 && Math.abs(z.y - this.y) <= 34) {
                this.hitZombies.add(z.id);
                z.state = 'jumping';
                z.jumpTimer = 0.85;
                z.jumpStartX = z.x;
                z.jumpTargetX = z.x - 56;
                z.setAnim(z.config.jumpAnim || 'assets/zombies/polevault_jump.gif');
                soundEngine.playGroan();
                if (engine.floatingTexts) {
                    engine.floatingTexts.push(new FloatingText(z.x, z.y - 45, '🏃 撑杆跃过坚果!', '#f39c12', 18));
                }
                return;
            }

            // 距离小于坚果半径 + 僵尸躯干半径
            const dist = Math.hypot(z.x - this.x, z.y - this.y);
            if (dist <= 48) {
                this.hitZombies.add(z.id);

                if (this.type === 'bowling_rednut') {
                    // 赤红爆炸坚果：撞击首个目标触发 3x3 剧烈烈火爆破 (1800 灰烬伤害)
                    this.isDead = true;
                    soundEngine.playBoom();
                    soundEngine.playThunder();
                    engine.explosions.push(new ExplosionEffect(this.x, this.y, 'cherry'));
                    engine.zombies.forEach(targetZ => {
                        if (!targetZ.isDead && !targetZ.isDying) {
                            const rDiff = Math.abs(targetZ.row - this.row);
                            const cDiff = Math.abs(targetZ.x - this.x) / engine.cellW;
                            if (rDiff <= 1.2 && cDiff <= 1.5) {
                                if (targetZ.blastDie) targetZ.blastDie(1800);
                                else targetZ.takeDamage(1800);
                            }
                        }
                    });
                    return;
                }

                // 普通保龄坚果：造成 500 物理撞击伤害（普通僵尸1下、路障/读报2下、铁桶3下、铁栅门/橄榄球4下），并触发斜向折射！
                soundEngine.playBowlingStrike();
                if (engine.hitSplats) {
                    engine.hitSplats.push(new HitSplat(z.x, z.y - 18, 'nut'));
                }
                z.takeDamage(this.damage);

                // 核心斜向反弹逻辑 (Ricochet)
                if (this.vy === 0) {
                    if (this.row === 0) {
                        this.targetRow = 1;
                        this.vy = 185;
                    } else if (this.row >= engine.rows - 1) {
                        this.targetRow = this.row - 1;
                        this.vy = -185;
                    } else {
                        const goDown = Math.random() < 0.5;
                        this.targetRow = goDown ? this.row + 1 : this.row - 1;
                        this.vy = goDown ? 185 : -185;
                    }
                } else {
                    this.vy = -this.vy;
                    this.targetRow = this.vy > 0 ? Math.min(engine.rows - 1, this.row + 1) : Math.max(0, this.row - 1);
                }
            }
        });

        // 滚出荧幕右侧
        if (this.x > 960) {
            this.isDead = true;
        }
    }

    render(ctx) {
        ctx.save();
        // 轻量贴地投影椭圆 (零模糊开销)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.radius - 3, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);

        const assetPath = this.type === 'bowling_rednut' ? 'assets/plants/wallnut_red.png' : 'assets/plants/wallnut.gif';
        const img = assetsLoader.getImage(assetPath);
        if (img && img.complete) {
            ctx.drawImage(img, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.type === 'bowling_rednut' ? '#c0392b' : '#d35400';
            ctx.fill();
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        if (this.type === 'bowling_rednut') {
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// 香蒲 (Cattail) 全屏跨行自动制导红刺 (2D 平滑转向追踪全屏最近僵尸，优先戳破气球僵尸)
export class HomingSpikeProjectile {
    constructor(startX, startY, targetZombie = null, damage = 20) {
        this.type = 'homing_thorn';
        this.isLobbed = true; // 由自身 2D 碰撞结算，跳过单行水平检测
        this.canHitFlying = true;
        this.x = startX;
        this.y = startY;
        this.speed = 390;
        this.vx = this.speed;
        this.vy = 0;
        this.angle = 0;
        this.damage = damage;
        this.targetZombie = targetZombie;
        this.age = 0;
        this.isDead = false;
        this.anim = 'assets/projectiles/cattail_thorn.png';
        this.trail = [{ x: startX, y: startY }];
    }

    acquireTarget(engine) {
        if (!engine || !engine.zombies) return null;
        const candidates = engine.zombies.filter(z =>
            !z.isDead && !z.isDying && !z.isHypnotized &&
            !(z.type === 'digger' && z.diggerPhase === 'digging') &&
            !(z.type === 'snorkel' && z.isSubmerged) &&
            !(z.type === 'bungee' && z.bungeeOffsetY < -60) &&
            z.x >= -10 && z.x <= 930
        );
        if (candidates.length === 0) return null;
        // 优先锁定空中气球僵尸，其次锁定离家最近 (x 最小) 的僵尸
        candidates.sort((a, b) => {
            if (!!a.isFlying !== !!b.isFlying) return a.isFlying ? -1 : 1;
            return a.x - b.x;
        });
        this.targetZombie = candidates[0];
        return this.targetZombie;
    }

    update(dt, engine) {
        this.age += dt;
        if (this.age >= 5.0 || this.x < -80 || this.x > 1020 || this.y < -80 || this.y > 680) {
            this.isDead = true;
            return;
        }

        if (!this.targetZombie || this.targetZombie.isDead || this.targetZombie.isDying || this.targetZombie.isHypnotized) {
            this.acquireTarget(engine);
        }

        if (this.targetZombie && !this.targetZombie.isDead && !this.targetZombie.isDying) {
            const tx = this.targetZombie.x;
            const ty = this.targetZombie.y - (this.targetZombie.isFlying ? 28 : 16);
            const dx = tx - this.x;
            const dy = ty - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist <= 26) {
                this.isDead = true;
                if (this.targetZombie.isFlying && typeof this.targetZombie.popBalloon === 'function') {
                    this.targetZombie.popBalloon(engine);
                } else {
                    this.targetZombie.takeDamage(this.damage);
                }
                if (engine && engine.hitSplats) {
                    engine.hitSplats.push(new HitSplat(this.x, this.y, 'pea'));
                }
                soundEngine.playSplat();
                return;
            }

            const desiredAngle = Math.atan2(dy, dx);
            let diff = desiredAngle - this.angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const maxTurn = 12.5 * dt;
            if (Math.abs(diff) <= maxTurn) {
                this.angle = desiredAngle;
            } else {
                this.angle += Math.sign(diff) * maxTurn;
            }
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        const last = this.trail[this.trail.length - 1];
        if (!last || Math.hypot(this.x - last.x, this.y - last.y) >= 12) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 6) this.trail.shift();
        }
    }

    render(ctx) {
        if (this.trail.length >= 2) {
            ctx.save();
            ctx.lineCap = 'round';
            for (let i = 1; i < this.trail.length; i++) {
                const p0 = this.trail[i - 1];
                const p1 = this.trail[i];
                const ratio = i / this.trail.length;
                ctx.strokeStyle = `rgba(235, 77, 75, ${(ratio * 0.48).toFixed(3)})`;
                ctx.lineWidth = 3.5 * ratio;
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.stroke();
            }
            ctx.restore();
        }

        const img = assetsLoader.getImage(this.anim);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        if (img && img.complete) {
            ctx.drawImage(img, -15, -8, 30, 15);
        } else {
            ctx.fillStyle = '#eb4d4b';
            ctx.beginPath();
            ctx.moveTo(14, 0);
            ctx.lineTo(-10, -5);
            ctx.lineTo(-10, 5);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}

// 玉米加农炮洲际导弹 (Cob Cannon ICBM：一段垂直冲天升空 + 二段高空俯冲轰炸 + 1800 灰烬级 3x3 毁灭爆破)
export class CobRocketProjectile {
    constructor(startX, startY, targetX, targetY, damage = 1800) {
        this.type = 'cob_rocket';
        this.isLobbed = true;
        this.isCobRocket = true;
        this.startX = startX;
        this.startY = startY;
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.damage = damage;
        this.age = 0;
        this.ascendDuration = 0.44;
        this.descendDuration = 0.44;
        this.totalDuration = this.ascendDuration + this.descendDuration;
        this.rotation = 0; // 0 = 弹头朝上升空，Math.PI = 弹头垂直朝下俯冲
        this.smokePuffs = [];
        this.smokeTimer = 0;
        this.isDead = false;
        this.anim = 'assets/projectiles/cob_rocket.png';
    }

    update(dt, engine) {
        this.age += dt;
        this.smokeTimer += dt;

        // 尾焰推进白烟粒子更新
        this.smokePuffs.forEach(sp => {
            sp.age += dt;
            sp.r += dt * 22;
        });
        this.smokePuffs = this.smokePuffs.filter(sp => sp.age < sp.lifespan);

        if (this.age < this.ascendDuration) {
            const p = this.age / this.ascendDuration;
            const ease = p * p * 0.4 + p * 0.6;
            this.x = this.startX;
            this.y = this.startY - (this.startY + 135) * ease;
            this.rotation = 0;
            if (this.smokeTimer >= 0.035) {
                this.smokeTimer = 0;
                this.smokePuffs.push({ x: this.x + (Math.random() - 0.5) * 8, y: this.y + 38, r: 9, age: 0, lifespan: 0.34 });
            }
            return;
        }

        if (this.age < this.totalDuration) {
            const p = (this.age - this.ascendDuration) / this.descendDuration;
            const ease = p * p * 0.45 + p * 0.55;
            this.x = this.targetX;
            this.y = -135 + (this.targetY + 135) * ease;
            this.rotation = Math.PI;
            if (this.smokeTimer >= 0.03) {
                this.smokeTimer = 0;
                this.smokePuffs.push({ x: this.x + (Math.random() - 0.5) * 8, y: this.y - 38, r: 10, age: 0, lifespan: 0.32 });
            }
            return;
        }

        // 轰然触地引爆：3x3 范围 1800 灰烬重创！
        this.isDead = true;
        soundEngine.playBoom();
        soundEngine.playThunder();
        if (engine) {
            if (engine.explosions) {
                engine.explosions.push(new ExplosionEffect(this.targetX, this.targetY, 'cherry'));
            }
            if (engine.hitSplats) {
                engine.hitSplats.push(new HitSplat(this.targetX, this.targetY, 'melon'));
            }
            if (engine.floatingTexts) {
                engine.floatingTexts.push(new FloatingText(this.targetX, this.targetY - 48, '🌽💥 玉米导弹轰炸!', '#f1c40f', 24));
            }
            if (engine.zombies) {
                engine.zombies.forEach(z => {
                    if (z.isDead || z.isDying || z.isHypnotized) return;
                    if (Math.abs(z.x - this.targetX) <= 128 && Math.abs(z.y - this.targetY) <= 116) {
                        if (typeof z.blastDie === 'function') {
                            z.blastDie(this.damage);
                        } else {
                            z.takeDamage(this.damage);
                        }
                    }
                });
            }
        }
    }

    renderShadow(ctx) {
        if (this.isDead) return;
        const pulse = 1 + Math.sin(this.age * 18) * 0.08;
        ctx.save();
        // 地面红金锁定靶心圈
        ctx.strokeStyle = 'rgba(231, 76, 60, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(this.targetX, this.targetY + 12, 34 * pulse, 16 * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(241, 196, 15, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(this.targetX, this.targetY + 12, 16 * pulse, 8 * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 二段俯冲时逐渐放大的地面黑影
        if (this.age >= this.ascendDuration) {
            const dp = Math.min(1, (this.age - this.ascendDuration) / this.descendDuration);
            ctx.fillStyle = `rgba(0, 0, 0, ${(0.18 + dp * 0.36).toFixed(3)})`;
            ctx.beginPath();
            ctx.ellipse(this.targetX, this.targetY + 12, 10 + dp * 24, 5 + dp * 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    render(ctx) {
        // 1. 尾焰浓烟粒子
        this.smokePuffs.forEach(sp => {
            const alpha = Math.max(0, 1 - sp.age / sp.lifespan) * 0.62;
            ctx.save();
            ctx.fillStyle = `rgba(245, 246, 250, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 2. 玉米洲际导弹弹体 + 炽热推进尾焰
        const img = assetsLoader.getImage(this.anim);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // 尾部喷射烈焰光锥
        const flameLen = 22 + Math.sin(this.age * 45) * 6;
        const grad = ctx.createLinearGradient(0, 32, 0, 32 + flameLen);
        grad.addColorStop(0, 'rgba(255, 242, 0, 0.95)');
        grad.addColorStop(0.5, 'rgba(255, 121, 63, 0.85)');
        grad.addColorStop(1, 'rgba(231, 76, 60, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-11, 30);
        ctx.lineTo(11, 30);
        ctx.lineTo(0, 34 + flameLen);
        ctx.closePath();
        ctx.fill();

        if (img && img.complete) {
            ctx.drawImage(img, -23, -45, 46, 90);
        } else {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.ellipse(0, 0, 16, 38, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}
