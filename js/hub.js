/**
 * js/hub.js - 《奇趣数英游乐园 · 三合一儿童学习大厅》主控脚本
 * 连接 shared/unifiedProfile.js、shared/mathEngine.js、shared/englishEngine.js，
 * 实现【小豌豆 🐰】与【川川 🐸】一键切换、统一难度配置、每日上限与跨游错题/单词本管理。
 */
import { profileManager } from '../shared/unifiedProfile.js';
import { MathEngine } from '../shared/mathEngine.js';
import { WORD_PACKS, ALL_WORDS, ENGLISH_LEVELS } from '../shared/englishEngine.js';
import { AVATAR_LIST, DAILY_BADGE_CAP_OPTIONS, getPetById } from '../pet/js/config.js';
import { sharedSpeech } from '../shared/audioTTS.js';

class PortalHubApp {
    constructor() {
        this.editingKidId = null;
        this.formState = {
            avatar: '🐰',
            dailyBadgeCap: 30,
            ops: ['add', 'sub'],
            range: 20,
            maxMultiplier: 5,
            enLevel: 'level2_match',
            enPackId: 'all'
        };
        this.activeReportTab = 'math';

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

        document.getElementById('btnHubSettings')?.addEventListener('click', () => this.openSettingsModal());
        document.getElementById('btnCloseHubSettings')?.addEventListener('click', () => {
            document.getElementById('hubSettingsModal')?.classList.remove('show');
        });
        document.getElementById('btnSaveHubSettings')?.addEventListener('click', () => this.saveSettingsModal());

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

        document.getElementById('btnHubReport')?.addEventListener('click', () => this.openReportModal());
        document.getElementById('btnCloseHubReport')?.addEventListener('click', () => {
            document.getElementById('hubReportModal')?.classList.remove('show');
        });

        document.getElementById('hubReportTabs')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.hub-rep-tab');
            if (!btn) return;
            this.activeReportTab = btn.getAttribute('data-rtab') || 'math';
            document.querySelectorAll('#hubReportTabs .hub-rep-tab').forEach(b => {
                b.classList.toggle('active', b === btn);
            });
            this.renderReportList();
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

        // 模态遮罩空白处关闭
        ['hubSettingsModal', 'hubReportModal'].forEach(id => {
            const modal = document.getElementById(id);
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('show');
            });
        });
    }

    renderAll() {
        const users = profileManager.getUsers();
        const active = profileManager.getActiveUser();
        const daily = profileManager.getDailyStatus(active);

        // 1. 顶部小朋友切换条
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

        // 2. 顶部宝贝进度横幅
        const petMeta = getPetById(active.activePetId || 'rabbit');
        const petThumb = document.getElementById('bannerPetThumb');
        if (petThumb && petMeta) {
            petThumb.src = `pet/${petMeta.img}`;
            petThumb.alt = petMeta.name;
        }

        const mathSummary = MathEngine.formatSummary(active.mathConfig || active.difficulty);
        const enLvlObj = ENGLISH_LEVELS[active.englishConfig?.level] || ENGLISH_LEVELS.level2_match;

        document.getElementById('bannerKidName').textContent = `${active.avatar || '🐰'} ${active.name}`;
        document.getElementById('bannerMathSummary').textContent = `🎯 数学：${mathSummary}`;
        document.getElementById('bannerEnSummary').textContent = `🔤 英语：${enLvlObj.name}`;
        document.getElementById('bannerBadgesVal').textContent = active.badges || 0;
        document.getElementById('bannerTicketsVal').textContent = active.gachaTickets || 0;

        const pct = Math.min(100, Math.round((daily.earned / Math.max(1, daily.cap)) * 100));
        document.getElementById('bannerDailyText').textContent = daily.isCapped
            ? `已满 ${daily.cap}/${daily.cap} 🎉`
            : `${daily.earned} / ${daily.cap}`;
        document.getElementById('bannerDailyFill').style.width = `${pct}%`;

        // 3. 三张游戏卡的实时个性化数据
        const unlockedPetsCount = Object.values(active.pets || {}).filter(p => p.unlocked).length;
        const activePetState = active.pets?.[active.activePetId] || { level: 1 };
        const statPetEl = document.getElementById('liveStatPet');
        if (statPetEl) {
            statPetEl.innerHTML = `
                <span>🐾 已领养：${unlockedPetsCount} 只萌宠</span>
                <span>❤️ ${petMeta.name} Lv.${activePetState.level}</span>
            `;
        }

        const totalAnswered = (active.stats?.totalMathCorrect || 0) + (active.stats?.totalEnglishCorrect || 0);
        const bestCombo = active.stats?.bestCombo || 0;
        const statCarrotEl = document.getElementById('liveStatCarrot');
        if (statCarrotEl) {
            statCarrotEl.innerHTML = `
                <span>🎯 累计答对：${totalAnswered} 题</span>
                <span>🔥 最高连对：x${bestCombo}</span>
            `;
        }

        const statPvzEl = document.getElementById('liveStatPvz');
        if (statPvzEl) {
            const flags = active.bestEndlessFlags || 0;
            const masteredWords = active.stats?.totalWordsMastered || 0;
            statPvzEl.innerHTML = `
                <span>♾️ 无尽纪录：🚩 ${flags} 旗</span>
                <span>🔤 已掌握单词：${masteredWords} 词</span>
            `;
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
            ops: Array.isArray(mc.operations) && mc.operations.length > 0 ? [...mc.operations] : ['add', 'sub'],
            range: Number(mc.range) || 20,
            maxMultiplier: Number(mc.maxMultiplier) || 5,
            enLevel: ec.level || 'level2_match',
            enPackId: ec.packId || 'all'
        };
        const nameInput = document.getElementById('hubInputName');
        if (nameInput) {
            nameInput.value = isNew ? '' : (user?.name || '');
        }
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

        // 3. 数学加减乘除多选
        document.querySelectorAll('#hubMathOpsRow .hub-opt-pill').forEach(btn => {
            const op = btn.getAttribute('data-op');
            btn.classList.toggle('selected', this.formState.ops.includes(op));
            btn.onclick = () => {
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
                this.formState.maxMultiplier = m;
                this.renderSettingsModal();
            });
            multRow.appendChild(b);
        });

        // 4. 英语题型与词包
        const enLevelRow = document.getElementById('hubEnLevelRow');
        enLevelRow.innerHTML = '<span style="font-size:12.5px;font-weight:800;">英语题型：</span>';
        Object.values(ENGLISH_LEVELS).forEach(lvl => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `hub-opt-pill ${this.formState.enLevel === lvl.id ? 'selected' : ''}`;
            b.textContent = lvl.name;
            b.addEventListener('click', () => {
                this.formState.enLevel = lvl.id;
                this.renderSettingsModal();
            });
            enLevelRow.appendChild(b);
        });

        const enPackRow = document.getElementById('hubEnPackRow');
        enPackRow.innerHTML = '<span style="font-size:12.5px;font-weight:800;">默认词包：</span>';
        const packChoices = [{ id: 'all', icon: '📚', name: '全部主题' }, ...WORD_PACKS];
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
    }

    saveSettingsModal() {
        const rawName = (document.getElementById('hubInputName')?.value || '').trim();
        const mathConfig = {
            mode: 'custom',
            presetGrade: this.formState.range >= 100 ? 'grade3_4' : 'grade1_2',
            operations: [...this.formState.ops],
            range: this.formState.range,
            maxMultiplier: this.formState.maxMultiplier,
            allowCarryBorrow: true,
            allowFillBlank: true
        };
        const englishConfig = {
            level: this.formState.enLevel,
            packId: this.formState.enPackId
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

    // ==================== 全局错题本 & 英语单词掌握册弹窗 ====================
    openReportModal() {
        const u = profileManager.getActiveUser();
        const titleEl = document.getElementById('hubReportTitle');
        if (titleEl) {
            titleEl.textContent = `📒 ${u.avatar || '🐰'} ${u.name} 的全局错题本与单词成长册`;
        }
        this.renderReportList();
        document.getElementById('hubReportModal')?.classList.add('show');
    }

    renderReportList() {
        const u = profileManager.getActiveUser();
        const box = document.getElementById('hubReportList');
        if (!box) return;
        box.innerHTML = '';

        if (this.activeReportTab === 'math') {
            const list = u.mathMistakes || [];
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
            const mistakesIds = new Set((u.englishMistakes || []).map(x => x.wordId));
            const sortedWords = [...ALL_WORDS].sort((a, b) => {
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
                            <div><strong>${w.word}</strong> <span style="color:#636e72;">${w.zh}</span> ${isMistake ? '<span style="color:#d63031;font-size:11px;">(待强化)</span>' : ''}</div>
                            <div style="font-size:11.5px; color:#888;">${w.sentence}</div>
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
        records.slice(0, 30).forEach(r => {
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
}

window.addEventListener('DOMContentLoaded', () => {
    window.portalHub = new PortalHubApp();
});
