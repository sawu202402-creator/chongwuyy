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

    // ==================== 1. Test Root Portal Hub (Progress, Backup, Parent Gate, Mistake Re-Practice) ====================
    await cdp.send('Page.navigate', { url: `${origin}/index.html` }, sessionId);
    await sleep(900);
    const hubCheck = await evalJs(`(() => {
        const chips = Array.from(document.querySelectorAll('.hub-kid-chip')).map(el => el.textContent.trim());
        const noScroll = document.documentElement.scrollHeight <= window.innerHeight + 2;
        const carrotStat = document.getElementById('liveStatCarrot')?.textContent.trim();
        const pvzStat = document.getElementById('liveStatPvz')?.textContent.trim();
        return { chips, noScroll, carrotStat, pvzStat };
    })()`);
    console.log('Hub check:', hubCheck);
    assert.ok(hubCheck.chips[0].includes('小豌豆'));
    assert.ok(hubCheck.chips[1].includes('川川'));
    assert.equal(hubCheck.noScroll, true, 'Hub must fit 1180x820 iPad viewport with zero vertical overflow');
    await saveShot('opt_hub_portal_and_progress.png');

    // Test Backup Modal Export Code
    const backupCodeRes = await evalJs(`(() => {
        document.getElementById('btnHubBackup').click();
        document.getElementById('btnCopyBackupCode').click();
        const code = document.getElementById('hubBackupCodeOutput').value;
        document.getElementById('btnCloseHubBackup').click();
        return code;
    })()`);
    assert.ok(backupCodeRes.startsWith('CWYY1:'), 'Backup modal must generate CWYY1: backup code');

    // Test Parent Gate on Hub Settings
    await evalJs(`document.getElementById('btnHubSettings').click();`);
    await sleep(300);
    await saveShot('opt_hub_parent_gate.png');
    const gateUnlocked = await evalJs(`(() => {
        const qText = document.getElementById('cwyyPgQuestion').textContent;
        // Parse "16 × 4 + 7 = ?"
        const m = qText.match(/(\\d+)\\s*×\\s*(\\d+)\\s*\\+\\s*(\\d+)/);
        const ans = Number(m[1]) * Number(m[2]) + Number(m[3]);
        for (const ch of String(ans)) {
            document.querySelector('#cwyyPgKeypad [data-k="' + ch + '"]').click();
        }
        document.getElementById('cwyyPgConfirm').click();
        const isOpen = document.getElementById('hubSettingsModal').classList.contains('show');
        document.getElementById('btnCloseHubSettings').click();
        return isOpen;
    })()`);
    assert.equal(gateUnlocked, true, 'Solving Parent Gate arithmetic challenge must unlock Hub Settings');

    // Seed 1 math mistake and test Interactive Mistake Re-Practice ("错题重练消消乐")
    const practiceRes = await evalJs(`(async () => {
        const { profileManager } = await import('./shared/unifiedProfile.js');
        profileManager.recordMathMistake({ formula: '8 + 7 = ?', expr: '8 + 7 = ?', display: '8 + 7 = ?', answer: 15, kind: 'calc' }, '14');
        document.getElementById('btnHubReport').click();
        // Start math mistake re-practice!
        const startBtn = document.getElementById('btnStartMathPrac');
        if (startBtn) startBtn.click();
        return {
            stageVisible: document.getElementById('hubPracticeStage').style.display !== 'none',
            stageText: document.getElementById('hubPracticeStage').textContent
        };
    })()`);
    console.log('Hub Mistake Re-Practice check:', practiceRes);
    assert.equal(practiceRes.stageVisible, true);
    assert.ok(practiceRes.stageText.includes('8 + 7 = ?'));
    await sleep(250);
    await saveShot('opt_hub_mistake_practice.png');

    // Solve the mistake in Hub Re-Practice and verify mistake count drops to 0!
    const clearedRes = await evalJs(`(async () => {
        document.querySelector('#hubPracticeStage [data-pk="1"]').click();
        document.querySelector('#hubPracticeStage [data-pk="5"]').click();
        document.getElementById('btnSubmitPracMath').click();
        const { profileManager } = await import('./shared/unifiedProfile.js');
        return profileManager.getActiveUser().mathMistakes.length;
    })()`);
    assert.equal(clearedRes, 0, 'Solving mistake in Hub Re-Practice must remove it from mathMistakes!');

    // ==================== 2. Test Carrot Defense (Tower Almanac, Dynamic Map Chunking, Per-Kid Medals) ====================
    await cdp.send('Page.navigate', { url: `${origin}/carrot/index.html` }, sessionId);
    await sleep(1500);
    // Start Stage 1, solve 1 Word Problem (+1 badge), record Gold Carrot for 小豌豆, then switch via Level Select UI to Stage 13 (Theme 2 Jungle)!
    const carrotStage13Res = await evalJs(`(async () => {
        document.getElementById('btnStartGame').click();
        document.querySelector('.smart-mode-tab[data-smode="word"]').click();
        const ans = window.mathEngine.currentQuestion.answer;
        for (const ch of String(ans)) {
            document.querySelector('#virtualKeypad .cookie-key[data-key="' + ch + '"]').click();
        }
        document.getElementById('btnSubmitAnswer').click();
        // Record Gold Carrot for 小豌豆 on Stage 1 and open Level Select
        window.profileManager.setCarrotStageRecord(1, { cleared: true, carrot: 'gold', allClear: true });
        document.getElementById('btnSelectLevel').click();
        const summaryTxt = document.getElementById('levelMedalSummary').textContent;
        // Click Stage 13 card (Theme 2 Jungle) -> triggers dynamic map chunk + New Tower Unlock Almanac!
        document.getElementById('level-grid-item-13').click();
        await new Promise(r => setTimeout(r, 350));
        return {
            summaryTxt,
            curLevel: window.gameEngine.currentLevel,
            stage13Name: window.gameEngine.map.currentLevelConfig.name,
            almanacShown: document.getElementById('towerAlmanacModal').classList.contains('show'),
            almanacTitle: document.getElementById('towerAlmanacTitle').textContent
        };
    })()`);
    console.log('Carrot Stage 13, Tower Almanac & Per-Kid Medal check:', carrotStage13Res);
    assert.ok(carrotStage13Res.summaryTxt.includes('小豌豆'));
    assert.ok(carrotStage13Res.summaryTxt.includes('金萝卜 1/48'));
    assert.equal(carrotStage13Res.curLevel, 13);
    assert.ok(carrotStage13Res.stage13Name.includes('第 2 季'));
    assert.equal(carrotStage13Res.almanacShown, true, 'Switching to Stage 13 with unseen towers must pop New Tower Almanac card');
    await sleep(300);
    await saveShot('opt_carrot_tower_almanac.png');

    // ==================== 3. Test Plants vs Zombies (2x Speed Toggle + Per-Kid Trophies) ====================
    await cdp.send('Page.navigate', { url: `${origin}/pvz/index.html` }, sessionId);
    await sleep(1700);
    const pvzCheck = await evalJs(`(() => {
        document.getElementById('btnSpeedToggle').click();
        const speedText = document.getElementById('btnSpeedToggle').textContent.trim();
        const gameSpeed = window.gameApp.gameSpeed;
        // Record 1-1 clear for 小豌豆 and open Level Modal
        window.gameApp.profileManager.recordPvzLevelClear('1-1', 100);
        window.gameApp.openLevelModal();
        const gridHtml = document.getElementById('levelGrid').innerHTML;
        return { speedText, gameSpeed, hasTrophy: gridHtml.includes('🏆 已通关') && gridHtml.includes('通关 1/10') };
    })()`);
    console.log('PvZ 2x Speed & Trophy check:', pvzCheck);
    assert.equal(pvzCheck.gameSpeed, 2);
    assert.ok(pvzCheck.speedText.includes('2x'));
    assert.equal(pvzCheck.hasTrophy, true);
    await sleep(300);
    await saveShot('opt_pvz_2x_and_trophies.png');

    // ==================== 4. Test Pet Wonder Town (Sibling Visit Gift & Cross-Game Progress) ====================
    await cdp.send('Page.navigate', { url: `${origin}/pet/index.html` }, sessionId);
    await sleep(1100);
    const petVisitCheck = await evalJs(`(() => {
        const homePillVisible = document.getElementById('btnSiblingVisitorHome').style.display !== 'none';
        const homePillTitle = document.getElementById('siblingHomeTitle').textContent;
        document.getElementById('btnSiblingVisitorHome').click();
        const popupTitle = document.getElementById('quickPopupTitle').textContent;
        return { homePillVisible, homePillTitle, popupTitle };
    })()`);
    console.log('Pet Town Sibling Visit check:', petVisitCheck);
    assert.equal(petVisitCheck.homePillVisible, true);
    assert.ok(petVisitCheck.homePillTitle.includes('川川'));
    assert.ok(petVisitCheck.popupTitle.includes('双宝串门'));
    await sleep(450);
    await saveShot('opt_pet_sibling_visit.png');

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
