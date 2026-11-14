/**
 * js/hub.js - 《奇趣数英游乐园 · 三合一儿童学习大厅》主控脚本
 * 连接 shared/unifiedProfile.js、shared/mathEngine.js、shared/englishEngine.js、shared/parentGate.js，
 * 实现：
 * 1. 【小豌豆 🐰】与【川川 🐸】一键免密切换，各自独立记录保卫萝卜48关金萝卜与PVZ 50关奖杯；
 * 2. 家长守护锁保护下的统一难度配置（含进退位、凑数填空、年级预设、12主题英语词包、每日上限）；
 * 3. 全局【错题重练消消乐】（数学错题互动答题消除 + 英语待强化词听音重练消除，攻克赢星星/徽章）；
 * 4. 存档备份码（CWYY1:...）与 .json 文件一键导出/恢复，跨 iPad 无缝迁移防丢失。
 */
import {
    profileManager,
    sanitizeMathEnabledTypes,
    sanitizeEnglishEnabledTypes
} from '../shared/unifiedProfile.js';
import {
    MathEngine,
    MATH_QUESTION_TYPES,
    ALL_MATH_TYPE_IDS
} from '../shared/mathEngine.js';
import {
    WORD_PACKS,
    ALL_WORDS,
    ENGLISH_LEVELS,
    ENGLISH_DIFFICULTY_MODES,
    DEFAULT_EASY_ENGLISH_TYPES,
    ENGLISH_QUESTION_TYPES,
    ALL_ENGLISH_TYPE_IDS,
    COURSE_LESSONS,
    COURSE_SUB_MODES,
    ALL_COURSE_SUB_IDS,
    getPrimaryCourseLesson,
    EnglishEngine
} from '../shared/englishEngine.js';
import {
    renderEnabledTypesSelector,
    renderMathInteractiveWidget,
    renderEnglishQuizWidget,
    renderCourseReadAloudBoard
} from '../shared/questionWidgets.js';
import { openRandomFilterModal } from '../shared/randomFilterModal.js';
import { AVATAR_LIST, DAILY_BADGE_CAP_OPTIONS, getPetById } from '../pet/js/config.js';
import { sharedSpeech } from '../shared/audioTTS.js';
import { requireParentGate } from '../shared/parentGate.js';

class PortalHubApp {
    constructor() {
        this.editingKidId = null;
        this.formState = {
            avatar: '🐰',
            dailyBadgeCap: 30,
            mode: 'custom',
            presetGrade: 'grade1_2',
            ops: ['add', 'sub'],
            range: 20,
            maxMultiplier: 5,
            allowCarryBorrow: true,
            allowFillBlank: true,
            mathTypes: [...ALL_MATH_TYPE_IDS],
            enLevel: 'mixed',
            enPackId: 'all',
            enTypes: [...ALL_ENGLISH_TYPE_IDS],
            parentLockEnabled: true,
            parentPin: ''
        };
        this.activeReportTab = 'math';
        this.enReportPackFilter = 'all';

        // 错题重练消消乐状态
        this.practiceState = {
            active: false,
            subject: 'math', // 'math' | 'english'
            inputBuf: '',
            currentItem: null,
            enOptions: [],
            clearedCount: 0,
            locked: false
        };

        // 🎓 校外英语课后专项特训舱状态
        this.courseEngine = new EnglishEngine();
        this.courseState = {
            lessonId: 'latest',
            mode: 'course_readcard',
            locked: false
        };

        this.bindEvents();
        this.renderAll();
    }

    bindEvents() {
        // iPad 添加到主屏幕独立 WebApp 内部无感跳转保护
        if (window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches) {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.getAttribute('href')) {
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                        e.preventDefault();
                        window.location.href = href;
                    }
                }
            });
        }

        // 从子游戏返回大厅时（bfcache 恢复）自动刷新最新徽章与统计
        window.addEventListener('pageshow', () => {
            profileManager.data = profileManager.load();
            profileManager.ensureIntegrity();
            this.renderAll();
        });

        // 家长设置（需家长守护锁验证）
        document.getElementById('btnHubSettings')?.addEventListener('click', () => {
            requireParentGate(() => this.openSettingsModal(), {
                profileManager,
                actionLabel: '进入家长难度与上限管理'
            });
        });
        document.getElementById('btnHubQuickTypesCfg')?.addEventListener('click', () => {
            openRandomFilterModal({
                profileManager,
                onSaved: () => {
                    this.renderAll();
                }
            });
        });
        document.getElementById('btnCloseHubSettings')?.addEventListener('click', () => {
            document.getElementById('hubSettingsModal')?.classList.remove('show');
        });
        document.getElementById('btnSaveHubSettings')?.addEventListener('click', () => this.saveSettingsModal());

        document.getElementById('btnToggleParentLock')?.addEventListener('click', () => {
            this.formState.parentLockEnabled = !this.formState.parentLockEnabled;
            this.renderParentLockBtn();
        });

        document.getElementById('btnHubDeleteKid')?.addEventListener('click', () => {
            if (!this.editingKidId || this.editingKidId === '__NEW__') return;
            const u = profileManager.getUser(this.editingKidId);
            if (u && confirm(`确定要删除【${u.name}】的档案吗？`)) {
                profileManager.deleteUser(this.editingKidId);
                this.editingKidId = profileManager.getActiveUser().id;
                this.loadKidIntoForm(profileManager.getActiveUser(), false);
                this.renderSettingsModal();
                this.renderAll();
            }
        });

        // 错题本与重练消消乐弹窗
        document.getElementById('btnHubReport')?.addEventListener('click', () => this.openReportModal());
        document.getElementById('btnCloseHubReport')?.addEventListener('click', () => {
            this.stopMistakePractice();
            document.getElementById('hubReportModal')?.classList.remove('show');
        });

        document.getElementById('hubReportTabs')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.hub-rep-tab');
            if (!btn) return;
            this.stopMistakePractice();
            this.activeReportTab = btn.getAttribute('data-rtab') || 'math';
            document.querySelectorAll('#hubReportTabs .hub-rep-tab').forEach(b => {
                b.classList.toggle('active', b === btn);
            });
            this.renderReportList();
        });

        // 存档备份导入导出弹窗
        document.getElementById('btnHubBackup')?.addEventListener('click', () => this.openBackupModal());
        document.getElementById('btnCloseHubBackup')?.addEventListener('click', () => {
            document.getElementById('hubBackupModal')?.classList.remove('show');
        });
        document.getElementById('btnCopyBackupCode')?.addEventListener('click', () => this.handleCopyBackupCode());
        document.getElementById('btnDownloadBackupJson')?.addEventListener('click', () => this.handleDownloadBackupJson());
        document.getElementById('btnPickBackupFile')?.addEventListener('click', () => {
            document.getElementById('hubBackupFileInput')?.click();
        });
        document.getElementById('hubBackupFileInput')?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const inputEl = document.getElementById('hubBackupCodeInput');
                if (inputEl) inputEl.value = String(reader.result || '');
                this.setBackupMsg(`📂 已读取备份文件《${file.name}》，请点击右侧【验证并恢复存档】生效。`, false);
            };
            reader.readAsText(file);
        });
        document.getElementById('btnApplyBackupImport')?.addEventListener('click', () => {
            const raw = (document.getElementById('hubBackupCodeInput')?.value || '').trim();
            if (!raw) {
                this.setBackupMsg('⚠️ 请先粘贴备份码或选择 .json 备份文件！', true);
                return;
            }
            requireParentGate(() => {
                const res = profileManager.importBackup(raw);
                this.setBackupMsg(res.msg, !res.ok);
                if (res.ok) {
                    this.renderAll();
                    const outEl = document.getElementById('hubBackupCodeOutput');
                    if (outEl) outEl.value = profileManager.exportBackupCode();
                }
            }, {
                profileManager,
                actionLabel: '恢复覆盖存档需家长验证'
            });
        });

        document.getElementById('btnHubFullscreen')?.addEventListener('click', () => {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                const root = document.documentElement;
                if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
                else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen();
            } else {
                if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            }
        });

        // 🎓 校外英语课后专项特训舱弹窗
        document.getElementById('btnHubCourseCenter')?.addEventListener('click', () => this.openCourseModal());
        document.getElementById('btnCloseHubCourse')?.addEventListener('click', () => {
            document.getElementById('hubCourseModal')?.classList.remove('show');
        });
        document.getElementById('hubCourseLessonSelect')?.addEventListener('change', (e) => {
            this.courseState.lessonId = e.target.value;
            const active = profileManager.getActiveUser();
            if (active) {
                profileManager.updateUserSettings(active.id, {
                    englishConfig: { ...(active.englishConfig || {}), courseLessonId: e.target.value }
                });
            }
            this.renderCourseModal(true);
        });
        document.getElementById('hubCourseModeTabs')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.hub-course-tab');
            if (!btn) return;
            const cmode = btn.getAttribute('data-cmode') || 'course_readcard';
            this.courseState.mode = cmode;
            profileManager.setPreferredSmartMode(cmode);
            this.renderSmartModeStrip(profileManager.getActiveUser());
            this.renderCourseModal(true);
        });
        document.querySelectorAll('[data-jumpgame]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetMode = this.courseState.mode === 'course_readcard' ? 'course_all' : this.courseState.mode;
                profileManager.setPreferredSmartMode(targetMode);
                window.location.href = btn.getAttribute('data-jumpgame');
            });
        });

        // 模态遮罩空白处关闭
        ['hubSettingsModal', 'hubReportModal', 'hubBackupModal', 'hubCourseModal'].forEach(id => {
            const modal = document.getElementById(id);
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (id === 'hubReportModal') this.stopMistakePractice();
                    modal.classList.remove('show');
                }
            });
        });
    }

    renderAll() {
        const users = profileManager.getUsers();
        const active = profileManager.getActiveUser();
        const daily = profileManager.getDailyStatus(active);

        // 1. 顶部小朋友一键切换条（免密秒切）
        const switcher = document.getElementById('hubKidsSwitcher');
        if (switcher) {
            switcher.innerHTML = '';
            users.forEach(u => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `hub-kid-chip ${u.id === active.id ? 'active' : ''}`;
                btn.innerHTML = `<span>${u.avatar || '🐰'}</span><span>${u.name}</span>`;
                btn.addEventListener('click', () => {
                    profileManager.setActiveUser(u.id);
                    this.renderAll();
                });
                switcher.appendChild(btn);
            });
        }

        // 错题红点提示
        const totalMistakes = (active.mathMistakes?.length || 0) + (active.englishMistakes?.length || 0);
        const dotEl = document.getElementById('hubMistakeBadge');
        if (dotEl) {
            dotEl.style.display = totalMistakes > 0 ? 'inline-block' : 'none';
            dotEl.textContent = String(totalMistakes);
        }

        // 2. 顶部宝贝进度横幅
        const petMeta = getPetById(active.activePetId || 'rabbit');
        const petThumb = document.getElementById('bannerPetThumb');
        if (petThumb && petMeta) {
            petThumb.src = `pet/${petMeta.img}`;
            petThumb.alt = petMeta.name;
        }

        const mathSummary = MathEngine.formatSummary(active.mathConfig || active.difficulty);
        const enSummary = EnglishEngine.formatSummary(active.englishConfig);

        document.getElementById('bannerKidName').textContent = `${active.avatar || '🐰'} ${active.name}`;
        document.getElementById('bannerMathSummary').textContent = `🎯 数学：${mathSummary}`;
        document.getElementById('bannerEnSummary').textContent = `🔤 英语：${enSummary}`;
        document.getElementById('bannerBadgesVal').textContent = active.badges || 0;
        document.getElementById('bannerTicketsVal').textContent = active.gachaTickets || 0;

        const pct = Math.min(100, Math.round((daily.earned / Math.max(1, daily.cap)) * 100));
        document.getElementById('bannerDailyText').textContent = daily.isCapped
            ? `已满 ${daily.cap}/${daily.cap} 🎉`
            : `${daily.earned} / ${daily.cap}`;
        document.getElementById('bannerDailyFill').style.width = `${pct}%`;

        // 2B. 全局统一大随机 & 单项目直达快捷栏
        this.renderSmartModeStrip(active);

        // 3. 三张游戏卡的实时独立个性化进度
        const unlockedPetsCount = Object.values(active.pets || {}).filter(p => p.unlocked).length;
        const activePetState = active.pets?.[active.activePetId] || { level: 1 };
        const statPetEl = document.getElementById('liveStatPet');
        if (statPetEl) {
            statPetEl.innerHTML = `
                <span>🐾 已领养：${unlockedPetsCount} 只萌宠</span>
                <span>❤️ ${petMeta.name} Lv.${activePetState.level}</span>
            `;
        }

        const carrotRecs = Object.values(active.carrotRecords || {});
        const carrotCleared = carrotRecs.filter(r => r && r.cleared).length;
        const carrotGold = carrotRecs.filter(r => r && r.carrot === 'gold').length;
        const totalAnswered = (active.stats?.totalMathCorrect || 0) + (active.stats?.totalEnglishCorrect || 0);
        const statCarrotEl = document.getElementById('liveStatCarrot');
        if (statCarrotEl) {
            statCarrotEl.innerHTML = `
                <span>🥕 闯关 ${carrotCleared}/48 · 🥇${carrotGold}</span>
                <span>🎯 累计答对 ${totalAnswered} 题</span>
            `;
        }

        const statPvzEl = document.getElementById('liveStatPvz');
        if (statPvzEl) {
            const pvzCleared = Object.values(active.pvzRecords || {}).filter(r => r && r.cleared).length;
            const flags = active.bestEndlessFlags || 0;
            const masteredWords = active.stats?.totalWordsMastered || 0;
            statPvzEl.innerHTML = `
                <span>🌻 冒险 ${pvzCleared}/50 · ♾️${flags}旗</span>
                <span>🔤 已掌握 ${masteredWords}/${ALL_WORDS.length} 词</span>
            `;
        }
    }

    renderSmartModeStrip(active) {
        const strip = document.getElementById('hubSmartModeStrip');
        if (!strip) return;
        const curMode = active.preferredSmartMode || 'grand_random';
        const mCnt = sanitizeMathEnabledTypes(active.mathConfig?.enabledTypes).length;
        const eCnt = sanitizeEnglishEnabledTypes(active.englishConfig?.enabledTypes).length;

        const entries = [
            { id: 'grand_random', label: `🎲 数英大随机(${mCnt}+${eCnt})`, grand: true, title: '从已勾选的数学题型与英语题型中智能穿插出题' },
            { id: 'math_random', label: `🎲 数学随机(${mCnt})`, title: '仅从已勾选的数学题型中随机出题' },
            { id: 'english_random', label: `🎲 英语随机(${eCnt})`, title: '仅从已勾选的英语题型中随机出题' },
            { id: 'vocab_camp', label: '📖 5词背诵', title: '进入游戏直接开启 5 词闪卡认读 + 闯关检验' },
            { divider: true },
            ...COURSE_SUB_MODES.map(cm => ({
                id: cm.id,
                label: cm.shortName,
                course: true,
                title: `校外英语课专项：${cm.name}（${cm.desc}）`
            })),
            { divider: true },
            ...MATH_QUESTION_TYPES.map(t => ({ id: t.id, label: t.shortName, title: `单项目直达：${t.name}（${t.desc}）` })),
            { divider: true },
            ...ENGLISH_QUESTION_TYPES
                .filter(t => t.id !== 'course_special')
                .map(t => ({ id: t.id, label: t.shortName, title: `单项目直达：${t.name}（${t.desc}）` }))
        ];

        const courseBtnLbl = document.getElementById('hubCourseBtnLabel');
        if (courseBtnLbl && COURSE_LESSONS[0]) {
            courseBtnLbl.textContent = `英语课(${COURSE_LESSONS[0].code})`;
        }

        strip.innerHTML = '';
        let activeLabel = '🎲 数英大随机';
        entries.forEach(item => {
            if (item.divider) {
                const div = document.createElement('span');
                div.className = 'hub-mode-divider';
                strip.appendChild(div);
                return;
            }
            const isSel = curMode === item.id || (curMode === 'course_special' && item.id === 'course_all');
            if (isSel) activeLabel = item.label;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `hub-mode-pill ${item.grand ? 'grand' : ''} ${item.course ? 'course' : ''} ${isSel ? 'active' : ''}`;
            btn.dataset.smode = item.id;
            btn.title = item.title || item.label;
            btn.textContent = item.label;
            btn.addEventListener('click', () => {
                profileManager.setPreferredSmartMode(item.id);
                this.renderSmartModeStrip(profileManager.getActiveUser());
            });
            strip.appendChild(btn);
        });

        const subHint = document.getElementById('bannerSubHint');
        if (subHint) {
            subHint.textContent = `✨ 当前出题入口：【${activeLabel}】· 点击下方任意一款游戏即按该模式开玩（游戏内小黑板也可随时秒切）！`;
        }
    }

    // ==================== 统一档案与难度设置弹窗 ====================
    openSettingsModal() {
        const active = profileManager.getActiveUser();
        this.editingKidId = active.id;
        this.loadKidIntoForm(active, false);
        this.renderSettingsModal();
        document.getElementById('hubSettingsModal')?.classList.add('show');
    }

    loadKidIntoForm(user, isNew = false) {
        const mc = user?.mathConfig || user?.difficulty || {};
        const ec = user?.englishConfig || {};
        this.formState = {
            avatar: user?.avatar || '🐰',
            dailyBadgeCap: user?.dailyBadgeCap || 30,
            mode: mc.mode === 'preset' ? 'preset' : 'custom',
            presetGrade: mc.presetGrade || 'grade1_2',
            ops: Array.isArray(mc.operations) && mc.operations.length > 0 ? [...mc.operations] : ['add', 'sub'],
            range: Number(mc.range) || 20,
            maxMultiplier: Number(mc.maxMultiplier) || 5,
            allowCarryBorrow: mc.allowCarryBorrow !== false,
            allowFillBlank: mc.allowFillBlank !== false,
            mathTypes: sanitizeMathEnabledTypes(mc.enabledTypes),
            enLevel: ec.level || 'level1_listen',
            enWordDifficulty: ec.wordDifficulty || 'easy',
            enCourseAllowHard: Boolean(ec.courseAllowHardDictation),
            enPackId: ec.packId || 'all',
            enTypes: sanitizeEnglishEnabledTypes(ec.enabledTypes),
            parentLockEnabled: profileManager.data.parentLockEnabled !== false,
            parentPin: profileManager.data.parentPin || ''
        };
        const nameInput = document.getElementById('hubInputName');
        if (nameInput) {
            nameInput.value = isNew ? '' : (user?.name || '');
        }
        const pinInput = document.getElementById('hubInputParentPin');
        if (pinInput) {
            pinInput.value = this.formState.parentPin;
        }
    }

    renderParentLockBtn() {
        const btn = document.getElementById('btnToggleParentLock');
        if (!btn) return;
        btn.classList.toggle('selected', this.formState.parentLockEnabled);
        btn.textContent = this.formState.parentLockEnabled
            ? '🔒 守护锁：已开启'
            : '🔓 守护锁：已关闭';
    }

    renderSettingsModal() {
        const users = profileManager.getUsers();
        const isNew = this.editingKidId === '__NEW__';

        // 1. 小朋友芯片列表
        const kidsList = document.getElementById('hubModalKidsList');
        kidsList.innerHTML = '';
        users.forEach(u => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `hub-opt-pill ${(!isNew && u.id === this.editingKidId) ? 'selected' : ''}`;
            btn.textContent = `${u.avatar} ${u.name}`;
            btn.addEventListener('click', () => {
                this.editingKidId = u.id;
                profileManager.setActiveUser(u.id);
                this.loadKidIntoForm(u, false);
                this.renderSettingsModal();
                this.renderAll();
            });
            kidsList.appendChild(btn);
        });

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = `hub-opt-pill ${isNew ? 'selected' : ''}`;
        addBtn.textContent = '➕ 新增小朋友';
        addBtn.addEventListener('click', () => {
            this.editingKidId = '__NEW__';
            this.loadKidIntoForm({ avatar: '🦄', dailyBadgeCap: 30 }, true);
            this.renderSettingsModal();
            document.getElementById('hubInputName')?.focus();
        });
        kidsList.appendChild(addBtn);

        const delBtn = document.getElementById('btnHubDeleteKid');
        if (delBtn) {
            delBtn.style.display = (!isNew && users.length > 1) ? 'inline-block' : 'none';
        }

        // 头像网格
        const avGrid = document.getElementById('hubAvatarGrid');
        avGrid.innerHTML = '';
        AVATAR_LIST.slice(0, 8).forEach(av => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `hub-av-btn ${this.formState.avatar === av ? 'selected' : ''}`;
            b.textContent = av;
            b.addEventListener('click', () => {
                this.formState.avatar = av;
                this.renderSettingsModal();
            });
            avGrid.appendChild(b);
        });

        // 2. 每日徽章上限
        const capWrap = document.getElementById('hubDailyCapPills');
        capWrap.innerHTML = '';
        DAILY_BADGE_CAP_OPTIONS.forEach(cap => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `hub-opt-pill ${this.formState.dailyBadgeCap === cap ? 'selected' : ''}`;
            b.textContent = `每日最多 ${cap} 枚${cap === 30 ? ' (推荐)' : ''}`;
            b.addEventListener('click', () => {
                this.formState.dailyBadgeCap = cap;
                this.renderSettingsModal();
            });
            capWrap.appendChild(b);
        });

        // 3. 年级预设快捷按钮 + 数学加减乘除多选
        const presetRow = document.getElementById('hubMathPresetRow');
        if (presetRow) {
            presetRow.innerHTML = '<span style="font-size:12.5px;font-weight:800;">快捷学段：</span>';
            const presets = [
                { id: 'grade1_2', label: '🌱 1~2年级预设(20内加减)', ops: ['add', 'sub'], range: 20, mul: 5 },
                { id: 'grade3_4', label: '⚡ 3~4年级预设(100内四则)', ops: ['add', 'sub', 'mul', 'div'], range: 100, mul: 9 },
                { id: 'grade5_6', label: '🔥 5~6年级预设(千内巧算)', ops: ['add', 'sub', 'mul', 'div'], range: 1000, mul: 12 }
            ];
            presets.forEach(pr => {
                const b = document.createElement('button');
                b.type = 'button';
                const isSel = this.formState.mode === 'preset' && this.formState.presetGrade === pr.id;
                b.className = `hub-opt-pill ${isSel ? 'selected' : ''}`;
                b.textContent = pr.label;
                b.addEventListener('click', () => {
                    this.formState.mode = 'preset';
                    this.formState.presetGrade = pr.id;
                    this.formState.ops = [...pr.ops];
                    this.formState.range = pr.range;
                    this.formState.maxMultiplier = pr.mul;
                    this.renderSettingsModal();
                });
                presetRow.appendChild(b);
            });
        }

        document.querySelectorAll('#hubMathOpsRow .hub-opt-pill').forEach(btn => {
            const op = btn.getAttribute('data-op');
            btn.classList.toggle('selected', this.formState.ops.includes(op));
            btn.onclick = () => {
                this.formState.mode = 'custom';
                if (this.formState.ops.includes(op)) {
                    if (this.formState.ops.length > 1) {
                        this.formState.ops = this.formState.ops.filter(x => x !== op);
                    }
                } else {
                    this.formState.ops.push(op);
                }
                this.renderSettingsModal();
            };
        });

        // 加减数值范围
        const rangeRow = document.getElementById('hubMathRangeRow');
        rangeRow.innerHTML = '<span style="font-size:12.5px;font-weight:800;">加减范围：</span>';
        [10, 20, 50, 100, 1000].forEach(r => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `hub-opt-pill ${this.formState.range === r ? 'selected' : ''}`;
            b.textContent = `${r}以内`;
            b.addEventListener('click', () => {
                this.formState.mode = 'custom';
                this.formState.range = r;
                this.renderSettingsModal();
            });
            rangeRow.appendChild(b);
        });

        // 乘除口诀上限
        const multRow = document.getElementById('hubMathMultRow');
        multRow.innerHTML = '<span style="font-size:12.5px;font-weight:800;">乘除口诀上限：</span>';
        [5, 9, 12].forEach(m => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `hub-opt-pill ${this.formState.maxMultiplier === m ? 'selected' : ''}`;
            b.textContent = `${m}以内乘除`;
            b.addEventListener('click', () => {
                this.formState.mode = 'custom';
                this.formState.maxMultiplier = m;
                this.renderSettingsModal();
            });
            multRow.appendChild(b);
        });

        // 进退位与凑数填空开关（与保卫萝卜、植物大战僵尸100%对齐，绝不覆盖丢失）
        const extraRow = document.getElementById('hubMathExtraRow');
        if (extraRow) {
            extraRow.innerHTML = '<span style="font-size:12.5px;font-weight:800;">启发题型开关：</span>';
            const btnCarry = document.createElement('button');
            btnCarry.type = 'button';
            btnCarry.className = `hub-opt-pill ${this.formState.allowCarryBorrow ? 'selected' : ''}`;
            btnCarry.textContent = `${this.formState.allowCarryBorrow ? '✅' : '⬜'} 允许进位/退位`;
            btnCarry.addEventListener('click', () => {
                this.formState.allowCarryBorrow = !this.formState.allowCarryBorrow;
                this.renderSettingsModal();
            });

            const btnFill = document.createElement('button');
            btnFill.type = 'button';
            btnFill.className = `hub-opt-pill ${this.formState.allowFillBlank ? 'selected' : ''}`;
            btnFill.textContent = `${this.formState.allowFillBlank ? '✅' : '⬜'} 允许凑数填空 (7 + ? = 15)`;
            btnFill.addEventListener('click', () => {
                this.formState.allowFillBlank = !this.formState.allowFillBlank;
                this.renderSettingsModal();
            });

            extraRow.appendChild(btnCarry);
            extraRow.appendChild(btnFill);
        }

        renderEnabledTypesSelector(
            document.getElementById('hubMathTypesBox'),
            MATH_QUESTION_TYPES,
            this.formState.mathTypes,
            (next) => { this.formState.mathTypes = next; },
            ['calc', 'compare', 'bond_pop', 'sequence_train', 'clock_money']
        );

        // 4. 英语难度档位、题型多选与 20 大主题词包（360词）
        const enLevelRow = document.getElementById('hubEnLevelRow');
        enLevelRow.innerHTML = '<span style="font-size:12.5px;font-weight:800;">英语难易度：</span>';
        ENGLISH_DIFFICULTY_MODES.forEach(dm => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `hub-opt-pill ${this.formState.enWordDifficulty === dm.id ? 'selected' : ''}`;
            b.textContent = dm.name;
            b.title = dm.desc;
            b.addEventListener('click', () => {
                this.formState.enWordDifficulty = dm.id;
                this.formState.enCourseAllowHard = Boolean(dm.courseAllowHardDictation);
                this.formState.enLevel = dm.id === 'easy' ? 'level1_listen' : (dm.id === 'medium' ? 'level2_match' : 'mixed');
                this.formState.enTypes = [...dm.recommendedTypes];
                this.renderSettingsModal();
            });
            enLevelRow.appendChild(b);
        });

        renderEnabledTypesSelector(
            document.getElementById('hubEnTypesBox'),
            ENGLISH_QUESTION_TYPES,
            this.formState.enTypes,
            (next) => { this.formState.enTypes = next; },
            DEFAULT_EASY_ENGLISH_TYPES
        );

        const enPackRow = document.getElementById('hubEnPackRow');
        enPackRow.innerHTML = '<span style="font-size:12.5px;font-weight:800;">默认词包：</span>';
        const packChoices = [{ id: 'all', icon: '🌟', name: `全部20主题(${ALL_WORDS.length}词)` }, ...WORD_PACKS];
        packChoices.forEach(pk => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `hub-opt-pill ${this.formState.enPackId === pk.id ? 'selected' : ''}`;
            b.textContent = `${pk.icon} ${pk.name}`;
            b.addEventListener('click', () => {
                this.formState.enPackId = pk.id;
                this.renderSettingsModal();
            });
            enPackRow.appendChild(b);
        });

        this.renderParentLockBtn();
    }

    saveSettingsModal() {
        const rawName = (document.getElementById('hubInputName')?.value || '').trim();
        const rawPin = (document.getElementById('hubInputParentPin')?.value || '').trim();
        if (rawPin && !/^\d{4}$/.test(rawPin)) {
            alert('家长 PIN 码请填写 4 位纯数字（或留空使用乘加口算验证）！');
            return;
        }

        profileManager.setParentLockSettings({
            enabled: this.formState.parentLockEnabled,
            pin: rawPin
        });

        const cleanMathTypes = sanitizeMathEnabledTypes(this.formState.mathTypes);
        const cleanEnTypes = sanitizeEnglishEnabledTypes(this.formState.enTypes);

        const presetGrade = this.formState.mode === 'preset'
            ? this.formState.presetGrade
            : (this.formState.range >= 500 ? 'grade5_6' : (this.formState.range >= 50 ? 'grade3_4' : 'grade1_2'));

        const mathConfig = {
            mode: this.formState.mode,
            presetGrade,
            operations: [...this.formState.ops],
            range: this.formState.range,
            maxMultiplier: this.formState.maxMultiplier,
            allowCarryBorrow: this.formState.allowCarryBorrow,
            allowFillBlank: this.formState.allowFillBlank,
            includeWordProblems: cleanMathTypes.includes('word'),
            includeDataCharts: cleanMathTypes.includes('data'),
            enabledTypes: cleanMathTypes
        };
        const prevEc = (this.editingKidId && this.editingKidId !== '__NEW__')
            ? (profileManager.getUser(this.editingKidId)?.englishConfig || {})
            : {};
        const englishConfig = {
            ...prevEc,
            level: this.formState.enLevel,
            wordDifficulty: this.formState.enWordDifficulty || 'easy',
            courseAllowHardDictation: Boolean(this.formState.enCourseAllowHard),
            packId: this.formState.enPackId,
            enabledTypes: cleanEnTypes
        };

        if (this.editingKidId === '__NEW__') {
            const created = profileManager.addUser({
                name: rawName || `小宝贝${profileManager.getUsers().length + 1}`,
                avatar: this.formState.avatar,
                mathConfig,
                englishConfig
            });
            profileManager.updateUserSettings(created.id, {
                dailyBadgeCap: this.formState.dailyBadgeCap
            });
        } else {
            profileManager.updateUserSettings(this.editingKidId, {
                name: rawName || '小豌豆',
                avatar: this.formState.avatar,
                dailyBadgeCap: this.formState.dailyBadgeCap,
                mathConfig,
                englishConfig
            });
            profileManager.setActiveUser(this.editingKidId);
        }

        document.getElementById('hubSettingsModal')?.classList.remove('show');
        this.renderAll();
    }

    // ==================== 存档备份导入导出弹窗 ====================
    openBackupModal() {
        const outEl = document.getElementById('hubBackupCodeOutput');
        if (outEl) {
            outEl.value = profileManager.exportBackupCode();
        }
        this.setBackupMsg('', false);
        document.getElementById('hubBackupModal')?.classList.add('show');
    }

    setBackupMsg(msg, isError = false) {
        const el = document.getElementById('hubBackupStatusMsg');
        if (!el) return;
        el.style.color = isError ? '#d63031' : '#00b894';
        el.textContent = msg || '';
    }

    handleCopyBackupCode() {
        const code = profileManager.exportBackupCode();
        const outEl = document.getElementById('hubBackupCodeOutput');
        if (outEl) {
            outEl.value = code;
            outEl.select();
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
                this.setBackupMsg('✅ 备份码已复制到剪贴板！可直接发给另一台 iPad 粘贴恢复。', false);
            }).catch(() => {
                this.setBackupMsg('✅ 已生成最新备份码，请长按上方文本框全选复制。', false);
            });
        } else {
            this.setBackupMsg('✅ 已生成最新备份码，请长按上方文本框全选复制。', false);
        }
    }

    handleDownloadBackupJson() {
        const json = profileManager.exportBackupJSON();
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateTag = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `奇趣数英游乐园_双宝存档_${dateTag}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.setBackupMsg('💾 已下载 .json 存档备份文件！', false);
    }

    // ==================== 全局错题重练消消乐 & 单词掌握册弹窗 ====================
    openReportModal() {
        this.stopMistakePractice();
        const u = profileManager.getActiveUser();
        const titleEl = document.getElementById('hubReportTitle');
        if (titleEl) {
            titleEl.textContent = `📒 ${u.avatar || '🐰'} ${u.name} 的全局错题重练与单词成长册`;
        }
        this.renderReportList();
        document.getElementById('hubReportModal')?.classList.add('show');
    }

    stopMistakePractice() {
        this.practiceState.active = false;
        this.practiceState.currentItem = null;
        this.practiceState.inputBuf = '';
        this.practiceState.locked = false;
        const stage = document.getElementById('hubPracticeStage');
        if (stage) {
            stage.style.display = 'none';
            stage.innerHTML = '';
        }
    }

    startMistakePractice(subject) {
        this.practiceState = {
            active: true,
            subject,
            inputBuf: '',
            currentItem: null,
            enOptions: [],
            clearedCount: 0,
            locked: false
        };
        this.nextPracticeQuestion();
    }

    nextPracticeQuestion() {
        const u = profileManager.getActiveUser();
        const stage = document.getElementById('hubPracticeStage');
        if (!stage) return;
        stage.style.display = 'block';
        this.practiceState.inputBuf = '';
        this.practiceState.locked = false;

        if (this.practiceState.subject === 'math') {
            const list = u.mathMistakes || [];
            if (list.length === 0) {
                stage.innerHTML = `
                    <div style="text-align:center; padding:8px 0;">
                        <div style="font-size:22px; font-weight:900; color:#ffeaa7;">🎉 太棒啦！所有数学错题已全部消灭干净！</div>
                        <div style="font-size:13px; margin-top:4px;">本次重练共攻克 ${this.practiceState.clearedCount} 道错题！</div>
                    </div>
                `;
                this.renderAll();
                this.renderReportList();
                return;
            }
            const item = list[0];
            this.practiceState.currentItem = item;
            this.renderMathPracticeCard(stage, item, list.length);
            return;
        }

        // English weak words practice
        const errList = u.englishMistakes || [];
        if (errList.length === 0) {
            stage.innerHTML = `
                <div style="text-align:center; padding:8px 0;">
                    <div style="font-size:22px; font-weight:900; color:#ffeaa7;">🎉 太棒啦！待强化生词已全部攻克！</div>
                    <div style="font-size:13px; margin-top:4px;">本次重练共消灭 ${this.practiceState.clearedCount} 个生词！</div>
                </div>
            `;
            this.renderAll();
            this.renderReportList();
            return;
        }
        const errEntry = errList[0];
        const wordObj = ALL_WORDS.find(w => w.id === errEntry.wordId) || {
            id: errEntry.wordId,
            word: errEntry.word,
            phonics: errEntry.phonics || errEntry.word,
            zh: errEntry.zh,
            icon: errEntry.icon || '🔤'
        };
        this.practiceState.currentItem = wordObj;
        const distractors = ALL_WORDS.filter(w => w.id !== wordObj.id).sort(() => Math.random() - 0.5).slice(0, 3);
        this.practiceState.enOptions = [...distractors, wordObj].sort(() => Math.random() - 0.5);
        this.renderEnglishPracticeCard(stage, wordObj, errList.length);
    }

    renderMathPracticeCard(stage, item, remainingCount) {
        if (item.isInteractiveWidget) {
            stage.innerHTML = `
                <div class="hub-prac-header">
                    <span>🎯 数学错题消消乐 · 剩余 ${remainingCount} 题（答对自动移出错题本并攒星⭐）</span>
                    <button type="button" class="hub-opt-pill" id="btnExitPractice" style="padding:2px 10px;font-size:12px;">收起 ✕</button>
                </div>
                <div id="hubPracInteractiveMount" style="margin:6px 0;"></div>
                <div class="hub-prac-feedback" id="hubPracFeedback">仔细推理，选对即可消灭这道互动错题！</div>
            `;
            stage.querySelector('#btnExitPractice')?.addEventListener('click', () => this.stopMistakePractice());
            const mountEl = stage.querySelector('#hubPracInteractiveMount');
            const fbEl = stage.querySelector('#hubPracFeedback');
            renderMathInteractiveWidget(mountEl, item, {
                theme: 'dark',
                onEvaluate: (ok) => {
                    if (ok) {
                        this.practiceState.locked = true;
                        this.practiceState.clearedCount += 1;
                        profileManager.resolveMathMistake(item);
                        const prog = profileManager.awardLearningProgress({
                            title: `🎯 [错题消消乐] 成功攻克错题 ${item.expr || item.formula || ''}`,
                            subjectTag: '错题攻坚',
                            badges: 0,
                            stars: 1,
                            gotTicket: false,
                            combo: this.practiceState.clearedCount,
                            isMath: true
                        });
                        const rewardTip = prog.actualBadges > 0 ? `🏅+${prog.actualBadges}枚徽章！` : `⭐攒星 ${prog.starProgress}/3`;
                        fbEl.style.color = '#55efc4';
                        fbEl.textContent = `🎉 答对啦！错题已消灭！${rewardTip}`;
                        this.renderAll();
                        this.renderReportList();
                        setTimeout(() => this.nextPracticeQuestion(), 650);
                    } else {
                        fbEl.style.color = '#ff7675';
                        fbEl.textContent = `💡 差一点点（正确答案是 ${item.answer ?? item.expected}），下一轮再接再厉！`;
                        setTimeout(() => this.nextPracticeQuestion(), 900);
                    }
                }
            });
            return;
        }

        const promptText = item.questionText || item.storyHtml || item.formula || item.expr || '';
        stage.innerHTML = `
            <div class="hub-prac-header">
                <span>🎯 数学错题消消乐 · 剩余 ${remainingCount} 题（答对自动移出错题本并攒星⭐）</span>
                <button type="button" class="hub-opt-pill" id="btnExitPractice" style="padding:2px 10px;font-size:12px;">收起 ✕</button>
            </div>
            <div class="hub-prac-question">${promptText}</div>
            <div class="hub-prac-input-row">
                <div class="hub-prac-ans-display" id="hubPracAnsBox">?</div>
                <button type="button" class="hub-primary-btn" id="btnSubmitPracMath" style="padding:6px 18px;">确认 ↵</button>
            </div>
            <div class="hub-prac-keypad" id="hubPracKeypad">
                ${[1,2,3,4,5,6,7,8,9,0].map(n => `<button type="button" class="hub-prac-key" data-pk="${n}">${n}</button>`).join('')}
                <button type="button" class="hub-prac-key" data-pk="clear">清空</button>
                <button type="button" class="hub-prac-key" data-pk="back">⌫</button>
            </div>
            <div class="hub-prac-feedback" id="hubPracFeedback">仔细想想，算对就能消灭这道错题啦！</div>
        `;

        stage.querySelector('#btnExitPractice')?.addEventListener('click', () => {
            this.stopMistakePractice();
        });

        const ansBox = stage.querySelector('#hubPracAnsBox');
        const fbEl = stage.querySelector('#hubPracFeedback');

        stage.querySelector('#hubPracKeypad')?.addEventListener('click', (e) => {
            if (this.practiceState.locked) return;
            const btn = e.target.closest('.hub-prac-key');
            if (!btn) return;
            const k = btn.getAttribute('data-pk');
            if (k === 'clear') this.practiceState.inputBuf = '';
            else if (k === 'back') this.practiceState.inputBuf = this.practiceState.inputBuf.slice(0, -1);
            else if (this.practiceState.inputBuf.length < 5) this.practiceState.inputBuf += k;
            ansBox.textContent = this.practiceState.inputBuf || '?';
        });

        stage.querySelector('#btnSubmitPracMath')?.addEventListener('click', () => {
            if (this.practiceState.locked || !this.practiceState.inputBuf) return;
            const userVal = Number(this.practiceState.inputBuf);
            const expected = Number(item.answer ?? item.expected);
            if (userVal === expected) {
                this.practiceState.locked = true;
                this.practiceState.clearedCount += 1;
                profileManager.resolveMathMistake(item);
                const prog = profileManager.awardLearningProgress({
                    title: `🎯 [错题消消乐] 成功攻克错题 ${item.expr || item.formula || ''}`,
                    subjectTag: '错题攻坚',
                    badges: 0,
                    stars: 1,
                    gotTicket: false,
                    combo: this.practiceState.clearedCount,
                    isMath: true
                });
                const rewardTip = prog.actualBadges > 0 ? `🏅+${prog.actualBadges}枚徽章！` : `⭐攒星 ${prog.starProgress}/3`;
                fbEl.style.color = '#55efc4';
                fbEl.textContent = `🎉 答对啦！错题已消灭！${rewardTip}`;
                this.renderAll();
                this.renderReportList();
                setTimeout(() => this.nextPracticeQuestion(), 650);
            } else {
                fbEl.style.color = '#ff7675';
                fbEl.textContent = `💡 再算一算哦～（提示：之前误填了 ${item.userAns ?? '其他数'}）`;
                this.practiceState.inputBuf = '';
                ansBox.textContent = '?';
            }
        });
    }

    renderEnglishPracticeCard(stage, wordObj, remainingCount) {
        const optsHtml = this.practiceState.enOptions.map(opt => `
            <button type="button" class="hub-prac-en-btn" data-wid="${opt.id}">
                ${opt.word}
            </button>
        `).join('');

        stage.innerHTML = `
            <div class="hub-prac-header">
                <span>🔤 英语生词消消乐 · 剩余 ${remainingCount} 词（答对升星并移出待强化列表）</span>
                <button type="button" class="hub-opt-pill" id="btnExitPractice" style="padding:2px 10px;font-size:12px;">收起 ✕</button>
            </div>
            <div class="hub-prac-question">
                <span style="font-size:34px;">${wordObj.icon}</span>
                <span style="margin-left:10px;">${wordObj.zh}</span>
                <button type="button" class="hub-opt-pill" id="btnPracSpeak" style="margin-left:12px;font-size:13px;">🔊 听发音</button>
            </div>
            <div class="hub-prac-en-opts">${optsHtml}</div>
            <div class="hub-prac-feedback" id="hubPracFeedback">听发音看图标，选出正确的英语单词吧！</div>
        `;

        sharedSpeech.speakEnglish(wordObj.word, false);

        stage.querySelector('#btnExitPractice')?.addEventListener('click', () => {
            this.stopMistakePractice();
        });
        stage.querySelector('#btnPracSpeak')?.addEventListener('click', () => {
            sharedSpeech.speakEnglish(wordObj.word, true, wordObj.phonics);
        });

        const fbEl = stage.querySelector('#hubPracFeedback');
        stage.querySelectorAll('.hub-prac-en-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.practiceState.locked) return;
                const picked = btn.getAttribute('data-wid');
                if (picked === wordObj.id) {
                    this.practiceState.locked = true;
                    btn.classList.add('correct');
                    this.practiceState.clearedCount += 1;
                    sharedSpeech.speakEnglish(wordObj.word, false);
                    profileManager.updateWordProgress(wordObj, true, 1);
                    const prog = profileManager.awardLearningProgress({
                        title: `🔤 [生词消消乐] 攻克待强化词 ${wordObj.word}`,
                        subjectTag: '生词攻坚',
                        badges: 0,
                        stars: 1,
                        gotTicket: false,
                        combo: this.practiceState.clearedCount,
                        isMath: false
                    });
                    const rewardTip = prog.actualBadges > 0 ? `🏅+${prog.actualBadges}枚徽章！` : `⭐攒星 ${prog.starProgress}/3`;
                    fbEl.style.color = '#55efc4';
                    fbEl.textContent = `🎉 太棒啦！已掌握 ${wordObj.word} (${wordObj.zh}) · ${rewardTip}`;
                    this.renderAll();
                    this.renderReportList();
                    setTimeout(() => this.nextPracticeQuestion(), 700);
                } else {
                    btn.classList.add('wrong');
                    sharedSpeech.speakEnglish(wordObj.word, true, wordObj.phonics);
                    fbEl.style.color = '#ff7675';
                    fbEl.textContent = `👂 听一听慢读发音，再试一次吧！`;
                }
            });
        });
    }

    renderReportList() {
        const u = profileManager.getActiveUser();
        const box = document.getElementById('hubReportList');
        const toolbar = document.getElementById('hubReportToolbar');
        if (!box) return;
        box.innerHTML = '';
        if (toolbar) toolbar.innerHTML = '';

        if (this.activeReportTab === 'math') {
            const list = u.mathMistakes || [];
            if (toolbar && list.length > 0 && !this.practiceState.active) {
                toolbar.innerHTML = `
                    <span style="font-size:13px;font-weight:800;color:#636e72;">共有 <strong>${list.length}</strong> 道未攻克错题（平时闯关也会自动穿插复习）：</span>
                    <button type="button" class="hub-btn-start-practice" id="btnStartMathPrac">🎯 立即重练消灭错题 (${list.length}题)</button>
                `;
                toolbar.querySelector('#btnStartMathPrac')?.addEventListener('click', () => {
                    this.startMistakePractice('math');
                });
            }
            if (list.length === 0) {
                box.innerHTML = `<div class="hub-list-item" style="justify-content:center; color:#00b894;">🎉 太棒啦！${u.name}目前没有任何未攻克的数学错题！</div>`;
                return;
            }
            list.forEach(m => {
                const row = document.createElement('div');
                row.className = 'hub-list-item';
                row.innerHTML = `
                    <div>
                        <div style="color:#2d3436;">${m.readText || m.expr || m.formula}</div>
                        <div style="font-size:11.5px; color:#888;">记录时间：${m.dateStr || ''}</div>
                    </div>
                    <div style="color:#00b894;">正确答案：${m.answer ?? m.expected}</div>
                `;
                box.appendChild(row);
            });
            return;
        }

        if (this.activeReportTab === 'english') {
            const mastery = u.wordMastery || {};
            const mistakesList = u.englishMistakes || [];
            const mistakesIds = new Set(mistakesList.map(x => x.wordId));

            if (toolbar) {
                const packOpts = [
                    `<option value="all">🌟 全部20大主题 (${ALL_WORDS.length}词)</option>`,
                    ...WORD_PACKS.map(p => `<option value="${p.id}" ${this.enReportPackFilter === p.id ? 'selected' : ''}>${p.icon} ${p.name} (${p.words.length}词)</option>`)
                ].join('');
                toolbar.innerHTML = `
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <select id="hubEnFilterSelect" class="hub-opt-pill" style="padding:5px 10px;">${packOpts}</select>
                        <span style="font-size:12.5px;font-weight:800;color:#636e72;">已掌握(≥2⭐)：${u.stats?.totalWordsMastered || 0} / ${ALL_WORDS.length} 词</span>
                    </div>
                    ${(mistakesList.length > 0 && !this.practiceState.active)
                        ? `<button type="button" class="hub-btn-start-practice" id="btnStartEnPrac">🎯 重练消灭生词 (${mistakesList.length}词)</button>`
                        : ''}
                `;
                toolbar.querySelector('#hubEnFilterSelect')?.addEventListener('change', (e) => {
                    this.enReportPackFilter = e.target.value;
                    this.renderReportList();
                });
                toolbar.querySelector('#btnStartEnPrac')?.addEventListener('click', () => {
                    this.startMistakePractice('english');
                });
            }

            const basePool = this.enReportPackFilter === 'all'
                ? ALL_WORDS
                : (WORD_PACKS.find(p => p.id === this.enReportPackFilter)?.words || ALL_WORDS);

            const sortedWords = [...basePool].sort((a, b) => {
                const aErr = mistakesIds.has(a.id) ? 1 : 0;
                const bErr = mistakesIds.has(b.id) ? 1 : 0;
                if (aErr !== bErr) return bErr - aErr;
                return (mastery[b.id] || 0) - (mastery[a.id] || 0);
            });

            sortedWords.forEach(w => {
                const stars = mastery[w.id] || 0;
                const isMistake = mistakesIds.has(w.id);
                const starStr = '⭐'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars));
                const row = document.createElement('div');
                row.className = 'hub-list-item';
                row.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:24px;">${w.icon}</span>
                        <div>
                            <div><strong>${w.word}</strong> <span style="color:#888;font-size:12px;">${w.ipa || ''}</span> <span style="color:#636e72;">${w.zh}</span> ${isMistake ? '<span style="color:#d63031;font-size:11px;">(待强化)</span>' : ''}</div>
                            <div style="font-size:11.5px; color:#888;">${w.sentence}（${w.sentenceZh}）</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>${starStr}</span>
                        <button type="button" class="hub-opt-pill" data-speak="${w.word}">🔊 朗读</button>
                    </div>
                `;
                row.querySelector('[data-speak]')?.addEventListener('click', () => {
                    sharedSpeech.speakEnglish(w.word, false);
                });
                box.appendChild(row);
            });
            return;
        }

        // 跨游徽章记录与塔防/PVZ战报
        const records = u.scoreRecords || [];
        if (records.length === 0) {
            box.innerHTML = `<div class="hub-list-item" style="justify-content:center;">🌱 快进入任意一款游戏答题闯关吧！</div>`;
            return;
        }
        records.slice(0, 40).forEach(r => {
            const row = document.createElement('div');
            row.className = 'hub-list-item';
            row.innerHTML = `
                <div>
                    <div>${r.title}</div>
                    <div style="font-size:11.5px; color:#888;">${r.timeStr || ''} · ${r.subjectTag || ''}</div>
                </div>
                <div style="color:#e67e22;">+${r.deltaBadges || 0} 🏅</div>
            `;
            box.appendChild(row);
        });
    }

    // ==================== 🎓 校外英语课后专项特训舱（每周定期更新） ====================
    openCourseModal(initialMode = null) {
        const active = profileManager.getActiveUser();
        this.courseState.lessonId = active?.englishConfig?.courseLessonId || 'latest';
        if (initialMode && ALL_COURSE_SUB_IDS.includes(initialMode)) {
            this.courseState.mode = initialMode;
        } else if (ALL_COURSE_SUB_IDS.includes(active?.preferredSmartMode)) {
            this.courseState.mode = active.preferredSmartMode;
        } else {
            this.courseState.mode = 'course_readcard';
        }
        this.renderCourseModal(true);
        document.getElementById('hubCourseModal')?.classList.add('show');
    }

    renderCourseModal(autoSpeak = false) {
        const active = profileManager.getActiveUser();
        this.courseEngine.setConfig({
            ...(active?.englishConfig || {}),
            courseLessonId: this.courseState.lessonId,
            courseSubMode: this.courseState.mode
        });

        // 1. 课节期次选择器
        const sel = document.getElementById('hubCourseLessonSelect');
        if (sel) {
            const latest = COURSE_LESSONS[0];
            let optsHtml = latest
                ? `<option value="latest">🌟 最新课节：${latest.code} (${latest.dateLabel} · ${latest.storyTitle})</option>`
                : '';
            if (COURSE_LESSONS.length > 1) {
                optsHtml += `<option value="all_courses">📚 全部已学课节联考 (${COURSE_LESSONS.length}节)</option>`;
            }
            COURSE_LESSONS.forEach(ls => {
                optsHtml += `<option value="${ls.id}">📖 ${ls.title} · 《${ls.storyTitle}》</option>`;
            });
            sel.innerHTML = optsHtml;
            sel.value = this.courseState.lessonId;
            if (!sel.value) sel.value = 'latest';
        }

        // 2. 五大特训页签状态
        document.querySelectorAll('#hubCourseModeTabs .hub-course-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-cmode') === this.courseState.mode);
        });

        // 3. 舞台渲染
        const stage = document.getElementById('hubCourseStage');
        const fb = document.getElementById('hubCourseFeedbackBar');
        if (!stage) return;

        if (this.courseState.mode === 'course_readcard') {
            const lesson = getPrimaryCourseLesson(this.courseState.lessonId);
            renderCourseReadAloudBoard(stage, lesson, {
                theme: 'light',
                compact: false,
                speakFn: (txt, slow, ph) => sharedSpeech.speakEnglish(txt, slow, ph),
                isChecked: (k) => Boolean(profileManager.getActiveUser()?.courseReadChecks?.[k]?.checked),
                onToggleCheck: (k) => {
                    const res = profileManager.toggleCourseReadCheck
                        ? profileManager.toggleCourseReadCheck(k)
                        : { checked: false, awarded: false };
                    if (res.awarded) {
                        this.renderAll();
                        if (fb) fb.textContent = '🎉 太棒啦！熟读打卡 +1⭐ 学习星！准备就绪即可拍视频发班级群，或切右侧页签练听写！';
                    }
                }
            });
            if (fb) {
                fb.textContent = '📹 视频作业教练板：点击【读问句 / 读答句 / 慢速跟读】逐句模仿，熟读后点 ✅ 打卡领星！';
            }
            return;
        }

        this.courseState.locked = false;
        const q = this.courseEngine.nextQuickQuestion(null, this.courseState.mode);
        const cm = COURSE_SUB_MODES.find(m => m.id === this.courseState.mode);
        renderEnglishQuizWidget(stage, q, {
            theme: 'light',
            badgeTitle: cm ? `${cm.title} · ${q.lessonCode || ''}` : '🎓 校外课专项',
            autoSpeak,
            speakFn: (txt, slow, ph) => sharedSpeech.speakEnglish(txt, slow, ph),
            onEvaluate: (ok, userAns) => {
                if (this.courseState.locked) return;
                this.handleCourseEvaluated(ok, q, userAns);
            }
        });
        if (fb) {
            fb.textContent = '👂 贴心提示：点击喇叭可反复听纯正美音与慢速拼读，答对同样累积今日萌宠徽章🏅！';
        }
    }

    handleCourseEvaluated(isCorrect, q) {
        this.courseState.locked = true;
        const res = this.courseEngine.evaluateResult(isCorrect, q.wordObj, false);
        const fb = document.getElementById('hubCourseFeedbackBar');
        const keyText = q.expectedWord || q.expectedSentence || q.answerEn || q.wordObj.word;

        if (isCorrect) {
            if (q.courseSubType === 'phonics_dictation' || q.courseSubType === 'sight_word_spell') {
                sharedSpeech.speakEnglish(q.wordObj.ttsWord || q.wordObj.word, false, '');
            } else if (q.courseSubType === 'sight_sentence_order') {
                sharedSpeech.speakEnglish(q.expectedSentence, false, '');
            } else if (q.courseSubType === 'qa_cloze' || q.courseSubType === 'qa_story_steps') {
                sharedSpeech.speakEnglish(q.answerEn, false, '');
            }
            profileManager.updateWordProgress(q.wordObj, true, 1);
            const award = profileManager.awardLearningProgress({
                title: `🎓 校外英语课(${q.lessonCode})答对【${q.wordObj.word}】`,
                subjectTag: '英语课专项',
                badges: res.badgeEarned,
                stars: res.starEarned,
                gotTicket: res.gotGachaTicket,
                combo: res.combo,
                isMath: false
            });
            this.renderAll();
            if (fb) {
                fb.textContent = award.actualBadges > 0
                    ? `🎉 Super! ${keyText} 默写全对！荣获 +${award.actualBadges}🏅 徽章（今日 ${award.dailyEarned}/${award.dailyCap}）！`
                    : `⭐ Super! ${keyText} 答对啦！学习星 ${award.starProgress}/3（满3星合成 +1🏅）！`;
            }
            setTimeout(() => this.renderCourseModal(true), 780);
        } else {
            const wrongSpeak = q.expectedSentence || q.answerEn || q.wordObj.ttsWord || q.wordObj.word;
            sharedSpeech.speakEnglish(wrongSpeak, true, '');
            profileManager.updateWordProgress(q.wordObj, false, 0);
            this.renderAll();
            if (fb) {
                fb.textContent = `💡 正确答案是：${keyText}（已自动加入复习本，下次还会巩固抽查哦！）`;
            }
            setTimeout(() => this.renderCourseModal(true), 1500);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.portalHub = new PortalHubApp();
});
