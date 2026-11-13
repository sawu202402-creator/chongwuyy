import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MathEngine } from '../js/mathEngine.js';
import { EnglishEngine, WORD_PACKS, ALL_WORDS } from '../js/englishEngine.js';
import { PETS_CATALOG, SHOPS_CATALOG, TOWN_PLOTS } from '../js/config.js';
import { UserProfileManager } from '../js/profileManager.js';

const ROOT = '/home/better/IdeaProjects/chongwuyy';

console.log('1. Verifying all 3D pet, shop, town, and icon assets on disk...');
for (const pet of PETS_CATALOG) {
    const p = path.join(ROOT, pet.img);
    assert.ok(fs.existsSync(p), `Missing pet image: ${p}`);
}
for (const shop of SHOPS_CATALOG) {
    assert.ok(fs.existsSync(path.join(ROOT, shop.imgLv1)), `Missing shop lv1 image: ${shop.imgLv1}`);
    assert.ok(fs.existsSync(path.join(ROOT, shop.imgLv5)), `Missing shop lv5 image: ${shop.imgLv5}`);
}
assert.ok(fs.existsSync(path.join(ROOT, 'assets/town/town_bg.jpg')), 'Missing town_bg.jpg');
assert.ok(fs.existsSync(path.join(ROOT, 'icon-512.png')), 'Missing icon-512.png');
console.log('   ✅ All 21 visual assets verified!');

console.log('2. Stress-testing MathEngine (5,000 questions across calc, mul/div word problems, and data charts)...');
const me = new MathEngine('grade1_2');
for (const preset of ['grade1_2', 'grade3_4', 'grade5_6']) {
    me.setConfig(preset);
    for (const sub of ['calc', 'word', 'data']) {
        me.setSubMode(sub);
        for (let i = 0; i < 400; i++) {
            const q = me.nextQuestion();
            assert.ok(Number.isInteger(q.answer) && q.answer >= 0, `Invalid math answer in ${preset}/${sub}: ${JSON.stringify(q)}`);
            if (preset === 'grade1_2' && sub === 'calc') {
                assert.ok(q.answer <= 20, `Grade 1-2 calc exceeded 20: ${q.formula} -> ${q.answer}`);
            }
        }
    }
}
me.setConfig({
    mode: 'custom',
    operations: ['add', 'sub', 'mul', 'div'],
    range: 100,
    maxMultiplier: 9,
    allowCarryBorrow: true,
    allowFillBlank: true,
    includeWordProblems: true,
    includeDataCharts: true
});
me.setSubMode('calc');
for (let i = 0; i < 1400; i++) {
    const q = me.nextQuestion();
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0, `Custom question invalid: ${JSON.stringify(q)}`);
    const res = me.checkAnswer(q.answer);
    assert.equal(res.isCorrect, true);
    assert.ok(res.badgeEarned >= 1 || res.starEarned >= 1);
}
console.log('   ✅ MathEngine 5,000-question stress test passed with 0 errors!');

console.log('3. Testing EnglishEngine (Vocab Flashcard Camp + 3-stage Quiz + Phonics)...');
assert.ok(ALL_WORDS.length >= 65, `Expected >=65 curated words, got ${ALL_WORDS.length}`);
const ee = new EnglishEngine({ level: 'mixed', packId: 'all' });
for (const pack of WORD_PACKS) {
    const sess = ee.startVocabStudySession(pack.id, {});
    assert.equal(sess.words.length, 5);
    assert.equal(sess.quizQueue.length, 9);
    for (const quiz of sess.quizQueue) {
        assert.ok(quiz.wordObj && quiz.speakText);
        if (quiz.mode === 'spell_word') {
            assert.ok(quiz.missingIndices.length >= 1);
            assert.ok(quiz.tiles.length >= quiz.missingIndices.length);
        } else {
            assert.equal(quiz.options.length, 4);
            assert.ok(quiz.options.some(o => o.id === quiz.answerId));
        }
    }
}
console.log(`   ✅ EnglishEngine verified (${WORD_PACKS.length} packs, ${ALL_WORDS.length} words)!`);

console.log('4. Testing UserProfileManager (Rabbit & Frog starters, Lv.5 graduation, Shop pairing, Blind-box)...');
const pm = new UserProfileManager();
const u = pm.getActiveUser();
assert.equal(u.pets.rabbit.unlocked, true, 'Rabbit must be unlocked by default');
assert.equal(u.pets.frog.unlocked, true, 'Frog must be unlocked by default');

// Verify Daily Badge Cap (default 30/day) & multi-day graduation pacing!
const day1Res = pm.awardLearningProgress({ title: 'Day1 测试打卡', subjectTag: '数学', badges: 50, stars: 0, gotTicket: true, combo: 15, isMath: true });
assert.equal(day1Res.actualBadges, 30, 'Day 1 must clamp earned badges to daily cap of 30');
assert.equal(day1Res.reachedCapNow, true);

const overCapRes = pm.awardLearningProgress({ title: 'Day1 超额练习', subjectTag: '数学', badges: 5, stars: 3, combo: 16, isMath: true });
assert.equal(overCapRes.actualBadges, 0, 'Further answers on the same day must grant 0 badges');
assert.equal(overCapRes.alreadyAtCap, true);

// Simulate 6 days of consistent daily check-ins to graduate Rabbit to Lv.5!
let graduated = false;
for (let day = 2; day <= 7; day++) {
    u.dailyState.dateKey = `2026-01-0${day}`; // simulate next day reset
    pm.awardLearningProgress({ title: `Day${day} 每日打卡`, subjectTag: '数学', badges: 30, combo: 5, isMath: true });
    while (u.badges >= 5 && u.pets.rabbit.level < 5) {
        const r = pm.feedActivePet();
        if (r.levelUpEvent && r.levelUpEvent.newlyGraduated) graduated = true;
    }
}
assert.equal(pm.getActiveUser().pets.rabbit.level, 5);
assert.equal(graduated, true);
assert.ok(pm.getActiveUser().graduations.length >= 1);

const pairRes = pm.pairShopAndManager('sweetshop', 'frog', TOWN_PLOTS[3].id);
assert.equal(pairRes.ok, true);
const gachaRes = pm.drawBlindBox();
assert.equal(gachaRes.ok, true);
assert.ok(gachaRes.prize);
console.log('   ✅ UserProfileManager lifecycle verified!');
console.log('\n🎉 ALL AUTOMATED ENGINE & ASSET TESTS PASSED!');
