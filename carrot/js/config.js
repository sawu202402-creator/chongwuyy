/**
 * config.js - 游戏全局配置与数值设定
 */

export const GAME_CONFIG = {
    canvasWidth: 960,
    canvasHeight: 560,
    gridSize: 40,
    initialLives: 10,
    initialGold: 450,
    timePerWaveBreak: 6,
    mathGoldReward: 25,
    comboBonusMultiplier: 5,
};

// 可选卡通头像库
export const AVATAR_OPTIONS = [
    { id: 'rabbit', emoji: '🐰', name: '聪慧小兔' },
    { id: 'frog', emoji: '🐸', name: '机灵青蛙' },
    { id: 'carrot', emoji: '🥕', name: '金牌萝卜' },
    { id: 'lion', emoji: '🦁', name: '勇敢小狮' },
    { id: 'fox', emoji: '🦊', name: '机敏小狐' },
    { id: 'bear', emoji: '🐻', name: '坚毅小熊' },
    { id: 'cat', emoji: '🐱', name: '好学小猫' },
    { id: 'panda', emoji: '🐼', name: '功夫小宝' }
];

// 数学运算类型
export const MATH_OPERATIONS = [
    { id: 'add', symbol: '➕', name: '加法' },
    { id: 'sub', symbol: '➖', name: '减法' },
    { id: 'mul', symbol: '✖️', name: '乘法' },
    { id: 'div', symbol: '➗', name: '除法' }
];

// 数值范围选项 (加减法)
export const MATH_RANGES = [
    { value: 10, label: '10 以内', desc: '大班/一年级启蒙' },
    { value: 20, label: '20 以内', desc: '一年级进阶口算' },
    { value: 50, label: '50 以内', desc: '速算过渡' },
    { value: 100, label: '100 以内', desc: '二年级/乘除法' },
    { value: 1000, label: '1000 以内', desc: '三至六年级高阶' }
];

// 乘法/除法因数上限选项（几以内的乘法，最大算式为 N × N）
export const MULTIPLIER_RANGES = [
    { value: 3, label: '3 以内', desc: '启蒙乘法，最大 3 × 3 = 9' },
    { value: 5, label: '5 以内', desc: '二年级初学，最大 5 × 5 = 25' },
    { value: 7, label: '7 以内', desc: '进阶巩固，最大 7 × 7 = 49' },
    { value: 9, label: '9 以内', desc: '九九乘法表，最大 9 × 9 = 81' }
];

// 预设学段难度定义
export const DIFFICULTY_LEVELS = {
    grade1_2: {
        id: 'grade1_2',
        name: '萌芽学徒 (1~2年级)',
        badge: '🌱 基础加减法',
        desc: '10/20以内加减法、100以内整十加减、比大小心算',
        timeLimit: 12,
        defaultOps: ['add', 'sub'],
        defaultRange: 20,
        defaultMultiplier: 5
    },
    grade3_4: {
        id: 'grade3_4',
        name: '数灵法师 (3~4年级)',
        badge: '⚡ 乘除与心算',
        desc: '九九乘法表、表内除法、百以内加减速算',
        timeLimit: 10,
        defaultOps: ['mul', 'div', 'add', 'sub'],
        defaultRange: 100,
        defaultMultiplier: 9
    },
    grade5_6: {
        id: 'grade5_6',
        name: '大奥术师 (5~6年级)',
        badge: '🔥 四则与速算',
        desc: '四则混合运算、千以内加减乘除、心算巧算',
        timeLimit: 8,
        defaultOps: ['add', 'sub', 'mul', 'div'],
        defaultRange: 1000,
        defaultMultiplier: 9
    }
};

// 默认初始用户档案
export const DEFAULT_USER_PROFILES = {
    activeUserId: 'child_xiaowandou',
    users: [
        {
            id: 'child_xiaowandou',
            name: '小豌豆',
            avatar: '🐰',
            difficulty: {
                mode: 'custom',
                presetGrade: 'grade1_2',
                operations: ['add', 'sub', 'mul'],
                range: 20,
                maxMultiplier: 5,
                allowCarryBorrow: true,
                allowFillBlank: true
            }
        },
        {
            id: 'child_chuan',
            name: '川川',
            avatar: '🐸',
            difficulty: {
                mode: 'custom',
                presetGrade: 'grade3_4',
                operations: ['add', 'sub', 'mul', 'div'],
                range: 100,
                maxMultiplier: 9,
                allowCarryBorrow: true,
                allowFillBlank: true
            }
        }
    ]
};


// 防御塔类型配置 (保卫萝卜 1:1 官方原版数值体系)
export const TOWER_TYPES = {
    ADD_RAPID: {
        id: 'ADD_RAPID',
        name: '瓶子炮',
        symbol: '🍾',
        cost: 100,
        upgradeCost: 180,
        range: 140,
        damage: 22,
        fireRate: 0.55,
        projectileType: 'bottle_bullet',
        color: '#2ed573',
        accentColor: '#10ac84',
        desc: '官方经典绿瓶子炮！单体极速射击，升级后射程大幅拓宽并附带高爆贯穿！'
    },
    DIV_FROST: {
        id: 'DIV_FROST',
        name: '便便塔',
        symbol: '💩',
        cost: 120,
        upgradeCost: 220,
        range: 135,
        damage: 16,
        slowPercent: 0.50,
        slowDuration: 2.5,
        fireRate: 1.0,
        projectileType: 'shit_bullet',
        color: '#833471',
        accentColor: '#575fcf',
        desc: '官方原汁原味便便塔！喷吐黏糊糊泥浆，强力削减怪物50%移动速度！'
    },
    MUL_CANNON: {
        id: 'MUL_CANNON',
        name: '太阳花',
        symbol: '☀️',
        cost: 180,
        upgradeCost: 260,
        range: 150,
        damage: 48,
        splashRadius: 80,
        fireRate: 1.4,
        projectileType: 'sun_wave',
        color: '#ffa502',
        accentColor: '#ff7f50',
        desc: '官方经典太阳花！全方位360度烈焰日环辐射，群怪杀手，伤害爆表！'
    },
    GEOM_LASER: {
        id: 'GEOM_LASER',
        name: '星星塔',
        symbol: '⭐',
        cost: 160,
        upgradeCost: 220,
        range: 155,
        damage: 36,
        splashRadius: 55,
        fireRate: 0.85,
        projectileType: 'star_bullet',
        color: '#70a1ff',
        accentColor: '#1e90ff',
        desc: '官方经典星星炮！发射高爆五角星弹，击中后产生范围群体溅射爆炸！'
    },
    FAN: {
        id: 'FAN',
        name: '四叶草风扇塔',
        symbol: '🍀',
        cost: 160,
        upgradeCost: 220,
        range: 160,
        damage: 28,
        fireRate: 0.9,
        projectileType: 'fan_bullet',
        isPierce: true,
        color: '#2ed573',
        accentColor: '#1dd1a1',
        desc: '官方经典四叶草风扇塔！发射高速叶片直线穿透沿途所有怪兽，直道群伤神器！'
    },
    ROCKET: {
        id: 'ROCKET',
        name: '火箭塔',
        symbol: '🚀',
        cost: 220,
        upgradeCost: 320,
        range: 220,
        damage: 75,
        splashRadius: 75,
        fireRate: 1.75,
        projectileType: 'rocket_bullet',
        color: '#ff4757',
        accentColor: '#e040fb',
        desc: '官方重型火箭炮！全图超远射程精准追踪，击中产生高爆大范围群体杀伤！'
    },
    BALL: {
        id: 'BALL',
        name: '魔法球',
        symbol: '🔮',
        cost: 160,
        upgradeCost: 260,
        range: 155,
        damage: 32,
        fireRate: 0.22,
        isContinuous: true,
        projectileType: 'ball_beam',
        color: '#a29bfe',
        accentColor: '#6c5ce7',
        desc: '官方正规魔法球（电塔）！持续发射追踪闪电光束，升级后分叉多道激光同时攻击多个目标！'
    },
    FIRE_BOTTLE: {
        id: 'FIRE_BOTTLE',
        name: '火瓶子',
        symbol: '🔥',
        cost: 160,
        upgradeCost: 260,
        range: 145,
        damage: 42,
        fireRate: 0.16,
        isContinuous: true,
        projectileType: 'fire_flame',
        color: '#ff6b6b',
        accentColor: '#ee5253',
        desc: '官方经典火瓶子（汽油瓶）！高能烈焰光柱持续喷射，聚焦单一目标时间越长伤害越高，极速融化怪兽！'
    },
    PIN: {
        id: 'PIN',
        name: '毒针塔',
        symbol: '💉',
        cost: 160,
        upgradeCost: 220,
        range: 150,
        damage: 24,
        fireRate: 0.9,
        slowPercent: 0.35,
        slowDuration: 3.0,
        dotTicks: 5,
        dotDamage: 10,
        projectileType: 'pin_bullet',
        color: '#a55eea',
        accentColor: '#8854d0',
        desc: '官方原版毒针塔！发射淬毒银针，对击中目标造成持续猛毒伤害与减速！'
    },
    ARROW: {
        id: 'ARROW',
        name: '多重箭',
        symbol: '🏹',
        cost: 220,
        upgradeCost: 320,
        range: 160,
        damage: 26,
        fireRate: 0.8,
        projectileType: 'arrow_bullet',
        color: '#20bf6b',
        accentColor: '#26de81',
        desc: '官方原版多重箭！扇形散射多支高速飞箭，大范围扫射，近距离全中爆发极高！'
    },
    BLUE_STAR: {
        id: 'BLUE_STAR',
        name: '冰冻星',
        symbol: '❄️',
        cost: 180,
        upgradeCost: 260,
        range: 150,
        damage: 30,
        splashRadius: 75,
        slowPercent: 0.55,
        slowDuration: 2.5,
        fireRate: 1.1,
        projectileType: 'bluestar_bullet',
        color: '#00d2d3',
        accentColor: '#54a0ff',
        desc: '官方原版冰冻星！发射冰霜星弹，击中后产生冰霜极寒光环，大范围减速并冻伤敌人！'
    },
    SNOW: {
        id: 'SNOW',
        name: '雪花塔',
        symbol: '🌨️',
        cost: 160,
        upgradeCost: 260,
        range: 140,
        damage: 20,
        fireRate: 2.2,
        freezeDuration: 1.8,
        projectileType: 'snow_wave',
        color: '#48dbfb',
        accentColor: '#0abde3',
        desc: '官方原版雪花塔！周期性释放全屏寒冰雪花，彻底冰封范围内所有怪兽！'
    },
    FISH: {
        id: 'FISH',
        name: '鱼刺塔',
        symbol: '🐟',
        cost: 180,
        upgradeCost: 260,
        range: 145,
        damage: 55,
        stunChance: 0.35,
        stunDuration: 1.2,
        fireRate: 0.9,
        projectileType: 'fish_bullet',
        color: '#ff9ff3',
        accentColor: '#f368e0',
        desc: '官方原版鱼刺塔！投掷坚硬锋利鱼骨，高概率击晕怪兽原地定身！'
    },
    PLANE: {
        id: 'PLANE',
        name: '玩具飞机',
        symbol: '✈️',
        cost: 220,
        upgradeCost: 340,
        range: 240,
        damage: 60,
        fireRate: 1.5,
        isPierce: true,
        projectileType: 'plane_laser',
        color: '#5f27cd',
        accentColor: '#341f97',
        desc: '官方原版玩具飞机！发射横贯全图的强力激光与穿透弹，全图直线贯通杀伤！'
    },
    ANCHOR: {
        id: 'ANCHOR',
        name: '船锚炸弹',
        symbol: '⚓',
        cost: 260,
        upgradeCost: 340,
        range: 165,
        damage: 65,
        fireRate: 1.25,
        projectileType: 'anchor_bullet',
        color: '#ee5253',
        accentColor: '#ff6b6b',
        desc: '官方原版船锚炸弹！轰出重型铁锚，命中后碎裂分叉飞向全场其他目标！'
    },
    CUTTLE: {
        id: 'CUTTLE',
        name: '章鱼炮',
        symbol: '🐙',
        cost: 220,
        upgradeCost: 320,
        range: 160,
        damage: 24,
        fireRate: 1.3,
        projectileType: 'cuttle_bullet',
        color: '#ff9f43',
        accentColor: '#feca57',
        desc: '官方原版章鱼炮！全图全方位360度发射无死角珍珠弹幕，覆盖整张地图！'
    },
    MUSHROOM: {
        id: 'MUSHROOM',
        name: '蘑菇塔',
        symbol: '🍄',
        cost: 220,
        upgradeCost: 320,
        range: 145,
        damage: 25,
        slowPercent: 0.45,
        slowDuration: 3.0,
        bountyBonus: true,
        fireRate: 1.5,
        projectileType: 'mushroom_wave',
        color: '#10ac84',
        accentColor: '#1dd1a1',
        desc: '官方原版蘑菇塔！喷发孢子云雾减速并缩小怪兽，被附着怪兽被击杀时掉落巨额额外金币！'
    },
    BUFF: {
        id: 'BUFF',
        name: '水晶增益塔',
        symbol: '💎',
        cost: 100,
        upgradeCost: 160,
        range: 140,
        fireRate: 0,
        isBuff: true,
        buffPercent: 0.25,
        color: '#fdcb6e',
        accentColor: '#e17055',
        desc: '官方原版水晶增益塔！释放光环增幅范围内所有防御塔攻击力与射程！'
    }
};

// 敌人种类配置 (保卫萝卜官方小怪军团 - 贴合80px道路的饱满大体型与原汁原味悠闲节奏)
// 敌人种类配置 (保卫萝卜官方小怪军团 - 四大主题特色怪兽体系)
export const ENEMY_TYPES = {
    // ===== 主题 1：天际线 (Level 1~12) =====
    SLIME: {
        name: '粉果冻小呆怪',
        hp: 75,
        speed: 0.72,
        reward: 6,
        color: '#ff6b81',
        radius: 26,
        renderSize: 76,
        desc: '天际基础怪兽，移动平稳'
    },
    RABBIT: {
        name: '飞速独眼兔怪',
        hp: 55,
        speed: 1.10,
        reward: 8,
        color: '#ffa502',
        radius: 24,
        renderSize: 74,
        desc: '速度极快的小飞怪，需要便便塔减速拦截'
    },
    GOLEM: {
        name: '钢盔重装大胖怪',
        hp: 250,
        speed: 0.52,
        reward: 16,
        color: '#747d8c',
        radius: 32,
        renderSize: 94,
        armor: 0.25,
        desc: '高血量重装怪物，极难被单体常规炮击穿'
    },
    SHIELD_MATH: {
        name: '数盾恶作剧妖灵',
        hp: 150,
        speed: 0.65,
        reward: 20,
        color: '#a29bfe',
        radius: 30,
        renderSize: 90,
        hasMathShield: true,
        desc: '带有心算弱点护盾，解答其头顶算式即可秒破！'
    },
    BOSS_DEMON: {
        name: '天际巨云魔王',
        isBoss: true,
        hp: 950,
        speed: 0.42,
        reward: 60,
        color: '#e84393',
        radius: 46,
        renderSize: 136,
        desc: '天际终极大首领，身躯庞大且拥有极高生命值'
    },

    // ===== 主题 2：丛林奇遇 (Level 13~24) =====
    JUNGLE_SLIME: {
        name: '丛林小松果怪',
        hp: 95,
        speed: 0.74,
        reward: 7,
        color: '#ff793f',
        radius: 26,
        renderSize: 76,
        desc: '丛林基础怪兽，灵动蹦跳'
    },
    JUNGLE_BAT: {
        name: '丛林紫翼飞兽',
        hp: 70,
        speed: 1.15,
        reward: 9,
        color: '#9b59b6',
        radius: 25,
        renderSize: 76,
        desc: '丛林高速飞怪，敏捷穿行'
    },
    JUNGLE_GOLEM: {
        name: '丛林古树怪人',
        hp: 320,
        speed: 0.50,
        reward: 18,
        color: '#27ae60',
        radius: 34,
        renderSize: 96,
        armor: 0.28,
        desc: '丛林重装树怪，皮糙肉厚'
    },
    JUNGLE_CYCLOPS: {
        name: '狂暴角眼巨兽',
        hp: 220,
        speed: 0.68,
        reward: 18,
        color: '#e74c3c',
        radius: 32,
        renderSize: 92,
        desc: '丛林精英野兽，冲撞凶猛'
    },
    BOSS_JUNGLE: {
        name: '海盗角鸟酋长',
        isBoss: true,
        hp: 1250,
        speed: 0.42,
        reward: 75,
        color: '#d35400',
        radius: 48,
        renderSize: 140,
        desc: '丛林大首领！威风凛凛的角鸟海盗王'
    },

    // ===== 主题 3：沙漠风暴 (Level 25~36) =====
    DESERT_SLIME: {
        name: '绷带木乃伊呆萌怪',
        hp: 120,
        speed: 0.75,
        reward: 8,
        color: '#f39c12',
        radius: 26,
        renderSize: 76,
        desc: '沙漠基础怪兽，缠着古老绷带'
    },
    DESERT_STAR: {
        name: '沙漠蓝刺飞蝎',
        hp: 90,
        speed: 1.20,
        reward: 10,
        color: '#3498db',
        radius: 25,
        renderSize: 76,
        desc: '沙漠高速刺兽，迅捷潜行'
    },
    DESERT_DEVIL: {
        name: '金角鸣沙小魔灵',
        hp: 260,
        speed: 0.68,
        reward: 20,
        color: '#f1c40f',
        radius: 32,
        renderSize: 92,
        desc: '沙漠狡黠恶魔，沙暴幻化'
    },
    DESERT_GOLEM: {
        name: '仙人掌巨甲怪',
        hp: 420,
        speed: 0.48,
        reward: 22,
        color: '#2ecc71',
        radius: 34,
        renderSize: 96,
        armor: 0.32,
        desc: '沙漠重甲刺客，坚固耐打'
    },
    BOSS_DESERT: {
        name: '法老金字塔帝王',
        isBoss: true,
        hp: 1650,
        speed: 0.40,
        reward: 95,
        color: '#e67e22',
        radius: 48,
        renderSize: 142,
        desc: '沙漠大首领！金字塔法老陵墓的终极统治者'
    },

    // ===== 主题 4：深海狂澜 (Level 37~48) =====
    SEA_SLIME: {
        name: '深海粉萌海蛞蝓',
        hp: 150,
        speed: 0.76,
        reward: 9,
        color: '#ff7675',
        radius: 26,
        renderSize: 76,
        desc: '深海基础软体怪，游动滑溜'
    },
    SEA_JELLY: {
        name: '幻光电游水母',
        hp: 110,
        speed: 1.22,
        reward: 12,
        color: '#00cec9',
        radius: 25,
        renderSize: 76,
        desc: '深海高速浮游水母，极速飘移'
    },
    SEA_CONCH: {
        name: '深蓝重甲巨螺',
        hp: 550,
        speed: 0.46,
        reward: 25,
        color: '#0984e3',
        radius: 34,
        renderSize: 96,
        armor: 0.36,
        desc: '深海超重甲螺壳，抵挡大量炮火'
    },
    SEA_URCHIN: {
        name: '翠绿海胆刺球',
        hp: 300,
        speed: 0.70,
        reward: 22,
        color: '#00b894',
        radius: 32,
        renderSize: 92,
        desc: '深海剧毒带刺怪，滚滚向前'
    },
    SEA_RAY: {
        name: '深渊电光飞鳐',
        hp: 420,
        speed: 0.85,
        reward: 28,
        color: '#6c5ce7',
        radius: 36,
        renderSize: 104,
        desc: '深渊精英巨兽，滑翔穿刺'
    },
    BOSS_DEEPSEA: {
        name: '深海霸王巨螯蟹王',
        isBoss: true,
        hp: 2200,
        speed: 0.38,
        reward: 120,
        color: '#e84393',
        radius: 52,
        renderSize: 152,
        desc: '深海终极霸王！巨钳横扫千军，身披亚特兰蒂斯坚盔'
    }
};

