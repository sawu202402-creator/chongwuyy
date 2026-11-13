/**
 * profileManager.js - 多小朋友独立档案、电子宠物养成、开店配对、小镇沙盘、徽章账本与错题/单词本系统
 */
import {
    AVATAR_LIST,
    PETS_CATALOG,
    SHOPS_CATALOG,
    PET_ACCESSORIES,
    PET_LEVEL_MAX_EXP,
    FEED_BADGE_COST,
    FEED_EXP_GAIN,
    SHOP_LEVEL_MAX_EXP,
    SHOP_UPGRADE_BADGE_COST,
    SHOP_UPGRADE_EXP_GAIN,
    GACHA_BADGE_COST,
    TOWN_DECORS,
    getPetById,
    getShopById
} from './config.js';

const STORAGE_KEY = 'chongwuyy_pet_town_profiles_v1';

function nowTimeStr() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${mm}/${dd} ${hh}:${mi}`;
}

function createInitialPetsState() {
    const pets = {};
    PETS_CATALOG.forEach(p => {
        pets[p.id] = {
            unlocked: Boolean(p.isStarter), // 垂耳兔🐰 与 荷叶小青蛙🐸 默认免费解锁！
            level: 1,
            exp: 0,
            graduated: false,
            accessory: 'none',
            graduatedDate: null
        };
    });
    return pets;
}

function createInitialShopsState(defaultPetId = 'rabbit') {
    const shops = {};
    SHOPS_CATALOG.forEach((s, idx) => {
        shops[s.id] = {
            level: 1,
            exp: 0,
            managerPetId: idx === 0 ? defaultPetId : null,
            opened: idx === 0, // 首家阳光超市默认筹备可配对
            graduated: false,
            plotId: idx === 0 ? 'plot_5' : null
        };
    });
    return shops;
}

function createKidTemplate({ id, name, avatar, activePetId, mathRange, ops }) {
    const time = nowTimeStr();
    const petObj = getPetById(activePetId);
    return {
        id,
        name,
        avatar,
        badges: 20,         // 初始赠送 20 枚启航徽章，方便小朋友立刻体验投喂互动
        gachaTickets: 1,    // 初始赠送 1 张惊喜盲盒扭蛋券
        stageMode: 'pet',   // 'pet' (养宠模式) | 'shop' (开店经营模式)
        activePetId: activePetId || 'rabbit',
        activeShopId: 'supermarket',
        pets: createInitialPetsState(),
        shops: createInitialShopsState(activePetId || 'rabbit'),
        townPlacements: {
            plot_5: {
                type: 'shop',
                itemId: 'supermarket',
                managerPetId: activePetId || 'rabbit'
            }
        },
        ownedAccessories: ['none'],
        ownedDecors: [],
        mathConfig: {
            mode: 'custom',
            presetGrade: mathRange >= 50 ? 'grade3_4' : 'grade1_2',
            operations: ops || ['add', 'sub'],
            range: mathRange || 20,
            maxMultiplier: 9,
            allowCarryBorrow: true,
            allowFillBlank: true,
            includeWordProblems: false,
            includeDataCharts: false
        },
        englishConfig: {
            level: 'level2_match',
            packId: 'all'
        },
        wordMastery: {},
        scoreRecords: [
            {
                id: 'init_1',
                timeStr: time,
                title: `🎉 欢迎小店长入驻！领养萌宠【${petObj.name}】启航礼包`,
                subjectTag: '新手启航',
                deltaBadges: 20
            }
        ],
        badgeLedger: [
            {
                id: 'led_1',
                timeStr: time,
                reason: '🎁 新手小店长启航奖章礼包',
                delta: 20,
                balanceAfter: 20
            }
        ],
        graduations: [],
        mathMistakes: [],
        englishMistakes: [],
        stats: {
            totalMathCorrect: 0,
            totalEnglishCorrect: 0,
            totalWordsMastered: 0,
            bestCombo: 0
        }
    };
}

const DEFAULT_DATA = {
    activeUserId: 'child_xiaowandou',
    users: [
        createKidTemplate({
            id: 'child_xiaowandou',
            name: '小豌豆',
            avatar: '🐰',
            activePetId: 'rabbit',
            mathRange: 20,
            ops: ['add', 'sub', 'mul']
        }),
        createKidTemplate({
            id: 'child_chuan',
            name: '川川',
            avatar: '🐸',
            activePetId: 'frog',
            mathRange: 100,
            ops: ['add', 'sub', 'mul', 'div']
        })
    ]
};

export class UserProfileManager {
    constructor() {
        this.data = this.load();
        this.ensureIntegrity();
    }

    load() {
        try {
            if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
                        return parsed;
                    }
                }
            }
        } catch (e) {
            console.warn('[ProfileManager] 读取存档失败:', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    save() {
        try {
            if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            }
        } catch (e) {
            console.warn('[ProfileManager] 保存存档失败:', e);
        }
    }

    ensureIntegrity() {
        if (!this.data || !Array.isArray(this.data.users) || this.data.users.length === 0) {
            this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
        this.data.users.forEach(u => {
            if (u.id === 'child_lele' && u.name === '乐乐') {
                u.name = '小豌豆';
            }
            if (!u.pets) u.pets = createInitialPetsState();
            PETS_CATALOG.forEach(p => {
                if (!u.pets[p.id]) {
                    u.pets[p.id] = {
                        unlocked: Boolean(p.isStarter),
                        level: 1,
                        exp: 0,
                        graduated: false,
                        accessory: 'none',
                        graduatedDate: null
                    };
                }
            });
            if (!u.shops) u.shops = createInitialShopsState(u.activePetId);
            SHOPS_CATALOG.forEach(s => {
                if (!u.shops[s.id]) {
                    u.shops[s.id] = { level: 1, exp: 0, managerPetId: null, opened: false, graduated: false, plotId: null };
                }
            });
            if (!u.townPlacements) u.townPlacements = {};
            if (!u.wordMastery) u.wordMastery = {};
            if (!Array.isArray(u.scoreRecords)) u.scoreRecords = [];
            if (!Array.isArray(u.badgeLedger)) u.badgeLedger = [];
            if (!Array.isArray(u.graduations)) u.graduations = [];
            if (!Array.isArray(u.mathMistakes)) u.mathMistakes = [];
            if (!Array.isArray(u.englishMistakes)) u.englishMistakes = [];
            if (!Array.isArray(u.ownedAccessories)) u.ownedAccessories = ['none'];
            if (!Array.isArray(u.ownedDecors)) u.ownedDecors = [];
            if (!u.stats) u.stats = { totalMathCorrect: 0, totalEnglishCorrect: 0, totalWordsMastered: 0, bestCombo: 0 };
        });

        if (!this.data.users.some(u => u.id === this.data.activeUserId)) {
            this.data.activeUserId = this.data.users[0].id;
        }
        this.save();
    }

    getUsers() {
        return this.data.users;
    }

    getUser(id) {
        return this.data.users.find(u => u.id === id) || null;
    }

    getActiveUser() {
        return this.getUser(this.data.activeUserId) || this.data.users[0];
    }

    setActiveUser(id) {
        if (this.data.users.some(u => u.id === id)) {
            this.data.activeUserId = id;
            this.save();
        }
        return this.getActiveUser();
    }

    addUser({ name, avatar, mathConfig, englishConfig }) {
        const id = 'child_' + Date.now();
        const startPet = avatar === '🐸' ? 'frog' : 'rabbit';
        const newUser = createKidTemplate({
            id,
            name: (name || '小宝贝').trim(),
            avatar: avatar || AVATAR_LIST[0],
            activePetId: startPet,
            mathRange: mathConfig?.range || 20,
            ops: mathConfig?.operations || ['add', 'sub']
        });
        if (mathConfig) newUser.mathConfig = { ...newUser.mathConfig, ...mathConfig };
        if (englishConfig) newUser.englishConfig = { ...newUser.englishConfig, ...englishConfig };
        this.data.users.push(newUser);
        this.data.activeUserId = id;
        this.save();
        return newUser;
    }

    updateUserSettings(id, { name, avatar, mathConfig, englishConfig }) {
        const u = this.getUser(id);
        if (!u) return null;
        if (name !== undefined && name.trim()) u.name = name.trim();
        if (avatar !== undefined) u.avatar = avatar;
        if (mathConfig) u.mathConfig = { ...u.mathConfig, ...mathConfig };
        if (englishConfig) u.englishConfig = { ...u.englishConfig, ...englishConfig };
        this.save();
        return u;
    }

    deleteUser(id) {
        if (this.data.users.length <= 1) return false;
        this.data.users = this.data.users.filter(u => u.id !== id);
        if (this.data.activeUserId === id) {
            this.data.activeUserId = this.data.users[0].id;
        }
        this.save();
        return true;
    }

    // ==================== 徽章与得分账本记录 ====================
    _pushScoreRecord(user, title, subjectTag, deltaBadges) {
        user.scoreRecords.unshift({
            id: 'sr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
            timeStr: nowTimeStr(),
            title,
            subjectTag,
            deltaBadges
        });
        if (user.scoreRecords.length > 60) user.scoreRecords = user.scoreRecords.slice(0, 60);
    }

    _pushLedger(user, reason, delta) {
        user.badges = Math.max(0, (user.badges || 0) + delta);
        user.badgeLedger.unshift({
            id: 'bl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
            timeStr: nowTimeStr(),
            reason,
            delta,
            balanceAfter: user.badges
        });
        if (user.badgeLedger.length > 60) user.badgeLedger = user.badgeLedger.slice(0, 60);
    }

    // ==================== 答题/背单词获得徽章与陪伴成长 ====================
    awardLearningProgress({ title, subjectTag, badges, exp, gotTicket = false, combo = 0, isMath = true }) {
        const u = this.getActiveUser();
        if (badges > 0) {
            this._pushLedger(u, title, badges);
            this._pushScoreRecord(u, title, subjectTag, badges);
        }
        if (gotTicket) {
            u.gachaTickets = (u.gachaTickets || 0) + 1;
        }
        if (isMath) u.stats.totalMathCorrect = (u.stats.totalMathCorrect || 0) + 1;
        else u.stats.totalEnglishCorrect = (u.stats.totalEnglishCorrect || 0) + 1;
        if (combo > (u.stats.bestCombo || 0)) u.stats.bestCombo = combo;

        // 每次答对顺带给予当前舞台宠物或店铺陪伴经验！
        let levelUpEvent = null;
        if (exp > 0) {
            if (u.stageMode === 'shop') {
                levelUpEvent = this._gainShopExp(u, u.activeShopId, exp);
            } else {
                levelUpEvent = this._gainPetExp(u, u.activePetId, exp);
            }
        }
        this.save();
        return { user: u, levelUpEvent };
    }

    // ==================== 宠物养成、投喂、解锁与毕业 ====================
    _gainPetExp(user, petId, addExp) {
        const pState = user.pets[petId];
        const petMeta = getPetById(petId);
        if (!pState) return null;
        if (pState.level >= 5) {
            pState.exp = PET_LEVEL_MAX_EXP[5];
            return null;
        }

        pState.exp += addExp;
        let leveledUp = false;
        let newlyGraduated = false;

        while (pState.level < 5 && pState.exp >= PET_LEVEL_MAX_EXP[pState.level]) {
            pState.exp -= PET_LEVEL_MAX_EXP[pState.level];
            pState.level += 1;
            leveledUp = true;
            if (pState.level >= 5) {
                pState.level = 5;
                pState.exp = PET_LEVEL_MAX_EXP[5];
                if (!pState.graduated) {
                    pState.graduated = true;
                    pState.graduatedDate = nowTimeStr();
                    newlyGraduated = true;
                    user.gachaTickets = (user.gachaTickets || 0) + 1; // 毕业奖励 1 张盲盒扭蛋券！
                    user.graduations.unshift({
                        id: 'grad_pet_' + petId + '_' + Date.now(),
                        dateStr: pState.graduatedDate,
                        type: 'pet',
                        targetId: petId,
                        title: `🎓 萌宠满级毕业：【${petMeta.name}】荣升金牌店长！`,
                        img: petMeta.img,
                        icon: petMeta.emoji
                    });
                }
                break;
            }
        }

        if (leveledUp) {
            return {
                type: 'pet',
                petMeta,
                newLevel: pState.level,
                newlyGraduated
            };
        }
        return null;
    }

    feedActivePet() {
        const u = this.getActiveUser();
        const petId = u.activePetId;
        const pState = u.pets[petId];
        const petMeta = getPetById(petId);
        if (!pState) return { ok: false, msg: '未找到当前萌宠' };
        if (pState.level >= 5) {
            return { ok: false, msg: `${petMeta.name}已经 Lv.5 满级毕业啦！快去【开店】当老板或领养新萌宠吧！` };
        }
        if (u.badges < FEED_BADGE_COST) {
            return { ok: false, msg: `徽章不足 ${FEED_BADGE_COST} 枚哦～快在右侧做几道数学或英语题赚徽章吧！` };
        }

        this._pushLedger(u, `${petMeta.foodIcon} 投喂【${petMeta.name}】吃${petMeta.foodName}`, -FEED_BADGE_COST);
        const levelUpEvent = this._gainPetExp(u, petId, FEED_EXP_GAIN);
        this.save();
        return { ok: true, petMeta, pState, levelUpEvent };
    }

    selectOrUnlockPet(petId) {
        const u = this.getActiveUser();
        const petMeta = getPetById(petId);
        const pState = u.pets[petId];
        if (!pState) return { ok: false, msg: '未知宠物' };

        if (pState.unlocked) {
            u.activePetId = petId;
            u.stageMode = 'pet';
            this.save();
            return { ok: true, action: 'switched', petMeta };
        }

        if (petMeta.isBlindbox) {
            return { ok: false, msg: `【${petMeta.name}】是神秘盲盒隐藏款，请前往【🎁 盲盒屋】抽取哦！` };
        }

        if (u.badges < petMeta.unlockCost) {
            return { ok: false, msg: `领养【${petMeta.name}】需要 ${petMeta.unlockCost} 枚徽章（当前可用 ${u.badges} 枚），快去右侧闯关赚徽章吧！` };
        }

        this._pushLedger(u, `🐾 唤醒并领养新萌宠【${petMeta.name}】`, -petMeta.unlockCost);
        pState.unlocked = true;
        u.activePetId = petId;
        u.stageMode = 'pet';
        this.save();
        return { ok: true, action: 'unlocked', petMeta };
    }

    equipAccessory(accId) {
        const u = this.getActiveUser();
        if (!u.ownedAccessories.includes(accId)) return false;
        const pState = u.pets[u.activePetId];
        if (pState) {
            pState.accessory = accId;
            this.save();
            return true;
        }
        return false;
    }

    // ==================== 店铺配对经营、扩建与小镇地图落点 ====================
    _gainShopExp(user, shopId, addExp) {
        const sState = user.shops[shopId];
        const shopMeta = getShopById(shopId);
        if (!sState) return null;
        if (sState.level >= 5) {
            sState.exp = SHOP_LEVEL_MAX_EXP[5];
            return null;
        }

        sState.exp += addExp;
        let leveledUp = false;
        let newlyGraduated = false;

        while (sState.level < 5 && sState.exp >= SHOP_LEVEL_MAX_EXP[sState.level]) {
            sState.exp -= SHOP_LEVEL_MAX_EXP[sState.level];
            sState.level += 1;
            leveledUp = true;
            if (sState.level >= 5) {
                sState.level = 5;
                sState.exp = SHOP_LEVEL_MAX_EXP[5];
                if (!sState.graduated) {
                    sState.graduated = true;
                    newlyGraduated = true;
                    user.gachaTickets = (user.gachaTickets || 0) + 1;
                    const mgrPet = getPetById(sState.managerPetId || user.activePetId);
                    user.graduations.unshift({
                        id: 'grad_shop_' + shopId + '_' + Date.now(),
                        dateStr: nowTimeStr(),
                        type: 'shop',
                        targetId: shopId,
                        title: `🏛️ 旗舰名店毕业：【${mgrPet.name}的${shopMeta.name}】升至 Lv.5 豪华大厦！`,
                        img: shopMeta.imgLv5,
                        icon: shopMeta.emoji
                    });
                }
                break;
            }
        }

        if (leveledUp) {
            return {
                type: 'shop',
                shopMeta,
                newLevel: sState.level,
                newlyGraduated
            };
        }
        return null;
    }

    pairShopAndManager(shopId, petId, targetPlotId = null) {
        const u = this.getActiveUser();
        const pState = u.pets[petId];
        const sState = u.shops[shopId];
        if (!pState || !pState.unlocked) {
            return { ok: false, msg: '请先解锁这只萌宠才能担任店长哦！' };
        }
        if (!sState) return { ok: false, msg: '未找到该店铺' };

        sState.opened = true;
        sState.managerPetId = petId;
        u.activeShopId = shopId;
        u.stageMode = 'shop';

        // 如果指定了小镇地块或尚未入驻小镇，自动分配一块空草坪地块！
        let plotId = targetPlotId || sState.plotId;
        if (!plotId) {
            const occupied = Object.keys(u.townPlacements);
            const freeIndex = [5, 4, 6, 7, 1, 2, 8, 9, 10, 3, 11].map(n => `plot_${n}`).find(pid => !occupied.includes(pid));
            plotId = freeIndex || 'plot_5';
        }
        // 清理该店铺旧地块占用
        Object.keys(u.townPlacements).forEach(k => {
            const item = u.townPlacements[k];
            if (item && item.type === 'shop' && item.itemId === shopId) {
                delete u.townPlacements[k];
            }
        });
        sState.plotId = plotId;
        u.townPlacements[plotId] = {
            type: 'shop',
            itemId: shopId,
            managerPetId: petId
        };

        this.save();
        return { ok: true, shopMeta: getShopById(shopId), petMeta: getPetById(petId), plotId };
    }

    upgradeActiveShop() {
        const u = this.getActiveUser();
        const shopId = u.activeShopId;
        const sState = u.shops[shopId];
        const shopMeta = getShopById(shopId);
        if (!sState) return { ok: false, msg: '请先选择一家店铺' };
        if (sState.level >= 5) {
            return { ok: false, msg: `【${shopMeta.name}】已经升到最高级 Lv.5 皇家旗舰大厦啦！去开启下一家新店铺吧！` };
        }
        if (u.badges < SHOP_UPGRADE_BADGE_COST) {
            return { ok: false, msg: `扩建店铺需要 ${SHOP_UPGRADE_BADGE_COST} 枚徽章（当前可用 ${u.badges} 枚），快去右侧答题赚徽章吧！` };
        }

        this._pushLedger(u, `🏗️ 进货扩建【${shopMeta.name}】`, -SHOP_UPGRADE_BADGE_COST);
        const levelUpEvent = this._gainShopExp(u, shopId, SHOP_UPGRADE_EXP_GAIN);
        this.save();
        return { ok: true, shopMeta, sState, levelUpEvent };
    }

    placeOnTownPlot(plotId, placement) {
        const u = this.getActiveUser();
        if (!placement) {
            delete u.townPlacements[plotId];
            this.save();
            return { ok: true };
        }
        if (placement.type === 'shop') {
            Object.keys(u.townPlacements).forEach(k => {
                const it = u.townPlacements[k];
                if (it && it.type === 'shop' && it.itemId === placement.itemId) {
                    delete u.townPlacements[k];
                }
            });
            if (u.shops[placement.itemId]) {
                u.shops[placement.itemId].plotId = plotId;
                u.shops[placement.itemId].opened = true;
            }
        } else if (placement.type === 'decor') {
            const decorMeta = TOWN_DECORS.find(d => d.id === placement.itemId);
            if (decorMeta && !u.ownedDecors.includes(decorMeta.id)) {
                if (u.badges < decorMeta.cost) {
                    return { ok: false, msg: `添置【${decorMeta.name}】需要 ${decorMeta.cost} 枚徽章哦！` };
                }
                this._pushLedger(u, `${decorMeta.icon} 小镇添置景观【${decorMeta.name}】`, -decorMeta.cost);
                u.ownedDecors.push(decorMeta.id);
            }
        }
        u.townPlacements[plotId] = placement;
        this.save();
        return { ok: true };
    }

    // ==================== 惊喜盲盒扭蛋机 ====================
    drawBlindBox() {
        const u = this.getActiveUser();
        let usedTicket = false;
        if ((u.gachaTickets || 0) > 0) {
            u.gachaTickets -= 1;
            usedTicket = true;
        } else if (u.badges >= GACHA_BADGE_COST) {
            this._pushLedger(u, '🎁 开启神秘萌宠盲盒扭蛋', -GACHA_BADGE_COST);
        } else {
            return {
                ok: false,
                msg: `需要 1 张盲盒券或 ${GACHA_BADGE_COST} 枚徽章才能扭蛋哦！（连续答对 5 题可直接免费送盲盒券！）`
            };
        }

        // 优先检查尚未拥有的隐藏款神兽与未拥有的萌宠头饰！
        const unownedHiddenPets = PETS_CATALOG.filter(p => p.isBlindbox && !u.pets[p.id]?.unlocked);
        const unownedAccs = PET_ACCESSORIES.filter(a => a.id !== 'none' && !u.ownedAccessories.includes(a.id));

        let prize = null;
        const roll = Math.random();

        if (unownedHiddenPets.length > 0 && (roll < 0.60 || unownedAccs.length === 0)) {
            const chosenPet = unownedHiddenPets[Math.floor(Math.random() * unownedHiddenPets.length)];
            u.pets[chosenPet.id].unlocked = true;
            prize = {
                prizeType: 'pet',
                title: `🎊 欧气爆发！抽中 ${chosenPet.rarity}【${chosenPet.name}】！`,
                name: chosenPet.name,
                img: chosenPet.img,
                icon: chosenPet.emoji,
                petId: chosenPet.id
            };
        } else if (unownedAccs.length > 0) {
            const acc = unownedAccs[Math.floor(Math.random() * unownedAccs.length)];
            u.ownedAccessories.push(acc.id);
            // 自动给当前萌宠戴上尝鲜
            if (u.pets[u.activePetId]) u.pets[u.activePetId].accessory = acc.id;
            prize = {
                prizeType: 'accessory',
                title: `✨ 恭喜获得限定萌宠装扮【${acc.icon} ${acc.name}】！`,
                name: acc.name,
                icon: acc.icon,
                accId: acc.id
            };
        } else {
            // 全图鉴集齐后奖励丰厚成长果篮
            const pState = u.pets[u.activePetId];
            this._gainPetExp(u, u.activePetId, 20);
            prize = {
                prizeType: 'exp_pack',
                title: `🌈 集齐幸运大奖！当前萌宠获得 +20 超级成长能量！`,
                name: '彩虹成长大礼盒',
                icon: '🌈'
            };
        }

        this.save();
        return { ok: true, usedTicket, prize };
    }

    // ==================== 错题本与英语生词/单词本管理 ====================
    recordMathMistake(question, userAns) {
        const u = this.getActiveUser();
        const key = question.formula || question.readText;
        if (!u.mathMistakes.some(m => (m.formula || m.readText) === key)) {
            u.mathMistakes.unshift({
                ...question,
                userAns,
                dateStr: nowTimeStr()
            });
            if (u.mathMistakes.length > 40) u.mathMistakes = u.mathMistakes.slice(0, 40);
            this.save();
        }
    }

    resolveMathMistake(question) {
        const u = this.getActiveUser();
        const key = question.formula || question.readText;
        u.mathMistakes = u.mathMistakes.filter(m => (m.formula || m.readText) !== key);
        this.save();
    }

    updateWordProgress(wordObj, isCorrect, masteryBoost = 1) {
        const u = this.getActiveUser();
        if (!wordObj || !wordObj.id) return;
        const cur = u.wordMastery[wordObj.id] || 0;
        if (isCorrect) {
            u.wordMastery[wordObj.id] = Math.min(3, cur + masteryBoost);
            u.englishMistakes = u.englishMistakes.filter(w => w.wordId !== wordObj.id);
        } else {
            if (!u.englishMistakes.some(w => w.wordId === wordObj.id)) {
                u.englishMistakes.unshift({
                    wordId: wordObj.id,
                    word: wordObj.word,
                    phonics: wordObj.phonics,
                    zh: wordObj.zh,
                    icon: wordObj.icon,
                    dateStr: nowTimeStr()
                });
            }
        }
        u.stats.totalWordsMastered = Object.values(u.wordMastery).filter(v => v >= 2).length;
        this.save();
    }
}

export const profileManager = new UserProfileManager();
