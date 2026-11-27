import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MathEngine, MATH_QUESTION_TYPES, ALL_MATH_TYPE_IDS } from '../shared/mathEngine.js';
import {
    EnglishEngine,
    WORD_PACKS,
    ALL_WORDS,
    ENGLISH_QUESTION_TYPES,
    ALL_ENGLISH_TYPE_IDS,
    DEFAULT_EASY_ENGLISH_TYPES,
    ENGLISH_DIFFICULTY_MODES,
    COURSE_LESSONS,
    COURSE_SUB_MODES,
    ALL_COURSE_SUB_IDS
} from '../shared/englishEngine.js';
import { PETS_CATALOG, PET_STAGE_STYLES, PET_ACCESSORIES, PET_VOICE_PROFILES, getPetVoiceProfile, SHOPS_CATALOG, TOWN_PLOTS } from '../pet/js/config.js';
import { UserProfileManager, isValidSmartMode } from '../shared/unifiedProfile.js';
import { LEVEL_CONFIGS, STAGE_SUMMARIES, ensureStageConfigLoaded } from '../carrot/js/map.js';

const ROOT = '/home/better/IdeaProjects/chongwuyy';

console.log('1. Verifying 3-in-1 portal assets, slimmed maps, & Cloudflare/PWA files...');
for (const pet of PETS_CATALOG) {
    const p = path.join(ROOT, 'pet', pet.img);
    assert.ok(fs.existsSync(p), `Missing pet image: ${p}`);
}
for (const shop of SHOPS_CATALOG) {
    assert.ok(fs.existsSync(path.join(ROOT, 'pet', shop.imgLv1)), `Missing shop lv1 image: ${shop.imgLv1}`);
    assert.ok(fs.existsSync(path.join(ROOT, 'pet', shop.imgLv5)), `Missing shop lv5 image: ${shop.imgLv5}`);
}
assert.ok(fs.existsSync(path.join(ROOT, 'pet/assets/town/town_bg.jpg')), 'Missing pet town_bg.jpg');
assert.ok(fs.existsSync(path.join(ROOT, 'carrot/assets/official/stage1_full_map.png')), 'Missing carrot stage1_full_map.png');
assert.ok(fs.existsSync(path.join(ROOT, 'carrot/assets/official/trophy_carrot.png')), 'Missing carrot trophy_carrot.png');
assert.equal(fs.existsSync(path.join(ROOT, 'carrot/assets/official/select')), false, 'Dead carrot/assets/official/select folder should be removed');
assert.ok(fs.existsSync(path.join(ROOT, 'pvz/assets/plants/sunflower.gif')), 'Missing pvz sunflower.gif');
assert.ok(fs.existsSync(path.join(ROOT, 'index.html')), 'Missing root Hub index.html');
assert.ok(fs.existsSync(path.join(ROOT, '.assetsignore')), 'Missing .assetsignore');
assert.ok(fs.existsSync(path.join(ROOT, '_headers')), 'Missing _headers');
assert.ok(fs.existsSync(path.join(ROOT, 'sw.js')), 'Missing sw.js');
console.log('   ✅ Core assets, slimmed stage maps, and Cloudflare/PWA files verified!');

console.log('2. Verifying Carrot 48-stage dynamic map chunk loader...');
assert.equal(Object.keys(STAGE_SUMMARIES).length, 48, 'Must have 48 stage summaries');
for (const stageId of [1, 12, 13, 24, 25, 36, 37, 48]) {
    const cfg = await ensureStageConfigLoaded(stageId);
    assert.equal(cfg.id, stageId);
    assert.ok(Array.isArray(cfg.waypoints) && cfg.waypoints.length >= 2);
    assert.ok(Array.isArray(cfg.towerSlots) && cfg.towerSlots.length > 0);
    assert.ok(LEVEL_CONFIGS[stageId]);
}
console.log('   ✅ Dynamic 4-theme Carrot map chunking verified!');

console.log('3. Stress-testing Unified MathEngine (All 9 Modes + EnabledTypes + Spaced Repetition)...');
assert.equal(MATH_QUESTION_TYPES.length, 9, 'Must have 9 math question modes');
assert.equal(ALL_MATH_TYPE_IDS.length, 9);
const me = new MathEngine('grade1_2');
for (const preset of ['grade1_2', 'grade3_4', 'grade5_6']) {
    me.setConfig(preset);
    for (const sub of ALL_MATH_TYPE_IDS) {
        me.setSubMode(sub);
        for (let i = 0; i < 80; i++) {
            const q = me.nextQuestion();
            assert.equal(q.kind, sub, `Expected kind ${sub}, got ${q.kind}`);
            if (sub === 'calc' || sub === 'word' || sub === 'data' || sub === 'sequence_train') {
                assert.ok(Number.isInteger(q.answer) && q.answer >= 0, `Invalid math numeric answer in ${preset}/${sub}: ${JSON.stringify(q)}`);
            } else if (sub === 'pyramid_grid') {
                assert.ok(Array.isArray(q.choices) && q.choices.map(String).includes(String(q.answer)), `pyramid_grid choices must include answer: ${JSON.stringify(q)}`);
            } else if (sub === 'compare') {
                assert.ok(['>', '<', '='].includes(q.answer), `Invalid compare answer: ${q.answer}`);
            } else if (sub === 'operator_detective') {
                assert.ok(['+', '-', '×', '÷'].includes(q.answer), `Invalid operator_detective answer: ${q.answer}`);
                const validOps = ['+', '-', '×', '÷'].filter((op) => {
                    if (op === '+') return q.numA + q.numB === q.resultC;
                    if (op === '-') return q.numA - q.numB === q.resultC;
                    if (op === '×') return q.numA * q.numB === q.resultC;
                    if (op === '÷') return q.numB !== 0 && q.numA % q.numB === 0 && (q.numA / q.numB) === q.resultC;
                    return false;
                });
                assert.equal(validOps.length, 1, `operator_detective must have strictly 1 valid operator, got ${validOps} for ${JSON.stringify(q)}`);
                assert.equal(validOps[0], q.answer);
            } else if (sub === 'bond_pop') {
                assert.equal(q.bubbles.length, 6, 'bond_pop must have 6 bubbles');
                const byPair = new Map();
                for (const b of q.bubbles) {
                    if (!byPair.has(b.pairId)) byPair.set(b.pairId, []);
                    byPair.get(b.pairId).push(b.value);
                }
                assert.equal(byPair.size, 3, 'bond_pop must form 3 pairs');
                for (const vals of byPair.values()) {
                    assert.equal(vals.length, 2);
                    const res = q.bondOp === '×' ? vals[0] * vals[1] : vals[0] + vals[1];
                    assert.equal(res, q.targetValue, `bond_pop pair ${vals} failed target ${q.targetValue}`);
                }
            } else if (sub === 'clock_money') {
                assert.ok(Array.isArray(q.choices) && q.choices.map(String).includes(String(q.answer)), `clock_money choices must include answer: ${JSON.stringify(q)}`);
            }
        }
    }
}

// Verify enabledTypes filtering on random mode
me.setConfig({ enabledTypes: ['compare', 'clock_money'] });
me.setSubMode('random');
const seenRandomMath = new Set();
for (let i = 0; i < 60; i++) {
    const q = me.nextQuestion();
    assert.ok(['compare', 'clock_money'].includes(q.kind), `Unexpected math kind ${q.kind} when enabledTypes=['compare','clock_money']`);
    seenRandomMath.add(q.kind);
}
assert.equal(seenRandomMath.size, 2, 'Random math mode should sample both enabled types');
me.setConfig({ enabledTypes: ALL_MATH_TYPE_IDS });

// Verify evaluateInteractiveAttempt
me.setSubMode('compare');
const cmpQ = me.nextQuestion();
const evalRes = me.evaluateInteractiveAttempt(true, cmpQ.answer, true);
assert.equal(evalRes.correct, true);
assert.ok(evalRes.goldGain > 0 && evalRes.bonusSun > 0);

// Verify spaced repetition injection from mistakesProvider + anti-spam cooldown (>=8 step gap, >=12 per expr)
me.setSubMode('calc');
me.setMistakesProvider(() => [
    { formula: '9 + 8 = ?', expr: '9 + 8 = ?', display: '9 + 8 = ?', answer: 17, kind: 'calc' },
    { formula: '15 - 7 = ?', expr: '15 - 7 = ?', display: '15 - 7 = ?', answer: 8, kind: 'calc' }
]);
let reviewHits = 0;
let lastRevIdx = -999;
for (let i = 0; i < 160; i++) {
    const q = me.nextQuestion();
    if (q.isReview) {
        assert.ok(i - lastRevIdx >= 8, `Spaced repetition spammed too soon at gap ${i - lastRevIdx}`);
        lastRevIdx = i;
        reviewHits++;
    }
}
assert.ok(reviewHits >= 5, `Expected spaced repetition review hits, got ${reviewHits}`);
me.setMistakesProvider(null);

// Verify oral arithmetic (calc) non-repetition, cross-reset memory, and uniform 36-pair carry distribution
const meCalc = new MathEngine('grade1_2');
meCalc.setSubMode('calc');
const calcWindow30 = [];
for (let i = 0; i < 30; i++) {
    const q = meCalc.nextQuestion();
    if (i > 0) {
        assert.notEqual(q.expr, calcWindow30[i - 1], `Back-to-back oral arithmetic repeat at step ${i}: ${q.expr}`);
    }
    calcWindow30.push(q.expr);
}
assert.ok(new Set(calcWindow30).size >= 28, `Expected >=28 unique oral arithmetic questions in 30 draws, got ${new Set(calcWindow30).size}`);
meCalc.resetRoundStats();
const afterReset10 = [];
for (let i = 0; i < 10; i++) {
    afterReset10.push(meCalc.nextQuestion().expr);
}
const overlapWithLast10 = afterReset10.filter(e => calcWindow30.slice(-10).includes(e));
assert.equal(overlapWithLast10.length, 0, `resetRoundStats() must preserve anti-repeat history, found overlap: ${overlapWithLast10}`);

// Verify all 36 carry-addition pairs within 20 are sampled uniformly (no 8x skew on 2+9)
const carryCounts = new Map();
for (let i = 0; i < 360; i++) {
    const [a, b] = meCalc._drawFromDeck('test_add20_carry_uniform', () => {
        const pairs = [];
        for (let x = 2; x <= 9; x++) {
            for (let y = 11 - x; y <= 9; y++) pairs.push([x, y]);
        }
        return pairs;
    });
    const key = `${a}+${b}`;
    carryCounts.set(key, (carryCounts.get(key) || 0) + 1);
}
assert.equal(carryCounts.size, 36, 'All 36 carry-addition pairs (sum 11..18) must appear');
assert.equal(carryCounts.get('2+9'), 10, '2+9 must appear exactly 10 times in 10 full 36-card bag cycles');
assert.equal(carryCounts.get('9+2'), 10, '9+2 must appear exactly 10 times in 10 full 36-card bag cycles');

// Verify Carrot submitAnswer & PvZ checkPvzAnswer
me.setCategoryFilter('word');
const wq = me.nextQuestion();
assert.equal(wq.kind, 'word');
const carrotRes = me.submitAnswer(wq.answer);
assert.equal(carrotRes.correct, true);
assert.ok(carrotRes.goldGain >= 24);

me.setCategoryFilter('data');
const dq = me.nextQuestion();
assert.equal(dq.kind, 'data');
const pvzRes = me.checkPvzAnswer(dq.answer);
assert.equal(pvzRes.isCorrect, true);
assert.ok(pvzRes.bonusSun >= 75);
console.log('   ✅ Unified MathEngine (9 modes + enabledTypes + Spaced Repetition) passed!');

console.log('4. Testing Expanded Shared EnglishEngine (20 packs, 360 words, 10 Modes incl. Word-Meaning & Course Special & Bag Shuffle)...');
assert.equal(WORD_PACKS.length, 20, 'Must have 20 graded English word packs');
assert.equal(ALL_WORDS.length, 360, 'Must have 360 graded English words');
assert.equal(new Set(ALL_WORDS.map(w => w.id)).size, 360, 'All 360 word IDs must be unique');
assert.equal(new Set(ALL_WORDS.map(w => w.word.toLowerCase())).size, 360, 'All 360 English words must be unique');
assert.equal(ENGLISH_QUESTION_TYPES.length, 10, 'Must have 10 English question modes (course_special + 9 general modes)');
assert.equal(ALL_ENGLISH_TYPE_IDS.length, 10);

const generalEnTypes = ALL_ENGLISH_TYPE_IDS.filter(id => id !== 'course_special');
const ee = new EnglishEngine({ level: 'mixed', wordDifficulty: 'all', courseAllowHardDictation: true, packId: 'all' });
for (const pack of WORD_PACKS) {
    assert.equal(pack.words.length, 18, `Pack ${pack.id} must have 18 words`);
    const sess = ee.startVocabStudySession(pack.id, {});
    assert.equal(sess.words.length, 5);
    assert.equal(sess.quizQueue.length, 8);
}
const allSess = ee.startVocabStudySession('all', {});
assert.equal(allSess.words.length, 5, 'startVocabStudySession("all") must sample 5 words from 360-word pool');

// Verify Fisher-Yates Bag Shuffle anti-repetition: 120 draws on 'all' (challenge difficulty) -> 120 unique words!
ee.setMistakesProvider(null);
ee.setConfig({ packId: 'all', level: 'mixed', wordDifficulty: 'all', enabledTypes: generalEnTypes });
const drawn120 = new Set();
for (let i = 0; i < 120; i++) {
    const q = ee.nextQuickQuestion();
    drawn120.add(q.wordObj.id);
}
assert.equal(drawn120.size, 120, `Bag shuffle across 360 words must yield 120 unique words in 120 draws, got ${drawn120.size}`);

// Single 18-word pack: 18 consecutive draws must cover all 18 words with 0 repeats in 'all' difficulty
ee.setConfig({ packId: 'pack_animals', wordDifficulty: 'all', enabledTypes: generalEnTypes });
const drawn18 = new Set();
for (let i = 0; i < 18; i++) {
    const q = ee.nextQuickQuestion();
    drawn18.add(q.wordObj.id);
}
assert.equal(drawn18.size, 18, `Single 18-word pack bag shuffle must yield 18 unique words in 18 draws, got ${drawn18.size}`);

// Verify all 8 general forced modes + exact questionWidgets.js field contracts in 'all' difficulty
ee.setConfig({ packId: 'all', wordDifficulty: 'all', enabledTypes: ALL_ENGLISH_TYPE_IDS });
for (const modeId of generalEnTypes) {
    for (let i = 0; i < 15; i++) {
        const q = ee.nextQuickQuestion(null, modeId);
        assert.equal(q.mode, modeId, `Forced English mode must be ${modeId}, got ${q.mode}`);
        if (modeId === 'bubble_pair') {
            assert.equal(q.pairCount, 3);
            assert.equal(q.bubbles.length, 6);
        } else if (modeId === 'phonics_chunks') {
            assert.equal(q.expectedChunks.join('').toLowerCase(), q.expectedWord.toLowerCase());
            assert.ok(q.blocks.length >= q.expectedChunks.length);
        } else if (modeId === 'word_order') {
            assert.ok(q.expectedTokens.length >= 3);
            assert.equal(q.carriages.length, q.expectedTokens.length);
        } else if (modeId === 'spell_word') {
            assert.ok(q.missingIndices.length >= 1);
            assert.ok(q.tiles.length >= q.missingIndices.length);
        } else {
            assert.equal(q.options.length, 4);
            assert.ok(q.options.some(o => o.id === q.answerId));
        }
    }
}

console.log('4A. Testing New Kid-Friendly Easy Difficulty, Word-Meaning Mode & Excluded Types...');
assert.equal(ENGLISH_DIFFICULTY_MODES.length, 3);
assert.deepEqual(DEFAULT_EASY_ENGLISH_TYPES, ['course_special', 'listen_pic', 'match_word', 'word_meaning', 'bubble_pair', 'phonics_chunks']);
const easyEngine = new EnglishEngine(); // default must be easy!
assert.equal(easyEngine.config.wordDifficulty, 'easy');
assert.equal(easyEngine.config.courseAllowHardDictation, false);
assert.deepEqual(easyEngine.config.enabledTypes, DEFAULT_EASY_ENGLISH_TYPES);
const easyPool = easyEngine.getWordPool();
assert.equal(easyPool.length, 146, 'Easy word pool must contain strictly the 146 L1 short words');
assert.ok(easyPool.every(w => w.level === 1), 'Every word in easy all-packs pool must be level 1');

// Verify easy mode builders: 3 choices, 2-pair (4 bubbles) pair board, 1 missing letter in spell_word, prefilled 1st word in word_order
for (let i = 0; i < 15; i++) {
    const lq = easyEngine.nextQuickQuestion(null, 'listen_pic');
    assert.equal(lq.options.length, 3, 'Easy listen_pic must have 3 choices');
    const mq = easyEngine.nextQuickQuestion(null, 'match_word');
    assert.equal(mq.options.length, 3, 'Easy match_word must have 3 choices');
    const wmq = easyEngine.nextQuickQuestion(null, 'word_meaning');
    assert.equal(wmq.options.length, 3, 'Easy word_meaning must have 3 choices');
    const bq = easyEngine.nextQuickQuestion(null, 'bubble_pair');
    assert.equal(bq.pairCount, 2, 'Easy bubble_pair must have 2 pairs');
    assert.equal(bq.bubbles.length, 4, 'Easy bubble_pair must have 4 bubbles');
    const sq = easyEngine.nextQuickQuestion(null, 'spell_word');
    assert.equal(sq.missingIndices.length, 1, 'Easy spell_word must blank ONLY 1 letter');
    assert.equal(sq.tiles.length, 4, 'Easy spell_word must have 4 jelly tiles');
    const wq = easyEngine.nextQuickQuestion(null, 'word_order');
    if (wq.expectedTokens.length >= 3) {
        assert.equal(wq.prefilledCount, 1, 'Easy word_order must prefill the 1st carriage');
    }
}

// Verify Vocab Study Camp strictly respects excluded question types & re-queues missed words!
easyEngine.setConfig({ wordDifficulty: 'easy', enabledTypes: ['listen_pic', 'match_word', 'word_meaning'] });
const easyCamp = easyEngine.startVocabStudySession('all', {});
assert.equal(easyCamp.quizQueue.length, 6);
assert.ok(easyCamp.quizQueue.every(q => ['listen_pic', 'match_word', 'word_meaning'].includes(q.mode)), 'Vocab Camp must never emit excluded question types');
easyCamp.phase = 'quiz';
assert.equal(easyEngine.enqueueCampRetryIfWrong(easyCamp.quizQueue[0]), true);
assert.equal(easyCamp.quizQueue.length, 7, 'Missed camp word must be appended for reinforcement retry');
assert.equal(easyCamp.quizQueue[6].isCampRetry, true);

// Verify S1U1W1 easy random course_all (courseAllowHardDictation: false) yields 24 gentle items with ZERO blind dictation/ordering
easyEngine.setConfig({ wordDifficulty: 'easy', courseAllowHardDictation: false, courseLessonId: 'S1U1W1' });
const easyCourseSubTypes = new Set();
const easyCourseKeys = new Set();
for (let i = 0; i < 24; i++) {
    const cq = easyEngine.nextQuickQuestion(null, 'course_all');
    easyCourseSubTypes.add(cq.courseSubType);
    easyCourseKeys.add(cq.itemKey);
    assert.ok(
        !['phonics_dictation', 'sight_word_spell', 'sight_sentence_order', 'qa_story_steps'].includes(cq.courseSubType),
        `Easy random course_all must exclude hard dictation/ordering, got ${cq.courseSubType}`
    );
}
assert.equal(easyCourseKeys.size, 24, 'Easy S1U1W1 course_all must have 24 unique gentle items');
assert.deepEqual([...easyCourseSubTypes].sort(), ['phonics_listen_pick', 'qa_cloze', 'qa_match', 'sight_cloze_pick']);
console.log('   ✅ Kid-Friendly Easy Difficulty & Excluded Types verified!');

console.log('4B. Testing Off-Campus English Course Registry Full Exam Mode (5 Lessons: S1U1W3, S1_1121, S1U1W2, S1_1114, S1U1W1)...');
assert.equal(COURSE_LESSONS.length, 5, 'COURSE_LESSONS must contain all 5 off-campus English lessons');
assert.equal(COURSE_SUB_MODES.length, 5);
assert.deepEqual(
    COURSE_LESSONS.map(l => l.id),
    ['S1U1W3', 'S1_1121', 'S1U1W2', 'S1_1114', 'S1U1W1']
);

// 1) Verify latest lesson COURSE_LESSONS[0] is S1U1W3 (11/26 A Pig for Cliff)
const s1u1w3 = COURSE_LESSONS[0];
assert.equal(s1u1w3.id, 'S1U1W3');
assert.equal(s1u1w3.code, 'S1U1W3');
assert.equal(s1u1w3.dateLabel, '11/26');
assert.equal(s1u1w3.storyTitle, 'A Pig for Cliff');
assert.equal(s1u1w3.retellFlow.boxes.length, 3, 'A Pig for Cliff must have 3 Key Details boxes');
assert.deepEqual(s1u1w3.sightWords.map(w => w.word), ['come', 'pull', 'be', 'good']);
assert.equal(s1u1w3.qaList.length, 5);
assert.equal(s1u1w3.phonicsWords.length, 12);

// 1B) Verify S1_1121 (11/21 Harvest Time) & S1U1W2 (11/19 Six Kids)
const s1_1121 = COURSE_LESSONS.find(l => l.id === 'S1_1121');
assert.equal(s1_1121.storyTitle, 'Harvest Time');
assert.equal(s1_1121.retellFlow.boxes.length, 3);
assert.equal(s1_1121.storyChapters.chapters.length, 4, 'Harvest Time must have all 4 chapters');
assert.deepEqual(s1_1121.sightWords.map(w => w.word), ['harvest', 'ripe', 'cart', 'market', 'bridge']);

const s1u1w2 = COURSE_LESSONS.find(l => l.id === 'S1U1W2');
assert.equal(s1u1w2.storyTitle, 'Six Kids');
assert.equal(s1u1w2.retellFlow.boxes.length, 3);
assert.deepEqual(s1u1w2.sightWords.map(w => w.word), ['down', 'up', 'out', 'very']);
assert.equal(s1u1w2.qaList.length, 5);
assert.equal(s1u1w2.phonicsWords.length, 12);

// Verify latest (S1U1W3) easy random course_all yields 26 gentle items (12 ph_pick + 4 sw_pick + 10 qa)
easyEngine.setConfig({ wordDifficulty: 'easy', courseAllowHardDictation: false, courseLessonId: 'latest' });
const latestEasyKeys = new Set();
for (let i = 0; i < 26; i++) {
    const cq = easyEngine.nextQuickQuestion(null, 'course_all');
    assert.equal(cq.lessonId, 'S1U1W3');
    latestEasyKeys.add(cq.itemKey);
}
assert.equal(latestEasyKeys.size, 26, 'Easy S1U1W3 course_all must have 26 unique gentle items');

// Verify S1U1W2 & S1_1121 full exam mode non-repeating shuffle bags
for (const [lid, expectedCount] of [['S1U1W3', 31], ['S1_1121', 33], ['S1U1W2', 31]]) {
    ee.setConfig({ courseLessonId: lid, wordDifficulty: 'all', courseAllowHardDictation: true, enabledTypes: ALL_ENGLISH_TYPE_IDS });
    const seen = new Set();
    for (let i = 0; i < expectedCount; i++) {
        const cq = ee.nextQuickQuestion(null, 'course_all');
        assert.equal(cq.lessonId, lid);
        seen.add(cq.itemKey);
    }
    assert.equal(seen.size, expectedCount, `${lid} full exam course_all must have ${expectedCount} unique items with 0 repeats`);
}

// Verify S1_1114 (11/14 Class Party) remains intact & switchable (35 non-repeating items)
const s1_1114 = COURSE_LESSONS.find(l => l.id === 'S1_1114');
assert.ok(s1_1114);
assert.equal(s1_1114.storyTitle, 'Class Party');
assert.equal(s1_1114.retellFlow.boxes.length, 4, 'Class Party must have 4 flowchart retell boxes');
ee.setConfig({ courseLessonId: 'S1_1114', wordDifficulty: 'all', courseAllowHardDictation: true, enabledTypes: ALL_ENGLISH_TYPE_IDS });
const classPartyExamKeys = new Set();
let saw4StepFlow = false;
for (let i = 0; i < 35; i++) {
    const cq = ee.nextQuickQuestion(null, 'course_all');
    assert.equal(cq.mode, 'course_special');
    classPartyExamKeys.add(cq.itemKey);
    if (cq.courseSubType === 'qa_story_steps') {
        assert.equal(cq.orderedSteps.length, 4, 'Class Party story steps must have all 4 flowchart boxes');
        saw4StepFlow = true;
    }
}
assert.equal(classPartyExamKeys.size, 35, `35 consecutive draws of S1_1114 course_all must have 0 repeats, got ${classPartyExamKeys.size}`);
assert.equal(saw4StepFlow, true, 'Must include 4-step Class Party flowchart ordering');

// 2) Verify S1U1W1 (11/12 Jack Can) remains intact & switchable
const s1u1w1 = COURSE_LESSONS.find(l => l.id === 'S1U1W1');
assert.ok(s1u1w1, 'Must contain lesson S1U1W1');
assert.equal(s1u1w1.qaList.length, 4, 'S1U1W1 must have 4 Q&A items');
assert.deepEqual(s1u1w1.sightWords.map(w => w.word), ['does', 'school', 'not', 'what']);
assert.deepEqual(
    s1u1w1.phonicsWords.map(w => w.word),
    ['ax', 'can', 'sad', 'fan', 'hat', 'jam', 'pan', 'ran', 'map', 'tack', 'back', 'wag']
);

ee.setConfig({ courseLessonId: 'S1U1W1', wordDifficulty: 'all', courseAllowHardDictation: true, enabledTypes: ALL_ENGLISH_TYPE_IDS });
const allCourseKeys = new Set();
for (let i = 0; i < 29; i++) {
    const cq = ee.nextQuickQuestion(null, 'course_all');
    assert.equal(cq.mode, 'course_special');
    allCourseKeys.add(cq.itemKey);
}
assert.equal(allCourseKeys.size, 29, `29 consecutive draws of S1U1W1 course_all must have 0 repeats, got ${allCourseKeys.size}`);

// 3) Verify 'all_courses' combines both lessons (35 + 29 = 64 unique items)
ee.setConfig({ courseLessonId: 'all_courses', wordDifficulty: 'all', courseAllowHardDictation: true });
const combinedKeys = new Set();
for (let i = 0; i < 64; i++) {
    combinedKeys.add(ee.nextQuickQuestion(null, 'course_all').itemKey);
}
assert.equal(combinedKeys.size, 64, 'all_courses must draw all 64 unique items across both lessons without repeat');

const phonicsWordsDrawn = new Set();
ee.setConfig({ courseLessonId: 'S1U1W1', wordDifficulty: 'all', courseAllowHardDictation: true });
for (let i = 0; i < 12; i++) {
    const pq = ee.nextQuickQuestion(null, 'course_phonics');
    assert.equal(pq.courseSubType, 'phonics_dictation');
    phonicsWordsDrawn.add(pq.expectedWord);
}
assert.equal(phonicsWordsDrawn.size, 12, '12 consecutive draws of course_phonics must cover all 12 short-a words');

const sightTypes = new Set();
for (let i = 0; i < 8; i++) {
    const sq = ee.nextQuickQuestion(null, 'course_sight');
    sightTypes.add(sq.courseSubType);
}
assert.deepEqual([...sightTypes].sort(), ['sight_sentence_order', 'sight_word_spell']);

const qaTypes = new Set();
for (let i = 0; i < 9; i++) {
    const qq = ee.nextQuickQuestion(null, 'course_qa');
    qaTypes.add(qq.courseSubType);
}
assert.deepEqual([...qaTypes].sort(), ['qa_cloze', 'qa_match', 'qa_story_steps']);
console.log('   ✅ S1U1W1 Off-Campus Course Special (29 non-repeating items across Phonics, Sight Words/Sentences & Story Q&A) verified!');

ee.setConfig({ packId: 'all', enabledTypes: ['riddle_qa', 'word_order'] });
const seenEnModes = new Set();
for (let i = 0; i < 50; i++) {
    const q = ee.nextQuickQuestion();
    assert.ok(['riddle_qa', 'word_order'].includes(q.mode), `Unexpected English mode ${q.mode}`);
    seenEnModes.add(q.mode);
}
assert.equal(seenEnModes.size, 2);
ee.setConfig({ packId: 'all', enabledTypes: ALL_ENGLISH_TYPE_IDS });

ee.setMistakesProvider(() => ({
    wordMastery: {},
    englishMistakes: [{ wordId: 'w_rabbit', word: 'rabbit', zh: '兔子', icon: '🐰' }]
}));
let enReviewHits = 0;
for (let i = 0; i < 120; i++) {
    const q = ee.nextQuickQuestion();
    if (q.isReview && q.wordObj.id === 'w_rabbit') enReviewHits++;
}
assert.ok(enReviewHits >= 3, `Expected English spaced repetition hits with 10-question cooldown, got ${enReviewHits}`);
console.log(`   ✅ Shared EnglishEngine verified (${WORD_PACKS.length} packs, ${ALL_WORDS.length} words, 8 modes, Bag Shuffle & cooldown active)!`);

console.log('5. Testing Unified UserProfileManager (Per-kid progress, EnabledTypes, SmartMode, Sibling Visit, Backup)...');
const pm = new UserProfileManager();
const users = pm.getUsers();
assert.equal(users[0].name, '小豌豆');
assert.equal(users[1].name, '川川');
const kid1 = users[0];
const kid2 = users[1];

// Verify enabledTypes & preferredSmartMode persistence
assert.equal(isValidSmartMode('grand_random'), true);
assert.equal(isValidSmartMode('math_random'), true);
assert.equal(isValidSmartMode('english_random'), true);
assert.equal(isValidSmartMode('clock_money'), true);
assert.equal(isValidSmartMode('phonics_chunks'), true);
for (const cid of ALL_COURSE_SUB_IDS) {
    assert.equal(isValidSmartMode(cid), true, `Must accept course sub-mode ${cid}`);
}
assert.equal(isValidSmartMode('nonexistent_mode'), false);

pm.setActiveUser(kid1.id);
pm.updateUserSettings(kid1.id, {
    mathConfig: { enabledTypes: ['calc', 'compare', 'pyramid_grid'] },
    englishConfig: { enabledTypes: ['listen_pic', 'bubble_pair', 'word_order'] }
});
pm.setPreferredSmartMode('grand_random');
assert.deepEqual(pm.getActiveUser().mathConfig.enabledTypes, ['calc', 'compare', 'pyramid_grid']);
assert.deepEqual(pm.getActiveUser().englishConfig.enabledTypes, ['listen_pic', 'bubble_pair', 'word_order']);
assert.equal(pm.getActiveUser().preferredSmartMode, 'grand_random');

// Per-kid Carrot & PvZ progress isolation
pm.setCarrotStageRecord(1, { cleared: true, carrot: 'gold', allClear: true });
pm.setLastCarrotStage(5);
pm.recordPvzLevelClear('1-1', 100);
pm.setLastPvzLevel('1-2');

assert.equal(pm.getCarrotRecords()[1].carrot, 'gold');
assert.equal(pm.getLastCarrotStage(), 5);
assert.equal(pm.getPvzRecords()['1-1'].cleared, true);
assert.equal(pm.getLastPvzLevel(), '1-2');

pm.setActiveUser(kid2.id);
assert.equal(pm.getCarrotRecords()[1], undefined, '川川 Carrot medals must be isolated from 小豌豆');
assert.equal(pm.getLastCarrotStage(), 1);
assert.equal(pm.getPvzRecords()['1-1'], undefined, '川川 PvZ trophies must be isolated from 小豌豆');
assert.equal(pm.getLastPvzLevel(), '1-1');
assert.equal(pm.getActiveUser().mathConfig.enabledTypes.length, 9, '川川 defaults to all 9 math modes');
assert.deepEqual(pm.getActiveUser().englishConfig.enabledTypes, DEFAULT_EASY_ENGLISH_TYPES, '川川 defaults to friendly 5 easy English modes');
assert.equal(pm.getActiveUser().englishConfig.wordDifficulty, 'easy');
assert.equal(pm.getActiveUser().englishConfig.courseAllowHardDictation, false);

const chk1 = pm.toggleCourseReadCheck('S1U1W1_qa1');
assert.equal(chk1.checked, true);
assert.equal(chk1.awarded, true);
const chk2 = pm.toggleCourseReadCheck('S1U1W1_qa1');
assert.equal(chk2.checked, false);
const chk3 = pm.toggleCourseReadCheck('S1U1W1_qa1');
assert.equal(chk3.checked, true);
assert.equal(chk3.awarded, false, 'Re-checking same read-aloud item on same day should not double-award');

// Sibling visitor gift (once per day)
const visitor = pm.getSiblingVisitor();
assert.equal(visitor.siblingName, '小豌豆');
assert.equal(visitor.giftClaimedToday, false);
const claim1 = pm.claimSiblingVisitGift();
assert.equal(claim1.ok, true);
const claim2 = pm.claimSiblingVisitGift();
assert.equal(claim2.ok, false);
assert.equal(claim2.alreadyClaimed, true);

// Clear history clears both mathMistakes & englishMistakes + test mastery drop & 2-streak mistake resolution
pm.recordMathMistake({ formula: '6 + 7 = ?', answer: 13 }, '12');
pm.updateWordProgress(ALL_WORDS[0], true, 2); // set to 2 stars
assert.equal(pm.getActiveUser().wordMastery[ALL_WORDS[0].id], 2);
pm.updateWordProgress(ALL_WORDS[0], false); // wrong -> drops to 1 star & enters englishMistakes
assert.equal(pm.getActiveUser().wordMastery[ALL_WORDS[0].id], 1);
assert.equal(pm.getActiveUser().mathMistakes.length, 1);
assert.equal(pm.getActiveUser().englishMistakes.length, 1);
pm.updateWordProgress(ALL_WORDS[0], true, 1); // 1st normal right -> stays in englishMistakes (anti-lucky-guess)
assert.equal(pm.getActiveUser().englishMistakes.length, 1);
pm.updateWordProgress(ALL_WORDS[0], true, 1); // 2nd normal right -> truly mastered, removed from englishMistakes!
assert.equal(pm.getActiveUser().englishMistakes.length, 0);
pm.updateWordProgress(ALL_WORDS[1], false);
assert.equal(pm.getActiveUser().englishMistakes.length, 1);
pm.clearUserHistory(kid2.id);
assert.equal(pm.getActiveUser().mathMistakes.length, 0);
assert.equal(pm.getActiveUser().englishMistakes.length, 0);

// Backup Export/Import roundtrip
const backupCode = pm.exportBackupCode();
assert.ok(backupCode.startsWith('CWYY1:'));
const pm2 = new UserProfileManager();
const importRes = pm2.importBackup(backupCode);
assert.equal(importRes.ok, true);
pm2.setActiveUser(kid1.id);
assert.equal(pm2.getCarrotRecords()[1].carrot, 'gold');
assert.equal(pm2.getPvzRecords()['1-1'].cleared, true);
assert.deepEqual(pm2.getActiveUser().mathConfig.enabledTypes, ['calc', 'compare', 'pyramid_grid']);

const pairRes = pm.pairShopAndManager('sweetshop', 'frog', TOWN_PLOTS[3].id);
assert.equal(pairRes.ok, true);

// 6. Verify Pet Distinct Persona Speech, 5-Stage Style Evolution & Retro Choice, & Frog Lotus Leaf Outfits
assert.equal(PET_STAGE_STYLES.length, 5);
for (const pet of PETS_CATALOG) {
    assert.ok(pet.voiceTag && pet.voiceTag.length >= 2, `Missing voiceTag on ${pet.id}`);
    assert.equal(pet.talkLines.length, 5, `Pet ${pet.id} must have 5 stage-matched talkLines`);
    assert.equal(pet.stageDescs.length, 5, `Pet ${pet.id} must have 5 stageDescs`);
    assert.ok(pet.interactLines?.length >= 3, `Pet ${pet.id} must have rich interactLines`);
    assert.ok(pet.feedLines?.length >= 2, `Pet ${pet.id} must have rich feedLines`);
    assert.ok(pet.cheerRightLines?.length >= 2, `Pet ${pet.id} must have cheerRightLines`);
    assert.ok(pet.cheerWrongLines?.length >= 1, `Pet ${pet.id} must have cheerWrongLines`);
}
const lotusIds = PET_ACCESSORIES.filter(a => a.frogSpecial).map(a => a.id);
assert.deepEqual(lotusIds, ['lotus_hat', 'lotus_umbrella', 'lotus_crown']);

pm.setActiveUser(kid2.id); // 川川 (starter frog)
assert.ok(pm.getActiveUser().ownedAccessories.includes('lotus_hat'), 'lotus_hat must be owned by default');
assert.equal(pm.getActiveUser().pets.frog.accessory, 'lotus_hat', 'Frog must default to wearing lotus_hat');
assert.equal(pm.getEffectivePetStage('frog'), 1);
assert.equal(pm.setPetDisplayStage('frog', 2).ok, false, 'Cannot select Lv.2 style before reaching Lv.2');

// Give badges and feed frog up to Lv.3, verifying style auto-upgrades on each level-up AND retro selection works!
pm.getActiveUser().badges = 120;
pm.selectOrUnlockPet('frog');
while (pm.getActiveUser().pets.frog.level < 3) {
    const fRes = pm.feedActivePet();
    assert.equal(fRes.ok, true);
}
assert.equal(pm.getActiveUser().pets.frog.level, 3);
assert.equal(pm.getEffectivePetStage('frog'), 3, 'Leveling up to Lv.3 must auto-display Lv.3 style');

// Switch back to Lv.1 style while keeping Lv.3!
const retroRes = pm.setPetDisplayStage('frog', 1);
assert.equal(retroRes.ok, true);
assert.equal(pm.getEffectivePetStage('frog'), 1, 'Kid can freely choose previous Lv.1 style while at Lv.3');
assert.equal(pm.getActiveUser().pets.frog.level, 3, 'Pet true level remains Lv.3');

// Feed to Lv.4 -> automatically showcases newly unlocked Lv.4 style!
while (pm.getActiveUser().pets.frog.level < 4) {
    pm.feedActivePet();
}
assert.equal(pm.getEffectivePetStage('frog'), 4, 'Next level-up auto-displays newly unlocked Lv.4 style');

// Redeem & equip lotus_umbrella with badges
const umbRes = pm.unlockOrEquipAccessory('lotus_umbrella');
assert.equal(umbRes.ok, true);
assert.equal(pm.getActiveUser().pets.frog.accessory, 'lotus_umbrella');

// 7. Verify 12 Distinct Neural Pet Voice Packs (200 MP3s) & Town Shop Daily Patrol Bonus
assert.equal(Object.keys(PET_VOICE_PROFILES).length, 12, 'Must define distinct neural voice profiles for all 12 pets');
let verifiedMp3Count = 0;
for (const pet of PETS_CATALOG) {
    const vp = getPetVoiceProfile(pet.id);
    assert.ok(vp.zhActor && vp.enActor, `Missing neural voice actor for ${pet.id}`);
    assert.ok(vp.pitch >= 0.90 && vp.pitch <= 1.15, `Fallback pitch must stay in natural non-robotic range for ${pet.id}`);
    assert.ok(vp.rate >= 0.90 && vp.rate <= 1.10, `Fallback rate must stay in natural non-robotic range for ${pet.id}`);
    assert.ok(Array.isArray(vp.clips) && vp.clips.length >= 16, `Pet ${pet.id} must have >=16 neural voice clips`);
    for (const clipKey of vp.clips) {
        const mp3Path = path.join(ROOT, 'pet/assets/voices', pet.id, `${clipKey}.mp3`);
        assert.ok(fs.existsSync(mp3Path), `Missing neural voice MP3: ${mp3Path}`);
        const stat = fs.statSync(mp3Path);
        assert.ok(stat.size > 2000, `Neural voice MP3 too small (${stat.size}B): ${mp3Path}`);
        verifiedMp3Count++;
    }
}
assert.equal(verifiedMp3Count, 200, `Expected 200 mastered neural pet voice MP3 clips, verified ${verifiedMp3Count}`);
assert.notEqual(getPetVoiceProfile('frog').zhActor, getPetVoiceProfile('rabbit').zhActor, 'Frog and Rabbit must use distinct neural voice actors');
assert.notEqual(getPetVoiceProfile('panda').zhActor, getPetVoiceProfile('tiger').zhActor, 'Panda and Tiger must use distinct neural voice actors');

pm.setActiveUser(kid1.id);
pm.pairShopAndManager('sweetshop', 'frog', 'plot_2');
assert.equal(pm.isTownPlotPatrolledToday('plot_2'), false);
const patrol1 = pm.claimTownShopPatrol('plot_2', '小青蛙的糖果甜品屋');
assert.equal(patrol1.ok, true);
assert.equal(patrol1.starsAdded, 2);
assert.equal(pm.isTownPlotPatrolledToday('plot_2'), true);
const patrolDup = pm.claimTownShopPatrol('plot_2', '小青蛙的糖果甜品屋');
assert.equal(patrolDup.ok, false, 'Cannot claim town patrol bonus twice on the same plot in one day');

// 8. Verify Real-Time Question Count Tracking (Right + Wrong + Daily Cap + Non-Question Bonuses Excluded)
const pmQ = new UserProfileManager();
const qBefore = pmQ.getQuestionStats();
assert.equal(qBefore.todayAttempted, 0);
assert.equal(qBefore.totalAttempted, 0);

// Answer 1 math right via awardLearningProgress
pmQ.awardLearningProgress({ stars: 1, reason: '口算答对', isMath: true, combo: 1 });
let qStats = pmQ.getQuestionStats();
assert.equal(qStats.todayAttempted, 1);
assert.equal(qStats.todayCorrect, 1);
assert.equal(qStats.totalAttempted, 1);

// Answer 1 math wrong via recordQuestionAttempt
pmQ.recordQuestionAttempt({ isMath: true, isCorrect: false, combo: 0 });
qStats = pmQ.getQuestionStats();
assert.equal(qStats.todayAttempted, 2, 'Wrong math attempt must still increment todayAttempted');
assert.equal(qStats.todayCorrect, 1, 'Wrong math attempt must not increment todayCorrect');
assert.equal(qStats.totalAttempted, 2, 'Wrong math attempt must still increment totalAttempted');

// Answer 1 English wrong + 1 English right
pmQ.recordQuestionAttempt({ isMath: false, isCorrect: false });
pmQ.awardLearningProgress({ stars: 2, reason: '英语答对', isMath: false, combo: 1 });
qStats = pmQ.getQuestionStats();
assert.equal(qStats.todayAttempted, 4);
assert.equal(qStats.todayCorrect, 2);
assert.equal(qStats.totalAttempted, 4);

// Non-question bonuses (sibling visit gift, read-aloud check, town patrol, camp bonus) must NOT inflate question count
pmQ.claimSiblingVisitGift();
pmQ.toggleCourseReadCheck('S1U1W1_s0');
pmQ.awardLearningProgress({ stars: 3, reason: '营地全通额外奖励', isMath: false, countAsQuestion: false });
qStats = pmQ.getQuestionStats();
assert.equal(qStats.todayAttempted, 4, 'Non-question bonus rewards must NOT inflate todayAttempted');
assert.equal(qStats.totalAttempted, 4, 'Non-question bonus rewards must NOT inflate totalAttempted');

// Even when dailyBadgeCap is reached, answering questions must STILL increment question count!
const activeKid = pmQ.getActiveUser();
activeKid.dailyBadgeCap = 1;
activeKid.dailyState.badgesEarned = 1;
const cappedAward = pmQ.awardLearningProgress({ stars: 3, title: '满额后继续口算', isMath: true, combo: 2 });
assert.equal(cappedAward.actualBadges, 0);
qStats = pmQ.getQuestionStats();
assert.equal(qStats.todayAttempted, 5, 'Questions answered after daily badge cap must still increment todayAttempted');
assert.equal(qStats.totalAttempted, 5, 'Questions answered after daily badge cap must still increment totalAttempted');

// 9. Verify Daily 3-Subject Quests (Math 10Q + Chinese 8Q + English 8Q -> ALL 3 required for 1 Golden Ticket!) & 9-Series 128-Item Blindbox Museum!
const pmBbx = new UserProfileManager();
const museum0 = pmBbx.getBlindboxMuseumSummary();
assert.equal(museum0.totalItems, 128, 'Blindbox museum must contain 128 collectibles across 9 themed series');
assert.equal(museum0.bySeries.guardians.totalCount, 14);
assert.equal(museum0.bySeries.fashion.totalCount, 20);
assert.equal(museum0.bySeries.dino.totalCount, 14);
assert.equal(museum0.bySeries.space.totalCount, 14);
assert.equal(museum0.bySeries.ocean.totalCount, 14);
assert.equal(museum0.bySeries.nature.totalCount, 14);
assert.equal(museum0.bySeries.sweets.totalCount, 12);
assert.equal(museum0.bySeries.treasures.totalCount, 14);
assert.equal(museum0.bySeries.tech.totalCount, 12);

// Verify combo/camp random ticket drop is disabled (gotTicket: true -> 0 tickets)
const comboTry = pmBbx.awardLearningProgress({ title: '数学连击测试', subjectTag: '数学', stars: 1, gotTicket: true, isMath: true });
assert.equal(comboTry.actualTicket, false, 'Combo random ticket drops must be disabled');
assert.equal(pmBbx.getActiveUser().gachaTickets, 0);

// Complete remaining 9 Math questions (total 10) -> mathCompleted = true, but gachaTickets must still be 0!
let mathQuestEvt = null;
for (let i = 0; i < 9; i++) {
    const r = pmBbx.awardLearningProgress({ title: `数学打卡#${i + 2}`, subjectTag: '数学', stars: 1, isMath: true });
    if (r.questEvents?.length) mathQuestEvt = r.questEvents;
}
assert.ok(mathQuestEvt && mathQuestEvt.some(e => e.type === 'math'), '10th math right answer must trigger daily math quest completion');
assert.equal(pmBbx.getDailyQuestStatus().mathCompleted, true);
assert.equal(pmBbx.getDailyQuestStatus().completedCount, 1);
assert.equal(pmBbx.getActiveUser().gachaTickets, 0, 'Completing Math alone must NOT grant a blindbox ticket yet');

// Complete 8 English questions -> englishCompleted = true, completedCount = 2, gachaTickets STILL 0!
for (let i = 0; i < 8; i++) {
    pmBbx.awardLearningProgress({
        title: `英语打卡#${i + 1}`,
        subjectTag: '少儿英语',
        stars: 1,
        isMath: false,
        isChinese: false
    });
}
assert.equal(pmBbx.getDailyQuestStatus().englishCompleted, true);
assert.equal(pmBbx.getDailyQuestStatus().completedCount, 2);
assert.equal(pmBbx.getDailyQuestStatus().allClearCompleted, false);
assert.equal(pmBbx.getActiveUser().gachaTickets, 0, 'Completing Math + English without Chinese must STILL grant 0 blindbox tickets');

// Complete 8 Chinese questions -> ALL THREE subjects complete -> awards EXACTLY 1 Golden Blindbox Ticket!
let cnQuestEvts = [];
for (let i = 0; i < 8; i++) {
    const r = pmBbx.awardLearningProgress({
        title: `语文打卡#${i + 1}`,
        subjectTag: '趣味语文',
        stars: 1,
        isMath: false,
        isChinese: true
    });
    if (r.questEvents?.length) cnQuestEvts.push(...r.questEvents);
}
assert.equal(pmBbx.getDailyQuestStatus().chineseCompleted, true);
assert.equal(pmBbx.getDailyQuestStatus().completedCount, 3);
assert.equal(pmBbx.getDailyQuestStatus().allClearCompleted, true);
assert.ok(cnQuestEvts.some(e => e.type === 'all_clear' && e.ticketAdded === 1));
assert.equal(pmBbx.getActiveUser().gachaTickets, 1, 'Completing all 3 subjects (Math + Chinese + English) must grant exactly 1 blindbox ticket');
assert.equal(pmBbx.getActiveUser().guaranteedHighRarityDraws, 1, 'All-clear bonus must grant 1 SSR/UR guaranteed high-rarity draw');

// Pull 1st blindbox from 'dino' series -> must be SSR or UR (due to guaranteedHighRarityDraws!)
const firstDinoPull = pmBbx.drawBlindBox('dino');
assert.equal(firstDinoPull.ok, true);
assert.equal(firstDinoPull.usedTicket, true);
assert.equal(firstDinoPull.prize.seriesId, 'dino');
assert.ok(['UR', 'SSR'].includes(firstDinoPull.prize.rarity), `Guaranteed draw must yield UR or SSR, got ${firstDinoPull.prize.rarity}`);
assert.equal(pmBbx.getActiveUser().gachaTickets, 0);

// Grant 17 more tickets: pull remaining 13 dinosaurs -> verify 14/14 zero-duplicate mastery, 15th pull upgrades star rank to 2, plus pull new ocean/nature/tech halls!
pmBbx.getActiveUser().gachaTickets += 17;
const seenDinos = new Set([firstDinoPull.prize.uid]);
for (let i = 0; i < 13; i++) {
    const p = pmBbx.drawBlindBox('dino');
    assert.equal(p.prize.isNew, true, `Pull #${i + 2} in dino series must be a brand-new dinosaur`);
    seenDinos.add(p.prize.uid);
}
assert.equal(seenDinos.size, 14, '14 pulls in dino series must unlock all 14 unique dinosaurs with 0 duplicates');
assert.equal(pmBbx.getBlindboxMuseumSummary().bySeries.dino.isMastered, true);

const starUpPull = pmBbx.drawBlindBox('dino');
assert.equal(starUpPull.prize.isStarUpgrade, true, '15th pull in a mastered series must upgrade an item to 2-star shiny card');
assert.equal(starUpPull.prize.starLevel, 2);

for (const newSid of ['ocean', 'nature', 'tech']) {
    const np = pmBbx.drawBlindBox(newSid);
    assert.equal(np.ok, true);
    assert.equal(np.prize.seriesId, newSid);
    assert.equal(np.prize.isNew, true);
}

// Verify Daily Screen Time Control (default 30 min = half an hour, per-child tracking, +15m bonus, unlimited=0, reset)
const { DEFAULT_DAILY_TIME_LIMIT_MIN, sanitizeDailyTimeLimitMin } = await import('../shared/unifiedProfile.js');
assert.equal(DEFAULT_DAILY_TIME_LIMIT_MIN, 30, 'Default daily time limit must be 30 minutes (half an hour)');
assert.equal(sanitizeDailyTimeLimitMin(undefined), 30);
assert.equal(sanitizeDailyTimeLimitMin(0), 0, '0 must represent unlimited mode');
const peaTime0 = pmBbx.getDailyTimeStatus();
assert.equal(peaTime0.limitMin, 30);
assert.equal(peaTime0.isExpired, false);
assert.equal(peaTime0.remainingSeconds, 1800);
pmBbx.addPlaySeconds(1800, null, true);
assert.equal(pmBbx.getDailyTimeStatus().isExpired, true, 'Reaching 1800s (30m) must trigger expired rest state');
// Sibling Chuan must still have his own independent 30 minutes!
const chuanUser = pmBbx.getUsers().find(u => u.id === 'child_chuan');
assert.equal(pmBbx.getDailyTimeStatus(chuanUser).isExpired, false);
assert.equal(pmBbx.getDailyTimeStatus(chuanUser).remainingSeconds, 1800);
// Parent grants +15 min bonus to Xiaowandou
const afterBonus = pmBbx.grantBonusScreenTime(15);
assert.equal(afterBonus.isExpired, false);
assert.equal(afterBonus.remainingSeconds, 900);
// Parent switches Xiaowandou to Unlimited (0)
pmBbx.updateUserSettings(pmBbx.getActiveUser().id, { dailyTimeLimitMin: 0 });
assert.equal(pmBbx.getDailyTimeStatus().isUnlimited, true);
assert.equal(pmBbx.getDailyTimeStatus().isExpired, false);
// Reset today's timer and restore 30 min default
pmBbx.updateUserSettings(pmBbx.getActiveUser().id, { dailyTimeLimitMin: 30 });
pmBbx.resetTodayScreenTime();
assert.equal(pmBbx.getDailyTimeStatus().usedSeconds, 0);
assert.equal(pmBbx.getDailyTimeStatus().remainingSeconds, 1800);

console.log('   ✅ Unified UserProfileManager, 3-Subject Daily Quests (1 Ticket), 9-Series 128-Item Blindbox Museum, Live Question Counter & 12 Pet Voices verified!');

console.log('6. Verifying Magic Mailbox Voice Dialog, Neural MP3 Clips & Cloudflare Worker Config...');
const { WELCOME_LETTER, INSTANT_REPLY_CLIPS, MAGICIAN_LETTERS, matchInstantReply } = await import('../shared/aiReplies/letters.js');
const audioDir = path.join(ROOT, 'shared', 'aiReplies', 'audio');
assert.ok(fs.existsSync(path.join(audioDir, WELCOME_LETTER.audioFile)), 'Welcome MP3 must exist');
assert.ok(fs.statSync(path.join(audioDir, WELCOME_LETTER.audioFile)).size > 50000, 'Welcome MP3 must be valid neural audio');
assert.deepEqual(MAGICIAN_LETTERS, [], 'Cloud replies use dynamic /api/tts directly without static MP3 files in MAGICIAN_LETTERS');

// Verify across 240 generated math questions that visualTip NEVER reveals "= <answer>" directly!
const { MathEngine: HintCheckMath } = await import('../shared/mathEngine.js');
const hintMe = new HintCheckMath();
hintMe.setDifficulty({ range: 100, operations: ['add', 'sub', 'mul', 'div'], maxMultiplier: 9 });
for (const m of ['word', 'data', 'compare', 'bond_pop', 'operator_detective', 'sequence_train', 'clock_money', 'pyramid_grid']) {
    hintMe.setSubMode(m);
    for (let i = 0; i < 30; i++) {
        const q = hintMe.nextQuestion();
        const tip = String(q.visualTip || '');
        if (m !== 'bond_pop') {
            assert.ok(!tip.includes(`= ${q.answer}`), `visualTip leaked answer in ${m}: "${tip}" (ans=${q.answer})`);
        }
        assert.ok(!tip.includes('配对答案') && !tip.includes('唯一正确的符号是') && !tip.includes('完整车厢：'), `visualTip leaked answer phrase in ${m}: "${tip}"`);
    }
}

for (const [key, clip] of Object.entries(INSTANT_REPLY_CLIPS)) {
    const mp3Path = path.join(audioDir, clip.audioFile);
    assert.ok(fs.existsSync(mp3Path), `Missing instant reply MP3 for ${key}: ${clip.audioFile}`);
    assert.ok(fs.statSync(mp3Path).size > 40000, `Instant reply MP3 too small for ${key}`);
}

assert.equal(matchInstantReply({ kidId: 'child_xiaowandou', text: '我想加一个新植物' }).key, 'pea_pvz_tower');
assert.equal(matchInstantReply({ kidId: 'child_xiaowandou', text: '给小兔子穿公主裙' }).key, 'pea_pet_dress');
assert.equal(matchInstantReply({ kidId: 'child_chuan', text: '盲盒里加个霸王龙' }).key, 'chuan_gacha_reward');
assert.equal(matchInstantReply({ kidId: 'child_chuan', text: '这道数学题有点难' }).key, 'chuan_question_fix');
assert.equal(matchInstantReply({ kidId: 'both', text: '嗨魔法师你好呀' }).key, 'both_hello');

const wranglerCfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8'));
assert.equal(wranglerCfg.main, 'worker.js');
assert.equal(wranglerCfg.ai?.binding, 'AI', 'Cloudflare Workers AI binding must be configured');
assert.equal(wranglerCfg.assets?.binding, 'ASSETS');
assert.equal(wranglerCfg.durable_objects?.bindings?.[0]?.name, 'MAGIC_MAILBOX');
assert.deepEqual(wranglerCfg.migrations?.[0]?.new_sqlite_classes, ['MagicMailboxDO']);
assert.ok(fs.existsSync(path.join(ROOT, 'worker.js')));
assert.ok(fs.existsSync(path.join(ROOT, 'edgeTtsMod.js')));
assert.ok(fs.existsSync(path.join(ROOT, 'pet', 'js', 'petAiChat.js')));
assert.ok(fs.existsSync(path.join(ROOT, 'shared', 'magicMailbox.js')));
assert.ok(fs.existsSync(path.join(ROOT, 'shared', 'magicMailbox.css')));
console.log('   ✅ Magic Mailbox 15 neural MP3s, speaker/topic router, & Cloudflare SQLite DO config verified!');

console.log('7. Stress-testing Elementary ChineseEngine (Grade 1 & Grade 2 · All 8 Modes · No-Option Free Fill · Zero Hint Leaks)...');
const {
    ChineseEngine,
    ALL_CHINESE_TYPE_IDS,
    CHINESE_GRADES
} = await import('../shared/chineseEngine.js');
assert.equal(ALL_CHINESE_TYPE_IDS.length, 8, 'ChineseEngine must expose all 8 question modes');
assert.equal(CHINESE_GRADES.length, 3, 'ChineseEngine must expose Grade 1, Grade 2, and Mixed 1-2');

// Verify per-kid default Chinese grades: Xiaowandou -> grade2_1, Chuan -> grade1_1
assert.equal(pmBbx.getUser('child_xiaowandou').chineseConfig.grade, 'grade2_1');
assert.equal(pmBbx.getUser('child_chuan').chineseConfig.grade, 'grade1_1');

const cnEng = new ChineseEngine({ grade: 'grade2_1', enabledTypes: ALL_CHINESE_TYPE_IDS });
for (const g of ['grade1_1', 'grade2_1', 'mixed_1_2']) {
    cnEng.setConfig({ grade: g });
    // Verify bag-shuffle non-repetition on word fill (18 consecutive unique questions)
    const seenFillIds = new Set();
    for (let i = 0; i < 18; i++) {
        const q = cnEng.nextQuestion('cn_word_fill');
        assert.equal(q.isFreeTextInput, true, 'cn_word_fill must be strict no-option free text input');
        assert.equal(q.options, undefined, 'cn_word_fill must NOT provide choice options');
        assert.equal(cnEng.checkFreeTextAnswer(q, q.answer), true, 'Must accept missing character(s)');
        assert.equal(cnEng.checkFreeTextAnswer(q, q.fullText), true, 'Must also accept full idiom/word typed via Pinyin');
        assert.equal(cnEng.checkFreeTextAnswer(q, '错字测试'), false, 'Must reject wrong characters');
        seenFillIds.add(q.id);
    }
    assert.equal(seenFillIds.size, 18, `18 consecutive cn_word_fill in ${g} must have 0 duplicates`);

    for (const mode of ALL_CHINESE_TYPE_IDS) {
        for (let i = 0; i < 10; i++) {
            const q = cnEng.nextQuestion(mode);
            assert.equal(q.mode, mode);
            if (mode === 'cn_sentence_fill') {
                assert.equal(q.isFreeTextInput, true, 'cn_sentence_fill must be strict no-option free text input');
                assert.equal(q.options, undefined, 'cn_sentence_fill must NOT provide choice options');
                assert.equal(cnEng.checkFreeTextAnswer(q, q.answer), true);
                assert.equal(cnEng.checkFreeTextAnswer(q, q.fullText), true);
            }
            if (['cn_word_fill', 'cn_sentence_fill', 'cn_confusable', 'cn_pinyin_tone', 'cn_polyphone'].includes(mode)) {
                const tip = String(q.visualTip || '');
                assert.ok(!tip.includes(String(q.answer)), `Chinese visualTip leaked answer in ${mode} (${q.id}): ${tip}`);
            }
        }
    }
}
console.log('   ✅ Elementary ChineseEngine (Grade 1 & Grade 2, 8 Modes, No-Option Free Fill, Bag-Shuffle & Leak-Free Hints) verified!');

console.log('\n🎉 ALL ENGINE, NON-REPETITION, CHINESE (G1+G2 · 8 MODES), VOCABULARY (360 WORDS), PET EVOLUTION & MAGIC MAILBOX CHECKS PASSED!');
