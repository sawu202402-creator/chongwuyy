/**
 * shared/englishEngine.js - 全平台共享少儿英语【魔法背单词(学·练·拼闭环)】与【听说认读闪电闯关】引擎
 * 同时服务于：游戏大厅(/)、奇妙萌宠店长(/pet/)、保卫兔子与青蛙(/carrot/)、植物大战僵尸(/pvz/)
 * 升级特性：
 * 1. 扩充新课标少儿英语 12 大主题词库（共 216 个核心分级单词，含自然拼读拆解、音标、中英例句）；
 * 2. 支持艾宾浩斯智能穿插复习（自动从当前宝贝的待强化词本 englishMistakes 与低星词中按权重抽词重温）。
 */

export const ENGLISH_LEVELS = {
    level1_listen: { id: 'level1_listen', name: '🎧 听音辨图 (启蒙)' },
    level2_match:  { id: 'level2_match',  name: '🃏 看图识词 (进阶)' },
    level3_spell:  { id: 'level3_spell',  name: '🧩 字母拼写 (挑战)' },
    mixed:         { id: 'mixed',         name: '🌈 智能混合闯关' }
};

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
            { id: 'w_elephant', word: 'elephant', phonics: 'el-e-ph-ant', ipa: '/ˈelɪfənt/', zh: '大象', icon: '🐘', level: 3, sentence: 'The elephant has a long nose.', sentenceZh: '大象有着长长的鼻子。' },
            { id: 'w_lion', word: 'lion', phonics: 'l-i-on', ipa: '/ˈlaɪən/', zh: '狮子', icon: '🦁', level: 2, sentence: 'The lion is king of the forest.', sentenceZh: '狮子是森林之王。' },
            { id: 'w_pig', word: 'pig', phonics: 'p-i-g', ipa: '/pɪɡ/', zh: '小猪', icon: '🐷', level: 1, sentence: 'Pink pig sleeps in the sun.', sentenceZh: '粉色小猪在阳光下睡觉。' },
            { id: 'w_whale', word: 'whale', phonics: 'wh-a-le', ipa: '/weɪl/', zh: '鲸鱼', icon: '🐳', level: 2, sentence: 'Blue whale swims in the deep sea.', sentenceZh: '蓝鲸在深海里畅游。' }
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
            { id: 'w_melon', word: 'melon', phonics: 'm-e-l-on', ipa: '/ˈmelən/', zh: '西瓜/甜瓜', icon: '🍉', level: 2, sentence: 'Cool melon for a sunny day!', sentenceZh: '晴天来块清凉西瓜！' },
            { id: 'w_carrot', word: 'carrot', phonics: 'c-a-rr-ot', ipa: '/ˈkærət/', zh: '胡萝卜', icon: '🥕', level: 2, sentence: 'Bunny eats a crunchy carrot.', sentenceZh: '小兔子吃脆脆的胡萝卜。' },
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
            { id: 'w_gift', word: 'gift', phonics: 'g-i-ft', ipa: '/ɡɪft/', zh: '礼物', icon: '🎁', level: 1, sentence: 'A surprise gift box for you!', sentenceZh: '送给你一个惊喜礼物盒！' },
            { id: 'w_desk', word: 'desk', phonics: 'd-e-sk', ipa: '/desk/', zh: '书桌', icon: '🪵', level: 1, sentence: 'Keep my study desk clean.', sentenceZh: '保持我的书桌干净整洁。' },
            { id: 'w_paper', word: 'paper', phonics: 'p-a-p-er', ipa: '/ˈpeɪpər/', zh: '纸张', icon: '📄', level: 2, sentence: 'Fold a paper plane together.', sentenceZh: '一起折一架纸飞机。' },
            { id: 'w_eraser', word: 'eraser', phonics: 'e-ra-ser', ipa: '/ɪˈreɪsər/', zh: '橡皮擦', icon: '🧼', level: 3, sentence: 'Use an eraser to fix mistakes.', sentenceZh: '用橡皮擦改正错误。' },
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
            { id: 'w_rocket', word: 'rocket', phonics: 'r-o-ck-et', ipa: '/ˈrɒkɪt/', zh: '火箭', icon: '🚀', level: 3, sentence: 'Astro bunny flies a space rocket!', sentenceZh: '宇航兔驾驶太空火箭！' },
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
            { id: 'w_teacher', word: 'teacher', phonics: 't-ea-ch-er', ipa: '/ˈtiːtʃər/', zh: '老师', icon: '👩‍🏫', level: 2, sentence: 'Our teacher is kind and wise.', sentenceZh: '我们的老师既温柔又有智慧。' },
            { id: 'w_doctor', word: 'doctor', phonics: 'd-o-c-tor', ipa: '/ˈdɒktər/', zh: '医生', icon: '🩺', level: 2, sentence: 'The doctor helps sick pets.', sentenceZh: '医生帮助生病的小动物。' },
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
        icon: '👕',
        words: [
            { id: 'w_head', word: 'head', phonics: 'h-ea-d', ipa: '/hed/', zh: '头/脑袋', icon: '🙂', level: 1, sentence: 'Nod your head and say yes!', sentenceZh: '点点头说好呀！' },
            { id: 'w_eye', word: 'eye', phonics: 'eye', ipa: '/aɪ/', zh: '眼睛', icon: '👀', level: 1, sentence: 'Protect our bright little eyes.', sentenceZh: '保护好我们明亮的小眼睛。' },
            { id: 'w_ear', word: 'ear', phonics: 'ear', ipa: '/ɪər/', zh: '耳朵', icon: '👂', level: 1, sentence: 'Rabbit has two long ears.', sentenceZh: '小兔子有两只长耳朵。' },
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
            { id: 'w_thunder', word: 'thunder', phonics: 'th-un-d-er', ipa: '/ˈθʌndər/', zh: '雷声', icon: '⚡', level: 3, sentence: 'Magic lightningRoars like thunder!', sentenceZh: '魔法闪电如雷鸣般轰响！' },
            { id: 'w_sky', word: 'sky', phonics: 'sk-y', ipa: '/skaɪ/', zh: '天空', icon: '🌤️', level: 1, sentence: 'White birds fly high in the sky.', sentenceZh: '白鸟在高高的天空飞翔。' }
        ]
    },
    {
        id: 'pack_actions',
        name: '动作与反义词',
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
    }
];

export const ALL_WORDS = WORD_PACKS.flatMap(p => p.words.map(w => ({ ...w, packId: p.id, packName: p.name })));

export class EnglishEngine {
    constructor(config = {}) {
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
        this.config = {
            level: cfg.level || 'level2_match',
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
        const packObj = cfg.packId && cfg.packId !== 'all'
            ? WORD_PACKS.find(p => p.id === cfg.packId)
            : null;
        const base = map[cfg.level] || '⚡ 初阶图词配对';
        return packObj ? `${base}·${packObj.name}` : base;
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

    getWordPool() {
        if (this.config.packId && this.config.packId !== 'all') {
            const pack = WORD_PACKS.find(p => p.id === this.config.packId);
            if (pack) return pack.words;
        }
        return ALL_WORDS;
    }

    startVocabStudySession(packId = 'pack_animals', wordMasteryMap = {}) {
        const pack = WORD_PACKS.find(p => p.id === packId) || WORD_PACKS[0];
        const sorted = [...pack.words].sort((a, b) => {
            const ma = wordMasteryMap[a.id] || 0;
            const mb = wordMasteryMap[b.id] || 0;
            if (ma !== mb) return ma - mb;
            return Math.random() - 0.5;
        });
        const targetWords = sorted.slice(0, 5);

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
            phase: 'study',
            words: targetWords,
            studyIdx: 0,
            quizQueue,
            quizIdx: 0,
            correctInSession: 0
        };
        return this.studySession;
    }

    nextQuickQuestion(forcedWordId = null) {
        const pool = this.getWordPool();
        let target = null;
        let isAutoReview = false;

        if (forcedWordId) {
            target = ALL_WORDS.find(w => w.id === forcedWordId) || null;
        }

        // 艾宾浩斯智能穿插复习：平时闯关以 22% 概率优先回捞当前宝贝做错过的待强化单词
        if (!target && this.mistakesProvider && !this._lastWasReview) {
            try {
                const { wordMastery = {}, englishMistakes = [] } = this.mistakesProvider() || {};
                const mistakePool = englishMistakes
                    .map(m => ALL_WORDS.find(w => w.id === m.wordId))
                    .filter(w => w && w.id !== this._lastWordId);
                if (mistakePool.length > 0 && Math.random() < 0.22) {
                    target = mistakePool[Math.floor(Math.random() * mistakePool.length)];
                    isAutoReview = true;
                } else if (pool.length > 1 && Math.random() < 0.35) {
                    // 优先挑选尚未满 3 星的新词/低熟练度词
                    const unmastered = pool.filter(w => (wordMastery[w.id] || 0) < 3 && w.id !== this._lastWordId);
                    if (unmastered.length > 0) {
                        target = unmastered[Math.floor(Math.random() * unmastered.length)];
                    }
                }
            } catch (e) {}
        }

        if (!target) {
            const candidates = pool.length > 1 ? pool.filter(w => w.id !== this._lastWordId) : pool;
            target = candidates[Math.floor(Math.random() * candidates.length)];
        }

        this._lastWordId = target.id;
        this._lastWasReview = Boolean(forcedWordId || isAutoReview);

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

        q.isReview = Boolean(forcedWordId || isAutoReview);
        if (q.isReview) {
            q.hint = `🔄 弱项重温 · ${q.hint}`;
        }
        this.currentQuiz = q;
        return q;
    }

    buildListenChoiceQuestion(target) {
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

    buildWordChoiceQuestion(target) {
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

    buildSpellQuestion(target, fullWord = false) {
        const chars = target.word.toLowerCase().split('');
        let missingIndices = [];

        if (fullWord || chars.length <= 4) {
            missingIndices = chars.map((_, idx) => idx);
        } else {
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
