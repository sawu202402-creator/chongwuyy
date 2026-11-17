/**
 * edgeTtsMod.js - Cloudflare Workers 实时神经网络真人语音合成模块 (Microsoft Edge Neural TTS v2)
 * 为【游戏魔法师】与【12只守护萌宠】提供与预录语音包 100% 同源的真人大姐姐/萌娃/少年 MP3 实时语音，彻底告别系统机械电子音！
 */

const BASE_URL = "speech.platform.bing.com/consumer/speech/synthesize/readaloud";
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const CHROMIUM_FULL_VERSION = "143.0.3650.75";
const CHROMIUM_MAJOR_VERSION = "143";
const SEC_MS_GEC_VERSION = `2-${CHROMIUM_FULL_VERSION}`;
const WIN_EPOCH = 11644473600;
const MASK = 0xFFFFFFFFn;

const SHA256_INITIAL = [
    0x6A09E667n, 0xBB67AE85n, 0x3C6EF372n, 0xA54FF53An,
    0x510E527Fn, 0x9B05688Cn, 0x1F83D9ABn, 0x5BE0CD19n
];

const SHA256_STATE = [
    0xFD9FBEA2n, 0x91243CE7n, 0xBE499094n, 0xCD2E1E0An,
    0x6C006F49n, 0x04BD35ABn, 0xFEB0A7E4n, 0x03EFFBD2n
];

const SHA256_SCHEDULE = [
    0xEB24BF9En, 0x1558691Fn, 0xA0C09EE2n, 0x0CFA32BAn,
    0xA622EE8Cn, 0xD1DD9491n, 0xC0DD25A0n, 0xF9E70AB6n,
    0xF0C31573n, 0x7058CE4En, 0x7188E606n, 0x00E5AB33n,
    0xD258B060n, 0x72766564n
];

const SHA256_ROUND_CONSTANTS = [
    0x428A2F98n, 0x71374491n, 0xB5C0FBCFn, 0xE9B5DBA5n, 0x3956C25Bn, 0x59F111F1n, 0x923F82A4n, 0xAB1C5ED5n,
    0xD807AA98n, 0x12835B01n, 0x243185BEn, 0x550C7DC3n, 0x72BE5D74n, 0x80DEB1FEn, 0x9BDC06A7n, 0xC19BF174n,
    0xE49B69C1n, 0xEFBE4786n, 0x0FC19DC6n, 0x240CA1CCn, 0x2DE92C6Fn, 0x4A7484AAn, 0x5CB0A9DCn, 0x76F988DAn,
    0x983E5152n, 0xA831C66Dn, 0xB00327C8n, 0xBF597FC7n, 0xC6E00BF3n, 0xD5A79147n, 0x06CA6351n, 0x14292967n,
    0x27B70A85n, 0x2E1B2138n, 0x4D2C6DFCn, 0x53380D13n, 0x650A7354n, 0x766A0ABBn, 0x81C2C92En, 0x92722C85n,
    0xA2BFE8A1n, 0xA81A664Bn, 0xC24B8B70n, 0xC76C51A3n, 0xD192E819n, 0xD6990624n, 0xF40E3585n, 0x106AA070n,
    0x19A4C116n, 0x1E376C08n, 0x2748774Cn, 0x34B0BCB5n, 0x391C0CB3n, 0x4ED8AA4An, 0x5B9CCA4Fn, 0x682E6FF3n,
    0x748F82EEn, 0x78A5636Fn, 0x84C87814n, 0x8CC70208n, 0x90BEFFFAn, 0xA4506CEBn, 0xBEF9A3F7n, 0xC67178F2n
];

const SHA256_ADJUSTMENT = 0xC9DC06A7n;
const SHA256_BLOCK_CONSTANTS = SHA256_ROUND_CONSTANTS.map((c, idx) => (idx === 14 ? SHA256_ADJUSTMENT : c));
const SHA256_SIGMA0_ADJUSTMENT = 0x059C0B80n;
const SHA256_SIGMA1_ADJUSTMENT = 0x000B92C0n;

const CS64_COEFFICIENTS = [
    [0xE82E91B1n, 0xB32700D0n],
    [0x44DE24C6n, 0x88DFF51Dn],
    [0x3BEB65BCn, 0x29514038n],
    [0xC89C5933n, 0xB328CBDFn],
    [0x8D1EC211n, 0xD405B4D5n],
    [0x314EF5D5n, 0x26E55F3Cn],
    [0xE92491B1n, 0x607801C6n],
    [0xF0A5B9D5n, 0x82B2C1FBn],
    [0x06064CF3n, 0xFA51A3DAn],
    [0xDA79FA60n, 0x207CC464n],
    [0xBED20560n, 0x3C3C74F3n],
    [0x89F9C9F8n, 0xD2D14B61n],
    [0x35FA38C6n, 0xBB04A2C1n],
    [0xCB49E3C6n, 0xC5626167n]
];

const CS64_FACTOR = 0x82893933n;
const CS64_ADJUSTMENT0 = 0xF2F90B1An;
const CS64_ADJUSTMENT1 = 0x0B1A0000n;

export const ROLE_NEURAL_VOICES = {
    magician:     { voice: "zh-CN-XiaoxiaoNeural", rate: "+4%", pitch: "+2Hz" },
    rabbit:       { voice: "zh-CN-XiaoyiNeural",   rate: "+5%", pitch: "+6Hz" },
    frog:         { voice: "zh-CN-YunxiaNeural",   rate: "+4%", pitch: "+3Hz" },
    shiba:        { voice: "zh-CN-YunxiaNeural",   rate: "+6%", pitch: "+5Hz" },
    panda:        { voice: "zh-TW-HsiaoChenNeural",rate: "-4%", pitch: "-2Hz" },
    tiger:        { voice: "zh-CN-YunxiNeural",    rate: "+2%", pitch: "-3Hz" },
    unicorn:      { voice: "zh-CN-XiaoxiaoNeural", rate: "+0%", pitch: "+4Hz" },
    succulent:    { voice: "zh-TW-HsiaoYuNeural",  rate: "+2%", pitch: "+5Hz" },
    pixiu:        { voice: "zh-CN-XiaoyiNeural",   rate: "+6%", pitch: "+4Hz" },
    astro_rabbit: { voice: "zh-CN-XiaoyiNeural",   rate: "+5%", pitch: "+5Hz" },
    prince_frog:  { voice: "zh-CN-YunxiNeural",    rate: "-1%", pitch: "+0Hz" },
    star_dragon:  { voice: "zh-CN-YunxiNeural",    rate: "-3%", pitch: "-4Hz" },
    mecha_cat:    { voice: "zh-CN-XiaoyiNeural",   rate: "+7%", pitch: "+8Hz" },
    kid_pea:      { voice: "zh-CN-XiaoyiNeural",   rate: "+2%", pitch: "+4Hz" },
    kid_chuan:    { voice: "zh-CN-YunxiaNeural",   rate: "+2%", pitch: "+2Hz" }
};

function rol16(val) {
    const v = val & MASK;
    return ((v << 16n) | (v >> 16n)) & MASK;
}

function sigma0(v) {
    return ((v >> 7n) ^ (v << 25n) ^ (v >> 18n) ^ (v << 14n) ^ (v >> 3n)) & MASK;
}

function sigma1(v) {
    return ((v >> 17n) ^ (v << 15n) ^ (v >> 19n) ^ (v << 13n) ^ (v >> 10n)) & MASK;
}

function sha256Rounds(state, words, firstRound = 0) {
    let [a, b, c, d, e, f, g, h] = state;
    const constants = firstRound === 14 ? SHA256_BLOCK_CONSTANTS : SHA256_ROUND_CONSTANTS;
    for (let i = firstRound; i < 64; i++) {
        const rotE = e * 0x100000001n;
        const rotA = a * 0x100000001n;
        const t1 = h + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (g ^ (e & (f ^ g))) + constants[i] + words[i];
        const t2 = ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((a & b) | (c & (a | b)));
        h = g;
        g = f;
        f = e;
        e = (d + t1) & MASK;
        d = c;
        c = b;
        b = a;
        a = (t1 + t2) & MASK;
    }
    return [a, b, c, d, e, f, g, h];
}

function expandSha256Schedule(words, firstWord = 16) {
    for (let i = firstWord; i < 64; i++) {
        const x = words[i - 2];
        const y = words[i - 15];
        const s1 = (x >> 17n) ^ (x << 15n) ^ (x >> 19n) ^ (x << 13n) ^ (x >> 10n);
        const s0 = (y >> 7n) ^ (y << 25n) ^ (y >> 18n) ^ (y << 14n) ^ (y >> 3n);
        words.push((s1 + words[i - 7] + s0 + words[i - 16]) & MASK);
    }
}

function sha256Init(data7) {
    const w14 = BigInt((data7[0] << 16) | (data7[1] << 8) | data7[2]);
    const w15 = (BigInt(data7[3]) << 24n) | (BigInt(data7[4]) << 16n) | (BigInt(data7[5]) << 8n) | BigInt(data7[6]);
    const words = [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, w14, w15];
    for (let index = 16; index < 30; index++) {
        let value = SHA256_SCHEDULE[index - 16];
        if (index - 2 >= 14) {
            value += index === 16 ? (sigma1(words[index - 2]) ^ SHA256_SIGMA1_ADJUSTMENT) : sigma1(words[index - 2]);
        }
        if (index - 7 >= 14) {
            value += words[index - 7];
        }
        if (index - 15 >= 14) {
            value += index === 29 ? (sigma0(words[index - 15]) ^ SHA256_SIGMA0_ADJUSTMENT) : sigma0(words[index - 15]);
        }
        words.push(value & MASK);
    }
    words.push(
        (sigma1(words[28]) + words[23] + sigma0(words[15]) + words[14] + SHA256_ADJUSTMENT - SHA256_ROUND_CONSTANTS[14]) & MASK
    );
    expandSha256Schedule(words, 31);
    const working = sha256Rounds(SHA256_STATE, words, 14);
    return SHA256_INITIAL.map((x, idx) => (x + working[idx]) & MASK);
}

function sha256Digest(data) {
    const length = 57 + data.length;
    const tail = data.subarray(7);
    const padZeroCount = (((55 - length) % 64) + 64) % 64;
    const padded = new Uint8Array(tail.length + 1 + padZeroCount + 8);
    padded.set(tail, 0);
    padded[tail.length] = 0x80;
    const view = new DataView(padded.buffer);
    const bitLen = BigInt(length) * 8n;
    view.setUint32(padded.length - 8, Number((bitLen >> 32n) & MASK), false);
    view.setUint32(padded.length - 4, Number(bitLen & MASK), false);

    let state = sha256Init(data.subarray(0, 7));
    for (let offset = 0; offset < padded.length; offset += 64) {
        const words = [];
        for (let i = 0; i < 16; i++) {
            words.push(BigInt(view.getUint32(offset + i * 4, false)));
        }
        expandSha256Schedule(words, 16);
        const working = sha256Rounds(state, words, 0);
        state = state.map((x, idx) => (x + working[idx]) & MASK);
    }

    const out = new Uint8Array(32);
    const outView = new DataView(out.buffer);
    for (let i = 0; i < 8; i++) {
        outView.setUint32(i * 4, Number(state[i]), false);
    }
    return out;
}

function wordsLe4Even(data) {
    const padCount = (4 - (data.length % 4)) % 4;
    const padded = new Uint8Array(data.length + padCount);
    padded.set(data, 0);
    if (padded.length === 0) return [];
    const view = new DataView(padded.buffer);
    const words = [];
    for (let i = 0; i < padded.length; i += 4) {
        words.push(BigInt(view.getUint32(i, true)));
    }
    if (words.length % 2 === 1) words.push(0n);
    return words;
}

function cs64Digest(data, digest) {
    const dView = new DataView(digest.buffer, digest.byteOffset, digest.byteLength);
    const keyA = BigInt(dView.getUint32(0, true)) | 1n;
    const keyB = BigInt(dView.getUint32(4, true)) | 1n;
    const factors = [(keyA * CS64_FACTOR) & MASK, (keyB * CS64_FACTOR) & MASK];

    const terms = CS64_COEFFICIENTS.map(([coeff], idx) => (coeff * factors[idx % 2]) & MASK);
    const offsets = CS64_COEFFICIENTS.map(([, off]) => off);

    const prefixed = new Uint8Array(1 + data.length);
    prefixed.set(data, 1);
    const leWords = wordsLe4Even(prefixed);
    for (let idx = 0; idx < leWords.length; idx++) {
        const word = leWords[idx];
        let term = word * (idx % 2 === 0 ? keyA : keyB);
        let offset = rol16(word) * (idx % 2 === 0 ? 0xEF0569FBn : 0xC31713DBn);
        if (idx === 0) {
            term += CS64_ADJUSTMENT0 * factors[0];
            offset += CS64_ADJUSTMENT1;
        }
        terms.push(term & MASK);
        offsets.push(offset & MASK);
    }

    let swapAcc = 0n;
    let swapLast = 0n;
    let state = 0n;
    let acc = 0n;

    for (let idx = 0; idx < terms.length; idx += 2) {
        const x = terms[idx];
        const y = terms[idx + 1];
        let t = rol16((offsets[idx] + x) & MASK);
        let q = (t * 0x76F50F34n) & MASK;
        swapAcc += (rol16(q) * 0xC3EFEA97n + q) & MASK;

        t = rol16((offsets[idx + 1] + y) & MASK);
        q = (t * 0x1881CE3Cn) & MASK;
        swapLast = (rol16(q) * 0x35BD1EC9n + q) & MASK;
        swapAcc = (swapAcc + swapLast) & MASK;

        state = (state * keyA + x) & MASK;
        state = (rol16(state) * 0xCF98B111n) & MASK;
        state = (rol16(state) * 0x87085B9Fn) & MASK;
        state = (rol16(state) * 0x12CEB96Dn) & MASK;
        state = (rol16(state) * 0x257E1D83n) & MASK;
        acc += state;

        t = (state * keyB + y) & MASK;
        t = (rol16(t) * 0xA27416F5n) & MASK;
        t = (rol16(t) * 0xD38396FFn) & MASK;
        state = (rol16((rol16(t) * 0x7C932B89n) & MASK) * 0xBFA49F69n) & MASK;
        acc = (acc + state) & MASK;
    }

    return [swapLast ^ state, swapAcc ^ acc];
}

function bytesToHexUpper(u8) {
    let s = "";
    for (let i = 0; i < u8.length; i++) {
        s += u8[i].toString(16).padStart(2, "0");
    }
    return s.toUpperCase();
}

export function generateSecMsGecV2(unixTimestampSeconds = Date.now() / 1000) {
    let ticks = Number(unixTimestampSeconds) + WIN_EPOCH;
    ticks -= ticks % 300;
    const ticks100ns = Math.round(ticks * 1e7);
    const strToHash = `${ticks100ns}${TRUSTED_CLIENT_TOKEN}`;
    const data = new TextEncoder().encode(strToHash);
    const digest = sha256Digest(data);
    const [w0, w1] = cs64Digest(data, digest);
    const csBuf = new Uint8Array(8);
    const csView = new DataView(csBuf.buffer);
    csView.setUint32(0, Number(w0 & MASK), true);
    csView.setUint32(4, Number(w1 & MASK), true);
    return `${bytesToHexUpper(csBuf)}-${bytesToHexUpper(digest)}`;
}

function randomHex(byteCount = 16) {
    const arr = new Uint8Array(byteCount);
    crypto.getRandomValues(arr);
    return bytesToHexUpper(arr).toLowerCase();
}

function edgeDateStr() {
    const d = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pad = (n) => String(n).padStart(2, "0");
    return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${pad(d.getUTCDate())} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} GMT+0000 (Coordinated Universal Time)`;
}

export function stripSpeechTextForTts(raw) {
    if (!raw) return "";
    return String(raw)
        .replace(/<[^>]+>/g, "")
        .replace(/\^_\^/g, "")
        .replace(/\p{Extended_Pictographic}/gu, "")
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, "")
        .replace(/[✦✧★☆♪♫【】]/g, "")
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 320);
}

function escapeXml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function uint8ToBase64(u8) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < u8.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, u8.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

export async function synthesizeNeuralMp3Base64(rawText, roleKey = "magician") {
    const cleanText = stripSpeechTextForTts(rawText);
    if (!cleanText) return "";

    const cfg = ROLE_NEURAL_VOICES[roleKey] || ROLE_NEURAL_VOICES.magician;
    const connId = randomHex(16);
    const muid = randomHex(16).toUpperCase();
    const secMsGec = generateSecMsGecV2();

    const query = `TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${connId}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}`;
    const httpsUrl = `https://${BASE_URL}/edge/v1?${query}`;
    const ts = edgeDateStr();
    const reqId = randomHex(16);

    const configFrame =
        `X-Timestamp:${ts}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"true","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n`;

    const ssmlBody =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
        `<voice name='${cfg.voice}'>` +
        `<prosody pitch='${cfg.pitch}' rate='${cfg.rate}' volume='+0%'>` +
        `${escapeXml(cleanText)}` +
        `</prosody></voice></speak>`;

    const ssmlFrame =
        `X-RequestId:${reqId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${ts}Z\r\n` +
        `Path:ssml\r\n\r\n` +
        `${ssmlBody}`;

    const headers = {
        "Upgrade": "websocket",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
        "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_MAJOR_VERSION}.0.0.0 Safari/537.36 Edg/${CHROMIUM_MAJOR_VERSION}.0.0.0`,
        "Accept-Language": "en-US,en;q=0.9",
        "Cookie": `muid=${muid};`
    };

    const resp = await fetch(httpsUrl, { headers });
    const ws = resp.webSocket;
    if (!ws) {
        throw new Error(`edge_tts_ws_upgrade_failed_${resp.status}`);
    }

    try {
        ws.binaryType = "arraybuffer";
    } catch (_) {}
    ws.accept();

    const audioChunks = [];

    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            try { ws.close(); } catch (_) {}
            reject(new Error("edge_tts_timeout"));
        }, 7500);

        const finish = () => {
            clearTimeout(timeout);
            try { ws.close(); } catch (_) {}
            resolve();
        };

        ws.addEventListener("message", async (event) => {
            try {
                if (typeof event.data === "string") {
                    if (event.data.includes("Path:turn.end")) {
                        finish();
                    }
                    return;
                }
                let buf = null;
                if (event.data instanceof ArrayBuffer) {
                    buf = event.data;
                } else if (event.data && typeof event.data.arrayBuffer === "function") {
                    buf = await event.data.arrayBuffer();
                } else if (ArrayBuffer.isView(event.data)) {
                    buf = event.data.buffer.slice(event.data.byteOffset, event.data.byteOffset + event.data.byteLength);
                }
                if (!buf || buf.byteLength < 2) return;

                const u8 = new Uint8Array(buf);
                const headerLen = (u8[0] << 8) | u8[1];
                if (2 + headerLen > u8.length) return;
                const headerText = new TextDecoder().decode(u8.subarray(2, 2 + headerLen));
                if (headerText.includes("Path:audio") && u8.length > 2 + headerLen) {
                    audioChunks.push(u8.subarray(2 + headerLen));
                }
            } catch (e) {
                clearTimeout(timeout);
                reject(e);
            }
        });

        ws.addEventListener("error", (err) => {
            clearTimeout(timeout);
            reject(err || new Error("edge_tts_ws_error"));
        });

        ws.addEventListener("close", () => {
            finish();
        });

        ws.send(configFrame);
        ws.send(ssmlFrame);
    });

    let total = 0;
    for (const c of audioChunks) total += c.length;
    if (total === 0) {
        throw new Error("edge_tts_empty_audio");
    }

    const merged = new Uint8Array(total);
    let pos = 0;
    for (const c of audioChunks) {
        merged.set(c, pos);
        pos += c.length;
    }
    return uint8ToBase64(merged);
}
