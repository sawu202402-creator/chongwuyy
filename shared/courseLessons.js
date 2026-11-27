/**
 * shared/courseLessons.js - 校外英语同步课后专项题库与抽查引擎
 *
 * 设计目标：
 * 1. 长期可扩展：家长每次发来新的校外英语课作业单（如 S1U1W2、S1U1W3、S1U2W1...），
 *    只需在 COURSE_LESSONS 数组最前面追加一个课次对象，大厅、萌宠店长、保卫萝卜、植物大战僵尸四端自动同步最新课次！
 * 2. 100% 还原课后三大核心考核方式：
 *    - 【👂 听音写词抽查 (course_phonics)】：对应作业“复习发音，下次课听音写词，随机抽查”（全词盲听字母拼写，不露原词）；
 *    - 【✍️ 高频词与原句听写 (course_sight)】：对应作业“主教材高频词与句子听写”（Words to Know 整词默写 + 原句听音排词成句）；
 *    - 【📖 课文问答闯关 (course_qa)】 + 【📹 视频朗读跟读卡 (course_readcard)】：对应作业“视频朗读问答打卡”（Q&A 对答、关键词填空、三段心情排序与逐句慢读领读）。
 * 3. Fisher-Yates 洗牌袋无放回抽题：一轮把本课全部词句练透，绝不扎堆重复。
 */

export const COURSE_SUB_MODES = [
    { id: 'course_all',      name: '🎓 课后全项抽查',   shortName: '🎓 全课抽查', label: '🎓 全课抽查', title: '🎓 课后全项抽查', desc: '综合轮抽：听音写词 + 高频词句听写 + 课文问答' },
    { id: 'course_phonics',  name: '👂 听音写词抽查',   shortName: '👂 听音写词', label: '👂 听音写词', title: '👂 听音写词抽查', desc: '盲听发音与自然拼读，全字母默写单词（模拟随堂听写）' },
    { id: 'course_sight',    name: '✍️ 高频词句听写',   shortName: '✍️ 词句听写', label: '✍️ 词句听写', title: '✍️ 高频词句听写', desc: '主教材 Words to Know 高频词默写 + 原句听音排词' },
    { id: 'course_qa',       name: '📖 课文问答闯关',   shortName: '📖 课文问答', label: '📖 课文问答', title: '📖 课文问答闯关', desc: '课文 Q&A 提问对答、核心词补全与段落排序' },
    { id: 'course_readcard', name: '📹 视频朗读跟读卡', shortName: '📹 视频跟读', label: '📹 视频跟读', title: '📹 视频朗读跟读卡', desc: '视频打卡专用：问句/答句点读、逐句慢读与背诵打卡' }
];

export const ALL_COURSE_SUB_IDS = COURSE_SUB_MODES.map(m => m.id);

/**
 * 校外英语课同步题库注册表（最新课次排在数组第 0 项，默认自动选中最新课次）
 */
export const COURSE_LESSONS = [
    {
        id: 'S1U1W3',
        code: 'S1U1W3',
        stage: 'S1',
        dateLabel: '11/26',
        storyTitle: 'A Pig for Cliff',
        title: 'S1U1W3 · A Pig for Cliff',
        badgeLabel: 'S1 · 11/26 主课本 (S1U1W3 · A Pig for Cliff)',
        subtitle: 'P65 关键细节3格复述 · 课文问答 5 组 · 高频词句 4 组 · L-blends 拼读 12 词',
        qaSectionTitle: '📖 2. 课文精读问答 & P64-65 Key Details（A Pig for Cliff）',
        sightSectionTitle: '✍️ 3. 主教材黄底高亮高频词与必背句 (Words to Know: come / pull / be / good)',
        phonicsRuleTitle: 'L-blends (cl/gl/sl/bl/fl/pl) 辅音连缀拼读 · 听音写词 12 词',

        // P65 Comprehension · Key Details 3格顺序流程图
        retellFlow: {
            title: '🎬 1. 课本 P65 阅读技巧复述：Key Details 故事细节 3 步顺序图',
            centerBadge: 'A Pig for Cliff',
            wordBank: ['Slim', 'big black pig', 'breaks the swing', 'mud', 'pulls Cliff', 'good pet'],
            fullSpeakText: 'A Pig for Cliff. First, Cliff has a big, black pet pig named Slim. Next, Slim breaks the swing, so Cliff and Slim fall in the mud. Last, Slim pulls Cliff up out of the mud. Slim is a good pet.',
            boxes: [
                {
                    id: 'flow_1',
                    step: 1,
                    en: 'Cliff has a big, black pet pig named Slim.',
                    htmlEn: 'Cliff has a <u>big, black</u> pet pig named <u>Slim</u>. <small>(P57)</small>',
                    zh: '克里夫有一只名叫斯利姆（Slim）的又大又黑的宠物猪。',
                    blanks: ['Slim']
                },
                {
                    id: 'flow_2',
                    step: 2,
                    en: 'Slim breaks the swing, so Cliff and Slim fall in the mud.',
                    htmlEn: 'Slim <u>breaks the swing</u>, so Cliff and Slim fall in the <u>mud</u>. <small>(P60–61)</small>',
                    zh: '斯利姆坐断了秋千，结果克里夫和斯利姆一起摔进了泥坑里。',
                    blanks: ['swing', 'mud']
                },
                {
                    id: 'flow_3',
                    step: 3,
                    en: 'Slim pulls Cliff up out of the mud. Slim is a good pet.',
                    htmlEn: 'Slim <u>pulls</u> Cliff up out of the mud. Slim is a <u>good pet</u>. <small>(P63)</small>',
                    zh: '斯利姆把克里夫从泥坑里拉了上来。斯利姆真是只棒极了的好宠物！',
                    blanks: ['pulls', 'good pet']
                }
            ]
        },

        // 主课本 P54–P63 全文逐页点读
        storyChapters: {
            summaryTitle: '📚 展开《A Pig for Cliff》主课本全文逐页点读 (P56–P63)',
            meta: "Genre: Fantasy (奇幻故事) · Essential Question: What makes a pet special? Read about Cliff's new pet.",
            chartTitle: '🐷 A Pig for Cliff 角色与高频词速览：',
            partyChart: [
                { name: 'Cliff 🐯', item: 'glad · has a new pet' },
                { name: 'Slim 🐷', item: 'a big black pig' },
                { name: 'Words to Know ✨', item: 'come · pull · be · good' }
            ],
            chapters: [
                {
                    title: 'A Pig for Cliff · Textbook Story (P56–P63)',
                    pages: [
                        { page: 'P56', en: 'Cliff is glad. Cliff has a new pet.', zh: '克里夫很高兴。克里夫有了一只新宠物。' },
                        { page: 'P57', en: 'It is Slim. It is a big black pig.', zh: '它是斯利姆（Slim）。它是一只又大又黑的猪。' },
                        { page: 'P58', en: 'Slim can not fit in!', zh: '斯利姆太大了，挤不进屋门！' },
                        { page: 'P59', en: 'Come out, Slim!', zh: '快出来，斯利姆！（黄底高频词：Come）' },
                        { page: 'P60', en: 'Slam! Cliff can not sit with Slim.', zh: '砰！克里夫没法和斯利姆一起坐秋千（秋千断啦）。' },
                        { page: 'P61', en: 'Cliff and Slim slip.', zh: '克里夫和斯利姆脚下一滑（摔进了泥巴里）。' },
                        { page: 'P62', en: 'Slim can go up. Cliff can not.', zh: '斯利姆爬得上去，克里夫却爬不上去。' },
                        { page: 'P63', en: 'Slim can pull Cliff. Slim will be a good pet!', zh: '斯利姆能拉住克里夫往上爬。斯利姆会是一只很棒的好宠物！（黄底高频词：pull, be, good）' }
                    ]
                }
            ]
        },

        qaList: [
            {
                id: 's1u1w3_qa1',
                index: 1,
                icon: '🐷',
                q: "What is Cliff's new pet, and what does it look like?",
                qSpeak: "What is Cliff's new pet, and what does it look like?",
                qZh: '【课本P56-57 & P64圈画细节】克里夫的新宠物是谁？它长什么样？',
                a: 'Cliff has a big, black pet pig named Slim.',
                aZh: '克里夫有一只名叫斯利姆（Slim）的又大又黑的宠物猪。',
                sentences: [
                    { en: 'Cliff has a big, black pet pig named Slim.', zh: '克里夫有一只名叫斯利姆的又大又黑的宠物猪。' }
                ],
                clozeSentence: 'It is Slim. It is a big ____ ____.',
                clozeAnswer: 'black pig',
                clozeOptions: ['black pig', 'white dog', 'small cat', 'pink duck'],
                qaDistractors: [
                    'Cliff has a tiny white rabbit.',
                    'Cliff has six little yellow chicks.',
                    'Cliff does not have any pet.'
                ],
                keyVocab: { word: 'black', zh: '黑色的 (big black pig)', icon: '🐷', phonics: 'bl-a-ck' }
            },
            {
                id: 's1u1w3_qa2',
                index: 2,
                icon: '🚪',
                q: 'Why does Cliff say "Come out, Slim!" at the door?',
                qSpeak: 'Why does Cliff say Come out, Slim at the door?',
                qZh: '【课本P58-59】在门口为什么克里夫喊“快出来，斯利姆”？',
                a: 'Because Slim is too big and can not fit in!',
                aZh: '因为斯利姆体型太大了，卡在门口挤不进去！',
                sentences: [
                    { en: 'Slim can not fit in! Come out, Slim!', zh: '斯利姆挤不进去！快出来，斯利姆！' }
                ],
                clozeSentence: 'Slim can not ____ in! ____ out, Slim!',
                clozeAnswer: 'fit → Come',
                clozeOptions: ['fit → Come', 'sit → Go', 'slip → Run', 'pull → Jump'],
                qaDistractors: [
                    'Because Slim wants to sleep on the roof.',
                    'Because Slim is eating apples in the tree.',
                    'Because Slim is very small.'
                ],
                keyVocab: { word: 'come', zh: '来；出来 (Come out)', icon: '🚪', phonics: 'c-o-me' }
            },
            {
                id: 's1u1w3_qa3',
                index: 3,
                icon: '💥',
                q: 'What happens when Cliff and Slim sit on the swing?',
                qSpeak: 'What happens when Cliff and Slim sit on the swing?',
                qZh: '【课本P60-61 & P65第2格】当克里夫和斯利姆坐秋千时发生了什么？',
                a: 'Slim breaks the swing, so Cliff and Slim slip and fall in the mud.',
                aZh: '斯利姆把秋千坐断了，克里夫和斯利姆滑倒摔进了泥坑里。',
                sentences: [
                    { en: 'Slim breaks the swing, so Cliff and Slim fall in the mud.', zh: '斯利姆坐断秋千，他们一起摔进泥坑里。' }
                ],
                clozeSentence: 'Slim breaks the ____, so Cliff and Slim fall in the ____.',
                clozeAnswer: 'swing → mud',
                clozeOptions: ['swing → mud', 'cart → river', 'door → pond', 'stool → grass'],
                qaDistractors: [
                    'They fly high into the sky on the swing.',
                    'They pick blueberries on the hill.',
                    'Slim falls asleep under the tree.'
                ],
                keyVocab: { word: 'slip', zh: '滑倒 (Cliff and Slim slip)', icon: '💥', phonics: 'sl-i-p' }
            },
            {
                id: 's1u1w3_qa4',
                index: 4,
                icon: '🌟',
                q: 'How does Slim help Cliff? (Retell all 3 Key Details in order)',
                qSpeak: 'How does Slim help Cliff?',
                qZh: '【课本P63 & P65全篇3步排序】斯利姆是怎么帮克里夫的？按顺序复述故事细节！',
                a: 'Slim pulls Cliff up out of the mud. Slim will be a good pet!',
                aZh: '斯利姆爬出泥坑并把克里夫拉了上来，斯利姆会是一只非常棒的好宠物！',
                sentences: [
                    { en: 'Cliff has a big, black pet pig named Slim.', zh: '1️⃣ 克里夫有一只叫斯利姆的大黑猪宠物。(P57)' },
                    { en: 'Slim breaks the swing, so Cliff and Slim fall in the mud.', zh: '2️⃣ 斯利姆坐断秋千，俩人摔进泥坑。(P60-61)' },
                    { en: 'Slim pulls Cliff up out of the mud. Slim is a good pet.', zh: '3️⃣ 斯利姆把克里夫拉出泥坑，真是好宠物！(P63)' }
                ],
                clozeSentence: 'Slim can ____ Cliff. Slim will ____ a ____ pet!',
                clozeAnswer: 'pull → be → good',
                clozeOptions: ['pull → be → good', 'push → not → bad', 'see → go → sad', 'dig → have → new'],
                qaDistractors: [
                    'Cliff pulls Slim up out of the mud.',
                    'Slim runs away and leaves Cliff in the mud.',
                    'Beaver builds a bridge for Cliff.'
                ],
                keyVocab: { word: 'pull', zh: '拉；拽 (pull Cliff)', icon: '💪', phonics: 'p-u-ll' }
            },
            {
                id: 's1u1w3_qa5',
                index: 5,
                icon: '🏍️',
                q: 'What genre is "A Pig for Cliff"? Why?',
                qSpeak: 'What genre is A Pig for Cliff? Why?',
                qZh: '【课本P54体裁理解】《A Pig for Cliff》是什么体裁？为什么？',
                a: 'It is fantasy because a cat wears clothes, rides a bike, and keeps a big pig as a pet.',
                aZh: '它是奇幻故事（Fantasy），因为故事里小老虎猫会穿衣服、骑摩托边车还养大黑猪当宠物。',
                sentences: [
                    { en: 'It is fantasy because the animal characters act like people in a made-up story.', zh: '它是奇幻故事，动物角色像人一样生活，并非真实发生的事。' }
                ],
                clozeSentence: '"A Pig for Cliff" is a ____ story about what makes a pet special.',
                clozeAnswer: 'fantasy',
                clozeOptions: ['fantasy', 'nonfiction', 'science', 'history'],
                qaDistractors: [
                    'It is nonfiction with real photos of farm pigs.',
                    'It is a math book about counting pigs.',
                    'It is a true news report.'
                ],
                keyVocab: { word: 'glad', zh: '高兴的 (Cliff is glad)', icon: '😊', phonics: 'gl-a-d' }
            }
        ],

        sightWords: [
            {
                id: 'cw_s1u1w3_come',
                word: 'come',
                zh: '来；出来（高频词①）',
                icon: '👋',
                phonics: 'c-o-me',
                ipa: '/kʌm/',
                sentence: 'Come out, Slim!',
                sentenceZh: '快出来，斯利姆！（P59原句）',
                maskedSentence: '____ out, Slim!',
                distractorChars: ['a', 'u', 'n']
            },
            {
                id: 'cw_s1u1w3_pull',
                word: 'pull',
                zh: '拉；拽（高频词②）',
                icon: '💪',
                phonics: 'p-u-ll',
                ipa: '/pʊl/',
                sentence: 'Slim can pull Cliff.',
                sentenceZh: '斯利姆能把克里夫拉上来。（P63原句）',
                maskedSentence: 'Slim can ____ Cliff.',
                distractorChars: ['b', 'a', 't']
            },
            {
                id: 'cw_s1u1w3_be',
                word: 'be',
                zh: '成为；是（高频词③）',
                icon: '🌟',
                phonics: 'b-e',
                ipa: '/biː/',
                sentence: 'Slim will be a good pet!',
                sentenceZh: '斯利姆会成为一只很棒的好宠物！（P63原句）',
                maskedSentence: 'Slim will ____ a good pet!',
                distractorChars: ['d', 'a', 'i']
            },
            {
                id: 'cw_s1u1w3_good',
                word: 'good',
                zh: '好的；乖巧的（高频词④）',
                icon: '👍',
                phonics: 'g-oo-d',
                ipa: '/ɡʊd/',
                sentence: 'Slim is a good pet.',
                sentenceZh: '斯利姆是一只很棒的好宠物。（P65原句）',
                maskedSentence: 'Slim is a ____ pet.',
                distractorChars: ['b', 'u', 'p']
            }
        ],

        phonicsWords: [
            { id: 'cw_s1u1w3_glad',  word: 'glad',  zh: '高兴的(gl-)', icon: '😊', phonics: 'gl-a-d',  ipa: '/ɡlæd/',  sentence: 'Cliff is glad.',                   distractorChars: ['c', 'e', 'b'] },
            { id: 'cw_s1u1w3_slim',  word: 'slim',  zh: '苗条/斯利姆(sl-)', icon: '🐷', phonics: 'sl-i-m', ipa: '/slɪm/', sentence: 'It is Slim.',                     distractorChars: ['c', 'a', 'n'] },
            { id: 'cw_s1u1w3_black', word: 'black', zh: '黑色的(bl-)', icon: '⬛', phonics: 'bl-a-ck', ipa: '/blæk/',  sentence: 'It is a big black pig.',            distractorChars: ['p', 'e', 'g'] },
            { id: 'cw_s1u1w3_slam',  word: 'slam',  zh: '砰地一声(sl-)', icon: '💥', phonics: 'sl-a-m', ipa: '/slæm/',  sentence: 'Slam! The swing breaks.',           distractorChars: ['e', 'n', 'f'] },
            { id: 'cw_s1u1w3_slip',  word: 'slip',  zh: '滑倒(sl-)',   icon: '🛝', phonics: 'sl-i-p',  ipa: '/slɪp/',  sentence: 'Cliff and Slim slip.',              distractorChars: ['a', 'b', 't'] },
            { id: 'cw_s1u1w3_cliff', word: 'cliff', zh: '悬崖/克里夫(cl-)', icon: '🐯', phonics: 'cl-i-ff', ipa: '/klɪf/', sentence: 'Slim can pull Cliff.',           distractorChars: ['g', 'a', 't'] },
            { id: 'cw_s1u1w3_flag',  word: 'flag',  zh: '旗帜(fl-)',   icon: '🚩', phonics: 'fl-a-g',  ipa: '/flæɡ/',  sentence: 'Wave the red flag.',                distractorChars: ['b', 'e', 'k'] },
            { id: 'cw_s1u1w3_plan',  word: 'plan',  zh: '计划(pl-)',   icon: '📝', phonics: 'pl-a-n',  ipa: '/plæn/',  sentence: 'Cliff has a good plan.',            distractorChars: ['b', 'e', 'm'] },
            { id: 'cw_s1u1w3_clap',  word: 'clap',  zh: '拍手(cl-)',   icon: '👏', phonics: 'cl-a-p',  ipa: '/klæp/',  sentence: 'Clap your hands for Slim!',         distractorChars: ['g', 'e', 'b'] },
            { id: 'cw_s1u1w3_flip',  word: 'flip',  zh: '翻转(fl-)',   icon: '🤸', phonics: 'fl-i-p',  ipa: '/flɪp/',  sentence: 'Can you do a flip?',                distractorChars: ['a', 'b', 'c'] },
            { id: 'cw_s1u1w3_mud',   word: 'mud',   zh: '泥巴(故事词)', icon: '🟤', phonics: 'm-u-d',   ipa: '/mʌd/',   sentence: 'Cliff and Slim fall in the mud.',   distractorChars: ['a', 'b', 'n'] },
            { id: 'cw_s1u1w3_swing', word: 'swing', zh: '秋千(故事词)', icon: '🪢', phonics: 'sw-i-ng', ipa: '/swɪŋ/',  sentence: 'Slim breaks the swing.',            distractorChars: ['a', 'e', 'k'] }
        ]
    },
    {
        id: 'S1_1121',
        code: 'S1·分级2',
        stage: 'S1',
        dateLabel: '11/21',
        storyTitle: 'Harvest Time',
        title: 'S1·分级2 · Harvest Time',
        badgeLabel: 'S1 · 11/21 分级阅读 (Harvest Time)',
        subtitle: 'P12 故事3格复述 · 四章绘本全文 P2-11 · 课后问答 5 组 · 农场丰收词库 12 词',
        qaSectionTitle: '📖 2. 分级绘本精读问答 & P12 Respond to Reading（Harvest Time）',
        sightSectionTitle: '✍️ 3. 课堂圈画核心词与原句听读（harvest / ripe / cart / market / bridge）',
        phonicsRuleTitle: '农场丰收绘本核心词 + 方位短语听音拼写 12 词',

        // P12 Respond to Reading · Retell 3格故事复述图
        retellFlow: {
            title: '🎬 1. 绘本 P12 Retell：Harvest Time 农场丰收故事 3 格复述图',
            centerBadge: 'Harvest Time',
            wordBank: ['ripe', 'corn', 'pumpkins', 'apples', 'fill the cart', 'bridge is down', 'Beaver', 'market'],
            fullSpeakText: 'Harvest Time. First, Pig picks corn, Goose picks pumpkins, and Dog picks apples. They fill the cart to go to market. Next, they drive down to the river, but the bridge is down, so they cannot cross the river. Last, clever Beaver makes a new bridge, so they get to market and sell their harvest!',
            boxes: [
                {
                    id: 'flow_1',
                    step: 1,
                    en: 'Pig, Goose, and Dog pick corn, pumpkins, and apples and fill the cart.',
                    htmlEn: 'Pig, Goose, and Dog pick <u>corn, pumpkins, and apples</u> and <u>fill the cart</u>.',
                    zh: '小猪摘玉米、白鹅摘南瓜、小狗摘苹果，大家把推车装得满满当当准备去集市。',
                    blanks: ['fill the cart']
                },
                {
                    id: 'flow_2',
                    step: 2,
                    en: "They drive down to the river, but the bridge is down. They can't get to market.",
                    htmlEn: "They drive down to the river, but <u>the bridge is down</u>. They can't get to <u>market</u>.",
                    zh: '他们赶车来到河边，可是木桥塌了，没法把丰收的农作物运到集市去。',
                    blanks: ['bridge is down', 'market']
                },
                {
                    id: 'flow_3',
                    step: 3,
                    en: 'Beaver makes a new bridge, so they can cross the river and sell their harvest at the market!',
                    htmlEn: '<u>Beaver</u> makes a <u>new bridge</u>, so they can get to market and sell their harvest!',
                    zh: '聪明的河狸修好了一座新桥，大家顺利过河去集市售卖苹果、南瓜和玉米啦！',
                    blanks: ['Beaver', 'new bridge']
                }
            ]
        },

        // 分级绘本 4 大章节 P2–P11 原文点读 + 农场分工表
        storyChapters: {
            summaryTitle: '📚 展开《Harvest Time》四章绘本全文点读 (P2–P11 + 农场分工与课堂笔记)',
            meta: 'Genre: Fantasy (not real · 奇幻故事) · Essential Question: What is it like where you live? · Note: ripe = ready to eat (成熟可吃了)',
            chartTitle: '🌾 Harvest Time 农场丰收分工表：',
            partyChart: [
                { name: 'Pig 🐷', item: 'corn 🌽 (looks out)' },
                { name: 'Goose 🪿', item: 'pumpkins 🎃 (looks down)' },
                { name: 'Dog 🐶', item: 'apples 🍎 (looks up)' },
                { name: 'Beaver 🦫', item: 'makes a new bridge 🌉' }
            ],
            chapters: [
                {
                    title: 'Chapter 1 · Ready to Pick (P2–P3)',
                    pages: [
                        { page: 'P2', en: 'It\'s harvest time on the farm! Everyone is helping. "I like harvest time," says Pig. "Everything is ripe and ready to pick."', zh: '农场到了丰收时节！大家都在帮忙。小猪说：“我喜欢丰收季，所有作物都成熟（ripe = ready to eat）可以采摘啦。”' },
                        { page: 'P3', en: '"I\'ll pick the corn," says Pig. "I\'ll pick the pumpkins," says Goose. "I\'ll pick the apples," says Dog.', zh: '小猪说：“我来摘玉米。”白鹅说：“我来摘南瓜。”小狗说：“我来摘苹果。”' }
                    ]
                },
                {
                    title: 'Chapter 2 · Everyone Helps (P4–P6)',
                    pages: [
                        { page: 'P4', en: 'Pig looks out at the corn. "This is nice corn," he says. "It is very nice, Pig," says Goose. "It will sell well at the market."', zh: '小猪向外看着玉米地：“这玉米真不错。”白鹅说：“非常棒，在集市上一定很好卖！”' },
                        { page: 'P5', en: 'Goose looks down at the pumpkins. "These are nice pumpkins," she says. "They are very nice, Goose," says Dog. "They will sell well at the market."', zh: '白鹅低头看着大南瓜：“这些南瓜真不错。”小狗夸道：“非常棒，在集市上一定很好卖！”' },
                        { page: 'P6', en: 'Dog looks up at the apples. "These are nice apples," he says. "They are very nice, Dog," says Pig. "They will sell well at the market."', zh: '小狗抬头看着树上的红苹果：“这些苹果真不错。”小猪说：“非常棒，在集市上一定很好卖！”' }
                    ]
                },
                {
                    title: 'Chapter 3 · Off to Market! (P7–P8)',
                    pages: [
                        { page: 'P7', en: '"We are finished," says Pig. "Let\'s load the cart," says Goose. Pig, Goose, and Dog fill the cart with apples, pumpkins, and corn. "We are ready to go to market!" says Dog.', zh: '“摘完啦！”小猪说。“我们装车吧！”他们把苹果、南瓜和玉米装满推车（fill the cart），准备出发去集市！' },
                        { page: 'P8', en: 'Pig, Goose, and Dog hop on the cart. They drive down to the river. "Oh, no! The bridge is down," says Pig. "We can\'t get the harvest to market," says Goose. "What will we do?" asks Dog.', zh: '大家跳上推车赶往河边。“糟糕！桥塌了（The bridge is down）！”小猪喊道，“我们没法把丰收作物运去集市了，怎么办呀？”' }
                    ]
                },
                {
                    title: 'Chapter 4 · Clever Beaver (P9–P11)',
                    pages: [
                        { page: 'P9', en: '"I know someone who can help us," says Pig. "Who is it?" asks Goose. "Beaver can help us!" says Dog.', zh: '小猪说：“我知道谁能帮我们！”小狗兴奋地说：“河狸（Beaver）能帮我们！”' },
                        { page: 'P10', en: 'Pig, Goose, and Dog talk to Beaver. "The bridge is down," says Pig. "We have to cross the river," says Goose. "Can you help us?" asks Dog.', zh: '大家对河狸说：“桥塌了，我们必须过河，你能帮帮我们吗？”' },
                        { page: 'P11', en: 'Beaver makes a new bridge. "Beaver did it!" says Pig. "Thank you, Beaver!" says Dog. "Now we can get to market," says Goose. "We can sell our apples, pumpkins, and corn!"', zh: '河狸修好了一座新桥！大家欢呼道谢：“现在我们能去集市卖苹果、南瓜和玉米啦！”' }
                    ]
                }
            ]
        },

        qaList: [
            {
                id: 's1_1121_qa1',
                index: 1,
                icon: '🌽',
                q: 'What do Pig, Goose, and Dog each pick on the farm?',
                qSpeak: 'What do Pig, Goose, and Dog each pick on the farm?',
                qZh: '【绘本P3课堂连线题】小猪、白鹅和小狗在农场分别采摘什么？',
                a: 'Pig picks the corn, Goose picks the pumpkins, and Dog picks the apples.',
                aZh: '小猪摘玉米，白鹅摘南瓜，小狗摘苹果。',
                sentences: [
                    { en: 'Pig picks the corn, Goose picks the pumpkins, and Dog picks the apples.', zh: '小猪摘玉米，白鹅摘南瓜，小狗摘苹果。' }
                ],
                clozeSentence: 'Pig picks the ____, Goose picks the ____, and Dog picks the apples.',
                clozeAnswer: 'corn → pumpkins',
                clozeOptions: ['corn → pumpkins', 'apples → corn', 'berries → nuts', 'pumpkins → pears'],
                qaDistractors: [
                    'Pig picks apples, Goose picks corn, and Dog picks blueberries.',
                    'Beaver picks all the food by himself.',
                    'They buy food at the city supermarket.'
                ],
                keyVocab: { word: 'harvest', zh: '丰收；收获 (harvest time)', icon: '🌾', phonics: 'h-ar-v-e-st' }
            },
            {
                id: 's1_1121_qa2',
                index: 2,
                icon: '🛒',
                q: 'Where will the friends go after they have filled the cart?',
                qSpeak: 'Where will the friends go after they have filled the cart?',
                qZh: '【课本P12第1题 · Look at P7】装满推车后，好朋友们要去哪里？',
                a: 'They will go to market to sell their apples, pumpkins, and corn.',
                aZh: '他们要去集市（go to market）售卖摘好的苹果、南瓜和玉米。',
                sentences: [
                    { en: 'They fill the cart with apples, pumpkins, and corn.', zh: '他们把苹果、南瓜和玉米装满推车。' },
                    { en: 'They will go to market to sell them.', zh: '他们准备去集市售卖丰收成果。' }
                ],
                clozeSentence: 'After they fill the ____, they are ready to go to ____!',
                clozeAnswer: 'cart → market',
                clozeOptions: ['cart → market', 'bag → school', 'box → pond', 'boat → hill'],
                qaDistractors: [
                    'They will go to school for a spelling bee.',
                    'They will go to sleep in the farmhouse.',
                    'They will dip in the pond.'
                ],
                keyVocab: { word: 'market', zh: '集市；市场 (go to market)', icon: '🏪', phonics: 'm-ar-k-e-t' }
            },
            {
                id: 's1_1121_qa3',
                index: 3,
                icon: '🌊',
                q: 'What problem do they meet when they drive down to the river?',
                qSpeak: 'What problem do they meet when they drive down to the river?',
                qZh: '【绘本P8划线句】当他们赶车来到河边时，遇到了什么困难？',
                a: "The bridge is down, so they can't cross the river to get to market.",
                aZh: '河上的桥塌了（The bridge is down），他们没法过河去集市。',
                sentences: [
                    { en: "The bridge is down, so they can't get the harvest to market.", zh: '木桥塌了，他们没法把丰收作物运到集市去。' }
                ],
                clozeSentence: '"Oh, no! The ____ is down! We have to cross the ____."',
                clozeAnswer: 'bridge → river',
                clozeOptions: ['bridge → river', 'cart → hill', 'tree → road', 'door → farm'],
                qaDistractors: [
                    'They forgot to pick the pumpkins on the farm.',
                    'It starts to snow heavily on the hill.',
                    'The apples fell into the mud.'
                ],
                keyVocab: { word: 'bridge', zh: '桥梁 (The bridge is down)', icon: '🌉', phonics: 'br-i-dge' }
            },
            {
                id: 's1_1121_qa4',
                index: 4,
                icon: '🦫',
                q: 'How does Beaver help Pig, Goose, and Dog? (Retell all 3 parts)',
                qSpeak: 'How does Beaver help Pig, Goose, and Dog?',
                qZh: '【课本P12第2题 & 3步复述】聪明的河狸是怎么帮助小猪、白鹅和小狗的？',
                a: 'Beaver makes a new bridge, so they can cross the river and get to market.',
                aZh: '河狸建造了一座新桥，让他们顺利过河去集市售卖丰收蔬果！',
                sentences: [
                    { en: 'Pig, Goose, and Dog pick corn, pumpkins, and apples and fill the cart.', zh: '1️⃣ 小猪、白鹅和小狗采摘作物装满推车。' },
                    { en: "They drive down to the river, but the bridge is down. They can't get to market.", zh: '2️⃣ 赶车到河边发现木桥塌了，过不去河。' },
                    { en: 'Beaver makes a new bridge, so they can get to market and sell their harvest!', zh: '3️⃣ 河狸造了一座新桥，大家顺利去集市卖蔬果！' }
                ],
                clozeSentence: 'Clever ____ makes a new ____, so they can get to market!',
                clozeAnswer: 'Beaver → bridge',
                clozeOptions: ['Beaver → bridge', 'Pig → cart', 'Goose → boat', 'Dog → stool'],
                qaDistractors: [
                    'Beaver swims across the river with all the pumpkins.',
                    'Beaver buys all the corn by the river.',
                    'Beaver fixes the broken wheel of the cart.'
                ],
                keyVocab: { word: 'beaver', zh: '河狸 (Clever Beaver)', icon: '🦫', phonics: 'b-ea-v-er' }
            },
            {
                id: 's1_1121_qa5',
                index: 5,
                icon: '📘',
                q: 'Is "Harvest Time" nonfiction or fiction? Why?',
                qSpeak: 'Is Harvest Time nonfiction or fiction? Why?',
                qZh: '【封面课堂笔记 & P12第3题】《Harvest Time》是纪实还是虚构故事？为什么？',
                a: 'It is fantasy (fiction / not real), because animals talk, wear clothes, and drive a cart to market.',
                aZh: '它是奇幻虚构故事（Fantasy / not real），因为农场小动物会说话、穿衣服还会赶车去赶集。',
                sentences: [
                    { en: 'It is fantasy and not real, because animals talk, wear clothes, and drive a cart.', zh: '它是奇幻故事（not real），因为动物们会说话穿衣赶马车。' }
                ],
                clozeSentence: 'Harvest Time is ____ (not real), and "ripe" means ready to ____.',
                clozeAnswer: 'fantasy → eat',
                clozeOptions: ['fantasy → eat', 'nonfiction → sleep', 'real → run', 'science → fly'],
                qaDistractors: [
                    'It is nonfiction because real beavers sell apples at markets.',
                    'It is nonfiction with real photos of farmers.',
                    'It is a true story about a school party.'
                ],
                keyVocab: { word: 'ripe', zh: '成熟的 (ready to eat / pick)', icon: '🍎', phonics: 'r-i-pe' }
            }
        ],

        sightWords: [
            {
                id: 'cw_s1_1121_harvest',
                word: 'harvest',
                zh: '丰收；收获（主题词①）',
                icon: '🌾',
                phonics: 'h-ar-v-e-st',
                ipa: '/ˈhɑːrvɪst/',
                sentence: 'It is harvest time on the farm.',
                sentenceZh: '农场到了丰收的季节！（P2原句）',
                maskedSentence: 'It is ____ time on the farm.',
                distractorChars: ['u', 'o', 'd']
            },
            {
                id: 'cw_s1_1121_ripe',
                word: 'ripe',
                zh: '成熟的 = ready to eat（笔记词②）',
                icon: '🍎',
                phonics: 'r-i-pe',
                ipa: '/raɪp/',
                sentence: 'Everything is ripe and ready to pick.',
                sentenceZh: '所有蔬果都成熟了，可以采摘啦。（P2圈画词）',
                maskedSentence: 'Everything is ____ and ready to pick.',
                distractorChars: ['a', 'b', 't']
            },
            {
                id: 'cw_s1_1121_cart',
                word: 'cart',
                zh: '农用运货推车（圈画词③）',
                icon: '🛒',
                phonics: 'c-ar-t',
                ipa: '/kɑːrt/',
                sentence: 'They fill the cart with apples.',
                sentenceZh: '他们把推车装满苹果。（P7原句精简）',
                maskedSentence: 'They fill the ____ with apples.',
                distractorChars: ['k', 'e', 'd']
            },
            {
                id: 'cw_s1_1121_market',
                word: 'market',
                zh: '集市；市场（核心词④）',
                icon: '🏪',
                phonics: 'm-ar-k-e-t',
                ipa: '/ˈmɑːrkɪt/',
                sentence: 'We are ready to go to market.',
                sentenceZh: '我们准备好出发去集市啦！（P7原句）',
                maskedSentence: 'We are ready to go to ____.',
                distractorChars: ['n', 'c', 'i']
            },
            {
                id: 'cw_s1_1121_bridge',
                word: 'bridge',
                zh: '桥梁（核心词⑤）',
                icon: '🌉',
                phonics: 'br-i-dge',
                ipa: '/brɪdʒ/',
                sentence: 'Beaver makes a new bridge.',
                sentenceZh: '河狸修好了一座新桥。（P11原句）',
                maskedSentence: 'Beaver makes a new ____.',
                distractorChars: ['p', 'a', 't']
            }
        ],

        phonicsWords: [
            { id: 'cw_s1_1121_ph_harvest', word: 'harvest', zh: '丰收(P2)',     icon: '🌾', phonics: 'h-ar-v-e-st', ipa: '/ˈhɑːrvɪst/', sentence: 'I like harvest time.',                distractorChars: ['u', 'o', 'd'] },
            { id: 'cw_s1_1121_ph_ripe',    word: 'ripe',    zh: '成熟的(P2)',   icon: '🍎', phonics: 'r-i-pe',      ipa: '/raɪp/',      sentence: 'Everything is ripe and ready to eat.', distractorChars: ['a', 'b', 't'] },
            { id: 'cw_s1_1121_ph_corn',    word: 'corn',    zh: '玉米(P3)',     icon: '🌽', phonics: 'c-or-n',      ipa: '/kɔːrn/',     sentence: 'Pig picks the corn.',                  distractorChars: ['k', 'a', 'm'] },
            { id: 'cw_s1_1121_ph_pumpkin', word: 'pumpkin', zh: '南瓜(P3)',     icon: '🎃', phonics: 'p-u-mp-k-i-n',ipa: '/ˈpʌmpkɪn/',  sentence: 'Goose looks down at the pumpkins.',    distractorChars: ['a', 'b', 'e'] },
            { id: 'cw_s1_1121_ph_apples',  word: 'apples',  zh: '苹果(P3)',     icon: '🍎', phonics: 'a-pp-le-s',   ipa: '/ˈæpəlz/',    sentence: 'Dog looks up at the apples.',          distractorChars: ['u', 'i', 't'] },
            { id: 'cw_s1_1121_ph_cart',    word: 'cart',    zh: '推车(P7)',     icon: '🛒', phonics: 'c-ar-t',      ipa: '/kɑːrt/',     sentence: "Let's load the cart.",                 distractorChars: ['k', 'e', 'd'] },
            { id: 'cw_s1_1121_ph_market',  word: 'market',  zh: '集市(P7)',     icon: '🏪', phonics: 'm-ar-k-e-t',  ipa: '/ˈmɑːrkɪt/',  sentence: 'It will sell well at the market.',     distractorChars: ['n', 'c', 'i'] },
            { id: 'cw_s1_1121_ph_river',   word: 'river',   zh: '小河(P8)',     icon: '🌊', phonics: 'r-i-v-er',    ipa: '/ˈrɪvər/',    sentence: 'We have to cross the river.',          distractorChars: ['a', 'w', 'n'] },
            { id: 'cw_s1_1121_ph_bridge',  word: 'bridge',  zh: '木桥(P8)',     icon: '🌉', phonics: 'br-i-dge',    ipa: '/brɪdʒ/',     sentence: 'The bridge is down.',                  distractorChars: ['p', 'a', 't'] },
            { id: 'cw_s1_1121_ph_beaver',  word: 'beaver',  zh: '河狸(P9)',     icon: '🦫', phonics: 'b-ea-v-er',   ipa: '/ˈbiːvər/',   sentence: 'Beaver can help us!',                  distractorChars: ['p', 'i', 'd'] },
            { id: 'cw_s1_1121_ph_cross',   word: 'cross',   zh: '穿过(P10)',    icon: '🚶', phonics: 'cr-o-ss',     ipa: '/krɔːs/',     sentence: 'We have to cross the river.',          distractorChars: ['k', 'a', 'e'] },
            { id: 'cw_s1_1121_ph_sell',    word: 'sell',    zh: '售卖(P11)',    icon: '🪙', phonics: 's-e-ll',      ipa: '/sel/',       sentence: 'We can sell our apples and corn!',     distractorChars: ['a', 'i', 't'] }
        ]
    },
    {
        id: 'S1U1W2',
        code: 'S1U1W2',
        stage: 'S1',
        dateLabel: '11/19',
        storyTitle: 'Six Kids',
        title: 'S1U1W2 · Six Kids',
        badgeLabel: 'S1 · 11/19 主课本作业 (S1U1W2 · Six Kids)',
        subtitle: '视频朗读3格细节 · 课文问答 5 组 · 必考高频词句 4 组 · Short i 与学案词 12 词',
        qaSectionTitle: '📹 2. 作业单第3项：拍摄视频朗读故事问答 & 写作学案（Six Kids）',
        sightSectionTitle: '✍️ 3. 作业单第2项：主教材高频词抄4遍·句子2遍·下周四听写 (down / up / out / very)',
        phonicsRuleTitle: 'Short i (/ɪ/) 短元音拼读 + 课堂 Writing 学案 Word Bank 12 词',

        // 作业单第 3 项：拍摄视频，朗读阅读技巧 3 格 Detail 流程图
        retellFlow: {
            title: '🎬 1. 作业单第3项：拍摄视频 · 朗读阅读技巧 3 格细节图 (Details)',
            centerBadge: 'Six Kids',
            wordBank: ['walk up a hill', 'farm tools', 'dig holes', 'plant seeds', 'pick blueberries', 'farm', 'pond', 'dip'],
            fullSpeakText: 'Six Kids. First six chicks walk up a hill carrying farm tools. Then they dig holes to plant seeds in their garden. Then the six chicks pick blueberries.',
            boxes: [
                {
                    id: 'flow_1',
                    step: 1,
                    en: 'First six chicks walk up a hill carrying farm tools.',
                    htmlEn: 'First six chicks <u>walk up a hill</u> carrying <u>farm tools</u>.',
                    zh: '首先，六只小鸡扛着农具走上小山坡。',
                    blanks: ['walk up a hill', 'farm tools']
                },
                {
                    id: 'flow_2',
                    step: 2,
                    en: 'Then they dig holes to plant seeds in their garden.',
                    htmlEn: 'Then they <u>dig holes</u> to <u>plant seeds</u> in their garden.',
                    zh: '接着，他们在菜园里挖坑种下种子。',
                    blanks: ['dig holes', 'plant seeds']
                },
                {
                    id: 'flow_3',
                    step: 3,
                    en: 'Then the six chicks pick blueberries.',
                    htmlEn: 'Then the six chicks <u>pick blueberries</u>.',
                    zh: '然后，六只小鸡一起摘蓝莓（吃得嘴和手都变蓝啦）。',
                    blanks: ['pick blueberries']
                }
            ]
        },

        // 课堂 Writing 学案（11/19 Unit 1 Week 2 Writing: Details -> Clues）
        storyChapters: {
            summaryTitle: '📚 展开《Six Kids》11/19 课堂 Writing 写作学案点读 (Details → Clues)',
            meta: 'Prompt: Describe how where the six kids live affects what they do. Use text evidence to support your answer.',
            chartTitle: '🏡 Six Kids 居住地点与活动对应表：',
            partyChart: [
                { name: 'on the farm 🚜', item: 'go outside & dig holes 🕳️' },
                { name: 'near the hill ⛰️', item: 'see & pick blueberries 🫐' },
                { name: 'near the pond 🌊', item: 'dip in the pond 💦' }
            ],
            chapters: [
                {
                    title: 'Unit 1 Week 2 · Writing Worksheet (Nov. 19th)',
                    pages: [
                        { page: '句 1', en: 'They live on the farm, so they go outside a lot and dig holes.', zh: '他们住在农场里，所以经常去户外活动并且挖坑。' },
                        { page: '句 2', en: 'They live near the hill, so they can see and pick blueberries.', zh: '他们住在小山坡附近，所以能看到并采摘蓝莓。' },
                        { page: '句 3', en: 'They live near the pond, so they can dip in the pond.', zh: '他们住在池塘边，所以可以在池塘里泡水嬉戏。' }
                    ]
                }
            ]
        },

        qaList: [
            {
                id: 's1u1w2_qa1',
                index: 1,
                icon: '☀️',
                q: 'Where do six kids go? They go inside or outside? (P34-35)',
                qSpeak: 'Where do six kids go? Do they go inside or outside?',
                qZh: '【作业单Q1 · P34-35】六个孩子去哪里？他们去屋里还是去户外？',
                a: 'Six kids go outside.',
                aZh: '六个孩子去户外（go outside）。',
                sentences: [
                    { en: 'Six kids go outside.', zh: '六个孩子去户外活动。' }
                ],
                clozeSentence: 'Six kids go ____.',
                clozeAnswer: 'outside',
                clozeOptions: ['outside', 'inside', 'upstairs', 'asleep'],
                qaDistractors: [
                    'Six kids stay inside the house all day.',
                    'Six kids go to the city cinema.',
                    'Six kids go to bed.'
                ],
                keyVocab: { word: 'out', zh: '出去；在户外 (go outside)', icon: '☀️', phonics: 'ou-t' }
            },
            {
                id: 's1u1w2_qa2',
                index: 2,
                icon: '⛰️',
                q: 'What are they doing on pages 36 to 37? (P36-37)',
                qSpeak: 'What are they doing on pages 36 to 37?',
                qZh: '【作业单Q2 · P36-37】在课本第 36-37 页，他们正在做什么？',
                a: 'They are walking up a hill with some farm tools.',
                aZh: '他们正拿着一些农具往小山坡上走。',
                sentences: [
                    { en: 'They are walking up a hill with some farm tools.', zh: '他们正拿着农具走上小山坡。' }
                ],
                clozeSentence: 'They are walking ____ a ____ with some farm tools.',
                clozeAnswer: 'up → hill',
                clozeOptions: ['up → hill', 'down → steps', 'in → city', 'on → roof'],
                qaDistractors: [
                    'They are swimming in the deep sea.',
                    'They are reading books in the classroom.',
                    'They are making party hats.'
                ],
                keyVocab: { word: 'hill', zh: '小山坡 (walk up a hill)', icon: '⛰️', phonics: 'h-i-ll' }
            },
            {
                id: 's1u1w2_qa3',
                index: 3,
                icon: '🌱',
                q: 'What are they doing in the garden? (P38)',
                qSpeak: 'What are they doing in the garden?',
                qZh: '【作业单Q3 · P38】在课本第 38 页菜园里，他们正在做什么？',
                a: 'They are digging a hole to plant some seeds.',
                aZh: '他们正在挖坑，准备种下一些种子。',
                sentences: [
                    { en: 'They are digging a hole to plant some seeds.', zh: '他们正在挖坑种种子。' }
                ],
                clozeSentence: 'They are ____ a hole to plant some ____.',
                clozeAnswer: 'digging → seeds',
                clozeOptions: ['digging → seeds', 'picking → apples', 'drawing → pictures', 'building → bridges'],
                qaDistractors: [
                    'They are riding a bike in the city.',
                    'They are eating popcorn at school.',
                    'They are sleeping on a stool.'
                ],
                keyVocab: { word: 'dig', zh: '挖；掘 (dig holes)', icon: '🪏', phonics: 'd-i-g' }
            },
            {
                id: 's1u1w2_qa4',
                index: 4,
                icon: '🫐',
                q: 'What are they picking, and what happened when they picked? (P40)',
                qSpeak: 'What are they picking, and what happened when they picked?',
                qZh: '【作业单Q4 · P40 & 3格顺序复述】他们在摘什么？摘的时候发生了什么有趣的事？',
                a: 'They are picking blueberries. Some kids get blue when picking blueberries.',
                aZh: '他们正在摘蓝莓；摘蓝莓的时候有些孩子染得一身蓝！',
                sentences: [
                    { en: 'First six chicks walk up a hill carrying farm tools.', zh: '1️⃣ 首先六只小鸡扛着农具走上山坡。' },
                    { en: 'Then they dig holes to plant seeds in their garden.', zh: '2️⃣ 接着他们在菜园里挖坑种下种子。' },
                    { en: 'Then the six chicks pick blueberries.', zh: '3️⃣ 然后六只小鸡一起摘甜甜的蓝莓。' }
                ],
                clozeSentence: 'They are ____ blueberries. Some kids get ____ when picking blueberries.',
                clozeAnswer: 'picking → blue',
                clozeOptions: ['picking → blue', 'drinking → red', 'cutting → green', 'washing → black'],
                qaDistractors: [
                    'They are picking pumpkins and get yellow.',
                    'They find nothing left on the hill.',
                    'They break the swing and fall in the mud.'
                ],
                keyVocab: { word: 'pick', zh: '采摘 (pick blueberries)', icon: '🫐', phonics: 'p-i-ck' }
            },
            {
                id: 's1u1w2_qa5',
                index: 5,
                icon: '💦',
                q: 'Where do the six kids live, and what can they do in the pond?',
                qSpeak: 'Where do the six kids live, and what can they do in the pond?',
                qZh: '【11/19课堂Writing学案】六个孩子住在哪里？他们在池塘里可以做什么？',
                a: 'They live near the pond, so they can dip in the pond.',
                aZh: '他们住在池塘附近，所以可以在池塘里泡水玩耍（dip in the pond）。',
                sentences: [
                    { en: 'They live near the pond, so they can dip in the pond.', zh: '他们住在池塘附近，所以可以在池塘里戏水。' }
                ],
                clozeSentence: 'They live ____ the pond, so they can ____ in the pond.',
                clozeAnswer: 'near → dip',
                clozeOptions: ['near → dip', 'under → fly', 'far → run', 'inside → write'],
                qaDistractors: [
                    'They live in a very loud city.',
                    'They cannot go near the water.',
                    'They drive a cart across the pond.'
                ],
                keyVocab: { word: 'dip', zh: '浸；泡水玩 (dip in the pond)', icon: '💦', phonics: 'd-i-p' }
            }
        ],

        // 作业单第 2 项：主教材高频词抄 4 遍，句子 2 遍，下周四上课听写词和句子！
        sightWords: [
            {
                id: 'cw_s1u1w2_down',
                word: 'down',
                zh: '向下；沿着（必考高频词①）',
                icon: '⬇️',
                phonics: 'd-ow-n',
                ipa: '/daʊn/',
                sentence: 'We go down the steps.',
                sentenceZh: '我们走下台阶。（作业单听写原句）',
                maskedSentence: 'We go ____ the steps.',
                distractorChars: ['u', 'p', 'm']
            },
            {
                id: 'cw_s1u1w2_up',
                word: 'up',
                zh: '向上（必考高频词②）',
                icon: '⬆️',
                phonics: 'u-p',
                ipa: '/ʌp/',
                sentence: 'They went up the hill.',
                sentenceZh: '他们走上了小山坡。（作业单听写原句）',
                maskedSentence: 'They went ____ the hill.',
                distractorChars: ['a', 'd', 'b']
            },
            {
                id: 'cw_s1u1w2_out',
                word: 'out',
                zh: '出去；在外（必考高频词③）',
                icon: '🚪',
                phonics: 'ou-t',
                ipa: '/aʊt/',
                sentence: 'They go out to play.',
                sentenceZh: '他们出去玩耍。（作业单听写原句）',
                maskedSentence: 'They go ____ to play.',
                distractorChars: ['a', 'n', 'd']
            },
            {
                id: 'cw_s1u1w2_very',
                word: 'very',
                zh: '非常；很（必考高频词④）',
                icon: '🔊',
                phonics: 'v-e-r-y',
                ipa: '/ˈveri/',
                sentence: 'It is very loud in the city.',
                sentenceZh: '城市里非常喧闹。（作业单听写原句）',
                maskedSentence: 'It is ____ loud in the city.',
                distractorChars: ['w', 'a', 'i']
            }
        ],

        // Short i (/ɪ/) 短元音拼读 + 11/19 Writing 学案 Word Bank 8 词 = 12 词
        phonicsWords: [
            { id: 'cw_s1u1w2_six',     word: 'six',     zh: '数字六(Short i)', icon: '6️⃣', phonics: 's-i-x',       ipa: '/sɪks/',    sentence: 'Six kids go outside.',                    distractorChars: ['a', 'e', 'k'] },
            { id: 'cw_s1u1w2_kids',    word: 'kids',    zh: '孩子们(Short i)', icon: '👧', phonics: 'k-i-d-s',     ipa: '/kɪdz/',    sentence: 'Some kids get blue.',                     distractorChars: ['c', 'a', 'e'] },
            { id: 'cw_s1u1w2_dig',     word: 'dig',     zh: '挖坑(学案词)',    icon: '🪏', phonics: 'd-i-g',       ipa: '/dɪɡ/',     sentence: 'They dig holes to plant seeds.',          distractorChars: ['b', 'a', 'p'] },
            { id: 'cw_s1u1w2_dip',     word: 'dip',     zh: '泡水(学案词)',    icon: '💦', phonics: 'd-i-p',       ipa: '/dɪp/',     sentence: 'They can dip in the pond.',               distractorChars: ['b', 'a', 'g'] },
            { id: 'cw_s1u1w2_pick',    word: 'pick',    zh: '采摘(学案词)',    icon: '🫐', phonics: 'p-i-ck',      ipa: '/pɪk/',     sentence: 'They can see and pick blueberries.',      distractorChars: ['b', 'a', 'e'] },
            { id: 'cw_s1u1w2_hill',    word: 'hill',    zh: '小山坡(学案词)',  icon: '⛰️', phonics: 'h-i-ll',      ipa: '/hɪl/',     sentence: 'They live near the hill.',                distractorChars: ['a', 'e', 't'] },
            { id: 'cw_s1u1w2_farm',    word: 'farm',    zh: '农场(学案词)',    icon: '🚜', phonics: 'f-ar-m',      ipa: '/fɑːrm/',   sentence: 'They live on the farm.',                  distractorChars: ['v', 'o', 'n'] },
            { id: 'cw_s1u1w2_pond',    word: 'pond',    zh: '池塘(学案词)',    icon: '🌊', phonics: 'p-o-n-d',     ipa: '/pɑːnd/',   sentence: 'They live near the pond.',                distractorChars: ['b', 'a', 'u'] },
            { id: 'cw_s1u1w2_berries', word: 'berries', zh: '浆果(学案词)',    icon: '🫐', phonics: 'b-e-rr-ie-s', ipa: '/ˈberiz/',  sentence: 'The six chicks pick sweet berries.',      distractorChars: ['p', 'a', 'o'] },
            { id: 'cw_s1u1w2_near',    word: 'near',    zh: '在附近(学案词)',  icon: '📍', phonics: 'n-ear',       ipa: '/nɪr/',     sentence: 'They live near the pond.',                distractorChars: ['m', 'o', 't'] },
            { id: 'cw_s1u1w2_chicks',  word: 'chicks',  zh: '小鸡们(Short i)', icon: '🐥', phonics: 'ch-i-ck-s',   ipa: '/tʃɪks/',   sentence: 'Six chicks walk up a hill.',              distractorChars: ['a', 'e', 't'] },
            { id: 'cw_s1u1w2_seeds',   word: 'seeds',   zh: '种子(流程图词)',  icon: '🌱', phonics: 's-ee-d-s',    ipa: '/siːdz/',   sentence: 'They plant seeds in their garden.',       distractorChars: ['a', 'i', 'z'] }
        ]
    },
    {
        id: 'S1_1114',
        code: 'S1·分级',
        stage: 'S1',
        dateLabel: '11/14',
        storyTitle: 'Class Party',
        title: 'S1·分级 · Class Party',
        badgeLabel: 'S1 · 11/14 分级阅读 (Class Party)',
        subtitle: '学案流程图复述 4 格 · 必抄词句 5 组 · 绘本问答 6 组 · 核心词库 12 词',
        qaSectionTitle: '📖 绘本精读问答 & 学案填空（Class Party + P12 课后题）',
        sightSectionTitle: '✍️ 2. 必抄单词 5 个（每个抄 4 遍）与课本原句听读',
        phonicsRuleTitle: '核心必抄词 + 学案 Word Bank 听音拼读 12 词',

        // 群视频作业核心：录制故事 Class Party 的表格/流程图信息 details（1:1 还原课堂完成的学案）
        retellFlow: {
            title: '🎬 3. 群视频作业：录制 Class Party 学案流程图复述 (Details)',
            centerBadge: 'Class Party',
            wordBank: ['excited', 'party hats', 'sad', 'party', 'nothing', 'bring', 'idea'],
            fullSpeakText: "Class Party. The class will have a party, because they won the spelling bee. All the children are excited. They can bring something. There's nothing left for Eve to bring. She is sad. Luke has an idea. Eve can bring the party hats.",
            boxes: [
                {
                    id: 'flow_1',
                    step: 1,
                    en: 'The class will have a party, because they won the spelling bee.',
                    htmlEn: 'The class will have a <u>party</u>, because they won the spelling bee.',
                    zh: '全班将要举办一场派对，因为他们赢得了拼字比赛。',
                    blanks: ['party']
                },
                {
                    id: 'flow_2',
                    step: 2,
                    en: 'All the children are excited. They can bring something.',
                    htmlEn: 'All the children are <u>excited</u>. They can <u>bring</u> something.',
                    zh: '所有孩子都很兴奋，每个人都可以带一样东西来。',
                    blanks: ['excited', 'bring']
                },
                {
                    id: 'flow_3',
                    step: 3,
                    en: "There's nothing left for Eve to bring. She is sad.",
                    htmlEn: "There's <u>nothing</u> left for Eve to bring. She is <u>sad</u>.",
                    zh: '没有剩下东西给伊芙（Eve）带了，她很难过。',
                    blanks: ['nothing', 'sad']
                },
                {
                    id: 'flow_4',
                    step: 4,
                    en: 'Luke has an idea. Eve can bring the party hats.',
                    htmlEn: 'Luke has an <u>idea</u>. Eve can bring the <u>party hats</u>.',
                    zh: '卢克（Luke）想出了一个好主意：伊芙可以带派对帽！',
                    blanks: ['idea', 'party hats']
                }
            ]
        },

        // 分级绘本全文点读（P2–P11 双章原文 + 黑板派对分工记录表）
        storyChapters: {
            meta: 'Genre: Realistic Fiction (not real · 现实虚构故事) · Essential Question: What do you do at your school?',
            partyChart: [
                { name: 'Juan', item: 'drinks 🧃' },
                { name: 'Luke', item: 'apples 🍏' },
                { name: 'Mark', item: 'popcorn 🍿' },
                { name: 'Kate', item: 'muffins 🧁' },
                { name: 'Max', item: 'plates, napkins 🍽️' },
                { name: 'Jack', item: 'cups 🥤' },
                { name: 'Eve', item: 'party hats 🥳' }
            ],
            chapters: [
                {
                    title: 'Chapter 1 · How Can We Celebrate? (P2–P8)',
                    pages: [
                        { page: 'P2', en: 'Mrs. Lopez has a question for her class. "What happened last week?" she asks. "We won the spelling bee!" everyone says.', zh: '洛佩兹老师问全班：“上周发生了什么？”大家说：“我们赢了拼字比赛！”' },
                        { page: 'P3', en: '"What can we do to celebrate?" asks Mrs. Lopez. "We can have a party," Mark answers. "That\'s a good idea," says Mrs. Lopez.', zh: '老师问：“我们怎么庆祝呢？”马克回答：“可以开派对！”老师说：“好主意。”' },
                        { page: 'P4', en: '"A party at school will be fun!" says Kate. All the children are excited. They cannot wait for the party.', zh: '凯特说：“学校派对一定很有趣！”孩子们都很兴奋，迫不及待了（cannot = can\'t）。' },
                        { page: 'P5', en: 'Mrs. Lopez talks to the class about the party. "We will need food and drinks for our party. How can we get those things?" asks Mrs. Lopez. The children think about it.', zh: '老师和大家讨论派对：“我们需要食物和饮料，怎么准备呢？”孩子们认真思考。' },
                        { page: 'P6', en: '"We can all bring something," says Juan. "That\'s a good idea, Juan," says Mrs. Lopez. The children take turns. Juan says he will bring drinks. Luke wants to bring apples.', zh: '胡安说：“我们每人带一样东西吧！”大家轮流发言：胡安带饮料，卢克想带苹果。' },
                        { page: 'P7', en: '"I can make popcorn," says Mark. "And I can bring muffins," says Kate. "My mom will help me make them."', zh: '马克说：“我会做爆米花。”凯特说：“我可以带松饼，妈妈会帮我一起做。”' },
                        { page: 'P8', en: '"I can bring plates and napkins," says Max. "I can bring the cups," Jack adds.', zh: '麦克斯说：“我带盘子和餐巾纸。”杰克补充说：“我来带杯子。”' }
                    ]
                },
                {
                    title: 'Chapter 2 · How Can Eve Help? (P9–P11)',
                    pages: [
                        { page: 'P9', en: 'Everyone is excited, but Eve does not say anything. "What\'s wrong?" asks Mrs. Lopez. "There\'s nothing left for me to bring!" says Eve. "I want to help too."', zh: '大家都很兴奋，只有伊芙没说话。她说：“没有剩下我能带的东西了！我也想帮忙。”' },
                        { page: 'P10', en: 'Then Luke has an idea. "We will need party hats," he says. "You can bring the party hats, Eve!"', zh: '这时卢克想到了一个主意：“我们还需要派对帽，伊芙，你可以带派对帽呀！”' },
                        { page: 'P11', en: '"I like party hats," says Eve. "I will make them. That\'s how I can help!" "That\'s a good idea," says Mrs. Lopez. "If we all help out, it will be a great party!"', zh: '伊芙开心地说：“我喜欢派对帽，我来做！”老师说：“大家齐心协力，这会是很棒的派对！”' }
                    ]
                }
            ]
        },

        // 绘本问答 & 学案流程图填空与四步排序
        qaList: [
            {
                id: 's1_1114_qa1',
                index: 1,
                icon: '🎈',
                q: 'Why will the class have a party?',
                qSpeak: 'Why will the class have a party?',
                qZh: '【学案第1格】为什么全班要举办一场派对？',
                a: 'The class will have a party, because they won the spelling bee.',
                aZh: '全班将要举办一场派对，因为他们赢得了拼字比赛。',
                sentences: [
                    { en: 'The class will have a party, because they won the spelling bee.', zh: '全班要办派对，因为他们赢了拼字比赛。' }
                ],
                clozeSentence: 'The class will have a ____, because they won the spelling bee.',
                clozeAnswer: 'party',
                clozeOptions: ['party', 'chapter', 'question', 'sad'],
                qaDistractors: [
                    'Because Mrs. Lopez has a new book.',
                    'Because Eve made party hats at home.',
                    'Because there is nothing left to bring.'
                ],
                keyVocab: { word: 'party', zh: '派对 (have a party)', icon: '🎈', phonics: 'p-ar-t-y' }
            },
            {
                id: 's1_1114_qa2',
                index: 2,
                icon: '🤩',
                q: 'How do all the children feel, and what can they do?',
                qSpeak: 'How do all the children feel, and what can they do?',
                qZh: '【学案第2格】所有孩子心情如何？他们可以怎么做？',
                a: 'All the children are excited. They can bring something.',
                aZh: '所有孩子都很兴奋。他们每个人都可以带一样东西来。',
                sentences: [
                    { en: 'All the children are excited.', zh: '所有孩子都很兴奋。' },
                    { en: 'They can bring something.', zh: '他们可以每人带一样东西。' }
                ],
                clozeSentence: 'All the children are ____. They can ____ something.',
                clozeAnswer: 'excited → bring',
                clozeOptions: ['excited → bring', 'sad → nothing', 'happy → read', 'mad → take'],
                qaDistractors: [
                    'All the children are sad. Nobody wants a party.',
                    'Only Mark is excited. Mrs. Lopez brings everything.',
                    'They cannot bring food or drinks to school.'
                ],
                keyVocab: { word: 'excited', zh: '兴奋的 (are excited)', icon: '🤩', phonics: 'ex-c-i-t-ed' }
            },
            {
                id: 's1_1114_qa3',
                index: 3,
                icon: '😢',
                q: 'Why does Mrs. Lopez ask Eve what is wrong?',
                qSpeak: 'Why does Mrs. Lopez ask Eve what is wrong?',
                qZh: '【学案第3格 & P12第2题】为什么老师问伊芙怎么了？',
                a: "There's nothing left for Eve to bring. She is sad.",
                aZh: '因为大家都选完了，没有剩下东西给伊芙带，她没说话、很难过。',
                sentences: [
                    { en: "There's nothing left for Eve to bring.", zh: '没有剩下什么东西给伊芙带了。' },
                    { en: 'She is sad.', zh: '她很难过。' }
                ],
                clozeSentence: "There's ____ left for Eve to bring. She is ____.",
                clozeAnswer: 'nothing → sad',
                clozeOptions: ['nothing → sad', 'something → excited', 'party → fun', 'idea → happy'],
                qaDistractors: [
                    'Because Eve does not like popcorn or muffins.',
                    'Because Eve lost the spelling bee last week.',
                    'Because Eve forgot her homework at home.'
                ],
                keyVocab: { word: 'nothing', zh: '没有东西 (nothing left)', icon: '🫙', phonics: 'n-o-th-i-ng' }
            },
            {
                id: 's1_1114_qa4',
                index: 4,
                icon: '🥳',
                q: 'How does Luke help Eve? (Retell all 4 details)',
                qSpeak: 'How does Luke help Eve?',
                qZh: '【学案第4格 & 全篇4步排序】卢克是怎么帮伊芙想办法的？',
                a: 'Luke has an idea. Eve can bring the party hats.',
                aZh: '卢克想出了一个好主意：伊芙可以制作并带来派对帽！',
                sentences: [
                    { en: 'The class will have a party, because they won the spelling bee.', zh: '1️⃣ 全班要开派对，因为赢了拼字比赛。' },
                    { en: 'All the children are excited. They can bring something.', zh: '2️⃣ 孩子们很兴奋，大家都可以带东西。' },
                    { en: "There's nothing left for Eve to bring. She is sad.", zh: '3️⃣ 没剩东西给伊芙带了，她很难过。' },
                    { en: 'Luke has an idea. Eve can bring the party hats.', zh: '4️⃣ 卢克想到好主意：伊芙可以带派对帽！' }
                ],
                clozeSentence: 'Luke has an ____. Eve can bring the ____.',
                clozeAnswer: 'idea → party hats',
                clozeOptions: ['idea → party hats', 'idea → cups', 'question → apples', 'party → drinks'],
                qaDistractors: [
                    'Luke gives his apples to Eve.',
                    'Jack asks Eve to bring plates and napkins.',
                    'Mrs. Lopez tells Eve she does not need to help.'
                ],
                keyVocab: { word: 'idea', zh: '主意 (has an idea)', icon: '💡', phonics: 'i-d-ea' }
            },
            {
                id: 's1_1114_qa5',
                index: 5,
                icon: '📋',
                q: "How does Mrs. Lopez keep a record of the children's ideas?",
                qSpeak: "How does Mrs. Lopez keep a record of the children's ideas?",
                qZh: '【课本P12第1题】洛佩兹老师怎样记录孩子们的想法？',
                a: 'She writes their names and ideas on a Class Party chart.',
                aZh: '她把孩子们的名字和各自带的东西记录在黑板的 Class Party 表格上。',
                sentences: [
                    { en: 'She writes their names and ideas on a Class Party chart.', zh: '她把名字和想法写在黑板的班级派对表格上。' }
                ],
                clozeSentence: 'She writes their names and ideas on a Class Party ____.',
                clozeAnswer: 'chart',
                clozeOptions: ['chart', 'hat', 'cup', 'muffin'],
                qaDistractors: [
                    'She asks Mark to draw a picture of himself.',
                    'She does not write anything down.',
                    'She puts party hats on the desks.'
                ],
                keyVocab: { word: 'class', zh: '班级 (Class Party chart)', icon: '📋', phonics: 'cl-a-ss' }
            },
            {
                id: 's1_1114_qa6',
                index: 6,
                icon: '📚',
                q: 'Is Class Party nonfiction or fiction? Why?',
                qSpeak: 'Is Class Party nonfiction or fiction? Why?',
                qZh: '【课本封面笔记 & P12第3题】《Class Party》是纪实还是虚构故事？为什么？',
                a: 'It is realistic fiction because the story is made up and not real, though it could happen at school.',
                aZh: '它是现实虚构故事（not real），因为人物和故事是编出来的，但在真实学校里也可能发生。',
                sentences: [
                    { en: 'It is realistic fiction because the story is made up and not real, though it could happen at school.', zh: '它是现实虚构故事，故事是编的（not real），但在学校里可能发生。' }
                ],
                clozeSentence: 'Class Party is realistic ____ (not real), though it could happen at school.',
                clozeAnswer: 'fiction',
                clozeOptions: ['fiction', 'nonfiction', 'question', 'chapter'],
                qaDistractors: [
                    'It is nonfiction because animals can talk and fly.',
                    'It is a science book about how apples grow.',
                    'It is nonfiction with real photos of astronauts.'
                ],
                keyVocab: { word: 'celebrate', zh: '庆祝 (celebrate at school)', icon: '🎉', phonics: 'c-e-l-e-br-a-te' }
            }
        ],

        // 作业第 2 项：抄写单词（每个 4 遍）与课本原句巩固 (5 词)
        sightWords: [
            {
                id: 'cw_s1_1114_chapter',
                word: 'chapter',
                zh: '章节（必抄词①）',
                icon: '📖',
                phonics: 'ch-a-p-t-er',
                ipa: '/ˈtʃæptər/',
                sentence: 'We read chapter one in class.',
                sentenceZh: '我们在班里读第一章。',
                maskedSentence: 'We read ____ one in class.',
                distractorChars: ['s', 'k', 'o']
            },
            {
                id: 'cw_s1_1114_question',
                word: 'question',
                zh: '问题（必抄词②）',
                icon: '❓',
                phonics: 'qu-e-s-ti-on',
                ipa: '/ˈkwestʃən/',
                sentence: 'Mrs. Lopez has a question for her class.',
                sentenceZh: '洛佩兹老师有一个问题要问全班同学。（P2原句）',
                maskedSentence: 'Mrs. Lopez has a ____ for her class.',
                distractorChars: ['a', 'k', 'c']
            },
            {
                id: 'cw_s1_1114_class',
                word: 'class',
                zh: '班级；全班（必抄词③）',
                icon: '🏫',
                phonics: 'cl-a-ss',
                ipa: '/klæs/',
                sentence: 'The class will have a party.',
                sentenceZh: '全班将要举办一场派对。（学案原句）',
                maskedSentence: 'The ____ will have a party.',
                distractorChars: ['k', 'e', 'z']
            },
            {
                id: 'cw_s1_1114_celebrate',
                word: 'celebrate',
                zh: '庆祝（必抄词④）',
                icon: '🎉',
                phonics: 'c-e-l-e-br-a-te',
                ipa: '/ˈselɪbreɪt/',
                sentence: 'What can we do to celebrate?',
                sentenceZh: '我们能做些什么来庆祝呢？（P3原句）',
                maskedSentence: 'What can we do to ____?',
                distractorChars: ['s', 'k', 'i']
            },
            {
                id: 'cw_s1_1114_party',
                word: 'party',
                zh: '派对；聚会（必抄词⑤）',
                icon: '🎈',
                phonics: 'p-ar-t-y',
                ipa: '/ˈpɑːrti/',
                sentence: 'We can have a party.',
                sentenceZh: '我们可以举办一场派对。（P3原句）',
                maskedSentence: 'We can have a ____.',
                distractorChars: ['b', 'e', 'i']
            }
        ],

        // 核心词汇听音认读与拼写库（5个必抄词 + 6个学案Word Bank词 + 派对分工高频词 = 12词）
        phonicsWords: [
            { id: 'cw_s1_1114_ph_chapter',   word: 'chapter',   zh: '章节(必抄)',   icon: '📖', phonics: 'ch-a-p-t-er',    ipa: '/ˈtʃæptər/',  sentence: 'Chapter one is How Can We Celebrate.', distractorChars: ['s', 'k', 'o'] },
            { id: 'cw_s1_1114_ph_question',  word: 'question',  zh: '问题(必抄)',   icon: '❓', phonics: 'qu-e-s-ti-on',   ipa: '/ˈkwestʃən/', sentence: 'Mrs. Lopez has a question.',          distractorChars: ['a', 'k', 'c'] },
            { id: 'cw_s1_1114_ph_class',     word: 'class',     zh: '班级(必抄)',   icon: '🏫', phonics: 'cl-a-ss',        ipa: '/klæs/',      sentence: 'The class won the spelling bee.',     distractorChars: ['k', 'e', 'z'] },
            { id: 'cw_s1_1114_ph_celebrate', word: 'celebrate', zh: '庆祝(必抄)',   icon: '🎉', phonics: 'c-e-l-e-br-a-te',ipa: '/ˈselɪbreɪt/',sentence: 'What can we do to celebrate?',         distractorChars: ['s', 'k', 'i'] },
            { id: 'cw_s1_1114_ph_party',     word: 'party',     zh: '派对(必抄)',   icon: '🎈', phonics: 'p-ar-t-y',       ipa: '/ˈpɑːrti/',   sentence: 'The class will have a party.',        distractorChars: ['b', 'e', 'i'] },
            { id: 'cw_s1_1114_ph_excited',   word: 'excited',   zh: '兴奋的(学案)', icon: '🤩', phonics: 'ex-c-i-t-ed',    ipa: '/ɪkˈsaɪtɪd/', sentence: 'All the children are excited.',       distractorChars: ['s', 'a', 'k'] },
            { id: 'cw_s1_1114_ph_bring',     word: 'bring',     zh: '带来(学案)',   icon: '🤲', phonics: 'br-i-ng',        ipa: '/brɪŋ/',      sentence: 'They can bring something.',           distractorChars: ['p', 'e', 'd'] },
            { id: 'cw_s1_1114_ph_nothing',   word: 'nothing',   zh: '没什么(学案)', icon: '🫙', phonics: 'n-o-th-i-ng',    ipa: '/ˈnʌθɪŋ/',    sentence: "There's nothing left for Eve.",       distractorChars: ['a', 'u', 's'] },
            { id: 'cw_s1_1114_ph_sad',       word: 'sad',       zh: '难过的(学案)', icon: '😢', phonics: 's-a-d',          ipa: '/sæd/',       sentence: 'Eve is sad.',                         distractorChars: ['e', 'b', 't'] },
            { id: 'cw_s1_1114_ph_idea',      word: 'idea',      zh: '好主意(学案)', icon: '💡', phonics: 'i-d-ea',         ipa: '/aɪˈdiːə/',   sentence: 'Luke has an idea.',                   distractorChars: ['t', 'o', 'u'] },
            { id: 'cw_s1_1114_ph_hats',      word: 'hats',      zh: '派对帽(学案)', icon: '🥳', phonics: 'h-a-t-s',        ipa: '/hæts/',      sentence: 'Eve can bring the party hats.',       distractorChars: ['e', 'b', 'c'] },
            { id: 'cw_s1_1114_ph_drinks',    word: 'drinks',    zh: '饮料(绘本)',   icon: '🧃', phonics: 'dr-i-nk-s',      ipa: '/drɪŋks/',    sentence: 'Juan says he will bring drinks.',     distractorChars: ['t', 'e', 'g'] }
        ]
    },
    {
        id: 'S1U1W1',
        code: 'S1U1W1',
        stage: 'S1',
        dateLabel: '11/12',
        storyTitle: 'Jack Can',
        title: 'S1U1W1 · Jack Can',
        badgeLabel: 'S1 · 11/12 作业 (S1U1W1)',
        subtitle: '课文问答 4 组 · 高频词句 4 组 · 短元音 a 听写 12 词',
        phonicsRuleTitle: 'Short a (/æ/) 短元音拼读 · 听音写词 12 词',

        // 第 2 项：视频作业 · 朗读课文问答 (Jack Can)
        qaList: [
            {
                id: 's1u1w1_qa1',
                index: 1,
                icon: '🎨',
                q: 'What can Jack do ?',
                qSpeak: 'What can Jack do?',
                qZh: '杰克会做什么？',
                a: 'Jack can draw a picture of himself.',
                aZh: '杰克会画一幅他自己的画。',
                sentences: [
                    { en: 'Jack can draw a picture of himself.', zh: '杰克会画一幅他自己的画。' }
                ],
                clozeSentence: 'Jack can ____ a picture of himself.',
                clozeAnswer: 'draw',
                clozeOptions: ['draw', 'write', 'read', 'play'],
                qaDistractors: [
                    'Jack can write a word on the top.',
                    'Jack gets a stool for Nan.',
                    'Do not run at school.'
                ],
                keyVocab: { word: 'draw', zh: '画画 (Jack can draw...)', icon: '🎨', phonics: 'dr-aw' }
            },
            {
                id: 's1u1w1_qa2',
                index: 2,
                icon: '📏',
                q: 'Why Jack cannot write a word?',
                qSpeak: 'Why Jack cannot write a word?',
                qZh: '为什么杰克写不了一个词？',
                a: 'Because he cannot reach to write.',
                aZh: '因为他够不着写字的地方。',
                sentences: [
                    { en: 'Because he cannot reach to write.', zh: '因为他够不着写字的地方。' }
                ],
                clozeSentence: 'Because he cannot ____ to write.',
                clozeAnswer: 'reach',
                clozeOptions: ['reach', 'draw', 'run', 'play'],
                qaDistractors: [
                    'Because he does not like school.',
                    'Because he has no paper.',
                    'Because Nan helps him draw.'
                ],
                keyVocab: { word: 'reach', zh: '够得着 (cannot reach to write)', icon: '📏', phonics: 'r-ea-ch' }
            },
            {
                id: 's1u1w1_qa3',
                index: 3,
                icon: '🪑',
                q: 'Who helps Jack and how does she help Jack?',
                qSpeak: 'Who helps Jack and how does she help Jack?',
                qZh: '谁帮助了杰克？她是怎么帮他的？',
                a: 'Nan helps Jack. She gets a stool for Jack.',
                aZh: '南（Nan）帮助了杰克。她给杰克搬来了一把小凳子。',
                sentences: [
                    { en: 'Nan helps Jack.', zh: '南（Nan）帮助了杰克。' },
                    { en: 'She gets a stool for Jack.', zh: '她给杰克拿来一把小凳子。' }
                ],
                clozeSentence: 'Nan helps Jack. She gets a ____ for Jack.',
                clozeAnswer: 'stool',
                clozeOptions: ['stool', 'hat', 'map', 'pan'],
                qaDistractors: [
                    'Dan helps Jack. He writes the word for Jack.',
                    'Jack helps Nan. He gets a fan for Nan.',
                    'We read a lot in school.'
                ],
                keyVocab: { word: 'stool', zh: '小凳子 (gets a stool)', icon: '🪑', phonics: 'st-oo-l' }
            },
            {
                id: 's1u1w1_qa4',
                index: 4,
                icon: '😊',
                q: "How does Jack's feeling change?",
                qSpeak: "How does Jack's feeling change?",
                qZh: '杰克的心情发生了怎样的变化？',
                a: 'First, Jack feels happy. Then he is sad because he cannot reach to write. At last, he is happy again because Nan helps him.',
                aZh: '首先杰克很开心；接着因为够不着写字他很难过；最后因为南帮助了他，他又开心起来了。',
                sentences: [
                    { en: 'First, Jack feels happy.', zh: '1️⃣ 首先，杰克觉得很开心。' },
                    { en: 'Then he is sad because he cannot reach to write.', zh: '2️⃣ 接着，他很难过，因为他够不着写字。' },
                    { en: 'At last, he is happy again because Nan helps him.', zh: '3️⃣ 最后，他又开心起来了，因为南帮助了他。' }
                ],
                clozeSentence: 'First, Jack feels ____. Then he is ____ because he cannot reach to write. At last, he is happy again!',
                clozeAnswer: 'happy → sad',
                clozeOptions: ['happy → sad', 'sad → happy', 'sad → mad', 'happy → tired'],
                qaDistractors: [
                    'First, Jack feels sad. Then he goes home. At last, he sleeps.',
                    'First, Jack is mad. Then Dan helps him run at school.',
                    'Jack feels sad at last because nobody helps him.'
                ],
                keyVocab: { word: 'happy', zh: '开心 (happy → sad → happy)', icon: '😊', phonics: 'h-a-pp-y' }
            }
        ],

        // 第 3 项：书写与下周课上听写 · 主教材高频词 (Words to Know) 与必背原句
        sightWords: [
            {
                id: 'cw_s1u1w1_does',
                word: 'does',
                zh: '做（第三人称单数）',
                icon: '✍️',
                phonics: 'd-oe-s',
                ipa: '/dʌz/',
                sentence: 'Dan does his best work.',
                sentenceZh: '丹尽他最大的努力完成作业。',
                maskedSentence: 'Dan ____ his best work.',
                distractorChars: ['u', 'a', 'z']
            },
            {
                id: 'cw_s1u1w1_school',
                word: 'school',
                zh: '学校',
                icon: '🏫',
                phonics: 'sch-oo-l',
                ipa: '/skuːl/',
                sentence: 'We read a lot in school.',
                sentenceZh: '我们在学校里读很多书。',
                maskedSentence: 'We read a lot in ____.',
                distractorChars: ['k', 'u', 'e']
            },
            {
                id: 'cw_s1u1w1_not',
                word: 'not',
                zh: '不，不要',
                icon: '🚫',
                phonics: 'n-o-t',
                ipa: '/nɑːt/',
                sentence: 'Do not run at school.',
                sentenceZh: '不要在学校里奔跑。',
                maskedSentence: 'Do ____ run at school.',
                distractorChars: ['a', 'u', 'd']
            },
            {
                id: 'cw_s1u1w1_what',
                word: 'what',
                zh: '什么',
                icon: '❓',
                phonics: 'wh-a-t',
                ipa: '/wʌt/',
                sentence: 'What can we play today?',
                sentenceZh: '今天我们可以玩什么？',
                maskedSentence: '____ can we play today?',
                distractorChars: ['o', 'e', 'd']
            }
        ],

        // 第 4 项：自然拼读复习 · 下次课听音写词随机抽查 (12词)
        phonicsWords: [
            { id: 'cw_s1u1w1_ax',   word: 'ax',   ttsWord: 'axe', zh: '斧头',       icon: '🪓', phonics: 'a-x',    ipa: '/æks/',  sentence: 'Dad has an ax.',            distractorChars: ['e', 's', 'k'] },
            { id: 'cw_s1u1w1_can',  word: 'can',  zh: '能；罐头',   icon: '🥫', phonics: 'c-a-n',  ipa: '/kæn/',  sentence: 'Jack can draw a picture.',  distractorChars: ['k', 'e', 'm'] },
            { id: 'cw_s1u1w1_sad',  word: 'sad',  zh: '难过的',     icon: '😢', phonics: 's-a-d',  ipa: '/sæd/',  sentence: 'Then Jack is sad.',         distractorChars: ['e', 'b', 't'] },
            { id: 'cw_s1u1w1_fan',  word: 'fan',  zh: '风扇；扇子', icon: '🪭', phonics: 'f-a-n',  ipa: '/fæn/',  sentence: 'Turn on the cool fan.',     distractorChars: ['p', 'e', 'm'] },
            { id: 'cw_s1u1w1_hat',  word: 'hat',  zh: '帽子',       icon: '👒', phonics: 'h-a-t',  ipa: '/hæt/',  sentence: 'She has a cute hat.',       distractorChars: ['e', 'd', 'b'] },
            { id: 'cw_s1u1w1_jam',  word: 'jam',  zh: '果酱',       icon: '🍓', phonics: 'j-a-m',  ipa: '/dʒæm/', sentence: 'I like red jam.',           distractorChars: ['g', 'n', 'e'] },
            { id: 'cw_s1u1w1_pan',  word: 'pan',  zh: '平底锅',     icon: '🍳', phonics: 'p-a-n',  ipa: '/pæn/',  sentence: 'Put an egg in the pan.',    distractorChars: ['b', 'f', 'e'] },
            { id: 'cw_s1u1w1_ran',  word: 'ran',  zh: '跑(过去式)', icon: '🏃', phonics: 'r-a-n',  ipa: '/ræn/',  sentence: 'The dog ran fast.',         distractorChars: ['u', 'e', 'm'] },
            { id: 'cw_s1u1w1_map',  word: 'map',  zh: '地图',       icon: '🗺️', phonics: 'm-a-p',  ipa: '/mæp/',  sentence: 'Look at the map.',          distractorChars: ['n', 'b', 'e'] },
            { id: 'cw_s1u1w1_tack', word: 'tack', zh: '图钉',       icon: '📌', phonics: 't-a-ck', ipa: '/tæk/',  sentence: 'Pin it with a tack.',       distractorChars: ['b', 'e', 'g'] },
            { id: 'cw_s1u1w1_back', word: 'back', zh: '后背；回来', icon: '🎒', phonics: 'b-a-ck', ipa: '/bæk/',  sentence: 'Carry it on your back.',    distractorChars: ['p', 't', 'e'] },
            { id: 'cw_s1u1w1_wag',  word: 'wag',  zh: '摇(尾巴)',   icon: '🐕', phonics: 'w-a-g',  ipa: '/wæɡ/',  sentence: 'Happy dogs wag tails.',     distractorChars: ['v', 'k', 'e'] }
        ]
    }
];

export const ALL_COURSE_WORDS = (() => {
    const seen = new Set();
    const out = [];
    for (const lesson of COURSE_LESSONS) {
        for (const w of (lesson.sightWords || [])) {
            const key = `${lesson.id}_${w.word.toLowerCase()}`;
            if (seen.has(key)) continue;
            seen.add(key);
            out.push({
                ...w,
                level: 2,
                packId: `course_${lesson.id}`,
                packName: `${lesson.code}高频词`,
                enCategory: `${lesson.code} Words`
            });
        }
        for (const w of (lesson.phonicsWords || [])) {
            const key = `${lesson.id}_${w.word.toLowerCase()}`;
            if (seen.has(key)) continue;
            seen.add(key);
            out.push({
                ...w,
                level: 1,
                packId: `course_${lesson.id}`,
                packName: `${lesson.code}核心词`,
                enCategory: `${lesson.code} Phonics`
            });
        }
    }
    return out;
})();

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/**
 * 解析课次选择：默认 'latest' 自动指向 COURSE_LESSONS[0]（最新一期作业），
 * 'all_courses' 汇总所有历史课次，或指定如 'S1U1W1'
 */
export function resolveCourseLessons(lessonId = 'latest') {
    if (!COURSE_LESSONS.length) return [];
    if (lessonId === 'all_courses') return COURSE_LESSONS;
    if (!lessonId || lessonId === 'latest') return [COURSE_LESSONS[0]];
    const found = COURSE_LESSONS.find(l => l.id === lessonId);
    return found ? [found] : [COURSE_LESSONS[0]];
}

export function getPrimaryCourseLesson(lessonId = 'latest') {
    return resolveCourseLessons(lessonId)[0] || COURSE_LESSONS[0];
}

/**
 * 构造全字母盲听默写拼图块（包含单词全部正确字母 + 2~3个易混自然拼读干扰字母）
 */
function buildFullDictationTiles(wordStr, customDistractors = []) {
    const chars = wordStr.toLowerCase().split('');
    const fallbackPool = ['a', 'e', 'i', 'o', 'u', 'b', 'p', 'd', 't', 'c', 'k', 'm', 'n', 's'];
    const distractors = [];
    for (const ch of [...customDistractors, ...shuffleArray(fallbackPool)]) {
        if (distractors.length >= 3) break;
        if (!chars.includes(ch) && !distractors.includes(ch)) {
            distractors.push(ch);
        }
    }
    const rawPool = shuffleArray([...chars, ...distractors]);
    return rawPool.map((char, i) => ({
        tileId: `dt_${i}_${char}_${Math.random().toString(36).slice(2, 5)}`,
        char
    }));
}

/**
 * 将单个课次拆解为结构化互动考题列表
 * @param {object} lesson 课次对象
 * @param {string} subFilter 'course_all' | 'course_phonics' | 'course_sight' | 'course_qa'
 * @param {object} opts { wordDifficulty: 'easy'|'medium'|'all', courseAllowHardDictation: boolean }
 */
export function buildQuestionsForLesson(lesson, subFilter = 'course_all', opts = {}) {
    const items = [];
    const lessonBadge = `${lesson.code} (${lesson.dateLabel})`;
    const wordDifficulty = opts.wordDifficulty || 'easy';
    const isEasy = wordDifficulty === 'easy';
    const allowHardInAll = Boolean(opts.courseAllowHardDictation);

    const phonicsList = lesson.phonicsWords || [];
    const sightList = lesson.sightWords || [];

    // 1A. 随机启蒙友好模式（course_all 且未开启全词默写）：12 词【听音认读选词】替代盲拼默写
    if (subFilter === 'course_all' && !allowHardInAll) {
        const optionLimit = isEasy ? 3 : 4;
        for (const pw of phonicsList) {
            const otherPhonics = shuffleArray(phonicsList.filter(w => w.word !== pw.word)).slice(0, optionLimit - 1);
            const pickOptions = shuffleArray([pw, ...otherPhonics]).map(w => ({
                id: w.id,
                word: w.word,
                phonics: w.phonics,
                ipa: w.ipa || '',
                zh: w.zh,
                icon: w.icon
            }));
            items.push({
                itemKey: `${lesson.id}_ph_pick_${pw.word}`,
                mode: 'course_special',
                courseSubType: 'phonics_listen_pick',
                lessonId: lesson.id,
                lessonCode: lesson.code,
                lessonBadge,
                hint: `👂 自然拼读听音认词 · ${lessonBadge}`,
                wordObj: {
                    id: pw.id,
                    word: pw.word,
                    zh: pw.zh,
                    icon: pw.icon,
                    phonics: pw.phonics,
                    ipa: pw.ipa,
                    sentence: pw.sentence
                },
                speakText: pw.ttsWord || pw.word,
                phonicsHint: pw.phonics,
                ipa: pw.ipa || '',
                meaningCue: `${pw.icon} ${pw.zh}`,
                answerId: pw.id,
                expectedWord: pw.word.toLowerCase(),
                options: pickOptions
            });
        }

        // 1B. 随机启蒙友好模式：4 个高频词【原句听读选词填空】替代全词默写与长句排词
        for (const sw of sightList) {
            const otherSight = shuffleArray(sightList.filter(w => w.word !== sw.word)).slice(0, isEasy ? 2 : 3);
            const sightOptions = shuffleArray([sw, ...otherSight]).map(w => ({
                id: w.id,
                word: w.word,
                phonics: w.phonics || '',
                ipa: w.ipa || '',
                zh: w.zh,
                icon: w.icon
            }));
            items.push({
                itemKey: `${lesson.id}_sw_pick_${sw.word}`,
                mode: 'course_special',
                courseSubType: 'sight_cloze_pick',
                lessonId: lesson.id,
                lessonCode: lesson.code,
                lessonBadge,
                hint: `🎯 高频词认读选词 · ${lessonBadge}`,
                wordObj: {
                    id: sw.id,
                    word: sw.word,
                    zh: sw.zh,
                    icon: sw.icon,
                    phonics: sw.phonics,
                    ipa: sw.ipa,
                    sentence: sw.sentence
                },
                speakText: sw.sentence,
                wordOnlySpeak: sw.word,
                maskedSentence: sw.maskedSentence,
                sentenceZh: sw.sentenceZh,
                meaningCue: '',
                answerId: sw.id,
                expectedWord: sw.word.toLowerCase(),
                options: sightOptions
            });
        }
    }

    // 1. 第4项：听音写词 12 词（专项直达 course_phonics 或开启了随机全词默写时出现）
    if (subFilter === 'course_phonics' || (subFilter === 'course_all' && allowHardInAll)) {
        for (const pw of phonicsList) {
            items.push({
                itemKey: `${lesson.id}_ph_${pw.word}`,
                mode: 'course_special',
                courseSubType: 'phonics_dictation',
                lessonId: lesson.id,
                lessonCode: lesson.code,
                lessonBadge,
                hint: `👂 听音写词抽查 · ${lessonBadge}`,
                wordObj: {
                    id: pw.id,
                    word: pw.word,
                    zh: pw.zh,
                    icon: pw.icon,
                    phonics: pw.phonics,
                    ipa: pw.ipa,
                    sentence: pw.sentence
                },
                speakText: pw.ttsWord || pw.word,
                phonicsHint: pw.phonics,
                ipa: pw.ipa || '',
                meaningCue: `${pw.icon} ${pw.zh}`,
                expectedWord: pw.word.toLowerCase(),
                chars: pw.word.toLowerCase().split(''),
                tiles: buildFullDictationTiles(pw.word, pw.distractorChars || [])
            });
        }
    }

    // 2. 第3项：高频词默写 + 原句听写排词（专项直达 course_sight 或开启了随机全词默写时出现）
    if (subFilter === 'course_sight' || (subFilter === 'course_all' && allowHardInAll)) {
        for (const sw of sightList) {
            // 2A. 高频词在原句语境中全词默写
            items.push({
                itemKey: `${lesson.id}_sw_spell_${sw.word}`,
                mode: 'course_special',
                courseSubType: 'sight_word_spell',
                lessonId: lesson.id,
                lessonCode: lesson.code,
                lessonBadge,
                hint: `✍️ 高频词听写 · ${lessonBadge}`,
                wordObj: {
                    id: sw.id,
                    word: sw.word,
                    zh: sw.zh,
                    icon: sw.icon,
                    phonics: sw.phonics,
                    ipa: sw.ipa,
                    sentence: sw.sentence
                },
                speakText: `${sw.word}. ${sw.sentence}`,
                wordOnlySpeak: sw.word,
                phonicsHint: sw.phonics,
                maskedSentence: sw.maskedSentence,
                sentenceZh: sw.sentenceZh,
                meaningCue: `${sw.icon} 高频词：${sw.zh}`,
                expectedWord: sw.word.toLowerCase(),
                chars: sw.word.toLowerCase().split(''),
                tiles: buildFullDictationTiles(sw.word, sw.distractorChars || [])
            });

            // 2B. 必背教材原句听音连词默写
            const tokens = sw.sentence.trim().split(/\s+/);
            let shuffled = shuffleArray(tokens.map((text, idx) => ({
                carriageId: `sc_${idx}_${Math.random().toString(36).slice(2, 5)}`,
                text
            })));
            if (shuffled.length > 1 && shuffled.every((c, idx) => c.text === tokens[idx])) {
                [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
            }
            items.push({
                itemKey: `${lesson.id}_sw_sent_${sw.word}`,
                mode: 'course_special',
                courseSubType: 'sight_sentence_order',
                lessonId: lesson.id,
                lessonCode: lesson.code,
                lessonBadge,
                hint: `📝 必背原句听写 · ${lessonBadge}`,
                wordObj: {
                    id: sw.id,
                    word: sw.word,
                    zh: `${sw.zh} · ${sw.sentence}`,
                    icon: sw.icon,
                    phonics: sw.phonics,
                    sentence: sw.sentence
                },
                speakText: sw.sentence,
                sentenceZh: sw.sentenceZh,
                targetSightWord: sw.word,
                expectedTokens: tokens,
                expectedSentence: tokens.join(' '),
                carriages: shuffled
            });
        }
    }

    // 3. 第2项：课文阅读问答 (Q&A 听问选答 + 核心词句补全 + 心情变化三段排序)
    if (subFilter === 'course_all' || subFilter === 'course_qa') {
        const qaDistractorCount = isEasy ? 2 : 3;
        for (const qa of (lesson.qaList || [])) {
            const baseWordObj = {
                id: `${qa.id}_vocab`,
                word: qa.keyVocab?.word || 'Jack',
                zh: qa.keyVocab?.zh || qa.aZh,
                icon: qa.icon || '📖',
                phonics: qa.keyVocab?.phonics || '',
                sentence: qa.a
            };

            // 3A. 老师提问 -> 选出标准英文回答
            const qaChoices = shuffleArray([
                { id: 'ans_correct', text: qa.a, isCorrect: true },
                ...(qa.qaDistractors || []).slice(0, qaDistractorCount).map((d, i) => ({
                    id: `ans_dist_${i}`,
                    text: d,
                    isCorrect: false
                }))
            ]);
            items.push({
                itemKey: `${qa.id}_match`,
                mode: 'course_special',
                courseSubType: 'qa_match',
                lessonId: lesson.id,
                lessonCode: lesson.code,
                lessonBadge,
                hint: `📖 课文问答 Q${qa.index} · ${lessonBadge}`,
                wordObj: baseWordObj,
                questionEn: qa.q,
                questionSpeak: qa.qSpeak || qa.q,
                questionZh: qa.qZh,
                answerEn: qa.a,
                answerZh: qa.aZh,
                speakText: qa.qSpeak || qa.q,
                choices: qaChoices
            });

            // 3B. 课文答句关键词补全
            if (qa.clozeSentence && qa.clozeAnswer) {
                const rawClozeOpts = qa.clozeOptions || [qa.clozeAnswer];
                const trimmedClozeOpts = isEasy
                    ? [
                        qa.clozeAnswer,
                        ...rawClozeOpts.filter(o => o !== qa.clozeAnswer).slice(0, 2)
                    ]
                    : rawClozeOpts;
                items.push({
                    itemKey: `${qa.id}_cloze`,
                    mode: 'course_special',
                    courseSubType: 'qa_cloze',
                    lessonId: lesson.id,
                    lessonCode: lesson.code,
                    lessonBadge,
                    hint: `🗣️ 朗读答句填空 Q${qa.index} · ${lessonBadge}`,
                    wordObj: baseWordObj,
                    questionEn: qa.q,
                    questionZh: qa.qZh,
                    clozeSentence: qa.clozeSentence,
                    answerEn: qa.a,
                    answerZh: qa.aZh,
                    speakText: qa.a,
                    expectedOption: qa.clozeAnswer,
                    options: shuffleArray(trimmedClozeOpts)
                });
            }

            // 3C. 长段落排序：仅在专项直达 course_qa 或开启随机全难度时出现，避免随机模式吓到低龄小朋友
            if ((subFilter === 'course_qa' || allowHardInAll) && Array.isArray(qa.sentences) && qa.sentences.length >= 3) {
                const orderedSteps = qa.sentences.map(s => s.en);
                let stepCards = shuffleArray(qa.sentences.map((s, idx) => ({
                    stepId: `st_${idx}_${Math.random().toString(36).slice(2, 5)}`,
                    en: s.en,
                    zh: s.zh,
                    orderIdx: idx
                })));
                if (stepCards.every((c, idx) => c.orderIdx === idx)) {
                    [stepCards[0], stepCards[1]] = [stepCards[1], stepCards[0]];
                }
                items.push({
                    itemKey: `${qa.id}_steps`,
                    mode: 'course_special',
                    courseSubType: 'qa_story_steps',
                    lessonId: lesson.id,
                    lessonCode: lesson.code,
                    lessonBadge,
                    hint: `🎬 视频长句背诵排序 Q${qa.index} · ${lessonBadge}`,
                    wordObj: baseWordObj,
                    questionEn: qa.q,
                    questionZh: qa.qZh,
                    answerEn: qa.a,
                    speakText: qa.a,
                    orderedSteps,
                    stepCards
                });
            }
        }
    }

    return items;
}

/**
 * 课后专项无放回洗牌抽题管理器
 */
export class CourseSpecialSessionManager {
    constructor() {
        this._bags = new Map();
        this._lastItemKey = '';
    }

    nextQuestion(lessonId = 'latest', subMode = 'course_all', opts = {}) {
        const cleanSub = (subMode && subMode !== 'course_readcard' && ALL_COURSE_SUB_IDS.includes(subMode))
            ? subMode
            : 'course_all';
        const lessons = resolveCourseLessons(lessonId);
        const diffKey = opts.wordDifficulty || 'easy';
        const hardKey = opts.courseAllowHardDictation ? 'hard1' : 'hard0';
        const bagKey = `${lessons.map(l => l.id).join('+')}|${cleanSub}|${diffKey}|${hardKey}`;

        let bag = this._bags.get(bagKey);
        if (!Array.isArray(bag) || bag.length === 0) {
            const fullPool = [];
            for (const lesson of lessons) {
                fullPool.push(...buildQuestionsForLesson(lesson, cleanSub, opts));
            }
            bag = shuffleArray(fullPool);
            if (bag.length > 1 && bag[bag.length - 1].itemKey === this._lastItemKey) {
                [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
            }
            this._bags.set(bagKey, bag);
        }

        const picked = bag.pop();
        if (!picked) return null;

        this._lastItemKey = picked.itemKey;

        // 每次出题重新打乱选项/字母块顺序，防止背位置
        const fresh = { ...picked };
        if (fresh.courseSubType === 'phonics_dictation' || fresh.courseSubType === 'sight_word_spell') {
            const lesson = lessons.find(l => l.id === fresh.lessonId) || lessons[0];
            const srcList = fresh.courseSubType === 'phonics_dictation' ? lesson.phonicsWords : lesson.sightWords;
            const srcWord = srcList.find(w => w.word.toLowerCase() === fresh.expectedWord);
            fresh.tiles = buildFullDictationTiles(fresh.expectedWord, srcWord?.distractorChars || []);
        } else if (fresh.courseSubType === 'phonics_listen_pick' || fresh.courseSubType === 'sight_cloze_pick') {
            fresh.options = shuffleArray(fresh.options);
        } else if (fresh.courseSubType === 'sight_sentence_order') {
            let carriages = shuffleArray(fresh.expectedTokens.map((text, idx) => ({
                carriageId: `sc_${idx}_${Math.random().toString(36).slice(2, 5)}`,
                text
            })));
            if (carriages.length > 1 && carriages.every((c, idx) => c.text === fresh.expectedTokens[idx])) {
                [carriages[0], carriages[1]] = [carriages[1], carriages[0]];
            }
            fresh.carriages = carriages;
        } else if (fresh.courseSubType === 'qa_match') {
            fresh.choices = shuffleArray(fresh.choices);
        } else if (fresh.courseSubType === 'qa_cloze') {
            fresh.options = shuffleArray(fresh.options);
        } else if (fresh.courseSubType === 'qa_story_steps') {
            let cards = shuffleArray(fresh.stepCards);
            if (cards.length > 1 && cards.every((c, idx) => c.orderIdx === idx)) {
                [cards[0], cards[1]] = [cards[1], cards[0]];
            }
            fresh.stepCards = cards;
        }

        fresh.bagRemaining = bag.length;
        return fresh;
    }
}

export const courseSessionManager = new CourseSpecialSessionManager();
