/**
 * levelSelect.js - 《保卫萝卜》简洁网格选关系统（对标植物大战僵尸简洁模式）
 * 四大主题（天际线 / 丛林奇遇 / 沙漠风暴 / 深海狂澜）共 48 关一目了然，一键直达！
 * 同时完整保留保卫萝卜1经典双勋章记录：金/银/铜萝卜 + 道具全清奖章
 */

import { LEVEL_CONFIGS } from './map.js?v=20261113_opt_v1';
import { TOWER_TYPES } from './config.js?v=20261113_opt_v1';
import { profileManager } from '../../shared/unifiedProfile.js';

export const THEMES_DATA = [
    {
        id: 'THEME_1_SKY',
        world: 1,
        icon: '☁️',
        title: '天际线',
        headerLabel: '☁️ 第一大关：天际线 (1-1 ~ 1-12)',
        unlocked: true,
        totalStages: 12,
        stageOffset: 0
    },
    {
        id: 'THEME_2_JUNGLE',
        world: 2,
        icon: '🌿',
        title: '丛林奇遇',
        headerLabel: '🌿 第二大关：丛林奇遇 (2-1 ~ 2-12)',
        unlocked: true,
        totalStages: 12,
        stageOffset: 12
    },
    {
        id: 'THEME_3_DESERT',
        world: 3,
        icon: '🏜️',
        title: '沙漠风暴',
        headerLabel: '🏜️ 第三大关：沙漠风暴 (3-1 ~ 3-12)',
        unlocked: true,
        totalStages: 12,
        stageOffset: 24
    },
    {
        id: 'THEME_4_DEEPSEA',
        world: 4,
        icon: '🌊',
        title: '深海狂澜',
        headerLabel: '🌊 第四大关：深海狂澜 (4-1 ~ 4-12)',
        unlocked: true,
        totalStages: 12,
        stageOffset: 36
    }
];

const PROGRESS_STORAGE_KEY = 'carrot_level_records_v1';

const CARROT_RANK = {
    none: 0,
    bronze: 1,
    silver: 2,
    gold: 3
};

export class LevelSelectManager {
    constructor(soundEngine, onStartLevelCallback) {
        this.sound = soundEngine;
        this.onStartLevel = onStartLevelCallback;
        this.activeStageNum = profileManager.getActiveUser()?.lastCarrotStage || 1;
        this.filterTheme = 'ALL'; // 'ALL' | 0 | 1 | 2 | 3

        this.initDOM();
    }

    get records() {
        return profileManager.getCarrotRecords();
    }

    loadRecords() {
        return profileManager.getCarrotRecords();
    }

    saveRecords() {
        profileManager.save();
    }

    /**
     * 记录关卡胜利荣誉（保卫萝卜1经典：10血无伤金萝卜、8~9血银萝卜、1~7血铜萝卜 + 道具全清勋章）
     * 自动保留历史最高萝卜等级与全清状态
     */
    recordLevelCompletion(stageNum, livesLeftOrBool = 10, maxLives = 10, allPropsCleared = false) {
        let earnedCarrot = 'bronze';
        if (typeof livesLeftOrBool === 'boolean') {
            earnedCarrot = livesLeftOrBool ? 'gold' : 'silver';
        } else {
            const lives = Number(livesLeftOrBool) || 1;
            const cap = Number(maxLives) || 10;
            if (lives >= cap) {
                earnedCarrot = 'gold';
            } else if (lives >= cap - 2) {
                earnedCarrot = 'silver';
            } else {
                earnedCarrot = 'bronze';
            }
        }

        const prev = this.records[stageNum] || {};
        const prevRank = CARROT_RANK[prev.carrot] || 0;
        const nextRank = CARROT_RANK[earnedCarrot] || 1;
        const bestCarrot = nextRank >= prevRank ? earnedCarrot : prev.carrot;
        const bestAllClear = Boolean(prev.allClear || allPropsCleared);

        profileManager.setCarrotStageRecord(stageNum, {
            cleared: true,
            carrot: bestCarrot,
            allClear: bestAllClear,
            bestLives: Math.max(Number(prev.bestLives) || 0, typeof livesLeftOrBool === 'number' ? livesLeftOrBool : maxLives)
        });
        return {
            earnedCarrot,
            allPropsCleared: Boolean(allPropsCleared),
            bestCarrot,
            bestAllClear
        };
    }

    initDOM() {
        this.modal = document.getElementById('levelSelectModal');
        this.gridEl = document.getElementById('levelSelectGrid');
        this.summaryEl = document.getElementById('levelMedalSummary');
        this.tabsContainer = document.getElementById('levelThemeTabs');
        this.btnClose = document.getElementById('btnCloseLevelModal');

        if (this.tabsContainer) {
            this.tabsContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.concise-theme-tab');
                if (!btn) return;
                this.sound?.resumeContext();
                this.sound?.play('MenuSelect');
                const val = btn.dataset.theme;
                this.filterTheme = val === 'ALL' ? 'ALL' : Number(val);
                this.syncFilterTabs();
                this.renderGrid();
                if (this.gridEl) this.gridEl.scrollTop = 0;
            });
        }

        if (this.btnClose) {
            this.btnClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sound?.resumeContext();
                this.sound?.play('MenuSelect');
                this.close();
            });
        }
    }

    syncFilterTabs() {
        if (!this.tabsContainer) return;
        this.tabsContainer.querySelectorAll('.concise-theme-tab').forEach(btn => {
            const val = btn.dataset.theme;
            const isMatch = (this.filterTheme === 'ALL' && val === 'ALL') || (String(this.filterTheme) === val);
            btn.classList.toggle('active', isMatch);
        });
    }

    open(initialStage = 1) {
        this.activeStageNum = Math.max(1, Math.min(48, Number(initialStage) || 1));
        this.syncFilterTabs();
        this.renderGrid();
        this.modal?.classList.add('show');

        // 自动滚动定位到当前正在挑战的关卡卡片
        requestAnimationFrame(() => {
            const activeEl = document.getElementById(`level-grid-item-${this.activeStageNum}`);
            if (activeEl && this.gridEl) {
                activeEl.scrollIntoView({ block: 'nearest', behavior: 'instant' });
            }
        });
    }

    close() {
        this.modal?.classList.remove('show');
    }

    getStageDisplayCode(stageNum) {
        const themeIdx = Math.floor((stageNum - 1) / 12);
        const sub = ((stageNum - 1) % 12) + 1;
        return `${themeIdx + 1}-${sub}`;
    }

    getCleanStageTitle(stageNum) {
        const cfg = LEVEL_CONFIGS[stageNum];
        if (!cfg || !cfg.name) return `第 ${this.getStageDisplayCode(stageNum)} 关`;
        const parts = cfg.name.split(': ');
        const raw = parts.length > 1 ? parts[1] : cfg.name;
        return raw.replace(/^[\u{1F300}-\u{1FAFF}\u2600-\u27BF]\s*/u, '').trim();
    }

    renderSummary() {
        if (!this.summaryEl) return;
        let goldCount = 0;
        let allClearCount = 0;
        let clearedCount = 0;
        for (let i = 1; i <= 48; i++) {
            const rec = this.records[i];
            if (rec?.cleared) {
                clearedCount++;
                if (rec.carrot === 'gold') goldCount++;
                if (rec.allClear) allClearCount++;
            }
        }
        const u = profileManager.getActiveUser();
        const kidTag = u ? `${u.avatar || '🐰'}${u.name} · ` : '';
        this.summaryEl.textContent = `${kidTag}🥕 通关 ${clearedCount}/48 · 🥇 金萝卜 ${goldCount}/48 · 💎 全清 ${allClearCount}/48`;
    }

    renderGrid() {
        if (!this.gridEl) return;
        this.renderSummary();
        this.gridEl.innerHTML = '';

        const themesToRender = this.filterTheme === 'ALL'
            ? THEMES_DATA
            : THEMES_DATA.filter((_, idx) => idx === this.filterTheme);

        themesToRender.forEach((theme) => {
            // 统计该章节通关数
            let chapterCleared = 0;
            let chapterGold = 0;
            for (let s = 1; s <= theme.totalStages; s++) {
                const rec = this.records[theme.stageOffset + s];
                if (rec?.cleared) chapterCleared++;
                if (rec?.carrot === 'gold') chapterGold++;
            }

            const header = document.createElement('div');
            header.className = 'concise-theme-group-header';
            header.innerHTML = `
                <span>${theme.headerLabel}</span>
                <span class="concise-group-progress">通关 ${chapterCleared}/12 · 🥇${chapterGold}</span>
            `;
            this.gridEl.appendChild(header);

            for (let i = 1; i <= theme.totalStages; i++) {
                const stageNum = theme.stageOffset + i;
                const cfg = LEVEL_CONFIGS[stageNum] || {};
                const code = `${theme.world}-${i}`;
                const cleanName = this.getCleanStageTitle(stageNum);
                const waves = cfg.maxWaves || 15;
                const isBoss = (i === 6 || i === 12);
                const rec = this.records[stageNum];
                const isActive = (stageNum === this.activeStageNum);

                const towerIcons = (cfg.availableTowers || [])
                    .slice(0, 5)
                    .map(tKey => TOWER_TYPES[tKey]?.symbol || '')
                    .filter(Boolean)
                    .join('');

                let medalHtml = '';
                if (rec?.cleared) {
                    if (rec.carrot === 'gold') {
                        medalHtml += `<span class="lvl-medal lvl-medal-gold" title="满血金萝卜">🥇🥕</span>`;
                    } else if (rec.carrot === 'silver') {
                        medalHtml += `<span class="lvl-medal lvl-medal-silver" title="银萝卜">🥈🥕</span>`;
                    } else {
                        medalHtml += `<span class="lvl-medal lvl-medal-bronze" title="通关萝卜">🥉🥕</span>`;
                    }
                    if (rec.allClear) {
                        medalHtml += `<span class="lvl-medal lvl-medal-clear" title="道具全清">💎</span>`;
                    }
                }

                const card = document.createElement('button');
                card.type = 'button';
                card.id = `level-grid-item-${stageNum}`;
                card.className = `level-grid-item concise-level-card theme-world-${theme.world}${isActive ? ' active' : ''}${rec?.cleared ? ' cleared' : ''}`;
                card.innerHTML = `
                    <div class="concise-card-top">
                        <span class="concise-card-code">${code}</span>
                        <span class="concise-card-waves">${isBoss ? '👑' : ''}${waves}波</span>
                    </div>
                    <div class="concise-card-name">${cleanName}</div>
                    <div class="concise-card-bottom">
                        <span class="concise-card-towers" title="本关可用炮塔">${towerIcons}</span>
                        <span class="concise-card-medals">${medalHtml}</span>
                    </div>
                `;

                card.addEventListener('click', () => {
                    this.sound?.resumeContext();
                    this.sound?.play('GO');
                    this.activeStageNum = stageNum;
                    this.close();
                    if (this.onStartLevel) {
                        this.onStartLevel(stageNum);
                    }
                });

                this.gridEl.appendChild(card);
            }
        });
    }
}
