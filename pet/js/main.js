/**
 * main.js - 《奇妙萌宠店长：数英星语镇》全局交互控制总线与粒子动效系统
 */

import {
    AVATAR_LIST,
    PET_CATEGORIES,
    PET_STAGE_STYLES,
    PETS_CATALOG,
    SHOPS_CATALOG,
    PET_ACCESSORIES,
    PET_LEVEL_MAX_EXP,
    FEED_BADGE_COST,
    FEED_EXP_GAIN,
    SHOP_LEVEL_MAX_EXP,
    SHOP_UPGRADE_BADGE_COST,
    GACHA_BADGE_COST,
    DEFAULT_DAILY_BADGE_CAP,
    DAILY_BADGE_CAP_OPTIONS,
    TOWN_PLOTS,
    TOWN_DECORS,
    getPetById,
    getShopById,
    getAccessoryById,
    getStageStyleMeta
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
    DEFAULT_EASY_ENGLISH_TYPES,
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
import { openRandomFilterModal } from '../../shared/randomFilterModal.js';
import { requireParentGate } from '../../shared/parentGate.js';

// ==================== 立体荷叶系列、进化光效与伴生灵物高精 SVG 渲染器 ====================
function getAccessoryPositionClass(accId) {
    if (accId === 'lotus_umbrella') return 'acc-pos-umbrella';
    if (accId === 'sunglasses') return 'acc-pos-eyes';
    return 'acc-pos-head';
}

let _svgAccUid = 0;
function renderAccessoryVisualHtml(accId, compact = false) {
    if (!accId || accId === 'none') return '';
    const sfx = `_${++_svgAccUid}`;
    if (accId === 'lotus_hat') {
        const w = compact ? 44 : 84;
        const h = compact ? 28 : 52;
        return `
            <svg class="lotus-svg-art lotus-hat-breathe" width="${w}" height="${h}" viewBox="0 0 96 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="lhTop${sfx}" cx="46%" cy="28%" r="65%">
                        <stop offset="0%" stop-color="#A7F3D0"/>
                        <stop offset="42%" stop-color="#34D399"/>
                        <stop offset="82%" stop-color="#059669"/>
                        <stop offset="100%" stop-color="#065F46"/>
                    </radialGradient>
                    <linearGradient id="lhUnder${sfx}" x1="12" y1="34" x2="84" y2="46" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#064E3B" stop-opacity="0.85"/>
                        <stop offset="50%" stop-color="#047857" stop-opacity="0.95"/>
                        <stop offset="100%" stop-color="#064E3B" stop-opacity="0.85"/>
                    </linearGradient>
                    <radialGradient id="lhDrop${sfx}" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stop-color="#FFFFFF"/>
                        <stop offset="45%" stop-color="#BAE6FD"/>
                        <stop offset="100%" stop-color="#38BDF8"/>
                    </radialGradient>
                </defs>
                <!-- 底部立体内折阴影，贴合蛙蛙头顶弧度 -->
                <path d="M12 38 C26 46, 70 46, 84 38 C76 45, 20 45, 12 38 Z" fill="url(#lhUnder${sfx})"/>
                <!-- 俏皮卷曲嫩茎与迷你粉莲花苞 -->
                <path d="M47 16 C48 7, 55 5, 59 9" stroke="#10B981" stroke-width="3.2" stroke-linecap="round"/>
                <path d="M61 5 C57 8, 57 12, 60 13 C63 13, 65 9, 61 5 Z" fill="#F472B6"/>
                <path d="M61 6 C59 8.5, 59 11, 60.5 12" stroke="#FBCFE8" stroke-width="1" stroke-linecap="round"/>
                <!-- 3D 波浪荷叶主体 -->
                <path d="M8 37 C13 18, 30 12, 48 13 C66 12, 83 18, 88 37 C80 43, 70 38, 61 42 C53 45, 43 45, 35 42 C26 38, 16 43, 8 37 Z" fill="url(#lhTop${sfx})" stroke="#6EE7B7" stroke-width="1.3"/>
                <!-- 柔和叶脉高光 -->
                <path d="M48 16 C48 24, 48 33, 48 42" stroke="#D1FAE5" stroke-width="1.5" stroke-linecap="round" opacity="0.72"/>
                <path d="M48 17 C39 23, 30 30, 23 36" stroke="#D1FAE5" stroke-width="1.3" stroke-linecap="round" opacity="0.68"/>
                <path d="M48 17 C57 23, 66 30, 73 36" stroke="#D1FAE5" stroke-width="1.3" stroke-linecap="round" opacity="0.68"/>
                <path d="M48 19 C34 22, 21 28, 13 35" stroke="#A7F3D0" stroke-width="1.1" stroke-linecap="round" opacity="0.55"/>
                <path d="M48 19 C62 22, 75 28, 83 35" stroke="#A7F3D0" stroke-width="1.1" stroke-linecap="round" opacity="0.55"/>
                <!-- 晶莹3D滚动露珠 -->
                <ellipse cx="30" cy="30.5" rx="5" ry="3.2" fill="#065F46" opacity="0.28"/>
                <ellipse cx="29.5" cy="29" rx="4.8" ry="3.3" fill="url(#lhDrop${sfx})"/>
                <circle cx="28" cy="27.8" r="1.3" fill="#FFFFFF"/>
                <ellipse cx="65.5" cy="32" rx="3.2" ry="2.2" fill="url(#lhDrop${sfx})"/>
                <circle cx="64.6" cy="31.2" r="0.9" fill="#FFFFFF"/>
            </svg>`;
    }
    if (accId === 'lotus_umbrella') {
        const w = compact ? 42 : 84;
        const h = compact ? 42 : 84;
        return `
            <svg class="lotus-svg-art" width="${w}" height="${h}" viewBox="0 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="luCanopy${sfx}" cx="45%" cy="24%" r="68%">
                        <stop offset="0%" stop-color="#BBF7D0"/>
                        <stop offset="45%" stop-color="#34D399"/>
                        <stop offset="85%" stop-color="#059669"/>
                        <stop offset="100%" stop-color="#065F46"/>
                    </radialGradient>
                    <linearGradient id="luStem${sfx}" x1="26" y1="28" x2="46" y2="80" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#34D399"/>
                        <stop offset="100%" stop-color="#047857"/>
                    </linearGradient>
                    <radialGradient id="luDrop${sfx}" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stop-color="#FFFFFF"/>
                        <stop offset="50%" stop-color="#BAE6FD"/>
                        <stop offset="100%" stop-color="#38BDF8"/>
                    </radialGradient>
                </defs>
                <!-- 伞盖内部深绿立体阴影 -->
                <ellipse cx="45" cy="34" rx="31" ry="8" fill="#064E3B" opacity="0.55"/>
                <!-- 翡翠竹节弯柄 -->
                <path d="M46 28 L36 74 C34.8 80.5, 25.5 80.5, 24.8 73.5" stroke="url(#luStem${sfx})" stroke-width="4.4" stroke-linecap="round"/>
                <path d="M45 32 L35.5 73" stroke="#A7F3D0" stroke-width="1.2" stroke-linecap="round" opacity="0.65"/>
                <!-- 荷叶伞面 -->
                <path d="M9 33 C15 14, 32 9, 48 11 C64 13, 79 21, 83 37 C74 42, 64 36, 54 40 C45 43, 36 38, 26 40 C17 41, 12 37, 9 33 Z" fill="url(#luCanopy${sfx})" stroke="#6EE7B7" stroke-width="1.3"/>
                <path d="M47 14 L45 38 M47 15 C37 21, 27 28, 20 35 M47 15 C57 22, 66 29, 73 36" stroke="#D1FAE5" stroke-width="1.3" stroke-linecap="round" opacity="0.72"/>
                <!-- 伞顶粉莲花苞 -->
                <path d="M48 3 C43.5 8.5, 44.5 13.5, 48 14.5 C51.5 13.5, 52.5 8.5, 48 3 Z" fill="#F472B6"/>
                <path d="M43 7 C42 11, 44.5 14, 47.5 14.5 C46 11.5, 45 9, 43 7 Z" fill="#FBCFE8"/>
                <path d="M53 7 C54 11, 51.5 14, 48.5 14.5 C50 11.5, 51 9, 53 7 Z" fill="#FBCFE8"/>
                <!-- 伞檐垂落晶莹露珠 -->
                <path d="M15 39 C12.8 42.5, 13.2 45.5, 15 45.5 C16.8 45.5, 17.2 42.5, 15 39 Z" fill="url(#luDrop${sfx})"/>
                <path d="M77 42 C75 45.2, 75.4 48, 77 48 C78.6 48, 79 45.2, 77 42 Z" fill="url(#luDrop${sfx})"/>
            </svg>`;
    }
    if (accId === 'lotus_crown') {
        const w = compact ? 44 : 80;
        const h = compact ? 30 : 52;
        return `
            <svg class="lotus-svg-art lotus-hat-breathe" width="${w}" height="${h}" viewBox="0 0 90 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="lcPetalMain${sfx}" x1="45" y1="7" x2="45" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FFF1F2"/>
                        <stop offset="45%" stop-color="#F472B6"/>
                        <stop offset="100%" stop-color="#DB2777"/>
                    </linearGradient>
                    <linearGradient id="lcPetalSide${sfx}" x1="25" y1="14" x2="65" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FCE7F3"/>
                        <stop offset="65%" stop-color="#F9A8D4"/>
                        <stop offset="100%" stop-color="#EC4899"/>
                    </linearGradient>
                    <linearGradient id="lcLeaf${sfx}" x1="12" y1="32" x2="78" y2="46" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#6EE7B7"/>
                        <stop offset="50%" stop-color="#10B981"/>
                        <stop offset="100%" stop-color="#047857"/>
                    </linearGradient>
                </defs>
                <!-- 双侧翡翠荷叶托盘 -->
                <ellipse cx="27" cy="39" rx="19" ry="7.5" transform="rotate(-11 27 39)" fill="url(#lcLeaf${sfx})" stroke="#A7F3D0" stroke-width="1.2"/>
                <ellipse cx="63" cy="39" rx="19" ry="7.5" transform="rotate(11 63 39)" fill="url(#lcLeaf${sfx})" stroke="#A7F3D0" stroke-width="1.2"/>
                <!-- 后层柔粉莲瓣 -->
                <path d="M23 23 C22 32, 30 38, 42 40 C36 32, 31 25, 23 23 Z" fill="url(#lcPetalSide${sfx})"/>
                <path d="M67 23 C68 32, 60 38, 48 40 C54 32, 59 25, 67 23 Z" fill="url(#lcPetalSide${sfx})"/>
                <!-- 中层莲瓣 -->
                <path d="M32 14 C29 25, 34 35, 44 40 C41 30, 38 20, 32 14 Z" fill="url(#lcPetalSide${sfx})" stroke="#FFF1F2" stroke-width="1"/>
                <path d="M58 14 C61 25, 56 35, 46 40 C49 30, 52 20, 58 14 Z" fill="url(#lcPetalSide${sfx})" stroke="#FFF1F2" stroke-width="1"/>
                <!-- 主莲瓣与金珠花蕊 -->
                <path d="M45 8 C37 18, 36 31, 45 40 C54 31, 53 18, 45 8 Z" fill="url(#lcPetalMain${sfx})" stroke="#FFF1F2" stroke-width="1.2"/>
                <circle cx="45" cy="32" r="4.2" fill="#FBBF24"/>
                <circle cx="43.8" cy="30.8" r="1.4" fill="#FEF9C3"/>
            </svg>`;
    }
    if (accId === 'crown') {
        const w = compact ? 38 : 66;
        const h = compact ? 28 : 48;
        return `
            <svg class="lotus-svg-art lotus-hat-breathe" width="${w}" height="${h}" viewBox="0 0 76 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="crGold${sfx}" x1="12" y1="8" x2="64" y2="48" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FEF08A"/>
                        <stop offset="45%" stop-color="#FBBF24"/>
                        <stop offset="100%" stop-color="#D97706"/>
                    </linearGradient>
                </defs>
                <path d="M12 42 L8 18 L25 28 L38 10 L51 28 L68 18 L64 42 C50 47, 26 47, 12 42 Z" fill="url(#crGold${sfx})" stroke="#FFFBEB" stroke-width="1.6" stroke-linejoin="round"/>
                <path d="M13 38 C28 42, 48 42, 63 38" stroke="#B45309" stroke-width="2" opacity="0.45"/>
                <circle cx="8" cy="16" r="3.5" fill="#FEF08A" stroke="#F59E0B" stroke-width="1"/>
                <circle cx="38" cy="8" r="4.2" fill="#FEF08A" stroke="#F59E0B" stroke-width="1"/>
                <circle cx="68" cy="16" r="3.5" fill="#FEF08A" stroke="#F59E0B" stroke-width="1"/>
                <polygon points="38,24 42,30 38,36 34,30" fill="#F43F5E" stroke="#FFE4E6" stroke-width="1"/>
                <circle cx="22" cy="33" r="2.8" fill="#38BDF8" stroke="#E0F2FE" stroke-width="0.9"/>
                <circle cx="54" cy="33" r="2.8" fill="#34D399" stroke="#D1FAE5" stroke-width="0.9"/>
            </svg>`;
    }
    if (accId === 'sunglasses') {
        const w = compact ? 42 : 92;
        const h = compact ? 20 : 38;
        return `
            <svg class="lotus-svg-art" width="${w}" height="${h}" viewBox="0 0 104 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="sgLens${sfx}" x1="12" y1="8" x2="44" y2="34" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#312E81"/>
                        <stop offset="55%" stop-color="#1E1B4B"/>
                        <stop offset="100%" stop-color="#4C1D95"/>
                    </linearGradient>
                </defs>
                <path d="M4 14 H98" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
                <rect x="10" y="9" width="36" height="24" rx="10" fill="url(#sgLens${sfx})" stroke="#FDE68A" stroke-width="2.2"/>
                <rect x="58" y="9" width="36" height="24" rx="10" fill="url(#sgLens${sfx})" stroke="#FDE68A" stroke-width="2.2"/>
                <path d="M46 16 Q52 12 58 16" stroke="#FBBF24" stroke-width="3.2" stroke-linecap="round"/>
                <path d="M18 14 L28 28 M25 14 L32 24" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity="0.55"/>
                <path d="M66 14 L76 28 M73 14 L80 24" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity="0.55"/>
            </svg>`;
    }
    if (accId === 'ribbon') {
        const w = compact ? 38 : 68;
        const h = compact ? 26 : 44;
        return `
            <svg class="lotus-svg-art lotus-hat-breathe" width="${w}" height="${h}" viewBox="0 0 78 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="rbPink${sfx}" x1="10" y1="8" x2="68" y2="42" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FBCFE8"/>
                        <stop offset="50%" stop-color="#F472B6"/>
                        <stop offset="100%" stop-color="#E11D48"/>
                    </linearGradient>
                </defs>
                <path d="M33 30 L22 46 L31 43 L36 33 Z" fill="#BE185D"/>
                <path d="M45 30 L56 46 L47 43 L42 33 Z" fill="#BE185D"/>
                <path d="M38 25 C28 10, 8 10, 10 26 C12 40, 29 38, 38 27 Z" fill="url(#rbPink${sfx})" stroke="#FFF1F2" stroke-width="1.5"/>
                <path d="M40 25 C50 10, 70 10, 68 26 C66 40, 49 38, 40 27 Z" fill="url(#rbPink${sfx})" stroke="#FFF1F2" stroke-width="1.5"/>
                <ellipse cx="39" cy="26" rx="7" ry="6.5" fill="#FB7185" stroke="#FFF1F2" stroke-width="1.5"/>
                <circle cx="37" cy="24" r="2" fill="#FFE4E6"/>
            </svg>`;
    }
    if (accId === 'wizard') {
        const w = compact ? 40 : 76;
        const h = compact ? 28 : 48;
        return `
            <svg class="lotus-svg-art" width="${w}" height="${h}" viewBox="0 0 88 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="wzCap${sfx}" x1="12" y1="8" x2="76" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#4C1D95"/>
                        <stop offset="100%" stop-color="#1E1B4B"/>
                    </linearGradient>
                </defs>
                <path d="M24 27 V38 C24 44, 64 44, 64 38 V27" fill="#312E81" stroke="#FBBF24" stroke-width="1.6"/>
                <polygon points="44,8 82,22 44,35 6,22" fill="url(#wzCap${sfx})" stroke="#C4B5FD" stroke-width="1.5"/>
                <path d="M44 21 L68 27 V41" stroke="#FBBF24" stroke-width="2.4" stroke-linecap="round"/>
                <circle cx="68" cy="42" r="3.2" fill="#F59E0B"/>
                <circle cx="44" cy="21" r="2.8" fill="#FDE047"/>
            </svg>`;
    }
    if (accId === 'flower') {
        const w = compact ? 40 : 74;
        const h = compact ? 28 : 46;
        return `
            <svg class="lotus-svg-art lotus-hat-breathe" width="${w}" height="${h}" viewBox="0 0 84 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="22" cy="32" rx="12" ry="6" transform="rotate(-18 22 32)" fill="#10B981"/>
                <ellipse cx="62" cy="32" rx="12" ry="6" transform="rotate(18 62 32)" fill="#10B981"/>
                <circle cx="27" cy="28" r="8" fill="#FDE047" stroke="#FFFBEB" stroke-width="1.2"/>
                <circle cx="27" cy="28" r="2.8" fill="#F97316"/>
                <circle cx="57" cy="28" r="8" fill="#F472B6" stroke="#FFF1F2" stroke-width="1.2"/>
                <circle cx="57" cy="28" r="2.8" fill="#FDE047"/>
                <circle cx="42" cy="23" r="10.5" fill="#FB7185" stroke="#FFF1F2" stroke-width="1.4"/>
                <circle cx="42" cy="23" r="3.8" fill="#FEF08A"/>
            </svg>`;
    }
    if (accId === 'medal') {
        const w = compact ? 38 : 66;
        const h = compact ? 34 : 52;
        return `
            <svg class="lotus-svg-art lotus-hat-breathe" width="${w}" height="${h}" viewBox="0 0 74 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="stGold${sfx}" x1="20" y1="6" x2="54" y2="44" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FEF9C3"/>
                        <stop offset="50%" stop-color="#FACC15"/>
                        <stop offset="100%" stop-color="#EA580C"/>
                    </linearGradient>
                </defs>
                <path d="M18 44 C26 36, 48 36, 56 44" stroke="#FDE047" stroke-width="3" stroke-linecap="round"/>
                <polygon points="37,6 43.5,19 58,21 47.5,31 50,45 37,38.2 24,45 26.5,31 16,21 30.5,19" fill="url(#stGold${sfx})" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round"/>
                <circle cx="34" cy="22" r="2.4" fill="#FFFFFF" opacity="0.85"/>
            </svg>`;
    }
    const accObj = getAccessoryById(accId);
    return accObj ? `<span>${accObj.icon}</span>` : '';
}

function renderStagePedestalHtml(stage, petMeta) {
    const c1 = petMeta.auraColor || '#9d7aff';
    const c2 = petMeta.auraSecondary || '#ff7eb3';
    if (stage <= 1) {
        return `
            <svg class="stage-pedestal-svg" viewBox="0 0 280 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="pedLv1Glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="${c1}" stop-opacity="0.22"/>
                        <stop offset="58%" stop-color="#FFFFFF" stop-opacity="0.45"/>
                        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
                    </radialGradient>
                </defs>
                <ellipse cx="140" cy="46" rx="92" ry="22" fill="url(#pedLv1Glow)"/>
            </svg>`;
    }
    if (stage === 2) {
        return `
            <svg class="stage-pedestal-svg" viewBox="0 0 280 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="pedLv2Pool" cx="50%" cy="48%" r="52%">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.82"/>
                        <stop offset="55%" stop-color="${c1}" stop-opacity="0.24"/>
                        <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
                    </radialGradient>
                    <linearGradient id="pedLv2Rim" x1="36" y1="46" x2="244" y2="46" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="${c1}" stop-opacity="0"/>
                        <stop offset="28%" stop-color="#FFFFFF" stop-opacity="0.85"/>
                        <stop offset="50%" stop-color="${c1}" stop-opacity="0.55"/>
                        <stop offset="72%" stop-color="#FFFFFF" stop-opacity="0.85"/>
                        <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <ellipse cx="140" cy="46" rx="108" ry="26" fill="url(#pedLv2Pool)"/>
                <ellipse class="ped-ripple-wave" cx="140" cy="47" rx="94" ry="20" stroke="url(#pedLv2Rim)" stroke-width="1.6"/>
                <ellipse class="ped-ripple-wave delay" cx="140" cy="47" rx="112" ry="25" stroke="url(#pedLv2Rim)" stroke-width="1.1"/>
            </svg>`;
    }
    if (stage === 3) {
        return `
            <svg class="stage-pedestal-svg" viewBox="0 0 296 92" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="pedLv3Disc" cx="50%" cy="42%" r="52%">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.92"/>
                        <stop offset="56%" stop-color="${c1}" stop-opacity="0.30"/>
                        <stop offset="86%" stop-color="${c2}" stop-opacity="0.16"/>
                        <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
                    </radialGradient>
                    <linearGradient id="pedLv3Arc" x1="34" y1="52" x2="262" y2="52" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
                        <stop offset="22%" stop-color="#FFFFFF" stop-opacity="0.9"/>
                        <stop offset="50%" stop-color="${c1}" stop-opacity="0.72"/>
                        <stop offset="78%" stop-color="#FFFFFF" stop-opacity="0.9"/>
                        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <ellipse cx="148" cy="48" rx="122" ry="29" fill="url(#pedLv3Disc)"/>
                <!-- 柔和前缘流光弧（两端渐隐，绝无生硬闭合框） -->
                <path d="M40 50 C74 69, 222 69, 256 50" stroke="url(#pedLv3Arc)" stroke-width="2.2" stroke-linecap="round"/>
                <path d="M62 57 C98 72, 198 72, 234 57" stroke="url(#pedLv3Arc)" stroke-width="1.2" stroke-linecap="round" opacity="0.75"/>
                <!-- 四芒星微光点缀 -->
                <path class="svg-star-twinkle s1" d="M84 62 Q84 66 88 66 Q84 66 84 70 Q84 66 80 66 Q84 66 84 62 Z" fill="#FFFFFF"/>
                <path class="svg-star-twinkle s2" d="M148 66 Q148 71 153 71 Q148 71 148 76 Q148 71 143 71 Q148 71 148 66 Z" fill="#FDE68A"/>
                <path class="svg-star-twinkle s3" d="M212 62 Q212 66 216 66 Q212 66 212 70 Q212 66 208 66 Q212 66 212 62 Z" fill="#FFFFFF"/>
            </svg>`;
    }
    if (stage === 4) {
        return `
            <svg class="stage-pedestal-svg" viewBox="0 0 308 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="pedLv4Gold" cx="50%" cy="44%" r="52%">
                        <stop offset="0%" stop-color="#FFFBEB" stop-opacity="0.96"/>
                        <stop offset="50%" stop-color="#FDE68A" stop-opacity="0.48"/>
                        <stop offset="82%" stop-color="${c1}" stop-opacity="0.24"/>
                        <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
                    </radialGradient>
                    <linearGradient id="pedLv4CrownArc" x1="28" y1="54" x2="280" y2="54" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FBBF24" stop-opacity="0"/>
                        <stop offset="22%" stop-color="#FDE68A" stop-opacity="0.95"/>
                        <stop offset="50%" stop-color="#F59E0B" stop-opacity="0.88"/>
                        <stop offset="78%" stop-color="#FDE68A" stop-opacity="0.95"/>
                        <stop offset="100%" stop-color="#FBBF24" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <ellipse cx="154" cy="50" rx="132" ry="32" fill="url(#pedLv4Gold)"/>
                <ellipse cx="154" cy="47" rx="102" ry="22" fill="#FFFFFF" fill-opacity="0.5"/>
                <path d="M34 51 C72 74, 236 74, 274 51" stroke="url(#pedLv4CrownArc)" stroke-width="2.6" stroke-linecap="round"/>
                <path d="M54 60 C96 78, 212 78, 254 60" stroke="url(#pedLv4CrownArc)" stroke-width="1.4" stroke-linecap="round"/>
                <path class="svg-star-twinkle s1" d="M72 62 Q72 67 77 67 Q72 67 72 72 Q72 67 67 67 Q72 67 72 62 Z" fill="#FEF08A"/>
                <path class="svg-star-twinkle s2" d="M154 68 Q154 74 160 74 Q154 74 154 80 Q154 74 148 74 Q154 74 154 68 Z" fill="#FBBF24"/>
                <path class="svg-star-twinkle s3" d="M236 62 Q236 67 241 67 Q236 67 236 72 Q236 67 231 67 Q236 67 236 62 Z" fill="#FEF08A"/>
            </svg>`;
    }
    // Stage 5: 虹彩流光云端圣座
    return `
        <svg class="stage-pedestal-svg" viewBox="0 0 320 102" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="pedLv5Aurora" cx="50%" cy="46%" r="52%">
                    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.98"/>
                    <stop offset="38%" stop-color="#FEF08A" stop-opacity="0.62"/>
                    <stop offset="68%" stop-color="${c2}" stop-opacity="0.34"/>
                    <stop offset="88%" stop-color="${c1}" stop-opacity="0.22"/>
                    <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
                </radialGradient>
                <linearGradient id="pedLv5Cloud" x1="160" y1="36" x2="160" y2="82" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
                    <stop offset="100%" stop-color="#F3E8FF" stop-opacity="0.72"/>
                </linearGradient>
                <linearGradient id="pedLv5GoldTrim" x1="36" y1="60" x2="284" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#FBBF24" stop-opacity="0"/>
                    <stop offset="20%" stop-color="#FDE047" stop-opacity="0.95"/>
                    <stop offset="50%" stop-color="#F472B6" stop-opacity="0.9"/>
                    <stop offset="80%" stop-color="#FDE047" stop-opacity="0.95"/>
                    <stop offset="100%" stop-color="#FBBF24" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <ellipse cx="160" cy="54" rx="142" ry="35" fill="url(#pedLv5Aurora)"/>
            <!-- 绵软3D祥云托座前缘 -->
            <path d="M52 56 C52 47, 68 44, 79 50 C88 42, 110 43, 120 51 C134 41, 156 41, 168 50 C180 42, 202 42, 212 51 C224 44, 244 46, 248 56 C244 68, 212 74, 160 75 C108 74, 58 68, 52 56 Z" fill="url(#pedLv5Cloud)"/>
            <path d="M36 58 C78 82, 242 82, 284 58" stroke="url(#pedLv5GoldTrim)" stroke-width="2.8" stroke-linecap="round"/>
            <!-- 圣座星钻与璀璨四芒星 -->
            <polygon points="160,64 165,70 160,76 155,70" fill="#FBBF24" stroke="#FFFFFF" stroke-width="1"/>
            <path class="svg-star-twinkle s1" d="M98 66 Q98 71 103 71 Q98 71 98 76 Q98 71 93 71 Q98 71 98 66 Z" fill="#FDE047"/>
            <path class="svg-star-twinkle s3" d="M222 66 Q222 71 227 71 Q222 71 222 76 Q222 71 217 71 Q222 71 222 66 Z" fill="#FDE047"/>
        </svg>`;
}

function renderStageBackAuraHtml(stage, petMeta) {
    const c1 = petMeta.auraColor || '#9d7aff';
    const c2 = petMeta.auraSecondary || '#ff7eb3';
    if (stage <= 1) {
        return '';
    }
    if (stage === 2) {
        return `
            <svg class="stage-aura-svg" viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="auraLv2Bloom" cx="50%" cy="52%" r="46%">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.72"/>
                        <stop offset="52%" stop-color="${c1}" stop-opacity="0.20"/>
                        <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
                    </radialGradient>
                </defs>
                <circle cx="150" cy="134" r="98" fill="url(#auraLv2Bloom)"/>
                <circle class="aura-bokeh-dot b1" cx="76" cy="96" r="4.5" fill="#FFFFFF" fill-opacity="0.75"/>
                <circle class="aura-bokeh-dot b2" cx="226" cy="106" r="3.8" fill="${c1}" fill-opacity="0.45"/>
                <path class="svg-star-twinkle s1" d="M84 68 Q84 74 90 74 Q84 74 84 80 Q84 74 78 74 Q84 74 84 68 Z" fill="#FFFFFF"/>
                <path class="svg-star-twinkle s2" d="M218 74 Q218 79 223 79 Q218 79 218 84 Q218 79 213 79 Q218 79 218 74 Z" fill="#FEF08A"/>
            </svg>`;
    }
    if (stage === 3) {
        // 绝无虚线框！采用两端柔滑渐隐的新月彗星光带 + 梦幻散景光斑 + 闪烁四芒星
        return `
            <svg class="stage-aura-svg" viewBox="0 0 320 270" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="auraLv3Bloom" cx="50%" cy="52%" r="48%">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.86"/>
                        <stop offset="48%" stop-color="${c1}" stop-opacity="0.25"/>
                        <stop offset="78%" stop-color="${c2}" stop-opacity="0.12"/>
                        <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
                    </radialGradient>
                    <linearGradient id="auraLv3RibbonL" x1="56" y1="196" x2="126" y2="44" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="${c1}" stop-opacity="0"/>
                        <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.82"/>
                        <stop offset="80%" stop-color="${c1}" stop-opacity="0.52"/>
                        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
                    </linearGradient>
                    <linearGradient id="auraLv3RibbonR" x1="264" y1="74" x2="194" y2="220" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="${c2}" stop-opacity="0"/>
                        <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.82"/>
                        <stop offset="80%" stop-color="${c2}" stop-opacity="0.48"/>
                        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <circle cx="160" cy="138" r="112" fill="url(#auraLv3Bloom)"/>
                <g class="aura-orbit-slow">
                    <!-- 丝滑渐隐流光丝带（无任何生硬虚线或闭合圈） -->
                    <path d="M64 176 C46 118, 82 58, 138 46 C92 64, 62 118, 74 172 Z" fill="url(#auraLv3RibbonL)"/>
                    <path d="M256 96 C274 154, 238 214, 182 226 C228 208, 258 154, 246 100 Z" fill="url(#auraLv3RibbonR)"/>
                </g>
                <circle class="aura-bokeh-dot b1" cx="68" cy="112" r="6" fill="#FFFFFF" fill-opacity="0.65"/>
                <circle class="aura-bokeh-dot b2" cx="248" cy="148" r="5" fill="#FEF9C3" fill-opacity="0.7"/>
                <circle class="aura-bokeh-dot b3" cx="228" cy="72" r="4" fill="${c1}" fill-opacity="0.4"/>
                <path class="svg-star-twinkle s1" d="M84 62 Q84 69 91 69 Q84 69 84 76 Q84 69 77 69 Q84 69 84 62 Z" fill="#FFFFFF"/>
                <path class="svg-star-twinkle s2" d="M238 82 Q238 88 244 88 Q238 88 238 94 Q238 88 232 88 Q238 88 238 82 Z" fill="#FDE68A"/>
                <path class="svg-star-twinkle s3" d="M74 184 Q74 189 79 189 Q74 189 74 194 Q74 189 69 189 Q74 189 74 184 Z" fill="#FFFFFF"/>
            </svg>`;
    }
    if (stage === 4) {
        return `
            <svg class="stage-aura-svg" viewBox="0 0 330 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="auraLv4Sun" cx="50%" cy="52%" r="50%">
                        <stop offset="0%" stop-color="#FFFBEB" stop-opacity="0.92"/>
                        <stop offset="45%" stop-color="#FDE68A" stop-opacity="0.42"/>
                        <stop offset="76%" stop-color="${c1}" stop-opacity="0.18"/>
                        <stop offset="100%" stop-color="#FBBF24" stop-opacity="0"/>
                    </radialGradient>
                    <linearGradient id="auraLv4Arc" x1="56" y1="60" x2="274" y2="220" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FDE68A" stop-opacity="0"/>
                        <stop offset="30%" stop-color="#FEF08A" stop-opacity="0.9"/>
                        <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.95"/>
                        <stop offset="70%" stop-color="#FBBF24" stop-opacity="0.85"/>
                        <stop offset="100%" stop-color="#FDE68A" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <circle cx="165" cy="142" r="122" fill="url(#auraLv4Sun)"/>
                <!-- 柔和晨曦光芒束 -->
                <g class="aura-orbit-slow" opacity="0.42">
                    <polygon points="165,142 150,24 180,24" fill="url(#auraLv4Sun)"/>
                    <polygon points="165,142 268,66 282,92" fill="url(#auraLv4Sun)"/>
                    <polygon points="165,142 282,188 266,214" fill="url(#auraLv4Sun)"/>
                    <polygon points="165,142 64,214 48,188" fill="url(#auraLv4Sun)"/>
                    <polygon points="165,142 48,92 64,66" fill="url(#auraLv4Sun)"/>
                </g>
                <!-- 纤细鎏金新月星轨（两端自然消隐） -->
                <path d="M62 126 A104 104 0 0 1 252 84" stroke="url(#auraLv4Arc)" stroke-width="2" stroke-linecap="round"/>
                <path d="M268 158 A104 104 0 0 1 78 200" stroke="url(#auraLv4Arc)" stroke-width="1.6" stroke-linecap="round"/>
                <path class="svg-star-twinkle s1" d="M165 26 Q165 34 173 34 Q165 34 165 42 Q165 34 157 34 Q165 34 165 26 Z" fill="#FBBF24"/>
                <path class="svg-star-twinkle s2" d="M64 82 Q64 89 71 89 Q64 89 64 96 Q64 89 57 89 Q64 89 64 82 Z" fill="#FEF08A"/>
                <path class="svg-star-twinkle s3" d="M266 86 Q266 93 273 93 Q266 93 266 100 Q266 93 259 93 Q266 93 266 86 Z" fill="#FEF08A"/>
            </svg>`;
    }
    // Stage 5: 精细雕琢多层半透明珍珠鎏金羽翼 + 虹彩极光圣环
    return `
        <svg class="stage-aura-svg stage-aura-lv5-svg" viewBox="0 0 360 286" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="auraLv5Halo" cx="50%" cy="52%" r="48%">
                    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
                    <stop offset="38%" stop-color="#FEF08A" stop-opacity="0.52"/>
                    <stop offset="68%" stop-color="${c2}" stop-opacity="0.28"/>
                    <stop offset="88%" stop-color="${c1}" stop-opacity="0.18"/>
                    <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
                </radialGradient>
                <linearGradient id="wingPlumeL" x1="22" y1="78" x2="148" y2="176" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.96"/>
                    <stop offset="55%" stop-color="#FEF3C7" stop-opacity="0.88"/>
                    <stop offset="100%" stop-color="${c2}" stop-opacity="0.55"/>
                </linearGradient>
                <linearGradient id="wingPlumeR" x1="338" y1="78" x2="212" y2="176" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.96"/>
                    <stop offset="55%" stop-color="#FEF3C7" stop-opacity="0.88"/>
                    <stop offset="100%" stop-color="${c1}" stop-opacity="0.55"/>
                </linearGradient>
                <linearGradient id="auraLv5CrownArc" x1="76" y1="48" x2="284" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#FDE047" stop-opacity="0"/>
                    <stop offset="50%" stop-color="#FBBF24" stop-opacity="0.92"/>
                    <stop offset="100%" stop-color="#FDE047" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <circle cx="180" cy="146" r="128" fill="url(#auraLv5Halo)"/>
            <!-- 顶部柔光圣冕弧 -->
            <path d="M88 64 C124 32, 236 32, 272 64" stroke="url(#auraLv5CrownArc)" stroke-width="2.4" stroke-linecap="round"/>
            <!-- 左翼：三层流光灵羽 -->
            <g class="fairy-wing-left">
                <path d="M132 138 C92 98, 46 86, 22 96 C32 120, 68 142, 124 154 Z" fill="url(#wingPlumeL)" stroke="#FFFFFF" stroke-width="1.5"/>
                <path d="M130 152 C88 130, 48 128, 30 140 C46 158, 82 168, 126 166 Z" fill="url(#wingPlumeL)" stroke="#FFFFFF" stroke-width="1.4"/>
                <path d="M132 164 C98 156, 66 160, 52 174 C70 184, 100 184, 130 176 Z" fill="url(#wingPlumeL)" stroke="#FFFFFF" stroke-width="1.2"/>
            </g>
            <!-- 右翼：三层流光灵羽 -->
            <g class="fairy-wing-right">
                <path d="M228 138 C268 98, 314 86, 338 96 C328 120, 292 142, 236 154 Z" fill="url(#wingPlumeR)" stroke="#FFFFFF" stroke-width="1.5"/>
                <path d="M230 152 C272 130, 312 128, 330 140 C314 158, 278 168, 234 166 Z" fill="url(#wingPlumeR)" stroke="#FFFFFF" stroke-width="1.4"/>
                <path d="M228 164 C262 156, 294 160, 308 174 C290 184, 260 184, 230 176 Z" fill="url(#wingPlumeR)" stroke="#FFFFFF" stroke-width="1.2"/>
            </g>
            <!-- 璀璨星芒粒子 -->
            <path class="svg-star-twinkle s1" d="M180 24 Q180 32 188 32 Q180 32 180 40 Q180 32 172 32 Q180 32 180 24 Z" fill="#FBBF24"/>
            <path class="svg-star-twinkle s2" d="M56 66 Q56 73 63 73 Q56 73 56 80 Q56 73 49 73 Q56 73 56 66 Z" fill="#FFFFFF"/>
            <path class="svg-star-twinkle s3" d="M304 66 Q304 73 311 73 Q304 73 304 80 Q304 73 297 73 Q304 73 304 66 Z" fill="#FEF08A"/>
        </svg>`;
}

function renderStagePropVisualHtml(icon, idx, petMeta) {
    const uid = `${petMeta.id}_${idx}`;
    if (icon === '💧') {
        return `
            <svg class="prop-mini-svg" width="32" height="36" viewBox="0 0 34 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="dropG_${uid}" cx="36%" cy="34%" r="68%">
                        <stop offset="0%" stop-color="#FFFFFF"/>
                        <stop offset="38%" stop-color="#7DD3FC"/>
                        <stop offset="82%" stop-color="#0EA5E9"/>
                        <stop offset="100%" stop-color="#0284C7"/>
                    </radialGradient>
                </defs>
                <path d="M17 4 C17 4, 6 17, 6 24.5 C6 30.8, 10.9 35.5, 17 35.5 C23.1 35.5, 28 30.8, 28 24.5 C28 17, 17 4, 17 4 Z" fill="url(#dropG_${uid})" stroke="#E0F2FE" stroke-width="1.2"/>
                <ellipse cx="13" cy="21" rx="2.6" ry="4.2" transform="rotate(16 13 21)" fill="#FFFFFF" opacity="0.88"/>
                <circle cx="19.5" cy="29.5" r="1.6" fill="#BAE6FD" opacity="0.85"/>
            </svg>`;
    }
    if (icon === '🪷' || icon === '🌸') {
        return `
            <svg class="prop-mini-svg" width="38" height="32" viewBox="0 0 42 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="lotusP_${uid}" x1="21" y1="4" x2="21" y2="29" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FFF1F2"/>
                        <stop offset="52%" stop-color="#F472B6"/>
                        <stop offset="100%" stop-color="#DB2777"/>
                    </linearGradient>
                </defs>
                <ellipse cx="21" cy="28.5" rx="16" ry="4.8" fill="#34D399" opacity="0.85"/>
                <path d="M8 17 C8 24, 14 28, 21 29 C16 23, 13 18, 8 17 Z" fill="#FBCFE8"/>
                <path d="M34 17 C34 24, 28 28, 21 29 C26 23, 29 18, 34 17 Z" fill="#FBCFE8"/>
                <path d="M13 10 C11 19, 15 26, 21 29 C19 21, 17 14, 13 10 Z" fill="#F9A8D4" stroke="#FFF1F2" stroke-width="0.8"/>
                <path d="M29 10 C31 19, 27 26, 21 29 C23 21, 25 14, 29 10 Z" fill="#F9A8D4" stroke="#FFF1F2" stroke-width="0.8"/>
                <path d="M21 5 C15 13, 15 23, 21 29 C27 23, 27 13, 21 5 Z" fill="url(#lotusP_${uid})" stroke="#FFF1F2" stroke-width="1"/>
                <circle cx="21" cy="23" r="2.8" fill="#FBBF24"/>
            </svg>`;
    }
    if (icon === '🎵') {
        return `
            <svg class="prop-mini-svg" width="32" height="34" viewBox="0 0 34 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="noteG_${uid}" x1="8" y1="4" x2="28" y2="32" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FDE047"/>
                        <stop offset="50%" stop-color="#F472B6"/>
                        <stop offset="100%" stop-color="#8B5CF6"/>
                    </linearGradient>
                </defs>
                <path d="M14 25 V8 L28 5 V22" stroke="url(#noteG_${uid})" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
                <ellipse cx="10.5" cy="26" rx="5" ry="3.8" transform="rotate(-18 10.5 26)" fill="url(#noteG_${uid})"/>
                <ellipse cx="24.5" cy="23" rx="5" ry="3.8" transform="rotate(-18 24.5 23)" fill="url(#noteG_${uid})"/>
            </svg>`;
    }
    // 其余各宠专属伴生灵物：包裹在晶莹半透明 3D 幻彩精灵泡泡球中，精致统一不突兀
    return `<span class="stage-prop-bubble"><span class="spb-icon">${icon}</span></span>`;
}

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

        // 萌宠个性发言与互动动画轮播状态
        this._interactStepIdx = 0;
        this._feedStepIdx = 0;
        this._cheerStepIdx = 0;
        this._activeSpeechOverride = null;

        // 单词收集册筛选与慢速自然拼读状态
        this.reportVocabFilter = 'all'; // 'all' | 'mastered' | 'unlearned'
        this.reportSlowPhonics = false;

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

        const accTag = (visitor.accessory && visitor.accessory !== 'none')
            ? ` ${getAccessoryById(visitor.accessory).icon || '🎀'}`
            : '';

        if (homeBtn) {
            homeBtn.style.display = 'flex';
            homeBtn.classList.toggle('has-gift', !visitor.giftClaimedToday);
            const img = document.getElementById('siblingHomePetImg');
            const title = document.getElementById('siblingHomeTitle');
            const sub = document.getElementById('siblingHomeSub');
            if (img) img.src = visitor.petMeta.img;
            if (title) title.textContent = `${visitor.siblingAvatar} ${visitor.siblingName}来串门${accTag}`;
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
            if (tTitle) tTitle.textContent = `${visitor.siblingAvatar} ${visitor.siblingName}带着【${visitor.petMeta.name}${accTag} Lv.${visitor.petLevel}】来串门`;
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
        soundEngine.speakAsPet(visitor.petMeta.id, {
            zhText: `嗨！我是${visitor.siblingName}养的${visitor.petMeta.name}，来找你一起玩啦！`,
            enText: visitor.petMeta.enGreeting || 'Hello friend!',
            preferEnglish: false
        });

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

    setHeroSpeech(text, durationMs = 5200) {
        const u = profileManager.getActiveUser();
        const petId = u.stageMode === 'shop'
            ? (u.shops[u.activeShopId]?.managerPetId || u.activePetId)
            : u.activePetId;
        this._activeSpeechOverride = {
            text,
            petId,
            mode: u.stageMode,
            expiresAt: Date.now() + durationMs
        };
        const bubble = document.getElementById('heroSpeechBubble');
        if (bubble) {
            bubble.textContent = text;
            bubble.classList.remove('speech-pop');
            void bubble.offsetWidth;
            bubble.classList.add('speech-pop');
        }
    }

    updateComboHud(combo) {
        const pill = document.getElementById('hudComboPill');
        const valEl = document.getElementById('hudComboVal');
        const leftMascot = document.getElementById('mascotLeftIcon');
        const rightMascot = document.getElementById('mascotRightIcon');
        const talkEl = document.getElementById('mascotTalkText');
        const u = profileManager.getActiveUser();
        const activePet = getPetById(u?.activePetId || 'rabbit');

        if (combo >= 2) {
            pill.style.display = 'inline-flex';
            valEl.textContent = `x${combo}`;
        } else {
            pill.style.display = 'none';
        }

        if (combo >= 5) {
            leftMascot.textContent = activePet.emoji;
            rightMascot.textContent = '👑';
            talkEl.textContent = `🔥 ${activePet.voiceTag || activePet.emoji} ${combo}连对超神！${activePet.name}为你摇旗呐喊！`;
        } else if (combo >= 3) {
            leftMascot.textContent = activePet.emoji;
            rightMascot.textContent = '✨';
            talkEl.textContent = `⚡ ${activePet.voiceTag || activePet.emoji} ${combo}连对狂热！${activePet.name}送你徽章加成！`;
        } else {
            leftMascot.textContent = activePet.emoji;
            rightMascot.textContent = activePet.id === 'frog' ? '🐰' : '🐸';
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

        const heroCard = document.querySelector('.hero-stage-card');
        const stageCenter = document.getElementById('heroDioramaStage');
        const pedestalEl = document.getElementById('heroStagePedestal');
        const auraEl = document.getElementById('heroStageBackAura');
        const propsLayer = document.getElementById('heroStagePropsLayer');
        const styleBarEl = document.getElementById('heroStageStyleBar');
        const mainSprite = document.getElementById('heroMainSprite');
        const subSprite = document.getElementById('heroManagerSubSprite');
        const accEl = document.getElementById('heroAccessoryBadge');
        const nurtureBtnIcon = document.getElementById('nurtureBtnIcon');
        const nurtureBtnText = document.getElementById('nurtureBtnText');
        const freeTreatBtn = document.getElementById('btnFreeTreatLv5');
        const freeTreatIcon = document.getElementById('freeTreatIcon');
        const tapHintTag = document.getElementById('heroTapHintTag');
        const leftMascot = document.getElementById('mascotLeftIcon');

        if (!isShopMode) {
            const petMeta = getPetById(u.activePetId);
            const pState = u.pets[u.activePetId] || { level: 1, exp: 0, accessory: 'none', displayStage: null };
            const effectiveStage = profileManager.getEffectivePetStage(u.activePetId, u);
            const stageStyle = getStageStyleMeta(effectiveStage);
            const maxExp = PET_LEVEL_MAX_EXP[pState.level] || 45;
            const pct = pState.level >= 5 ? 100 : Math.min(100, Math.max(6, Math.round((pState.exp / maxExp) * 100)));

            if (leftMascot) leftMascot.textContent = petMeta.emoji;
            if (heroCard) {
                heroCard.style.setProperty('--pet-aura', petMeta.auraColor || '#9d7aff');
                heroCard.style.setProperty('--pet-aura-sec', petMeta.auraSecondary || '#ff7eb3');
            }
            if (stageCenter) {
                stageCenter.dataset.stage = String(effectiveStage);
                stageCenter.dataset.pet = petMeta.id;
                stageCenter.style.setProperty('--pet-stage-scale', String(stageStyle.scale));
            }
            const stageRenderKey = `${petMeta.id}_${effectiveStage}`;
            if (pedestalEl) {
                pedestalEl.style.display = 'flex';
                pedestalEl.className = `pet-stage-pedestal ${stageStyle.pedestalClass}`;
                if (pedestalEl.dataset.renderKey !== stageRenderKey) {
                    pedestalEl.dataset.renderKey = stageRenderKey;
                    pedestalEl.innerHTML = renderStagePedestalHtml(effectiveStage, petMeta);
                }
            }
            if (auraEl) {
                auraEl.style.display = effectiveStage >= 2 ? 'flex' : 'none';
                auraEl.className = `pet-stage-back-aura ${stageStyle.auraClass}`;
                if (auraEl.dataset.renderKey !== stageRenderKey) {
                    auraEl.dataset.renderKey = stageRenderKey;
                    auraEl.innerHTML = renderStageBackAuraHtml(effectiveStage, petMeta);
                }
            }
            if (propsLayer) {
                propsLayer.style.display = 'block';
                if (propsLayer.dataset.renderKey !== stageRenderKey) {
                    propsLayer.dataset.renderKey = stageRenderKey;
                    const propsArr = (petMeta.stageProps || []).slice(0, stageStyle.propCount);
                    propsLayer.innerHTML = propsArr
                        .map((ic, idx) => `<span class="stage-prop-orb slot-${idx}">${renderStagePropVisualHtml(ic, idx, petMeta)}</span>`)
                        .join('');
                }
            }

            document.getElementById('heroTitle').textContent = petMeta.name;
            const stageTitle = petMeta.stageTitles[effectiveStage - 1] || petMeta.stageTitles[0];
            if (effectiveStage !== pState.level) {
                document.getElementById('heroStageSubtitle').textContent = `✨ ${stageTitle} (展示Lv.${effectiveStage}样式)`;
            } else {
                document.getElementById('heroStageSubtitle').textContent =
                    pState.level >= 5 ? `🎓 已毕业 · ${petMeta.stageTitles[4]}` : stageTitle;
            }
            document.getElementById('heroLvBadge').textContent = `Lv.${pState.level}`;
            document.getElementById('heroExpNums').textContent = pState.level >= 5 ? 'MAX 满级毕业' : `${pState.exp} / ${maxExp}`;
            document.getElementById('heroExpFill').style.width = `${pct}%`;

            // 渲染历代等级外观样式快捷切换条 (1~5级)
            if (styleBarEl) {
                styleBarEl.style.display = 'flex';
                styleBarEl.innerHTML = `<span class="stage-style-label">样式</span>`;
                for (let s = 1; s <= 5; s++) {
                    const unlocked = s <= pState.level;
                    const isActive = effectiveStage === s;
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = `stage-style-chip ${isActive ? 'active' : ''} ${unlocked ? '' : 'locked'}`;
                    chip.dataset.stagepick = String(s);
                    chip.title = unlocked
                        ? `点击切换为 Lv.${s} 样式：${petMeta.stageTitles[s - 1]}`
                        : `升至 Lv.${s} 解锁【${petMeta.stageTitles[s - 1]}】样式`;
                    chip.textContent = unlocked ? `Lv.${s}` : `${s}🔒`;
                    chip.onclick = () => {
                        if (!unlocked) {
                            soundEngine.playTap();
                            this.setHeroSpeech(`${petMeta.voiceTag || petMeta.emoji} 再喂我升级到 Lv.${s}，就能解锁【${petMeta.stageTitles[s - 1]}】新样式啦！✨`, 4500);
                            return;
                        }
                        profileManager.setPetDisplayStage(petMeta.id, s);
                        const stageLine = petMeta.talkLines[s - 1] || petMeta.talkLines[0];
                        soundEngine.speakAsPet(petMeta.id, { zhText: stageLine, withCry: true });
                        this.setHeroSpeech(`✨ 已切换 Lv.${s}【${petMeta.stageTitles[s - 1]}】样式：${stageLine}`, 5500);
                        this.renderHeroHomeView();
                        this.triggerPetRigAnimation('anim-stage-transform');
                        this.spawnStageEmotes(['✨', petMeta.stageProps?.[0] || '🌟']);
                    };
                    styleBarEl.appendChild(chip);
                }
            }

            mainSprite.src = petMeta.img;
            subSprite.style.display = 'none';
            if (tapHintTag) tapHintTag.textContent = '👆 点我摸摸头互动';

            if (pState.accessory && pState.accessory !== 'none') {
                const visualHtml = renderAccessoryVisualHtml(pState.accessory, false);
                accEl.className = `pet-accessory-floating ${getAccessoryPositionClass(pState.accessory)}`;
                accEl.innerHTML = visualHtml;
                accEl.style.display = visualHtml ? 'block' : 'none';
            } else {
                accEl.style.display = 'none';
            }

            if (pState.level >= 5) {
                nurtureBtnIcon.textContent = '🏪';
                nurtureBtnText.textContent = '已毕业·去开店';
                if (freeTreatBtn) {
                    freeTreatBtn.style.display = 'inline-flex';
                    if (freeTreatIcon) freeTreatIcon.textContent = petMeta.foodIcon || '🍓';
                }
            } else {
                nurtureBtnIcon.textContent = petMeta.foodIcon;
                nurtureBtnText.textContent = `喂${petMeta.foodName.slice(0, 4)} (-${FEED_BADGE_COST}🏅)`;
                if (freeTreatBtn) freeTreatBtn.style.display = 'none';
            }

            const ov = this._activeSpeechOverride;
            if (ov && ov.petId === petMeta.id && ov.mode === 'pet' && Date.now() < ov.expiresAt) {
                document.getElementById('heroSpeechBubble').textContent = ov.text;
            } else {
                const line = petMeta.talkLines[effectiveStage - 1] || petMeta.talkLines[0];
                document.getElementById('heroSpeechBubble').textContent = line;
            }
        } else {
            // 店铺经营展示模式（暖金繁华底座与光晕 + 点击收银互动）
            const shopMeta = getShopById(u.activeShopId);
            const sState = u.shops[u.activeShopId] || { level: 1, exp: 0, managerPetId: u.activePetId };
            const mgrPet = getPetById(sState.managerPetId || u.activePetId);
            const maxExp = SHOP_LEVEL_MAX_EXP[sState.level] || 45;
            const pct = sState.level >= 5 ? 100 : Math.min(100, Math.max(6, Math.round((sState.exp / maxExp) * 100)));

            if (leftMascot) leftMascot.textContent = mgrPet.emoji;
            if (heroCard) {
                heroCard.style.setProperty('--pet-aura', '#f59e0b');
                heroCard.style.setProperty('--pet-aura-sec', '#fb7185');
            }
            if (stageCenter) {
                stageCenter.dataset.stage = String(Math.min(5, Math.max(2, sState.level)));
                stageCenter.dataset.pet = mgrPet.id;
                stageCenter.style.setProperty('--pet-stage-scale', '1');
            }
            const shopRenderKey = `shop_${u.activeShopId}_${sState.level}`;
            const shopThemeMock = { auraColor: '#F59E0B', auraSecondary: '#FB7185' };
            if (pedestalEl) {
                pedestalEl.style.display = 'flex';
                pedestalEl.className = 'pet-stage-pedestal pedestal-lv4';
                if (pedestalEl.dataset.renderKey !== shopRenderKey) {
                    pedestalEl.dataset.renderKey = shopRenderKey;
                    pedestalEl.innerHTML = renderStagePedestalHtml(Math.min(5, Math.max(3, sState.level)), shopThemeMock);
                }
            }
            if (auraEl) {
                auraEl.style.display = 'flex';
                auraEl.className = 'pet-stage-back-aura aura-lv3';
                if (auraEl.dataset.renderKey !== shopRenderKey) {
                    auraEl.dataset.renderKey = shopRenderKey;
                    auraEl.innerHTML = renderStageBackAuraHtml(3, shopThemeMock);
                }
            }
            if (propsLayer) propsLayer.style.display = 'none';
            if (styleBarEl) styleBarEl.style.display = 'none';
            if (freeTreatBtn) freeTreatBtn.style.display = 'none';
            if (tapHintTag) tapHintTag.textContent = '👆 点店铺收银互动';

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
            const ov = this._activeSpeechOverride;
            if (ov && ov.petId === mgrPet.id && ov.mode === 'shop' && Date.now() < ov.expiresAt) {
                document.getElementById('heroSpeechBubble').textContent = ov.text;
            } else {
                const shopLine = mgrPet.shopLines?.[sState.level % (mgrPet.shopLines.length || 1)] ||
                    `${mgrPet.emoji} 欢迎光临${mgrPet.name}的${shopMeta.name}！答题越多生意越红火！`;
                document.getElementById('heroSpeechBubble').textContent = shopLine;
            }
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

            const hasEquippedAcc = pState.unlocked && pState.accessory && pState.accessory !== 'none';
            const accBadgeHtml = hasEquippedAcc
                ? `<span class="pet-card-acc-chip" title="已佩戴：${getAccessoryById(pState.accessory).name}">${renderAccessoryVisualHtml(pState.accessory, true)}</span>`
                : '';

            card.innerHTML = `
                ${topTag}
                ${accBadgeHtml}
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
                const effSt = profileManager.getEffectivePetStage(pet.id);
                const greetLine = pet.talkLines[effSt - 1] || pet.talkLines[0];
                if (res.action === 'unlocked') {
                    soundEngine.playLevelUp();
                    soundEngine.speakAsPet(pet.id, { zhText: greetLine, enText: pet.enGreeting, withCry: false });
                    this.fx.spawnBurst(window.innerWidth * 0.35, window.innerHeight * 0.45, 35);
                } else {
                    soundEngine.speakAsPet(pet.id, { zhText: greetLine, enText: pet.enGreeting, withCry: true });
                }
                this.setHeroSpeech(greetLine, 5500);
                this.renderAll();
                this.switchWorldView('home');
                this.triggerPetRigAnimation('anim-joy-spin');
                this.spawnStageEmotes([pet.emoji, '💖', pet.stageProps?.[0] || '✨']);
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
            banner.innerHTML = `🚂 <strong>${u.name}的星语海滨萌宠小镇</strong> · 点击头顶闪烁 🪙 的店铺可领每日巡店星礼，点击任意地块可建店或装扮景观！`;
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
                const canPatrolToday = !profileManager.isTownPlotPatrolledToday(plot.id, u);
                const patrolBubble = canPatrolToday
                    ? `<div class="plot-patrol-bubble" title="点击巡店收取今日营业星礼！">🪙 巡店领+2⭐</div>`
                    : '';

                node.innerHTML = `
                    ${patrolBubble}
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

            node.onclick = (evt) => {
                if (this.townPendingPlacement) {
                    soundEngine.playTap();
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
                if (placed && placed.type === 'shop' && !profileManager.isTownPlotPatrolledToday(plot.id, u)) {
                    const shopMeta = getShopById(placed.itemId);
                    const sState = u.shops[placed.itemId] || { level: 1 };
                    const mgrPet = getPetById(placed.managerPetId || sState.managerPetId || u.activePetId);
                    const shopTitle = `${mgrPet.name}的${shopMeta.name}`;
                    const patrolRes = profileManager.claimTownShopPatrol(plot.id, shopTitle);
                    if (patrolRes.ok) {
                        soundEngine.playCoinChime();
                        const shopLine = mgrPet.shopLines?.[0] || `欢迎巡视${shopTitle}，今日营业大丰收啦！`;
                        soundEngine.speakAsPet(mgrPet.id, { zhText: shopLine, withCry: false });
                        const cx = evt?.clientX || window.innerWidth * 0.35;
                        const cy = evt?.clientY || window.innerHeight * 0.45;
                        this.fx.spawnBurst(cx, cy, 34);
                        if (patrolRes.grantedBadges > 0) {
                            this.fx.flyBadges(node, document.getElementById('hudBadgeBox'), patrolRes.grantedBadges);
                        }
                        this.renderAll();
                        const rewardLine = patrolRes.grantedBadges > 0
                            ? `<div style="color:#d97706; font-weight:900; font-size:14px;">🎉 集满3星直接合成 +${patrolRes.grantedBadges} 枚荣誉徽章 🏅！</div>`
                            : `<div style="color:#7c5cfc; font-weight:900; font-size:14px;">⭐ 已收入 +2 颗今日学习星（当前集星 ${patrolRes.starProgress}/3）！</div>`;
                        this.showQuickModal(
                            '🪙 小镇巡店收银成功！',
                            `<div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px;">
                                <img src="${mgrPet.img}" style="width:94px; height:94px; object-fit:contain;" />
                                <div style="font-size:16px; font-weight:900; color:#4c1d95;">店长【${mgrPet.name}】向你汇报今日营收！</div>
                                <div style="font-size:12.5px; color:#5e547d;">“${shopLine}”</div>
                                ${rewardLine}
                                <button type="button" id="btnOpenPlotManageAfterPatrol" class="btn-soft-action" style="margin-top:4px; padding:7px 14px;">⚙️ 调整或迁移此地块建筑</button>
                            </div>`
                        );
                        const manageBtn = document.getElementById('btnOpenPlotManageAfterPatrol');
                        if (manageBtn) {
                            manageBtn.onclick = () => {
                                soundEngine.playTap();
                                this.openTownPlotMenu(plot, placed);
                            };
                        }
                        return;
                    }
                }
                soundEngine.playTap();
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
                    this.showQuickToast('💡 温馨提示', res.msg);
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

            this.triggerPetAnswerReaction(true, res.combo);
            this.renderAll();

            if (award.reachedCapNow) {
                this.celebrateDailyCapReached(award.dailyCap);
            }
            return true;
        } else {
            soundEngine.playWrong();
            profileManager.recordMathMistake(res.question, res.userAns);
            this.updateReviewCountBadge();
            this.triggerPetAnswerReaction(false, 0);
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

        const fb = document.getElementById('engFeedbackBar');
        if (fb) {
            fb.className = 'feedback-bar';
            fb.textContent = q.hint || '认真回忆词义再作答，答后揭晓解析与发音！';
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
                if (q.courseSubType === 'phonics_dictation' || q.courseSubType === 'sight_word_spell' || q.courseSubType === 'phonics_listen_pick') {
                    soundEngine.speakEnglish(q.wordObj.ttsWord || q.wordObj.word, false, '');
                } else if (q.courseSubType === 'sight_sentence_order' || q.courseSubType === 'sight_cloze_pick') {
                    soundEngine.speakEnglish(q.speakText || q.expectedSentence || q.wordObj.word, false, '');
                } else if (q.courseSubType === 'qa_cloze' || q.courseSubType === 'qa_story_steps') {
                    soundEngine.speakEnglish(q.answerEn, false, '');
                }
            } else if (q.mode !== 'bubble_pair') {
                soundEngine.speakEnglish(q.wordObj.word, false, q.wordObj.phonics);
            }

            const sess = englishEngine.studySession;
            if (this.engSubMode === 'vocab_camp' && sess && sess.phase === 'quiz' && q.wordObj?.id) {
                sess.correctInSession = (sess.correctInSession || 0) + 1;
                if (Array.isArray(sess.passedWordIds) && !sess.passedWordIds.includes(q.wordObj.id)) {
                    sess.passedWordIds.push(q.wordObj.id);
                }
            }

            const boostVal = q.isReview ? 2 : 1;
            if (Array.isArray(q.pairWords) && q.pairWords.length > 0) {
                q.pairWords.forEach(pw => profileManager.updateWordProgress(pw, true, 1));
            } else {
                profileManager.updateWordProgress(q.wordObj, true, boostVal);
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
                fb.textContent = `⭐ Awesome! ${displayKeyText} · 学习星 ${award.starProgress}/3！`;
            }

            this.triggerPetAnswerReaction(true, res.combo);
            this.renderAll();

            if (award.reachedCapNow) this.celebrateDailyCapReached(award.dailyCap);

            setTimeout(() => this.advanceEnglishStep(), 820);
        } else {
            soundEngine.playWrong();
            const wrongSpeak = isCourseQ
                ? (q.expectedSentence || q.answerEn || q.wordObj.ttsWord || q.wordObj.word)
                : q.wordObj.word;
            soundEngine.speakEnglish(wrongSpeak, true, isCourseQ ? '' : q.wordObj.phonics);
            profileManager.updateWordProgress(q.wordObj, false, 0);
            const sess = englishEngine.studySession;
            let retryNote = '已收入双倍复习本！';
            if (this.engSubMode === 'vocab_camp' && sess && sess.phase === 'quiz') {
                if (englishEngine.enqueueCampRetryIfWrong(q)) {
                    retryNote = '稍后将在本轮队尾再巩固测一次！';
                }
            }
            this.updateReviewCountBadge();
            this.triggerPetAnswerReaction(false, 0);
            fb.textContent = `💡 正确答案：${displayKeyText}，${retryNote}`;
            setTimeout(() => this.advanceEnglishStep(), 1800);
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
                // 完成整组 5 词背诵通关！仅对本轮真正答对过的单词额外点亮熟练度
                sess.phase = 'done';
                const passedSet = new Set(sess.passedWordIds || []);
                sess.words.forEach(w => {
                    if (passedSet.has(w.id)) {
                        profileManager.updateWordProgress(w, true, 1);
                    }
                });
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

    // ==================== 辅助庆典、换装与多态互动/喂食动画系统 ====================
    triggerPetRigAnimation(animClass = 'anim-cheer-jump') {
        const rig = document.getElementById('heroPetActorRig');
        const allClasses = [
            'anim-pat-squash',
            'anim-joy-spin',
            'anim-tickle-wiggle',
            'anim-highfive-leap',
            'anim-eating',
            'anim-cheer-jump',
            'anim-comfort-nod',
            'anim-stage-transform'
        ];
        if (rig) {
            rig.classList.remove(...allClasses);
            void rig.offsetWidth;
            rig.classList.add(animClass);
            if (this._rigAnimTimer) clearTimeout(this._rigAnimTimer);
            this._rigAnimTimer = setTimeout(() => {
                rig.classList.remove(animClass);
            }, 1220);
        }
    }

    spawnStageEmotes(emotes = ['💕', '✨'], expText = '') {
        const fxLayer = document.getElementById('heroAnimFxLayer');
        if (!fxLayer) return;
        const ripple = document.createElement('div');
        ripple.className = 'stage-magic-ripple';
        fxLayer.appendChild(ripple);
        setTimeout(() => ripple.remove(), 920);

        emotes.forEach((em, idx) => {
            const isTextChip = Array.from(em).length > 2;
            const span = document.createElement('span');
            span.className = isTextChip ? 'floating-pet-emote emote-chip' : 'floating-pet-emote';
            span.textContent = em;
            const leftPct = 35 + idx * 14 + (Math.random() - 0.5) * 8;
            const topPct = 31 + (idx % 2) * 10;
            span.style.left = `${leftPct}%`;
            span.style.top = `${topPct}%`;
            span.style.animationDelay = `${idx * 0.08}s`;
            fxLayer.appendChild(span);
            setTimeout(() => span.remove(), 1250);
        });
        if (expText) {
            const pill = document.createElement('div');
            pill.className = 'floating-exp-pill';
            pill.textContent = expText;
            fxLayer.appendChild(pill);
            setTimeout(() => pill.remove(), 1350);
        }
    }

    triggerPetHappyReaction() {
        this.triggerPetRigAnimation('anim-cheer-jump');
    }

    triggerPetAnswerReaction(isCorrect, combo = 0) {
        const u = profileManager.getActiveUser();
        const petMeta = getPetById(
            u.stageMode === 'shop' ? (u.shops[u.activeShopId]?.managerPetId || u.activePetId) : u.activePetId
        );
        const talkEl = document.getElementById('mascotTalkText');
        this._cheerStepIdx = (this._cheerStepIdx || 0) + 1;

        if (isCorrect) {
            const lines = petMeta.cheerRightLines?.length ? petMeta.cheerRightLines : petMeta.talkLines;
            const line = lines[this._cheerStepIdx % lines.length];
            this.setHeroSpeech(line, 4600);
            if (talkEl && combo < 3) {
                talkEl.textContent = line;
            }
            this.triggerPetRigAnimation('anim-cheer-jump');
            this.spawnStageEmotes([petMeta.emoji, '👏', petMeta.stageProps?.[0] || '✨']);
        } else {
            const lines = petMeta.cheerWrongLines?.length ? petMeta.cheerWrongLines : ['没关系～看清提示下一题加油！💪'];
            const line = lines[this._cheerStepIdx % lines.length];
            this.setHeroSpeech(line, 4800);
            if (talkEl) {
                talkEl.textContent = line;
            }
            this.triggerPetRigAnimation('anim-comfort-nod');
            this.spawnStageEmotes(['💪', '🍀']);
        }
    }

    triggerPetInteractSequence(e) {
        const u = profileManager.getActiveUser();
        const isShopMode = u.stageMode === 'shop';
        const petId = isShopMode ? (u.shops[u.activeShopId]?.managerPetId || u.activePetId) : u.activePetId;
        const petMeta = getPetById(petId);
        const pState = u.pets?.[petId] || {};
        const step = this._interactStepIdx++;

        if (isShopMode) {
            const shopMeta = getShopById(u.activeShopId);
            const shopLines = petMeta.shopLines?.length
                ? petMeta.shopLines
                : [`${petMeta.emoji} 欢迎光临${petMeta.name}的${shopMeta.name}！今日生意超红火！`];
            const shopSpeech = shopLines[step % shopLines.length];
            soundEngine.playCoinChime();
            soundEngine.speakAsPet(petMeta.id, {
                zhText: shopSpeech,
                enText: petMeta.enGreeting,
                preferEnglish: step % 3 === 2,
                withCry: true
            });
            this.setHeroSpeech(shopSpeech, 5800);
            this.triggerPetRigAnimation('anim-cheer-jump');
            const subSprite = document.getElementById('heroManagerSubSprite');
            if (subSprite) {
                subSprite.classList.remove('shop-greet-jump');
                void subSprite.offsetWidth;
                subSprite.classList.add('shop-greet-jump');
                setTimeout(() => subSprite.classList.remove('shop-greet-jump'), 900);
            }
            this.spawnStageEmotes(['🪙 营业兴隆!', '🛍️', '💖']);
            this.fx.spawnBurst(e?.clientX || window.innerWidth * 0.35, e?.clientY || window.innerHeight * 0.4, 18);
            return;
        }

        const moves = [
            { anim: 'anim-pat-squash', tag: '💕 摸摸头~' },
            { anim: 'anim-joy-spin', tag: '🎵 好开心!' },
            { anim: 'anim-tickle-wiggle', tag: '😆 嘻嘻好痒~' },
            { anim: 'anim-highfive-leap', tag: '🙌 击掌冲鸭!' }
        ];
        const move = moves[step % moves.length];

        const enList = petMeta.enInteractPhrases?.length ? petMeta.enInteractPhrases : [petMeta.enGreeting];
        const zhList = petMeta.interactLines?.length ? petMeta.interactLines : petMeta.talkLines;
        let speechText = zhList[step % zhList.length];
        if ((petMeta.id === 'frog' || petMeta.id === 'prince_frog') && String(pState.accessory || '').startsWith('lotus_') && step % 3 === 0) {
            const accObj = getAccessoryById(pState.accessory);
            speechText = `呱呱～我头上的【${accObj.name}】还挂着晶莹小露珠呢，是不是超清凉帅气呀！🌿🐸`;
        }

        soundEngine.speakAsPet(petMeta.id, {
            zhText: speechText,
            enText: enList[step % enList.length],
            preferEnglish: step % 3 === 2,
            withCry: true
        });

        this.setHeroSpeech(speechText, 5800);
        this.triggerPetRigAnimation(move.anim);
        const themeEmotes = (petMeta.id === 'frog' || petMeta.id === 'prince_frog')
            ? [move.tag, '🪷', '💧']
            : [move.tag, '💖', petMeta.stageProps?.[0] || '✨'];
        this.spawnStageEmotes(themeEmotes);
        this.fx.spawnBurst(e?.clientX || window.innerWidth * 0.35, e?.clientY || window.innerHeight * 0.4, 16);
    }

    triggerPetFeedSequence(petMeta, expGain, levelUpEvent) {
        const fxLayer = document.getElementById('heroAnimFxLayer');
        if (fxLayer) {
            const foodEl = document.createElement('div');
            foodEl.className = 'flying-food-item';
            foodEl.textContent = petMeta.foodIcon || '🥕';
            fxLayer.appendChild(foodEl);
            setTimeout(() => foodEl.remove(), 520);
        }

        const expTrack = document.getElementById('heroExpTrack');
        if (expTrack) {
            expTrack.classList.add('exp-pulse');
            setTimeout(() => expTrack.classList.remove('exp-pulse'), 900);
        }

        const fStep = this._feedStepIdx++;
        const feedLines = petMeta.feedLines?.length
            ? petMeta.feedLines
            : [`😋 啊呜一口吃掉${petMeta.foodName}，好美味呀！`];
        const yummyLine = feedLines[fStep % feedLines.length];

        soundEngine.playEatSound(petMeta.id, yummyLine);
        this.triggerPetRigAnimation('anim-eating');
        this.setHeroSpeech(yummyLine, 6000);

        const expPillText = expGain > 0
            ? `+${expGain} 成长值 ✨`
            : `${petMeta.foodIcon || '🍓'} 饱饱解馋啦 ✨`;

        setTimeout(() => {
            this.spawnStageEmotes(
                ['😋', '💖', petMeta.foodIcon || '✨'],
                expPillText
            );
            this.fx.spawnBurst(window.innerWidth * 0.36, window.innerHeight * 0.42, 24);
            if (levelUpEvent) {
                this.triggerPetRigAnimation('anim-stage-transform');
                this.celebrateLevelUp(levelUpEvent);
            }
        }, 360);
    }

    celebrateLevelUp(ev) {
        soundEngine.playLevelUp();
        this.fx.spawnBurst(window.innerWidth * 0.35, window.innerHeight * 0.42, 50);
        if (ev.type === 'pet') {
            const stageDesc = ev.petMeta.stageDescs?.[ev.newLevel - 1] || getStageStyleMeta(ev.newLevel).summary;
            const stageTalk = ev.petMeta.talkLines?.[ev.newLevel - 1] || '';
            const gradMsg = ev.newlyGraduated
                ? `<div style="margin-top:6px; color:#e67e22; font-weight:900;">🎓 恭喜满级毕业！已颁发毕业证书并获赠 1 张 🎟️ 盲盒券，现在可以去【配对开店】当大老板啦！</div>`
                : '';
            this.showQuickModal(
                '🎉 萌宠升级 · 解锁新形态样式！',
                `<div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px;">
                    <img src="${ev.petMeta.img}" style="width:124px; height:124px; object-fit:contain; filter:drop-shadow(0 8px 18px ${ev.petMeta.auraColor || '#9d7aff'});" />
                    <div style="font-size:18px; font-weight:900; color:#4f359b;">【${ev.petMeta.name}】升到了 Lv.${ev.newLevel}！</div>
                    <div style="background:#f4eeff; border:1.5px solid #d8c8ff; border-radius:12px; padding:6px 12px; font-size:12.5px; color:#4b368c; font-weight:800;">
                        ✨ 解锁新样式：【${ev.petMeta.stageTitles[ev.newLevel - 1]}】（${stageDesc}）
                    </div>
                    ${stageTalk ? `<div style="font-size:12.5px; color:#5e547d;">💬 “${stageTalk}”</div>` : ''}
                    <div style="font-size:11.5px; color:#7c6f9f;">💡 提示：在主页左侧【样式】栏或【🎀 换装·样式】中，可随时自由切回任意已解锁的历代等级样式哦！</div>
                    ${gradMsg}
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
        const petMeta = getPetById(u.activePetId);
        const pState = u.pets[u.activePetId] || { level: 1, accessory: 'none', displayStage: null };
        const effectiveStage = profileManager.getEffectivePetStage(u.activePetId, u);
        const curAcc = pState.accessory || 'none';

        let html = `<div class="wardrobe-wrap">`;

        // 区块 1：选择历代等级外观样式
        html += `
            <div>
                <div class="wardrobe-sec-title">
                    <span>✨ ${petMeta.emoji} ${petMeta.name} · 等级形态样式（已解锁 ${pState.level}/5）</span>
                    <span class="wardrobe-sec-sub">升级自动换新，也可自由切回旧等级样式</span>
                </div>
                <div class="stage-style-pick-grid" style="margin-top:6px;">
        `;
        PET_STAGE_STYLES.forEach(st => {
            const s = st.stage;
            const unlocked = s <= pState.level;
            const isAct = effectiveStage === s;
            const title = petMeta.stageTitles[s - 1] || st.badge;
            const desc = petMeta.stageDescs?.[s - 1] || st.summary;
            html += `
                <button type="button" class="stage-style-card ${isAct ? 'active' : ''} ${unlocked ? '' : 'locked'}" data-pickstage="${s}">
                    <span class="ssc-lv">Lv.${s}</span>
                    <div class="ssc-title">${title}</div>
                    <div class="ssc-desc">${desc}</div>
                    <div class="ssc-status" style="color:${isAct ? '#7c5cfc' : (unlocked ? '#16a34a' : '#9c8fb8')};">
                        ${isAct ? '🌟 当前展示' : (unlocked ? '点击切换' : `🔒 Lv.${s}解锁`)}
                    </div>
                </button>
            `;
        });
        html += `</div></div>`;

        // 区块 2：荷叶系列与百变头饰装扮
        html += `
            <div>
                <div class="wardrobe-sec-title">
                    <span>🪷 萌宠百变装扮（可用 🏅 ${u.badges} 徽章兑换或盲盒抽取）</span>
                    <span class="wardrobe-sec-sub">🐸 青蛙专属清凉荷叶帽免费拥有！</span>
                </div>
                <div class="acc-pick-grid" style="margin-top:6px;">
        `;
        PET_ACCESSORIES.forEach(acc => {
            const owned = u.ownedAccessories.includes(acc.id) || Boolean(acc.freeDefault);
            const active = curAcc === acc.id;
            let statusTxt = active ? '🌟 佩戴中' : (owned ? '点击佩戴' : `🏅 ${acc.cost} 兑换`);
            html += `
                <button type="button" class="acc-pick-btn ${active ? 'active' : ''} ${acc.frogSpecial ? 'frog-special' : ''}" data-acc="${acc.id}">
                    ${acc.frogSpecial ? `<span class="frog-tag-ribbon">🐸荷叶特供</span>` : ''}
                    <div class="acc-preview-icon">${acc.id === 'none' ? '✨' : renderAccessoryVisualHtml(acc.id, true)}</div>
                    <div style="font-size:12px; font-weight:900; color:#2b2148;">${acc.name}</div>
                    <div style="font-size:10.5px; font-weight:800; color:${active ? '#7c5cfc' : (owned ? '#059669' : '#d97706')};">${statusTxt}</div>
                </button>
            `;
        });
        html += `</div></div></div>`;

        this.showQuickModal('🎀 萌宠换装与历代等级样式馆', html);

        document.querySelectorAll('#modalQuickPopup .stage-style-card').forEach(card => {
            card.onclick = () => {
                const targetStage = Number(card.dataset.pickstage);
                const res = profileManager.setPetDisplayStage(petMeta.id, targetStage);
                if (!res.ok) {
                    soundEngine.playWrong();
                    return;
                }
                const stageLine = petMeta.talkLines[targetStage - 1] || petMeta.talkLines[0];
                soundEngine.speakAsPet(petMeta.id, { zhText: stageLine, withCry: true });
                this.setHeroSpeech(`✨ 切换为 Lv.${targetStage}【${petMeta.stageTitles[targetStage - 1]}】样式：${stageLine}`, 5800);
                this.closeModal('modalQuickPopup');
                this.renderAll();
                this.triggerPetRigAnimation('anim-stage-transform');
                this.spawnStageEmotes(['✨', petMeta.stageProps?.[0] || '🌟']);
            };
        });

        document.querySelectorAll('#modalQuickPopup .acc-pick-btn').forEach(btn => {
            btn.onclick = () => {
                const accId = btn.dataset.acc;
                const res = profileManager.unlockOrEquipAccessory(accId);
                if (!res.ok) {
                    soundEngine.playWrong();
                    this.showQuickToast('💡 装扮兑换提示', res.msg);
                    return;
                }
                let outfitLine = '';
                if (accId.startsWith('lotus_') && (petMeta.id === 'frog' || petMeta.id === 'prince_frog')) {
                    outfitLine = `呱呱！戴上【${res.accMeta.name}】清清凉凉带露珠，简直为本蛙量身定做！🌿🐸`;
                } else if (accId !== 'none') {
                    outfitLine = `${petMeta.voiceTag || petMeta.emoji} 哇！新戴上的【${res.accMeta.name}】好看吗？陪你继续闯关啰！✨`;
                }
                if (outfitLine) {
                    soundEngine.speakAsPet(petMeta.id, { zhText: outfitLine, withCry: true });
                    this.setHeroSpeech(outfitLine, 6000);
                } else {
                    soundEngine.playPetVoice(petMeta.id);
                }
                this.closeModal('modalQuickPopup');
                this.renderAll();
                this.triggerPetRigAnimation('anim-joy-spin');
                this.spawnStageEmotes([res.accMeta.icon || '✨', '💖']);
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
        this.draftEngLevel = ec.level || 'level1_listen';
        this.draftEngWordDiff = ec.wordDifficulty || 'easy';
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

        // 4. 英语梯度设置 + 9题型多选
        const engLevels = [
            { id: 'level1_listen', diff: 'easy',   title: '🌱 轻松启蒙（推荐）：仅抽短词 + 3选1 + 免盲拼', desc: '仅抽日常高频短词，3个选项、2组消消乐、校外课转听音认读，零挫败感' },
            { id: 'level2_match',  diff: 'medium', title: '⭐ 标准进阶：图词配对 + 自然拼读 + 情景句', desc: '常用分级词库(L1+L2)，4选项互动与音节积木，适合进阶认读' },
            { id: 'level3_spell',  diff: 'all',    title: '🔥 挑战读写：谜语问答 + 连词成句 + 拼写', desc: '英语小侦探猜谜、小火车排句与完整拼写，综合进阶' },
            { id: 'mixed',         diff: 'all',    title: '🌈 全能混合：9大趣味互动题型全部开启', desc: '听说、消消乐、拼读积木、猜谜、连词成句与校外课全套默写' }
        ];
        const eStack = document.getElementById('engLevelCards');
        eStack.innerHTML = '';
        engLevels.forEach(el => {
            const d = document.createElement('div');
            d.className = `preset-item-card ${this.draftEngLevel === el.id ? 'active' : ''}`;
            d.innerHTML = `<strong>${el.title}</strong><small>${el.desc}</small>`;
            d.onclick = () => {
                this.draftEngLevel = el.id;
                this.draftEngWordDiff = el.diff;
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
            DEFAULT_EASY_ENGLISH_TYPES
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
            wordDifficulty: this.draftEngWordDiff || prevEc.wordDifficulty || 'easy',
            courseAllowHardDictation: (this.draftEngWordDiff || prevEc.wordDifficulty) === 'all',
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
        const unlearnedCount = ALL_WORDS.length - masteredCount;
        document.getElementById('reportStatsStrip').innerHTML = `
            <div class="rep-stat-box"><strong>${u.stats?.totalMathCorrect || 0}</strong><span>数学答对总数</span></div>
            <div class="rep-stat-box"><strong>${u.stats?.totalEnglishCorrect || 0}</strong><span>英语闯关答对</span></div>
            <div class="rep-stat-box"><strong>${masteredCount} / ${ALL_WORDS.length}</strong><span>点亮英语单词</span></div>
            <div class="rep-stat-box"><strong>🔥 x${u.stats?.bestCombo || 0}</strong><span>最高连对纪录</span></div>
        `;

        const activeRepTab = document.querySelector('.rep-tab-btn.active')?.dataset.reptab || 'vocab';
        const toolbar = document.getElementById('reportFilterToolbar');
        if (toolbar) {
            toolbar.style.display = activeRepTab === 'vocab' ? 'flex' : 'none';
            toolbar.innerHTML = `
                <div class="rep-filter-pills">
                    <button type="button" class="rep-filter-pill ${this.reportVocabFilter === 'all' ? 'active' : ''}" data-vfilter="all">全部 ${ALL_WORDS.length}</button>
                    <button type="button" class="rep-filter-pill ${this.reportVocabFilter === 'mastered' ? 'active' : ''}" data-vfilter="mastered">🌟 已点亮 ${masteredCount}</button>
                    <button type="button" class="rep-filter-pill ${this.reportVocabFilter === 'unlearned' ? 'active' : ''}" data-vfilter="unlearned">🌱 未背 ${unlearnedCount}</button>
                </div>
                <button type="button" id="btnToggleReportSlowPhonics" class="rep-slow-toggle ${this.reportSlowPhonics ? 'active' : ''}">
                    🐢 ${this.reportSlowPhonics ? '慢速拼读：已开启' : '慢速自然拼读'}
                </button>
            `;
            toolbar.querySelectorAll('.rep-filter-pill').forEach(btn => {
                btn.onclick = () => {
                    soundEngine.playTap();
                    this.reportVocabFilter = btn.dataset.vfilter;
                    this.openReportModal();
                };
            });
            const slowBtn = document.getElementById('btnToggleReportSlowPhonics');
            if (slowBtn) {
                slowBtn.onclick = () => {
                    soundEngine.playTap();
                    this.reportSlowPhonics = !this.reportSlowPhonics;
                    this.openReportModal();
                };
            }
        }

        const wall = document.getElementById('reportVocabWall');
        wall.innerHTML = '';
        const filteredWords = ALL_WORDS.filter(w => {
            const stars = u.wordMastery?.[w.id] || 0;
            if (this.reportVocabFilter === 'mastered') return stars >= 1;
            if (this.reportVocabFilter === 'unlearned') return stars === 0;
            return true;
        });

        if (filteredWords.length === 0) {
            wall.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:18px; color:#6c628c; font-weight:800;">${this.reportVocabFilter === 'mastered' ? '🌱 还没有点亮的单词哦，快去右侧背单词闯关点亮第一颗星吧！' : '👑 太牛啦！360个核心单词已经全部点亮！'}</div>`;
        } else {
            filteredWords.forEach(w => {
                const stars = u.wordMastery?.[w.id] || 0;
                const starLabel = stars === 0 ? '🌱 未背' : (stars === 1 ? '⭐ 眼熟' : (stars === 2 ? '⭐⭐ 掌握' : '👑 牢记'));
                const card = document.createElement('div');
                card.className = `vocab-mini-card ${stars >= 2 ? 'mastered' : ''}`;
                const phonicsLine = this.reportSlowPhonics && w.phonics
                    ? `<small style="font-size:10.5px; color:#7c5cfc; font-weight:800;">${w.phonics}</small>`
                    : '';
                card.innerHTML = `
                    <div style="font-size:28px;">${w.icon}</div>
                    <strong style="font-size:15px; color:#2b2147;">${w.word}</strong>
                    ${phonicsLine}
                    <span style="font-size:12px; color:#6c628c;">${w.zh}</span>
                    <span style="font-size:11px; font-weight:800; color:#d97706;">${starLabel} ${this.reportSlowPhonics ? '🐢🔊' : '🔊'}</span>
                `;
                card.onclick = () => soundEngine.speakEnglish(w.word, this.reportSlowPhonics, w.phonics);
                wall.appendChild(card);
            });
        }

        const mBox = document.getElementById('reportMistakesList');
        mBox.innerHTML = '';
        const mCount = u.mathMistakes?.length || 0;
        const eCount = u.englishMistakes?.length || 0;
        if (mCount === 0 && eCount === 0) {
            mBox.innerHTML = `<div class="record-row-item"><div class="rec-left-title">🎉 太优秀啦！当前没有任何遗留错题或生词！</div></div>`;
        } else {
            const jumpBtn = document.createElement('button');
            jumpBtn.type = 'button';
            jumpBtn.id = 'btnJumpToReviewFromReport';
            jumpBtn.className = 'btn-purple-wide';
            jumpBtn.style.cssText = 'width:100%; margin-bottom:6px;';
            jumpBtn.textContent = `⚡ 立即去右侧【双倍复习】攻克全部 ${mCount + eCount} 道错题（拿2倍🏅）`;
            jumpBtn.onclick = () => {
                soundEngine.playTap();
                this.closeModal('modalReport');
                this.switchSubjectTab('review', true, false);
            };
            mBox.appendChild(jumpBtn);

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
                row.style.cursor = 'pointer';
                row.innerHTML = `
                    <div>
                        <div class="rec-left-title">🔤 ${e.icon} ${e.word} (${e.zh}) 🔊</div>
                        <div class="rec-left-meta">点击朗读发音 · 去【双倍复习】即可挑战清零</div>
                    </div>
                    <span class="rec-delta-pill spend">待复习</span>
                `;
                row.onclick = () => soundEngine.speakEnglish(e.word, this.reportSlowPhonics);
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

        // 主页3D萌宠点击多态互动（特色台词+英语问候+专属叫声+4种互动动作）
        document.getElementById('heroDioramaStage').onclick = (e) => {
            this.triggerPetInteractSequence(e);
        };

        // 主页投喂美食 / 扩建店铺主按钮（飞行食物+咔嚓咀嚼动画+特色满足发言）
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
                this.renderAll();
                this.triggerPetFeedSequence(res.petMeta, FEED_EXP_GAIN, res.levelUpEvent);
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

        const btnFreeTreatLv5 = document.getElementById('btnFreeTreatLv5');
        if (btnFreeTreatLv5) {
            btnFreeTreatLv5.onclick = () => {
                const u = profileManager.getActiveUser();
                const petMeta = getPetById(u.activePetId);
                this.triggerPetFeedSequence(petMeta, 0, null);
            };
        }

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
        const openPetQuickFilter = () => {
            soundEngine.playTap();
            openRandomFilterModal({
                profileManager,
                onSaved: () => {
                    this.syncEnginesWithActiveUser();
                    this.renderAll();
                    this.switchSubjectTab(this.activeSubject, false, true);
                }
            });
        };
        document.getElementById('btnQuickDiffFooter').onclick = openPetQuickFilter;
        const btnPetQuickFilter = document.getElementById('btnPetQuickFilter');
        if (btnPetQuickFilter) {
            btnPetQuickFilter.onclick = openPetQuickFilter;
        }
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
                const toolbar = document.getElementById('reportFilterToolbar');
                if (toolbar) toolbar.style.display = isVocab ? 'flex' : 'none';
                document.getElementById('reportVocabWall').style.display = isVocab ? 'grid' : 'none';
                document.getElementById('reportMistakesList').style.display = isVocab ? 'none' : 'flex';
            };
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.__petTownApp = new PetWonderTownApp();
});
