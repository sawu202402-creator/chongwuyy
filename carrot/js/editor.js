/**
 * editor.js - 关卡与路径可视化地图编辑器 (Visual Map & Level Editor)
 * 允许玩家与开发者直接在画布上通过鼠标点击/涂抹来编辑怪兽路线、起点、终点及炮塔插槽
 */

import { LEVEL_CONFIGS, MapProp } from './map.js?v=20261022_authentic_props_v9';

export const STORAGE_KEY = 'CF_CUSTOM_LEVEL_CONFIGS';

export class MapEditor {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        this.map = game.map;
        
        this.isEditing = false;
        this.activeTool = 'waypoint'; // 'start' | 'end' | 'waypoint' | 'slot'
        this.hoveredCell = null; // { c, r, x, y }
        this.isMouseDown = false;
        this.paintSlotMode = null; // 'add' | 'remove' (用于插槽涂抹)

        // 缓存当前正在编辑的关卡配置草稿
        this.draftConfig = null;

        // 初始化 DOM 与事件
        this.initDOM();
        this.bindCanvasEvents();
    }

    /**
     * 读取 LocalStorage 中的所有自定义关卡覆盖配置
     */
    static getCustomConfigs() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return {};
            const all = JSON.parse(raw);
            // 自动自愈：检查是否存在跨关错位污染 (例如编号 1 中塞了第 5 关)
            let hasCorruption = false;
            for (const [k, v] of Object.entries(all)) {
                if (v && v.id && String(v.id) !== String(k)) {
                    hasCorruption = true;
                    break;
                }
            }
            if (hasCorruption) {
                console.warn('检测到本地浏览器草稿存在错位污染，已自动清洗重置为最新本地代码配置！');
                localStorage.removeItem(STORAGE_KEY);
                return {};
            }
            return all;
        } catch (e) {
            console.error('Failed to parse custom configs from localStorage:', e);
            return {};
        }
    }

    /**
     * 保存自定义关卡配置到 LocalStorage (强制以 config.id 对应编号存储，坚决杜绝串关)
     */
    static saveCustomConfig(levelId, config) {
        const trueId = parseInt(config.id || levelId, 10);
        config.id = trueId;
        const all = MapEditor.getCustomConfigs();
        all[trueId] = config;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }

    /**
     * 删除指定关卡的自定义配置，还原官方配置
     */
    static removeCustomConfig(levelId) {
        const all = MapEditor.getCustomConfigs();
        if (all[levelId]) {
            delete all[levelId];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        }
    }

    /**
     * 初始化 DOM 元素绑定
     */
    initDOM() {
        this.btnToggleEditor = document.getElementById('btnToggleEditor');
        this.editorToolbar = document.getElementById('editorToolbar');
        
        this.toolButtons = {
            start: document.getElementById('toolBtnStart'),
            end: document.getElementById('toolBtnEnd'),
            waypoint: document.getElementById('toolBtnWaypoint'),
            slot: document.getElementById('toolBtnSlot')
        };

        this.btnUndoWp = document.getElementById('btnUndoWp');
        this.btnClearWp = document.getElementById('btnClearWp');
        this.btnAutoSlots = document.getElementById('btnAutoSlots');
        this.btnEditTowers = document.getElementById('btnEditTowers');
        this.btnSaveDraft = document.getElementById('btnSaveDraft');
        this.btnExportCode = document.getElementById('btnExportCode');
        this.btnResetDefault = document.getElementById('btnResetDefault');
        this.btnClearCache = document.getElementById('btnClearCache');
        this.btnSyncAllDrafts = document.getElementById('btnSyncAllDrafts');
        this.btnCloseEditor = document.getElementById('btnCloseEditor');

        // 绑定工具切换
        Object.entries(this.toolButtons).forEach(([tool, btn]) => {
            if (btn) {
                btn.addEventListener('click', () => this.setTool(tool));
            }
        });

        // 绑定操作按钮
        if (this.btnUndoWp) this.btnUndoWp.addEventListener('click', () => this.undoWaypoint());
        if (this.btnClearWp) this.btnClearWp.addEventListener('click', () => this.clearWaypoints());
        if (this.btnAutoSlots) this.btnAutoSlots.addEventListener('click', () => this.autoGenerateSlots());
        if (this.btnEditTowers) this.btnEditTowers.addEventListener('click', () => this.openTowersModal());
        if (this.btnSaveDraft) this.btnSaveDraft.addEventListener('click', () => this.saveAndApply(true));
        if (this.btnExportCode) this.btnExportCode.addEventListener('click', () => this.openExportModal());
        if (this.btnResetDefault) this.btnResetDefault.addEventListener('click', () => this.resetCurrentLevel());
        if (this.btnClearCache) {
            this.btnClearCache.addEventListener('click', () => {
                if (confirm('确定要彻底清空浏览器中保存的所有旧草稿缓存吗？清空后将直接载入本地代码 (js/map.js) 最新的准确关卡配置。')) {
                    localStorage.removeItem(STORAGE_KEY);
                    location.reload();
                }
            });
        }
        if (this.btnSyncAllDrafts) this.btnSyncAllDrafts.addEventListener('click', () => this.syncAllDraftsToDisk());
        if (this.btnCloseEditor) this.btnCloseEditor.addEventListener('click', () => this.exitEditor(true));

        // 弹窗相关
        this.exportModal = document.getElementById('exportModal');
        this.exportTextarea = document.getElementById('exportTextarea');
        this.btnCopyExport = document.getElementById('btnCopyExport');
        this.btnCloseExport = document.getElementById('btnCloseExport');

        if (this.btnCopyExport) {
            this.btnCopyExport.addEventListener('click', () => {
                if (this.exportTextarea) {
                    this.exportTextarea.select();
                    navigator.clipboard.writeText(this.exportTextarea.value).then(() => {
                        this.showNotification('📋 配置代码已成功复制到剪贴板！');
                    }).catch(() => {
                        this.showNotification('请手动 Ctrl+C 复制选中的代码');
                    });
                }
            });
        }
        if (this.btnCloseExport) {
            this.btnCloseExport.addEventListener('click', () => {
                if (this.exportModal) this.exportModal.classList.remove('active');
            });
        }

        // 武器选择弹窗
        this.towersModal = document.getElementById('towersModal');
        this.btnCloseTowers = document.getElementById('btnCloseTowers');
        this.btnSaveTowers = document.getElementById('btnSaveTowers');
        if (this.btnCloseTowers) {
            this.btnCloseTowers.addEventListener('click', () => {
                if (this.towersModal) this.towersModal.classList.remove('active');
            });
        }
        if (this.btnSaveTowers) {
            this.btnSaveTowers.addEventListener('click', () => this.saveTowersSelection());
        }
    }

    /**
     * 进入或退出编辑器模式
     */
    toggle() {
        if (this.isEditing) {
            this.exitEditor(false);
        } else {
            this.enterEditor();
        }
    }

    enterEditor() {
        this.isEditing = true;
        // 彻底暂停游戏和波次循环，清空在途怪兽与生成队列
        this.game.isPaused = true;
        this.savedGameState = this.game.state;
        this.game.state = 'PAUSED';
        this.game.enemies = [];
        this.game.enemySpawnQueue = [];
        this.game.projectiles = [];

        // 激活 HUD 按钮状态
        if (this.btnToggleEditor) {
            this.btnToggleEditor.classList.add('active');
            this.btnToggleEditor.innerText = '❌';
            this.btnToggleEditor.title = '退出地图编辑模式';
        }

        // 显示浮动编辑工具栏
        if (this.editorToolbar) {
            this.editorToolbar.classList.add('active');
        }

        // 开启网格视图以便对齐
        this.map.showGrid = true;
        const btnEditorGrid = document.getElementById('btnEditorGrid');
        if (btnEditorGrid) {
            btnEditorGrid.innerText = '📐 网格: 开';
            btnEditorGrid.classList.add('active');
        }

        // 基于当前关卡深拷贝草稿数据
        const currentLvl = this.game.currentLevel;
        const baseConfig = this.map.currentLevelConfig || LEVEL_CONFIGS[currentLvl];
        this.draftConfig = JSON.parse(JSON.stringify(baseConfig));

        this.setTool('waypoint');
        this.showNotification(`🛠️ 已进入第 ${currentLvl} 关【${this.draftConfig.name}】编辑模式`);
    }

    exitEditor(resumeGame = true) {
        this.isEditing = false;
        this.game.isPaused = false;
        // 退出编辑模式时自动关闭网格
        this.map.showGrid = false;
        const btnEditorGrid = document.getElementById('btnEditorGrid');
        if (btnEditorGrid) {
            btnEditorGrid.innerText = '📐 网格: 关';
            btnEditorGrid.classList.remove('active');
        }
        if (this.btnToggleEditor) {
            this.btnToggleEditor.classList.remove('active');
            this.btnToggleEditor.innerText = '🛠️';
            this.btnToggleEditor.title = '进入地图可视化编辑';
        }
        if (this.editorToolbar) {
            this.editorToolbar.classList.remove('active');
        }

        if (resumeGame) {
            // 重新开始该关以应用新配置
            this.game.switchLevel(this.game.currentLevel);
            this.showNotification('🎮 已退出编辑模式并立即开始实战试玩！');
        } else {
            this.game.state = this.savedGameState || 'PREPARING';
        }
    }

    /**
     * 当外部切换关卡时，编辑器自动载入对应关卡的草稿配置
     */
    onLevelChanged(newLevel) {
        if (!this.isEditing) return;
        const targetId = parseInt(newLevel, 10);
        const customConfigs = MapEditor.getCustomConfigs();
        const baseConfig = (customConfigs && customConfigs[targetId] && customConfigs[targetId].id === targetId)
            ? customConfigs[targetId]
            : (LEVEL_CONFIGS[targetId] || LEVEL_CONFIGS[1]);
        this.draftConfig = JSON.parse(JSON.stringify(baseConfig));
        this.draftConfig.id = targetId;
        this.syncToLiveMap();
        this.showNotification(`🛠️ 已载入第 ${targetId} 关【${this.draftConfig.name}】编辑模式`);
    }

    /**
     * 设置当前活动工具
     */
    setTool(tool) {
        this.activeTool = tool;
        Object.entries(this.toolButtons).forEach(([t, btn]) => {
            if (btn) {
                if (t === tool) btn.classList.add('active');
                else btn.classList.remove('active');
            }
        });
    }

    /**
     * 绑定 Canvas 鼠标交互事件
     */
    bindCanvasEvents() {
        const getCell = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const px = (e.clientX - rect.left) * scaleX;
            const py = (e.clientY - rect.top) * scaleY;
            const c = Math.floor(px / 80);
            const r = Math.floor(py / 80);
            if (c < 0 || c >= 12 || r < 0 || r >= 7) return null;
            return { c, r, x: c * 80 + 40, y: r * 80 + 40 };
        };

        this.canvas.addEventListener('pointermove', (e) => {
            if (!this.isEditing) return;
            this.hoveredCell = getCell(e);

            // 拖动涂抹插槽
            if (this.isMouseDown && this.activeTool === 'slot' && this.hoveredCell) {
                this.applySlotPaint(this.hoveredCell);
            }
        });

        this.canvas.addEventListener('pointerdown', (e) => {
            if (!this.isEditing) return;
            const cell = getCell(e);
            if (!cell) return;
            this.isMouseDown = true;

            if (this.activeTool === 'start') {
                this.setStartCell(cell);
            } else if (this.activeTool === 'end') {
                this.setEndCell(cell);
            } else if (this.activeTool === 'waypoint') {
                this.handleWaypointClick(cell);
            } else if (this.activeTool === 'slot') {
                // 判断初次点击是增加还是移除
                const existingIdx = this.draftConfig.towerSlots.findIndex(s => s.c === cell.c && s.r === cell.r);
                this.paintSlotMode = existingIdx >= 0 ? 'remove' : 'add';
                this.applySlotPaint(cell);
            }
        });

        window.addEventListener('pointerup', () => {
            this.isMouseDown = false;
            this.paintSlotMode = null;
        });
    }

    /**
     * 设定怪兽出生点
     */
    setStartCell(cell) {
        if (!this.draftConfig) return;
        this.draftConfig.startPortal = { x: cell.x, y: cell.y };
        
        // 保持 waypoints[0] 与 startPortal 一致
        if (!this.draftConfig.waypoints || this.draftConfig.waypoints.length === 0) {
            this.draftConfig.waypoints = [{ x: cell.x, y: cell.y }];
        } else {
            this.draftConfig.waypoints[0] = { x: cell.x, y: cell.y };
        }
        
        this.recalculatePathCells();
        this.syncToLiveMap();
        this.showNotification(`🚩 已将出生点设为 [${cell.c}, ${cell.r}]`);
    }

    /**
     * 设定萝卜守护点
     */
    setEndCell(cell) {
        if (!this.draftConfig) return;
        this.draftConfig.baseCrystal = { x: cell.x, y: cell.y, radius: 38 };

        if (!this.draftConfig.waypoints || this.draftConfig.waypoints.length === 0) {
            this.draftConfig.waypoints = [{ x: cell.x, y: cell.y }];
        } else {
            this.draftConfig.waypoints[this.draftConfig.waypoints.length - 1] = { x: cell.x, y: cell.y };
        }

        this.recalculatePathCells();
        this.syncToLiveMap();
        this.showNotification(`🥕 已将萝卜终点设为 [${cell.c}, ${cell.r}]`);
    }

    /**
     * 点击添加或延伸路径拐点 (智能直角正交连线)
     */
    handleWaypointClick(cell) {
        if (!this.draftConfig) return;
        const wps = this.draftConfig.waypoints || [];

        if (wps.length === 0) {
            wps.push({ x: cell.x, y: cell.y });
            this.draftConfig.startPortal = { x: cell.x, y: cell.y };
            this.showNotification(`🚩 已设定路径起点为 [${cell.c}, ${cell.r}]，请继续点击后续网格连线！`);
        } else {
            const last = wps[wps.length - 1];
            // 如果点击的就是最后一个点，忽略
            if (last.x === cell.x && last.y === cell.y) return;

            // 智能直角正交补齐：如果点击位置与上一个点不同行且不同列，自动插入水平折线拐点
            if (last.x !== cell.x && last.y !== cell.y) {
                // 优先沿水平方向走折角
                wps.push({ x: cell.x, y: last.y });
            }
            wps.push({ x: cell.x, y: cell.y });
            // 自动同步终点萝卜到最新末端
            this.draftConfig.baseCrystal = { x: cell.x, y: cell.y, radius: 38 };
            this.showNotification(`🛤️ 已添加拐点 #${wps.length}: [${cell.c}, ${cell.r}]`);
        }

        this.draftConfig.waypoints = wps;
        this.recalculatePathCells();
        this.syncToLiveMap();
    }

    /**
     * 撤销上一个拐点
     */
    undoWaypoint() {
        if (!this.draftConfig || !this.draftConfig.waypoints || this.draftConfig.waypoints.length === 0) {
            this.showNotification('当前没有路径拐点可撤销');
            return;
        }
        const popped = this.draftConfig.waypoints.pop();
        if (this.draftConfig.waypoints.length > 0) {
            const last = this.draftConfig.waypoints[this.draftConfig.waypoints.length - 1];
            this.draftConfig.baseCrystal = { x: last.x, y: last.y, radius: 38 };
        }
        this.recalculatePathCells();
        this.syncToLiveMap();
        this.showNotification(`↩️ 已撤销拐点 (${popped.x}, ${popped.y})`);
    }

    /**
     * 一键彻底清空整条路径，方便从头重新连线
     */
    clearWaypoints() {
        if (!this.draftConfig) return;
        this.draftConfig.waypoints = [];
        this.draftConfig.pathCells = [];
        // 自动切换为“连路径”工具，方便直接点击网格重新绘制
        this.setTool('waypoint');
        this.syncToLiveMap();
        this.showNotification('🗑️ 路径已彻底清空！请直接点击任意网格设定起点，并继续点击连线。');
    }

    /**
     * 涂抹/切换单个插槽
     */
    applySlotPaint(cell) {
        if (!this.draftConfig) return;
        const key = `${cell.c},${cell.r}`;
        // 禁止在路径格子内放置插槽
        if (this.draftConfig.pathCells && this.draftConfig.pathCells.includes(key)) {
            return;
        }

        const slots = this.draftConfig.towerSlots || [];
        const idx = slots.findIndex(s => s.c === cell.c && s.r === cell.r);

        if (this.paintSlotMode === 'add' && idx === -1) {
            slots.push({
                id: slots.length + 1,
                c: cell.c,
                r: cell.r,
                x: cell.x,
                y: cell.y,
                occupied: false,
                tower: null
            });
        } else if (this.paintSlotMode === 'remove' && idx >= 0) {
            slots.splice(idx, 1);
        }

        // 重新编号
        slots.forEach((s, i) => s.id = i + 1);
        this.draftConfig.towerSlots = slots;
        this.syncToLiveMap();
    }

    /**
     * 围绕当前路径自动生成紧邻的外圈插槽 (排除路径与死角)
     */
    autoGenerateSlots() {
        if (!this.draftConfig) return;
        this.recalculatePathCells();
        const pathSet = new Set(this.draftConfig.pathCells || []);
        const slotCandidates = new Set();

        (this.draftConfig.pathCells || []).forEach(cellKey => {
            const [c, r] = cellKey.split(',').map(Number);
            for (let dc = -1; dc <= 1; dc++) {
                for (let dr = -1; dr <= 1; dr++) {
                    const nc = c + dc;
                    const nr = r + dr;
                    // 允许整个 12x7 网格 (c: 0..11, r: 0..6)，包含路径上方 (r=0) 与下方 (r=6) 的所有紧邻插槽
                    if (nc >= 0 && nc < 12 && nr >= 0 && nr < 7) {
                        const nkey = `${nc},${nr}`;
                        if (!pathSet.has(nkey)) {
                            slotCandidates.add(`${nc},${nr}`);
                        }
                    }
                }
            }
        });

        const sorted = Array.from(slotCandidates).map(k => {
            const [c, r] = k.split(',').map(Number);
            return { c, r };
        }).sort((a, b) => a.r !== b.r ? a.r - b.r : a.c - b.c);

        this.draftConfig.towerSlots = sorted.map((item, idx) => ({
            id: idx + 1,
            c: item.c,
            r: item.r,
            x: item.c * 80 + 40,
            y: item.r * 80 + 40,
            occupied: false,
            tower: null
        }));

        this.syncToLiveMap();
        this.showNotification(`🪄 自动生成了 ${this.draftConfig.towerSlots.length} 个紧贴云道的插槽！`);
    }

    /**
     * 根据当前 waypoints 计算所有经过的网格坐标 pathCells
     */
    recalculatePathCells() {
        if (!this.draftConfig || !this.draftConfig.waypoints) return;
        const wps = this.draftConfig.waypoints;
        const cells = [];

        for (let i = 0; i < wps.length - 1; i++) {
            const p1 = wps[i];
            const p2 = wps[i + 1];
            const c1 = Math.floor(p1.x / 80);
            const r1 = Math.floor(p1.y / 80);
            const c2 = Math.floor(p2.x / 80);
            const r2 = Math.floor(p2.y / 80);

            const stepC = c2 >= c1 ? 1 : -1;
            const stepR = r2 >= r1 ? 1 : -1;

            if (r1 === r2) {
                for (let c = c1; c !== c2 + stepC; c += stepC) {
                    const key = `${c},${r1}`;
                    if (!cells.includes(key)) cells.push(key);
                }
            } else if (c1 === c2) {
                for (let r = r1; r !== r2 + stepR; r += stepR) {
                    const key = `${c1},${r}`;
                    if (!cells.includes(key)) cells.push(key);
                }
            }
        }

        this.draftConfig.pathCells = cells;

        // 清理掉任何与新路径重叠的旧插槽
        if (this.draftConfig.towerSlots) {
            const pathSet = new Set(cells);
            this.draftConfig.towerSlots = this.draftConfig.towerSlots.filter(s => !pathSet.has(`${s.c},${s.r}`));
            this.draftConfig.towerSlots.forEach((s, idx) => s.id = idx + 1);
        }
    }

    /**
     * 将当前 draftConfig 实时同步给活跃的 GameMap 实例并重绘
     */
    syncToLiveMap() {
        if (!this.draftConfig) return;
        this.map.waypoints = JSON.parse(JSON.stringify(this.draftConfig.waypoints));
        this.map.pathCells = new Set(this.draftConfig.pathCells || []);
        this.map.startPortal = { ...this.draftConfig.startPortal };
        this.map.baseCrystal = { ...this.draftConfig.baseCrystal };
        this.map.towerSlots = JSON.parse(JSON.stringify(this.draftConfig.towerSlots || []));
        const propsData = this.draftConfig.props || LEVEL_CONFIGS[this.draftConfig.id]?.props || [];
        this.map.props = propsData.map(p => new MapProp(p));
        this.map.currentLevelConfig = this.draftConfig;
    }

    /**
     * 保存到 LocalStorage 并直接持久化写入本地 js/map.js 代码文件
     */
    async saveAndApply(notify = true) {
        if (!this.draftConfig) return;
        this.recalculatePathCells();
        const lvl = parseInt(this.draftConfig.id || this.game.currentLevel, 10);
        this.draftConfig.id = lvl;
        MapEditor.saveCustomConfig(lvl, this.draftConfig);
        this.syncToLiveMap();

        // 重新渲染选择按钮上的炮塔
        if (this.game.renderBubbleButtons) {
            this.game.renderBubbleButtons();
        }
        if (this.game.renderLevelSelectGrid) {
            this.game.renderLevelSelectGrid();
        }

        // 发送给本地开发服务器，直接持久化写入 js/map.js
        try {
            const resp = await fetch('/api/save_level', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    levelId: lvl,
                    config: this.draftConfig
                })
            });
            const resData = await resp.json();
            if (resData && resData.success) {
                if (notify) {
                    this.showNotification(`💾 成功！第 ${lvl} 关配置已直接永久写入本地 js/map.js 项目代码中！`);
                }
                return;
            }
        } catch (err) {
            console.warn('后端直接写入 API 未响应或在纯静态环境运行，已降级写入 LocalStorage:', err);
        }

        if (notify) {
            this.showNotification(`💾 第 ${lvl} 关修改已成功保存至本地浏览器！刷新网页依然保留。`);
        }
    }

    /**
     * 将浏览器 localStorage 中保存的所有关卡草稿一键同步写入本地后端 js/map.js
     */
    async syncAllDraftsToDisk() {
        // 先确保当前画面中正在编辑的关卡草稿已被持久化纳入
        if (this.draftConfig) {
            this.recalculatePathCells();
            const curLvl = parseInt(this.draftConfig.id || this.game.currentLevel, 10);
            this.draftConfig.id = curLvl;
            MapEditor.saveCustomConfig(curLvl, this.draftConfig);
        }

        const customConfigs = MapEditor.getCustomConfigs();
        const levelIds = Object.keys(customConfigs);
        if (levelIds.length === 0) {
            this.showNotification('ℹ️ 当前已与本地代码 js/map.js 保持一致！');
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const lvlStr of levelIds) {
            const lvl = parseInt(lvlStr, 10);
            const cfg = customConfigs[lvlStr];
            try {
                const resp = await fetch('/api/save_level', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        levelId: lvl,
                        config: cfg
                    })
                });
                const resData = await resp.json();
                if (resData && resData.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (err) {
                console.error(`同步第 ${lvl} 关草稿失败:`, err);
                failCount++;
            }
        }

        if (successCount > 0) {
            this.showNotification(`🎉 同步完成！已将 ${successCount} 个关卡的草稿全部永久写入本地 js/map.js 文件！`);
        } else {
            this.showNotification(`⚠️ 同步遇到问题，请检查后端开发服务是否正常。`);
        }
    }

    /**
     * 还原为系统默认配置
     */
    resetCurrentLevel() {
        const lvl = this.game.currentLevel;
        if (!confirm(`确定要将【第 ${lvl} 关】恢复为官方原版配置吗？`)) return;

        MapEditor.removeCustomConfig(lvl);
        const defaultConfig = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];
        this.draftConfig = JSON.parse(JSON.stringify(defaultConfig));
        this.syncToLiveMap();

        if (this.game.renderBubbleButtons) this.game.renderBubbleButtons();
        if (this.game.renderLevelSelectGrid) this.game.renderLevelSelectGrid();

        this.showNotification(`🔄 已成功将第 ${lvl} 关重置为原厂默认配置！`);
    }

    /**
     * 打开武器配置弹窗
     */
    openTowersModal() {
        if (!this.draftConfig) return;
        const available = new Set(this.draftConfig.availableTowers || ['ADD_RAPID', 'DIV_FROST']);
        ['ADD_RAPID', 'DIV_FROST', 'MUL_CANNON', 'GEOM_LASER', 'FAN', 'ROCKET'].forEach(t => {
            const chk = document.getElementById(`chkTower_${t}`);
            if (chk) chk.checked = available.has(t);
        });
        if (this.towersModal) this.towersModal.classList.add('active');
    }

    /**
     * 保存武器配置
     */
    saveTowersSelection() {
        if (!this.draftConfig) return;
        const selected = [];
        ['ADD_RAPID', 'DIV_FROST', 'MUL_CANNON', 'GEOM_LASER', 'FAN', 'ROCKET'].forEach(t => {
            const chk = document.getElementById(`chkTower_${t}`);
            if (chk && chk.checked) selected.push(t);
        });

        if (selected.length === 0) {
            alert('请至少保留一种可用武器！');
            return;
        }

        this.draftConfig.availableTowers = selected;
        if (this.towersModal) this.towersModal.classList.remove('active');
        this.saveAndApply(false);
        this.showNotification(`🛡️ 关卡可用武器已更新为：${selected.join(', ')}`);
    }

    /**
     * 弹出配置代码导出窗口
     */
    openExportModal() {
        if (!this.draftConfig) return;
        this.recalculatePathCells();
        const lvl = this.game.currentLevel;
        
        // 格式化输出为规范的 JavaScript / JSON 代码
        const formatted = JSON.stringify(this.draftConfig, null, 4);
        const codeSnippet = `    ${lvl}: ${formatted}`;

        if (this.exportTextarea) {
            this.exportTextarea.value = codeSnippet;
        }
        if (this.exportModal) {
            this.exportModal.classList.add('active');
        }
    }

    /**
     * 提示气泡通知
     */
    showNotification(msg) {
        let toast = document.getElementById('editorToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'editorToast';
            toast.className = 'editor-toast';
            document.body.appendChild(toast);
        }
        toast.innerText = msg;
        toast.classList.add('show');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2800);
    }

    /**
     * 在编辑模式下渲染专属辅助高亮与序号图层
     */
    renderOverlay(time) {
        if (!this.isEditing || !this.draftConfig) return;
        const ctx = this.ctx;
        ctx.save();

        // 1. 拐点序号与方向箭头
        const wps = this.draftConfig.waypoints || [];
        for (let i = 0; i < wps.length; i++) {
            const wp = wps[i];
            const isStart = i === 0;
            const isEnd = i === wps.length - 1;

            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 14, 0, Math.PI * 2);
            ctx.fillStyle = isStart ? '#00b894' : isEnd ? '#e17055' : '#0984e3';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // 标注数字标号 ①, ②, ③
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i + 1, wp.x, wp.y);

            // 在线段上绘制行进方向小三角箭头
            if (i < wps.length - 1) {
                const next = wps[i + 1];
                const mx = (wp.x + next.x) / 2;
                const my = (wp.y + next.y) / 2;
                const angle = Math.atan2(next.y - wp.y, next.x - wp.x);

                ctx.save();
                ctx.translate(mx, my);
                ctx.rotate(angle);
                ctx.fillStyle = '#fffa65';
                ctx.beginPath();
                ctx.moveTo(10, 0);
                ctx.lineTo(-6, -6);
                ctx.lineTo(-6, 6);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#2d3436';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }
        }

        // 2. 悬停光标交互预览
        if (this.hoveredCell) {
            const { c, r, x, y } = this.hoveredCell;
            ctx.lineWidth = 2;
            
            if (this.activeTool === 'start') {
                ctx.strokeStyle = '#00b894';
                ctx.strokeRect(c * 80 + 3, r * 80 + 3, 74, 74);
                ctx.fillStyle = 'rgba(0, 184, 148, 0.25)';
                ctx.fillRect(c * 80 + 3, r * 80 + 3, 74, 74);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText('🚩 设为起点', x, y);
            } else if (this.activeTool === 'end') {
                ctx.strokeStyle = '#e17055';
                ctx.strokeRect(c * 80 + 3, r * 80 + 3, 74, 74);
                ctx.fillStyle = 'rgba(225, 112, 85, 0.25)';
                ctx.fillRect(c * 80 + 3, r * 80 + 3, 74, 74);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText('🥕 设为终点', x, y);
            } else if (this.activeTool === 'waypoint') {
                ctx.strokeStyle = '#0984e3';
                ctx.strokeRect(c * 80 + 3, r * 80 + 3, 74, 74);
                ctx.fillStyle = 'rgba(9, 132, 227, 0.25)';
                ctx.fillRect(c * 80 + 3, r * 80 + 3, 74, 74);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px sans-serif';
                const tip = wps.length === 0 ? '🚩 点击设为起点' : `+ 拐点 #${wps.length + 1}`;
                ctx.fillText(tip, x, y);
            } else if (this.activeTool === 'slot') {
                const isPath = this.draftConfig.pathCells && this.draftConfig.pathCells.includes(`${c},${r}`);
                if (isPath) {
                    ctx.strokeStyle = '#ff7675';
                    ctx.strokeRect(c * 80 + 3, r * 80 + 3, 74, 74);
                    ctx.fillStyle = 'rgba(255, 118, 117, 0.3)';
                    ctx.fillRect(c * 80 + 3, r * 80 + 3, 74, 74);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.fillText('🚫 路径内不可放塔', x, y);
                } else {
                    const hasSlot = this.draftConfig.towerSlots && this.draftConfig.towerSlots.some(s => s.c === c && s.r === r);
                    ctx.strokeStyle = hasSlot ? '#ff7675' : '#74b9ff';
                    ctx.strokeRect(c * 80 + 3, r * 80 + 3, 74, 74);
                    ctx.fillStyle = hasSlot ? 'rgba(255, 118, 117, 0.25)' : 'rgba(116, 185, 255, 0.25)';
                    ctx.fillRect(c * 80 + 3, r * 80 + 3, 74, 74);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.fillText(hasSlot ? '❌ 点击移除插槽' : '➕ 点击添加插槽', x, y);
                }
            }
        }

        ctx.restore();
    }
}
