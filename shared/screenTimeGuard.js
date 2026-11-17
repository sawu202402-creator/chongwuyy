/**
 * shared/screenTimeGuard.js - 跨四端统一“每日游玩时长护眼控制”守护模块
 * --------------------------------------------------------------------------
 * 核心特性：
 * 1. 按小朋友独立统计每日游玩时长（默认每天 30 分钟 / 半小时，自然日零点自动重置）。
 * 2. 跨大厅、萌宠小镇、保卫兔蛙塔防、植物大战僵尸四端实时共享同一倒计时进度。
 * 3. 仅在页面前台可见且非家长设置状态下计时；锁屏、切后台或静止超 3 分钟自动暂停计时。
 * 4. 剩余 5 分钟、1 分钟弹出温和护眼提醒；到点自动暂停塔防/僵尸战局并弹出温馨护眼休息屏。
 * 5. 休息屏支持【免密一键切换另一位小朋友（如小豌豆切川川）】，以及经家长守护验证后
 *    【今日临时延长 15 分钟】或【直接修改每日时长上限 / 清零今日计时】。
 */

import {
    profileManager,
    DAILY_TIME_LIMIT_OPTIONS,
    formatTimeLimitOptionLabel,
    sanitizeDailyTimeLimitMin
} from './unifiedProfile.js';
import { requireParentGate, lockParentGateNow } from './parentGate.js';
import { sharedSpeech } from './audioTTS.js';

const IDLE_THRESHOLD_MS = 180 * 1000; // 连续 3 分钟无触控且无战斗运行时暂停扣减时长
const SAVE_INTERVAL_SEC = 5;

function formatMmSs(totalSec) {
    if (!Number.isFinite(totalSec)) return '不限时';
    const sec = Math.max(0, Math.floor(totalSec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatRemainingBadgeText(status) {
    if (!status || status.isUnlimited) {
        return '⏱️ 今日不限时';
    }
    if (status.isExpired) {
        return `🌙 今日已满 ${status.effectiveLimitMin}分`;
    }
    if (status.remainingSeconds <= 300) {
        return `⏰ 剩余 ${formatMmSs(status.remainingSeconds)}`;
    }
    return `⏱️ 剩余 ${status.remainingMinutesCeil}分/${status.effectiveLimitMin}分`;
}

class ScreenTimeGuard {
    constructor() {
        this.initialized = false;
        this.appSource = 'hub';
        this.onLockPause = null;
        this.onUnlockResume = null;
        this.onKidSwitched = null;
        this.onTick = null;
        this.isGameActivelyRunning = null;

        this.timerId = null;
        this.unsavedSecCounter = 0;
        this.lastActivityAt = Date.now();
        this.wasLocked = false;
        this.parentDrawerUnlocked = false;

        this.overlayEl = null;
        this.toastEl = null;
        this.miniPillEl = null;
        this.toastTimer = null;
    }

    init(opts = {}) {
        this.appSource = opts.appSource || this.appSource || 'hub';
        if (typeof opts.onLockPause === 'function') this.onLockPause = opts.onLockPause;
        if (typeof opts.onUnlockResume === 'function') this.onUnlockResume = opts.onUnlockResume;
        if (typeof opts.onKidSwitched === 'function') this.onKidSwitched = opts.onKidSwitched;
        if (typeof opts.onTick === 'function') this.onTick = opts.onTick;
        if (typeof opts.isGameActivelyRunning === 'function') this.isGameActivelyRunning = opts.isGameActivelyRunning;

        if (typeof document === 'undefined') return;
        this.ensureStylesAndDOM();

        if (!this.initialized) {
            this.initialized = true;
            this.bindLifecycleEvents();
            this.timerId = window.setInterval(() => this.handleSecondTick(), 1000);
        }

        this.refreshState(true);
    }

    bindLifecycleEvents() {
        const markActive = () => {
            this.lastActivityAt = Date.now();
        };
        ['pointerdown', 'keydown', 'touchstart'].forEach(ev => {
            window.addEventListener(ev, markActive, { passive: true });
        });

        window.addEventListener('cwyy-profile-updated', () => {
            this.unsavedSecCounter = 0;
            this.refreshState(false);
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.flushSave();
            } else {
                this.lastActivityAt = Date.now();
                this.syncFromStorage();
                this.refreshState(false);
            }
        });

        window.addEventListener('pagehide', () => this.flushSave());
        window.addEventListener('beforeunload', () => this.flushSave());
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) {
                this.syncFromStorage();
                this.refreshState(false);
            }
        });
    }

    syncFromStorage() {
        try {
            const latest = profileManager.load();
            if (latest && Array.isArray(latest.users)) {
                profileManager.data = latest;
                profileManager.ensureIntegrity();
            }
        } catch (_) {}
    }

    flushSave() {
        if (this.unsavedSecCounter > 0) {
            profileManager.save();
            this.unsavedSecCounter = 0;
        }
    }

    isParentModalCurrentlyOpen() {
        if (typeof document === 'undefined') return false;
        const pg = document.getElementById('cwyyParentGateModal');
        if (pg && pg.classList.contains('show')) return true;

        const hubSet = document.getElementById('hubSettingsModal');
        if (hubSet && hubSet.classList.contains('show')) return true;

        const petSet = document.getElementById('modalProfile');
        if (petSet && petSet.style.display && petSet.style.display !== 'none') return true;

        const subSet = document.getElementById('userProfileModal');
        if (subSet && (subSet.classList.contains('show') || (subSet.style.display && subSet.style.display !== 'none'))) {
            return true;
        }
        return false;
    }

    handleSecondTick() {
        if (typeof document === 'undefined' || document.hidden) return;
        if (this.isParentModalCurrentlyOpen()) {
            const st = profileManager.getDailyTimeStatus();
            if (this.onTick) this.onTick(st);
            return;
        }

        const curStatus = profileManager.getDailyTimeStatus();
        if (curStatus.isUnlimited || curStatus.isExpired) {
            this.refreshState(false);
            return;
        }

        const idleMs = Date.now() - this.lastActivityAt;
        const activelyRunning = typeof this.isGameActivelyRunning === 'function' && Boolean(this.isGameActivelyRunning());
        if (idleMs > IDLE_THRESHOLD_MS && !activelyRunning) {
            return;
        }

        this.unsavedSecCounter += 1;
        const shouldSaveNow = this.unsavedSecCounter >= SAVE_INTERVAL_SEC || curStatus.remainingSeconds <= 2;
        const nextStatus = profileManager.addPlaySeconds(1, null, shouldSaveNow);
        if (shouldSaveNow) {
            this.unsavedSecCounter = 0;
        }

        this.checkGentleReminders(nextStatus);
        this.refreshState(false, nextStatus);
    }

    checkGentleReminders(status) {
        if (!status || status.isUnlimited || status.isExpired) return;
        const activeUser = profileManager.getActiveUser();
        const kidLabel = `${activeUser?.avatar || '🐰'} ${activeUser?.name || '宝贝'}`;

        if (status.remainingSeconds <= 300 && status.remainingSeconds > 60 && !status.reminded5Min) {
            profileManager.markTimeReminded('5min', activeUser);
            this.showToast(`👀 护眼小提醒：【${kidLabel}】今天还剩 5 分钟游玩时间，打完这局准备休息眼睛咯～`, 'warn');
        } else if (status.remainingSeconds <= 60 && status.remainingSeconds > 0 && !status.reminded1Min) {
            profileManager.markTimeReminded('1min', activeUser);
            this.showToast(`⏰ 最后 1 分钟护眼倒计时！快收尾保存进度，让小眼睛休息一下吧～`, 'urgent');
        }
    }

    showToast(msg, level = 'warn') {
        if (!this.toastEl) return;
        this.toastEl.textContent = msg;
        this.toastEl.className = `cwyy-st-toast show ${level}`;
        if (this.toastTimer) clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            if (this.toastEl) this.toastEl.classList.remove('show');
        }, 6200);
    }

    refreshState(isInitial = false, precomputedStatus = null) {
        const activeUser = profileManager.getActiveUser();
        const status = precomputedStatus || profileManager.getDailyTimeStatus(activeUser);

        // 更新子游戏最后 3 分钟微缩护眼倒计时胶囊
        if (this.miniPillEl) {
            const showMini = this.appSource !== 'hub'
                && !status.isUnlimited
                && !status.isExpired
                && status.remainingSeconds <= 180;
            if (showMini) {
                this.miniPillEl.style.display = 'inline-flex';
                this.miniPillEl.textContent = `⏰ 护眼倒计时 ${formatMmSs(status.remainingSeconds)}`;
                this.miniPillEl.classList.toggle('urgent', status.remainingSeconds <= 60);
            } else {
                this.miniPillEl.style.display = 'none';
            }
        }

        if (typeof this.onTick === 'function') {
            this.onTick(status);
        }

        // 若家长设置弹窗正打开，暂不遮挡家长操作
        if (this.isParentModalCurrentlyOpen()) {
            return;
        }

        if (status.isExpired) {
            if (!this.wasLocked) {
                this.wasLocked = true;
                this.parentDrawerUnlocked = false;
                lockParentGateNow(); // 确保休息屏的家长按钮必须重新验证，防止复用此前会话免密
                try {
                    if (sharedSpeech && typeof sharedSpeech.stop === 'function') {
                        sharedSpeech.stop();
                    }
                } catch (_) {}
                if (typeof this.onLockPause === 'function') {
                    try { this.onLockPause(); } catch (_) {}
                }
            }
            this.renderRestOverlay(activeUser, status);
            if (this.overlayEl) this.overlayEl.classList.add('show');
        } else {
            if (this.wasLocked) {
                this.wasLocked = false;
                this.parentDrawerUnlocked = false;
                if (this.overlayEl) this.overlayEl.classList.remove('show');
                if (!isInitial && typeof this.onUnlockResume === 'function') {
                    try { this.onUnlockResume(); } catch (_) {}
                }
            } else if (this.overlayEl) {
                this.overlayEl.classList.remove('show');
            }
        }
    }

    ensureStylesAndDOM() {
        if (!document.getElementById('cwyyScreenTimeStyle')) {
            const style = document.createElement('style');
            style.id = 'cwyyScreenTimeStyle';
            style.textContent = `
                .cwyy-st-toast {
                    position: fixed;
                    top: 14px;
                    left: 50%;
                    transform: translate(-50%, -24px);
                    z-index: 94000;
                    background: linear-gradient(135deg, #fff9db 0%, #ffe8cc 100%);
                    color: #5c3c00;
                    border: 2.5px solid #f59f00;
                    border-radius: 999px;
                    padding: 8px 18px;
                    font-size: 13.5px;
                    font-weight: 900;
                    box-shadow: 0 10px 26px rgba(245, 159, 0, 0.28);
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.28s cubic-bezier(0.2, 0.9, 0.3, 1);
                    white-space: nowrap;
                    max-width: 92vw;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
                }
                .cwyy-st-toast.urgent {
                    background: linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%);
                    color: #c92a2a;
                    border-color: #fa5252;
                    box-shadow: 0 10px 26px rgba(250, 82, 82, 0.3);
                }
                .cwyy-st-toast.show {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
                .cwyy-st-mini-pill {
                    position: fixed;
                    bottom: 12px;
                    right: 14px;
                    z-index: 90000;
                    display: none;
                    align-items: center;
                    gap: 5px;
                    padding: 5px 12px;
                    border-radius: 999px;
                    background: rgba(30, 41, 59, 0.86);
                    color: #fde68a;
                    border: 2px solid #fbbf24;
                    font-size: 12.5px;
                    font-weight: 900;
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);
                    pointer-events: none;
                    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
                }
                .cwyy-st-mini-pill.urgent {
                    background: rgba(153, 27, 27, 0.92);
                    color: #ffffff;
                    border-color: #fca5a5;
                    animation: cwyyStPulse 1s ease-in-out infinite;
                }
                @keyframes cwyyStPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.04); }
                }
                .cwyy-st-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 95000;
                    background: radial-gradient(circle at 50% 25%, rgba(30, 58, 95, 0.94) 0%, rgba(15, 23, 42, 0.97) 100%);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    padding: 18px;
                    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
                }
                .cwyy-st-overlay.show {
                    display: flex;
                }
                .cwyy-st-card {
                    width: min(560px, 94vw);
                    max-height: 92vh;
                    overflow-y: auto;
                    background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 45%, #f8fafc 100%);
                    border: 3.5px solid #86efac;
                    border-radius: 30px;
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
                    padding: 22px 26px 20px;
                    text-align: center;
                    color: #1e293b;
                }
                .cwyy-st-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 14px;
                    border-radius: 999px;
                    background: #dcfce7;
                    color: #15803d;
                    border: 1.5px solid #86efac;
                    font-size: 13px;
                    font-weight: 900;
                    margin-bottom: 8px;
                }
                .cwyy-st-hero {
                    font-size: 46px;
                    line-height: 1.1;
                    margin: 2px 0 6px;
                }
                .cwyy-st-title {
                    font-size: 23px;
                    font-weight: 900;
                    color: #14532d;
                    margin: 0 0 6px;
                }
                .cwyy-st-desc {
                    font-size: 14px;
                    font-weight: 700;
                    color: #475569;
                    line-height: 1.55;
                    margin: 0 0 12px;
                }
                .cwyy-st-stats {
                    background: #f0fdf4;
                    border: 2px dashed #86efac;
                    border-radius: 16px;
                    padding: 10px 14px;
                    font-size: 13.5px;
                    font-weight: 800;
                    color: #166534;
                    margin-bottom: 14px;
                }
                .cwyy-st-siblings {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 14px;
                }
                .cwyy-st-sib-btn {
                    border: 2px solid #fdba74;
                    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
                    color: #9a3412;
                    border-radius: 999px;
                    padding: 8px 16px;
                    font-size: 13.5px;
                    font-weight: 900;
                    cursor: pointer;
                    box-shadow: 0 3px 0 #fdba74;
                }
                .cwyy-st-sib-btn.expired {
                    opacity: 0.65;
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                    color: #64748b;
                    box-shadow: none;
                }
                .cwyy-st-actions {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 10px;
                }
                .cwyy-st-btn {
                    border: none;
                    border-radius: 999px;
                    padding: 10px 18px;
                    font-size: 13.5px;
                    font-weight: 900;
                    cursor: pointer;
                    transition: transform 0.12s ease;
                }
                .cwyy-st-btn:active {
                    transform: translateY(1px);
                }
                .cwyy-st-btn.primary {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: #ffffff;
                    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
                }
                .cwyy-st-btn.secondary {
                    background: #ede9fe;
                    color: #5b21b6;
                    border: 2px solid #c4b5fd;
                }
                .cwyy-st-btn.ghost {
                    background: #f1f5f9;
                    color: #475569;
                    border: 1.5px solid #cbd5e1;
                }
                .cwyy-st-parent-drawer {
                    margin-top: 14px;
                    padding: 12px 14px;
                    border-radius: 18px;
                    background: #f5f3ff;
                    border: 2px solid #ddd6fe;
                    text-align: left;
                }
                .cwyy-st-drawer-title {
                    font-size: 13px;
                    font-weight: 900;
                    color: #5b21b6;
                    margin-bottom: 8px;
                }
                .cwyy-st-pill-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-bottom: 10px;
                }
                .cwyy-st-opt-pill {
                    border: 1.5px solid #c4b5fd;
                    background: #ffffff;
                    color: #4c1d95;
                    border-radius: 999px;
                    padding: 5px 12px;
                    font-size: 12.5px;
                    font-weight: 800;
                    cursor: pointer;
                }
                .cwyy-st-opt-pill.active {
                    background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
                    color: #ffffff;
                    border-color: #5b21b6;
                }
            `;
            document.head.appendChild(style);
        }

        if (!this.toastEl) {
            this.toastEl = document.createElement('div');
            this.toastEl.id = 'cwyyScreenTimeToast';
            this.toastEl.className = 'cwyy-st-toast';
            document.body.appendChild(this.toastEl);
        }

        if (!this.miniPillEl) {
            this.miniPillEl = document.createElement('div');
            this.miniPillEl.id = 'cwyyScreenTimeMiniPill';
            this.miniPillEl.className = 'cwyy-st-mini-pill';
            document.body.appendChild(this.miniPillEl);
        }

        if (!this.overlayEl) {
            this.overlayEl = document.createElement('div');
            this.overlayEl.id = 'cwyyScreenTimeRestOverlay';
            this.overlayEl.className = 'cwyy-st-overlay';
            document.body.appendChild(this.overlayEl);
        }
    }

    renderRestOverlay(activeUser, status) {
        if (!this.overlayEl) return;
        const users = profileManager.getUsers();
        const otherKids = users.filter(u => u.id !== activeUser?.id);
        const daily = profileManager.getDailyStatus(activeUser);
        const curLimitMin = sanitizeDailyTimeLimitMin(activeUser?.dailyTimeLimitMin);

        const siblingHtml = otherKids.length > 0
            ? `
                <div class="cwyy-st-siblings">
                    ${otherKids.map(k => {
                        const ks = profileManager.getDailyTimeStatus(k);
                        const remTxt = ks.isUnlimited
                            ? '今日不限时'
                            : (ks.isExpired ? '今日已满' : `今日剩余 ${ks.remainingMinutesCeil} 分钟`);
                        return `<button type="button" class="cwyy-st-sib-btn ${ks.isExpired ? 'expired' : ''}" data-switch-kid="${k.id}">
                            ${k.avatar || '🐸'} 换【${k.name}】玩（${remTxt}）
                        </button>`;
                    }).join('')}
                </div>
            `
            : '';

        const drawerHtml = this.parentDrawerUnlocked
            ? `
                <div class="cwyy-st-parent-drawer" id="cwyyStParentDrawer">
                    <div class="cwyy-st-drawer-title">⚙️ 家长快捷配置【${activeUser?.avatar || '🐰'} ${activeUser?.name}】每日游玩时长上限（跨 4 端同步）：</div>
                    <div class="cwyy-st-pill-row">
                        ${DAILY_TIME_LIMIT_OPTIONS.map(m => `
                            <button type="button" class="cwyy-st-opt-pill ${curLimitMin === m ? 'active' : ''}" data-set-limit="${m}">
                                ${formatTimeLimitOptionLabel(m, true)}
                            </button>
                        `).join('')}
                    </div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:space-between; align-items:center;">
                        <span style="font-size:12px; color:#6d28d9; font-weight:800;">今日已累计游玩 ${Math.floor(status.usedSeconds / 60)} 分钟${status.bonusMin > 0 ? `（含临时加时 ${status.bonusMin} 分钟）` : ''}</span>
                        <button type="button" class="cwyy-st-btn ghost" id="cwyyStResetTodayBtn" style="padding:6px 12px; font-size:12px;">🔄 清零今日已用时长</button>
                    </div>
                </div>
            `
            : '';

        const backHubBtnHtml = this.appSource !== 'hub'
            ? `<button type="button" class="cwyy-st-btn ghost" id="cwyyStGoHubBtn">🏠 返回游乐园大厅</button>`
            : '';

        this.overlayEl.innerHTML = `
            <div class="cwyy-st-card" role="dialog" aria-modal="true" aria-label="护眼休息提醒">
                <div class="cwyy-st-badge">🌲 科学护眼 · 每日定时休息守护</div>
                <div class="cwyy-st-hero">🌙👀✨</div>
                <h2 class="cwyy-st-title">${activeUser?.avatar || '🐰'} ${activeUser?.name || '小宝贝'}，护眼休息时间到啦！</h2>
                <p class="cwyy-st-desc">
                    今天已经愉快游玩满 <strong>${status.effectiveLimitMin} 分钟</strong>啦！<br/>
                    快去喝口温水、看看窗外远处的绿树休息一下，明天零点自动恢复活力哦～
                </p>
                <div class="cwyy-st-stats">
                    🌟 今日收获：答对 <strong>${daily.questionsCorrect || 0}</strong> 题 · 赢得 <strong>${daily.earned || 0}</strong> 枚萌宠徽章 🏅（超棒！）
                </div>
                ${siblingHtml}
                <div class="cwyy-st-actions">
                    <button type="button" class="cwyy-st-btn primary" id="cwyyStBonus15Btn">🔓 家长延长今日 15 分钟</button>
                    <button type="button" class="cwyy-st-btn secondary" id="cwyyStOpenCfgBtn">⚙️ 家长每日时长设置</button>
                    ${backHubBtnHtml}
                </div>
                ${drawerHtml}
            </div>
        `;

        // 绑定免密切换兄弟姐妹账号
        this.overlayEl.querySelectorAll('[data-switch-kid]').forEach(btn => {
            btn.addEventListener('click', () => {
                const kidId = btn.getAttribute('data-switch-kid');
                if (!kidId) return;
                const nextKid = profileManager.setActiveUser(kidId);
                if (typeof this.onKidSwitched === 'function') {
                    try { this.onKidSwitched(nextKid); } catch (_) {}
                }
                this.refreshState(false);
            });
        });

        // 家长验证延长 15 分钟
        this.overlayEl.querySelector('#cwyyStBonus15Btn')?.addEventListener('click', () => {
            requireParentGate(() => {
                profileManager.grantBonusScreenTime(15, activeUser);
                this.showToast(`🎉 家长已为【${activeUser?.name}】今日临时延长 15 分钟！`, 'warn');
                this.refreshState(false);
            }, {
                profileManager,
                actionLabel: `家长授权：为${activeUser?.name || '宝贝'}今日延长15分钟`,
                forcePrompt: true
            });
        });

        // 家长验证展开每日时长设置抽屉
        this.overlayEl.querySelector('#cwyyStOpenCfgBtn')?.addEventListener('click', () => {
            if (this.parentDrawerUnlocked) {
                this.parentDrawerUnlocked = false;
                this.renderRestOverlay(activeUser, profileManager.getDailyTimeStatus(activeUser));
                return;
            }
            requireParentGate(() => {
                this.parentDrawerUnlocked = true;
                this.renderRestOverlay(activeUser, profileManager.getDailyTimeStatus(activeUser));
            }, {
                profileManager,
                actionLabel: '家长授权：修改每日游玩时长控制',
                forcePrompt: true
            });
        });

        // 返回大厅
        this.overlayEl.querySelector('#cwyyStGoHubBtn')?.addEventListener('click', () => {
            this.flushSave();
            window.location.href = '../index.html';
        });

        // 抽屉内切换每日时长档位
        this.overlayEl.querySelectorAll('[data-set-limit]').forEach(pill => {
            pill.addEventListener('click', () => {
                const nextLimit = Number(pill.getAttribute('data-set-limit'));
                profileManager.updateUserSettings(activeUser.id, { dailyTimeLimitMin: nextLimit });
                const updated = profileManager.getDailyTimeStatus(activeUser);
                if (!updated.isExpired) {
                    this.showToast(`✅ 已将【${activeUser?.name}】每日时长设为：${formatTimeLimitOptionLabel(nextLimit, true)}`, 'warn');
                } else {
                    this.renderRestOverlay(activeUser, updated);
                }
            });
        });

        // 抽屉内清零今日计时
        this.overlayEl.querySelector('#cwyyStResetTodayBtn')?.addEventListener('click', () => {
            profileManager.resetTodayScreenTime(activeUser);
            this.showToast(`🔄 已清零【${activeUser?.name}】今日已用时长，重新开始计时！`, 'warn');
            this.refreshState(false);
        });
    }
}

export const screenTimeGuard = new ScreenTimeGuard();
