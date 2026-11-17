/**
 * shared/aiReplies/letters.js - 🪄 游戏魔法师语音回信库与智能秒回配置
 * 1. WELCOME_LETTER：小豌豆与川川打开对话框时的置顶欢迎语音信（真人级自然音色 MP3）
 * 2. INSTANT_REPLY_CLIPS：按说话宝贝（小豌豆 / 川川 / 一起）与话题分类的即时鼓励真人语音包
 * 3. MAGICIAN_LETTERS：当游戏魔法师（Antigravity）真正把小朋友的想法写进游戏后，附带专属语音回信发布于此
 */

export const WELCOME_LETTER = {
    id: 'magician_welcome_v1',
    senderName: '游戏魔法师',
    badgeTitle: '✨ 欢迎来到魔法传声屋',
    targetKid: 'both',
    createdStr: '置顶魔法信',
    audioFile: 'welcome_01.mp3',
    text: '嗨！小豌豆、川川，你们好呀！我是和爸爸妈妈一起给你们建造这座游乐园的游戏魔法师！以后你们玩游戏的时候，不管是想要新的植物和炮塔、想给小兔子和小青蛙加漂亮新衣服、想要新的盲盒宝贝，还是觉得哪里太难或者有小问题，都可以点下面的大话筒直接跟我说！我收到你们的愿望之后，就会真的把它做进游戏里，还会在这里发语音告诉你们哟！'
};

export const INSTANT_REPLY_CLIPS = {
    // ==================== 🐰 小豌豆专属真人语音秒回 ====================
    pea_pvz_tower: {
        key: 'pea_pvz_tower',
        audioFile: 'pea_pvz_tower.mp3',
        text: '哇，小豌豆！你想加的新关卡和新角色听起来超酷呀！我已经拿魔法羽毛笔记在小本本上啦，等我施展魔法做好之后，就第一时间来告诉你哦！'
    },
    pea_pet_dress: {
        key: 'pea_pet_dress',
        audioFile: 'pea_pet_dress.mp3',
        text: '收到啦，小豌豆！给小萌宠换新造型、装扮小镇真是个超级甜美的好主意！我已经把你的愿望装进星光许愿瓶里啦，等着看我的新魔法吧！'
    },
    pea_gacha_reward: {
        key: 'pea_gacha_reward',
        audioFile: 'pea_gacha_reward.mp3',
        text: '哈哈，小豌豆的眼光真棒！新的惊喜盲盒点子我已经收到啦，等我悄悄把它藏进盲盒机里，再来给你发语音报喜哟！'
    },
    pea_question_fix: {
        key: 'pea_question_fix',
        audioFile: 'pea_question_fix.mp3',
        text: '谢谢细心的小豌豆告诉我！你发现的这个小细节特别重要，魔法师马上就去检查和调整，让你玩得更开心、学得更轻松！'
    },
    pea_hello: {
        key: 'pea_hello',
        audioFile: 'pea_hello.mp3',
        text: '嗨，可爱的小豌豆！听到你的声音我超级开心呀！今天在游乐园里玩得怎么样？随时都可以来找我聊天、提新点子哦！'
    },
    pea_general: {
        key: 'pea_general',
        audioFile: 'pea_general.mp3',
        text: '哇塞，小豌豆你真是太有想象力啦！你的专属金点子我已经稳稳收到云端信箱里啦，等我把新变化做进游戏，马上发语音通知你！'
    },

    // ==================== 🐸 川川专属真人语音秒回 ====================
    chuan_pvz_tower: {
        key: 'chuan_pvz_tower',
        audioFile: 'chuan_pvz_tower.mp3',
        text: '太酷啦，川川！你设计的战斗新点子超级有威力！我已经记进魔法蓝图里啦，等我把新功能打造出来，一定第一个喊你来试玩！'
    },
    chuan_pet_dress: {
        key: 'chuan_pet_dress',
        audioFile: 'chuan_pet_dress.mp3',
        text: '收到啦，川川！给萌宠和小镇增加新玩法的主意棒极啦！魔法师已经收到你的信号，很快就会施展魔法变出来哟！'
    },
    chuan_gacha_reward: {
        key: 'chuan_gacha_reward',
        audioFile: 'chuan_gacha_reward.mp3',
        text: '哈哈，川川这个盲盒新宝物的主意太赞啦！我已经拿小本本记好啦，等新宝贝住进盲盒博物馆，马上发语音告诉你！'
    },
    chuan_question_fix: {
        key: 'chuan_question_fix',
        audioFile: 'chuan_question_fix.mp3',
        text: '川川观察得真仔细呀，给你竖起大拇指！你说的这个问题魔法师已经记下来啦，很快就会帮你们修好优化哒！'
    },
    chuan_hello: {
        key: 'chuan_hello',
        audioFile: 'chuan_hello.mp3',
        text: '嗨，聪明帅气的川川！能听到你跟我说话太开心啦！不管是奇思妙想还是小愿望，尽管大声告诉我吧！'
    },
    chuan_general: {
        key: 'chuan_general',
        audioFile: 'chuan_general.mp3',
        text: '收到，川川！你真是个超棒的小小游戏设计师！我已经把你的好想法存进魔法工坊啦，做好之后就给你发语音回信哦！'
    },

    // ==================== 🐰🐸 小豌豆与川川一起说 ====================
    both_hello: {
        key: 'both_hello',
        audioFile: 'both_hello.mp3',
        text: '嗨，小豌豆、川川！听到你们两个一起跟我说话，魔法师开心得转圈圈啦！你们商量出了什么超棒的新点子呀？'
    },
    both_general: {
        key: 'both_general',
        audioFile: 'both_general.mp3',
        text: '哇！小豌豆和川川一起想出来的金点子果然威力加倍！我已经把你们俩的愿望郑重记在魔法卷轴上啦，等做好了马上一起来验收哦！'
    }
};

/**
 * 每次游戏魔法师根据小朋友的留言完成新功能升级后，在此追加专属回信（配合自定义生成的 MP3 语音）
 * 结构示例：
 * {
 *   id: 'reply_20261118_01',
 *   replyToId: 'wish_xxx',
 *   targetKid: 'pea' | 'chuan' | 'both',
 *   senderName: '游戏魔法师',
 *   badgeTitle: '🎉 愿望已实现！',
 *   createdAt: 1763400000000,
 *   createdStr: '11/18 19:30',
 *   audioFile: 'reply_20261118_01.mp3',
 *   text: '...'
 * }
 */
export const MAGICIAN_LETTERS = [
    {
        "id": "reply_20261117_hint_fix",
        "replyToId": "wish_1794913687269_ined",
        "targetKid": "pea",
        "senderName": "游戏魔法师",
        "badgeTitle": "🎉 愿望已实现 · 火眼金睛奖！",
        "createdAt": 1794916538311,
        "createdStr": "11/17 17:25",
        "audioFile": "reply_20261117_hint_fix.mp3",
        "text": "小豌豆你好呀！你真是太细心、太厉害的小小游戏侦探啦！你发现的题目点提示会直接出现答案这个小秘密太关键了！魔法师刚刚已经挥动魔杖，把所有数学题和英语题的提示都升级成只给解题思路、不漏出最终答案啦！快去试试新的提示按钮吧，给你颁一枚金光闪闪的火眼金睛大勋章！"
    },];

export function detectSpeakerPrefix(kidId = '', kidName = '') {
    if (kidId === 'both' || /一起|两个/.test(kidName)) return 'both';
    if (kidId === 'child_chuan' || /川/.test(kidName)) return 'chuan';
    if (kidId === 'child_xiaowandou' || /豌豆/.test(kidName)) return 'pea';
    return 'both';
}

export function matchInstantReply({ kidId = '', kidName = '', text = '' } = {}) {
    const prefix = detectSpeakerPrefix(kidId, kidName);
    const t = String(text || '').trim();

    const isGreetingOnly = t.length <= 14 && /你好|哈喽|嗨|魔法师|在吗|你是谁|喜欢你|早上好|晚上好|hello|hi/i.test(t)
        && !/加|想|要|改|太难|不对|问题|盲盒|植物|僵尸|兔|蛙/.test(t);

    if (prefix === 'both') {
        return isGreetingOnly ? INSTANT_REPLY_CLIPS.both_hello : INSTANT_REPLY_CLIPS.both_general;
    }

    if (isGreetingOnly) {
        return INSTANT_REPLY_CLIPS[`${prefix}_hello`];
    }
    if (/难|简单|不对|错|问题|卡住|动不了|没用|bug|重复|数学|口算|英语|单词|听写/i.test(t)) {
        return INSTANT_REPLY_CLIPS[`${prefix}_question_fix`];
    }
    if (/盲盒|抽奖|扭蛋|抽卡|徽章|恐龙|太空|甜品|国宝|稀有|SSR|UR/i.test(t)) {
        return INSTANT_REPLY_CLIPS[`${prefix}_gacha_reward`];
    }
    if (/植物|僵尸|豌豆射手|向日葵|坚果|大嘴花|保护伞|阳光|炮塔|萝卜|怪兽|无尽|波次/i.test(t)) {
        return INSTANT_REPLY_CLIPS[`${prefix}_pvz_tower`];
    }
    if (/兔|青蛙|蛙|宠物|萌宠|衣服|裙|帽|翅膀|皇冠|装扮|喂食|店铺|小镇|花园/i.test(t)) {
        return INSTANT_REPLY_CLIPS[`${prefix}_pet_dress`];
    }
    return INSTANT_REPLY_CLIPS[`${prefix}_general`];
}
