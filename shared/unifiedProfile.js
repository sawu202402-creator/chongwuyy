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
    DEFAULT_DAILY_TIME_LIMIT_MIN,
    DAILY_TIME_LIMIT_OPTIONS,
    DAILY_TICKET_CAP,
    TOWN_DECORS,
    getPetById,
    getShopById
} from '../pet/js/config.js';
export { DEFAULT_DAILY_TIME_LIMIT_MIN, DAILY_TIME_LIMIT_OPTIONS };
import { ALL_MATH_TYPE_IDS } from './mathEngine.js';
import { ALL_ENGLISH_TYPE_IDS, ALL_COURSE_SUB_IDS, DEFAULT_EASY_ENGLISH_TYPES, COURSE_LESSONS } from './englishEngine.js';
import {
    ALL_CHINESE_TYPE_IDS,
    DEFAULT_CHINESE_TYPES,
    sanitizeChineseEnabledTypes,
    sanitizeChineseGrade
} from './chineseEngine.js';
export { sanitizeChineseEnabledTypes, sanitizeChineseGrade };
import {
    DAILY_MATH_QUEST_TARGET,
    DAILY_CHINESE_QUEST_TARGET,
    DAILY_ENGLISH_QUEST_TARGET,
    DAILY_COURSE_QUEST_TARGET,
    BLINDBOX_SERIES,
    BLINDBOX_RARITY_META,
    COMPANION_SPRITES,
    MUSEUM_COLLECTIBLES
} from './blindboxCatalog.js';

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
    return [...DEFAULT_EASY_ENGLISH_TYPES];
}

export function isValidSmartMode(mode) {
    if (!mode || typeof mode !== 'string') return false;
    if (['grand_random', 'math_random', 'english_random', 'english', 'chinese_random', 'chinese', 'vocab_camp'].includes(mode)) return true;
    return ALL_MATH_TYPE_IDS.includes(mode) ||
        ALL_ENGLISH_TYPE_IDS.includes(mode) ||
        ALL_COURSE_SUB_IDS.includes(mode) ||
        ALL_CHINESE_TYPE_IDS.includes(mode);
}

/**
 * 校验并标准化每日游玩时长上限（分钟）：
 * 0 表示“不限时”，未设置或非法值默认返回 30（半小时）。
 */
export function sanitizeDailyTimeLimitMin(val) {
    if (val === 0 || val === '0') return 0;
    if (val === undefined || val === null || val === '') return DEFAULT_DAILY_TIME_LIMIT_MIN;
    const num = Number(val);
    if (Number.isFinite(num) && num > 0) {
        return Math.min(480, Math.max(5, Math.round(num)));
    }
    return DEFAULT_DAILY_TIME_LIMIT_MIN;
}

export function formatTimeLimitOptionLabel(minutes, compact = false) {
    const m = sanitizeDailyTimeLimitMin(minutes);
    if (m === 0) return '♾️ 不限时';
    if (m === 30) return compact ? '30分钟(默认)' : '30分钟 (默认推荐)';
    if (m === 60) return compact ? '60分钟(1h)' : '60分钟 (1小时)';
    if (m === 90) return compact ? '90分钟(1.5h)' : '90分钟 (1.5小时)';
    return `${m}分钟`;
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
        questionsAttempted: 0,
        questionsCorrect: 0,
        mathCorrectToday: 0,
        chineseCorrectToday: 0,
        englishCorrectToday: 0,
        courseCorrectToday: 0,
        dailyMathQuestClaimed: false,
        dailyChineseQuestClaimed: false,
        dailyEnglishQuestClaimed: false,
        dailyCourseQuestClaimed: false,
        dailyAllClearClaimed: false,
        siblingGiftClaimed: false,
        usedSeconds: 0,
        bonusMinutesToday: 0,
        timeReminded5Min: false,
        timeReminded1Min: false
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
            displayStage: null,
            exp: 0,
            graduated: false,
            accessory: p.id === 'frog' ? 'lotus_hat' : 'none',
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

function createKidTemplate({ id, name, avatar, activePetId, mathRange, ops, chineseGrade }) {
    const time = nowTimeStr();
    const petObj = getPetById(activePetId);
    const defaultCnGrade = chineseGrade || ((id === 'child_chuan' || /川/.test(name || '')) ? 'grade1_1' : 'grade2_1');
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
        dailyTimeLimitMin: DEFAULT_DAILY_TIME_LIMIT_MIN,
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
        ownedAccessories: ['none', 'lotus_hat'],
        frogLotusHatMigrated_v1: true,
        ownedDecors: [],
        blindboxCollection: {},
        activeCompanionId: null,
        gachaPityCount: 0,
        guaranteedHighRarityDraws: 0,
        selectedBlindboxSeries: 'all',
        mathConfig,
        difficulty: { ...mathConfig },
        englishConfig: {
            level: 'level1_listen',
            wordDifficulty: 'easy',
            courseAllowHardDictation: false,
            packId: 'all',
            courseLessonId: 'latest',
            courseSubMode: 'course_all',
            courseSpecialMigrated: true,
            enEasyDefaultMigrated_v1: true,
            enabledTypes: [...DEFAULT_EASY_ENGLISH_TYPES]
        },
        chineseConfig: {
            grade: defaultCnGrade,
            includeInGrandRandom: true,
            enabledTypes: [...DEFAULT_CHINESE_TYPES]
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
        chineseMistakes: [],
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
            totalMathAttempted: 0,
            totalEnglishAttempted: 0,
            totalChineseAttempted: 0,
            totalMathCorrect: 0,
            totalEnglishCorrect: 0,
            totalChineseCorrect: 0,
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
            ops: ['add', 'sub', 'mul'],
            chineseGrade: 'grade2_1'
        }),
        createKidTemplate({
            id: 'child_chuan',
            name: '川川',
            avatar: '🐸',
            activePetId: 'frog',
            mathRange: 100,
            ops: ['add', 'sub', 'mul', 'div'],
            chineseGrade: 'grade1_1'
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
            if (!Array.isArray(u.ownedAccessories)) u.ownedAccessories = ['none'];
            PET_ACCESSORIES.forEach(acc => {
                if (acc.freeDefault && !u.ownedAccessories.includes(acc.id)) {
                    u.ownedAccessories.push(acc.id);
                }
            });
            if (!u.pets) u.pets = createInitialPetsState();
            PETS_CATALOG.forEach(p => {
                if (!u.pets[p.id]) {
                    u.pets[p.id] = {
                        unlocked: Boolean(p.isStarter),
                        level: 1,
                        displayStage: null,
                        exp: 0,
                        graduated: false,
                        accessory: p.id === 'frog' ? 'lotus_hat' : 'none',
                        graduatedDate: null
                    };
                } else {
                    const st = u.pets[p.id];
                    if (st.displayStage !== null && st.displayStage !== undefined) {
                        const ds = Number(st.displayStage);
                        st.displayStage = (Number.isInteger(ds) && ds >= 1 && ds <= (st.level || 1)) ? ds : null;
                    } else {
                        st.displayStage = null;
                    }
                }
            });
            if (!u.frogLotusHatMigrated_v1) {
                if (u.pets.frog && (!u.pets.frog.accessory || u.pets.frog.accessory === 'none')) {
                    u.pets.frog.accessory = 'lotus_hat';
                }
                u.frogLotusHatMigrated_v1 = true;
            }
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
                    level: 'level1_listen',
                    wordDifficulty: 'easy',
                    courseAllowHardDictation: false,
                    packId: 'all',
                    courseLessonId: 'latest',
                    courseSubMode: 'course_all',
                    courseSpecialMigrated: true,
                    enEasyDefaultMigrated_v1: true,
                    enabledTypes: [...DEFAULT_EASY_ENGLISH_TYPES]
                };
            }
            if (!u.englishConfig.courseSpecialMigrated) {
                if (Array.isArray(u.englishConfig.enabledTypes) && u.englishConfig.enabledTypes.length >= 8 && !u.englishConfig.enabledTypes.includes('course_special')) {
                    u.englishConfig.enabledTypes = ['course_special', ...u.englishConfig.enabledTypes];
                }
                u.englishConfig.courseSpecialMigrated = true;
            }
            // 一次性平滑降难迁移：为尚未手动定制过的档案默认启用「🌱 轻松启蒙」并屏蔽偏难题型
            if (!u.englishConfig.enEasyDefaultMigrated_v1) {
                if (!u.englishConfig.wordDifficulty) {
                    u.englishConfig.wordDifficulty = 'easy';
                }
                if (typeof u.englishConfig.courseAllowHardDictation !== 'boolean') {
                    u.englishConfig.courseAllowHardDictation = false;
                }
                if (!Array.isArray(u.englishConfig.enabledTypes) || u.englishConfig.enabledTypes.length >= 8) {
                    u.englishConfig.enabledTypes = [...DEFAULT_EASY_ENGLISH_TYPES];
                }
                u.englishConfig.enEasyDefaultMigrated_v1 = true;
            }
            // 平滑补充新题型「👀 看词识义 (word_meaning)」到已开启认读题型的旧存档中
            if (!u.englishConfig.enWordMeaningMigrated_v1) {
                if (
                    Array.isArray(u.englishConfig.enabledTypes) &&
                    u.englishConfig.enabledTypes.includes('match_word') &&
                    !u.englishConfig.enabledTypes.includes('word_meaning')
                ) {
                    const idx = u.englishConfig.enabledTypes.indexOf('match_word');
                    u.englishConfig.enabledTypes.splice(idx + 1, 0, 'word_meaning');
                }
                u.englishConfig.enWordMeaningMigrated_v1 = true;
            }
            if (!['easy', 'medium', 'all'].includes(u.englishConfig.wordDifficulty)) {
                u.englishConfig.wordDifficulty = 'easy';
            }
            if (typeof u.englishConfig.courseAllowHardDictation !== 'boolean') {
                u.englishConfig.courseAllowHardDictation = (u.englishConfig.wordDifficulty === 'all');
            }
            u.englishConfig.enabledTypes = sanitizeEnglishEnabledTypes(u.englishConfig.enabledTypes);
            if (!u.englishConfig.packId) u.englishConfig.packId = 'all';
            const latestLessonId = COURSE_LESSONS?.[0]?.id || '';
            if (latestLessonId && u.englishConfig.lastAutoSyncedLatestLessonId !== latestLessonId) {
                u.englishConfig.courseLessonId = 'latest';
                u.englishConfig.lastAutoSyncedLatestLessonId = latestLessonId;
            }
            if (!u.englishConfig.courseLessonId) u.englishConfig.courseLessonId = 'latest';
            if (!u.englishConfig.courseSubMode) u.englishConfig.courseSubMode = 'course_all';
            if (!u.chineseConfig || typeof u.chineseConfig !== 'object') {
                const defaultG = (u.id === 'child_chuan' || /川/.test(u.name || '')) ? 'grade1_1' : 'grade2_1';
                u.chineseConfig = {
                    grade: defaultG,
                    includeInGrandRandom: true,
                    enabledTypes: [...DEFAULT_CHINESE_TYPES]
                };
            } else {
                u.chineseConfig.grade = sanitizeChineseGrade(u.chineseConfig.grade);
                u.chineseConfig.enabledTypes = sanitizeChineseEnabledTypes(u.chineseConfig.enabledTypes);
                if (typeof u.chineseConfig.includeInGrandRandom !== 'boolean') {
                    u.chineseConfig.includeInGrandRandom = true;
                }
            }
            if (!u.courseReadChecks || typeof u.courseReadChecks !== 'object') u.courseReadChecks = {};
            if (!u.wordMastery) u.wordMastery = {};
            if (!Array.isArray(u.scoreRecords)) u.scoreRecords = [];
            if (!Array.isArray(u.badgeLedger)) u.badgeLedger = [];
            if (!Array.isArray(u.graduations)) u.graduations = [];
            if (!Array.isArray(u.mathMistakes)) u.mathMistakes = [];
            if (!Array.isArray(u.englishMistakes)) u.englishMistakes = [];
            if (!Array.isArray(u.chineseMistakes)) u.chineseMistakes = [];
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
            if (!u.blindboxCollection || typeof u.blindboxCollection !== 'object') u.blindboxCollection = {};
            if (typeof u.activeCompanionId !== 'string') u.activeCompanionId = null;
            if (typeof u.gachaPityCount !== 'number') u.gachaPityCount = 0;
            if (typeof u.guaranteedHighRarityDraws !== 'number') u.guaranteedHighRarityDraws = 0;
            if (!u.selectedBlindboxSeries || !BLINDBOX_SERIES.some(s => s.id === u.selectedBlindboxSeries)) {
                u.selectedBlindboxSeries = 'all';
            }
            // 同步历史已抽中的盲盒神宠与配饰进统一图鉴星级表
            PETS_CATALOG.filter(p => p.isBlindbox && u.pets?.[p.id]?.unlocked).forEach(p => {
                if (!u.blindboxCollection[`pet_${p.id}`]) {
                    u.blindboxCollection[`pet_${p.id}`] = { stars: 1, count: 1, obtainedAt: nowTimeStr() };
                }
            });
            PET_ACCESSORIES.filter(a => !a.freeDefault && u.ownedAccessories?.includes(a.id)).forEach(a => {
                if (!u.blindboxCollection[`acc_${a.id}`]) {
                    u.blindboxCollection[`acc_${a.id}`] = { stars: 1, count: 1, obtainedAt: nowTimeStr() };
                }
            });
            if (!u.stats) {
                u.stats = {
                    totalMathAttempted: 0,
                    totalEnglishAttempted: 0,
                    totalMathCorrect: 0,
                    totalEnglishCorrect: 0,
                    totalWordsMastered: 0,
                    bestCombo: 0
                };
            }
            if (typeof u.stats.totalMathCorrect !== 'number') u.stats.totalMathCorrect = 0;
            if (typeof u.stats.totalEnglishCorrect !== 'number') u.stats.totalEnglishCorrect = 0;
            if (typeof u.stats.totalChineseCorrect !== 'number') u.stats.totalChineseCorrect = 0;
            if (typeof u.stats.totalMathAttempted !== 'number' || u.stats.totalMathAttempted < u.stats.totalMathCorrect) {
                u.stats.totalMathAttempted = u.stats.totalMathCorrect;
            }
            if (typeof u.stats.totalEnglishAttempted !== 'number' || u.stats.totalEnglishAttempted < u.stats.totalEnglishCorrect) {
                u.stats.totalEnglishAttempted = u.stats.totalEnglishCorrect;
            }
            if (typeof u.stats.totalChineseAttempted !== 'number' || u.stats.totalChineseAttempted < u.stats.totalChineseCorrect) {
                u.stats.totalChineseAttempted = u.stats.totalChineseCorrect;
            }
            if (!u.statsAttemptBackfilled_v1) {
                let histAttempted = 0;
                let histCorrect = 0;
                (u.history || []).forEach(r => {
                    const rt = Number(r?.total ?? r?.stats?.totalAttempted ?? 0) || 0;
                    const rc = Number(r?.correct ?? r?.stats?.correctCount ?? 0) || 0;
                    histAttempted += rt;
                    histCorrect += rc;
                });
                const curTotalAttempted = (u.stats.totalMathAttempted || 0) + (u.stats.totalEnglishAttempted || 0);
                if (histAttempted > curTotalAttempted) {
                    u.stats.totalMathAttempted += (histAttempted - curTotalAttempted);
                }
                const curTotalCorrect = (u.stats.totalMathCorrect || 0) + (u.stats.totalEnglishCorrect || 0);
                if (histCorrect > curTotalCorrect) {
                    u.stats.totalMathCorrect += (histCorrect - curTotalCorrect);
                }
                if (u.stats.totalMathAttempted < u.stats.totalMathCorrect) {
                    u.stats.totalMathAttempted = u.stats.totalMathCorrect;
                }
                u.statsAttemptBackfilled_v1 = true;
            }
            if (!u.dailyBadgeCap || u.dailyBadgeCap < 5) u.dailyBadgeCap = DEFAULT_DAILY_BADGE_CAP;
            u.dailyTimeLimitMin = sanitizeDailyTimeLimitMin(u.dailyTimeLimitMin);
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

    _emitProfileUpdated(reason = 'update') {
        try {
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
                window.dispatchEvent(new CustomEvent('cwyy-profile-updated', { detail: { reason } }));
            }
        } catch (_) {}
    }

    setActiveUser(id) {
        if (this.data.users.some(u => u.id === id)) {
            this.data.activeUserId = id;
            this.save();
            this._emitProfileUpdated('setActiveUser');
        }
        return this.getActiveUser();
    }

    addUser({ name, avatar, dailyTimeLimitMin, mathConfig, difficulty, englishConfig, chineseConfig }) {
        const id = 'child_' + Date.now();
        const mergedMath = mathConfig || difficulty || null;
        const startPet = avatar === '🐸' ? 'frog' : 'rabbit';
        const newUser = createKidTemplate({
            id,
            name: (name || '小宝贝').trim(),
            avatar: avatar || AVATAR_LIST[0],
            activePetId: startPet,
            mathRange: mergedMath?.range || 20,
            ops: mergedMath?.operations || ['add', 'sub'],
            chineseGrade: chineseConfig?.grade
        });
        if (dailyTimeLimitMin !== undefined) {
            newUser.dailyTimeLimitMin = sanitizeDailyTimeLimitMin(dailyTimeLimitMin);
        }
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
        if (chineseConfig) {
            newUser.chineseConfig = {
                ...newUser.chineseConfig,
                ...chineseConfig,
                grade: sanitizeChineseGrade(chineseConfig.grade || newUser.chineseConfig.grade),
                enabledTypes: sanitizeChineseEnabledTypes(chineseConfig.enabledTypes || newUser.chineseConfig.enabledTypes)
            };
        }
        this.data.users.push(newUser);
        this.data.activeUserId = id;
        this.save();
        this._emitProfileUpdated('addUser');
        return newUser;
    }

    updateUserSettings(id, { name, avatar, dailyBadgeCap, dailyTimeLimitMin, mathConfig, difficulty, englishConfig, chineseConfig }) {
        const u = this.getUser(id);
        if (!u) return null;
        if (name !== undefined && name.trim()) u.name = name.trim();
        if (avatar !== undefined) u.avatar = avatar;
        if (dailyBadgeCap !== undefined && Number(dailyBadgeCap) >= 5) {
            u.dailyBadgeCap = Number(dailyBadgeCap);
        }
        if (dailyTimeLimitMin !== undefined) {
            u.dailyTimeLimitMin = sanitizeDailyTimeLimitMin(dailyTimeLimitMin);
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
            const mergedEn = { ...u.englishConfig, ...englishConfig, enEasyDefaultMigrated_v1: true };
            if (!['easy', 'medium', 'all'].includes(mergedEn.wordDifficulty)) {
                mergedEn.wordDifficulty = 'easy';
            }
            if (typeof mergedEn.courseAllowHardDictation !== 'boolean') {
                mergedEn.courseAllowHardDictation = (mergedEn.wordDifficulty === 'all');
            }
            mergedEn.enabledTypes = sanitizeEnglishEnabledTypes(mergedEn.enabledTypes);
            u.englishConfig = mergedEn;
        }
        if (chineseConfig) {
            const mergedCn = { ...(u.chineseConfig || {}), ...chineseConfig };
            mergedCn.grade = sanitizeChineseGrade(mergedCn.grade);
            mergedCn.enabledTypes = sanitizeChineseEnabledTypes(mergedCn.enabledTypes);
            if (typeof mergedCn.includeInGrandRandom !== 'boolean') {
                mergedCn.includeInGrandRandom = true;
            }
            u.chineseConfig = mergedCn;
        }
        this.save();
        this._emitProfileUpdated('updateUserSettings');
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
        if (typeof user.dailyState.questionsAttempted !== 'number') user.dailyState.questionsAttempted = 0;
        if (typeof user.dailyState.questionsCorrect !== 'number') user.dailyState.questionsCorrect = 0;
        if (typeof user.dailyState.mathCorrectToday !== 'number') user.dailyState.mathCorrectToday = 0;
        if (typeof user.dailyState.chineseCorrectToday !== 'number') user.dailyState.chineseCorrectToday = 0;
        if (typeof user.dailyState.courseCorrectToday !== 'number') user.dailyState.courseCorrectToday = 0;
        if (typeof user.dailyState.englishCorrectToday !== 'number') {
            user.dailyState.englishCorrectToday = user.dailyState.courseCorrectToday || 0;
        }
        if (typeof user.dailyState.dailyMathQuestClaimed !== 'boolean') user.dailyState.dailyMathQuestClaimed = false;
        if (typeof user.dailyState.dailyChineseQuestClaimed !== 'boolean') user.dailyState.dailyChineseQuestClaimed = false;
        if (typeof user.dailyState.dailyCourseQuestClaimed !== 'boolean') user.dailyState.dailyCourseQuestClaimed = false;
        if (typeof user.dailyState.dailyEnglishQuestClaimed !== 'boolean') {
            user.dailyState.dailyEnglishQuestClaimed = Boolean(user.dailyState.dailyCourseQuestClaimed);
        }
        if (typeof user.dailyState.dailyAllClearClaimed !== 'boolean') user.dailyState.dailyAllClearClaimed = false;
        if (typeof user.dailyState.usedSeconds !== 'number' || user.dailyState.usedSeconds < 0) user.dailyState.usedSeconds = 0;
        if (typeof user.dailyState.bonusMinutesToday !== 'number' || user.dailyState.bonusMinutesToday < 0) user.dailyState.bonusMinutesToday = 0;
        if (typeof user.dailyState.timeReminded5Min !== 'boolean') user.dailyState.timeReminded5Min = false;
        if (typeof user.dailyState.timeReminded1Min !== 'boolean') user.dailyState.timeReminded1Min = false;
        return user.dailyState;
    }

    /**
     * 获取当前宝贝今日游玩时长护眼状态（跨 4 端共用，自然日零点自动清零）
     */
    getDailyTimeStatus(user = null) {
        const u = user || this.getActiveUser();
        const ds = this._ensureDailyState(u);
        const limitMin = sanitizeDailyTimeLimitMin(u.dailyTimeLimitMin);
        const bonusMin = Math.max(0, Number(ds.bonusMinutesToday) || 0);
        const isUnlimited = limitMin === 0;
        const effectiveLimitMin = isUnlimited ? 0 : (limitMin + bonusMin);
        const effectiveLimitSec = isUnlimited ? Infinity : effectiveLimitMin * 60;
        const usedSeconds = Math.max(0, Math.floor(ds.usedSeconds || 0));
        const remainingSeconds = isUnlimited ? Infinity : Math.max(0, effectiveLimitSec - usedSeconds);
        const isExpired = !isUnlimited && usedSeconds >= effectiveLimitSec;
        return {
            dateKey: ds.dateKey,
            limitMin,
            bonusMin,
            effectiveLimitMin,
            effectiveLimitSec,
            usedSeconds,
            usedMinutesFloor: Math.floor(usedSeconds / 60),
            remainingSeconds,
            remainingMinutesCeil: isUnlimited ? Infinity : Math.ceil(remainingSeconds / 60),
            isUnlimited,
            isExpired,
            reminded5Min: Boolean(ds.timeReminded5Min),
            reminded1Min: Boolean(ds.timeReminded1Min)
        };
    }

    /**
     * 累加今日活跃游玩秒数（内置跨标签页/bfcache 单调同步，防回退覆盖）
     */
    addPlaySeconds(deltaSec = 1, user = null, saveImmediately = false) {
        const u = user || this.getActiveUser();
        if (!u) return null;
        const ds = this._ensureDailyState(u);
        const add = Math.max(0, Math.round(Number(deltaSec) || 0));
        if (add > 0) {
            try {
                if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        const savedU = parsed?.users?.find(x => x.id === u.id);
                        if (savedU?.dailyState?.dateKey === ds.dateKey) {
                            const savedSec = Number(savedU.dailyState.usedSeconds) || 0;
                            if (savedSec > ds.usedSeconds) {
                                ds.usedSeconds = savedSec;
                            }
                            const savedBonus = Number(savedU.dailyState.bonusMinutesToday) || 0;
                            if (savedBonus > ds.bonusMinutesToday) {
                                ds.bonusMinutesToday = savedBonus;
                            }
                        }
                    }
                }
            } catch (_) {}
            ds.usedSeconds = Math.max(0, Math.floor(ds.usedSeconds || 0)) + add;
        }
        const status = this.getDailyTimeStatus(u);
        if (saveImmediately || status.isExpired) {
            this.save();
        }
        return status;
    }

    markTimeReminded(kind, user = null) {
        const u = user || this.getActiveUser();
        if (!u) return;
        const ds = this._ensureDailyState(u);
        if (kind === '5min') ds.timeReminded5Min = true;
        if (kind === '1min') ds.timeReminded1Min = true;
        this.save();
    }

    grantBonusScreenTime(minutes = 15, user = null) {
        const u = user || this.getActiveUser();
        if (!u) return null;
        const ds = this._ensureDailyState(u);
        const addMin = Math.max(1, Math.round(Number(minutes) || 15));
        ds.bonusMinutesToday = Math.max(0, Number(ds.bonusMinutesToday) || 0) + addMin;
        const nextStatus = this.getDailyTimeStatus(u);
        if (nextStatus.remainingSeconds > 300) ds.timeReminded5Min = false;
        if (nextStatus.remainingSeconds > 60) ds.timeReminded1Min = false;
        this.save();
        this._emitProfileUpdated('grantBonusScreenTime');
        return nextStatus;
    }

    resetTodayScreenTime(user = null) {
        const u = user || this.getActiveUser();
        if (!u) return null;
        const ds = this._ensureDailyState(u);
        ds.usedSeconds = 0;
        ds.bonusMinutesToday = 0;
        ds.timeReminded5Min = false;
        ds.timeReminded1Min = false;
        this.save();
        this._emitProfileUpdated('resetTodayScreenTime');
        return this.getDailyTimeStatus(u);
    }

    getDailyQuestStatus(user = null) {
        const u = user || this.getActiveUser();
        const ds = this._ensureDailyState(u);
        const latestLesson = COURSE_LESSONS?.[0];
        const englishRaw = Math.max(ds.englishCorrectToday || 0, ds.courseCorrectToday || 0);
        const englishCompleted = Boolean(ds.dailyEnglishQuestClaimed || ds.dailyCourseQuestClaimed);
        const mathCompleted = Boolean(ds.dailyMathQuestClaimed);
        const chineseCompleted = Boolean(ds.dailyChineseQuestClaimed);
        return {
            dateKey: ds.dateKey,
            mathDone: Math.min(DAILY_MATH_QUEST_TARGET, ds.mathCorrectToday || 0),
            mathRaw: ds.mathCorrectToday || 0,
            mathTarget: DAILY_MATH_QUEST_TARGET,
            mathCompleted,
            chineseDone: Math.min(DAILY_CHINESE_QUEST_TARGET, ds.chineseCorrectToday || 0),
            chineseRaw: ds.chineseCorrectToday || 0,
            chineseTarget: DAILY_CHINESE_QUEST_TARGET,
            chineseCompleted,
            englishDone: Math.min(DAILY_ENGLISH_QUEST_TARGET, englishRaw),
            englishRaw,
            englishTarget: DAILY_ENGLISH_QUEST_TARGET,
            englishCompleted,
            // 向后兼容旧字段名
            courseDone: Math.min(DAILY_ENGLISH_QUEST_TARGET, englishRaw),
            courseRaw: englishRaw,
            courseTarget: DAILY_ENGLISH_QUEST_TARGET,
            courseCompleted: englishCompleted,
            allClearCompleted: Boolean(ds.dailyAllClearClaimed),
            completedCount: (mathCompleted ? 1 : 0) + (chineseCompleted ? 1 : 0) + (englishCompleted ? 1 : 0),
            totalQuests: 3,
            latestLessonTitle: latestLesson ? `${latestLesson.code}《${latestLesson.storyTitle}》` : '少儿英语'
        };
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
            vocabCampCount: ds.vocabCampCount,
            questionsAttempted: ds.questionsAttempted || 0,
            questionsCorrect: ds.questionsCorrect || 0
        };
    }

    getQuestionStats(user = null) {
        const u = user || this.getActiveUser();
        const ds = this._ensureDailyState(u);
        const st = u.stats || {};
        const totalMathCorrect = st.totalMathCorrect || 0;
        const totalEnglishCorrect = st.totalEnglishCorrect || 0;
        const totalChineseCorrect = st.totalChineseCorrect || 0;
        const totalMathAttempted = Math.max(st.totalMathAttempted || 0, totalMathCorrect);
        const totalEnglishAttempted = Math.max(st.totalEnglishAttempted || 0, totalEnglishCorrect);
        const totalChineseAttempted = Math.max(st.totalChineseAttempted || 0, totalChineseCorrect);
        return {
            todayAttempted: ds.questionsAttempted || 0,
            todayCorrect: ds.questionsCorrect || 0,
            totalAttempted: totalMathAttempted + totalEnglishAttempted + totalChineseAttempted,
            totalCorrect: totalMathCorrect + totalEnglishCorrect + totalChineseCorrect,
            totalMathAttempted,
            totalEnglishAttempted,
            totalChineseAttempted,
            totalMathCorrect,
            totalEnglishCorrect,
            totalChineseCorrect
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

    /**
     * 记录任意单次做题（无论答对还是答错、数学还是英语、是否已达每日徽章上限，做题数量均实时 +1 并落盘）
     */
    recordQuestionAttempt({ isMath = true, isChinese = false, isCorrect = false, combo = 0 } = {}) {
        const u = this.getActiveUser();
        const ds = this._ensureDailyState(u);
        ds.questionsAttempted = (ds.questionsAttempted || 0) + 1;
        if (isCorrect) {
            ds.questionsCorrect = (ds.questionsCorrect || 0) + 1;
        }
        if (isChinese) {
            u.stats.totalChineseAttempted = Math.max(u.stats.totalChineseAttempted || 0, u.stats.totalChineseCorrect || 0) + 1;
            if (isCorrect) u.stats.totalChineseCorrect = (u.stats.totalChineseCorrect || 0) + 1;
        } else if (isMath) {
            u.stats.totalMathAttempted = Math.max(u.stats.totalMathAttempted || 0, u.stats.totalMathCorrect || 0) + 1;
            if (isCorrect) u.stats.totalMathCorrect = (u.stats.totalMathCorrect || 0) + 1;
        } else {
            u.stats.totalEnglishAttempted = Math.max(u.stats.totalEnglishAttempted || 0, u.stats.totalEnglishCorrect || 0) + 1;
            if (isCorrect) u.stats.totalEnglishCorrect = (u.stats.totalEnglishCorrect || 0) + 1;
        }
        if (combo > (u.stats.bestCombo || 0)) u.stats.bestCombo = combo;
        this.save();
        return this.getQuestionStats(u);
    }

    awardLearningProgress({ title, subjectTag, badges = 0, stars = 0, gotTicket = false, isVocabCampFinish = false, combo = 0, isMath = true, isChinese = false, isCourseSpecial = false, countAsQuestion = true }) {
        const u = this.getActiveUser();
        const ds = this._ensureDailyState(u);
        const cap = u.dailyBadgeCap || DEFAULT_DAILY_BADGE_CAP;

        const isCoursePractice = Boolean(
            isCourseSpecial ||
            subjectTag === '朗读打卡' ||
            (typeof subjectTag === 'string' && (subjectTag.includes('英语课') || subjectTag.includes('校外课'))) ||
            (typeof title === 'string' && (title.includes('校外英语') || title.includes('英语课') || title.includes('S1·分级') || title.includes('S1U1')))
        );

        if (countAsQuestion !== false) {
            ds.questionsAttempted = (ds.questionsAttempted || 0) + 1;
            ds.questionsCorrect = (ds.questionsCorrect || 0) + 1;
            if (isChinese) {
                ds.chineseCorrectToday = (ds.chineseCorrectToday || 0) + 1;
                u.stats.totalChineseAttempted = Math.max(u.stats.totalChineseAttempted || 0, u.stats.totalChineseCorrect || 0) + 1;
                u.stats.totalChineseCorrect = (u.stats.totalChineseCorrect || 0) + 1;
            } else if (isMath) {
                ds.mathCorrectToday = (ds.mathCorrectToday || 0) + 1;
                u.stats.totalMathAttempted = Math.max(u.stats.totalMathAttempted || 0, u.stats.totalMathCorrect || 0) + 1;
                u.stats.totalMathCorrect = (u.stats.totalMathCorrect || 0) + 1;
            } else {
                ds.englishCorrectToday = (ds.englishCorrectToday || 0) + 1;
                if (isCoursePractice) {
                    ds.courseCorrectToday = (ds.courseCorrectToday || 0) + 1;
                }
                u.stats.totalEnglishAttempted = Math.max(u.stats.totalEnglishAttempted || 0, u.stats.totalEnglishCorrect || 0) + 1;
                u.stats.totalEnglishCorrect = (u.stats.totalEnglishCorrect || 0) + 1;
            }
        } else if (subjectTag === '朗读打卡') {
            ds.courseCorrectToday = (ds.courseCorrectToday || 0) + 1;
            ds.englishCorrectToday = (ds.englishCorrectToday || 0) + 1;
        }
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

        // ==================== 📅 每日语数英三科打卡任务检测（三科全部完成才得 1 张免费盲盒券！） ====================
        const questEvents = [];
        if (!ds.dailyMathQuestClaimed && ds.mathCorrectToday >= DAILY_MATH_QUEST_TARGET) {
            ds.dailyMathQuestClaimed = true;
            this._pushLedger(u, `📅 每日数学打卡(${DAILY_MATH_QUEST_TARGET}题)达成奖励`, 2);
            this._pushScoreRecord(u, `📅 每日数学打卡达成 (+2🏅 · 三科全完领🎟️盲盒券)`, '每日打卡', 2);
            questEvents.push({
                type: 'math',
                ticketAdded: 0,
                badgeAdded: 2,
                label: `📅 今日数学打卡(${DAILY_MATH_QUEST_TARGET}题)完成！奖 +2🏅（数学+语文+英语三科全完可领 1 张🎟️盲盒券）！`
            });
        }
        if (!ds.dailyChineseQuestClaimed && (ds.chineseCorrectToday || 0) >= DAILY_CHINESE_QUEST_TARGET) {
            ds.dailyChineseQuestClaimed = true;
            this._pushLedger(u, `📅 每日语文打卡(${DAILY_CHINESE_QUEST_TARGET}题)达成奖励`, 2);
            this._pushScoreRecord(u, `📅 每日语文打卡达成 (+2🏅 · 三科全完领🎟️盲盒券)`, '每日打卡', 2);
            questEvents.push({
                type: 'chinese',
                ticketAdded: 0,
                badgeAdded: 2,
                label: `📅 今日语文打卡(${DAILY_CHINESE_QUEST_TARGET}题)完成！奖 +2🏅（数学+语文+英语三科全完可领 1 张🎟️盲盒券）！`
            });
        }
        const englishTodayCount = Math.max(ds.englishCorrectToday || 0, ds.courseCorrectToday || 0);
        if (!ds.dailyEnglishQuestClaimed && englishTodayCount >= DAILY_ENGLISH_QUEST_TARGET) {
            ds.dailyEnglishQuestClaimed = true;
            ds.dailyCourseQuestClaimed = true;
            this._pushLedger(u, `📅 每日英语打卡(${DAILY_ENGLISH_QUEST_TARGET}题)达成奖励`, 2);
            this._pushScoreRecord(u, `📅 每日英语打卡达成 (+2🏅 · 三科全完领🎟️盲盒券)`, '每日打卡', 2);
            questEvents.push({
                type: 'english',
                ticketAdded: 0,
                badgeAdded: 2,
                label: `📅 今日英语打卡(${DAILY_ENGLISH_QUEST_TARGET}题)完成！奖 +2🏅（数学+语文+英语三科全完可领 1 张🎟️盲盒券）！`
            });
        }
        if (ds.dailyMathQuestClaimed && ds.dailyChineseQuestClaimed && ds.dailyEnglishQuestClaimed && !ds.dailyAllClearClaimed) {
            ds.dailyAllClearClaimed = true;
            u.gachaTickets = (u.gachaTickets || 0) + 1;
            u.guaranteedHighRarityDraws = (u.guaranteedHighRarityDraws || 0) + 1;
            actualTicket = true;
            this._pushLedger(u, '🏆 今日语数英三科全勤满贯大奖', 3);
            this._pushScoreRecord(u, '🏆 今日语数英三科打卡全完 (+1🎟️黄金盲盒券 +3🏅)', '三科满贯', 3);
            questEvents.push({
                type: 'all_clear',
                ticketAdded: 1,
                badgeAdded: 3,
                label: '🏆 今日【数学 + 语文 + 英语】三科打卡全部完成！荣获 1 张 🎟️ SSR/UR 保底黄金盲盒券 + 3🏅！'
            });
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
            questEvents,
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
            // 每次升级自动切换展示新解锁的等级样式，之后小朋友也可随时切回任意已解锁等级样式
            pState.displayStage = pState.level;
            return {
                type: 'pet',
                petMeta,
                newLevel: pState.level,
                newlyGraduated
            };
        }
        return null;
    }

    getEffectivePetStage(petId = null, user = null) {
        const u = user || this.getActiveUser();
        const pid = petId || u?.activePetId || 'rabbit';
        const pState = u?.pets?.[pid];
        if (!pState) return 1;
        const lv = Math.min(5, Math.max(1, Number(pState.level) || 1));
        if (pState.displayStage !== null && pState.displayStage !== undefined) {
            const ds = Number(pState.displayStage);
            if (Number.isInteger(ds) && ds >= 1 && ds <= lv) return ds;
        }
        return lv;
    }

    setPetDisplayStage(petId, stageOrAuto) {
        const u = this.getActiveUser();
        const pid = petId || u.activePetId;
        const pState = u.pets?.[pid];
        if (!pState) return { ok: false, msg: '未找到该萌宠' };
        const lv = Math.min(5, Math.max(1, Number(pState.level) || 1));
        if (stageOrAuto === 'auto' || stageOrAuto === null) {
            pState.displayStage = null;
            this.save();
            return { ok: true, effectiveStage: lv, isAuto: true };
        }
        const target = Number(stageOrAuto);
        if (!Number.isInteger(target) || target < 1 || target > 5) {
            return { ok: false, msg: '无效的等级样式' };
        }
        if (target > lv) {
            return { ok: false, msg: `升到 Lv.${target} 即可解锁该形态样式哦！` };
        }
        pState.displayStage = target === lv ? null : target;
        this.save();
        return { ok: true, effectiveStage: target, isAuto: pState.displayStage === null };
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
        const res = this.unlockOrEquipAccessory(accId);
        return res.ok;
    }

    unlockOrEquipAccessory(accId) {
        const u = this.getActiveUser();
        const accMeta = PET_ACCESSORIES.find(a => a.id === accId);
        if (!accMeta) return { ok: false, msg: '未知装扮' };
        const pState = u.pets[u.activePetId];
        if (!pState) return { ok: false, msg: '未找到当前萌宠' };

        const wasOwned = u.ownedAccessories.includes(accId);
        if (!wasOwned) {
            if (accMeta.freeDefault || !accMeta.cost) {
                u.ownedAccessories.push(accId);
            } else {
                if (u.badges < accMeta.cost) {
                    return {
                        ok: false,
                        msg: `兑换【${accMeta.name}】需要 ${accMeta.cost} 枚徽章（当前可用 ${u.badges} 枚），也可以在惊喜盲盒中免费抽取哦！`
                    };
                }
                this._pushLedger(u, `${accMeta.icon} 兑换萌宠装扮【${accMeta.name}】`, -accMeta.cost);
                u.ownedAccessories.push(accId);
            }
        }

        pState.accessory = accId;
        this.save();
        return { ok: true, accMeta, newlyUnlocked: !wasOwned };
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

    _buildUnifiedBlindboxPool(user) {
        const u = user || this.getActiveUser();
        const col = u.blindboxCollection || {};
        const pool = [];

        // 1. guardians 系列：4 款隐藏神宠 + 6 款悬浮伴生精灵 (共 10 款)
        PETS_CATALOG.filter(p => p.isBlindbox).forEach(p => {
            const uid = `pet_${p.id}`;
            const rarityKey = String(p.rarity || '').startsWith('UR') ? 'UR' : 'SSR';
            const unlocked = Boolean(u.pets?.[p.id]?.unlocked);
            const stars = unlocked ? (col[uid]?.stars || 1) : 0;
            pool.push({
                uid,
                rawId: p.id,
                seriesId: 'guardians',
                prizeType: 'pet',
                rarity: rarityKey,
                name: p.name,
                enName: p.enName || '',
                icon: p.emoji,
                img: p.img,
                colors: [p.auraColor || '#8b5cf6', p.auraSecondary || '#ec4899'],
                funFact: p.stageDescs?.[0] || '超稀有盲盒限定神宠伙伴！',
                owned: unlocked,
                stars
            });
        });

        COMPANION_SPRITES.forEach(c => {
            const uid = c.id;
            const entry = col[uid];
            pool.push({
                uid,
                rawId: c.id,
                seriesId: 'guardians',
                prizeType: 'companion',
                rarity: c.rarity,
                name: c.name,
                enName: c.enName,
                icon: c.icon,
                colors: c.colors,
                funFact: c.funFact,
                owned: Boolean(entry),
                stars: entry?.stars || 0
            });
        });

        // 2. fashion 系列：16 款潮玩头饰装扮
        PET_ACCESSORIES.filter(a => !a.freeDefault).forEach(a => {
            const uid = `acc_${a.id}`;
            const owned = Boolean(u.ownedAccessories?.includes(a.id));
            const stars = owned ? (col[uid]?.stars || 1) : 0;
            pool.push({
                uid,
                rawId: a.id,
                seriesId: 'fashion',
                prizeType: 'accessory',
                rarity: a.rarity || 'R',
                name: a.name,
                enName: a.enName || '',
                icon: a.icon,
                colors: ['#ec4899', '#8b5cf6'],
                funFact: a.desc,
                owned,
                stars
            });
        });

        // 3. 四大博物馆手办系列：dino(12) + space(12) + sweets(12) + treasures(12) = 48 款
        MUSEUM_COLLECTIBLES.forEach(m => {
            const uid = m.id;
            const entry = col[uid];
            pool.push({
                uid,
                rawId: m.id,
                seriesId: m.seriesId,
                prizeType: 'figurine',
                rarity: m.rarity,
                name: m.name,
                enName: m.enName,
                icon: m.icon,
                colors: m.colors,
                funFact: m.funFact,
                owned: Boolean(entry),
                stars: entry?.stars || 0
            });
        });

        return pool;
    }

    setSelectedBlindboxSeries(seriesId) {
        const u = this.getActiveUser();
        if (!u) return;
        if (BLINDBOX_SERIES.some(s => s.id === seriesId)) {
            u.selectedBlindboxSeries = seriesId;
            this.save();
        }
    }

    equipCompanion(compId = null) {
        const u = this.getActiveUser();
        if (!u) return { ok: false };
        if (!compId) {
            u.activeCompanionId = null;
            this.save();
            return { ok: true, activeCompanionId: null };
        }
        if (!u.blindboxCollection?.[compId]) {
            return { ok: false, msg: '尚未在盲盒中抽到这只伴生小精灵哦！' };
        }
        u.activeCompanionId = u.activeCompanionId === compId ? null : compId;
        this.save();
        return { ok: true, activeCompanionId: u.activeCompanionId };
    }

    getBlindboxMuseumSummary(user = null) {
        const u = user || this.getActiveUser();
        const pool = this._buildUnifiedBlindboxPool(u);
        const ownedCount = pool.filter(it => it.owned).length;
        const totalStars = pool.reduce((sum, it) => sum + (it.stars || 0), 0);
        const bySeries = {};
        BLINDBOX_SERIES.forEach(s => {
            const list = s.id === 'all' ? pool : pool.filter(it => it.seriesId === s.id);
            const got = list.filter(it => it.owned).length;
            bySeries[s.id] = {
                series: s,
                items: list,
                ownedCount: got,
                totalCount: list.length,
                isMastered: list.length > 0 && got >= list.length
            };
        });
        return {
            totalOwned: ownedCount,
            totalItems: pool.length,
            totalStars,
            maxStars: pool.length * 3,
            pityRemaining: Math.max(1, 5 - (u.gachaPityCount || 0)),
            guaranteedHighRarityDraws: u.guaranteedHighRarityDraws || 0,
            selectedSeries: u.selectedBlindboxSeries || 'all',
            activeCompanionId: u.activeCompanionId || null,
            bySeries
        };
    }

    drawBlindBox(seriesOverride = null) {
        const u = this.getActiveUser();
        if (!u.blindboxCollection || typeof u.blindboxCollection !== 'object') {
            u.blindboxCollection = {};
        }

        const targetSeries = (seriesOverride && BLINDBOX_SERIES.some(s => s.id === seriesOverride))
            ? seriesOverride
            : (u.selectedBlindboxSeries || 'all');
        u.selectedBlindboxSeries = targetSeries;

        let usedTicket = false;
        if ((u.gachaTickets || 0) > 0) {
            u.gachaTickets -= 1;
            usedTicket = true;
        } else if (u.badges >= GACHA_BADGE_COST) {
            this._pushLedger(u, `🎁 开启【${BLINDBOX_SERIES.find(s => s.id === targetSeries)?.shortName || '惊喜'}】盲盒`, -GACHA_BADGE_COST);
        } else {
            return {
                ok: false,
                msg: `需要 1 张 🎟️ 盲盒券或 ${GACHA_BADGE_COST} 枚 🏅 徽章才能开箱哦！（每天做完数学+语文+英语三科打卡，免费得 1 张黄金盲盒券！）`
            };
        }

        const allPool = this._buildUnifiedBlindboxPool(u);
        const seriesPool = targetSeries === 'all'
            ? allPool
            : allPool.filter(it => it.seriesId === targetSeries);

        u.gachaPityCount = (u.gachaPityCount || 0) + 1;
        const forceHighRarity = (u.guaranteedHighRarityDraws || 0) > 0 || u.gachaPityCount >= 5;

        // 1) 100% 优先从本系列尚未拥有的新品中抽取；若本系列已全齐，则优先抽取未满 3 星的可升星款
        let candidates = seriesPool.filter(it => !it.owned);
        if (candidates.length === 0) {
            candidates = seriesPool.filter(it => (it.stars || 0) < 3);
        }
        if (candidates.length === 0) {
            // 若该单系列连 3 星都全部满级，则自动跨系列帮你抽其他系列尚未拥有的新品！
            const otherUnowned = allPool.filter(it => !it.owned);
            candidates = otherUnowned.length > 0 ? otherUnowned : seriesPool;
        }

        if (forceHighRarity) {
            const highPool = candidates.filter(it => it.rarity === 'UR' || it.rarity === 'SSR');
            if (highPool.length > 0) {
                candidates = highPool;
            }
        }

        const weightedPick = (list) => {
            const totalW = list.reduce((acc, it) => acc + (BLINDBOX_RARITY_META[it.rarity]?.weight || 25), 0);
            let r = Math.random() * totalW;
            for (const it of list) {
                r -= (BLINDBOX_RARITY_META[it.rarity]?.weight || 25);
                if (r <= 0) return it;
            }
            return list[list.length - 1];
        };

        const chosen = weightedPick(candidates);
        if (chosen.rarity === 'UR' || chosen.rarity === 'SSR') {
            u.gachaPityCount = 0;
            if ((u.guaranteedHighRarityDraws || 0) > 0) {
                u.guaranteedHighRarityDraws -= 1;
            }
        }

        const prevEntry = u.blindboxCollection[chosen.uid];
        const isNew = !chosen.owned;
        const nextStars = isNew ? 1 : Math.min(3, (prevEntry?.stars || 1) + 1);
        const isStarUpgrade = !isNew && nextStars > (prevEntry?.stars || 1);

        u.blindboxCollection[chosen.uid] = {
            stars: nextStars,
            count: (prevEntry?.count || 0) + 1,
            obtainedAt: nowTimeStr()
        };

        if (chosen.prizeType === 'pet') {
            if (u.pets[chosen.rawId]) u.pets[chosen.rawId].unlocked = true;
        } else if (chosen.prizeType === 'accessory') {
            if (!u.ownedAccessories.includes(chosen.rawId)) {
                u.ownedAccessories.push(chosen.rawId);
            }
            if (isNew && u.pets[u.activePetId]) {
                u.pets[u.activePetId].accessory = chosen.rawId;
            }
        } else if (chosen.prizeType === 'companion') {
            if (isNew && !u.activeCompanionId) {
                u.activeCompanionId = chosen.rawId;
            }
        }

        if (!isNew) {
            this._gainPetExp(u, u.activePetId, 12);
        }

        const rarityLabel = BLINDBOX_RARITY_META[chosen.rarity]?.label || chosen.rarity;
        const seriesMeta = BLINDBOX_SERIES.find(s => s.id === chosen.seriesId);
        const title = isNew
            ? `🎊 新图鉴点亮！抽中 ${rarityLabel}【${chosen.name}】！`
            : (isStarUpgrade
                ? `🌟 闪卡升阶！【${chosen.name}】升至 ${nextStars} 星典藏（萌宠 +12 成长值）！`
                : `🌈 满星鸿运！【${chosen.name}】化为 +12 超级成长能量！`);

        const prize = {
            uid: chosen.uid,
            rawId: chosen.rawId,
            seriesId: chosen.seriesId,
            seriesName: seriesMeta?.name || '惊喜盲盒',
            prizeType: chosen.prizeType,
            rarity: chosen.rarity,
            rarityLabel,
            isNew,
            isStarUpgrade,
            starLevel: nextStars,
            title,
            name: chosen.name,
            enName: chosen.enName,
            img: chosen.img || null,
            icon: chosen.icon,
            colors: chosen.colors,
            funFact: chosen.funFact,
            petId: chosen.prizeType === 'pet' ? chosen.rawId : null,
            accId: chosen.prizeType === 'accessory' ? chosen.rawId : null,
            compId: chosen.prizeType === 'companion' ? chosen.rawId : null
        };

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

    recordChineseMistake(question, userAns = '') {
        if (!question || !question.id || question.mode === 'cn_measure_antonym') return;
        const u = this.getActiveUser();
        if (!Array.isArray(u.chineseMistakes)) u.chineseMistakes = [];
        if (!u.chineseMistakes.some(m => m.id === question.id)) {
            u.chineseMistakes.unshift({
                id: question.id,
                mode: question.mode,
                promptText: question.promptText || question.displayKey,
                answer: question.answer,
                displayKey: question.displayKey,
                userAns,
                rawQuestion: { ...question, isReview: true },
                dateStr: nowTimeStr()
            });
            if (u.chineseMistakes.length > 40) u.chineseMistakes.length = 40;
            this.save();
        }
    }

    resolveChineseMistake(question) {
        if (!question || !question.id) return;
        const u = this.getActiveUser();
        if (!Array.isArray(u.chineseMistakes)) return;
        u.chineseMistakes = u.chineseMistakes.filter(m => m.id !== question.id);
        this.save();
    }

    updateWordProgress(wordObj, isCorrect, masteryBoost = 1) {
        const u = this.getActiveUser();
        if (!wordObj || !wordObj.id) return { resolvedMistake: false, mistakeStreak: 0 };
        const cur = u.wordMastery[wordObj.id] || 0;
        let resolvedMistake = false;
        let mistakeStreak = 0;

        if (isCorrect) {
            u.wordMastery[wordObj.id] = Math.min(3, cur + masteryBoost);
            const mEntry = u.englishMistakes.find(w => w.wordId === wordObj.id);
            if (mEntry) {
                mistakeStreak = (mEntry.streak || 0) + (masteryBoost >= 2 ? 2 : 1);
                if (mistakeStreak >= 2) {
                    u.englishMistakes = u.englishMistakes.filter(w => w.wordId !== wordObj.id);
                    resolvedMistake = true;
                } else {
                    mEntry.streak = mistakeStreak;
                }
            }
        } else {
            // 答错时掉 1 颗星（最低 0 星），杜绝“蒙对升满星后忘光却不降级”的假掌握
            u.wordMastery[wordObj.id] = Math.max(0, cur - 1);
            const existing = u.englishMistakes.find(w => w.wordId === wordObj.id);
            if (existing) {
                existing.streak = 0;
                existing.dateStr = nowTimeStr();
            } else {
                u.englishMistakes.unshift({
                    wordId: wordObj.id,
                    word: wordObj.word,
                    phonics: wordObj.phonics,
                    zh: wordObj.zh,
                    icon: wordObj.icon,
                    streak: 0,
                    dateStr: nowTimeStr()
                });
            }
        }
        u.stats.totalWordsMastered = Object.values(u.wordMastery).filter(v => v >= 2).length;
        this.save();
        return { resolvedMistake, mistakeStreak };
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
            isMath: true,
            countAsQuestion: false
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
        this._emitProfileUpdated('importBackup');
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
        let questEvents = [];
        if (!alreadyRewardedToday) {
            awarded = true;
            const awardRes = this.awardLearningProgress({
                title: `📹 校外英语课视频朗读打卡 (${checkKey})`,
                subjectTag: '朗读打卡',
                badges: 0,
                stars: 1,
                gotTicket: false,
                combo: 1,
                isMath: false,
                isCourseSpecial: true,
                countAsQuestion: false
            });
            badgeGain = awardRes?.actualBadges || 0;
            questEvents = awardRes?.questEvents || [];
        }
        this.save();
        return { checked: true, awarded, badgeGain, questEvents };
    }

    isTownPlotPatrolledToday(plotId, userObj = null) {
        const u = userObj || this.getActiveUser();
        if (!u || !plotId) return false;
        const today = todayDateKey();
        return u.townPatrolClaims?.[plotId] === today;
    }

    claimTownShopPatrol(plotId, shopTitle = '海滨店铺') {
        const u = this.getActiveUser();
        if (!u || !plotId) return { ok: false, msg: '地块无效' };
        const placed = u.townPlacements?.[plotId];
        if (!placed || placed.type !== 'shop') return { ok: false, msg: '该地块尚未开设店铺' };
        if (!u.townPatrolClaims || typeof u.townPatrolClaims !== 'object') {
            u.townPatrolClaims = {};
        }
        const today = todayDateKey();
        if (u.townPatrolClaims[plotId] === today) {
            return { ok: false, alreadyClaimed: true, msg: '今日已收取过这家店铺的营业星礼啦，明天再来巡店吧！' };
        }
        u.townPatrolClaims[plotId] = today;
        const rewardRes = this.awardLearningProgress({
            title: `🏪 小镇巡店收银【${shopTitle}】`,
            subjectTag: '小镇巡店',
            badges: 0,
            stars: 2,
            gotTicket: false,
            combo: 1,
            isMath: true,
            countAsQuestion: false
        });
        this.save();
        return {
            ok: true,
            starsAdded: 2,
            grantedBadges: rewardRes?.actualBadges || 0,
            starProgress: rewardRes?.starProgress || 0
        };
    }
}

export const profileManager = new UserProfileManager();
