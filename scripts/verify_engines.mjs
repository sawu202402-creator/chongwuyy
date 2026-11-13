import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MathEngine } from '../shared/mathEngine.js';
import { EnglishEngine, WORD_PACKS, ALL_WORDS } from '../shared/englishEngine.js';
import { PETS_CATALOG, SHOPS_CATALOG, TOWN_PLOTS } from '../pet/js/config.js';
import { UserProfileManager } from '../shared/unifiedProfile.js';

const ROOT = '/home/better/IdeaProjects/chongwuyy';

console.log('1. Verifying 3-in-1 portal assets across /, /pet/, /carrot/, and /pvz/...');
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
assert.ok(fs.existsSync(path.join(ROOT, 'pvz/assets/plants/sunflower.gif')), 'Missing pvz sunflower.gif');
assert.ok(fs.existsSync(path.join(ROOT, 'index.html')), 'Missing root Hub index.html');
console.log('   ✅ Core assets across all 3 games + Hub verified!');

console.log('2. Stress-testing Unified MathEngine (Pet checkAnswer + Carrot submitAnswer + PvZ checkPvzAnswer)...');
const me = new MathEngine('grade1_2');
for (const preset of ['grade1_2', 'grade3_4', 'grade5_6']) {
    me.setConfig(preset);
    for (const sub of ['calc', 'word', 'data']) {
        me.setSubMode(sub);
        for (let i = 0; i < 300; i++) {
            const q = me.nextQuestion();
            assert.ok(Number.isInteger(q.answer) && q.answer >= 0, `Invalid math answer in ${preset}/${sub}: ${JSON.stringify(q)}`);
        }
    }
}

// Verify Carrot submitAnswer & Shield Weakness contract
me.setCategoryFilter('word');
const wq = me.nextQuestion();
assert.equal(wq.kind, 'word');
const carrotRes = me.submitAnswer(wq.answer);
assert.equal(carrotRes.correct, true);
assert.ok(carrotRes.goldGain >= 24, 'Word problem in Carrot must award boosted gold');
const shieldQ = me.generateShieldWeakness();
assert.ok(shieldQ.expr && Number.isInteger(shieldQ.answer));

// Verify PvZ checkPvzAnswer & English Battle Bridge contract
me.setCategoryFilter('data');
const dq = me.nextQuestion();
assert.equal(dq.kind, 'data');
const pvzRes = me.checkPvzAnswer(dq.answer);
assert.equal(pvzRes.isCorrect, true);
assert.ok(pvzRes.bonusSun >= 75, 'Data chart in PvZ must award >= 75 sun');
assert.equal(pvzRes.isShieldBreak, true);

const enBattle = me.recordEnglishBattleAttempt({
    isCorrect: true,
    wordObj: ALL_WORDS[0],
    userAns: ALL_WORDS[0].word,
    isVocabCampFinish: true
});
assert.equal(enBattle.correct, true);
assert.equal(enBattle.bonusSun, 100);
assert.equal(enBattle.isComboUlt, true);
console.log('   ✅ Unified MathEngine & Battle Contracts passed!');

console.log('3. Testing Shared EnglishEngine (6 packs, 69 words, Phonics & 5-word study camp)...');
assert.ok(ALL_WORDS.length >= 65);
const ee = new EnglishEngine({ level: 'mixed', packId: 'all' });
for (const pack of WORD_PACKS) {
    const sess = ee.startVocabStudySession(pack.id, {});
    assert.equal(sess.words.length, 5);
    assert.equal(sess.quizQueue.length, 9);
}
console.log(`   ✅ Shared EnglishEngine verified (${WORD_PACKS.length} packs, ${ALL_WORDS.length} words)!`);

console.log('4. Testing Unified UserProfileManager (小豌豆 & 川川, 30/day cap, cross-game round records)...');
const pm = new UserProfileManager();
const users = pm.getUsers();
assert.equal(users[0].name, '小豌豆');
assert.equal(users[1].name, '川川');
const u = pm.getActiveUser();
assert.equal(u.pets.rabbit.unlocked, true);
assert.equal(u.pets.frog.unlocked, true);

const day1Res = pm.awardLearningProgress({ title: '跨游打卡测试', subjectTag: '兔蛙塔防', badges: 45, stars: 0, gotTicket: true, combo: 15, isMath: true });
assert.equal(day1Res.actualBadges, 30, 'Must clamp to daily 30-badge cap across all games');
assert.equal(day1Res.reachedCapNow, true);

pm.recordGameRound({
    userId: u.id,
    levelId: '1-1',
    total: 10,
    correct: 9,
    mistakes: [{ formula: '8 + 7 = ?', expected: 15, userAns: 14 }]
});
assert.equal(u.history.length, 1);
assert.equal(u.mathMistakes.length, 1);
assert.equal(u.mistakes.length, 1);

const pairRes = pm.pairShopAndManager('sweetshop', 'frog', TOWN_PLOTS[3].id);
assert.equal(pairRes.ok, true);
console.log('   ✅ Unified UserProfileManager cross-game sync verified!');
console.log('\n🎉 ALL UNIFIED 3-IN-1 ENGINE & ASSET TESTS PASSED!');
