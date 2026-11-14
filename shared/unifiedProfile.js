/**
 * shared/unifiedProfile.js - 三合一学习游乐园全局统一小朋友档案中心
 * 1. 默认双宝：【小豌豆 🐰】与【川川 🐸】跨游戏共用同一套难度配置、每日 30 枚徽章进度、错题本、单词星级与萌宠小镇存档
 * 2. 跨游激励闭环：在《保卫兔子与青蛙》或《植物大战僵尸》里答数学、解应用题、看数据图、背单词，同样累积今日学习星与萌宠徽章！
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
    DEFAULT_DAILY_BADGE_CAP,
    DAILY_TICKET_CAP,
    TOWN_DECORS,
    getPetById,
    getShopById
} from '../pet/js/config.js';
import { ALL_MATH_TYPE_IDS } from './mathEngine.js';
import { ALL_ENGLISH_TYPE_IDS, ALL_COURSE_SUB_IDS } from './englishEngine.js';

export const STORAGE_KEY = 'chongwuyy_pet_town_profiles_v2';

export function sanitizeMathEnabledTypes(list) {
    if (Array.isArray(list)) {
        const filtered = list.filter(id => ALL_MATH_TYPE_IDS.includes(id));
        if (filtered.length > 0) return [...new Set(filtered)];
    }
    return [...ALL_MATH_TYPE_IDS];
}

export function sanitizeEnglishEnabledTypes(list) {
    if (Array.isArray(list)) {
        const filtered = list.filter(id => ALL_ENGLISH_TYPE_IDS.includes(id));
        if (filtered.length > 0) return [...new Set(filtered)];
    }
    return [...ALL_ENGLISH_TYPE_IDS];
}

export function isValidSmartMode(mode) {
    if (!mode || typeof mode !== 'string') return false;
    if (['grand_random', 'math_random', 'english_random', 'english', 'vocab_camp'].includes(mode)) return true;
    return ALL_MATH_TYPE_IDS.includes(mode) || ALL_ENGLISH_TYPE_IDS.includes(mode) || ALL_COURSE_SUB_IDS.includes(mode);
}

function todayDateKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function createFreshDailyState() {
    return {
        dateKey: todayDateKey(),
        badgesEarned: 0,
        ticketsEarned: 0,
        starProgress: 0,
        vocabCampCount: 0,
        siblingGiftClaimed: false
    };
}

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
            unlocked: Boolean(p.isStarter),
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
            opened: idx === 0,
            graduated: false,
            plotId: idx === 0 ? 'plot_5' : null
        };
    });
    return shops;
}

function createKidTemplate({ id, name, avatar, activePetId, mathRange, ops }) {
    const time = nowTimeStr();
    const petObj = getPetById(activePetId);
    const mathConfig = {
        mode: 'custom',
        presetGrade: mathRange >= 50 ? 'grade3_4' : 'grade1_2',
        operations: ops || ['add', 'sub'],
        range: mathRange || 20,
        maxMultiplier: mathRange >= 50 ? 9 : 5,
        allowCarryBorrow: true,
        allowFillBlank: true,
        includeWordProblems: false,
        includeDataCharts: false,
        enabledTypes: [...ALL_MATH_TYPE_IDS]
    };
    return {
        id,
        name,
        avatar,
        badges: 6,
        gachaTickets: 0,
        dailyBadgeCap: DEFAULT_DAILY_BADGE_CAP,
        dailyState: createFreshDailyState(),
        stageMode: 'pet',
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
        mathConfig,
        difficulty: { ...mathConfig },
        englishConfig: {
            level: 'level2_match',
            packId: 'all',
            courseLessonId: 'latest',
            courseSubMode: 'course_all',
            courseSpecialMigrated: true,
            enabledTypes: [...ALL_ENGLISH_TYPE_IDS]
        },
        courseReadChecks: {},
        wordMastery: {},
        scoreRecords: [
            {
                id: 'init_1',
                timeStr: time,
                title: `🎉 欢迎小店长入驻！领养萌宠【${petObj.name}】启航礼包`,
                subjectTag: '新手启航',
                deltaBadges: 6
            }
        ],
        badgeLedger: [
            {
                id: 'led_1',
                timeStr: time,
                reason: '🎁 新手小店长启航奖章礼包',
                delta: 6,
                balanceAfter: 6
            }
        ],
        graduations: [],
        mathMistakes: [],
        englishMistakes: [],
        history: [],
        mistakes: [],
        bestEndlessFlags: 0,
        bestEndlessWave: 0,
        carrotRecords: {},
        lastCarrotStage: 1,
        carrotSeenTowers: [],
        pvzRecords: {},
        lastPvzLevel: '1-1',
        preferredSmartMode: 'grand_random',
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
    parentLockEnabled: true,
    parentPin: '',
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
            console.warn('[UnifiedProfile] 读取存档失败:', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    save() {
        try {
            if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            }
        } catch (e) {
            console.warn('[UnifiedProfile] 保存存档失败:', e);
        }
    }

    saveData() {
        this.save();
    }

    ensureIntegrity() {
        if (!this.data || !Array.isArray(this.data.users) || this.data.users.length === 0) {
            this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
        if (typeof this.data.parentLockEnabled !== 'boolean') {
            this.data.parentLockEnabled = true;
        }
        if (typeof this.data.parentPin !== 'string') {
            this.data.parentPin = '';
        }
        this.data.users.forEach(u => {
            if ((u.id === 'child_lele' || u.id === 'user_1') && (u.name === '乐乐' || !u.name)) {
                u.name = '小豌豆';
            }
            if ((u.id === 'child_guoguo' || u.id === 'user_2') && (u.name === '果果' || u.name === '朵朵')) {
                u.name = '川川';
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
            if (!u.mathConfig && u.difficulty) {
                u.mathConfig = {
                    mode: u.difficulty.mode || 'custom',
                    presetGrade: u.difficulty.presetGrade || 'grade1_2',
                    operations: u.difficulty.operations || ['add', 'sub'],
                    range: u.difficulty.range || 20,
                    maxMultiplier: u.difficulty.maxMultiplier || 5,
                    allowCarryBorrow: u.difficulty.allowCarryBorrow !== false,
                    allowFillBlank: u.difficulty.allowFillBlank !== false,
                    includeWordProblems: false,
                    includeDataCharts: false,
                    enabledTypes: sanitizeMathEnabledTypes(u.difficulty.enabledTypes)
                };
            } else if (!u.mathConfig) {
                u.mathConfig = {
                    mode: 'custom',
                    presetGrade: 'grade1_2',
                    operations: ['add', 'sub'],
                    range: 20,
                    maxMultiplier: 9,
                    allowCarryBorrow: true,
                    allowFillBlank: true,
                    includeWordProblems: false,
                    includeDataCharts: false,
                    enabledTypes: [...ALL_MATH_TYPE_IDS]
                };
            }
            u.mathConfig.enabledTypes = sanitizeMathEnabledTypes(u.mathConfig.enabledTypes);
            // 双向对齐 mathConfig 与 difficulty (供 carrot 和 pvz 原生读取)
            u.difficulty = { ...u.mathConfig };
            if (!u.englishConfig) {
                u.englishConfig = {
                    level: 'level2_match',
                    packId: 'all',
                    courseLessonId: 'latest',
                    courseSubMode: 'course_all',
                    courseSpecialMigrated: true,
                    enabledTypes: [...ALL_ENGLISH_TYPE_IDS]
                };
            }
            if (!u.englishConfig.courseSpecialMigrated) {
                if (Array.isArray(u.englishConfig.enabledTypes) && u.englishConfig.enabledTypes.length >= 8 && !u.englishConfig.enabledTypes.includes('course_special')) {
                    u.englishConfig.enabledTypes = ['course_special', ...u.englishConfig.enabledTypes];
                }
                u.englishConfig.courseSpecialMigrated = true;
            }
            u.englishConfig.enabledTypes = sanitizeEnglishEnabledTypes(u.englishConfig.enabledTypes);
            if (!u.englishConfig.packId) u.englishConfig.packId = 'all';
            if (!u.englishConfig.courseLessonId) u.englishConfig.courseLessonId = 'latest';
            if (!u.englishConfig.courseSubMode) u.englishConfig.courseSubMode = 'course_all';
            if (!u.courseReadChecks || typeof u.courseReadChecks !== 'object') u.courseReadChecks = {};
            if (!u.wordMastery) u.wordMastery = {};
            if (!Array.isArray(u.scoreRecords)) u.scoreRecords = [];
            if (!Array.isArray(u.badgeLedger)) u.badgeLedger = [];
            if (!Array.isArray(u.graduations)) u.graduations = [];
            if (!Array.isArray(u.mathMistakes)) u.mathMistakes = [];
            if (!Array.isArray(u.englishMistakes)) u.englishMistakes = [];
            if (!Array.isArray(u.history)) u.history = [];
            if (!Array.isArray(u.mistakes)) u.mistakes = [];
            if (typeof u.bestEndlessFlags !== 'number') u.bestEndlessFlags = 0;
            if (typeof u.bestEndlessWave !== 'number') u.bestEndlessWave = 0;
            if (!u.carrotRecords || typeof u.carrotRecords !== 'object') u.carrotRecords = {};
            if (typeof u.lastCarrotStage !== 'number' || u.lastCarrotStage < 1 || u.lastCarrotStage > 48) u.lastCarrotStage = 1;
            if (!Array.isArray(u.carrotSeenTowers)) u.carrotSeenTowers = [];
            if (!u.pvzRecords || typeof u.pvzRecords !== 'object') u.pvzRecords = {};
            if (typeof u.lastPvzLevel !== 'string' || !u.lastPvzLevel) u.lastPvzLevel = '1-1';
            if (!isValidSmartMode(u.preferredSmartMode)) u.preferredSmartMode = 'grand_random';
            if (!Array.isArray(u.ownedAccessories)) u.ownedAccessories = ['none'];
            if (!Array.isArray(u.ownedDecors)) u.ownedDecors = [];
            if (!u.stats) u.stats = { totalMathCorrect: 0, totalEnglishCorrect: 0, totalWordsMastered: 0, bestCombo: 0 };
            if (!u.dailyBadgeCap || u.dailyBadgeCap < 5) u.dailyBadgeCap = DEFAULT_DAILY_BADGE_CAP;
            this._ensureDailyState(u);
        });

        if (!this.data.users.some(u => u.id === this.data.activeUserId)) {
            this.data.activeUserId = this.data.users[0].id;
        }

        // 一次性平滑迁移旧版全局保卫萝卜关卡勋章记录到当前小朋友名下
        try {
            if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
                const legacyRaw = localStorage.getItem('carrot_level_records_v1');
                const migratedFlag = localStorage.getItem('carrot_level_records_migrated_v2');
                if (legacyRaw && !migratedFlag) {
                    const parsed = JSON.parse(legacyRaw);
                    const activeU = this.getActiveUser();
                    if (parsed && typeof parsed === 'object' && activeU && Object.keys(activeU.carrotRecords).length === 0) {
                        activeU.carrotRecords = { ...parsed };
                    }
                    localStorage.setItem('carrot_level_records_migrated_v2', '1');
                }
            }
        } catch (e) {}

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

    addUser({ name, avatar, mathConfig, difficulty, englishConfig }) {
        const id = 'child_' + Date.now();
        const mergedMath = mathConfig || difficulty || null;
        const startPet = avatar === '🐸' ? 'frog' : 'rabbit';
        const newUser = createKidTemplate({
            id,
            name: (name || '小宝贝').trim(),
            avatar: avatar || AVATAR_LIST[0],
            activePetId: startPet,
            mathRange: mergedMath?.range || 20,
            ops: mergedMath?.operations || ['add', 'sub']
        });
        if (mergedMath) {
            newUser.mathConfig = {
                ...newUser.mathConfig,
                ...mergedMath,
                enabledTypes: sanitizeMathEnabledTypes(mergedMath.enabledTypes || newUser.mathConfig.enabledTypes)
            };
            newUser.difficulty = { ...newUser.mathConfig };
        }
        if (englishConfig) {
            newUser.englishConfig = {
                ...newUser.englishConfig,
                ...englishConfig,
                enabledTypes: sanitizeEnglishEnabledTypes(englishConfig.enabledTypes || newUser.englishConfig.enabledTypes)
            };
        }
        this.data.users.push(newUser);
        this.data.activeUserId = id;
        this.save();
        return newUser;
    }

    updateUserSettings(id, { name, avatar, dailyBadgeCap, mathConfig, difficulty, englishConfig }) {
        const u = this.getUser(id);
        if (!u) return null;
        if (name !== undefined && name.trim()) u.name = name.trim();
        if (avatar !== undefined) u.avatar = avatar;
        if (dailyBadgeCap !== undefined && Number(dailyBadgeCap) >= 5) {
            u.dailyBadgeCap = Number(dailyBadgeCap);
        }
        const incomingMath = mathConfig || difficulty;
        if (incomingMath) {
            const merged = { ...u.mathConfig, ...incomingMath };
            if (incomingMath.mode === 'preset') {
                const pg = merged.presetGrade || 'grade1_2';
                if (pg === 'grade1_2') {
                    merged.operations = ['add', 'sub'];
                    merged.range = 20;
                    merged.maxMultiplier = incomingMath.maxMultiplier || 5;
                } else if (pg === 'grade3_4') {
                    merged.operations = ['add', 'sub', 'mul', 'div'];
                    merged.range = 100;
                    merged.maxMultiplier = incomingMath.maxMultiplier || 9;
                } else if (pg === 'grade5_6') {
                    merged.operations = ['add', 'sub', 'mul', 'div'];
                    merged.range = 1000;
                    merged.maxMultiplier = incomingMath.maxMultiplier || 12;
                }
            }
            merged.enabledTypes = sanitizeMathEnabledTypes(merged.enabledTypes);
            u.mathConfig = merged;
            u.difficulty = { ...u.mathConfig };
        }
        if (englishConfig) {
            const mergedEn = { ...u.englishConfig, ...englishConfig };
            mergedEn.enabledTypes = sanitizeEnglishEnabledTypes(mergedEn.enabledTypes);
            u.englishConfig = mergedEn;
        }
        this.save();
        return u;
    }

    // 兼容 carrot 与 pvz 的 updateUser / updateActiveUser 接口
    updateUser(id, updates = {}) {
        return Boolean(this.updateUserSettings(id, updates));
    }

    updateActiveUser(updates = {}) {
        const active = this.getActiveUser();
        return Boolean(this.updateUserSettings(active.id, updates));
    }

    _ensureDailyState(user) {
        const today = todayDateKey();
        if (!user.dailyState || user.dailyState.dateKey !== today) {
            user.dailyState = createFreshDailyState();
        }
        if (typeof user.dailyState.badgesEarned !== 'number') user.dailyState.badgesEarned = 0;
        if (typeof user.dailyState.ticketsEarned !== 'number') user.dailyState.ticketsEarned = 0;
        if (typeof user.dailyState.starProgress !== 'number') user.dailyState.starProgress = 0;
        if (typeof user.dailyState.vocabCampCount !== 'number') user.dailyState.vocabCampCount = 0;
        return user.dailyState;
    }

    getDailyStatus(user = null) {
        const u = user || this.getActiveUser();
        const ds = this._ensureDailyState(u);
        const cap = u.dailyBadgeCap || DEFAULT_DAILY_BADGE_CAP;
        const remaining = Math.max(0, cap - ds.badgesEarned);
        return {
            dateKey: ds.dateKey,
            earned: ds.badgesEarned,
            cap,
            remaining,
            isCapped: remaining <= 0,
            starProgress: ds.starProgress,
            ticketsEarned: ds.ticketsEarned,
            vocabCampCount: ds.vocabCampCount
        };
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

    // ==================== 塔防 & 植物大战僵尸 对局战报记录 ====================
    recordGameRound(roundRecord) {
        if (!roundRecord) return;
        const targetId = roundRecord.userId || this.data.activeUserId;
        const u = this.getUser(targetId) || this.getActiveUser();
        if (!u) return;

        // 统一补齐 carrot 与 pvz 两边的战报字段格式
        const total = roundRecord.total ?? roundRecord.stats?.totalAttempted ?? 0;
        const correct = roundRecord.correct ?? roundRecord.stats?.correctCount ?? 0;
        const accuracy = roundRecord.accuracy ?? roundRecord.stats?.accuracy ?? (total > 0 ? Math.round((correct / total) * 100) : 100);
        const maxCombo = roundRecord.maxCombo ?? roundRecord.stats?.maxCombo ?? 0;
        const dateStr = roundRecord.dateStr || roundRecord.date || nowTimeStr();

        const normalized = {
            ...roundRecord,
            userId: u.id,
            date: dateStr,
            dateStr,
            total,
            correct,
            accuracy,
            maxCombo,
            stats: roundRecord.stats || {
                totalAttempted: total,
                correctCount: correct,
                wrongCount: Math.max(0, total - correct),
                accuracy,
                maxCombo
            }
        };

        if (!Array.isArray(u.history)) u.history = [];
        u.history.unshift(normalized);
        if (u.history.length > 50) u.history.length = 50;

        // 同步收录错题至统一错题本
        if (Array.isArray(roundRecord.mistakes)) {
            roundRecord.mistakes.forEach(m => {
                const formulaStr = m.formula || m.expr;
                if (!formulaStr || String(formulaStr).startsWith('[英语]') || m.kind === 'bond_pop') return;
                if (!u.mistakes.some(x => (x.formula || x.expr) === formulaStr)) {
                    u.mistakes.unshift({ formula: formulaStr, expected: m.expected ?? m.answer, dateStr });
                }
                const numAns = Number(m.expected ?? m.answer);
                if (!m.isInteractiveWidget && Number.isInteger(numAns) && !u.mathMistakes.some(x => (x.formula || x.expr) === formulaStr)) {
                    u.mathMistakes.unshift({
                        kind: m.kind || 'calc',
                        formula: formulaStr,
                        expr: formulaStr,
                        answer: numAns,
                        userAns: m.userAns ?? m.userAnswer,
                        hint: '实战错题回顾',
                        dateStr
                    });
                }
            });
            if (u.mistakes.length > 40) u.mistakes.length = 40;
            if (u.mathMistakes.length > 40) u.mathMistakes.length = 40;
        }
        this.save();
    }

    recordEndlessProgress(flags = 0, wave = 0) {
        const u = this.getActiveUser();
        if (!u) return;
        if (flags > (u.bestEndlessFlags || 0)) u.bestEndlessFlags = flags;
        if (wave > (u.bestEndlessWave || 0)) u.bestEndlessWave = wave;
        this.save();
    }

    clearUserHistory(userId) {
        const u = this.getUser(userId) || this.getActiveUser();
        if (!u) return false;
        u.history = [];
        u.mistakes = [];
        u.mathMistakes = [];
        u.englishMistakes = [];
        this.save();
        return true;
    }

    // ==================== 双宝独立关卡勋章与偏好同步 ====================
    getCarrotRecords(userId = null) {
        const u = userId ? this.getUser(userId) : this.getActiveUser();
        return (u && u.carrotRecords) ? u.carrotRecords : {};
    }

    setCarrotStageRecord(stageNum, recObj, userId = null) {
        const u = userId ? this.getUser(userId) : this.getActiveUser();
        if (!u) return null;
        if (!u.carrotRecords || typeof u.carrotRecords !== 'object') u.carrotRecords = {};
        u.carrotRecords[String(stageNum)] = recObj;
        this.save();
        return recObj;
    }

    setLastCarrotStage(stageNum, userId = null) {
        const u = userId ? this.getUser(userId) : this.getActiveUser();
        if (!u) return;
        const n = Number(stageNum);
        if (n >= 1 && n <= 48) {
            u.lastCarrotStage = n;
            this.save();
        }
    }

    getLastCarrotStage(userId = null) {
        const u = userId ? this.getUser(userId) : this.getActiveUser();
        return (u && typeof u.lastCarrotStage === 'number') ? u.lastCarrotStage : 1;
    }

    markCarrotTowersSeen(towerKeys = []) {
        const u = this.getActiveUser();
        if (!u || !Array.isArray(towerKeys)) return [];
        if (!Array.isArray(u.carrotSeenTowers)) u.carrotSeenTowers = [];
        const newlySeen = [];
        towerKeys.forEach(k => {
            if (k && !u.carrotSeenTowers.includes(k)) {
                u.carrotSeenTowers.push(k);
                newlySeen.push(k);
            }
        });
        if (newlySeen.length > 0) this.save();
        return newlySeen;
    }

    getPvzRecords(userId = null) {
        const u = userId ? this.getUser(userId) : this.getActiveUser();
        return (u && u.pvzRecords) ? u.pvzRecords : {};
    }

    recordPvzLevelClear(levelId, accuracy = 100) {
        const u = this.getActiveUser();
        if (!u || !levelId || String(levelId).startsWith('endless')) return null;
        if (!u.pvzRecords || typeof u.pvzRecords !== 'object') u.pvzRecords = {};
        const prev = u.pvzRecords[levelId] || { cleared: false, bestAccuracy: 0 };
        u.pvzRecords[levelId] = {
            cleared: true,
            bestAccuracy: Math.max(prev.bestAccuracy || 0, Number(accuracy) || 0),
            clearedAt: nowTimeStr()
        };
        this.save();
        return u.pvzRecords[levelId];
    }

    setLastPvzLevel(levelId) {
        const u = this.getActiveUser();
        if (!u || !levelId) return;
        u.lastPvzLevel = String(levelId);
        this.save();
    }

    getLastPvzLevel(userId = null) {
        const u = userId ? this.getUser(userId) : this.getActiveUser();
        return (u && u.lastPvzLevel) ? String(u.lastPvzLevel) : '1-1';
    }

    setPreferredSmartMode(mode) {
        const u = this.getActiveUser();
        if (!u || !isValidSmartMode(mode)) return;
        u.preferredSmartMode = mode;
        this.save();
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

    awardLearningProgress({ title, subjectTag, badges = 0, stars = 0, gotTicket = false, isVocabCampFinish = false, combo = 0, isMath = true }) {
        const u = this.getActiveUser();
        const ds = this._ensureDailyState(u);
        const cap = u.dailyBadgeCap || DEFAULT_DAILY_BADGE_CAP;

        if (isMath) u.stats.totalMathCorrect = (u.stats.totalMathCorrect || 0) + 1;
        else u.stats.totalEnglishCorrect = (u.stats.totalEnglishCorrect || 0) + 1;
        if (combo > (u.stats.bestCombo || 0)) u.stats.bestCombo = combo;
        if (isVocabCampFinish) ds.vocabCampCount += 1;

        const remainingBefore = Math.max(0, cap - ds.badgesEarned);
        const alreadyAtCap = remainingBefore <= 0;
        let actualBadges = 0;
        let reachedCapNow = false;

        if (!alreadyAtCap) {
            if (stars > 0) {
                ds.starProgress += stars;
            }
            const convertedFromStars = Math.floor(ds.starProgress / 3);
            ds.starProgress = ds.starProgress % 3;

            const candidateBadges = (badges || 0) + convertedFromStars;
            actualBadges = Math.min(candidateBadges, remainingBefore);

            if (actualBadges > 0) {
                ds.badgesEarned += actualBadges;
                this._pushLedger(u, title, actualBadges);
                this._pushScoreRecord(u, title, subjectTag, actualBadges);
            }
            if (ds.badgesEarned >= cap) {
                ds.starProgress = 0;
                reachedCapNow = true;
            }
        }

        let actualTicket = false;
        if (gotTicket && ds.ticketsEarned < DAILY_TICKET_CAP) {
            ds.ticketsEarned += 1;
            u.gachaTickets = (u.gachaTickets || 0) + 1;
            actualTicket = true;
        }

        this.save();
        return {
            user: u,
            actualBadges,
            starProgress: ds.starProgress,
            dailyEarned: ds.badgesEarned,
            dailyCap: cap,
            reachedCapNow,
            alreadyAtCap,
            actualTicket,
            levelUpEvent: null
        };
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
                    user.gachaTickets = (user.gachaTickets || 0) + 1;
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
            return { ok: false, msg: `领养【${petMeta.name}】需要 ${petMeta.unlockCost} 枚徽章（当前可用 ${u.badges} 枚），快去闯关赚徽章吧！` };
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

        let plotId = targetPlotId || sState.plotId;
        if (!plotId) {
            const occupied = Object.keys(u.townPlacements);
            const freeIndex = [5, 4, 6, 7, 1, 2, 8, 9, 10, 3, 11].map(n => `plot_${n}`).find(pid => !occupied.includes(pid));
            plotId = freeIndex || 'plot_5';
        }
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
                msg: `需要 1 张盲盒券或 ${GACHA_BADGE_COST} 枚徽章才能扭蛋哦！（每日完成首组 5 词背诵或达成 15 连对可直接免费送盲盒券！）`
            };
        }

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
            if (u.pets[u.activePetId]) u.pets[u.activePetId].accessory = acc.id;
            prize = {
                prizeType: 'accessory',
                title: `✨ 恭喜获得限定萌宠装扮【${acc.icon} ${acc.name}】！`,
                name: acc.name,
                icon: acc.icon,
                accId: acc.id
            };
        } else {
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
        if (!question || question.kind === 'bond_pop') return;
        const u = this.getActiveUser();
        const key = question.formula || question.expr || question.readText;
        if (!key) return;
        if (!u.mathMistakes.some(m => (m.formula || m.expr || m.readText) === key)) {
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
        const key = question.formula || question.expr || question.readText;
        u.mathMistakes = u.mathMistakes.filter(m => (m.formula || m.expr || m.readText) !== key);
        u.mistakes = u.mistakes.filter(m => (m.formula || m.expr) !== key);
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

    // ==================== 家长守护锁、双宝串门彩蛋与存档备份导入导出 ====================
    setParentLockSettings({ enabled, pin } = {}) {
        if (typeof enabled === 'boolean') {
            this.data.parentLockEnabled = enabled;
        }
        if (pin !== undefined) {
            const cleanPin = String(pin || '').trim();
            this.data.parentPin = /^\d{4}$/.test(cleanPin) ? cleanPin : '';
        }
        this.save();
        return {
            parentLockEnabled: this.data.parentLockEnabled,
            parentPin: this.data.parentPin
        };
    }

    getSiblingVisitor() {
        const active = this.getActiveUser();
        const sibling = this.data.users.find(u => u.id !== active.id);
        if (!sibling) return null;
        const ds = this._ensureDailyState(active);
        const petMeta = getPetById(sibling.activePetId || 'frog');
        const petState = sibling.pets?.[sibling.activePetId] || { level: 1, accessory: 'none' };
        const shopMeta = getShopById(sibling.activeShopId || 'supermarket');
        return {
            siblingId: sibling.id,
            siblingName: sibling.name,
            siblingAvatar: sibling.avatar || '🐸',
            petMeta,
            petLevel: petState.level || 1,
            accessory: petState.accessory || 'none',
            shopName: shopMeta?.name || '阳光超市',
            giftClaimedToday: Boolean(ds.siblingGiftClaimed)
        };
    }

    claimSiblingVisitGift() {
        const active = this.getActiveUser();
        const visitor = this.getSiblingVisitor();
        if (!visitor) return { ok: false, msg: '当前只有一位小店长哦～' };
        const ds = this._ensureDailyState(active);
        if (ds.siblingGiftClaimed) {
            return {
                ok: false,
                alreadyClaimed: true,
                msg: `${visitor.siblingName}的【${visitor.petMeta.name}】今天已经送过串门小星星啦，明天再来串门领礼物吧！`
            };
        }
        ds.siblingGiftClaimed = true;
        const rewardRes = this.awardLearningProgress({
            title: `💌 双宝串门：【${visitor.siblingName}】的${visitor.petMeta.name}送来友谊星礼`,
            subjectTag: '双宝串门',
            badges: 0,
            stars: 2,
            gotTicket: false,
            combo: 0,
            isMath: true
        });
        this.save();
        return {
            ok: true,
            visitor,
            rewardRes
        };
    }

    exportBackupJSON() {
        const payload = {
            magic: 'CHONGWUYY_BACKUP_V1',
            exportedAt: new Date().toISOString(),
            version: 2,
            data: this.data
        };
        return JSON.stringify(payload, null, 2);
    }

    exportBackupCode() {
        const compactJson = JSON.stringify({
            m: 'CWYY1',
            t: Date.now(),
            d: this.data
        });
        const bytes = new TextEncoder().encode(compactJson);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const b64 = (typeof btoa === 'function')
            ? btoa(binary)
            : Buffer.from(compactJson, 'utf8').toString('base64');
        return `CWYY1:${b64}`;
    }

    importBackup(rawInput) {
        if (!rawInput || typeof rawInput !== 'string') {
            return { ok: false, msg: '备份内容为空，请粘贴备份码或选择备份文件。' };
        }
        const trimmed = rawInput.trim();
        let parsedObj = null;
        try {
            if (trimmed.startsWith('CWYY1:')) {
                const b64 = trimmed.slice(6).replace(/\s+/g, '');
                let jsonStr = '';
                if (typeof atob === 'function') {
                    const binary = atob(b64);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                    jsonStr = new TextDecoder().decode(bytes);
                } else {
                    jsonStr = Buffer.from(b64, 'base64').toString('utf8');
                }
                const wrapper = JSON.parse(jsonStr);
                parsedObj = wrapper?.d || wrapper?.data || null;
            } else {
                const wrapper = JSON.parse(trimmed);
                parsedObj = wrapper?.data || wrapper?.d || (Array.isArray(wrapper?.users) ? wrapper : null);
            }
        } catch (e) {
            return { ok: false, msg: '备份格式无法识别，请检查是否完整复制了 CWYY1: 开头的备份码或 JSON 文件。' };
        }

        if (!parsedObj || !Array.isArray(parsedObj.users) || parsedObj.users.length === 0) {
            return { ok: false, msg: '备份数据中未包含有效的小朋友档案列表。' };
        }

        this.data = parsedObj;
        this.ensureIntegrity();
        const names = this.data.users.map(u => `${u.avatar || '🐰'}${u.name}`).join('、');
        return {
            ok: true,
            userCount: this.data.users.length,
            names,
            msg: `🎉 存档恢复成功！已同步：${names}`
        };
    }

    /**
     * 视频朗读打卡标记：支持小朋友跟读每一道课文问答后打勾确认，首次今日打卡赠送 1 颗学习星进度
     */
    toggleCourseReadCheck(checkKey) {
        const u = this.getActiveUser();
        if (!u || !checkKey) return { checked: false, awarded: false, badgeGain: 0 };
        if (!u.courseReadChecks || typeof u.courseReadChecks !== 'object') u.courseReadChecks = {};
        const today = todayDateKey();
        const prev = u.courseReadChecks[checkKey];
        if (prev && prev.checked) {
            u.courseReadChecks[checkKey] = { ...prev, checked: false };
            this.save();
            return { checked: false, awarded: false, badgeGain: 0 };
        }
        const alreadyRewardedToday = Boolean(prev && prev.rewardDate === today);
        u.courseReadChecks[checkKey] = {
            checked: true,
            rewardDate: today,
            updatedAt: nowTimeStr()
        };
        let badgeGain = 0;
        let awarded = false;
        if (!alreadyRewardedToday) {
            awarded = true;
            const awardRes = this.awardLearningProgress({
                title: `📹 校外英语课视频朗读打卡 (${checkKey})`,
                subjectTag: '朗读打卡',
                badges: 0,
                stars: 1,
                gotTicket: false,
                combo: 1,
                isMath: false
            });
            badgeGain = awardRes?.actualBadges || 0;
        }
        this.save();
        return { checked: true, awarded, badgeGain };
    }
}

export const profileManager = new UserProfileManager();
