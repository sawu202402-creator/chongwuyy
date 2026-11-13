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
            if (!txt.includes('fonts.googleapis.com') && !txt.includes('ERR_INTERNET_DISCONNECTED')) {
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

    // ==================== 1. Test Root 3-in-1 Portal Hub ====================
    await cdp.send('Page.navigate', { url: `${origin}/index.html` }, sessionId);
    await sleep(900);
    if (consoleErrors.length || failedLocalUrls.length) {
        console.log('Early diagnostics -> consoleErrors:', consoleErrors, 'failedLocalUrls:', failedLocalUrls);
    }
    const hubCheck = await evalJs(`(() => {
        const chips = Array.from(document.querySelectorAll('.hub-kid-chip')).map(el => el.textContent.trim());
        const noScroll = document.documentElement.scrollHeight <= window.innerHeight + 2;
        return { chips, noScroll, badges: document.getElementById('bannerBadgesVal').textContent };
    })()`);
    console.log('Hub check:', hubCheck);
    assert.ok(hubCheck.chips[0].includes('小豌豆'), 'First kid chip must be 小豌豆');
    assert.ok(hubCheck.chips[1].includes('川川'), 'Second kid chip must be 川川');
    assert.equal(hubCheck.noScroll, true, 'Hub must fit 1180x820 iPad viewport with zero vertical overflow');
    await saveShot('hub_3in1_portal.png');

    // ==================== 2. Test Carrot Defense (/carrot/index.html) ====================
    await cdp.send('Page.navigate', { url: `${origin}/carrot/index.html` }, sessionId);
    await sleep(1400);
    const carrotWordRes = await evalJs(`(() => {
        // Verify active kid is 小豌豆 and start game
        const hudName = document.getElementById('hudUserName').textContent.trim();
        document.getElementById('btnStartGame').click();
        // Switch chalkboard to Word Problem mode, solve 1 word problem to earn +1 Pet Badge + 1.5x Gold!
        document.querySelector('.smart-mode-tab[data-smode="word"]').click();
        const ans = window.mathEngine.currentQuestion.answer;
        for (const ch of String(ans)) {
            document.querySelector('#virtualKeypad .cookie-key[data-key="' + ch + '"]').click();
        }
        document.getElementById('btnSubmitAnswer').click();
        // Open visual tip on the new word problem for screenshot
        document.getElementById('btnSmartShowTip')?.click();
        return {
            hudName,
            gold: document.getElementById('goldVal').textContent,
            pillText: document.getElementById('portalPetBadgePill')?.textContent
        };
    })()`);
    console.log('Carrot Word Problem check:', carrotWordRes);
    assert.equal(carrotWordRes.hudName, '小豌豆');
    assert.ok(carrotWordRes.pillText.includes('🏅 7'), 'Solving a Word Problem in Carrot Defense must increment Pet Badge from 6 to 7!');
    await sleep(500);
    await saveShot('carrot_upgraded_word_problem.png');

    // Switch Carrot Defense chalkboard to English Vocab Study Camp
    await evalJs(`(() => {
        document.querySelector('.smart-mode-tab[data-smode="english"]').click();
        document.querySelector('.smart-en-subbtn[data-ensub="vocab"]').click();
    })()`);
    await sleep(450);
    await saveShot('carrot_upgraded_english_vocab.png');

    // ==================== 3. Test Plants vs Zombies (/pvz/index.html) ====================
    await cdp.send('Page.navigate', { url: `${origin}/pvz/index.html` }, sessionId);
    await sleep(1800);
    const pvzDataRes = await evalJs(`(() => {
        const hudName = document.getElementById('hudUserName').textContent.trim();
        // Switch chalkboard to Data Chart mode and solve 1 chart question (+75 Sun + 1 Pet Badge!)
        document.querySelector('.smart-mode-tab[data-smode="data"]').click();
        const ans = window.gameApp.mathEngine.currentQuestion.answer;
        for (const ch of String(ans)) {
            document.querySelector('#virtualKeypad .cookie-key[data-key="' + ch + '"]').click();
        }
        document.getElementById('btnSubmitAnswer').click();
        return {
            hudName,
            sun: document.getElementById('sunVal').textContent,
            pillText: document.getElementById('portalPetBadgePill')?.textContent
        };
    })()`);
    console.log('PvZ Data Chart check:', pvzDataRes);
    assert.equal(pvzDataRes.hudName, '小豌豆');
    assert.ok(pvzDataRes.pillText.includes('🏅 8'), 'Solving a Data Chart in PvZ must increment Pet Badge from 7 to 8!');
    await sleep(500);
    await saveShot('pvz_upgraded_data_chart.png');

    // Switch PvZ chalkboard to English Quick Quiz!
    await evalJs(`(() => {
        document.querySelector('.smart-mode-tab[data-smode="english"]').click();
        document.querySelector('.smart-en-subbtn[data-ensub="quiz"]').click();
    })()`);
    await sleep(450);
    await saveShot('pvz_upgraded_english_quiz.png');

    // ==================== 4. Return to Pet Town (/pet/index.html) & Verify Synced Badges ====================
    await cdp.send('Page.navigate', { url: `${origin}/pet/index.html` }, sessionId);
    await sleep(1000);
    const petSyncCheck = await evalJs(`(() => {
        return {
            hudName: document.getElementById('hudName').textContent.trim(),
            badges: document.getElementById('hudBadgesVal').textContent.trim(),
            daily: document.getElementById('hudDailyVal').textContent.trim(),
            hasHubBtn: Boolean(document.querySelector('.portal-hub-btn'))
        };
    })()`);
    console.log('Pet Town cross-game sync check:', petSyncCheck);
    assert.equal(petSyncCheck.hudName, '小豌豆');
    assert.equal(petSyncCheck.badges, '8', 'Pet Town must show 8 badges earned from Carrot Defense & PvZ');
    assert.equal(petSyncCheck.daily, '2/30', 'Pet Town daily cap must reflect 2/30 earned across Carrot & PvZ');
    assert.equal(petSyncCheck.hasHubBtn, true);
    await saveShot('pet_town_synced_from_battles.png');

    console.log('Console errors:', consoleErrors.length);
    console.log('Failed local network requests:', failedLocalUrls.length);
    assert.equal(consoleErrors.length, 0, 'Console errors detected: ' + consoleErrors.join('; '));
    assert.equal(failedLocalUrls.length, 0, 'HTTP errors detected: ' + failedLocalUrls.join('; '));

    cdp.close();
    proc.kill();
    srv.close();
    console.log('✅ ALL 4 ROUTES (HUB + CARROT + PVZ + PET) PASSED E2E IPAD VERIFICATION WITH 0 ERRORS!');
}

main().catch((err) => {
    console.error('❌ E2E failed:', err);
    process.exit(1);
});
