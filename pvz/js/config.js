/**
 * config.js - 原版 1:1 植物大战僵尸数值体系与关卡推进树
 */

export const GAME_CONFIG = {
    // 经典 900x600 无畸变原版画幅与草坪网格系统
    canvas: {
        width: 900,
        height: 600,
        rows: 5,
        cols: 9,
        // 原版草坪瓦片精准测绘像素
        gridStartX: 40,
        gridStartY: 80,
        cellWidth: 82,
        cellHeight: 98
    },

    // 经典生命与资源
    initialSun: 150,     // 初始赠送阳光
    sunValueNatural: 25, // 自然阳光与向日葵产出阳光
    sunValueMath: 50,    // 答对数学题掉落的超级阳光
    sunValueMathCombo: 75, // 连击3题以上单题阳光
    sunValueMathSuper: 100,// 连击5题以上单题阳光
    maxLives: 5,         // 爱心生命（僵尸突破底线消耗）
    
    // 连击与超载
    comboThresholdCharge: 3,  // 3连击触发攻速狂暴 (+35%)
    comboThresholdUlt: 5,     // 5连击触发全屏觉醒大招
    chargeDuration: 6.0,      // 狂暴持续时间（秒）

    // 原版植物参数 (HP, 阳光, 冷却CD, 伤害, 攻频)
    plants: {
        peashooter: {
            id: 'peashooter',
            name: '豌豆射手',
            cost: 100,
            cooldown: 7.5,
            hp: 300,
            damage: 20,
            attackInterval: 1.425,
            desc: '直线单发绿豌豆，基础火力防线',
            icon: 'assets/cards/card_peashooter.png',
            anim: 'assets/plants/peashooter.gif',
            bulletAnim: 'assets/projectiles/pea.gif',
            splatAnim: 'assets/projectiles/pea_splat.gif',
            unlockLevel: '1-1'
        },
        sunflower: {
            id: 'sunflower',
            name: '向日葵',
            cost: 50,
            cooldown: 7.5,
            hp: 300,
            firstSunTime: 7.0,
            sunInterval: 24.0,
            desc: '每隔24秒生产一颗25点阳光',
            icon: 'assets/cards/card_sunflower.png',
            anim: 'assets/plants/sunflower.gif',
            unlockLevel: '1-2'
        },
        cherrybomb: {
            id: 'cherrybomb',
            name: '樱桃炸弹',
            cost: 150,
            cooldown: 50.0,
            hp: 300,
            damage: 1800,
            radius: 1.5,
            fuseTime: 1.2,
            desc: '3x3格瞬时毁灭性灰烬爆炸 (1800伤害)',
            icon: 'assets/cards/card_cherrybomb.png',
            anim: 'assets/plants/cherrybomb.gif',
            boomAnim: 'assets/projectiles/cherry_boom.gif',
            unlockLevel: '1-3'
        },
        wallnut: {
            id: 'wallnut',
            name: '坚果墙',
            cost: 50,
            cooldown: 30.0,
            hp: 4000,
            desc: '超高耐久护盾，可抗住僵尸40秒啃咬',
            icon: 'assets/cards/card_wallnut.png',
            anim: 'assets/plants/wallnut.gif',
            crack1Anim: 'assets/plants/wallnut_cracked1.gif',
            crack2Anim: 'assets/plants/wallnut_cracked2.gif',
            crackThreshold1: 2666,
            crackThreshold2: 1333,
            unlockLevel: '1-4'
        },
        bowling_nut: {
            id: 'bowling_nut',
            name: '保龄坚果',
            cost: 0,
            cooldown: 0,
            hp: 9999,
            damage: 500,
            desc: '在红线左侧发射！沿直线高速滚出，撞击僵尸折射弹跳 (500伤害：普通1下/路障2下/铁桶3下)',
            icon: 'assets/cards/card_bowling_nut.png',
            anim: 'assets/plants/wallnut.gif'
        },
        bowling_rednut: {
            id: 'bowling_rednut',
            name: '赤红爆炸坚果',
            cost: 0,
            cooldown: 0,
            hp: 9999,
            damage: 1800,
            desc: '在红线左侧发射！撞击首个目标触发 3x3 剧烈烈火爆破 (1800伤害)',
            icon: 'assets/cards/card_rednut.png',
            anim: 'assets/plants/wallnut_red.png'
        },
        potatomine: {
            id: 'potatomine',
            name: '土豆地雷',
            cost: 25,
            cooldown: 30.0,
            hp: 300,
            armTime: 15.0,
            damage: 1800,
            desc: '需15秒武装，僵尸踩中瞬间引爆 (1800伤害)',
            icon: 'assets/cards/card_potatomine.png',
            unarmedAnim: 'assets/plants/potatomine_unarmed.gif',
            armedAnim: 'assets/plants/potatomine_armed.gif',
            mashedAnim: 'assets/projectiles/potatomine_mashed.gif',
            boomAnim: 'assets/projectiles/spudow.gif',
            unlockLevel: '1-6'
        },
        snowpea: {
            id: 'snowpea',
            name: '雪花豌豆',
            cost: 175,
            cooldown: 7.5,
            hp: 300,
            damage: 20,
            attackInterval: 1.425,
            slowRate: 0.5,
            slowDuration: 10.0,
            desc: '发射寒冰豌豆，伤害20并使僵尸减速50%',
            icon: 'assets/cards/card_snowpea.png',
            anim: 'assets/plants/snowpea.gif',
            bulletAnim: 'assets/projectiles/snow_pea.gif',
            unlockLevel: '1-7'
        },
        chomper: {
            id: 'chomper',
            name: '大嘴花',
            cost: 150,
            cooldown: 7.5,
            hp: 300,
            swallowRange: 1.2,
            chewTime: 42.0,
            desc: '一口吞掉前方一整只僵尸，需咀嚼42秒',
            icon: 'assets/cards/card_chomper.png',
            anim: 'assets/plants/chomper.gif',
            attackAnim: 'assets/plants/chomper_attack.gif',
            digestAnim: 'assets/plants/chomper_digest.gif',
            unlockLevel: '1-8'
        },
        repeater: {
            id: 'repeater',
            name: '双发射手',
            cost: 200,
            cooldown: 7.5,
            hp: 300,
            damage: 20,
            bulletCount: 2,
            bulletDelay: 0.2,
            attackInterval: 1.425,
            desc: '一次连续射出两颗豌豆，双倍火力输出',
            icon: 'assets/cards/card_repeater.png',
            anim: 'assets/plants/repeater.gif',
            bulletAnim: 'assets/projectiles/pea.gif',
            unlockLevel: '1-9'
        },
        puffshroom: {
            id: 'puffshroom',
            name: '小喷菇',
            cost: 0,
            cooldown: 7.5,
            hp: 300,
            damage: 20,
            attackInterval: 1.425,
            range: 300,
            isNocturnal: true,
            desc: '免费向前方近距离喷射孢子，黑夜主力防御植物',
            icon: 'assets/cards/card_puffshroom.png',
            anim: 'assets/plants/puffshroom.gif',
            sleepAnim: 'assets/plants/puffshroom_sleep.gif',
            bulletAnim: 'assets/projectiles/shroom_bullet.gif',
            splatAnim: 'assets/projectiles/shroom_splat.gif',
            unlockLevel: '2-1'
        },
        sunshroom: {
            id: 'sunshroom',
            name: '阳光菇',
            cost: 25,
            cooldown: 7.5,
            hp: 300,
            growTime: 120.0,
            smallSunVal: 15,
            bigSunVal: 25,
            isNocturnal: true,
            desc: '初生产出小阳光(15)，120秒长大后产出正常阳光(25)',
            icon: 'assets/cards/card_sunshroom.png',
            anim: 'assets/plants/sunshroom.gif',
            sleepAnim: 'assets/plants/sunshroom_sleep.gif',
            bigAnim: 'assets/plants/sunshroom_big.gif',
            unlockLevel: '2-2'
        },
        fumeshroom: {
            id: 'fumeshroom',
            name: '大喷菇',
            cost: 75,
            cooldown: 7.5,
            hp: 300,
            damage: 20,
            attackInterval: 1.425,
            range: 340,
            isNocturnal: true,
            desc: '喷射穿透性孢子云雾，穿透铁栅门与报纸并攻击直线4格内所有僵尸',
            icon: 'assets/cards/card_fumeshroom.png',
            anim: 'assets/plants/fumeshroom.gif',
            attackAnim: 'assets/plants/fumeshroom_attack.gif',
            sleepAnim: 'assets/plants/fumeshroom_sleep.gif',
            cloudAnim: 'assets/projectiles/fume_cloud.gif',
            unlockLevel: '2-3'
        },
        gravebuster: {
            id: 'gravebuster',
            name: '墓碑吞噬者',
            cost: 75,
            cooldown: 7.5,
            hp: 300,
            chewTime: 4.5,
            isTombOnly: true,
            desc: '种在墓碑上吞噬墓碑，阻止大波时墓碑钻出僵尸并掉落奖励',
            icon: 'assets/cards/card_gravebuster.png',
            anim: 'assets/plants/gravebuster.gif',
            unlockLevel: '2-4'
        },
        hypnoshroom: {
            id: 'hypnoshroom',
            name: '魅惑菇',
            cost: 75,
            cooldown: 30.0,
            hp: 300,
            isNocturnal: true,
            desc: '被僵尸啃食后，使该僵尸倒戈反向攻击其他僵尸',
            icon: 'assets/cards/card_hypnoshroom.png',
            anim: 'assets/plants/hypnoshroom.gif',
            sleepAnim: 'assets/plants/hypnoshroom_sleep.gif',
            unlockLevel: '2-6'
        },
        scaredyshroom: {
            id: 'scaredyshroom',
            name: '胆小菇',
            cost: 25,
            cooldown: 7.5,
            hp: 300,
            damage: 20,
            attackInterval: 1.425,
            scaredDistance: 130,
            isNocturnal: true,
            desc: '远程发射孢子，但僵尸接近时会吓得缩入地下无法攻击',
            icon: 'assets/cards/card_scaredyshroom.png',
            anim: 'assets/plants/scaredyshroom.gif',
            sleepAnim: 'assets/plants/scaredyshroom_sleep.gif',
            hideAnim: 'assets/plants/scaredyshroom_hide.gif',
            bulletAnim: 'assets/projectiles/shroom_bullet.gif',
            splatAnim: 'assets/projectiles/shroom_splat.gif',
            unlockLevel: '2-7'
        },
        iceshroom: {
            id: 'iceshroom',
            name: '寒冰菇',
            cost: 75,
            cooldown: 50.0,
            hp: 300,
            damage: 20,
            freezeDuration: 4.0,
            slowDuration: 10.0,
            isNocturnal: true,
            desc: '瞬间冻结全场所有僵尸4秒并造成持续减速',
            icon: 'assets/cards/card_iceshroom.png',
            anim: 'assets/plants/iceshroom.gif',
            sleepAnim: 'assets/plants/iceshroom_sleep.gif',
            unlockLevel: '2-8'
        },
        doomshroom: {
            id: 'doomshroom',
            name: '毁灭菇',
            cost: 125,
            cooldown: 50.0,
            hp: 300,
            damage: 1800,
            isNocturnal: true,
            desc: '引发毁灭性核爆(1800伤害)，消灭巨幅范围内全部僵尸并留下弹坑',
            icon: 'assets/cards/card_doomshroom.png',
            anim: 'assets/plants/doomshroom.gif',
            sleepAnim: 'assets/plants/doomshroom_sleep.gif',
            boomAnim: 'assets/projectiles/cherry_boom.gif',
            unlockLevel: '2-9'
        },
        coffeebean: {
            id: 'coffeebean',
            name: '咖啡豆',
            cost: 75,
            cooldown: 7.5,
            hp: 300,
            desc: '种在白天睡觉的蘑菇上，唤醒它们使其正常工作',
            icon: 'assets/cards/card_coffeebean.png',
            anim: 'assets/plants/coffeebean.gif',
            eatAnim: 'assets/plants/coffeebean_eat.gif',
            isWakeOnly: true,
            unlockLevel: '2-5'
        },
        lilypad: {
            id: 'lilypad',
            name: '睡莲',
            cost: 25,
            cooldown: 7.5,
            hp: 300,
            isAquatic: true,
            desc: '种植在水面上，可承载一株非水生陆地植物',
            icon: 'assets/cards/card_lilypad.png',
            anim: 'assets/plants/lilypad.gif',
            unlockLevel: '3-1'
        },
        squash: {
            id: 'squash',
            name: '窝瓜',
            cost: 50,
            cooldown: 30.0,
            hp: 300,
            damage: 1800,
            desc: '发现前方或后方僵尸时跃起压扁 (1800伤害)',
            icon: 'assets/cards/card_squash.png',
            anim: 'assets/plants/squash.gif',
            attackAnim: 'assets/plants/squash_attack.gif',
            unlockLevel: '3-2'
        },
        threepeater: {
            id: 'threepeater',
            name: '三线射手',
            cost: 325,
            cooldown: 7.5,
            hp: 300,
            damage: 20,
            attackInterval: 1.425,
            desc: '一次射出三颗豌豆，覆盖自身及相邻两条航道',
            icon: 'assets/cards/card_threepeater.png',
            anim: 'assets/plants/threepeater.gif',
            bulletAnim: 'assets/projectiles/pea.gif',
            unlockLevel: '3-3'
        },
        jalapeno: {
            id: 'jalapeno',
            name: '火爆辣椒',
            cost: 125,
            cooldown: 50.0,
            hp: 300,
            damage: 1800,
            fuseTime: 0.9,
            desc: '引爆后焚烧整整一整行所有僵尸 (1800伤害)',
            icon: 'assets/cards/card_jalapeno.png',
            anim: 'assets/plants/jalapeno.gif',
            unlockLevel: '3-5'
        },
        spikeweed: {
            id: 'spikeweed',
            name: '地刺',
            cost: 100,
            cooldown: 7.5,
            hp: 300,
            damage: 20,
            attackInterval: 0.7,
            isFlat: true,
            desc: '贴地尖刺不会被普通僵尸啃食，持续扎伤经过僵尸并瞬间扎爆雪橇车与投石车轮胎！',
            icon: 'assets/cards/card_spikeweed.png',
            anim: 'assets/plants/spikeweed.gif',
            unlockLevel: '3-6'
        },
        torchwood: {
            id: 'torchwood',
            name: '火炬树桩',
            cost: 175,
            cooldown: 7.5,
            hp: 300,
            desc: '穿过的普通豌豆将化为烈焰火球，攻击力翻倍，并能微弱照亮周围迷雾！',
            icon: 'assets/cards/card_torchwood.png',
            anim: 'assets/plants/torchwood.gif',
            unlockLevel: '3-7'
        },
        tallnut: {
            id: 'tallnut',
            name: '高坚果',
            cost: 125,
            cooldown: 30.0,
            hp: 8000,
            isTall: true,
            desc: '身形高大、具有极高耐久 (8000 HP)，彻底拦截撑杆跳、海豚骑士与跳跳僵尸！',
            icon: 'assets/cards/card_tallnut.png',
            anim: 'assets/plants/tallnut.gif',
            crack1Anim: 'assets/plants/tallnut_cracked1.gif',
            crack2Anim: 'assets/plants/tallnut_cracked2.gif',
            crackThreshold1: 5333,
            crackThreshold2: 2666,
            unlockLevel: '3-8'
        },
        seashroom: {
            id: 'seashroom',
            name: '海蘑菇',
            cost: 0,
            cooldown: 30.0,
            hp: 300,
            damage: 20,
            attackInterval: 1.425,
            range: 300,
            isAquatic: true,
            isNocturnal: true,
            desc: '免费的水生喷射蘑菇，仅能在水中种植',
            icon: 'assets/cards/card_seashroom.png',
            anim: 'assets/plants/seashroom.gif',
            sleepAnim: 'assets/plants/seashroom_sleep.gif',
            unlockLevel: '4-1'
        },
        plantern: {
            id: 'plantern',
            name: '路灯花',
            cost: 25,
            cooldown: 30.0,
            hp: 300,
            lightRadius: 205,
            desc: '绽放温暖光芒照亮周围大片浓雾区域，让迷雾中的僵尸无所遁形！',
            icon: 'assets/cards/card_plantern.png',
            anim: 'assets/plants/plantern.gif',
            unlockLevel: '4-2'
        },
        cactus: {
            id: 'cactus',
            name: '仙人掌',
            cost: 125,
            cooldown: 7.5,
            hp: 300,
            damage: 20,
            attackInterval: 1.425,
            desc: '发射尖锐仙人掌刺，发现空中气球僵尸时会伸长身躯精准击破气球！',
            icon: 'assets/cards/card_cactus.png',
            anim: 'assets/plants/cactus.gif',
            bulletAnim: 'assets/projectiles/cactus_thorn.png',
            unlockLevel: '4-3'
        },
        blover: {
            id: 'blover',
            name: '三叶草',
            cost: 100,
            cooldown: 7.5,
            hp: 300,
            desc: '瞬间刮起狂风吹散全场浓雾18秒，并将空中所有气球僵尸直接吹飞出局！',
            icon: 'assets/cards/card_blover.png',
            anim: 'assets/plants/blover.gif',
            unlockLevel: '4-4'
        },
        splitpea: {
            id: 'splitpea',
            name: '裂荚射手',
            cost: 125,
            cooldown: 7.5,
            hp: 300,
            damage: 20,
            attackInterval: 1.425,
            desc: '前后双向警戒！向前发射单发豌豆，向后连续发射双发豌豆专克绕后矿工僵尸！',
            icon: 'assets/cards/card_splitpea.png',
            anim: 'assets/plants/splitpea.gif',
            bulletAnim: 'assets/projectiles/pea.gif',
            unlockLevel: '4-5'
        },
        starfruit: {
            id: 'starfruit',
            name: '星星果/杨桃',
            cost: 125,
            cooldown: 7.5,
            hp: 300,
            damage: 20,
            attackInterval: 1.425,
            desc: '向 5 个方向同时发射锋利飞星，全方位打击',
            icon: 'assets/cards/card_starfruit.png',
            anim: 'assets/plants/starfruit.gif',
            unlockLevel: '4-6'
        },
        pumpkin: {
            id: 'pumpkin',
            name: '南瓜头',
            cost: 125,
            cooldown: 30.0,
            hp: 4000,
            desc: '套在任何植物外层提供4000点坚固护甲防护',
            icon: 'assets/cards/card_pumpkin.png',
            anim: 'assets/plants/pumpkin.gif',
            crack1Anim: 'assets/plants/pumpkin_cracked1.gif',
            crack2Anim: 'assets/plants/pumpkin_cracked2.gif',
            crackThreshold1: 2666,
            crackThreshold2: 1333,
            unlockLevel: '4-7'
        },
        magnetshroom: {
            id: 'magnetshroom',
            name: '磁力菇',
            cost: 100,
            cooldown: 15.0,
            hp: 300,
            isNocturnal: true,
            desc: '强磁吸走铁桶、铁栅门、橄榄球头盔、小丑玩偶匣、矿工镐、跳跳杆与扶梯！',
            icon: 'assets/cards/card_magnetshroom.png',
            anim: 'assets/plants/magnetshroom.gif',
            cooldownAnim: 'assets/plants/magnetshroom_cooldown.gif',
            sleepAnim: 'assets/plants/magnetshroom_sleep.gif',
            unlockLevel: '4-8'
        },
        cabbagepult: {
            id: 'cabbagepult',
            name: '卷心菜投手',
            cost: 100,
            cooldown: 7.5,
            hp: 300,
            damage: 40,
            attackInterval: 2.85,
            desc: '高抛投掷卷心菜，不受屋顶斜坡阻挡(40伤害)',
            icon: 'assets/cards/card_cabbagepult.png',
            anim: 'assets/plants/cabbagepult.gif',
            attackAnim: 'assets/plants/cabbagepult_attack.gif',
            unlockLevel: '5-1'
        },
        flowerpot: {
            id: 'flowerpot',
            name: '花盆',
            cost: 25,
            cooldown: 7.5,
            hp: 300,
            isPot: true,
            desc: '种植在屋顶瓦片上，承载各种陆地植物',
            icon: 'assets/cards/card_flowerpot.png',
            anim: 'assets/plants/flowerpot.gif',
            unlockLevel: '5-1'
        },
        kernelpult: {
            id: 'kernelpult',
            name: '玉米投手',
            cost: 100,
            cooldown: 7.5,
            hp: 300,
            damage: 20,
            attackInterval: 2.85,
            desc: '投掷玉米粒，并有几率投掷黄油定身僵尸4秒！',
            icon: 'assets/cards/card_kernelpult.png',
            anim: 'assets/plants/kernelpult.gif',
            attackAnim: 'assets/plants/kernelpult_attack.gif',
            unlockLevel: '5-2'
        },
        garlic: {
            id: 'garlic',
            name: '大蒜',
            cost: 50,
            cooldown: 7.5,
            hp: 400,
            desc: '僵尸咬上一口会被辛辣呛到，立即转向相邻航道',
            icon: 'assets/cards/card_garlic.png',
            anim: 'assets/plants/garlic.gif',
            unlockLevel: '5-3'
        },
        melonpult: {
            id: 'melonpult',
            name: '西瓜投手',
            cost: 300,
            cooldown: 7.5,
            hp: 300,
            damage: 80,
            splashDamage: 26,
            attackInterval: 2.85,
            desc: '投掷沉重西瓜造成80点重击，并附带3x3群伤溅射！',
            icon: 'assets/cards/card_melonpult.png',
            anim: 'assets/plants/melonpult.gif',
            attackAnim: 'assets/plants/melonpult_attack.gif',
            unlockLevel: '5-4'
        },
        tanglekelp: {
            id: 'tanglekelp',
            name: '缠绕水草',
            cost: 25,
            cooldown: 30.0,
            hp: 300,
            isWaterPlant: true,
            desc: '直接种植在泳池水面，将靠近的第一只水中僵尸瞬间拖入水底秒杀！',
            icon: 'assets/cards/card_tanglekelp.png',
            anim: 'assets/plants/tanglekelp.gif',
            unlockLevel: '3-5'
        },
        gatlingpea: {
            id: 'gatlingpea',
            name: '机枪射手',
            cost: 250,
            cooldown: 30.0,
            hp: 300,
            damage: 20,
            attackInterval: 1.425,
            desc: '无尽强力紫卡！每次齐射连续喷吐 4 颗高速豌豆，配合火炬树桩毁天灭地！',
            icon: 'assets/cards/card_gatlingpea.png',
            anim: 'assets/plants/gatlingpea.gif',
            bulletAnim: 'assets/projectiles/pea.gif',
            unlockLevel: 'endless'
        },
        twinsunflower: {
            id: 'twinsunflower',
            name: '双子向日葵',
            cost: 150,
            cooldown: 30.0,
            hp: 300,
            produceInterval: 24.0,
            desc: '无尽经济核心！每次产出双倍阳光 (50☀️)，撑起后期重装防线！',
            icon: 'assets/cards/card_twinsunflower.png',
            anim: 'assets/plants/twinsunflower.gif',
            unlockLevel: 'endless'
        },
        gloomshroom: {
            id: 'gloomshroom',
            name: '忧郁菇',
            cost: 150,
            cooldown: 30.0,
            hp: 300,
            damage: 80,
            attackInterval: 1.9,
            isNocturnal: true,
            desc: '无尽近战神卡！向周围 3x3 八方向同时喷射四连穿透孢子群伤！',
            icon: 'assets/cards/card_gloomshroom.png',
            anim: 'assets/plants/gloomshroom.gif',
            attackAnim: 'assets/plants/gloomshroom_attack.gif',
            sleepAnim: 'assets/plants/gloomshroom_sleep.gif',
            unlockLevel: 'endless'
        },
        spikerock: {
            id: 'spikerock',
            name: '地刺王',
            cost: 125,
            cooldown: 30.0,
            hp: 900,
            damage: 40,
            attackInterval: 0.7,
            isFlat: true,
            desc: '无尽陆路磐石！双倍尖刺伤害，可连续扎爆多辆冰车/投石车并承受巨人重击！',
            icon: 'assets/cards/card_spikerock.png',
            anim: 'assets/plants/spikerock.gif',
            unlockLevel: 'endless'
        },
        umbrellaleaf: {
            id: 'umbrellaleaf',
            name: '叶子保护伞',
            cost: 100,
            cooldown: 7.5,
            hp: 300,
            desc: '撑开弹性巨叶，自动弹飞周围 3x3 范围内的蹦极僵尸与投石车篮球！',
            icon: 'assets/cards/card_umbrellaleaf.png',
            anim: 'assets/plants/umbrellaleaf.gif',
            blockAnim: 'assets/plants/umbrellaleaf_block.gif',
            unlockLevel: '5-6'
        },
        marigold: {
            id: 'marigold',
            name: '金盏花',
            cost: 50,
            cooldown: 30.0,
            hp: 300,
            produceInterval: 22.0,
            desc: '招财瑞草！定期结出闪闪发光的银币(+15☀️)与金币(+50☀️)！',
            icon: 'assets/cards/card_marigold.png',
            anim: 'assets/plants/marigold.gif',
            unlockLevel: '5-7'
        },
        cobcannon: {
            id: 'cobcannon',
            name: '玉米加农炮',
            cost: 500,
            cooldown: 50.0,
            hp: 300,
            damage: 1800,
            reloadTime: 32.0,
            isDoubleWide: true,
            desc: '终极重装神炮(占横向2格，可直接种或叠种在玉米投手上)！点击已装填炮身瞄准全屏任意位置发射毁天灭地玉米导弹！',
            icon: 'assets/cards/card_cobcannon.png',
            anim: 'assets/plants/cobcannon.gif',
            emptyAnim: 'assets/plants/cobcannon_empty.gif',
            fireAnim: 'assets/plants/cobcannon_fire.gif',
            unlockLevel: 'endless'
        },
        wintermelon: {
            id: 'wintermelon',
            name: '冰西瓜',
            cost: 400,
            cooldown: 30.0,
            hp: 300,
            damage: 80,
            splashDamage: 26,
            attackInterval: 2.85,
            desc: '无尽控场之王！投掷极寒冰瓜造成80点重击+3x3范围溅射与长达10秒群体冰冻减速！',
            icon: 'assets/cards/card_wintermelon.png',
            anim: 'assets/plants/wintermelon.gif',
            attackAnim: 'assets/plants/wintermelon_attack.gif',
            unlockLevel: 'endless'
        },
        cattail: {
            id: 'cattail',
            name: '香蒲',
            cost: 225,
            cooldown: 30.0,
            hp: 300,
            damage: 20,
            attackInterval: 1.425,
            isWaterPlant: true,
            desc: '泳池全屏制导神卡！每次连发2枚追踪红刺跨行索敌，并瞬间戳破气球僵尸！',
            icon: 'assets/cards/card_cattail.png',
            anim: 'assets/plants/cattail.gif',
            attackAnim: 'assets/plants/cattail_attack.gif',
            unlockLevel: 'endless'
        },
        goldmagnet: {
            id: 'goldmagnet',
            name: '吸金磁',
            cost: 50,
            cooldown: 30.0,
            hp: 300,
            desc: '全自动财富管家！无需手动点击，自动吸附收集全屏散落的阳光与金银钱币！',
            icon: 'assets/cards/card_goldmagnet.png',
            anim: 'assets/plants/goldmagnet.gif',
            pullAnim: 'assets/plants/goldmagnet_pull.gif',
            unlockLevel: 'endless'
        },
        imitater: {
            id: 'imitater',
            name: '模仿者',
            cost: 125,
            cooldown: 7.5,
            hp: 300,
            isImitater: true,
            desc: '百变默剧大师！自动复制卡槽左侧相邻植物(独立冷却CD)，实现双南瓜头、双樱桃炸弹或双玉米炮战术！',
            icon: 'assets/cards/card_imitater.png',
            anim: 'assets/plants/imitater.gif',
            spinAnim: 'assets/plants/imitater_spin.gif',
            unlockLevel: 'endless'
        }
    },

    // 原版僵尸参数 (HP, 护甲, 速度, 攻击力)
    // 官方原版标准：
    // - 普通僵尸/旗帜僵尸：本体 270 HP，受到 200 伤害（正好10颗豌豆）后掉头进入濒死状态（剩余 70 HP），流血或被击中死亡
    // - 路障僵尸：路障护甲 370 HP（承受约19颗豌豆破盾），本体 270 HP，总计 640 HP
    // - 铁桶僵尸：铁桶护甲 1100 HP（承受55颗豌豆破盾），本体 270 HP，总计 1370 HP
    zombies: {
        normal: {
            id: 'normal',
            name: '普通僵尸',
            hp: 270,
            armorHp: 0,
            headLossThreshold: 70,
            speed: 18,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 100,
            walkAnims: [
                'assets/zombies/zombie_walk.gif',
                'assets/zombies/zombie_walk2.gif',
                'assets/zombies/zombie_walk3.gif'
            ],
            attackAnim: 'assets/zombies/zombie_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/zombie_die.gif',
            lostHeadWalkAnim: 'assets/zombies/zombie_losthead_walk.gif',
            lostHeadAttackAnim: 'assets/zombies/zombie_losthead_attack.gif'
        },
        flag: {
            id: 'flag',
            name: '旗帜僵尸',
            hp: 270,
            armorHp: 0,
            headLossThreshold: 70,
            speed: 24,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 150,
            walkAnims: ['assets/zombies/flag_walk.gif'],
            attackAnim: 'assets/zombies/flag_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/zombie_die.gif'
        },
        conehead: {
            id: 'conehead',
            name: '路障僵尸',
            hp: 270,
            armorHp: 370,
            headLossThreshold: 70,
            speed: 18,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 250,
            hasShield: true,
            shieldType: 'cone',
            walkAnims: ['assets/zombies/conehead_walk.gif'],
            attackAnim: 'assets/zombies/conehead_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/zombie_die.gif'
        },
        buckethead: {
            id: 'buckethead',
            name: '铁桶僵尸',
            hp: 270,
            armorHp: 1100,
            headLossThreshold: 70,
            speed: 18,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 500,
            hasShield: true,
            shieldType: 'bucket',
            walkAnims: ['assets/zombies/buckethead_walk.gif'],
            attackAnim: 'assets/zombies/buckethead_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/zombie_die.gif'
        },
        newspaper: {
            id: 'newspaper',
            name: '读报僵尸',
            hp: 270,
            armorHp: 150,
            headLossThreshold: 70,
            speed: 18,
            rageSpeed: 52,
            dps: 100,
            rageDps: 165,
            rageBiteInterval: 0.15,
            enragePauseDuration: 1.35,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 300,
            hasShield: true,
            shieldType: 'newspaper',
            walkAnims: ['assets/zombies/newspaper_walk.gif'],
            attackAnim: 'assets/zombies/newspaper_attack.gif',
            lostPaperAnim: 'assets/zombies/newspaper_lost.gif',
            rageAnim: 'assets/zombies/newspaper_rage_walk.gif',
            rageAttackAnim: 'assets/zombies/newspaper_rage_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/newspaper_die.gif'
        },
        screendoor: {
            id: 'screendoor',
            name: '铁栅门僵尸',
            hp: 270,
            armorHp: 1100,
            headLossThreshold: 70,
            speed: 18,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 450,
            hasShield: true,
            shieldType: 'screendoor',
            walkAnims: ['assets/zombies/screendoor_walk.gif'],
            attackAnim: 'assets/zombies/screendoor_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/zombie_die.gif'
        },
        football: {
            id: 'football',
            name: '橄榄球僵尸',
            hp: 270,
            armorHp: 1400,
            headLossThreshold: 70,
            speed: 40,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 600,
            hasShield: true,
            shieldType: 'football',
            walkAnims: ['assets/zombies/football_walk.gif'],
            attackAnim: 'assets/zombies/football_attack.gif',
            noHelmetWalkAnim: 'assets/zombies/football_nohelmet_walk.gif',
            noHelmetAttackAnim: 'assets/zombies/football_nohelmet_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/football_die.gif'
        },
        dancing: {
            id: 'dancing',
            name: '舞王僵尸',
            hp: 500,
            armorHp: 0,
            headLossThreshold: 160,
            moonwalkSpeed: 48,
            speed: 16,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 550,
            moonwalkAnim: 'assets/zombies/dancing_moonwalk.gif',
            summonAnim: 'assets/zombies/dancing_summon.gif',
            walkAnims: ['assets/zombies/dancing_walk.gif'],
            attackAnim: 'assets/zombies/dancing_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/dancing_die.gif'
        },
        backup_dancer: {
            id: 'backup_dancer',
            name: '伴舞僵尸',
            hp: 270,
            armorHp: 0,
            headLossThreshold: 70,
            speed: 16,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 150,
            walkAnims: ['assets/zombies/backup_walk.gif'],
            attackAnim: 'assets/zombies/backup_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/backup_die.gif'
        },
        polevault: {
            id: 'polevault',
            name: '撑杆跳僵尸',
            hp: 500,
            headLossThreshold: 70,
            speed: 42,
            walkSpeed: 18,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 350,
            hasPole: true,
            runAnim: 'assets/zombies/polevault_run.gif',
            jumpAnim: 'assets/zombies/polevault_jump.gif',
            walkAnim: 'assets/zombies/polevault_walk.gif',
            attackAnim: 'assets/zombies/polevault_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/polevault_die.gif',
            walkAnims: ['assets/zombies/polevault_run.gif']
        },
        ducky: {
            id: 'ducky',
            name: '鸭子救生圈僵尸',
            hp: 270,
            armorHp: 0,
            headLossThreshold: 70,
            speed: 18,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 180,
            isAquatic: true,
            isWaterOnly: true,
            landWalkAnim: 'assets/zombies/ducky_land_walk.gif',
            walkAnims: ['assets/zombies/ducky_walk.gif'],
            attackAnim: 'assets/zombies/ducky_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/ducky_die.gif'
        },
        snorkel: {
            id: 'snorkel',
            name: '潜水僵尸',
            hp: 270,
            armorHp: 0,
            headLossThreshold: 70,
            speed: 20,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 320,
            isAquatic: true,
            isWaterOnly: true,
            landWalkAnim: 'assets/zombies/snorkel_land_walk.gif',
            walkAnims: ['assets/zombies/snorkel_swim.gif'],
            attackAnim: 'assets/zombies/snorkel_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/snorkel_die.gif'
        },
        dolphin: {
            id: 'dolphin',
            name: '海豚骑士僵尸',
            hp: 500,
            armorHp: 0,
            headLossThreshold: 70,
            speed: 48,
            landSpeed: 20,
            walkSpeed: 18,
            swimSpeed: 18,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 480,
            isAquatic: true,
            isWaterOnly: true,
            hasDolphin: true,
            landWalkAnim: 'assets/zombies/dolphin_land_walk.gif',
            rideAnim: 'assets/zombies/dolphin_ride.gif',
            jumpAnim: 'assets/zombies/dolphin_jump.gif',
            swimAnim: 'assets/zombies/dolphin_swim.gif',
            walkAnims: ['assets/zombies/dolphin_ride.gif'],
            attackAnim: 'assets/zombies/dolphin_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/dolphin_die.gif'
        },
        zomboni: {
            id: 'zomboni',
            name: '雪橇车僵尸',
            hp: 1150,
            armorHp: 0,
            headLossThreshold: 0,
            speed: 22,
            dps: 999,
            biteInterval: 0.2,
            biteDamage: 999,
            score: 700,
            isVehicle: true,
            walkAnims: ['assets/zombies/zomboni_drive.gif'],
            attackAnim: 'assets/zombies/zomboni_drive.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/zomboni_die.gif'
        },
        jackinthebox: {
            id: 'jackinthebox',
            name: '玩偶匣小丑僵尸',
            hp: 500,
            armorHp: 80,
            headLossThreshold: 70,
            speed: 34,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 520,
            hasShield: true,
            shieldType: 'jackbox',
            openAnim: 'assets/zombies/jack_open.gif',
            walkAnims: ['assets/zombies/jack_walk.gif'],
            attackAnim: 'assets/zombies/jack_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/jack_die.gif'
        },
        balloon: {
            id: 'balloon',
            name: '气球僵尸',
            hp: 270,
            armorHp: 0,
            headLossThreshold: 70,
            speed: 28,
            walkSpeed: 18,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 420,
            isFlying: true,
            walkAnims: ['assets/zombies/balloon_fly.gif'],
            groundWalkAnim: 'assets/zombies/balloon_walk.gif',
            attackAnim: 'assets/zombies/balloon_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/balloon_die.gif'
        },
        digger: {
            id: 'digger',
            name: '矿工僵尸',
            hp: 370,
            armorHp: 100,
            headLossThreshold: 70,
            digSpeed: 54,
            speed: 18,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 480,
            hasShield: true,
            shieldType: 'pickaxe',
            digAnim: 'assets/zombies/digger_dig.gif',
            surfacedWalkAnim: 'assets/zombies/digger_walk.gif',
            noShieldWalkAnim: 'assets/zombies/digger_nopick_walk.gif',
            noShieldAttackAnim: 'assets/zombies/digger_nopick_attack.gif',
            walkAnims: ['assets/zombies/digger_dig.gif'],
            attackAnim: 'assets/zombies/digger_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/digger_die.gif'
        },
        pogo: {
            id: 'pogo',
            name: '跳跳僵尸',
            hp: 500,
            armorHp: 80,
            headLossThreshold: 70,
            speed: 36,
            walkSpeed: 18,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 500,
            hasShield: true,
            shieldType: 'pogo',
            walkAnims: ['assets/zombies/pogo_bounce.gif'],
            noShieldWalkAnim: 'assets/zombies/pogo_walk.gif',
            noShieldAttackAnim: 'assets/zombies/pogo_attack.gif',
            attackAnim: 'assets/zombies/pogo_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/pogo_die.gif'
        },
        bungee: {
            id: 'bungee',
            name: '蹦极僵尸',
            hp: 450,
            armorHp: 0,
            headLossThreshold: 0,
            speed: 0,
            dps: 0,
            biteInterval: 1.0,
            biteDamage: 0,
            score: 400,
            walkAnims: ['assets/zombies/bungee_drop.gif'],
            grabAnim: 'assets/zombies/bungee_grab.gif',
            attackAnim: 'assets/zombies/bungee_grab.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/zombie_die.gif'
        },
        ladder: {
            id: 'ladder',
            name: '扶梯僵尸',
            hp: 500,
            armorHp: 500,
            headLossThreshold: 70,
            speed: 36,
            walkSpeed: 18,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 580,
            hasShield: true,
            shieldType: 'ladder',
            walkAnims: ['assets/zombies/ladder_walk.gif'],
            attackAnim: 'assets/zombies/ladder_attack.gif',
            noShieldWalkAnim: 'assets/zombies/ladder_noladder_walk.gif',
            noShieldAttackAnim: 'assets/zombies/ladder_noladder_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/ladder_die.gif'
        },
        catapult: {
            id: 'catapult',
            name: '投石车僵尸',
            hp: 850,
            armorHp: 0,
            headLossThreshold: 0,
            speed: 22,
            dps: 999,
            biteInterval: 0.2,
            biteDamage: 999,
            score: 720,
            isVehicle: true,
            walkAnims: ['assets/zombies/catapult_drive.gif'],
            shootAnim: 'assets/zombies/catapult_shoot.gif',
            attackAnim: 'assets/zombies/catapult_shoot.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/catapult_die.gif'
        },
        gargantuar: {
            id: 'gargantuar',
            name: '伽刚特尔巨人',
            hp: 3000,
            armorHp: 0,
            headLossThreshold: 0,
            speed: 14,
            dps: 1800,
            biteInterval: 1.15,
            biteDamage: 1800,
            score: 1500,
            walkAnims: ['assets/zombies/gargantuar_walk.gif'],
            attackAnim: 'assets/zombies/gargantuar_smash.gif',
            noImpWalkAnim: 'assets/zombies/gargantuar_noimp_walk.gif',
            noImpAttackAnim: 'assets/zombies/gargantuar_noimp_smash.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/gargantuar_die.gif'
        },
        imp: {
            id: 'imp',
            name: '小鬼僵尸',
            hp: 190,
            armorHp: 0,
            headLossThreshold: 40,
            speed: 34,
            dps: 100,
            biteInterval: 0.25,
            biteDamage: 25,
            score: 180,
            walkAnims: ['assets/zombies/imp_walk.gif'],
            attackAnim: 'assets/zombies/imp_attack.gif',
            headAnim: 'assets/zombies/zombie_head.gif',
            dieAnim: 'assets/zombies/imp_die.gif',
            charredAnim: 'assets/zombies/imp_charred.gif'
        }
    },

    // 原版 1-1 至 1-10 关卡规格推进树 (使用 900x600 无拉伸视窗)
    // 官方节奏：第一波僵尸有充裕的备战期（20~25s），后续波次在僵尸击溃后经 5 秒休整或最大延时触发
    levels: {
        '1-1': {
            id: '1-1',
            world: 1,
            title: '第 1-1 关：单轨初探',
            bg: 'assets/backgrounds/day_1row_viewport.jpg',
            activeRows: [2], // 仅开放中间第3行 (row 2)
            allowedPlants: ['peashooter'],
            rewardPlant: 'sunflower',
            rewardText: '恭喜解锁：向日葵！每隔24秒生产阳光！',
            waves: [
                { delay: 25, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 25, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 25, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 28, isFlag: true, zombies: [{ type: 'normal', row: 2 }, { type: 'normal', row: 2 }] }
            ]
        },
        '1-2': {
            id: '1-2',
            world: 1,
            title: '第 1-2 关：三路开花',
            bg: 'assets/backgrounds/day_3row_viewport.jpg',
            activeRows: [1, 2, 3], // 开放中间三行 (第2、3、4行)
            allowedPlants: ['peashooter', 'sunflower'],
            rewardPlant: 'cherrybomb',
            rewardText: '恭喜解锁：樱桃炸弹！瞬间引爆3x3九宫格！',
            waves: [
                { delay: 22, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 25, zombies: [{ type: 'normal', row: 1 }] },
                { delay: 25, zombies: [{ type: 'normal', row: 3 }] },
                { delay: 24, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 24, zombies: [{ type: 'normal', row: 1 }] },
                { delay: 26, isFlag: true, zombies: [{ type: 'flag', row: 2 }, { type: 'normal', row: 1 }, { type: 'normal', row: 3 }] }
            ]
        },
        '1-3': {
            id: '1-3',
            world: 1,
            title: '第 1-3 关：五路全开·路障初现',
            bg: 'assets/backgrounds/day_5row_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['peashooter', 'sunflower', 'cherrybomb'],
            rewardPlant: 'wallnut',
            rewardText: '恭喜解锁：坚果墙！超高生命值为你抵挡千军万马！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 24, zombies: [{ type: 'normal', row: 0 }] },
                { delay: 25, zombies: [{ type: 'conehead', row: 3 }] },
                { delay: 24, zombies: [{ type: 'normal', row: 4 }] },
                { delay: 25, zombies: [{ type: 'conehead', row: 1 }] },
                { delay: 24, zombies: [{ type: 'normal', row: 2 }, { type: 'normal', row: 0 }] },
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'conehead', row: 1 },
                    { type: 'conehead', row: 3 },
                    { type: 'normal', row: 0 },
                    { type: 'normal', row: 4 }
                ]}
            ]
        },
        '1-4': {
            id: '1-4',
            world: 1,
            title: '第 1-4 关：铜墙铁壁',
            bg: 'assets/backgrounds/day_5row_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['peashooter', 'sunflower', 'cherrybomb', 'wallnut'],
            rewardPlant: 'shovel',
            rewardText: '恭喜解锁：园艺铲子！可以自由挖除不需要的植物！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 1 }] },
                { delay: 24, zombies: [{ type: 'conehead', row: 2 }] },
                { delay: 24, zombies: [{ type: 'normal', row: 4 }, { type: 'normal', row: 0 }] },
                { delay: 24, zombies: [{ type: 'conehead', row: 3 }] },
                { delay: 24, zombies: [{ type: 'normal', row: 2 }, { type: 'conehead', row: 1 }] },
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'conehead', row: 0 },
                    { type: 'conehead', row: 4 },
                    { type: 'normal', row: 1 },
                    { type: 'normal', row: 3 }
                ]}
            ]
        },
        '1-5': {
            id: '1-5',
            world: 1,
            title: '第 1-5 关：坚果保龄球特别试炼',
            bg: 'assets/backgrounds/day_5row_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            isConveyorBelt: true,
            isBowling: true,
            bowlingBoundaryCol: 2,
            conveyorCards: ['bowling_nut', 'bowling_rednut'],
            allowedPlants: ['bowling_nut', 'bowling_rednut'],
            rewardPlant: 'potatomine',
            rewardText: '恭喜通关坚果保龄球！获得全新防守神器：土豆地雷！',
            waves: [
                { delay: 10, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 12, zombies: [{ type: 'conehead', row: 1 }] },
                { delay: 14, zombies: [{ type: 'normal', row: 3 }, { type: 'polevault', row: 4 }] },
                { delay: 15, zombies: [{ type: 'conehead', row: 0 }, { type: 'buckethead', row: 2 }] },
                { delay: 16, zombies: [{ type: 'buckethead', row: 1 }, { type: 'conehead', row: 4 }] },
                { delay: 20, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 0 },
                    { type: 'conehead', row: 1 },
                    { type: 'conehead', row: 3 },
                    { type: 'buckethead', row: 4 },
                    { type: 'normal', row: 2 }
                ]},
                { delay: 22, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 0 },
                    { type: 'buckethead', row: 1 },
                    { type: 'conehead', row: 2 },
                    { type: 'buckethead', row: 3 },
                    { type: 'conehead', row: 4 },
                    { type: 'normal', row: 0 },
                    { type: 'normal', row: 2 },
                    { type: 'normal', row: 4 }
                ]}
            ]
        },
        '1-6': {
            id: '1-6',
            world: 1,
            title: '第 1-6 关：埋伏奇袭 (撑杆跳僵尸登场)',
            bg: 'assets/backgrounds/day_5row_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['peashooter', 'sunflower', 'cherrybomb', 'wallnut', 'potatomine'],
            rewardPlant: 'snowpea',
            rewardText: '恭喜解锁：雪花豌豆！发射寒冰豌豆造成50%移速减速！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 3 }] },
                { delay: 24, zombies: [{ type: 'normal', row: 0 }] },
                { delay: 25, zombies: [{ type: 'polevault', row: 2 }] },
                { delay: 24, zombies: [{ type: 'normal', row: 4 }, { type: 'conehead', row: 1 }] },
                { delay: 25, zombies: [{ type: 'polevault', row: 3 }] },
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'polevault', row: 1 },
                    { type: 'conehead', row: 0 },
                    { type: 'conehead', row: 2 },
                    { type: 'conehead', row: 4 },
                    { type: 'normal', row: 3 }
                ]}
            ]
        },
        '1-7': {
            id: '1-7',
            world: 1,
            title: '第 1-7 关：重装铁桶的震慑',
            bg: 'assets/backgrounds/day_5row_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['peashooter', 'sunflower', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea'],
            rewardPlant: 'chomper',
            rewardText: '恭喜解锁：大嘴花！大口吞掉整只僵尸！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 24, zombies: [{ type: 'conehead', row: 1 }] },
                { delay: 25, zombies: [{ type: 'buckethead', row: 3 }] },
                { delay: 24, zombies: [{ type: 'normal', row: 0 }, { type: 'conehead', row: 4 }] },
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 1 },
                    { type: 'conehead', row: 3 },
                    { type: 'normal', row: 0 }
                ]},
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 2 },
                    { type: 'buckethead', row: 4 },
                    { type: 'conehead', row: 0 },
                    { type: 'normal', row: 1 },
                    { type: 'normal', row: 3 }
                ]}
            ]
        },
        '1-8': {
            id: '1-8',
            world: 1,
            title: '第 1-8 关：巨兽巨口',
            bg: 'assets/backgrounds/day_5row_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['peashooter', 'sunflower', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper'],
            rewardPlant: 'repeater',
            rewardText: '恭喜解锁：双发射手！每次射出两颗豌豆，双倍爆发火力！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 4 }] },
                { delay: 24, zombies: [{ type: 'conehead', row: 2 }] },
                { delay: 25, zombies: [{ type: 'buckethead', row: 0 }] },
                { delay: 24, zombies: [{ type: 'conehead', row: 3 }, { type: 'normal', row: 1 }] },
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 3 },
                    { type: 'conehead', row: 1 },
                    { type: 'normal', row: 4 }
                ]},
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 0 },
                    { type: 'buckethead', row: 4 },
                    { type: 'conehead', row: 2 },
                    { type: 'normal', row: 1 },
                    { type: 'normal', row: 3 }
                ]}
            ]
        },
        '1-9': {
            id: '1-9',
            world: 1,
            title: '第 1-9 关：决战前夕·军团压境',
            bg: 'assets/backgrounds/day_5row_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['peashooter', 'sunflower', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater'],
            rewardPlant: 'note',
            rewardText: '发现了戴夫留下的信件：“僵尸大军即将发起最终总攻，守住后院！”',
            waves: [
                { delay: 18, zombies: [{ type: 'normal', row: 1 }] },
                { delay: 22, zombies: [{ type: 'conehead', row: 3 }] },
                { delay: 24, zombies: [{ type: 'buckethead', row: 2 }] },
                { delay: 24, zombies: [{ type: 'conehead', row: 0 }, { type: 'conehead', row: 4 }] },
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 1 },
                    { type: 'buckethead', row: 3 },
                    { type: 'conehead', row: 0 },
                    { type: 'normal', row: 4 }
                ]},
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 0 },
                    { type: 'buckethead', row: 2 },
                    { type: 'buckethead', row: 4 },
                    { type: 'conehead', row: 1 },
                    { type: 'conehead', row: 3 }
                ]}
            ]
        },
        '1-10': {
            id: '1-10',
            world: 1,
            title: '第 1-10 关：后院大决战 (传送带终极试炼)',
            bg: 'assets/backgrounds/day_5row_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            isConveyorBelt: true,
            conveyorCards: ['peashooter', 'repeater', 'snowpea', 'wallnut', 'potatomine', 'cherrybomb', 'chomper'],
            allowedPlants: ['peashooter', 'repeater', 'snowpea', 'wallnut', 'potatomine', 'cherrybomb', 'chomper'],
            rewardPlant: 'puffshroom',
            rewardText: '🎉 击退白天僵尸总攻！获得夜行植物：小喷菇（0阳光免费）！黑夜即将降临！',
            waves: [
                { delay: 15, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 18, zombies: [{ type: 'conehead', row: 1 }] },
                { delay: 20, zombies: [{ type: 'normal', row: 3 }, { type: 'conehead', row: 4 }] },
                { delay: 22, zombies: [{ type: 'buckethead', row: 0 }] },
                { delay: 24, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 1 },
                    { type: 'conehead', row: 3 },
                    { type: 'conehead', row: 0 },
                    { type: 'normal', row: 4 }
                ]},
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 2 },
                    { type: 'buckethead', row: 4 },
                    { type: 'conehead', row: 1 },
                    { type: 'conehead', row: 3 },
                    { type: 'normal', row: 0 }
                ]},
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 0 },
                    { type: 'buckethead', row: 1 },
                    { type: 'buckethead', row: 2 },
                    { type: 'buckethead', row: 3 },
                    { type: 'buckethead', row: 4 }
                ]}
            ]
        },
        '2-1': {
            id: '2-1',
            world: 2,
            initialSun: 50,
            title: '第 2-1 关：黑夜初临 (读报僵尸登场)',
            bg: 'assets/backgrounds/night_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            tombstones: [
                { row: 0, col: 7 }, { row: 1, col: 5 },
                { row: 3, col: 6 }, { row: 4, col: 8 }
            ],
            allowedPlants: ['puffshroom', 'sunflower', 'peashooter', 'wallnut', 'potatomine', 'cherrybomb', 'snowpea', 'repeater'],
            selectablePlants: ['puffshroom', 'sunflower', 'peashooter', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater'],
            rewardPlant: 'sunshroom',
            rewardText: '恭喜解锁：阳光菇！只需25阳光，黑夜高性价比产日神器！',
            waves: [
                { delay: 22, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 22, zombies: [{ type: 'normal', row: 1 }] },
                { delay: 22, zombies: [{ type: 'newspaper', row: 3 }] },
                { delay: 24, zombies: [{ type: 'normal', row: 0 }, { type: 'normal', row: 4 }] },
                { delay: 24, zombies: [{ type: 'newspaper', row: 2 }] },
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'newspaper', row: 1 },
                    { type: 'normal', row: 3 },
                    { type: 'normal', row: 0 },
                    { type: 'normal', row: 4 }
                ]}
            ]
        },
        '2-2': {
            id: '2-2',
            world: 2,
            initialSun: 50,
            title: '第 2-2 关：微光蓄势 (阳光菇登场)',
            bg: 'assets/backgrounds/night_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            tombstones: [
                { row: 0, col: 6 }, { row: 1, col: 8 },
                { row: 2, col: 5 }, { row: 3, col: 7 }, { row: 4, col: 6 }
            ],
            allowedPlants: ['puffshroom', 'sunshroom', 'peashooter', 'wallnut', 'potatomine', 'cherrybomb', 'snowpea', 'repeater'],
            selectablePlants: ['puffshroom', 'sunshroom', 'sunflower', 'peashooter', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater'],
            rewardPlant: 'fumeshroom',
            rewardText: '恭喜解锁：大喷菇！喷射穿透性孢子云雾，穿透铁栅门与报纸！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 1 }] },
                { delay: 22, zombies: [{ type: 'conehead', row: 3 }] },
                { delay: 22, zombies: [{ type: 'newspaper', row: 2 }, { type: 'normal', row: 0 }] },
                { delay: 24, zombies: [{ type: 'conehead', row: 4 }, { type: 'newspaper', row: 1 }] },
                { delay: 25, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'conehead', row: 0 },
                    { type: 'newspaper', row: 3 },
                    { type: 'normal', row: 1 }
                ]},
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 4 },
                    { type: 'newspaper', row: 0 },
                    { type: 'conehead', row: 2 },
                    { type: 'conehead', row: 3 }
                ]}
            ]
        },
        '2-3': {
            id: '2-3',
            world: 2,
            initialSun: 50,
            title: '第 2-3 关：穿透迷雾 (铁栅门僵尸登场)',
            bg: 'assets/backgrounds/night_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            tombstones: [
                { row: 0, col: 7 }, { row: 1, col: 5 }, { row: 2, col: 8 },
                { row: 3, col: 6 }, { row: 4, col: 7 }, { row: 2, col: 5 }
            ],
            allowedPlants: ['puffshroom', 'sunshroom', 'fumeshroom', 'wallnut', 'potatomine', 'cherrybomb', 'snowpea', 'chomper'],
            selectablePlants: ['puffshroom', 'sunshroom', 'fumeshroom', 'sunflower', 'peashooter', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater'],
            rewardPlant: 'gravebuster',
            rewardText: '恭喜解锁：墓碑吞噬者！种在墓碑上啃掉墓碑，防止大波僵尸破土突袭！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 3 }] },
                { delay: 22, zombies: [{ type: 'screendoor', row: 2 }] },
                { delay: 22, zombies: [{ type: 'newspaper', row: 1 }, { type: 'conehead', row: 4 }] },
                { delay: 24, zombies: [{ type: 'screendoor', row: 0 }, { type: 'conehead', row: 3 }] },
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'screendoor', row: 1 },
                    { type: 'screendoor', row: 3 },
                    { type: 'conehead', row: 2 },
                    { type: 'newspaper', row: 4 }
                ]}
            ]
        },
        '2-4': {
            id: '2-4',
            world: 2,
            initialSun: 50,
            title: '第 2-4 关：墓碑净化 (撑杆与铁栅门协攻)',
            bg: 'assets/backgrounds/night_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            tombstones: [
                { row: 0, col: 6 }, { row: 0, col: 8 }, { row: 1, col: 5 },
                { row: 2, col: 7 }, { row: 3, col: 6 }, { row: 4, col: 5 }, { row: 4, col: 8 }
            ],
            allowedPlants: ['puffshroom', 'sunshroom', 'fumeshroom', 'gravebuster', 'wallnut', 'potatomine', 'cherrybomb', 'chomper'],
            selectablePlants: ['puffshroom', 'sunshroom', 'fumeshroom', 'gravebuster', 'sunflower', 'peashooter', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater'],
            rewardPlant: 'coffeebean',
            rewardText: '恭喜解锁：咖啡豆！可在白天关卡唤醒睡眠中的夜行蘑菇！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 0 }] },
                { delay: 22, zombies: [{ type: 'polevault', row: 2 }] },
                { delay: 22, zombies: [{ type: 'screendoor', row: 3 }, { type: 'conehead', row: 1 }] },
                { delay: 24, zombies: [{ type: 'polevault', row: 4 }, { type: 'newspaper', row: 0 }] },
                { delay: 25, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'polevault', row: 1 },
                    { type: 'screendoor', row: 3 },
                    { type: 'conehead', row: 4 }
                ]},
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 1 },
                    { type: 'screendoor', row: 4 },
                    { type: 'polevault', row: 2 },
                    { type: 'newspaper', row: 3 },
                    { type: 'conehead', row: 0 }
                ]}
            ]
        },
        '2-5': {
            id: '2-5',
            world: 2,
            initialSun: 75,
            isWhackAZombie: true,
            title: '第 2-5 关：锤僵尸特别试炼 (Whack a Zombie)',
            bg: 'assets/backgrounds/night_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            tombstones: [
                { row: 0, col: 5 }, { row: 0, col: 8 },
                { row: 1, col: 6 }, { row: 2, col: 4 },
                { row: 2, col: 7 }, { row: 3, col: 5 },
                { row: 3, col: 8 }, { row: 4, col: 6 }
            ],
            allowedPlants: ['gravebuster', 'iceshroom', 'potatomine'],
            rewardPlant: 'hypnoshroom',
            rewardText: '恭喜通关锤僵尸试炼！解锁奇策植物：魅惑菇！让啃食它的僵尸倒戈反击！',
            waves: [
                { delay: 4, isGraveWave: true, zombies: [{ type: 'normal', row: 2 }, { type: 'normal', row: 0 }] },
                { delay: 7, isGraveWave: true, zombies: [{ type: 'normal', row: 1 }, { type: 'conehead', row: 3 }] },
                { delay: 8, isGraveWave: true, zombies: [{ type: 'normal', row: 4 }, { type: 'conehead', row: 2 }, { type: 'normal', row: 0 }] },
                { delay: 9, isGraveWave: true, zombies: [{ type: 'conehead', row: 1 }, { type: 'buckethead', row: 3 }, { type: 'normal', row: 2 }] },
                { delay: 10, isFlag: true, isGraveWave: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'conehead', row: 0 },
                    { type: 'buckethead', row: 2 },
                    { type: 'conehead', row: 4 },
                    { type: 'normal', row: 1 },
                    { type: 'normal', row: 3 }
                ]},
                { delay: 11, isFlag: true, isGraveWave: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'buckethead', row: 1 },
                    { type: 'buckethead', row: 3 },
                    { type: 'conehead', row: 0 },
                    { type: 'conehead', row: 2 },
                    { type: 'conehead', row: 4 },
                    { type: 'normal', row: 1 },
                    { type: 'normal', row: 4 }
                ]}
            ]
        },
        '2-6': {
            id: '2-6',
            world: 2,
            initialSun: 50,
            title: '第 2-6 关：心智魅惑 (橄榄球僵尸登场)',
            bg: 'assets/backgrounds/night_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            tombstones: [
                { row: 0, col: 6 }, { row: 1, col: 7 }, { row: 2, col: 5 },
                { row: 2, col: 8 }, { row: 3, col: 6 }, { row: 4, col: 7 }
            ],
            allowedPlants: ['puffshroom', 'sunshroom', 'fumeshroom', 'gravebuster', 'hypnoshroom', 'wallnut', 'potatomine', 'cherrybomb'],
            selectablePlants: ['puffshroom', 'sunshroom', 'fumeshroom', 'gravebuster', 'hypnoshroom', 'coffeebean', 'sunflower', 'peashooter', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater'],
            rewardPlant: 'scaredyshroom',
            rewardText: '恭喜解锁：胆小菇！只需25阳光的超远距离狙击蘑菇！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 22, zombies: [{ type: 'conehead', row: 0 }] },
                { delay: 24, zombies: [{ type: 'football', row: 1 }] },
                { delay: 24, zombies: [{ type: 'newspaper', row: 3 }, { type: 'conehead', row: 4 }] },
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'football', row: 1 },
                    { type: 'football', row: 3 },
                    { type: 'conehead', row: 0 },
                    { type: 'newspaper', row: 4 }
                ]}
            ]
        },
        '2-7': {
            id: '2-7',
            world: 2,
            initialSun: 50,
            title: '第 2-7 关：暗夜狙击 (胆小菇远距防线)',
            bg: 'assets/backgrounds/night_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            tombstones: [
                { row: 0, col: 7 }, { row: 1, col: 5 }, { row: 1, col: 8 },
                { row: 2, col: 6 }, { row: 3, col: 7 }, { row: 4, col: 5 }, { row: 4, col: 8 }
            ],
            allowedPlants: ['puffshroom', 'sunshroom', 'fumeshroom', 'gravebuster', 'hypnoshroom', 'scaredyshroom', 'wallnut', 'cherrybomb'],
            selectablePlants: ['puffshroom', 'sunshroom', 'fumeshroom', 'gravebuster', 'hypnoshroom', 'scaredyshroom', 'coffeebean', 'sunflower', 'peashooter', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater'],
            rewardPlant: 'iceshroom',
            rewardText: '恭喜解锁：寒冰菇！瞬间极冻全屏所有僵尸4秒并持续减速！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 1 }] },
                { delay: 22, zombies: [{ type: 'screendoor', row: 2 }] },
                { delay: 22, zombies: [{ type: 'football', row: 3 }] },
                { delay: 24, zombies: [{ type: 'screendoor', row: 0 }, { type: 'conehead', row: 4 }] },
                { delay: 25, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'football', row: 0 },
                    { type: 'screendoor', row: 2 },
                    { type: 'conehead', row: 4 }
                ]},
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'football', row: 1 },
                    { type: 'football', row: 4 },
                    { type: 'screendoor', row: 3 },
                    { type: 'conehead', row: 0 },
                    { type: 'normal', row: 2 }
                ]}
            ]
        },
        '2-8': {
            id: '2-8',
            world: 2,
            initialSun: 50,
            title: '第 2-8 关：午夜迪斯科 (舞王僵尸登场)',
            bg: 'assets/backgrounds/night_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            tombstones: [
                { row: 0, col: 6 }, { row: 0, col: 8 }, { row: 1, col: 7 },
                { row: 2, col: 5 }, { row: 3, col: 6 }, { row: 3, col: 8 }, { row: 4, col: 7 }
            ],
            allowedPlants: ['puffshroom', 'sunshroom', 'fumeshroom', 'gravebuster', 'hypnoshroom', 'scaredyshroom', 'iceshroom', 'wallnut'],
            selectablePlants: ['puffshroom', 'sunshroom', 'fumeshroom', 'gravebuster', 'hypnoshroom', 'scaredyshroom', 'iceshroom', 'coffeebean', 'sunflower', 'peashooter', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater'],
            rewardPlant: 'doomshroom',
            rewardText: '恭喜解锁：毁灭菇！超巨幅范围毁灭核爆(1800伤害)，扫荡一切！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 4 }] },
                { delay: 22, zombies: [{ type: 'conehead', row: 1 }] },
                { delay: 24, zombies: [{ type: 'dancing', row: 2 }] },
                { delay: 24, zombies: [{ type: 'newspaper', row: 0 }, { type: 'conehead', row: 3 }] },
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'dancing', row: 1 },
                    { type: 'dancing', row: 3 },
                    { type: 'buckethead', row: 0 },
                    { type: 'conehead', row: 4 }
                ]}
            ]
        },
        '2-9': {
            id: '2-9',
            world: 2,
            initialSun: 50,
            title: '第 2-9 关：终极核爆 (黑夜全军压境)',
            bg: 'assets/backgrounds/night_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            tombstones: [
                { row: 0, col: 5 }, { row: 0, col: 7 }, { row: 1, col: 6 }, { row: 1, col: 8 },
                { row: 2, col: 5 }, { row: 2, col: 7 }, { row: 3, col: 6 }, { row: 4, col: 5 }, { row: 4, col: 8 }
            ],
            allowedPlants: ['puffshroom', 'sunshroom', 'fumeshroom', 'gravebuster', 'hypnoshroom', 'scaredyshroom', 'iceshroom', 'doomshroom'],
            selectablePlants: ['puffshroom', 'sunshroom', 'fumeshroom', 'gravebuster', 'hypnoshroom', 'scaredyshroom', 'iceshroom', 'doomshroom', 'coffeebean', 'sunflower', 'peashooter', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater'],
            rewardPlant: 'note',
            rewardText: '缴获僵尸遗落便签：【喂，我们在你家后院泳池开派对，不见不散！——僵尸们】',
            waves: [
                { delay: 18, zombies: [{ type: 'newspaper', row: 2 }] },
                { delay: 20, zombies: [{ type: 'screendoor', row: 1 }] },
                { delay: 22, zombies: [{ type: 'dancing', row: 3 }, { type: 'polevault', row: 0 }] },
                { delay: 24, zombies: [{ type: 'football', row: 4 }, { type: 'screendoor', row: 2 }] },
                { delay: 25, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'dancing', row: 2 },
                    { type: 'screendoor', row: 0 },
                    { type: 'football', row: 4 }
                ]},
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'dancing', row: 1 },
                    { type: 'football', row: 3 },
                    { type: 'screendoor', row: 0 },
                    { type: 'buckethead', row: 4 },
                    { type: 'newspaper', row: 2 }
                ]}
            ]
        },
        '2-10': {
            id: '2-10',
            world: 2,
            title: '第 2-10 关：黑夜大决战 (墓地传送带总攻)',
            bg: 'assets/backgrounds/night_viewport.jpg',
            activeRows: [0, 1, 2, 3, 4],
            tombstones: [
                { row: 0, col: 4 }, { row: 0, col: 7 },
                { row: 1, col: 5 }, { row: 1, col: 8 },
                { row: 2, col: 4 }, { row: 2, col: 6 }, { row: 2, col: 8 },
                { row: 3, col: 5 }, { row: 3, col: 7 },
                { row: 4, col: 4 }, { row: 4, col: 6 }
            ],
            isConveyorBelt: true,
            conveyorCards: ['puffshroom', 'fumeshroom', 'scaredyshroom', 'hypnoshroom', 'iceshroom', 'doomshroom', 'gravebuster', 'puffshroom', 'fumeshroom'],
            allowedPlants: ['puffshroom', 'fumeshroom', 'scaredyshroom', 'hypnoshroom', 'iceshroom', 'doomshroom', 'gravebuster'],
            rewardPlant: 'lilypad',
            rewardText: '🎉 彻底击退黑夜总攻！解锁水生植物：【睡莲】！后院泳池即将开启！🏆',
            waves: [
                { delay: 14, zombies: [{ type: 'normal', row: 2 }, { type: 'newspaper', row: 0 }] },
                { delay: 17, zombies: [{ type: 'screendoor', row: 1 }, { type: 'conehead', row: 3 }] },
                { delay: 19, zombies: [{ type: 'dancing', row: 2 }] },
                { delay: 20, zombies: [{ type: 'football', row: 4 }, { type: 'polevault', row: 0 }] },
                { delay: 22, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'dancing', row: 1 },
                    { type: 'screendoor', row: 3 },
                    { type: 'football', row: 0 },
                    { type: 'newspaper', row: 4 }
                ]},
                { delay: 25, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'dancing', row: 3 },
                    { type: 'football', row: 0 },
                    { type: 'football', row: 4 },
                    { type: 'screendoor', row: 1 },
                    { type: 'buckethead', row: 2 }
                ]},
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'dancing', row: 1 },
                    { type: 'dancing', row: 3 },
                    { type: 'football', row: 0 },
                    { type: 'football', row: 2 },
                    { type: 'screendoor', row: 4 },
                    { type: 'polevault', row: 2 }
                ]}
            ]
        },
        '3-1': {
            id: '3-1',
            world: 3,
            title: '第 3-1 关：碧波荡漾 (鸭子救生圈僵尸登场)',
            bg: 'assets/backgrounds/pool_viewport.jpg',
            isPool: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunflower', 'peashooter', 'lilypad', 'wallnut', 'potatomine', 'cherrybomb'],
            rewardPlant: 'squash',
            rewardText: '恭喜解锁：窝瓜！发现前后靠近的僵尸跃起泰山压顶！',
            waves: [
                { delay: 22, zombies: [{ type: 'normal', row: 1 }] },
                { delay: 22, zombies: [{ type: 'normal', row: 4 }] },
                { delay: 24, zombies: [{ type: 'ducky', row: 2 }] },
                { delay: 24, zombies: [{ type: 'conehead', row: 0 }, { type: 'ducky', row: 3 }] },
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'ducky', row: 2 },
                    { type: 'ducky', row: 3 },
                    { type: 'conehead', row: 4 },
                    { type: 'normal', row: 5 }
                ]}
            ]
        },
        '3-2': {
            id: '3-2',
            world: 3,
            title: '第 3-2 关：泰山压顶',
            bg: 'assets/backgrounds/pool_viewport.jpg',
            isPool: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunflower', 'peashooter', 'repeater', 'lilypad', 'squash', 'wallnut', 'snowpea'],
            rewardPlant: 'threepeater',
            rewardText: '恭喜解锁：三线射手！同时覆盖自身与上下相邻三条航道！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 0 }] },
                { delay: 22, zombies: [{ type: 'ducky', row: 2 }, { type: 'conehead', row: 5 }] },
                { delay: 24, zombies: [{ type: 'newspaper', row: 1 }, { type: 'buckethead', row: 4 }] },
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 0 },
                    { type: 'buckethead', row: 1 },
                    { type: 'ducky', row: 2 },
                    { type: 'ducky', row: 3 },
                    { type: 'newspaper', row: 4 },
                    { type: 'conehead', row: 5 }
                ]}
            ]
        },
        '3-3': {
            id: '3-3',
            world: 3,
            title: '第 3-3 关：潜流暗影 (潜水僵尸登场)',
            bg: 'assets/backgrounds/pool_viewport.jpg',
            isPool: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunflower', 'threepeater', 'peashooter', 'lilypad', 'squash', 'wallnut', 'cherrybomb'],
            rewardPlant: 'jalapeno',
            rewardText: '恭喜解锁：火爆辣椒！引爆后焚毁整整一行所有僵尸与冰道！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 1 }] },
                { delay: 22, zombies: [{ type: 'snorkel', row: 2 }] },
                { delay: 24, zombies: [{ type: 'conehead', row: 4 }, { type: 'snorkel', row: 3 }] },
                { delay: 25, zombies: [{ type: 'buckethead', row: 0 }, { type: 'ducky', row: 2 }] },
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'snorkel', row: 2 },
                    { type: 'snorkel', row: 3 },
                    { type: 'ducky', row: 2 },
                    { type: 'buckethead', row: 4 },
                    { type: 'conehead', row: 5 }
                ]}
            ]
        },
        '3-4': {
            id: '3-4',
            world: 3,
            title: '第 3-4 关：水陆夹击',
            bg: 'assets/backgrounds/pool_viewport.jpg',
            isPool: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunflower', 'threepeater', 'repeater', 'lilypad', 'squash', 'jalapeno', 'wallnut'],
            rewardPlant: 'torchwood',
            rewardText: '恭喜解锁：火炬树桩！穿过的豌豆化为双倍伤害烈焰火球！',
            waves: [
                { delay: 20, zombies: [{ type: 'conehead', row: 0 }] },
                { delay: 22, zombies: [{ type: 'polevault', row: 4 }, { type: 'snorkel', row: 2 }] },
                { delay: 24, zombies: [{ type: 'buckethead', row: 1 }, { type: 'ducky', row: 3 }] },
                { delay: 27, isFlag: true, zombies: [
                    { type: 'flag', row: 4 },
                    { type: 'polevault', row: 0 },
                    { type: 'snorkel', row: 2 },
                    { type: 'snorkel', row: 3 },
                    { type: 'buckethead', row: 5 }
                ]}
            ]
        },
        '3-5': {
            id: '3-5',
            world: 3,
            title: '第 3-5 关：泳池传送带突袭',
            bg: 'assets/backgrounds/pool_viewport.jpg',
            isPool: true,
            isConveyorBelt: true,
            conveyorCards: ['peashooter', 'threepeater', 'lilypad', 'wallnut', 'squash', 'jalapeno', 'cherrybomb'],
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['peashooter', 'threepeater', 'lilypad', 'wallnut', 'squash', 'jalapeno', 'cherrybomb'],
            rewardPlant: 'tanglekelp',
            rewardText: '恭喜解锁：缠绕水草！直接潜伏泳池水面，瞬间将靠近的水生僵尸拽入深水秒杀！',
            waves: [
                { delay: 14, zombies: [{ type: 'normal', row: 1 }, { type: 'ducky', row: 2 }] },
                { delay: 17, zombies: [{ type: 'conehead', row: 4 }, { type: 'snorkel', row: 3 }] },
                { delay: 19, zombies: [{ type: 'football', row: 0 }, { type: 'polevault', row: 5 }] },
                { delay: 22, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'football', row: 4 },
                    { type: 'snorkel', row: 2 },
                    { type: 'ducky', row: 3 },
                    { type: 'buckethead', row: 0 }
                ]}
            ]
        },
        '3-6': {
            id: '3-6',
            world: 3,
            title: '第 3-6 关：寒冰铁骑 (雪橇车僵尸登场)',
            bg: 'assets/backgrounds/pool_viewport.jpg',
            isPool: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunflower', 'threepeater', 'torchwood', 'lilypad', 'squash', 'jalapeno', 'wallnut', 'potatomine'],
            rewardPlant: 'spikeweed',
            rewardText: '恭喜解锁：地刺！不会被普通僵尸啃食，还能一击扎爆雪橇车轮胎！',
            waves: [
                { delay: 20, zombies: [{ type: 'conehead', row: 1 }] },
                { delay: 22, zombies: [{ type: 'zomboni', row: 0 }] },
                { delay: 24, zombies: [{ type: 'snorkel', row: 2 }, { type: 'zomboni', row: 4 }] },
                { delay: 27, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'zomboni', row: 0 },
                    { type: 'zomboni', row: 5 },
                    { type: 'snorkel', row: 2 },
                    { type: 'ducky', row: 3 },
                    { type: 'buckethead', row: 4 }
                ]}
            ]
        },
        '3-7': {
            id: '3-7',
            world: 3,
            title: '第 3-7 关：尖刺爆胎',
            bg: 'assets/backgrounds/pool_viewport.jpg',
            isPool: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunflower', 'threepeater', 'torchwood', 'spikeweed', 'lilypad', 'squash', 'jalapeno', 'wallnut'],
            rewardPlant: 'tallnut',
            rewardText: '恭喜解锁：高坚果！8000超高耐久，彻底拦截撑杆跳与海豚骑士！',
            waves: [
                { delay: 20, zombies: [{ type: 'zomboni', row: 1 }] },
                { delay: 22, zombies: [{ type: 'snorkel', row: 2 }, { type: 'buckethead', row: 4 }] },
                { delay: 24, zombies: [{ type: 'zomboni', row: 5 }, { type: 'football', row: 0 }] },
                { delay: 27, isFlag: true, zombies: [
                    { type: 'flag', row: 4 },
                    { type: 'zomboni', row: 0 },
                    { type: 'zomboni', row: 4 },
                    { type: 'snorkel', row: 2 },
                    { type: 'snorkel', row: 3 },
                    { type: 'football', row: 1 }
                ]}
            ]
        },
        '3-8': {
            id: '3-8',
            world: 3,
            title: '第 3-8 关：碧水惊涛 (海豚骑士僵尸登场)',
            bg: 'assets/backgrounds/pool_viewport.jpg',
            isPool: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunflower', 'threepeater', 'torchwood', 'tallnut', 'spikeweed', 'lilypad', 'squash', 'jalapeno'],
            rewardPlant: 'seashroom',
            rewardText: '成功拦截海豚突袭！解锁免费水生夜战植物：海蘑菇！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 0 }] },
                { delay: 22, zombies: [{ type: 'dolphin', row: 2 }] },
                { delay: 24, zombies: [{ type: 'zomboni', row: 4 }, { type: 'dolphin', row: 3 }] },
                { delay: 27, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'dolphin', row: 2 },
                    { type: 'dolphin', row: 3 },
                    { type: 'zomboni', row: 0 },
                    { type: 'buckethead', row: 5 }
                ]}
            ]
        },
        '3-9': {
            id: '3-9',
            world: 3,
            title: '第 3-9 关：泳池决战前夜',
            bg: 'assets/backgrounds/pool_viewport.jpg',
            isPool: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunflower', 'threepeater', 'torchwood', 'tallnut', 'spikeweed', 'lilypad', 'squash', 'cherrybomb'],
            rewardPlant: 'note',
            rewardText: '发现了泳池边的信件：“夜幕浓雾将至，小心从水中与地底袭来的敌军！”',
            waves: [
                { delay: 18, zombies: [{ type: 'polevault', row: 1 }, { type: 'dolphin', row: 2 }] },
                { delay: 20, zombies: [{ type: 'zomboni', row: 4 }, { type: 'snorkel', row: 3 }] },
                { delay: 22, zombies: [{ type: 'football', row: 0 }, { type: 'dolphin', row: 3 }] },
                { delay: 26, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'zomboni', row: 0 },
                    { type: 'zomboni', row: 5 },
                    { type: 'dolphin', row: 2 },
                    { type: 'dolphin', row: 3 },
                    { type: 'football', row: 4 }
                ]}
            ]
        },
        '3-10': {
            id: '3-10',
            world: 3,
            title: '第 3-10 关：碧波大决战 (泳池传送带总攻)',
            bg: 'assets/backgrounds/pool_viewport.jpg',
            isPool: true,
            isConveyorBelt: true,
            conveyorCards: ['threepeater', 'torchwood', 'lilypad', 'squash', 'jalapeno', 'spikeweed', 'tallnut', 'peashooter'],
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['threepeater', 'torchwood', 'lilypad', 'squash', 'jalapeno', 'spikeweed', 'tallnut', 'peashooter'],
            rewardPlant: 'seashroom',
            rewardText: '🎉 彻底守卫阳光泳池！解锁夜战水生蘑菇：【海蘑菇】！浓雾夜战开启！🏆',
            waves: [
                { delay: 14, zombies: [{ type: 'conehead', row: 1 }, { type: 'ducky', row: 2 }] },
                { delay: 17, zombies: [{ type: 'zomboni', row: 0 }, { type: 'snorkel', row: 3 }] },
                { delay: 19, zombies: [{ type: 'dolphin', row: 2 }, { type: 'polevault', row: 4 }] },
                { delay: 22, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'zomboni', row: 0 },
                    { type: 'dolphin', row: 2 },
                    { type: 'snorkel', row: 3 },
                    { type: 'football', row: 5 }
                ]},
                { delay: 25, isFlag: true, zombies: [
                    { type: 'flag', row: 4 },
                    { type: 'zomboni', row: 1 },
                    { type: 'zomboni', row: 5 },
                    { type: 'dolphin', row: 2 },
                    { type: 'dolphin', row: 3 },
                    { type: 'buckethead', row: 0 }
                ]}
            ]
        },
        '4-1': {
            id: '4-1',
            world: 4,
            initialSun: 50,
            title: '第 4-1 关：浓雾笼罩 (夜幕泳池初战)',
            bg: 'assets/backgrounds/fog_viewport.jpg',
            isPool: true,
            isFog: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunshroom', 'puffshroom', 'seashroom', 'fumeshroom', 'lilypad', 'wallnut', 'squash'],
            rewardPlant: 'plantern',
            rewardText: '恭喜解锁：路灯花！绽放温暖灯光照亮周围大片浓雾区域！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 1 }] },
                { delay: 22, zombies: [{ type: 'ducky', row: 2 }] },
                { delay: 24, zombies: [{ type: 'conehead', row: 4 }, { type: 'ducky', row: 3 }] },
                { delay: 27, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'ducky', row: 2 },
                    { type: 'ducky', row: 3 },
                    { type: 'conehead', row: 0 },
                    { type: 'normal', row: 5 }
                ]}
            ]
        },
        '4-2': {
            id: '4-2',
            world: 4,
            initialSun: 50,
            title: '第 4-2 关：迷雾明灯 (玩偶匣小丑登场)',
            bg: 'assets/backgrounds/fog_viewport.jpg',
            isPool: true,
            isFog: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunshroom', 'puffshroom', 'seashroom', 'plantern', 'fumeshroom', 'scaredyshroom', 'lilypad', 'wallnut'],
            rewardPlant: 'cactus',
            rewardText: '恭喜解锁：仙人掌！发射尖刺并能伸长身躯击破气球僵尸！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 0 }] },
                { delay: 22, zombies: [{ type: 'jackinthebox', row: 4 }] },
                { delay: 24, zombies: [{ type: 'ducky', row: 2 }, { type: 'conehead', row: 1 }] },
                { delay: 27, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'jackinthebox', row: 0 },
                    { type: 'ducky', row: 2 },
                    { type: 'snorkel', row: 3 },
                    { type: 'buckethead', row: 5 }
                ]}
            ]
        },
        '4-3': {
            id: '4-3',
            world: 4,
            initialSun: 50,
            title: '第 4-3 关：飞天危机 (气球僵尸登场)',
            bg: 'assets/backgrounds/fog_viewport.jpg',
            isPool: true,
            isFog: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunshroom', 'puffshroom', 'seashroom', 'plantern', 'cactus', 'fumeshroom', 'lilypad', 'wallnut'],
            rewardPlant: 'blover',
            rewardText: '恭喜解锁：三叶草！狂风吹散全屏浓雾并将气球僵尸直接吹飞！',
            waves: [
                { delay: 20, zombies: [{ type: 'conehead', row: 1 }] },
                { delay: 22, zombies: [{ type: 'balloon', row: 2 }] },
                { delay: 24, zombies: [{ type: 'balloon', row: 4 }, { type: 'ducky', row: 3 }] },
                { delay: 27, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'balloon', row: 0 },
                    { type: 'balloon', row: 3 },
                    { type: 'jackinthebox', row: 5 },
                    { type: 'ducky', row: 2 }
                ]}
            ]
        },
        '4-4': {
            id: '4-4',
            world: 4,
            initialSun: 50,
            title: '第 4-4 关：狂风驱雾',
            bg: 'assets/backgrounds/fog_viewport.jpg',
            isPool: true,
            isFog: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunshroom', 'puffshroom', 'seashroom', 'plantern', 'cactus', 'blover', 'fumeshroom', 'lilypad'],
            rewardPlant: 'splitpea',
            rewardText: '恭喜解锁：裂荚射手！向后双发豌豆火力，专克绕后偷袭的矿工僵尸！',
            waves: [
                { delay: 18, zombies: [{ type: 'balloon', row: 1 }] },
                { delay: 22, zombies: [{ type: 'dolphin', row: 2 }, { type: 'screendoor', row: 4 }] },
                { delay: 24, zombies: [{ type: 'balloon', row: 3 }, { type: 'jackinthebox', row: 0 }] },
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'balloon', row: 0 },
                    { type: 'balloon', row: 4 },
                    { type: 'dolphin', row: 2 },
                    { type: 'dolphin', row: 3 },
                    { type: 'buckethead', row: 5 }
                ]}
            ]
        },
        '4-5': {
            id: '4-5',
            world: 4,
            initialSun: 50,
            title: '第 4-5 关：地底掘进 (矿工僵尸登场)',
            bg: 'assets/backgrounds/fog_viewport.jpg',
            isPool: true,
            isFog: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunshroom', 'puffshroom', 'seashroom', 'splitpea', 'plantern', 'blover', 'fumeshroom', 'lilypad'],
            rewardPlant: 'starfruit',
            rewardText: '恭喜解锁：星星果/杨桃！向5个方向同时发射飞星，全方位清场！',
            waves: [
                { delay: 20, zombies: [{ type: 'conehead', row: 1 }] },
                { delay: 22, zombies: [{ type: 'digger', row: 0 }] },
                { delay: 24, zombies: [{ type: 'digger', row: 4 }, { type: 'snorkel', row: 2 }] },
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'digger', row: 0 },
                    { type: 'digger', row: 5 },
                    { type: 'balloon', row: 2 },
                    { type: 'ducky', row: 3 }
                ]}
            ]
        },
        '4-6': {
            id: '4-6',
            world: 4,
            initialSun: 50,
            title: '第 4-6 关：五向飞星',
            bg: 'assets/backgrounds/fog_viewport.jpg',
            isPool: true,
            isFog: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunshroom', 'puffshroom', 'seashroom', 'starfruit', 'splitpea', 'plantern', 'blover', 'lilypad'],
            rewardPlant: 'pumpkin',
            rewardText: '恭喜解锁：南瓜头！套在任何植物外层提供4000点坚固护甲防护！',
            waves: [
                { delay: 18, zombies: [{ type: 'digger', row: 1 }] },
                { delay: 20, zombies: [{ type: 'jackinthebox', row: 4 }, { type: 'ducky', row: 2 }] },
                { delay: 24, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'digger', row: 0 },
                    { type: 'digger', row: 5 },
                    { type: 'dolphin', row: 3 },
                    { type: 'balloon', row: 2 }
                ]}
            ]
        },
        '4-7': {
            id: '4-7',
            world: 4,
            initialSun: 50,
            title: '第 4-7 关：弹跳突击 (跳跳僵尸登场)',
            bg: 'assets/backgrounds/fog_viewport.jpg',
            isPool: true,
            isFog: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunshroom', 'puffshroom', 'seashroom', 'starfruit', 'pumpkin', 'tallnut', 'plantern', 'lilypad'],
            rewardPlant: 'magnetshroom',
            rewardText: '恭喜解锁：磁力菇！吸走铁桶、头盔、玩偶匣、矿工镐与跳跳杆！',
            waves: [
                { delay: 18, zombies: [{ type: 'pogo', row: 1 }] },
                { delay: 20, zombies: [{ type: 'pogo', row: 4 }, { type: 'snorkel', row: 2 }] },
                { delay: 24, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'pogo', row: 0 },
                    { type: 'pogo', row: 5 },
                    { type: 'digger', row: 4 },
                    { type: 'dolphin', row: 3 }
                ]}
            ]
        },
        '4-8': {
            id: '4-8',
            world: 4,
            initialSun: 50,
            title: '第 4-8 关：磁力神威',
            bg: 'assets/backgrounds/fog_viewport.jpg',
            isPool: true,
            isFog: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunshroom', 'puffshroom', 'seashroom', 'magnetshroom', 'starfruit', 'pumpkin', 'blover', 'lilypad'],
            rewardPlant: 'cabbagepult',
            rewardText: '磁力防线无懈可击！屋顶高抛植物即将登场！',
            waves: [
                { delay: 18, zombies: [{ type: 'buckethead', row: 1 }, { type: 'pogo', row: 4 }] },
                { delay: 20, zombies: [{ type: 'digger', row: 0 }, { type: 'jackinthebox', row: 5 }] },
                { delay: 24, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'football', row: 0 },
                    { type: 'pogo', row: 4 },
                    { type: 'digger', row: 5 },
                    { type: 'dolphin', row: 2 },
                    { type: 'snorkel', row: 3 }
                ]}
            ]
        },
        '4-9': {
            id: '4-9',
            world: 4,
            initialSun: 50,
            title: '第 4-9 关：浓雾终战前夕',
            bg: 'assets/backgrounds/fog_viewport.jpg',
            isPool: true,
            isFog: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            allowedPlants: ['sunshroom', 'puffshroom', 'seashroom', 'magnetshroom', 'starfruit', 'pumpkin', 'blover', 'lilypad'],
            rewardPlant: 'note',
            rewardText: '浓雾深处雷声隆隆！暴风雨之夜大决战即将降临！',
            waves: [
                { delay: 18, zombies: [{ type: 'jackinthebox', row: 1 }, { type: 'balloon', row: 2 }] },
                { delay: 20, zombies: [{ type: 'pogo', row: 4 }, { type: 'digger', row: 0 }] },
                { delay: 24, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'football', row: 0 },
                    { type: 'jackinthebox', row: 1 },
                    { type: 'dolphin', row: 2 },
                    { type: 'balloon', row: 3 },
                    { type: 'pogo', row: 4 },
                    { type: 'digger', row: 5 }
                ]}
            ]
        },
        '4-10': {
            id: '4-10',
            world: 4,
            title: '第 4-10 关：浓雾大决战 (雷雨传送带终极试炼)',
            bg: 'assets/backgrounds/fog_viewport.jpg',
            isPool: true,
            isFog: true,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            isConveyorBelt: true,
            conveyorCards: ['starfruit', 'cactus', 'splitpea', 'fumeshroom', 'puffshroom', 'seashroom', 'pumpkin', 'magnetshroom', 'blover', 'plantern', 'lilypad'],
            allowedPlants: ['starfruit', 'cactus', 'splitpea', 'fumeshroom', 'puffshroom', 'seashroom', 'pumpkin', 'magnetshroom', 'blover', 'plantern', 'lilypad'],
            rewardPlant: 'cabbagepult',
            rewardText: '🎉 彻底驱散无尽浓雾！解锁屋顶高抛植物：【卷心菜投手】与【花盆】！🏆',
            waves: [
                { delay: 14, zombies: [{ type: 'conehead', row: 1 }, { type: 'ducky', row: 2 }] },
                { delay: 17, zombies: [{ type: 'balloon', row: 3 }, { type: 'digger', row: 4 }] },
                { delay: 19, zombies: [{ type: 'pogo', row: 0 }, { type: 'jackinthebox', row: 5 }] },
                { delay: 22, isFlag: true, zombies: [
                    { type: 'flag', row: 1 },
                    { type: 'football', row: 0 },
                    { type: 'dolphin', row: 2 },
                    { type: 'balloon', row: 3 },
                    { type: 'pogo', row: 4 },
                    { type: 'digger', row: 5 }
                ]},
                { delay: 25, isFlag: true, zombies: [
                    { type: 'flag', row: 4 },
                    { type: 'jackinthebox', row: 0 },
                    { type: 'football', row: 1 },
                    { type: 'dolphin', row: 2 },
                    { type: 'snorkel', row: 3 },
                    { type: 'pogo', row: 4 },
                    { type: 'digger', row: 5 }
                ]}
            ]
        },
        '5-1': {
            id: '5-1',
            world: 5,
            title: '第 5-1 关：登高远望 (屋顶斜坡与蹦极僵尸)',
            bg: 'assets/backgrounds/roof_viewport.jpg',
            isRoof: true,
            initialPotsCols: [0, 1, 2],
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['sunflower', 'flowerpot', 'cabbagepult', 'wallnut', 'potatomine', 'cherrybomb'],
            rewardPlant: 'kernelpult',
            rewardText: '恭喜解锁：玉米投手！高抛投掷玉米粒并有几率投出黄油定身僵尸4秒！',
            waves: [
                { delay: 22, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 22, zombies: [{ type: 'normal', row: 0 }] },
                { delay: 24, zombies: [{ type: 'conehead', row: 3 }] },
                { delay: 25, zombies: [{ type: 'bungee', row: 1 }, { type: 'conehead', row: 4 }] },
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'bungee', row: 2 },
                    { type: 'conehead', row: 0 },
                    { type: 'conehead', row: 3 },
                    { type: 'normal', row: 4 }
                ]}
            ]
        },
        '5-2': {
            id: '5-2',
            world: 5,
            title: '第 5-2 关：黄油定身',
            bg: 'assets/backgrounds/roof_viewport.jpg',
            isRoof: true,
            initialPotsCols: [0, 1, 2],
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['sunflower', 'flowerpot', 'cabbagepult', 'kernelpult', 'wallnut', 'squash', 'cherrybomb'],
            rewardPlant: 'garlic',
            rewardText: '恭喜解锁：大蒜！僵尸咬上一口立即呛得转向相邻航道！',
            waves: [
                { delay: 20, zombies: [{ type: 'normal', row: 1 }] },
                { delay: 22, zombies: [{ type: 'polevault', row: 3 }] },
                { delay: 24, zombies: [{ type: 'buckethead', row: 2 }, { type: 'bungee', row: 0 }] },
                { delay: 27, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'polevault', row: 0 },
                    { type: 'buckethead', row: 1 },
                    { type: 'bungee', row: 3 },
                    { type: 'conehead', row: 4 }
                ]}
            ]
        },
        '5-3': {
            id: '5-3',
            world: 5,
            title: '第 5-3 关：云梯攻城 (扶梯僵尸登场)',
            bg: 'assets/backgrounds/roof_viewport.jpg',
            isRoof: true,
            initialPotsCols: [0, 1, 2],
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['sunflower', 'flowerpot', 'cabbagepult', 'kernelpult', 'garlic', 'wallnut', 'jalapeno', 'squash'],
            rewardPlant: 'melonpult',
            rewardText: '恭喜解锁：西瓜投手！投掷重型西瓜造成80点重击与3x3范围群伤溅射！',
            waves: [
                { delay: 20, zombies: [{ type: 'conehead', row: 2 }] },
                { delay: 22, zombies: [{ type: 'ladder', row: 1 }] },
                { delay: 24, zombies: [{ type: 'ladder', row: 3 }, { type: 'bungee', row: 2 }] },
                { delay: 27, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'ladder', row: 0 },
                    { type: 'ladder', row: 4 },
                    { type: 'buckethead', row: 2 },
                    { type: 'bungee', row: 1 }
                ]}
            ]
        },
        '5-4': {
            id: '5-4',
            world: 5,
            title: '第 5-4 关：碧玉飞瓜 (投石车僵尸登场)',
            bg: 'assets/backgrounds/roof_viewport.jpg',
            isRoof: true,
            initialPotsCols: [0, 1, 2],
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['sunflower', 'flowerpot', 'melonpult', 'kernelpult', 'cabbagepult', 'squash', 'tallnut', 'jalapeno'],
            rewardPlant: 'tallnut',
            rewardText: '西瓜重炮就位！当心空降蹦极突袭！',
            waves: [
                { delay: 20, zombies: [{ type: 'pogo', row: 1 }] },
                { delay: 22, zombies: [{ type: 'catapult', row: 2 }] },
                { delay: 24, zombies: [{ type: 'ladder', row: 4 }, { type: 'catapult', row: 0 }] },
                { delay: 27, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'catapult', row: 1 },
                    { type: 'catapult', row: 3 },
                    { type: 'pogo', row: 0 },
                    { type: 'ladder', row: 4 }
                ]}
            ]
        },
        '5-5': {
            id: '5-5',
            world: 5,
            title: '第 5-5 关：蹦极闪电战 (屋顶传送带特训)',
            bg: 'assets/backgrounds/roof_viewport.jpg',
            isRoof: true,
            initialPotsCols: [0, 1, 2],
            isConveyorBelt: true,
            conveyorCards: ['flowerpot', 'cabbagepult', 'kernelpult', 'melonpult', 'cherrybomb', 'jalapeno', 'garlic'],
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['flowerpot', 'cabbagepult', 'kernelpult', 'melonpult', 'cherrybomb', 'jalapeno', 'garlic'],
            rewardPlant: 'squash',
            rewardText: '完美击退蹦极空降团！',
            waves: [
                { delay: 14, zombies: [{ type: 'conehead', row: 2 }, { type: 'bungee', row: 1 }] },
                { delay: 17, zombies: [{ type: 'ladder', row: 0 }, { type: 'bungee', row: 3 }] },
                { delay: 19, zombies: [{ type: 'catapult', row: 4 }, { type: 'buckethead', row: 2 }] },
                { delay: 22, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'bungee', row: 0 },
                    { type: 'bungee', row: 2 },
                    { type: 'bungee', row: 4 },
                    { type: 'ladder', row: 1 },
                    { type: 'catapult', row: 3 }
                ]}
            ]
        },
        '5-6': {
            id: '5-6',
            world: 5,
            title: '第 5-6 关：天台重围',
            bg: 'assets/backgrounds/roof_viewport.jpg',
            isRoof: true,
            initialPotsCols: [0, 1, 2],
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['sunflower', 'flowerpot', 'melonpult', 'kernelpult', 'cabbagepult', 'tallnut', 'squash', 'jalapeno'],
            rewardPlant: 'umbrellaleaf',
            rewardText: '恭喜解锁：叶子保护伞！撑开弹性巨叶自动弹飞3x3范围内的蹦极僵尸与投石车篮球！',
            waves: [
                { delay: 20, zombies: [{ type: 'catapult', row: 1 }] },
                { delay: 22, zombies: [{ type: 'ladder', row: 3 }, { type: 'bungee', row: 2 }] },
                { delay: 25, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'catapult', row: 0 },
                    { type: 'catapult', row: 4 },
                    { type: 'ladder', row: 2 },
                    { type: 'football', row: 1 }
                ]}
            ]
        },
        '5-7': {
            id: '5-7',
            world: 5,
            title: '第 5-7 关：重炮齐鸣',
            bg: 'assets/backgrounds/roof_viewport.jpg',
            isRoof: true,
            initialPotsCols: [0, 1, 2],
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['sunflower', 'flowerpot', 'melonpult', 'kernelpult', 'umbrellaleaf', 'tallnut', 'jalapeno', 'cherrybomb'],
            rewardPlant: 'marigold',
            rewardText: '恭喜解锁：金盏花！定期结出闪亮银币与金币收获额外阳光！大地正在震颤……巨人即将逼近！',
            waves: [
                { delay: 18, zombies: [{ type: 'ladder', row: 1 }, { type: 'bungee', row: 3 }] },
                { delay: 20, zombies: [{ type: 'catapult', row: 2 }, { type: 'pogo', row: 0 }] },
                { delay: 24, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'catapult', row: 0 },
                    { type: 'catapult', row: 4 },
                    { type: 'ladder', row: 1 },
                    { type: 'ladder', row: 3 },
                    { type: 'bungee', row: 2 }
                ]}
            ]
        },
        '5-8': {
            id: '5-8',
            world: 5,
            title: '第 5-8 关：巨神震撼 (伽刚特尔巨人登场)',
            bg: 'assets/backgrounds/roof_viewport.jpg',
            isRoof: true,
            initialPotsCols: [0, 1, 2],
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['sunflower', 'flowerpot', 'melonpult', 'kernelpult', 'umbrellaleaf', 'jalapeno', 'cherrybomb', 'tallnut'],
            rewardPlant: 'doomshroom',
            rewardText: '成功击倒伽刚特尔巨人！准备迎接决战前夜！',
            waves: [
                { delay: 20, zombies: [{ type: 'conehead', row: 1 }, { type: 'conehead', row: 3 }] },
                { delay: 24, zombies: [{ type: 'gargantuar', row: 2 }] },
                { delay: 25, zombies: [{ type: 'catapult', row: 0 }, { type: 'ladder', row: 4 }] },
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'gargantuar', row: 2 },
                    { type: 'bungee', row: 1 },
                    { type: 'catapult', row: 4 },
                    { type: 'buckethead', row: 0 }
                ]}
            ]
        },
        '5-9': {
            id: '5-9',
            world: 5,
            title: '第 5-9 关：决战前夜 (全精英军团集结)',
            bg: 'assets/backgrounds/roof_viewport.jpg',
            isRoof: true,
            initialPotsCols: [0, 1, 2],
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['sunflower', 'flowerpot', 'melonpult', 'kernelpult', 'umbrellaleaf', 'jalapeno', 'cherrybomb', 'tallnut'],
            rewardPlant: 'note',
            rewardText: '发现了终极战书：“天台最终大决战即将打响！”',
            waves: [
                { delay: 18, zombies: [{ type: 'ladder', row: 1 }, { type: 'pogo', row: 3 }] },
                { delay: 22, zombies: [{ type: 'catapult', row: 0 }, { type: 'football', row: 4 }] },
                { delay: 24, zombies: [{ type: 'gargantuar', row: 2 }, { type: 'bungee', row: 1 }] },
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'gargantuar', row: 1 },
                    { type: 'gargantuar', row: 3 },
                    { type: 'catapult', row: 0 },
                    { type: 'ladder', row: 4 },
                    { type: 'bungee', row: 2 },
                    { type: 'football', row: 2 }
                ]}
            ]
        },
        '5-10': {
            id: '5-10',
            world: 5,
            title: '第 5-10 关：月夜屋顶终极大决战 (全通关最终试炼)',
            bg: 'assets/backgrounds/roof_night_viewport.jpg',
            isNight: true,
            isRoof: true,
            initialPotsCols: [0, 1, 2, 3],
            isConveyorBelt: true,
            conveyorCards: ['flowerpot', 'melonpult', 'kernelpult', 'cabbagepult', 'umbrellaleaf', 'jalapeno', 'iceshroom', 'squash', 'cherrybomb', 'tallnut'],
            activeRows: [0, 1, 2, 3, 4],
            allowedPlants: ['flowerpot', 'melonpult', 'kernelpult', 'cabbagepult', 'umbrellaleaf', 'jalapeno', 'iceshroom', 'squash', 'cherrybomb', 'tallnut'],
            rewardPlant: 'trophy_roof',
            rewardText: '🎉 恭喜通关全部五大世界！荣获至尊通关大奖杯【黄金向日葵奖杯】！🏆🌻',
            waves: [
                { delay: 14, zombies: [{ type: 'conehead', row: 2 }, { type: 'bungee', row: 1 }] },
                { delay: 17, zombies: [{ type: 'catapult', row: 0 }, { type: 'ladder', row: 3 }] },
                { delay: 20, zombies: [{ type: 'gargantuar', row: 2 }, { type: 'football', row: 4 }] },
                { delay: 24, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'gargantuar', row: 1 },
                    { type: 'catapult', row: 3 },
                    { type: 'ladder', row: 0 },
                    { type: 'bungee', row: 4 },
                    { type: 'football', row: 2 }
                ]},
                { delay: 28, isFlag: true, zombies: [
                    { type: 'flag', row: 2 },
                    { type: 'gargantuar', row: 0 },
                    { type: 'gargantuar', row: 3 },
                    { type: 'catapult', row: 1 },
                    { type: 'catapult', row: 4 },
                    { type: 'bungee', row: 2 },
                    { type: 'ladder', row: 2 }
                ]}
            ]
        },
        'endless_pool': {
            id: 'endless_pool',
            world: 6,
            isEndless: true,
            isPool: true,
            initialSun: 250,
            rowCount: 6,
            waterRows: [2, 3],
            activeRows: [0, 1, 2, 3, 4, 5],
            title: '生存模式：泳池无尽版 (Survival: Endless)',
            bg: 'assets/backgrounds/pool_viewport.jpg',
            allowedPlants: ['twinsunflower', 'lilypad', 'wintermelon', 'cobcannon', 'cattail', 'tallnut', 'pumpkin', 'spikerock'],
            selectablePlants: [
                'cobcannon', 'wintermelon', 'cattail', 'twinsunflower', 'gatlingpea', 'gloomshroom', 'spikerock', 'goldmagnet', 'imitater',
                'umbrellaleaf', 'marigold', 'tanglekelp',
                'peashooter', 'sunflower', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater',
                'puffshroom', 'sunshroom', 'fumeshroom', 'hypnoshroom', 'scaredyshroom', 'iceshroom', 'doomshroom', 'coffeebean',
                'lilypad', 'squash', 'threepeater', 'jalapeno', 'spikeweed', 'torchwood', 'tallnut', 'seashroom',
                'plantern', 'cactus', 'blover', 'splitpea', 'starfruit', 'pumpkin', 'magnetshroom',
                'cabbagepult', 'kernelpult', 'garlic', 'melonpult'
            ],
            waves: []
        },
        'endless_day': {
            id: 'endless_day',
            world: 6,
            isEndless: true,
            initialSun: 200,
            activeRows: [0, 1, 2, 3, 4],
            title: '生存模式：草坪无尽版 (Day Endless)',
            bg: 'assets/backgrounds/day_5row_viewport.jpg',
            allowedPlants: ['twinsunflower', 'cobcannon', 'wintermelon', 'gatlingpea', 'torchwood', 'tallnut', 'spikerock', 'cherrybomb'],
            selectablePlants: [
                'cobcannon', 'wintermelon', 'twinsunflower', 'gatlingpea', 'gloomshroom', 'spikerock', 'goldmagnet', 'imitater',
                'umbrellaleaf', 'marigold',
                'peashooter', 'sunflower', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater',
                'puffshroom', 'sunshroom', 'fumeshroom', 'hypnoshroom', 'scaredyshroom', 'iceshroom', 'doomshroom', 'coffeebean',
                'squash', 'threepeater', 'jalapeno', 'spikeweed', 'torchwood', 'tallnut',
                'cactus', 'splitpea', 'starfruit', 'pumpkin', 'magnetshroom',
                'cabbagepult', 'kernelpult', 'garlic', 'melonpult'
            ],
            waves: []
        },
        'endless_roof': {
            id: 'endless_roof',
            world: 6,
            isEndless: true,
            isRoof: true,
            initialPotsCols: [0, 1, 2, 3],
            initialSun: 250,
            activeRows: [0, 1, 2, 3, 4],
            title: '生存模式：屋顶无尽版 (Roof Endless)',
            bg: 'assets/backgrounds/roof_viewport.jpg',
            allowedPlants: ['twinsunflower', 'flowerpot', 'wintermelon', 'cobcannon', 'umbrellaleaf', 'tallnut', 'jalapeno', 'cherrybomb'],
            selectablePlants: [
                'flowerpot', 'cobcannon', 'wintermelon', 'umbrellaleaf', 'twinsunflower', 'goldmagnet', 'imitater', 'marigold',
                'sunflower', 'cabbagepult', 'kernelpult', 'melonpult',
                'gloomshroom', 'cherrybomb', 'jalapeno', 'squash',
                'wallnut', 'tallnut', 'pumpkin', 'garlic', 'potatomine', 'chomper', 'starfruit',
                'iceshroom', 'doomshroom', 'magnetshroom', 'coffeebean', 'blover'
            ],
            waves: []
        }
    }
};

// ============================================================================
// 原版 PVZ1 官方出怪点数与旗帜波生成引擎 (对标 Board::PickZombieWaves & gZombieDefs)：
// 1. 严格还原原版冒险模式 50 关旗帜/波数表：
//    - 1-1 教学关：5 波无旗帜 (共 5 只普通僵尸)
//    - 1 旗关卡 (10 波)：1-2, 1-3, 1-4, 1-6, 1-8 | 2-1, 2-3, 2-6, 2-8 | 3-1 | 4-1, 4-3, 4-5, 4-6, 4-8 | 5-1
//    - 2-5 锤僵尸特别试炼：12 波 1 旗快节奏墓地突袭
//    - 2 旗关卡 (20 波)：1-5(坚果保龄球), 1-7, 1-9, 1-10 | 2-2, 2-4, 2-7, 2-9, 2-10 | 3-2~3-8 | 4-2, 4-4, 4-7, 4-9, 4-10 | 5-2~5-8
//    - 3 旗压轴大战 (30 波)：3-9, 3-10, 5-9, 5-10
// 2. 严格还原原版 gZombieDefs 出怪点数权重 (mZombieValue) 与最早登场波次 (minWave)：
//    每波预算按 floor((w-1)/3)+1 递增，旗帜大波 2.5 倍点数爆发并赠送领头旗帜僵尸，精英巨怪高点数不无脑扎堆，基础小怪后期成群压境。
// ============================================================================
(function normalizeAdventureLevelWaves(cfg) {
    const ZOMBIE_DEFS = {
        normal:       { pts: 1,  minWave: 1 },
        ducky:        { pts: 1,  minWave: 1 },
        conehead:     { pts: 2,  minWave: 3 },
        newspaper:    { pts: 2,  minWave: 4 },
        polevault:    { pts: 2,  minWave: 5 },
        balloon:      { pts: 2,  minWave: 5 },
        snorkel:      { pts: 3,  minWave: 5 },
        jackinthebox: { pts: 3,  minWave: 6 },
        bungee:       { pts: 3,  minWave: 6 },
        screendoor:   { pts: 4,  minWave: 6 },
        buckethead:   { pts: 4,  minWave: 7 },
        digger:       { pts: 4,  minWave: 6 },
        pogo:         { pts: 4,  minWave: 6 },
        ladder:       { pts: 4,  minWave: 6 },
        dancing:      { pts: 5,  minWave: 6 },
        dolphin:      { pts: 5,  minWave: 6 },
        zomboni:      { pts: 7,  minWave: 7 },
        football:     { pts: 7,  minWave: 7 },
        catapult:     { pts: 8,  minWave: 7 },
        gargantuar:   { pts: 10, minWave: 8 }
    };

    const ONE_FLAG_LEVELS = new Set([
        '1-2', '1-3', '1-4', '1-6', '1-8',
        '2-1', '2-3', '2-6', '2-8',
        '3-1',
        '4-1', '4-3', '4-5', '4-6', '4-8',
        '5-1'
    ]);

    const THREE_FLAG_LEVELS = new Set(['3-9', '3-10', '5-9', '5-10']);

    const LEVEL_DEBUT_ZOMBIE = {
        '1-3': 'conehead',
        '1-6': 'polevault',
        '1-7': 'buckethead',
        '2-1': 'newspaper',
        '2-3': 'screendoor',
        '2-6': 'football',
        '2-8': 'dancing',
        '3-1': 'ducky',
        '3-3': 'snorkel',
        '3-6': 'zomboni',
        '3-8': 'dolphin',
        '4-2': 'jackinthebox',
        '4-3': 'balloon',
        '4-5': 'digger',
        '4-7': 'pogo',
        '5-1': 'bungee',
        '5-3': 'ladder',
        '5-4': 'catapult',
        '5-8': 'gargantuar'
    };

    // 固定随机发生器（保证同一关卡每次游玩兵种组合均衡稳定）
    const makeRng = (lvlId) => {
        let h = 2166136261;
        for (let i = 0; i < lvlId.length; i++) {
            h ^= lvlId.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        let state = (h >>> 0) || 1234567;
        return () => {
            state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
            return state / 4294967296;
        };
    };

    Object.keys(cfg.levels).forEach(lvlId => {
        const lvl = cfg.levels[lvlId];
        if (!lvl || lvl.isEndless) return;

        // 1-1 教学关：原版标准 5 波单轨无旗帜 (共 5 只普通僵尸)
        if (lvlId === '1-1') {
            lvl.waves = [
                { delay: 22, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 20, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 20, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 20, zombies: [{ type: 'normal', row: 2 }] },
                { delay: 22, zombies: [{ type: 'normal', row: 2 }] }
            ];
            return;
        }

        const origWaves = Array.isArray(lvl.waves) ? lvl.waves : [];
        if (origWaves.length === 0) return;

        const targetTotal = lvl.isWhackAZombie
            ? 12
            : (THREE_FLAG_LEVELS.has(lvlId) ? 30 : (ONE_FLAG_LEVELS.has(lvlId) ? 10 : 20));

        const activeRows = lvl.activeRows || [0, 1, 2, 3, 4];
        const waterRows = lvl.waterRows || [];
        const landRows = activeRows.filter(r => !waterRows.includes(r));
        const hasWater = waterRows.length > 0;
        const rng = makeRng(lvlId);

        // 提取本关允许出场的僵尸池（始终保留 normal，水池关卡始终保留 ducky 以填充 1 点预算）
        const allowedSet = new Set(['normal']);
        if (hasWater) allowedSet.add('ducky');
        origWaves.forEach(w => {
            (w.zombies || []).forEach(z => {
                if (z && z.type && z.type !== 'flag') {
                    allowedSet.add(z.type);
                }
            });
        });
        if (lvl.world >= 2 || lvlId !== '1-2') {
            allowedSet.add('conehead');
        }
        const allowedTypes = Array.from(allowedSet);
        const debutType = LEVEL_DEBUT_ZOMBIE[lvlId] || null;
        const featuredElites = allowedTypes.filter(t => t !== 'normal' && t !== 'ducky' && t !== 'conehead');

        const pickRowFor = (type) => {
            const zc = cfg.zombies[type] || cfg.zombies.normal;
            if (zc.isAquatic || zc.isWaterOnly) {
                return hasWater ? waterRows[Math.floor(rng() * waterRows.length)] : activeRows[Math.floor(rng() * activeRows.length)];
            }
            if (zc.isFlying || type === 'bungee') {
                return activeRows[Math.floor(rng() * activeRows.length)];
            }
            const pool = landRows.length > 0 ? landRows : activeRows;
            return pool[Math.floor(rng() * pool.length)];
        };

        const getPointVal = (t) => (ZOMBIE_DEFS[t] ? ZOMBIE_DEFS[t].pts : 2);
        const getMinWave = (t) => (ZOMBIE_DEFS[t] ? ZOMBIE_DEFS[t].minWave : 4);

        const baseDelay = lvl.isWhackAZombie ? 9 : (lvl.isBowling ? 12 : (lvl.isConveyorBelt ? 16 : 26));
        const newWaves = [];
        let debutSpawnedMid = false;

        for (let w = 1; w <= targetTotal; w++) {
            const isFlag = lvl.isWhackAZombie ? (w === targetTotal) : (w % 10 === 0);
            const waveObj = {
                delay: w === 1 ? (lvl.isBowling ? 10 : (lvl.isConveyorBelt ? 14 : 23)) : (isFlag ? baseDelay + 3 : baseDelay),
                zombies: []
            };
            if (lvl.isWhackAZombie) {
                waveObj.isGraveWave = true;
            }
            if (isFlag) {
                waveObj.isFlag = true;
            }

            // 计算本波官方出怪点数预算 (aZombiePoints)
            let budget = 1;
            if (lvl.isBowling) {
                if (w === 1) budget = 1;
                else if (w === 2) budget = 2;
                else budget = Math.floor(w / 2) + 2;
                if (isFlag) budget = (w === 10 ? 14 : 24);
            } else if (lvl.isWhackAZombie) {
                budget = isFlag ? 15 : Math.min(8, 1 + Math.ceil(w / 2));
            } else if (lvl.isConveyorBelt) {
                if (w <= 2) budget = 2;
                else budget = Math.floor((w - 1) / 3) + 2 + (lvl.world >= 3 && w >= 8 ? 1 : 0);
                if (isFlag) {
                    const baseF = Math.floor((w - 1) / 3) + 2;
                    budget = Math.round(baseF * 2.5) + 3;
                }
            } else {
                // 标准选卡种植关卡：前 3 波严格 1 点（单只普通僵尸），留足种向日葵与口算发育期！
                if (w <= 3) {
                    budget = 1;
                } else {
                    budget = Math.floor((w - 1) / 3) + 1 + (lvl.world >= 3 && w >= 8 ? 1 : 0);
                }
                if (isFlag) {
                    const baseF = Math.floor((w - 1) / 3) + 1;
                    budget = Math.round(baseF * 2.5) + (lvl.world >= 3 ? 2 : 0);
                }
            }

            // 旗帜波必带 1 只领头旗帜僵尸（不占常规预算，与原版一致）
            if (isFlag) {
                waveObj.zombies.push({ type: 'flag', row: pickRowFor('flag') });
            }

            // 新僵尸首秀关卡：保证在第 5 波（重装精英第 7 波）完成标志性初登场，且在旗帜波必定压阵！
            const debutTriggerWave = (debutType && getPointVal(debutType) >= 5) ? 7 : 5;
            if (debutType && !debutSpawnedMid && w === debutTriggerWave) {
                debutSpawnedMid = true;
                waveObj.zombies.push({ type: debutType, row: pickRowFor(debutType) });
                budget = Math.max(0, budget - getPointVal(debutType));
            } else if (isFlag && featuredElites.length > 0) {
                // 旗帜大波保底编入本关特色兵种
                const mustPick = debutType || featuredElites[Math.floor(rng() * featuredElites.length)];
                if (budget >= Math.min(4, getPointVal(mustPick))) {
                    waveObj.zombies.push({ type: mustPick, row: pickRowFor(mustPick) });
                    budget = Math.max(0, budget - getPointVal(mustPick));
                }
            }

            // 按点数预算循环挑选合规兵种，直至耗尽全部点数 (完全复刻 PickZombieWaves 分配器)
            let guard = 0;
            while (budget > 0 && guard < 40) {
                guard++;
                const candidates = allowedTypes.filter(t => {
                    const pv = getPointVal(t);
                    const mw = lvl.isConveyorBelt ? Math.max(1, getMinWave(t) - 2) : getMinWave(t);
                    if (w <= 2 && t !== 'normal') return false;
                    if (!isFlag && w < mw) return false;
                    if (pv > budget) return false;
                    // 泳池/浓雾关（2水路+4陆路）：控制水路僵尸占比约 33%，避免水路拥挤而陆路空旷
                    const isWaterCand = !!(cfg.zombies[t] && (cfg.zombies[t].isAquatic || cfg.zombies[t].isWaterOnly));
                    if (hasWater && isWaterCand) {
                        const curWaterCnt = waveObj.zombies.filter(z => cfg.zombies[z.type] && cfg.zombies[z.type].isAquatic).length;
                        const maxWaterInWave = isFlag ? Math.max(2, Math.ceil(budget / 3) + 2) : Math.max(1, Math.ceil((waveObj.zombies.length + 1) * 0.4));
                        if (curWaterCnt >= maxWaterInWave) return false;
                    }
                    // 单波蹦极数量限制，避免一整波全是空降偷菜无地面推进
                    if (t === 'bungee' && waveObj.zombies.filter(z => z.type === 'bungee').length >= (isFlag ? 3 : 1)) {
                        return false;
                    }
                    return true;
                });

                if (candidates.length === 0) {
                    waveObj.zombies.push({ type: 'normal', row: pickRowFor('normal') });
                    budget -= 1;
                    continue;
                }

                // 权重倾向：中后期适当提高进阶与特色兵种权重，泳池关保持 ~30% 水路压力
                const weighted = [];
                candidates.forEach(t => {
                    const pv = getPointVal(t);
                    const isWaterT = !!(cfg.zombies[t] && (cfg.zombies[t].isAquatic || cfg.zombies[t].isWaterOnly));
                    let copies = 2;
                    if (pv >= 2 && w >= 6) copies = 3;
                    if (t === debutType && !isWaterT) copies = 4;
                    if (hasWater && isWaterT) {
                        const curWaterCnt = waveObj.zombies.filter(z => cfg.zombies[z.type] && cfg.zombies[z.type].isAquatic).length;
                        copies = curWaterCnt === 0 && w >= 3 ? 3 : 1;
                    }
                    for (let c = 0; c < copies; c++) weighted.push(t);
                });

                const chosen = weighted[Math.floor(rng() * weighted.length)];
                waveObj.zombies.push({ type: chosen, row: pickRowFor(chosen) });
                budget -= getPointVal(chosen);
            }

            // 原版大波视觉保底：若重装巨怪吃光点数导致大波人数偏少，补充普通/路障随行步兵，确保红字大波气势十足
            if (isFlag) {
                const minHordeSize = w >= 30 ? 10 : (w >= 20 ? 8 : 6);
                while (waveObj.zombies.length < minHordeSize) {
                    const escort = (hasWater && rng() < 0.25) ? 'ducky' : (allowedSet.has('conehead') && rng() < 0.35 ? 'conehead' : 'normal');
                    waveObj.zombies.push({ type: escort, row: pickRowFor(escort) });
                }
            }

            newWaves.push(waveObj);
        }

        lvl.waves = newWaves;
    });
})(GAME_CONFIG);

// 12款可爱萌宠头像 (完全对标 shuxue)
export const AVATAR_LIST = ['🐰', '🐸', '🐱', '🐶', '🐼', '🦊', '🐯', '🦁', '🐻', '🐨', '🐵', '🦄'];

// 预设学段配置
export const DIFFICULTY_PRESETS = {
    grade1_2: {
        id: 'grade1_2',
        name: '🌱 萌芽学徒 (1~2年级)',
        desc: '10/20以内加减法、整十加减、凑数填空 (防负数)'
    },
    grade3_4: {
        id: 'grade3_4',
        name: '⚡ 数灵法师 (3~4年级)',
        desc: '九九乘法表、表内除法、百以内加减速算 (整除)'
    },
    grade5_6: {
        id: 'grade5_6',
        name: '🔥 大奥术师 (5~6年级)',
        desc: '四则混合两步运算、优先级法则、简算巧算'
    }
};
