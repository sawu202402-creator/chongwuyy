/**
 * main.js - 《奇妙萌宠店长：数英星语镇》全局交互控制总线与粒子动效系统
 */

import {
    AVATAR_LIST,
    PET_CATEGORIES,
    PETS_CATALOG,
    SHOPS_CATALOG,
    PET_ACCESSORIES,
    PET_LEVEL_MAX_EXP,
    FEED_BADGE_COST,
    SHOP_LEVEL_MAX_EXP,
    SHOP_UPGRADE_BADGE_COST,
    GACHA_BADGE_COST,
    DEFAULT_DAILY_BADGE_CAP,
    DAILY_BADGE_CAP_OPTIONS,
    TOWN_PLOTS,
    TOWN_DECORS,
    getPetById,
    getShopById
} from './config.js';
import { soundEngine } from './audio.js';
import { mathEngine, MathEngine, MATH_QUESTION_TYPES, ALL_MATH_TYPE_IDS } from './mathEngine.js';
import {
    englishEngine,
    EnglishEngine,
    WORD_PACKS,
    ALL_WORDS,
    ENGLISH_QUESTION_TYPES,
    ALL_ENGLISH_TYPE_IDS,
    ENGLISH_LEVELS,
    COURSE_LESSONS,
    COURSE_SUB_MODES,
    ALL_COURSE_SUB_IDS,
    getPrimaryCourseLesson
} from './englishEngine.js';
import {
    profileManager,
    sanitizeMathEnabledTypes,
    sanitizeEnglishEnabledTypes
} from './profileManager.js';
import {
    renderMathInteractiveWidget,
    renderEnglishQuizWidget,
    renderEnabledTypesSelector,
    renderCourseReadAloudBoard
} from '../../shared/questionWidgets.js';
import { requireParentGate } from '../../shared/parentGate.js';

// ==================== 全屏高帧率飞行徽章与礼花粒子引擎 ====================
class CelebrationFX {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.flyingMedals = [];
        this.running = false;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    spawnBurst(x, y, count = 26) {
        const colors = ['#ff6b9d', '#ffd166', '#7c5cfc', '#06d6a0', '#4cc9f0', '#ff9f1c'];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
            const speed = 3 + Math.random() * 6.5;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2.2,
                size: 5 + Math.random() * 6,
                color: colors[i % colors.length],
                alpha: 1,
                rot: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 0.25
            });
        }
        this.startLoop();
    }

    flyBadges(fromEl, toEl, count = 3) {
        if (!fromEl || !toEl) return;
        const r1 = fromEl.getBoundingClientRect();
        const r2 = toEl.getBoundingClientRect();
        const sx = r1.left + r1.width / 2;
        const sy = r1.top + r1.height / 2;
        const tx = r2.left + r2.width / 2;
        const ty = r2.top + r2.height / 2;

        const num = Math.min(6, Math.max(2, count));
        for (let i = 0; i < num; i++) {
            this.flyingMedals.push({
                sx,
                sy,
                tx,
                ty,
                cx: (sx + tx) / 2 + (Math.random() - 0.5) * 120,
                cy: Math.min(sy, ty) - 90 - Math.random() * 60,
                t: -i * 0.09,
                speed: 0.032
            });
        }
        this.startLoop();
    }

    startLoop() {
        if (this.running || !this.ctx) return;
        this.running = true;
        const step = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // 更新礼花粒子
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.18;
                p.rot += p.vRot;
                p.alpha -= 0.018;
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }
                this.ctx.save();
                this.ctx.globalAlpha = p.alpha;
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rot);
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
                this.ctx.restore();
            }

            // 更新抛物线飞入徽章
            for (let i = this.flyingMedals.length - 1; i >= 0; i--) {
                const m = this.flyingMedals[i];
                m.t += m.speed;
                if (m.t < 0) continue;
                if (m.t >= 1) {
                    this.spawnBurst(m.tx, m.ty, 10);
                    this.flyingMedals.splice(i, 1);
                    continue;
                }
                const u = 1 - m.t;
                const x = u * u * m.sx + 2 * u * m.t * m.cx + m.t * m.t * m.tx;
                const y = u * u * m.sy + 2 * u * m.t * m.cy + m.t * m.t * m.ty;
                this.ctx.save();
                this.ctx.font = '24px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('🏅', x, y);
                this.ctx.restore();
            }

            if (this.particles.length > 0 || this.flyingMedals.length > 0) {
                requestAnimationFrame(step);
            } else {
                this.running = false;
            }
        };
        requestAnimationFrame(step);
    }
}

// ==================== 主应用控制器 ====================
class PetWonderTownApp {
    constructor() {
        this.fx = new CelebrationFX('fxOverlayCanvas');

        // 界面导航状态
        this.activeWorldView = 'home';     // 'home' | 'selector' | 'town' | 'gacha'
        this.activeHomeRecTab = 'scores';  // 'scores' | 'ledger' | 'grads'
        this.selectedPetCategory = 'forest';
        this.pairDraftShopId = 'supermarket';
        this.pairDraftPetId = 'rabbit';
        this.townPendingPlacement = null;  // 若不为null，点击小镇地块直接落点

        // 右侧学习面板状态
        this.activeSubject = 'grand_random'; // 'grand_random' | 'math' | 'english' | 'course' | 'review'
        this._grandActivePanel = 'math';     // 在 grand_random 下当前这道题属于 'math' 还是 'english'
        this._grandStreakSubject = '';
        this._grandStreakCount = 0;
        this.mathSubMode = 'random';         // 'random' | 9大数学题型ID之一
        this.mathInputStr = '';
        this._numericKeypadActive = true;
        this.engSubMode = 'english_random';  // 'vocab_camp' | 'english_random' | 英语题型ID
        this.courseSubMode = 'course_all';   // 'course_all' | 'course_phonics' | 'course_sight' | 'course_qa' | 'course_readcard'
        this.activeWordPackId = 'all';       // 默认开启全部20主题·360词洗牌防重
        this.activeCourseLessonId = 'latest';
        this.quizLocked = false;

        // 个人档案弹窗临时编辑状态
        this.editingUserId = null;
        this.draftAvatar = '🐰';
        this.draftDailyCap = DEFAULT_DAILY_BADGE_CAP;
        this.draftMathMode = 'custom';
        this.draftMathPreset = 'grade1_2';
        this.draftMathRange = 20;
        this.draftMathMul = 9;
        this.draftMathTypes = [...ALL_MATH_TYPE_IDS];
        this.draftEngLevel = 'mixed';
        this.draftEngPack = 'all';
        this.draftEngTypes = [...ALL_ENGLISH_TYPE_IDS];

        this.init();
    }

    init() {
        this.syncEnginesWithActiveUser();
        this.bindGlobalEvents();
        this.renderAll();
        this.initVocabCampForPack(this.activeWordPackId, false);
        this.switchSubjectTab(this.activeSubject, false, false);
    }

    syncEnginesWithActiveUser() {
        const u = profileManager.getActiveUser();
        if (mathEngine.setMistakesProvider) {
            mathEngine.setMistakesProvider(() => profileManager.getActiveUser()?.mathMistakes || []);
        }
        if (englishEngine.setMistakesProvider) {
            englishEngine.setMistakesProvider(() => {
                const cur = profileManager.getActiveUser();
                return {
                    wordMastery: cur?.wordMastery || {},
                    englishMistakes: cur?.englishMistakes || []
                };
            });
        }
        mathEngine.setConfig(u.mathConfig);
        englishEngine.setConfig(u.englishConfig);
        this.activeWordPackId = u.englishConfig?.packId || 'all';
        this.activeCourseLessonId = u.englishConfig?.courseLessonId || 'latest';
        englishEngine.config.packId = this.activeWordPackId;
        englishEngine.config.courseLessonId = this.activeCourseLessonId;

        const pm = u.preferredSmartMode || 'grand_random';
        if (pm === 'grand_random') {
            this.activeSubject = 'grand_random';
            this.mathSubMode = 'random';
            this.engSubMode = 'english_random';
        } else if (pm === 'math_random' || pm === 'math') {
            this.activeSubject = 'math';
            this.mathSubMode = 'random';
        } else if (ALL_MATH_TYPE_IDS.includes(pm)) {
            this.activeSubject = 'math';
            this.mathSubMode = pm;
        } else if (pm === 'course_special' || ALL_COURSE_SUB_IDS.includes(pm)) {
            this.activeSubject = 'course';
            this.courseSubMode = pm === 'course_special' ? 'course_all' : pm;
            this.engSubMode = this.courseSubMode;
        } else if (pm === 'english_random' || pm === 'english') {
            this.activeSubject = 'english';
            this.engSubMode = 'english_random';
        } else if (pm === 'vocab_camp') {
            this.activeSubject = 'english';
            this.engSubMode = 'vocab_camp';
        } else if (ALL_ENGLISH_TYPE_IDS.includes(pm)) {
            this.activeSubject = 'english';
            this.engSubMode = pm;
        } else {
            this.activeSubject = 'grand_random';
            this.mathSubMode = 'random';
            this.engSubMode = 'english_random';
        }

        mathEngine.setSubMode(this.mathSubMode);
        this.pairDraftShopId = u.activeShopId || 'supermarket';
        this.pairDraftPetId = u.activePetId || 'rabbit';
    }

    renderSubModePills() {
        const mathWrap = document.getElementById('petMathSubPills');
        if (mathWrap) {
            const u = profileManager.getActiveUser();
            const enabledCount = sanitizeMathEnabledTypes(u?.mathConfig?.enabledTypes).length;
            const items = [
                { id: 'random', label: `🎲 数学随机(${enabledCount})` },
                ...MATH_QUESTION_TYPES.map(t => ({ id: t.id, label: t.shortName }))
            ];
            mathWrap.innerHTML = '';
            items.forEach(item => {
                const btn = document.createElement('button');
                btn.type = 'button';
                const isActive = this.activeSubject === 'math'
                    ? this.mathSubMode === item.id
                    : (this.activeSubject === 'grand_random' && item.id === 'random');
                btn.className = `sub-pill ${isActive ? 'active' : ''}`;
                btn.dataset.mathmode = item.id;
                btn.textContent = item.label;
                btn.onclick = () => {
                    soundEngine.playTap();
                    this.activeSubject = 'math';
                    this.mathSubMode = item.id;
                    profileManager.setPreferredSmartMode(item.id === 'random' ? 'math_random' : item.id);
                    mathEngine.setSubMode(item.id);
                    mathEngine.nextQuestion();
                    this.switchSubjectTab('math', false, false);
                };
                mathWrap.appendChild(btn);
            });
        }

        const engWrap = document.getElementById('petEngSubPills');
        if (engWrap) {
            const u = profileManager.getActiveUser();
            const enabledCount = sanitizeEnglishEnabledTypes(u?.englishConfig?.enabledTypes).length;
            const items = this.activeSubject === 'course'
                ? COURSE_SUB_MODES.map(m => ({ id: m.id, label: m.shortName, isCourse: true }))
                : [
                    { id: 'vocab_camp', label: '📖 5词背诵' },
                    { id: 'english_random', label: `🎲 英语随机(${enabledCount})` },
                    ...COURSE_SUB_MODES.map(m => ({ id: m.id, label: m.shortName, isCourse: true })),
                    ...ENGLISH_QUESTION_TYPES
                        .filter(t => t.id !== 'course_special')
                        .map(t => ({ id: t.id, label: t.shortName }))
                ];
            engWrap.innerHTML = '';
            items.forEach(item => {
                const btn = document.createElement('button');
                btn.type = 'button';
                const isActive = this.activeSubject === 'course'
                    ? this.courseSubMode === item.id
                    : (this.activeSubject === 'english'
                        ? this.engSubMode === item.id
                        : (this.activeSubject === 'grand_random' && item.id === 'english_random'));
                btn.className = `sub-pill ${item.isCourse ? 'course-pill' : ''} ${isActive ? 'active' : ''}`;
                btn.dataset.engmode = item.id;
                btn.textContent = item.label;
                btn.onclick = () => {
                    soundEngine.playTap();
                    if (item.isCourse) {
                        this.activeSubject = 'course';
                        this.courseSubMode = item.id;
                        this.engSubMode = item.id;
                        profileManager.setPreferredSmartMode(item.id);
                        this.switchSubjectTab('course', true, true);
                    } else {
                        this.activeSubject = 'english';
                        this.engSubMode = item.id;
                        profileManager.setPreferredSmartMode(item.id);
                        this.switchSubjectTab('english', true, true);
                    }
                };
                engWrap.appendChild(btn);
            });
        }
    }

    // ==================== 全局刷新渲染 ====================
    renderAll() {
        this.renderTopHud();
        this.renderHeroHomeView();
        this.renderSelectorView();
        this.renderTownMapView();
        this.renderGachaView();
        this.renderSiblingVisitor();
        this.updateReviewCountBadge();
        this.renderSubModePills();
        this.renderBoardFooter();
    }

    renderSiblingVisitor() {
        const visitor = profileManager.getSiblingVisitor ? profileManager.getSiblingVisitor() : null;
        const homeBtn = document.getElementById('btnSiblingVisitorHome');
        const townBtn = document.getElementById('townSiblingVisitor');
        if (!visitor) {
            if (homeBtn) homeBtn.style.display = 'none';
            if (townBtn) townBtn.style.display = 'none';
            return;
        }

        if (homeBtn) {
            homeBtn.style.display = 'flex';
            homeBtn.classList.toggle('has-gift', !visitor.giftClaimedToday);
            const img = document.getElementById('siblingHomePetImg');
            const title = document.getElementById('siblingHomeTitle');
            const sub = document.getElementById('siblingHomeSub');
            if (img) img.src = visitor.petMeta.img;
            if (title) title.textContent = `${visitor.siblingAvatar} ${visitor.siblingName}来串门`;
            if (sub) {
                sub.textContent = visitor.giftClaimedToday
                    ? `💞 ${visitor.petMeta.name} Lv.${visitor.petLevel} 陪你玩`
                    : `💌 点我打招呼领 +2⭐`;
            }
        }

        if (townBtn) {
            townBtn.style.display = 'flex';
            const tImg = document.getElementById('townSiblingPetImg');
            const tTitle = document.getElementById('townSiblingTitle');
            const tCta = document.getElementById('townSiblingCta');
            if (tImg) tImg.src = visitor.petMeta.img;
            if (tTitle) tTitle.textContent = `${visitor.siblingAvatar} ${visitor.siblingName}带着【${visitor.petMeta.name} Lv.${visitor.petLevel}】来串门`;
            if (tCta) {
                tCta.textContent = visitor.giftClaimedToday
                    ? `✨ 今日友谊星礼已领 · 点击互动问好`
                    : `💌 点击打招呼领 +2⭐ 友谊星`;
            }
        }
    }

    handleSiblingVisitTap(evt) {
        const visitor = profileManager.getSiblingVisitor ? profileManager.getSiblingVisitor() : null;
        if (!visitor) return;
        const cx = (evt && evt.clientX) || window.innerWidth * 0.52;
        const cy = (evt && evt.clientY) || window.innerHeight * 0.62;
        soundEngine.speakEnglish(visitor.petMeta.enGreeting || 'Hello friend!', false);

        const res = profileManager.claimSiblingVisitGift ? profileManager.claimSiblingVisitGift() : { ok: false };
        if (res.ok) {
            soundEngine.playLevelUp();
            this.fx.spawnBurst(cx, cy, 38);
            const badgeBox = document.getElementById('hudBadgeBox');
            if (evt?.currentTarget && badgeBox && res.rewardRes?.grantedBadges > 0) {
                this.fx.flyBadges(evt.currentTarget, badgeBox, res.rewardRes.grantedBadges);
            }
            this.renderAll();
            const extraBadgeMsg = res.rewardRes?.grantedBadges > 0
                ? `<div style="margin-top:6px; color:#d97706; font-weight:900;">🎉 集满3颗星，直接合成 +${res.rewardRes.grantedBadges} 枚荣誉徽章 🏅！</div>`
                : `<div style="margin-top:6px; color:#7c5cfc; font-weight:800;">⭐ 已存入 +2 颗今日学习星（再答对 1 题即可合成徽章）！</div>`;
            this.showQuickModal(
                '💌 双宝串门惊喜礼物！',
                `<div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px; padding:6px 0;">
                    <img src="${visitor.petMeta.img}" alt="${visitor.petMeta.name}" style="width:108px; height:108px; object-fit:contain;" />
                    <div style="font-size:16px; font-weight:900; color:#4c1d95;">
                        ${visitor.siblingAvatar} ${visitor.siblingName}的【${visitor.petMeta.name} Lv.${visitor.petLevel}】来串门啦！
                    </div>
                    <div style="font-size:13px; color:#5b4f7a;">
                        “嗨！我是${visitor.siblingName}养在【${visitor.shopName}】的小伙伴，送你今日友谊星星！”
                    </div>
                    ${extraBadgeMsg}
                </div>`
            );
        } else {
            soundEngine.playFeed();
            this.fx.spawnBurst(cx, cy, 16);
            this.showQuickToast(
                `${visitor.siblingAvatar} ${visitor.siblingName}的小伙伴向你挥手`,
                `🐾 <strong>${visitor.petMeta.name} (Lv.${visitor.petLevel})</strong> 说：“"${visitor.petMeta.enGreeting}"”<br/>${res.msg || '明天再来领串门小星星吧！'}`
            );
        }
    }

    renderTopHud() {
        const u = profileManager.getActiveUser();
        const daily = profileManager.getDailyStatus(u);
        document.getElementById('hudAvatar').textContent = u.avatar;
        document.getElementById('hudName').textContent = u.name;
        document.getElementById('hudBadgesVal').textContent = u.badges;
        document.getElementById('hudTicketsVal').textContent = u.gachaTickets || 0;

        const dailyBox = document.getElementById('hudDailyCapBox');
        const dailyIcon = document.getElementById('hudDailyIcon');
        const dailyVal = document.getElementById('hudDailyVal');
        if (dailyBox && dailyVal) {
            dailyBox.classList.toggle('capped', daily.isCapped);
            dailyIcon.textContent = daily.isCapped ? '🌟' : '⏳';
            dailyVal.textContent = `${daily.earned}/${daily.cap}`;
        }
    }

    renderBoardFooter() {
        const u = profileManager.getActiveUser();
        const mSum = MathEngine.formatSummary(u.mathConfig);
        const eSum = EnglishEngine.formatSummary(u.englishConfig);
        document.getElementById('footerDiffSummary').textContent = `${mSum} ｜ ${eSum}`;
    }

    updateComboHud(combo) {
        const pill = document.getElementById('hudComboPill');
        const valEl = document.getElementById('hudComboVal');
        const leftMascot = document.getElementById('mascotLeftIcon');
        const rightMascot = document.getElementById('mascotRightIcon');
        const talkEl = document.getElementById('mascotTalkText');

        if (combo >= 2) {
            pill.style.display = 'inline-flex';
            valEl.textContent = `x${combo}`;
        } else {
            pill.style.display = 'none';
        }

        if (combo >= 5) {
            leftMascot.textContent = '👑';
            rightMascot.textContent = '🚀';
            talkEl.textContent = `🔥 ${combo}连对超神！额外奖励徽章与盲盒好运！`;
        } else if (combo >= 3) {
            leftMascot.textContent = '😎';
            rightMascot.textContent = '🐸';
            talkEl.textContent = `⚡ ${combo}连对狂热！兔兔戴墨镜为你加成徽章！`;
        } else {
            leftMascot.textContent = '🐰';
            rightMascot.textContent = '🐸';
        }
    }

    updateReviewCountBadge() {
        const u = profileManager.getActiveUser();
        const total = (u.mathMistakes?.length || 0) + (u.englishMistakes?.length || 0);
        const badge = document.getElementById('reviewCountBadge');
        badge.textContent = total;
        badge.style.display = total > 0 ? 'inline-block' : 'none';
    }

    // ==================== 视图 1：我的萌宠 / 当前店铺主页 ====================
    renderHeroHomeView() {
        const u = profileManager.getActiveUser();
        const isShopMode = u.stageMode === 'shop';

        document.getElementById('btnHeroModePet').classList.toggle('active', !isShopMode);
        document.getElementById('btnHeroModeShop').classList.toggle('active', isShopMode);

        const mainSprite = document.getElementById('heroMainSprite');
        const subSprite = document.getElementById('heroManagerSubSprite');
        const accEl = document.getElementById('heroAccessoryBadge');
        const nurtureBtnIcon = document.getElementById('nurtureBtnIcon');
        const nurtureBtnText = document.getElementById('nurtureBtnText');

        if (!isShopMode) {
            const petMeta = getPetById(u.activePetId);
            const pState = u.pets[u.activePetId] || { level: 1, exp: 0, accessory: 'none' };
            const maxExp = PET_LEVEL_MAX_EXP[pState.level] || 45;
            const pct = pState.level >= 5 ? 100 : Math.min(100, Math.max(6, Math.round((pState.exp / maxExp) * 100)));

            document.getElementById('heroTitle').textContent = petMeta.name;
            document.getElementById('heroStageSubtitle').textContent =
                pState.level >= 5 ? `🎓 已毕业 · ${petMeta.stageTitles[4]}` : petMeta.stageTitles[pState.level - 1];
            document.getElementById('heroLvBadge').textContent = `Lv.${pState.level}`;
            document.getElementById('heroExpNums').textContent = pState.level >= 5 ? 'MAX 满级毕业' : `${pState.exp} / ${maxExp}`;
            document.getElementById('heroExpFill').style.width = `${pct}%`;

            mainSprite.src = petMeta.img;
            subSprite.style.display = 'none';

            if (pState.accessory && pState.accessory !== 'none') {
                const accObj = PET_ACCESSORIES.find(a => a.id === pState.accessory);
                accEl.textContent = accObj ? accObj.icon : '';
                accEl.style.display = accObj ? 'block' : 'none';
            } else {
                accEl.style.display = 'none';
            }

            if (pState.level >= 5) {
                nurtureBtnIcon.textContent = '🏪';
                nurtureBtnText.textContent = '已毕业！去配对开店';
            } else {
                nurtureBtnIcon.textContent = petMeta.foodIcon;
                nurtureBtnText.textContent = `喂${petMeta.foodName.slice(0, 4)} (-${FEED_BADGE_COST}🏅)`;
            }

            const line = petMeta.talkLines[pState.level % petMeta.talkLines.length] || petMeta.talkLines[0];
            document.getElementById('heroSpeechBubble').textContent = line;
        } else {
            // 店铺经营展示模式 (对标参考图3: "垂耳兔的超市 Lv.5")
            const shopMeta = getShopById(u.activeShopId);
            const sState = u.shops[u.activeShopId] || { level: 1, exp: 0, managerPetId: u.activePetId };
            const mgrPet = getPetById(sState.managerPetId || u.activePetId);
            const maxExp = SHOP_LEVEL_MAX_EXP[sState.level] || 45;
            const pct = sState.level >= 5 ? 100 : Math.min(100, Math.max(6, Math.round((sState.exp / maxExp) * 100)));

            document.getElementById('heroTitle').textContent = `${mgrPet.name}的${shopMeta.name}`;
            document.getElementById('heroStageSubtitle').textContent =
                sState.level >= 5 ? `🏛️ 旗舰毕业 · ${shopMeta.stageNames[4]}` : shopMeta.stageNames[sState.level - 1];
            document.getElementById('heroLvBadge').textContent = `Lv.${sState.level}`;
            document.getElementById('heroExpNums').textContent = sState.level >= 5 ? 'MAX 皇家大厦' : `${sState.exp} / ${maxExp}`;
            document.getElementById('heroExpFill').style.width = `${pct}%`;

            mainSprite.src = sState.level >= 4 ? shopMeta.imgLv5 : shopMeta.imgLv1;
            subSprite.src = mgrPet.img;
            subSprite.style.display = 'block';
            accEl.style.display = 'none';

            if (sState.level >= 5) {
                nurtureBtnIcon.textContent = '🗺️';
                nurtureBtnText.textContent = '已满级！去小镇巡视';
            } else {
                nurtureBtnIcon.textContent = '🏗️';
                nurtureBtnText.textContent = `进货扩建 (-${SHOP_UPGRADE_BADGE_COST}🏅)`;
            }
            document.getElementById('heroSpeechBubble').textContent = `${mgrPet.emoji} 欢迎光临${mgrPet.name}的${shopMeta.name}！答题越多生意越红火！`;
        }

        const builtCount = Object.keys(u.townPlacements || {}).length;
        document.getElementById('townCountHint').textContent = `已建设 ${builtCount} 处街区 ▸`;
        document.getElementById('gradCountBadge').textContent = u.graduations?.length || 0;

        this.renderHomeRecordsList();
    }

    renderHomeRecordsList() {
        const u = profileManager.getActiveUser();
        const box = document.getElementById('homeRecordsList');
        box.innerHTML = '';

        if (this.activeHomeRecTab === 'scores') {
            if (!u.scoreRecords || u.scoreRecords.length === 0) {
                box.innerHTML = `<div class="record-row-item"><div class="rec-left-title">快在右侧答一道题，开启你的第一条荣誉得分记录吧！✨</div></div>`;
                return;
            }
            u.scoreRecords.forEach(r => {
                const row = document.createElement('div');
                row.className = 'record-row-item';
                row.innerHTML = `
                    <div>
                        <div class="rec-left-title">${r.title}</div>
                        <div class="rec-left-meta">${r.timeStr} · ${r.subjectTag}</div>
                    </div>
                    <span class="rec-delta-pill">+${r.deltaBadges}</span>
                `;
                box.appendChild(row);
            });
        } else if (this.activeHomeRecTab === 'ledger') {
            u.badgeLedger.forEach(item => {
                const isPlus = item.delta >= 0;
                const row = document.createElement('div');
                row.className = 'record-row-item';
                row.innerHTML = `
                    <div>
                        <div class="rec-left-title">${item.reason}</div>
                        <div class="rec-left-meta">${item.timeStr} · 结余 ${item.balanceAfter} 🏅</div>
                    </div>
                    <span class="rec-delta-pill ${isPlus ? '' : 'spend'}">${isPlus ? '+' + item.delta : item.delta}</span>
                `;
                box.appendChild(row);
            });
        } else {
            if (!u.graduations || u.graduations.length === 0) {
                box.innerHTML = `<div class="record-row-item"><div class="rec-left-title">🎓 把萌宠或店铺升到 Lv.5 满级，就能在这里颁发永久闪亮毕业证书哦！</div></div>`;
                return;
            }
            const grid = document.createElement('div');
            grid.className = 'grad-grid';
            u.graduations.forEach(g => {
                const card = document.createElement('div');
                card.className = 'grad-cert-card';
                card.innerHTML = `
                    <img src="${g.img}" alt="${g.title}" />
                    <div>
                        <div style="font-size:13px; font-weight:900; color:#5c3d00;">${g.title}</div>
                        <div style="font-size:11px; color:#8f7224;">毕业时间：${g.dateStr}</div>
                    </div>
                `;
                grid.appendChild(card);
            });
            box.appendChild(grid);
        }
    }

    // ==================== 视图 2：选宠图鉴 & 配对开店工坊 ====================
    renderSelectorView() {
        const u = profileManager.getActiveUser();

        // 1. 渲染宠物分类胶囊
        const pillsWrap = document.getElementById('petCategoryPills');
        pillsWrap.innerHTML = '';
        PET_CATEGORIES.forEach(cat => {
            const count = PETS_CATALOG.filter(p => p.category === cat.id).length;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `cat-pill-btn ${this.selectedPetCategory === cat.id ? 'active' : ''}`;
            btn.textContent = `${cat.icon} ${cat.name} ${count}`;
            btn.onclick = () => {
                soundEngine.playTap();
                this.selectedPetCategory = cat.id;
                this.renderSelectorView();
            };
            pillsWrap.appendChild(btn);
        });

        const curCat = PET_CATEGORIES.find(c => c.id === this.selectedPetCategory) || PET_CATEGORIES[0];
        document.getElementById('petCategoryBanner').textContent = `${curCat.icon} ${curCat.desc}`;

        // 2. 渲染宠物奶油卡片
        const grid = document.getElementById('petsCardsGrid');
        grid.innerHTML = '';
        PETS_CATALOG.filter(p => p.category === this.selectedPetCategory).forEach(pet => {
            const pState = u.pets[pet.id] || { unlocked: false, level: 1 };
            const isCurrent = u.activePetId === pet.id && u.stageMode === 'pet';

            const card = document.createElement('div');
            card.className = `pet-cream-card ${pState.unlocked ? '' : 'locked'} ${isCurrent ? 'current' : ''}`;

            let topTag = `<span class="pet-card-tag">Lv.${pState.level}${pState.graduated ? '·毕业' : ''}</span>`;
            if (!pState.unlocked) {
                topTag = pet.isBlindbox
                    ? `<span class="pet-card-tag ssr">${pet.rarity}</span>`
                    : `<span class="pet-card-tag lock">🏅 ${pet.unlockCost}</span>`;
            }

            let btnLabel = isCurrent ? '🌟 当前养成中' : '切换陪伴';
            if (!pState.unlocked) {
                btnLabel = pet.isBlindbox ? '🎁 去盲盒抽取' : `领养 (${pet.unlockCost}🏅)`;
            }

            card.innerHTML = `
                ${topTag}
                <img src="${pet.img}" alt="${pet.name}" />
                <div class="pet-card-name">${pet.emoji} ${pet.name}</div>
                <div class="pet-card-action">${btnLabel}</div>
            `;

            card.onclick = () => {
                if (!pState.unlocked && pet.isBlindbox) {
                    soundEngine.playTap();
                    this.switchWorldView('gacha');
                    return;
                }
                const res = profileManager.selectOrUnlockPet(pet.id);
                if (!res.ok) {
                    soundEngine.playWrong();
                    this.showQuickToast('💡 温馨提示', res.msg);
                    return;
                }
                if (res.action === 'unlocked') {
                    soundEngine.playLevelUp();
                    this.fx.spawnBurst(window.innerWidth * 0.35, window.innerHeight * 0.45, 35);
                } else {
                    soundEngine.playFeed();
                }
                this.renderAll();
                this.switchWorldView('home');
            };
            grid.appendChild(card);
        });

        // 3. 渲染开店配对工坊
        const shopMeta = getShopById(this.pairDraftShopId);
        const sState = u.shops[this.pairDraftShopId] || { level: 1 };
        document.getElementById('pairShopBigImg').src = sState.level >= 4 ? shopMeta.imgLv5 : shopMeta.imgLv1;
        document.getElementById('pairShopTitle').textContent = `${shopMeta.emoji} ${shopMeta.name} (Lv.${sState.level})`;
        document.getElementById('pairShopDesc').textContent = shopMeta.desc;

        const shopsStrip = document.getElementById('pairShopsStrip');
        shopsStrip.innerHTML = '';
        SHOPS_CATALOG.forEach(s => {
            const st = u.shops[s.id];
            const div = document.createElement('div');
            div.className = `mini-thumb-card ${this.pairDraftShopId === s.id ? 'selected' : ''}`;
            div.innerHTML = `
                <img src="${st?.level >= 4 ? s.imgLv5 : s.imgLv1}" alt="${s.name}" />
                <span>${s.name}${st?.opened ? '·已开' : ''}</span>
            `;
            div.onclick = () => {
                soundEngine.playTap();
                this.pairDraftShopId = s.id;
                if (st?.managerPetId) this.pairDraftPetId = st.managerPetId;
                this.renderSelectorView();
            };
            shopsStrip.appendChild(div);
        });

        const unlockedPets = PETS_CATALOG.filter(p => u.pets[p.id]?.unlocked);
        if (!u.pets[this.pairDraftPetId]?.unlocked && unlockedPets.length > 0) {
            this.pairDraftPetId = unlockedPets[0].id;
        }
        const petMeta = getPetById(this.pairDraftPetId);
        const petSt = u.pets[this.pairDraftPetId];
        document.getElementById('pairPetBigImg').src = petMeta.img;
        document.getElementById('pairPetTitle').textContent = `${petMeta.emoji} ${petMeta.name} (Lv.${petSt?.level || 1})`;
        document.getElementById('pairPetDesc').textContent = petSt?.graduated ? '🎓 金牌毕业店长 · 经营收益拉满！' : '🌟 实习小店长 · 可边开店边升级！';

        const petsStrip = document.getElementById('pairPetsStrip');
        petsStrip.innerHTML = '';
        unlockedPets.forEach(p => {
            const div = document.createElement('div');
            div.className = `mini-thumb-card ${this.pairDraftPetId === p.id ? 'selected' : ''}`;
            div.innerHTML = `
                <img src="${p.img}" alt="${p.name}" />
                <span>${p.name}</span>
            `;
            div.onclick = () => {
                soundEngine.playTap();
                this.pairDraftPetId = p.id;
                this.renderSelectorView();
            };
            petsStrip.appendChild(div);
        });

        document.getElementById('pairSummaryText').innerHTML =
            `即将配对开业：<strong>${petMeta.emoji} ${petMeta.name}的${shopMeta.name}</strong>`;
    }

    // ==================== 视图 3：2.5D 海滨铁道萌宠小镇全景地图 ====================
    renderTownMapView() {
        const u = profileManager.getActiveUser();
        const layer = document.getElementById('townPlotsLayer');
        layer.innerHTML = '';

        const banner = document.getElementById('townHudBanner');
        if (this.townPendingPlacement) {
            banner.innerHTML = `📍 <strong>选址模式</strong>：请点击下方任意一块绿色草坪地块，放置你的【${this.townPendingPlacement.label}】！`;
        } else {
            banner.innerHTML = `🚂 <strong>${u.name}的星语海滨萌宠小镇</strong> · 点击任意草坪地块可建店、更换位置或添置游乐景观！`;
        }

        TOWN_PLOTS.forEach(plot => {
            const node = document.createElement('div');
            node.className = 'town-plot-node';
            node.style.left = `${plot.left}%`;
            node.style.top = `${plot.top}%`;

            const placed = u.townPlacements?.[plot.id];
            if (placed && placed.type === 'shop') {
                const shopMeta = getShopById(placed.itemId);
                const sState = u.shops[placed.itemId] || { level: 1 };
                const mgrPet = getPetById(placed.managerPetId || sState.managerPetId || u.activePetId);
                const spriteUrl = sState.level >= 4 ? shopMeta.imgLv5 : shopMeta.imgLv1;

                node.innerHTML = `
                    <img src="${spriteUrl}" alt="${shopMeta.name}" class="plot-shop-sprite" />
                    <div class="plot-pet-avatar-bubble"><img src="${mgrPet.img}" alt="${mgrPet.name}" /></div>
                    <div class="plot-name-plate">${mgrPet.name}的${shopMeta.name} Lv.${sState.level}</div>
                `;
            } else if (placed && placed.type === 'decor') {
                const dec = TOWN_DECORS.find(d => d.id === placed.itemId) || TOWN_DECORS[0];
                node.innerHTML = `
                    <div class="plot-decor-emoji">${dec.icon}</div>
                    <div class="plot-name-plate">${dec.name}</div>
                `;
            } else {
                node.innerHTML = `
                    <div class="plot-empty-marker">${this.townPendingPlacement ? '📍 点此落点' : '➕ 空草坪'}</div>
                `;
            }

            node.onclick = () => {
                soundEngine.playTap();
                if (this.townPendingPlacement) {
                    const res = profileManager.placeOnTownPlot(plot.id, this.townPendingPlacement.payload);
                    if (!res.ok) {
                        this.showQuickToast('💡 徽章不足', res.msg);
                        return;
                    }
                    soundEngine.playLevelUp();
                    this.townPendingPlacement = null;
                    this.renderAll();
                    return;
                }
                this.openTownPlotMenu(plot, placed);
            };

            layer.appendChild(node);
        });
    }

    openTownPlotMenu(plot, currentPlaced) {
        const u = profileManager.getActiveUser();
        let html = `<p style="font-size:13px; color:#665c87;">📍 当前选中地块：<strong>${plot.label}</strong></p>`;

        html += `<div style="font-size:13px; font-weight:800; margin-top:6px;">🏪 放置/迁移店铺到此地块：</div>`;
        html += `<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px;">`;
        SHOPS_CATALOG.forEach(s => {
            const st = u.shops[s.id];
            const mgr = getPetById(st?.managerPetId || u.activePetId);
            html += `
                <button type="button" class="town-pick-shop-btn" data-shop="${s.id}" style="background:#faf7ff; border:2px solid #dfd5fa; border-radius:12px; padding:8px; display:flex; flex-direction:column; align-items:center; gap:4px;">
                    <img src="${st?.level >= 4 ? s.imgLv5 : s.imgLv1}" style="width:48px; height:48px; object-fit:contain;" />
                    <strong style="font-size:12px;">${s.name} Lv.${st?.level || 1}</strong>
                    <small style="font-size:10px; color:#7c5cfc;">店长:${mgr.name}</small>
                </button>
            `;
        });
        html += `</div>`;

        html += `<div style="font-size:13px; font-weight:800; margin-top:8px;">🎡 装扮小镇景观设施：</div>`;
        html += `<div style="display:flex; gap:8px; flex-wrap:wrap;">`;
        TOWN_DECORS.forEach(d => {
            const owned = u.ownedDecors.includes(d.id);
            html += `
                <button type="button" class="town-pick-decor-btn" data-decor="${d.id}" style="background:#fffdf2; border:2px solid #f2deac; border-radius:12px; padding:7px 11px; font-size:12px; font-weight:800;">
                    ${d.icon} ${d.name} ${owned ? '(已拥有)' : `(${d.cost}🏅)`}
                </button>
            `;
        });
        html += `</div>`;

        if (currentPlaced) {
            html += `<button type="button" id="btnClearPlotNow" style="margin-top:8px; padding:8px; border-radius:10px; background:#fee2e2; color:#dc2626; font-weight:800; font-size:12px;">🧹 收起此地块建筑（变回绿草坪）</button>`;
        }

        this.showQuickModal(`🗺️ 小镇规划 · ${plot.label}`, html);

        document.querySelectorAll('.town-pick-shop-btn').forEach(btn => {
            btn.onclick = () => {
                const sid = btn.dataset.shop;
                const mgrId = u.shops[sid]?.managerPetId || u.activePetId;
                profileManager.pairShopAndManager(sid, mgrId, plot.id);
                soundEngine.playLevelUp();
                this.closeModal('modalQuickPopup');
                this.renderAll();
            };
        });

        document.querySelectorAll('.town-pick-decor-btn').forEach(btn => {
            btn.onclick = () => {
                const did = btn.dataset.decor;
                const res = profileManager.placeOnTownPlot(plot.id, { type: 'decor', itemId: did });
                if (!res.ok) {
                    soundEngine.playWrong();
                    alert(res.msg);
                    return;
                }
                soundEngine.playFeed();
                this.closeModal('modalQuickPopup');
                this.renderAll();
            };
        });

        const clearBtn = document.getElementById('btnClearPlotNow');
        if (clearBtn) {
            clearBtn.onclick = () => {
                profileManager.placeOnTownPlot(plot.id, null);
                soundEngine.playTap();
                this.closeModal('modalQuickPopup');
                this.renderAll();
            };
        }
    }

    // ==================== 视图 4：惊喜盲盒扭蛋屋 ====================
    renderGachaView() {
        const u = profileManager.getActiveUser();
        const hintEl = document.getElementById('gachaCostHint');
        if ((u.gachaTickets || 0) > 0) {
            hintEl.textContent = `🎟️ 当前拥有 ${u.gachaTickets} 张免费盲盒券！点击立即免徽章抽取！`;
        } else {
            hintEl.textContent = `消耗 ${GACHA_BADGE_COST} 枚 🏅 徽章扭一次（连对5题免费送券！）`;
        }

        const box = document.getElementById('gachaHiddenPreview');
        box.innerHTML = '';
        PETS_CATALOG.filter(p => p.isBlindbox).forEach(p => {
            const unlocked = u.pets[p.id]?.unlocked;
            const item = document.createElement('div');
            item.className = `pet-cream-card ${unlocked ? '' : 'locked'}`;
            item.style.padding = '10px';
            item.innerHTML = `
                <span class="pet-card-tag ssr">${p.rarity}</span>
                <img src="${p.img}" alt="${p.name}" style="width:82px; height:82px;" />
                <div class="pet-card-name" style="font-size:14px;">${p.emoji} ${p.name}</div>
                <div style="font-size:11px; font-weight:800; color:${unlocked ? '#16a34a' : '#9c8fb8'};">
                    ${unlocked ? '✅ 已抽中拥有！点击出战' : '❓ 待扭蛋唤醒'}
                </div>
            `;
            if (unlocked) {
                item.onclick = () => {
                    profileManager.selectOrUnlockPet(p.id);
                    soundEngine.playFeed();
                    this.renderAll();
                    this.switchWorldView('home');
                };
            }
            box.appendChild(item);
        });
    }

    // ==================== 🎲 数英大随机统一调度 ====================
    drawNextGrandRandomQuestion(autoSpeak = false) {
        let nextSubj = Math.random() < 0.5 ? 'math' : 'english';
        if (this._grandStreakSubject === nextSubj && this._grandStreakCount >= 2) {
            nextSubj = nextSubj === 'math' ? 'english' : 'math';
        }
        if (this._grandStreakSubject === nextSubj) {
            this._grandStreakCount += 1;
        } else {
            this._grandStreakSubject = nextSubj;
            this._grandStreakCount = 1;
        }
        this._grandActivePanel = nextSubj;

        document.querySelectorAll('.subj-tab').forEach(b => {
            b.classList.toggle('active', b.dataset.subj === 'grand_random');
        });
        document.getElementById('panelReview').style.display = 'none';
        this.renderSubModePills();

        if (nextSubj === 'math') {
            document.getElementById('panelMath').style.display = 'flex';
            document.getElementById('panelEnglish').style.display = 'none';
            mathEngine.setSubMode('random');
            const q = mathEngine.nextQuestion();
            this.renderCurrentMathQuestion(q);
            document.getElementById('mathFeedbackBar').textContent = '🎲 数英大随机连击中 · 答对数学或英语都可赚徽章喂萌宠！';
        } else {
            document.getElementById('panelMath').style.display = 'none';
            document.getElementById('panelEnglish').style.display = 'flex';
            englishEngine.config.packId = this.activeWordPackId;
            this.renderWordPackStrip();
            const eq = englishEngine.nextQuickQuestion(null, null);
            this.renderEnglishQuizQuestion(eq, autoSpeak);
            document.getElementById('engFeedbackBar').textContent = '🎲 数英大随机连击中 · 点击喇叭可反复听纯正美音！';
        }
    }

    // ==================== 右侧面板 1：数学 9 大题型（数字小黑板 + 6大新互动果冻组件） ====================
    renderCurrentMathQuestion(forcedQ = null) {
        if (this._wrongMathTimer) {
            clearTimeout(this._wrongMathTimer);
            this._wrongMathTimer = null;
        }
        const q = forcedQ || mathEngine.currentQuestion || mathEngine.nextQuestion();
        this.mathInputStr = '';
        this.updateMathInputView();

        const interactiveStage = document.getElementById('petMathInteractiveStage');
        const boardBox = document.getElementById('mathBoardBox');
        const inputRow = document.getElementById('mathInputRow');
        const keypad = document.getElementById('mathKeypad');

        if (q.isInteractiveWidget && interactiveStage) {
            this._numericKeypadActive = false;
            boardBox.style.display = 'none';
            if (inputRow) inputRow.style.display = 'none';
            keypad.style.display = 'none';
            interactiveStage.style.display = 'flex';
            renderMathInteractiveWidget(interactiveStage, q, {
                theme: 'light',
                onTapSound: () => soundEngine.playTap(),
                onEvaluate: (ok, userAnsLabel) => this.handleInteractiveMathEvaluated(ok, userAnsLabel)
            });
            return;
        }

        this._numericKeypadActive = true;
        if (interactiveStage) interactiveStage.style.display = 'none';
        boardBox.style.display = 'flex';
        if (inputRow) inputRow.style.display = 'grid';
        keypad.style.display = 'grid';

        document.getElementById('mathHintTag').textContent = `🎯 ${q.hint || '智慧数学挑战'}`;
        document.getElementById('mathUnitBadge').textContent = q.unitLabel || '';

        const formulaEl = document.getElementById('mathFormulaView');
        const wordEl = document.getElementById('mathWordView');
        const dataEl = document.getElementById('mathDataView');
        const toolsEl = document.getElementById('mathExtraTools');
        const tipBox = document.getElementById('mathVisualTipBox');

        tipBox.style.display = 'none';
        tipBox.textContent = q.visualTip || '';

        if (q.kind === 'word') {
            formulaEl.style.display = 'none';
            dataEl.style.display = 'none';
            wordEl.style.display = 'block';
            toolsEl.style.display = 'flex';
            wordEl.innerHTML = q.storyHtml;
        } else if (q.kind === 'data') {
            formulaEl.style.display = 'none';
            wordEl.style.display = 'none';
            dataEl.style.display = 'flex';
            toolsEl.style.display = 'flex';

            const chartBars = document.getElementById('mathChartBars');
            chartBars.innerHTML = '';
            const maxS = q.chartData.maxScale || 20;
            q.chartData.bars.forEach(b => {
                const wPct = Math.min(100, Math.round((b.value / maxS) * 100));
                const row = document.createElement('div');
                row.className = 'chart-bar-row';
                row.innerHTML = `
                    <span>${b.icon}${b.name}</span>
                    <div class="chart-track"><div class="chart-fill" style="width:${wPct}%; background:${b.color};"></div></div>
                    <span style="color:#ffe680; text-align:right;">${b.value}</span>
                `;
                chartBars.appendChild(row);
            });
            document.getElementById('mathChartQuestion').innerHTML = q.questionText;
        } else {
            // 纯口算
            wordEl.style.display = 'none';
            dataEl.style.display = 'none';
            toolsEl.style.display = 'none';
            formulaEl.style.display = 'block';
            formulaEl.textContent = q.display || q.formula;
        }
    }

    updateMathInputView() {
        const el = document.getElementById('mathAnsText');
        if (!this.mathInputStr) {
            el.textContent = '点果冻数字输入';
            el.className = 'placeholder';
        } else {
            el.textContent = this.mathInputStr;
            el.className = '';
        }
    }

    _processMathAttemptResult(res, flySourceEl) {
        const fb = document.getElementById('mathFeedbackBar');
        this.updateComboHud(res.combo);
        const typeMeta = MATH_QUESTION_TYPES.find(t => t.id === res.question?.kind);
        const kindTitle = typeMeta ? typeMeta.name.replace(/^[^\s]+\s*/, '') : '数学挑战';

        if (res.isCorrect) {
            soundEngine.playCorrect();
            if (res.question.isReview) {
                profileManager.resolveMathMistake(res.question);
            }
            const recTitle = res.combo >= 3
                ? `🔥 ${kindTitle}达成 ${res.combo} 连对！(${res.question.formula || res.question.expr})`
                : `✅ 完成${kindTitle}：${res.question.formula || res.question.expr}`;

            const award = profileManager.awardLearningProgress({
                title: recTitle,
                subjectTag: kindTitle,
                badges: res.badgeEarned,
                stars: res.starEarned,
                gotTicket: res.gotGachaTicket,
                combo: res.combo,
                isMath: true
            });

            if (award.alreadyAtCap) {
                fb.textContent = `🌟 答对啦！今日徽章已集满 (${award.dailyEarned}/${award.dailyCap})，继续练习巩固熟练度！`;
            } else if (award.actualTicket) {
                fb.textContent = `🎉 15连对大满贯！+${award.actualBadges}🏅 并获赠 1 张 🎟️ 神秘盲盒券！`;
            } else if (award.actualBadges > 0) {
                fb.textContent = `🌟 棒极啦！荣获 +${award.actualBadges} 🏅 徽章（今日 ${award.dailyEarned}/${award.dailyCap}）！`;
                this.fx.flyBadges(flySourceEl, document.getElementById('heroMainSprite'), award.actualBadges);
            } else {
                fb.textContent = `⭐ 答对集星！学习星 ${award.starProgress}/3（再集 ${3 - award.starProgress} 星合成 1 枚🏅）！`;
            }

            this.triggerPetHappyReaction();
            this.renderAll();

            if (award.reachedCapNow) {
                this.celebrateDailyCapReached(award.dailyCap);
            }
            return true;
        } else {
            soundEngine.playWrong();
            profileManager.recordMathMistake(res.question, res.userAns);
            this.updateReviewCountBadge();
            fb.textContent = `💪 差一点点（正确答案是 ${res.expected}），${res.question.visualTip || '下一题加油！'}`;
            return false;
        }
    }

    handleInteractiveMathEvaluated(isCorrect, userAnsLabel = '') {
        const res = mathEngine.evaluateInteractiveAttempt(isCorrect, userAnsLabel, false);
        const stageEl = document.getElementById('petMathInteractiveStage');
        const ok = this._processMathAttemptResult(res, stageEl);

        if (this._wrongMathTimer) clearTimeout(this._wrongMathTimer);
        this._wrongMathTimer = setTimeout(() => {
            this._wrongMathTimer = null;
            if (this.activeSubject === 'grand_random') {
                this.drawNextGrandRandomQuestion(true);
            } else {
                mathEngine.nextQuestion();
                this.renderCurrentMathQuestion();
                if (this.activeSubject === 'review') this.renderReviewPanel();
            }
        }, ok ? 650 : 1300);
    }

    handleMathSubmit() {
        if (!this.mathInputStr) return;
        const res = mathEngine.checkAnswer(this.mathInputStr);
        const ok = this._processMathAttemptResult(res, document.getElementById('btnSubmitMath'));

        if (ok) {
            if (this.activeSubject === 'grand_random') {
                this.drawNextGrandRandomQuestion(true);
            } else {
                this.renderCurrentMathQuestion();
                if (this.activeSubject === 'review') this.renderReviewPanel();
            }
        } else {
            this.mathInputStr = '';
            this.updateMathInputView();
            if (res.question.visualTip) {
                const tipBox = document.getElementById('mathVisualTipBox');
                tipBox.style.display = 'block';
                tipBox.textContent = `💡 小提示：${res.question.visualTip}`;
            }
            if (this._wrongMathTimer) clearTimeout(this._wrongMathTimer);
            this._wrongMathTimer = setTimeout(() => {
                this._wrongMathTimer = null;
                if (this.activeSubject === 'grand_random') {
                    this.drawNextGrandRandomQuestion(true);
                } else {
                    mathEngine.nextQuestion();
                    this.renderCurrentMathQuestion();
                }
            }, 1200);
        }
    }

    // ==================== 右侧面板 2：英语【20主题360词 + 🎓校外英语课专项】 ====================
    renderWordPackStrip() {
        const strip = document.getElementById('engPackStrip');
        if (!strip) return;
        strip.innerHTML = '';

        if (this.activeSubject === 'course') {
            const lessonItems = [
                { id: 'latest', label: `🌟 最新(${COURSE_LESSONS[0].code}·${COURSE_LESSONS[0].dateLabel})` },
                ...(COURSE_LESSONS.length > 1
                    ? [{ id: 'all_courses', label: `📚 全部已学(${COURSE_LESSONS.length}节)` }]
                    : []),
                ...COURSE_LESSONS.map(l => ({ id: l.id, label: `🎓 ${l.code}《${l.storyTitle}》` }))
            ];
            lessonItems.forEach(ls => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `pack-chip ${this.activeCourseLessonId === ls.id ? 'active' : ''}`;
                btn.textContent = ls.label;
                btn.onclick = () => {
                    soundEngine.playTap();
                    this.activeCourseLessonId = ls.id;
                    englishEngine.config.courseLessonId = ls.id;
                    const active = profileManager.getActiveUser();
                    if (active) {
                        profileManager.updateUserSettings(active.id, {
                            englishConfig: { ...(active.englishConfig || {}), courseLessonId: ls.id }
                        });
                    }
                    this.renderWordPackStrip();
                    if (this.courseSubMode === 'course_readcard') {
                        this.renderCourseReadCardInPet();
                    } else {
                        this.renderEnglishQuizQuestion(englishEngine.nextQuickQuestion(null, this.courseSubMode), true);
                    }
                };
                strip.appendChild(btn);
            });
            return;
        }

        const packsWithAll = [
            { id: 'all', icon: '🌟', name: `全部20主题(${ALL_WORDS.length})` },
            ...WORD_PACKS
        ];
        packsWithAll.forEach(p => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `pack-chip ${this.activeWordPackId === p.id ? 'active' : ''}`;
            btn.textContent = `${p.icon} ${p.name}`;
            btn.onclick = () => {
                soundEngine.playTap();
                this.activeWordPackId = p.id;
                englishEngine.config.packId = p.id;
                const active = profileManager.getActiveUser();
                if (active) {
                    profileManager.updateUserSettings(active.id, {
                        englishConfig: { ...(active.englishConfig || {}), packId: p.id }
                    });
                }
                this.renderWordPackStrip();
                if (this.activeSubject === 'grand_random') {
                    this.renderEnglishQuizQuestion(englishEngine.nextQuickQuestion(null, null), true);
                } else if (this.engSubMode === 'vocab_camp') {
                    this.initVocabCampForPack(p.id, true);
                } else {
                    const forcedType = ALL_ENGLISH_TYPE_IDS.includes(this.engSubMode) ? this.engSubMode : null;
                    this.renderEnglishQuizQuestion(englishEngine.nextQuickQuestion(null, forcedType), true);
                }
            };
            strip.appendChild(btn);
        });
    }

    renderCourseReadCardInPet() {
        this.quizLocked = false;
        this._numericKeypadActive = false;
        document.getElementById('engStudyWrap').style.display = 'none';
        document.getElementById('engQuizWrap').style.display = 'flex';
        const stageEl = document.getElementById('petEngQuizStage');
        const lesson = getPrimaryCourseLesson(this.activeCourseLessonId);
        renderCourseReadAloudBoard(stageEl, lesson, {
            theme: 'light',
            compact: true,
            speakFn: (txt, slow, ph) => soundEngine.speakEnglish(txt, slow, ph),
            onTapSound: () => soundEngine.playTap(),
            isChecked: (k) => Boolean(profileManager.getActiveUser()?.courseReadChecks?.[k]?.checked),
            onToggleCheck: (k) => {
                const res = profileManager.toggleCourseReadCheck
                    ? profileManager.toggleCourseReadCheck(k)
                    : { checked: false, awarded: false };
                if (res.awarded) {
                    soundEngine.playCorrect();
                    this.renderTopHud();
                }
            }
        });
        const fb = document.getElementById('engFeedbackBar');
        if (fb) {
            fb.textContent = '📹 点击【读问句/读答句/慢速跟读】练熟视频作业，打勾 ✅ 还能领学习星！';
        }
    }

    initVocabCampForPack(packId, speakFirst = false) {
        const u = profileManager.getActiveUser();
        englishEngine.startVocabStudySession(packId || 'all', u.wordMastery || {});
        this.renderWordPackStrip();
        this.renderVocabFlashcard(speakFirst);
    }

    renderVocabFlashcard(autoSpeak = true) {
        const sess = englishEngine.studySession;
        if (!sess) return;

        document.getElementById('engStudyWrap').style.display = 'flex';
        document.getElementById('engQuizWrap').style.display = 'none';

        const w = sess.words[sess.studyIdx];
        document.getElementById('fcPackTag').textContent = `${sess.packIcon} ${sess.packName}`;
        document.getElementById('fcStepPill').textContent = `今日背词 ${sess.studyIdx + 1} / ${sess.words.length}`;
        document.getElementById('fcEmoji').textContent = w.icon;
        document.getElementById('fcWordPhonics').innerHTML = EnglishEngine.renderPhonicsHtml(w.phonics);
        document.getElementById('fcIpa').textContent = w.ipa;
        document.getElementById('fcZh').textContent = w.zh;
        document.getElementById('fcSenEn').textContent = w.sentence;
        document.getElementById('fcSenZh').textContent = w.sentenceZh;

        document.getElementById('btnFcPrev').disabled = sess.studyIdx === 0;
        document.getElementById('btnFcPrev').style.opacity = sess.studyIdx === 0 ? '0.4' : '1';

        const nextBtn = document.getElementById('btnFcNext');
        if (sess.studyIdx === sess.words.length - 1) {
            nextBtn.textContent = '🚀 5词认完啦！开始闯关领大奖';
        } else {
            nextBtn.textContent = '记住了，下一词 ➡️';
        }

        if (autoSpeak && this.activeSubject === 'english') {
            soundEngine.speakEnglish(w.word, false, w.phonics);
        }
    }

    renderEnglishQuizQuestion(q, autoSpeak = true) {
        if (!q) return;
        this.quizLocked = false;
        this._numericKeypadActive = false;
        englishEngine.currentQuiz = q;

        document.getElementById('engStudyWrap').style.display = 'none';
        document.getElementById('engQuizWrap').style.display = 'flex';

        const sess = englishEngine.studySession;
        let badgeTitle = '⚡ 英语闪电闯关';
        if (this.activeSubject === 'grand_random') {
            badgeTitle = q.mode === 'course_special' ? `🎓 校外课 · ${q.lessonCode || 'S1U1W1'}` : '🎲 大随机 · 英语';
        } else if (this.activeSubject === 'course' || ALL_COURSE_SUB_IDS.includes(this.engSubMode)) {
            const cm = COURSE_SUB_MODES.find(m => m.id === this.courseSubMode);
            badgeTitle = cm ? cm.title : `🎓 ${q.lessonCode || '英语课专项'}`;
        } else if (this.engSubMode === 'vocab_camp' && sess && sess.phase === 'quiz') {
            badgeTitle = `📖 背词通关 ${sess.quizIdx + 1}/${sess.quizQueue.length}`;
        } else if (ALL_ENGLISH_TYPE_IDS.includes(this.engSubMode)) {
            const tm = ENGLISH_QUESTION_TYPES.find(t => t.id === this.engSubMode);
            if (tm) badgeTitle = tm.name;
        }

        const stageEl = document.getElementById('petEngQuizStage');
        renderEnglishQuizWidget(stageEl, q, {
            theme: 'light',
            badgeTitle,
            autoSpeak,
            speakFn: (txt, slow, ph) => soundEngine.speakEnglish(txt, slow, ph),
            onTapSound: () => soundEngine.playTap(),
            onEvaluate: (ok, userAns) => {
                if (this.quizLocked) return;
                this.handleEnglishEvaluated(ok, q, userAns);
            }
        });
    }

    handleEnglishEvaluated(isCorrect, q) {
        this.quizLocked = true;
        const res = englishEngine.evaluateResult(isCorrect, q.wordObj, q.isReview);
        const fb = document.getElementById('engFeedbackBar');
        this.updateComboHud(res.combo);
        const enTypeMeta = ENGLISH_QUESTION_TYPES.find(t => t.id === q.mode);
        const modeTag = enTypeMeta ? enTypeMeta.shortName : '少儿英语';

        const isCourseQ = q.mode === 'course_special';
        const displayKeyText = isCourseQ
            ? (q.expectedWord || q.expectedSentence || q.answerEn || q.wordObj.word)
            : `${q.wordObj.word} (${q.wordObj.zh})`;

        if (isCorrect) {
            soundEngine.playCorrect();
            if (isCourseQ) {
                if (q.courseSubType === 'phonics_dictation' || q.courseSubType === 'sight_word_spell') {
                    soundEngine.speakEnglish(q.wordObj.ttsWord || q.wordObj.word, false, '');
                } else if (q.courseSubType === 'sight_sentence_order') {
                    soundEngine.speakEnglish(q.expectedSentence, false, '');
                } else if (q.courseSubType === 'qa_cloze' || q.courseSubType === 'qa_story_steps') {
                    soundEngine.speakEnglish(q.answerEn, false, '');
                }
            } else if (q.mode !== 'bubble_pair') {
                soundEngine.speakEnglish(q.wordObj.word, false, q.wordObj.phonics);
            }
            if (Array.isArray(q.pairWords) && q.pairWords.length > 0) {
                q.pairWords.forEach(pw => profileManager.updateWordProgress(pw, true, 1));
            } else {
                profileManager.updateWordProgress(q.wordObj, true, 1);
            }

            const award = profileManager.awardLearningProgress({
                title: `🔤 ${modeTag}答对【${q.wordObj.word} · ${q.wordObj.zh}】`,
                subjectTag: modeTag,
                badges: res.badgeEarned,
                stars: res.starEarned,
                gotTicket: res.gotGachaTicket,
                combo: res.combo,
                isMath: false
            });

            if (award.alreadyAtCap) {
                fb.textContent = `🎉 Awesome! ${displayKeyText} · 今日徽章已满 (${award.dailyEarned}/${award.dailyCap})！`;
            } else if (award.actualBadges > 0) {
                fb.textContent = `🎉 Awesome! ${displayKeyText} +${award.actualBadges}🏅（今日 ${award.dailyEarned}/${award.dailyCap}）！`;
                this.fx.flyBadges(document.getElementById('panelEnglish'), document.getElementById('heroMainSprite'), award.actualBadges);
            } else {
                fb.textContent = `⭐ Awesome! 学习星 ${award.starProgress}/3（再集 ${3 - award.starProgress} 星合成 +1🏅）！`;
            }

            this.triggerPetHappyReaction();
            this.renderAll();

            if (award.reachedCapNow) this.celebrateDailyCapReached(award.dailyCap);

            setTimeout(() => this.advanceEnglishStep(), 700);
        } else {
            soundEngine.playWrong();
            const wrongSpeak = isCourseQ
                ? (q.expectedSentence || q.answerEn || q.wordObj.ttsWord || q.wordObj.word)
                : q.wordObj.word;
            soundEngine.speakEnglish(wrongSpeak, true, isCourseQ ? '' : q.wordObj.phonics);
            profileManager.updateWordProgress(q.wordObj, false, 0);
            this.updateReviewCountBadge();
            fb.textContent = `💡 正确答案：${displayKeyText}，已收入双倍复习本！`;
            setTimeout(() => this.advanceEnglishStep(), 1450);
        }
    }

    advanceEnglishStep() {
        if (this.activeSubject === 'grand_random') {
            this.drawNextGrandRandomQuestion(true);
            return;
        }
        if (this.activeSubject === 'review') {
            this.renderReviewPanel();
            return;
        }
        if (this.activeSubject === 'course') {
            if (this.courseSubMode === 'course_readcard') {
                this.renderCourseReadCardInPet();
            } else {
                this.renderEnglishQuizQuestion(englishEngine.nextQuickQuestion(null, this.courseSubMode), true);
            }
            return;
        }
        const sess = englishEngine.studySession;
        if (this.engSubMode === 'vocab_camp' && sess && sess.phase === 'quiz') {
            sess.quizIdx += 1;
            if (sess.quizIdx < sess.quizQueue.length) {
                this.renderEnglishQuizQuestion(sess.quizQueue[sess.quizIdx], true);
            } else {
                // 完成整组 5 词背诵通关！颁发稳健打卡奖励（+3枚徽章；每日首轮通关赠送1张盲盒券）
                sess.phase = 'done';
                sess.words.forEach(w => profileManager.updateWordProgress(w, true, 2));
                soundEngine.playLevelUp();
                const dailyBefore = profileManager.getDailyStatus();
                const isFirstCampToday = dailyBefore.vocabCampCount === 0;
                const bonus = 3;
                const award = profileManager.awardLearningProgress({
                    title: `👑 完成「${sess.packName}」5个新单词背诵通关打卡！`,
                    subjectTag: '魔法背单词',
                    badges: bonus,
                    gotTicket: isFirstCampToday,
                    isVocabCampFinish: true,
                    combo: englishEngine.combo,
                    isMath: false
                });
                this.fx.spawnBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 45);
                this.renderAll();
                const badgeNote = award.actualBadges > 0
                    ? `额外荣获 <strong>+${award.actualBadges} 🏅 徽章</strong>（今日 ${award.dailyEarned}/${award.dailyCap}）`
                    : `今日徽章已集满（${award.dailyEarned}/${award.dailyCap}），5个单词熟练度已全部点亮`;
                const ticketNote = award.actualTicket ? ` + <strong>1 张 🎟️ 盲盒券</strong>` : '';
                this.showQuickToast(
                    '👑 背单词打卡大满贯！',
                    `太厉害啦！你成功背会了【${sess.words.map(w => w.word).join(', ')}】5个单词，${badgeNote}${ticketNote}！`
                );
                this.initVocabCampForPack(this.activeWordPackId, false);
            }
        } else {
            const forcedType = ALL_ENGLISH_TYPE_IDS.includes(this.engSubMode) ? this.engSubMode : null;
            this.renderEnglishQuizQuestion(englishEngine.nextQuickQuestion(null, forcedType), true);
        }
    }

    // ==================== 右侧面板 3：错题 & 生词双倍徽章淘金屋 ====================
    renderReviewPanel() {
        this._numericKeypadActive = false;
        const u = profileManager.getActiveUser();
        const box = document.getElementById('reviewInteractiveBox');
        const mList = u.mathMistakes || [];
        const eList = u.englishMistakes || [];

        if (mList.length === 0 && eList.length === 0) {
            box.innerHTML = `
                <div style="font-size:54px;">🏆</div>
                <div style="font-size:17px; font-weight:900; color:#fff;">太棒啦！错题与生词全部清零！</div>
                <p style="font-size:13px; color:#dcd2fc;">所有的数学题和英语单词都被你稳稳拿下啦！继续去闯关赚徽章吧！</p>
            `;
            return;
        }

        box.innerHTML = `
            <div style="font-size:40px;">💎</div>
            <div style="font-size:15px; font-weight:900;">待淘金队列：数学错题 ${mList.length} 道 ｜ 英语生词 ${eList.length} 个</div>
            <div style="display:flex; flex-direction:column; gap:8px; width:100%; margin-top:6px;">
                ${mList.length > 0 ? `<button type="button" id="btnRevMathNow" class="btn-orange-wide" style="width:100%;">🔢 立即攻克数学错题 (2倍🏅)</button>` : ''}
                ${eList.length > 0 ? `<button type="button" id="btnRevEngNow" class="btn-purple-wide" style="width:100%;">🔤 立即攻克英语生词 (2倍🏅)</button>` : ''}
            </div>
        `;

        const mBtn = document.getElementById('btnRevMathNow');
        if (mBtn) {
            mBtn.onclick = () => {
                soundEngine.playTap();
                this.switchSubjectTab('math', false, false);
                const targetMistake = mList[0];
                const q = mathEngine.nextQuestion(targetMistake);
                this.renderCurrentMathQuestion(q);
                document.getElementById('mathFeedbackBar').textContent = '🌟 双倍复习题：答对直接拿 2 倍徽章并消灭错题！';
            };
        }

        const eBtn = document.getElementById('btnRevEngNow');
        if (eBtn) {
            eBtn.onclick = () => {
                soundEngine.playTap();
                this.engSubMode = 'english_random';
                this.switchSubjectTab('english', false, false);
                const q = englishEngine.nextQuickQuestion(eList[0].wordId);
                this.renderEnglishQuizQuestion(q, true);
                document.getElementById('engFeedbackBar').textContent = '🌟 双倍生词复习：答对直接拿 2 倍徽章！';
            };
        }
    }

    // ==================== 辅助庆典、换装与交互反馈 ====================
    triggerPetHappyReaction() {
        const sp = document.getElementById('heroMainSprite');
        if (!sp) return;
        sp.classList.remove('happy-bounce');
        void sp.offsetWidth;
        sp.classList.add('happy-bounce');
    }

    celebrateLevelUp(ev) {
        soundEngine.playLevelUp();
        this.fx.spawnBurst(window.innerWidth * 0.35, window.innerHeight * 0.42, 50);
        if (ev.type === 'pet') {
            const gradMsg = ev.newlyGraduated
                ? `<br/><strong style="color:#e67e22;">🎓 恭喜满级毕业！已颁发毕业证书并获赠 1 张 🎟️ 盲盒券，现在可以去【配对开店】当大老板啦！</strong>`
                : '';
            this.showQuickModal(
                '🎉 萌宠升级啦！',
                `<div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px;">
                    <img src="${ev.petMeta.img}" style="width:130px; height:130px; object-fit:contain;" />
                    <div style="font-size:18px; font-weight:900; color:#4f359b;">【${ev.petMeta.name}】升到了 Lv.${ev.newLevel}！</div>
                    <p style="font-size:13px; color:#5e547d;">称号进阶：${ev.petMeta.stageTitles[ev.newLevel - 1]}${gradMsg}</p>
                </div>`
            );
        } else {
            const gradMsg = ev.newlyGraduated
                ? `<br/><strong style="color:#e67e22;">🏛️ 恭喜建成 Lv.5 皇家旗舰大厦！已载入毕业记录并获赠 1 张 🎟️ 盲盒券！</strong>`
                : '';
            this.showQuickModal(
                '🏗️ 店铺扩建升级啦！',
                `<div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px;">
                    <img src="${ev.newLevel >= 4 ? ev.shopMeta.imgLv5 : ev.shopMeta.imgLv1}" style="width:140px; height:140px; object-fit:contain;" />
                    <div style="font-size:18px; font-weight:900; color:#4f359b;">【${ev.shopMeta.name}】升到了 Lv.${ev.newLevel}！</div>
                    <p style="font-size:13px; color:#5e547d;">外观升级为：${ev.shopMeta.stageNames[ev.newLevel - 1]}${gradMsg}</p>
                </div>`
            );
        }
    }

    celebrateDailyCapReached(cap) {
        soundEngine.playLevelUp();
        this.fx.spawnBurst(window.innerWidth * 0.5, window.innerHeight * 0.4, 45);
        this.showQuickModal(
            '🏆 今日徽章能量已集满！',
            `<div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px;">
                <div style="font-size:48px;">🌟🐰🐸🌟</div>
                <div style="font-size:17px; font-weight:900; color:#4f359b;">太棒啦！今天已经赚满 ${cap} / ${cap} 枚徽章！</div>
                <p style="font-size:13px; color:#5e547d; line-height:1.6;">
                    快用徽章去喂萌宠或扩建店铺吧！小动物们吃饱后要睡香香消化啦～<br/>
                    <strong>明天零点后又能继续赚徽章升级！</strong>（今天依然可以自由练习算术和背单词巩固熟练度哦）
                </p>
            </div>`
        );
    }

    openDressupModal() {
        const u = profileManager.getActiveUser();
        const curAcc = u.pets[u.activePetId]?.accessory || 'none';
        let html = `<p style="font-size:13px; color:#655b88;">为你的萌宠佩戴可爱头饰（新头饰可通过【🎁 惊喜盲盒】抽取哦）：</p>`;
        html += `<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px;">`;
        PET_ACCESSORIES.forEach(acc => {
            const owned = u.ownedAccessories.includes(acc.id);
            const active = curAcc === acc.id;
            html += `
                <button type="button" class="acc-pick-btn" data-acc="${acc.id}" ${owned ? '' : 'disabled'} style="padding:10px; border-radius:14px; border:2px solid ${active ? '#7c5cfc' : '#e4dcf7'}; background:${owned ? '#faf7ff' : '#f3f3f3'}; opacity:${owned ? 1 : 0.55};">
                    <div style="font-size:28px;">${acc.icon}</div>
                    <div style="font-size:12px; font-weight:800; margin-top:4px;">${acc.name}</div>
                    <div style="font-size:10px; color:#7c5cfc;">${active ? '佩戴中' : (owned ? '点击佩戴' : '盲盒限定')}</div>
                </button>
            `;
        });
        html += `</div>`;
        this.showQuickModal('🎀 萌宠百变衣帽间', html);

        document.querySelectorAll('.acc-pick-btn').forEach(btn => {
            btn.onclick = () => {
                profileManager.equipAccessory(btn.dataset.acc);
                soundEngine.playFeed();
                this.closeModal('modalQuickPopup');
                this.renderAll();
            };
        });
    }

    // ==================== 个人档案与数英难度定制弹窗 ====================
    openProfileModal() {
        const u = profileManager.getActiveUser();
        this.loadUserIntoDraft(u);
        document.getElementById('modalProfile').style.display = 'grid';
    }

    loadUserIntoDraft(u) {
        this.editingUserId = u.id;
        this.draftAvatar = u.avatar || '🐰';
        this.draftDailyCap = u.dailyBadgeCap || DEFAULT_DAILY_BADGE_CAP;
        const mc = u.mathConfig || {};
        this.draftMathMode = mc.mode || 'custom';
        this.draftMathPreset = mc.presetGrade || 'grade1_2';
        this.draftMathRange = mc.range || 20;
        this.draftMathMul = mc.maxMultiplier || 9;
        this.draftMathTypes = sanitizeMathEnabledTypes(mc.enabledTypes);

        const ec = u.englishConfig || {};
        this.draftEngLevel = ec.level || 'mixed';
        this.draftEngPack = ec.packId || 'all';
        this.draftEngTypes = sanitizeEnglishEnabledTypes(ec.enabledTypes);

        document.getElementById('inputKidName').value = u.name;
        document.getElementById('btnDeleteKid').style.display = profileManager.getUsers().length > 1 ? 'inline-block' : 'none';

        const ops = mc.operations || ['add', 'sub'];
        document.getElementById('chkAdd').checked = ops.includes('add');
        document.getElementById('chkSub').checked = ops.includes('sub');
        document.getElementById('chkMul').checked = ops.includes('mul');
        document.getElementById('chkDiv').checked = ops.includes('div');

        document.getElementById('chkCarry').checked = mc.allowCarryBorrow !== false;
        document.getElementById('chkFill').checked = mc.allowFillBlank !== false;
        document.getElementById('chkWordProb').checked = mc.includeWordProblems !== false;
        document.getElementById('chkDataChart').checked = mc.includeDataCharts !== false;

        this.renderProfileModalControls();
    }

    renderProfileModalControls() {
        // 1. 孩子切换胶囊
        const chips = document.getElementById('modalKidsChips');
        chips.innerHTML = '';
        profileManager.getUsers().forEach(kid => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `kid-chip-btn ${kid.id === this.editingUserId ? 'active' : ''}`;
            b.textContent = `${kid.avatar} ${kid.name} (🏅${kid.badges})`;
            b.onclick = () => {
                soundEngine.playTap();
                profileManager.setActiveUser(kid.id);
                this.syncEnginesWithActiveUser();
                this.loadUserIntoDraft(kid);
                this.renderAll();
                this.switchSubjectTab(this.activeSubject, false, false);
            };
            chips.appendChild(b);
        });

        // 2. 头像选择
        const avGrid = document.getElementById('modalAvatarGrid');
        avGrid.innerHTML = '';
        AVATAR_LIST.forEach(av => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `av-pick-btn ${this.draftAvatar === av ? 'selected' : ''}`;
            b.textContent = av;
            b.onclick = () => {
                this.draftAvatar = av;
                this.renderProfileModalControls();
            };
            avGrid.appendChild(b);
        });

        // 2.5 每日徽章获取上限选择胶囊
        const capGrid = document.getElementById('dailyCapPills');
        if (capGrid) {
            capGrid.innerHTML = '';
            DAILY_BADGE_CAP_OPTIONS.forEach(c => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = `radio-pill-btn ${this.draftDailyCap === c ? 'active' : ''}`;
                b.textContent = c === 30 ? `${c}枚/天(推荐)` : `${c}枚/天`;
                b.onclick = () => {
                    this.draftDailyCap = c;
                    this.renderProfileModalControls();
                };
                capGrid.appendChild(b);
            });
        }

        // 3. 数学自定义 vs 预设选项卡
        document.getElementById('btnMathTabCustom').classList.toggle('active', this.draftMathMode === 'custom');
        document.getElementById('btnMathTabPreset').classList.toggle('active', this.draftMathMode === 'preset');
        document.getElementById('mathCustomPane').style.display = this.draftMathMode === 'custom' ? 'block' : 'none';
        document.getElementById('mathPresetPane').style.display = this.draftMathMode === 'preset' ? 'block' : 'none';

        const rangePills = document.getElementById('mathRangePills');
        rangePills.innerHTML = '';
        [10, 20, 50, 100, 1000].forEach(r => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `radio-pill-btn ${this.draftMathRange === r ? 'active' : ''}`;
            b.textContent = `${r}以内`;
            b.onclick = () => {
                this.draftMathRange = r;
                this.renderProfileModalControls();
            };
            rangePills.appendChild(b);
        });

        const mulPills = document.getElementById('mathMulPills');
        mulPills.innerHTML = '';
        [5, 9, 12].forEach(m => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `radio-pill-btn ${this.draftMathMul === m ? 'active' : ''}`;
            b.textContent = `${m}以内乘除`;
            b.onclick = () => {
                this.draftMathMul = m;
                this.renderProfileModalControls();
            };
            mulPills.appendChild(b);
        });

        const presets = [
            { id: 'grade1_2', title: '🌱 1~2年级 萌芽学徒', desc: '20以内进位凑十、退位破十、逆向填空与基础应用题' },
            { id: 'grade3_4', title: '⚡ 3~4年级 算术法师', desc: '九九乘法口诀、表内整除、百以内加减与乘除应用题' },
            { id: 'grade5_6', title: '🔥 5~6年级 数理宗师', desc: '四则混合优先级、括号巧算、平均数图表与余数进一应用题' }
        ];
        const pStack = document.getElementById('mathPresetCards');
        pStack.innerHTML = '';
        presets.forEach(p => {
            const d = document.createElement('div');
            d.className = `preset-item-card ${this.draftMathPreset === p.id ? 'active' : ''}`;
            d.innerHTML = `<strong>${p.title}</strong><small>${p.desc}</small>`;
            d.onclick = () => {
                this.draftMathPreset = p.id;
                this.renderProfileModalControls();
            };
            pStack.appendChild(d);
        });

        renderEnabledTypesSelector(
            document.getElementById('petMathTypesBox'),
            MATH_QUESTION_TYPES,
            this.draftMathTypes,
            (next) => { this.draftMathTypes = next; },
            ['calc', 'compare', 'bond_pop', 'sequence_train', 'clock_money']
        );

        // 4. 英语梯度设置 + 8题型多选
        const engLevels = [
            { id: 'level1_listen', title: '🌱 启蒙级：听音选图 + 消消乐', desc: '听纯正美音选可爱图案与泡泡配对，零识字门槛轻松开口' },
            { id: 'level2_match', title: '⚡ 初阶级：图词配对 + 自然拼读 + 情景句', desc: '看萌图辨认彩色音节积木与短句填空，适合 1~3 年级' },
            { id: 'level3_spell', title: '🔥 进阶级：谜语问答 + 连词成句 + 拼写', desc: '英语小侦探猜谜、小火车排句与完整拼写，综合进阶' },
            { id: 'mixed', title: '🌈 全能混合：8大趣味互动题型自由轮换', desc: '听说、消消乐、拼读积木、猜谜、连词成句全面提升语感' }
        ];
        const eStack = document.getElementById('engLevelCards');
        eStack.innerHTML = '';
        engLevels.forEach(el => {
            const d = document.createElement('div');
            d.className = `preset-item-card ${this.draftEngLevel === el.id ? 'active' : ''}`;
            d.innerHTML = `<strong>${el.title}</strong><small>${el.desc}</small>`;
            d.onclick = () => {
                this.draftEngLevel = el.id;
                const lvMeta = ENGLISH_LEVELS[el.id];
                if (lvMeta && Array.isArray(lvMeta.presetTypes)) {
                    this.draftEngTypes = [...lvMeta.presetTypes];
                }
                this.renderProfileModalControls();
            };
            eStack.appendChild(d);
        });

        renderEnabledTypesSelector(
            document.getElementById('petEnTypesBox'),
            ENGLISH_QUESTION_TYPES,
            this.draftEngTypes,
            (next) => { this.draftEngTypes = next; },
            ['listen_pic', 'match_word', 'bubble_pair', 'phonics_chunks']
        );

        const ePackRow = document.getElementById('engDefaultPackPills');
        ePackRow.innerHTML = '';
        [{ id: 'all', name: `🌟 全部20主题·${ALL_WORDS.length}词` }, ...WORD_PACKS.map(p => ({ id: p.id, name: `${p.icon}${p.name}` }))].forEach(pk => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `radio-pill-btn ${this.draftEngPack === pk.id ? 'active' : ''}`;
            b.textContent = pk.name;
            b.onclick = () => {
                this.draftEngPack = pk.id;
                this.renderProfileModalControls();
            };
            ePackRow.appendChild(b);
        });
    }

    saveProfileModal() {
        const cleanMathTypes = sanitizeMathEnabledTypes(this.draftMathTypes);
        const cleanEngTypes = sanitizeEnglishEnabledTypes(this.draftEngTypes);

        const ops = [];
        if (document.getElementById('chkAdd').checked) ops.push('add');
        if (document.getElementById('chkSub').checked) ops.push('sub');
        if (document.getElementById('chkMul').checked) ops.push('mul');
        if (document.getElementById('chkDiv').checked) ops.push('div');
        if (ops.length === 0) ops.push('add');

        const mathConfig = {
            mode: this.draftMathMode,
            presetGrade: this.draftMathPreset,
            operations: ops,
            range: this.draftMathRange,
            maxMultiplier: this.draftMathMul,
            allowCarryBorrow: document.getElementById('chkCarry').checked,
            allowFillBlank: document.getElementById('chkFill').checked,
            includeWordProblems: cleanMathTypes.includes('word') && document.getElementById('chkWordProb').checked,
            includeDataCharts: cleanMathTypes.includes('data') && document.getElementById('chkDataChart').checked,
            enabledTypes: cleanMathTypes
        };

        const prevEc = profileManager.getUser(this.editingUserId)?.englishConfig || {};
        const englishConfig = {
            ...prevEc,
            level: this.draftEngLevel,
            packId: this.draftEngPack,
            enabledTypes: cleanEngTypes
        };

        profileManager.updateUserSettings(this.editingUserId, {
            name: document.getElementById('inputKidName').value,
            avatar: this.draftAvatar,
            dailyBadgeCap: this.draftDailyCap,
            mathConfig,
            englishConfig
        });

        soundEngine.playCorrect();
        this.syncEnginesWithActiveUser();
        this.renderAll();
        this.switchSubjectTab(this.activeSubject, false, true);
        this.closeModal('modalProfile');
    }

    // ==================== 单词星级收集册 & 错题本弹窗 ====================
    openReportModal() {
        const u = profileManager.getActiveUser();
        document.getElementById('reportKidName').textContent = u.name;

        const masteredCount = Object.values(u.wordMastery || {}).filter(v => v >= 1).length;
        document.getElementById('reportStatsStrip').innerHTML = `
            <div class="rep-stat-box"><strong>${u.stats?.totalMathCorrect || 0}</strong><span>数学答对总数</span></div>
            <div class="rep-stat-box"><strong>${u.stats?.totalEnglishCorrect || 0}</strong><span>英语闯关答对</span></div>
            <div class="rep-stat-box"><strong>${masteredCount} / ${ALL_WORDS.length}</strong><span>点亮英语单词</span></div>
            <div class="rep-stat-box"><strong>🔥 x${u.stats?.bestCombo || 0}</strong><span>最高连对纪录</span></div>
        `;

        const wall = document.getElementById('reportVocabWall');
        wall.innerHTML = '';
        ALL_WORDS.forEach(w => {
            const stars = u.wordMastery?.[w.id] || 0;
            const starLabel = stars === 0 ? '🌱 未背' : (stars === 1 ? '⭐ 眼熟' : (stars === 2 ? '⭐⭐ 掌握' : '👑 牢记'));
            const card = document.createElement('div');
            card.className = `vocab-mini-card ${stars >= 2 ? 'mastered' : ''}`;
            card.innerHTML = `
                <div style="font-size:28px;">${w.icon}</div>
                <strong style="font-size:15px; color:#2b2147;">${w.word}</strong>
                <span style="font-size:12px; color:#6c628c;">${w.zh}</span>
                <span style="font-size:11px; font-weight:800; color:#d97706;">${starLabel} 🔊</span>
            `;
            card.onclick = () => soundEngine.speakEnglish(w.word, false);
            wall.appendChild(card);
        });

        const mBox = document.getElementById('reportMistakesList');
        mBox.innerHTML = '';
        if ((u.mathMistakes?.length || 0) === 0 && (u.englishMistakes?.length || 0) === 0) {
            mBox.innerHTML = `<div class="record-row-item"><div class="rec-left-title">🎉 太优秀啦！当前没有任何遗留错题或生词！</div></div>`;
        } else {
            (u.mathMistakes || []).forEach(m => {
                const row = document.createElement('div');
                row.className = 'record-row-item';
                row.innerHTML = `
                    <div>
                        <div class="rec-left-title">🔢 ${m.display || m.readText || m.formula}</div>
                        <div class="rec-left-meta">正确答案：${m.answer} ｜ 当时误填：${m.userAns}</div>
                    </div>
                    <span class="rec-delta-pill spend">待复习</span>
                `;
                mBox.appendChild(row);
            });
            (u.englishMistakes || []).forEach(e => {
                const row = document.createElement('div');
                row.className = 'record-row-item';
                row.innerHTML = `
                    <div>
                        <div class="rec-left-title">🔤 ${e.icon} ${e.word} (${e.zh})</div>
                        <div class="rec-left-meta">点击右侧【双倍复习】即可挑战清零</div>
                    </div>
                    <span class="rec-delta-pill spend">待复习</span>
                `;
                row.onclick = () => soundEngine.speakEnglish(e.word, false);
                mBox.appendChild(row);
            });
        }

        document.getElementById('modalReport').style.display = 'grid';
    }

    // ==================== 视图/页签切换与通用小弹窗 ====================
    switchWorldView(viewName) {
        this.activeWorldView = viewName;
        document.querySelectorAll('.stage-nav-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.view === viewName);
        });
        document.querySelectorAll('.world-view').forEach(v => {
            v.classList.toggle('active', v.id === `view-${viewName}`);
        });
        this.renderAll();
    }

    switchSubjectTab(subj, autoSpeak = true, forceNewQuestion = false) {
        this.activeSubject = subj;
        document.querySelectorAll('.subj-tab').forEach(b => {
            b.classList.toggle('active', b.dataset.subj === subj);
        });

        if (subj === 'grand_random') {
            this.drawNextGrandRandomQuestion(autoSpeak);
            return;
        }

        document.getElementById('panelMath').style.display = subj === 'math' ? 'flex' : 'none';
        document.getElementById('panelEnglish').style.display = (subj === 'english' || subj === 'course') ? 'flex' : 'none';
        document.getElementById('panelReview').style.display = subj === 'review' ? 'flex' : 'none';
        this.renderSubModePills();

        if (subj === 'math') {
            mathEngine.setSubMode(this.mathSubMode);
            if (forceNewQuestion || !mathEngine.currentQuestion) {
                mathEngine.nextQuestion();
            }
            this.renderCurrentMathQuestion();
        } else if (subj === 'course') {
            englishEngine.config.courseLessonId = this.activeCourseLessonId;
            this.renderWordPackStrip();
            if (this.courseSubMode === 'course_readcard') {
                this.renderCourseReadCardInPet();
            } else {
                this.renderEnglishQuizQuestion(englishEngine.nextQuickQuestion(null, this.courseSubMode), autoSpeak);
            }
        } else if (subj === 'english') {
            englishEngine.config.packId = this.activeWordPackId;
            this.renderWordPackStrip();
            if (this.engSubMode === 'vocab_camp') {
                if (forceNewQuestion || !englishEngine.studySession) {
                    this.initVocabCampForPack(this.activeWordPackId, autoSpeak);
                } else {
                    this.renderVocabFlashcard(autoSpeak);
                }
            } else {
                const forcedType = ALL_ENGLISH_TYPE_IDS.includes(this.engSubMode) ? this.engSubMode : null;
                if (forceNewQuestion || !englishEngine.currentQuiz || (forcedType && englishEngine.currentQuiz.mode !== forcedType)) {
                    this.renderEnglishQuizQuestion(englishEngine.nextQuickQuestion(null, forcedType), autoSpeak);
                } else {
                    this.renderEnglishQuizQuestion(englishEngine.currentQuiz, autoSpeak);
                }
            }
        } else if (subj === 'review') {
            this.renderReviewPanel();
        }
    }

    showQuickModal(title, bodyHtml) {
        document.getElementById('quickPopupTitle').textContent = title;
        document.getElementById('quickPopupBody').innerHTML = bodyHtml;
        document.getElementById('modalQuickPopup').style.display = 'grid';
    }

    showQuickToast(title, messageHtml) {
        this.showQuickModal(title, `<p style="font-size:15px; line-height:1.6; color:#3a2f5c; text-align:center; padding:8px 0;">${messageHtml}</p>`);
    }

    closeModal(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    }

    // ==================== 事件绑定总入口 ====================
    bindGlobalEvents() {
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) {
                profileManager.data = profileManager.load();
                profileManager.ensureIntegrity();
                this.syncEnginesWithActiveUser();
                this.renderAll();
                this.switchSubjectTab(this.activeSubject, false, true);
            }
        });

        // 顶部四大世界视图切换
        document.querySelectorAll('.stage-nav-btn').forEach(btn => {
            btn.onclick = () => {
                soundEngine.playTap();
                this.switchWorldView(btn.dataset.view);
            };
        });

        // 点击顶部「今日上限进度」胶囊查看规则或跳转调整
        const dailyCapBtn = document.getElementById('hudDailyCapBox');
        if (dailyCapBtn) {
            dailyCapBtn.onclick = () => {
                soundEngine.playTap();
                const u = profileManager.getActiveUser();
                const d = profileManager.getDailyStatus(u);
                this.showQuickModal(
                    '⏳ 每日成长与徽章规则',
                    `<div style="display:flex; flex-direction:column; gap:10px; font-size:13px; color:#423666; line-height:1.6;">
                        <div style="background:#f3f0ff; padding:10px 12px; border-radius:12px; font-weight:800;">
                            📅 今日已获徽章：<strong style="color:#6a38d9; font-size:16px;">${d.earned} / ${d.cap} 🏅</strong>
                            &nbsp;｜&nbsp; 当前集星：<strong style="color:#d97706;">⭐ ${d.starProgress} / 3</strong>
                        </div>
                        <div>• <strong>集星兑章</strong>：口算与英语单题每答对 3 题（集满 3 颗学习星）合成 <strong>+1 枚徽章</strong>；乘除应用题与数据图每题 <strong>+1 枚</strong>；错题本攻克每题 <strong>+2 枚</strong>。</div>
                        <div>• <strong>防厌倦每日上限</strong>：每天最多赚取 <strong>${d.cap} 枚徽章</strong>（约需坚持打卡 5～6 天可将一只萌宠养至 Lv.5 毕业），细水长流更有期待感！</div>
                        <button type="button" id="btnAdjustCapJump" class="btn-purple-wide" style="width:100%; margin-top:4px;">⚙️ 家长调整每日徽章上限</button>
                    </div>`
                );
                const jumpBtn = document.getElementById('btnAdjustCapJump');
                if (jumpBtn) {
                    jumpBtn.onclick = () => {
                        this.closeModal('modalQuickPopup');
                        this.openProfileModal();
                    };
                }
            };
        }

        // 全屏与静音按钮
        document.getElementById('btnFullscreen').onclick = () => {
            soundEngine.playTap();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.().catch(() => {});
            } else {
                document.exitFullscreen?.().catch(() => {});
            }
        };

        document.getElementById('btnMute').onclick = () => {
            const muted = soundEngine.toggleMute();
            document.getElementById('btnMute').textContent = muted ? '🔇' : '🔊';
        };

        // 主页养宠/看店铺小胶囊切换
        document.getElementById('btnHeroModePet').onclick = () => {
            soundEngine.playTap();
            const u = profileManager.getActiveUser();
            u.stageMode = 'pet';
            profileManager.save();
            this.renderHeroHomeView();
        };
        document.getElementById('btnHeroModeShop').onclick = () => {
            soundEngine.playTap();
            const u = profileManager.getActiveUser();
            u.stageMode = 'shop';
            profileManager.save();
            this.renderHeroHomeView();
        };

        // 主页3D萌宠点击互动说英语
        document.getElementById('heroDioramaStage').onclick = (e) => {
            const u = profileManager.getActiveUser();
            const petMeta = getPetById(u.stageMode === 'shop' ? (u.shops[u.activeShopId]?.managerPetId || u.activePetId) : u.activePetId);
            soundEngine.playFeed();
            soundEngine.speakEnglish(petMeta.enGreeting, false);
            this.triggerPetHappyReaction();
            this.fx.spawnBurst(e.clientX || window.innerWidth * 0.35, e.clientY || window.innerHeight * 0.4, 16);
            document.getElementById('heroSpeechBubble').textContent = `💬 "${petMeta.enGreeting}"`;
        };

        // 主页投喂美食 / 扩建店铺主按钮
        document.getElementById('btnPrimaryNurture').onclick = () => {
            const u = profileManager.getActiveUser();
            if (u.stageMode === 'pet') {
                const pState = u.pets[u.activePetId];
                if (pState && pState.level >= 5) {
                    soundEngine.playTap();
                    this.switchWorldView('selector');
                    document.getElementById('btnSubTabShop').click();
                    return;
                }
                const res = profileManager.feedActivePet();
                if (!res.ok) {
                    soundEngine.playWrong();
                    this.showQuickToast('🥕 投喂提示', res.msg);
                    return;
                }
                soundEngine.playFeed();
                this.triggerPetHappyReaction();
                this.fx.spawnBurst(window.innerWidth * 0.36, window.innerHeight * 0.42, 24);
                this.renderAll();
                if (res.levelUpEvent) this.celebrateLevelUp(res.levelUpEvent);
            } else {
                const sState = u.shops[u.activeShopId];
                if (sState && sState.level >= 5) {
                    soundEngine.playTap();
                    this.switchWorldView('town');
                    return;
                }
                const res = profileManager.upgradeActiveShop();
                if (!res.ok) {
                    soundEngine.playWrong();
                    this.showQuickToast('🏗️ 扩建提示', res.msg);
                    return;
                }
                soundEngine.playFeed();
                this.triggerPetHappyReaction();
                this.fx.spawnBurst(window.innerWidth * 0.36, window.innerHeight * 0.42, 24);
                this.renderAll();
                if (res.levelUpEvent) this.celebrateLevelUp(res.levelUpEvent);
            }
        };

        document.getElementById('btnQuickChange').onclick = () => {
            soundEngine.playTap();
            this.switchWorldView('selector');
        };
        document.getElementById('btnOpenDressup').onclick = () => {
            soundEngine.playTap();
            this.openDressupModal();
        };
        document.getElementById('btnGoTownBanner').onclick = () => {
            soundEngine.playTap();
            this.switchWorldView('town');
        };
        const btnSibHome = document.getElementById('btnSiblingVisitorHome');
        if (btnSibHome) {
            btnSibHome.onclick = (e) => this.handleSiblingVisitTap(e);
        }
        const btnSibTown = document.getElementById('townSiblingVisitor');
        if (btnSibTown) {
            btnSibTown.onclick = (e) => this.handleSiblingVisitTap(e);
        }

        // 主页三大成长账本切换 (得分记录 | 徽章流水 | 毕业记录)
        document.querySelectorAll('.rec-tab-btn').forEach(btn => {
            btn.onclick = () => {
                soundEngine.playTap();
                this.activeHomeRecTab = btn.dataset.rectab;
                document.querySelectorAll('.rec-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
                this.renderHomeRecordsList();
            };
        });

        // 视图 2：选宠 | 开店 子面板切换
        document.getElementById('btnSubTabPet').onclick = () => {
            soundEngine.playTap();
            document.getElementById('btnSubTabPet').classList.add('active');
            document.getElementById('btnSubTabShop').classList.remove('active');
            document.getElementById('subPanelSelectPet').style.display = 'flex';
            document.getElementById('subPanelPairShop').style.display = 'none';
        };
        document.getElementById('btnSubTabShop').onclick = () => {
            soundEngine.playTap();
            document.getElementById('btnSubTabShop').classList.add('active');
            document.getElementById('btnSubTabPet').classList.remove('active');
            document.getElementById('subPanelSelectPet').style.display = 'none';
            document.getElementById('subPanelPairShop').style.display = 'flex';
            this.renderSelectorView();
        };

        document.getElementById('btnConfirmShopPair').onclick = () => {
            const res = profileManager.pairShopAndManager(this.pairDraftShopId, this.pairDraftPetId);
            if (!res.ok) {
                soundEngine.playWrong();
                this.showQuickToast('提示', res.msg);
                return;
            }
            soundEngine.playLevelUp();
            this.renderAll();
            this.switchWorldView('home');
        };

        document.getElementById('btnPairAndPickPlot').onclick = () => {
            const res = profileManager.pairShopAndManager(this.pairDraftShopId, this.pairDraftPetId);
            if (!res.ok) return;
            soundEngine.playTap();
            this.townPendingPlacement = {
                label: `${res.petMeta.name}的${res.shopMeta.name}`,
                payload: { type: 'shop', itemId: this.pairDraftShopId, managerPetId: this.pairDraftPetId }
            };
            this.switchWorldView('town');
        };

        // 视图 3：小镇底部按钮
        document.getElementById('btnTownPlaceActiveShop').onclick = () => {
            soundEngine.playTap();
            const u = profileManager.getActiveUser();
            const s = getShopById(u.activeShopId);
            const p = getPetById(u.shops[u.activeShopId]?.managerPetId || u.activePetId);
            this.townPendingPlacement = {
                label: `${p.name}的${s.name}`,
                payload: { type: 'shop', itemId: u.activeShopId, managerPetId: p.id }
            };
            this.renderTownMapView();
        };

        document.getElementById('btnTownDecorMode').onclick = () => {
            soundEngine.playTap();
            this.openTownPlotMenu(TOWN_PLOTS[4], profileManager.getActiveUser().townPlacements?.plot_5);
        };

        // 视图 4：惊喜盲盒扭蛋抽取
        document.getElementById('btnPullGacha').onclick = () => {
            const dome = document.getElementById('gachaDome');
            const res = profileManager.drawBlindBox();
            if (!res.ok) {
                soundEngine.playWrong();
                this.showQuickToast('🎁 盲盒扭蛋提示', res.msg);
                return;
            }
            soundEngine.playGachaOpen();
            dome.classList.remove('shaking');
            void dome.offsetWidth;
            dome.classList.add('shaking');

            setTimeout(() => {
                this.fx.spawnBurst(window.innerWidth * 0.35, window.innerHeight * 0.45, 50);
                this.renderAll();
                const pr = res.prize;
                const visual = pr.img
                    ? `<img src="${pr.img}" style="width:140px; height:140px; object-fit:contain;" />`
                    : `<div style="font-size:68px;">${pr.icon}</div>`;
                this.showQuickModal(
                    '🎊 惊喜盲盒开箱！',
                    `<div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px;">
                        ${visual}
                        <div style="font-size:17px; font-weight:900; color:#c22575;">${pr.title}</div>
                    </div>`
                );
            }, 520);
        };

        // 右侧五大主入口切换 (🎲 随机 | 🔢 数学 | 🔤 英语 | 🎓 英语课 | 🌟 复习)
        document.querySelectorAll('.subj-tab').forEach(btn => {
            btn.onclick = () => {
                soundEngine.playTap();
                const subj = btn.dataset.subj;
                if (subj === 'grand_random') {
                    profileManager.setPreferredSmartMode('grand_random');
                } else if (subj === 'math') {
                    profileManager.setPreferredSmartMode(this.mathSubMode === 'random' ? 'math_random' : this.mathSubMode);
                } else if (subj === 'english') {
                    if (ALL_COURSE_SUB_IDS.includes(this.engSubMode) || this.engSubMode === 'course_special') {
                        this.engSubMode = 'english_random';
                    }
                    profileManager.setPreferredSmartMode(this.engSubMode);
                } else if (subj === 'course') {
                    profileManager.setPreferredSmartMode(this.courseSubMode || 'course_all');
                }
                this.switchSubjectTab(subj, true, subj === 'course');
            };
        });

        document.getElementById('btnReadMathAloud').onclick = () => {
            const q = mathEngine.currentQuestion;
            if (q && q.readText) soundEngine.speakChinese(q.readText);
        };

        document.getElementById('btnShowMathVisual').onclick = () => {
            soundEngine.playTap();
            const box = document.getElementById('mathVisualTipBox');
            box.style.display = box.style.display === 'none' ? 'block' : 'none';
        };

        // 果冻数字键盘点击与物理键盘支持
        document.getElementById('mathKeypad').onclick = (e) => {
            const btn = e.target.closest('.jelly-key');
            if (!btn) return;
            soundEngine.playTap();
            const k = btn.dataset.k;
            if (k === 'clear') {
                this.mathInputStr = '';
            } else if (k === 'back') {
                this.mathInputStr = this.mathInputStr.slice(0, -1);
            } else if (this.mathInputStr.length < 5) {
                this.mathInputStr += k;
            }
            this.updateMathInputView();
        };

        document.getElementById('btnSubmitMath').onclick = () => this.handleMathSubmit();

        window.addEventListener('keydown', (e) => {
            if (document.getElementById('modalProfile').style.display !== 'none') return;
            if (!this._numericKeypadActive) return;
            if (document.getElementById('panelMath').style.display === 'none') return;
            if (e.key >= '0' && e.key <= '9') {
                if (this.mathInputStr.length < 5) {
                    soundEngine.playTap();
                    this.mathInputStr += e.key;
                    this.updateMathInputView();
                }
            } else if (e.key === 'Backspace') {
                this.mathInputStr = this.mathInputStr.slice(0, -1);
                this.updateMathInputView();
            } else if (e.key === 'Enter') {
                this.handleMathSubmit();
            }
        });

        // 背单词闪卡按钮
        document.getElementById('btnFcSpeakNormal').onclick = () => {
            const sess = englishEngine.studySession;
            if (sess) soundEngine.speakEnglish(sess.words[sess.studyIdx].word, false);
        };
        document.getElementById('btnFcSpeakSlow').onclick = () => {
            const sess = englishEngine.studySession;
            if (sess) {
                const w = sess.words[sess.studyIdx];
                soundEngine.speakEnglish(`${w.word}. ${w.sentence}`, true);
            }
        };
        document.getElementById('btnFcPrev').onclick = () => {
            const sess = englishEngine.studySession;
            if (sess && sess.studyIdx > 0) {
                soundEngine.playTap();
                sess.studyIdx -= 1;
                this.renderVocabFlashcard(true);
            }
        };
        document.getElementById('btnFcNext').onclick = () => {
            const sess = englishEngine.studySession;
            if (!sess) return;
            soundEngine.playTap();
            if (sess.studyIdx < sess.words.length - 1) {
                sess.studyIdx += 1;
                this.renderVocabFlashcard(true);
            } else {
                // 进入 9 题背词通关检验！
                sess.phase = 'quiz';
                sess.quizIdx = 0;
                this.renderEnglishQuizQuestion(sess.quizQueue[0], true);
            }
        };

        // 弹窗开关与保存
        document.getElementById('btnOpenProfile').onclick = () => {
            soundEngine.playTap();
            this.openProfileModal();
        };
        document.getElementById('btnQuickDiffFooter').onclick = () => {
            soundEngine.playTap();
            this.openProfileModal();
        };
        document.getElementById('btnOpenReport').onclick = () => {
            soundEngine.playTap();
            this.openReportModal();
        };

        document.querySelectorAll('.modal-close-x').forEach(btn => {
            btn.onclick = () => {
                soundEngine.playTap();
                this.closeModal(btn.dataset.close);
            };
        });

        document.getElementById('btnMathTabCustom').onclick = () => {
            this.draftMathMode = 'custom';
            this.renderProfileModalControls();
        };
        document.getElementById('btnMathTabPreset').onclick = () => {
            this.draftMathMode = 'preset';
            this.renderProfileModalControls();
        };

        document.getElementById('btnAddKid').onclick = () => {
            soundEngine.playTap();
            const newKid = profileManager.addUser({ name: '新小店长', avatar: '🐰' });
            this.syncEnginesWithActiveUser();
            this.loadUserIntoDraft(newKid);
            this.renderAll();
        };

        document.getElementById('btnDeleteKid').onclick = () => {
            const target = profileManager.getUser(this.editingUserId);
            if (!target) return;
            requireParentGate(() => {
                if (!window.confirm(`确定要删除【${target.name}】的档案吗？`)) return;
                if (profileManager.deleteUser(this.editingUserId)) {
                    soundEngine.playTap();
                    const cur = profileManager.getActiveUser();
                    this.syncEnginesWithActiveUser();
                    this.loadUserIntoDraft(cur);
                    this.renderAll();
                }
            }, { profileManager, title: '🔒 家长确认：删除小店长档案' });
        };

        document.getElementById('btnSaveProfile').onclick = () => {
            requireParentGate(() => {
                this.saveProfileModal();
            }, { profileManager, title: '🔒 家长验证：保存难度与上限设置' });
        };

        // 单词收集册 vs 错题本选项卡
        document.querySelectorAll('.rep-tab-btn').forEach(btn => {
            btn.onclick = () => {
                soundEngine.playTap();
                const isVocab = btn.dataset.reptab === 'vocab';
                document.querySelectorAll('.rep-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
                document.getElementById('reportVocabWall').style.display = isVocab ? 'grid' : 'none';
                document.getElementById('reportMistakesList').style.display = isVocab ? 'none' : 'flex';
            };
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.__petTownApp = new PetWonderTownApp();
});
