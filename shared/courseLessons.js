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

export const ALL_COURSE_WORDS = COURSE_LESSONS.flatMap(lesson => [
    ...(lesson.sightWords || []).map(w => ({
        ...w,
        level: 2,
        packId: `course_${lesson.id}`,
        packName: `${lesson.code}高频词`,
        enCategory: `${lesson.code} Words to Know`
    })),
    ...(lesson.phonicsWords || []).map(w => ({
        ...w,
        level: 1,
        packId: `course_${lesson.id}`,
        packName: `${lesson.code}自然拼读`,
        enCategory: `${lesson.code} Phonics`
    }))
]);

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
 */
export function buildQuestionsForLesson(lesson, subFilter = 'course_all') {
    const items = [];
    const lessonBadge = `${lesson.code} (${lesson.dateLabel})`;

    // 1. 第4项：听音写词 12 词（全字母盲听默写）
    if (subFilter === 'course_all' || subFilter === 'course_phonics') {
        for (const pw of (lesson.phonicsWords || [])) {
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

    // 2. 第3项：高频词默写 + 原句听写排词
    if (subFilter === 'course_all' || subFilter === 'course_sight') {
        for (const sw of (lesson.sightWords || [])) {
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
                ...(qa.qaDistractors || []).slice(0, 3).map((d, i) => ({
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
                    options: shuffleArray(qa.clozeOptions || [qa.clozeAnswer])
                });
            }

            // 3C. 若答句包含 >=3 个分句（如第4题 First / Then / At last），额外生成段落顺序排排看！
            if (Array.isArray(qa.sentences) && qa.sentences.length >= 3) {
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

    nextQuestion(lessonId = 'latest', subMode = 'course_all') {
        const cleanSub = (subMode && subMode !== 'course_readcard' && ALL_COURSE_SUB_IDS.includes(subMode))
            ? subMode
            : 'course_all';
        const lessons = resolveCourseLessons(lessonId);
        const bagKey = `${lessons.map(l => l.id).join('+')}|${cleanSub}`;

        let bag = this._bags.get(bagKey);
        if (!Array.isArray(bag) || bag.length === 0) {
            const fullPool = [];
            for (const lesson of lessons) {
                fullPool.push(...buildQuestionsForLesson(lesson, cleanSub));
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
