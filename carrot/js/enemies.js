/**
 * enemies.js - 敌人怪物实体与波次逻辑
 */

import { ENEMY_TYPES } from './config.js?v=20260926_ipad_perf_v1';

const ASSET_VER = '20261022_jungle_fix_v8';
function loadImg(src) {
    const img = new Image();
    img.src = `${src}?v=${ASSET_VER}`;
    return img;
}

// 保卫萝卜官方原版怪兽精灵贴图 (涵盖四大主题：天际、丛林、沙漠、深海 全套走动动画)
const monsterSprites = {
    // ===== 天际线 =====
    SLIME: [
        loadImg('assets/official/monsters/official_pink_slime_1.png'),
        loadImg('assets/official/monsters/official_pink_slime_2.png')
    ],
    RABBIT: [
        loadImg('assets/official/monsters/official_yellow_bat_1.png'),
        loadImg('assets/official/monsters/official_yellow_bat_2.png')
    ],
    GOLEM: [
        loadImg('assets/official/monsters/official_green_golem_1.png'),
        loadImg('assets/official/monsters/official_green_golem_2.png')
    ],
    SHIELD_MATH: [
        loadImg('assets/official/monsters/official_math_shield_1.png'),
        loadImg('assets/official/monsters/official_math_shield_2.png')
    ],
    BOSS_DEMON: [
        loadImg('assets/official/monsters/official_boss_1.png'),
        loadImg('assets/official/monsters/official_boss_2.png')
    ],
    BOSS: [
        loadImg('assets/official/monsters/official_boss_1.png'),
        loadImg('assets/official/monsters/official_boss_2.png')
    ],

    // ===== 丛林奇遇 =====
    JUNGLE_SLIME: [
        loadImg('assets/official/monsters/jungle_slime_1.png'),
        loadImg('assets/official/monsters/jungle_slime_2.png')
    ],
    JUNGLE_BAT: [
        loadImg('assets/official/monsters/jungle_bat_1.png'),
        loadImg('assets/official/monsters/jungle_bat_2.png')
    ],
    JUNGLE_GOLEM: [
        loadImg('assets/official/monsters/jungle_golem_1.png'),
        loadImg('assets/official/monsters/jungle_golem_2.png')
    ],
    JUNGLE_CYCLOPS: [
        loadImg('assets/official/monsters/jungle_cyclops_1.png'),
        loadImg('assets/official/monsters/jungle_cyclops_2.png')
    ],
    BOSS_JUNGLE: [
        loadImg('assets/official/monsters/jungle_boss_1.png'),
        loadImg('assets/official/monsters/jungle_boss_2.png')
    ],

    // ===== 沙漠风暴 =====
    DESERT_SLIME: [
        loadImg('assets/official/monsters/desert_slime_1.png'),
        loadImg('assets/official/monsters/desert_slime_2.png')
    ],
    DESERT_STAR: [
        loadImg('assets/official/monsters/desert_bat_1.png'),
        loadImg('assets/official/monsters/desert_bat_2.png')
    ],
    DESERT_DEVIL: [
        loadImg('assets/official/monsters/desert_devil_1.png'),
        loadImg('assets/official/monsters/desert_devil_2.png')
    ],
    DESERT_GOLEM: [
        loadImg('assets/official/monsters/desert_golem_1.png'),
        loadImg('assets/official/monsters/desert_golem_2.png')
    ],
    BOSS_DESERT: [
        loadImg('assets/official/monsters/desert_boss_1.png'),
        loadImg('assets/official/monsters/desert_boss_2.png')
    ],

    // ===== 深海狂澜 =====
    SEA_SLIME: [
        loadImg('assets/official/monsters/sea_slime_1.png'),
        loadImg('assets/official/monsters/sea_slime_2.png')
    ],
    SEA_JELLY: [
        loadImg('assets/official/monsters/sea_jelly_1.png'),
        loadImg('assets/official/monsters/sea_jelly_2.png')
    ],
    SEA_CONCH: [
        loadImg('assets/official/monsters/sea_conch_1.png'),
        loadImg('assets/official/monsters/sea_conch_2.png')
    ],
    SEA_URCHIN: [
        loadImg('assets/official/monsters/sea_urchin_1.png'),
        loadImg('assets/official/monsters/sea_urchin_2.png')
    ],
    SEA_RAY: [
        loadImg('assets/official/monsters/sea_ray_1.png'),
        loadImg('assets/official/monsters/sea_ray_2.png')
    ],
    BOSS_DEEPSEA: [
        loadImg('assets/official/monsters/sea_boss_1.png'),
        loadImg('assets/official/monsters/sea_boss_2.png')
    ]
};

export class Enemy {
    constructor(typeKey, waypoints, waveNumber = 1, mathEngineOrMaxMul = null, hasMathShield = false) {
        this.config = ENEMY_TYPES[typeKey] || ENEMY_TYPES.SLIME;
        this.typeKey = typeKey;
        this.waypoints = waypoints;
        this.mathEngine = (mathEngineOrMaxMul && typeof mathEngineOrMaxMul.generateShieldWeakness === 'function') 
            ? mathEngineOrMaxMul 
            : null;
        this.maxMultiplier = (this.mathEngine && this.mathEngine.config)
            ? (Number(this.mathEngine.config.maxMultiplier) || 5)
            : (Number(mathEngineOrMaxMul) || 5);

        // 波次生命值成长系数
        const hpMultiplier = 1 + (waveNumber - 1) * 0.18;
        this.maxHp = Math.round(this.config.hp * hpMultiplier);
        this.hp = this.maxHp;

        this.baseSpeed = this.config.speed * 60; // 转化为像素/秒
        this.speed = this.baseSpeed;
        this.radius = this.config.radius;
        this.reward = this.config.reward;
        this.color = this.config.color;
        this.isBoss = !!this.config.isBoss;

        // 路径插值
        this.waypointIndex = 0;
        const firstWp = (waypoints && waypoints.length > 0 && waypoints[0]) ? waypoints[0] : { x: 120, y: 120 };
        this.x = firstWp.x;
        this.y = firstWp.y;

        // 状态效果
        this.slowTimer = 0;
        this.slowFactor = 1.0;
        this.stunTimer = 0;
        this.isFrozen = false;
        this.poisonTicks = 0;
        this.poisonDamage = 0;
        this.poisonTimer = 0;
        this.hasMushroomBounty = false;
        this.flashTimer = 0; // 受击闪白
        this.spawnAnim = 0.25; // 登场时空门弹出动画 (从 0.2 缩放到 1.0)
        this.isDead = false;
        this.reachedEnd = false;
        this.facing = 1; // 1: 朝右, -1: 朝左 (怪兽朝向水平镜像自适应)
        if (this.waypoints && this.waypoints.length > 1) {
            if (this.waypoints[1].x < this.waypoints[0].x) {
                this.facing = -1;
            }
        }

        // 特殊数学护盾怪 (严格遵循玩家所选算术法则)
        this.hasMathShield = !!this.config.hasMathShield || (this.typeKey === 'SHIELD_MATH') || !!hasMathShield;
        this.shieldProblem = null;
        if (this.hasMathShield) {
            this.initMathShield();
        }
    }

    initMathShield() {
        if (this.mathEngine && typeof this.mathEngine.generateShieldWeakness === 'function') {
            this.shieldProblem = this.mathEngine.generateShieldWeakness();
            return;
        }

        // 兜底保护：如果没有传入 mathEngine，默认使用 20 以内加法
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        this.shieldProblem = {
            expr: `${a} + ? = ${a + b}`,
            answer: b,
            hint: '加法护盾',
            opType: 'add'
        };
    }

    applySlow(slowPercent, duration) {
        this.slowFactor = Math.min(this.slowFactor, 1 - slowPercent);
        this.slowTimer = Math.max(this.slowTimer, duration);
    }

    applyStun(duration) {
        this.stunTimer = Math.max(this.stunTimer, duration);
    }

    applyFreeze(duration) {
        this.applyStun(duration);
        this.isFrozen = true;
    }

    applyPoison(ticks, damagePerTick) {
        this.poisonTicks = Math.max(this.poisonTicks, ticks);
        this.poisonDamage = Math.max(this.poisonDamage, damagePerTick);
        if (this.poisonTimer <= 0) this.poisonTimer = 0.5;
    }

    takeDamage(amount, isCrit = false) {
        this.flashTimer = 0.12;

        let finalDamage = amount;
        // 若有数盾，常规武器伤害减免 70%
        if (this.hasMathShield) {
            finalDamage = Math.max(1, Math.round(amount * 0.3));
        } else if (this.config.armor) {
            finalDamage = Math.max(1, Math.round(amount * (1 - this.config.armor)));
        }

        this.hp -= finalDamage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
        }
    }

    // 通过解答题目进行破盾核爆
    breakShield() {
        this.hasMathShield = false;
        const shieldNukeDamage = Math.round(this.maxHp * 0.85);
        this.takeDamage(shieldNukeDamage, true);
        return shieldNukeDamage;
    }

    update(dt) {
        if (this.isDead || this.reachedEnd) return;

        // 减速计时
        if (this.slowTimer > 0) {
            this.slowTimer -= dt;
            if (this.slowTimer <= 0) {
                this.slowFactor = 1.0;
            }
        }

        // 冰冻与击晕
        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
            if (this.stunTimer <= 0) {
                this.isFrozen = false;
            }
        }

        // 猛毒 DoT 周期扣血
        if (this.poisonTicks > 0) {
            this.poisonTimer -= dt;
            if (this.poisonTimer <= 0) {
                this.poisonTimer = 0.5;
                this.poisonTicks--;
                this.takeDamage(this.poisonDamage);
            }
        }

        if (this.flashTimer > 0) {
            this.flashTimer -= dt;
        }

        if (this.spawnAnim > 0) {
            this.spawnAnim -= dt;
        }

        // 若处于被击晕或冰封状态，无法移动
        if (this.stunTimer > 0) {
            return;
        }

        // 沿 Waypoints 移动
        if (!this.waypoints || this.waypoints.length === 0) {
            this.reachedEnd = true;
            return;
        }
        const targetWp = this.waypoints[this.waypointIndex + 1];
        if (!targetWp) {
            this.reachedEnd = true;
            return;
        }

        const dx = targetWp.x - this.x;
        const dy = targetWp.y - this.y;
        const dist = Math.hypot(dx, dy);

        // 动态根据移动航向更新怪兽面朝方向 (平滑阈值 1.5px 避免垂直移动时微小抖动)
        if (dx < -1.5) {
            this.facing = -1;
        } else if (dx > 1.5) {
            this.facing = 1;
        }

        const currentSpeed = this.baseSpeed * this.slowFactor;
        const moveStep = currentSpeed * dt;

        if (dist <= moveStep) {
            this.x = targetWp.x;
            this.y = targetWp.y;
            this.waypointIndex++;
            if (this.waypointIndex >= this.waypoints.length - 1) {
                this.reachedEnd = true;
            }
        } else {
            this.x += (dx / dist) * moveStep;
            this.y += (dy / dist) * moveStep;
        }
    }

    // 命中检测：超广角无死角判定（覆盖从弱点算式/瞄准星上方到怪兽身体下方的完整区域）
    isHit(px, py) {
        if (this.isDead || this.reachedEnd) return false;
        const size = this.config.renderSize || (this.isBoss ? 122 : Math.round(this.radius * 2.8));

        // 1. 如果有数盾与算式，整个区域（宽130px，从头顶算式与准星上方到脚下）全部作为连续超大热区
        if (this.hasMathShield && this.shieldProblem) {
            const halfW = 65; // 宽 130px 宽广点击面
            const topY = this.y - size / 2 - 75; // 覆盖算式标签与瞄准镜顶部
            const bottomY = this.y + size / 2 + 25; // 覆盖身体下部与投影
            if (px >= this.x - halfW && px <= this.x + halfW && py >= topY && py <= bottomY) {
                return true;
            }
        }

        // 2. 基础身体圆形/胶囊检测 (加大容错半径至 48px，让移动中怪兽极易点击)
        const distBody = Math.hypot(this.x - px, this.y - py);
        if (distBody <= Math.max(this.radius + 20, 48)) {
            return true;
        }

        return false;
    }

    draw(ctx, time, isTargeted = false) {
        if (this.isDead) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // 登场缩放动画
        if (this.spawnAnim > 0) {
            const p = 1 - (this.spawnAnim / 0.25);
            const scale = 0.2 + 0.8 * Math.sin(p * Math.PI * 0.5);
            ctx.scale(scale, scale);
        }

        const size = this.config.renderSize || (this.isBoss ? 122 : Math.round(this.radius * 2.8));
        const hop = Math.abs(Math.sin(time * 6)) * 3;

        // 1. 如果有数盾，绘制外部旋转魔法圆环与算式弱点
        if (this.hasMathShield) {
            ctx.save();
            ctx.rotate(time * 2);
            ctx.strokeStyle = isTargeted ? '#ff4757' : '#fd79a8';
            ctx.lineWidth = isTargeted ? 3.5 : 2.5;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 14, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // 头顶弱点算式标签
            if (this.shieldProblem) {
                ctx.save();
                const fontStr = isTargeted 
                    ? 'bold 12px "Inter", "Microsoft YaHei", sans-serif'
                    : 'bold 11px "Inter", "Microsoft YaHei", sans-serif';
                ctx.font = fontStr;
                const tagText = isTargeted ? `🎯 ${this.shieldProblem.expr}` : this.shieldProblem.expr;
                const metrics = ctx.measureText(tagText);
                const tagW = Math.max(isTargeted ? 108 : 96, Math.ceil(metrics.width + 20));
                const tagH = 26;
                const tagY = -size / 2 - 36 - hop;

                // 阴影与底框
                ctx.shadowColor = isTargeted ? 'rgba(255, 71, 87, 0.8)' : 'rgba(0, 0, 0, 0.35)';
                ctx.shadowBlur = isTargeted ? 12 : 4;
                ctx.fillStyle = isTargeted ? 'rgba(235, 47, 6, 0.95)' : 'rgba(45, 52, 54, 0.88)';
                ctx.strokeStyle = isTargeted ? '#ffeaa7' : '#fd79a8';
                ctx.lineWidth = isTargeted ? 2.5 : 1.5;

                ctx.beginPath();
                ctx.roundRect(-tagW / 2, tagY, tagW, tagH, 7);
                ctx.fill();
                ctx.stroke();
                ctx.shadowBlur = 0;

                // 算式文字
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(tagText, 0, tagY + tagH / 2);
                ctx.restore();
            }
        }

        // 2. 地面柔和半透明投影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(0, this.radius * 0.7, this.radius * 1.1, this.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. 绘制保卫萝卜官方怪兽精灵 (2帧循环自然走动/扇翅/挤压，悠闲原版步频)
        const frameIdx = Math.floor(time * 3.5) % 2;
        const frames = monsterSprites[this.typeKey] || monsterSprites.SLIME;
        const sprite = frames[frameIdx];

        ctx.save();
        // 受击闪白
        if (this.flashTimer > 0) {
            ctx.filter = 'brightness(2.2)';
        }
        // 减速发蓝
        if (this.slowTimer > 0) {
            ctx.filter = 'hue-rotate(180deg) saturate(1.8)';
        }

        // 根据移动航向进行水平镜像翻转 (仅对怪兽模型生效，不影响外部血条、数学盾和锁定框)
        if (this.facing === -1) {
            ctx.scale(-1, 1);
        }

        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            const aspect = sprite.naturalWidth / sprite.naturalHeight;
            let drawW = size;
            let drawH = size;
            if (aspect > 1) {
                drawH = size / aspect;
            } else {
                drawW = size * aspect;
            }
            ctx.drawImage(sprite, -drawW / 2, -drawH / 2 - hop, drawW, drawH);
        } else {
            // 降级保护
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, -hop, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // 4. 经典血条 (Health Bar)
        const barW = Math.max(46, Math.round(this.radius * 2.0));
        const barH = 5;
        const barY = -size / 2 - 8 - hop;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(-barW / 2, barY, barW, barH);

        const hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = hpRatio > 0.5 ? '#2ed573' : (hpRatio > 0.25 ? '#ffa502' : '#ff4757');
        ctx.fillRect(-barW / 2, barY, barW * hpRatio, barH);

        // 5. 官方保卫萝卜集火锁定瞄准镜 (Target Reticle)
        if (isTargeted) {
            ctx.save();
            const aimY = this.hasMathShield && this.shieldProblem 
                ? -size / 2 - 58 - hop 
                : -size / 2 - 24 - hop;
            const bob = Math.sin(time * 8) * 3;
            const targetY = aimY + bob;

            // 准星外圈
            ctx.strokeStyle = '#ff3838';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = 'rgba(255, 56, 56, 0.8)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(0, targetY, 13, 0, Math.PI * 2);
            ctx.stroke();

            // 4个方向准星刻度线
            const tickLen = 6;
            ctx.beginPath();
            // 上
            ctx.moveTo(0, targetY - 13);
            ctx.lineTo(0, targetY - 13 - tickLen);
            // 下
            ctx.moveTo(0, targetY + 13);
            ctx.lineTo(0, targetY + 13 + tickLen);
            // 左
            ctx.moveTo(-13, targetY);
            ctx.lineTo(-13 - tickLen, targetY);
            // 右
            ctx.moveTo(13, targetY);
            ctx.lineTo(13 + tickLen, targetY);
            ctx.stroke();

            // 倒三角下指箭头
            ctx.fillStyle = '#ff3838';
            ctx.beginPath();
            ctx.moveTo(-6, targetY + 18);
            ctx.lineTo(6, targetY + 18);
            ctx.lineTo(0, targetY + 25);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        ctx.restore();
    }
}
