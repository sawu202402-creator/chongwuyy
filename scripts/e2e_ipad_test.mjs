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
    '.ico': 'image/x-icon'
};

function startStaticServer() {
    return new Promise((resolve) => {
        const srv = http.createServer((req, res) => {
            const urlPath = decodeURIComponent(req.url.split('?')[0]);
            const rel = urlPath === '/' ? '/index.html' : urlPath;
            const filePath = path.join(ROOT, rel);
            if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
                res.writeHead(404);
                res.end('Not found');
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
        this.events = [];
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
                } else if (msg.method) {
                    this.events.push(msg);
                    if (this.onEvent) this.onEvent(msg);
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
    const baseUrl = `http://127.0.0.1:${port}/index.html`;
    console.log('🌐 Local game server listening at:', baseUrl);

    const { proc, wsUrl } = await launchChrome();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    const { targetInfos } = await cdp.send('Target.getTargets');
    const pageTarget = targetInfos.find(t => t.type === 'page');
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true });

    const consoleErrors = [];
    const failedUrls = [];

    cdp.onEvent = (msg) => {
        if (msg.method === 'Runtime.exceptionThrown') {
            consoleErrors.push(JSON.stringify(msg.params.exceptionDetails));
        } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
            consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
        } else if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) {
            failedUrls.push(`${msg.params.response.status} ${msg.params.response.url}`);
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
        console.log('📸 Captured screenshot:', outPath);
    };

    await cdp.send('Page.navigate', { url: baseUrl }, sessionId);
    await sleep(1200);

    // 1. Solve 3 real questions cleanly via DOM events, feed Rabbit once, and solve 1 more for positive feedback!
    await evalJs(`(() => {
        const solveOneCalc = () => {
            const formulaText = document.getElementById('mathFormulaView').textContent.trim();
            let expected = 0;
            let m1 = formulaText.match(/^(\\d+)\\s*([+\\-×÷])\\s*(\\d+)\\s*=\\s*\\?/);
            let m2 = formulaText.match(/^(\\d+)\\s*([+\\-×÷])\\s*\\(\\s*\\?\\s*\\)\\s*=\\s*(\\d+)/);
            let m3 = formulaText.match(/^\\(\\s*\\?\\s*\\)\\s*([+\\-×÷])\\s*(\\d+)\\s*=\\s*(\\d+)/);
            if (m1) {
                const a = +m1[1], op = m1[2], b = +m1[3];
                expected = op === '+' ? a + b : (op === '-' ? a - b : (op === '×' ? a * b : a / b));
            } else if (m2) {
                const a = +m2[1], op = m2[2], c = +m2[3];
                expected = op === '+' ? c - a : (op === '-' ? a - c : (op === '×' ? c / a : a / c));
            } else if (m3) {
                const op = m3[1], b = +m3[2], c = +m3[3];
                expected = op === '+' ? c - b : (op === '-' ? c + b : (op === '×' ? c / b : c * b));
            }
            for (const ch of String(expected)) {
                document.querySelector('.jelly-key[data-k="' + ch + '"]').click();
            }
            document.getElementById('btnSubmitMath').click();
        };
        document.querySelector('[data-mathmode="calc"]').click();
        for (let k = 0; k < 3; k++) solveOneCalc();
        document.getElementById('btnPrimaryNurture').click();
        document.getElementById('modalQuickPopup').style.display = 'none';
        solveOneCalc();
    })()`);
    await sleep(600);
    await saveShot('shot1_home_rabbit_math.png');

    // 2. Switch Home to Shop mode + Right side to Mul/Div Word Problem with Visual Breakdown shown!
    await evalJs(`(() => {
        document.getElementById('btnHeroModeShop').click();
        document.querySelector('[data-mathmode="word"]').click();
        document.getElementById('btnShowMathVisual').click();
    })()`);
    await sleep(500);
    await saveShot('shot2_shop_word_problem.png');

    // 3. Switch Left to Pet Selector (showing Rabbit 🐰 & Frog 🐸) + Right to Sales Data Chart!
    await evalJs(`(() => {
        document.querySelector('.stage-nav-btn[data-view="selector"]').click();
        document.getElementById('btnSubTabPet').click();
        document.querySelector('[data-mathmode="data"]').click();
    })()`);
    await sleep(500);
    await saveShot('shot3_pets_gallery_datachart.png');

    // 4. Switch Left to Pair Shop Studio (Frog 🐸 + Sweet Bakery 🍰) + Right to English 5-Word Vocab Flashcard!
    await evalJs(`(() => {
        document.getElementById('btnSubTabShop').click();
        // Pick Sweet Bakery & Frog manager!
        const shopThumbs = document.querySelectorAll('#pairShopsStrip .mini-thumb-card');
        if (shopThumbs[1]) shopThumbs[1].click();
        const petThumbs = document.querySelectorAll('#pairPetsStrip .mini-thumb-card');
        if (petThumbs[1]) petThumbs[1].click();
        document.querySelector('.subj-tab[data-subj="english"]').click();
    })()`);
    await sleep(500);
    await saveShot('shot4_pair_shop_english_vocab.png');

    // 5. Confirm Frog's Sweet Bakery onto Town Map + Switch Right to English Quick Quiz (Spell or Match)!
    await evalJs(`(() => {
        document.getElementById('btnConfirmShopPair').click();
        document.querySelector('.stage-nav-btn[data-view="town"]').click();
        // Advance vocab study session to Quiz phase and show spelling question!
        for (let i = 0; i < 5; i++) {
            document.getElementById('btnFcNext').click();
        }
    })()`);
    await sleep(600);
    await saveShot('shot5_town_map_english_quiz.png');

    // 6. Switch Left to Gacha Blind-Box Machine + Right to English Quick Quiz!
    await evalJs(`(() => {
        document.querySelector('.stage-nav-btn[data-view="gacha"]').click();
        document.querySelector('[data-engmode="quick_quiz"]').click();
    })()`);
    await sleep(500);
    await saveShot('shot6_gacha_blindbox.png');

    console.log('Console errors:', consoleErrors.length);
    console.log('Failed network requests:', failedUrls.length);
    assert.equal(consoleErrors.length, 0, 'Console errors detected: ' + consoleErrors.join('; '));
    assert.equal(failedUrls.length, 0, 'HTTP errors detected: ' + failedUrls.join('; '));

    cdp.close();
    proc.kill();
    srv.close();
    console.log('✅ E2E iPad Landscape Browser Verification Passed with 0 Errors!');
}

main().catch((err) => {
    console.error('❌ E2E failed:', err);
    process.exit(1);
});
