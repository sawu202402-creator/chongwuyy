/**
 * assetsLoader.js - 保卫萝卜商业级贴图资源管理器
 * 负责预加载真实手绘原画贴图并在 Canvas 中高效裁切绘制
 */

class AssetsManager {
    constructor() {
        this.images = {};
        this.loaded = false;
    }

    async loadAll() {
        const assetList = {
            props: 'assets/props.png',
            mascots: 'assets/mascots.png',
            tiles: 'assets/tiles.jpg'
        };

        const promises = Object.entries(assetList).map(([key, src]) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.images[key] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Asset failed to load: ${src}`);
                    resolve();
                };
                img.src = src;
            });
        });

        await Promise.all(promises);
        this.loaded = true;
        return true;
    }

    get(key) {
        return this.images[key] || null;
    }

    // 绘制手绘道具 (南瓜, 水桶, 草垛, 菜箱, 骷髅牌, 导轨加号)
    drawProp(ctx, type, dx, dy, dw, dh) {
        const img = this.images['props'];
        if (!img) return false;

        // props.jpg 切片坐标映射 (原图尺寸 1792x1024 左右)
        // [南瓜] [水桶]
        // [草垛] [菜箱]
        // [骷髅牌] [导轨加号]
        const w = img.naturalWidth || 1792;
        const h = img.naturalHeight || 1024;

        let sx = 0, sy = 0, sw = w * 0.22, sh = h * 0.28;

        if (type === 'pumpkin') {
            sx = w * 0.02; sy = h * 0.04; sw = w * 0.16; sh = h * 0.25;
        } else if (type === 'bucket') {
            sx = w * 0.52; sy = h * 0.02; sw = w * 0.14; sh = h * 0.28;
        } else if (type === 'haystack') {
            sx = w * 0.02; sy = h * 0.36; sw = w * 0.18; sh = h * 0.24;
        } else if (type === 'crate') {
            sx = w * 0.50; sy = h * 0.34; sw = w * 0.18; sh = h * 0.28;
        } else if (type === 'skull_sign') {
            sx = w * 0.03; sy = h * 0.65; sw = w * 0.14; sh = h * 0.32;
        } else if (type === 'socket_plus') {
            sx = w * 0.69; sy = h * 0.68; sw = w * 0.15; sh = h * 0.28;
        }

        ctx.drawImage(img, sx, sy, sw, sh, dx - dw / 2, dy - dh / 2, dw, dh);
        return true;
    }

    // 绘制萌宠 (白兔, 青蛙, 大胡萝卜)
    drawMascot(ctx, type, dx, dy, dw, dh) {
        const img = this.images['mascots'];
        if (!img) return false;

        const w = img.naturalWidth || 1024;
        const h = img.naturalHeight || 1024;

        let sx = 0, sy = 0, sw = w * 0.33, sh = h * 0.65;

        if (type === 'rabbit') {
            // 左侧抱着胡萝卜的长耳白兔
            sx = w * 0.02; sy = h * 0.18; sw = w * 0.35; sh = h * 0.50;
        } else if (type === 'frog') {
            // 中间戴荷叶帽的小青蛙
            sx = w * 0.38; sy = h * 0.26; sw = w * 0.30; sh = h * 0.42;
        } else if (type === 'carrot') {
            // 右侧大眼睛大胡萝卜
            sx = w * 0.70; sy = h * 0.20; sw = w * 0.26; sh = h * 0.50;
        }

        ctx.drawImage(img, sx, sy, sw, sh, dx - dw / 2, dy - dh / 2, dw, dh);
        return true;
    }
}

export const assetsManager = new AssetsManager();
