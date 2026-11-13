import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MathEngine } from '../shared/mathEngine.js';
import { EnglishEngine, WORD_PACKS, ALL_WORDS } from '../shared/englishEngine.js';
import { PETS_CATALOG, SHOPS_CATALOG, TOWN_PLOTS } from '../pet/js/config.js';
import { UserProfileManager } from '../shared/unifiedProfile.js';
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

console.log('3. Stress-testing Unified MathEngine + Spaced Repetition...');
const me = new MathEngine('grade1_2');
for (const preset of ['grade1_2', 'grade3_4', 'grade5_6']) {
    me.setConfig(preset);
    for (const sub of ['calc', 'word', 'data']) {
        me.setSubMode(sub);
        for (let i = 0; i < 200; i++) {
            const q = me.nextQuestion();
            assert.ok(Number.isInteger(q.answer) && q.answer >= 0, `Invalid math answer in ${preset}/${sub}: ${JSON.stringify(q)}`);
        }
    }
}

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
console.log('   ✅ Unified MathEngine & Spaced Repetition passed!');

console.log('4. Testing Expanded Shared EnglishEngine (12 packs, 216 words + Spaced Repetition)...');
assert.equal(WORD_PACKS.length, 12, 'Must have 12 graded English word packs');
assert.equal(ALL_WORDS.length, 216, 'Must have 216 graded English words');
const ee = new EnglishEngine({ level: 'mixed', packId: 'all' });
for (const pack of WORD_PACKS) {
    assert.equal(pack.words.length, 18, `Pack ${pack.id} must have 18 words`);
    const sess = ee.startVocabStudySession(pack.id, {});
    assert.equal(sess.words.length, 5);
    assert.equal(sess.quizQueue.length, 9);
}
ee.setMistakesProvider(() => ({
    wordMastery: {},
    englishMistakes: [{ wordId: 'w_rabbit', word: 'rabbit', zh: '兔子', icon: '🐰' }]
}));
let enReviewHits = 0;
for (let i = 0; i < 80; i++) {
    const q = ee.nextQuickQuestion();
    if (q.isReview && q.wordObj.id === 'w_rabbit') enReviewHits++;
}
assert.ok(enReviewHits >= 4, `Expected English spaced repetition hits, got ${enReviewHits}`);
console.log(`   ✅ Shared EnglishEngine verified (${WORD_PACKS.length} packs, ${ALL_WORDS.length} words, spaced review active)!`);

console.log('5. Testing Unified UserProfileManager (Per-kid progress, Sibling Visit, Backup Code, Clear History)...');
const pm = new UserProfileManager();
const users = pm.getUsers();
assert.equal(users[0].name, '小豌豆');
assert.equal(users[1].name, '川川');
const kid1 = users[0];
const kid2 = users[1];

// Per-kid Carrot & PvZ progress isolation
pm.setActiveUser(kid1.id);
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

const pairRes = pm.pairShopAndManager('sweetshop', 'frog', TOWN_PLOTS[3].id);
assert.equal(pairRes.ok, true);
console.log('   ✅ Unified UserProfileManager per-kid isolation, sibling visit & backup verified!');
console.log('\n🎉 ALL 11 OPTIMIZATION ENGINE & ASSET CHECKS PASSED!');
