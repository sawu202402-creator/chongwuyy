/**
 * config.js - 《奇妙萌宠店长：数英星语镇》核心图鉴、等级形态样式、个性台词、荷叶换装与小镇沙盘配置
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

// 宠物 5 个等级阶段外观样式元数据（每次升级自动解锁新样式，也可随时自由切回已解锁的历代等级样式！）
export const PET_STAGE_STYLES = [
    {
        stage: 1,
        badge: 'Lv.1 萌宝态',
        shortLabel: 'Lv.1 萌宝',
        scale: 0.85,
        pedestalClass: 'pedestal-lv1',
        auraClass: 'aura-lv1',
        propCount: 0,
        summary: '初生软垫 · 奶萌幼年体态'
    },
    {
        stage: 2,
        badge: 'Lv.2 元气态',
        shortLabel: 'Lv.2 元气',
        scale: 0.93,
        pedestalClass: 'pedestal-lv2',
        auraClass: 'aura-lv2',
        propCount: 1,
        summary: '流光涟漪底座 · 唤醒专属伴生灵物'
    },
    {
        stage: 3,
        badge: 'Lv.3 闪耀态',
        shortLabel: 'Lv.3 闪耀',
        scale: 1.0,
        pedestalClass: 'pedestal-lv3',
        auraClass: 'aura-lv3',
        propCount: 2,
        summary: '旋转星纹魔法阵 · 双灵物环绕辉光'
    },
    {
        stage: 4,
        badge: 'Lv.4 精英态',
        shortLabel: 'Lv.4 精英',
        scale: 1.06,
        pedestalClass: 'pedestal-lv4',
        auraClass: 'aura-lv4',
        propCount: 2,
        summary: '璀璨圣环背光 · 晶钻荣耀底座'
    },
    {
        stage: 5,
        badge: 'Lv.5 传奇态',
        shortLabel: 'Lv.5 传奇',
        scale: 1.12,
        pedestalClass: 'pedestal-lv5',
        auraClass: 'aura-lv5',
        propCount: 3,
        summary: '彩虹流光羽翼神环 · 满级皇家宝座'
    }
];

// 宠物升级经验阶梯 (1徽章=1成长值，配合每日30枚上限，约需坚持打卡5~6天升至Lv.5满级毕业！)
// Lv.1(0->20), Lv.2(0->35), Lv.3(0->50), Lv.4(0->65), Lv.5(已毕业! 累计170点)
export const PET_LEVEL_MAX_EXP = {
    1: 20,
    2: 35,
    3: 50,
    4: 65,
    5: 65
};

export const FEED_BADGE_COST = 5;    // 每次投喂美食消耗 5 枚徽章
export const FEED_EXP_GAIN = 5;      // 每次投喂稳步增加 5 点成长值 (1徽章 = 1成长值)

export const SHOP_LEVEL_MAX_EXP = {
    1: 24,
    2: 42,
    3: 60,
    4: 78,
    5: 78
};

export const SHOP_UPGRADE_BADGE_COST = 6; // 每次进货扩建消耗 6 枚徽章
export const SHOP_UPGRADE_EXP_GAIN = 6;   // 每次进货增加 6 点店铺繁荣度
export const GACHA_BADGE_COST = 35;       // 无扭蛋券时消耗 35 徽章可抽一次惊喜盲盒

// 每日防刷腻习惯养成上限配置 (自然日零点自动重置，可在家长设置中按孩子调整)
export const DEFAULT_DAILY_BADGE_CAP = 30;
export const DAILY_BADGE_CAP_OPTIONS = [15, 25, 30, 45, 60];
export const DAILY_TICKET_CAP = 2;        // 每日最多掉落 2 张免费盲盒券

export const PETS_CATALOG = [
    // ================= 1. 绿野部落 (兔子与青蛙双C位首发免费!) =================
    {
        id: 'rabbit',
        name: '垂耳兔',
        enName: 'Lop Bunny',
        category: 'forest',
        emoji: '🐰',
        voiceTag: '噗啾🐰',
        auraColor: '#ff7eb3',
        auraSecondary: '#ffb347',
        stageProps: ['🥕', '🎁', '💖'],
        img: 'assets/pets/rabbit.png',
        unlockCost: 0,
        isStarter: true,
        foodName: '甜脆胡萝卜礼盒',
        foodIcon: '🥕',
        stageTitles: ['糯米睡睡兔', '抱礼盒小兔', '伶俐胡萝卜兔', '金牌迎宾兔', '传奇店长垂耳兔'],
        stageDescs: [
            '软绵奶绒垫 · 耷拉长耳朵的糯米团子',
            '蜜桃涟漪台 · 甜脆胡萝卜伴身漂浮',
            '粉金星阵 · 惊喜礼盒与胡萝卜双辉环绕',
            '暖金铃铛圣环 · 金牌迎宾流光背饰',
            '彩虹皇家礼台 · 梦幻粉金流光羽翼'
        ],
        talkLines: [
            '噗啾～我是软乎乎的糯米睡睡兔，听你读英语耳朵都会竖起来哟！🐰',
            '哒哒！升到二阶有胡萝卜漂浮相伴啦，我们再算几道题吧！🥕',
            '叮铃铃～脚下亮起粉金魔法阵，兔兔的礼盒里藏着好运气！🎁',
            '金铃圣环闪闪发光！金牌迎宾兔随时准备为你摇铃喝彩！✨',
            '噗啾啾！传奇垂耳兔店长驾到，彩虹光翼为你守护每一颗星！🌈'
        ],
        interactLines: [
            '噗啾～摸摸我的长垂耳，软绵绵像棉花糖一样对不对？🐰💕',
            '嘻嘻好痒呀！兔兔开心得原地蹦三下：Hop, hop, hooray! 🥕',
            '摇摇脖子上的小金铃铛，祝小店长心算神速、单词全记住！🔔',
            '兔兔把最甜的胡萝卜分你一半，击个掌继续冲鸭！🙌✨'
        ],
        enInteractPhrases: [
            'Hello! Touch my soft bunny ears!',
            'Hop, hop! You are my best friend!',
            'Crunchy carrots give us super power!'
        ],
        feedLines: [
            '咔嚓咔嚓！甜脆胡萝卜汁水满满，兔兔长耳朵都幸福得晃起来啦！🥕💖',
            '啊呜一大口～吃完胡萝卜礼盒，毛茸茸肚皮圆滚滚啰！😋🐰',
            '噗啾～这是世界上最香甜的胡萝卜！兔兔充满能量陪你闯关！✨'
        ],
        cheerRightLines: [
            '噗啾好棒！兔兔的长耳朵为你啪啪鼓掌！🐰👏',
            '哇塞秒答对！我的胡萝卜礼盒都在冒粉红泡泡啦！🥕✨',
            '太聪明啦！兔兔跳起兔子舞给你庆祝！💃🐰'
        ],
        cheerWrongLines: [
            '噗啾没关系～兔兔揉揉你的小手，看清提示下一题稳稳拿下！🐰💕',
            '别灰心哟，长耳朵兔兔陪你深呼吸，慢一点就对啦！🍀'
        ],
        shopLines: [
            '噗啾欢迎光临！垂耳兔店长把货架擦得亮晶晶啦！🛒🐰',
            '多答对几道题，咱们的小店就能进满好吃的水果和甜点哟！✨'
        ],
        enGreeting: 'Hello! I am your little bunny!'
    },
    {
        id: 'frog',
        name: '荷叶小青蛙',
        enName: 'Lotus Frog',
        category: 'forest',
        emoji: '🐸',
        voiceTag: '呱呱🐸',
        auraColor: '#10b981',
        auraSecondary: '#f472b6',
        stageProps: ['💧', '🪷', '🎵'],
        img: 'assets/pets/frog.png',
        unlockCost: 0,
        isStarter: true,
        foodName: '森林露珠甜莓',
        foodIcon: '🍓',
        stageTitles: ['露珠乖乖蛙', '荷叶微笑蛙', '荷塘歌神蛙', '智慧博士蛙', '翡翠店长小青蛙'],
        stageDescs: [
            '清晨小池垫 · 眨巴大眼睛的露珠小蛙',
            '碧波荷塘台 · 晶莹晨露水珠灵动环绕',
            '翠绿荷韵星阵 · 粉嫩荷花与音符共舞',
            '翡翠博士圣环 · 荷塘金辉星冕加持',
            '彩虹莲华宝座 · 翡翠流光神翼大店长'
        ],
        talkLines: [
            '呱呱！我坐在清凉大荷叶上，最喜欢听你清脆地读英语啦！🐸🌿',
            '噗通～碧波底座泛起小水花，今天一起挑战连对大满贯吧！💧',
            '呱啦啦🎵！荷塘歌神蛙开嗓啦，粉莲与音符为你伴奏助威！🪷',
            '呱哼！戴稳智慧光环，再难的乘除应用题也逃不过蛙博士的法眼！💡',
            '呱呱万岁！翡翠店长小青蛙脚踏七彩莲台，带你称霸星语小镇！🌈🐸'
        ],
        interactLines: [
            '呱呱～摸摸我头顶清凉的小荷叶，露珠滚下来冰冰凉好舒服呀！🌿💧',
            '噗通！蛙蛙给你表演一个荷叶原地后空翻：Ribbit jump! 🐸🎵',
            '咕呱咕呱～别挠我圆鼓鼓的白肚皮啦，笑得唱出青蛙交响曲啰！😆🪷',
            '呱！戴着荷叶装扮精神百倍，跟本蛙击个蛙掌冲刺满分！🙌🐸'
        ],
        enInteractPhrases: [
            'Ribbit ribbit! Cool lotus leaf on my head!',
            'Jump high like a happy pond frog!',
            'Let us sing and learn together, ribbit!'
        ],
        feedLines: [
            '咻——啪！小舌头一卷接住森林露珠甜莓，酸酸甜甜呱呱叫绝！🍓🐸',
            '咕嘟咕嘟～吃完冰凉甜莓，蛙蛙在荷叶上开心得连蹦三尺高！🌿✨',
            '嗝～呱！腮帮子鼓鼓囊囊好满足，荷塘能量瞬间加满啦！😋💧'
        ],
        cheerRightLines: [
            '呱呱呱！又快又准，荷塘里的粉荷花都为你盛开啦！🪷👏',
            '噗通满分！小青蛙敲响荷叶小鼓为你庆贺！🥁🐸',
            '呱呜太牛啦！你就是我们荷塘最闪亮的数英小状元！🌟'
        ],
        cheerWrongLines: [
            '呱～别急别急，坐在荷叶上吹吹凉风，看一眼正解马上就懂啦！🌿🐸',
            '小青蛙鼓鼓腮帮给你打气：呱呱加油，下一题一定跳得更高！💪'
        ],
        shopLines: [
            '呱呱欢迎光临！荷叶小青蛙店长今天也精神抖擞迎客啰！🏪🐸',
            '算盘打得啪啪响，蛙蛙帮你把小店经营得红红火火！🪷✨'
        ],
        enGreeting: 'Ribbit! Let us learn together!'
    },
    {
        id: 'shiba',
        name: '奶油小柴',
        enName: 'Cream Shiba',
        category: 'forest',
        emoji: '🐶',
        voiceTag: '汪呜🐶',
        auraColor: '#f59e0b',
        auraSecondary: '#fb7185',
        stageProps: ['🦴', '🐾', '🌟'],
        img: 'assets/pets/shiba.png',
        unlockCost: 45,
        isStarter: false,
        foodName: '香烤牛奶骨头饼',
        foodIcon: '🦴',
        stageTitles: ['奶香小奶柴', '红领巾小柴', '元气巡逻柴', '微笑暖心柴', '汪汪金牌店长'],
        stageDescs: [
            '暖黄软垫 · 歪头卖萌的奶香小幼柴',
            '焦糖波纹台 · 牛奶小骨头欢快环绕',
            '金橙梅花爪星阵 · 小肉垫印记闪耀',
            '暖阳守护圣环 · 忠诚金辉披风气场',
            '彩虹汪汪王座 · 传奇金牌柴犬大店长'
        ],
        talkLines: [
            '汪呜～奶香小奶柴歪着脑袋听你读单词，尾巴摇个不停哟！🐶',
            '汪汪！闻到牛奶骨头饼的香味啦，我们快去闯关赚徽章吧！🦴',
            '元气巡逻柴报到！肉垫魔法阵已开启，错题坏蛋休想溜走！🐾',
            '嗷汪～暖阳圣环照耀，小柴永远做你最阳光的陪读小卫士！☀️',
            '汪汪大满贯！金牌柴犬店长摇着螺旋桨尾巴迎接八方来客！🌈🐶'
        ],
        interactLines: [
            '汪呜～揉揉我的飞机耳，小柴眯起眼睛笑成小月牙啦！🐶💕',
            '汪汪！尾巴摇成小电扇，接飞盘和接单词一样百发百中！🐾✨',
            '翻个肚皮给你摸摸～只要夸我一句 Good boy 我就超开心！😆'
        ],
        enInteractPhrases: [
            'Woof woof! Wagging my tail for you!',
            'Good job! You are super smart!',
            'Let us fetch more shiny badges!'
        ],
        feedLines: [
            '咔嘣咔嘣！香烤牛奶骨头饼太酥脆啦，尾巴摇出残影啰！🦴🐶',
            '嗷呜一口接住！浓郁奶香在嘴里化开，小柴幸福得原地转圈圈！😋✨'
        ],
        cheerRightLines: [
            '汪汪好球！这题答得像接飞盘一样稳准狠！🐶🐾',
            '嗷呜太赞啦！小柴给你送上最灿烂的治愈柴犬笑！🌟'
        ],
        cheerWrongLines: [
            '汪呜～蹭蹭你的手心，小柴陪你再看一遍，下次准能咬住正确答案！🐶💪'
        ],
        shopLines: [
            '汪汪欢迎惠顾！小柴店长在门口热情摇尾巴迎客啦！🏪🐶'
        ],
        enGreeting: 'Woof! You are super smart!'
    },
    {
        id: 'panda',
        name: '胖胖竹熊',
        enName: 'Bamboo Panda',
        category: 'forest',
        emoji: '🐼',
        voiceTag: '呼噜🐼',
        auraColor: '#22c55e',
        auraSecondary: '#eab308',
        stageProps: ['🎋', '🥟', '💚'],
        img: 'assets/pets/panda.png',
        unlockCost: 55,
        isStarter: false,
        foodName: '鲜嫩春笋团子',
        foodIcon: '🎋',
        stageTitles: ['滚滚糯米团', '抱竹小团子', '功夫小竹熊', '博学国宝熊', '竹林大掌柜熊猫'],
        stageDescs: [
            '翠竹软垫 · 圆滚滚的黑白糯米团',
            '清风竹韵台 · 鲜嫩青竹叶随风飘舞',
            '太极翠竹星阵 · 功夫竹笋双星护体',
            '翡翠国宝圣环 · 金竹宗师气场全开',
            '彩虹竹海宝座 · 传奇国宝大掌柜光翼'
        ],
        talkLines: [
            '呼噜噜～我是圆滚滚的糯米团子，抱紧小竹笋陪你慢悠悠学好每一题！🐼',
            '咔嚓～翠竹底座长出嫩叶啦，去背 5 个新单词拿大奖吧！🎋',
            '哼哈！功夫小竹熊扎稳马步，加减乘除一招制胜！🥋🐼',
            '博学国宝熊推推小眼镜，难题秘诀都在竹简里藏着呢！📜',
            '呼噜万岁！竹林大掌柜坐镇彩虹宝座，福气与智慧满满当当！🌈🐼'
        ],
        interactLines: [
            '呼噜噜～捏捏我的黑眼圈和小圆耳朵，滚滚给你表演前滚翻！🐼💕',
            '嘿咻！拍拍软乎乎的圆肚皮，功夫熊猫教你心算秘籍！🎋✨',
            '抱住你的手指不撒手～再陪团子做两道趣味题好不好嘛！🥰'
        ],
        enInteractPhrases: [
            'Yummy bamboo! Roly poly panda roll!',
            'Kung fu math power, ha!',
            'Big panda hug for my smart friend!'
        ],
        feedLines: [
            '吧唧吧唧～鲜嫩春笋团子又脆又糯，滚滚吃得两个腮帮鼓成球啦！🎋🐼',
            '嗯～好香甜的竹笋味！团子幸福得在地上打了个滚儿！😋💚'
        ],
        cheerRightLines: [
            '哼哈漂亮！功夫竹熊给你亮出满分大金牌！🐼🏅',
            '呼噜太厉害啦！滚滚开心得连翻两个糯米跟头！🎋✨'
        ],
        cheerWrongLines: [
            '呼噜不怕不怕～团子给你大大的熊猫抱抱，歇口气再试一次！🐼💚'
        ],
        shopLines: [
            '呼噜欢迎客官！竹林大掌柜熊猫今日备足好货啦！🏪🐼'
        ],
        enGreeting: 'Yummy bamboo! Keep going!'
    },

    // ================= 2. 国风神兽 =================
    {
        id: 'tiger',
        name: '白虎',
        enName: 'White Tiger',
        category: 'mythical',
        emoji: '🐯',
        voiceTag: '嗷呜🐯',
        auraColor: '#38bdf8',
        auraSecondary: '#f59e0b',
        stageProps: ['⚡', '🍖', '🔥'],
        img: 'assets/pets/tiger.png',
        unlockCost: 80,
        isStarter: false,
        foodName: '星光能量肉排',
        foodIcon: '🍖',
        stageTitles: ['酣睡小奶虎', '萌爪小白虎', '啸风少年虎', '银甲守护虎', '威风凛凛白虎王'],
        stageDescs: [
            '云纹软垫 · 揣着粉肉垫打盹的小奶虎',
            '冰蓝雷纹台 · 闪电虎威伴身跃动',
            '银雷星阵 · 雷电与星火双灵环绕',
            '白金战甲圣环 · 瑞兽王者凛然金辉',
            '苍穹雷霆神座 · 传奇白虎神王流光翼'
        ],
        talkLines: [
            '嗷呜～别看本小奶虎爱眯眼打盹，心算速度可是风驰电掣哟！🐯',
            '咔嚓⚡！萌爪亮出小闪电，连对三题唤醒我的瑞兽光环吧！',
            '啸风少年虎踏雷而来，任何英语生词在本虎面前统统臣服！💨',
            '银甲圣环加身！守护小店长百战百胜、题题皆准！🛡️🐯',
            '嗷——呜！白虎神王展翼坐镇，星语小镇最强学霸非你莫属！🌈⚡'
        ],
        interactLines: [
            '嗷呜～竟然敢摸瑞兽的额头“王”字？好吧，只准你一个人摸喔！🐯💕',
            '呼噜呼噜…糟了，被你顺毛摸得发出大猫咪呼噜声啦，保密哟！😳✨',
            '亮出软乎乎的粉色虎爪跟你击掌：Roar! 勇往直前！🐾⚡'
        ],
        enInteractPhrases: [
            'Roar! Brave white tiger stands with you!',
            'Lightning fast brain power!',
            'Soft paws, mighty heart! Let us go!'
        ],
        feedLines: [
            '嗷呜一大口！星光能量肉排滋滋冒香，本虎浑身充满雷霆之力！🍖⚡',
            '唔～肉排鲜嫩多汁！小白虎舔舔嘴角，战力瞬间飙升 200%！😋🐯'
        ],
        cheerRightLines: [
            '嗷呜威武！干脆利落，颇有本白虎王的大将之风！🐯⚡',
            '雷霆一击全对！瑞兽光环为你闪耀喝彩！🌟'
        ],
        cheerWrongLines: [
            '嗷呜稳住！真正的猛虎从不怕小小失误，看准破绽再战一合！🐯💪'
        ],
        shopLines: [
            '嗷呜！白虎掌柜镇店，诚信经营、人气如虹！🏪🐯'
        ],
        enGreeting: 'Roar! I am the brave white tiger!'
    },
    {
        id: 'unicorn',
        name: '独角兽',
        enName: 'Cloud Unicorn',
        category: 'mythical',
        emoji: '🦄',
        voiceTag: '叮铃🦄',
        auraColor: '#c084fc',
        auraSecondary: '#f472b6',
        stageProps: ['🌈', '🍭', '⭐'],
        img: 'assets/pets/unicorn.png',
        unlockCost: 90,
        isStarter: false,
        foodName: '彩虹棉花糖云',
        foodIcon: '🍭',
        stageTitles: ['云朵小睡驹', '星角小甜驹', '踏云独角兽', '极光守护兽', '梦幻天马大店长'],
        stageDescs: [
            '棉花云软垫 · 蜷在甜梦里的云朵小驹',
            '薰衣草星雾台 · 迷你彩虹桥轻盈伴身',
            '星月幻彩魔法阵 · 彩虹与棒棒糖辉映',
            '极光水晶圣环 · 梦幻星尘流光萦绕',
            '七彩天马云宫座 · 璀璨彩虹神翼绽放'
        ],
        talkLines: [
            '叮铃铃～躺在软绵绵的云朵上背单词，每个字母都是甜丝丝的！🦄',
            '看呀！我的小独角点亮了一道迷你彩虹，为你带来答题好运！🌈',
            '踏云独角兽轻盈起舞，星月魔法阵帮你把难词牢牢记住！✨',
            '极光圣环如梦似幻，你认真的样子比漫天星辰还要耀眼哟！💫',
            '叮铃～梦幻天马展开彩虹神翼，陪你飞向知识云端最高处！🌈🦄'
        ],
        interactLines: [
            '叮铃～轻轻碰碰我的水晶独角，洒你一身亮晶晶的彩虹星尘！🦄🌈',
            '咴咴～粉紫色的鬃毛被你梳得顺顺滑滑，好温柔呀！💕✨',
            '踏着七彩祥云转个圈：Magic sparkle! 今天也是闪闪发光的一天！🌟'
        ],
        enInteractPhrases: [
            'Magic rainbows shine for every answer!',
            'Touch my crystal horn and make a wish!',
            'Floating on sweet clouds with you!'
        ],
        feedLines: [
            '啊呜～彩虹棉花糖云入口即化，甜滋滋的星光从独角尖冒出来啦！🍭🦄',
            '叮铃好美味！吃完七彩云朵糖，连打个小喷嚏都是彩虹泡泡呢！🌈💖'
        ],
        cheerRightLines: [
            '叮铃太美妙啦！一道绚丽彩虹为你横跨天际！🦄🌈',
            '星角闪耀满分！你就像施展了最聪明的记忆魔法！✨'
        ],
        cheerWrongLines: [
            '叮铃别难过～独角兽用温暖云朵裹住你，看清解析马上变聪明！🦄💕'
        ],
        shopLines: [
            '叮铃欢迎光临梦幻小店！每一份商品都附赠彩虹祝福哟！🏪🦄'
        ],
        enGreeting: 'Magic rainbows for every right answer!'
    },
    {
        id: 'succulent',
        name: '多肉精灵',
        enName: 'Succulent Fairy',
        category: 'mythical',
        emoji: '🌱',
        voiceTag: '沙沙🌱',
        auraColor: '#34d399',
        auraSecondary: '#fb7185',
        stageProps: ['💧', '🌸', '🍃'],
        img: 'assets/pets/succulent.png',
        unlockCost: 65,
        isStarter: false,
        foodName: '七彩晨露甘霖',
        foodIcon: '💧',
        stageTitles: ['含苞小叶芽', '露珠多肉宝', '翡翠莲花灵', '森系花仙子', '万物生机多肉王'],
        stageDescs: [
            '森系苔藓垫 · 胖嘟嘟含苞待放的小叶芽',
            '晨露森光台 · 晶莹水珠滋润翠绿叶片',
            '森之花语星阵 · 粉樱花瓣与露珠旋舞',
            '翡翠花仙圣环 · 柔和桃绿生命光晕',
            '万物繁花仙境座 · 森系流光精灵花翼'
        ],
        talkLines: [
            '沙沙～我是胖嘟嘟的含苞小叶芽，你每答对一题我就偷偷长大一点点！🌱',
            '滴答💧！叶片尖挂着亮晶晶的晨露，小脑袋瓜也清清爽爽最好记单词啦！',
            '翡翠莲花灵舒展花瓣，森林里的微风都在夸你勤奋呢！🌸',
            '森系花仙圣环绽放！知识就像阳光雨露，让你每天拔节生长！🍃✨',
            '沙沙欢歌～万物生机多肉王盛装开花，为你献上整座花园的芬芳！🌈🌺'
        ],
        interactLines: [
            '沙沙～戳戳我肉嘟嘟的果冻叶片，Q弹饱满超解压对不对？🌱💕',
            '叮咚！头顶的小露珠晃呀晃，折射出七彩小太阳送给你！💧✨',
            '微风拂过小花苞，多肉精灵轻轻摇摆给你跳支森林圆舞曲！🌸🎵'
        ],
        enInteractPhrases: [
            'Fresh morning dew and happy smiles!',
            'Grow a little taller every single day!',
            'Little green leaves cheering for you!'
        ],
        feedLines: [
            '咕嘟咕嘟～喝饱七彩晨露甘霖，每片多肉叶子都变得水灵灵透亮啦！💧🌱',
            '哇～甘甜雨露滋润心田，头顶悄悄冒出一朵粉嫩小花苞呢！🌸😋'
        ],
        cheerRightLines: [
            '沙沙好棒！多肉精灵开心得绽放出粉嫩小花朵！🌱🌸',
            '清新满分！你的思维像森林清泉一样敏捷透亮！💧✨'
        ],
        cheerWrongLines: [
            '沙沙慢一点没关系～小树苗也是经历风雨才长高的，我们再试一次！🌱💚'
        ],
        shopLines: [
            '沙沙欢迎光临！多肉店长把整间店铺装点得春意盎然啦！🏪🌸'
        ],
        enGreeting: 'Fresh dew and happy smiles!'
    },
    {
        id: 'pixiu',
        name: '貔貅',
        enName: 'Lucky Pixiu',
        category: 'mythical',
        emoji: '🪙',
        voiceTag: '叮当🪙',
        auraColor: '#f59e0b',
        auraSecondary: '#ef4444',
        stageProps: ['🪙', '🍊', '🧧'],
        img: 'assets/pets/pixiu.png',
        unlockCost: 100,
        isStarter: false,
        foodName: '金灿灿福气果',
        foodIcon: '🍊',
        stageTitles: ['玉润小萌兽', '抱元宝貔貅', '瑞气招财兽', '金翼祥瑞兽', '福星高照大掌柜'],
        stageDescs: [
            '祥云红金垫 · 圆润讨喜的玉润小萌兽',
            '流金聚宝台 · 闪亮金元宝萦绕身旁',
            '乾坤祥瑞星阵 · 金币与大吉柑橘齐飞',
            '金翼紫气圣环 · 祥瑞宝光熠熠生辉',
            '紫禁聚宝金殿座 · 传奇福星流光金翼'
        ],
        talkLines: [
            '叮当～摸摸玉润小貔貅，今天做题福气满满、顺风顺水哟！🪙',
            '抱紧我的小金元宝！去错题本淘金能直接拿双倍徽章呢！💰',
            '瑞气招财兽脚踏祥云阵，知识财富只进不出，越攒越厚实！🧧',
            '金翼圣环熠熠生辉！算术又准、单词又牢，真是文曲小福星！✨',
            '叮当大吉！福星高照大掌柜坐镇金殿，祝小店长学业兴旺节节高！🌈🪙'
        ],
        interactLines: [
            '叮当响～摸摸我的独角和金元宝，好运值瞬间拉满 999+！🪙✨',
            '嘻嘻～小貔貅摇摇小金铃，把全镇的聪明福气都招到你碗里来！🧧💕',
            '扇扇毛茸茸的小金翅膀：Lucky star! 连对大奖正在向你招手！🌟'
        ],
        enInteractPhrases: [
            'Ding-dong! Golden luck and shiny badges!',
            'Smart brain brings the best treasure!',
            'Lucky Pixiu blesses every answer!'
        ],
        feedLines: [
            '啊呜！金灿灿福气果甘甜爆汁，小貔貅浑身冒出喜庆金元宝泡泡！🍊🪙',
            '咔嚓好甜呀！大吉大利福气果下肚，徽章好运滚滚来啰！😋🧧'
        ],
        cheerRightLines: [
            '叮当招财进宝！这题答得金光闪闪，知识金库又添一桶金！🪙👏',
            '祥瑞满分！小貔貅敲响铜锣为你报喜啦！🎊'
        ],
        cheerWrongLines: [
            '叮当莫慌～吃一堑长一智，把这道错题收进聚宝盆，学会就是双倍赚到！🪙💪'
        ],
        shopLines: [
            '叮当迎客！貔貅大掌柜坐镇收银台，小店日进斗金兴旺发达！🏪🪙'
        ],
        enGreeting: 'Good luck and golden badges for you!'
    },

    // ================= 3. 盲盒/隐藏款 =================
    {
        id: 'astro_rabbit',
        name: '宇航员兔兔',
        enName: 'Astro Bunny',
        category: 'blindbox',
        emoji: '🚀',
        voiceTag: '呼叫🚀',
        auraColor: '#60a5fa',
        auraSecondary: '#a855f7',
        stageProps: ['🪐', '⭐', '🛸'],
        img: 'assets/pets/astro_rabbit.png',
        unlockCost: 0,
        isBlindbox: true,
        rarity: 'SSR 隐藏款',
        foodName: '银河星星软糖',
        foodIcon: '⭐',
        stageTitles: ['见习太空兔', '月球漫步兔', '星际领航兔', '银河舰长兔', '宇宙传奇兔店长'],
        stageDescs: [
            '月球环形垫 · 头戴透明宇航罩的见习小兔',
            '失重星轨台 · 迷你小土星环绕漂浮',
            '星际罗盘魔法阵 · 行星与流星双轨护航',
            '超新星等离子圣环 · 银河舰长湛蓝光盾',
            '深空星舰指挥座 · 宇宙极光推进神翼'
        ],
        talkLines: [
            '滋滋—呼叫小店长！见习太空兔已登陆你的书桌，准备开启星际特训！🚀',
            '月球漫步失重漂浮中～在太空里算口算，脑筋转得比火箭还快！🪐',
            '星际罗盘锁定目标！前方发现大批英语新词星球，全速前进！⭐',
            '银河舰长兔报告：能量护盾全开，高难应用题陨石群轻松击碎！🛸',
            '三、二、一，点火！宇宙传奇兔店长带你遨游浩瀚数英银河系！🌌🚀'
        ],
        interactLines: [
            '叩叩～敲敲我的圆球宇航头盔，里面的长耳朵开心地向你敬礼！🚀🐰',
            '呼～给你表演一个月球零重力慢动作太空步：Moonwalk! 🪐✨',
            '哔哔！宇航服通讯器传来加密电波：“小店长是全宇宙最棒哒！”🌟'
        ],
        enInteractPhrases: [
            'Three, two, one, blast off to the stars!',
            'Houston, we have a super genius here!',
            'Zero gravity bunny hop in space!'
        ],
        feedLines: [
            '咻——银河星星软糖飘进太空舱，酸甜跳跳糖在嘴里像流星雨炸开啦！⭐🚀',
            '补给成功！星星软糖化作满格核聚变燃料，推进器喷出彩虹尾焰！😋🪐'
        ],
        cheerRightLines: [
            '哔哔正中靶心！精准制导，成功点亮一颗新知识星球！🚀🌟',
            '星际舰长发来贺电：这波操作堪称宇宙级神算！🛸👏'
        ],
        cheerWrongLines: [
            '呼叫总部～航线小幅偏离，修正坐标看一眼提示，马上重新发射！🚀💪'
        ],
        shopLines: [
            '欢迎登临星际补给站！宇航员兔兔店长为您提供跨星球极速配送！🏪🚀'
        ],
        enGreeting: 'Three, two, one, blast off to the stars!'
    },
    {
        id: 'prince_frog',
        name: '皇冠王子蛙',
        enName: 'Prince Frog',
        category: 'blindbox',
        emoji: '👑',
        voiceTag: '呱哼👑',
        auraColor: '#eab308',
        auraSecondary: '#10b981',
        stageProps: ['🪷', '🪄', '💎'],
        img: 'assets/pets/prince_frog.png',
        unlockCost: 0,
        isBlindbox: true,
        rarity: 'SSR 隐藏款',
        foodName: '皇家蓝莓松饼',
        foodIcon: '🫐',
        stageTitles: ['小皇冠青蛙', '红披风骑士蛙', '魔法权杖蛙', '童话守护蛙', '翡翠王国王子蛙'],
        stageDescs: [
            '天鹅绒礼垫 · 顶着迷你金冠的童话小蛙',
            '皇家碧波台 · 翡翠睡莲优雅伴身',
            '黄金纹章星阵 · 睡莲与星星魔杖辉映',
            '皇室宝石圣环 · 红丝绒骑士荣耀金芒',
            '翡翠王国金莲王座 · 皇室璀璨圣光羽翼'
        ],
        talkLines: [
            '呱哼～向你行优雅皇室礼！小皇冠青蛙愿做你的专属伴读小王子！👑🐸',
            '一袭红披风迎风飘扬，骑士蛙用荷叶剑与魔法棒为你披荆斩棘！⚔️🪷',
            '挥动星星魔法权杖——叮！复杂的英语句型瞬间变得井井有条！🪄',
            '皇室宝石圣环加冕！你每一次认真思考，都闪耀着智慧贵族光芒！💎',
            '呱哼礼成！翡翠王国王子蛙坐镇金莲王座，为你奏响凯旋皇家号角！🎺👑'
        ],
        interactLines: [
            '呱哼～扶正我的小金皇冠（换成清凉荷叶帽也很帅气哟），随时听候差遣！👑🌿',
            '轻轻挥动星星魔法棒：Bibbidi-bobbidi-ribbit! 赐你满分记忆魔法！🪄✨',
            '红披风潇洒一甩，王子蛙单膝行礼：“今日也请多指教，尊贵的小店长！”🐸💎'
        ],
        enInteractPhrases: [
            'Magic wand ready! At your royal service!',
            'A noble prince frog loves lotus leaves too!',
            'Crown shining bright for your victory!'
        ],
        feedLines: [
            '唔～皇家蓝莓松饼松软香醇，连本王子蛙都忍不住优雅地舔舔嘴角！🫐👑',
            '呱哼绝妙下午茶！吃完蓝莓松饼，魔法权杖的星光更璀璨啦！😋🪄'
        ],
        cheerRightLines: [
            '呱哼完美无瑕！本王子以翡翠王国之名授予你一等荣耀勋章！👑🏅',
            '魔法命中！礼炮齐鸣，不愧是本王子钦佩的智慧搭档！🪄✨'
        ],
        cheerWrongLines: [
            '呱哼请莫气馁～智者千虑必有一失，优雅看清答案，下一题华丽逆袭！👑💪'
        ],
        shopLines: [
            '皇室品质保证！王子蛙店长恭迎各位贵宾莅临皇家名店！🏪👑'
        ],
        enGreeting: 'Magic wand ready! You are royalty!'
    },
    {
        id: 'star_dragon',
        name: '星空幻龙',
        enName: 'Galaxy Dragon',
        category: 'blindbox',
        emoji: '🌌',
        voiceTag: '星吟🌌',
        auraColor: '#8b5cf6',
        auraSecondary: '#22d3ee',
        stageProps: ['🌌', '🔮', '☄️'],
        img: 'assets/pets/star_dragon.png',
        unlockCost: 0,
        isBlindbox: true,
        rarity: 'UR 传说款',
        foodName: '极光水晶果冻',
        foodIcon: '🔮',
        stageTitles: ['星尘小龙宝', '紫翼小星龙', '璀璨银河龙', '星穹守护龙', '传说星海龙店长'],
        stageDescs: [
            '星云微光垫 · 刚破壳眨眼的星尘小幼龙',
            '极光旋涡台 · 璀璨星云团缓缓公转',
            '十二星宫秘阵 · 水晶球与星河交相辉映',
            '星穹神圣龙环 · 金紫双色龙威流光',
            '无垠星海龙皇宝座 · 传说级幻彩星翼全开'
        ],
        talkLines: [
            '吟——✨！能唤醒 UR 传说级星尘小龙宝，你一定是天选幸运小店长！🌌',
            '紫翼轻拍，洒下一片璀璨星河，每一颗星都藏着一个英语小秘密！💫',
            '十二星宫秘阵运转！璀璨银河龙带你俯瞰整片数学星空！🔮',
            '星穹龙环觉醒！金色龙角凝聚极光之力，助你横扫一切难题！☄️',
            '昂——🌌！传说星海龙店长展翼九天，万千星辰皆为你今日的努力加冕！'
        ],
        interactLines: [
            '吟～轻轻摸摸我金灿灿的小龙角，整片银河都在你指尖温柔流淌呢！🌌💕',
            '呼出一口七彩星尘泡泡～啪！变成漫天小星星落在你头顶啦！✨🔮',
            '扇动流光紫翼飞高高：Dragon soar! 带你冲上连对排行榜巅峰！☄️'
        ],
        enInteractPhrases: [
            'Shine bright like a legendary galaxy dragon!',
            'Starlight wings carry your dreams sky high!',
            'Cosmic crystal power awakened!'
        ],
        feedLines: [
            '啊呜！极光水晶果冻Q弹透亮，吞下肚后龙鳞都泛起梦幻极光色啦！🔮🌌',
            '吟～好纯粹的星辰能量！小幻龙开心地在半空画了个流星爱心！😋☄️'
        ],
        cheerRightLines: [
            '龙吟九霄！流星划破夜空，为你献上最壮丽的银河礼花！🌌🎆',
            '传说级解答！星海幻龙扇动金翼为你欢呼！🔮👏'
        ],
        cheerWrongLines: [
            '星吟温柔抚慰～浩瀚宇宙从不急于一时，点亮这颗错题星，星河更完整！🌌💙'
        ],
        shopLines: [
            '星海奇珍馆今日开张！传说幻龙店长邀您共赏银河百货！🏪🌌'
        ],
        enGreeting: 'Shine bright like a galaxy dragon!'
    },
    {
        id: 'mecha_cat',
        name: '未来机械喵',
        enName: 'Mecha Kitty',
        category: 'blindbox',
        emoji: '🤖',
        voiceTag: '滴嘟🤖',
        auraColor: '#06b6d4',
        auraSecondary: '#ec4899',
        stageProps: ['⚡', '🔋', '💡'],
        img: 'assets/pets/mecha_cat.png',
        unlockCost: 0,
        isBlindbox: true,
        rarity: 'SSR 隐藏款',
        foodName: '超能闪电电池奶',
        foodIcon: '🔋',
        stageTitles: ['迷你机器喵', '爱心雷达喵', '量子速算喵', '超能科技喵', '未来赛博喵店长'],
        stageDescs: [
            '全息充电垫 · 面屏闪烁小爱心的迷你喵',
            '霓虹数码台 · 超能小闪电脉冲环绕',
            '量子矩阵光盘 · 能量电池与灵感灯泡共振',
            '赛博全息圣环 · 纳米流光护盾展开',
            '未来明日科技核心座 · 激光虹彩悬浮机翼'
        ],
        talkLines: [
            '滴嘟喵～系统启动完毕！迷你机器喵面屏亮起粉红大爱心陪你做题啰！🤖💗',
            '哔哔！耳部爱心雷达侦测到高能学霸反应，速算协处理器同步中！📡',
            '量子矩阵全开！统计图表与逻辑规律题，可是本机械喵的主场喵！📊⚡',
            '纳米全息圣环就绪！词库检索率 100%，陪你精准拿下每一个单词！💡',
            '滴嘟喵呜！未来赛博喵店长解锁终极悬浮光翼，智慧算力突破天际！🌈🤖'
        ],
        interactLines: [
            '滴嘟喵～摸摸我的合金小猫耳，LED 面屏瞬间切换成“^_^ 超开心”表情包！🤖💖',
            '呼噜滋滋…仿真呼噜马达启动！虽然是科技小猫，也超爱被摸下巴喵！⚡✨',
            '小爪子弹出全息投影小礼花：Beep meow! 今日脑力值爆表啦！💡🎉'
        ],
        enInteractPhrases: [
            'Beep meow! Brain power one hundred percent!',
            'Heart radar locked on my smart partner!',
            'Cyber kitty purring in turbo mode!'
        ],
        feedLines: [
            '滋滋咕嘟！超能闪电电池奶快充完成，电量瞬间飙到 100% 满格绿灯喵！🔋🤖',
            '滴嘟好喝喵！草莓味闪电能量液让我的小芯片都冒粉红爱心啦！😋⚡'
        ],
        cheerRightLines: [
            '滴嘟零误差！量子芯片运算认证：你的答题速度超越超级计算机喵！🤖👏',
            '全息礼炮发射！面屏狂闪大星星为你点赞喵！⚡🌟'
        ],
        cheerWrongLines: [
            '滴嘟检测到小Bug～别担心喵，扫描一下正确解析，大脑算法立刻升级！🤖💡'
        ],
        shopLines: [
            '滴嘟欢迎光临智慧无人未来店！赛博喵店长为您全自动微笑服务喵！🏪🤖'
        ],
        enGreeting: 'Beep meow! Brain power one hundred percent!'
    }
];

// 6大微缩3D主题店铺
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

// 萌宠换装衣帽间（新增青蛙专属立体荷叶系列：清凉荷叶帽免费拥有，露珠荷叶伞/粉莲荷叶冠支持微徽章兑换或盲盒抽取！）
export const PET_ACCESSORIES = [
    { id: 'none', name: '清爽原貌', icon: '✨', freeDefault: true, cost: 0, desc: '不佩戴头饰，展示萌宠原貌' },
    { id: 'lotus_hat', name: '清凉荷叶帽', icon: '🌿', frogSpecial: true, freeDefault: true, cost: 0, desc: '🐸青蛙特色 · 晶莹露珠翠绿荷叶帽' },
    { id: 'lotus_umbrella', name: '露珠荷叶伞', icon: '☂️', frogSpecial: true, cost: 8, desc: '🐸青蛙特色 · 斜撑一片碧绿荷叶小伞' },
    { id: 'lotus_crown', name: '粉莲荷叶冠', icon: '🪷', frogSpecial: true, cost: 12, desc: '🐸青蛙特色 · 荷叶衬底粉白盛开莲冠' },
    { id: 'crown', name: '闪耀金皇冠', icon: '👑', cost: 18, desc: '盲盒或徽章兑换 · 皇室璀璨金冠' },
    { id: 'sunglasses', name: '酷炫店长墨镜', icon: '🕶️', cost: 15, desc: '盲盒或徽章兑换 · 街头潮酷墨镜' },
    { id: 'ribbon', name: '甜心蝴蝶结', icon: '🎀', cost: 12, desc: '盲盒或徽章兑换 · 软萌粉红蝴蝶结' },
    { id: 'wizard', name: '学霸博士帽', icon: '🎓', cost: 16, desc: '盲盒或徽章兑换 · 满分状元博士帽' },
    { id: 'flower', name: '夏威夷花环', icon: '🌺', cost: 14, desc: '盲盒或徽章兑换 · 阳光度假扶桑花' },
    { id: 'medal', name: '星光荣誉星', icon: '🌟', cost: 15, desc: '盲盒或徽章兑换 · 头顶悬浮闪耀星' }
];

// 萌宠小镇可免费/微徽章布置的景观装饰物 (装扮小镇功能)
export const TOWN_DECORS = [
    { id: 'fountain', name: '音乐喷泉', icon: '⛲', cost: 18 },
    { id: 'ferris', name: '彩虹摩天轮', icon: '🎡', cost: 28 },
    { id: 'carousel', name: '童话旋转木马', icon: '🎠', cost: 22 },
    { id: 'sakura', name: '浪漫樱花树', icon: '🌸', cost: 12 },
    { id: 'camping', name: '野餐小帐篷', icon: '⛺', cost: 12 }
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

export function getAccessoryById(id) {
    return PET_ACCESSORIES.find(a => a.id === id) || PET_ACCESSORIES[0];
}

export function getStageStyleMeta(stageNum = 1) {
    const clamped = Math.min(5, Math.max(1, Number(stageNum) || 1));
    return PET_STAGE_STYLES[clamped - 1];
}
