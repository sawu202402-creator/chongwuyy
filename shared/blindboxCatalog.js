/**
 * shared/blindboxCatalog.js - 每日数英固定打卡配置 & 六大主题系列盲盒珍藏馆（共 74 款可收集珍品 + 3星闪卡升阶）
 *
 * 设计目标：
 * 1. 每日固定打卡驱动：每天完成【10道数学】送 1 张盲盒券，完成【8次校外英语】送 1 张盲盒券，双科全通再加赠 1 张 SSR/UR 保底黄金券！
 * 2. 超大容量防抽空：6 大主题盲盒系列（神宠与伴生灵 10 款 + 潮玩穿戴装扮 16 款 + 远古恐龙馆 12 款 + 浩瀚太空舱 12 款 + 梦幻食玩屋 12 款 + 国宝奇珍阁 12 款 = 74 款）！
 * 3. 智能保新与升星：未集齐前 100% 优先抽出尚未拥有的新藏品（每 5 抽保底 SSR/UR）；集齐后重复抽中可升阶为【2星流光闪卡】与【3星幻彩金卡】！
 */

export const DAILY_MATH_QUEST_TARGET = 10;
export const DAILY_COURSE_QUEST_TARGET = 8;

export const BLINDBOX_RARITY_META = {
    UR:  { label: 'UR 传说', color: '#d97706', bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 45%, #fbcfe8 100%)', border: '#f59e0b', weight: 12 },
    SSR: { label: 'SSR 隐藏', color: '#db2777', bg: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)', border: '#ec4899', weight: 24 },
    SR:  { label: 'SR 珍稀', color: '#7c3aed', bg: 'linear-gradient(135deg, #ede9fe 0%, #e0f2fe 100%)', border: '#8b5cf6', weight: 32 },
    R:   { label: 'R 奇趣',  color: '#0284c7', bg: 'linear-gradient(135deg, #e0f2fe 0%, #ecfdf5 100%)', border: '#38bdf8', weight: 32 }
};

export const BLINDBOX_SERIES = [
    {
        id: 'all',
        name: '全馆惊喜混抽',
        shortName: '🌈 全部混抽',
        icon: '🌈',
        themeColor: '#db2777',
        trophyTitle: '🏆 全馆传奇大收藏家',
        desc: '从全部 6 大系列 74 款珍品中惊喜抽取，优先出新不踩雷！'
    },
    {
        id: 'guardians',
        name: '神宠与伴生灵盒',
        shortName: '🚀 神宠精灵',
        icon: '🚀',
        themeColor: '#7c3aed',
        trophyTitle: '🏆 星灵契约大师',
        desc: '抽取 4 款隐藏神宠与 6 款可跟随萌宠出战的悬浮守护小精灵！'
    },
    {
        id: 'fashion',
        name: '皇家潮玩换装盒',
        shortName: '👑 潮玩换装',
        icon: '👑',
        themeColor: '#ec4899',
        trophyTitle: '🏆 首席时尚造型师',
        desc: '抽取 16 款萌宠立体头饰与潮酷装扮，在主舞台自由穿戴！'
    },
    {
        id: 'dino',
        name: '远古恐龙化石馆',
        shortName: '🦖 恐龙手办',
        icon: '🦖',
        themeColor: '#16a34a',
        trophyTitle: '🏆 白垩纪考古博士',
        desc: '12 款史前巨兽微缩手办，附赠双语名称与趣味古生物冷知识！'
    },
    {
        id: 'space',
        name: '浩瀚太空探索舱',
        shortName: '🪐 太空探索',
        icon: '🪐',
        themeColor: '#2563eb',
        trophyTitle: '🏆 银河星际宇航长',
        desc: '12 款中国航天器与深空宇宙奇观手办，点亮天文科学梦！'
    },
    {
        id: 'sweets',
        name: '梦幻微缩食玩屋',
        shortName: '🍰 梦幻食玩',
        icon: '🍰',
        themeColor: '#ea580c',
        trophyTitle: '🏆 环球甜点品鉴家',
        desc: '12 款治愈系世界名点微缩食玩，好看好听还能顺便记美食单词！'
    },
    {
        id: 'treasures',
        name: '国宝非遗奇珍阁',
        shortName: '🏮 国宝奇珍',
        icon: '🏮',
        themeColor: '#b45309',
        trophyTitle: '🏆 中华国宝守护人',
        desc: '12 款三星堆、敦煌与非遗微缩珍品，传承千年东方美学！'
    }
];

// 系列 1 子池：6 款可跟随主舞台萌宠悬浮伴飞的【守护小精灵】
export const COMPANION_SPRITES = [
    {
        id: 'comp_aurora_meteor',
        seriesId: 'guardians',
        kind: 'companion',
        name: '极光小流星',
        enName: 'Aurora Meteor',
        rarity: 'UR',
        icon: '☄️',
        colors: ['#8b5cf6', '#22d3ee'],
        funFact: '拖着七彩极光尾巴的小流星，围绕在萌宠身旁洒下幸运星尘！'
    },
    {
        id: 'comp_jade_bunny',
        seriesId: 'guardians',
        kind: 'companion',
        name: '月桂玉兔灵',
        enName: 'Moon Jade Sprite',
        rarity: 'SSR',
        icon: '🌙',
        colors: ['#f59e0b', '#fbcfe8'],
        funFact: '来自广寒宫桂花树下的迷你小玉兔灵，散发柔和月光！'
    },
    {
        id: 'comp_lotus_pixie',
        seriesId: 'guardians',
        kind: 'companion',
        name: '翡翠荷花仙',
        enName: 'Lotus Pixie',
        rarity: 'SSR',
        icon: '🪷',
        colors: ['#10b981', '#f472b6'],
        funFact: '诞生于清晨荷叶露珠里的小花仙，最爱和小青蛙一起唱歌！'
    },
    {
        id: 'comp_clockwork_bee',
        seriesId: 'guardians',
        kind: 'companion',
        name: '发条小蜜蜂',
        enName: 'Clockwork Bee',
        rarity: 'SR',
        icon: '🐝',
        colors: ['#eab308', '#38bdf8'],
        funFact: '勤劳嗡嗡转的小机械蜜蜂，帮你把零散知识酿成甜甜蜂蜜！'
    },
    {
        id: 'comp_mini_ptero',
        seriesId: 'guardians',
        kind: 'companion',
        name: '迷你小翼龙',
        enName: 'Mini Pterosaur',
        rarity: 'SR',
        icon: '🦖',
        colors: ['#22c55e', '#f97316'],
        funFact: '穿越时空而来的巴掌大呆萌小翼龙，扑扇小翅膀为你加油！'
    },
    {
        id: 'comp_rainbow_donut',
        seriesId: 'guardians',
        kind: 'companion',
        name: '彩虹甜甜圈灵',
        enName: 'Rainbow Donut',
        rarity: 'SR',
        icon: '🍩',
        colors: ['#ec4899', '#fde047'],
        funFact: '撒满彩色糖针的魔法飞行甜甜圈，看到它心情都会变超甜！'
    }
];

// 系列 3 ~ 6：48 款四大主题博物馆微缩手办藏品（每馆 12 款）
export const MUSEUM_COLLECTIBLES = [
    // ================= 🦖 远古恐龙化石馆 (12 款) =================
    { id: 'dino_trex',      seriesId: 'dino', kind: 'figurine', name: '霸王龙小霸王', enName: 'Tyrannosaurus Rex', rarity: 'UR',  icon: '🦖', colors: ['#ef4444', '#f59e0b'], funFact: '白垩纪陆地霸主，咬合力高达数吨，小短手其实非常有劲哦！' },
    { id: 'dino_mosasaur',  seriesId: 'dino', kind: 'figurine', name: '沧龙深海王',   enName: 'Mosasaurus',        rarity: 'UR',  icon: '🐋', colors: ['#0284c7', '#22d3ee'], funFact: '远古海洋里的顶级掠食巨兽，摆动强健尾鳍能在深海极速冲刺！' },
    { id: 'dino_tricera',   seriesId: 'dino', kind: 'figurine', name: '三角龙勇士',   enName: 'Triceratops',       rarity: 'SSR', icon: '🦕', colors: ['#16a34a', '#eab308'], funFact: '头顶三根威风凛凛的大角与坚固颈盾，是温和又勇敢的植食卫士！' },
    { id: 'dino_brachio',   seriesId: 'dino', kind: 'figurine', name: '长颈腕龙',     enName: 'Brachiosaurus',     rarity: 'SSR', icon: '🦒', colors: ['#10b981', '#38bdf8'], funFact: '脖子足足有四层楼那么高，前腿比后腿长，轻松吃到树顶嫩叶！' },
    { id: 'dino_mammoth',   seriesId: 'dino', kind: 'figurine', name: '冰原猛犸象',   enName: 'Woolly Mammoth',    rarity: 'SSR', icon: '🦣', colors: ['#8b5cf6', '#60a5fa'], funFact: '身披厚厚长毛抵御冰河期严寒，弯曲的巨型象牙能拨开积雪找草吃！' },
    { id: 'dino_stego',     seriesId: 'dino', kind: 'figurine', name: '背板剑龙',     enName: 'Stegosaurus',       rarity: 'SR',  icon: '🐉', colors: ['#f97316', '#84cc16'], funFact: '背上长着两排像风筝一样的骨板，既能防身还能调节身体温度！' },
    { id: 'dino_pteranodon',seriesId: 'dino', kind: 'figurine', name: '无齿翼龙',     enName: 'Pteranodon',        rarity: 'SR',  icon: '🦅', colors: ['#06b6d4', '#a855f7'], funFact: '翼展超过 7 米的天空滑翔家，乘着海风在浪花上空优雅捕鱼！' },
    { id: 'dino_raptor',    seriesId: 'dino', kind: 'figurine', name: '迅猛龙闪电侠', enName: 'Velociraptor',      rarity: 'SR',  icon: '🦎', colors: ['#eab308', '#ef4444'], funFact: '奔跑如风的聪明小猎手，科学家发现它们身上其实长着漂亮羽毛！' },
    { id: 'dino_ankylo',    seriesId: 'dino', kind: 'figurine', name: '甲龙铁锤手',   enName: 'Ankylosaurus',      rarity: 'R',   icon: '🛡️', colors: ['#64748b', '#10b981'], funFact: '浑身披满坚硬骨甲像一辆小坦克，尾巴末端还自带大骨锤！' },
    { id: 'dino_parasaur',  seriesId: 'dino', kind: 'figurine', name: '副栉龙歌唱家', enName: 'Parasaurolophus',   rarity: 'R',   icon: '🎺', colors: ['#14b8a6', '#f472b6'], funFact: '头顶长长的空心冠饰像一把大长号，能吹出洪亮低沉的呼唤声！' },
    { id: 'dino_ammonite',  seriesId: 'dino', kind: 'figurine', name: '菊石时光螺',   enName: 'Ammonite Fossil',   rarity: 'R',   icon: '🐚', colors: ['#d97706', '#fde047'], funFact: '外壳呈完美黄金螺旋纹的远古海洋生物，记录着亿万年的时光！' },
    { id: 'dino_amber',     seriesId: 'dino', kind: 'figurine', name: '琥珀古蜻蜓',   enName: 'Amber Dragonfly',   rarity: 'R',   icon: '💎', colors: ['#f59e0b', '#fef08a'], funFact: '松树滴落的树脂历经千万年化作晶莹琥珀，完好封存了史前小昆虫！' },

    // ================= 🪐 浩瀚太空探索舱 (12 款) =================
    { id: 'space_tiangong', seriesId: 'space', kind: 'figurine', name: '天宫空间站',   enName: 'Tiangong Station',  rarity: 'UR',  icon: '🛰️', colors: ['#2563eb', '#fbbf24'], funFact: '中国自主建造的“太空家园”，每 90 分钟就能绕地球飞一圈！' },
    { id: 'space_blackhole',seriesId: 'space', kind: 'figurine', name: '奇点黑洞魔方', enName: 'Black Hole Singularity', rarity: 'UR', icon: '🕳️', colors: ['#4f46e5', '#f97316'], funFact: '引力强大到连光都逃不出去的神秘天体，周围环绕着炽热吸积盘！' },
    { id: 'space_zhurong',  seriesId: 'space', kind: 'figurine', name: '祝融号火星车', enName: 'Zhurong Rover',     rarity: 'SSR', icon: '🚜', colors: ['#ea580c', '#38bdf8'], funFact: '展开蓝色蝴蝶形太阳能翅膀，在红色火星乌托邦平原留下中国印记！' },
    { id: 'space_saturn',   seriesId: 'space', kind: 'figurine', name: '璀璨土星光环', enName: 'Saturn Rings',      rarity: 'SSR', icon: '🪐', colors: ['#eab308', '#c084fc'], funFact: '太阳系最美光环其实是由无数冰块和岩石颗粒组成的冰雪跑道！' },
    { id: 'space_yutu',     seriesId: 'space', kind: 'figurine', name: '玉兔号月球车', enName: 'Yutu Lunar Rover',  rarity: 'SSR', icon: '🌕', colors: ['#60a5fa', '#fde047'], funFact: '踏上月球背面的勇敢机械小兔子，帮人类揭开月背古老环形山之谜！' },
    { id: 'space_hubble',   seriesId: 'space', kind: 'figurine', name: '星空太空望远镜', enName: 'Space Telescope', rarity: 'SR',  icon: '🔭', colors: ['#6366f1', '#22d3ee'], funFact: '漂浮在大气层外的超级千里眼，拍下无数绚丽多彩的星系诞生照片！' },
    { id: 'space_voyager',  seriesId: 'space', kind: 'figurine', name: '旅行者金唱片', enName: 'Golden Record',     rarity: 'SR',  icon: '💿', colors: ['#f59e0b', '#fef3c7'], funFact: '携带着地球上 55 种语言问候与音乐飞向星际空间的金色礼物！' },
    { id: 'space_nebula',   seriesId: 'space', kind: 'figurine', name: '创生星云许愿瓶', enName: 'Nebula Bottle',   rarity: 'SR',  icon: '🧪', colors: ['#ec4899', '#8b5cf6'], funFact: '宇宙星云是新恒星诞生的摇篮，五彩气体云跨越好几光年！' },
    { id: 'space_comet',    seriesId: 'space', kind: 'figurine', name: '哈雷彗星尾羽', enName: 'Halley Comet',      rarity: 'R',   icon: '☄️', colors: ['#0ea5e9', '#a5f3fc'], funFact: '由冰和尘埃组成的“脏雪球”，靠近太阳时会拖出几千万公里长的亮尾！' },
    { id: 'space_jetpack',  seriesId: 'space', kind: 'figurine', name: '出舱宇航喷气包', enName: 'Space Jetpack',   rarity: 'R',   icon: '🎒', colors: ['#3b82f6', '#e2e8f0'], funFact: '太空行走时的微型飞船，喷出氮气小气流就能在失重太空自由转向！' },
    { id: 'space_sail',     seriesId: 'space', kind: 'figurine', name: '星际太阳帆船', enName: 'Solar Sail Craft',  rarity: 'R',   icon: '⛵', colors: ['#facc15', '#38bdf8'], funFact: '不用一滴燃料，仅靠太阳光子的轻柔推力就能向遥远星球扬帆远航！' },
    { id: 'space_jupiter',  seriesId: 'space', kind: 'figurine', name: '木星风暴红斑球', enName: 'Jupiter Orb',     rarity: 'R',   icon: '🟠', colors: ['#f97316', '#fed7aa'], funFact: '太阳系体积最大的行星，上面的“大红斑”气旋比整个地球还要大！' },

    // ================= 🍰 梦幻微缩食玩屋 (12 款) =================
    { id: 'sweet_crepe',    seriesId: 'sweets', kind: 'figurine', name: '独角兽彩虹千层', enName: 'Rainbow Mille Crepe', rarity: 'UR', icon: '🍰', colors: ['#ec4899', '#fde047'], funFact: '二十层薄如蝉翼的可丽饼夹着鲜奶油，切开就像一道甜蜜小彩虹！' },
    { id: 'sweet_fuji',     seriesId: 'sweets', kind: 'figurine', name: '雪顶抹茶圣代',   enName: 'Matcha Sundae',       rarity: 'SSR', icon: '🍨', colors: ['#10b981', '#fef9c3'], funFact: '清香宇治抹茶冰淇淋淋上雪白奶盖，造型像一座迷你雪顶小青山！' },
    { id: 'sweet_souffle',  seriesId: 'sweets', kind: 'figurine', name: '云朵草莓舒芙蕾', enName: 'Strawberry Soufflé',  rarity: 'SSR', icon: '🍓', colors: ['#fb7185', '#fef2f2'], funFact: '打发蛋白烤出的空气感松饼，蓬松得像刚从天空摘下来的软云朵！' },
    { id: 'sweet_lotus',    seriesId: 'sweets', kind: 'figurine', name: '国风粉嫩荷花酥', enName: 'Lotus Pastry',        rarity: 'SSR', icon: '🪷', colors: ['#f472b6', '#34d399'], funFact: '层层起酥的江南传统名点，轻轻绽放如出水芙蓉，颜值满分！' },
    { id: 'sweet_macaron',  seriesId: 'sweets', kind: 'figurine', name: '星空银河马卡龙', enName: 'Galaxy Macaron',      rarity: 'SR',  icon: '🟣', colors: ['#8b5cf6', '#f472b6'], funFact: '外脆内软的法式杏仁小圆饼，刷上食用珠光粉宛如璀璨小星球！' },
    { id: 'sweet_pudding',  seriesId: 'sweets', kind: 'figurine', name: '小熊焦糖布丁船', enName: 'Caramel Pudding',     rarity: 'SR',  icon: '🍮', colors: ['#f59e0b', '#fde68a'], funFact: 'Q弹嫩滑的鸡蛋布丁配上微苦琥珀焦糖，轻轻一晃还会跳舞呢！' },
    { id: 'sweet_dinoegg',  seriesId: 'sweets', kind: 'figurine', name: '恐龙蛋冰淇淋',   enName: 'Dino Egg Gelato',     rarity: 'SR',  icon: '🥚', colors: ['#38bdf8', '#a7f3d0'], funFact: '敲开白巧克力薄脆蛋壳，里面藏着酸甜百香果与香草双球冰淇淋！' },
    { id: 'sweet_boba',     seriesId: 'sweets', kind: 'figurine', name: '蜜桃波波果茶杯', enName: 'Peach Boba Tea',      rarity: 'R',   icon: '🧋', colors: ['#fb7185', '#fed7aa'], funFact: '粉嫩水蜜桃果肉搭配晶莹脆波波，微缩吸管杯连冰块都晶莹剔透！' },
    { id: 'sweet_waffle',   seriesId: 'sweets', kind: 'figurine', name: '蜂蜜格子华夫饼', enName: 'Honey Waffle',        rarity: 'R',   icon: '🧇', colors: ['#d97706', '#fef08a'], funFact: '焦香酥脆的方格华夫饼盛满蓝莓与枫糖浆，香气仿佛能飘出屏幕！' },
    { id: 'sweet_osmanthus',seriesId: 'sweets', kind: 'figurine', name: '桂花晶莹糯米糕', enName: 'Osmanthus Cake',      rarity: 'R',   icon: '🌼', colors: ['#eab308', '#fef9c3'], funFact: '撒满金秋桂花的软糯小方糕，清甜不腻，充满秋日游园会的味道！' },
    { id: 'sweet_cotton',   seriesId: 'sweets', kind: 'figurine', name: '棉花糖热气球杯', enName: 'Cotton Candy Cup',    rarity: 'R',   icon: '☁️', colors: ['#60a5fa', '#fbcfe8'], funFact: '把粉蓝双色棉花糖绕成圆滚滚的热气球，承载满满童心飞上蓝天！' },
    { id: 'sweet_croissant',seriesId: 'sweets', kind: 'figurine', name: '黄金牛角可颂包', enName: 'Golden Croissant',    rarity: 'R',   icon: '🥐', colors: ['#ea580c', '#fde68a'], funFact: '弯弯像新月一样的起酥面包，咬下去有 27 层香脆黄油薄片！' },

    // ================= 🏮 国宝非遗奇珍阁 (12 款) =================
    { id: 'tr_sanxingdui',  seriesId: 'treasures', kind: 'figurine', name: '三星堆青铜神树', enName: 'Bronze Sacred Tree', rarity: 'UR',  icon: '🌳', colors: ['#059669', '#eab308'], funFact: '三千多年前古蜀工匠铸造的参天青铜树，枝头站立着九只太阳神鸟！' },
    { id: 'tr_qianli',      seriesId: 'treasures', kind: 'figurine', name: '千里江山微缩卷', enName: 'Green Landscape Scroll', rarity: 'UR', icon: '🏞️', colors: ['#0d9488', '#2563eb'], funFact: '18岁天才少年王希孟用孔雀石与蓝铜矿绘就的千年璀璨青绿山水！' },
    { id: 'tr_flyinghorse', seriesId: 'treasures', kind: 'figurine', name: '马踏飞燕铜奔马', enName: 'Bronze Galloping Horse', rarity: 'SSR', icon: '🐎', colors: ['#10b981', '#f59e0b'], funFact: '骏马昂首疾驰，三足腾空、一足轻踏飞鸟，尽显汉代力学平衡智慧！' },
    { id: 'tr_ninedeer',    seriesId: 'treasures', kind: 'figurine', name: '敦煌九色鹿瑞像', enName: 'Nine-Colored Deer',  rarity: 'SSR', icon: '🦌', colors: ['#f59e0b', '#ec4899'], funFact: '源自莫高窟第257窟壁画的善良神鹿，身披九彩星纹传递诚实与勇敢！' },
    { id: 'tr_liondance',   seriesId: 'treasures', kind: 'figurine', name: '岭南非遗小醒狮', enName: 'Awakening Lion',     rarity: 'SSR', icon: '🦁', colors: ['#ef4444', '#facc15'], funFact: '眨着灵动大眼睛的绒球小醒狮，锣鼓一响腾跃采青，寓意吉祥如意！' },
    { id: 'tr_cloisonne',   seriesId: 'treasures', kind: 'figurine', name: '景泰蓝掐丝宝瓶', enName: 'Cloisonné Vase',     rarity: 'SR',  icon: '🏺', colors: ['#1d4ed8', '#fbbf24'], funFact: '用细扁铜丝手工捏出精美花纹再填上宝石蓝釉烧制，华美夺目！' },
    { id: 'tr_roofbeast',   seriesId: 'treasures', kind: 'figurine', name: '故宫太和殿脊兽', enName: 'Palace Roof Beast',  rarity: 'SR',  icon: '🏯', colors: ['#dc2626', '#f59e0b'], funFact: '排排坐在古建筑屋檐角的小瑞兽，既能装饰祈福还能保护木栓防漏雨！' },
    { id: 'tr_glasscup',    seriesId: 'treasures', kind: 'figurine', name: '丝路夜光琉璃杯', enName: 'Luminous Glass Cup', rarity: 'SR',  icon: '🍷', colors: ['#06b6d4', '#a855f7'], funFact: '丝绸之路文化交融的晶莹琉璃盏，月光映照下流光溢彩宛若星河！' },
    { id: 'tr_pandalantern',seriesId: 'treasures', kind: 'figurine', name: '非遗竹编熊猫灯', enName: 'Bamboo Panda Lantern', rarity: 'R', icon: '🏮', colors: ['#16a34a', '#fde047'], funFact: '用柔韧青竹篾巧妙编织成的圆滚滚熊猫小花灯，点亮温暖团圆夜！' },
    { id: 'tr_oilumbrella', seriesId: 'treasures', kind: 'figurine', name: '江南烟雨油纸伞', enName: 'Oil-Paper Umbrella', rarity: 'R',   icon: '☂️', colors: ['#ec4899', '#38bdf8'], funFact: '历经八十多道工序手工绘花刷桐油，撑开便是一幅水墨江南画！' },
    { id: 'tr_silkfan',     seriesId: 'treasures', kind: 'figurine', name: '苏绣荷塘小团扇', enName: 'Silk Lotus Fan',     rarity: 'R',   icon: '🪭', colors: ['#10b981', '#fbcfe8'], funFact: '一根丝线劈成数十丝双面精绣，扇面正反两面都能看见灵动小青蛙！' },
    { id: 'tr_porcelain',   seriesId: 'treasures', kind: 'figurine', name: '景德镇锦鲤青花碗', enName: 'Blue-and-White Bowl', rarity: 'R', icon: '🥣', colors: ['#2563eb', '#e0f2fe'], funFact: '白釉如玉、青花似水，碗底游动着两条栩栩如生的小红锦鲤！' }
];

export const ALL_SPECIAL_COLLECTIBLES = [...COMPANION_SPRITES, ...MUSEUM_COLLECTIBLES];

export function getCompanionById(id) {
    return COMPANION_SPRITES.find(c => c.id === id) || null;
}

export function getCollectibleById(id) {
    return ALL_SPECIAL_COLLECTIBLES.find(c => c.id === id) || null;
}

export function renderStarRankHtml(stars = 1) {
    const lv = Math.min(3, Math.max(1, Number(stars) || 1));
    if (lv === 3) return '<span class="bbx-star-pill lv3">💎💎💎 幻彩满星</span>';
    if (lv === 2) return '<span class="bbx-star-pill lv2">🌟🌟 流光闪卡</span>';
    return '<span class="bbx-star-pill lv1">⭐ 初回典藏</span>';
}

/**
 * 为盲盒手办 / 守护精灵生成精致的 3D 亚克力胶囊立牌 SVG 徽章（不依赖外部大图，秒开零延迟）
 */
export function renderCollectibleStandeeHtml(item, starLevel = 1, size = 76) {
    if (!item) return '';
    const [c1, c2] = item.colors || ['#8b5cf6', '#ec4899'];
    const uid = `${item.id}_${size}`;
    const isShiny = starLevel >= 2;
    const isMax = starLevel >= 3;
    const ringStroke = isMax ? '#f59e0b' : (isShiny ? '#ec4899' : '#ffffff');
    return `
        <div class="bbx-standee-wrap ${isMax ? 'is-max-holo' : (isShiny ? 'is-shiny' : '')}" style="width:${size}px;height:${size}px;">
            <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="bg_${uid}" cx="35%" cy="28%" r="70%">
                        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
                        <stop offset="48%" stop-color="${c1}" stop-opacity="0.32"/>
                        <stop offset="100%" stop-color="${c2}" stop-opacity="0.58"/>
                    </radialGradient>
                    <linearGradient id="ped_${uid}" x1="18" y1="80" x2="82" y2="94" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="${c1}"/>
                        <stop offset="100%" stop-color="${c2}"/>
                    </linearGradient>
                </defs>
                <ellipse cx="50" cy="87" rx="33" ry="8.5" fill="url(#ped_${uid})" opacity="0.88"/>
                <ellipse cx="50" cy="85" rx="26" ry="5" fill="#ffffff" opacity="0.5"/>
                <circle cx="50" cy="48" r="37" fill="url(#bg_${uid})" stroke="${ringStroke}" stroke-width="3.2"/>
                <path d="M26 28 C34 16, 54 14, 66 21" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.78"/>
                ${isShiny ? `<circle cx="78" cy="22" r="4" fill="#fde047"/><circle cx="20" cy="64" r="3" fill="#fde047"/>` : ''}
            </svg>
            <span class="bbx-standee-emoji" style="font-size:${Math.round(size * 0.44)}px;">${item.icon}</span>
        </div>
    `;
}
