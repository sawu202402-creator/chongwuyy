/**
 * map.js - 保卫萝卜官方原版高清大地图引擎（按主题分片极速加载版）
 * 首屏仅同步载入轻量摘要 + 第一大关配置，第2~4大关支持按需秒载与空闲预热！
 */

import { assetsManager } from './assetsLoader.js?v=20261113_opt_v1';
import { STAGE_SUMMARIES } from './maps/stageSummaries.js?v=20261113_opt_v1';
import { THEME_1_CONFIGS } from './maps/theme1.js?v=20261113_opt_v1';

export { STAGE_SUMMARIES };

export const LEVEL_CONFIGS = {
    ...STAGE_SUMMARIES,
    ...THEME_1_CONFIGS
};

const _loadedThemes = new Set([1]);
const _themePromises = new Map();

export async function ensureStageConfigLoaded(stageId = 1) {
    const n = Math.max(1, Math.min(48, Number(stageId) || 1));
    const themeIdx = Math.ceil(n / 12); // 1 | 2 | 3 | 4
    if (_loadedThemes.has(themeIdx)) {
        return LEVEL_CONFIGS[n];
    }
    if (!_themePromises.has(themeIdx)) {
        const p = import(`./maps/theme${themeIdx}.js?v=20261113_opt_v1`).then(mod => {
            const data = mod[`THEME_${themeIdx}_CONFIGS`] || {};
            Object.assign(LEVEL_CONFIGS, data);
            _loadedThemes.add(themeIdx);
            return LEVEL_CONFIGS[n];
        });
        _themePromises.set(themeIdx, p);
    }
    return _themePromises.get(themeIdx);
}

// 首屏渲染完成后空闲静默预热后续三大主题分片，兼顾首屏秒开与切关零等待
if (typeof window !== 'undefined') {
    const warmUpRemaining = () => {
        [2, 3, 4].forEach((t, i) => {
            setTimeout(() => {
                ensureStageConfigLoaded((t - 1) * 12 + 1).catch(() => {});
            }, i * 250);
        });
    };
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(warmUpRemaining, { timeout: 1500 });
    } else {
        setTimeout(warmUpRemaining, 900);
    }
}

export class MapProp {
    constructor(config) {
        this.id = config.id;
        this.type = config.type;
        this.name = config.name || '道具';
        this.c = config.c;
        this.r = config.r;
        this.wCells = config.wCells || 1;
        this.hCells = config.hCells || 1;
        this.width = this.wCells * 80;
        this.height = this.hCells * 80;
        this.x = this.c * 80 + this.width / 2;
        this.y = this.r * 80 + this.height / 2;
        this.spriteSrc = config.spriteSrc;
        this.hp = config.hp || 300;
        this.maxHp = this.hp;
        this.rewardGold = config.rewardGold || 50;
        this.hiddenTower = config.hiddenTower || null;
        this.isDead = false;
        this.hitTimer = 0;
        this.healthBarTimer = 0;

        // 预加载贴图
        this.img = new Image();
        this.img.src = this.spriteSrc;
    }

    coversCell(c, r) {
        return c >= this.c && c < this.c + this.wCells &&
               r >= this.r && r < this.r + this.hCells;
    }

    isHit(px, py) {
        if (this.isDead) return false;
        const halfW = this.width / 2;
        const halfH = this.height / 2;
        return Math.abs(px - this.x) <= halfW && Math.abs(py - this.y) <= halfH;
    }

    takeDamage(amount, isCrit = false) {
        if (this.isDead) return;
        this.hp -= amount;
        this.hitTimer = 0.18;
        this.healthBarTimer = 3.5;
        if (this.hp <= 0) {
            this.hp = 0;
        }
    }

    applySlow() {}
    applyFreeze() {}
    applyPoison() {}
    applyStun() {}

    update(dt) {
        if (this.hitTimer > 0) this.hitTimer -= dt;
        if (this.healthBarTimer > 0) this.healthBarTimer -= dt;
    }

    draw(ctx, time, isTargeted) {
        if (this.isDead) return;
        ctx.save();

        // 1. 地面柔和阴影
        const shadowRx = (this.width * 0.42);
        const shadowRy = 9 * this.hCells;
        const shadowY = this.y + this.height / 2 - 4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(this.x, shadowY, shadowRx, shadowRy, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. 受击弹性果冻形变 / 悬浮呼吸起伏
        let scaleX = 1;
        let scaleY = 1;
        let wobbleX = 0;
        if (this.hitTimer > 0) {
            const progress = this.hitTimer / 0.18; // 1 -> 0
            const spring = Math.sin((1 - progress) * Math.PI * 3) * progress;
            scaleX = 1 + spring * 0.12;
            scaleY = 1 - spring * 0.10;
            wobbleX = spring * 3;
        }

        // 热气球与云朵带有空灵起伏呼吸感
        let floatY = 0;
        if (this.type === 'balloon') {
            floatY = Math.sin(time * 2.5 + this.c) * 4;
        } else if (this.type.includes('cloud')) {
            floatY = Math.sin(time * 2.0 + this.c) * 2.5;
        } else if (this.type.includes('planet')) {
            floatY = Math.sin(time * 2.2 + this.c) * 2.0;
        }

        // 3. 绘制官方高清贴图 (支持受击Q弹缩放)
        ctx.save();
        ctx.translate(this.x + wobbleX, this.y + floatY);
        ctx.scale(scaleX, scaleY);
        if (this.img.complete && this.img.naturalWidth > 0) {
            ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = '#a4b0be';
            ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 12);
            ctx.fill();
        }
        ctx.restore();

        // 4. 浮动血槽 (受损后显示，或处于集火锁定状态时显示，不显示选中框与繁琐文字)
        const showBar = (this.healthBarTimer > 0 || this.hp < this.maxHp || isTargeted);
        if (showBar) {
            const barW = Math.max(50, this.width * 0.65);
            const barH = 6;
            const barX = this.x - barW / 2;
            const barY = this.y - this.height / 2 - 11 + floatY;

            // 阴影底槽
            ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 4);
            ctx.fill();
            ctx.stroke();

            // 血量百分比
            const hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
            let hpColor = '#2ed573';
            if (hpRatio < 0.3) hpColor = '#ff4757';
            else if (hpRatio < 0.6) hpColor = '#ffa502';

            if (hpRatio > 0) {
                ctx.fillStyle = hpColor;
                ctx.beginPath();
                ctx.roundRect(barX, barY, Math.max(3, barW * hpRatio), barH, 3);
                ctx.fill();
            }
        }

        // 5. 保卫萝卜原版：集火锁定道具时的跳动红色准星与下指箭头 (Target Reticle)
        if (isTargeted) {
            ctx.save();
            const bob = Math.sin(time * 8) * 3.5;
            const targetY = this.y - this.height / 2 - 26 + floatY + bob;

            ctx.strokeStyle = '#ff3838';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = 'rgba(255, 56, 56, 0.85)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(this.x, targetY, 12, 0, Math.PI * 2);
            ctx.stroke();

            const tick = 5.5;
            ctx.beginPath();
            ctx.moveTo(this.x, targetY - 12);
            ctx.lineTo(this.x, targetY - 12 - tick);
            ctx.moveTo(this.x, targetY + 12);
            ctx.lineTo(this.x, targetY + 12 + tick);
            ctx.moveTo(this.x - 12, targetY);
            ctx.lineTo(this.x - 12 - tick, targetY);
            ctx.moveTo(this.x + 12, targetY);
            ctx.lineTo(this.x + 12 + tick, targetY);
            ctx.stroke();

            ctx.fillStyle = '#ff3838';
            ctx.beginPath();
            ctx.moveTo(this.x - 6, targetY + 16);
            ctx.lineTo(this.x + 6, targetY + 16);
            ctx.lineTo(this.x, targetY + 23);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }
}

// 为第 4 大关「深海狂澜」(37~48 关) 自动生成原汁原味的海底沉船宝箱、礁石珊瑚障碍与隐藏深海神塔
function buildDefaultDeepSeaProps(levelId, config) {
    const slots = config.towerSlots || [];
    if (slots.length < 8) return [];
    const pathSet = new Set(config.pathCells || []);
    const startX = config.startPortal?.x ?? 120;
    const startY = config.startPortal?.y ?? 120;
    const endX = config.baseCrystal?.x ?? 840;
    const endY = config.baseCrystal?.y ?? 360;

    // 保留出生点周边最近的至少 5 个黄金建塔位不放障碍物，确保开局顺畅建塔
    const sortedByStart = [...slots].sort(
        (a, b) => Math.hypot(a.x - startX, a.y - startY) - Math.hypot(b.x - startX, b.y - startY)
    );
    const protectedIds = new Set(sortedByStart.slice(0, 5).map(s => s.id));

    const slotMap = new Map();
    slots.forEach(s => {
        if (protectedIds.has(s.id)) return;
        if (Math.hypot(s.x - startX, s.y - startY) < 95) return;
        if (Math.hypot(s.x - endX, s.y - endY) < 95) return;
        if (pathSet.has(`${s.c},${s.r}`)) return;
        slotMap.set(`${s.c},${s.r}`, s);
    });

    const usedCells = new Set();
    const outProps = [];
    const hiddenPool = ['FISH', 'ANCHOR', 'CUTTLE', 'MUSHROOM', 'SNOW', 'PLANE', 'BUFF'];
    const bonusTower1 = hiddenPool[(levelId * 3) % hiddenPool.length];
    const bonusTower2 = hiddenPool[(levelId * 5 + 2) % hiddenPool.length];

    // 尝试放置 1 个 2x2 深海沉船大宝箱 (内藏 Lv.2 深海武器)
    for (let r = 1; r <= 4; r++) {
        let placedBig = false;
        for (let c = 2; c <= 9; c++) {
            const cells = [`${c},${r}`, `${c + 1},${r}`, `${c},${r + 1}`, `${c + 1},${r + 1}`];
            if (cells.every(k => slotMap.has(k) && !usedCells.has(k))) {
                cells.forEach(k => usedCells.add(k));
                outProps.push({
                    id: `sea_${levelId}_bigchest`,
                    type: 'sea_chest_big',
                    name: '深海沉船大宝箱',
                    c,
                    r,
                    wCells: 2,
                    hCells: 2,
                    spriteSrc: 'assets/official/props/jungle_chest_big.png',
                    hp: 3400,
                    rewardGold: 260,
                    hiddenTower: { typeKey: bonusTower1, level: 2, slotC: c, slotR: r }
                });
                placedBig = true;
                break;
            }
        }
        if (placedBig) break;
    }

    // 挑选最多 6 个 1x1 礁石 / 海底宝箱 / 夜光珊瑚菇
    const singleTemplates = [
        { type: 'sea_chest_small', name: '海底珍珠宝箱', spriteSrc: 'assets/official/props/desert_chest_small.png', hp: 1100, rewardGold: 150 },
        { type: 'sea_coral', name: '幻彩珊瑚菇', spriteSrc: 'assets/official/props/jungle_mushroom.png', hp: 780, rewardGold: 90 },
        { type: 'sea_rock', name: '深海礁石', spriteSrc: 'assets/official/props/jungle_rock.png', hp: 850, rewardGold: 95 },
        { type: 'sea_totem', name: '亚特兰蒂斯石像', spriteSrc: 'assets/official/props/jungle_totem.png', hp: 1050, rewardGold: 120 },
        { type: 'sea_pearl', name: '深海夜明珠', spriteSrc: 'assets/official/props/theme1_planet_yellow.png', hp: 720, rewardGold: 85 }
    ];

    const remainCandidates = Array.from(slotMap.values()).filter(s => !usedCells.has(`${s.c},${s.r}`));
    const step = Math.max(1, Math.floor(remainCandidates.length / 6));
    let singleCount = 0;
    for (let idx = 0; idx < remainCandidates.length && singleCount < 6; idx += step) {
        const s = remainCandidates[idx];
        const key = `${s.c},${s.r}`;
        if (usedCells.has(key)) continue;
        usedCells.add(key);
        const tpl = singleTemplates[(levelId + singleCount) % singleTemplates.length];
        const propItem = {
            id: `sea_${levelId}_prop_${singleCount}`,
            type: tpl.type,
            name: tpl.name,
            c: s.c,
            r: s.r,
            wCells: 1,
            hCells: 1,
            spriteSrc: tpl.spriteSrc,
            hp: tpl.hp,
            rewardGold: tpl.rewardGold
        };
        if (singleCount === 0) {
            propItem.hiddenTower = { typeKey: bonusTower2, level: 1, slotC: s.c, slotR: s.r };
        }
        outProps.push(propItem);
        singleCount++;
    }

    return outProps;
}

export class GameMap {
    constructor(canvasWidth = 960, canvasHeight = 560, levelId = 1) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.showGrid = false; // 默认网格关闭，保持界面清爽
        this.bgImages = {};
        this.hoveredSlot = null;
        this.slotHintUntil = (performance.now() / 1000) + 2.8; // 开局短暂提示，随后自动淡出隐形
        this.props = [];

        // 初始化载入指定关卡
        this.setLevel(levelId);
    }

    // 触发建塔槽位短暂闪烁提醒（点击地图空白处或波次备战时触发，2秒后自动淡出消失）
    triggerSlotHint(duration = 2.0) {
        this.slotHintUntil = (performance.now() / 1000) + duration;
    }

    // 检查某个建塔槽位是否被尚未打掉的道具障碍物遮挡
    isSlotBlockedByProp(slot) {
        if (!this.props || this.props.length === 0) return false;
        for (const p of this.props) {
            if (!p.isDead && p.coversCell(slot.c, slot.r)) {
                return true;
            }
        }
        return false;
    }

    // 动态载入指定关卡配置 (优先检查用户在可视化编辑器中保存的本地草稿)
    setLevel(levelId = 1) {
        this.currentLevel = levelId;
        let config = null;
        try {
            const rawCustom = localStorage.getItem('CF_CUSTOM_LEVEL_CONFIGS');
            if (rawCustom) {
                const customMap = JSON.parse(rawCustom);
                if (customMap[levelId] && String(customMap[levelId].id) === String(levelId)) {
                    config = customMap[levelId];
                }
            }
        } catch (e) {
            console.warn('Failed to parse CF_CUSTOM_LEVEL_CONFIGS from localStorage', e);
        }

        if (!config) {
            config = LEVEL_CONFIGS[levelId] || LEVEL_CONFIGS[1];
        } else {
            // 自动同步官方关卡最新可用武器定义（避免本地早期草稿遗留仅4座旧塔的问题）
            const officialTowers = LEVEL_CONFIGS[levelId]?.availableTowers;
            if (officialTowers) {
                config.availableTowers = officialTowers;
            }
            // 自动同步官方道具
            if (LEVEL_CONFIGS[levelId]?.props && (!config.props || config.props.length === 0)) {
                config.props = LEVEL_CONFIGS[levelId].props;
            }
        }
        this.currentLevelConfig = config;
        this.triggerSlotHint(2.8); // 换关时也短暂提示一下点位，随后隐形

        if (!this.bgImages[levelId]) {
            const img = new Image();
            img.src = config.bgSrc;
            this.bgImages[levelId] = img;
        }
        this.mapBgImage = this.bgImages[levelId];
        this.mapLoaded = this.mapBgImage.complete;
        this.mapBgImage.onload = () => {
            this.mapLoaded = true;
        };

        this.waypoints = JSON.parse(JSON.stringify(config.waypoints));
        this.pathCells = new Set(config.pathCells);
        this.startPortal = { ...config.startPortal };
        this.baseCrystal = { ...config.baseCrystal };
        this.towerSlots = JSON.parse(JSON.stringify(config.towerSlots));

        // 实例化当前关卡的场景道具 / 障碍物（深海狂澜 37~48 关若未配道具则自动生成海底宝箱与礁石）
        const rawProps = (config.props && config.props.length > 0)
            ? config.props
            : (Number(levelId) >= 37 ? buildDefaultDeepSeaProps(Number(levelId), config) : []);
        this.props = rawProps.map(pConfig => new MapProp(pConfig));
    }

    findSlotAt(px, py) {
        const c = Math.floor(px / 80);
        const r = Math.floor(py / 80);
        const cellSlot = this.towerSlots.find(s => s.c === c && s.r === r);
        if (cellSlot) {
            if (this.isSlotBlockedByProp(cellSlot)) return null;
            return cellSlot;
        }

        for (const slot of this.towerSlots) {
            const dist = Math.hypot(slot.x - px, slot.y - py);
            if (dist <= 38) {
                if (this.isSlotBlockedByProp(slot)) return null;
                return slot;
            }
        }
        return null;
    }

    findPropAt(px, py) {
        if (!this.props || this.props.length === 0) return null;
        for (let i = this.props.length - 1; i >= 0; i--) {
            const p = this.props[i];
            if (p.isHit(px, py)) {
                return p;
            }
        }
        return null;
    }

    // 绘制所有场景道具
    drawProps(ctx, time, targetedProp = null) {
        if (!this.props || this.props.length === 0) return;
        for (const p of this.props) {
            p.draw(ctx, time, p === targetedProp);
        }
    }

    draw(ctx, time, lives = 10, targetedProp = null) {
        // 1. 绘制官方高清大地图底图 (精准裁切 960x560，剔除底部多余纯海域)
        if (this.mapLoaded && this.mapBgImage.complete) {
            ctx.drawImage(this.mapBgImage, 0, 0, 960, 560, 0, 0, this.width, this.height);
        } else {
            // 优雅渐变底色降级
            ctx.fillStyle = '#7bed9f';
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // 2. 绘制起点怪物时空传送门与骷髅路标
        this.drawStartPortal(ctx, time);

        // 3. 绘制建塔基座 (云朵周边全面布局，带悬停微光动效；被道具遮挡的槽位自动隐形)
        this.drawSlots(ctx, time);

        // 3.5 绘制关卡障碍道具 (大宝箱、热气球、松树云、土星等)
        this.drawProps(ctx, time, targetedProp);

        // 4. 绘制终点：保卫萝卜官方大胡萝卜守护点
        this.drawCarrotSanctuary(ctx, time, lives);

        // 5. 绘制网格辅助层与路径可视化 (当开启时)
        if (this.showGrid) {
            this.drawGrid(ctx);
        }
    }

    // 绘制 12x7 网格辅助线与路径透视图
    drawGrid(ctx) {
        ctx.save();
        const cellSize = 80;
        const cols = 12;
        const rows = 7;

        // 1. 绘制网格底色高亮 (路径格与建塔格)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const key = `${c},${r}`;
                const x = c * cellSize;
                const y = r * cellSize;

                if (this.pathCells.has(key)) {
                    // 路径格子：柔和翠绿半透明底色
                    ctx.fillStyle = 'rgba(46, 213, 115, 0.22)';
                    ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                }

                // 检查是否是建塔槽位格子
                const slot = this.towerSlots.find(s => s.c === c && s.r === r);
                if (slot) {
                    // 建塔格子：淡天蓝半透明底色
                    ctx.fillStyle = 'rgba(0, 168, 255, 0.20)';
                    ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                }
            }
        }

        // 2. 绘制网格细线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        for (let c = 0; c <= cols; c++) {
            const x = c * cellSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }

        for (let r = 0; r <= rows; r++) {
            const y = r * cellSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // 3. 绘制路径中心主轨迹线 (带发光与箭头)
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i < this.waypoints.length; i++) {
            const wp = this.waypoints[i];
            if (i === 0) ctx.moveTo(wp.x, Math.max(0, wp.y));
            else ctx.lineTo(wp.x, wp.y);
        }
        ctx.stroke();

        // 绘制拐点圆圈与标号
        for (let i = 1; i < this.waypoints.length; i++) {
            const wp = this.waypoints[i];
            ctx.fillStyle = '#ff4757';
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // 4. 标注每个单元格的 [c, r] 和 (x, y)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const key = `${c},${r}`;
                const cx = c * cellSize + cellSize / 2;
                const cy = r * cellSize + cellSize / 2;
                const isPath = this.pathCells.has(key);
                const slot = this.towerSlots.find(s => s.c === c && s.r === r);

                // 坐标文字
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (isPath) {
                    ctx.fillStyle = '#2ed573';
                    ctx.fillText(`[${c},${r}]`, cx, cy - 18);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '10px sans-serif';
                    ctx.fillText(`${cx},${cy}`, cx, cy + 22);

                    const startC = Math.floor(((this.startPortal && this.startPortal.x !== undefined) ? this.startPortal.x : 120) / cellSize);
                    const startR = Math.floor(((this.startPortal && this.startPortal.y !== undefined) ? this.startPortal.y : 120) / cellSize);
                    const endC = Math.floor(((this.baseCrystal && this.baseCrystal.x !== undefined) ? this.baseCrystal.x : 840) / cellSize);
                    const endR = Math.floor(((this.baseCrystal && this.baseCrystal.y !== undefined) ? this.baseCrystal.y : 360) / cellSize);

                    if (c === startC && r === startR) {
                        ctx.fillStyle = '#ff4757';
                        ctx.font = 'bold 11px sans-serif';
                        ctx.fillText('起点 💀', cx, cy);
                    } else if (c === endC && r === endR) {
                        ctx.fillStyle = '#ffa502';
                        ctx.font = 'bold 11px sans-serif';
                        ctx.fillText('终点 🥕', cx, cy);
                    } else {
                        ctx.fillStyle = '#2ed573';
                        ctx.font = '10px sans-serif';
                        ctx.fillText('道路', cx, cy);
                    }
                } else if (slot) {
                    ctx.fillStyle = '#00d2d3';
                    ctx.fillText(`[${c},${r}]`, cx, cy - 18);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '10px sans-serif';
                    ctx.fillText(`插槽 #${slot.id}`, cx, cy);
                    ctx.fillText(`${cx},${cy}`, cx, cy + 18);
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.font = '10px sans-serif';
                    ctx.fillText(`[${c},${r}]`, cx, cy - 12);
                    ctx.fillText(`${cx},${cy}`, cx, cy + 12);
                }
            }
        }

        // 5. 绘制顶部信息浮条
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.roundRect(10, 10, 580, 32, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`📐 12×7 路径网格 (${this.currentLevelConfig.name}) | 🟩 绿色=怪物云道 | 🟦 蓝色=建塔插槽`, 20, 26);

        ctx.restore();
    }

    // 绘制起点怪物时空传送门与骷髅路标 (精准坐落于起点坐标)
    drawStartPortal(ctx, time) {
        const x = this.startPortal ? this.startPortal.x : 120;
        const y = this.startPortal ? this.startPortal.y : 120;
        ctx.save();

        // 1. 地面投影
        this.drawShadow(ctx, x, y + 26, 28, 9);

        // 2. 传送门旋转光环 (淡红/粉红时空波纹)
        const pulse = Math.sin(time * 4) * 4;
        const glow = ctx.createRadialGradient(x, y, 6, x, y, 36 + pulse);
        glow.addColorStop(0, 'rgba(255, 107, 129, 0.45)');
        glow.addColorStop(0.7, 'rgba(255, 71, 87, 0.15)');
        glow.addColorStop(1, 'rgba(255, 71, 87, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 36 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // 旋转虚线法阵圈
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 1.8);
        ctx.strokeStyle = 'rgba(255, 71, 87, 0.55)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 3. 官方原版骷髅路标 (精准直立木牌)
        if (!this.skullSignImg) {
            this.skullSignImg = new Image();
            this.skullSignImg.src = 'assets/official/official_skull_sign.png';
        }
        if (this.skullSignImg.complete && this.skullSignImg.naturalWidth > 0) {
            ctx.drawImage(this.skullSignImg, x - 26, y - 32, 52, 60);
        } else {
            assetsManager.drawProp(ctx, 'skull_sign', x, y, 46, 68);
        }

        // 4. 起点提示跳动徽章
        const bounce = Math.sin(time * 3.5) * 3;
        ctx.fillStyle = '#ff4757';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - 32, y - 56 + bounce, 64, 20, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚩 出生点', x, y - 46 + bounce);

        ctx.restore();
    }

    // 辅助方法：绘制地面柔和半透明投影
    drawShadow(ctx, x, y, rx, ry) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 绘制云朵建塔空槽位 (保卫萝卜原版：提醒一下自动淡出消失，鼠标悬停即刻高亮，保持画面极度清爽)
    drawSlots(ctx, time) {
        ctx.save();
        const nowSec = performance.now() / 1000;
        const hintRemaining = (this.slotHintUntil || 0) - nowSec;
        const isHintActive = hintRemaining > 0;
        // 缓动渐隐 alpha：在最后 0.9 秒内从 1 平滑淡出到 0
        const hintAlpha = isHintActive ? Math.min(1, hintRemaining / 0.9) : 0;

        for (const slot of this.towerSlots) {
            if (slot.occupied) continue;
            if (this.isSlotBlockedByProp(slot)) continue;

            const isHovered = (this.hoveredSlot && this.hoveredSlot.id === slot.id);

            // 如果既不是鼠标悬停，也没有强制开启网格，且开局/点击提醒期已过，则完全隐藏，保持界面极度清爽
            if (!isHovered && !this.showGrid && !isHintActive) {
                continue;
            }

            ctx.save();
            if (isHovered) {
                // 悬停交互：保卫萝卜原版圆角方框 + 高亮正交小加号
                this.drawShadow(ctx, slot.x, slot.y + 14, 22, 7);
                const pulse = Math.sin(time * 6) * 2;
                const half = 24 + pulse;
                ctx.fillStyle = 'rgba(46, 213, 115, 0.25)';
                ctx.strokeStyle = '#2ed573';
                ctx.lineWidth = 2.4;
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.roundRect(slot.x - half, slot.y - half, half * 2, half * 2, 10);
                ctx.fill();
                ctx.stroke();

                ctx.setLineDash([]);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.6;
                ctx.beginPath();
                ctx.moveTo(slot.x - 8, slot.y);
                ctx.lineTo(slot.x + 8, slot.y);
                ctx.moveTo(slot.x, slot.y - 8);
                ctx.lineTo(slot.x, slot.y + 8);
                ctx.stroke();
            } else {
                // 提示闪现或开启网格状态：原版半透明圆角虚线建塔格 + 正交加号
                const alpha = this.showGrid ? 1 : hintAlpha;
                ctx.globalAlpha = alpha;

                const half = 22;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.68)';
                ctx.lineWidth = 1.8;
                ctx.setLineDash([5, 4]);
                ctx.beginPath();
                ctx.roundRect(slot.x - half, slot.y - half, half * 2, half * 2, 9);
                ctx.fill();
                ctx.stroke();

                // 简约洁白正交小加号 +
                ctx.setLineDash([]);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.lineWidth = 2.0;
                ctx.beginPath();
                ctx.moveTo(slot.x - 6, slot.y);
                ctx.lineTo(slot.x + 6, slot.y);
                ctx.moveTo(slot.x, slot.y - 6);
                ctx.lineTo(slot.x, slot.y + 6);
                ctx.stroke();
            }
            ctx.restore();
        }
        ctx.restore();
    }

    triggerCarrotHurt(duration = 0.45) {
        this.carrotHurtUntil = (performance.now() / 1000) + duration;
    }

    triggerCarrotWiggle(duration = 0.65) {
        this.carrotWiggleUntil = (performance.now() / 1000) + duration;
    }

    isCarrotHit(px, py) {
        if (!this.baseCrystal) return false;
        const cx = this.baseCrystal.x !== undefined ? this.baseCrystal.x : 840;
        const cy = (this.baseCrystal.y !== undefined ? this.baseCrystal.y : 360) - 18;
        return Math.hypot(px - cx, py - cy) <= 46;
    }

    // 绘制终点：保卫萝卜官方原版大胡萝卜 (坐落于石板路终点，带实时血量与官方多阶啃咬演变)
    drawCarrotSanctuary(ctx, time, lives = 10) {
        if (!this.baseCrystal) return;
        const x = this.baseCrystal.x !== undefined ? this.baseCrystal.x : 840;
        const y = this.baseCrystal.y !== undefined ? this.baseCrystal.y : 360;
        ctx.save();

        // 守护爱心光环
        const pulse = Math.sin(time * 3) * 4;
        const glow = ctx.createRadialGradient(x, y, 10, x, y, 54 + pulse);
        glow.addColorStop(0, 'rgba(255, 121, 121, 0.35)');
        glow.addColorStop(0.7, 'rgba(46, 213, 115, 0.12)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 54 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // 地面柔和阴影
        this.drawShadow(ctx, x, y + 24, 34, 10);

        // 预加载保卫萝卜官方全阶段萝卜贴图
        if (!this.carrotSprites) {
            const ASSET_VER = '20260923_cf_v5';
            const loadCImg = (src) => {
                const img = new Image();
                img.src = `${src}?v=${ASSET_VER}`;
                return img;
            };
            this.carrotSprites = {
                hp10_smile: loadCImg('assets/official/carrot/carrot_hp10_smile.png'),
                hp10_idle:  loadCImg('assets/official/carrot/carrot_hp10_idle.png'),
                hurt_1:     loadCImg('assets/official/carrot/carrot_hurt_1.png'),
                hurt_2:     loadCImg('assets/official/carrot/carrot_hurt_2.png'),
                hurt_3:     loadCImg('assets/official/carrot/carrot_hurt_3.png'),
                dizzy:      loadCImg('assets/official/carrot/carrot_dizzy.png'),
                shake_1:    loadCImg('assets/official/carrot/carrot_shake_1.png'),
                shake_2:    loadCImg('assets/official/carrot/carrot_shake_2.png')
            };
        }

        const nowSec = performance.now() / 1000;
        const isHurtShake = nowSec < (this.carrotHurtUntil || 0);
        const isHappyWiggle = !isHurtShake && nowSec < (this.carrotWiggleUntil || 0);

        let activeSprite = this.carrotSprites.hp10_smile;
        let shakeX = 0;
        let shakeY = 0;

        if (isHurtShake) {
            // 受击震颤晃动与咬痕烟尘帧
            const shakeFrame = Math.floor(time * 16) % 2;
            activeSprite = shakeFrame ? this.carrotSprites.shake_1 : this.carrotSprites.shake_2;
            shakeX = (Math.random() - 0.5) * 6;
            shakeY = (Math.random() - 0.5) * 4;
        } else if (lives >= 10) {
            // 满血完整健康大萝卜：逗弄时调皮扭动眨眼，平时开心笑眼微扬
            const isBlink = isHappyWiggle ? (Math.floor(nowSec * 12) % 2 === 0) : (Math.sin(time * 1.8) > 0.85);
            activeSprite = isBlink ? this.carrotSprites.hp10_idle : this.carrotSprites.hp10_smile;
        } else if (lives >= 8) {
            // 咬掉第1口 (8~9血)：忍痛闭眼 (> <)
            activeSprite = this.carrotSprites.hurt_1;
        } else if (lives >= 5) {
            // 咬掉第2口 (5~7血)：缺角扩大，眼角飙泪
            activeSprite = this.carrotSprites.hurt_2;
        } else if (lives >= 2) {
            // 两侧均被咬掉 (2~4血)：重伤哭泣，泪如雨下
            activeSprite = this.carrotSprites.hurt_3;
        } else {
            // 濒死/空血 (0~1血)：几乎被啃光，只剩根部叶片与眩晕圈圈眼
            activeSprite = this.carrotSprites.dizzy;
        }

        const isDizzy = (lives <= 1 && !isHurtShake);
        const cWidth = isDizzy ? 76 : 74;
        const cHeight = isDizzy ? 64 : 96;

        const bounce = isDizzy ? 0 : (isHappyWiggle ? Math.abs(Math.sin(nowSec * 22)) * -9 : Math.sin(time * 3.5) * 2.5);
        const wiggleRot = isHappyWiggle ? Math.sin(nowSec * 28) * 0.16 : 0;
        const drawX = x - cWidth / 2 + shakeX;
        const drawY = y + 24 - cHeight + bounce + shakeY;

        if (activeSprite && activeSprite.complete && activeSprite.naturalWidth > 0) {
            if (wiggleRot !== 0) {
                ctx.save();
                ctx.translate(x, y + 18);
                ctx.rotate(wiggleRot);
                ctx.drawImage(activeSprite, -cWidth / 2, 6 - cHeight + bounce, cWidth, cHeight);
                ctx.restore();
            } else {
                ctx.drawImage(activeSprite, drawX, drawY, cWidth, cHeight);
            }
        } else {
            assetsManager.drawMascot(ctx, 'carrot', x, y - 10 + bounce, 56, 68);
        }

        // 终点生命值徽章 (悬浮于翠绿大叶子上方，根据实时血量变色)
        const badgeY = isDizzy ? (y - 56) : (drawY - 14);
        ctx.fillStyle = lives > 5 ? '#2ed573' : (lives > 2 ? '#ffa502' : '#ff4757');
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - 24, badgeY, 48, 20, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Fredoka", "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`❤️ ${lives}`, x, badgeY + 10);

        ctx.restore();
    }
}
