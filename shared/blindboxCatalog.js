/**
 * shared/blindboxCatalog.js - 每日语数英三科打卡配置 & 九大主题系列盲盒珍藏馆（共 128 款可收集珍品 + 3星闪卡升阶）
 *
 * 设计目标：
 * 1. 语数英三科均衡打卡驱动：每天必须同时完成【10道数学】+【8道语文】+【8道英语】三科打卡（每完成单科奖 +2🏅 鼓励章），
 *    三科全部完成后方可领取每日 1 张珍贵的【🎟️ 黄金盲盒券（附 SSR/UR 保底）】！关闭日常连对随机掉券，让每一张盲盒券都更有成就感！
 * 2. 超大容量 9 大主题馆共 128 款珍品：
 *    - 🚀 神宠与伴生灵盒 (14 款：4 款隐藏神宠 + 10 款悬浮伴飞小精灵)
 *    - 👑 皇家潮玩换装盒 (20 款可穿戴 3D 矢量头饰)
 *    - 🦖 远古恐龙化石馆 (14 款史前巨兽手办)
 *    - 🪐 浩瀚太空探索舱 (14 款航天与宇宙奇观手办)
 *    - 🌊 深海奇幻水族馆 (14 款深潜器与海洋精灵手办)
 *    - 🦋 奇趣自然博物院 (14 款神奇昆虫与植物活化石手办)
 *    - 🍰 梦幻微缩食玩屋 (12 款世界与国风治愈甜点食玩)
 *    - 🏮 国宝非遗奇珍阁 (14 款中华文物与非遗匠心微缩珍品)
 *    - 🚄 超级工程科技馆 (12 款大国重器与前沿未来科技手办)
 * 3. 智能保新与升星：未集齐前 100% 优先抽出尚未拥有的新藏品（每 5 抽保底 SSR/UR）；集齐后重复抽中可升阶为【2星流光闪卡】与【3星幻彩金卡】！
 */

export const DAILY_MATH_QUEST_TARGET = 10;
export const DAILY_CHINESE_QUEST_TARGET = 8;
export const DAILY_ENGLISH_QUEST_TARGET = 8;
export const DAILY_COURSE_QUEST_TARGET = DAILY_ENGLISH_QUEST_TARGET;

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
        desc: '从全部 9 大系列 128 款珍品中惊喜抽取，100% 优先出新不踩雷！'
    },
    {
        id: 'guardians',
        name: '神宠与伴生灵盒',
        shortName: '🚀 神宠精灵',
        icon: '🚀',
        themeColor: '#7c3aed',
        trophyTitle: '🏆 星灵契约大师',
        desc: '抽取 4 款隐藏神宠与 10 款可跟随萌宠出战的悬浮守护小精灵！'
    },
    {
        id: 'fashion',
        name: '皇家潮玩换装盒',
        shortName: '👑 潮玩换装',
        icon: '👑',
        themeColor: '#ec4899',
        trophyTitle: '🏆 首席时尚造型师',
        desc: '抽取 20 款萌宠立体头饰与非遗潮酷装扮，在主舞台自由穿戴！'
    },
    {
        id: 'dino',
        name: '远古恐龙化石馆',
        shortName: '🦖 恐龙手办',
        icon: '🦖',
        themeColor: '#16a34a',
        trophyTitle: '🏆 白垩纪考古博士',
        desc: '14 款史前巨兽微缩手办，附赠双语名称与趣味古生物冷知识！'
    },
    {
        id: 'space',
        name: '浩瀚太空探索舱',
        shortName: '🪐 太空探索',
        icon: '🪐',
        themeColor: '#2563eb',
        trophyTitle: '🏆 银河星际宇航长',
        desc: '14 款中国航天重器与深空宇宙奇观手办，点亮天文科学梦！'
    },
    {
        id: 'ocean',
        name: '深海奇幻水族馆',
        shortName: '🌊 深海奇境',
        icon: '🌊',
        themeColor: '#0284c7',
        trophyTitle: '🏆 万米深海探险家',
        desc: '14 款万米深潜器与发光海洋生物手办，潜入蔚蓝海底世界！'
    },
    {
        id: 'nature',
        name: '奇趣自然博物院',
        shortName: '🦋 自然博物',
        icon: '🦋',
        themeColor: '#059669',
        trophyTitle: '🏆 森林自然博物学家',
        desc: '14 款闪蝶、萤火虫与神奇植物活化石手办，发现大自然奥秘！'
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
        desc: '14 款三星堆、编钟、敦煌与非遗微缩珍品，传承千年东方美学！'
    },
    {
        id: 'tech',
        name: '超级工程科技馆',
        shortName: '🚄 未来科技',
        icon: '🚄',
        themeColor: '#4f46e5',
        trophyTitle: '🏆 未来总工程师',
        desc: '12 款复兴号高铁、国产大飞机与量子科技手办，致敬大国智慧！'
    }
];

// 系列 1 子池：10 款可跟随主舞台萌宠悬浮伴飞的【守护小精灵】
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
        id: 'comp_phoenix_plume',
        seriesId: 'guardians',
        kind: 'companion',
        name: '朱雀火绒球',
        enName: 'Phoenix Plume',
        rarity: 'UR',
        icon: '🔥',
        colors: ['#ef4444', '#fbbf24'],
        funFact: '来自东方瑞鸟尾尖的温暖小火绒灵，在萌宠身旁闪烁金红星芒！'
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
        id: 'comp_cloud_whale',
        seriesId: 'guardians',
        kind: 'companion',
        name: '云海小蓝鲸',
        enName: 'Sky Cloud Whale',
        rarity: 'SSR',
        icon: '🐳',
        colors: ['#0ea5e9', '#a5f3fc'],
        funFact: '乘着棉花糖软云在半空悠游的迷你小蓝鲸，会喷出七彩水雾！'
    },
    {
        id: 'comp_magic_brush',
        seriesId: 'guardians',
        kind: 'companion',
        name: '神笔小书童',
        enName: 'Magic Ink Sprite',
        rarity: 'SSR',
        icon: '🖌️',
        colors: ['#6366f1', '#34d399'],
        funFact: '马良神笔化作的博学小书童精灵，背古诗做语文题时为你加油！'
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
    },
    {
        id: 'comp_snow_fox',
        seriesId: 'guardians',
        kind: 'companion',
        name: '极地雪绒球',
        enName: 'Snowpuff Sprite',
        rarity: 'SR',
        icon: '❄️',
        colors: ['#38bdf8', '#e0e7ff'],
        funFact: '六角冰晶凝成的软乎乎小雪团精灵，转圈圈洒下清凉晶莹雪花！'
    }
];

// 系列 3 ~ 9：共 94 款七大主题博物馆微缩手办藏品
export const MUSEUM_COLLECTIBLES = [
    // ================= 🦖 远古恐龙化石馆 (14 款) =================
    { id: 'dino_trex',      seriesId: 'dino', kind: 'figurine', name: '霸王龙小霸王', enName: 'Tyrannosaurus Rex', rarity: 'UR',  icon: '🦖', colors: ['#ef4444', '#f59e0b'], funFact: '白垩纪陆地霸主，咬合力高达数吨，小短手其实非常有劲哦！' },
    { id: 'dino_mosasaur',  seriesId: 'dino', kind: 'figurine', name: '沧龙深海王',   enName: 'Mosasaurus',        rarity: 'UR',  icon: '🐋', colors: ['#0284c7', '#22d3ee'], funFact: '远古海洋里的顶级掠食巨兽，摆动强健尾鳍能在深海极速冲刺！' },
    { id: 'dino_spino',     seriesId: 'dino', kind: 'figurine', name: '棘背龙渔夫',   enName: 'Spinosaurus',       rarity: 'UR',  icon: '🐊', colors: ['#0d9488', '#f97316'], funFact: '背上竖着巨大帆状骨棘的两栖恐龙霸主，最爱在远古大河里捕大鱼！' },
    { id: 'dino_tricera',   seriesId: 'dino', kind: 'figurine', name: '三角龙勇士',   enName: 'Triceratops',       rarity: 'SSR', icon: '🦕', colors: ['#16a34a', '#eab308'], funFact: '头顶三根威风凛凛的大角与坚固颈盾，是温和又勇敢的植食卫士！' },
    { id: 'dino_brachio',   seriesId: 'dino', kind: 'figurine', name: '长颈腕龙',     enName: 'Brachiosaurus',     rarity: 'SSR', icon: '🦒', colors: ['#10b981', '#38bdf8'], funFact: '脖子足足有四层楼那么高，前腿比后腿长，轻松吃到树顶嫩叶！' },
    { id: 'dino_mammoth',   seriesId: 'dino', kind: 'figurine', name: '冰原猛犸象',   enName: 'Woolly Mammoth',    rarity: 'SSR', icon: '🦣', colors: ['#8b5cf6', '#60a5fa'], funFact: '身披厚厚长毛抵御冰河期严寒，弯曲的巨型象牙能拨开积雪找草吃！' },
    { id: 'dino_stego',     seriesId: 'dino', kind: 'figurine', name: '背板剑龙',     enName: 'Stegosaurus',       rarity: 'SR',  icon: '🐉', colors: ['#f97316', '#84cc16'], funFact: '背上长着两排像风筝一样的骨板，既能防身还能调节身体温度！' },
    { id: 'dino_pteranodon',seriesId: 'dino', kind: 'figurine', name: '无齿翼龙',     enName: 'Pteranodon',        rarity: 'SR',  icon: '🦅', colors: ['#06b6d4', '#a855f7'], funFact: '翼展超过 7 米的天空滑翔家，乘着海风在浪花上空优雅捕鱼！' },
    { id: 'dino_raptor',    seriesId: 'dino', kind: 'figurine', name: '迅猛龙闪电侠', enName: 'Velociraptor',      rarity: 'SR',  icon: '🦎', colors: ['#eab308', '#ef4444'], funFact: '奔跑如风的聪明小猎手，科学家发现它们身上其实长着漂亮羽毛！' },
    { id: 'dino_archaeo',   seriesId: 'dino', kind: 'figurine', name: '始祖鸟彩羽',   enName: 'Archaeopteryx',     rarity: 'SR',  icon: '🪶', colors: ['#ec4899', '#6366f1'], funFact: '披着五彩飞羽、翅膀带小爪子的远古飞鸟祖先，连接起恐龙与现代鸟类！' },
    { id: 'dino_ankylo',    seriesId: 'dino', kind: 'figurine', name: '甲龙铁锤手',   enName: 'Ankylosaurus',      rarity: 'R',   icon: '🛡️', colors: ['#64748b', '#10b981'], funFact: '浑身披满坚硬骨甲像一辆小坦克，尾巴末端还自带大骨锤！' },
    { id: 'dino_parasaur',  seriesId: 'dino', kind: 'figurine', name: '副栉龙歌唱家', enName: 'Parasaurolophus',   rarity: 'R',   icon: '🎺', colors: ['#14b8a6', '#f472b6'], funFact: '头顶长长的空心冠饰像一把大长号，能吹出洪亮低沉的呼唤声！' },
    { id: 'dino_ammonite',  seriesId: 'dino', kind: 'figurine', name: '菊石时光螺',   enName: 'Ammonite Fossil',   rarity: 'R',   icon: '🐚', colors: ['#d97706', '#fde047'], funFact: '外壳呈完美黄金螺旋纹的远古海洋生物，记录着亿万年的时光！' },
    { id: 'dino_amber',     seriesId: 'dino', kind: 'figurine', name: '琥珀古蜻蜓',   enName: 'Amber Dragonfly',   rarity: 'R',   icon: '💎', colors: ['#f59e0b', '#fef08a'], funFact: '松树滴落的树脂历经千万年化作晶莹琥珀，完好封存了史前小昆虫！' },

    // ================= 🪐 浩瀚太空探索舱 (14 款) =================
    { id: 'space_tiangong', seriesId: 'space', kind: 'figurine', name: '天宫空间站',   enName: 'Tiangong Station',  rarity: 'UR',  icon: '🛰️', colors: ['#2563eb', '#fbbf24'], funFact: '中国自主建造的“太空家园”，每 90 分钟就能绕地球飞一圈！' },
    { id: 'space_change6',  seriesId: 'space', kind: 'figurine', name: '嫦娥六号采样器', enName: 'Chang-e 6 Probe', rarity: 'UR',  icon: '🚀', colors: ['#dc2626', '#facc15'], funFact: '人类历史上首次从神秘月球背面捧回珍贵月壤的航天英雄探测器！' },
    { id: 'space_blackhole',seriesId: 'space', kind: 'figurine', name: '奇点黑洞魔方', enName: 'Black Hole Singularity', rarity: 'UR', icon: '🕳️', colors: ['#4f46e5', '#f97316'], funFact: '引力强大到连光都逃不出去的神秘天体，周围环绕着炽热吸积盘！' },
    { id: 'space_zhurong',  seriesId: 'space', kind: 'figurine', name: '祝融号火星车', enName: 'Zhurong Rover',     rarity: 'SSR', icon: '🚜', colors: ['#ea580c', '#38bdf8'], funFact: '展开蓝色蝴蝶形太阳能翅膀，在红色火星乌托邦平原留下中国印记！' },
    { id: 'space_fast',     seriesId: 'space', kind: 'figurine', name: '中国天眼FAST', enName: 'FAST Radio Dish',   rarity: 'SSR', icon: '📡', colors: ['#0891b2', '#a7f3d0'], funFact: '坐落在贵州群山中、足足有 30 个足球场大的世界最大射电望远镜！' },
    { id: 'space_saturn',   seriesId: 'space', kind: 'figurine', name: '璀璨土星光环', enName: 'Saturn Rings',      rarity: 'SSR', icon: '🪐', colors: ['#eab308', '#c084fc'], funFact: '太阳系最美光环其实是由无数冰块和岩石颗粒组成的冰雪跑道！' },
    { id: 'space_yutu',     seriesId: 'space', kind: 'figurine', name: '玉兔号月球车', enName: 'Yutu Lunar Rover',  rarity: 'SSR', icon: '🌕', colors: ['#60a5fa', '#fde047'], funFact: '踏上月球背面的勇敢机械小兔子，帮人类揭开月背古老环形山之谜！' },
    { id: 'space_hubble',   seriesId: 'space', kind: 'figurine', name: '星空太空望远镜', enName: 'Space Telescope', rarity: 'SR',  icon: '🔭', colors: ['#6366f1', '#22d3ee'], funFact: '漂浮在大气层外的超级千里眼，拍下无数绚丽多彩的星系诞生照片！' },
    { id: 'space_voyager',  seriesId: 'space', kind: 'figurine', name: '旅行者金唱片', enName: 'Golden Record',     rarity: 'SR',  icon: '💿', colors: ['#f59e0b', '#fef3c7'], funFact: '携带着地球上 55 种语言问候与音乐飞向星际空间的金色礼物！' },
    { id: 'space_nebula',   seriesId: 'space', kind: 'figurine', name: '创生星云许愿瓶', enName: 'Nebula Bottle',   rarity: 'SR',  icon: '🧪', colors: ['#ec4899', '#8b5cf6'], funFact: '宇宙星云是新恒星诞生的摇篮，五彩气体云跨越好几光年！' },
    { id: 'space_comet',    seriesId: 'space', kind: 'figurine', name: '哈雷彗星尾羽', enName: 'Halley Comet',      rarity: 'R',   icon: '☄️', colors: ['#0ea5e9', '#a5f3fc'], funFact: '由冰和尘埃组成的“脏雪球”，靠近太阳时会拖出几千万公里长的亮尾！' },
    { id: 'space_jetpack',  seriesId: 'space', kind: 'figurine', name: '出舱宇航喷气包', enName: 'Space Jetpack',   rarity: 'R',   icon: '🎒', colors: ['#3b82f6', '#e2e8f0'], funFact: '太空行走时的微型飞船，喷出氮气小气流就能在失重太空自由转向！' },
    { id: 'space_sail',     seriesId: 'space', kind: 'figurine', name: '星际太阳帆船', enName: 'Solar Sail Craft',  rarity: 'R',   icon: '⛵', colors: ['#facc15', '#38bdf8'], funFact: '不用一滴燃料，仅靠太阳光子的轻柔推力就能向遥远星球扬帆远航！' },
    { id: 'space_jupiter',  seriesId: 'space', kind: 'figurine', name: '木星风暴红斑球', enName: 'Jupiter Orb',     rarity: 'R',   icon: '🟠', colors: ['#f97316', '#fed7aa'], funFact: '太阳系体积最大的行星，上面的“大红斑”气旋比整个地球还要大！' },

    // ================= 🌊 深海奇幻水族馆 (14 款 · 全新主题馆) =================
    { id: 'ocean_fendouzhe',seriesId: 'ocean', kind: 'figurine', name: '奋斗者号深潜器', enName: 'Fendouzhe Submersible', rarity: 'UR', icon: '🤿', colors: ['#0284c7', '#34d399'], funFact: '潜入一万米马里亚纳海沟最深处的中国载人深潜器，点亮万米海底世界！' },
    { id: 'ocean_bluewhale',seriesId: 'ocean', kind: 'figurine', name: '深海蓝鲸歌者', enName: 'Blue Whale Singer', rarity: 'UR',  icon: '🐋', colors: ['#1d4ed8', '#7dd3fc'], funFact: '地球上已知体型最大的动物，一颗心脏就有小汽车那么大，歌声能传几百公里！' },
    { id: 'ocean_narwhal',  seriesId: 'ocean', kind: 'figurine', name: '极地独角鲸',   enName: 'Arctic Narwhal',    rarity: 'SSR', icon: '🦄', colors: ['#0ea5e9', '#e0e7ff'], funFact: '额前长着两米多长螺旋长牙的北极冰海精灵，被称为“海洋独角兽”！' },
    { id: 'ocean_jellyfish',seriesId: 'ocean', kind: 'figurine', name: '荧光水母灯笼', enName: 'Glowing Jellyfish', rarity: 'SSR', icon: '🪼', colors: ['#a855f7', '#22d3ee'], funFact: '身体 95% 都是水却能发出梦幻蓝紫生物荧光的深海小芭蕾舞者！' },
    { id: 'ocean_seadragon',seriesId: 'ocean', kind: 'figurine', name: '叶海龙伪装师', enName: 'Leafy Seadragon',   rarity: 'SSR', icon: '🌿', colors: ['#10b981', '#f59e0b'], funFact: '全身长满像海藻叶片一样的华丽鳍片，藏在海草丛里谁也认不出来！' },
    { id: 'ocean_manta',    seriesId: 'ocean', kind: 'figurine', name: '双翼蝠鲼滑翔机', enName: 'Giant Manta Ray', rarity: 'SR',  icon: '🪁', colors: ['#0369a1', '#67e8f9'], funFact: '展开宽大胸鳍像风筝一样在珊瑚礁上空优雅滑翔的温柔大鱼！' },
    { id: 'ocean_nautilus', seriesId: 'ocean', kind: 'figurine', name: '鹦鹉螺潜艇官', enName: 'Chambered Nautilus',rarity: 'SR',  icon: '🐚', colors: ['#f97316', '#fef3c7'], funFact: '壳里分成三十多个小气室，靠吸水和排水就能像潜艇一样自由浮沉！' },
    { id: 'ocean_dumbo',    seriesId: 'ocean', kind: 'figurine', name: '小飞象章鱼',   enName: 'Dumbo Octopus',     rarity: 'SR',  icon: '🐙', colors: ['#f472b6', '#fda4af'], funFact: '头顶长着两只像小飞象大耳朵一样的肉鳍，扑扇耳朵在深海呆萌漫步！' },
    { id: 'ocean_clownfish',seriesId: 'ocean', kind: 'figurine', name: '珊瑚小丑鱼',   enName: 'Coral Clownfish',   rarity: 'R',   icon: '🐠', colors: ['#fb923c', '#ffffff'], funFact: '身披橘白条纹住在海葵触手间，自带神奇保护膜不怕海葵刺细胞！' },
    { id: 'ocean_seahorse', seriesId: 'ocean', kind: 'figurine', name: '海马奶爸骑士', enName: 'Seahorse Knight',   rarity: 'R',   icon: '🐴', colors: ['#eab308', '#fde68a'], funFact: '尾巴能卷住海草防冲走，而且是由海马爸爸肚皮上的育儿袋孵出小宝宝哦！' },
    { id: 'ocean_otter',    seriesId: 'ocean', kind: 'figurine', name: '手拉手小海獭', enName: 'Holding-Hands Otter', rarity: 'R', icon: '🦦', colors: ['#92400e', '#bae6fd'], funFact: '睡觉时会和好朋友手拉手防止被海浪冲散，肚皮上还揣着敲贝壳的小石头！' },
    { id: 'ocean_turtle',   seriesId: 'ocean', kind: 'figurine', name: '绿海龟航海家', enName: 'Green Sea Turtle',  rarity: 'R',   icon: '🐢', colors: ['#16a34a', '#6ee7b7'], funFact: '借助地球磁场导航横跨大洋几千公里，长大后依然能找回出生的沙滩！' },
    { id: 'ocean_starfish', seriesId: 'ocean', kind: 'figurine', name: '五角蓝海星',   enName: 'Blue Sea Star',     rarity: 'R',   icon: '⭐', colors: ['#2563eb', '#93c5fd'], funFact: '用腹面成千上万只吸盘小管足在礁石散步，断了一只腕足还能重新长出来！' },
    { id: 'ocean_coral',    seriesId: 'ocean', kind: 'figurine', name: '鹿角七彩珊瑚', enName: 'Staghorn Coral',    rarity: 'R',   icon: '🪸', colors: ['#fb7185', '#fde047'], funFact: '珊瑚其实不是石头也不是植物，而是无数勤劳珊瑚虫合力建造的海底城堡！' },

    // ================= 🦋 奇趣自然博物院 (14 款 · 全新主题馆) =================
    { id: 'nat_morpho',     seriesId: 'nature', kind: 'figurine', name: '光明女神闪蝶', enName: 'Blue Morpho Butterfly', rarity: 'UR', icon: '🦋', colors: ['#2563eb', '#22d3ee'], funFact: '翅膀没有蓝色色素，却靠纳米级鳞片折射阳光闪耀出金属宝石般的蔚蓝光芒！' },
    { id: 'nat_firefly',    seriesId: 'nature', kind: 'figurine', name: '夏夜萤火虫灯', enName: 'Lantern Firefly',   rarity: 'SSR', icon: '✨', colors: ['#84cc16', '#fde047'], funFact: '尾部发光几乎不产生热量，是发光效率高达 95% 以上的天然冷光小灯笼！' },
    { id: 'nat_venus',      seriesId: 'nature', kind: 'figurine', name: '捕蝇草小卫士', enName: 'Venus Flytrap',     rarity: 'SSR', icon: '🪴', colors: ['#16a34a', '#f43f5e'], funFact: '叶片内侧长着灵敏感觉毛，小虫连续触碰两次就会在半秒内啪地合拢！' },
    { id: 'nat_chameleon',  seriesId: 'nature', kind: 'figurine', name: '七彩变色龙',   enName: 'Panther Chameleon', rarity: 'SSR', icon: '🦎', colors: ['#10b981', '#ec4899'], funFact: '两只眼睛能 360 度分别看不同方向，还能调节皮肤晶体切换心情色彩！' },
    { id: 'nat_beetle',     seriesId: 'nature', kind: 'figurine', name: '长戟大兜虫',   enName: 'Hercules Beetle',   rarity: 'SR',  icon: '🪲', colors: ['#b45309', '#facc15'], funFact: '能举起超过自己体重几十倍重物的甲虫大力士，长角威风却只爱吃甜甜树汁！' },
    { id: 'nat_mantis',     seriesId: 'nature', kind: 'figurine', name: '兰花螳螂花仙', enName: 'Orchid Mantis',     rarity: 'SR',  icon: '🌸', colors: ['#f472b6', '#fdf2f8'], funFact: '步足展开酷似粉白相间的热带兰花花瓣，静坐枝头上演完美拟态魔法！' },
    { id: 'nat_ginkgo',     seriesId: 'nature', kind: 'figurine', name: '千年银杏金叶', enName: 'Golden Ginkgo Leaf',rarity: 'SR',  icon: '🍂', colors: ['#eab308', '#fef08a'], funFact: '与恐龙同时代的植物“活化石”，秋天小扇子般的叶片染成满树璀璨金黄！' },
    { id: 'nat_hummingbird',seriesId: 'nature', kind: 'figurine', name: '蜂鸟悬停飞羽', enName: 'Ruby Hummingbird',  rarity: 'SR',  icon: '🐦', colors: ['#14b8a6', '#fb7185'], funFact: '翅膀每秒振翅高达 50 次以上，是唯一既能空中悬停又能倒着飞的迷你小鸟！' },
    { id: 'nat_ladybug',    seriesId: 'nature', kind: 'figurine', name: '七星瓢虫红帽', enName: 'Seven-Spot Ladybug',rarity: 'R',   icon: '🐞', colors: ['#ef4444', '#fca5a5'], funFact: '红底黑点圆滚滚的花园小卫士，最爱帮农民伯伯消灭啃叶子的小蚜虫！' },
    { id: 'nat_dandelion',  seriesId: 'nature', kind: 'figurine', name: '蒲公英降落伞', enName: 'Dandelion Seed',    rarity: 'R',   icon: '🌼', colors: ['#facc15', '#e0f2fe'], funFact: '每颗小种子都撑着一柄轻盈绒毛降落伞，乘着春风去远方安家发芽！' },
    { id: 'nat_mushroom',   seriesId: 'nature', kind: 'figurine', name: '森林松茸小伞', enName: 'Forest Matsutake',  rarity: 'R',   icon: '🍄', colors: ['#d97706', '#fed7aa'], funFact: '雨后从松针下悄悄冒出头的小菌伞，和松树根系互帮互助共同生长！' },
    { id: 'nat_bamboo',     seriesId: 'nature', kind: 'figurine', name: '雨后破土春笋', enName: 'Spring Bamboo',     rarity: 'R',   icon: '🎍', colors: ['#22c55e', '#bbf7d0'], funFact: '春雨过后一天能蹿高几十厘米的植物长高冠军，长大就是大熊猫最爱的翠竹！' },
    { id: 'nat_snail',      seriesId: 'nature', kind: 'figurine', name: '螺旋水晶蜗牛', enName: 'Spiral Snail',      rarity: 'R',   icon: '🐌', colors: ['#a855f7', '#fbcfe8'], funFact: '背着顺时针螺旋小房子慢悠悠探险，走过的地方留下一条银亮足迹！' },
    { id: 'nat_pinecone',   seriesId: 'nature', kind: 'figurine', name: '晴雨表小松果', enName: 'Weather Pinecone',  rarity: 'R',   icon: '🌰', colors: ['#92400e', '#fde68a'], funFact: '天然森林天气预报员：晴天干燥时鳞片张开播松子，下雨潮湿时紧紧闭合！' },

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

    // ================= 🏮 国宝非遗奇珍阁 (14 款) =================
    { id: 'tr_sanxingdui',  seriesId: 'treasures', kind: 'figurine', name: '三星堆青铜神树', enName: 'Bronze Sacred Tree', rarity: 'UR',  icon: '🌳', colors: ['#059669', '#eab308'], funFact: '三千多年前古蜀工匠铸造的参天青铜树，枝头站立着九只太阳神鸟！' },
    { id: 'tr_qianli',      seriesId: 'treasures', kind: 'figurine', name: '千里江山微缩卷', enName: 'Green Landscape Scroll', rarity: 'UR', icon: '🏞️', colors: ['#0d9488', '#2563eb'], funFact: '18岁天才少年王希孟用孔雀石与蓝铜矿绘就的千年璀璨青绿山水！' },
    { id: 'tr_bianzhong',   seriesId: 'treasures', kind: 'figurine', name: '曾侯乙青铜编钟', enName: 'Bronze Chime Bells', rarity: 'UR',  icon: '🔔', colors: ['#b45309', '#facc15'], funFact: '两千四百年前的一钟双音音乐奇迹，敲击正中与侧面能奏出两个不同音高！' },
    { id: 'tr_flyinghorse', seriesId: 'treasures', kind: 'figurine', name: '马踏飞燕铜奔马', enName: 'Bronze Galloping Horse', rarity: 'SSR', icon: '🐎', colors: ['#10b981', '#f59e0b'], funFact: '骏马昂首疾驰，三足腾空、一足轻踏飞鸟，尽显汉代力学平衡智慧！' },
    { id: 'tr_ninedeer',    seriesId: 'treasures', kind: 'figurine', name: '敦煌九色鹿瑞像', enName: 'Nine-Colored Deer',  rarity: 'SSR', icon: '🦌', colors: ['#f59e0b', '#ec4899'], funFact: '源自莫高窟第257窟壁画的善良神鹿，身披九彩星纹传递诚实与勇敢！' },
    { id: 'tr_liondance',   seriesId: 'treasures', kind: 'figurine', name: '岭南非遗小醒狮', enName: 'Awakening Lion',     rarity: 'SSR', icon: '🦁', colors: ['#ef4444', '#facc15'], funFact: '眨着灵动大眼睛的绒球小醒狮，锣鼓一响腾跃采青，寓意吉祥如意！' },
    { id: 'tr_cloisonne',   seriesId: 'treasures', kind: 'figurine', name: '景泰蓝掐丝宝瓶', enName: 'Cloisonné Vase',     rarity: 'SR',  icon: '🏺', colors: ['#1d4ed8', '#fbbf24'], funFact: '用细扁铜丝手工捏出精美花纹再填上宝石蓝釉烧制，华美夺目！' },
    { id: 'tr_roofbeast',   seriesId: 'treasures', kind: 'figurine', name: '故宫太和殿脊兽', enName: 'Palace Roof Beast',  rarity: 'SR',  icon: '🏯', colors: ['#dc2626', '#f59e0b'], funFact: '排排坐在古建筑屋檐角的小瑞兽，既能装饰祈福还能保护木栓防漏雨！' },
    { id: 'tr_glasscup',    seriesId: 'treasures', kind: 'figurine', name: '丝路夜光琉璃杯', enName: 'Luminous Glass Cup', rarity: 'SR',  icon: '🍷', colors: ['#06b6d4', '#a855f7'], funFact: '丝绸之路文化交融的晶莹琉璃盏，月光映照下流光溢彩宛若星河！' },
    { id: 'tr_shadowpuppet',seriesId: 'treasures', kind: 'figurine', name: '光影非遗皮影戏', enName: 'Shadow Puppet Art',  rarity: 'SR',  icon: '🎭', colors: ['#ea580c', '#fde047'], funFact: '一盏暖灯映白幕，匠人巧手翻飞间演绎神话故事的千年“光影老电影”！' },
    { id: 'tr_pandalantern',seriesId: 'treasures', kind: 'figurine', name: '非遗竹编熊猫灯', enName: 'Bamboo Panda Lantern', rarity: 'R', icon: '🏮', colors: ['#16a34a', '#fde047'], funFact: '用柔韧青竹篾巧妙编织成的圆滚滚熊猫小花灯，点亮温暖团圆夜！' },
    { id: 'tr_oilumbrella', seriesId: 'treasures', kind: 'figurine', name: '江南烟雨油纸伞', enName: 'Oil-Paper Umbrella', rarity: 'R',   icon: '☂️', colors: ['#ec4899', '#38bdf8'], funFact: '历经八十多道工序手工绘花刷桐油，撑开便是一幅水墨江南画！' },
    { id: 'tr_silkfan',     seriesId: 'treasures', kind: 'figurine', name: '苏绣荷塘小团扇', enName: 'Silk Lotus Fan',     rarity: 'R',   icon: '🪭', colors: ['#10b981', '#fbcfe8'], funFact: '一根丝线劈成数十丝双面精绣，扇面正反两面都能看见灵动小青蛙！' },
    { id: 'tr_porcelain',   seriesId: 'treasures', kind: 'figurine', name: '景德镇锦鲤青花碗', enName: 'Blue-and-White Bowl', rarity: 'R', icon: '🥣', colors: ['#2563eb', '#e0f2fe'], funFact: '白釉如玉、青花似水，碗底游动着两条栩栩如生的小红锦鲤！' },

    // ================= 🚄 超级工程科技馆 (12 款 · 全新主题馆) =================
    { id: 'tech_fuxing',    seriesId: 'tech', kind: 'figurine', name: '复兴号中国高铁', enName: 'Fuxing Bullet Train', rarity: 'UR',  icon: '🚄', colors: ['#dc2626', '#e2e8f0'], funFact: '时速 350 公里稳得连立在窗台上的硬币都不倒的银红飞龙高速列车！' },
    { id: 'tech_quantum',   seriesId: 'tech', kind: 'figurine', name: '九章光量子超算', enName: 'Quantum Computer',    rarity: 'UR',  icon: '💠', colors: ['#6366f1', '#22d3ee'], funFact: '用光子进行超高速并行运算的前沿科学重器，眨眼间解开超级数学难题！' },
    { id: 'tech_c919',      seriesId: 'tech', kind: 'figurine', name: 'C919国产大飞机', enName: 'C919 Passenger Jet',  rarity: 'SSR', icon: '✈️', colors: ['#0284c7', '#6ee7b7'], funFact: '张开洁白流线型机翼翱翔蓝天的中国自主研制大型喷气式客机！' },
    { id: 'tech_maglev',    seriesId: 'tech', kind: 'figurine', name: '高速磁悬浮列车', enName: 'Maglev Train',        rarity: 'SSR', icon: '🚝', colors: ['#2563eb', '#a5f3fc'], funFact: '依靠电磁力悬浮在轨道上方几毫米处“贴地飞行”，没有车轮摩擦超安静！' },
    { id: 'tech_bionicdog', seriesId: 'tech', kind: 'figurine', name: '四足机器救援犬', enName: 'Bionic Robot Dog',    rarity: 'SSR', icon: '🤖', colors: ['#4f46e5', '#fbbf24'], funFact: '会爬陡坡、越过障碍还能后空翻的智能机器狗，能替消防员深入险境！' },
    { id: 'tech_wind',      seriesId: 'tech', kind: 'figurine', name: '海上巨型大风车', enName: 'Offshore Wind Turbine',rarity: 'SR', icon: '🌬️', colors: ['#0ea5e9', '#bbf7d0'], funFact: '矗立在蔚蓝海面上的清洁能源巨人，扇叶转一圈发的电够家庭用一整天！' },
    { id: 'tech_bridge',    seriesId: 'tech', kind: 'figurine', name: '跨海大桥飞龙段', enName: 'Sea-Crossing Bridge', rarity: 'SR',  icon: '🌉', colors: ['#3b82f6', '#fde047'], funFact: '横跨碧海波涛的超级跨海工程，桥面连接人工岛再潜入海底沉管隧道！' },
    { id: 'tech_drone',     seriesId: 'tech', kind: 'figurine', name: '夜空千机灯光秀', enName: 'Light Show Drone',    rarity: 'SR',  icon: '🛸', colors: ['#8b5cf6', '#f472b6'], funFact: '成百上千架带彩灯的小无人机由电脑精准编队，在夜空画出立体星空画卷！' },
    { id: 'tech_3dprinter', seriesId: 'tech', kind: 'figurine', name: '神笔3D打印工坊', enName: '3D Printer Studio',   rarity: 'R',   icon: '🖨️', colors: ['#f97316', '#fde68a'], funFact: '把彩色环保线材一层层熔融堆叠，把脑海里的玩具设计直接变成立体模型！' },
    { id: 'tech_solartower',seriesId: 'tech', kind: 'figurine', name: '戈壁熔盐太阳塔', enName: 'Solar Mirror Tower',  rarity: 'R',   icon: '☀️', colors: ['#f59e0b', '#fef08a'], funFact: '上万面向日葵般的镜子把阳光反射到高塔顶端，连夜晚也能持续发清洁电！' },
    { id: 'tech_tbm',       seriesId: 'tech', kind: 'figurine', name: '盾构机地底先锋', enName: 'Tunnel Boring Machine',rarity: 'R',  icon: '⚙️', colors: ['#475569', '#38bdf8'], funFact: '巨大刀盘缓缓旋转一边掘进一边拼装管片，在城市地底稳稳修筑地铁隧道！' },
    { id: 'tech_exoarm',    seriesId: 'tech', kind: 'figurine', name: '助力外骨骼机甲', enName: 'Bionic Exoskeleton',  rarity: 'R',   icon: '🦾', colors: ['#0d9488', '#a7f3d0'], funFact: '模仿人体关节设计的智能穿戴机械臂，帮人们轻松托起沉重箱子！' }
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
