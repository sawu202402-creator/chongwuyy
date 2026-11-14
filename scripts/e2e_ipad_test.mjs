import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const ROOT = '/home/better/IdeaProjects/chongwuyy';
const ARTIFACT_DIR = '/home/better/.gemini/antigravity/brain/96622344-8bc8-4064-9848-be073a3998f9';
const CHROME_BIN = '/home/better/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome';

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg'
};

function startStaticServer() {
    return new Promise((resolve) => {
        const srv = http.createServer((req, res) => {
            const urlPath = decodeURIComponent(req.url.split('?')[0]);
            let rel = urlPath;
            if (rel.endsWith('/')) rel += 'index.html';
            const filePath = path.join(ROOT, rel);
            if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
                res.writeHead(404);
                res.end('Not found: ' + rel);
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
            fs.createReadStream(filePath).pipe(res);
        });
        srv.listen(0, '127.0.0.1', () => resolve(srv));
    });
}

function launchChrome() {
    return new Promise((resolve, reject) => {
        const proc = spawn(CHROME_BIN, [
            '--headless=new',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--remote-debugging-port=0',
            '--window-size=1180,820',
            'about:blank'
        ]);
        let stderr = '';
        proc.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
            const m = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
            if (m) resolve({ proc, wsUrl: m[1] });
        });
        proc.on('error', reject);
        setTimeout(() => reject(new Error('Chrome launch timeout: ' + stderr)), 10000);
    });
}

class CDPClient {
    constructor(wsUrl) {
        this.ws = new WebSocket(wsUrl);
        this.id = 0;
        this.pending = new Map();
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.ws.onopen = resolve;
            this.ws.onerror = reject;
            this.ws.onmessage = (ev) => {
                const msg = JSON.parse(ev.data);
                if (msg.id && this.pending.has(msg.id)) {
                    const { res, rej } = this.pending.get(msg.id);
                    this.pending.delete(msg.id);
                    if (msg.error) rej(new Error(JSON.stringify(msg.error)));
                    else res(msg.result);
                } else if (msg.method && this.onEvent) {
                    this.onEvent(msg);
                }
            };
        });
    }
    send(method, params = {}, sessionId = undefined) {
        const id = ++this.id;
        const payload = { id, method, params };
        if (sessionId) payload.sessionId = sessionId;
        this.ws.send(JSON.stringify(payload));
        return new Promise((res, rej) => this.pending.set(id, { res, rej }));
    }
    close() {
        this.ws.close();
    }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
    const srv = await startStaticServer();
    const port = srv.address().port;
    const origin = `http://127.0.0.1:${port}`;
    console.log('🌐 Local 3-in-1 portal server listening at:', origin);

    const { proc, wsUrl } = await launchChrome();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    const { targetInfos } = await cdp.send('Target.getTargets');
    const pageTarget = targetInfos.find(t => t.type === 'page');
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true });

    const consoleErrors = [];
    const failedLocalUrls = [];

    cdp.onEvent = (msg) => {
        if (msg.method === 'Runtime.exceptionThrown') {
            consoleErrors.push(JSON.stringify(msg.params.exceptionDetails));
        } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
            const txt = msg.params.args.map(a => a.value || a.description).join(' ');
            if (!txt.includes('fonts.googleapis.com') && !txt.includes('ERR_INTERNET_DISCONNECTED') && !txt.includes('ERR_NAME_NOT_RESOLVED')) {
                consoleErrors.push(txt);
            }
        } else if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) {
            const u = msg.params.response.url;
            if (u.startsWith(origin)) {
                failedLocalUrls.push(`${msg.params.response.status} ${u}`);
            }
        }
    };

    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Network.enable', {}, sessionId);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: 1180,
        height: 820,
        deviceScaleFactor: 2,
        mobile: false
    }, sessionId);

    const evalJs = async (expression) => {
        const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
        if (r.exceptionDetails) throw new Error('Eval error: ' + JSON.stringify(r.exceptionDetails));
        return r.result.value;
    };

    const saveShot = async (filename) => {
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
        const outPath = path.join(ARTIFACT_DIR, filename);
        fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
        console.log('📸 Captured:', outPath);
    };

    // ==================== 1. Test Root Portal Hub (Mode Strip, Off-Campus Course Modal, Settings, Mistake Re-Practice) ====================
    await cdp.send('Page.navigate', { url: `${origin}/index.html` }, sessionId);
    await sleep(900);
    const hubCheck = await evalJs(`(() => {
        const chips = Array.from(document.querySelectorAll('.hub-kid-chip')).map(el => el.textContent.trim());
        const noScroll = document.documentElement.scrollHeight <= window.innerHeight + 2;
        const modePills = Array.from(document.querySelectorAll('#hubSmartModeStrip .hub-mode-pill')).map(el => el.getAttribute('data-smode'));
        const emptyHubPills = Array.from(document.querySelectorAll('#hubSmartModeStrip .hub-mode-pill')).filter(el => el.textContent.trim().length < 2).length;
        const courseBtnTxt = document.getElementById('hubCourseBtnLabel')?.textContent.trim() || '';
        document.querySelector('#hubSmartModeStrip [data-smode="clock_money"]').click();
        const afterSingle = document.querySelector('#hubSmartModeStrip .hub-mode-pill.active')?.getAttribute('data-smode');
        document.querySelector('#hubSmartModeStrip [data-smode="grand_random"]').click();
        const afterGrand = document.querySelector('#hubSmartModeStrip .hub-mode-pill.active')?.getAttribute('data-smode');
        return { chips, noScroll, modePillsCount: modePills.length, emptyHubPills, courseBtnTxt, afterSingle, afterGrand };
    })()`);
    console.log('Hub check:', hubCheck);
    assert.ok(hubCheck.chips[0].includes('小豌豆'));
    assert.ok(hubCheck.chips[1].includes('川川'));
    assert.equal(hubCheck.noScroll, true, 'Hub must fit 1180x820 iPad viewport with zero vertical overflow');
    assert.equal(hubCheck.modePillsCount, 27, 'Hub mode strip must expose 4 random/vocab + 5 course + 9 math + 9 general English = 27 entry pills');
    assert.equal(hubCheck.emptyHubPills, 0, 'All Hub mode pills must have visible labels');
    assert.ok(hubCheck.courseBtnTxt.includes('S1U1W1'), 'Hub course button should show latest lesson code S1U1W1');
    assert.equal(hubCheck.afterSingle, 'clock_money');
    assert.equal(hubCheck.afterGrand, 'grand_random');
    await saveShot('course_hub_portal_strip.png');

    // Test New 1-Click Random Filter & English Difficulty Modal on Hub (#btnHubQuickTypesCfg)
    const hubQuickFilterRes = await evalJs(`(() => {
        document.getElementById('btnHubQuickTypesCfg').click();
        const modal = document.getElementById('sharedRandomFilterModal');
        const isOpen = modal && !modal.classList.contains('hidden');
        const activeDiff = modal?.querySelector('.rfm-diff-card.active')?.getAttribute('data-rfm-diff');
        const activeEnCount = modal?.querySelectorAll('#rfmEnTypesMount .qw-type-check-pill.active').length || 0;
        const excludedEnCount = modal?.querySelectorAll('#rfmEnTypesMount .qw-type-check-pill.excluded').length || 0;
        return { isOpen, activeDiff, activeEnCount, excludedEnCount };
    })()`);
    console.log('Hub 1-Click Filter Modal check:', hubQuickFilterRes);
    assert.equal(hubQuickFilterRes.isOpen, true, 'Clicking #btnHubQuickTypesCfg must immediately open #sharedRandomFilterModal');
    assert.equal(hubQuickFilterRes.activeDiff, 'easy', 'Default English difficulty must be easy (🌱 轻松启蒙)');
    assert.equal(hubQuickFilterRes.activeEnCount, 6, 'Default active English random types must be 6 friendly types (incl. word_meaning)');
    assert.equal(hubQuickFilterRes.excludedEnCount, 4, 'Default excluded English random types must be 4 hard types');
    await sleep(200);
    await saveShot('easy_hub_filter_modal.png');

    // Toggle off phonics_chunks -> verify 5 active types saved & reflected in Hub strip -> restore 6 easy types
    const hubFilterToggleRes = await evalJs(`(() => {
        document.querySelector('#rfmEnTypesMount .qw-type-check-pill[data-tid="phonics_chunks"]').click();
        document.getElementById('btnRfmSave').click();
        const afterSaveTxt = document.querySelector('#hubSmartModeStrip [data-smode="english_random"]')?.textContent.trim() || '';
        document.getElementById('btnHubQuickTypesCfg').click();
        document.querySelector('#rfmEnTypesMount [data-qact="basic"]').click();
        document.getElementById('btnRfmSave').click();
        const afterRestoreTxt = document.querySelector('#hubSmartModeStrip [data-smode="english_random"]')?.textContent.trim() || '';
        return { afterSaveTxt, afterRestoreTxt };
    })()`);
    assert.ok(hubFilterToggleRes.afterSaveTxt.includes('(5)'), `Expected (5) after excluding phonics_chunks, got ${hubFilterToggleRes.afterSaveTxt}`);
    assert.ok(hubFilterToggleRes.afterRestoreTxt.includes('(6)'), `Expected (6) after restoring easy preset, got ${hubFilterToggleRes.afterRestoreTxt}`);

    // Test Hub Off-Campus Course Special Modal (Video Read-Aloud Board + Phonics Blind Dictation)
    const hubCourseReadRes = await evalJs(`(() => {
        document.getElementById('btnHubCourseCenter').click();
        const isOpen = document.getElementById('hubCourseModal').classList.contains('show');
        const stageTxt = document.getElementById('hubCourseStage').textContent;
        const phCount = document.querySelectorAll('#hubCourseStage .qw-rc-ph-chip').length;
        const chkBtn = document.querySelector('#hubCourseStage .qw-rc-chk');
        const chkKey = chkBtn?.getAttribute('data-chk');
        if (chkBtn) chkBtn.click();
        const isCheckedAfter = document.querySelector('#hubCourseStage [data-chk="' + chkKey + '"]')?.classList.contains('checked');
        return { isOpen, hasJackQ1: stageTxt.includes('What can Jack do'), phCount, isCheckedAfter };
    })()`);
    console.log('Hub Course Read-Aloud check:', hubCourseReadRes);
    assert.equal(hubCourseReadRes.isOpen, true);
    assert.equal(hubCourseReadRes.hasJackQ1, true);
    assert.equal(hubCourseReadRes.phCount, 12);
    assert.equal(hubCourseReadRes.isCheckedAfter, true);
    await sleep(200);
    await saveShot('course_hub_readaloud_modal.png');

    const hubCoursePhonicsRes = await evalJs(`(() => {
        document.querySelector('#hubCourseModeTabs [data-cmode="course_phonics"]').click();
        const slotCount = document.querySelectorAll('#hubCourseStage [data-dslot]').length;
        const tileCount = document.querySelectorAll('#hubCourseStage [data-dtid]').length;
        return { slotCount, tileCount };
    })()`);
    assert.ok(hubCoursePhonicsRes.slotCount >= 2 && hubCoursePhonicsRes.tileCount >= 4);
    await sleep(200);
    await saveShot('course_hub_phonics_modal.png');
    await evalJs(`
        document.getElementById('btnCloseHubCourse').click();
        document.querySelector('#hubSmartModeStrip [data-smode="grand_random"]').click();
    `);

    // Test Backup Modal Export Code
    const backupCodeRes = await evalJs(`(() => {
        document.getElementById('btnHubBackup').click();
        document.getElementById('btnCopyBackupCode').click();
        const code = document.getElementById('hubBackupCodeOutput').value;
        document.getElementById('btnCloseHubBackup').click();
        return code;
    })()`);
    assert.ok(backupCodeRes.startsWith('CWYY1:'), 'Backup modal must generate CWYY1: backup code');

    // Test Parent Gate on Hub Settings + EnabledTypes Checkboxes (9 Math + 9 English incl. course_special)
    await evalJs(`document.getElementById('btnHubSettings').click();`);
    await sleep(300);
    const gateAndTypesRes = await evalJs(`(() => {
        const qText = document.getElementById('cwyyPgQuestion').textContent;
        const m = qText.match(/(\\d+)\\s*×\\s*(\\d+)\\s*\\+\\s*(\\d+)/);
        const ans = Number(m[1]) * Number(m[2]) + Number(m[3]);
        for (const ch of String(ans)) {
            document.querySelector('#cwyyPgKeypad [data-k="' + ch + '"]').click();
        }
        document.getElementById('cwyyPgConfirm').click();
        const isOpen = document.getElementById('hubSettingsModal').classList.contains('show');
        const mathTypeChips = document.querySelectorAll('#hubMathTypesBox .qw-type-check-pill').length;
        const enTypeChips = document.querySelectorAll('#hubEnTypesBox .qw-type-check-pill').length;
        const hasCourseOnlyBtn = Boolean(document.querySelector('#hubEnTypesBox [data-qact="course_only"]'));
        // Toggle off 'data'
        document.querySelector('#hubMathTypesBox .qw-type-check-pill[data-tid="data"]').click();
        return { isOpen, mathTypeChips, enTypeChips, hasCourseOnlyBtn };
    })()`);
    console.log('Hub Settings enabledTypes check:', gateAndTypesRes);
    assert.equal(gateAndTypesRes.isOpen, true, 'Solving Parent Gate arithmetic challenge must unlock Hub Settings');
    assert.equal(gateAndTypesRes.mathTypeChips, 9, 'Hub settings must render 9 math type pills');
    assert.equal(gateAndTypesRes.enTypeChips, 10, 'Hub settings must render 10 English type pills (incl. word_meaning & course_special)');
    assert.equal(gateAndTypesRes.hasCourseOnlyBtn, true, 'English types selector must provide 🎓 仅校外课 quick filter');
    await evalJs(`document.getElementById('btnSaveHubSettings').click();`);

    // Verify 'data' was unchecked in profile, then restore all 9 types
    const restoredCount = await evalJs(`(async () => {
        const { profileManager } = await import('./shared/unifiedProfile.js');
        const curTypes = profileManager.getActiveUser().mathConfig.enabledTypes;
        const withoutData = !curTypes.includes('data') && curTypes.length === 8;
        profileManager.updateActiveUser({ mathConfig: { ...profileManager.getActiveUser().mathConfig, enabledTypes: ['calc','word','data','compare','bond_pop','operator_detective','sequence_train','clock_money','pyramid_grid'] } });
        return { withoutData, restored: profileManager.getActiveUser().mathConfig.enabledTypes.length };
    })()`);
    assert.equal(restoredCount.withoutData, true, 'Saving Hub Settings must persist enabledTypes subset');
    assert.equal(restoredCount.restored, 9);

    // Seed 1 math mistake and test Interactive Mistake Re-Practice ("错题重练消消乐")
    const practiceRes = await evalJs(`(async () => {
        const { profileManager } = await import('./shared/unifiedProfile.js');
        profileManager.recordMathMistake({ formula: '8 + 7 = ?', expr: '8 + 7 = ?', display: '8 + 7 = ?', answer: 15, kind: 'calc' }, '14');
        document.getElementById('btnHubReport').click();
        const startBtn = document.getElementById('btnStartMathPrac');
        if (startBtn) startBtn.click();
        return {
            stageVisible: document.getElementById('hubPracticeStage').style.display !== 'none',
            stageText: document.getElementById('hubPracticeStage').textContent
        };
    })()`);
    assert.equal(practiceRes.stageVisible, true);
    assert.ok(practiceRes.stageText.includes('8 + 7 = ?'));

    const clearedRes = await evalJs(`(async () => {
        document.querySelector('#hubPracticeStage [data-pk="1"]').click();
        document.querySelector('#hubPracticeStage [data-pk="5"]').click();
        document.getElementById('btnSubmitPracMath').click();
        const { profileManager } = await import('./shared/unifiedProfile.js');
        return profileManager.getActiveUser().mathMistakes.length;
    })()`);
    assert.equal(clearedRes, 0, 'Solving mistake in Hub Re-Practice must remove it from mathMistakes!');

    // ==================== 2. Test Carrot Defense (Grand Random + Single-Project Interactive Math & New English Modes) ====================
    await cdp.send('Page.navigate', { url: `${origin}/carrot/index.html` }, sessionId);
    await sleep(1500);
    const carrotSetupRes = await evalJs(`(async () => {
        document.getElementById('btnStartKidGear').click();
        const pgEl = document.getElementById('cwyyPgQuestion');
        if (pgEl && document.getElementById('cwyyParentGateOverlay')?.classList.contains('show')) {
            const m = pgEl.textContent.match(/(\\d+)\\s*×\\s*(\\d+)\\s*\\+\\s*(\\d+)/);
            const ans = Number(m[1]) * Number(m[2]) + Number(m[3]);
            for (const ch of String(ans)) {
                document.querySelector('#cwyyPgKeypad [data-k="' + ch + '"]').click();
            }
            document.getElementById('cwyyPgConfirm').click();
        }
        const mathBoxes = document.querySelectorAll('#carrotMathTypesBox .qw-type-check-pill').length;
        const enBoxes = document.querySelectorAll('#carrotEnTypesBox .qw-type-check-pill').length;
        document.getElementById('btnCloseProfileModal')?.click();
        document.getElementById('btnStartGame').click();
        await new Promise(r => setTimeout(r, 150));
        // Switch top tab to Math -> single-project 'clock_money'
        document.querySelector('.smart-mode-tab[data-topcat="math"]').click();
        document.querySelector('.smart-entry-pill[data-emode="clock_money"]').click();
        return {
            mathBoxes,
            enBoxes,
            goldBefore: window.gameEngine.gold,
            qKind: window.mathEngine.currentQuestion.kind,
            qAns: String(window.mathEngine.currentQuestion.answer)
        };
    })()`);
    console.log('Carrot interactive math setup:', carrotSetupRes);
    assert.equal(carrotSetupRes.mathBoxes, 9);
    assert.equal(carrotSetupRes.enBoxes, 10);
    assert.equal(carrotSetupRes.qKind, 'clock_money');

    // Solve the clock_money widget in Carrot and verify gold reward!
    const carrotSolvedMath = await evalJs(`(() => {
        const ans = String(window.mathEngine.currentQuestion.answer);
        const btn = Array.from(document.querySelectorAll('#smartMathWidgetPanel .qw-choice-btn')).find(b => b.getAttribute('data-val') === ans);
        btn.click();
        return { goldAfter: window.gameEngine.gold };
    })()`);
    assert.ok(carrotSolvedMath.goldAfter > carrotSetupRes.goldBefore, 'Solving interactive clock_money in Carrot must award gold!');

    // Switch Carrot SmartChalkboard to 🎓 英语课 -> 'course_phonics' (S1U1W1 12 short-a words blind dictation) & solve!
    const carrotCourseBefore = await evalJs(`(async () => {
        const { englishEngine } = await import('../shared/englishEngine.js');
        document.querySelector('.smart-mode-tab[data-topcat="course"]').click();
        document.querySelector('.smart-entry-pill[data-emode="course_phonics"]').click();
        return {
            goldBefore: window.gameEngine.gold,
            expectedWord: englishEngine.currentQuiz.expectedWord,
            lessonCode: englishEngine.currentQuiz.lessonCode
        };
    })()`);
    console.log('Carrot Course Phonics setup:', carrotCourseBefore);
    assert.equal(carrotCourseBefore.lessonCode, 'S1U1W1');
    await sleep(250);
    await saveShot('course_carrot_phonics_dictation.png');

    const carrotCourseAfter = await evalJs(`(() => {
        const word = ${JSON.stringify('')};
        return true;
    })()`);
    const carrotDictationGold = await evalJs(`(async () => {
        const { englishEngine } = await import('../shared/englishEngine.js');
        const target = englishEngine.currentQuiz.expectedWord;
        // Test the new 💡 提示1字母 helper button for the first letter, then click remaining letters!
        const hintBtn = document.querySelector('#smartEnStage [data-dact="hint"]');
        if (hintBtn) hintBtn.click();
        for (let i = 1; i < target.length; i++) {
            const ch = target[i];
            const tile = Array.from(document.querySelectorAll('#smartEnStage [data-dtid]:not(.used)'))
                .find(b => b.textContent.trim().toLowerCase() === ch);
            tile.click();
        }
        return { target, usedHintBtn: Boolean(hintBtn), goldAfter: window.gameEngine.gold };
    })()`);
    console.log('Carrot Course Phonics solved (with 💡 提示1字母):', carrotDictationGold);
    assert.equal(carrotDictationGold.usedHintBtn, true, 'Dictation card must provide 💡 提示1字母 helper button');
    assert.ok(carrotDictationGold.goldAfter > carrotCourseBefore.goldBefore, 'Spelling S1U1W1 phonics word in Carrot must award Gold!');

    // Switch Carrot SmartChalkboard to English -> verify 🎛️ 筛题/降难 button + ZERO Chinese leak before answer + post-answer reveal & green .correct highlight!
    const carrotEnRes = await evalJs(`(() => {
        document.querySelector('.smart-mode-tab[data-topcat="english"]').click();
        const hasFilterBtn = Boolean(document.querySelector('#smartSubEntryStrip [data-filter-modal]'));
        document.querySelector('.smart-entry-pill[data-emode="bubble_pair"]').click();
        const packOptCount = document.querySelectorAll('#smartEnPackSelect option').length;
        const bubbleCount = document.querySelectorAll('#smartEnStage .qw-pop-bubble').length;
        document.querySelector('.smart-entry-pill[data-emode="cloze_sentence"]').click();
        const opts = Array.from(document.querySelectorAll('#smartEnStage .qw-en-opt'));
        const revealBefore = opts.map(b => {
            const rev = b.querySelector('.qw-en-opt-reveal');
            return rev ? getComputedStyle(rev).display : 'missing';
        });
        const visibleTextBefore = opts.map(b => b.innerText.trim());
        return { hasFilterBtn, packOptCount, bubbleCount, matchOptionCount: opts.length, revealBefore, visibleTextBefore };
    })()`);
    console.log('Carrot Pure-English Choice Before Click:', carrotEnRes);
    assert.equal(carrotEnRes.hasFilterBtn, true, 'SmartChalkboard must render 🎛️ 筛题/降难 button in sub-entry strip');
    assert.equal(carrotEnRes.packOptCount, 21, 'Pack selector must have 1 All(360) + 20 theme packs = 21 options');
    assert.equal(carrotEnRes.bubbleCount, 4, 'Easy bubble_pair must render 4 bubbles (2 pairs)');
    assert.equal(carrotEnRes.matchOptionCount, 3, 'Easy cloze_sentence must render 3 choices');
    assert.ok(carrotEnRes.revealBefore.every(d => d === 'none'), 'Chinese meaning reveal MUST be display:none BEFORE answering');
    assert.ok(carrotEnRes.visibleTextBefore.every(t => !/[\u4e00-\u9fa5]/.test(t)), `English word options MUST NOT leak Chinese before click, got: ${JSON.stringify(carrotEnRes.visibleTextBefore)}`);
    await sleep(200);
    await saveShot('mem_carrot_pure_en_before.png');

    // Now deliberately click a WRONG option in cloze_sentence -> verify .wrong + .correct green highlight + Chinese meaning revealed!
    const carrotWrongRevealRes = await evalJs(`(async () => {
        const { englishEngine } = await import('../shared/englishEngine.js');
        const ansId = englishEngine.currentQuiz.answerId;
        const wrongBtn = Array.from(document.querySelectorAll('#smartEnStage .qw-en-opt')).find(b => b.getAttribute('data-id') !== ansId);
        wrongBtn.click();
        const rightBtn = Array.from(document.querySelectorAll('#smartEnStage .qw-en-opt')).find(b => b.getAttribute('data-id') === ansId);
        const revealAfter = getComputedStyle(rightBtn.querySelector('.qw-en-opt-reveal')).display;
        return {
            wrongMarked: wrongBtn.classList.contains('wrong'),
            rightHighlightedGreen: rightBtn.classList.contains('correct'),
            revealAfter
        };
    })()`);
    console.log('Carrot Post-Wrong Reveal Check:', carrotWrongRevealRes);
    assert.equal(carrotWrongRevealRes.wrongMarked, true);
    assert.equal(carrotWrongRevealRes.rightHighlightedGreen, true, 'Wrong click MUST highlight the true .correct option in green');
    assert.equal(carrotWrongRevealRes.revealAfter, 'block', 'Post-answer MUST reveal the Chinese meaning on options');
    await sleep(200);
    await saveShot('mem_carrot_reveal_after_wrong.png');

    // Switch back to Grand Random before leaving Carrot
    await evalJs(`document.querySelector('.smart-mode-tab[data-topcat="grand"]').click();`);

    // ==================== 3. Test Plants vs Zombies (Off-Campus Course Q&A + Pyramid/Grid + 0 Overflow) ====================
    await cdp.send('Page.navigate', { url: `${origin}/pvz/index.html` }, sessionId);
    await sleep(1700);
    const pvzCheck = await evalJs(`(() => {
        const noScroll = document.documentElement.scrollHeight <= window.innerHeight + 2;
        const sunBefore = window.gameApp.pvzEngine.sun;
        // Switch to single-project Math 'pyramid_grid' and solve!
        document.querySelector('.smart-mode-tab[data-topcat="math"]').click();
        document.querySelector('.smart-entry-pill[data-emode="pyramid_grid"]').click();
        const qAns = String(window.gameApp.mathEngine.currentQuestion.answer);
        const choiceBtn = Array.from(document.querySelectorAll('#smartMathWidgetPanel .qw-choice-btn')).find(b => b.getAttribute('data-val') === qAns);
        choiceBtn.click();
        const sunAfterMath = window.gameApp.pvzEngine.sun;
        // Switch to 🎓 英语课 -> 'course_qa' (Jack Can Story Q&A)
        document.querySelector('.smart-mode-tab[data-topcat="course"]').click();
        document.querySelector('.smart-entry-pill[data-emode="course_qa"]').click();
        const qaStageText = document.getElementById('smartEnStage')?.textContent || '';
        const noScrollAfterCourse = document.documentElement.scrollHeight <= window.innerHeight + 2;
        return { noScroll, noScrollAfterCourse, sunBefore, sunAfterMath, qaStageText };
    })()`);
    console.log('PvZ course Q&A & sun reward check:', pvzCheck);
    assert.equal(pvzCheck.noScroll, true, 'PvZ must fit 1180x820 viewport with zero vertical overflow');
    assert.equal(pvzCheck.noScrollAfterCourse, true, 'PvZ with course Q&A must maintain zero vertical overflow');
    assert.ok(pvzCheck.sunAfterMath > pvzCheck.sunBefore, 'Solving pyramid_grid in PvZ must award Sun!');
    assert.ok(pvzCheck.qaStageText.includes('Jack') || pvzCheck.qaStageText.includes('Nan'), 'PvZ course_qa must render Jack Can story Q&A');
    // Also verify PvZ course_all in Easy mode renders gentle recognition/choice homework (0 blind full-word spelling)
    const pvzGentleCourse = await evalJs(`(async () => {
        const { englishEngine } = await import('../shared/englishEngine.js');
        document.querySelector('.smart-entry-pill[data-emode="course_all"]').click();
        return {
            subType: englishEngine.currentQuiz?.courseSubType,
            noScroll: document.documentElement.scrollHeight <= window.innerHeight + 2
        };
    })()`);
    assert.ok(['phonics_listen_pick', 'sight_cloze_pick', 'qa_match', 'qa_cloze'].includes(pvzGentleCourse.subType));
    assert.equal(pvzGentleCourse.noScroll, true);
    await sleep(300);
    await saveShot('easy_pvz_gentle_course.png');
    await evalJs(`document.querySelector('.smart-mode-tab[data-topcat="grand"]').click();`);

    // ==================== 4. Test Pet Wonder Town (5 Top Tabs incl. 🎓 英语课 + Sight Words/Sentences + Read-Aloud Card) ====================
    await cdp.send('Page.navigate', { url: `${origin}/pet/index.html` }, sessionId);
    await sleep(1100);
    const petModesCheck = await evalJs(`(() => {
        const topTabs = Array.from(document.querySelectorAll('.subject-main-tabs .subj-tab')).map(b => b.getAttribute('data-subj'));
        const mathPills = Array.from(document.querySelectorAll('#petMathSubPills .sub-pill')).map(b => b.getAttribute('data-mathmode'));
        const engPills = Array.from(document.querySelectorAll('#petEngSubPills .sub-pill')).map(b => b.getAttribute('data-engmode'));
        const firstPackText = document.querySelector('#engPackStrip button')?.textContent.trim() || '';

        // Switch to 🎓 英语课 top tab -> 'course_sight' (Words to Know + Sentences)
        document.querySelector('.subj-tab[data-subj="course"]').click();
        const coursePills = Array.from(document.querySelectorAll('#petEngSubPills .sub-pill')).map(b => b.getAttribute('data-engmode'));
        const emptyCoursePills = Array.from(document.querySelectorAll('#petEngSubPills .sub-pill')).filter(b => b.textContent.trim().length < 2).length;
        document.querySelector('#petEngSubPills [data-engmode="course_sight"]').click();
        const sightStageText = document.getElementById('petEngQuizStage')?.textContent || '';
        const noScrollPet = document.documentElement.scrollHeight <= window.innerHeight + 2;

        return { topTabs, mathPillsCount: mathPills.length, engPillsCount: engPills.length, coursePills, emptyCoursePills, firstPackText, sightStageText, noScrollPet };
    })()`);
    console.log('Pet Town Course & Modes check:', petModesCheck);
    assert.deepEqual(petModesCheck.topTabs, ['grand_random', 'math', 'english', 'course', 'review']);
    assert.equal(petModesCheck.mathPillsCount, 10, 'Pet math sub-pills must have 1 random + 9 single modes = 10');
    assert.equal(petModesCheck.engPillsCount, 16, 'Pet English sub-pills must have vocab_camp + random + 5 course + 9 general = 16');
    assert.deepEqual(petModesCheck.coursePills, ['course_all', 'course_phonics', 'course_sight', 'course_qa', 'course_readcard']);
    assert.equal(petModesCheck.emptyCoursePills, 0, 'All Pet course sub-pills must have visible labels');
    assert.ok(petModesCheck.firstPackText.includes('360'));
    assert.equal(petModesCheck.noScrollPet, true, 'Pet Town must fit 1180x820 viewport with zero vertical overflow');
    await sleep(300);
    await saveShot('course_pet_town_homework.png');

    // Also verify Pet course_readcard renders cleanly with 0 overflow
    const petReadCardCheck = await evalJs(`(() => {
        document.querySelector('#petEngSubPills [data-engmode="course_readcard"]').click();
        const hasBoard = Boolean(document.querySelector('#petEngQuizStage .qw-rc-board'));
        const noScroll = document.documentElement.scrollHeight <= window.innerHeight + 2;
        return { hasBoard, noScroll };
    })()`);
    assert.equal(petReadCardCheck.hasBoard, true, 'Pet course_readcard must render read-aloud coaching board');
    assert.equal(petReadCardCheck.noScroll, true, 'Pet course_readcard must scroll internally with zero viewport overflow');

    // Verify Pet 🎛️ 筛题/降难 button (#btnPetQuickFilter) & new 👀 看词识义 (word_meaning) mode in Pet Town
    const petEasyFilterCheck = await evalJs(`(() => {
        const filterBtn = document.getElementById('btnPetQuickFilter');
        filterBtn?.click();
        const modalOpen = Boolean(document.getElementById('sharedRandomFilterModal') && !document.getElementById('sharedRandomFilterModal').classList.contains('hidden'));
        document.getElementById('btnRfmClose')?.click();
        document.querySelector('.subj-tab[data-subj="english"]').click();
        document.querySelector('#petEngSubPills [data-engmode="word_meaning"]').click();
        const pureWordTxt = document.querySelector('#petEngQuizStage .qw-en-hero-pureword')?.textContent.trim() || '';
        const optCount = document.querySelectorAll('#petEngQuizStage .qw-en-opt').length;
        const revealHiddenBefore = Array.from(document.querySelectorAll('#petEngQuizStage .qw-en-opt .qw-en-opt-reveal'))
            .every(el => getComputedStyle(el).display === 'none');
        const noScroll = document.documentElement.scrollHeight <= window.innerHeight + 2;
        return { hasBtn: Boolean(filterBtn), modalOpen, pureWordTxt, optCount, revealHiddenBefore, noScroll };
    })()`);
    assert.equal(petEasyFilterCheck.hasBtn, true, 'Pet Town must render #btnPetQuickFilter in mascots cheer bar');
    assert.equal(petEasyFilterCheck.modalOpen, true, 'Clicking #btnPetQuickFilter must open #sharedRandomFilterModal');
    assert.ok(petEasyFilterCheck.pureWordTxt.length >= 2, 'word_meaning must display pure English word hero');
    assert.equal(petEasyFilterCheck.optCount, 3, 'Pet Town Easy word_meaning must render 3 choices');
    assert.equal(petEasyFilterCheck.revealHiddenBefore, true, 'word_meaning options must hide English word reveal before click');
    assert.equal(petEasyFilterCheck.noScroll, true, 'Pet Town must maintain zero vertical overflow');
    await sleep(250);
    await saveShot('mem_pet_word_meaning.png');

    console.log('Console errors:', consoleErrors.length);
    console.log('Failed local network requests:', failedLocalUrls.length);
    assert.equal(consoleErrors.length, 0, 'Console errors detected: ' + consoleErrors.join('; '));
    assert.equal(failedLocalUrls.length, 0, 'HTTP errors detected: ' + failedLocalUrls.join('; '));

    cdp.close();
    proc.kill();
    srv.close();
    console.log('✅ ALL 4 ROUTES + ALL 11 OPTIMIZATIONS PASSED E2E IPAD VERIFICATION WITH 0 ERRORS!');
}

main().catch((err) => {
    console.error('❌ E2E failed:', err);
    process.exit(1);
});
