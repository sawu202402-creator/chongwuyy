/**
 * config.js - 《奇妙萌宠店长：数英星语镇》核心图鉴、店铺扩建与小镇沙盘常量配置
 */

export const AVATAR_LIST = ['🐰', '🐸', '🐯', '🦄', '🐶', '🐼', '🪙', '🌱', '🚀', '👑', '🌌', '🤖'];

export const PET_CATEGORIES = [
    {
        id: 'forest',
        name: '绿野部落',
        icon: '🌿',
        badgeColor: '#27ae60',
        desc: '兔子与青蛙双C位领衔！软萌治愈的森林好伙伴，陪伴宝贝快乐启航！'
    },
    {
        id: 'mythical',
        name: '国风神兽',
        icon: '🐉',
        badgeColor: '#8e44ad',
        desc: '威风可爱的祥瑞小神兽在等你，欢迎同学们来 pick 你的守护小英雄！'
    },
    {
        id: 'blindbox',
        name: '盲盒/隐藏款',
        icon: '🎁',
        badgeColor: '#e84393',
        desc: '超稀有太空与皇室限定款！通过答题连击扭蛋券惊喜抽取！'
    }
];

// 宠物升级经验阶梯 (Lv.1 -> Lv.5 满级毕业)
// Lv.1(0->15), Lv.2(0->25), Lv.3(0->35), Lv.4(0->45), Lv.5(已毕业!)
export const PET_LEVEL_MAX_EXP = {
    1: 15,
    2: 25,
    3: 35,
    4: 45,
    5: 45
};

export const FEED_BADGE_COST = 5;    // 每次投喂美食消耗 5 枚徽章
export const FEED_EXP_GAIN = 15;     // 每次投喂增加 15 点成长值

export const SHOP_LEVEL_MAX_EXP = {
    1: 20,
    2: 30,
    3: 40,
    4: 45,
    5: 45
};

export const SHOP_UPGRADE_BADGE_COST = 6; // 每次进货扩建消耗 6 枚徽章
export const SHOP_UPGRADE_EXP_GAIN = 15;  // 每次进货增加 15 点店铺繁荣度
export const GACHA_BADGE_COST = 18;       // 无扭蛋券时消耗 18 徽章可抽一次惊喜盲盒

export const PETS_CATALOG = [
    // ================= 1. 绿野部落 (兔子与青蛙双C位首发免费!) =================
    {
        id: 'rabbit',
        name: '垂耳兔',
        enName: 'Lop Bunny',
        category: 'forest',
        emoji: '🐰',
        img: 'assets/pets/rabbit.png',
        unlockCost: 0, // 首发免费C位
        isStarter: true,
        foodName: '甜脆胡萝卜礼盒',
        foodIcon: '🥕',
        stageTitles: ['糯米睡睡兔', '抱礼盒小兔', '伶俐胡萝卜兔', '金牌迎宾兔', '传奇店长垂耳兔'],
        talkLines: [
            '兔兔最喜欢听你算口算和读英语啦！🐰',
            '每答对一题，我的胡萝卜礼盒就会发光哦！✨',
            '等我升到 Lv.5 毕业，就去帮你开大超市当老板！🛒'
        ],
        enGreeting: 'Hello! I am your little bunny!'
    },
    {
        id: 'frog',
        name: '荷叶小青蛙',
        enName: 'Lotus Frog',
        category: 'forest',
        emoji: '🐸',
        img: 'assets/pets/frog.png',
        unlockCost: 0, // 首发免费C位
        isStarter: true,
        foodName: '森林露珠甜莓',
        foodIcon: '🍓',
        stageTitles: ['露珠乖乖蛙', '荷叶微笑蛙', '荷塘歌神蛙', '智慧博士蛙', '翡翠店长小青蛙'],
        talkLines: [
            '呱呱！今天我们一起挑战连对大满贯吧！🐸',
            '乘除法应用题难不倒聪明的小店长！💡',
            '毕业以后我想开一家甜甜的草莓蛋糕店！🍰'
        ],
        enGreeting: 'Ribbit! Let us learn together!'
    },
    {
        id: 'shiba',
        name: '奶油小柴',
        enName: 'Cream Shiba',
        category: 'forest',
        emoji: '🐶',
        img: 'assets/pets/shiba.png',
        unlockCost: 20,
        isStarter: false,
        foodName: '香烤牛奶骨头饼',
        foodIcon: '🦴',
        stageTitles: ['奶香小奶柴', '红领巾小柴', '元气巡逻柴', '微笑暖心柴', '汪汪金牌店长'],
        talkLines: [
            '汪汪！你的英语发音真好听！🐶',
            '攒够徽章喂我吃牛奶饼干，我会长得超快哦！'
        ],
        enGreeting: 'Woof! You are super smart!'
    },
    {
        id: 'panda',
        name: '胖胖竹熊',
        enName: 'Bamboo Panda',
        category: 'forest',
        emoji: '🐼',
        img: 'assets/pets/panda.png',
        unlockCost: 25,
        isStarter: false,
        foodName: '鲜嫩春笋团子',
        foodIcon: '🎋',
        stageTitles: ['滚滚糯米团', '抱竹小团子', '功夫小竹熊', '博学国宝熊', '竹林大掌柜熊猫'],
        talkLines: [
            '抱紧我的小竹笋，看你连对放烟花！🐼',
            '去单词屋背 5 个新单词就能拿超多徽章呢！'
        ],
        enGreeting: 'Yummy bamboo! Keep going!'
    },

    // ================= 2. 国风神兽 (对标学校爆款神兽图鉴) =================
    {
        id: 'tiger',
        name: '白虎',
        enName: 'White Tiger',
        category: 'mythical',
        emoji: '🐯',
        img: 'assets/pets/tiger.png',
        unlockCost: 35,
        isStarter: false,
        foodName: '星光能量肉排',
        foodIcon: '🍖',
        stageTitles: ['酣睡小奶虎', '萌爪小白虎', '啸风少年虎', '银甲守护虎', '威风凛凛白虎王'],
        talkLines: [
            '嗷呜～虽然我爱打瞌睡，算起数来可神速啦！🐯',
            '连对 3 题就能唤醒我的瑞兽双倍光环！⚡'
        ],
        enGreeting: 'Roar! I am the brave white tiger!'
    },
    {
        id: 'unicorn',
        name: '独角兽',
        enName: 'Cloud Unicorn',
        category: 'mythical',
        emoji: '🦄',
        img: 'assets/pets/unicorn.png',
        unlockCost: 40,
        isStarter: false,
        foodName: '彩虹棉花糖云',
        foodIcon: '🍭',
        stageTitles: ['云朵小睡驹', '星角小甜驹', '踏云独角兽', '极光守护兽', '梦幻天马大店长'],
        talkLines: [
            '软绵绵的云朵上，最适合背英语单词啦！🦄',
            '我的彩虹独角会为你点亮每一颗记忆星！🌈'
        ],
        enGreeting: 'Magic rainbows for every right answer!'
    },
    {
        id: 'succulent',
        name: '多肉精灵',
        enName: 'Succulent Fairy',
        category: 'mythical',
        emoji: '🌱',
        img: 'assets/pets/succulent.png',
        unlockCost: 30,
        isStarter: false,
        foodName: '七彩晨露甘霖',
        foodIcon: '💧',
        stageTitles: ['含苞小叶芽', '露珠多肉宝', '翡翠莲花灵', '森系花仙子', '万物生机多肉王'],
        talkLines: [
            '头顶的小露珠一闪一闪，祝你题题全对！🌱',
            '毕业后让我去经营彩虹鲜花坊最合适不过啦！🌸'
        ],
        enGreeting: 'Fresh dew and happy smiles!'
    },
    {
        id: 'pixiu',
        name: '貔貅',
        enName: 'Lucky Pixiu',
        category: 'mythical',
        emoji: '🪙',
        img: 'assets/pets/pixiu.png',
        unlockCost: 45,
        isStarter: false,
        foodName: '金灿灿福气果',
        foodIcon: '🍊',
        stageTitles: ['玉润小萌兽', '抱元宝貔貅', '瑞气招财兽', '金翼祥瑞兽', '福星高照大掌柜'],
        talkLines: [
            '摸摸我的小金元宝，心算又快又准！🪙',
            '把错题本里的题目消灭掉，能拿双倍徽章哦！'
        ],
        enGreeting: 'Good luck and golden badges for you!'
    },

    // ================= 3. 盲盒/隐藏款 (扭蛋专属限定!) =================
    {
        id: 'astro_rabbit',
        name: '宇航员兔兔',
        enName: 'Astro Bunny',
        category: 'blindbox',
        emoji: '🚀',
        img: 'assets/pets/astro_rabbit.png',
        unlockCost: 0,
        isBlindbox: true,
        rarity: 'SSR 隐藏款',
        foodName: '银河星星软糖',
        foodIcon: '⭐',
        stageTitles: ['见习太空兔', '月球漫步兔', '星际领航兔', '银河舰长兔', '宇宙传奇兔店长'],
        talkLines: [
            '呼叫小店长！我们一起飞向数学与英语太空站！🚀',
            '我是超稀有的宇航员兔兔，最擅长星际心算！🌟'
        ],
        enGreeting: 'Three, two, one, blast off to the stars!'
    },
    {
        id: 'prince_frog',
        name: '皇冠王子蛙',
        enName: 'Prince Frog',
        category: 'blindbox',
        emoji: '👑',
        img: 'assets/pets/prince_frog.png',
        unlockCost: 0,
        isBlindbox: true,
        rarity: 'SSR 隐藏款',
        foodName: '皇家蓝莓松饼',
        foodIcon: '🫐',
        stageTitles: ['小皇冠青蛙', '红披风骑士蛙', '魔法权杖蛙', '童话守护蛙', '翡翠王国王子蛙'],
        talkLines: [
            '挥动我的星星魔法棒，生词难题统统变简单！👑',
            '披上红披风，我就是小镇最帅气的青蛙店长！✨'
        ],
        enGreeting: 'Magic wand ready! You are royalty!'
    },
    {
        id: 'star_dragon',
        name: '星空幻龙',
        enName: 'Galaxy Dragon',
        category: 'blindbox',
        emoji: '🌌',
        img: 'assets/pets/star_dragon.png',
        unlockCost: 0,
        isBlindbox: true,
        rarity: 'UR 传说款',
        foodName: '极光水晶果冻',
        foodIcon: '🔮',
        stageTitles: ['星尘小龙宝', '紫翼小星龙', '璀璨银河龙', '星穹守护龙', '传说星海龙店长'],
        talkLines: [
            '哇！能抽中传说级星空幻龙，你的运气爆棚啦！🌌',
            '扇动金色小翅膀，带你横扫一切高难度挑战！'
        ],
        enGreeting: 'Shine bright like a galaxy dragon!'
    },
    {
        id: 'mecha_cat',
        name: '未来机械喵',
        enName: 'Mecha Kitty',
        category: 'blindbox',
        emoji: '🤖',
        img: 'assets/pets/mecha_cat.png',
        unlockCost: 0,
        isBlindbox: true,
        rarity: 'SSR 隐藏款',
        foodName: '超能闪电电池奶',
        foodIcon: '🔋',
        stageTitles: ['迷你机器喵', '爱心雷达喵', '量子速算喵', '超能科技喵', '未来赛博喵店长'],
        talkLines: [
            '滴嘟喵～爱心屏幕已点亮，正在为你加油充能！🤖',
            '数据图表分析可是我未来机械喵的拿手绝活！📊'
        ],
        enGreeting: 'Beep meow! Brain power one hundred percent!'
    }
];

// 6大微缩3D主题店铺 (对标参考图1 & 图3)
export const SHOPS_CATALOG = [
    {
        id: 'supermarket',
        name: '超市',
        enName: 'Supermarket',
        emoji: '🛒',
        imgLv1: 'assets/shops/supermarket_lv1.png',
        imgLv5: 'assets/shops/supermarket_lv5.png',
        themeColor: '#3b82f6',
        desc: '琳琅满目的水果零食百货超市，升至高级可蜕变为宏伟双子星商业大厦！',
        stageNames: ['便民小果摊', '阳光便利店', '鲜果生活超市', '双层购物广场', '皇家双子星大超市']
    },
    {
        id: 'sweetshop',
        name: '甜品店',
        enName: 'Sweet Bakery',
        emoji: '🍰',
        imgLv1: 'assets/shops/sweetshop.png',
        imgLv5: 'assets/shops/sweetshop.png',
        themeColor: '#ec4899',
        desc: '飘满草莓奶油蛋糕与马卡龙香气的梦幻甜品屋！',
        stageNames: ['街头纸杯蛋糕车', '蜜糖烘焙坊', '草莓甜心屋', '马卡龙梦幻馆', '皇家甜品童话宫']
    },
    {
        id: 'burgershop',
        name: '汉堡店',
        enName: 'Burger Diner',
        emoji: '🍔',
        imgLv1: 'assets/shops/burgershop.png',
        imgLv5: 'assets/shops/burgershop.png',
        themeColor: '#f59e0b',
        desc: '滋滋作响的香脆汉堡薯条快餐厅，小镇人气王！',
        stageNames: ['迷你汉堡餐车', '元气薯条屋', '开心汉堡餐厅', '黄金双层汉堡城', '星级美食欢乐堡']
    },
    {
        id: 'library',
        name: '图书馆',
        enName: 'Magic Library',
        emoji: '📚',
        imgLv1: 'assets/shops/library.png',
        imgLv5: 'assets/shops/library.png',
        themeColor: '#8b5cf6',
        desc: '藏满奇幻绘本与双语魔法书的猫头鹰智慧书屋！',
        stageNames: ['森林绘本角', '星光阅读室', '猫头鹰故事馆', '双语智慧书院', '皇家魔法大图书馆']
    },
    {
        id: 'flowershop',
        name: '花店',
        enName: 'Flower Shop',
        emoji: '🌸',
        imgLv1: 'assets/shops/flowershop.png',
        imgLv5: 'assets/shops/flowershop.png',
        themeColor: '#10b981',
        desc: '四季盛开着玫瑰、向日葵与郁金香的阳光玻璃花房！',
        stageNames: ['清晨鲜花篮', '绿野小花铺', '玻璃阳光花房', '缤纷玫瑰庄园', '梦幻四季百花宫']
    },
    {
        id: 'postoffice',
        name: '邮局',
        enName: 'Post Office',
        emoji: '📮',
        imgLv1: 'assets/shops/postoffice.png',
        imgLv5: 'assets/shops/postoffice.png',
        themeColor: '#14b8a6',
        desc: '白鸽传书！帮全镇小动物寄送生日贺卡与惊喜包裹！',
        stageNames: ['森林小红邮筒', '白鸽信使站', '暖心包裹驿站', '童话集邮大楼', '环球萌宠邮政总局']
    }
];

// 盲盒可抽出的萌宠小配饰
export const PET_ACCESSORIES = [
    { id: 'none', name: '无装扮', icon: '✨' },
    { id: 'crown', name: '闪耀金皇冠', icon: '👑' },
    { id: 'sunglasses', name: '酷炫店长墨镜', icon: '🕶️' },
    { id: 'ribbon', name: '甜心蝴蝶结', icon: '🎀' },
    { id: 'wizard', name: '学霸博士帽', icon: '🎓' },
    { id: 'flower', name: '夏威夷花环', icon: '🌺' },
    { id: 'medal', name: '星光荣誉星', icon: '🌟' }
];

// 萌宠小镇可免费/微徽章布置的景观装饰物 (装扮小镇功能)
export const TOWN_DECORS = [
    { id: 'fountain', name: '音乐喷泉', icon: '⛲', cost: 8 },
    { id: 'ferris', name: '彩虹摩天轮', icon: '🎡', cost: 12 },
    { id: 'carousel', name: '童话旋转木马', icon: '🎠', cost: 10 },
    { id: 'sakura', name: '浪漫樱花树', icon: '🌸', cost: 6 },
    { id: 'camping', name: '野餐小帐篷', icon: '⛺', cost: 6 }
];

// 横屏 16:9 海滨铁道萌宠小镇 11 块黄金草坪街区坐标 (像素级对齐 town_bg.jpg 等距绿茵地块)
export const TOWN_PLOTS = [
    { id: 'plot_1', label: '松林北苑 1 号', left: 42, top: 21 },
    { id: 'plot_2', label: '樱花西街 1 号', left: 25, top: 34 },
    { id: 'plot_3', label: '绿茵西湾 2 号', left: 14, top: 49 },
    { id: 'plot_4', label: '中央大道北广场', left: 51, top: 36 },
    { id: 'plot_5', label: '星语中心广场', left: 39, top: 50 },
    { id: 'plot_6', label: '阳光大道西街', left: 28, top: 64 },
    { id: 'plot_7', label: '星语南广场', left: 49, top: 63 },
    { id: 'plot_8', label: '海风北湾 1 号', left: 61, top: 25 },
    { id: 'plot_9', label: '红白灯塔东湾', left: 84, top: 38 },
    { id: 'plot_10', label: '金沙海角广场', left: 63, top: 73 },
    { id: 'plot_11', label: '环岛铁道南湾', left: 41, top: 82 }
];

export function getPetById(id) {
    return PETS_CATALOG.find(p => p.id === id) || PETS_CATALOG[0];
}

export function getShopById(id) {
    return SHOPS_CATALOG.find(s => s.id === id) || SHOPS_CATALOG[0];
}
