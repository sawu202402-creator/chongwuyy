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

    // ==================== 1. Test Root Portal Hub (Mode Strip, EnabledTypes Checkboxes, Backup, Parent Gate, Mistake Re-Practice) ====================
    await cdp.send('Page.navigate', { url: `${origin}/index.html` }, sessionId);
    await sleep(900);
    const hubCheck = await evalJs(`(() => {
        const chips = Array.from(document.querySelectorAll('.hub-kid-chip')).map(el => el.textContent.trim());
        const noScroll = document.documentElement.scrollHeight <= window.innerHeight + 2;
        const modePills = Array.from(document.querySelectorAll('#hubSmartModeStrip .hub-mode-pill')).map(el => el.getAttribute('data-smode'));
        // Click single-project pill 'clock_money', then back to 'grand_random'
        document.querySelector('#hubSmartModeStrip [data-smode="clock_money"]').click();
        const afterSingle = document.querySelector('#hubSmartModeStrip .hub-mode-pill.active')?.getAttribute('data-smode');
        document.querySelector('#hubSmartModeStrip [data-smode="grand_random"]').click();
        const afterGrand = document.querySelector('#hubSmartModeStrip .hub-mode-pill.active')?.getAttribute('data-smode');
        return { chips, noScroll, modePillsCount: modePills.length, afterSingle, afterGrand };
    })()`);
    console.log('Hub check:', hubCheck);
    assert.ok(hubCheck.chips[0].includes('小豌豆'));
    assert.ok(hubCheck.chips[1].includes('川川'));
    assert.equal(hubCheck.noScroll, true, 'Hub must fit 1180x820 iPad viewport with zero vertical overflow');
    assert.equal(hubCheck.modePillsCount, 21, 'Hub mode strip must expose 4 random/vocab + 9 math + 8 English = 21 entry pills');
    assert.equal(hubCheck.afterSingle, 'clock_money');
    assert.equal(hubCheck.afterGrand, 'grand_random');
    await saveShot('modes_hub_portal_and_types.png');

    // Test Backup Modal Export Code
    const backupCodeRes = await evalJs(`(() => {
        document.getElementById('btnHubBackup').click();
        document.getElementById('btnCopyBackupCode').click();
        const code = document.getElementById('hubBackupCodeOutput').value;
        document.getElementById('btnCloseHubBackup').click();
        return code;
    })()`);
    assert.ok(backupCodeRes.startsWith('CWYY1:'), 'Backup modal must generate CWYY1: backup code');

    // Test Parent Gate on Hub Settings + EnabledTypes Checkboxes (9 Math + 8 English)
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
        // Toggle off 'data'
        document.querySelector('#hubMathTypesBox .qw-type-check-pill[data-tid="data"]').click();
        return { isOpen, mathTypeChips, enTypeChips };
    })()`);
    console.log('Hub Settings enabledTypes check:', gateAndTypesRes);
    assert.equal(gateAndTypesRes.isOpen, true, 'Solving Parent Gate arithmetic challenge must unlock Hub Settings');
    assert.equal(gateAndTypesRes.mathTypeChips, 9, 'Hub settings must render 9 math type pills');
    assert.equal(gateAndTypesRes.enTypeChips, 8, 'Hub settings must render 8 English type pills');
    await sleep(200);
    await saveShot('modes_hub_settings_types.png');
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
    assert.equal(carrotSetupRes.enBoxes, 8);
    assert.equal(carrotSetupRes.qKind, 'clock_money');
    await sleep(250);
    await saveShot('modes_carrot_interactive_math.png');

    // Solve the clock_money widget in Carrot and verify gold reward!
    const carrotSolvedMath = await evalJs(`(() => {
        const ans = String(window.mathEngine.currentQuestion.answer);
        const btn = Array.from(document.querySelectorAll('#smartMathWidgetPanel .qw-choice-btn')).find(b => b.getAttribute('data-val') === ans);
        btn.click();
        return { goldAfter: window.gameEngine.gold };
    })()`);
    assert.ok(carrotSolvedMath.goldAfter > carrotSetupRes.goldBefore, 'Solving interactive clock_money in Carrot must award gold!');

    // Switch Carrot SmartChalkboard to English -> 'bubble_pair' (new 360-word pool)
    const carrotEnRes = await evalJs(`(() => {
        document.querySelector('.smart-mode-tab[data-topcat="english"]').click();
        document.querySelector('.smart-entry-pill[data-emode="bubble_pair"]').click();
        const packOptCount = document.querySelectorAll('#smartEnPackSelect option').length;
        const bubbleCount = document.querySelectorAll('#smartEnStage .qw-pop-bubble').length;
        return { packOptCount, bubbleCount };
    })()`);
    console.log('Carrot new English bubble_pair check:', carrotEnRes);
    assert.equal(carrotEnRes.packOptCount, 21, 'Pack selector must have 1 All(360) + 20 theme packs = 21 options');
    assert.equal(carrotEnRes.bubbleCount, 6, 'bubble_pair must render 6 bubbles (3 English + 3 Emoji/Chinese)');
    await sleep(250);
    await saveShot('modes_carrot_new_english.png');

    // Switch back to Grand Random before leaving Carrot
    await evalJs(`document.querySelector('.smart-mode-tab[data-topcat="grand"]').click();`);

    // ==================== 3. Test Plants vs Zombies (Grand Random + Single-Project Pyramid/Grid & Riddle QA + 0 Overflow) ====================
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
        // Switch to single-project English 'riddle_qa' for visual check
        document.querySelector('.smart-mode-tab[data-topcat="english"]').click();
        document.querySelector('.smart-entry-pill[data-emode="riddle_qa"]').click();
        const riddleText = document.querySelector('#smartEnStage .qw-riddle-en')?.textContent || '';
        return { noScroll, sunBefore, sunAfterMath, riddleText };
    })()`);
    console.log('PvZ single-project & sun reward check:', pvzCheck);
    assert.equal(pvzCheck.noScroll, true, 'PvZ must fit 1180x820 viewport with zero vertical overflow');
    assert.ok(pvzCheck.sunAfterMath > pvzCheck.sunBefore, 'Solving pyramid_grid in PvZ must award Sun!');
    assert.ok(pvzCheck.riddleText.length > 5, 'PvZ English riddle_qa must render riddle clue');
    await sleep(300);
    await saveShot('modes_pvz_single_and_grand.png');
    await evalJs(`document.querySelector('.smart-mode-tab[data-topcat="grand"]').click();`);

    // ==================== 4. Test Pet Wonder Town (4 Top Tabs incl. Grand Random + 9 Math SubPills + 8 Eng SubPills + 360 Words) ====================
    await cdp.send('Page.navigate', { url: `${origin}/pet/index.html` }, sessionId);
    await sleep(1100);
    const petModesCheck = await evalJs(`(() => {
        const topTabs = Array.from(document.querySelectorAll('.subject-main-tabs .subj-tab')).map(b => b.getAttribute('data-subj'));
        const mathPills = Array.from(document.querySelectorAll('#petMathSubPills .sub-pill')).map(b => b.getAttribute('data-mathmode'));
        const engPills = Array.from(document.querySelectorAll('#petEngSubPills .sub-pill')).map(b => b.getAttribute('data-engmode'));
        const firstPackText = document.querySelector('#engPackStrip button')?.textContent.trim() || '';

        // Test Grand Random tab
        document.querySelector('.subj-tab[data-subj="grand_random"]').click();
        const grandActive = document.querySelector('.subj-tab[data-subj="grand_random"]').classList.contains('active');

        // Test single-project Math 'operator_detective'
        document.querySelector('.subj-tab[data-subj="math"]').click();
        document.querySelector('#petMathSubPills [data-mathmode="operator_detective"]').click();
        const detectiveVisible = document.getElementById('petMathInteractiveStage').style.display !== 'none'
            && Boolean(document.querySelector('#petMathInteractiveStage .qw-detective-eq'));

        return { topTabs, mathPillsCount: mathPills.length, engPillsCount: engPills.length, firstPackText, grandActive, detectiveVisible };
    })()`);
    console.log('Pet Town 17-modes & Grand Random check:', petModesCheck);
    assert.deepEqual(petModesCheck.topTabs, ['grand_random', 'math', 'english', 'review']);
    assert.equal(petModesCheck.mathPillsCount, 10, 'Pet math sub-pills must have 1 random + 9 single modes = 10');
    assert.equal(petModesCheck.engPillsCount, 10, 'Pet English sub-pills must have vocab_camp + 1 random + 8 single modes = 10');
    assert.ok(petModesCheck.firstPackText.includes('360'), 'Pet first pack chip must be All 20 themes (360 words)');
    assert.equal(petModesCheck.grandActive, true);
    assert.equal(petModesCheck.detectiveVisible, true);
    await sleep(300);
    await saveShot('modes_pet_interactive_modes.png');

    // Also verify Pet English single-project 'phonics_chunks' renders cleanly
    const petPhonicsCheck = await evalJs(`(() => {
        document.querySelector('.subj-tab[data-subj="english"]').click();
        document.querySelector('#petEngSubPills [data-engmode="phonics_chunks"]').click();
        return Boolean(document.querySelector('#petEngQuizStage .qw-chunk-slots-row'));
    })()`);
    assert.equal(petPhonicsCheck, true, 'Pet English phonics_chunks mode must render chunk slots');

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
