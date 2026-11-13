/**
 * shared/parentGate.js - 跨游戏通用轻量“家长守护锁”模块
 * --------------------------------------------------------------------------
 * 设计原则：
 * 1. 小朋友切换【小豌豆 🐰 / 川川 🐸】全程免密一键切换，绝不打断宝贝游玩。
 * 2. 当涉及【修改数英难度 / 修改每日徽章上限 / 删除档案 / 导入覆盖存档】时，
 *    触发家长守护验证（两位数乘加口算 或 家长自设 4 位 PIN 码）。
 * 3. 验证通过后在当前会话 20 分钟内免重复输入，且家长可在设置中随时开关或设置 PIN 码。
 */

const UNLOCK_SESSION_KEY = 'cwyy_parent_unlock_until_v1';
const UNLOCK_DURATION_MS = 20 * 60 * 1000; // 20 分钟内免重复验证

let modalEl = null;
let activeChallenge = null;
let pendingCallback = null;

function ensureStylesAndDOM() {
    if (typeof document === 'undefined') return;
    if (!document.getElementById('cwyyParentGateStyle')) {
        const style = document.createElement('style');
        style.id = 'cwyyParentGateStyle';
        style.textContent = `
            .cwyy-pg-overlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                background: rgba(20, 24, 42, 0.68);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                display: none;
                align-items: center;
                justify-content: center;
                padding: 16px;
                font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
            }
            .cwyy-pg-overlay.show {
                display: flex;
            }
            .cwyy-pg-card {
                width: min(390px, 94vw);
                background: linear-gradient(180deg, #ffffff 0%, #f8f6ff 100%);
                border-radius: 26px;
                border: 3px solid #dcd3ff;
                box-shadow: 0 22px 50px rgba(18, 16, 48, 0.36);
                padding: 20px 22px 18px;
                text-align: center;
                color: #2d3436;
                animation: cwyyPgPop 0.2s cubic-bezier(0.2, 0.9, 0.3, 1);
            }
            @keyframes cwyyPgPop {
                from { transform: scale(0.92); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .cwyy-pg-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                border-radius: 999px;
                background: #efeaff;
                color: #6c5ce7;
                font-size: 12px;
                font-weight: 900;
                margin-bottom: 8px;
            }
            .cwyy-pg-title {
                font-size: 18px;
                font-weight: 900;
                margin: 0 0 4px;
                color: #2d3436;
            }
            .cwyy-pg-desc {
                font-size: 12.5px;
                color: #636e72;
                margin: 0 0 12px;
                line-height: 1.45;
            }
            .cwyy-pg-question {
                background: linear-gradient(135deg, #2d3436, #3d4652);
                color: #ffeaa7;
                font-size: 24px;
                font-weight: 900;
                letter-spacing: 1px;
                padding: 12px 14px;
                border-radius: 16px;
                margin-bottom: 10px;
                box-shadow: inset 0 2px 6px rgba(0,0,0,0.35);
            }
            .cwyy-pg-input {
                width: 100%;
                box-sizing: border-box;
                height: 44px;
                border-radius: 14px;
                border: 2px solid #a29bfe;
                background: #ffffff;
                font-size: 20px;
                font-weight: 900;
                text-align: center;
                color: #2d3436;
                margin-bottom: 8px;
                outline: none;
            }
            .cwyy-pg-err {
                min-height: 18px;
                font-size: 12px;
                font-weight: 800;
                color: #e74c3c;
                margin-bottom: 8px;
            }
            .cwyy-pg-keypad {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 7px;
                margin-bottom: 12px;
            }
            .cwyy-pg-key {
                height: 40px;
                border-radius: 12px;
                border: 1.5px solid #e2dcf8;
                background: #ffffff;
                font-size: 17px;
                font-weight: 900;
                color: #2d3436;
                cursor: pointer;
                box-shadow: 0 2px 0 #dcd3ff;
                user-select: none;
            }
            .cwyy-pg-key:active {
                transform: translateY(1px);
            }
            .cwyy-pg-key.fn {
                background: #f3efff;
                color: #6c5ce7;
                font-size: 13px;
            }
            .cwyy-pg-actions {
                display: flex;
                gap: 10px;
            }
            .cwyy-pg-btn {
                flex: 1;
                height: 42px;
                border-radius: 999px;
                border: none;
                font-size: 14px;
                font-weight: 900;
                cursor: pointer;
            }
            .cwyy-pg-btn.cancel {
                background: #edf0f5;
                color: #636e72;
            }
            .cwyy-pg-btn.confirm {
                background: linear-gradient(135deg, #7c5cfc, #5f3dc4);
                color: #ffffff;
                box-shadow: 0 5px 14px rgba(124, 92, 252, 0.35);
            }
        `;
        document.head.appendChild(style);
    }

    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'cwyyParentGateModal';
        modalEl.className = 'cwyy-pg-overlay';
        modalEl.innerHTML = `
            <div class="cwyy-pg-card" role="dialog" aria-modal="true">
                <div class="cwyy-pg-badge">🔒 家长守护验证</div>
                <h3 class="cwyy-pg-title" id="cwyyPgTitle">请家长协助验证</h3>
                <p class="cwyy-pg-desc" id="cwyyPgDesc">防止小朋友误改难度、每日上限或删除档案（验证后 20 分钟内免输）</p>
                <div class="cwyy-pg-question" id="cwyyPgQuestion">16 × 4 + 7 = ?</div>
                <input type="text" class="cwyy-pg-input" id="cwyyPgInput" placeholder="请点击下方数字输入" readonly inputmode="none" />
                <div class="cwyy-pg-err" id="cwyyPgErr"></div>
                <div class="cwyy-pg-keypad" id="cwyyPgKeypad">
                    <button type="button" class="cwyy-pg-key" data-k="1">1</button>
                    <button type="button" class="cwyy-pg-key" data-k="2">2</button>
                    <button type="button" class="cwyy-pg-key" data-k="3">3</button>
                    <button type="button" class="cwyy-pg-key" data-k="4">4</button>
                    <button type="button" class="cwyy-pg-key" data-k="5">5</button>
                    <button type="button" class="cwyy-pg-key" data-k="6">6</button>
                    <button type="button" class="cwyy-pg-key" data-k="7">7</button>
                    <button type="button" class="cwyy-pg-key" data-k="8">8</button>
                    <button type="button" class="cwyy-pg-key" data-k="9">9</button>
                    <button type="button" class="cwyy-pg-key fn" data-k="clear">清空</button>
                    <button type="button" class="cwyy-pg-key" data-k="0">0</button>
                    <button type="button" class="cwyy-pg-key fn" data-k="back">⌫</button>
                </div>
                <div class="cwyy-pg-actions">
                    <button type="button" class="cwyy-pg-btn cancel" id="cwyyPgCancel">取消</button>
                    <button type="button" class="cwyy-pg-btn confirm" id="cwyyPgConfirm">验证通过 ✓</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalEl);

        const inputEl = modalEl.querySelector('#cwyyPgInput');
        const errEl = modalEl.querySelector('#cwyyPgErr');

        modalEl.querySelector('#cwyyPgKeypad').addEventListener('click', (e) => {
            const btn = e.target.closest('.cwyy-pg-key');
            if (!btn) return;
            const k = btn.getAttribute('data-k');
            errEl.textContent = '';
            if (k === 'clear') {
                inputEl.value = '';
            } else if (k === 'back') {
                inputEl.value = inputEl.value.slice(0, -1);
            } else if (inputEl.value.length < 6) {
                inputEl.value += k;
            }
        });

        modalEl.querySelector('#cwyyPgCancel').addEventListener('click', () => {
            closeParentGate();
        });

        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) closeParentGate();
        });

        modalEl.querySelector('#cwyyPgConfirm').addEventListener('click', () => {
            verifyCurrentInput();
        });

        window.addEventListener('keydown', (e) => {
            if (!modalEl || !modalEl.classList.contains('show')) return;
            if (e.key >= '0' && e.key <= '9') {
                if (inputEl.value.length < 6) inputEl.value += e.key;
                errEl.textContent = '';
            } else if (e.key === 'Backspace') {
                inputEl.value = inputEl.value.slice(0, -1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                verifyCurrentInput();
            } else if (e.key === 'Escape') {
                closeParentGate();
            }
        });
    }
}

function verifyCurrentInput() {
    if (!modalEl || !activeChallenge) return;
    const inputEl = modalEl.querySelector('#cwyyPgInput');
    const errEl = modalEl.querySelector('#cwyyPgErr');
    const val = (inputEl.value || '').trim();

    const isMatch = activeChallenge.pin
        ? val === String(activeChallenge.pin)
        : Number(val) === activeChallenge.answer;

    if (!val || !isMatch) {
        errEl.textContent = activeChallenge.pin ? '❌ 家长 PIN 码不正确，请重试' : '❌ 计算结果不对哦，请家长协助输入';
        inputEl.value = '';
        return;
    }

    markParentGateUnlocked();
    const cb = pendingCallback;
    closeParentGate();
    if (typeof cb === 'function') cb();
}

function closeParentGate() {
    if (modalEl) modalEl.classList.remove('show');
    pendingCallback = null;
}

export function isParentGateUnlocked(profileManager = null) {
    if (profileManager?.data?.parentLockEnabled === false) {
        return true;
    }
    try {
        const until = Number(sessionStorage.getItem(UNLOCK_SESSION_KEY) || 0);
        return until > Date.now();
    } catch (e) {
        return false;
    }
}

export function markParentGateUnlocked() {
    try {
        sessionStorage.setItem(UNLOCK_SESSION_KEY, String(Date.now() + UNLOCK_DURATION_MS));
    } catch (e) {}
}

export function lockParentGateNow() {
    try {
        sessionStorage.removeItem(UNLOCK_SESSION_KEY);
    } catch (e) {}
}

/**
 * 触发家长守护锁验证
 * @param {() => void} onApproved 验证通过后的回调
 * @param {{ profileManager?: any, actionLabel?: string }} [opts]
 */
export function requireParentGate(onApproved, opts = {}) {
    const pm = opts.profileManager || null;
    if (isParentGateUnlocked(pm)) {
        onApproved();
        return;
    }

    ensureStylesAndDOM();
    pendingCallback = onApproved;

    const customPin = pm?.data?.parentPin && /^\d{4}$/.test(String(pm.data.parentPin))
        ? String(pm.data.parentPin)
        : '';

    const titleEl = modalEl.querySelector('#cwyyPgTitle');
    const qEl = modalEl.querySelector('#cwyyPgQuestion');
    const inputEl = modalEl.querySelector('#cwyyPgInput');
    const errEl = modalEl.querySelector('#cwyyPgErr');

    titleEl.textContent = opts.actionLabel || '修改难度与档案需家长确认';
    inputEl.value = '';
    errEl.textContent = '';

    if (customPin) {
        activeChallenge = { pin: customPin, answer: null };
        qEl.textContent = '请输入 4 位家长守护密码';
    } else {
        const a = 12 + Math.floor(Math.random() * 8); // 12 ~ 19
        const b = 3 + Math.floor(Math.random() * 6);  // 3 ~ 8
        const c = 4 + Math.floor(Math.random() * 15); // 4 ~ 18
        const answer = a * b + c;
        activeChallenge = { pin: '', a, b, c, answer };
        qEl.textContent = `${a} × ${b} + ${c} = ?`;
    }

    modalEl.classList.add('show');
}
