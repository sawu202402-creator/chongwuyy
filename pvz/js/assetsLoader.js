/**
 * assetsLoader.js - 移动端 H5 友好的限流去重资源预加载与空闲分片预热管理器
 */

class AssetsLoader {
    constructor() {
        this.cache = new Map();
        this.pending = new Map();
        this.totalCount = 0;
        this.loadedCount = 0;
        this.failedCount = 0;
        this._idleQueue = [];
        this._idleRunning = false;
    }

    /**
     * 限并发批量预加载资源列表 (避免移动端同时解码数百张动态 GIF 造成内存峰值与主线程卡顿)
     * @param {string[]} paths
     * @param {function|null} onProgress (loaded, total, percent)
     * @param {number} concurrency
     * @returns {Promise<boolean>}
     */
    async preloadAll(paths, onProgress = null, concurrency = 10) {
        const uniquePaths = [...new Set((paths || []).filter(p => p && typeof p === 'string'))];
        if (uniquePaths.length === 0) {
            if (onProgress) onProgress(0, 0, 100);
            return true;
        }

        const total = uniquePaths.length;
        let done = 0;
        this.totalCount = total;
        this.loadedCount = 0;
        this.failedCount = 0;

        const notify = () => {
            done++;
            this.loadedCount = done;
            if (onProgress) {
                onProgress(done, total, Math.min(100, Math.floor((done / total) * 100)));
            }
        };

        let cursor = 0;
        const workerCount = Math.min(Math.max(1, concurrency), uniquePaths.length);
        const workers = Array.from({ length: workerCount }, async () => {
            while (cursor < uniquePaths.length) {
                const path = uniquePaths[cursor++];
                await this.loadImage(path);
                notify();
            }
        });

        await Promise.all(workers);
        return true;
    }

    /**
     * 浏览器空闲时间温和分片预热资源，不抢占 60fps 渲染帧预算
     * @param {string[]} paths
     * @param {number} batchSize
     */
    preloadInBackground(paths, batchSize = 5) {
        const fresh = (paths || []).filter(p => p && typeof p === 'string' && !this.cache.has(p) && !this.pending.has(p));
        if (fresh.length === 0) return;

        const existing = new Set(this._idleQueue);
        fresh.forEach(p => {
            if (!existing.has(p)) {
                existing.add(p);
                this._idleQueue.push(p);
            }
        });

        if (this._idleRunning) return;
        this._idleRunning = true;

        const scheduleNext = (cb) => {
            if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
                window.requestIdleCallback(cb, { timeout: 600 });
            } else {
                setTimeout(cb, 120);
            }
        };

        const pump = async () => {
            if (this._idleQueue.length === 0) {
                this._idleRunning = false;
                return;
            }
            const chunk = this._idleQueue.splice(0, batchSize);
            await Promise.all(chunk.map(src => this.loadImage(src)));
            scheduleNext(pump);
        };

        scheduleNext(pump);
    }

    /**
     * 单张图片异步去重加载
     */
    loadImage(src) {
        if (!src) return Promise.resolve(null);
        if (this.cache.has(src)) {
            return Promise.resolve(this.cache.get(src));
        }
        if (this.pending.has(src)) {
            return this.pending.get(src);
        }

        const promise = new Promise((resolve) => {
            if (typeof Image === 'undefined') {
                resolve(null);
                return;
            }
            const img = new Image();
            img.decoding = 'async';

            img.onload = () => {
                this.pending.delete(src);
                this.cache.set(src, img);
                resolve(img);
            };

            img.onerror = () => {
                console.warn(`[AssetsLoader] Asset failed to load: ${src}, generating fallback`);
                this.pending.delete(src);
                this.failedCount++;
                if (typeof document !== 'undefined') {
                    const fallbackCanvas = document.createElement('canvas');
                    fallbackCanvas.width = 64;
                    fallbackCanvas.height = 64;
                    const ctx = fallbackCanvas.getContext('2d');
                    ctx.fillStyle = '#2ecc71';
                    ctx.fillRect(0, 0, 64, 64);
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 20px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🌱', 32, 32);

                    const fallbackImg = new Image();
                    fallbackImg.src = fallbackCanvas.toDataURL();
                    this.cache.set(src, fallbackImg);
                    resolve(fallbackImg);
                } else {
                    resolve(null);
                }
            };

            img.src = src;
        });

        this.pending.set(src, promise);
        return promise;
    }

    /**
     * 同步获取已缓存图像（若尚未缓存，去重触发单次异步加载，绝不在 60fps 循环中重复发起请求）
     */
    getImage(src) {
        if (!src) return null;
        if (this.cache.has(src)) {
            return this.cache.get(src);
        }
        if (!this.pending.has(src)) {
            this.loadImage(src);
        }
        return null;
    }

    /**
     * 判断某资源是否已加载完成
     */
    isLoaded(src) {
        return this.cache.has(src);
    }
}

export const assetsLoader = new AssetsLoader();
