/**
 * englishEngine.js - 少儿英语【魔法背单词(学·练·拼闭环)】与【听说认读闪电闯关】引擎
 * 涵盖新课标小学核心 6 大场景主题词库、自然拼读分色、3阶巩固与艾宾浩斯熟练度追踪
 */

export const WORD_PACKS = [
    {
        id: 'pack_animals',
        name: '萌宠好伙伴',
        icon: '🐾',
        words: [
            { id: 'w_rabbit', word: 'rabbit', phonics: 'r-a-bb-i-t', ipa: '/ˈræbɪt/', zh: '兔子', icon: '🐰', level: 1, sentence: 'The cute rabbit holds a gift!', sentenceZh: '可爱的兔子捧着礼物！' },
            { id: 'w_frog', word: 'frog', phonics: 'fr-o-g', ipa: '/frɒɡ/', zh: '青蛙', icon: '🐸', level: 1, sentence: 'A happy green frog sits on a leaf.', sentenceZh: '快乐的小青蛙坐在荷叶上。' },
            { id: 'w_tiger', word: 'tiger', phonics: 't-i-g-er', ipa: '/ˈtaɪɡər/', zh: '老虎', icon: '🐯', level: 1, sentence: 'The baby tiger is brave!', sentenceZh: '小老虎非常勇敢！' },
            { id: 'w_panda', word: 'panda', phonics: 'p-an-d-a', ipa: '/ˈpændə/', zh: '熊猫', icon: '🐼', level: 1, sentence: 'The panda loves green bamboo.', sentenceZh: '大熊猫喜欢绿竹子。' },
            { id: 'w_dog', word: 'dog', phonics: 'd-o-g', ipa: '/dɒɡ/', zh: '小狗', icon: '🐶', level: 1, sentence: 'My little dog can run fast.', sentenceZh: '我的小狗跑得很快。' },
            { id: 'w_cat', word: 'cat', phonics: 'c-a-t', ipa: '/kæt/', zh: '小猫', icon: '🐱', level: 1, sentence: 'The white cat likes milk.', sentenceZh: '小白猫喜欢喝牛奶。' },
            { id: 'w_duck', word: 'duck', phonics: 'd-u-ck', ipa: '/dʌk/', zh: '鸭子', icon: '🦆', level: 1, sentence: 'Yellow duck swims in the pond.', sentenceZh: '小黄鸭在池塘里游泳。' },
            { id: 'w_bird', word: 'bird', phonics: 'b-ir-d', ipa: '/bɜːrd/', zh: '小鸟', icon: '🐦', level: 1, sentence: 'The little bird sings a song.', sentenceZh: '小鸟唱着动听的歌。' },
            { id: 'w_fish', word: 'fish', phonics: 'f-i-sh', ipa: '/fɪʃ/', zh: '鱼儿', icon: '🐟', level: 1, sentence: 'Look at the colorful fish!', sentenceZh: '看那条五颜六色的鱼！' },
            { id: 'w_monkey', word: 'monkey', phonics: 'm-on-key', ipa: '/ˈmʌŋki/', zh: '猴子', icon: '🐵', level: 2, sentence: 'Clever monkey eats a banana.', sentenceZh: '聪明的猴子吃香蕉。' },
            { id: 'w_sheep', word: 'sheep', phonics: 'sh-ee-p', ipa: '/ʃiːp/', zh: '绵羊', icon: '🐑', level: 2, sentence: 'White sheep eats green grass.', sentenceZh: '白绵羊在吃青草。' },
            { id: 'w_horse', word: 'horse', phonics: 'h-or-se', ipa: '/hɔːrs/', zh: '骏马', icon: '🐴', level: 2, sentence: 'The brown horse runs fast.', sentenceZh: '棕色的小马奔跑如飞。' },
            { id: 'w_bear', word: 'bear', phonics: 'b-ear', ipa: '/beər/', zh: '小熊', icon: '🐻', level: 1, sentence: 'Baby bear loves sweet honey.', sentenceZh: '小熊最爱甜甜的蜂蜜。' },
            { id: 'w_dragon', word: 'dragon', phonics: 'dr-a-g-on', ipa: '/ˈdræɡən/', zh: '神龙', icon: '🐲', level: 3, sentence: 'A magic dragon flies in the sky.', sentenceZh: '神奇的飞龙在天空翱翔。' },
            { id: 'w_elephant', word: 'elephant', phonics: 'el-e-ph-ant', ipa: '/ˈelɪfənt/', zh: '大象', icon: '🐘', level: 3, sentence: 'The elephant has a long nose.', sentenceZh: '大象有着长长的鼻子。' }
        ]
    },
    {
        id: 'pack_fruits',
        name: '超市鲜果屋',
        icon: '🍎',
        words: [
            { id: 'w_apple', word: 'apple', phonics: 'a-pp-le', ipa: '/ˈæpl/', zh: '苹果', icon: '🍎', level: 1, sentence: 'An apple a day keeps you healthy!', sentenceZh: '每天一苹果，健康伴着我！' },
            { id: 'w_banana', word: 'banana', phonics: 'ba-na-na', ipa: '/bəˈnɑːnə/', zh: '香蕉', icon: '🍌', level: 1, sentence: 'This yellow banana is sweet.', sentenceZh: '这根黄香蕉甜甜的。' },
            { id: 'w_orange', word: 'orange', phonics: 'or-an-ge', ipa: '/ˈɒrɪndʒ/', zh: '橙子', icon: '🍊', level: 1, sentence: 'Would you like an orange?', sentenceZh: '你想要一个橙子吗？' },
            { id: 'w_grape', word: 'grape', phonics: 'gr-a-pe', ipa: '/ɡreɪp/', zh: '葡萄', icon: '🍇', level: 2, sentence: 'Purple grapes are juicy!', sentenceZh: '紫葡萄汁水真多！' },
            { id: 'w_pear', word: 'pear', phonics: 'p-ear', ipa: '/peər/', zh: '梨子', icon: '🍐', level: 1, sentence: 'Here is a fresh sweet pear.', sentenceZh: '这是一个新鲜甜梨。' },
            { id: 'w_peach', word: 'peach', phonics: 'p-ea-ch', ipa: '/piːtʃ/', zh: '桃子', icon: '🍑', level: 2, sentence: 'Pink peach smells so good!', sentenceZh: '粉红的桃子闻起来真香！' },
            { id: 'w_lemon', word: 'lemon', phonics: 'l-e-m-on', ipa: '/ˈlemən/', zh: '柠檬', icon: '🍋', level: 2, sentence: 'Yellow lemon is a little sour.', sentenceZh: '黄柠檬有一点点酸哦。' },
            { id: 'w_cherry', word: 'cherry', phonics: 'ch-e-rr-y', ipa: '/ˈtʃeri/', zh: '樱桃', icon: '🍒', level: 2, sentence: 'Red cherry on top of the cake!', sentenceZh: '红樱桃点缀在蛋糕顶上！' },
            { id: 'w_mango', word: 'mango', phonics: 'm-an-go', ipa: '/ˈmæŋɡəʊ/', zh: '芒果', icon: '🥭', level: 2, sentence: 'I love sweet mango juice.', sentenceZh: '我爱喝甜美的芒果汁。' },
            { id: 'w_melon', word: 'melon', phonics: 'm-e-l-on', ipa: '/ˈmelən/', zh: '甜瓜/西瓜', icon: '🍉', level: 2, sentence: 'Cool melon for a sunny day!', sentenceZh: '晴天来块清凉西瓜！' },
            { id: 'w_carrot', word: 'carrot', phonics: 'c-a-rr-ot', ipa: '/ˈkærət/', zh: '胡萝卜', icon: '🥕', level: 2, sentence: 'Bunny eats a crunchy carrot.', sentenceZh: '小兔子吃脆脆的胡萝卜。' },
            { id: 'w_corn', word: 'corn', phonics: 'c-or-n', ipa: '/kɔːrn/', zh: '玉米', icon: '🌽', level: 2, sentence: 'Golden sweet corn is yummy.', sentenceZh: '金黄的甜玉米真好吃。' }
        ]
    },
    {
        id: 'pack_food',
        name: '甜品汉堡坊',
        icon: '🍰',
        words: [
            { id: 'w_cake', word: 'cake', phonics: 'c-a-ke', ipa: '/keɪk/', zh: '蛋糕', icon: '🍰', level: 1, sentence: 'Happy birthday! Have some cake!', sentenceZh: '生日快乐！吃块蛋糕吧！' },
            { id: 'w_milk', word: 'milk', phonics: 'm-i-lk', ipa: '/mɪlk/', zh: '牛奶', icon: '🥛', level: 1, sentence: 'Drink warm milk every morning.', sentenceZh: '每天早晨喝杯热牛奶。' },
            { id: 'w_bread', word: 'bread', phonics: 'br-ea-d', ipa: '/bred/', zh: '面包', icon: '🍞', level: 1, sentence: 'Fresh bread from the bakery!', sentenceZh: '烘焙店刚出炉的新鲜面包！' },
            { id: 'w_egg', word: 'egg', phonics: 'e-gg', ipa: '/eɡ/', zh: '鸡蛋', icon: '🥚', level: 1, sentence: 'I have an egg for breakfast.', sentenceZh: '我早餐吃一个鸡蛋。' },
            { id: 'w_burger', word: 'burger', phonics: 'b-ur-g-er', ipa: '/ˈbɜːrɡər/', zh: '汉堡包', icon: '🍔', level: 2, sentence: 'One cheese burger, please!', sentenceZh: '请给我来一个芝士汉堡！' },
            { id: 'w_donut', word: 'donut', phonics: 'd-o-n-ut', ipa: '/ˈdəʊnʌt/', zh: '甜甜圈', icon: '🍩', level: 2, sentence: 'Chocolate donut is round and sweet.', sentenceZh: '巧克力甜甜圈又圆又甜。' },
            { id: 'w_cookie', word: 'cookie', phonics: 'c-oo-k-ie', ipa: '/ˈkʊki/', zh: '曲奇饼干', icon: '🍪', level: 2, sentence: 'Share cookies with good friends.', sentenceZh: '和好朋友分享曲奇饼干。' },
            { id: 'w_candy', word: 'candy', phonics: 'c-an-dy', ipa: '/ˈkændi/', zh: '糖果', icon: '🍬', level: 1, sentence: 'Rainbow candy in the gift box.', sentenceZh: '礼盒里装着彩虹糖果。' },
            { id: 'w_juice', word: 'juice', phonics: 'j-ui-ce', ipa: '/dʒuːs/', zh: '果汁', icon: '🧃', level: 2, sentence: 'A cup of fresh apple juice!', sentenceZh: '一杯鲜榨苹果汁！' },
            { id: 'w_pizza', word: 'pizza', phonics: 'p-i-zz-a', ipa: '/ˈpiːtsə/', zh: '披萨', icon: '🍕', level: 2, sentence: 'Hot pizza with cheese!', sentenceZh: '热腾腾的芝士披萨！' },
            { id: 'w_honey', word: 'honey', phonics: 'h-o-n-ey', ipa: '/ˈhʌni/', zh: '蜂蜜', icon: '🍯', level: 2, sentence: 'Sweet golden honey in a jar.', sentenceZh: '罐子里装满香甜蜂蜜。' },
            { id: 'w_water', word: 'water', phonics: 'w-a-t-er', ipa: '/ˈwɔːtər/', zh: '水', icon: '💧', level: 1, sentence: 'Please drink plenty of water.', sentenceZh: '请多喝温水哦。' }
        ]
    },
    {
        id: 'pack_school',
        name: '魔法图书馆',
        icon: '📚',
        words: [
            { id: 'w_book', word: 'book', phonics: 'b-oo-k', ipa: '/bʊk/', zh: '书本', icon: '📖', level: 1, sentence: 'Open your magic story book!', sentenceZh: '打开你的魔法故事书！' },
            { id: 'w_pen', word: 'pen', phonics: 'p-e-n', ipa: '/pen/', zh: '钢笔', icon: '🖊️', level: 1, sentence: 'Write neatly with a blue pen.', sentenceZh: '用蓝色钢笔工整写字。' },
            { id: 'w_pencil', word: 'pencil', phonics: 'p-en-cil', ipa: '/ˈpensl/', zh: '铅笔', icon: '✏️', level: 2, sentence: 'Sharpen my yellow pencil.', sentenceZh: '削好我的小黄铅笔。' },
            { id: 'w_ruler', word: 'ruler', phonics: 'r-u-l-er', ipa: '/ˈruːlər/', zh: '尺子', icon: '📏', level: 2, sentence: 'Draw a straight line with a ruler.', sentenceZh: '用尺子画出笔直的线。' },
            { id: 'w_bag', word: 'bag', phonics: 'b-a-g', ipa: '/bæɡ/', zh: '书包', icon: '🎒', level: 1, sentence: 'Pack my school bag by myself!', sentenceZh: '我自己整理好小书包！' },
            { id: 'w_clock', word: 'clock', phonics: 'cl-o-ck', ipa: '/klɒk/', zh: '时钟', icon: '⏰', level: 2, sentence: 'The clock says eight o’clock.', sentenceZh: '时钟指向八点整。' },
            { id: 'w_chair', word: 'chair', phonics: 'ch-air', ipa: '/tʃeər/', zh: '椅子', icon: '🪑', level: 2, sentence: 'Sit nicely on the wooden chair.', sentenceZh: '端端正正坐在木椅上。' },
            { id: 'w_map', word: 'map', phonics: 'm-a-p', ipa: '/mæp/', zh: '地图', icon: '🗺️', level: 1, sentence: 'Find our shop on the town map!', sentenceZh: '在小镇地图上找到我们的店！' },
            { id: 'w_crayon', word: 'crayon', phonics: 'cr-ay-on', ipa: '/ˈkreɪən/', zh: '蜡笔', icon: '🖍️', level: 3, sentence: 'Paint a rainbow with crayons.', sentenceZh: '用彩色蜡笔画出彩虹。' },
            { id: 'w_gift', word: 'gift', phonics: 'g-i-ft', ipa: '/ɡɪft/', zh: '礼物', icon: '🎁', level: 1, sentence: 'A surprise gift box for you!', sentenceZh: '送给你一个惊喜礼物盒！' }
        ]
    },
    {
        id: 'pack_nature',
        name: '自然与色彩',
        icon: '🌈',
        words: [
            { id: 'w_sun', word: 'sun', phonics: 's-u-n', ipa: '/sʌn/', zh: '太阳', icon: '☀️', level: 1, sentence: 'The warm sun shines brightly.', sentenceZh: '温暖的太阳闪耀光芒。' },
            { id: 'w_moon', word: 'moon', phonics: 'm-oo-n', ipa: '/muːn/', zh: '月亮', icon: '🌙', level: 1, sentence: 'Good night, silver moon!', sentenceZh: '晚安，银色的月亮！' },
            { id: 'w_star', word: 'star', phonics: 'st-ar', ipa: '/stɑːr/', zh: '星星', icon: '⭐', level: 1, sentence: 'Twinkle, twinkle, little star!', sentenceZh: '一闪一闪亮晶晶！' },
            { id: 'w_cloud', word: 'cloud', phonics: 'cl-ou-d', ipa: '/klaʊd/', zh: '云朵', icon: '☁️', level: 2, sentence: 'Unicorn sleeps on a soft cloud.', sentenceZh: '独角兽睡在软绵绵的云朵上。' },
            { id: 'w_flower', word: 'flower', phonics: 'fl-ow-er', ipa: '/ˈflaʊər/', zh: '花朵', icon: '🌸', level: 2, sentence: 'Pretty flowers bloom in spring.', sentenceZh: '美丽的花朵在春天盛开。' },
            { id: 'w_tree', word: 'tree', phonics: 'tr-ee', ipa: '/triː/', zh: '大树', icon: '🌳', level: 1, sentence: 'Tall green trees around the town.', sentenceZh: '小镇周围长满高大的绿树。' },
            { id: 'w_rain', word: 'rain', phonics: 'r-ai-n', ipa: '/reɪn/', zh: '雨水', icon: '🌧️', level: 2, sentence: 'Little frog loves spring rain.', sentenceZh: '小青蛙喜欢春天的细雨。' },
            { id: 'w_rainbow', word: 'rainbow', phonics: 'r-ain-b-ow', ipa: '/ˈreɪnbəʊ/', zh: '彩虹', icon: '🌈', level: 3, sentence: 'Seven colors in the rainbow!', sentenceZh: '彩虹里有七种美丽颜色！' },
            { id: 'w_green', word: 'green', phonics: 'gr-ee-n', ipa: '/ɡriːn/', zh: '绿色', icon: '💚', level: 1, sentence: 'Lotus leaf is fresh green.', sentenceZh: '荷叶是清新的绿色。' },
            { id: 'w_purple', word: 'purple', phonics: 'p-ur-ple', ipa: '/ˈpɜːrpl/', zh: '紫色', icon: '💜', level: 2, sentence: 'Magic library has a purple roof.', sentenceZh: '魔法书屋有着紫色的屋顶。' }
        ]
    },
    {
        id: 'pack_town',
        name: '小镇店长日常',
        icon: '🏪',
        words: [
            { id: 'w_shop', word: 'shop', phonics: 'sh-o-p', ipa: '/ʃɒp/', zh: '商店', icon: '🏪', level: 1, sentence: 'Welcome to my cute pet shop!', sentenceZh: '欢迎来到我的萌宠小店！' },
            { id: 'w_train', word: 'train', phonics: 'tr-ai-n', ipa: '/treɪn/', zh: '小火车', icon: '🚂', level: 2, sentence: 'Choo-choo! The town train goes by.', sentenceZh: '呜呜！环镇小火车开过来了。' },
            { id: 'w_crown', word: 'crown', phonics: 'cr-ow-n', ipa: '/kraʊn/', zh: '皇冠', icon: '👑', level: 2, sentence: 'Prince frog wears a gold crown.', sentenceZh: '王子蛙戴着金色小皇冠。' },
            { id: 'w_happy', word: 'happy', phonics: 'h-a-pp-y', ipa: '/ˈhæpi/', zh: '开心的', icon: '😊', level: 1, sentence: 'We are happy little learners!', sentenceZh: '我们是快乐的小小学霸！' },
            { id: 'w_smart', word: 'smart', phonics: 'sm-ar-t', ipa: '/smɑːrt/', zh: '聪明的', icon: '💡', level: 2, sentence: 'What a smart shop manager!', sentenceZh: '真是太聪明的小店长啦！' },
            { id: 'w_friend', word: 'friend', phonics: 'fr-ie-nd', ipa: '/frend/', zh: '朋友', icon: '🤝', level: 2, sentence: 'Rabbit and frog are best friends.', sentenceZh: '兔子和青蛙是最好的朋友。' },
            { id: 'w_jump', word: 'jump', phonics: 'j-u-mp', ipa: '/dʒʌmp/', zh: '跳跃', icon: '🦘', level: 1, sentence: 'Frog can jump very high!', sentenceZh: '小青蛙能跳得非常高！' },
            { id: 'w_smile', word: 'smile', phonics: 'sm-i-le', ipa: '/smaɪl/', zh: '微笑', icon: '😄', level: 2, sentence: 'Greet customers with a big smile.', sentenceZh: '带着灿烂微笑迎接顾客。' },
            { id: 'w_letter', word: 'letter', phonics: 'l-e-tt-er', ipa: '/ˈletər/', zh: '信件', icon: '✉️', level: 2, sentence: 'Send a warm letter at the post office.', sentenceZh: '在邮局寄出一封温暖的信。' },
            { id: 'w_rocket', word: 'rocket', phonics: 'r-o-ck-et', ipa: '/ˈrɒkɪt/', zh: '火箭', icon: '🚀', level: 3, sentence: 'Astro bunny flies a space rocket!', sentenceZh: '宇航兔驾驶太空火箭！' }
        ]
    }
];

export const ALL_WORDS = WORD_PACKS.flatMap(p => p.words.map(w => ({ ...w, packId: p.id, packName: p.name })));

export class EnglishEngine {
    constructor(config = {}) {
        this.setConfig(config);
        this.combo = 0;
        this.maxCombo = 0;
        this.currentQuiz = null;

        // 【魔法背单词】专项会话状态 (每组5词: study -> quiz -> summary)
        this.studySession = null;
    }

    setConfig(cfg = {}) {
        this.config = {
            level: cfg.level || 'level2_match', // 'level1_listen' | 'level2_match' | 'level3_spell' | 'mixed'
            packId: cfg.packId || 'all'
        };
    }

    static formatSummary(cfg) {
        if (!cfg) return '图词配对 + 背单词';
        const map = {
            level1_listen: '🌱 启蒙听音选图',
            level2_match: '⚡ 初阶图词配对',
            level3_spell: '🔥 进阶果冻拼写',
            mixed: '🌈 听说读写全能'
        };
        return map[cfg.level] || '⚡ 初阶图词配对';
    }

    // 自然拼读多彩音节格式化 (元音高亮成粉橙色，辅音清爽蓝紫色)
    static renderPhonicsHtml(phonicsStr) {
        if (!phonicsStr) return '';
        const parts = phonicsStr.split('-');
        return parts.map(p => {
            const isVowelGroup = /[aeiouy]/i.test(p) && p.length <= 3 && /^[aeiouy]+$/i.test(p);
            const cls = isVowelGroup ? 'ph-vowel' : (/[aeiou]/i.test(p) ? 'ph-blend' : 'ph-cons');
            return `<span class="ph-chunk ${cls}">${p}</span>`;
        }).join('<span class="ph-dot">·</span>');
    }

    getWordPool() {
        if (this.config.packId && this.config.packId !== 'all') {
            const pack = WORD_PACKS.find(p => p.id === this.config.packId);
            if (pack) return pack.words;
        }
        return ALL_WORDS;
    }

    // ==================== 1. 【魔法背单词】5词学·练·拼科学闭环 ====================
    startVocabStudySession(packId = 'pack_animals', wordMasteryMap = {}) {
        const pack = WORD_PACKS.find(p => p.id === packId) || WORD_PACKS[0];
        // 优先挑选尚未三星掌握(mastery < 3)的单词，让孩子每次背都有新收获！
        const sorted = [...pack.words].sort((a, b) => {
            const ma = wordMasteryMap[a.id] || 0;
            const mb = wordMasteryMap[b.id] || 0;
            if (ma !== mb) return ma - mb;
            return Math.random() - 0.5;
        });
        const targetWords = sorted.slice(0, 5);

        // 构建 9 道趁热打铁检验题：3道听音辨图 + 3道看图选词 + 3道果冻字母拼写补全
        const quizQueue = [];
        targetWords.slice(0, 3).forEach(w => quizQueue.push(this.buildListenChoiceQuestion(w, pack.words)));
        targetWords.slice(2, 5).forEach(w => quizQueue.push(this.buildWordChoiceQuestion(w, pack.words)));
        [targetWords[0], targetWords[1], targetWords[4]].forEach(w => {
            const fullSpell = this.config.level === 'level3_spell';
            quizQueue.push(this.buildSpellQuestion(w, fullSpell));
        });

        this.studySession = {
            packId: pack.id,
            packName: pack.name,
            packIcon: pack.icon,
            phase: 'study', // 'study' | 'quiz' | 'done'
            words: targetWords,
            studyIdx: 0,
            quizQueue,
            quizIdx: 0,
            correctInSession: 0
        };
        return this.studySession;
    }

    // ==================== 2. 生成单道英语互动闯关题 ====================
    nextQuickQuestion(forcedWordId = null) {
        const pool = this.getWordPool();
        let target = null;
        if (forcedWordId) {
            target = ALL_WORDS.find(w => w.id === forcedWordId) || null;
        }
        if (!target) {
            target = pool[Math.floor(Math.random() * pool.length)];
        }

        let qType = this.config.level || 'level2_match';
        if (qType === 'mixed') {
            const r = Math.random();
            qType = r < 0.34 ? 'level1_listen' : (r < 0.70 ? 'level2_match' : 'level3_spell');
        }

        let q;
        if (qType === 'level1_listen') {
            q = this.buildListenChoiceQuestion(target, pool);
        } else if (qType === 'level3_spell') {
            q = this.buildSpellQuestion(target, target.word.length <= 5);
        } else {
            q = this.buildWordChoiceQuestion(target, pool);
        }

        q.isReview = Boolean(forcedWordId);
        this.currentQuiz = q;
        return q;
    }

    // 题型 A：🎧 听音选图（磨耳朵直觉模式）
    buildListenChoiceQuestion(target, pool = ALL_WORDS) {
        const distractors = ALL_WORDS
            .filter(w => w.id !== target.id && w.icon !== target.icon)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        const options = [...distractors, target]
            .sort(() => Math.random() - 0.5)
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

    // 题型 B：🃏 看图与发音选英文单词（带自然拼读提示）
    buildWordChoiceQuestion(target, pool = ALL_WORDS) {
        const distractors = ALL_WORDS
            .filter(w => w.id !== target.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        const options = [...distractors, target]
            .sort(() => Math.random() - 0.5)
            .map(w => ({
                id: w.id,
                word: w.word,
                phonicsHtml: EnglishEngine.renderPhonicsHtml(w.phonics),
                zh: w.zh
            }));

        return {
            mode: 'match_word',
            hint: '🃏 看萌图听发音，挑出对应的英语单词！',
            wordObj: target,
            speakText: target.word,
            options,
            answerId: target.id
        };
    }

    // 题型 C：🧩 彩色果冻字母拼写（支持“残缺补全 2~3 个字母”或“全词拼写”，零挫败感！）
    buildSpellQuestion(target, fullWord = false) {
        const chars = target.word.toLowerCase().split('');
        let missingIndices = [];

        if (fullWord || chars.length <= 4) {
            missingIndices = chars.map((_, idx) => idx);
        } else {
            // 挖空 2~3 个关键字母让小朋友补全，既记拼写又不至于太难卡住
            const count = Math.min(3, Math.max(2, Math.floor(chars.length / 2)));
            const allIdx = chars.map((_, idx) => idx).sort(() => Math.random() - 0.5);
            missingIndices = allIdx.slice(0, count).sort((a, b) => a - b);
        }

        const neededChars = missingIndices.map(i => chars[i]);
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        const extraCount = Math.max(2, 6 - neededChars.length);
        const distractors = [];
        while (distractors.length < extraCount) {
            const c = alphabet[Math.floor(Math.random() * 26)];
            if (!chars.includes(c)) distractors.push(c);
        }

        const tiles = [...neededChars, ...distractors]
            .map((ch, i) => ({ tileId: `t_${i}_${ch}`, char: ch }))
            .sort(() => Math.random() - 0.5);

        return {
            mode: 'spell_word',
            hint: '🧩 点击果冻字母块，把英语单词拼完整吧！',
            wordObj: target,
            speakText: target.word,
            chars,
            missingIndices,
            tiles,
            expectedWord: target.word.toLowerCase()
        };
    }

    evaluateResult(isCorrect, wordObj, isReview = false) {
        let badgeEarned = 0;
        let expEarned = 0;
        let gotGachaTicket = false;

        if (isCorrect) {
            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;
            const comboBonus = this.combo >= 5 ? 3 : (this.combo >= 3 ? 1 : 0);
            badgeEarned = (2 + comboBonus) * (isReview ? 2 : 1);
            expEarned = isReview ? 6 : 4;
            if (this.combo > 0 && this.combo % 5 === 0) {
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
            expEarned,
            gotGachaTicket
        };
    }
}

export const englishEngine = new EnglishEngine();
