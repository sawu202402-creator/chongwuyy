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
