/**
 * levelSelect.js - 《保卫萝卜》原生两级选关系统（大关书本 + 小关卡片）
 * 1:1 还原官方主题画册（天际/丛林/沙漠/深海）与拍立得花边地图卡片轮播
 */

import { LEVEL_CONFIGS } from './map.js?v=20261022_authentic_props_v9';

export const THEMES_DATA = [
    {
        id: 'THEME_1_SKY',
        title: '天际线',
        subtitle: '天际 9+3 张地图',
        desc: '萝卜飞上云霄...',
        bookImg: 'assets/official/select/book_skyline.png?v=20260925_book_fix',
        unlocked: true,
        totalStages: 12,
        stageOffset: 0,
        stages: Array.from({ length: 12 }, (_, i) => ({
            stageNum: i + 1,
            displayNum: i + 1,
            cardImg: `assets/official/select/cards/sky_stage_${String(i + 1).padStart(2, '0')}.png?v=20260925_sky_v4`
        }))
    },
    {
        id: 'THEME_2_JUNGLE',
        title: '丛林奇遇',
        subtitle: '丛林 9+3 张地图',
        desc: '穿梭神秘树林...',
        bookImg: 'assets/official/select/book_jungle.png?v=20260925_book_fix',
        unlocked: true,
        totalStages: 12,
        stageOffset: 12,
        stages: Array.from({ length: 12 }, (_, i) => ({
            stageNum: 12 + i + 1,
            displayNum: i + 1,
            cardImg: `assets/official/select/cards/jungle_stage_${String(i + 1).padStart(2, '0')}.png?v=20260925_jungle_up1row_v2`
        }))
    },
    {
        id: 'THEME_3_DESERT',
        title: '沙漠风暴',
        subtitle: '沙漠 9+3 张地图',
        desc: '金黄热浪滚滚...',
        bookImg: 'assets/official/select/book_desert.png?v=20260925_book_fix',
        unlocked: true,
        totalStages: 12,
        stageOffset: 24,
        stages: Array.from({ length: 12 }, (_, i) => ({
            stageNum: 24 + i + 1,
            displayNum: i + 1,
            cardImg: `assets/official/select/cards/desert_stage_${String(i + 1).padStart(2, '0')}.png?v=20260925_desert_v1`
        }))
    },
    {
        id: 'THEME_4_DEEPSEA',
        title: '深海狂澜',
        subtitle: '深海 9+3 张地图',
        desc: '潜入幽蓝深海，迎击巨螯蟹王与海妖...',
        bookImg: 'assets/official/select/book_deepsea.png?v=20260925_deepsea_book_v1',
        unlocked: true,
        totalStages: 12,
        stageOffset: 36,
        stages: Array.from({ length: 12 }, (_, i) => ({
            stageNum: 36 + i + 1,
            displayNum: i + 1,
            cardImg: `assets/official/select/cards/deepsea_stage_${String(i + 1).padStart(2, '0')}.png?v=20260925_deepsea_clean_v2`
        }))
    }
];

const PROGRESS_STORAGE_KEY = 'carrot_level_records_v1';

export class LevelSelectManager {
    constructor(soundEngine, onStartLevelCallback) {
        this.sound = soundEngine;
        this.onStartLevel = onStartLevelCallback;

        this.currentThemeIdx = 0;
        this.currentStageIdx = 0; // 0-based index for current stage (0 -> stage 1)
        this.currentView = 'THEME'; // 'THEME' | 'STAGE'

        this.records = this.loadRecords();
        this.initDOM();
    }

    loadRecords() {
        try {
            const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn('Failed to load level progress:', e);
        }
        // 初始默认记录：已解锁第 1 关
        return {
            1: { cleared: true, carrot: 'gold', stars: 4 },
            2: { cleared: true, carrot: 'gold', stars: 4 },
            3: { cleared: true, carrot: 'gold', stars: 4 }
        };
    }

    saveRecords() {
        try {
            localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(this.records));
        } catch (e) {
            console.error('Failed to save records:', e);
        }
    }

    recordLevelCompletion(stageNum, isPerfect) {
        this.records[stageNum] = {
            cleared: true,
            carrot: isPerfect ? 'gold' : 'silver',
            stars: isPerfect ? 4 : 3
        };
        this.saveRecords();
    }

    initDOM() {
        this.modal = document.getElementById('levelSelectModal');
        this.themeView = document.getElementById('themeSelectView');
        this.stageView = document.getElementById('stageSelectView');

        // 大关主题视图元素
        this.themeBookContainer = document.getElementById('themeBookContainer');
        this.btnThemePrev = document.getElementById('btnThemePrev');
        this.btnThemeNext = document.getElementById('btnThemeNext');
        this.themeDots = document.getElementById('themeDots');
        this.btnThemeBackHome = document.getElementById('btnThemeBackHome');

        // 小关卡片视图元素
        this.stageCarousel = document.getElementById('stageCarousel');
        this.btnStageBackTheme = document.getElementById('btnStageBackTheme');
        this.btnStagePrev = document.getElementById('btnStagePrev');
        this.btnStageNext = document.getElementById('btnStageNext');
        this.stageWaveCount = document.getElementById('stageWaveCount');
        this.stageTowersList = document.getElementById('stageTowersList');
        this.btnStartStage = document.getElementById('btnStartStage');

        this.bindEvents();
    }

    bindEvents() {
        // 大关切换
        this.btnThemePrev?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sound?.resumeContext();
            this.sound?.play('TowerSelect');
            this.prevTheme();
        });
        this.btnThemeNext?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sound?.resumeContext();
            this.sound?.play('TowerSelect');
            this.nextTheme();
        });
        this.btnThemeBackHome?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });

        // 小关切换
        this.btnStagePrev?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sound?.resumeContext();
            this.sound?.play('TowerSelect');
            this.prevStage();
        });
        this.btnStageNext?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sound?.resumeContext();
            this.sound?.play('TowerSelect');
            this.nextStage();
        });
        this.btnStageBackTheme?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sound?.resumeContext();
            this.sound?.play('TowerBulid');
            this.showThemeView();
        });

        // 开始战斗
        this.btnStartStage?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sound?.resumeContext();
            this.sound?.play('GO');
            this.launchSelectedStage();
        });

        // 触控滑动支持 (iPad / 手机手势划动切关)
        this.setupTouchSwipe(this.themeView, () => this.nextTheme(), () => this.prevTheme());
        this.setupTouchSwipe(this.stageCarousel, () => this.nextStage(), () => this.prevStage());
    }

    setupTouchSwipe(element, onSwipeLeft, onSwipeRight) {
        if (!element) return;
        let startX = 0;
        let startY = 0;
        element.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                const diffX = e.changedTouches[0].clientX - startX;
                const diffY = e.changedTouches[0].clientY - startY;
                // 水平滑动大于 45px 且横向位移大于纵向
                if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX < 0) {
                        onSwipeLeft();
                    } else {
                        onSwipeRight();
                    }
                }
            }
        }, { passive: true });
    }

    open(initialStage = 1) {
        if (initialStage > 12) {
            this.currentThemeIdx = 1;
            this.currentStageIdx = Math.max(0, initialStage - 13);
        } else {
            this.currentThemeIdx = 0;
            this.currentStageIdx = Math.max(0, initialStage - 1);
        }
        this.modal?.classList.add('show');
        this.showThemeView();
    }

    close() {
        this.modal?.classList.remove('show');
    }

    // ================= 1. 大关主题书本视图 =================
    showThemeView() {
        this.currentView = 'THEME';
        if (this.themeView) this.themeView.style.display = 'flex';
        if (this.stageView) this.stageView.style.display = 'none';
        this.renderThemeBook();
    }

    renderThemeBook() {
        const theme = THEMES_DATA[this.currentThemeIdx];
        if (!theme || !this.themeBookContainer) return;

        // 计算当前主题通关进度
        let clearedCount = 0;
        const offset = theme.stageOffset || 0;
        for (let i = 1; i <= theme.totalStages; i++) {
            if (this.records[offset + i]?.cleared) clearedCount++;
        }

        this.themeBookContainer.innerHTML = `
            <div class="theme-book-card ${theme.unlocked ? '' : 'locked'}">
                <img src="${theme.bookImg}" class="theme-book-cover" alt="${theme.title}" />
                ${theme.unlocked ? `
                    <div class="theme-bookmark-ribbon" title="当前通关进度">
                        <span class="bookmark-text">${clearedCount}/${theme.totalStages}</span>
                    </div>
                ` : `
                    <div class="theme-lock-badge">
                        <span>🔒 敬请期待</span>
                    </div>
                `}
            </div>
        `;

        const bookCard = this.themeBookContainer.querySelector('.theme-book-card');
        if (theme.unlocked) {
            bookCard?.addEventListener('click', () => {
                this.sound?.resumeContext();
                this.sound?.play('TowerBulid');
                this.showStageView();
            });
        }

        // 渲染底部指示圆点
        if (this.themeDots) {
            this.themeDots.innerHTML = THEMES_DATA.map((_, idx) => `
                <span class="theme-dot ${idx === this.currentThemeIdx ? 'active' : ''}"></span>
            `).join('');
        }
    }

    prevTheme() {
        if (this.currentThemeIdx > 0) {
            this.currentThemeIdx--;
            this.renderThemeBook();
        }
    }

    nextTheme() {
        if (this.currentThemeIdx < THEMES_DATA.length - 1) {
            this.currentThemeIdx++;
            this.renderThemeBook();
        }
    }

    // ================= 2. 小关卡片轮播视图 =================
    showStageView() {
        this.currentView = 'STAGE';
        if (this.themeView) this.themeView.style.display = 'none';
        if (this.stageView) this.stageView.style.display = 'flex';
        const theme = THEMES_DATA[this.currentThemeIdx];
        if (theme && theme.stages.length > 0) {
            if (this.currentStageIdx >= theme.stages.length) {
                this.currentStageIdx = 0;
            }
        }
        this.renderStageCarousel();
    }

    renderStageCarousel() {
        const theme = THEMES_DATA[this.currentThemeIdx];
        if (!theme || !this.stageCarousel) return;

        const stages = theme.stages;
        const total = stages.length;
        if (total === 0) return;

        // 3D 轮播结构：前一张卡片（若有）、当前卡片、后一张卡片（若有）
        const hasPrev = this.currentStageIdx > 0;
        const hasNext = this.currentStageIdx < total - 1;
        const prevIdx = hasPrev ? this.currentStageIdx - 1 : null;
        const currIdx = this.currentStageIdx;
        const nextIdx = hasNext ? this.currentStageIdx + 1 : null;

        const currStage = stages[currIdx];
        const stageNum = currStage.stageNum;
        const record = this.records[stageNum];
        const isGold = record?.carrot === 'gold';

        this.stageCarousel.innerHTML = `
            ${hasPrev ? `
                <div class="stage-card-item stage-card-prev" data-idx="${prevIdx}">
                    <img src="${stages[prevIdx].cardImg}" alt="关卡 ${stages[prevIdx].stageNum}" />
                </div>
            ` : '<div class="stage-card-spacer"></div>'}
            <div class="stage-card-item stage-card-current" data-idx="${currIdx}">
                <img src="${currStage.cardImg}" alt="关卡 ${stageNum}" />
                ${record?.cleared ? `
                    <div class="stage-trophy-badge" title="金萝卜通关奖章">
                        <img src="assets/official/select/trophy_carrot.png?v=20260924_trophy" class="trophy-carrot-img" alt="金萝卜" />
                    </div>
                ` : ''}
            </div>
            ${hasNext ? `
                <div class="stage-card-item stage-card-next" data-idx="${nextIdx}">
                    <img src="${stages[nextIdx].cardImg}" alt="关卡 ${stages[nextIdx].stageNum}" />
                </div>
            ` : '<div class="stage-card-spacer"></div>'}
        `;

        // 点击前一张或后一张卡片可直接切换
        if (hasPrev) {
            this.stageCarousel.querySelector('.stage-card-prev')?.addEventListener('click', () => {
                this.sound?.resumeContext();
                this.sound?.play('TowerSelect');
                this.prevStage();
            });
        }
        if (hasNext) {
            this.stageCarousel.querySelector('.stage-card-next')?.addEventListener('click', () => {
                this.sound?.resumeContext();
                this.sound?.play('TowerSelect');
                this.nextStage();
            });
        }

        // 更新关卡波次数与可用防御塔
        const stageConfig = LEVEL_CONFIGS[stageNum];
        const maxWaves = stageConfig?.maxWaves || 15;
        if (this.stageWaveCount) {
            this.stageWaveCount.textContent = `▶ 共 ${maxWaves} 波`;
        }

        // 渲染本关可用防御塔圆形图标
        if (this.stageTowersList) {
            const available = stageConfig?.availableTowers || ['ADD_RAPID', 'DIV_FROST'];
            const officialTowerIcons = {
                ADD_RAPID: 'assets/official/towers/icons/bottle_icon.png?v=20260925_all18_v1',
                MUL_CANNON: 'assets/official/towers/icons/sun_icon.png?v=20260925_all18_v1',
                DIV_FROST: 'assets/official/towers/icons/shit_icon.png?v=20260925_all18_v1',
                GEOM_LASER: 'assets/official/towers/icons/star_icon.png?v=20260925_all18_v1',
                FAN: 'assets/official/towers/icons/fan_icon.png?v=20260925_all18_v1',
                ROCKET: 'assets/official/towers/icons/rocket_icon.png?v=20260925_all18_v1',
                BALL: 'assets/official/towers/icons/ball_icon.png?v=20260925_all18_v1',
                FIRE_BOTTLE: 'assets/official/towers/icons/firebottle_icon.png?v=20260925_all18_v1',
                PIN: 'assets/official/towers/icons/pin_icon.png?v=20260925_all18_v1',
                ARROW: 'assets/official/towers/icons/arrow_icon.png?v=20260925_all18_v1',
                BLUE_STAR: 'assets/official/towers/icons/bluestar_icon.png?v=20260925_all18_v1',
                SNOW: 'assets/official/towers/icons/snow_icon.png?v=20260925_all18_v1',
                FISH: 'assets/official/towers/icons/fish_icon.png?v=20260925_all18_v1',
                PLANE: 'assets/official/towers/icons/plane_icon.png?v=20260925_all18_v1',
                ANCHOR: 'assets/official/towers/icons/anchor_icon.png?v=20260925_all18_v1',
                CUTTLE: 'assets/official/towers/icons/cuttle_icon.png?v=20260925_all18_v1',
                MUSHROOM: 'assets/official/towers/icons/mushroom_icon.png?v=20260925_all18_v1',
                BUFF: 'assets/official/towers/icons/buff_icon.png?v=20260925_all18_v1'
            };

            this.stageTowersList.innerHTML = available.map(tKey => {
                const icon = officialTowerIcons[tKey] || '';
                return `
                    <div class="stage-tower-icon-wrapper" title="${tKey}">
                        <img src="${icon}" class="stage-tower-icon-img" alt="${tKey}" />
                    </div>
                `;
            }).join('');
        }
    }

    prevStage() {
        const theme = THEMES_DATA[this.currentThemeIdx];
        if (!theme || theme.stages.length === 0) return;
        if (this.currentStageIdx > 0) {
            this.currentStageIdx--;
            this.renderStageCarousel();
        }
    }

    nextStage() {
        const theme = THEMES_DATA[this.currentThemeIdx];
        if (!theme || theme.stages.length === 0) return;
        if (this.currentStageIdx < theme.stages.length - 1) {
            this.currentStageIdx++;
            this.renderStageCarousel();
        }
    }

    launchSelectedStage() {
        const theme = THEMES_DATA[this.currentThemeIdx];
        const stage = theme?.stages[this.currentStageIdx];
        if (!stage) return;

        const stageNum = stage.stageNum;
        this.close();
        if (this.onStartLevel) {
            this.onStartLevel(stageNum);
        }
    }
}
