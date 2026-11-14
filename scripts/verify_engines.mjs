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
    COURSE_LESSONS,
    COURSE_SUB_MODES,
    ALL_COURSE_SUB_IDS
} from '../shared/englishEngine.js';
import { PETS_CATALOG, SHOPS_CATALOG, TOWN_PLOTS } from '../pet/js/config.js';
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

// Verify spaced repetition injection from mistakesProvider
me.setSubMode('calc');
me.setMistakesProvider(() => [{ formula: '9 + 8 = ?', expr: '9 + 8 = ?', display: '9 + 8 = ?', answer: 17, kind: 'calc' }]);
let reviewHits = 0;
for (let i = 0; i < 120; i++) {
    const q = me.nextQuestion();
    if (q.isReview) reviewHits++;
}
assert.ok(reviewHits >= 5, `Expected spaced repetition review hits, got ${reviewHits}`);
me.setMistakesProvider(null);

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

console.log('4. Testing Expanded Shared EnglishEngine (20 packs, 360 words, 9 Modes incl. Course Special & Bag Shuffle)...');
assert.equal(WORD_PACKS.length, 20, 'Must have 20 graded English word packs');
assert.equal(ALL_WORDS.length, 360, 'Must have 360 graded English words');
assert.equal(new Set(ALL_WORDS.map(w => w.id)).size, 360, 'All 360 word IDs must be unique');
assert.equal(new Set(ALL_WORDS.map(w => w.word.toLowerCase())).size, 360, 'All 360 English words must be unique');
assert.equal(ENGLISH_QUESTION_TYPES.length, 9, 'Must have 9 English question modes (course_special + 8 general modes)');
assert.equal(ALL_ENGLISH_TYPE_IDS.length, 9);

const generalEnTypes = ALL_ENGLISH_TYPE_IDS.filter(id => id !== 'course_special');
const ee = new EnglishEngine({ level: 'mixed', packId: 'all' });
for (const pack of WORD_PACKS) {
    assert.equal(pack.words.length, 18, `Pack ${pack.id} must have 18 words`);
    const sess = ee.startVocabStudySession(pack.id, {});
    assert.equal(sess.words.length, 5);
    assert.equal(sess.quizQueue.length, 9);
}
const allSess = ee.startVocabStudySession('all', {});
assert.equal(allSess.words.length, 5, 'startVocabStudySession("all") must sample 5 words from 360-word pool');

// Verify Fisher-Yates Bag Shuffle anti-repetition: 120 draws on 'all' -> 120 unique words!
ee.setMistakesProvider(null);
ee.setConfig({ packId: 'all', level: 'mixed', enabledTypes: generalEnTypes });
const drawn120 = new Set();
for (let i = 0; i < 120; i++) {
    const q = ee.nextQuickQuestion();
    drawn120.add(q.wordObj.id);
}
assert.equal(drawn120.size, 120, `Bag shuffle across 360 words must yield 120 unique words in 120 draws, got ${drawn120.size}`);

// Single 18-word pack: 18 consecutive draws must cover all 18 words with 0 repeats
ee.setConfig({ packId: 'pack_animals', enabledTypes: generalEnTypes });
const drawn18 = new Set();
for (let i = 0; i < 18; i++) {
    const q = ee.nextQuickQuestion();
    drawn18.add(q.wordObj.id);
}
assert.equal(drawn18.size, 18, `Single 18-word pack bag shuffle must yield 18 unique words in 18 draws, got ${drawn18.size}`);

// Verify all 8 general forced modes + exact questionWidgets.js field contracts
ee.setConfig({ packId: 'all', enabledTypes: ALL_ENGLISH_TYPE_IDS });
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

console.log('4B. Testing Off-Campus English Course Registry (S1U1W1 · 11/12 Jack Can)...');
assert.ok(COURSE_LESSONS.length >= 1);
assert.equal(COURSE_SUB_MODES.length, 5);
const s1u1w1 = COURSE_LESSONS.find(l => l.id === 'S1U1W1');
assert.ok(s1u1w1, 'Must contain lesson S1U1W1');
assert.equal(s1u1w1.qaList.length, 4, 'S1U1W1 must have 4 Q&A items');
assert.deepEqual(s1u1w1.sightWords.map(w => w.word), ['does', 'school', 'not', 'what']);
assert.deepEqual(
    s1u1w1.phonicsWords.map(w => w.word),
    ['ax', 'can', 'sad', 'fan', 'hat', 'jam', 'pan', 'ran', 'map', 'tack', 'back', 'wag']
);

ee.setConfig({ courseLessonId: 'S1U1W1', enabledTypes: ALL_ENGLISH_TYPE_IDS });
const allCourseKeys = new Set();
for (let i = 0; i < 29; i++) {
    const cq = ee.nextQuickQuestion(null, 'course_all');
    assert.equal(cq.mode, 'course_special');
    allCourseKeys.add(cq.itemKey);
}
assert.equal(allCourseKeys.size, 29, `29 consecutive draws of S1U1W1 course_all must have 0 repeats, got ${allCourseKeys.size}`);

const phonicsWordsDrawn = new Set();
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
assert.equal(pm.getActiveUser().englishConfig.enabledTypes.length, 9, '川川 defaults to all 9 English modes (incl. course_special)');

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

// Clear history clears both mathMistakes & englishMistakes
pm.recordMathMistake({ formula: '6 + 7 = ?', answer: 13 }, '12');
pm.updateWordProgress(ALL_WORDS[0], false);
assert.equal(pm.getActiveUser().mathMistakes.length, 1);
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
console.log('   ✅ Unified UserProfileManager per-kid isolation, enabledTypes, sibling visit & backup verified!');
console.log('\n🎉 ALL ENGINE, VOCABULARY (360 WORDS), & 17-MODE CHECKS PASSED!');
