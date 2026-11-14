/**
 * shared/englishEngine.js - 全平台共享少儿英语【魔法背单词(学·练·拼闭环)】与【8大互动题型闪电闯关】引擎
 * 同时服务于：游戏大厅(/)、奇妙萌宠店长(/pet/)、保卫兔子与青蛙(/carrot/)、植物大战僵尸(/pvz/)
 * 升级特性：
 * 1. 扩充新课标少儿英语 20 大主题词库（共 360 个零重复核心分级单词，含自然拼读拆解、音标、中英例句）；
 * 2. 洗牌袋防重复抽词算法（Fisher-Yates 不放回洗牌袋 + 40词近期滑窗防重 + 错词10题冷却），彻底告别单词频繁重复；
 * 3. 8 大趣味英语互动题型，支持家长自定义勾选启用题型、统一大随机或单项目直达练习！
 */

import {
    COURSE_LESSONS,
    COURSE_SUB_MODES,
    ALL_COURSE_SUB_IDS,
    ALL_COURSE_WORDS,
    courseSessionManager,
    resolveCourseLessons,
    getPrimaryCourseLesson
} from './courseLessons.js';

export {
    COURSE_LESSONS,
    COURSE_SUB_MODES,
    ALL_COURSE_SUB_IDS,
    ALL_COURSE_WORDS,
    courseSessionManager,
    resolveCourseLessons,
    getPrimaryCourseLesson
};

export const ENGLISH_QUESTION_TYPES = [
    { id: 'course_special', name: '🎓 校外英语课专项', shortName: '🎓 英语课', icon: '🎓', diffTag: '同步课', diffLevel: 'course', desc: '同步校外英语课作业（轻松档纯英文认读选词，选后揭晓词义）' },
    { id: 'listen_pic',     name: '🎧 听音选图',     shortName: '🎧 听音', icon: '🎧', diffTag: '超简单', diffLevel: 'easy',   desc: '听纯正美式发音，选出对应图案（音→义）' },
    { id: 'match_word',     name: '🃏 看图选词',     shortName: '🃏 选词', icon: '🃏', diffTag: '简单',   diffLevel: 'easy',   desc: '看图案回想纯英文单词，选后再听音核对（义→形）' },
    { id: 'word_meaning',   name: '👀 看词识义',     shortName: '👀 识义', icon: '👀', diffTag: '超简单', diffLevel: 'easy',   desc: '只看纯英文单词，回想选出正确图案词义（形→义真记忆）' },
    { id: 'bubble_pair',    name: '🫧 单词消消乐',   shortName: '🫧 配对', icon: '🫧', diffTag: '简单',   diffLevel: 'easy',   desc: '中英图文泡泡配对消除（轻松档2组4泡泡）' },
    { id: 'phonics_chunks', name: '🔤 自然拼读积木', shortName: '🔤 拼读', icon: '🔤', diffTag: '好上手', diffLevel: 'easy',   desc: '听发音独立点选音节积木，卡壳可点拼读提示' },
    { id: 'cloze_sentence', name: '💬 情景句填空',   shortName: '💬 填空', icon: '💬', diffTag: '适中',   diffLevel: 'medium', desc: '纯英文选项补全句子空白，作答后揭晓词义与朗读' },
    { id: 'riddle_qa',      name: '🕵️ 英语小谜语',   shortName: '🕵️ 谜语', icon: '🕵️', diffTag: '适中',   diffLevel: 'medium', desc: '读线索从纯英文词中猜出答案，选后揭晓词义' },
    { id: 'word_order',     name: '🚂 连词成句火车', shortName: '🚂 连句', icon: '🚂', diffTag: '偏难',   diffLevel: 'hard',   desc: '点击打乱的词块，按正确语序连成句子' },
    { id: 'spell_word',     name: '🧩 果冻字母拼写', shortName: '🧩 拼写', icon: '🧩', diffTag: '偏难',   diffLevel: 'hard',   desc: '点击字母果冻块，把空缺字母补齐（轻松档仅空1字母）' }
];

export const ALL_ENGLISH_TYPE_IDS = ENGLISH_QUESTION_TYPES.map(t => t.id);

// 默认给低龄小朋友启用的轻松随机题型（音·形·义三向认读 + 消消乐 + 自然拼读 + 校外课，默认排除偏难题型）
export const DEFAULT_EASY_ENGLISH_TYPES = [
    'course_special',
    'listen_pic',
    'match_word',
    'word_meaning',
    'bubble_pair',
    'phonics_chunks'
];

export const ENGLISH_DIFFICULTY_MODES = [
    {
        id: 'easy',
        name: '🌱 轻松启蒙',
        shortName: '🌱轻松',
        desc: '仅抽短词(L1)·3选1·音形义双向认读·2组消消乐·拼写仅空1字母',
        recommendedTypes: [...DEFAULT_EASY_ENGLISH_TYPES],
        courseAllowHardDictation: false
    },
    {
        id: 'medium',
        name: '⭐ 标准进阶',
        shortName: '⭐标准',
        desc: '常用词(L1+L2)·4选1·3组消消乐·拼写空1~2字母',
        recommendedTypes: ['course_special', 'listen_pic', 'match_word', 'word_meaning', 'bubble_pair', 'cloze_sentence', 'phonics_chunks', 'riddle_qa'],
        courseAllowHardDictation: false
    },
    {
        id: 'all',
        name: '🔥 挑战读写',
        shortName: '🔥挑战',
        desc: '全360词·全字母拼写·连词成句·校外课全词默写',
        recommendedTypes: [...ALL_ENGLISH_TYPE_IDS],
        courseAllowHardDictation: true
    }
];

export const ENGLISH_LEVELS = {
    level1_listen: { id: 'level1_listen', name: '🌱 轻松启蒙包', wordDifficulty: 'easy',   presetTypes: [...DEFAULT_EASY_ENGLISH_TYPES] },
    level2_match:  { id: 'level2_match',  name: '⚡ 标准认读包', wordDifficulty: 'medium', presetTypes: ['course_special', 'listen_pic', 'match_word', 'word_meaning', 'bubble_pair', 'cloze_sentence', 'phonics_chunks'] },
    level3_spell:  { id: 'level3_spell',  name: '🔥 读写挑战包', wordDifficulty: 'all',    presetTypes: ['course_special', 'word_meaning', 'cloze_sentence', 'phonics_chunks', 'riddle_qa', 'word_order', 'spell_word'] },
    mixed:         { id: 'mixed',         name: '🌈 全能10题型混合', wordDifficulty: 'all', presetTypes: [...ALL_ENGLISH_TYPE_IDS] }
};

export const WORD_PACKS = [
    {
        id: 'pack_animals',
        name: '萌宠好伙伴',
        enCategory: 'Cute Animals',
        icon: '🐾',
        words: [
            { id: 'w_rabbit', word: 'rabbit', phonics: 'r-a-bb-i-t', ipa: '/ˈræbɪt/', zh: '兔子', icon: '🐰', level: 1, sentence: 'The cute rabbit holds a gift!', sentenceZh: '可爱的兔子捧着礼物！', riddle: 'I have two long ears and love crunchy carrots. Who am I?' },
            { id: 'w_frog', word: 'frog', phonics: 'fr-o-g', ipa: '/frɒɡ/', zh: '青蛙', icon: '🐸', level: 1, sentence: 'A happy green frog sits on a leaf.', sentenceZh: '快乐的小青蛙坐在荷叶上。', riddle: 'I am green, I say ribbit, and I jump on lotus leaves!' },
            { id: 'w_tiger', word: 'tiger', phonics: 't-i-g-er', ipa: '/ˈtaɪɡər/', zh: '老虎', icon: '🐯', level: 1, sentence: 'The baby tiger is brave!', sentenceZh: '小老虎非常勇敢！', riddle: 'I am a big orange cat with black stripes!' },
            { id: 'w_panda', word: 'panda', phonics: 'p-an-d-a', ipa: '/ˈpændə/', zh: '熊猫', icon: '🐼', level: 1, sentence: 'The panda loves green bamboo.', sentenceZh: '大熊猫喜欢绿竹子。', riddle: 'I wear black and white fur and eat green bamboo!' },
            { id: 'w_dog', word: 'dog', phonics: 'd-o-g', ipa: '/dɒɡ/', zh: '小狗', icon: '🐶', level: 1, sentence: 'My little dog can run fast.', sentenceZh: '我的小狗跑得很快。', riddle: 'I wag my tail, say woof-woof, and guard your home!' },
            { id: 'w_cat', word: 'cat', phonics: 'c-a-t', ipa: '/kæt/', zh: '小猫', icon: '🐱', level: 1, sentence: 'The white cat likes milk.', sentenceZh: '小白猫喜欢喝牛奶。', riddle: 'I say meow, have soft paws, and love catching mice!' },
            { id: 'w_duck', word: 'duck', phonics: 'd-u-ck', ipa: '/dʌk/', zh: '鸭子', icon: '🦆', level: 1, sentence: 'Yellow duck swims in the pond.', sentenceZh: '小黄鸭在池塘里游泳。', riddle: 'I say quack-quack and swim happily in the pond!' },
            { id: 'w_bird', word: 'bird', phonics: 'b-ir-d', ipa: '/bɜːrd/', zh: '小鸟', icon: '🐦', level: 1, sentence: 'The little bird sings a song.', sentenceZh: '小鸟唱着动听的歌。', riddle: 'I have two wings, feathers, and sing in the tree!' },
            { id: 'w_fish', word: 'fish', phonics: 'f-i-sh', ipa: '/fɪʃ/', zh: '鱼儿', icon: '🐟', level: 1, sentence: 'Look at the colorful fish!', sentenceZh: '看那条五颜六色的鱼！', riddle: 'I have no legs, live in water, and swim with fins!' },
            { id: 'w_monkey', word: 'monkey', phonics: 'm-on-key', ipa: '/ˈmʌŋki/', zh: '猴子', icon: '🐵', level: 2, sentence: 'Clever monkey eats a banana.', sentenceZh: '聪明的猴子吃香蕉。', riddle: 'I climb trees fast and love eating yellow bananas!' },
            { id: 'w_sheep', word: 'sheep', phonics: 'sh-ee-p', ipa: '/ʃiːp/', zh: '绵羊', icon: '🐑', level: 2, sentence: 'White sheep eats green grass.', sentenceZh: '白绵羊在吃青草。', riddle: 'I have soft white wool and say baa on the grass!' },
            { id: 'w_horse', word: 'horse', phonics: 'h-or-se', ipa: '/hɔːrs/', zh: '骏马', icon: '🐴', level: 2, sentence: 'The brown horse runs fast.', sentenceZh: '棕色的小马奔跑如飞。', riddle: 'People can ride on my back and I gallop fast!' },
            { id: 'w_bear', word: 'bear', phonics: 'b-ear', ipa: '/beər/', zh: '小熊', icon: '🐻', level: 1, sentence: 'Baby bear loves sweet honey.', sentenceZh: '小熊最爱甜甜的蜂蜜。', riddle: 'I am big and furry, and I love sweet golden honey!' },
            { id: 'w_dragon', word: 'dragon', phonics: 'dr-a-g-on', ipa: '/ˈdræɡən/', zh: '神龙', icon: '🐲', level: 3, sentence: 'A magic dragon flies in the sky.', sentenceZh: '神奇的飞龙在天空翱翔。', riddle: 'I am a legendary creature that flies high in the clouds!' },
            { id: 'w_elephant', word: 'elephant', phonics: 'el-e-ph-ant', ipa: '/ˈelɪfənt/', zh: '大象', icon: '🐘', level: 3, sentence: 'The elephant has a long nose.', sentenceZh: '大象有着长长的鼻子。', riddle: 'I have big ears and a very long nose called a trunk!' },
            { id: 'w_lion', word: 'lion', phonics: 'l-i-on', ipa: '/ˈlaɪən/', zh: '狮子', icon: '🦁', level: 2, sentence: 'The lion is king of the forest.', sentenceZh: '狮子是森林之王。', riddle: 'I have a golden mane and roar loud as king of beasts!' },
            { id: 'w_pig', word: 'pig', phonics: 'p-i-g', ipa: '/pɪɡ/', zh: '小猪', icon: '🐷', level: 1, sentence: 'Pink pig sleeps in the sun.', sentenceZh: '粉色小猪在阳光下睡觉。', riddle: 'I am pink, chubby, and have a cute round snout!' },
            { id: 'w_whale', word: 'whale', phonics: 'wh-a-le', ipa: '/weɪl/', zh: '鲸鱼', icon: '🐳', level: 2, sentence: 'Blue whale swims in the deep sea.', sentenceZh: '蓝鲸在深海里畅游。', riddle: 'I am the biggest animal in the deep blue ocean!' }
        ]
    },
    {
        id: 'pack_fruits',
        name: '超市鲜果屋',
        enCategory: 'Fruits & Veggies',
        icon: '🍎',
        words: [
            { id: 'w_apple', word: 'apple', phonics: 'a-pp-le', ipa: '/ˈæpl/', zh: '苹果', icon: '🍎', level: 1, sentence: 'An apple a day keeps you healthy!', sentenceZh: '每天一苹果，健康伴着我！', riddle: 'I am round, crunchy, red, and sweet to eat!' },
            { id: 'w_banana', word: 'banana', phonics: 'ba-na-na', ipa: '/bəˈnɑːnə/', zh: '香蕉', icon: '🍌', level: 1, sentence: 'This yellow banana is sweet.', sentenceZh: '这根黄香蕉甜甜的。', riddle: 'I am long and yellow. Monkeys love peeling me!' },
            { id: 'w_orange', word: 'orange', phonics: 'or-an-ge', ipa: '/ˈɒrɪndʒ/', zh: '橙子', icon: '🍊', level: 1, sentence: 'Would you like an orange?', sentenceZh: '你想要一个橙子吗？', riddle: 'My name is also a bright color, and I am full of juice!' },
            { id: 'w_grape', word: 'grape', phonics: 'gr-a-pe', ipa: '/ɡreɪp/', zh: '葡萄', icon: '🍇', level: 2, sentence: 'Purple grapes are juicy!', sentenceZh: '紫葡萄汁水真多！', riddle: 'We grow in purple bunches on a green vine!' },
            { id: 'w_pear', word: 'pear', phonics: 'p-ear', ipa: '/peər/', zh: '梨子', icon: '🍐', level: 1, sentence: 'Here is a fresh sweet pear.', sentenceZh: '这是一个新鲜甜梨。' },
            { id: 'w_peach', word: 'peach', phonics: 'p-ea-ch', ipa: '/piːtʃ/', zh: '桃子', icon: '🍑', level: 2, sentence: 'Pink peach smells so good!', sentenceZh: '粉红的桃子闻起来真香！' },
            { id: 'w_lemon', word: 'lemon', phonics: 'l-e-m-on', ipa: '/ˈlemən/', zh: '柠檬', icon: '🍋', level: 2, sentence: 'Yellow lemon is a little sour.', sentenceZh: '黄柠檬有一点点酸哦。', riddle: 'I am bright yellow and taste very sour!' },
            { id: 'w_cherry', word: 'cherry', phonics: 'ch-e-rr-y', ipa: '/ˈtʃeri/', zh: '樱桃', icon: '🍒', level: 2, sentence: 'Red cherry on top of the cake!', sentenceZh: '红樱桃点缀在蛋糕顶上！' },
            { id: 'w_mango', word: 'mango', phonics: 'm-an-go', ipa: '/ˈmæŋɡəʊ/', zh: '芒果', icon: '🥭', level: 2, sentence: 'I love sweet mango juice.', sentenceZh: '我爱喝甜美的芒果汁。' },
            { id: 'w_melon', word: 'melon', phonics: 'm-e-l-on', ipa: '/ˈmelən/', zh: '西瓜/甜瓜', icon: '🍉', level: 2, sentence: 'Cool melon for a sunny day!', sentenceZh: '晴天来块清凉西瓜！', riddle: 'Green outside, red and juicy inside with black seeds!' },
            { id: 'w_carrot', word: 'carrot', phonics: 'c-a-rr-ot', ipa: '/ˈkærət/', zh: '胡萝卜', icon: '🥕', level: 2, sentence: 'Bunny eats a crunchy carrot.', sentenceZh: '小兔子吃脆脆的胡萝卜。', riddle: 'I am an orange vegetable and little bunnies love me!' },
            { id: 'w_corn', word: 'corn', phonics: 'c-or-n', ipa: '/kɔːrn/', zh: '玉米', icon: '🌽', level: 2, sentence: 'Golden sweet corn is yummy.', sentenceZh: '金黄的甜玉米真好吃。' },
            { id: 'w_tomato', word: 'tomato', phonics: 'to-ma-to', ipa: '/təˈmɑːtəʊ/', zh: '西红柿', icon: '🍅', level: 2, sentence: 'Red tomato is round and fresh.', sentenceZh: '红西红柿又圆又新鲜。' },
            { id: 'w_potato', word: 'potato', phonics: 'po-ta-to', ipa: '/pəˈteɪtəʊ/', zh: '土豆', icon: '🥔', level: 2, sentence: 'Little potato grows in the soil.', sentenceZh: '小土豆长在泥土里。' },
            { id: 'w_berry', word: 'berry', phonics: 'b-e-rr-y', ipa: '/ˈberi/', zh: '浆果/莓果', icon: '🫐', level: 2, sentence: 'Sweet blue berries in a bowl.', sentenceZh: '碗里装着甜甜的蓝莓果。' },
            { id: 'w_kiwi', word: 'kiwi', phonics: 'k-i-w-i', ipa: '/ˈkiːwiː/', zh: '猕猴桃', icon: '🥝', level: 2, sentence: 'Green kiwi has lots of vitamins.', sentenceZh: '绿猕猴桃富含维生素。' },
            { id: 'w_coconut', word: 'coconut', phonics: 'co-co-nut', ipa: '/ˈkəʊkənʌt/', zh: '椰子', icon: '🥥', level: 3, sentence: 'Drink cool coconut milk by the sea.', sentenceZh: '在海边喝清凉的椰子汁。' },
            { id: 'w_pea', word: 'pea', phonics: 'p-ea', ipa: '/piː/', zh: '小豌豆', icon: '🫛', level: 1, sentence: 'Little green pea shoots brave peas!', sentenceZh: '小小绿豌豆发射勇敢豆豆！' }
        ]
    },
    {
        id: 'pack_food',
        name: '甜品美食坊',
        enCategory: 'Yummy Food',
        icon: '🍰',
        words: [
            { id: 'w_cake', word: 'cake', phonics: 'c-a-ke', ipa: '/keɪk/', zh: '蛋糕', icon: '🍰', level: 1, sentence: 'Happy birthday! Have some cake!', sentenceZh: '生日快乐！吃块蛋糕吧！', riddle: 'We put candles on me and eat me on your birthday!' },
            { id: 'w_milk', word: 'milk', phonics: 'm-i-lk', ipa: '/mɪlk/', zh: '牛奶', icon: '🥛', level: 1, sentence: 'Drink warm milk every morning.', sentenceZh: '每天早晨喝杯热牛奶。', riddle: 'I am a healthy white drink from cows!' },
            { id: 'w_bread', word: 'bread', phonics: 'br-ea-d', ipa: '/bred/', zh: '面包', icon: '🍞', level: 1, sentence: 'Fresh bread from the bakery!', sentenceZh: '烘焙店刚出炉的新鲜面包！' },
            { id: 'w_egg', word: 'egg', phonics: 'e-gg', ipa: '/eɡ/', zh: '鸡蛋', icon: '🥚', level: 1, sentence: 'I have an egg for breakfast.', sentenceZh: '我早餐吃一个鸡蛋。', riddle: 'Hens lay me, and I have a white shell and yellow yolk!' },
            { id: 'w_burger', word: 'burger', phonics: 'b-ur-g-er', ipa: '/ˈbɜːrɡər/', zh: '汉堡包', icon: '🍔', level: 2, sentence: 'One cheese burger, please!', sentenceZh: '请给我来一个芝士汉堡！' },
            { id: 'w_donut', word: 'donut', phonics: 'd-o-n-ut', ipa: '/ˈdəʊnʌt/', zh: '甜甜圈', icon: '🍩', level: 2, sentence: 'Chocolate donut is round and sweet.', sentenceZh: '巧克力甜甜圈又圆又甜。', riddle: 'I am a sweet ring-shaped cake with a hole in the middle!' },
            { id: 'w_cookie', word: 'cookie', phonics: 'c-oo-k-ie', ipa: '/ˈkʊki/', zh: '曲奇饼干', icon: '🍪', level: 2, sentence: 'Share cookies with good friends.', sentenceZh: '和好朋友分享曲奇饼干。' },
            { id: 'w_candy', word: 'candy', phonics: 'c-an-dy', ipa: '/ˈkændi/', zh: '糖果', icon: '🍬', level: 1, sentence: 'Rainbow candy in the gift box.', sentenceZh: '礼盒里装着彩虹糖果。' },
            { id: 'w_juice', word: 'juice', phonics: 'j-ui-ce', ipa: '/dʒuːs/', zh: '果汁', icon: '🧃', level: 2, sentence: 'A cup of fresh apple juice!', sentenceZh: '一杯鲜榨苹果汁！' },
            { id: 'w_pizza', word: 'pizza', phonics: 'p-i-zz-a', ipa: '/ˈpiːtsə/', zh: '披萨', icon: '🍕', level: 2, sentence: 'Hot pizza with cheese!', sentenceZh: '热腾腾的芝士披萨！' },
            { id: 'w_honey', word: 'honey', phonics: 'h-o-n-ey', ipa: '/ˈhʌni/', zh: '蜂蜜', icon: '🍯', level: 2, sentence: 'Sweet golden honey in a jar.', sentenceZh: '罐子里装满香甜蜂蜜。', riddle: 'Busy bees make this sweet golden food!' },
            { id: 'w_water', word: 'water', phonics: 'w-a-t-er', ipa: '/ˈwɔːtər/', zh: '水', icon: '💧', level: 1, sentence: 'Please drink plenty of water.', sentenceZh: '请多喝温水哦。' },
            { id: 'w_rice', word: 'rice', phonics: 'r-i-ce', ipa: '/raɪs/', zh: '米饭', icon: '🍚', level: 1, sentence: 'Eat a bowl of white rice.', sentenceZh: '吃一碗香喷喷的白米饭。' },
            { id: 'w_noodle', word: 'noodle', phonics: 'n-oo-d-le', ipa: '/ˈnuːdl/', zh: '面条', icon: '🍜', level: 2, sentence: 'Warm noodles taste great!', sentenceZh: '热乎乎的面条真美味！' },
            { id: 'w_soup', word: 'soup', phonics: 's-ou-p', ipa: '/suːp/', zh: '汤', icon: '🍲', level: 2, sentence: 'Have some hot vegetable soup.', sentenceZh: '喝点热蔬菜汤吧。' },
            { id: 'w_cheese', word: 'cheese', phonics: 'ch-ee-se', ipa: '/tʃiːz/', zh: '奶酪', icon: '🧀', level: 2, sentence: 'Little mouse loves yellow cheese.', sentenceZh: '小老鼠最爱黄奶酪。' },
            { id: 'w_salad', word: 'salad', phonics: 's-a-l-ad', ipa: '/ˈsæləd/', zh: '沙拉', icon: '🥗', level: 2, sentence: 'Fruit salad is healthy and fresh.', sentenceZh: '水果沙拉健康又新鲜。' },
            { id: 'w_icecream', word: 'cream', phonics: 'cr-ea-m', ipa: '/kriːm/', zh: '奶油/冰激凌', icon: '🍦', level: 2, sentence: 'Sweet ice cream on a summer day!', sentenceZh: '夏天的甜美冰激凌！' }
        ]
    },
    {
        id: 'pack_school',
        name: '魔法图书馆',
        enCategory: 'School Things',
        icon: '📚',
        words: [
            { id: 'w_book', word: 'book', phonics: 'b-oo-k', ipa: '/bʊk/', zh: '书本', icon: '📖', level: 1, sentence: 'Open your magic story book!', sentenceZh: '打开你的魔法故事书！', riddle: 'I have many pages with fun stories to read!' },
            { id: 'w_pen', word: 'pen', phonics: 'p-e-n', ipa: '/pen/', zh: '钢笔', icon: '🖊️', level: 1, sentence: 'Write neatly with a blue pen.', sentenceZh: '用蓝色钢笔工整写字。' },
            { id: 'w_pencil', word: 'pencil', phonics: 'p-en-cil', ipa: '/ˈpensl/', zh: '铅笔', icon: '✏️', level: 2, sentence: 'Sharpen my yellow pencil.', sentenceZh: '削好我的小黄铅笔。' },
            { id: 'w_ruler', word: 'ruler', phonics: 'r-u-l-er', ipa: '/ˈruːlər/', zh: '尺子', icon: '📏', level: 2, sentence: 'Draw a straight line with a ruler.', sentenceZh: '用尺子画出笔直的线。', riddle: 'I help you measure length and draw straight lines!' },
            { id: 'w_bag', word: 'bag', phonics: 'b-a-g', ipa: '/bæɡ/', zh: '书包', icon: '🎒', level: 1, sentence: 'Pack my school bag by myself!', sentenceZh: '我自己整理好小书包！' },
            { id: 'w_clock', word: 'clock', phonics: 'cl-o-ck', ipa: '/klɒk/', zh: '时钟', icon: '⏰', level: 2, sentence: 'The clock says eight o’clock.', sentenceZh: '时钟指向八点整。', riddle: 'I have hands on my round face and tell you the time!' },
            { id: 'w_chair', word: 'chair', phonics: 'ch-air', ipa: '/tʃeər/', zh: '椅子', icon: '🪑', level: 2, sentence: 'Sit nicely on the wooden chair.', sentenceZh: '端端正正坐在木椅上。' },
            { id: 'w_map', word: 'map', phonics: 'm-a-p', ipa: '/mæp/', zh: '地图', icon: '🗺️', level: 1, sentence: 'Find our shop on the town map!', sentenceZh: '在小镇地图上找到我们的店！' },
            { id: 'w_crayon', word: 'crayon', phonics: 'cr-ay-on', ipa: '/ˈkreɪən/', zh: '蜡笔', icon: '🖍️', level: 3, sentence: 'Paint a rainbow with crayons.', sentenceZh: '用彩色蜡笔画出彩虹。' },
            { id: 'w_gift', word: 'gift', phonics: 'g-i-ft', ipa: '/ɡɪft/', zh: '礼物', icon: '🎁', level: 1, sentence: 'A surprise gift box for you!', sentenceZh: '送给你一个惊喜礼物盒！' },
            { id: 'w_desk', word: 'desk', phonics: 'd-e-sk', ipa: '/desk/', zh: '书桌', icon: '🪵', level: 1, sentence: 'Keep my study desk clean.', sentenceZh: '保持我的书桌干净整洁。' },
            { id: 'w_paper', word: 'paper', phonics: 'p-a-p-er', ipa: '/ˈpeɪpər/', zh: '纸张', icon: '📄', level: 2, sentence: 'Fold a paper plane together.', sentenceZh: '一起折一架纸飞机。' },
            { id: 'w_eraser', word: 'eraser', phonics: 'e-ra-ser', ipa: '/ɪˈreɪsər/', zh: '橡皮擦', icon: '🧼', level: 3, sentence: 'Use an eraser to fix mistakes.', sentenceZh: '用橡皮擦改正错误。', riddle: 'I rub away pencil mistakes on your paper!' },
            { id: 'w_music', word: 'music', phonics: 'm-u-s-ic', ipa: '/ˈmjuːzɪk/', zh: '音乐', icon: '🎵', level: 2, sentence: 'Listen to happy classroom music.', sentenceZh: '聆听欢快的课堂音乐。' },
            { id: 'w_math', word: 'math', phonics: 'm-a-th', ipa: '/mæθ/', zh: '数学', icon: '🧮', level: 1, sentence: 'Math games make us clever!', sentenceZh: '数学游戏让我们更聪明！' },
            { id: 'w_bell', word: 'bell', phonics: 'b-e-ll', ipa: '/bel/', zh: '铃铛/上课铃', icon: '🔔', level: 1, sentence: 'Ring, ring! The school bell rings.', sentenceZh: '叮铃铃！上课铃响啦。' },
            { id: 'w_paint', word: 'paint', phonics: 'p-ai-nt', ipa: '/peɪnt/', zh: '颜料/绘画', icon: '🎨', level: 2, sentence: 'Mix blue and yellow paint.', sentenceZh: '把蓝色和黄色颜料调在一起。' },
            { id: 'w_globe', word: 'globe', phonics: 'gl-o-be', ipa: '/ɡləʊb/', zh: '地球仪', icon: '🌍', level: 2, sentence: 'Spin the round blue globe.', sentenceZh: '转动圆圆的蓝色地球仪。' }
        ]
    },
    {
        id: 'pack_nature',
        name: '自然与色彩',
        enCategory: 'Nature & Colors',
        icon: '🌈',
        words: [
            { id: 'w_sun', word: 'sun', phonics: 's-u-n', ipa: '/sʌn/', zh: '太阳', icon: '☀️', level: 1, sentence: 'The warm sun shines brightly.', sentenceZh: '温暖的太阳闪耀光芒。', riddle: 'I shine bright in the daytime sky and keep everyone warm!' },
            { id: 'w_moon', word: 'moon', phonics: 'm-oo-n', ipa: '/muːn/', zh: '月亮', icon: '🌙', level: 1, sentence: 'Good night, silver moon!', sentenceZh: '晚安，银色的月亮！', riddle: 'I glow softly in the night sky next to little stars!' },
            { id: 'w_star', word: 'star', phonics: 'st-ar', ipa: '/stɑːr/', zh: '星星', icon: '⭐', level: 1, sentence: 'Twinkle, twinkle, little star!', sentenceZh: '一闪一闪亮晶晶！' },
            { id: 'w_cloud', word: 'cloud', phonics: 'cl-ou-d', ipa: '/klaʊd/', zh: '云朵', icon: '☁️', level: 2, sentence: 'Unicorn sleeps on a soft cloud.', sentenceZh: '独角兽睡在软绵绵的云朵上。' },
            { id: 'w_flower', word: 'flower', phonics: 'fl-ow-er', ipa: '/ˈflaʊər/', zh: '花朵', icon: '🌸', level: 2, sentence: 'Pretty flowers bloom in spring.', sentenceZh: '美丽的花朵在春天盛开。' },
            { id: 'w_tree', word: 'tree', phonics: 'tr-ee', ipa: '/triː/', zh: '大树', icon: '🌳', level: 1, sentence: 'Tall green trees around the town.', sentenceZh: '小镇周围长满高大的绿树。' },
            { id: 'w_rain', word: 'rain', phonics: 'r-ai-n', ipa: '/reɪn/', zh: '雨水', icon: '🌧️', level: 2, sentence: 'Little frog loves spring rain.', sentenceZh: '小青蛙喜欢春天的细雨。' },
            { id: 'w_rainbow', word: 'rainbow', phonics: 'r-ain-b-ow', ipa: '/ˈreɪnbəʊ/', zh: '彩虹', icon: '🌈', level: 3, sentence: 'Seven colors in the rainbow!', sentenceZh: '彩虹里有七种美丽颜色！', riddle: 'I appear in the sky after rain with seven pretty colors!' },
            { id: 'w_green', word: 'green', phonics: 'gr-ee-n', ipa: '/ɡriːn/', zh: '绿色', icon: '💚', level: 1, sentence: 'Lotus leaf is fresh green.', sentenceZh: '荷叶是清新的绿色。' },
            { id: 'w_purple', word: 'purple', phonics: 'p-ur-ple', ipa: '/ˈpɜːrpl/', zh: '紫色', icon: '💜', level: 2, sentence: 'Magic library has a purple roof.', sentenceZh: '魔法书屋有着紫色的屋顶。' },
            { id: 'w_red', word: 'red', phonics: 'r-e-d', ipa: '/red/', zh: '红色', icon: '❤️', level: 1, sentence: 'Ripe strawberries are bright red.', sentenceZh: '成熟的草莓是鲜红色的。' },
            { id: 'w_blue', word: 'blue', phonics: 'bl-ue', ipa: '/bluː/', zh: '蓝色', icon: '💙', level: 1, sentence: 'The clear sky is bright blue.', sentenceZh: '晴朗的天空是蔚蓝色的。' },
            { id: 'w_yellow', word: 'yellow', phonics: 'y-e-ll-ow', ipa: '/ˈjeləʊ/', zh: '黄色', icon: '💛', level: 2, sentence: 'Sunflowers wear yellow petals.', sentenceZh: '向日葵长着黄色的花瓣。' },
            { id: 'w_white', word: 'white', phonics: 'wh-i-te', ipa: '/waɪt/', zh: '白色', icon: '🤍', level: 1, sentence: 'White snow covers the hill.', sentenceZh: '洁白的雪花覆盖着小山。' },
            { id: 'w_river', word: 'river', phonics: 'r-i-v-er', ipa: '/ˈrɪvər/', zh: '小河', icon: '🏞️', level: 2, sentence: 'Clear water flows in the river.', sentenceZh: '清澈的河水缓缓流淌。' },
            { id: 'w_sea', word: 'sea', phonics: 's-ea', ipa: '/siː/', zh: '大海', icon: '🌊', level: 1, sentence: 'Shells shine by the blue sea.', sentenceZh: '贝壳在蔚蓝大海边闪耀。' },
            { id: 'w_leaf', word: 'leaf', phonics: 'l-ea-f', ipa: '/liːf/', zh: '树叶', icon: '🍃', level: 2, sentence: 'A green leaf dances in the wind.', sentenceZh: '一片绿叶在风中起舞。' },
            { id: 'w_fire', word: 'fire', phonics: 'f-ire', ipa: '/ˈfaɪər/', zh: '火焰', icon: '🔥', level: 1, sentence: 'Torchwood lights a warm fire!', sentenceZh: '火炬树桩燃起温暖火焰！' }
        ]
    },
    {
        id: 'pack_town',
        name: '小镇店长日常',
        enCategory: 'Town & Shop',
        icon: '🏪',
        words: [
            { id: 'w_shop', word: 'shop', phonics: 'sh-o-p', ipa: '/ʃɒp/', zh: '商店', icon: '🏪', level: 1, sentence: 'Welcome to my cute pet shop!', sentenceZh: '欢迎来到我的萌宠小店！' },
            { id: 'w_train', word: 'train', phonics: 'tr-ai-n', ipa: '/treɪn/', zh: '小火车', icon: '🚂', level: 2, sentence: 'Choo-choo! The town train goes by.', sentenceZh: '呜呜！环镇小火车开过来了。', riddle: 'I run on long tracks and say choo-choo!' },
            { id: 'w_crown', word: 'crown', phonics: 'cr-ow-n', ipa: '/kraʊn/', zh: '皇冠', icon: '👑', level: 2, sentence: 'Prince frog wears a gold crown.', sentenceZh: '王子蛙戴着金色小皇冠。' },
            { id: 'w_happy', word: 'happy', phonics: 'h-a-pp-y', ipa: '/ˈhæpi/', zh: '开心的', icon: '😊', level: 1, sentence: 'We are happy little learners!', sentenceZh: '我们是快乐的小小学霸！' },
            { id: 'w_smart', word: 'smart', phonics: 'sm-ar-t', ipa: '/smɑːrt/', zh: '聪明的', icon: '💡', level: 2, sentence: 'What a smart shop manager!', sentenceZh: '真是太聪明的小店长啦！' },
            { id: 'w_friend', word: 'friend', phonics: 'fr-ie-nd', ipa: '/frend/', zh: '朋友', icon: '🤝', level: 2, sentence: 'Rabbit and frog are best friends.', sentenceZh: '兔子和青蛙是最好的朋友。' },
            { id: 'w_jump', word: 'jump', phonics: 'j-u-mp', ipa: '/dʒʌmp/', zh: '跳跃', icon: '🦘', level: 1, sentence: 'Frog can jump very high!', sentenceZh: '小青蛙能跳得非常高！' },
            { id: 'w_smile', word: 'smile', phonics: 'sm-i-le', ipa: '/smaɪl/', zh: '微笑', icon: '😄', level: 2, sentence: 'Greet customers with a big smile.', sentenceZh: '带着灿烂微笑迎接顾客。' },
            { id: 'w_letter', word: 'letter', phonics: 'l-e-tt-er', ipa: '/ˈletər/', zh: '信件', icon: '✉️', level: 2, sentence: 'Send a warm letter at the post office.', sentenceZh: '在邮局寄出一封温暖的信。' },
            { id: 'w_rocket', word: 'rocket', phonics: 'r-o-ck-et', ipa: '/ˈrɒkɪt/', zh: '火箭', icon: '🚀', level: 3, sentence: 'Astro bunny flies a space rocket!', sentenceZh: '宇航兔驾驶太空火箭！', riddle: 'I blast off into outer space with fire!' },
            { id: 'w_house', word: 'house', phonics: 'h-ou-se', ipa: '/haʊs/', zh: '房子', icon: '🏠', level: 1, sentence: 'Plants guard our cozy house.', sentenceZh: '植物守卫着我们温馨的房子。' },
            { id: 'w_park', word: 'park', phonics: 'p-ar-k', ipa: '/pɑːrk/', zh: '公园', icon: '🎡', level: 1, sentence: 'Let us play in the sunny park!', sentenceZh: '让我们在阳光公园里玩耍吧！' },
            { id: 'w_bridge', word: 'bridge', phonics: 'br-i-dge', ipa: '/brɪdʒ/', zh: '小桥', icon: '🌉', level: 3, sentence: 'Walk across the stone bridge.', sentenceZh: '走过那座小石桥。' },
            { id: 'w_coin', word: 'coin', phonics: 'c-oi-n', ipa: '/kɔɪn/', zh: '金币', icon: '🪙', level: 2, sentence: 'Earn gold coins to build towers!', sentenceZh: '赚取金币建造防御塔！' },
            { id: 'w_medal', word: 'medal', phonics: 'm-e-d-al', ipa: '/ˈmedl/', zh: '奖章', icon: '🏅', level: 2, sentence: 'You won a shiny gold medal!', sentenceZh: '你赢得了一枚闪亮的金奖章！' },
            { id: 'w_garden', word: 'garden', phonics: 'g-ar-d-en', ipa: '/ˈɡɑːrdn/', zh: '花园', icon: '🌻', level: 2, sentence: 'Sunflowers bloom in our garden.', sentenceZh: '向日葵在我们的花园盛开。' },
            { id: 'w_castle', word: 'castle', phonics: 'c-a-stle', ipa: '/ˈkɑːsl/', zh: '城堡', icon: '🏰', level: 3, sentence: 'A fairy castle stands on the cloud.', sentenceZh: '童话城堡耸立在云端。' },
            { id: 'w_party', word: 'party', phonics: 'p-ar-ty', ipa: '/ˈpɑːrti/', zh: '派对', icon: '🎉', level: 2, sentence: 'Welcome to the pet town party!', sentenceZh: '欢迎来到萌宠小镇派对！' }
        ]
    },
    {
        id: 'pack_numbers',
        name: '数字与时间',
        enCategory: 'Numbers & Time',
        icon: '🔢',
        words: [
            { id: 'w_one', word: 'one', phonics: 'o-ne', ipa: '/wʌn/', zh: '一 (1)', icon: '1️⃣', level: 1, sentence: 'One golden carrot is safe!', sentenceZh: '一根金萝卜平安无事！' },
            { id: 'w_two', word: 'two', phonics: 'tw-o', ipa: '/tuː/', zh: '二 (2)', icon: '2️⃣', level: 1, sentence: 'Two little bunnies hop together.', sentenceZh: '两只小兔子一起蹦蹦跳。' },
            { id: 'w_three', word: 'three', phonics: 'thr-ee', ipa: '/θriː/', zh: '三 (3)', icon: '3️⃣', level: 1, sentence: 'Three stars make one medal!', sentenceZh: '三颗星星合成一枚徽章！' },
            { id: 'w_four', word: 'four', phonics: 'f-our', ipa: '/fɔːr/', zh: '四 (4)', icon: '4️⃣', level: 1, sentence: 'There are four seasons in a year.', sentenceZh: '一年里有四个季节。' },
            { id: 'w_five', word: 'five', phonics: 'f-i-ve', ipa: '/faɪv/', zh: '五 (5)', icon: '5️⃣', level: 1, sentence: 'High five, my smart friend!', sentenceZh: '击掌庆祝，我聪明的小伙伴！' },
            { id: 'w_six', word: 'six', phonics: 's-i-x', ipa: '/sɪks/', zh: '六 (6)', icon: '6️⃣', level: 1, sentence: 'Six ducks swim in the pool.', sentenceZh: '六只鸭子在泳池游泳。' },
            { id: 'w_seven', word: 'seven', phonics: 's-e-v-en', ipa: '/ˈsevn/', zh: '七 (7)', icon: '7️⃣', level: 2, sentence: 'Seven days make one week.', sentenceZh: '七天组成一个星期。' },
            { id: 'w_eight', word: 'eight', phonics: 'ei-ght', ipa: '/eɪt/', zh: '八 (8)', icon: '8️⃣', level: 2, sentence: 'An octopus has eight legs.', sentenceZh: '章鱼有八条腿。' },
            { id: 'w_nine', word: 'nine', phonics: 'n-i-ne', ipa: '/naɪn/', zh: '九 (9)', icon: '9️⃣', level: 1, sentence: 'Nine lanterns glow at night.', sentenceZh: '九盏灯笼在夜晚发光。' },
            { id: 'w_ten', word: 'ten', phonics: 't-e-n', ipa: '/ten/', zh: '十 (10)', icon: '🔟', level: 1, sentence: 'Ten hearts for a gold carrot!', sentenceZh: '十颗爱心守护金萝卜！' },
            { id: 'w_twelve', word: 'twelve', phonics: 'tw-e-lve', ipa: '/twelv/', zh: '十二 (12)', icon: '🕛', level: 2, sentence: 'Twelve months are in a year.', sentenceZh: '一年有十二个月。' },
            { id: 'w_twenty', word: 'twenty', phonics: 'tw-en-ty', ipa: '/ˈtwenti/', zh: '二十 (20)', icon: '🔢', level: 2, sentence: 'Count from one to twenty!', sentenceZh: '从一数到二十吧！' },
            { id: 'w_hundred', word: 'hundred', phonics: 'h-un-dr-ed', ipa: '/ˈhʌndrəd/', zh: '一百 (100)', icon: '💯', level: 3, sentence: 'One hundred points! Great job!', sentenceZh: '一百分！干得漂亮！' },
            { id: 'w_morning', word: 'morning', phonics: 'm-or-n-ing', ipa: '/ˈmɔːrnɪŋ/', zh: '早晨', icon: '🌅', level: 2, sentence: 'Good morning, little pea!', sentenceZh: '早上好，小豌豆！' },
            { id: 'w_night', word: 'night', phonics: 'n-igh-t', ipa: '/naɪt/', zh: '夜晚', icon: '🌃', level: 2, sentence: 'Mushrooms wake up at night.', sentenceZh: '蘑菇们在夜晚苏醒。' },
            { id: 'w_today', word: 'today', phonics: 'to-day', ipa: '/təˈdeɪ/', zh: '今天', icon: '📅', level: 2, sentence: 'Today is a wonderful day!', sentenceZh: '今天真是美好的一天！' },
            { id: 'w_week', word: 'week', phonics: 'w-ee-k', ipa: '/wiːk/', zh: '星期/周', icon: '🗓️', level: 2, sentence: 'We read books every week.', sentenceZh: '我们每周都读书。' },
            { id: 'w_year', word: 'year', phonics: 'y-ear', ipa: '/jɪər/', zh: '年', icon: '🎊', level: 2, sentence: 'Happy New Year to everyone!', sentenceZh: '祝大家新年快乐！' }
        ]
    },
    {
        id: 'pack_family',
        name: '温馨大家庭',
        enCategory: 'Family & Jobs',
        icon: '👨‍👩‍👧',
        words: [
            { id: 'w_family', word: 'family', phonics: 'f-a-m-i-ly', ipa: '/ˈfæməli/', zh: '家庭/家人', icon: '🏡', level: 2, sentence: 'I love my sweet family!', sentenceZh: '我爱我温馨的家！' },
            { id: 'w_mother', word: 'mother', phonics: 'm-o-th-er', ipa: '/ˈmʌðər/', zh: '妈妈', icon: '👩', level: 2, sentence: 'Mother gives me a warm hug.', sentenceZh: '妈妈给我一个温暖的拥抱。' },
            { id: 'w_father', word: 'father', phonics: 'f-a-th-er', ipa: '/ˈfɑːðər/', zh: '爸爸', icon: '👨', level: 2, sentence: 'Father plays chess with me.', sentenceZh: '爸爸陪我一起下棋。' },
            { id: 'w_sister', word: 'sister', phonics: 's-i-s-ter', ipa: '/ˈsɪstər/', zh: '姐姐/妹妹', icon: '👧', level: 2, sentence: 'My sister shares her toys.', sentenceZh: '姐姐/妹妹和我分享玩具。' },
            { id: 'w_brother', word: 'brother', phonics: 'br-o-th-er', ipa: '/ˈbrʌðər/', zh: '哥哥/弟弟', icon: '👦', level: 2, sentence: 'My brother runs on the grass.', sentenceZh: '哥哥/弟弟在草地上奔跑。' },
            { id: 'w_grandma', word: 'grandma', phonics: 'gr-and-ma', ipa: '/ˈɡrænmɑː/', zh: '奶奶/外婆', icon: '👵', level: 2, sentence: 'Grandma makes yummy dumplings.', sentenceZh: '奶奶包了美味的饺子。' },
            { id: 'w_grandpa', word: 'grandpa', phonics: 'gr-and-pa', ipa: '/ˈɡrænpɑː/', zh: '爷爷/外公', icon: '👴', level: 2, sentence: 'Grandpa tells funny stories.', sentenceZh: '爷爷讲有趣的故事。' },
            { id: 'w_baby', word: 'baby', phonics: 'b-a-by', ipa: '/ˈbeɪbi/', zh: '小宝宝', icon: '👶', level: 1, sentence: 'The cute baby smiles sweetly.', sentenceZh: '可爱的小宝宝甜甜地笑。' },
            { id: 'w_teacher', word: 'teacher', phonics: 't-ea-ch-er', ipa: '/ˈtiːtʃər/', zh: '老师', icon: '👩‍🏫', level: 2, sentence: 'Our teacher is kind and wise.', sentenceZh: '我们的老师既温柔又有智慧。', riddle: 'I help students learn new things in the classroom!' },
            { id: 'w_doctor', word: 'doctor', phonics: 'd-o-c-tor', ipa: '/ˈdɒktər/', zh: '医生', icon: '🩺', level: 2, sentence: 'The doctor helps sick pets.', sentenceZh: '医生帮助生病的小动物。', riddle: 'I work at a hospital and help sick people feel better!' },
            { id: 'w_nurse', word: 'nurse', phonics: 'n-ur-se', ipa: '/nɜːrs/', zh: '护士', icon: '🩹', level: 2, sentence: 'The gentle nurse cares for us.', sentenceZh: '温柔的护士照顾我们。' },
            { id: 'w_cook', word: 'cook', phonics: 'c-oo-k', ipa: '/kʊk/', zh: '厨师/做饭', icon: '👨‍🍳', level: 1, sentence: 'Panda cook bakes fresh bread.', sentenceZh: '熊猫大厨烤出新鲜面包。' },
            { id: 'w_farmer', word: 'farmer', phonics: 'f-ar-m-er', ipa: '/ˈfɑːrmər/', zh: '农夫', icon: '🌾', level: 2, sentence: 'The farmer grows sweet carrots.', sentenceZh: '农夫种出了甜甜的胡萝卜。' },
            { id: 'w_driver', word: 'driver', phonics: 'dr-i-v-er', ipa: '/ˈdraɪvər/', zh: '司机', icon: '🚌', level: 2, sentence: 'Wave hello to the bus driver!', sentenceZh: '向校车司机挥手问好！' },
            { id: 'w_pilot', word: 'pilot', phonics: 'p-i-l-ot', ipa: '/ˈpaɪlət/', zh: '飞行员', icon: '🧑‍✈️', level: 2, sentence: 'A brave pilot flies above clouds.', sentenceZh: '勇敢的飞行员飞越云端。' },
            { id: 'w_king', word: 'king', phonics: 'k-i-ng', ipa: '/kɪŋ/', zh: '国王', icon: '🤴', level: 1, sentence: 'The frog king wears a cape.', sentenceZh: '青蛙国王披着斗篷。' },
            { id: 'w_queen', word: 'queen', phonics: 'qu-ee-n', ipa: '/kwiːn/', zh: '女王/王后', icon: '👸', level: 2, sentence: 'The kind queen loves flowers.', sentenceZh: '善良的女王喜爱鲜花。' },
            { id: 'w_hero', word: 'hero', phonics: 'h-e-ro', ipa: '/ˈhɪərəʊ/', zh: '小英雄', icon: '🦸', level: 2, sentence: 'You are a brave math hero!', sentenceZh: '你是一位勇敢的数学小英雄！' }
        ]
    },
    {
        id: 'pack_body',
        name: '身体与穿搭',
        enCategory: 'Body & Clothes',
        icon: '👕',
        words: [
            { id: 'w_head', word: 'head', phonics: 'h-ea-d', ipa: '/hed/', zh: '头/脑袋', icon: '🙂', level: 1, sentence: 'Nod your head and say yes!', sentenceZh: '点点头说好呀！' },
            { id: 'w_eye', word: 'eye', phonics: 'eye', ipa: '/aɪ/', zh: '眼睛', icon: '👀', level: 1, sentence: 'Protect our bright little eyes.', sentenceZh: '保护好我们明亮的小眼睛。', riddle: 'You have two of us on your face to see the colorful world!' },
            { id: 'w_ear', word: 'ear', phonics: 'ear', ipa: '/ɪər/', zh: '耳朵', icon: '👂', level: 1, sentence: 'Rabbit has two long ears.', sentenceZh: '小兔子有两只长耳朵。', riddle: 'You use us to listen to happy songs and stories!' },
            { id: 'w_nose', word: 'nose', phonics: 'n-o-se', ipa: '/nəʊz/', zh: '鼻子', icon: '👃', level: 1, sentence: 'Smell the flowers with your nose.', sentenceZh: '用鼻子闻闻花香。' },
            { id: 'w_mouth', word: 'mouth', phonics: 'm-ou-th', ipa: '/maʊθ/', zh: '嘴巴', icon: '👄', level: 2, sentence: 'Open your mouth and read aloud.', sentenceZh: '张开嘴巴大声朗读。' },
            { id: 'w_hand', word: 'hand', phonics: 'h-a-nd', ipa: '/hænd/', zh: '小手', icon: '✋', level: 1, sentence: 'Wash your hands before dinner.', sentenceZh: '吃饭前要洗干净小手。' },
            { id: 'w_foot', word: 'foot', phonics: 'f-oo-t', ipa: '/fʊt/', zh: '脚丫', icon: '🦶', level: 1, sentence: 'Stamp your foot on the floor.', sentenceZh: '在地板上跺跺小脚。' },
            { id: 'w_tooth', word: 'tooth', phonics: 't-oo-th', ipa: '/tuːθ/', zh: '牙齿', icon: '🦷', level: 2, sentence: 'Brush every tooth morning and night.', sentenceZh: '早晚认真刷好每一颗牙。' },
            { id: 'w_heart', word: 'heart', phonics: 'h-ear-t', ipa: '/hɑːrt/', zh: '爱心/心脏', icon: '💖', level: 2, sentence: 'A warm heart brings kindness.', sentenceZh: '温暖的心带来善良。' },
            { id: 'w_hat', word: 'hat', phonics: 'h-a-t', ipa: '/hæt/', zh: '帽子', icon: '👒', level: 1, sentence: 'Wear a sun hat at the beach.', sentenceZh: '在海滩戴上遮阳帽。' },
            { id: 'w_cap', word: 'cap', phonics: 'c-a-p', ipa: '/kæp/', zh: '棒球帽', icon: '🧢', level: 1, sentence: 'Put on a cool blue cap.', sentenceZh: '戴上帅气的蓝棒球帽。' },
            { id: 'w_shirt', word: 'shirt', phonics: 'sh-ir-t', ipa: '/ʃɜːrt/', zh: '衬衫/T恤', icon: '👕', level: 2, sentence: 'My clean white shirt looks neat.', sentenceZh: '我干净的白衬衫真整洁。' },
            { id: 'w_coat', word: 'coat', phonics: 'c-oa-t', ipa: '/kəʊt/', zh: '外套/大衣', icon: '🧥', level: 2, sentence: 'Put on a warm coat in winter.', sentenceZh: '冬天穿上暖和的外套。' },
            { id: 'w_dress', word: 'dress', phonics: 'dr-e-ss', ipa: '/dres/', zh: '连衣裙', icon: '👗', level: 2, sentence: 'Bunny wears a pink dress.', sentenceZh: '兔兔穿着粉色连衣裙。' },
            { id: 'w_shoes', word: 'shoes', phonics: 'sh-oe-s', ipa: '/ʃuːz/', zh: '鞋子', icon: '👟', level: 2, sentence: 'Tie my running shoes tightly.', sentenceZh: '把运动鞋带系得稳稳的。' },
            { id: 'w_socks', word: 'socks', phonics: 's-o-ck-s', ipa: '/sɒks/', zh: '袜子', icon: '🧦', level: 2, sentence: 'Warm striped socks keep feet cozy.', sentenceZh: '暖和的条纹袜让小脚真舒服。' },
            { id: 'w_scarf', word: 'scarf', phonics: 'sc-ar-f', ipa: '/skɑːrf/', zh: '围巾', icon: '🧣', level: 2, sentence: 'A soft red scarf for snowy days.', sentenceZh: '下雪天围上柔软的红围巾。' },
            { id: 'w_glasses', word: 'glasses', phonics: 'gl-a-ss-es', ipa: '/ˈɡlɑːsɪz/', zh: '眼镜', icon: '👓', level: 3, sentence: 'Owl professor wears round glasses.', sentenceZh: '猫头鹰博士戴着圆眼镜。' }
        ]
    },
    {
        id: 'pack_vehicles',
        name: '交通与旅行',
        enCategory: 'Travel & Vehicles',
        icon: '🚀',
        words: [
            { id: 'w_car', word: 'car', phonics: 'c-ar', ipa: '/kɑːr/', zh: '小汽车', icon: '🚗', level: 1, sentence: 'The red car stops at the light.', sentenceZh: '红汽车在信号灯前停下。' },
            { id: 'w_bus', word: 'bus', phonics: 'b-u-s', ipa: '/bʌs/', zh: '公交车/校车', icon: '🚌', level: 1, sentence: 'Take the yellow school bus!', sentenceZh: '乘坐黄色校车出发！' },
            { id: 'w_bike', word: 'bike', phonics: 'b-i-ke', ipa: '/baɪk/', zh: '自行车', icon: '🚲', level: 1, sentence: 'Ride my bike along the path.', sentenceZh: '沿着小路骑自行车。' },
            { id: 'w_plane', word: 'plane', phonics: 'pl-a-ne', ipa: '/pleɪn/', zh: '飞机', icon: '✈️', level: 2, sentence: 'A white plane flies in the sky.', sentenceZh: '一架白飞机在蓝天飞翔。' },
            { id: 'w_ship', word: 'ship', phonics: 'sh-i-p', ipa: '/ʃɪp/', zh: '轮船', icon: '🚢', level: 1, sentence: 'A big ship sails across the sea.', sentenceZh: '大轮船航行在大海上。' },
            { id: 'w_boat', word: 'boat', phonics: 'b-oa-t', ipa: '/bəʊt/', zh: '小船', icon: '⛵', level: 1, sentence: 'Row a little boat on the lake.', sentenceZh: '在湖面上划小船。' },
            { id: 'w_taxi', word: 'taxi', phonics: 't-a-x-i', ipa: '/ˈtæksi/', zh: '出租车', icon: '🚕', level: 2, sentence: 'Call a taxi to the station.', sentenceZh: '叫一辆出租车去车站。' },
            { id: 'w_truck', word: 'truck', phonics: 'tr-u-ck', ipa: '/trʌk/', zh: '卡车', icon: '🚚', level: 2, sentence: 'The truck carries fresh fruit.', sentenceZh: '卡车运送着新鲜水果。' },
            { id: 'w_subway', word: 'subway', phonics: 's-ub-way', ipa: '/ˈsʌbweɪ/', zh: '地铁', icon: '🚇', level: 3, sentence: 'The city subway runs super fast.', sentenceZh: '城市地铁跑得飞快。' },
            { id: 'w_wheel', word: 'wheel', phonics: 'wh-ee-l', ipa: '/wiːl/', zh: '车轮/摩天轮', icon: '🛞', level: 2, sentence: 'Four round wheels spin and roll.', sentenceZh: '四个圆车轮骨碌碌地转。' },
            { id: 'w_road', word: 'road', phonics: 'r-oa-d', ipa: '/rəʊd/', zh: '道路/马路', icon: '🛣️', level: 1, sentence: 'Look both ways before crossing the road.', sentenceZh: '过马路前要左右看。' },
            { id: 'w_ticket', word: 'ticket', phonics: 't-i-ck-et', ipa: '/ˈtɪkɪt/', zh: '车票/礼券', icon: '🎟️', level: 2, sentence: 'Show your train ticket, please.', sentenceZh: '请出示你的火车票。' },
            { id: 'w_helmet', word: 'helmet', phonics: 'h-el-m-et', ipa: '/ˈhelmɪt/', zh: '安全头盔', icon: '⛑️', level: 3, sentence: 'Always wear a helmet when riding.', sentenceZh: '骑车时一定要戴好头盔。' },
            { id: 'w_anchor', word: 'anchor', phonics: 'an-ch-or', ipa: '/ˈæŋkər/', zh: '船锚', icon: '⚓', level: 3, sentence: 'Drop the heavy iron anchor!', sentenceZh: '抛下坚固的大铁锚！' },
            { id: 'w_island', word: 'island', phonics: 'is-l-and', ipa: '/ˈaɪlənd/', zh: '岛屿', icon: '🏝️', level: 3, sentence: 'Pet town sits on a sunny island.', sentenceZh: '萌宠小镇坐落在阳光海岛上。' },
            { id: 'w_beach', word: 'beach', phonics: 'b-ea-ch', ipa: '/biːtʃ/', zh: '海滩', icon: '🏖️', level: 2, sentence: 'Build sand castles on the beach.', sentenceZh: '在沙滩上堆沙堡。' },
            { id: 'w_camp', word: 'camp', phonics: 'c-a-mp', ipa: '/kæmp/', zh: '露营', icon: '⛺', level: 1, sentence: 'Set up a tent at the forest camp.', sentenceZh: '在森林营地搭起小帐篷。' },
            { id: 'w_camera', word: 'camera', phonics: 'ca-me-ra', ipa: '/ˈkæmərə/', zh: '照相机', icon: '📷', level: 3, sentence: 'Take a happy photo with a camera!', sentenceZh: '用照相机拍张开心的合影！' }
        ]
    },
    {
        id: 'pack_weather',
        name: '四季与天气',
        enCategory: 'Seasons & Weather',
        icon: '⛅',
        words: [
            { id: 'w_spring', word: 'spring', phonics: 'spr-i-ng', ipa: '/sprɪŋ/', zh: '春天', icon: '🌱', level: 2, sentence: 'Green grass sprouts in spring.', sentenceZh: '绿草在春天发芽。' },
            { id: 'w_summer', word: 'summer', phonics: 's-u-mm-er', ipa: '/ˈsʌmər/', zh: '夏天', icon: '🌻', level: 2, sentence: 'We swim in the pool in summer.', sentenceZh: '夏天我们在泳池里游泳。' },
            { id: 'w_autumn', word: 'autumn', phonics: 'au-t-umn', ipa: '/ˈɔːtəm/', zh: '秋天', icon: '🍁', level: 3, sentence: 'Golden leaves fall in autumn.', sentenceZh: '金黄的树叶在秋天飘落。' },
            { id: 'w_winter', word: 'winter', phonics: 'w-in-t-er', ipa: '/ˈwɪntər/', zh: '冬天', icon: '⛄', level: 2, sentence: 'Make a cute snowman in winter!', sentenceZh: '冬天堆一个可爱的小雪人！' },
            { id: 'w_sunny', word: 'sunny', phonics: 's-u-nn-y', ipa: '/ˈsʌni/', zh: '晴朗的', icon: '🌞', level: 2, sentence: 'Sunflowers love sunny weather.', sentenceZh: '向日葵喜欢晴朗的天气。' },
            { id: 'w_rainy', word: 'rainy', phonics: 'r-ai-n-y', ipa: '/ˈreɪni/', zh: '下雨的', icon: '☔', level: 2, sentence: 'Take an umbrella on rainy days.', sentenceZh: '下雨天记得带上雨伞。' },
            { id: 'w_windy', word: 'windy', phonics: 'w-in-d-y', ipa: '/ˈwɪndi/', zh: '刮风的', icon: '🍃', level: 2, sentence: 'Fly a kite on a windy day!', sentenceZh: '刮风天去放风筝吧！' },
            { id: 'w_snowy', word: 'snowy', phonics: 'sn-ow-y', ipa: '/ˈsnəʊi/', zh: '下雪的', icon: '❄️', level: 2, sentence: 'Put on boots on a snowy morning.', sentenceZh: '下雪的早晨穿上雪地靴。' },
            { id: 'w_cloudy', word: 'cloudy', phonics: 'cl-ou-d-y', ipa: '/ˈklaʊdi/', zh: '多云的', icon: '⛅', level: 2, sentence: 'It is cool on a cloudy afternoon.', sentenceZh: '多云的下午很凉爽。' },
            { id: 'w_foggy', word: 'foggy', phonics: 'f-o-gg-y', ipa: '/ˈfɒɡi/', zh: '有雾的', icon: '🌫️', level: 2, sentence: 'Plantern lights up the foggy yard.', sentenceZh: '路灯花照亮起雾的院子。' },
            { id: 'w_warm', word: 'warm', phonics: 'w-ar-m', ipa: '/wɔːrm/', zh: '温暖的', icon: '🧣', level: 1, sentence: 'Spring sunshine feels so warm.', sentenceZh: '春天的阳光暖洋洋的。' },
            { id: 'w_cool', word: 'cool', phonics: 'c-oo-l', ipa: '/kuːl/', zh: '凉爽的', icon: '🎐', level: 1, sentence: 'Autumn breeze is fresh and cool.', sentenceZh: '秋风清新又凉爽。' },
            { id: 'w_hot', word: 'hot', phonics: 'h-o-t', ipa: '/hɒt/', zh: '炎热的', icon: '🥵', level: 1, sentence: 'Drink water on a hot day.', sentenceZh: '大热天要多喝水。' },
            { id: 'w_cold', word: 'cold', phonics: 'c-ol-d', ipa: '/kəʊld/', zh: '寒冷的', icon: '🧊', level: 1, sentence: 'Snow Pea shoots cold ice peas!', sentenceZh: '寒冰射手发射冰凉豌豆！' },
            { id: 'w_wind', word: 'wind', phonics: 'w-i-nd', ipa: '/wɪnd/', zh: '风', icon: '🌬️', level: 1, sentence: 'The fan tower blows strong wind.', sentenceZh: '风扇塔吹出强劲的风。' },
            { id: 'w_snow', word: 'snow', phonics: 'sn-ow', ipa: '/snəʊ/', zh: '雪花', icon: '🌨️', level: 1, sentence: 'Soft white snow falls quietly.', sentenceZh: '柔软的白雪静静飘落。' },
            { id: 'w_thunder', word: 'thunder', phonics: 'th-un-d-er', ipa: '/ˈθʌndər/', zh: '雷声', icon: '⚡', level: 3, sentence: 'Magic lightning roars like thunder!', sentenceZh: '魔法闪电如雷鸣般轰响！' },
            { id: 'w_sky', word: 'sky', phonics: 'sk-y', ipa: '/skaɪ/', zh: '天空', icon: '🌤️', level: 1, sentence: 'White birds fly high in the sky.', sentenceZh: '白鸟在高高的天空飞翔。' }
        ]
    },
    {
        id: 'pack_actions',
        name: '动作与反义词',
        enCategory: 'Actions & Opposites',
        icon: '🏃',
        words: [
            { id: 'w_run', word: 'run', phonics: 'r-u-n', ipa: '/rʌn/', zh: '奔跑', icon: '🏃', level: 1, sentence: 'Run happily across the field!', sentenceZh: '开心地跑过草地！' },
            { id: 'w_swim', word: 'swim', phonics: 'sw-i-m', ipa: '/swɪm/', zh: '游泳', icon: '🏊', level: 1, sentence: 'Little frog can swim well.', sentenceZh: '小青蛙游泳游得真棒。' },
            { id: 'w_fly', word: 'fly', phonics: 'fl-y', ipa: '/flaɪ/', zh: '飞翔', icon: '🕊️', level: 1, sentence: 'Butterflies fly among flowers.', sentenceZh: '蝴蝶在花丛间飞舞。' },
            { id: 'w_sing', word: 'sing', phonics: 's-i-ng', ipa: '/sɪŋ/', zh: '唱歌', icon: '🎤', level: 1, sentence: 'Sunflowers sing a sunny song.', sentenceZh: '向日葵唱着阳光之歌。' },
            { id: 'w_dance', word: 'dance', phonics: 'd-an-ce', ipa: '/dɑːns/', zh: '跳舞', icon: '💃', level: 2, sentence: 'Pets dance together at the party.', sentenceZh: '萌宠们在派对上一起跳舞。' },
            { id: 'w_read', word: 'read', phonics: 'r-ea-d', ipa: '/riːd/', zh: '阅读', icon: '📚', level: 1, sentence: 'Read an English story every day.', sentenceZh: '每天读一篇英语小故事。' },
            { id: 'w_draw', word: 'draw', phonics: 'dr-aw', ipa: '/drɔː/', zh: '画画', icon: '🖌️', level: 1, sentence: 'Draw a cute rabbit on paper.', sentenceZh: '在纸上画一只可爱小兔。' },
            { id: 'w_sleep', word: 'sleep', phonics: 'sl-ee-p', ipa: '/sliːp/', zh: '睡觉', icon: '😴', level: 1, sentence: 'Go to sleep early and grow tall.', sentenceZh: '早早睡觉长高高。' },
            { id: 'w_laugh', word: 'laugh', phonics: 'l-au-gh', ipa: '/lɑːf/', zh: '欢笑', icon: '😆', level: 2, sentence: 'Funny games make us laugh!', sentenceZh: '有趣的游戏逗得我们哈哈笑！' },
            { id: 'w_help', word: 'help', phonics: 'h-e-lp', ipa: '/help/', zh: '帮助', icon: '🤲', level: 1, sentence: 'Good friends always help each other.', sentenceZh: '好朋友总是互相帮助。' },
            { id: 'w_big', word: 'big', phonics: 'b-i-g', ipa: '/bɪɡ/', zh: '大的', icon: '🐘', level: 1, sentence: 'Whale is big and shrimp is small.', sentenceZh: '鲸鱼很大，小虾很小。' },
            { id: 'w_small', word: 'small', phonics: 'sm-all', ipa: '/smɔːl/', zh: '小的', icon: '🐜', level: 1, sentence: 'A small seed grows into a tree.', sentenceZh: '一颗小种子长成参天大树。' },
            { id: 'w_fast', word: 'fast', phonics: 'f-a-st', ipa: '/fɑːst/', zh: '快速的', icon: '🐆', level: 1, sentence: 'Rabbit runs fast like the wind.', sentenceZh: '兔子像风一样跑得飞快。' },
            { id: 'w_slow', word: 'slow', phonics: 'sl-ow', ipa: '/sləʊ/', zh: '缓慢的', icon: '🐢', level: 1, sentence: 'Frost tower makes monsters slow!', sentenceZh: '冰冻塔让怪兽变慢啦！' },
            { id: 'w_tall', word: 'tall', phonics: 't-all', ipa: '/tɔːl/', zh: '高大的', icon: '🦒', level: 1, sentence: 'Tall-nut blocks jumping zombies!', sentenceZh: '高坚果挡住跳跳僵尸！' },
            { id: 'w_short', word: 'short', phonics: 'sh-or-t', ipa: '/ʃɔːrt/', zh: '矮的/短的', icon: '🍄', level: 2, sentence: 'Puff-shroom is cute and short.', sentenceZh: '小喷菇矮矮的真可爱。' },
            { id: 'w_brave', word: 'brave', phonics: 'br-a-ve', ipa: '/breɪv/', zh: '勇敢的', icon: '🛡️', level: 2, sentence: 'Brave protectors guard the town!', sentenceZh: '勇敢的小卫士守卫小镇！' },
            { id: 'w_strong', word: 'strong', phonics: 'str-o-ng', ipa: '/strɒŋ/', zh: '强壮的', icon: '💪', level: 2, sentence: 'Eat veggies to grow strong!', sentenceZh: '多吃蔬菜身体壮！' }
        ]
    },
    {
        id: 'pack_home',
        name: '温馨小家园',
        enCategory: 'Cozy Home',
        icon: '🛋️',
        words: [
            { id: 'w_bed', word: 'bed', phonics: 'b-e-d', ipa: '/bed/', zh: '小床', icon: '🛏️', level: 1, sentence: 'Make my cozy bed every morning.', sentenceZh: '每天早晨整理好温馨小床。', riddle: 'I am soft and warm, and you sleep on me at night!' },
            { id: 'w_sofa', word: 'sofa', phonics: 's-o-fa', ipa: '/ˈsəʊfə/', zh: '沙发', icon: '🛋️', level: 1, sentence: 'Read a book on the soft sofa.', sentenceZh: '在柔软的沙发上看书。' },
            { id: 'w_table', word: 'table', phonics: 't-a-ble', ipa: '/ˈteɪbl/', zh: '餐桌/桌子', icon: '🍽️', level: 2, sentence: 'Put fresh fruit on the table.', sentenceZh: '把新鲜水果摆在桌子上。' },
            { id: 'w_door', word: 'door', phonics: 'd-oor', ipa: '/dɔːr/', zh: '门', icon: '🚪', level: 1, sentence: 'Knock politely on the wooden door.', sentenceZh: '礼貌地敲敲木门。' },
            { id: 'w_window', word: 'window', phonics: 'w-in-dow', ipa: '/ˈwɪndəʊ/', zh: '窗户', icon: '🪟', level: 2, sentence: 'Sunshine comes through the window.', sentenceZh: '阳光透过窗户照进来。' },
            { id: 'w_lamp', word: 'lamp', phonics: 'l-a-mp', ipa: '/læmp/', zh: '台灯', icon: '💡', level: 1, sentence: 'Turn on the desk lamp to read.', sentenceZh: '打开台灯认真阅读。' },
            { id: 'w_mirror', word: 'mirror', phonics: 'm-i-rr-or', ipa: '/ˈmɪrər/', zh: '镜子', icon: '🪞', level: 2, sentence: 'Smile at yourself in the mirror!', sentenceZh: '对着镜子里的自己笑一笑！', riddle: 'Look at me and you will see your own smiling face!' },
            { id: 'w_floor', word: 'floor', phonics: 'fl-oor', ipa: '/flɔːr/', zh: '地板', icon: '🧹', level: 2, sentence: 'Sweep the clean wooden floor.', sentenceZh: '把木地板打扫得干干净净。' },
            { id: 'w_wall', word: 'wall', phonics: 'w-all', ipa: '/wɔːl/', zh: '墙壁', icon: '🧱', level: 1, sentence: 'Hang a nice picture on the wall.', sentenceZh: '在墙上挂一幅漂亮的画。' },
            { id: 'w_key', word: 'key', phonics: 'k-ey', ipa: '/kiː/', zh: '钥匙', icon: '🔑', level: 1, sentence: 'Use the golden key to open the box.', sentenceZh: '用金钥匙打开宝箱。', riddle: 'I am small and metal, and I unlock doors and treasure chests!' },
            { id: 'w_box', word: 'box', phonics: 'b-o-x', ipa: '/bɒks/', zh: '盒子/箱子', icon: '📦', level: 1, sentence: 'Put your toys inside the box.', sentenceZh: '把玩具收纳进箱子里。' },
            { id: 'w_cup', word: 'cup', phonics: 'c-u-p', ipa: '/kʌp/', zh: '杯子', icon: '🥤', level: 1, sentence: 'Pour warm water into my cup.', sentenceZh: '往我的杯子里倒温水。' },
            { id: 'w_plate', word: 'plate', phonics: 'pl-a-te', ipa: '/pleɪt/', zh: '盘子', icon: '🍽️', level: 2, sentence: 'Wash my dinner plate cleanly.', sentenceZh: '把餐盘洗得亮晶晶。' },
            { id: 'w_spoon', word: 'spoon', phonics: 'sp-oo-n', ipa: '/spuːn/', zh: '勺子', icon: '🥄', level: 2, sentence: 'Eat hot soup with a spoon.', sentenceZh: '用小勺子喝热汤。' },
            { id: 'w_fork', word: 'fork', phonics: 'f-or-k', ipa: '/fɔːrk/', zh: '餐叉', icon: '🍴', level: 2, sentence: 'Pick up fruit salad with a fork.', sentenceZh: '用餐叉吃水果沙拉。' },
            { id: 'w_bowl', word: 'bowl', phonics: 'b-ow-l', ipa: '/bəʊl/', zh: '碗', icon: '🥣', level: 2, sentence: 'A warm bowl of noodles is ready!', sentenceZh: '一碗热腾腾的面条好啦！' },
            { id: 'w_towel', word: 'towel', phonics: 't-ow-el', ipa: '/ˈtaʊəl/', zh: '毛巾', icon: '🧺', level: 2, sentence: 'Dry your hands with a clean towel.', sentenceZh: '用干净毛巾擦干小手。' },
            { id: 'w_pillow', word: 'pillow', phonics: 'p-i-ll-ow', ipa: '/ˈpɪləʊ/', zh: '枕头', icon: '🛌', level: 2, sentence: 'Rest your head on a soft pillow.', sentenceZh: '把头靠在软软的枕头上。' }
        ]
    },
    {
        id: 'pack_feelings',
        name: '心情与品格',
        enCategory: 'Feelings & Character',
        icon: '😊',
        words: [
            { id: 'w_sad', word: 'sad', phonics: 's-a-d', ipa: '/sæd/', zh: '难过的', icon: '😢', level: 1, sentence: 'Give a hug when a friend feels sad.', sentenceZh: '朋友难过时给个拥抱。' },
            { id: 'w_angry', word: 'angry', phonics: 'an-gr-y', ipa: '/ˈæŋɡri/', zh: '生气的', icon: '😠', level: 2, sentence: 'Take a deep breath when angry.', sentenceZh: '生气时先做个深呼吸。' },
            { id: 'w_tired', word: 'tired', phonics: 't-ire-d', ipa: '/ˈtaɪərd/', zh: '疲倦的', icon: '🥱', level: 2, sentence: 'Take a rest if you feel tired.', sentenceZh: '如果累了就休息一下。' },
            { id: 'w_hungry', word: 'hungry', phonics: 'h-un-gr-y', ipa: '/ˈhʌŋɡri/', zh: '饥饿的', icon: '😋', level: 2, sentence: 'The hungry bunny wants a carrot.', sentenceZh: '肚子饿的小兔想吃胡萝卜。' },
            { id: 'w_thirsty', word: 'thirsty', phonics: 'th-ir-sty', ipa: '/ˈθɜːrsti/', zh: '口渴的', icon: '🥤', level: 2, sentence: 'Drink some water when thirsty.', sentenceZh: '口渴的时候喝点水。' },
            { id: 'w_excited', word: 'excited', phonics: 'ex-ci-ted', ipa: '/ɪkˈsaɪtɪd/', zh: '兴奋的', icon: '🤩', level: 3, sentence: 'We are excited about the trip!', sentenceZh: '我们对这次旅行兴奋极了！' },
            { id: 'w_proud', word: 'proud', phonics: 'pr-ou-d', ipa: '/praʊd/', zh: '自豪的', icon: '🏅', level: 2, sentence: 'Mom is proud of your hard work.', sentenceZh: '妈妈为你的努力感到自豪。' },
            { id: 'w_kind', word: 'kind', phonics: 'k-i-nd', ipa: '/kaɪnd/', zh: '善良的', icon: '💝', level: 1, sentence: 'Always be kind to little animals.', sentenceZh: '永远善待小动物们。' },
            { id: 'w_clever', word: 'clever', phonics: 'cl-e-v-er', ipa: '/ˈklevər/', zh: '机灵的', icon: '🧠', level: 2, sentence: 'Clever kids solve puzzles fast!', sentenceZh: '机灵的小朋友解谜真快！' },
            { id: 'w_quiet', word: 'quiet', phonics: 'qu-i-et', ipa: '/ˈkwaɪət/', zh: '安静的', icon: '🤫', level: 2, sentence: 'Please keep quiet in the library.', sentenceZh: '在图书馆里请保持安静。' },
            { id: 'w_busy', word: 'busy', phonics: 'b-u-sy', ipa: '/ˈbɪzi/', zh: '忙碌的', icon: '🐝', level: 2, sentence: 'Little bees are busy in spring.', sentenceZh: '春天的小蜜蜂真忙碌。' },
            { id: 'w_lucky', word: 'lucky', phonics: 'l-u-ck-y', ipa: '/ˈlʌki/', zh: '幸运的', icon: '🍀', level: 2, sentence: 'Four-leaf clover brings lucky stars!', sentenceZh: '四叶草带来幸运星！' },
            { id: 'w_funny', word: 'funny', phonics: 'f-u-nn-y', ipa: '/ˈfʌni/', zh: '滑稽有趣的', icon: '🤡', level: 2, sentence: 'Grandpa tells a funny joke.', sentenceZh: '爷爷讲了一个有趣的笑话。' },
            { id: 'w_careful', word: 'careful', phonics: 'care-ful', ipa: '/ˈkeəfl/', zh: '细心的', icon: '🔍', level: 3, sentence: 'Be careful when checking numbers!', sentenceZh: '检查数字时要细心哦！' },
            { id: 'w_polite', word: 'polite', phonics: 'po-li-te', ipa: '/pəˈlaɪt/', zh: '有礼貌的', icon: '🙇', level: 3, sentence: 'Polite children say please and thanks.', sentenceZh: '有礼貌的孩子常说请和谢谢。' },
            { id: 'w_ready', word: 'ready', phonics: 'r-ea-dy', ipa: '/ˈredi/', zh: '准备好的', icon: '🏁', level: 2, sentence: 'Are you ready for the next wave?', sentenceZh: '你准备好迎接下一波了吗？' },
            { id: 'w_shy', word: 'shy', phonics: 'sh-y', ipa: '/ʃaɪ/', zh: '害羞的', icon: '🙈', level: 1, sentence: 'Scaredy-shroom is a little shy.', sentenceZh: '胆小菇有一点点害羞。' },
            { id: 'w_gentle', word: 'gentle', phonics: 'g-en-tle', ipa: '/ˈdʒentl/', zh: '温柔的', icon: '🕊️', level: 2, sentence: 'Pet the kitten with gentle hands.', sentenceZh: '用温柔的小手摸摸小猫。' }
        ]
    },
    {
        id: 'pack_sports',
        name: '运动与乐器',
        enCategory: 'Sports & Toys',
        icon: '⚽',
        words: [
            { id: 'w_ball', word: 'ball', phonics: 'b-all', ipa: '/bɔːl/', zh: '球', icon: '⚽', level: 1, sentence: 'Pass the round ball to me!', sentenceZh: '把圆圆的球传给我！' },
            { id: 'w_kite', word: 'kite', phonics: 'k-i-te', ipa: '/kaɪt/', zh: '风筝', icon: '🪁', level: 1, sentence: 'Fly a colorful kite in the park.', sentenceZh: '在公园里放五彩风筝。', riddle: 'I fly high on a long string when the wind blows!' },
            { id: 'w_doll', word: 'doll', phonics: 'd-o-ll', ipa: '/dɒl/', zh: '玩偶/洋娃娃', icon: '🪆', level: 1, sentence: 'The little doll wears a red hat.', sentenceZh: '小玩偶戴着一顶红帽子。' },
            { id: 'w_robot', word: 'robot', phonics: 'r-o-b-ot', ipa: '/ˈrəʊbɒt/', zh: '机器人', icon: '🤖', level: 2, sentence: 'My smart robot can dance and talk!', sentenceZh: '我的智能机器人会跳舞说话！' },
            { id: 'w_puzzle', word: 'puzzle', phonics: 'p-u-zz-le', ipa: '/ˈpʌzl/', zh: '拼图/谜题', icon: '🧩', level: 2, sentence: 'Finish a big jigsaw puzzle together.', sentenceZh: '一起拼完大拼图。' },
            { id: 'w_drum', word: 'drum', phonics: 'dr-u-m', ipa: '/drʌm/', zh: '鼓', icon: '🥁', level: 1, sentence: 'Beat the happy drum: boom, boom!', sentenceZh: '敲响欢乐的小鼓：咚咚咚！' },
            { id: 'w_piano', word: 'piano', phonics: 'pi-a-no', ipa: '/piˈænəʊ/', zh: '钢琴', icon: '🎹', level: 2, sentence: 'Sister plays a song on the piano.', sentenceZh: '姐姐在钢琴上弹奏乐曲。', riddle: 'I have black and white keys that make sweet music!' },
            { id: 'w_guitar', word: 'guitar', phonics: 'gui-t-ar', ipa: '/ɡɪˈtɑːr/', zh: '吉他', icon: '🎸', level: 2, sentence: 'Strum a cheerful tune on the guitar.', sentenceZh: '用吉他弹奏欢快的曲子。' },
            { id: 'w_chess', word: 'chess', phonics: 'ch-e-ss', ipa: '/tʃes/', zh: '国际象棋/棋', icon: '♟️', level: 2, sentence: 'Think twice before moving in chess.', sentenceZh: '下棋落子前要多思考。' },
            { id: 'w_skate', word: 'skate', phonics: 'sk-a-te', ipa: '/skeɪt/', zh: '滑冰/轮滑', icon: '⛸️', level: 2, sentence: 'Glide smoothly on ice skates!', sentenceZh: '穿着冰鞋顺畅滑行！' },
            { id: 'w_climb', word: 'climb', phonics: 'cl-i-mb', ipa: '/klaɪm/', zh: '攀爬', icon: '🧗', level: 2, sentence: 'Climb to the top of the hill.', sentenceZh: '爬上小山丘的顶峰。' },
            { id: 'w_catch', word: 'catch', phonics: 'c-a-tch', ipa: '/kætʃ/', zh: '接住/捕捉', icon: '🧤', level: 2, sentence: 'Jump up and catch the flying ball!', sentenceZh: '跳起来接住飞来的球！' },
            { id: 'w_throw', word: 'throw', phonics: 'thr-ow', ipa: '/θrəʊ/', zh: '投掷/扔', icon: '🤾', level: 2, sentence: 'Throw the beanbag into the basket.', sentenceZh: '把沙包投进篮筐里。' },
            { id: 'w_kick', word: 'kick', phonics: 'k-i-ck', ipa: '/kɪk/', zh: '踢', icon: '👟', level: 1, sentence: 'Kick the football into the goal!', sentenceZh: '把足球踢进球门！' },
            { id: 'w_win', word: 'win', phonics: 'w-i-n', ipa: '/wɪn/', zh: '获胜/赢', icon: '🏆', level: 1, sentence: 'Work together and win the trophy!', sentenceZh: '齐心协力赢得奖杯！' },
            { id: 'w_team', word: 'team', phonics: 't-ea-m', ipa: '/tiːm/', zh: '团队/队伍', icon: '🙌', level: 1, sentence: 'Plants make a great defense team!', sentenceZh: '植物们组成超棒的守卫小队！' },
            { id: 'w_game', word: 'game', phonics: 'g-a-me', ipa: '/ɡeɪm/', zh: '游戏/比赛', icon: '🎮', level: 1, sentence: 'Let us play a fun word game!', sentenceZh: '让我们玩个有趣的单词游戏！' },
            { id: 'w_race', word: 'race', phonics: 'r-a-ce', ipa: '/reɪs/', zh: '赛跑/竞赛', icon: '🏎️', level: 1, sentence: 'Bunny and turtle have a race.', sentenceZh: '兔子和乌龟比赛跑。' }
        ]
    },
    {
        id: 'pack_ocean_space',
        name: '海洋与太空',
        enCategory: 'Ocean & Space',
        icon: '🌌',
        words: [
            { id: 'w_shark', word: 'shark', phonics: 'sh-ar-k', ipa: '/ʃɑːrk/', zh: '鲨鱼', icon: '🦈', level: 2, sentence: 'A fast shark swims in the ocean.', sentenceZh: '敏捷的鲨鱼在海洋游弋。' },
            { id: 'w_dolphin', word: 'dolphin', phonics: 'd-ol-ph-in', ipa: '/ˈdɒlfɪn/', zh: '海豚', icon: '🐬', level: 3, sentence: 'Friendly dolphin leaps over waves!', sentenceZh: '友好的海豚跃过海浪！' },
            { id: 'w_crab', word: 'crab', phonics: 'cr-a-b', ipa: '/kræb/', zh: '螃蟹', icon: '🦀', level: 1, sentence: 'Little red crab walks sideways.', sentenceZh: '小红螃蟹横着走。', riddle: 'I have two big claws and walk sideways on the sand!' },
            { id: 'w_turtle', word: 'turtle', phonics: 't-ur-tle', ipa: '/ˈtɜːrtl/', zh: '海龟/乌龟', icon: '🐢', level: 2, sentence: 'Sea turtle carries a hard shell.', sentenceZh: '海龟背着坚硬的壳。', riddle: 'I walk slowly on land and carry my hard house on my back!' },
            { id: 'w_shell', word: 'shell', phonics: 'sh-e-ll', ipa: '/ʃel/', zh: '贝壳', icon: '🐚', level: 2, sentence: 'Pick up a pink shell by the sea.', sentenceZh: '在海边捡起一枚粉贝壳。' },
            { id: 'w_octopus', word: 'octopus', phonics: 'oc-to-pus', ipa: '/ˈɒktəpəs/', zh: '章鱼', icon: '🐙', level: 3, sentence: 'Clever octopus waves eight arms!', sentenceZh: '聪明的章鱼挥动八条腕足！' },
            { id: 'w_coral', word: 'coral', phonics: 'c-o-r-al', ipa: '/ˈkɒrəl/', zh: '珊瑚', icon: '🪸', level: 2, sentence: 'Colorful coral grows under the sea.', sentenceZh: '五彩珊瑚生长在海底。' },
            { id: 'w_earth', word: 'earth', phonics: 'ear-th', ipa: '/ɜːrθ/', zh: '地球', icon: '🌎', level: 2, sentence: 'Blue Earth is our shared home.', sentenceZh: '蓝色地球是我们共同的家园。', riddle: 'I am the blue and green planet where we all live!' },
            { id: 'w_planet', word: 'planet', phonics: 'pl-a-n-et', ipa: '/ˈplænɪt/', zh: '行星/星球', icon: '🪐', level: 2, sentence: 'Saturn is a planet with rings.', sentenceZh: '土星是一颗带着光环的行星。' },
            { id: 'w_space', word: 'space', phonics: 'sp-a-ce', ipa: '/speɪs/', zh: '太空', icon: '🌌', level: 2, sentence: 'Stars sparkle in outer space.', sentenceZh: '繁星在外太空闪烁。' },
            { id: 'w_alien', word: 'alien', phonics: 'a-li-en', ipa: '/ˈeɪliən/', zh: '外星小客', icon: '👽', level: 2, sentence: 'A cute alien waves from Mars!', sentenceZh: '可爱的外星朋友挥手问好！' },
            { id: 'w_comet', word: 'comet', phonics: 'c-o-m-et', ipa: '/ˈkɒmɪt/', zh: '彗星', icon: '☄️', level: 2, sentence: 'A bright comet has a long tail.', sentenceZh: '明亮的彗星拖着长尾巴。' },
            { id: 'w_astronaut', word: 'astronaut', phonics: 'as-tro-naut', ipa: '/ˈæstrənɔːt/', zh: '宇航员', icon: '🧑‍🚀', level: 3, sentence: 'Brave astronaut floats in space!', sentenceZh: '勇敢的宇航员在太空漫步！' },
            { id: 'w_wave', word: 'wave', phonics: 'w-a-ve', ipa: '/weɪv/', zh: '海浪/挥手', icon: '🌊', level: 1, sentence: 'Blue ocean waves splash gently.', sentenceZh: '蓝色海浪轻轻拍打。' },
            { id: 'w_sand', word: 'sand', phonics: 's-a-nd', ipa: '/sænd/', zh: '沙子', icon: '🏖️', level: 1, sentence: 'Soft golden sand under my feet.', sentenceZh: '脚下是柔软的金色细沙。' },
            { id: 'w_deep', word: 'deep', phonics: 'd-ee-p', ipa: '/diːp/', zh: '深的', icon: '⚓', level: 1, sentence: 'Treasure hides in the deep sea.', sentenceZh: '宝藏藏在深海之中。' },
            { id: 'w_shine', word: 'shine', phonics: 'sh-i-ne', ipa: '/ʃaɪn/', zh: '闪耀/发光', icon: '✨', level: 2, sentence: 'Little stars shine all night.', sentenceZh: '小星星整晚闪闪发光。' },
            { id: 'w_stone', word: 'stone', phonics: 'st-o-ne', ipa: '/stəʊn/', zh: '石头', icon: '🪨', level: 2, sentence: 'Skip a smooth stone on the water.', sentenceZh: '在水面上打个漂亮的石漂。' }
        ]
    },
    {
        id: 'pack_bugs_garden',
        name: '昆虫与森林',
        enCategory: 'Bugs & Forest',
        icon: '🦋',
        words: [
            { id: 'w_bee', word: 'bee', phonics: 'b-ee', ipa: '/biː/', zh: '蜜蜂', icon: '🐝', level: 1, sentence: 'Busy bee makes sweet honey.', sentenceZh: '勤劳的小蜜蜂酿造甜蜂蜜。', riddle: 'I buzz around flowers and make sweet golden honey!' },
            { id: 'w_ant', word: 'ant', phonics: 'a-nt', ipa: '/ænt/', zh: '蚂蚁', icon: '🐜', level: 1, sentence: 'Tiny ants carry food together.', sentenceZh: '小蚂蚁们齐心协力搬食物。' },
            { id: 'w_butterfly', word: 'butterfly', phonics: 'bu-tter-fly', ipa: '/ˈbʌtərflaɪ/', zh: '蝴蝶', icon: '🦋', level: 3, sentence: 'A colorful butterfly lands on a rose.', sentenceZh: '彩蝶停在玫瑰花上。' },
            { id: 'w_spider', word: 'spider', phonics: 'sp-i-d-er', ipa: '/ˈspaɪdər/', zh: '蜘蛛', icon: '🕷️', level: 2, sentence: 'Clever spider spins a neat web.', sentenceZh: '小蜘蛛织出整齐的网。' },
            { id: 'w_ladybug', word: 'ladybug', phonics: 'la-dy-bug', ipa: '/ˈleɪdibʌɡ/', zh: '七星瓢虫', icon: '🐞', level: 3, sentence: 'Red ladybug has black spots.', sentenceZh: '红瓢虫背上有黑点点。' },
            { id: 'w_snail', word: 'snail', phonics: 'sn-ai-l', ipa: '/sneɪl/', zh: '蜗牛', icon: '🐌', level: 2, sentence: 'Little snail climbs up the leaf.', sentenceZh: '小蜗牛慢慢爬上树叶。' },
            { id: 'w_worm', word: 'worm', phonics: 'w-or-m', ipa: '/wɜːrm/', zh: '小虫/蚯蚓', icon: '🪱', level: 1, sentence: 'Early bird catches the worm.', sentenceZh: '早起的鸟儿有虫吃。' },
            { id: 'w_seed', word: 'seed', phonics: 's-ee-d', ipa: '/siːd/', zh: '种子', icon: '🌱', level: 1, sentence: 'Plant a plant seed in the garden.', sentenceZh: '在花园里种下一颗植物种子。' },
            { id: 'w_grass', word: 'grass', phonics: 'gr-a-ss', ipa: '/ɡrɑːs/', zh: '青草/草地', icon: '🌿', level: 1, sentence: 'Green grass covers the lawn.', sentenceZh: '绿茵茵的青草铺满草坪。' },
            { id: 'w_rose', word: 'rose', phonics: 'r-o-se', ipa: '/rəʊz/', zh: '玫瑰花', icon: '🌹', level: 1, sentence: 'Red rose smells sweet and fresh.', sentenceZh: '红玫瑰闻起来芳香扑鼻。' },
            { id: 'w_bamboo', word: 'bamboo', phonics: 'bam-b-oo', ipa: '/ˌbæmˈbuː/', zh: '竹子', icon: '🎍', level: 2, sentence: 'Tall green bamboo grows fast.', sentenceZh: '高高的绿竹子长得真快。' },
            { id: 'w_mushroom', word: 'mushroom', phonics: 'm-u-sh-room', ipa: '/ˈmʌʃrʊm/', zh: '蘑菇', icon: '🍄', level: 3, sentence: 'Cute mushroom wears a red cap!', sentenceZh: '可爱的小蘑菇戴着红伞帽！' },
            { id: 'w_root', word: 'root', phonics: 'r-oo-t', ipa: '/ruːt/', zh: '树根', icon: '🪹', level: 2, sentence: 'Deep roots drink water in soil.', sentenceZh: '深深的树根在泥土里喝水。' },
            { id: 'w_branch', word: 'branch', phonics: 'br-an-ch', ipa: '/brɑːntʃ/', zh: '树枝', icon: '🪵', level: 2, sentence: 'Squirrel jumps onto a tree branch.', sentenceZh: '小松鼠跳到树枝上。' },
            { id: 'w_forest', word: 'forest', phonics: 'f-o-r-est', ipa: '/ˈfɒrɪst/', zh: '森林', icon: '🌲', level: 2, sentence: 'Many animals live in the forest.', sentenceZh: '许多动物生活在森林里。' },
            { id: 'w_hill', word: 'hill', phonics: 'h-i-ll', ipa: '/hɪl/', zh: '小山丘', icon: '⛰️', level: 1, sentence: 'Run up the green grassy hill.', sentenceZh: '跑上绿油油的小山坡。' },
            { id: 'w_pond', word: 'pond', phonics: 'p-o-nd', ipa: '/pɒnd/', zh: '池塘', icon: '🪷', level: 1, sentence: 'Lotus blooms in the clear pond.', sentenceZh: '荷花在清澈的池塘盛开。' },
            { id: 'w_nest', word: 'nest', phonics: 'n-e-st', ipa: '/nest/', zh: '鸟巢/鸟窝', icon: '🪺', level: 1, sentence: 'Baby birds rest in the warm nest.', sentenceZh: '小雏鸟在温暖鸟巢里休息。' }
        ]
    },
    {
        id: 'pack_shapes_dir',
        name: '形状与方位',
        enCategory: 'Shapes & Directions',
        icon: '📐',
        words: [
            { id: 'w_circle', word: 'circle', phonics: 'c-ir-cle', ipa: '/ˈsɜːrkl/', zh: '圆形', icon: '⭕', level: 2, sentence: 'Draw a round circle like the sun.', sentenceZh: '画一个像太阳一样圆的圆形。', riddle: 'I am a smooth round shape with zero corners!' },
            { id: 'w_square', word: 'square', phonics: 'squ-are', ipa: '/skweər/', zh: '正方形', icon: '🟦', level: 2, sentence: 'A square has four equal sides.', sentenceZh: '正方形有四条相等的边。', riddle: 'I am a shape with four equal sides and four corners!' },
            { id: 'w_triangle', word: 'triangle', phonics: 'tri-an-gle', ipa: '/ˈtraɪæŋɡl/', zh: '三角形', icon: '🔺', level: 3, sentence: 'A triangle has three sharp corners.', sentenceZh: '三角形有三个角。', riddle: 'I am a neat shape with three sides and three corners!' },
            { id: 'w_line', word: 'line', phonics: 'l-i-ne', ipa: '/laɪn/', zh: '线条/排成队', icon: '📏', level: 1, sentence: 'Stand in a neat straight line.', sentenceZh: '排成整齐的一条直线。' },
            { id: 'w_point', word: 'point', phonics: 'p-oi-nt', ipa: '/pɔɪnt/', zh: '点/指向', icon: '👆', level: 2, sentence: 'Point to the right word card!', sentenceZh: '指向正确的单词卡！' },
            { id: 'w_left', word: 'left', phonics: 'l-e-ft', ipa: '/left/', zh: '左边', icon: '⬅️', level: 1, sentence: 'Turn left at the flower shop.', sentenceZh: '在花店路口向左转。' },
            { id: 'w_right', word: 'right', phonics: 'r-igh-t', ipa: '/raɪt/', zh: '右边/正确的', icon: '➡️', level: 1, sentence: 'Raise your right hand high!', sentenceZh: '高高举起你的右手！' },
            { id: 'w_up', word: 'up', phonics: 'u-p', ipa: '/ʌp/', zh: '向上', icon: '⬆️', level: 1, sentence: 'Balloons float up into the sky.', sentenceZh: '气球向上飘进天空。' },
            { id: 'w_down', word: 'down', phonics: 'd-ow-n', ipa: '/daʊn/', zh: '向下', icon: '⬇️', level: 1, sentence: 'Sit down and listen to the story.', sentenceZh: '坐下来听故事吧。' },
            { id: 'w_front', word: 'front', phonics: 'fr-o-nt', ipa: '/frʌnt/', zh: '前面', icon: '🛡️', level: 2, sentence: 'Wall-nut stands in front of peas.', sentenceZh: '坚果墙站在豌豆射手前面。' },
            { id: 'w_back', word: 'back', phonics: 'b-a-ck', ipa: '/bæk/', zh: '后面/返回', icon: '🔙', level: 1, sentence: 'Welcome back to our pet town!', sentenceZh: '欢迎回到我们的萌宠小镇！' },
            { id: 'w_inside', word: 'inside', phonics: 'in-s-i-de', ipa: '/ˌɪnˈsaɪd/', zh: '在里面', icon: '📥', level: 2, sentence: 'What surprise is inside the egg?', sentenceZh: '扭蛋里面藏着什么惊喜呢？' },
            { id: 'w_outside', word: 'outside', phonics: 'out-s-i-de', ipa: '/ˌaʊtˈsaɪd/', zh: '在外面', icon: '🏞️', level: 2, sentence: 'Let us play outside in the sun!', sentenceZh: '让我们去外面阳光下玩吧！' },
            { id: 'w_near', word: 'near', phonics: 'n-ear', ipa: '/nɪər/', zh: '在附近/近的', icon: '📍', level: 1, sentence: 'The bakery is near our school.', sentenceZh: '烘焙坊就在学校附近。' },
            { id: 'w_far', word: 'far', phonics: 'f-ar', ipa: '/fɑːr/', zh: '遥远的', icon: '🔭', level: 1, sentence: 'Stars are far away in space.', sentenceZh: '星星在遥远的太空中。' },
            { id: 'w_half', word: 'half', phonics: 'h-al-f', ipa: '/hɑːf/', zh: '一半', icon: '🌓', level: 2, sentence: 'Share half of my apple with you.', sentenceZh: '分一半苹果给你。' },
            { id: 'w_pair', word: 'pair', phonics: 'p-air', ipa: '/peər/', zh: '一双/一对', icon: '👟', level: 2, sentence: 'Put on a new pair of shoes.', sentenceZh: '穿上一双新鞋子。' },
            { id: 'w_group', word: 'group', phonics: 'gr-ou-p', ipa: '/ɡruːp/', zh: '一组/小组', icon: '👥', level: 2, sentence: 'Discuss together in a small group.', sentenceZh: '在小组里一起讨论。' }
        ]
    },
    {
        id: 'pack_calendar_life',
        name: '星期与作息',
        enCategory: 'Week & Routine',
        icon: '🗓️',
        words: [
            { id: 'w_monday', word: 'Monday', phonics: 'M-on-day', ipa: '/ˈmʌndeɪ/', zh: '星期一', icon: '1️⃣', level: 2, sentence: 'Monday starts a brand new week!', sentenceZh: '星期一开启崭新的一周！' },
            { id: 'w_tuesday', word: 'Tuesday', phonics: 'T-ues-day', ipa: '/ˈtjuːzdeɪ/', zh: '星期二', icon: '2️⃣', level: 2, sentence: 'We have art class on Tuesday.', sentenceZh: '星期二我们有美术课。' },
            { id: 'w_wednesday', word: 'Wednesday', phonics: 'W-ed-nes-day', ipa: '/ˈwenzdeɪ/', zh: '星期三', icon: '3️⃣', level: 3, sentence: 'Play sports on Wednesday afternoon.', sentenceZh: '星期三下午去运动。' },
            { id: 'w_thursday', word: 'Thursday', phonics: 'Th-ur-s-day', ipa: '/ˈθɜːrzdeɪ/', zh: '星期四', icon: '4️⃣', level: 3, sentence: 'Read library books on Thursday.', sentenceZh: '星期四读图书馆绘本。' },
            { id: 'w_friday', word: 'Friday', phonics: 'Fr-i-day', ipa: '/ˈfraɪdeɪ/', zh: '星期五', icon: '5️⃣', level: 2, sentence: 'Happy Friday! Weekend is coming!', sentenceZh: '快乐星期五！周末要来啦！' },
            { id: 'w_saturday', word: 'Saturday', phonics: 'Sa-tur-day', ipa: '/ˈsætərdeɪ/', zh: '星期六', icon: '🎡', level: 3, sentence: 'Go to the park on Saturday.', sentenceZh: '星期六去公园玩耍。' },
            { id: 'w_sunday', word: 'Sunday', phonics: 'S-un-day', ipa: '/ˈsʌndeɪ/', zh: '星期日', icon: '☀️', level: 2, sentence: 'Visit grandma on sunny Sunday.', sentenceZh: '晴朗的星期日去看望奶奶。' },
            { id: 'w_noon', word: 'noon', phonics: 'n-oo-n', ipa: '/nuːn/', zh: '正午/中午', icon: '🕛', level: 1, sentence: 'The sun is high at twelve noon.', sentenceZh: '中午十二点太阳高高挂。' },
            { id: 'w_evening', word: 'evening', phonics: 'e-ve-ning', ipa: '/ˈiːvnɪŋ/', zh: '傍晚/晚上', icon: '🌆', level: 2, sentence: 'Take a walk in the cool evening.', sentenceZh: '在凉爽的傍晚散散步。' },
            { id: 'w_hour', word: 'hour', phonics: 'h-our', ipa: '/ˈaʊər/', zh: '小时', icon: '⏳', level: 2, sentence: 'Sixty minutes make one hour.', sentenceZh: '六十分钟等于一小时。' },
            { id: 'w_minute', word: 'minute', phonics: 'm-i-n-ute', ipa: '/ˈmɪnɪt/', zh: '分钟', icon: '⏱️', level: 2, sentence: 'Wait just one minute, please!', sentenceZh: '请稍等一分钟哦！' },
            { id: 'w_early', word: 'early', phonics: 'ear-ly', ipa: '/ˈɜːrli/', zh: '早早地', icon: '🌅', level: 2, sentence: 'Wake up early with a big smile.', sentenceZh: '带着笑容早早起床。' },
            { id: 'w_late', word: 'late', phonics: 'l-a-te', ipa: '/leɪt/', zh: '晚的/迟的', icon: '🌙', level: 1, sentence: 'Never be late for school!', sentenceZh: '上学可不要迟到哦！' },
            { id: 'w_watch', word: 'watch', phonics: 'w-a-tch', ipa: '/wɒtʃ/', zh: '手表/观看', icon: '⌚', level: 2, sentence: 'Check the time on my wrist watch.', sentenceZh: '看看手腕上的小手表。' },
            { id: 'w_lunch', word: 'lunch', phonics: 'l-un-ch', ipa: '/lʌntʃ/', zh: '午餐', icon: '🍱', level: 1, sentence: 'Eat healthy veggies for lunch.', sentenceZh: '午餐吃健康的蔬菜。' },
            { id: 'w_dinner', word: 'dinner', phonics: 'd-i-nn-er', ipa: '/ˈdɪnər/', zh: '晚餐', icon: '🍲', level: 2, sentence: 'Enjoy warm dinner with family.', sentenceZh: '和家人享用温馨晚餐。' },
            { id: 'w_holiday', word: 'holiday', phonics: 'ho-li-day', ipa: '/ˈhɒlədeɪ/', zh: '假期/节日', icon: '🎈', level: 3, sentence: 'Have a wonderful summer holiday!', sentenceZh: '祝你度过快乐的暑假！' },
            { id: 'w_dream', word: 'dream', phonics: 'dr-ea-m', ipa: '/driːm/', zh: '梦想/美梦', icon: '💫', level: 2, sentence: 'Sweet dreams, little star!', sentenceZh: '做个甜甜的美梦，小星星！' }
        ]
    },
    {
        id: 'pack_daily_verbs',
        name: '日常交际动词',
        enCategory: 'Daily Verbs',
        icon: '💬',
        words: [
            { id: 'w_open', word: 'open', phonics: 'o-p-en', ipa: '/ˈəʊpən/', zh: '打开', icon: '📖', level: 1, sentence: 'Open the window for fresh air.', sentenceZh: '打开窗户呼吸新鲜空气。' },
            { id: 'w_close', word: 'close', phonics: 'cl-o-se', ipa: '/kləʊz/', zh: '关上/合上', icon: '🚪', level: 1, sentence: 'Gently close the door behind you.', sentenceZh: '随手轻轻关好门。' },
            { id: 'w_clean', word: 'clean', phonics: 'cl-ea-n', ipa: '/kliːn/', zh: '打扫/干净的', icon: '🧹', level: 1, sentence: 'Clean our classroom together!', sentenceZh: '一起把教室打扫干净！' },
            { id: 'w_wash', word: 'wash', phonics: 'w-a-sh', ipa: '/wɒʃ/', zh: '清洗', icon: '🫧', level: 1, sentence: 'Wash apples before eating them.', sentenceZh: '吃苹果前要先洗干净。' },
            { id: 'w_brush', word: 'brush', phonics: 'br-u-sh', ipa: '/brʌʃ/', zh: '刷(牙)/画笔', icon: '🪥', level: 2, sentence: 'Brush your teeth twice a day.', sentenceZh: '每天早晚刷两次牙。' },
            { id: 'w_write', word: 'write', phonics: 'wr-i-te', ipa: '/raɪt/', zh: '书写/写字', icon: '✍️', level: 2, sentence: 'Write your name on the card.', sentenceZh: '把你的名字写在卡片上。' },
            { id: 'w_listen', word: 'listen', phonics: 'l-i-s-ten', ipa: '/ˈlɪsn/', zh: '倾听', icon: '👂', level: 2, sentence: 'Listen carefully to the teacher.', sentenceZh: '认真倾听老师讲课。' },
            { id: 'w_speak', word: 'speak', phonics: 'sp-ea-k', ipa: '/spiːk/', zh: '说/讲(语言)', icon: '🗣️', level: 2, sentence: 'Speak English loudly and bravely!', sentenceZh: '大声勇敢地说英语！' },
            { id: 'w_look', word: 'look', phonics: 'l-oo-k', ipa: '/lʊk/', zh: '看/瞧', icon: '👀', level: 1, sentence: 'Look at the bright rainbow!', sentenceZh: '快看那道绚丽的彩虹！' },
            { id: 'w_find', word: 'find', phonics: 'f-i-nd', ipa: '/faɪnd/', zh: '找到/发现', icon: '🔎', level: 1, sentence: 'Can you find the hidden star?', sentenceZh: '你能找到藏起来的星星吗？' },
            { id: 'w_carry', word: 'carry', phonics: 'c-a-rr-y', ipa: '/ˈkæri/', zh: '搬运/携带', icon: '🎒', level: 2, sentence: 'Help grandma carry the basket.', sentenceZh: '帮奶奶提着菜篮子。' },
            { id: 'w_share', word: 'share', phonics: 'sh-are', ipa: '/ʃeər/', zh: '分享', icon: '🍰', level: 2, sentence: 'Share sweet snacks with friends.', sentenceZh: '和好朋友分享甜美点心。' },
            { id: 'w_build', word: 'build', phonics: 'b-ui-ld', ipa: '/bɪld/', zh: '建造/搭建', icon: '🏗️', level: 2, sentence: 'Build a strong tower on the map!', sentenceZh: '在地图上建造坚固防御塔！' },
            { id: 'w_plant', word: 'plant', phonics: 'pl-a-nt', ipa: '/plɑːnt/', zh: '种植/植物', icon: '🌻', level: 2, sentence: 'Plant a sunflower in the yard.', sentenceZh: '在院子里种下一株向日葵。' },
            { id: 'w_buy', word: 'buy', phonics: 'b-uy', ipa: '/baɪ/', zh: '购买', icon: '🛒', level: 1, sentence: 'Buy fresh milk at the shop.', sentenceZh: '在商店买新鲜牛奶。' },
            { id: 'w_give', word: 'give', phonics: 'g-i-ve', ipa: '/ɡɪv/', zh: '给予/送给', icon: '🎁', level: 1, sentence: 'Give mom a pretty flower.', sentenceZh: '送给妈妈一朵漂亮的花。' },
            { id: 'w_wait', word: 'wait', phonics: 'w-ai-t', ipa: '/weɪt/', zh: '等待', icon: '🚦', level: 1, sentence: 'Wait for the green traffic light.', sentenceZh: '耐心等待绿灯亮起。' },
            { id: 'w_thank', word: 'thank', phonics: 'th-a-nk', ipa: '/θæŋk/', zh: '感谢', icon: '🙏', level: 1, sentence: 'Thank you for your warm help!', sentenceZh: '非常感谢你的热心帮助！' }
        ]
    }
];

export const ALL_WORDS = WORD_PACKS.flatMap(p =>
    p.words.map(w => ({ ...w, packId: p.id, packName: p.name, enCategory: p.enCategory || 'Fun Words' }))
);

function fisherYatesShuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function maskTargetWordInSentence(sentence, word) {
    const base = word.toLowerCase();
    const stem = base.endsWith('y') && base.length > 2 ? base.slice(0, -1) : (base.endsWith('e') && base.length > 2 ? base.slice(0, -1) : base);
    const patterns = [
        new RegExp(`\\b${escapeRegExp(word)}(?:es|s|d|ed|ing)?\\b`, 'gi'),
        new RegExp(`\\b${escapeRegExp(stem)}(?:ies|es|s|ed|ing)\\b`, 'gi')
    ];
    let masked = sentence;
    let replaced = false;
    for (const rx of patterns) {
        if (rx.test(masked)) {
            masked = masked.replace(rx, '____');
            replaced = true;
            break;
        }
    }
    if (!replaced) {
        masked = `Look! Here is ____! (${sentence})`;
    }
    return masked;
}

export class EnglishEngine {
    constructor(config = {}) {
        this._wordBags = new Map();       // packKey -> Array<wordObj> (不放回洗牌袋)
        this._recentWordIds = [];         // 近期滑窗防重队列
        this._recentCampWordIds = [];     // 背词营防重队列
        this._mistakeCooldownMap = {};    // wordId -> lastAskedTick
        this._questionTick = 0;
        this._lastType = null;
        this._sameTypeStreak = 0;

        this.setConfig(config);
        this.combo = 0;
        this.maxCombo = 0;
        this.currentQuiz = null;
        this.studySession = null;
        this._lastWordId = null;
        this._lastWasReview = false;
        this.mistakesProvider = null; // () => ({ wordMastery, englishMistakes })
    }

    setMistakesProvider(fn) {
        this.mistakesProvider = typeof fn === 'function' ? fn : null;
    }

    setConfig(cfg = {}) {
        const prev = this.config || {};
        const nextLevel = cfg.level || prev.level || 'level1_listen';
        const nextPackId = cfg.packId || prev.packId || 'all';
        const nextLessonId = cfg.courseLessonId || prev.courseLessonId || 'latest';
        const nextCourseSubMode = cfg.courseSubMode || prev.courseSubMode || 'course_all';

        const validDiffs = ['easy', 'medium', 'all'];
        let nextWordDifficulty = validDiffs.includes(cfg.wordDifficulty)
            ? cfg.wordDifficulty
            : (validDiffs.includes(prev.wordDifficulty) ? prev.wordDifficulty : (ENGLISH_LEVELS[nextLevel]?.wordDifficulty || 'easy'));

        const nextCourseAllowHard = typeof cfg.courseAllowHardDictation === 'boolean'
            ? cfg.courseAllowHardDictation
            : (typeof prev.courseAllowHardDictation === 'boolean'
                ? prev.courseAllowHardDictation
                : (nextWordDifficulty === 'all'));

        let enabledTypes = Array.isArray(cfg.enabledTypes) ? cfg.enabledTypes.filter(id => ALL_ENGLISH_TYPE_IDS.includes(id)) : null;
        if (!enabledTypes || enabledTypes.length === 0) {
            if (Array.isArray(prev.enabledTypes) && prev.enabledTypes.length > 0 && !cfg.level) {
                enabledTypes = [...prev.enabledTypes];
            } else {
                const preset = ENGLISH_LEVELS[nextLevel]?.presetTypes;
                enabledTypes = preset && preset.length > 0 ? [...preset] : [...DEFAULT_EASY_ENGLISH_TYPES];
            }
        }

        if (prev.wordDifficulty !== nextWordDifficulty || prev.packId !== nextPackId) {
            this._wordBags.clear();
        }

        this.config = {
            level: nextLevel,
            wordDifficulty: nextWordDifficulty,
            courseAllowHardDictation: nextCourseAllowHard,
            packId: nextPackId,
            courseLessonId: nextLessonId,
            courseSubMode: nextCourseSubMode,
            enabledTypes
        };
    }

    static getDefaultEnabledTypes(level = 'level1_listen') {
        return [...(ENGLISH_LEVELS[level]?.presetTypes || DEFAULT_EASY_ENGLISH_TYPES)];
    }

    static formatSummary(cfg) {
        if (!cfg) return '🌱轻松 · 5种友好题型';
        const diffObj = ENGLISH_DIFFICULTY_MODES.find(d => d.id === (cfg.wordDifficulty || 'easy')) || ENGLISH_DIFFICULTY_MODES[0];
        const enabled = Array.isArray(cfg.enabledTypes) && cfg.enabledTypes.length > 0
            ? cfg.enabledTypes
            : EnglishEngine.getDefaultEnabledTypes(cfg.level);
        if (enabled.length === 1 && enabled[0] === 'course_special') {
            const lesson = getPrimaryCourseLesson(cfg.courseLessonId || 'latest');
            return `${diffObj.shortName}·🎓仅校外课(${lesson?.code || 'S1U1W1'})`;
        }
        let typeSummary = '';
        if (enabled.length >= ALL_ENGLISH_TYPE_IDS.length) {
            typeSummary = '10题型全开';
        } else if (enabled.length <= 2) {
            typeSummary = enabled
                .map(id => ENGLISH_QUESTION_TYPES.find(t => t.id === id)?.shortName || id)
                .join('+');
        } else {
            typeSummary = `随机${enabled.length}题型`;
        }
        const packObj = cfg.packId && cfg.packId !== 'all'
            ? WORD_PACKS.find(p => p.id === cfg.packId)
            : null;
        return packObj ? `${diffObj.shortName}·${typeSummary}·${packObj.name}` : `${diffObj.shortName}·${typeSummary}`;
    }

    static renderPhonicsHtml(phonicsStr) {
        if (!phonicsStr) return '';
        const parts = phonicsStr.split('-');
        return parts.map(p => {
            const isVowelGroup = /[aeiouy]/i.test(p) && p.length <= 3 && /^[aeiouy]+$/i.test(p);
            const cls = isVowelGroup ? 'ph-vowel' : (/[aeiou]/i.test(p) ? 'ph-blend' : 'ph-cons');
            return `<span class="ph-chunk ${cls}">${p}</span>`;
        }).join('<span class="ph-dot">·</span>');
    }

    _filterWordsByDifficulty(wordsList, isSinglePack = false) {
        const diff = this.config?.wordDifficulty || 'easy';
        if (diff === 'easy') {
            const l1 = wordsList.filter(w => (w.level || 1) === 1);
            if (isSinglePack && l1.length < 8) {
                const l2Short = wordsList
                    .filter(w => (w.level || 1) === 2)
                    .sort((a, b) => a.word.length - b.word.length)
                    .slice(0, 8 - l1.length);
                return [...l1, ...l2Short];
            }
            return l1.length >= 6 ? l1 : wordsList;
        }
        if (diff === 'medium') {
            const l12 = wordsList.filter(w => (w.level || 1) <= 2);
            return l12.length >= 6 ? l12 : wordsList;
        }
        return wordsList;
    }

    getWordPool() {
        if (this.config.packId && this.config.packId !== 'all') {
            const pack = WORD_PACKS.find(p => p.id === this.config.packId);
            if (pack) {
                const mapped = pack.words.map(w => ({ ...w, packId: pack.id, packName: pack.name, enCategory: pack.enCategory }));
                return this._filterWordsByDifficulty(mapped, true);
            }
        }
        return this._filterWordsByDifficulty(ALL_WORDS, false);
    }

    /**
     * 从不放回洗牌袋抽取下一个单词，结合 40 词滑窗防重 + 未掌握词优先排前
     */
    _drawFromBag(pool, wordMastery = {}) {
        const diffKey = this.config?.wordDifficulty || 'easy';
        const packPart = (this.config.packId && this.config.packId !== 'all') ? this.config.packId : 'all';
        const packKey = `${packPart}|${diffKey}`;
        const maxRecentWindow = Math.min(40, Math.max(1, pool.length - 3));
        const recentSet = new Set(this._recentWordIds.slice(-maxRecentWindow));

        let bag = this._wordBags.get(packKey);
        if (!bag || bag.length === 0) {
            const unmastered = fisherYatesShuffle(pool.filter(w => (wordMastery[w.id] || 0) < 3));
            const mastered = fisherYatesShuffle(pool.filter(w => (wordMastery[w.id] || 0) >= 3));
            // 将未满星词与已满星词交错混合但优先未满星词，保证全词库完整遍历不重复
            bag = [...unmastered, ...mastered];
            this._wordBags.set(packKey, bag);
        }

        // 优先从洗牌袋中找到不在近期滑窗内的单词
        let pickIdx = bag.findIndex(w => !recentSet.has(w.id));
        if (pickIdx === -1) {
            // 若袋中剩余几词恰好都在上一袋末尾出现过，重新洗一袋并避开最近词
            const refilled = fisherYatesShuffle(pool);
            this._wordBags.set(packKey, refilled);
            bag = refilled;
            pickIdx = bag.findIndex(w => !recentSet.has(w.id));
            if (pickIdx === -1) pickIdx = 0;
        }

        const [chosen] = bag.splice(pickIdx, 1);
        return chosen;
    }

    _recordWordAsked(wordId, isMistakeReview = false) {
        this._questionTick += 1;
        this._lastWordId = wordId;
        this._recentWordIds = this._recentWordIds.filter(id => id !== wordId);
        this._recentWordIds.push(wordId);
        if (this._recentWordIds.length > 60) {
            this._recentWordIds.shift();
        }
        if (isMistakeReview) {
            this._mistakeCooldownMap[wordId] = this._questionTick;
        }
    }

    _pickQuestionType(forcedType = null, targetWord = null, wordMastery = {}) {
        if (forcedType && forcedType !== 'random' && ALL_ENGLISH_TYPE_IDS.includes(forcedType)) {
            this._lastType = forcedType;
            return forcedType;
        }
        const enabled = (Array.isArray(this.config.enabledTypes) && this.config.enabledTypes.length > 0)
            ? this.config.enabledTypes
            : DEFAULT_EASY_ENGLISH_TYPES;
        if (enabled.length === 1) {
            this._lastType = enabled[0];
            return enabled[0];
        }
        let candidates = enabled;
        if (this._lastType && this._sameTypeStreak >= 2) {
            const filtered = enabled.filter(t => t !== this._lastType);
            if (filtered.length > 0) candidates = filtered;
        }

        // 若已经选定了目标词，按掌握星级智能倾斜题型（0星优先音形义认读 -> 1星配对拼读 -> 2星+语境与拼写，同时保留多样性）
        if (targetWord && candidates.length > 1 && Math.random() < 0.72) {
            const stars = Number(wordMastery?.[targetWord.id] || 0);
            let preferredPool = [];
            if (stars <= 0) {
                preferredPool = ['listen_pic', 'match_word', 'word_meaning', 'bubble_pair'];
            } else if (stars === 1) {
                preferredPool = ['word_meaning', 'match_word', 'bubble_pair', 'phonics_chunks', 'cloze_sentence'];
            } else {
                preferredPool = ['word_meaning', 'phonics_chunks', 'cloze_sentence', 'riddle_qa', 'spell_word', 'word_order'];
            }
            const stageMatches = candidates.filter(t => preferredPool.includes(t));
            if (stageMatches.length > 0) {
                candidates = stageMatches;
            }
        }

        const picked = candidates[Math.floor(Math.random() * candidates.length)];
        if (picked === this._lastType) {
            this._sameTypeStreak += 1;
        } else {
            this._lastType = picked;
            this._sameTypeStreak = 1;
        }
        return picked;
    }

    startVocabStudySession(packId = 'all', wordMasteryMap = {}) {
        const isAll = !packId || packId === 'all';
        const pack = isAll ? null : (WORD_PACKS.find(p => p.id === packId) || WORD_PACKS[0]);
        const rawWords = isAll ? ALL_WORDS : pack.words.map(w => ({ ...w, packId: pack.id, packName: pack.name, enCategory: pack.enCategory }));
        const sourceWords = this._filterWordsByDifficulty(rawWords, !isAll);

        const recentCampSet = new Set(this._recentCampWordIds.slice(-30));
        const shuffled = fisherYatesShuffle(sourceWords);
        const sorted = shuffled.sort((a, b) => {
            const rA = recentCampSet.has(a.id) ? 1 : 0;
            const rB = recentCampSet.has(b.id) ? 1 : 0;
            if (rA !== rB) return rA - rB;
            const ma = wordMasteryMap[a.id] || 0;
            const mb = wordMasteryMap[b.id] || 0;
            return ma - mb;
        });

        const targetWords = sorted.slice(0, 5);
        targetWords.forEach(w => {
            this._recentCampWordIds.push(w.id);
            if (this._recentCampWordIds.length > 60) this._recentCampWordIds.shift();
        });

        // 严格尊重小朋友/家长排除的随机题型：未勾选的偏难题型在 5 词背诵营中也绝不出现！
        const rawEnabledGeneral = (this.config?.enabledTypes || DEFAULT_EASY_ENGLISH_TYPES)
            .filter(id => id !== 'course_special' && ALL_ENGLISH_TYPE_IDS.includes(id));
        const campAllowedTypes = rawEnabledGeneral.length > 0
            ? rawEnabledGeneral
            : ['listen_pic', 'match_word', 'word_meaning', 'bubble_pair', 'phonics_chunks'];

        const totalSteps = (this.config?.wordDifficulty || 'easy') === 'easy' ? 6 : 8;
        const quizQueue = [];
        for (let i = 0; i < totalSteps; i++) {
            const w = targetWords[i % targetWords.length];
            const tType = campAllowedTypes[i % campAllowedTypes.length];
            if (tType === 'bubble_pair') {
                quizQueue.push(this.buildBubblePairQuestion(w, targetWords));
            } else {
                quizQueue.push(this.buildQuestionByType(tType, w, sourceWords));
            }
        }

        this.studySession = {
            packId: isAll ? 'all' : pack.id,
            packName: isAll ? '全词库20主题精选' : pack.name,
            packIcon: isAll ? '🌟' : pack.icon,
            phase: 'study',
            words: targetWords,
            sourceWords,
            campAllowedTypes,
            studyIdx: 0,
            quizQueue,
            quizIdx: 0,
            correctInSession: 0,
            retryCount: 0,
            passedWordIds: []
        };
        return this.studySession;
    }

    /**
     * 5词背诵营「错词当场重考」机制：检验阶段一旦答错某词，自动换个角度追加到队尾重考（上限3次防死循环）
     */
    enqueueCampRetryIfWrong(failedQuiz) {
        const sess = this.studySession;
        if (!sess || sess.phase !== 'quiz' || !failedQuiz || !failedQuiz.wordObj) return false;
        if ((sess.retryCount || 0) >= 3) return false;

        const allowed = Array.isArray(sess.campAllowedTypes) && sess.campAllowedTypes.length > 0
            ? sess.campAllowedTypes
            : ['word_meaning', 'match_word', 'listen_pic'];
        const preferredRetryOrder = ['word_meaning', 'match_word', 'listen_pic', 'phonics_chunks'];
        const retryType = preferredRetryOrder.find(t => allowed.includes(t) && t !== failedQuiz.mode)
            || preferredRetryOrder.find(t => allowed.includes(t))
            || allowed[0];

        const retryPool = Array.isArray(sess.sourceWords) && sess.sourceWords.length >= 6 ? sess.sourceWords : ALL_WORDS;
        const retryQ = retryType === 'bubble_pair'
            ? this.buildBubblePairQuestion(failedQuiz.wordObj, sess.words)
            : this.buildQuestionByType(retryType, failedQuiz.wordObj, retryPool);
        retryQ.isCampRetry = true;
        retryQ.hint = `🔁 错词巩固重测 · ${retryQ.hint}`;
        sess.quizQueue.push(retryQ);
        sess.retryCount = (sess.retryCount || 0) + 1;
        return true;
    }

    nextQuickQuestion(forcedWordIdOrOpts = null, maybeForcedType = null) {
        let forcedWordId = null;
        let forcedType = maybeForcedType;

        if (forcedWordIdOrOpts && typeof forcedWordIdOrOpts === 'object') {
            forcedWordId = forcedWordIdOrOpts.forcedWordId || null;
            forcedType = forcedWordIdOrOpts.forcedType || forcedType || null;
        } else if (typeof forcedWordIdOrOpts === 'string') {
            if (
                ALL_ENGLISH_TYPE_IDS.includes(forcedWordIdOrOpts) ||
                ALL_COURSE_SUB_IDS.includes(forcedWordIdOrOpts) ||
                forcedWordIdOrOpts === 'random'
            ) {
                forcedType = forcedWordIdOrOpts;
            } else {
                forcedWordId = forcedWordIdOrOpts;
            }
        }

        const courseOpts = {
            wordDifficulty: this.config?.wordDifficulty || 'easy',
            courseAllowHardDictation: Boolean(this.config?.courseAllowHardDictation)
        };

        // 若直接指定了校外英语课子模式（如 course_phonics / course_sight / course_qa / course_all / course_special）
        if (!forcedWordId && (forcedType === 'course_special' || ALL_COURSE_SUB_IDS.includes(forcedType))) {
            const subMode = ALL_COURSE_SUB_IDS.includes(forcedType)
                ? forcedType
                : (this.config?.courseSubMode || 'course_all');
            const cq = courseSessionManager.nextQuestion(this.config?.courseLessonId || 'latest', subMode, courseOpts);
            if (cq) {
                this._questionTick++;
                this._lastWasReview = false;
                this.currentQuiz = cq;
                return cq;
            }
        }

        const pool = this.getWordPool();
        let target = null;
        let isAutoReview = false;
        let wordMastery = {};

        if (forcedWordId) {
            target = ALL_WORDS.find(w => w.id === forcedWordId)
                || ALL_COURSE_WORDS.find(w => w.id === forcedWordId)
                || null;
        }

        if (this.mistakesProvider) {
            try {
                const provided = this.mistakesProvider() || {};
                wordMastery = provided.wordMastery || {};
                const englishMistakes = provided.englishMistakes || [];

                // 艾宾浩斯穿插复习：带 10 题冷却保护，绝不会每两三题就重复弹同一个错词
                if (!target && !this._lastWasReview && englishMistakes.length > 0 && Math.random() < 0.16) {
                    const eligibleMistakes = englishMistakes
                        .map(m => ALL_WORDS.find(w => w.id === m.wordId) || ALL_COURSE_WORDS.find(w => w.id === m.wordId))
                        .filter(w => {
                            if (!w || w.id === this._lastWordId) return false;
                            const lastTick = this._mistakeCooldownMap[w.id] ?? -999;
                            return (this._questionTick - lastTick) >= 10;
                        });
                    if (eligibleMistakes.length > 0) {
                        target = eligibleMistakes[Math.floor(Math.random() * eligibleMistakes.length)];
                        isAutoReview = true;
                    }
                }
            } catch (e) {}
        }

        // 先决定是否抽中校外英语课专项 (course_special)，若抽中则走课后专项洗牌袋，不消耗 360 词主洗牌袋
        let qType = this._pickQuestionType(forcedType, null, wordMastery);
        if (!target && qType === 'course_special') {
            const cq = courseSessionManager.nextQuestion(
                this.config?.courseLessonId || 'latest',
                this.config?.courseSubMode || 'course_all',
                courseOpts
            );
            if (cq) {
                this._questionTick++;
                this._lastWasReview = false;
                this.currentQuiz = cq;
                return cq;
            }
            qType = 'listen_pic';
        }

        if (!target) {
            target = this._drawFromBag(pool, wordMastery);
        }

        // 若是随机题型，结合刚抽出的目标词熟练度（0星认读 -> 1星拼读 -> 2星+运用）精选最契合的已启用题型
        if (!forcedType || forcedType === 'random') {
            const nonCourseForced = qType === 'course_special' ? null : null;
            const refined = this._pickQuestionType(nonCourseForced, target, wordMastery);
            if (refined !== 'course_special') {
                qType = refined;
            }
        }

        this._recordWordAsked(target.id, Boolean(forcedWordId || isAutoReview));
        this._lastWasReview = Boolean(forcedWordId || isAutoReview);

        // 若是定向错题复习且抽中了 course_special，转为已启用题型复习（优先看词识义或看图选词）
        if (qType === 'course_special') {
            const enabledGeneral = (this.config?.enabledTypes || []).filter(id => id !== 'course_special');
            if (enabledGeneral.includes('word_meaning')) {
                qType = 'word_meaning';
            } else if (enabledGeneral.includes('match_word')) {
                qType = 'match_word';
            } else {
                qType = enabledGeneral[0] || 'match_word';
            }
        }
        const q = this.buildQuestionByType(qType, target, pool);

        q.isReview = Boolean(forcedWordId || isAutoReview);
        if (q.isReview) {
            q.hint = `🔄 弱项重温 · ${q.hint}`;
        }
        this.currentQuiz = q;
        return q;
    }

    buildQuestionByType(qType, target, pool = ALL_WORDS) {
        switch (qType) {
            case 'listen_pic':
                return this.buildListenChoiceQuestion(target, pool);
            case 'match_word':
                return this.buildWordChoiceQuestion(target, pool);
            case 'word_meaning':
                return this.buildWordMeaningQuestion(target, pool);
            case 'bubble_pair':
                return this.buildBubblePairQuestion(target, pool);
            case 'cloze_sentence':
                return this.buildClozeSentenceQuestion(target, pool);
            case 'phonics_chunks':
                return this.buildPhonicsChunksQuestion(target);
            case 'riddle_qa':
                return this.buildRiddleQuestion(target, pool);
            case 'word_order':
                return this.buildWordOrderQuestion(target);
            case 'spell_word':
            default: {
                const isChallengeFull = this.config?.wordDifficulty === 'all' && target.word.length <= 5;
                return this.buildSpellQuestion(target, isChallengeFull);
            }
        }
    }

    buildListenChoiceQuestion(target, pool = ALL_WORDS) {
        const isEasy = (this.config?.wordDifficulty || 'easy') === 'easy';
        const distractorCount = isEasy ? 2 : 3;
        const source = pool.length >= 6 ? pool : ALL_WORDS;
        let distractors = fisherYatesShuffle(source.filter(w => w.id !== target.id && w.icon !== target.icon)).slice(0, distractorCount);
        if (distractors.length < distractorCount) {
            distractors = fisherYatesShuffle(ALL_WORDS.filter(w => w.id !== target.id && w.icon !== target.icon)).slice(0, distractorCount);
        }
        const options = fisherYatesShuffle([...distractors, target])
            .map(w => ({ id: w.id, icon: w.icon, zh: w.zh, word: w.word }));

        return {
            mode: 'listen_pic',
            hint: '🎧 听纯正发音，选出正确的图案！',
            wordObj: target,
            speakText: target.word,
            options,
            answerId: target.id
        };
    }

    buildWordChoiceQuestion(target, pool = ALL_WORDS) {
        const isEasy = (this.config?.wordDifficulty || 'easy') === 'easy';
        const distractorCount = isEasy ? 2 : 3;
        const source = pool.length >= 6 ? pool : ALL_WORDS;
        let distractors = fisherYatesShuffle(source.filter(w => w.id !== target.id)).slice(0, distractorCount);
        if (distractors.length < distractorCount) {
            distractors = fisherYatesShuffle(ALL_WORDS.filter(w => w.id !== target.id)).slice(0, distractorCount);
        }
        const options = fisherYatesShuffle([...distractors, target])
            .map(w => ({
                id: w.id,
                word: w.word,
                phonicsHtml: EnglishEngine.renderPhonicsHtml(w.phonics),
                icon: w.icon,
                zh: w.zh
            }));

        return {
            mode: 'match_word',
            hint: '🃏 看图案想一想，选出正确的英语单词！',
            wordObj: target,
            speakText: target.word,
            options,
            answerId: target.id
        };
    }

    /**
     * 新增核心背词题型：👀 看词识义（只看纯英文单词 -> 独立回想选出对应中文与图案，作答后再发音核对）
     */
    buildWordMeaningQuestion(target, pool = ALL_WORDS) {
        const isEasy = (this.config?.wordDifficulty || 'easy') === 'easy';
        const distractorCount = isEasy ? 2 : 3;
        const source = pool.length >= 6 ? pool : ALL_WORDS;
        let distractors = fisherYatesShuffle(source.filter(w => w.id !== target.id && w.icon !== target.icon)).slice(0, distractorCount);
        if (distractors.length < distractorCount) {
            distractors = fisherYatesShuffle(ALL_WORDS.filter(w => w.id !== target.id && w.icon !== target.icon)).slice(0, distractorCount);
        }
        const options = fisherYatesShuffle([...distractors, target])
            .map(w => ({
                id: w.id,
                icon: w.icon,
                zh: w.zh,
                word: w.word
            }));

        return {
            mode: 'word_meaning',
            hint: '👀 看纯英文单词，回想它是哪个意思！',
            wordObj: target,
            speakText: target.word,
            options,
            answerId: target.id
        };
    }

    buildSpellQuestion(target, fullWord = false) {
        const cleanWord = target.word.toLowerCase();
        const chars = cleanWord.split('');
        const diff = this.config?.wordDifficulty || 'easy';
        let missingIndices = [];
        let extraCount = 3;

        if (fullWord) {
            missingIndices = chars.map((_, idx) => idx);
            extraCount = Math.max(2, 6 - missingIndices.length);
        } else if (diff === 'easy') {
            // 轻松启蒙档：只空 1 个字母（优先挖中间元音或核心字母），提供 3 个干扰字母（共4块果冻），彻底告别全空畏难！
            const vowelIndices = chars.map((ch, idx) => ('aeiou'.includes(ch) ? idx : -1)).filter(idx => idx >= 0);
            const pickPool = vowelIndices.length > 0 ? vowelIndices : chars.map((_, idx) => idx);
            const chosenIdx = pickPool[Math.floor(Math.random() * pickPool.length)];
            missingIndices = [chosenIdx];
            extraCount = 3;
        } else if (diff === 'medium') {
            // 标准进阶档：3字母词空1个，4字母及以上空2个，保留单词骨架
            const count = chars.length <= 3 ? 1 : 2;
            const allIdx = fisherYatesShuffle(chars.map((_, idx) => idx));
            missingIndices = allIdx.slice(0, count).sort((a, b) => a - b);
            extraCount = 3;
        } else {
            // 挑战读写档：<=4字母全空，长词空2~3个
            if (chars.length <= 4) {
                missingIndices = chars.map((_, idx) => idx);
            } else {
                const count = Math.min(3, Math.max(2, Math.floor(chars.length / 2)));
                const allIdx = fisherYatesShuffle(chars.map((_, idx) => idx));
                missingIndices = allIdx.slice(0, count).sort((a, b) => a - b);
            }
            extraCount = Math.max(2, 6 - missingIndices.length);
        }

        const neededChars = missingIndices.map(i => chars[i]);
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        const distractors = [];
        while (distractors.length < extraCount) {
            const c = alphabet[Math.floor(Math.random() * 26)];
            if (!chars.includes(c) && !distractors.includes(c)) distractors.push(c);
        }

        const tiles = fisherYatesShuffle(
            [...neededChars, ...distractors].map((ch, i) => ({ tileId: `t_${i}_${ch}`, char: ch }))
        );

        return {
            mode: 'spell_word',
            hint: diff === 'easy'
                ? '🧩 果冻补字母：听发音，点1块正确果冻把单词补完整！'
                : '🧩 点击果冻字母块，把英语单词拼完整吧！',
            wordObj: target,
            speakText: target.word,
            chars,
            missingIndices,
            tiles,
            expectedWord: cleanWord
        };
    }

    /**
     * 新题型 1：🫧 单词消消乐配对 (轻松档 2对=4气泡；进阶/挑战档 3对=6气泡)
     */
    buildBubblePairQuestion(target, pool = ALL_WORDS) {
        const isEasy = (this.config?.wordDifficulty || 'easy') === 'easy';
        const partnerCount = isEasy ? 1 : 2;
        const source = pool.length >= 4 ? pool : ALL_WORDS;
        let partners = fisherYatesShuffle(
            source.filter(w => w.id !== target.id && w.icon !== target.icon && w.word.toLowerCase() !== target.word.toLowerCase())
        ).slice(0, partnerCount);
        if (partners.length < partnerCount) {
            partners = fisherYatesShuffle(ALL_WORDS.filter(w => w.id !== target.id && w.icon !== target.icon)).slice(0, partnerCount);
        }
        const pairWords = [target, ...partners];
        const enCards = pairWords.map(w => ({
            bubbleId: `en_${w.id}`,
            pairId: w.id,
            side: 'en',
            label: w.word,
            sub: w.ipa || '',
            speakWord: w.word
        }));
        const zhCards = pairWords.map(w => ({
            bubbleId: `zh_${w.id}`,
            pairId: w.id,
            side: 'zh',
            icon: w.icon,
            label: w.zh,
            speakWord: w.word
        }));
        const bubbles = fisherYatesShuffle([...enCards, ...zhCards]);

        return {
            mode: 'bubble_pair',
            hint: `🫧 单词消消乐：把 ${pairWords.length} 组对应的【英语单词】和【图案】配对消除！`,
            wordObj: target,
            speakText: target.word,
            pairCount: pairWords.length,
            bubbles
        };
    }

    /**
     * 新题型 2：💬 情景句子选词填空
     */
    buildClozeSentenceQuestion(target, pool = ALL_WORDS) {
        const isEasy = (this.config?.wordDifficulty || 'easy') === 'easy';
        const distractorCount = isEasy ? 2 : 3;
        const source = pool.length >= 6 ? pool : ALL_WORDS;
        let distractors = fisherYatesShuffle(source.filter(w => w.id !== target.id)).slice(0, distractorCount);
        if (distractors.length < distractorCount) {
            distractors = fisherYatesShuffle(ALL_WORDS.filter(w => w.id !== target.id)).slice(0, distractorCount);
        }
        const maskedSentence = maskTargetWordInSentence(target.sentence, target.word);
        const options = fisherYatesShuffle([...distractors, target]).map(w => ({
            id: w.id,
            word: w.word,
            zh: w.zh,
            icon: w.icon
        }));

        return {
            mode: 'cloze_sentence',
            hint: '💬 情景句填空：听读例句，选出填入横线的正确单词！',
            wordObj: target,
            speakText: target.sentence,
            maskedSentence,
            sentenceZh: target.sentenceZh,
            options,
            answerId: target.id
        };
    }

    /**
     * 新题型 3：🔤 自然拼读音节积木
     */
    buildPhonicsChunksQuestion(target) {
        const isEasy = (this.config?.wordDifficulty || 'easy') === 'easy';
        let chunks = (target.phonics || '').split('-').filter(Boolean).map(c => c.toLowerCase());
        if (chunks.length < 2) {
            chunks = target.word.toLowerCase().split('');
        }
        const distractorPool = ['sh', 'ch', 'th', 'oo', 'ea', 'ar', 'or', 'er', 'ing', 'ck', 'ay', 'ou', 'tr', 'pl', 'st'];
        const lowerSet = new Set(chunks);
        const distractors = fisherYatesShuffle(
            distractorPool.filter(d => !lowerSet.has(d) && !target.word.toLowerCase().includes(d))
        ).slice(0, isEasy ? 1 : 2);

        const blocks = fisherYatesShuffle([
            ...chunks.map((chunk, idx) => ({ blockId: `pc_req_${idx}_${chunk}`, chunk, isRequired: true })),
            ...distractors.map((chunk, idx) => ({ blockId: `pc_dis_${idx}_${chunk}`, chunk, isRequired: false }))
        ]);

        return {
            mode: 'phonics_chunks',
            hint: '🔤 自然拼读积木：看拼读提示听发音，按顺序点积木拼单词！',
            wordObj: target,
            speakText: target.word,
            expectedChunks: chunks,
            expectedWord: chunks.join(''),
            blocks
        };
    }

    /**
     * 新题型 4：🕵️ 英语小谜语与日常问答
     */
    buildRiddleQuestion(target, pool = ALL_WORDS) {
        const isEasy = (this.config?.wordDifficulty || 'easy') === 'easy';
        const distractorCount = isEasy ? 2 : 3;
        const source = pool.length >= 6 ? pool : ALL_WORDS;
        let distractors = fisherYatesShuffle(source.filter(w => w.id !== target.id && w.icon !== target.icon)).slice(0, distractorCount);
        if (distractors.length < distractorCount) {
            distractors = fisherYatesShuffle(ALL_WORDS.filter(w => w.id !== target.id && w.icon !== target.icon)).slice(0, distractorCount);
        }

        let riddleEn = '';
        if (target.riddle) {
            riddleEn = target.riddle;
        } else {
            const masked = maskTargetWordInSentence(target.sentence, target.word);
            const cat = target.enCategory || 'Fun Word';
            riddleEn = `[${cat}] "${masked}" — Which word is it?`;
        }
        const maskedZh = target.sentenceZh;

        const options = fisherYatesShuffle([...distractors, target]).map(w => ({
            id: w.id,
            word: w.word,
            icon: w.icon,
            zh: w.zh
        }));

        return {
            mode: 'riddle_qa',
            hint: '🕵️ 英语小侦探：读线索猜一猜是哪个词！',
            wordObj: target,
            speakText: target.riddle ? target.riddle : target.sentence,
            riddleEn,
            riddleZh: `中文提示：【${target.packName || '趣味主题'}】· ${maskedZh}`,
            options,
            answerId: target.id
        };
    }

    /**
     * 新题型 5：🚂 语序小火车连词成句
     */
    buildWordOrderQuestion(target) {
        const isEasy = (this.config?.wordDifficulty || 'easy') === 'easy';
        const maxCarriages = isEasy ? 4 : 5;
        const rawTokens = target.sentence.trim().split(/\s+/).filter(Boolean);
        // 若超过车厢上限，将相邻短词合并为短语车厢，保证 iPad 触控清爽好点
        const carriages = [...rawTokens];
        const shortWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'to', 'of', 'by', 'is', 'are', 'my', 'our', 'for', 'up']);
        let guard = 0;
        while (carriages.length > maxCarriages && guard < 12) {
            guard++;
            let mergedIdx = carriages.findIndex((tok, idx) =>
                idx < carriages.length - 1 && shortWords.has(tok.toLowerCase().replace(/[^a-z]/g, ''))
            );
            if (mergedIdx === -1) mergedIdx = 0;
            carriages.splice(mergedIdx, 2, `${carriages[mergedIdx]} ${carriages[mergedIdx + 1]}`);
        }

        let shuffled = fisherYatesShuffle(carriages.map((text, idx) => ({
            carriageId: `wo_${idx}`,
            orderIdx: idx,
            text
        })));
        // 确保打乱顺序与原句顺序不同
        if (carriages.length > 1 && shuffled.map(c => c.text).join(' ') === carriages.join(' ')) {
            [shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]];
        }

        const prefilledCount = (isEasy && carriages.length >= 3) ? 1 : 0;

        return {
            mode: 'word_order',
            hint: prefilledCount > 0
                ? '🚂 语序小火车：第1节已帮你放好啦，继续点选后面的词块吧！'
                : '🚂 语序小火车：按正确顺序点击词块，连成完整英语句子！',
            wordObj: target,
            speakText: target.sentence,
            sentenceZh: target.sentenceZh,
            expectedTokens: carriages,
            expectedSentence: carriages.join(' '),
            prefilledCount,
            carriages: shuffled
        };
    }

    evaluateResult(isCorrect, wordObj, isReview = false) {
        let badgeEarned = 0;
        let starEarned = 0;
        let expEarned = 0;
        let gotGachaTicket = false;

        if (isCorrect) {
            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;
            if (isReview) {
                badgeEarned = 2;
            } else {
                starEarned = this.combo >= 6 ? 2 : 1;
            }
            if (this.combo > 0 && this.combo % 15 === 0) {
                gotGachaTicket = true;
            }
        } else {
            this.combo = 0;
        }

        return {
            isCorrect,
            wordObj,
            combo: this.combo,
            maxCombo: this.maxCombo,
            badgeEarned,
            starEarned,
            expEarned,
            gotGachaTicket
        };
    }
}

export const englishEngine = new EnglishEngine();
