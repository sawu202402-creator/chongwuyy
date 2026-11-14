/**
 * shared/randomFilterModal.js - 全平台共享【随机题库筛选 & 英语一键降难度】快捷弹窗
 * 同时服务于：
 * - 游戏大厅 (/)
 * - 保卫兔子与青蛙 (/carrot/)
 * - 植物大战僵尸 (/pvz/)
 * - 奇妙萌宠店长 (/pet/)
 *
 * 特点：无需翻找复杂家长档案，1秒直达：
 * 1) 英语整体难度 3 档切换（🌱轻松启蒙 / ⭐标准进阶 / 🔥挑战读写）
 * 2) 自由点击勾选/屏蔽哪些【英语题型】和【数学题型】在随机题目中出现或不出现
 * 3) 保存后跨 4 大游戏实时同步，并立即刷新当前题目！
 */

import {
    ENGLISH_QUESTION_TYPES,
    ENGLISH_DIFFICULTY_MODES,
    DEFAULT_EASY_ENGLISH_TYPES,
    ALL_ENGLISH_TYPE_IDS
} from './englishEngine.js';
import {
    MATH_QUESTION_TYPES,
    ALL_MATH_TYPE_IDS
} from './mathEngine.js';
import { renderEnabledTypesSelector } from './questionWidgets.js';

const STYLE_TAG_ID = 'sharedRandomFilterStyles';
const MODAL_DOM_ID = 'sharedRandomFilterModal';

function ensureModalStyles() {
    if (typeof document === 'undefined' || document.getElementById(STYLE_TAG_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_TAG_ID;
    style.textContent = `
        #${MODAL_DOM_ID} {
            position: fixed;
            inset: 0;
            z-index: 12500;
            background: rgba(18, 16, 36, 0.68);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px;
            box-sizing: border-box;
            font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
        }
        #${MODAL_DOM_ID}.hidden {
            display: none !important;
        }
        .rfm-card {
            width: min(860px, 96vw);
            max-height: min(770px, 94vh);
            background: #ffffff;
            border-radius: 24px;
            border: 3px solid #dcd3fa;
            box-shadow: 0 18px 48px rgba(20, 14, 54, 0.36);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            color: #2d3436;
        }
        .rfm-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 12px 18px;
            background: linear-gradient(135deg, #f3eeff 0%, #e8f8f5 100%);
            border-bottom: 2px solid #ede7ff;
            flex-shrink: 0;
        }
        .rfm-title-wrap {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        .rfm-title {
            margin: 0;
            font-size: 18px;
            font-weight: 900;
            color: #3a2a6a;
        }
        .rfm-kid-pills {
            display: inline-flex;
            gap: 6px;
        }
        .rfm-kid-btn {
            border: 2px solid #d2c7f7;
            background: #fff;
            color: #4f359b;
            border-radius: 999px;
            padding: 3px 11px;
            font-size: 12.5px;
            font-weight: 900;
            cursor: pointer;
        }
        .rfm-kid-btn.active {
            border-color: #6c5ce7;
            background: #6c5ce7;
            color: #fff;
        }
        .rfm-close {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 2px solid #dfe4ea;
            background: #fff;
            color: #57606f;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
            flex-shrink: 0;
        }
        .rfm-body {
            padding: 12px 18px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .rfm-sec {
            background: #faf9ff;
            border: 1.5px solid #e6e0fa;
            border-radius: 16px;
            padding: 10px 13px;
        }
        .rfm-sec.math-sec {
            background: #f6fbff;
            border-color: #d6ecff;
        }
        .rfm-sec-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 7px;
        }
        .rfm-sec-title {
            font-size: 14px;
            font-weight: 900;
            color: #2d3436;
        }
        .rfm-sec-tip {
            font-size: 11.5px;
            font-weight: 800;
            color: #636e72;
        }
        .rfm-diff-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }
        .rfm-diff-card {
            text-align: left;
            padding: 9px 11px;
            border-radius: 14px;
            border: 2.5px solid #dfe4ea;
            background: #fff;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            gap: 3px;
            transition: all 0.14s ease;
            font-family: inherit;
        }
        .rfm-diff-card.active {
            border-color: #00b894;
            background: linear-gradient(180deg, #ecfff8 0%, #dff9fb 100%);
            box-shadow: 0 3px 0 rgba(0, 184, 148, 0.3);
        }
        .rfm-diff-name {
            font-size: 14px;
            font-weight: 900;
            color: #2d3436;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .rfm-diff-desc {
            font-size: 11px;
            font-weight: 700;
            color: #57606f;
            line-height: 1.35;
        }
        .rfm-course-subrow {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1.5px dashed #dcd3fa;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 6px;
        }
        .rfm-course-sublabel {
            font-size: 12px;
            font-weight: 800;
            color: #4f359b;
        }
        .rfm-course-subbtns {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }
        .rfm-csub-btn {
            border: 2px solid #dfe4ea;
            background: #fff;
            color: #57606f;
            border-radius: 999px;
            padding: 3px 10px;
            font-size: 11.5px;
            font-weight: 900;
            cursor: pointer;
            font-family: inherit;
        }
        .rfm-csub-btn.active {
            border-color: #6c5ce7;
            background: #f0ebff;
            color: #4834d4;
        }
        .rfm-foot {
            padding: 10px 18px;
            border-top: 2px solid #f1f2f6;
            background: #fafbff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-shrink: 0;
            flex-wrap: wrap;
        }
        .rfm-summary {
            font-size: 12.5px;
            font-weight: 800;
            color: #57606f;
        }
        .rfm-summary strong {
            color: #00b894;
        }
        .rfm-foot-btns {
            display: flex;
            gap: 8px;
        }
        .rfm-btn-cancel {
            border: 2px solid #dfe4ea;
            background: #fff;
            color: #57606f;
            border-radius: 999px;
            padding: 7px 16px;
            font-size: 13px;
            font-weight: 900;
            cursor: pointer;
            font-family: inherit;
        }
        .rfm-btn-save {
            border: 2px solid #009432;
            background: linear-gradient(180deg, #2ed573 0%, #00b894 100%);
            color: #fff;
            border-radius: 999px;
            padding: 7px 20px;
            font-size: 13.5px;
            font-weight: 900;
            cursor: pointer;
            box-shadow: 0 3px 0 #00897b;
            font-family: inherit;
        }

        /* 确保跨全部 4 个应用（含未加载 smartChalkboard.css 的大厅/萌宠）胶囊开关视觉一致 */
        #${MODAL_DOM_ID} .qw-type-selector-wrap {
            margin-top: 2px;
            padding: 7px 9px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.88);
            border: 1.5px dashed rgba(108, 92, 231, 0.25);
        }
        #${MODAL_DOM_ID} .qw-type-quick-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 6px;
        }
        #${MODAL_DOM_ID} .qw-type-count {
            font-size: 12px;
            font-weight: 800;
            color: #57606f;
        }
        #${MODAL_DOM_ID} .qw-blocked-tip {
            color: #d63031;
            font-weight: 900;
        }
        #${MODAL_DOM_ID} .qw-type-quick-btns {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }
        #${MODAL_DOM_ID} .qw-tiny-act {
            border: 1.5px solid #a29bfe;
            background: #fff;
            color: #5f27cd;
            border-radius: 999px;
            padding: 2px 9px;
            font-size: 11px;
            font-weight: 900;
            cursor: pointer;
            font-family: inherit;
        }
        #${MODAL_DOM_ID} .qw-tiny-act.easy-rec {
            border-color: #00b894;
            background: #e8fff8;
            color: #00695c;
        }
        #${MODAL_DOM_ID} .qw-tiny-act.course-only {
            border-color: #ff9f43;
            background: #fff8eb;
            color: #d35400;
        }
        #${MODAL_DOM_ID} .qw-type-pills-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }
        #${MODAL_DOM_ID} .qw-type-check-pill {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 8px;
            border-radius: 11px;
            border: 2px solid #dfe4ea;
            background: #fff;
            color: #2d3436;
            font-family: inherit;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
            text-align: left;
            transition: all 0.12s ease;
        }
        #${MODAL_DOM_ID} .qw-type-check-pill.active {
            border-color: #00b894;
            background: #e8fff8;
            color: #00695c;
        }
        #${MODAL_DOM_ID} .qw-type-check-pill.excluded {
            border-color: #fab1a0;
            background: #fff5f5;
            color: #8395a7;
        }
        #${MODAL_DOM_ID} .qw-type-check-pill.excluded .qw-pill-main-txt {
            text-decoration: line-through;
        }
        #${MODAL_DOM_ID} .qw-pill-main-txt {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        #${MODAL_DOM_ID} .qw-diff-tag {
            font-size: 10px;
            font-weight: 900;
            padding: 1px 5px;
            border-radius: 6px;
            flex-shrink: 0;
        }
        #${MODAL_DOM_ID} .qw-diff-tag.diff-easy { background: #d4fc79; color: #1e6f3d; }
        #${MODAL_DOM_ID} .qw-diff-tag.diff-medium { background: #ffeaa7; color: #a05a00; }
        #${MODAL_DOM_ID} .qw-diff-tag.diff-hard { background: #ffd6d6; color: #c0392b; }
        #${MODAL_DOM_ID} .qw-diff-tag.diff-course { background: #dfe6ff; color: #3c40c6; }
        #${MODAL_DOM_ID} .qw-state-flag {
            font-size: 10px;
            font-weight: 900;
            padding: 1px 5px;
            border-radius: 6px;
            background: rgba(0, 184, 148, 0.16);
            color: #00796b;
            flex-shrink: 0;
        }
        #${MODAL_DOM_ID} .qw-type-check-pill.excluded .qw-state-flag {
            background: rgba(214, 48, 49, 0.14);
            color: #c0392b;
        }
        @media (max-width: 720px) {
            .rfm-diff-grid,
            #${MODAL_DOM_ID} .qw-type-pills-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 打开【随机题库筛选 & 英语一键降难度】弹窗
 * @param {object} params
 * @param {object} params.profileManager - UserProfileManager 实例
 * @param {Function} [params.onSaved] - (updatedUser) => void 保存后回调
 */
export function openRandomFilterModal({ profileManager, onSaved } = {}) {
    if (!profileManager || typeof document === 'undefined') return;
    ensureModalStyles();

    let modalEl = document.getElementById(MODAL_DOM_ID);
    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = MODAL_DOM_ID;
        modalEl.className = 'hidden';
        document.body.appendChild(modalEl);
    }

    let selectedUserId = profileManager.getActiveUser().id;
    let draftWordDifficulty = 'easy';
    let draftCourseAllowHard = false;
    let draftEnTypes = [...DEFAULT_EASY_ENGLISH_TYPES];
    let draftMathTypes = [...ALL_MATH_TYPE_IDS];

    const loadDraftFromUser = (uid) => {
        const u = profileManager.getUser(uid) || profileManager.getActiveUser();
        selectedUserId = u.id;
        const ec = u.englishConfig || {};
        const mc = u.mathConfig || u.difficulty || {};
        draftWordDifficulty = ['easy', 'medium', 'all'].includes(ec.wordDifficulty) ? ec.wordDifficulty : 'easy';
        draftCourseAllowHard = typeof ec.courseAllowHardDictation === 'boolean'
            ? ec.courseAllowHardDictation
            : (draftWordDifficulty === 'all');
        draftEnTypes = Array.isArray(ec.enabledTypes) && ec.enabledTypes.length > 0
            ? [...ec.enabledTypes]
            : [...DEFAULT_EASY_ENGLISH_TYPES];
        draftMathTypes = Array.isArray(mc.enabledTypes) && mc.enabledTypes.length > 0
            ? [...mc.enabledTypes]
            : [...ALL_MATH_TYPE_IDS];
    };

    loadDraftFromUser(selectedUserId);

    const closeModal = () => {
        modalEl.classList.add('hidden');
    };

    const updateFooterSummary = () => {
        const sumEl = modalEl.querySelector('#rfmFooterSummary');
        if (!sumEl) return;
        const diffMeta = ENGLISH_DIFFICULTY_MODES.find(d => d.id === draftWordDifficulty) || ENGLISH_DIFFICULTY_MODES[0];
        const enBlocked = ALL_ENGLISH_TYPE_IDS.length - draftEnTypes.length;
        const mathBlocked = ALL_MATH_TYPE_IDS.length - draftMathTypes.length;
        sumEl.innerHTML = `当前设置：<strong>${diffMeta.name}</strong> · 英语开启 <strong>${draftEnTypes.length}</strong> 项${enBlocked > 0 ? `（屏蔽${enBlocked}项）` : ''} · 数学开启 <strong>${draftMathTypes.length}</strong> 项${mathBlocked > 0 ? `（屏蔽${mathBlocked}项）` : ''}`;
    };

    const renderModalContent = () => {
        const users = profileManager.getUsers();
        const kidsHtml = users.map(u => `
            <button type="button" class="rfm-kid-btn ${u.id === selectedUserId ? 'active' : ''}" data-rfm-kid="${u.id}">
                ${u.avatar} ${u.name}
            </button>
        `).join('');

        const diffCardsHtml = ENGLISH_DIFFICULTY_MODES.map(mode => {
            const isAct = mode.id === draftWordDifficulty;
            return `
                <button type="button" class="rfm-diff-card ${isAct ? 'active' : ''}" data-rfm-diff="${mode.id}">
                    <span class="rfm-diff-name">
                        <span>${mode.name}${mode.id === 'easy' ? '（推荐）' : ''}</span>
                        <span>${isAct ? '✅' : '⚪'}</span>
                    </span>
                    <span class="rfm-diff-desc">${mode.desc}</span>
                </button>
            `;
        }).join('');

        const hasCourse = draftEnTypes.includes('course_special');
        const courseSubRowHtml = hasCourse ? `
            <div class="rfm-course-subrow">
                <span class="rfm-course-sublabel">🎓 校外英语课在【随机抽题】中的出题方式：</span>
                <div class="rfm-course-subbtns">
                    <button type="button" class="rfm-csub-btn ${!draftCourseAllowHard ? 'active' : ''}" data-rfm-chard="0">
                        🌱 仅出听音认词+问答选择（免全词盲拼）
                    </button>
                    <button type="button" class="rfm-csub-btn ${draftCourseAllowHard ? 'active' : ''}" data-rfm-chard="1">
                        ✍️ 包含全词默写与长句排词
                    </button>
                </div>
            </div>
        ` : '';

        modalEl.innerHTML = `
            <div class="rfm-card" role="dialog" aria-modal="true" aria-label="随机题库筛选与英语降难度">
                <div class="rfm-head">
                    <div class="rfm-title-wrap">
                        <h3 class="rfm-title">🎛️ 随机题库筛选 & 英语降难度</h3>
                        <div class="rfm-kid-pills">${kidsHtml}</div>
                    </div>
                    <button type="button" class="rfm-close" id="btnRfmClose" title="关闭">✕</button>
                </div>

                <div class="rfm-body">
                    <div class="rfm-sec">
                        <div class="rfm-sec-head">
                            <span class="rfm-sec-title">🇬🇧 第一步：选择英语整体难易度（点选自动匹配适合题型）</span>
                            <span class="rfm-sec-tip">低龄宝贝建议选【🌱 轻松启蒙】，只抽短词且只有3个选项</span>
                        </div>
                        <div class="rfm-diff-grid">${diffCardsHtml}</div>
                    </div>

                    <div class="rfm-sec">
                        <div class="rfm-sec-head">
                            <span class="rfm-sec-title">🎯 第二步：勾选【英语随机】出现 / 不出现的题型</span>
                            <span class="rfm-sec-tip">点击任意卡片即可切换 ✅随机出现 / 🚫不出现（含5词背诵营同步生效）</span>
                        </div>
                        <div id="rfmEnTypesMount"></div>
                        ${courseSubRowHtml}
                    </div>

                    <div class="rfm-sec math-sec">
                        <div class="rfm-sec-head">
                            <span class="rfm-sec-title">🧮 第三步：勾选【数学随机】出现 / 不出现的题型</span>
                            <span class="rfm-sec-tip">不想出现在随机里的数学题型也可以点一下屏蔽</span>
                        </div>
                        <div id="rfmMathTypesMount"></div>
                    </div>
                </div>

                <div class="rfm-foot">
                    <div class="rfm-summary" id="rfmFooterSummary"></div>
                    <div class="rfm-foot-btns">
                        <button type="button" class="rfm-btn-cancel" id="btnRfmCancel">取消</button>
                        <button type="button" class="rfm-btn-save" id="btnRfmSave">💾 保存并立即生效</button>
                    </div>
                </div>
            </div>
        `;

        // 挂载英语题型多选器
        renderEnabledTypesSelector(
            modalEl.querySelector('#rfmEnTypesMount'),
            ENGLISH_QUESTION_TYPES,
            draftEnTypes,
            (nextIds) => {
                const prevHadCourse = draftEnTypes.includes('course_special');
                const nextHasCourse = nextIds.includes('course_special');
                draftEnTypes = nextIds;
                if (prevHadCourse !== nextHasCourse) {
                    renderModalContent();
                } else {
                    updateFooterSummary();
                }
            },
            DEFAULT_EASY_ENGLISH_TYPES
        );

        // 挂载数学题型多选器
        renderEnabledTypesSelector(
            modalEl.querySelector('#rfmMathTypesMount'),
            MATH_QUESTION_TYPES,
            draftMathTypes,
            (nextIds) => {
                draftMathTypes = nextIds;
                updateFooterSummary();
            },
            ['calc', 'compare', 'bond_pop', 'sequence_train', 'clock_money']
        );

        updateFooterSummary();

        // 绑定切换宝贝
        modalEl.querySelectorAll('[data-rfm-kid]').forEach(btn => {
            btn.onclick = () => {
                const kidId = btn.getAttribute('data-rfm-kid');
                if (kidId && kidId !== selectedUserId) {
                    loadDraftFromUser(kidId);
                    renderModalContent();
                }
            };
        });

        // 绑定英语难易度 3 档卡片（切换档位时同步套用该档推荐题型与默写开关，下方仍可继续微调）
        modalEl.querySelectorAll('[data-rfm-diff]').forEach(btn => {
            btn.onclick = () => {
                const diffId = btn.getAttribute('data-rfm-diff');
                const mode = ENGLISH_DIFFICULTY_MODES.find(d => d.id === diffId);
                if (!mode) return;
                draftWordDifficulty = mode.id;
                draftCourseAllowHard = Boolean(mode.courseAllowHardDictation);
                draftEnTypes = [...mode.recommendedTypes];
                renderModalContent();
            };
        });

        // 绑定校外英语课随机默写子开关
        modalEl.querySelectorAll('[data-rfm-chard]').forEach(btn => {
            btn.onclick = () => {
                draftCourseAllowHard = btn.getAttribute('data-rfm-chard') === '1';
                renderModalContent();
            };
        });

        // 关闭与取消
        modalEl.querySelector('#btnRfmClose')?.addEventListener('click', closeModal);
        modalEl.querySelector('#btnRfmCancel')?.addEventListener('click', closeModal);

        // 保存并立即生效
        modalEl.querySelector('#btnRfmSave')?.addEventListener('click', () => {
            const targetUser = profileManager.getUser(selectedUserId) || profileManager.getActiveUser();
            profileManager.setActiveUser(targetUser.id);
            const levelMap = {
                easy: 'level1_listen',
                medium: 'level2_match',
                all: 'mixed'
            };
            const updated = profileManager.updateUserSettings(targetUser.id, {
                englishConfig: {
                    ...(targetUser.englishConfig || {}),
                    level: levelMap[draftWordDifficulty] || 'level1_listen',
                    wordDifficulty: draftWordDifficulty,
                    courseAllowHardDictation: draftCourseAllowHard,
                    enabledTypes: [...draftEnTypes]
                },
                mathConfig: {
                    ...(targetUser.mathConfig || targetUser.difficulty || {}),
                    includeWordProblems: draftMathTypes.includes('word'),
                    includeDataCharts: draftMathTypes.includes('data'),
                    enabledTypes: [...draftMathTypes]
                }
            });
            closeModal();
            if (typeof onSaved === 'function') {
                onSaved(updated || profileManager.getActiveUser());
            }
        });
    };

    modalEl.onclick = (e) => {
        if (e.target === modalEl) closeModal();
    };

    renderModalContent();
    modalEl.classList.remove('hidden');
}
