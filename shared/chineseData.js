/**
 * shared/chineseData.js - 统编版小学语文【一年级上册 & 二年级上册】核心分级题库
 * --------------------------------------------------------------------------
 * 严格依据教育部统编版语文教材编写：
 * - grade1_1（一年级上册）：生字填空严格限定在《写字表》独体字与基础字，涵盖汉语拼音、量词《大小多少》、反义词、一上必背古诗韵文。
 * - grade2_1（二年级上册）：响应小豌豆语音心愿，重点涵盖无选项四字词语填空、二上必背课文名句与古诗默写、多音字、形近同音字、《场景歌》量词、连词成句与古诗接龙。
 * - 所有提示（tip）严格采用“部首/结构/字义启发”设计，绝不直接泄露答案汉字！
 */

export const CHINESE_GRADES = [
    {
        id: 'grade1_1',
        name: '🌱 一年级上册',
        fullName: '🌱 统编版 · 一年级上册',
        desc: '适合一年级：汉语拼音辨析、一上写字表独体字自主填空、《大小多少》量词反义词与必背古诗韵文'
    },
    {
        id: 'grade2_1',
        name: '🌿 二年级上册',
        fullName: '🌿 统编版 · 二年级上册',
        desc: '适合二年级：四字成语无选项填空、二上课文佳句与古诗默写、语境多音字、形近字与连词成句'
    },
    {
        id: 'mixed_1_2',
        name: '🌈 一二年级混合',
        fullName: '🌈 统编版 · 一二年级综合巩固',
        desc: '一上基础字词拼音与二上成语佳句智能混合抽查，温故知新'
    }
];

export const CHINESE_QUESTION_TYPES = [
    {
        id: 'cn_word_fill',
        name: '✍️ 词语填空(无选项)',
        shortName: '✍️ 词语填空',
        desc: '不给选项！看拼音与词义提示，自己动手输入正确的生字或成语字'
    },
    {
        id: 'cn_sentence_fill',
        name: '📜 佳句默写(无选项)',
        shortName: '📜 佳句默写',
        desc: '不给选项！统编版课文佳句与必背古诗名句，自己动手填写空缺字词'
    },
    {
        id: 'cn_pinyin_tone',
        name: '🎵 拼音声调辨析',
        shortName: '🎵 拼音辨音',
        desc: '辨析声母 b/d/p/q、标调规则、平翘舌(z/zh)与前后鼻音(in/ing)'
    },
    {
        id: 'cn_polyphone',
        name: '🔀 多音字小侦探',
        shortName: '🔀 多音字',
        desc: '结合真实句子语境，判断加点多音字的正确读音'
    },
    {
        id: 'cn_confusable',
        name: '🔍 形近同音字选字',
        shortName: '🔍 形近选字',
        desc: '区分人/入、园/圆、进/近、晴/睛/情/请等高频易混错别字'
    },
    {
        id: 'cn_measure_antonym',
        name: '⚖️ 量词与近反义词',
        shortName: '⚖️ 量词反义',
        desc: '《大小多少》《场景歌》量词搭配与近义词、反义词气泡配对消消乐'
    },
    {
        id: 'cn_sentence_order',
        name: '🚂 连词成句与标点',
        shortName: '🚂 连词成句',
        desc: '按语序点选词块组成通顺句子，并选对句末标点符号'
    },
    {
        id: 'cn_poem_match',
        name: '🏮 古诗名句接龙',
        shortName: '🏮 古诗接龙',
        desc: '根据上句、下句或诗意提示配对必背古诗词与日积月累名言'
    }
];

export const ALL_CHINESE_TYPE_IDS = CHINESE_QUESTION_TYPES.map(t => t.id);

// ==================== 1. ✍️ 词语生字自主填空（无选项） ====================
export const CN_WORD_FILL_BANK = {
    grade1_1: [
        { id: 'w1_01', prompt: '天地（  ）', answer: '人', fullWord: '天地人', pinyin: 'rén', meaning: '头顶蓝天，脚踏大地，堂堂正正立世间', tip: '独体字，一撇一捺互相支撑，共 2 画' },
        { id: 'w1_02', prompt: '金（  ）水火土', answer: '木', fullWord: '金木水火土', pinyin: 'mù', meaning: '五行之一，代表树木与森林', tip: '象形独体字，横、竖、撇、捺像一棵树，共 4 画' },
        { id: 'w1_03', prompt: '金木（  ）火土', answer: '水', fullWord: '金木水火土', pinyin: 'shuǐ', meaning: '清澈流淌的江河清泉', tip: '象形独体字，中间一笔是竖钩，左右两笔相对，共 4 画' },
        { id: 'w1_04', prompt: '日（  ）水火', answer: '月', fullWord: '日月水火', pinyin: 'yuè', meaning: '夜空中弯弯或圆圆发光的星球', tip: '象形独体字，外框里面有两小横，共 4 画' },
        { id: 'w1_05', prompt: '上（  ）左右', answer: '下', fullWord: '上下左右', pinyin: 'xià', meaning: '与“上”相对的位置方向', tip: '独体字，第一笔长横，接着写竖和右点，共 3 画' },
        { id: 'w1_06', prompt: '（  ）小多少', answer: '大', fullWord: '大小多少', pinyin: 'dà', meaning: '与“小”意思相反', tip: '独体字，“人”字张开双臂加一横，共 3 画' },
        { id: 'w1_07', prompt: '大小多（  ）', answer: '少', fullWord: '大小多少', pinyin: 'shǎo', meaning: '数量不多，与“多”意思相反', tip: '上面像“小”字不带钩，下面加一长撇，共 4 画' },
        { id: 'w1_08', prompt: '东（  ）南北', answer: '西', fullWord: '东西南北', pinyin: 'xī', meaning: '傍晚太阳落山的方向', tip: '与“东”相对的方向字，第一笔是一横，共 6 画' },
        { id: 'w1_09', prompt: '蓝天白（  ）', answer: '云', fullWord: '蓝天白云', pinyin: 'yún', meaning: '飘浮在蓝天上洁白柔软的一朵朵', tip: '两横下面一个撇折加点（厶），共 4 画' },
        { id: 'w1_10', prompt: '春风夏（  ）', answer: '雨', fullWord: '春风夏雨', pinyin: 'yǔ', meaning: '从云层里落下来的小水滴', tip: '象形字，大框里面有四个小点像天空落下的水珠，共 8 画' },
        { id: 'w1_11', prompt: '开（  ）欢笑', answer: '口', fullWord: '开口欢笑', pinyin: 'kǒu', meaning: '张开嘴巴开心地笑', tip: '方方正正三笔写成的象形字，共 3 画' },
        { id: 'w1_12', prompt: '耳聪（  ）明', answer: '目', fullWord: '耳聪目明', pinyin: 'mù', meaning: '耳朵灵、眼睛亮', tip: '代表眼睛的象形字，长方框里面有两横，共 5 画' },
        { id: 'w1_13', prompt: '心灵（  ）巧', answer: '手', fullWord: '心灵手巧', pinyin: 'shǒu', meaning: '心思灵敏，双掌灵巧会做手工', tip: '第一笔是平撇，最末一笔是弯钩，共 4 画' },
        { id: 'w1_14', prompt: '高（  ）流水', answer: '山', fullWord: '高山流水', pinyin: 'shān', meaning: '高耸的峰峦与奔流的河水', tip: '象形字，像三座并排矗立的高峰，共 3 画' },
        { id: 'w1_15', prompt: '水（  ）稻花', answer: '田', fullWord: '水田稻花', pinyin: 'tián', meaning: '种着水稻的一块块方格农地', tip: '全包围方框正中间一个“十”字，共 5 画' },
        { id: 'w1_16', prompt: '青青（  ）苗', answer: '禾', fullWord: '青青禾苗', pinyin: 'hé', meaning: '田地里绿油油的谷物幼苗', tip: '“木”字头顶多一平撇，共 5 画' },
        { id: 'w1_17', prompt: '红红（  ）火', answer: '火', fullWord: '红红火火', pinyin: 'huǒ', meaning: '像燃烧的火焰一样旺盛热闹', tip: '点、小撇、竖撇、捺，共 4 画' },
        { id: 'w1_18', prompt: '一（  ）黄牛', answer: '头', fullWord: '一头黄牛', pinyin: 'tóu', meaning: '用于牛、大象等大动物的量词', tip: '左上两个点，右下是一个“大”字，共 5 画' },
        { id: 'w1_19', prompt: '小（  ）唱歌', answer: '鸟', fullWord: '小鸟唱歌', pinyin: 'niǎo', meaning: '长着翅膀羽毛、在枝头鸣叫的动物', tip: '里面有一点像小眼睛，下面一横托住，共 5 画' },
        { id: 'w1_20', prompt: '（  ）晨读书', answer: '早', fullWord: '早晨读书', pinyin: 'zǎo', meaning: '太阳刚刚升起的清晨时光', tip: '上下结构，上面是“日”，下面是“十”，共 6 画' },
        { id: 'w1_21', prompt: '读（  ）写字', answer: '书', fullWord: '读书写字', pinyin: 'shū', meaning: '阅读课本，练习写字', tip: '横折、横折钩、竖、右上一点，共 4 画' },
        { id: 'w1_22', prompt: '双木成（  ）', answer: '林', fullWord: '双木成林', pinyin: 'lín', meaning: '许多树木聚集在一起变成树林', tip: '左右结构，两个“木”字并排做朋友，共 8 画' },
        { id: 'w1_23', prompt: '开（  ）快乐', answer: '心', fullWord: '开心快乐', pinyin: 'xīn', meaning: '心里高高兴兴', tip: '卧钩上面带着三个点，共 4 画' },
        { id: 'w1_24', prompt: '立（  ）站好', answer: '正', fullWord: '立正站好', pinyin: 'zhèng', meaning: '身姿笔直端正，不歪斜', tip: '一横下面一个“止”，常用五画来投票计数' },
        { id: 'w1_25', prompt: '勤学好（  ）', answer: '问', fullWord: '勤学好问', pinyin: 'wèn', meaning: '努力学习，不懂就主动请教', tip: '半包围结构，“门”字框里面一个“口”字，共 6 画' },
        { id: 'w1_26', prompt: '香甜水（  ）', answer: '果', fullWord: '香甜水果', pinyin: 'guǒ', meaning: '果树上结出的苹果、桃子等果实', tip: '“日/田”下面连着“木”，共 8 画' }
    ],
    grade2_1: [
        { id: 'w2_01', prompt: '山（  ）水秀', answer: '清', fullWord: '山清水秀', pinyin: 'qīng', meaning: '形容山峦苍翠、江水清澈的优美景色', tip: '左右结构，左边是三点水（氵），右边是青草的“青”' },
        { id: 'w2_02', prompt: '名（  ）古迹', answer: '胜', fullWord: '名胜古迹', pinyin: 'shèng', meaning: '风景优美和有古代遗迹的著名地方', tip: '左右结构，左边是“月”字旁，右边是生命的“生”' },
        { id: 'w2_03', prompt: '四海为（  ）', answer: '家', fullWord: '四海为家', pinyin: 'jiā', meaning: '什么地方都可以当作自己的住处（《植物妈妈有办法》）', tip: '上下结构，宝盖头（宀）下面一个“豕”' },
        { id: 'w2_04', prompt: '坐井（  ）天', answer: '观', fullWord: '坐井观天', pinyin: 'guān', meaning: '坐在井底看天，比喻眼界狭小', tip: '左右结构，左边是“又”，右边是看见的“见”' },
        { id: 'w2_05', prompt: '无（  ）无际', answer: '边', fullWord: '无边无际', pinyin: 'biān', meaning: '形容天空、草原或大海极其辽阔没有尽头', tip: '半包围结构，走之底（辶）里面一个力气的“力”' },
        { id: 'w2_06', prompt: '自言自（  ）', answer: '语', fullWord: '自言自语', pinyin: 'yǔ', meaning: '自己一个人低声跟自己说话', tip: '左右结构，言字旁（讠）右边是“五+口（吾）”' },
        { id: 'w2_07', prompt: '大雪（  ）飞', answer: '纷', fullWord: '大雪纷飞', pinyin: 'fēn', meaning: '大片雪花满天飘落的样子（《寒号鸟》）', tip: '左右结构，绞丝旁（纟）右边一个分开的“分”' },
        { id: 'w2_08', prompt: '一（  ）独秀', answer: '枝', fullWord: '一枝独秀', pinyin: 'zhī', meaning: '别的都谢了，唯有一枝花独自盛开，比喻最为突出', tip: '左右结构，木字旁右边一个“支”' },
        { id: 'w2_09', prompt: '（  ）消云散', answer: '烟', fullWord: '烟消云散', pinyin: 'yān', meaning: '像云雾炊烟一样完全消失不见', tip: '左右结构，火字旁右边一个因为的“因”' },
        { id: 'w2_10', prompt: '名山大（  ）', answer: '川', fullWord: '名山大川', pinyin: 'chuān', meaning: '著名的高山和宽广的大河', tip: '独体象形字，竖撇、竖、长竖三笔代表奔流江河' },
        { id: 'w2_11', prompt: '五（  ）十色', answer: '光', fullWord: '五光十色', pinyin: 'guāng', meaning: '形容色彩鲜艳、晶莹发亮（《葡萄沟》）', tip: '上下结构，上面竖、点、撇，下面一横加“儿”，共 6 画' },
        { id: 'w2_12', prompt: '热（  ）好客', answer: '情', fullWord: '热情好客', pinyin: 'qíng', meaning: '非常热心诚恳地招待客人', tip: '左右结构，竖心旁（忄）右边一个“青”' },
        { id: 'w2_13', prompt: '金光（  ）闪', answer: '闪', fullWord: '金光闪闪', pinyin: 'shǎn', meaning: '金黄色的光芒一亮一亮地耀眼（《黄山奇石》）', tip: '半包围结构，“门”字框里面站着一个“人”' },
        { id: 'w2_14', prompt: '百闻不如一（  ）', answer: '见', fullWord: '百闻不如一见', pinyin: 'jiàn', meaning: '听人说一百遍，也不如亲眼看一次', tip: '独体字，共 4 画，注意和“贝”区分，最后一笔是竖弯钩' },
        { id: 'w2_15', prompt: '甜言（  ）语', answer: '蜜', fullWord: '甜言蜜语', pinyin: 'mì', meaning: '像蜂糖一样动听讨好人的话', tip: '上中下结构，宝盖头、中间“必”、最底下是个“虫”字底' },
        { id: 'w2_16', prompt: '害群之（  ）', answer: '马', fullWord: '害群之马', pinyin: 'mǎ', meaning: '危害集体的小家伙（语文园地八动物成语）', tip: '在草原奔跑的动物独体字，横折、竖折折钩、横，共 3 画' },
        { id: 'w2_17', prompt: '惊弓之（  ）', answer: '鸟', fullWord: '惊弓之鸟', pinyin: 'niǎo', meaning: '被弓箭吓怕了的飞禽，比喻受过惊吓遇到动静就害怕', tip: '天空飞翔的小动物，注意里面有一点，共 5 画' },
        { id: 'w2_18', prompt: '如鱼得（  ）', answer: '水', fullWord: '如鱼得水', pinyin: 'shuǐ', meaning: '像小鱼回到了江河湖海里一样自在开心', tip: '鱼儿离不开它的清澈液体，独体字共 4 画' },
        { id: 'w2_19', prompt: '胆小如（  ）', answer: '鼠', fullWord: '胆小如鼠', pinyin: 'shǔ', meaning: '胆子小得像小耗子一样', tip: '十二生肖排在第一位的动物汉字' },
        { id: 'w2_20', prompt: '龙飞（  ）舞', answer: '凤', fullWord: '龙飞凤舞', pinyin: 'fèng', meaning: '形容山势蜿蜒或书法气势奔放生动', tip: '半包围结构，几字框里面加一横和“又”' },
        { id: 'w2_21', prompt: '风（  ）日丽', answer: '和', fullWord: '风和日丽', pinyin: 'hé', meaning: '春风温和，阳光明媚的好天气', tip: '左右结构，左边是禾木旁（禾），右边是一个“口”' },
        { id: 'w2_22', prompt: '风调（  ）顺', answer: '雨', fullWord: '风调雨顺', pinyin: 'yǔ', meaning: '风雨及时适量，气候非常好', tip: '天空中落下的水滴，框里有四个小点，共 8 画' },
        { id: 'w2_23', prompt: '云开（  ）散', answer: '雾', fullWord: '云开雾散', pinyin: 'wù', meaning: '浓云和薄雾都消散了，露出晴朗天空', tip: '上下结构，上面是雨字头，下面是任务的“务”' },
        { id: 'w2_24', prompt: '春色满（  ）', answer: '园', fullWord: '春色满园', pinyin: 'yuán', meaning: '整个花园里到处都是春天的美丽景色', tip: '全包围结构，大口框（囗）里面是一元的“元”' },
        { id: 'w2_25', prompt: '（  ）假虎威', answer: '狐', fullWord: '狐假虎威', pinyin: 'hú', meaning: '借着老虎的威风吓唬百兽，比喻仗势欺人', tip: '左右结构，反犬旁（犭）右边一个西瓜的“瓜”' },
        { id: 'w2_26', prompt: '神（  ）活现', answer: '气', fullWord: '神气活现', pinyin: 'qì', meaning: '自以为了不起而得意洋洋的样子', tip: '独体字，撇、横、横、横斜钩，共 4 画' },
        { id: 'w2_27', prompt: '半（  ）半疑', answer: '信', fullWord: '半信半疑', pinyin: 'xìn', meaning: '有点相信，又有点怀疑', tip: '左右结构，单人旁（亻）右边一个语言的“言”' },
        { id: 'w2_28', prompt: '群山（  ）绕', answer: '环', fullWord: '群山环绕', pinyin: 'huán', meaning: '四周被连绵的大山围在中间（《日月潭》）', tip: '左右结构，王字旁右边一个“不”字' },
        { id: 'w2_29', prompt: '树木茂（  ）', answer: '盛', fullWord: '树木茂盛', pinyin: 'shèng', meaning: '树木枝叶繁密旺盛地生长', tip: '上下结构，上面是成功的“成”，下面是皿字底（皿）' },
        { id: 'w2_30', prompt: '点点（  ）光', answer: '灯', fullWord: '点点灯光', pinyin: 'dēng', meaning: '夜晚亮起的一盏盏明亮灯火', tip: '左右结构，火字旁右边一个“丁”字' }
    ]
};

// ==================== 2. 📜 课文佳句 & 古诗默写（无选项） ====================
export const CN_SENTENCE_FILL_BANK = {
    grade1_1: [
        { id: 's1_01', source: '《咏鹅》骆宾王', sentence: '白毛浮绿（  ），红掌拨清波。', answer: '水', fullClause: '白毛浮绿水', pinyin: 'shuǐ', tip: '大白鹅浮在碧绿的河面上，独体象形字共 4 画' },
        { id: 's1_02', source: '《画》古诗', sentence: '远看（  ）有色，近听水无声。', answer: '山', fullClause: '远看山有色', pinyin: 'shān', tip: '远远望去画上的峰峦苍翠有颜色，共 3 画' },
        { id: 's1_03', source: '《画》古诗', sentence: '春去花还在，（  ）来鸟不惊。', answer: '人', fullClause: '人来鸟不惊', pinyin: 'rén', tip: '走近画前，画上的小鸟也不会受惊飞走，一撇一捺共 2 画' },
        { id: 's1_04', source: '《金木水火土》', sentence: '一二三四五，金木水（  ）土。', answer: '火', fullClause: '金木水火土', pinyin: 'huǒ', tip: '五行韵文第四个字，红彤彤暖洋洋，共 4 画' },
        { id: 's1_05', source: '《金木水火土》', sentence: '天地分（  ）下，日月照今古。', answer: '上', fullClause: '天地分上下', pinyin: 'shàng', tip: '与后面的“下”相对的方位字，共 3 画' },
        { id: 's1_06', source: '《对韵歌》', sentence: '（  ）对雨，雪对风，花对树，鸟对虫。', answer: '云', fullClause: '云对雨', pinyin: 'yún', tip: '天空中洁白飘浮，与“雨”相对，共 4 画' },
        { id: 's1_07', source: '《对韵歌》', sentence: '（  ）清对水秀，柳绿对桃红。', answer: '山', fullClause: '山清对水秀', pinyin: 'shān', tip: '与“水秀”相对，三峰耸立共 3 画' },
        { id: 's1_08', source: '《小小的船》叶圣陶', sentence: '弯弯的（  ）儿小小的船，小小的船儿两头尖。', answer: '月', fullClause: '弯弯的月儿小小的船', pinyin: 'yuè', tip: '夜空里弯弯发光、外框内有两短横的象形字，共 4 画' },
        { id: 's1_09', source: '《小小的船》叶圣陶', sentence: '我在小小的船里坐，只看见闪闪的星星蓝蓝的（  ）。', answer: '天', fullClause: '闪闪的星星蓝蓝的天', pinyin: 'tiān', tip: '繁星闪烁在蔚蓝的夜空中，一横下面加“大”' },
        { id: 's1_10', source: '《江南》汉乐府', sentence: '江南可采莲，莲叶何（  ）田。', answer: '田', fullClause: '莲叶何田田', pinyin: 'tián', tip: '叠词形容荷叶茂盛相连，方框里一个“十”，共 5 画' },
        { id: 's1_11', source: '《江南》汉乐府', sentence: '鱼戏莲叶（  ），鱼戏莲叶西。', answer: '东', fullClause: '鱼戏莲叶东', pinyin: 'dōng', tip: '太阳升起的方向，与后一句“西”相对，共 5 画' },
        { id: 's1_12', source: '《四季》课文', sentence: '草芽尖尖，他对小（  ）说：“我是春天。”', answer: '鸟', fullClause: '他对小鸟说', pinyin: 'niǎo', tip: '长着翅膀在枝头飞翔的小动物，共 5 画' },
        { id: 's1_13', source: '《大小多少》韵文', sentence: '一个（  ），一个小，一头黄牛一只猫。', answer: '大', fullClause: '一个大', pinyin: 'dà', tip: '与“小”意思相反的独体字，共 3 画' },
        { id: 's1_14', source: '《大小多少》韵文', sentence: '一边多，一边（  ），一群鸭子一只鸟。', answer: '少', fullClause: '一边少', pinyin: 'shǎo', tip: '与“多”意思相反，共 4 画' },
        { id: 's1_15', source: '《升国旗》课文', sentence: '五星红旗，我们的国旗。国歌声（  ），徐徐升起。', answer: '中', fullClause: '国歌声中', pinyin: 'zhōng', tip: '扁扁的方框正央穿过一笔悬针竖，共 4 画' },
        { id: 's1_16', source: '《悯农》李绅', sentence: '锄禾日当午，汗滴禾下（  ）。', answer: '土', fullClause: '汗滴禾下土', pinyin: 'tǔ', tip: '汗珠滴进庄稼下面的泥地里，十下面加一长横，共 3 画' },
        { id: 's1_17', source: '《古朗月行》李白', sentence: '小时不识（  ），呼作白玉盘。', answer: '月', fullClause: '小时不识月', pinyin: 'yuè', tip: '圆圆洁白挂在夜空像白玉盘，共 4 画' },
        { id: 's1_18', source: '《风》李峤', sentence: '解落三秋叶，能（  ）二月花。', answer: '开', fullClause: '能开二月花', pinyin: 'kāi', tip: '春风吹拂让二月花朵绽放，“关”的反义词，共 4 画' }
    ],
    grade2_1: [
        { id: 's2_01', source: '《登鹳雀楼》王之涣', sentence: '白日依山尽，（  ）（  ）入海流。', answer: '黄河', fullClause: '黄河入海流', pinyin: 'huáng hé', tip: '两个字：我国著名的母亲大川，草字头颜色字 + 三点水加“可”' },
        { id: 's2_02', source: '《登鹳雀楼》王之涣', sentence: '欲穷千里目，更上一（  ）（  ）。', answer: '层楼', fullClause: '更上一层楼', pinyin: 'céng lóu', tip: '两个字：尸字头下面“云” + 木字旁右边“娄”，再往上登高一级' },
        { id: 's2_03', source: '《望庐山瀑布》李白', sentence: '日照（  ）（  ）生紫烟，遥看瀑布挂前川。', answer: '香炉', fullClause: '日照香炉生紫烟', pinyin: 'xiāng lú', tip: '两个字：庐山著名的山峰名，禾字头下“日” + 火字旁加“卢”' },
        { id: 's2_04', source: '《望庐山瀑布》李白', sentence: '飞流直下三千尺，疑是银河落（  ）（  ）。', answer: '九天', fullClause: '疑是银河落九天', pinyin: 'jiǔ tiān', tip: '两个字：八加一的数字 + 一横加“大”，形容极高远的云霄' },
        { id: 's2_05', source: '《梅花》王安石', sentence: '墙角数枝梅，凌寒独（  ）（  ）。', answer: '自开', fullClause: '凌寒独自开', pinyin: 'zì kāi', tip: '两个字：“目”上加一撇 + “关”的反义词，迎着严寒孤傲绽放' },
        { id: 's2_06', source: '《梅花》王安石', sentence: '遥知不是（  ），为有暗香来。', answer: '雪', fullClause: '遥知不是雪', pinyin: 'xuě', tip: '雨字头下面一个横山（彐），冬日里洁白冰凉的景物' },
        { id: 's2_07', source: '《小儿垂钓》胡令能', sentence: '路人借问遥招手，怕得（  ）惊不应人。', answer: '鱼', fullClause: '怕得鱼惊不应人', pinyin: 'yú', tip: '小娃娃垂钓时怕吓跑河里游动的它，不敢大声应答' },
        { id: 's2_08', source: '《江雪》柳宗元', sentence: '孤舟蓑笠翁，独钓寒（  ）（  ）。', answer: '江雪', fullClause: '独钓寒江雪', pinyin: 'jiāng xuě', tip: '两个字：三点水加“工” + 雨字头加“彐”，与本诗诗名相同' },
        { id: 's2_09', source: '《夜宿山寺》李白', sentence: '危楼高百尺，（  ）可摘星辰。', answer: '手', fullClause: '手可摘星辰', pinyin: 'shǒu', tip: '形容山寺高耸入云，一伸出它仿佛就能摘到天上的星星，共 4 画' },
        { id: 's2_10', source: '《夜宿山寺》李白', sentence: '不敢高（  ）语，恐惊天上人。', answer: '声', fullClause: '不敢高声语', pinyin: 'shēng', tip: '上下结构，上面是“士”，不敢大嗓门说话' },
        { id: 's2_11', source: '《敕勒歌》北朝民歌', sentence: '天苍苍，野茫茫，风吹草低（  ）牛羊。', answer: '见', fullClause: '风吹草低见牛羊', pinyin: 'xiàn', tip: '此处读 xiàn（显现），风吹草伏露出了牛羊，共 4 画' },
        { id: 's2_12', source: '《植物妈妈有办法》', sentence: '孩子如果已经长大，就得告别妈妈，（  ）（  ）为家。', answer: '四海', fullClause: '四海为家', pinyin: 'sì hǎi', tip: '两个字：三加一的数字 + 三点水加“每”，到处都可以安家' },
        { id: 's2_13', source: '《植物妈妈有办法》', sentence: '植物妈妈的办法很多很多，不信你就（  ）（  ）观察。', answer: '仔细', fullClause: '不信你就仔细观察', pinyin: 'zǐ xì', tip: '两个字：单人旁加“子” + 绞丝旁加“田”，认认真真不马虎' },
        { id: 's2_14', source: '《树之歌》谚语', sentence: '十年树木，百年（  ）（  ）。', answer: '树人', fullClause: '百年树人', pinyin: 'shù rén', tip: '两个字：木字旁加“对” + 一撇一捺2画独体字，比喻培育栋梁不易' },
        { id: 's2_15', source: '《树之歌》谚语', sentence: '树高百尺，叶落归（  ）。', answer: '根', fullClause: '叶落归根', pinyin: 'gēn', tip: '左右结构，木字旁右边一个“艮”，大树扎在泥土里的部分' },
        { id: 's2_16', source: '《拍手歌》课文', sentence: '你拍九，我拍九，人和动物是（  ）（  ）。', answer: '朋友', fullClause: '人和动物是朋友', pinyin: 'péng you', tip: '两个字：第一个字由两个“月”并排组成，第二个字是横撇加“又”' },
        { id: 's2_17', source: '《田家四季歌》', sentence: '夏季里，农事（  ），采桑养蚕又插秧。', answer: '忙', fullClause: '农事忙', pinyin: 'máng', tip: '左右结构，竖心旁（忄）右边一个“亡”，农活很多不得闲' },
        { id: 's2_18', source: '《黄山奇石》课文', sentence: '那里景色（  ）（  ）神奇，尤其是那些怪石，有趣极了。', answer: '秀丽', fullClause: '那里景色秀丽神奇', pinyin: 'xiù lì', tip: '两个字：禾字头下面“乃” + 一长横下面两个小框，形容风景清雅好看' },
        { id: 's2_19', source: '《日月潭》课文', sentence: '北边像圆圆的（  ）（  ），叫日潭；南边像弯弯的月亮，叫月潭。', answer: '太阳', fullClause: '北边像圆圆的太阳', pinyin: 'tài yáng', tip: '两个字：“大”加一点 + 双耳旁右边“日”，白天照耀大地的恒星' },
        { id: 's2_20', source: '二上·日积月累', sentence: '有山皆图（  ），无水不文章。', answer: '画', fullClause: '有山皆图画', pinyin: 'huà', tip: '形容山水风景美如美术作品，中间是“田”字' },
        { id: 's2_21', source: '二上·日积月累', sentence: '有志者（  ）竟成。', answer: '事', fullClause: '有志者事竟成', pinyin: 'shì', tip: '独体字，共 8 画，立下志向努力去做，目标终会达成' },
        { id: 's2_22', source: '二上·日积月累', sentence: '志当存（  ）（  ）。', answer: '高远', fullClause: '志当存高远', pinyin: 'gāo yuǎn', tip: '两个字：“低”的反义词 + 走之底加“元”，抱负要宏大' },
        { id: 's2_23', source: '二上·日积月累《论语》', sentence: '与朋友交，言而有（  ）。', answer: '信', fullClause: '言而有信', pinyin: 'xìn', tip: '左右结构，单人旁（亻）右边一个“言”，说话算话守诺言' },
        { id: 's2_24', source: '二上·日积月累《孟子》', sentence: '不以规矩，不能成（  ）（  ）。', answer: '方圆', fullClause: '不能成方圆', pinyin: 'fāng yuán', tip: '两个字：点横起笔4画独体字 + 大口框里面一个“员”' }
    ]
};

// ==================== 3. 🎵 拼音声调 & 平翘舌/前后鼻音辨析 ====================
export const CN_PINYIN_BANK = {
    grade1_1: [
        { id: 'p1_01', char: '水', context: '清【水】', answer: 'shuǐ', options: ['shuǐ', 'suǐ', 'shěi', 'shuì'], tip: '翘舌音 sh，标调在 i 上（ui 标在后）' },
        { id: 'p1_02', char: '鸟', context: '小【鸟】', answer: 'niǎo', options: ['niǎo', 'liǎo', 'nǎo', 'niāo'], tip: '鼻音生母 n，三拼音节有介母 i，标调在 a 上' },
        { id: 'p1_03', char: '云', context: '白【云】', answer: 'yún', options: ['yún', 'yǘn', 'ún', 'yóng'], tip: '整体认读音节 yun，ü 见 y 擦掉两点，读第二声' },
        { id: 'p1_04', char: '月', context: '圆【月】', answer: 'yuè', options: ['yuè', 'yüè', 'yè', 'yuě'], tip: '整体认读音节 yue，ü 遇到 y 要去掉两点哦' },
        { id: 'p1_05', char: '风', context: '春【风】', answer: 'fēng', options: ['fēng', 'fēn', 'fōng', 'hēng'], tip: '声母 f 配后鼻韵母 eng（注意不是 fong）' },
        { id: 'p1_06', char: '果', context: '苹【果】', answer: 'guǒ', options: ['guǒ', 'gǒu', 'kuǒ', 'guō'], tip: '三拼音节 g-u-ǒ，第三声标在 o 上' },
        { id: 'p1_07', char: '竹', context: '翠【竹】', answer: 'zhú', options: ['zhú', 'zú', 'chú', 'zhǔ'], tip: '翘舌音 zh，读第二声阳平' },
        { id: 'p1_08', char: '森', context: '【森】林', answer: 'sēn', options: ['sēn', 'shēn', 'sēng', 'cēn'], tip: '平舌音 s + 前鼻韵母 en' },
        { id: 'p1_09', char: '伞', context: '雨【伞】', answer: 'sǎn', options: ['sǎn', 'shǎn', 'sǎng', 'cǎn'], tip: '平舌音 s + 前鼻韵母 an，第三声' },
        { id: 'p1_10', char: '船', context: '小【船】', answer: 'chuán', options: ['chuán', 'cuán', 'chuáng', 'quán'], tip: '翘舌音 ch + 介母 u + 前鼻音 an' },
        { id: 'p1_11', char: '星', context: '闪【星】', answer: 'xīng', options: ['xīng', 'xīn', 'qīng', 'sīng'], tip: '舌面音 x + 后鼻韵母 ing，第一声' },
        { id: 'p1_12', char: '桥', context: '小【桥】', answer: 'qiáo', options: ['qiáo', 'piáo', 'qáo', 'jiáo'], tip: '左上半圆 q（区别于 p），三拼音节 q-i-áo' },
        { id: 'p1_13', char: '雪', context: '白【雪】', answer: 'xuě', options: ['xuě', 'xüě', 'xiě', 'suě'], tip: 'j/q/x 遇到 ü 要擦掉两点，读第三声' },
        { id: 'p1_14', char: '草', context: '青【草】', answer: 'cǎo', options: ['cǎo', 'chǎo', 'zǎo', 'cāo'], tip: '平舌音 c，读第三声' },
        { id: 'p1_15', char: '虫', context: '昆【虫】', answer: 'chóng', options: ['chóng', 'cóng', 'chón', 'zhóng'], tip: '翘舌音 ch + 后鼻韵母 ong' },
        { id: 'p1_16', char: '蓝', context: '【蓝】天', answer: 'lán', options: ['lán', 'nán', 'láng', 'lá'], tip: '边音 l + 前鼻韵母 an' }
    ],
    grade2_1: [
        { id: 'p2_01', char: '旅', context: '【旅】行', answer: 'lǚ', options: ['lǚ', 'nǚ', 'lǔ', 'luǚ'], tip: '边音 l 与 ü 相拼时，ü 上两点不能省略！' },
        { id: 'p2_02', char: '捕', context: '【捕】食', answer: 'bǔ', options: ['bǔ', 'pǔ', 'fǔ', 'bū'], tip: '《小蝌蚪找妈妈》生字，声母是双唇音 b，第三声' },
        { id: 'p2_03', char: '迎', context: '欢【迎】', answer: 'yíng', options: ['yíng', 'yín', 'yéng', 'yǐng'], tip: '整体认读后鼻音节 ying，读第二声' },
        { id: 'p2_04', char: '傍', context: '【傍】晚', answer: 'bàng', options: ['bàng', 'páng', 'bàn', 'pàng'], tip: '《我是什么》生字，指日落前后，声母是 b，后鼻韵母第四声' },
        { id: 'p2_05', char: '松', context: '苍【松】', answer: 'sōng', options: ['sōng', 'shōng', 'sōn', 'cōng'], tip: '平舌音 s + 后鼻韵母 ong' },
        { id: 'p2_06', char: '耐', context: '【耐】寒', answer: 'nài', options: ['nài', 'lài', 'nèi', 'mài'], tip: '《树之歌》桦树耐寒，鼻音生母 n，第四声' },
        { id: 'p2_07', char: '秤', context: '大【秤】', answer: 'chèng', options: ['chèng', 'cèng', 'chèn', 'chēng'], tip: '《曹冲称象》名词“一杆大秤”，翘舌音 ch + 后鼻音 eng 第四声' },
        { id: 'p2_08', char: '润', context: '红【润】', answer: 'rùn', options: ['rùn', 'lùn', 'yùn', 'ruèn'], tip: '《妈妈睡了》生字，翘舌音 r + un 第四声' },
        { id: 'p2_09', char: '秀', context: '山清水【秀】', answer: 'xiù', options: ['xiù', 'xuì', 'xìu', 'siù'], tip: '韵母 iu 标调标在后面 u 上（并列标在后）' },
        { id: 'p2_10', char: '省', context: '台湾【省】', answer: 'shěng', options: ['shěng', 'sěng', 'shěn', 'xǐng'], tip: '《日月潭》生字，翘舌音 sh + 后鼻韵母 eng' },
        { id: 'p2_11', char: '穷', context: '欲【穷】千里目', answer: 'qióng', options: ['qióng', 'qóng', 'qión', 'jóng'], tip: '三拼音节 q-i-óng，不要漏掉介母 i' },
        { id: 'p2_12', char: '层', context: '更上一【层】楼', answer: 'céng', options: ['céng', 'chéng', 'cén', 'zéng'], tip: '注意是平舌音 c + 后鼻音 eng 第二声' },
        { id: 'p2_13', char: '瀑', context: '望庐山【瀑】布', answer: 'pù', options: ['pù', 'bào', 'bù', 'pò'], tip: '从高山飞流而下的大水帘，声母是双唇送气音 p，第四声' },
        { id: 'p2_14', char: '趁', context: '【趁】早', answer: 'chèn', options: ['chèn', 'cèn', 'chèng', 'chēn'], tip: '《寒号鸟》“趁天晴”，翘舌音 ch + 前鼻韵母 en' },
        { id: 'p2_15', char: '艘', context: '一【艘】军舰', answer: 'sōu', options: ['sōu', 'shōu', 'sǒu', 'zōu'], tip: '《场景歌》量词，平舌音 s，第一声' },
        { id: 'p2_16', char: '翠', context: '一丛【翠】竹', answer: 'cuì', options: ['cuì', 'chuì', 'cuī', 'quì'], tip: '平舌音 c + ui，标调在后面 i 上' }
    ]
};

// ==================== 4. 🔀 多音字语境小侦探 ====================
export const CN_POLYPHONE_BANK = {
    grade1_1: [
        { id: 'm1_01', sentence: '小松鼠【长】着一条蓬松的大尾巴。', target: '长', answer: 'zhǎng', options: ['zhǎng', 'cháng'], tip: '表示生长、长出时读第三声；表示长度时才读第二声' },
        { id: 'm1_02', sentence: '猴子的尾巴【长】，兔子的尾巴短。', target: '长', answer: 'cháng', options: ['cháng', 'zhǎng'], tip: '与“短”相对、形容长度时读第二声' },
        { id: 'm1_03', sentence: '晴朗的夜空里，闪闪的星星【数】不清。', target: '数', answer: 'shǔ', options: ['shǔ', 'shù'], tip: '表示一个一个查点动作时读第三声' },
        { id: 'm1_04', sentence: '我们每天都在游乐园里开心地学【数】学！', target: '数', answer: 'shù', options: ['shù', 'shǔ'], tip: '在“数学、数字”名词里读第四声' },
        { id: 'm1_05', sentence: '青蛙在温暖的洞里甜甜地睡【着】啦。', target: '着', answer: 'zháo', options: ['zháo', 'zhe'], tip: '表示入睡、接触到结果时读第二声' },
        { id: 'm1_06', sentence: '窗外正下【着】沙沙的春雨。', target: '着', answer: 'zhe', options: ['zhe', 'zháo'], tip: '表示动作正在持续进行时读轻声' },
        { id: 'm1_07', sentence: '春天来了，大【地】长出了嫩绿的小草。', target: '地', answer: 'dì', options: ['dì', 'de'], tip: '指土地、地球名词时读第四声' },
        { id: 'm1_08', sentence: '小兔子欢快【地】在草地上蹦蹦跳跳。', target: '地', answer: 'de', options: ['de', 'dì'], tip: '用在动词前面修饰动作（怎样地跳）时读轻声' },
        { id: 'm1_09', sentence: '一头黄牛一【只】猫，一群鸭子一只鸟。', target: '只', answer: 'zhī', options: ['zhī', 'zhǐ'], tip: '作动物量词时读第一声' },
        { id: 'm1_10', sentence: '我在小小的船里坐，【只】看见闪闪的星星蓝蓝的天。', target: '只', answer: 'zhǐ', options: ['zhǐ', 'zhī'], tip: '表示“仅仅、只有”时读第三声' },
        { id: 'm1_11', sentence: '我们都是阳光向上的好【少】年！', target: '少', answer: 'shào', options: ['shào', 'shǎo'], tip: '指年纪轻（少年、少先队）时读第四声' },
        { id: 'm1_12', sentence: '音乐课上，同学们快【乐】地唱起了歌。', target: '乐', answer: 'lè', options: ['lè', 'yuè'], tip: '表示欢喜高兴时声母是边音 l；表示歌曲演奏时声母是 y' }
    ],
    grade2_1: [
        { id: 'm2_01', sentence: '很久很久以前，洪水淹【没】了农田和村庄。', target: '没', answer: 'mò', options: ['mò', 'méi'], tip: '表示漫过、沉下水底（淹没、出没）时读第四声' },
        { id: 'm2_02', sentence: '今天万里无云，天上一丝乌云也【没】有。', target: '没', answer: 'méi', options: ['méi', 'mò'], tip: '表示“没有”否定时读第二声' },
        { id: 'm2_03', sentence: '孩子如果已经长大，就得告别妈妈，四海【为】家。', target: '为', answer: 'wéi', options: ['wéi', 'wèi'], tip: '表示“当作、成为”时读第二声' },
        { id: 'm2_04', sentence: '【为】什么蒲公英的种子要靠风婆婆帮忙传播呢？', target: '为', answer: 'wèi', options: ['wèi', 'wéi'], tip: '表示原因或目的（因为、为什么）时读第四声' },
        { id: 'm2_05', sentence: '小鹰要想学会飞翔，就【得】鼓起勇气展翅锻炼。', target: '得', answer: 'děi', options: ['děi', 'dé', 'de'], tip: '表示“必须、需要”时读第三声' },
        { id: 'm2_06', sentence: '粗心的小朋友却【得】不到大自然里的知识。', target: '得', answer: 'dé', options: ['dé', 'děi', 'de'], tip: '表示“得到、获得”时读第二声' },
        { id: 'm2_07', sentence: '寒冬腊月，北风狂吼，寒【号】鸟冻得直打哆嗦。', target: '号', answer: 'háo', options: ['háo', 'hào'], tip: '表示拖长声音大哭大叫（哀号、寒号鸟）时读第二声' },
        { id: 'm2_08', sentence: '一队“红领巾”，一片欢笑，一把铜【号】多嘹亮！', target: '号', answer: 'hào', options: ['hào', 'háo'], tip: '指军号、铜号或号码时读第四声' },
        { id: 'm2_09', sentence: '收下来的葡萄挂在阴房里，利用热空气蒸发水分制成葡萄【干】。', target: '干', answer: 'gān', options: ['gān', 'gàn'], tip: '表示没有水分、干燥时读第一声' },
        { id: 'm2_10', sentence: '大扫除开始啦，同学们热火朝天地【干】起活来！', target: '干', answer: 'gàn', options: ['gàn', 'gān'], tip: '表示做事情、劳动或树干时读第四声' },
        { id: 'm2_11', sentence: '热情【好】客的维吾尔族老乡准会摘下最甜的葡萄让你吃个够。', target: '好', answer: 'hào', options: ['hào', 'hǎo'], tip: '表示“喜爱”（好客、好奇、好学）时读第四声' },
        { id: 'm2_12', sentence: '植物妈妈手把手【教】小宝贝们认识大自然的奥秘。', target: '教', answer: 'jiāo', options: ['jiāo', 'jiào'], tip: '把知识技能传授给别人（教书、教唱歌）读第一声' },
        { id: 'm2_13', sentence: '明亮整洁的【教】室里摆满了漂亮的图书。', target: '教', answer: 'jiào', options: ['jiào', 'jiāo'], tip: '在“教室、教师、教育”词语里读第四声' },
        { id: 'm2_14', sentence: '这头高大的大象到底有多【重】呢？', target: '重', answer: 'zhòng', options: ['zhòng', 'chóng'], tip: '表示分量大、重量时读第四声' },
        { id: 'm2_15', sentence: '这道题做错了没关系，擦掉【重】新算一遍就能学会！', target: '重', answer: 'chóng', options: ['chóng', 'zhòng'], tip: '表示“再一次、重复”时读第二声' },
        { id: 'm2_16', sentence: '百兽被狐狸骗了，结果全都上了狐狸的【当】！', target: '当', answer: 'dàng', options: ['dàng', 'dāng'], tip: '在“上当、恰当、当作”里读第四声' }
    ]
};

// ==================== 5. 🔍 形近字 & 同音字火眼金睛 ====================
export const CN_CONFUSABLE_BANK = {
    grade1_1: [
        { id: 'c1_01', sentence: '进门叫（  ），出门叫出。', answer: '入', options: ['入', '人', '八'], tip: '捺画起笔略高盖住撇，与“出”意思相反' },
        { id: 'c1_02', sentence: '清早红（  ）从东方冉冉升起。', answer: '日', options: ['日', '目', '田'], tip: '框里只有一横代表太阳；两横的是眼睛' },
        { id: 'c1_03', sentence: '做完作业向窗外远眺，能好好爱护双（  ）。', answer: '目', options: ['目', '日', '自'], tip: '里面有两小横，代表我们的眼睛' },
        { id: 'c1_04', sentence: '我的书包里整齐地放着语文作业（  ）。', answer: '本', options: ['本', '木', '禾'], tip: '“木”字底下加一短横，用来写字的册子' },
        { id: 'c1_05', sentence: '春雨沙沙下，水田里的（  ）苗绿油油。', answer: '禾', options: ['禾', '木', '本'], tip: '“木”字头顶多一平撇，指庄稼幼苗' },
        { id: 'c1_06', sentence: '拔河比赛时，大家齐心协力使出了全（  ）气！', answer: '力', options: ['力', '刀', '立'], tip: '撇画穿出横折钩上方，表示劲头大小' },
        { id: 'c1_07', sentence: '使用手工剪（  ）时一定要注意安全哦。', answer: '刀', options: ['刀', '力', '几'], tip: '撇画不出头，用来切剪纸张的工具' },
        { id: 'c1_08', sentence: '中（  ）十二点，食堂飘来阵阵饭菜香。', answer: '午', options: ['午', '牛', '干'], tip: '竖画不出最上面的横头，指白天十二点前后' },
        { id: 'c1_09', sentence: '青青草地上有一头勤劳的大黄（  ）。', answer: '牛', options: ['牛', '午', '生'], tip: '竖画向上出头，头上有弯角的大动物' },
        { id: 'c1_10', sentence: '过马路要遵守交通规则，靠（  ）边行走。', answer: '右', options: ['右', '石', '左'], tip: '下面是个“口”字，与“左（工）”相对' },
        { id: 'c1_11', sentence: '清澈的小溪底铺满了圆圆的鹅卵（  ）。', answer: '石', options: ['石', '右', '后'], tip: '第一笔平横，撇从横中间起笔不出头，坚硬的岩块' },
        { id: 'c1_12', sentence: '下雨天出门，记得撑起一（  ）小花伞。', answer: '把', options: ['把', '巴', '爸'], tip: '左边有提手旁（扌），用手握住雨伞柄' },
        { id: 'c1_13', sentence: '孔雀的尾（  ）像一把五彩大扇子，最好看！', answer: '巴', options: ['巴', '把', '爸'], tip: '独体字不带提手旁，跟在“尾”后面读轻声' },
        { id: 'c1_14', sentence: '寒冷的（  ）天到了，树枝披上了白雪衣。', answer: '冬', options: ['冬', '东', '车'], tip: '折文下面有两点像冰凌，指一年四季的第四季' }
    ],
    grade2_1: [
        { id: 'c2_01', sentence: '秋天的果（  ）里挂满了红彤彤的大苹果。', answer: '园', options: ['园', '圆', '元'], tip: '里面是“元”，指种植花木蔬果的地方' },
        { id: 'c2_02', sentence: '中秋节的月亮像大玉盘一样又大又（  ）！', answer: '圆', options: ['圆', '园', '员'], tip: '里面是“员”，形容形状饱满不缺角' },
        { id: 'c2_03', sentence: '上课铃响了，同学们安静有序地走（  ）教室。', answer: '进', options: ['进', '近', '尽'], tip: '走之底里面是“井”，表示从外往里走' },
        { id: 'c2_04', sentence: '清风明月本无价，（  ）水远山皆有情。', answer: '近', options: ['近', '进', '斤'], tip: '走之底里面是“斤”，与“远”意思相反' },
        { id: 'c2_05', sentence: '少先队员胸前骄傲地（  ）着鲜艳的红领巾。', answer: '戴', options: ['戴', '带', '代'], tip: '把帽子、眼镜、红领巾穿挂在头颈胸前用复杂的这个字' },
        { id: 'c2_06', sentence: '去郊游前，妈妈帮我在背包里（  ）好了水壶和纸巾。', answer: '带', options: ['带', '戴', '代'], tip: '随身携拿物品或领路时用上面一横加草字头的这个字' },
        { id: 'c2_07', sentence: '小蝌蚪（  ）经长成披着绿衣裳的青蛙啦！', answer: '已', options: ['已', '以', '己'], tip: '竖弯钩上方半封口，表示事情完成了' },
        { id: 'c2_08', sentence: '只要肯动脑筋，坏事有时候也可（  ）变成好事。', answer: '以', options: ['以', '已', '似'], tip: '左边竖提加点，右边是个“人”字' },
        { id: 'c2_09', sentence: '放学离开校门时，我们礼貌地向老师说“（  ）见”。', answer: '再', options: ['再', '在'], tip: '表示“又一次、第二次”见面时用一横起笔的这个字' },
        { id: 'c2_10', sentence: '睡梦中的妈妈真美丽，温柔的微笑挂（  ）嘴角。', answer: '在', options: ['在', '再'], tip: '里面有个“土”，表示处于某个地方' },
        { id: 'c2_11', sentence: '雨过天（  ），太阳公公露出了灿烂的笑脸。', answer: '晴', options: ['晴', '睛', '情', '请'], tip: '与太阳天气有关，左边是日字旁' },
        { id: 'c2_12', sentence: '小白兔长着长耳朵和红宝石一样的眼（  ）。', answer: '睛', options: ['睛', '晴', '情', '请'], tip: '与视觉器官有关，左边是目字旁' },
        { id: 'c2_13', sentence: '遇到不懂的问题向同学（  ）教，要用礼貌用语。', answer: '请', options: ['请', '情', '晴', '睛'], tip: '说话有礼貌，左边是言字旁（讠）' },
        { id: 'c2_14', sentence: '秋天到了，火红的枫叶和金黄的梧（  ）叶真美呀！', answer: '桐', options: ['桐', '铜', '洞'], tip: '是一种高大的树木，左边是木字旁' },
        { id: 'c2_15', sentence: '队旗飘飘，少先队员吹响了闪亮的（  ）号。', answer: '铜', options: ['铜', '桐', '同'], tip: '用金属铸造的乐器，左边是金字旁（钅）' },
        { id: 'c2_16', sentence: '每天晚上我都会认真完成当天的语文（  ）业。', answer: '作', options: ['作', '做', '坐'], tip: '固定名词搭配，左边单人旁，右边是个“乍”字' }
    ]
};

// ==================== 6. ⚖️ 量词搭配 & 近反义词气泡对对碰 ====================
export const CN_PAIR_POOLS = {
    grade1_1: [
        {
            id: 'pair1_measure_a',
            subLabel: '《大小多少》动物果蔬量词配对',
            pairs: [
                { left: '一头', right: '🐮 黄牛' },
                { left: '一只', right: '🐱 花猫' },
                { left: '一群', right: '🦆 鸭子' },
                { left: '一颗', right: '枣子/星星' },
                { left: '一堆', right: '🍑 杏子' },
                { left: '一个', right: '🍎 大苹果' }
            ]
        },
        {
            id: 'pair1_measure_b',
            subLabel: '一上日常事物量词配对',
            pairs: [
                { left: '一把', right: '☂️ 小雨伞' },
                { left: '一条', right: '🐟 小金鱼' },
                { left: '一朵', right: '☁️ 白云' },
                { left: '一本', right: '📖 故事书' },
                { left: '一座', right: '⛰️ 大青山' },
                { left: '一双', right: '👐 小巧手' }
            ]
        },
        {
            id: 'pair1_antonym_a',
            subLabel: '一上《对韵歌》与经典反义词对对碰',
            pairs: [
                { left: '大（反义）', right: '小' },
                { left: '多（反义）', right: '少' },
                { left: '上（反义）', right: '下' },
                { left: '左（反义）', right: '右' },
                { left: '东（反义）', right: '西' },
                { left: '南（反义）', right: '北' }
            ]
        },
        {
            id: 'pair1_antonym_b',
            subLabel: '一上高频单字反义词消消乐',
            pairs: [
                { left: '开（反义）', right: '关' },
                { left: '正（反义）', right: '反' },
                { left: '来（反义）', right: '去' },
                { left: '远（反义）', right: '近' },
                { left: '有（反义）', right: '无' },
                { left: '前（反义）', right: '后' }
            ]
        }
    ],
    grade2_1: [
        {
            id: 'pair2_scene_a',
            subLabel: '《场景歌》海滩与田园量词配对',
            pairs: [
                { left: '一艘', right: '🚢 军舰' },
                { left: '一条', right: '⛵ 帆船' },
                { left: '一方', right: '🐟 鱼塘' },
                { left: '一块', right: '🌾 稻田' },
                { left: '一行', right: '🌿 垂柳' },
                { left: '一座', right: '🌸 花园' }
            ]
        },
        {
            id: 'pair2_scene_b',
            subLabel: '《场景歌》山溪与少先队量词配对',
            pairs: [
                { left: '一道', right: '💧 小溪' },
                { left: '一孔', right: '🌉 石桥' },
                { left: '一丛', right: '🎋 翠竹' },
                { left: '一群', right: '🕊️ 飞鸟' },
                { left: '一面', right: '🚩 队旗' },
                { left: '一把', right: '🎺 铜号' }
            ]
        },
        {
            id: 'pair2_antonym',
            subLabel: '二上重点双音节反义词配对',
            pairs: [
                { left: '仔细（反义）', right: '马虎' },
                { left: '温暖（反义）', right: '寒冷' },
                { left: '勤劳（反义）', right: '懒惰' },
                { left: '温和（反义）', right: '暴躁' },
                { left: '安全（反义）', right: '危险' },
                { left: '热闹（反义）', right: '冷清' }
            ]
        },
        {
            id: 'pair2_synonym',
            subLabel: '二上重点近义词好朋友配对',
            pairs: [
                { left: '著名（近义）', right: '有名' },
                { left: '美丽（近义）', right: '漂亮' },
                { left: '中央（近义）', right: '中心' },
                { left: '特别（近义）', right: '非常' },
                { left: '连忙（近义）', right: '急忙' },
                { left: '欢乐（近义）', right: '快乐' }
            ]
        }
    ]
};

// ==================== 7. 🚂 连词成句与标点小卫士 ====================
export const CN_SENTENCE_ORDER_BANK = {
    grade1_1: [
        { id: 'o1_01', segments: ['弯弯的', '月儿', '像', '小小的船', '。'], hint: '《小小的船》经典比喻句' },
        { id: 'o1_02', segments: ['蓝天', '是', '白云的', '家', '。'], hint: '《家》课文句式：什么是什么的家' },
        { id: 'o1_03', segments: ['松鼠的', '尾巴', '好像', '一把伞', '。'], hint: '《比尾巴》比喻句' },
        { id: 'o1_04', segments: ['谁的', '尾巴', '最好看', '？'], hint: '疑问句末尾要放问号哦' },
        { id: 'o1_05', segments: ['五星红旗', '徐徐', '升起来啦', '！'], hint: '感叹句末尾放感叹号' },
        { id: 'o1_06', segments: ['小鸭子', '在河里', '快乐地', '游水', '。'], hint: '谁 + 在哪里 + 做什么' },
        { id: 'o1_07', segments: ['雨点儿', '从', '云彩里', '飘落下来', '。'], hint: '《雨点儿》课文原句' },
        { id: 'o1_08', segments: ['青蛙', '在洞里', '甜甜地', '睡着啦', '。'], hint: '《雪地里的小画家》冬眠的小青蛙' },
        { id: 'o1_09', segments: ['树叶', '一片片', '从树上', '落下来', '。'], hint: '《秋天》描写落叶飘舞' },
        { id: 'o1_10', segments: ['一群大雁', '往南飞', '。'], hint: '《秋天》大雁南飞句' }
    ],
    grade2_1: [
        { id: 'o2_01', segments: ['官员们', '一边看', '一边议论', '。'], hint: '《曹冲称象》“一边……一边……”句式' },
        { id: 'o2_02', segments: ['梧桐树叶', '像', '金色的小手掌', '。'], hint: '《树之歌》生动比喻句' },
        { id: 'o2_03', segments: ['日月潭', '是我国', '台湾省', '最大的一个湖', '。'], hint: '《日月潭》第一自然段重点句' },
        { id: 'o2_04', segments: ['蒲公英妈妈', '准备了', '降落伞', '。'], hint: '《植物妈妈有办法》课文句' },
        { id: 'o2_05', segments: ['葡萄沟', '真是个', '好地方', '！'], hint: '《葡萄沟》总结赞叹句，句末用感叹号' },
        { id: 'o2_06', segments: ['叶子上的虫', '还用治', '？'], hint: '《我要的是葫芦》反问句，句末用问号' },
        { id: 'o2_07', segments: ['天不过', '井口那么大', '，还用飞', '那么远吗', '？'], hint: '《坐井观天》青蛙说的反问句' },
        { id: 'o2_08', segments: ['喜鹊', '住在', '温暖的', '窝里', '。'], hint: '《寒号鸟》勤劳喜鹊的温暖小窝' },
        { id: 'o2_09', segments: ['大禹', '带领百姓', '治好了', '洪水', '。'], hint: '《大禹治水》核心句' },
        { id: 'o2_10', segments: ['松鼠', '把一只纸船', '放到了', '小溪里', '。'], hint: '《纸船和风筝》把字句' },
        { id: 'o2_11', segments: ['小蝌蚪', '游哇游', '，长出了', '两条后腿', '。'], hint: '《小蝌蚪找妈妈》成长变化句' },
        { id: 'o2_12', segments: ['黄山的奇石', '真是', '有趣极了', '！'], hint: '《黄山奇石》感叹句' }
    ]
};

// ==================== 8. 🏮 古诗上下句接龙 / 名句配对 ====================
export const CN_POEM_MATCH_BANK = {
    grade1_1: [
        { id: 'pm1_01', title: '《咏鹅》唐·骆宾王', promptLabel: '请选出下一句：', promptLine: '鹅，鹅，鹅，曲项向天歌。', answer: '白毛浮绿水，红掌拨清波。', distractors: ['春去花还在，人来鸟不惊。', '举头望明月，低头思故乡。'], fullRead: '咏鹅，唐，骆宾王。鹅，鹅，鹅，曲项向天歌。白毛浮绿水，红掌拨清波。' },
        { id: 'pm1_02', title: '《画》古诗', promptLabel: '请选出下一句：', promptLine: '远看山有色，近听水无声。', answer: '春去花还在，人来鸟不惊。', distractors: ['白毛浮绿水，红掌拨清波。', '过江千尺浪，入竹万竿斜。'], fullRead: '远看山有色，近听水无声。春去花还在，人来鸟不惊。' },
        { id: 'pm1_03', title: '《悯农》唐·李绅', promptLabel: '请选出下一句：', promptLine: '锄禾日当午，汗滴禾下土。', answer: '谁知盘中餐，粒粒皆辛苦。', distractors: ['又疑瑶台镜，飞在青云端。', '解落三秋叶，能开二月花。'], fullRead: '锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。' },
        { id: 'pm1_04', title: '《古朗月行》唐·李白', promptLabel: '请选出下一句：', promptLine: '小时不识月，呼作白玉盘。', answer: '又疑瑶台镜，飞在青云端。', distractors: ['谁知盘中餐，粒粒皆辛苦。', '莲叶何田田，鱼戏莲叶间。'], fullRead: '小时不识月，呼作白玉盘。又疑瑶台镜，飞在青云端。' },
        { id: 'pm1_05', title: '《风》唐·李峤', promptLabel: '请选出下一句：', promptLine: '解落三秋叶，能开二月花。', answer: '过江千尺浪，入竹万竿斜。', distractors: ['春去花还在，人来鸟不惊。', '天地分上下，日月照今古。'], fullRead: '解落三秋叶，能开二月花。过江千尺浪，入竹万竿斜。' },
        { id: 'pm1_06', title: '《江南》汉乐府', promptLabel: '请选出下一句：', promptLine: '江南可采莲，', answer: '莲叶何田田。', distractors: ['红掌拨清波。', '呼作白玉盘。'], fullRead: '江南可采莲，莲叶何田田。鱼戏莲叶间。' },
        { id: 'pm1_07', title: '一上·日积月累成语俗语', promptLabel: '请选出配对下半句：', promptLine: '种瓜得瓜，', answer: '种豆得豆。', distractors: ['始于足下。', '更进一步。'], fullRead: '种瓜得瓜，种豆得豆。' },
        { id: 'pm1_08', title: '一上·日积月累名言', promptLabel: '请选出配对下半句：', promptLine: '千里之行，', answer: '始于足下。', distractors: ['后人乘凉。', '寸金难买寸光阴。'], fullRead: '千里之行，始于足下。' },
        { id: 'pm1_09', title: '一上·日积月累俗语', promptLabel: '请选出配对下半句：', promptLine: '前人栽树，', answer: '后人乘凉。', distractors: ['种豆得豆。', '更进一步。'], fullRead: '前人栽树，后人乘凉。' },
        { id: 'pm1_10', title: '一上·日积月累名言', promptLabel: '请选出配对下半句：', promptLine: '百尺竿头，', answer: '更进一步。', distractors: ['始于足下。', '人来鸟不惊。'], fullRead: '百尺竿头，更进一步。' }
    ],
    grade2_1: [
        { id: 'pm2_01', title: '《梅花》宋·王安石', promptLabel: '请选出后两句：', promptLine: '墙角数枝梅，凌寒独自开。', answer: '遥知不是雪，为有暗香来。', distractors: ['欲穷千里目，更上一层楼。', '孤舟蓑笠翁，独钓寒江雪。'], fullRead: '墙角数枝梅，凌寒独自开。遥知不是雪，为有暗香来。' },
        { id: 'pm2_02', title: '《小儿垂钓》唐·胡令能', promptLabel: '请选出后两句：', promptLine: '蓬头稚子学垂纶，侧坐莓苔草映身。', answer: '路人借问遥招手，怕得鱼惊不应人。', distractors: ['飞流直下三千尺，疑是银河落九天。', '不敢高声语，恐惊天上人。'], fullRead: '蓬头稚子学垂纶，侧坐莓苔草映身。路人借问遥招手，怕得鱼惊不应人。' },
        { id: 'pm2_03', title: '《登鹳雀楼》唐·王之涣', promptLabel: '请选出后两句：', promptLine: '白日依山尽，黄河入海流。', answer: '欲穷千里目，更上一层楼。', distractors: ['遥知不是雪，为有暗香来。', '危楼高百尺，手可摘星辰。'], fullRead: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。' },
        { id: 'pm2_04', title: '《望庐山瀑布》唐·李白', promptLabel: '请选出后两句：', promptLine: '日照香炉生紫烟，遥看瀑布挂前川。', answer: '飞流直下三千尺，疑是银河落九天。', distractors: ['天苍苍，野茫茫，风吹草低见牛羊。', '欲穷千里目，更上一层楼。'], fullRead: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。' },
        { id: 'pm2_05', title: '《江雪》唐·柳宗元', promptLabel: '请选出后两句：', promptLine: '千山鸟飞绝，万径人踪灭。', answer: '孤舟蓑笠翁，独钓寒江雪。', distractors: ['不敢高声语，恐惊天上人。', '墙角数枝梅，凌寒独自开。'], fullRead: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。' },
        { id: 'pm2_06', title: '《夜宿山寺》唐·李白', promptLabel: '请选出后两句：', promptLine: '危楼高百尺，手可摘星辰。', answer: '不敢高声语，恐惊天上人。', distractors: ['孤舟蓑笠翁，独钓寒江雪。', '路人借问遥招手，怕得鱼惊不应人。'], fullRead: '危楼高百尺，手可摘星辰。不敢高声语，恐惊天上人。' },
        { id: 'pm2_07', title: '《敕勒歌》北朝民歌', promptLabel: '请选出下一句：', promptLine: '天苍苍，野茫茫，', answer: '风吹草低见牛羊。', distractors: ['疑是银河落九天。', '树无根不长。'], fullRead: '天苍苍，野茫茫，风吹草低见牛羊。' },
        { id: 'pm2_08', title: '二上·日积月累风景楹联', promptLabel: '请选出配对下联：', promptLine: '有山皆图画，', answer: '无水不文章。', distractors: ['杏花烟雨江南。', '近水远山皆有情。'], fullRead: '有山皆图画，无水不文章。' },
        { id: 'pm2_09', title: '二上·日积月累名胜对联', promptLabel: '请选出配对下联：', promptLine: '白马西风塞上，', answer: '杏花烟雨江南。', distractors: ['无水不文章。', '不能成方圆。'], fullRead: '白马西风塞上，杏花烟雨江南。' },
        { id: 'pm2_10', title: '二上·日积月累沧浪亭联', promptLabel: '请选出配对下联：', promptLine: '清风明月本无价，', answer: '近水远山皆有情。', distractors: ['为有暗香来。', '叶落归根。'], fullRead: '清风明月本无价，近水远山皆有情。' },
        { id: 'pm2_11', title: '二上·日积月累立志名言', promptLabel: '请选出配对下半句：', promptLine: '树无根不长，', answer: '人无志不立。', distractors: ['言而有信。', '勿施于人。'], fullRead: '树无根不长，人无志不立。' },
        { id: 'pm2_12', title: '二上·日积月累诚信名言', promptLabel: '请选出配对下半句：', promptLine: '己所不欲，', answer: '勿施于人。', distractors: ['不能成方圆。', '人无志不立。'], fullRead: '己所不欲，勿施于人。' }
    ]
};
