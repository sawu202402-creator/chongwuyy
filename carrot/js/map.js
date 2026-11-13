/**
 * map.js - 保卫萝卜官方原版高清大地图引擎
 * 采用 Theme1 官方原画大地图 (960x640)，精准对齐石板小径与建塔点位
 */

import { assetsManager } from './assetsLoader.js';

// 官方多关卡地图配置库 (严格 12x8 网格，80x80 单元格)
export const LEVEL_CONFIGS = {
    "1": {
        "id": 1,
        "name": "第 1 关: 云端之径",
        "bgSrc": "assets/official/stage1_full_map.png?v=20260923_cf_v17",
        "availableTowers": [
            "ADD_RAPID",
            "DIV_FROST"
        ],
        "maxWaves": 15,
        "waypoints": [
            {
                "x": 120,
                "y": 120
            },
            {
                "x": 120,
                "y": 360
            },
            {
                "x": 360,
                "y": 360
            },
            {
                "x": 360,
                "y": 280
            },
            {
                "x": 600,
                "y": 280
            },
            {
                "x": 600,
                "y": 360
            },
            {
                "x": 840,
                "y": 360
            },
            {
                "x": 840,
                "y": 120
            }
        ],
        "pathCells": [
            "1,1",
            "1,2",
            "1,3",
            "1,4",
            "2,4",
            "3,4",
            "4,4",
            "4,3",
            "5,3",
            "6,3",
            "7,3",
            "7,4",
            "8,4",
            "9,4",
            "10,4",
            "10,3",
            "10,2",
            "10,1"
        ],
        "startPortal": {
            "x": 120,
            "y": 120
        },
        "baseCrystal": {
            "x": 840,
            "y": 120,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 9,
                "r": 1,
                "x": 760,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                "id": "t1_chest_big",
                "type": "chest_big",
                "name": "神秘大宝箱",
                "c": 5,
                "r": 1,
                "wCells": 2,
                "hCells": 2,
                "spriteSrc": "assets/official/props/theme1_chest_big.png",
                "hp": 3200,
                "rewardGold": 200,
                "hiddenTower": { "typeKey": "ADD_RAPID", "level": 2, "slotC": 5, "slotR": 2 }
            },
            {
                "id": "t1_cloud_trees",
                "type": "cloud_trees",
                "name": "松树彩云",
                "c": 2,
                "r": 1,
                "wCells": 2,
                "hCells": 2,
                "spriteSrc": "assets/official/props/theme1_cloud_trees.png",
                "hp": 2000,
                "rewardGold": 160
            },
            {
                "id": "t1_balloon",
                "type": "balloon",
                "name": "梦幻热气球",
                "c": 7,
                "r": 1,
                "wCells": 2,
                "hCells": 2,
                "spriteSrc": "assets/official/props/theme1_balloon.png",
                "hp": 2000,
                "rewardGold": 150,
                "hiddenTower": { "typeKey": "DIV_FROST", "level": 1, "slotC": 8, "slotR": 2 }
            },
            {
                "id": "t1_chest_small",
                "type": "chest_small",
                "name": "云底金宝箱",
                "c": 5,
                "r": 4,
                "wCells": 1,
                "hCells": 1,
                "spriteSrc": "assets/official/props/theme1_chest_small.png",
                "hp": 900,
                "rewardGold": 120
            },
            {
                "id": "t1_cloud_small_1",
                "type": "cloud_small",
                "name": "浮面白云",
                "c": 6,
                "r": 4,
                "wCells": 1,
                "hCells": 1,
                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                "hp": 550,
                "rewardGold": 60
            },
            {
                "id": "t1_planet_yellow",
                "type": "planet_yellow",
                "name": "黄色土星",
                "c": 2,
                "r": 5,
                "wCells": 1,
                "hCells": 1,
                "spriteSrc": "assets/official/props/theme1_planet_yellow.png",
                "hp": 700,
                "rewardGold": 80
            },
            {
                "id": "t1_cloud_small_2",
                "type": "cloud_small",
                "name": "漂浮白云",
                "c": 4,
                "r": 5,
                "wCells": 1,
                "hCells": 1,
                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                "hp": 550,
                "rewardGold": 60
            },
            {
                "id": "t1_cloud_small_3",
                "type": "cloud_small",
                "name": "悠悠白云",
                "c": 7,
                "r": 5,
                "wCells": 1,
                "hCells": 1,
                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                "hp": 550,
                "rewardGold": 60
            },
            {
                "id": "t1_planet_orange",
                "type": "planet_orange",
                "name": "橙色土星",
                "c": 9,
                "r": 5,
                "wCells": 1,
                "hCells": 1,
                "spriteSrc": "assets/official/props/theme1_planet_orange.png",
                "hp": 700,
                "rewardGold": 80
            }
        ]
    },
    "2": {
        "id": 2,
        "name": "第 2 关: 蜿蜒云廊",
        "bgSrc": "assets/official/stage2_full_map.png?v=20260923_cf_v17",
        "availableTowers": [
            "ADD_RAPID",
            "DIV_FROST",
            "FAN"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 360,
                "y": 120
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 760,
                "y": 280
            },
            {
                "x": 200,
                "y": 280
            },
            {
                "x": 200,
                "y": 440
            },
            {
                "x": 600,
                "y": 440
            }
        ],
        "pathCells": [
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "9,2",
            "9,3",
            "8,3",
            "7,3",
            "6,3",
            "5,3",
            "4,3",
            "3,3",
            "2,3",
            "2,4",
            "2,5",
            "3,5",
            "4,5",
            "5,5",
            "6,5",
            "7,5"
        ],
        "startPortal": {
            "x": 360,
            "y": 120
        },
        "baseCrystal": {
            "x": 600,
            "y": 440,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
                    {
                                "id": "t1_l2_chest_big",
                                "type": "chest_big",
                                "name": "神秘大宝箱",
                                "c": 2,
                                "r": 1,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_chest_big.png",
                                "hp": 3200,
                                "rewardGold": 250,
                                "hiddenTower": {
                                            "typeKey": "FAN",
                                            "level": 2,
                                            "slotC": 2,
                                            "slotR": 1
                                }
                    },
                    {
                                "id": "t1_l2_cloud_trees",
                                "type": "cloud_trees",
                                "name": "松树彩云",
                                "c": 0,
                                "r": 5,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_cloud_trees.png",
                                "hp": 2000,
                                "rewardGold": 180,
                                "hiddenTower": {
                                            "typeKey": "ADD_RAPID",
                                            "level": 1,
                                            "slotC": 0,
                                            "slotR": 5
                                }
                    },
                    {
                                "id": "t1_l2_cloud_wide",
                                "type": "cloud_wide",
                                "name": "绵延白云",
                                "c": 2,
                                "r": 6,
                                "wCells": 2,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_wide.png",
                                "hp": 1200,
                                "rewardGold": 120
                    },
                    {
                                "id": "t1_l2_chest_small_0",
                                "type": "chest_small",
                                "name": "云底金宝箱",
                                "c": 4,
                                "r": 6,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_chest_small.png",
                                "hp": 900,
                                "rewardGold": 100
                    },
                    {
                                "id": "t1_l2_planet_yellow_1",
                                "type": "planet_yellow",
                                "name": "黄色土星",
                                "c": 11,
                                "r": 4,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_yellow.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l2_planet_orange_2",
                                "type": "planet_orange",
                                "name": "橙色土星",
                                "c": 8,
                                "r": 5,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_orange.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l2_cloud_small_3",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 2,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l2_cloud_small_4",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 0,
                                "r": 3,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l2_cloud_small_5",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 0,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    }
        ]
    },
    "3": {
        "id": 3,
        "name": "第 3 关: 浮岛回环",
        "bgSrc": "assets/official/stage3_full_map.png?v=20260923_cf_v17",
        "availableTowers": [
            "ADD_RAPID",
            "DIV_FROST",
            "BALL",
            "GEOM_LASER"
        ],
        "maxWaves": 15,
        "waypoints": [
            {
                "x": 120,
                "y": 200
            },
            {
                "x": 120,
                "y": 440
            },
            {
                "x": 440,
                "y": 440
            },
            {
                "x": 440,
                "y": 280
            },
            {
                "x": 600,
                "y": 280
            },
            {
                "x": 600,
                "y": 120
            },
            {
                "x": 680,
                "y": 120
            },
            {
                "x": 680,
                "y": 200
            },
            {
                "x": 840,
                "y": 200
            }
        ],
        "pathCells": [
            "1,2",
            "1,3",
            "1,4",
            "1,5",
            "2,5",
            "3,5",
            "4,5",
            "5,5",
            "5,4",
            "5,3",
            "6,3",
            "7,3",
            "7,2",
            "7,1",
            "8,1",
            "8,2",
            "9,2",
            "10,2"
        ],
        "startPortal": {
            "x": 120,
            "y": 200
        },
        "baseCrystal": {
            "x": 840,
            "y": 200,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 9,
                "r": 1,
                "x": 760,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
                    {
                                "id": "t1_l3_chest_big",
                                "type": "chest_big",
                                "name": "神秘大宝箱",
                                "c": 2,
                                "r": 2,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_chest_big.png",
                                "hp": 3200,
                                "rewardGold": 250,
                                "hiddenTower": {
                                            "typeKey": "GEOM_LASER",
                                            "level": 2,
                                            "slotC": 2,
                                            "slotR": 2
                                }
                    },
                    {
                                "id": "t1_l3_balloon",
                                "type": "balloon",
                                "name": "梦幻热气球",
                                "c": 9,
                                "r": 5,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_balloon.png",
                                "hp": 2000,
                                "rewardGold": 180,
                                "hiddenTower": null
                    },
                    {
                                "id": "t1_l3_cloud_wide",
                                "type": "cloud_wide",
                                "name": "绵延白云",
                                "c": 0,
                                "r": 6,
                                "wCells": 2,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_wide.png",
                                "hp": 1200,
                                "rewardGold": 120
                    },
                    {
                                "id": "t1_l3_chest_small_0",
                                "type": "chest_small",
                                "name": "云底金宝箱",
                                "c": 2,
                                "r": 6,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_chest_small.png",
                                "hp": 900,
                                "rewardGold": 100
                    },
                    {
                                "id": "t1_l3_planet_yellow_1",
                                "type": "planet_yellow",
                                "name": "黄色土星",
                                "c": 11,
                                "r": 4,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_yellow.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l3_planet_orange_2",
                                "type": "planet_orange",
                                "name": "橙色土星",
                                "c": 0,
                                "r": 5,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_orange.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l3_cloud_small_3",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 2,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l3_cloud_small_4",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 0,
                                "r": 3,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l3_cloud_small_5",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 0,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    }
        ]
    },
    "4": {
        "id": 4,
        "name": "第 4 关: 飞天长桥",
        "bgSrc": "assets/official/stage4_full_map.png?v=20260923_cf_v17",
        "availableTowers": [
            "ADD_RAPID",
            "DIV_FROST",
            "FAN",
            "BALL"
        ],
        "maxWaves": 16,
        "waypoints": [
            {
                "x": 40,
                "y": 520
            },
            {
                "x": 40,
                "y": 120
            },
            {
                "x": 200,
                "y": 120
            },
            {
                "x": 200,
                "y": 280
            },
            {
                "x": 360,
                "y": 280
            },
            {
                "x": 360,
                "y": 520
            },
            {
                "x": 600,
                "y": 520
            },
            {
                "x": 600,
                "y": 120
            },
            {
                "x": 680,
                "y": 120
            },
            {
                "x": 680,
                "y": 200
            },
            {
                "x": 760,
                "y": 200
            }
        ],
        "pathCells": [
            "0,6",
            "0,5",
            "0,4",
            "0,3",
            "0,2",
            "0,1",
            "1,1",
            "2,1",
            "2,2",
            "2,3",
            "3,3",
            "4,3",
            "4,4",
            "4,5",
            "4,6",
            "5,6",
            "6,6",
            "7,6",
            "7,5",
            "7,4",
            "7,3",
            "7,2",
            "7,1",
            "8,1",
            "8,2",
            "9,2"
        ],
        "startPortal": {
            "x": 40,
            "y": 520
        },
        "baseCrystal": {
            "x": 760,
            "y": 200,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 9,
                "r": 1,
                "x": 760,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
                    {
                                "id": "t1_l4_chest_big",
                                "type": "chest_big",
                                "name": "神秘大宝箱",
                                "c": 5,
                                "r": 2,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_chest_big.png",
                                "hp": 3200,
                                "rewardGold": 250,
                                "hiddenTower": {
                                            "typeKey": "BALL",
                                            "level": 2,
                                            "slotC": 5,
                                            "slotR": 2
                                }
                    },
                    {
                                "id": "t1_l4_cloud_trees",
                                "type": "cloud_trees",
                                "name": "松树彩云",
                                "c": 1,
                                "r": 5,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_cloud_trees.png",
                                "hp": 2000,
                                "rewardGold": 180,
                                "hiddenTower": {
                                            "typeKey": "ADD_RAPID",
                                            "level": 1,
                                            "slotC": 1,
                                            "slotR": 5
                                }
                    },
                    {
                                "id": "t1_l4_cloud_wide",
                                "type": "cloud_wide",
                                "name": "绵延白云",
                                "c": 8,
                                "r": 6,
                                "wCells": 2,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_wide.png",
                                "hp": 1200,
                                "rewardGold": 120
                    },
                    {
                                "id": "t1_l4_chest_small_0",
                                "type": "chest_small",
                                "name": "云底金宝箱",
                                "c": 3,
                                "r": 6,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_chest_small.png",
                                "hp": 900,
                                "rewardGold": 100
                    },
                    {
                                "id": "t1_l4_planet_yellow_1",
                                "type": "planet_yellow",
                                "name": "黄色土星",
                                "c": 11,
                                "r": 4,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_yellow.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l4_planet_orange_2",
                                "type": "planet_orange",
                                "name": "橙色土星",
                                "c": 3,
                                "r": 5,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_orange.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l4_cloud_small_3",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 2,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l4_cloud_small_4",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 1,
                                "r": 3,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l4_cloud_small_5",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 0,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    }
        ]
    },
    "5": {
        "id": 5,
        "name": "第 5 关: 双折奇云",
        "bgSrc": "assets/official/stage5_full_map.png?v=20260923_cf_v17",
        "availableTowers": [
            "DIV_FROST",
            "GEOM_LASER"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 840,
                "y": 120
            },
            {
                "x": 840,
                "y": 200
            },
            {
                "x": 520,
                "y": 200
            },
            {
                "x": 520,
                "y": 120
            },
            {
                "x": 120,
                "y": 120
            },
            {
                "x": 120,
                "y": 200
            },
            {
                "x": 280,
                "y": 200
            },
            {
                "x": 280,
                "y": 440
            },
            {
                "x": 440,
                "y": 440
            },
            {
                "x": 440,
                "y": 360
            },
            {
                "x": 840,
                "y": 360
            }
        ],
        "pathCells": [
            "10,1",
            "10,2",
            "9,2",
            "8,2",
            "7,2",
            "6,2",
            "6,1",
            "5,1",
            "4,1",
            "3,1",
            "2,1",
            "1,1",
            "1,2",
            "2,2",
            "3,2",
            "3,3",
            "3,4",
            "3,5",
            "4,5",
            "5,5",
            "5,4",
            "6,4",
            "7,4",
            "8,4",
            "9,4",
            "10,4"
        ],
        "startPortal": {
            "x": 840,
            "y": 120
        },
        "baseCrystal": {
            "x": 840,
            "y": 360,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 8,
                "r": 1,
                "x": 680,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 9,
                "r": 1,
                "x": 760,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
                    {
                                "id": "t1_l5_chest_big",
                                "type": "chest_big",
                                "name": "神秘大宝箱",
                                "c": 4,
                                "r": 2,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_chest_big.png",
                                "hp": 3200,
                                "rewardGold": 250,
                                "hiddenTower": {
                                            "typeKey": "GEOM_LASER",
                                            "level": 2,
                                            "slotC": 4,
                                            "slotR": 2
                                }
                    },
                    {
                                "id": "t1_l5_balloon",
                                "type": "balloon",
                                "name": "梦幻热气球",
                                "c": 0,
                                "r": 5,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_balloon.png",
                                "hp": 2000,
                                "rewardGold": 180,
                                "hiddenTower": null
                    },
                    {
                                "id": "t1_l5_cloud_wide",
                                "type": "cloud_wide",
                                "name": "绵延白云",
                                "c": 2,
                                "r": 6,
                                "wCells": 2,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_wide.png",
                                "hp": 1200,
                                "rewardGold": 120
                    },
                    {
                                "id": "t1_l5_chest_small_0",
                                "type": "chest_small",
                                "name": "云底金宝箱",
                                "c": 4,
                                "r": 6,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_chest_small.png",
                                "hp": 900,
                                "rewardGold": 100
                    },
                    {
                                "id": "t1_l5_planet_yellow_1",
                                "type": "planet_yellow",
                                "name": "黄色土星",
                                "c": 11,
                                "r": 4,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_yellow.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l5_planet_orange_2",
                                "type": "planet_orange",
                                "name": "橙色土星",
                                "c": 2,
                                "r": 5,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_orange.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l5_cloud_small_3",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 2,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l5_cloud_small_4",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 0,
                                "r": 3,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l5_cloud_small_5",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 0,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    }
        ]
    },
    "6": {
        "id": 6,
        "name": "第 6 关: 回字天堑",
        "bgSrc": "assets/official/stage6_full_map.png?v=20260923_cf_v26",
        "availableTowers": [
            "DIV_FROST",
            "FAN"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 120,
                "y": 440
            },
            {
                "x": 680,
                "y": 440
            },
            {
                "x": 680,
                "y": 200
            },
            {
                "x": 440,
                "y": 200
            },
            {
                "x": 440,
                "y": 280
            },
            {
                "x": 120,
                "y": 280
            },
            {
                "x": 120,
                "y": 120
            },
            {
                "x": 840,
                "y": 120
            },
            {
                "x": 840,
                "y": 360
            }
        ],
        "pathCells": [
            "1,5",
            "2,5",
            "3,5",
            "4,5",
            "5,5",
            "6,5",
            "7,5",
            "8,5",
            "8,4",
            "8,3",
            "8,2",
            "7,2",
            "6,2",
            "5,2",
            "5,3",
            "4,3",
            "3,3",
            "2,3",
            "1,3",
            "1,2",
            "1,1",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "10,1",
            "10,2",
            "10,3",
            "10,4"
        ],
        "startPortal": {
            "x": 120,
            "y": 440
        },
        "baseCrystal": {
            "x": 840,
            "y": 360,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 49,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
                    {
                                "id": "t1_l6_chest_big",
                                "type": "chest_big",
                                "name": "神秘大宝箱",
                                "c": 6,
                                "r": 3,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_chest_big.png",
                                "hp": 3200,
                                "rewardGold": 250,
                                "hiddenTower": {
                                            "typeKey": "FAN",
                                            "level": 2,
                                            "slotC": 6,
                                            "slotR": 3
                                }
                    },
                    {
                                "id": "t1_l6_cloud_trees",
                                "type": "cloud_trees",
                                "name": "松树彩云",
                                "c": 9,
                                "r": 5,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_cloud_trees.png",
                                "hp": 2000,
                                "rewardGold": 180,
                                "hiddenTower": {
                                            "typeKey": "DIV_FROST",
                                            "level": 1,
                                            "slotC": 9,
                                            "slotR": 5
                                }
                    },
                    {
                                "id": "t1_l6_cloud_wide",
                                "type": "cloud_wide",
                                "name": "绵延白云",
                                "c": 0,
                                "r": 6,
                                "wCells": 2,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_wide.png",
                                "hp": 1200,
                                "rewardGold": 120
                    },
                    {
                                "id": "t1_l6_chest_small_0",
                                "type": "chest_small",
                                "name": "云底金宝箱",
                                "c": 2,
                                "r": 6,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_chest_small.png",
                                "hp": 900,
                                "rewardGold": 100
                    },
                    {
                                "id": "t1_l6_planet_yellow_1",
                                "type": "planet_yellow",
                                "name": "黄色土星",
                                "c": 11,
                                "r": 4,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_yellow.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l6_planet_orange_2",
                                "type": "planet_orange",
                                "name": "橙色土星",
                                "c": 0,
                                "r": 5,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_orange.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l6_cloud_small_3",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 2,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l6_cloud_small_4",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 0,
                                "r": 3,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l6_cloud_small_5",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 0,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    }
        ]
    },
    "7": {
        "id": 7,
        "name": "第 7 关: 碧空长峡",
        "bgSrc": "assets/official/stage7_full_map.png?v=20260923_cf_v17",
        "availableTowers": [
            "ADD_RAPID",
            "BALL"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 200,
                "y": 120
            },
            {
                "x": 200,
                "y": 360
            },
            {
                "x": 440,
                "y": 360
            },
            {
                "x": 440,
                "y": 120
            },
            {
                "x": 680,
                "y": 120
            },
            {
                "x": 680,
                "y": 280
            },
            {
                "x": 600,
                "y": 280
            },
            {
                "x": 600,
                "y": 440
            },
            {
                "x": 840,
                "y": 440
            },
            {
                "x": 840,
                "y": 120
            }
        ],
        "pathCells": [
            "2,1",
            "2,2",
            "2,3",
            "2,4",
            "3,4",
            "4,4",
            "5,4",
            "5,3",
            "5,2",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "8,2",
            "8,3",
            "7,3",
            "7,4",
            "7,5",
            "8,5",
            "9,5",
            "10,5",
            "10,4",
            "10,3",
            "10,2",
            "10,1"
        ],
        "startPortal": {
            "x": 200,
            "y": 120
        },
        "baseCrystal": {
            "x": 840,
            "y": 120,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 4,
                "r": 1,
                "x": 360,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 9,
                "r": 1,
                "x": 760,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
                    {
                                "id": "t1_l7_chest_big",
                                "type": "chest_big",
                                "name": "神秘大宝箱",
                                "c": 3,
                                "r": 2,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_chest_big.png",
                                "hp": 3200,
                                "rewardGold": 250,
                                "hiddenTower": {
                                            "typeKey": "BALL",
                                            "level": 2,
                                            "slotC": 3,
                                            "slotR": 2
                                }
                    },
                    {
                                "id": "t1_l7_balloon",
                                "type": "balloon",
                                "name": "梦幻热气球",
                                "c": 0,
                                "r": 5,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_balloon.png",
                                "hp": 2000,
                                "rewardGold": 180,
                                "hiddenTower": null
                    },
                    {
                                "id": "t1_l7_cloud_wide",
                                "type": "cloud_wide",
                                "name": "绵延白云",
                                "c": 2,
                                "r": 6,
                                "wCells": 2,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_wide.png",
                                "hp": 1200,
                                "rewardGold": 120
                    },
                    {
                                "id": "t1_l7_chest_small_0",
                                "type": "chest_small",
                                "name": "云底金宝箱",
                                "c": 4,
                                "r": 6,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_chest_small.png",
                                "hp": 900,
                                "rewardGold": 100
                    },
                    {
                                "id": "t1_l7_planet_yellow_1",
                                "type": "planet_yellow",
                                "name": "黄色土星",
                                "c": 11,
                                "r": 4,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_yellow.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l7_planet_orange_2",
                                "type": "planet_orange",
                                "name": "橙色土星",
                                "c": 2,
                                "r": 5,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_orange.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l7_cloud_small_3",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 2,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l7_cloud_small_4",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 0,
                                "r": 3,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l7_cloud_small_5",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 0,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    }
        ]
    },
    "8": {
        "id": 8,
        "name": "第 8 关: 迷雾折廊",
        "bgSrc": "assets/official/stage8_full_map.png?v=20260923_cf_v17",
        "availableTowers": [
            "GEOM_LASER",
            "FAN",
            "BALL"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 40,
                "y": 200
            },
            {
                "x": 440,
                "y": 200
            },
            {
                "x": 440,
                "y": 120
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 760,
                "y": 360
            },
            {
                "x": 120,
                "y": 360
            },
            {
                "x": 120,
                "y": 520
            },
            {
                "x": 840,
                "y": 520
            }
        ],
        "pathCells": [
            "0,2",
            "1,2",
            "2,2",
            "3,2",
            "4,2",
            "5,2",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "9,2",
            "9,3",
            "9,4",
            "8,4",
            "7,4",
            "6,4",
            "5,4",
            "4,4",
            "3,4",
            "2,4",
            "1,4",
            "1,5",
            "1,6",
            "2,6",
            "3,6",
            "4,6",
            "5,6",
            "6,6",
            "7,6",
            "8,6",
            "9,6",
            "10,6"
        ],
        "startPortal": {
            "x": 40,
            "y": 200
        },
        "baseCrystal": {
            "x": 840,
            "y": 520,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 4,
                "r": 1,
                "x": 360,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
                    {
                                "id": "t1_l8_chest_big",
                                "type": "chest_big",
                                "name": "神秘大宝箱",
                                "c": 6,
                                "r": 2,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_chest_big.png",
                                "hp": 3200,
                                "rewardGold": 250,
                                "hiddenTower": {
                                            "typeKey": "BALL",
                                            "level": 2,
                                            "slotC": 6,
                                            "slotR": 2
                                }
                    },
                    {
                                "id": "t1_l8_cloud_trees",
                                "type": "cloud_trees",
                                "name": "松树彩云",
                                "c": 10,
                                "r": 4,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_cloud_trees.png",
                                "hp": 2000,
                                "rewardGold": 180,
                                "hiddenTower": {
                                            "typeKey": "GEOM_LASER",
                                            "level": 1,
                                            "slotC": 10,
                                            "slotR": 4
                                }
                    },
                    {
                                "id": "t1_l8_cloud_wide",
                                "type": "cloud_wide",
                                "name": "绵延白云",
                                "c": 2,
                                "r": 5,
                                "wCells": 2,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_wide.png",
                                "hp": 1200,
                                "rewardGold": 120
                    },
                    {
                                "id": "t1_l8_chest_small_0",
                                "type": "chest_small",
                                "name": "云底金宝箱",
                                "c": 0,
                                "r": 6,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_chest_small.png",
                                "hp": 900,
                                "rewardGold": 100
                    },
                    {
                                "id": "t1_l8_planet_yellow_1",
                                "type": "planet_yellow",
                                "name": "黄色土星",
                                "c": 0,
                                "r": 4,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_yellow.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l8_planet_orange_2",
                                "type": "planet_orange",
                                "name": "橙色土星",
                                "c": 0,
                                "r": 5,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_orange.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l8_cloud_small_3",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 2,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l8_cloud_small_4",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 0,
                                "r": 3,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l8_cloud_small_5",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 0,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    }
        ]
    },
    "9": {
        "id": 9,
        "name": "第 9 关: 巨石环道",
        "bgSrc": "assets/official/stage9_full_map.png?v=20260923_cf_v17",
        "availableTowers": [
            "ADD_RAPID",
            "DIV_FROST",
            "GEOM_LASER",
            "FAN",
            "BALL"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 120,
                "y": 520
            },
            {
                "x": 120,
                "y": 280
            },
            {
                "x": 360,
                "y": 280
            },
            {
                "x": 360,
                "y": 120
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 760,
                "y": 360
            },
            {
                "x": 440,
                "y": 360
            },
            {
                "x": 440,
                "y": 520
            },
            {
                "x": 840,
                "y": 520
            }
        ],
        "pathCells": [
            "1,6",
            "1,5",
            "1,4",
            "1,3",
            "2,3",
            "3,3",
            "4,3",
            "4,2",
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "9,2",
            "9,3",
            "9,4",
            "8,4",
            "7,4",
            "6,4",
            "5,4",
            "5,5",
            "5,6",
            "6,6",
            "7,6",
            "8,6",
            "9,6",
            "10,6"
        ],
        "startPortal": {
            "x": 120,
            "y": 520
        },
        "baseCrystal": {
            "x": 840,
            "y": 520,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
                    {
                                "id": "t1_l9_chest_big",
                                "type": "chest_big",
                                "name": "神秘大宝箱",
                                "c": 5,
                                "r": 2,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_chest_big.png",
                                "hp": 3200,
                                "rewardGold": 250,
                                "hiddenTower": {
                                            "typeKey": "BALL",
                                            "level": 2,
                                            "slotC": 5,
                                            "slotR": 2
                                }
                    },
                    {
                                "id": "t1_l9_balloon",
                                "type": "balloon",
                                "name": "梦幻热气球",
                                "c": 2,
                                "r": 5,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_balloon.png",
                                "hp": 2000,
                                "rewardGold": 180,
                                "hiddenTower": null
                    },
                    {
                                "id": "t1_l9_cloud_wide",
                                "type": "cloud_wide",
                                "name": "绵延白云",
                                "c": 6,
                                "r": 5,
                                "wCells": 2,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_wide.png",
                                "hp": 1200,
                                "rewardGold": 120
                    },
                    {
                                "id": "t1_l9_chest_small_0",
                                "type": "chest_small",
                                "name": "云底金宝箱",
                                "c": 0,
                                "r": 6,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_chest_small.png",
                                "hp": 900,
                                "rewardGold": 100
                    },
                    {
                                "id": "t1_l9_planet_yellow_1",
                                "type": "planet_yellow",
                                "name": "黄色土星",
                                "c": 11,
                                "r": 4,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_yellow.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l9_planet_orange_2",
                                "type": "planet_orange",
                                "name": "橙色土星",
                                "c": 0,
                                "r": 5,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_orange.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l9_cloud_small_3",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 2,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l9_cloud_small_4",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 0,
                                "r": 3,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l9_cloud_small_5",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 0,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    }
        ]
    },
    "10": {
        "id": 10,
        "name": "第 10 关: 天空阶梯",
        "bgSrc": "assets/official/stage10_full_map.png?v=20260923_cf_v17",
        "availableTowers": [
            "ADD_RAPID",
            "DIV_FROST",
            "BALL"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 200,
                "y": 360
            },
            {
                "x": 200,
                "y": 120
            },
            {
                "x": 440,
                "y": 120
            },
            {
                "x": 440,
                "y": 280
            },
            {
                "x": 600,
                "y": 280
            },
            {
                "x": 600,
                "y": 440
            },
            {
                "x": 760,
                "y": 440
            }
        ],
        "pathCells": [
            "2,4",
            "2,3",
            "2,2",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "5,2",
            "5,3",
            "6,3",
            "7,3",
            "7,4",
            "7,5",
            "8,5",
            "9,5"
        ],
        "startPortal": {
            "x": 200,
            "y": 360
        },
        "baseCrystal": {
            "x": 760,
            "y": 440,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
                    {
                                "id": "t1_l10_chest_big",
                                "type": "chest_big",
                                "name": "神秘大宝箱",
                                "c": 3,
                                "r": 2,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_chest_big.png",
                                "hp": 3200,
                                "rewardGold": 250,
                                "hiddenTower": {
                                            "typeKey": "BALL",
                                            "level": 2,
                                            "slotC": 3,
                                            "slotR": 2
                                }
                    },
                    {
                                "id": "t1_l10_cloud_trees",
                                "type": "cloud_trees",
                                "name": "松树彩云",
                                "c": 0,
                                "r": 5,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_cloud_trees.png",
                                "hp": 2000,
                                "rewardGold": 180,
                                "hiddenTower": {
                                            "typeKey": "ADD_RAPID",
                                            "level": 1,
                                            "slotC": 0,
                                            "slotR": 5
                                }
                    },
                    {
                                "id": "t1_l10_cloud_wide",
                                "type": "cloud_wide",
                                "name": "绵延白云",
                                "c": 2,
                                "r": 6,
                                "wCells": 2,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_wide.png",
                                "hp": 1200,
                                "rewardGold": 120
                    },
                    {
                                "id": "t1_l10_chest_small_0",
                                "type": "chest_small",
                                "name": "云底金宝箱",
                                "c": 4,
                                "r": 6,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_chest_small.png",
                                "hp": 900,
                                "rewardGold": 100
                    },
                    {
                                "id": "t1_l10_planet_yellow_1",
                                "type": "planet_yellow",
                                "name": "黄色土星",
                                "c": 11,
                                "r": 4,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_yellow.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l10_planet_orange_2",
                                "type": "planet_orange",
                                "name": "橙色土星",
                                "c": 2,
                                "r": 5,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_orange.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l10_cloud_small_3",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 2,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l10_cloud_small_4",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 0,
                                "r": 3,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l10_cloud_small_5",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 0,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    }
        ]
    },
    "11": {
        "id": 11,
        "name": "第 11 关: 幻境长廊",
        "bgSrc": "assets/official/stage11_full_map.png?v=20260923_cf_v17",
        "availableTowers": [
            "BALL",
            "DIV_FROST",
            "GEOM_LASER",
            "FAN"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 200,
                "y": 200
            },
            {
                "x": 200,
                "y": 120
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 760,
                "y": 200
            },
            {
                "x": 520,
                "y": 200
            },
            {
                "x": 520,
                "y": 280
            },
            {
                "x": 600,
                "y": 280
            },
            {
                "x": 600,
                "y": 360
            },
            {
                "x": 360,
                "y": 360
            },
            {
                "x": 360,
                "y": 280
            },
            {
                "x": 280,
                "y": 280
            }
        ],
        "pathCells": [
            "2,2",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "9,2",
            "8,2",
            "7,2",
            "6,2",
            "6,3",
            "7,3",
            "7,4",
            "6,4",
            "5,4",
            "4,4",
            "4,3",
            "3,3"
        ],
        "startPortal": {
            "x": 200,
            "y": 200
        },
        "baseCrystal": {
            "x": 280,
            "y": 280,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
                    {
                                "id": "t1_l11_chest_big",
                                "type": "chest_big",
                                "name": "神秘大宝箱",
                                "c": 8,
                                "r": 3,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_chest_big.png",
                                "hp": 3200,
                                "rewardGold": 250,
                                "hiddenTower": {
                                            "typeKey": "FAN",
                                            "level": 2,
                                            "slotC": 8,
                                            "slotR": 3
                                }
                    },
                    {
                                "id": "t1_l11_balloon",
                                "type": "balloon",
                                "name": "梦幻热气球",
                                "c": 0,
                                "r": 5,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_balloon.png",
                                "hp": 2000,
                                "rewardGold": 180,
                                "hiddenTower": null
                    },
                    {
                                "id": "t1_l11_cloud_wide",
                                "type": "cloud_wide",
                                "name": "绵延白云",
                                "c": 2,
                                "r": 6,
                                "wCells": 2,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_wide.png",
                                "hp": 1200,
                                "rewardGold": 120
                    },
                    {
                                "id": "t1_l11_chest_small_0",
                                "type": "chest_small",
                                "name": "云底金宝箱",
                                "c": 4,
                                "r": 6,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_chest_small.png",
                                "hp": 900,
                                "rewardGold": 100
                    },
                    {
                                "id": "t1_l11_planet_yellow_1",
                                "type": "planet_yellow",
                                "name": "黄色土星",
                                "c": 11,
                                "r": 4,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_yellow.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l11_planet_orange_2",
                                "type": "planet_orange",
                                "name": "橙色土星",
                                "c": 2,
                                "r": 5,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_orange.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l11_cloud_small_3",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 2,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l11_cloud_small_4",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 0,
                                "r": 3,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l11_cloud_small_5",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 0,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    }
        ]
    },
    "12": {
        "id": 12,
        "name": "第 12 关: 云端大决战",
        "bgSrc": "assets/official/stage12_full_map.png?v=20260923_cf_v17",
        "availableTowers": [
            "ADD_RAPID",
            "DIV_FROST",
            "GEOM_LASER",
            "FAN",
            "BALL"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 200,
                "y": 520
            },
            {
                "x": 200,
                "y": 280
            },
            {
                "x": 440,
                "y": 280
            },
            {
                "x": 440,
                "y": 200
            },
            {
                "x": 600,
                "y": 200
            },
            {
                "x": 600,
                "y": 120
            },
            {
                "x": 840,
                "y": 120
            },
            {
                "x": 840,
                "y": 360
            },
            {
                "x": 600,
                "y": 360
            },
            {
                "x": 600,
                "y": 440
            },
            {
                "x": 440,
                "y": 440
            },
            {
                "x": 440,
                "y": 520
            },
            {
                "x": 360,
                "y": 520
            }
        ],
        "pathCells": [
            "2,6",
            "2,5",
            "2,4",
            "2,3",
            "3,3",
            "4,3",
            "5,3",
            "5,2",
            "6,2",
            "7,2",
            "7,1",
            "8,1",
            "9,1",
            "10,1",
            "10,2",
            "10,3",
            "10,4",
            "9,4",
            "8,4",
            "7,4",
            "7,5",
            "6,5",
            "5,5",
            "5,6",
            "4,6"
        ],
        "startPortal": {
            "x": 200,
            "y": 520
        },
        "baseCrystal": {
            "x": 360,
            "y": 520,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 4,
                "r": 1,
                "x": 360,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 5,
                "r": 1,
                "x": 440,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
                    {
                                "id": "t1_l12_chest_big",
                                "type": "chest_big",
                                "name": "神秘大宝箱",
                                "c": 8,
                                "r": 2,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_chest_big.png",
                                "hp": 3200,
                                "rewardGold": 250,
                                "hiddenTower": {
                                            "typeKey": "BALL",
                                            "level": 2,
                                            "slotC": 8,
                                            "slotR": 2
                                }
                    },
                    {
                                "id": "t1_l12_cloud_trees",
                                "type": "cloud_trees",
                                "name": "松树彩云",
                                "c": 0,
                                "r": 5,
                                "wCells": 2,
                                "hCells": 2,
                                "spriteSrc": "assets/official/props/theme1_cloud_trees.png",
                                "hp": 2000,
                                "rewardGold": 180,
                                "hiddenTower": {
                                            "typeKey": "ADD_RAPID",
                                            "level": 1,
                                            "slotC": 0,
                                            "slotR": 5
                                }
                    },
                    {
                                "id": "t1_l12_cloud_wide",
                                "type": "cloud_wide",
                                "name": "绵延白云",
                                "c": 6,
                                "r": 6,
                                "wCells": 2,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_wide.png",
                                "hp": 1200,
                                "rewardGold": 120
                    },
                    {
                                "id": "t1_l12_chest_small_0",
                                "type": "chest_small",
                                "name": "云底金宝箱",
                                "c": 3,
                                "r": 6,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_chest_small.png",
                                "hp": 900,
                                "rewardGold": 100
                    },
                    {
                                "id": "t1_l12_planet_yellow_1",
                                "type": "planet_yellow",
                                "name": "黄色土星",
                                "c": 11,
                                "r": 4,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_yellow.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l12_planet_orange_2",
                                "type": "planet_orange",
                                "name": "橙色土星",
                                "c": 3,
                                "r": 5,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_planet_orange.png",
                                "hp": 700,
                                "rewardGold": 80
                    },
                    {
                                "id": "t1_l12_cloud_small_3",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 2,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l12_cloud_small_4",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 0,
                                "r": 3,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    },
                    {
                                "id": "t1_l12_cloud_small_5",
                                "type": "cloud_small",
                                "name": "浮面白云",
                                "c": 11,
                                "r": 0,
                                "wCells": 1,
                                "hCells": 1,
                                "spriteSrc": "assets/official/props/theme1_cloud_small.png",
                                "hp": 550,
                                "rewardGold": 60
                    }
        ]
    },
    "13": {
        "id": 13,
        "name": "第 2 季 第 1 关: 蜿蜒雨林",
        "bgSrc": "assets/official/jungle/stages/stage1_full_map.png?v=20260925_up1row_v2",
        "availableTowers": [
            "ADD_RAPID",
            "DIV_FROST",
            "FAN",
            "GEOM_LASER",
            "BALL"
        ],
        "maxWaves": 15,
        "waypoints": [
            {
                "x": 40,
                "y": 120
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 760,
                "y": 280
            },
            {
                "x": 200,
                "y": 280
            },
            {
                "x": 200,
                "y": 440
            },
            {
                "x": 760,
                "y": 440
            }
        ],
        "pathCells": [
            "0,1",
            "1,1",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "9,2",
            "9,3",
            "8,3",
            "7,3",
            "6,3",
            "5,3",
            "4,3",
            "3,3",
            "2,3",
            "2,4",
            "2,5",
            "3,5",
            "4,5",
            "5,5",
            "6,5",
            "7,5",
            "8,5",
            "9,5"
        ],
        "startPortal": {
            "x": 40,
            "y": 120
        },
        "baseCrystal": {
            "x": 760,
            "y": 440,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "j13_jungle_chest_big_10_5",
                        "type": "jungle_chest_big",
                        "name": "远古大金箱",
                        "c": 10,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "DIV_FROST",
                                    "level": 2,
                                    "slotC": 10,
                                    "slotR": 5
                        }
            },
            {
                        "id": "j13_jungle_tree_big_0_5",
                        "type": "jungle_tree_big",
                        "name": "热带古树",
                        "c": 0,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_tree_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "j13_jungle_chest_small_0_0",
                        "type": "jungle_chest_small",
                        "name": "丛林小木箱",
                        "c": 0,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "j13_jungle_mushroom_1_0",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 1,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j13_jungle_rock_9_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j13_jungle_stump_2_6",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 2,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j13_jungle_mushroom_3_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 3,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j13_jungle_rock_8_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j13_jungle_stump_4_6",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 4,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "14": {
        "id": 14,
        "name": "第 2 季 第 2 关: 绿意回廊",
        "bgSrc": "assets/official/jungle/stages/stage2_full_map.png?v=20260925_up1row_v2",
        "availableTowers": [
            "DIV_FROST",
            "GEOM_LASER",
            "FIRE_BOTTLE"
        ],
        "maxWaves": 15,
        "waypoints": [
            {
                "x": 840,
                "y": 120
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 760,
                "y": 200
            },
            {
                "x": 520,
                "y": 200
            },
            {
                "x": 520,
                "y": 120
            },
            {
                "x": 120,
                "y": 120
            },
            {
                "x": 120,
                "y": 440
            },
            {
                "x": 360,
                "y": 440
            },
            {
                "x": 360,
                "y": 360
            },
            {
                "x": 760,
                "y": 360
            }
        ],
        "pathCells": [
            "10,1",
            "9,1",
            "9,2",
            "8,2",
            "7,2",
            "6,2",
            "6,1",
            "5,1",
            "4,1",
            "3,1",
            "2,1",
            "1,1",
            "1,2",
            "1,3",
            "1,4",
            "1,5",
            "2,5",
            "3,5",
            "4,5",
            "4,4",
            "5,4",
            "6,4",
            "7,4",
            "8,4",
            "9,4"
        ],
        "startPortal": {
            "x": 840,
            "y": 120
        },
        "baseCrystal": {
            "x": 760,
            "y": 360,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 8,
                "r": 1,
                "x": 680,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 49,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 50,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "j14_jungle_chest_big_10_5",
                        "type": "jungle_chest_big",
                        "name": "远古大金箱",
                        "c": 10,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "GEOM_LASER",
                                    "level": 2,
                                    "slotC": 10,
                                    "slotR": 5
                        }
            },
            {
                        "id": "j14_jungle_tree_big_8_5",
                        "type": "jungle_tree_big",
                        "name": "热带古树",
                        "c": 8,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_tree_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "j14_jungle_totem_0_0",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 0,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j14_jungle_totem_0_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 0,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j14_jungle_chest_small_1_0",
                        "type": "jungle_chest_small",
                        "name": "丛林小木箱",
                        "c": 1,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "j14_jungle_mushroom_2_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 2,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j14_jungle_rock_1_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 1,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j14_jungle_stump_3_6",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 3,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j14_jungle_mushroom_4_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 4,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "15": {
        "id": 15,
        "name": "第 2 季 第 3 关: 树荫迷宫",
        "bgSrc": "assets/official/jungle/stages/stage3_full_map.png?v=20260925_up1row_v2",
        "availableTowers": [
            "FAN",
            "DIV_FROST",
            "FIRE_BOTTLE"
        ],
        "maxWaves": 16,
        "waypoints": [
            {
                "x": 120,
                "y": 120
            },
            {
                "x": 120,
                "y": 440
            },
            {
                "x": 360,
                "y": 440
            },
            {
                "x": 360,
                "y": 280
            },
            {
                "x": 680,
                "y": 280
            },
            {
                "x": 680,
                "y": 440
            },
            {
                "x": 840,
                "y": 440
            },
            {
                "x": 840,
                "y": 120
            },
            {
                "x": 360,
                "y": 120
            }
        ],
        "pathCells": [
            "1,1",
            "1,2",
            "1,3",
            "1,4",
            "1,5",
            "2,5",
            "3,5",
            "4,5",
            "4,4",
            "4,3",
            "5,3",
            "6,3",
            "7,3",
            "8,3",
            "8,4",
            "8,5",
            "9,5",
            "10,5",
            "10,4",
            "10,3",
            "10,2",
            "10,1",
            "9,1",
            "8,1",
            "7,1",
            "6,1",
            "5,1",
            "4,1"
        ],
        "startPortal": {
            "x": 120,
            "y": 120
        },
        "baseCrystal": {
            "x": 360,
            "y": 120,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 49,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 50,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 51,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 52,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 53,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 54,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "j15_jungle_totem_0_0",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 0,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j15_jungle_totem_0_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 0,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j15_jungle_chest_small_1_0",
                        "type": "jungle_chest_small",
                        "name": "丛林小木箱",
                        "c": 1,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "j15_jungle_mushroom_9_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j15_jungle_rock_11_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 11,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j15_jungle_stump_10_6",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 10,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j15_jungle_mushroom_2_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 2,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j15_jungle_rock_3_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 3,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j15_jungle_stump_1_6",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 1,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "16": {
        "id": 16,
        "name": "第 2 季 第 4 关: 盘根错节",
        "bgSrc": "assets/official/jungle/stages/stage4_full_map.png?v=20260925_up1row_v2",
        "availableTowers": [
            "GEOM_LASER",
            "DIV_FROST",
            "MUL_CANNON"
        ],
        "maxWaves": 16,
        "waypoints": [
            {
                "x": 40,
                "y": 120
            },
            {
                "x": 200,
                "y": 120
            },
            {
                "x": 200,
                "y": 440
            },
            {
                "x": 360,
                "y": 440
            },
            {
                "x": 360,
                "y": 40
            },
            {
                "x": 520,
                "y": 40
            },
            {
                "x": 520,
                "y": 440
            },
            {
                "x": 680,
                "y": 440
            },
            {
                "x": 680,
                "y": 200
            },
            {
                "x": 840,
                "y": 200
            }
        ],
        "pathCells": [
            "0,1",
            "1,1",
            "2,1",
            "2,2",
            "2,3",
            "2,4",
            "2,5",
            "3,5",
            "4,5",
            "4,4",
            "4,3",
            "4,2",
            "4,1",
            "4,0",
            "5,0",
            "6,0",
            "6,1",
            "6,2",
            "6,3",
            "6,4",
            "6,5",
            "7,5",
            "8,5",
            "8,4",
            "8,3",
            "8,2",
            "9,2",
            "10,2"
        ],
        "startPortal": {
            "x": 40,
            "y": 120
        },
        "baseCrystal": {
            "x": 840,
            "y": 200,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 5,
                "r": 1,
                "x": 440,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 8,
                "r": 1,
                "x": 680,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 9,
                "r": 1,
                "x": 760,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "j16_jungle_chest_big_10_5",
                        "type": "jungle_chest_big",
                        "name": "远古大金箱",
                        "c": 10,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "DIV_FROST",
                                    "level": 2,
                                    "slotC": 10,
                                    "slotR": 5
                        }
            },
            {
                        "id": "j16_jungle_tree_big_0_5",
                        "type": "jungle_tree_big",
                        "name": "热带古树",
                        "c": 0,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_tree_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "j16_jungle_totem_9_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 9,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j16_jungle_chest_small_0_0",
                        "type": "jungle_chest_small",
                        "name": "丛林小木箱",
                        "c": 0,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "j16_jungle_mushroom_1_0",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 1,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j16_jungle_rock_2_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 2,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j16_jungle_stump_3_6",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 3,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j16_jungle_mushroom_8_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j16_jungle_rock_11_0",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "17": {
        "id": 17,
        "name": "第 2 季 第 5 关: 幽径叠翠",
        "bgSrc": "assets/official/jungle/stages/stage5_full_map.png?v=20260925_up1row_v2",
        "availableTowers": [
            "FAN",
            "FIRE_BOTTLE",
            "DIV_FROST",
            "MUL_CANNON"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 840,
                "y": 200
            },
            {
                "x": 840,
                "y": 280
            },
            {
                "x": 440,
                "y": 280
            },
            {
                "x": 440,
                "y": 120
            },
            {
                "x": 40,
                "y": 120
            },
            {
                "x": 40,
                "y": 280
            },
            {
                "x": 200,
                "y": 280
            },
            {
                "x": 200,
                "y": 440
            },
            {
                "x": 360,
                "y": 440
            },
            {
                "x": 360,
                "y": 360
            },
            {
                "x": 680,
                "y": 360
            }
        ],
        "pathCells": [
            "10,2",
            "10,3",
            "9,3",
            "8,3",
            "7,3",
            "6,3",
            "5,3",
            "5,2",
            "5,1",
            "4,1",
            "3,1",
            "2,1",
            "1,1",
            "0,1",
            "0,2",
            "0,3",
            "1,3",
            "2,3",
            "2,4",
            "2,5",
            "3,5",
            "4,5",
            "4,4",
            "5,4",
            "6,4",
            "7,4",
            "8,4"
        ],
        "startPortal": {
            "x": 840,
            "y": 200
        },
        "baseCrystal": {
            "x": 680,
            "y": 360,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 9,
                "r": 1,
                "x": 760,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "j17_jungle_chest_big_10_5",
                        "type": "jungle_chest_big",
                        "name": "远古大金箱",
                        "c": 10,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "FIRE_BOTTLE",
                                    "level": 2,
                                    "slotC": 10,
                                    "slotR": 5
                        }
            },
            {
                        "id": "j17_jungle_tree_big_0_5",
                        "type": "jungle_tree_big",
                        "name": "热带古树",
                        "c": 0,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_tree_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "j17_jungle_totem_9_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 9,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j17_jungle_chest_small_0_0",
                        "type": "jungle_chest_small",
                        "name": "丛林小木箱",
                        "c": 0,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "j17_jungle_mushroom_1_0",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 1,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j17_jungle_rock_2_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 2,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j17_jungle_stump_3_6",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 3,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j17_jungle_mushroom_8_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j17_jungle_rock_4_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 4,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "18": {
        "id": 18,
        "name": "第 2 季 第 6 关: 翡翠险道",
        "bgSrc": "assets/official/jungle/stages/stage6_full_map.png?v=20260925_up1row_v2",
        "availableTowers": [
            "BALL",
            "DIV_FROST",
            "MUL_CANNON",
            "ROCKET"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 200,
                "y": 440
            },
            {
                "x": 200,
                "y": 120
            },
            {
                "x": 440,
                "y": 120
            },
            {
                "x": 440,
                "y": 440
            },
            {
                "x": 680,
                "y": 440
            },
            {
                "x": 680,
                "y": 120
            },
            {
                "x": 840,
                "y": 120
            }
        ],
        "pathCells": [
            "2,5",
            "2,4",
            "2,3",
            "2,2",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "5,2",
            "5,3",
            "5,4",
            "5,5",
            "6,5",
            "7,5",
            "8,5",
            "8,4",
            "8,3",
            "8,2",
            "8,1",
            "9,1",
            "10,1"
        ],
        "startPortal": {
            "x": 200,
            "y": 440
        },
        "baseCrystal": {
            "x": 840,
            "y": 120,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "j18_jungle_chest_big_0_0",
                        "type": "jungle_chest_big",
                        "name": "远古大金箱",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "DIV_FROST",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "j18_jungle_tree_big_10_5",
                        "type": "jungle_tree_big",
                        "name": "热带古树",
                        "c": 10,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_tree_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "j18_jungle_hut_0_5",
                        "type": "jungle_hut",
                        "name": "原始树屋",
                        "c": 0,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_hut.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "j18_jungle_totem_9_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 9,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j18_jungle_chest_small_2_6",
                        "type": "jungle_chest_small",
                        "name": "丛林小木箱",
                        "c": 2,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "j18_jungle_mushroom_8_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j18_jungle_rock_3_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 3,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j18_jungle_stump_7_6",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 7,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j18_jungle_mushroom_11_0",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "19": {
        "id": 19,
        "name": "第 2 季 第 7 关: 碧绿深谷",
        "bgSrc": "assets/official/jungle/stages/stage7_full_map.png?v=20260925_up1row_v2",
        "availableTowers": [
            "FAN",
            "GEOM_LASER",
            "BALL",
            "FIRE_BOTTLE",
            "MUL_CANNON",
            "ROCKET"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 120,
                "y": 440
            },
            {
                "x": 120,
                "y": 280
            },
            {
                "x": 280,
                "y": 280
            },
            {
                "x": 280,
                "y": 120
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 760,
                "y": 360
            },
            {
                "x": 440,
                "y": 360
            },
            {
                "x": 440,
                "y": 440
            },
            {
                "x": 760,
                "y": 440
            }
        ],
        "pathCells": [
            "1,5",
            "1,4",
            "1,3",
            "2,3",
            "3,3",
            "3,2",
            "3,1",
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "9,2",
            "9,3",
            "9,4",
            "8,4",
            "7,4",
            "6,4",
            "5,4",
            "5,5",
            "6,5",
            "7,5",
            "8,5",
            "9,5"
        ],
        "startPortal": {
            "x": 120,
            "y": 440
        },
        "baseCrystal": {
            "x": 760,
            "y": 440,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "j19_jungle_chest_big_0_0",
                        "type": "jungle_chest_big",
                        "name": "远古大金箱",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "GEOM_LASER",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "j19_jungle_tree_big_10_5",
                        "type": "jungle_tree_big",
                        "name": "热带古树",
                        "c": 10,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_tree_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "j19_jungle_totem_0_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 0,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j19_jungle_totem_2_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 2,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j19_jungle_chest_small_9_6",
                        "type": "jungle_chest_small",
                        "name": "丛林小木箱",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "j19_jungle_mushroom_1_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 1,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j19_jungle_rock_8_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j19_jungle_stump_7_6",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 7,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j19_jungle_mushroom_3_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 3,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "20": {
        "id": 20,
        "name": "第 2 季 第 8 关: 奇木双折",
        "bgSrc": "assets/official/jungle/stages/stage8_full_map.png?v=20260925_up1row_v2",
        "availableTowers": [
            "DIV_FROST",
            "GEOM_LASER",
            "FAN",
            "BALL",
            "FIRE_BOTTLE",
            "MUL_CANNON",
            "ROCKET"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 40,
                "y": 200
            },
            {
                "x": 280,
                "y": 200
            },
            {
                "x": 280,
                "y": 40
            },
            {
                "x": 520,
                "y": 40
            },
            {
                "x": 520,
                "y": 360
            },
            {
                "x": 40,
                "y": 360
            },
            {
                "x": 40,
                "y": 520
            },
            {
                "x": 680,
                "y": 520
            },
            {
                "x": 680,
                "y": 120
            },
            {
                "x": 840,
                "y": 120
            }
        ],
        "pathCells": [
            "0,2",
            "1,2",
            "2,2",
            "3,2",
            "3,1",
            "3,0",
            "4,0",
            "5,0",
            "6,0",
            "6,1",
            "6,2",
            "6,3",
            "6,4",
            "5,4",
            "4,4",
            "3,4",
            "2,4",
            "1,4",
            "0,4",
            "0,5",
            "0,6",
            "1,6",
            "2,6",
            "3,6",
            "4,6",
            "5,6",
            "6,6",
            "7,6",
            "8,6",
            "8,5",
            "8,4",
            "8,3",
            "8,2",
            "8,1",
            "9,1",
            "10,1"
        ],
        "startPortal": {
            "x": 40,
            "y": 200
        },
        "baseCrystal": {
            "x": 840,
            "y": 120,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 4,
                "r": 1,
                "x": 360,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 5,
                "r": 1,
                "x": 440,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "j20_jungle_chest_big_0_0",
                        "type": "jungle_chest_big",
                        "name": "远古大金箱",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "GEOM_LASER",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "j20_jungle_tree_big_10_5",
                        "type": "jungle_tree_big",
                        "name": "热带古树",
                        "c": 10,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_tree_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "j20_jungle_chest_small_9_6",
                        "type": "jungle_chest_small",
                        "name": "丛林小木箱",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "j20_jungle_mushroom_11_0",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "21": {
        "id": 21,
        "name": "第 2 季 第 9 关: 迷雾古林",
        "bgSrc": "assets/official/jungle/stages/stage9_full_map.png?v=20260925_up1row_v2",
        "availableTowers": [
            "ADD_RAPID",
            "GEOM_LASER",
            "FIRE_BOTTLE",
            "DIV_FROST"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 200,
                "y": 280
            },
            {
                "x": 520,
                "y": 280
            },
            {
                "x": 520,
                "y": 120
            },
            {
                "x": 600,
                "y": 120
            },
            {
                "x": 600,
                "y": 440
            },
            {
                "x": 760,
                "y": 440
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 840,
                "y": 120
            },
            {
                "x": 840,
                "y": 440
            }
        ],
        "pathCells": [
            "2,3",
            "3,3",
            "4,3",
            "5,3",
            "6,3",
            "6,2",
            "6,1",
            "7,1",
            "7,2",
            "7,3",
            "7,4",
            "7,5",
            "8,5",
            "9,5",
            "9,4",
            "9,3",
            "9,2",
            "9,1",
            "10,1",
            "10,2",
            "10,3",
            "10,4",
            "10,5"
        ],
        "startPortal": {
            "x": 200,
            "y": 280
        },
        "baseCrystal": {
            "x": 840,
            "y": 440,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 5,
                "r": 1,
                "x": 440,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 8,
                "r": 1,
                "x": 680,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "j21_jungle_chest_big_0_0",
                        "type": "jungle_chest_big",
                        "name": "远古大金箱",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "GEOM_LASER",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "j21_jungle_tree_big_0_5",
                        "type": "jungle_tree_big",
                        "name": "热带古树",
                        "c": 0,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_tree_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "j21_jungle_totem_11_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 11,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j21_jungle_totem_2_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 2,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j21_jungle_chest_small_10_6",
                        "type": "jungle_chest_small",
                        "name": "丛林小木箱",
                        "c": 10,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "j21_jungle_mushroom_9_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j21_jungle_rock_8_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j21_jungle_stump_3_6",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 3,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j21_jungle_mushroom_11_0",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "22": {
        "id": 22,
        "name": "第 2 季 第 10 关: 绿野梯道",
        "bgSrc": "assets/official/jungle/stages/stage10_full_map.png?v=20260925_up1row_v2",
        "availableTowers": [
            "DIV_FROST",
            "ROCKET"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 40,
                "y": 200
            },
            {
                "x": 200,
                "y": 200
            },
            {
                "x": 200,
                "y": 280
            },
            {
                "x": 280,
                "y": 280
            },
            {
                "x": 280,
                "y": 360
            },
            {
                "x": 520,
                "y": 360
            },
            {
                "x": 520,
                "y": 440
            },
            {
                "x": 680,
                "y": 440
            },
            {
                "x": 680,
                "y": 200
            },
            {
                "x": 760,
                "y": 200
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 920,
                "y": 120
            }
        ],
        "pathCells": [
            "0,2",
            "1,2",
            "2,2",
            "2,3",
            "3,3",
            "3,4",
            "4,4",
            "5,4",
            "6,4",
            "6,5",
            "7,5",
            "8,5",
            "8,4",
            "8,3",
            "8,2",
            "9,2",
            "9,1",
            "10,1",
            "11,1"
        ],
        "startPortal": {
            "x": 40,
            "y": 200
        },
        "baseCrystal": {
            "x": 920,
            "y": 120,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 8,
                "r": 1,
                "x": 680,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "j22_jungle_chest_big_0_0",
                        "type": "jungle_chest_big",
                        "name": "远古大金箱",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "ROCKET",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "j22_jungle_tree_big_10_5",
                        "type": "jungle_tree_big",
                        "name": "热带古树",
                        "c": 10,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_tree_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "j22_jungle_hut_0_5",
                        "type": "jungle_hut",
                        "name": "原始树屋",
                        "c": 0,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_hut.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "j22_jungle_totem_2_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 2,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j22_jungle_totem_9_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 9,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j22_jungle_chest_small_8_6",
                        "type": "jungle_chest_small",
                        "name": "丛林小木箱",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "j22_jungle_mushroom_3_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 3,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j22_jungle_rock_7_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 7,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j22_jungle_stump_11_0",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "23": {
        "id": 23,
        "name": "第 2 季 第 11 关: 繁茂长峡",
        "bgSrc": "assets/official/jungle/stages/stage11_full_map.png?v=20260925_up1row_v2",
        "availableTowers": [
            "FAN",
            "DIV_FROST",
            "GEOM_LASER",
            "BALL",
            "FIRE_BOTTLE",
            "MUL_CANNON",
            "ROCKET"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 200,
                "y": 440
            },
            {
                "x": 760,
                "y": 440
            },
            {
                "x": 760,
                "y": 360
            },
            {
                "x": 280,
                "y": 360
            },
            {
                "x": 280,
                "y": 280
            },
            {
                "x": 680,
                "y": 280
            },
            {
                "x": 680,
                "y": 200
            },
            {
                "x": 360,
                "y": 200
            },
            {
                "x": 360,
                "y": 120
            },
            {
                "x": 760,
                "y": 120
            }
        ],
        "pathCells": [
            "2,5",
            "3,5",
            "4,5",
            "5,5",
            "6,5",
            "7,5",
            "8,5",
            "9,5",
            "9,4",
            "8,4",
            "7,4",
            "6,4",
            "5,4",
            "4,4",
            "3,4",
            "3,3",
            "4,3",
            "5,3",
            "6,3",
            "7,3",
            "8,3",
            "8,2",
            "7,2",
            "6,2",
            "5,2",
            "4,2",
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1"
        ],
        "startPortal": {
            "x": 200,
            "y": 440
        },
        "baseCrystal": {
            "x": 760,
            "y": 120,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "j23_jungle_chest_big_0_0",
                        "type": "jungle_chest_big",
                        "name": "远古大金箱",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "DIV_FROST",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "j23_jungle_tree_big_10_5",
                        "type": "jungle_tree_big",
                        "name": "热带古树",
                        "c": 10,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_tree_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "j23_jungle_totem_0_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 0,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j23_jungle_totem_1_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 1,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j23_jungle_chest_small_9_6",
                        "type": "jungle_chest_small",
                        "name": "丛林小木箱",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "j23_jungle_mushroom_2_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 2,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j23_jungle_rock_8_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j23_jungle_stump_3_6",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 3,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j23_jungle_mushroom_7_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 7,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "24": {
        "id": 24,
        "name": "第 2 季 第 12 关: 丛林大决战",
        "bgSrc": "assets/official/jungle/stages/stage12_full_map.png?v=20260925_up1row_v2",
        "availableTowers": [
            "ADD_RAPID",
            "DIV_FROST",
            "FAN",
            "GEOM_LASER",
            "BALL",
            "FIRE_BOTTLE",
            "MUL_CANNON"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 120,
                "y": 200
            },
            {
                "x": 280,
                "y": 200
            },
            {
                "x": 280,
                "y": 120
            },
            {
                "x": 520,
                "y": 120
            },
            {
                "x": 520,
                "y": 200
            },
            {
                "x": 600,
                "y": 200
            },
            {
                "x": 600,
                "y": 120
            },
            {
                "x": 840,
                "y": 120
            },
            {
                "x": 840,
                "y": 440
            },
            {
                "x": 600,
                "y": 440
            },
            {
                "x": 600,
                "y": 280
            },
            {
                "x": 520,
                "y": 280
            },
            {
                "x": 520,
                "y": 440
            },
            {
                "x": 280,
                "y": 440
            },
            {
                "x": 280,
                "y": 280
            },
            {
                "x": 120,
                "y": 280
            },
            {
                "x": 120,
                "y": 440
            }
        ],
        "pathCells": [
            "1,2",
            "2,2",
            "3,2",
            "3,1",
            "4,1",
            "5,1",
            "6,1",
            "6,2",
            "7,2",
            "7,1",
            "8,1",
            "9,1",
            "10,1",
            "10,2",
            "10,3",
            "10,4",
            "10,5",
            "9,5",
            "8,5",
            "7,5",
            "7,4",
            "7,3",
            "6,3",
            "6,4",
            "6,5",
            "5,5",
            "4,5",
            "3,5",
            "3,4",
            "3,3",
            "2,3",
            "1,3",
            "1,4",
            "1,5"
        ],
        "startPortal": {
            "x": 120,
            "y": 200
        },
        "baseCrystal": {
            "x": 120,
            "y": 440,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "j24_jungle_chest_big_0_0",
                        "type": "jungle_chest_big",
                        "name": "远古大金箱",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "DIV_FROST",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "j24_jungle_totem_0_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 0,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j24_jungle_totem_11_5",
                        "type": "jungle_totem",
                        "name": "雨林图腾柱",
                        "c": 11,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/jungle_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "j24_jungle_chest_small_10_6",
                        "type": "jungle_chest_small",
                        "name": "丛林小木箱",
                        "c": 10,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "j24_jungle_mushroom_2_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 2,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j24_jungle_rock_3_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 3,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j24_jungle_stump_9_6",
                        "type": "jungle_stump",
                        "name": "远古树桩",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_stump.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j24_jungle_mushroom_1_6",
                        "type": "jungle_mushroom",
                        "name": "巨型毒蘑菇",
                        "c": 1,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_mushroom.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "j24_jungle_rock_8_6",
                        "type": "jungle_rock",
                        "name": "苔藓青石",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/jungle_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "25": {
        "id": 25,
        "name": "第 3 季 第 1 关: 荒漠风暴",
        "bgSrc": "assets/official/desert/stages/stage1_full_map.png?v=20260925_theme3_v1",
        "availableTowers": [
            "PIN",
            "ADD_RAPID",
            "DIV_FROST",
            "FAN"
        ],
        "maxWaves": 15,
        "waypoints": [
            {
                "x": 40,
                "y": 200
            },
            {
                "x": 200,
                "y": 200
            },
            {
                "x": 200,
                "y": 440
            },
            {
                "x": 360,
                "y": 440
            },
            {
                "x": 360,
                "y": 280
            },
            {
                "x": 600,
                "y": 280
            },
            {
                "x": 600,
                "y": 440
            },
            {
                "x": 840,
                "y": 440
            },
            {
                "x": 840,
                "y": 120
            }
        ],
        "pathCells": [
            "0,2",
            "1,2",
            "2,2",
            "2,3",
            "2,4",
            "2,5",
            "3,5",
            "4,5",
            "4,4",
            "4,3",
            "5,3",
            "6,3",
            "7,3",
            "7,4",
            "7,5",
            "8,5",
            "9,5",
            "10,5",
            "10,4",
            "10,3",
            "10,2",
            "10,1"
        ],
        "startPortal": {
            "x": 40,
            "y": 200
        },
        "baseCrystal": {
            "x": 840,
            "y": 120,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 9,
                "r": 1,
                "x": 760,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "d25_desert_chest_big_0_0",
                        "type": "desert_chest_big",
                        "name": "法老大金棺",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "ADD_RAPID",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d25_desert_cactus_big_0_5",
                        "type": "desert_cactus_big",
                        "name": "巨型沙丘仙人掌",
                        "c": 0,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_cactus_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "d25_desert_totem_11_5",
                        "type": "desert_totem",
                        "name": "古遗迹图腾柱",
                        "c": 11,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "d25_desert_skull_fossils_11_0",
                        "type": "desert_skull_fossils",
                        "name": "巨兽骨骼化石",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_skull_fossils.png",
                        "hp": 2000,
                        "rewardGold": 150,
                        "hiddenTower": {
                                    "typeKey": "DIV_FROST",
                                    "level": 1,
                                    "slotC": 11,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d25_desert_chest_small_2_6",
                        "type": "desert_chest_small",
                        "name": "金光秘宝壶",
                        "c": 2,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "d25_desert_cactus_small_9_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d25_desert_bush_10_6",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 10,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d25_desert_rock_8_6",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d25_desert_cactus_small_3_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 3,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "26": {
        "id": 26,
        "name": "第 3 季 第 2 关: 烈日峡谷",
        "bgSrc": "assets/official/desert/stages/stage2_full_map.png?v=20260925_theme3_v1",
        "availableTowers": [
            "PIN",
            "ADD_RAPID",
            "FAN",
            "GEOM_LASER"
        ],
        "maxWaves": 15,
        "waypoints": [
            {
                "x": 600,
                "y": 360
            },
            {
                "x": 600,
                "y": 520
            },
            {
                "x": 200,
                "y": 520
            },
            {
                "x": 200,
                "y": 360
            },
            {
                "x": 120,
                "y": 360
            },
            {
                "x": 120,
                "y": 280
            },
            {
                "x": 360,
                "y": 280
            },
            {
                "x": 360,
                "y": 200
            },
            {
                "x": 600,
                "y": 200
            },
            {
                "x": 600,
                "y": 120
            },
            {
                "x": 840,
                "y": 120
            },
            {
                "x": 840,
                "y": 440
            }
        ],
        "pathCells": [
            "7,4",
            "7,5",
            "7,6",
            "6,6",
            "5,6",
            "4,6",
            "3,6",
            "2,6",
            "2,5",
            "2,4",
            "1,4",
            "1,3",
            "2,3",
            "3,3",
            "4,3",
            "4,2",
            "5,2",
            "6,2",
            "7,2",
            "7,1",
            "8,1",
            "9,1",
            "10,1",
            "10,2",
            "10,3",
            "10,4",
            "10,5"
        ],
        "startPortal": {
            "x": 600,
            "y": 360
        },
        "baseCrystal": {
            "x": 840,
            "y": 440,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 4,
                "r": 1,
                "x": 360,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 5,
                "r": 1,
                "x": 440,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "d26_desert_chest_big_0_0",
                        "type": "desert_chest_big",
                        "name": "法老大金棺",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "ADD_RAPID",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d26_desert_cactus_big_0_5",
                        "type": "desert_cactus_big",
                        "name": "巨型沙丘仙人掌",
                        "c": 0,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_cactus_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "d26_desert_totem_11_5",
                        "type": "desert_totem",
                        "name": "古遗迹图腾柱",
                        "c": 11,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "d26_desert_skull_fossils_11_0",
                        "type": "desert_skull_fossils",
                        "name": "巨兽骨骼化石",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_skull_fossils.png",
                        "hp": 2000,
                        "rewardGold": 150,
                        "hiddenTower": {
                                    "typeKey": "FAN",
                                    "level": 1,
                                    "slotC": 11,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d26_desert_chest_small_9_6",
                        "type": "desert_chest_small",
                        "name": "金光秘宝壶",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "d26_desert_cactus_small_10_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 10,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d26_desert_bush_8_6",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d26_desert_rock_10_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 10,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d26_desert_cactus_small_2_0",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 2,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "27": {
        "id": 27,
        "name": "第 3 季 第 3 关: 鸣沙古道",
        "bgSrc": "assets/official/desert/stages/stage3_full_map.png?v=20260925_theme3_v1",
        "availableTowers": [
            "PIN",
            "ARROW",
            "DIV_FROST",
            "BALL"
        ],
        "maxWaves": 16,
        "waypoints": [
            {
                "x": 40,
                "y": 200
            },
            {
                "x": 440,
                "y": 200
            },
            {
                "x": 440,
                "y": 520
            },
            {
                "x": 920,
                "y": 520
            }
        ],
        "pathCells": [
            "0,2",
            "1,2",
            "2,2",
            "3,2",
            "4,2",
            "5,2",
            "5,3",
            "5,4",
            "5,5",
            "5,6",
            "6,6",
            "7,6",
            "8,6",
            "9,6",
            "10,6",
            "11,6"
        ],
        "startPortal": {
            "x": 40,
            "y": 200
        },
        "baseCrystal": {
            "x": 920,
            "y": 520,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 4,
                "r": 1,
                "x": 360,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 5,
                "r": 1,
                "x": 440,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "d27_desert_chest_big_0_0",
                        "type": "desert_chest_big",
                        "name": "法老大金棺",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "ARROW",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d27_desert_totem_0_5",
                        "type": "desert_totem",
                        "name": "古遗迹图腾柱",
                        "c": 0,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "d27_desert_skull_fossils_11_0",
                        "type": "desert_skull_fossils",
                        "name": "巨兽骨骼化石",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_skull_fossils.png",
                        "hp": 2000,
                        "rewardGold": 150,
                        "hiddenTower": {
                                    "typeKey": "DIV_FROST",
                                    "level": 1,
                                    "slotC": 11,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d27_desert_chest_small_1_6",
                        "type": "desert_chest_small",
                        "name": "金光秘宝壶",
                        "c": 1,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "d27_desert_cactus_small_10_0",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 10,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d27_desert_bush_2_0",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 2,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d27_desert_rock_9_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 9,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d27_desert_cactus_small_3_0",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 3,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d27_desert_rock_8_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 8,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "28": {
        "id": 28,
        "name": "第 3 季 第 4 关: 尘烟回廊",
        "bgSrc": "assets/official/desert/stages/stage4_full_map.png?v=20260925_theme3_v1",
        "availableTowers": [
            "ARROW",
            "DIV_FROST",
            "MUL_CANNON",
            "FIRE_BOTTLE"
        ],
        "maxWaves": 16,
        "waypoints": [
            {
                "x": 440,
                "y": 120
            },
            {
                "x": 440,
                "y": 200
            },
            {
                "x": 120,
                "y": 200
            },
            {
                "x": 120,
                "y": 440
            },
            {
                "x": 200,
                "y": 440
            },
            {
                "x": 200,
                "y": 520
            },
            {
                "x": 440,
                "y": 520
            },
            {
                "x": 440,
                "y": 360
            },
            {
                "x": 680,
                "y": 360
            },
            {
                "x": 680,
                "y": 440
            },
            {
                "x": 840,
                "y": 440
            },
            {
                "x": 840,
                "y": 120
            },
            {
                "x": 680,
                "y": 120
            }
        ],
        "pathCells": [
            "5,1",
            "5,2",
            "4,2",
            "3,2",
            "2,2",
            "1,2",
            "1,3",
            "1,4",
            "1,5",
            "2,5",
            "2,6",
            "3,6",
            "4,6",
            "5,6",
            "5,5",
            "5,4",
            "6,4",
            "7,4",
            "8,4",
            "8,5",
            "9,5",
            "10,5",
            "10,4",
            "10,3",
            "10,2",
            "10,1",
            "9,1",
            "8,1"
        ],
        "startPortal": {
            "x": 440,
            "y": 120
        },
        "baseCrystal": {
            "x": 680,
            "y": 120,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 4,
                "r": 1,
                "x": 360,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 49,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 50,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 51,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 52,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "d28_desert_chest_big_0_0",
                        "type": "desert_chest_big",
                        "name": "法老大金棺",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "DIV_FROST",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d28_desert_totem_0_5",
                        "type": "desert_totem",
                        "name": "古遗迹图腾柱",
                        "c": 0,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "d28_desert_skull_fossils_11_5",
                        "type": "desert_skull_fossils",
                        "name": "巨兽骨骼化石",
                        "c": 11,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_skull_fossils.png",
                        "hp": 2000,
                        "rewardGold": 150,
                        "hiddenTower": {
                                    "typeKey": "MUL_CANNON",
                                    "level": 1,
                                    "slotC": 11,
                                    "slotR": 5
                        }
            },
            {
                        "id": "d28_desert_chest_small_1_6",
                        "type": "desert_chest_small",
                        "name": "金光秘宝壶",
                        "c": 1,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "d28_desert_cactus_small_9_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d28_desert_bush_11_0",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d28_desert_rock_10_6",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 10,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d28_desert_cactus_small_8_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d28_desert_rock_10_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 10,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "29": {
        "id": 29,
        "name": "第 3 季 第 5 关: 瀚海沙丘",
        "bgSrc": "assets/official/desert/stages/stage5_full_map.png?v=20260925_theme3_v1",
        "availableTowers": [
            "PIN",
            "BLUE_STAR",
            "ARROW",
            "BALL"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 120,
                "y": 440
            },
            {
                "x": 120,
                "y": 120
            },
            {
                "x": 280,
                "y": 120
            },
            {
                "x": 280,
                "y": 200
            },
            {
                "x": 360,
                "y": 200
            },
            {
                "x": 360,
                "y": 280
            },
            {
                "x": 440,
                "y": 280
            },
            {
                "x": 440,
                "y": 360
            },
            {
                "x": 600,
                "y": 360
            },
            {
                "x": 600,
                "y": 280
            },
            {
                "x": 680,
                "y": 280
            },
            {
                "x": 680,
                "y": 200
            },
            {
                "x": 760,
                "y": 200
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 920,
                "y": 120
            }
        ],
        "pathCells": [
            "1,5",
            "1,4",
            "1,3",
            "1,2",
            "1,1",
            "2,1",
            "3,1",
            "3,2",
            "4,2",
            "4,3",
            "5,3",
            "5,4",
            "6,4",
            "7,4",
            "7,3",
            "8,3",
            "8,2",
            "9,2",
            "9,1",
            "10,1",
            "11,1"
        ],
        "startPortal": {
            "x": 120,
            "y": 440
        },
        "baseCrystal": {
            "x": 920,
            "y": 120,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 4,
                "r": 1,
                "x": 360,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 5,
                "r": 1,
                "x": 440,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 8,
                "r": 1,
                "x": 680,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "d29_desert_chest_big_10_5",
                        "type": "desert_chest_big",
                        "name": "法老大金棺",
                        "c": 10,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "BLUE_STAR",
                                    "level": 2,
                                    "slotC": 10,
                                    "slotR": 5
                        }
            },
            {
                        "id": "d29_desert_cactus_big_2_5",
                        "type": "desert_cactus_big",
                        "name": "巨型沙丘仙人掌",
                        "c": 2,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_cactus_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "d29_desert_totem_0_0",
                        "type": "desert_totem",
                        "name": "古遗迹图腾柱",
                        "c": 0,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "d29_desert_skull_fossils_0_5",
                        "type": "desert_skull_fossils",
                        "name": "巨兽骨骼化石",
                        "c": 0,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_skull_fossils.png",
                        "hp": 2000,
                        "rewardGold": 150,
                        "hiddenTower": {
                                    "typeKey": "ARROW",
                                    "level": 1,
                                    "slotC": 0,
                                    "slotR": 5
                        }
            },
            {
                        "id": "d29_desert_chest_small_1_0",
                        "type": "desert_chest_small",
                        "name": "金光秘宝壶",
                        "c": 1,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "d29_desert_cactus_small_9_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d29_desert_bush_11_0",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d29_desert_rock_1_6",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 1,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d29_desert_cactus_small_8_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "30": {
        "id": 30,
        "name": "第 3 季 第 6 关: 戈壁要塞",
        "bgSrc": "assets/official/desert/stages/stage6_full_map.png?v=20260925_theme3_v1",
        "availableTowers": [
            "PIN",
            "BLUE_STAR",
            "ARROW",
            "ROCKET",
            "FIRE_BOTTLE"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 120,
                "y": 440
            },
            {
                "x": 120,
                "y": 120
            },
            {
                "x": 360,
                "y": 120
            },
            {
                "x": 360,
                "y": 280
            },
            {
                "x": 600,
                "y": 280
            },
            {
                "x": 600,
                "y": 120
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 760,
                "y": 440
            },
            {
                "x": 920,
                "y": 440
            }
        ],
        "pathCells": [
            "1,5",
            "1,4",
            "1,3",
            "1,2",
            "1,1",
            "2,1",
            "3,1",
            "4,1",
            "4,2",
            "4,3",
            "5,3",
            "6,3",
            "7,3",
            "7,2",
            "7,1",
            "8,1",
            "9,1",
            "9,2",
            "9,3",
            "9,4",
            "9,5",
            "10,5",
            "11,5"
        ],
        "startPortal": {
            "x": 120,
            "y": 440
        },
        "baseCrystal": {
            "x": 920,
            "y": 440,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 5,
                "r": 1,
                "x": 440,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "d30_desert_totem_0_0",
                        "type": "desert_totem",
                        "name": "古遗迹图腾柱",
                        "c": 0,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "d30_desert_skull_fossils_0_5",
                        "type": "desert_skull_fossils",
                        "name": "巨兽骨骼化石",
                        "c": 0,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_skull_fossils.png",
                        "hp": 2000,
                        "rewardGold": 150,
                        "hiddenTower": {
                                    "typeKey": "ARROW",
                                    "level": 1,
                                    "slotC": 0,
                                    "slotR": 5
                        }
            },
            {
                        "id": "d30_desert_chest_small_1_0",
                        "type": "desert_chest_small",
                        "name": "金光秘宝壶",
                        "c": 1,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "d30_desert_cactus_small_11_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 11,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d30_desert_bush_9_6",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d30_desert_rock_2_6",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 2,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d30_desert_cactus_small_1_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 1,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d30_desert_rock_11_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d30_desert_bush_10_6",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 10,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "31": {
        "id": 31,
        "name": "第 3 季 第 7 关: 金色沙堡",
        "bgSrc": "assets/official/desert/stages/stage7_full_map.png?v=20260925_theme3_v1",
        "availableTowers": [
            "ADD_RAPID",
            "BLUE_STAR",
            "FAN",
            "BALL",
            "MUL_CANNON"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 280,
                "y": 520
            },
            {
                "x": 280,
                "y": 440
            },
            {
                "x": 120,
                "y": 440
            },
            {
                "x": 120,
                "y": 120
            },
            {
                "x": 280,
                "y": 120
            },
            {
                "x": 280,
                "y": 200
            },
            {
                "x": 520,
                "y": 200
            },
            {
                "x": 520,
                "y": 120
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 760,
                "y": 200
            },
            {
                "x": 840,
                "y": 200
            },
            {
                "x": 840,
                "y": 440
            },
            {
                "x": 600,
                "y": 440
            }
        ],
        "pathCells": [
            "3,6",
            "3,5",
            "2,5",
            "1,5",
            "1,4",
            "1,3",
            "1,2",
            "1,1",
            "2,1",
            "3,1",
            "3,2",
            "4,2",
            "5,2",
            "6,2",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "9,2",
            "10,2",
            "10,3",
            "10,4",
            "10,5",
            "9,5",
            "8,5",
            "7,5"
        ],
        "startPortal": {
            "x": 280,
            "y": 520
        },
        "baseCrystal": {
            "x": 600,
            "y": 440,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 4,
                "r": 1,
                "x": 360,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 5,
                "r": 1,
                "x": 440,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 49,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 50,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 51,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 52,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 53,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 54,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "d31_desert_totem_0_0",
                        "type": "desert_totem",
                        "name": "古遗迹图腾柱",
                        "c": 0,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "d31_desert_skull_fossils_11_5",
                        "type": "desert_skull_fossils",
                        "name": "巨兽骨骼化石",
                        "c": 11,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_skull_fossils.png",
                        "hp": 2000,
                        "rewardGold": 150,
                        "hiddenTower": {
                                    "typeKey": "FAN",
                                    "level": 1,
                                    "slotC": 11,
                                    "slotR": 5
                        }
            },
            {
                        "id": "d31_desert_chest_small_1_0",
                        "type": "desert_chest_small",
                        "name": "金光秘宝壶",
                        "c": 1,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "d31_desert_cactus_small_0_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 0,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d31_desert_bush_1_6",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 1,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d31_desert_rock_2_6",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 2,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d31_desert_cactus_small_9_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d31_desert_rock_11_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d31_desert_bush_10_6",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 10,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "32": {
        "id": 32,
        "name": "第 3 季 第 8 关: 热风迷径",
        "bgSrc": "assets/official/desert/stages/stage8_full_map.png?v=20260925_theme3_v1",
        "availableTowers": [
            "PIN",
            "ARROW",
            "BLUE_STAR",
            "ROCKET",
            "FIRE_BOTTLE"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 680,
                "y": 520
            },
            {
                "x": 280,
                "y": 520
            },
            {
                "x": 280,
                "y": 360
            },
            {
                "x": 120,
                "y": 360
            },
            {
                "x": 120,
                "y": 280
            },
            {
                "x": 680,
                "y": 280
            },
            {
                "x": 680,
                "y": 200
            },
            {
                "x": 840,
                "y": 200
            },
            {
                "x": 840,
                "y": 520
            }
        ],
        "pathCells": [
            "8,6",
            "7,6",
            "6,6",
            "5,6",
            "4,6",
            "3,6",
            "3,5",
            "3,4",
            "2,4",
            "1,4",
            "1,3",
            "2,3",
            "3,3",
            "4,3",
            "5,3",
            "6,3",
            "7,3",
            "8,3",
            "8,2",
            "9,2",
            "10,2",
            "10,3",
            "10,4",
            "10,5",
            "10,6"
        ],
        "startPortal": {
            "x": 680,
            "y": 520
        },
        "baseCrystal": {
            "x": 840,
            "y": 520,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 8,
                "r": 1,
                "x": 680,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 9,
                "r": 1,
                "x": 760,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "d32_desert_chest_big_0_0",
                        "type": "desert_chest_big",
                        "name": "法老大金棺",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "ARROW",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d32_desert_totem_11_0",
                        "type": "desert_totem",
                        "name": "古遗迹图腾柱",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "d32_desert_skull_fossils_0_5",
                        "type": "desert_skull_fossils",
                        "name": "巨兽骨骼化石",
                        "c": 0,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_skull_fossils.png",
                        "hp": 2000,
                        "rewardGold": 150,
                        "hiddenTower": {
                                    "typeKey": "BLUE_STAR",
                                    "level": 1,
                                    "slotC": 0,
                                    "slotR": 5
                        }
            },
            {
                        "id": "d32_desert_chest_small_1_6",
                        "type": "desert_chest_small",
                        "name": "金光秘宝壶",
                        "c": 1,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "d32_desert_cactus_small_11_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 11,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d32_desert_bush_9_6",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d32_desert_rock_10_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 10,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d32_desert_cactus_small_2_0",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 2,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d32_desert_rock_9_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 9,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "33": {
        "id": 33,
        "name": "第 3 季 第 9 关: 绿洲遗迹",
        "bgSrc": "assets/official/desert/stages/stage9_full_map.png?v=20260925_theme3_v1",
        "availableTowers": [
            "ARROW",
            "BLUE_STAR",
            "BALL",
            "MUL_CANNON",
            "FAN"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 840,
                "y": 120
            },
            {
                "x": 200,
                "y": 120
            },
            {
                "x": 200,
                "y": 200
            },
            {
                "x": 760,
                "y": 200
            },
            {
                "x": 760,
                "y": 280
            },
            {
                "x": 120,
                "y": 280
            },
            {
                "x": 120,
                "y": 360
            },
            {
                "x": 840,
                "y": 360
            },
            {
                "x": 840,
                "y": 440
            },
            {
                "x": 200,
                "y": 440
            },
            {
                "x": 200,
                "y": 520
            },
            {
                "x": 520,
                "y": 520
            }
        ],
        "pathCells": [
            "10,1",
            "9,1",
            "8,1",
            "7,1",
            "6,1",
            "5,1",
            "4,1",
            "3,1",
            "2,1",
            "2,2",
            "3,2",
            "4,2",
            "5,2",
            "6,2",
            "7,2",
            "8,2",
            "9,2",
            "9,3",
            "8,3",
            "7,3",
            "6,3",
            "5,3",
            "4,3",
            "3,3",
            "2,3",
            "1,3",
            "1,4",
            "2,4",
            "3,4",
            "4,4",
            "5,4",
            "6,4",
            "7,4",
            "8,4",
            "9,4",
            "10,4",
            "10,5",
            "9,5",
            "8,5",
            "7,5",
            "6,5",
            "5,5",
            "4,5",
            "3,5",
            "2,5",
            "2,6",
            "3,6",
            "4,6",
            "5,6",
            "6,6"
        ],
        "startPortal": {
            "x": 840,
            "y": 120
        },
        "baseCrystal": {
            "x": 520,
            "y": 520,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "d33_desert_chest_big_0_0",
                        "type": "desert_chest_big",
                        "name": "法老大金棺",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "BLUE_STAR",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d33_desert_cactus_big_0_5",
                        "type": "desert_cactus_big",
                        "name": "巨型沙丘仙人掌",
                        "c": 0,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_cactus_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "d33_desert_totem_11_5",
                        "type": "desert_totem",
                        "name": "古遗迹图腾柱",
                        "c": 11,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "d33_desert_skull_fossils_11_0",
                        "type": "desert_skull_fossils",
                        "name": "巨兽骨骼化石",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_skull_fossils.png",
                        "hp": 2000,
                        "rewardGold": 150,
                        "hiddenTower": {
                                    "typeKey": "BALL",
                                    "level": 1,
                                    "slotC": 11,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d33_desert_chest_small_9_6",
                        "type": "desert_chest_small",
                        "name": "金光秘宝壶",
                        "c": 9,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "d33_desert_cactus_small_10_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 10,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d33_desert_bush_8_6",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 8,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d33_desert_rock_10_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 10,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d33_desert_cactus_small_2_0",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 2,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "34": {
        "id": 34,
        "name": "第 3 季 第 10 关: 烈焰飞砂",
        "bgSrc": "assets/official/desert/stages/stage10_full_map.png?v=20260925_theme3_v1",
        "availableTowers": [
            "PIN",
            "BLUE_STAR",
            "ROCKET",
            "FIRE_BOTTLE"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 760,
                "y": 200
            },
            {
                "x": 200,
                "y": 200
            },
            {
                "x": 200,
                "y": 280
            },
            {
                "x": 360,
                "y": 280
            },
            {
                "x": 360,
                "y": 440
            },
            {
                "x": 760,
                "y": 440
            },
            {
                "x": 760,
                "y": 520
            },
            {
                "x": 200,
                "y": 520
            }
        ],
        "pathCells": [
            "9,2",
            "8,2",
            "7,2",
            "6,2",
            "5,2",
            "4,2",
            "3,2",
            "2,2",
            "2,3",
            "3,3",
            "4,3",
            "4,4",
            "4,5",
            "5,5",
            "6,5",
            "7,5",
            "8,5",
            "9,5",
            "9,6",
            "8,6",
            "7,6",
            "6,6",
            "5,6",
            "4,6",
            "3,6",
            "2,6"
        ],
        "startPortal": {
            "x": 760,
            "y": 200
        },
        "baseCrystal": {
            "x": 200,
            "y": 520,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 4,
                "r": 1,
                "x": 360,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 5,
                "r": 1,
                "x": 440,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 8,
                "r": 1,
                "x": 680,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 9,
                "r": 1,
                "x": 760,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "d34_desert_chest_big_0_0",
                        "type": "desert_chest_big",
                        "name": "法老大金棺",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "BLUE_STAR",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d34_desert_totem_11_0",
                        "type": "desert_totem",
                        "name": "古遗迹图腾柱",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "d34_desert_skull_fossils_0_5",
                        "type": "desert_skull_fossils",
                        "name": "巨兽骨骼化石",
                        "c": 0,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_skull_fossils.png",
                        "hp": 2000,
                        "rewardGold": 150,
                        "hiddenTower": {
                                    "typeKey": "ROCKET",
                                    "level": 1,
                                    "slotC": 0,
                                    "slotR": 5
                        }
            },
            {
                        "id": "d34_desert_chest_small_11_6",
                        "type": "desert_chest_small",
                        "name": "金光秘宝壶",
                        "c": 11,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "d34_desert_cactus_small_10_0",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 10,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d34_desert_bush_2_0",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 2,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d34_desert_rock_9_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 9,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d34_desert_cactus_small_3_0",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 3,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d34_desert_rock_8_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 8,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "35": {
        "id": 35,
        "name": "第 3 季 第 11 关: 荒蛮绝壁",
        "bgSrc": "assets/official/desert/stages/stage11_full_map.png?v=20260925_theme3_v1",
        "availableTowers": [
            "PIN",
            "ARROW",
            "BLUE_STAR",
            "BALL",
            "ROCKET",
            "FIRE_BOTTLE"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 120,
                "y": 280
            },
            {
                "x": 120,
                "y": 440
            },
            {
                "x": 280,
                "y": 440
            },
            {
                "x": 280,
                "y": 520
            },
            {
                "x": 440,
                "y": 520
            },
            {
                "x": 440,
                "y": 440
            },
            {
                "x": 520,
                "y": 440
            },
            {
                "x": 520,
                "y": 280
            },
            {
                "x": 600,
                "y": 280
            },
            {
                "x": 600,
                "y": 200
            },
            {
                "x": 840,
                "y": 200
            },
            {
                "x": 840,
                "y": 360
            }
        ],
        "pathCells": [
            "1,3",
            "1,4",
            "1,5",
            "2,5",
            "3,5",
            "3,6",
            "4,6",
            "5,6",
            "5,5",
            "6,5",
            "6,4",
            "6,3",
            "7,3",
            "7,2",
            "8,2",
            "9,2",
            "10,2",
            "10,3",
            "10,4"
        ],
        "startPortal": {
            "x": 120,
            "y": 280
        },
        "baseCrystal": {
            "x": 840,
            "y": 360,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 8,
                "r": 1,
                "x": 680,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 9,
                "r": 1,
                "x": 760,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "d35_desert_chest_big_0_0",
                        "type": "desert_chest_big",
                        "name": "法老大金棺",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "ARROW",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d35_desert_totem_11_0",
                        "type": "desert_totem",
                        "name": "古遗迹图腾柱",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "d35_desert_skull_fossils_0_5",
                        "type": "desert_skull_fossils",
                        "name": "巨兽骨骼化石",
                        "c": 0,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_skull_fossils.png",
                        "hp": 2000,
                        "rewardGold": 150,
                        "hiddenTower": {
                                    "typeKey": "BLUE_STAR",
                                    "level": 1,
                                    "slotC": 0,
                                    "slotR": 5
                        }
            },
            {
                        "id": "d35_desert_chest_small_2_6",
                        "type": "desert_chest_small",
                        "name": "金光秘宝壶",
                        "c": 2,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "d35_desert_cactus_small_10_6",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 10,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d35_desert_bush_11_6",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 11,
                        "r": 6,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d35_desert_rock_10_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 10,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d35_desert_cactus_small_2_0",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 2,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d35_desert_rock_9_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 9,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "36": {
        "id": 36,
        "name": "第 3 季 第 12 关: 沙漠大决战",
        "bgSrc": "assets/official/desert/stages/stage12_full_map.png?v=20260925_theme3_v1",
        "availableTowers": [
            "PIN",
            "ARROW",
            "BLUE_STAR",
            "BALL",
            "MUL_CANNON",
            "ROCKET",
            "FIRE_BOTTLE"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 840,
                "y": 200
            },
            {
                "x": 520,
                "y": 200
            },
            {
                "x": 520,
                "y": 120
            },
            {
                "x": 920,
                "y": 120
            },
            {
                "x": 920,
                "y": 280
            },
            {
                "x": 440,
                "y": 280
            },
            {
                "x": 440,
                "y": 120
            },
            {
                "x": 280,
                "y": 120
            },
            {
                "x": 280,
                "y": 200
            },
            {
                "x": 120,
                "y": 200
            },
            {
                "x": 120,
                "y": 360
            },
            {
                "x": 280,
                "y": 360
            },
            {
                "x": 280,
                "y": 520
            },
            {
                "x": 440,
                "y": 520
            },
            {
                "x": 440,
                "y": 360
            },
            {
                "x": 920,
                "y": 360
            },
            {
                "x": 920,
                "y": 520
            },
            {
                "x": 520,
                "y": 520
            },
            {
                "x": 520,
                "y": 440
            },
            {
                "x": 760,
                "y": 440
            }
        ],
        "pathCells": [
            "10,2",
            "9,2",
            "8,2",
            "7,2",
            "6,2",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "10,1",
            "11,1",
            "11,2",
            "11,3",
            "10,3",
            "9,3",
            "8,3",
            "7,3",
            "6,3",
            "5,3",
            "5,2",
            "5,1",
            "4,1",
            "3,1",
            "3,2",
            "2,2",
            "1,2",
            "1,3",
            "1,4",
            "2,4",
            "3,4",
            "3,5",
            "3,6",
            "4,6",
            "5,6",
            "5,5",
            "5,4",
            "6,4",
            "7,4",
            "8,4",
            "9,4",
            "10,4",
            "11,4",
            "11,5",
            "11,6",
            "10,6",
            "9,6",
            "8,6",
            "7,6",
            "6,6",
            "6,5",
            "7,5",
            "8,5",
            "9,5"
        ],
        "startPortal": {
            "x": 840,
            "y": 200
        },
        "baseCrystal": {
            "x": 760,
            "y": 440,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 2,
                "r": 1,
                "x": 200,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ],
        "props": [
            {
                        "id": "d36_desert_chest_big_0_0",
                        "type": "desert_chest_big",
                        "name": "法老大金棺",
                        "c": 0,
                        "r": 0,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_chest_big.png",
                        "hp": 3200,
                        "rewardGold": 200,
                        "hiddenTower": {
                                    "typeKey": "ARROW",
                                    "level": 2,
                                    "slotC": 0,
                                    "slotR": 0
                        }
            },
            {
                        "id": "d36_desert_cactus_big_0_5",
                        "type": "desert_cactus_big",
                        "name": "巨型沙丘仙人掌",
                        "c": 0,
                        "r": 5,
                        "wCells": 2,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_cactus_big.png",
                        "hp": 2000,
                        "rewardGold": 160
            },
            {
                        "id": "d36_desert_totem_2_5",
                        "type": "desert_totem",
                        "name": "古遗迹图腾柱",
                        "c": 2,
                        "r": 5,
                        "wCells": 1,
                        "hCells": 2,
                        "spriteSrc": "assets/official/props/desert_totem.png",
                        "hp": 2000,
                        "rewardGold": 150
            },
            {
                        "id": "d36_desert_chest_small_11_0",
                        "type": "desert_chest_small",
                        "name": "金光秘宝壶",
                        "c": 11,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_chest_small.png",
                        "hp": 1000,
                        "rewardGold": 100
            },
            {
                        "id": "d36_desert_cactus_small_10_0",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 10,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d36_desert_bush_2_0",
                        "type": "desert_bush",
                        "name": "沙漠沙棘灌木",
                        "c": 2,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_bush.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d36_desert_rock_9_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 9,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d36_desert_cactus_small_3_0",
                        "type": "desert_cactus_small",
                        "name": "沙地刺仙人球",
                        "c": 3,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_cactus_small.png",
                        "hp": 550,
                        "rewardGold": 80
            },
            {
                        "id": "d36_desert_rock_8_0",
                        "type": "desert_rock",
                        "name": "风蚀风棱石",
                        "c": 8,
                        "r": 0,
                        "wCells": 1,
                        "hCells": 1,
                        "spriteSrc": "assets/official/props/desert_rock.png",
                        "hp": 550,
                        "rewardGold": 80
            }
]
    },
    "37": {
        "id": 37,
        "name": "第 4 季 第 1 关: 蔚蓝海域",
        "bgSrc": "assets/official/deepsea/stages/stage1_full_map.png?v=20260925_theme4_v1",
        "availableTowers": [
            "FISH",
            "PIN",
            "ADD_RAPID",
            "DIV_FROST"
        ],
        "maxWaves": 16,
        "waypoints": [
            {
                "x": 680,
                "y": 520
            },
            {
                "x": 680,
                "y": 360
            },
            {
                "x": 360,
                "y": 360
            },
            {
                "x": 360,
                "y": 440
            },
            {
                "x": 280,
                "y": 440
            },
            {
                "x": 280,
                "y": 280
            },
            {
                "x": 120,
                "y": 280
            },
            {
                "x": 120,
                "y": 40
            },
            {
                "x": 120,
                "y": 120
            },
            {
                "x": 840,
                "y": 120
            },
            {
                "x": 840,
                "y": 520
            }
        ],
        "pathCells": [
            "8,6",
            "8,5",
            "8,4",
            "7,4",
            "6,4",
            "5,4",
            "4,4",
            "4,5",
            "3,5",
            "3,4",
            "3,3",
            "2,3",
            "1,3",
            "1,2",
            "1,1",
            "1,0",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "10,1",
            "10,2",
            "10,3",
            "10,4",
            "10,5",
            "10,6"
        ],
        "startPortal": {
            "x": 680,
            "y": 520
        },
        "baseCrystal": {
            "x": 840,
            "y": 520,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 49,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ]
    },
    "38": {
        "id": 38,
        "name": "第 4 季 第 2 关: 珊瑚密径",
        "bgSrc": "assets/official/deepsea/stages/stage2_full_map.png?v=20260926_ocean_scale_v1",
        "availableTowers": [
            "FISH",
            "SNOW",
            "BLUE_STAR",
            "ARROW"
        ],
        "maxWaves": 16,
        "waypoints": [
            {
                "x": 360,
                "y": 40
            },
            {
                "x": 280,
                "y": 40
            },
            {
                "x": 280,
                "y": 280
            },
            {
                "x": 360,
                "y": 280
            },
            {
                "x": 360,
                "y": 360
            },
            {
                "x": 440,
                "y": 360
            },
            {
                "x": 440,
                "y": 440
            },
            {
                "x": 760,
                "y": 440
            }
        ],
        "pathCells": [
            "2,0",
            "3,0",
            "4,0",
            "2,1",
            "3,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "10,1",
            "3,2",
            "4,2",
            "5,2",
            "6,2",
            "7,2",
            "8,2",
            "9,2",
            "10,2",
            "3,3",
            "4,3",
            "5,3",
            "6,3",
            "7,3",
            "8,3",
            "9,3",
            "10,3",
            "4,4",
            "5,4",
            "6,4",
            "7,4",
            "8,4",
            "9,4",
            "10,4",
            "5,5",
            "6,5",
            "7,5",
            "8,5",
            "9,5"
        ],
        "startPortal": {
            "x": 360,
            "y": 40
        },
        "baseCrystal": {
            "x": 760,
            "y": 440,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 4,
                "r": 1,
                "x": 360,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ]
    },
    "39": {
        "id": 39,
        "name": "第 4 季 第 3 关: 潮汐暗流",
        "bgSrc": "assets/official/deepsea/stages/stage3_full_map.png?v=20260926_ocean_scale_v1",
        "availableTowers": [
            "PLANE",
            "FISH",
            "BLUE_STAR",
            "BALL"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 200,
                "y": 120
            },
            {
                "x": 200,
                "y": 40
            },
            {
                "x": 360,
                "y": 40
            },
            {
                "x": 360,
                "y": 120
            },
            {
                "x": 440,
                "y": 120
            },
            {
                "x": 440,
                "y": 280
            },
            {
                "x": 760,
                "y": 280
            },
            {
                "x": 760,
                "y": 360
            },
            {
                "x": 840,
                "y": 360
            }
        ],
        "pathCells": [
            "2,0",
            "3,0",
            "4,0",
            "5,0",
            "6,0",
            "9,0",
            "10,0",
            "2,1",
            "4,1",
            "5,1",
            "6,1",
            "9,1",
            "10,1",
            "5,2",
            "6,2",
            "7,2",
            "8,2",
            "9,2",
            "10,2",
            "5,3",
            "6,3",
            "7,3",
            "8,3",
            "9,3",
            "10,3",
            "6,4",
            "7,4",
            "9,4",
            "10,4"
        ],
        "startPortal": {
            "x": 200,
            "y": 120
        },
        "baseCrystal": {
            "x": 840,
            "y": 360,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 8,
                "r": 1,
                "x": 680,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 49,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 50,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 51,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 52,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 53,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 54,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 55,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ]
    },
    "40": {
        "id": 40,
        "name": "第 4 季 第 4 关: 珍珠海沟",
        "bgSrc": "assets/official/deepsea/stages/stage4_full_map.png?v=20260926_ocean_scale_v1",
        "availableTowers": [
            "ANCHOR",
            "PLANE",
            "SNOW",
            "FIRE_BOTTLE"
        ],
        "maxWaves": 18,
        "waypoints": [
            {
                "x": 760,
                "y": 360
            },
            {
                "x": 760,
                "y": 40
            },
            {
                "x": 120,
                "y": 40
            }
        ],
        "pathCells": [
            "1,0",
            "2,0",
            "3,0",
            "4,0",
            "5,0",
            "6,0",
            "7,0",
            "8,0",
            "9,0",
            "1,1",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "6,1",
            "8,1",
            "9,1",
            "1,2",
            "2,2",
            "3,2",
            "4,2",
            "5,2",
            "6,2",
            "7,2",
            "8,2",
            "9,2",
            "1,3",
            "2,3",
            "3,3",
            "5,3",
            "6,3",
            "7,3",
            "8,3",
            "9,3",
            "2,4",
            "3,4",
            "4,4",
            "6,4",
            "7,4",
            "9,4",
            "3,5",
            "4,5"
        ],
        "startPortal": {
            "x": 760,
            "y": 360
        },
        "baseCrystal": {
            "x": 120,
            "y": 40,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 7,
                "r": 1,
                "x": 600,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ]
    },
    "41": {
        "id": 41,
        "name": "第 4 季 第 5 关: 深海漩涡",
        "bgSrc": "assets/official/deepsea/stages/stage5_full_map.png?v=20260926_ocean_scale_v1",
        "availableTowers": [
            "CUTTLE",
            "ANCHOR",
            "BLUE_STAR",
            "FISH"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 120,
                "y": 40
            },
            {
                "x": 120,
                "y": 120
            },
            {
                "x": 440,
                "y": 120
            },
            {
                "x": 440,
                "y": 280
            },
            {
                "x": 520,
                "y": 280
            },
            {
                "x": 520,
                "y": 360
            },
            {
                "x": 600,
                "y": 360
            }
        ],
        "pathCells": [
            "1,0",
            "2,0",
            "8,0",
            "9,0",
            "1,1",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "5,2",
            "6,2",
            "7,2",
            "5,3",
            "6,3",
            "7,3",
            "6,4",
            "7,4"
        ],
        "startPortal": {
            "x": 120,
            "y": 40
        },
        "baseCrystal": {
            "x": 600,
            "y": 360,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 49,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 50,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 51,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 52,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 53,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 54,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 55,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 56,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 57,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 58,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 59,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 60,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 61,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 62,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 63,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ]
    },
    "42": {
        "id": 42,
        "name": "第 4 季 第 6 关: 幽蓝深渊",
        "bgSrc": "assets/official/deepsea/stages/stage6_full_map.png?v=20260926_ocean_scale_v1",
        "availableTowers": [
            "MUSHROOM",
            "CUTTLE",
            "PLANE",
            "FISH",
            "ROCKET"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 840,
                "y": 360
            },
            {
                "x": 760,
                "y": 360
            },
            {
                "x": 760,
                "y": 200
            },
            {
                "x": 360,
                "y": 200
            },
            {
                "x": 360,
                "y": 120
            },
            {
                "x": 280,
                "y": 120
            },
            {
                "x": 280,
                "y": 40
            },
            {
                "x": 200,
                "y": 40
            }
        ],
        "pathCells": [
            "2,0",
            "3,0",
            "7,0",
            "8,0",
            "1,1",
            "2,1",
            "3,1",
            "4,1",
            "7,1",
            "8,1",
            "9,1",
            "1,2",
            "2,2",
            "3,2",
            "4,2",
            "5,2",
            "6,2",
            "7,2",
            "8,2",
            "9,2",
            "1,3",
            "2,3",
            "3,3",
            "4,3",
            "5,3",
            "6,3",
            "7,3",
            "8,3",
            "9,3",
            "1,4",
            "2,4",
            "3,4",
            "4,4",
            "5,4",
            "6,4",
            "7,4",
            "8,4",
            "9,4",
            "10,4",
            "4,5",
            "5,5",
            "6,5",
            "7,5"
        ],
        "startPortal": {
            "x": 840,
            "y": 360
        },
        "baseCrystal": {
            "x": 200,
            "y": 40,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 5,
                "r": 1,
                "x": 440,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ]
    },
    "43": {
        "id": 43,
        "name": "第 4 季 第 7 关: 巨鲸遗冢",
        "bgSrc": "assets/official/deepsea/stages/stage7_full_map.png?v=20260926_ocean_scale_v1",
        "availableTowers": [
            "BUFF",
            "MUSHROOM",
            "CUTTLE",
            "PLANE",
            "ANCHOR"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 760,
                "y": 40
            },
            {
                "x": 760,
                "y": 200
            },
            {
                "x": 680,
                "y": 200
            },
            {
                "x": 680,
                "y": 280
            },
            {
                "x": 200,
                "y": 280
            }
        ],
        "pathCells": [
            "2,0",
            "3,0",
            "9,0",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "2,2",
            "3,2",
            "4,2",
            "5,2",
            "6,2",
            "7,2",
            "8,2",
            "9,2",
            "2,3",
            "3,3",
            "4,3",
            "5,3",
            "6,3",
            "7,3",
            "8,3"
        ],
        "startPortal": {
            "x": 760,
            "y": 40
        },
        "baseCrystal": {
            "x": 200,
            "y": 280,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 8,
                "r": 0,
                "x": 680,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 3,
                "r": 4,
                "x": 280,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 49,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 50,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 51,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 52,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 53,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 54,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 55,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 56,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 57,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 58,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ]
    },
    "44": {
        "id": 44,
        "name": "第 4 季 第 8 关: 遗落沉船",
        "bgSrc": "assets/official/deepsea/stages/stage8_full_map.png?v=20260926_ocean_scale_v1",
        "availableTowers": [
            "BUFF",
            "FISH",
            "SNOW",
            "PLANE",
            "FIRE_BOTTLE"
        ],
        "maxWaves": 20,
        "waypoints": [
            {
                "x": 200,
                "y": 120
            },
            {
                "x": 280,
                "y": 120
            },
            {
                "x": 280,
                "y": 280
            },
            {
                "x": 680,
                "y": 280
            }
        ],
        "pathCells": [
            "3,0",
            "4,0",
            "5,0",
            "6,0",
            "7,0",
            "8,0",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "3,2",
            "4,2",
            "5,2",
            "6,2",
            "7,2",
            "8,2",
            "3,3",
            "4,3",
            "5,3",
            "6,3",
            "7,3",
            "8,3",
            "3,4",
            "4,4",
            "5,4",
            "6,4",
            "2,5"
        ],
        "startPortal": {
            "x": 200,
            "y": 120
        },
        "baseCrystal": {
            "x": 680,
            "y": 280,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 2,
                "r": 0,
                "x": 200,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 9,
                "r": 0,
                "x": 760,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 9,
                "r": 1,
                "x": 760,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 2,
                "r": 2,
                "x": 200,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 2,
                "r": 3,
                "x": 200,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 2,
                "r": 4,
                "x": 200,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 49,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 50,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 51,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 52,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 53,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 54,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ]
    },
    "45": {
        "id": 45,
        "name": "第 4 季 第 9 关: 亚特兰蒂斯",
        "bgSrc": "assets/official/deepsea/stages/stage9_full_map.png?v=20260926_ocean_scale_v1",
        "availableTowers": [
            "BUFF",
            "ANCHOR",
            "CUTTLE",
            "MUSHROOM",
            "ROCKET"
        ],
        "maxWaves": 22,
        "waypoints": [
            {
                "x": 840,
                "y": 120
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 760,
                "y": 200
            },
            {
                "x": 600,
                "y": 200
            },
            {
                "x": 600,
                "y": 360
            },
            {
                "x": 200,
                "y": 360
            },
            {
                "x": 200,
                "y": 40
            },
            {
                "x": 120,
                "y": 40
            }
        ],
        "pathCells": [
            "1,0",
            "2,0",
            "8,0",
            "9,0",
            "1,1",
            "2,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "10,1",
            "1,2",
            "2,2",
            "5,2",
            "6,2",
            "7,2",
            "8,2",
            "9,2",
            "1,3",
            "2,3",
            "5,3",
            "6,3",
            "7,3",
            "9,3",
            "1,4",
            "2,4",
            "3,4",
            "4,4",
            "5,4",
            "6,4",
            "7,4",
            "2,5",
            "3,5",
            "4,5",
            "5,5",
            "6,5"
        ],
        "startPortal": {
            "x": 840,
            "y": 120
        },
        "baseCrystal": {
            "x": 120,
            "y": 40,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 3,
                "r": 0,
                "x": 280,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 3,
                "r": 1,
                "x": 280,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 4,
                "r": 1,
                "x": 360,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ]
    },
    "46": {
        "id": 46,
        "name": "第 4 季 第 10 关: 海皇祭坛",
        "bgSrc": "assets/official/deepsea/stages/stage10_full_map.png?v=20260926_ocean_scale_v1",
        "availableTowers": [
            "BUFF",
            "PLANE",
            "FISH",
            "SNOW",
            "BLUE_STAR"
        ],
        "maxWaves": 22,
        "waypoints": [
            {
                "x": 200,
                "y": 40
            },
            {
                "x": 200,
                "y": 360
            },
            {
                "x": 760,
                "y": 360
            },
            {
                "x": 760,
                "y": 40
            },
            {
                "x": 600,
                "y": 40
            }
        ],
        "pathCells": [
            "2,0",
            "3,0",
            "4,0",
            "5,0",
            "7,0",
            "8,0",
            "9,0",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "7,1",
            "8,1",
            "9,1",
            "10,1",
            "2,2",
            "3,2",
            "4,2",
            "5,2",
            "7,2",
            "8,2",
            "9,2",
            "10,2",
            "2,3",
            "3,3",
            "9,3",
            "10,3",
            "2,4",
            "3,4",
            "4,4",
            "5,4",
            "6,4",
            "7,4",
            "8,4",
            "9,4",
            "10,4"
        ],
        "startPortal": {
            "x": 200,
            "y": 40
        },
        "baseCrystal": {
            "x": 600,
            "y": 40,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 6,
                "r": 1,
                "x": 520,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ]
    },
    "47": {
        "id": 47,
        "name": "第 4 季 第 11 关: 狂暴海啸",
        "bgSrc": "assets/official/deepsea/stages/stage11_full_map.png?v=20260926_ocean_scale_v1",
        "availableTowers": [
            "BUFF",
            "ANCHOR",
            "CUTTLE",
            "PLANE",
            "FISH",
            "MUSHROOM",
            "SNOW"
        ],
        "maxWaves": 25,
        "waypoints": [
            {
                "x": 280,
                "y": 360
            },
            {
                "x": 200,
                "y": 360
            },
            {
                "x": 200,
                "y": 40
            },
            {
                "x": 760,
                "y": 40
            }
        ],
        "pathCells": [
            "1,0",
            "2,0",
            "3,0",
            "4,0",
            "5,0",
            "6,0",
            "7,0",
            "8,0",
            "9,0",
            "1,1",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "8,1",
            "9,1",
            "1,2",
            "2,2",
            "1,3",
            "2,3",
            "1,4",
            "2,4",
            "3,4",
            "2,5"
        ],
        "startPortal": {
            "x": 280,
            "y": 360
        },
        "baseCrystal": {
            "x": 760,
            "y": 40,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 10,
                "r": 0,
                "x": 840,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 10,
                "r": 1,
                "x": 840,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 3,
                "r": 2,
                "x": 280,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 6,
                "r": 2,
                "x": 520,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 7,
                "r": 2,
                "x": 600,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 8,
                "r": 2,
                "x": 680,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 3,
                "r": 3,
                "x": 280,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 7,
                "r": 3,
                "x": 600,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 8,
                "r": 3,
                "x": 680,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 9,
                "r": 3,
                "x": 760,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 8,
                "r": 4,
                "x": 680,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 9,
                "r": 4,
                "x": 760,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 10,
                "r": 4,
                "x": 840,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 9,
                "r": 5,
                "x": 760,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 49,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 50,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 51,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 52,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 53,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 54,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 55,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 56,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 57,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 58,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ]
    },
    "48": {
        "id": 48,
        "name": "第 4 季 第 12 关: 终极大对决",
        "bgSrc": "assets/official/deepsea/stages/stage12_full_map.png?v=20260926_ocean_scale_v1",
        "availableTowers": [
            "BUFF",
            "PLANE",
            "ANCHOR",
            "CUTTLE",
            "FISH",
            "SNOW",
            "MUSHROOM",
            "ROCKET",
            "FIRE_BOTTLE"
        ],
        "maxWaves": 25,
        "waypoints": [
            {
                "x": 680,
                "y": 40
            },
            {
                "x": 760,
                "y": 40
            },
            {
                "x": 760,
                "y": 120
            },
            {
                "x": 840,
                "y": 120
            }
        ],
        "pathCells": [
            "2,0",
            "3,0",
            "8,0",
            "9,0",
            "10,0",
            "2,1",
            "3,1",
            "4,1",
            "5,1",
            "6,1",
            "7,1",
            "9,1",
            "10,1",
            "2,2",
            "3,2",
            "6,2",
            "7,2",
            "8,2",
            "2,3",
            "3,3",
            "7,3",
            "8,3",
            "9,3",
            "2,4",
            "3,4",
            "8,4",
            "9,4",
            "10,4",
            "9,5"
        ],
        "startPortal": {
            "x": 680,
            "y": 40
        },
        "baseCrystal": {
            "x": 840,
            "y": 120,
            "radius": 38
        },
        "towerSlots": [
            {
                "id": 1,
                "c": 0,
                "r": 0,
                "x": 40,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 2,
                "c": 1,
                "r": 0,
                "x": 120,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 3,
                "c": 4,
                "r": 0,
                "x": 360,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 4,
                "c": 5,
                "r": 0,
                "x": 440,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 5,
                "c": 6,
                "r": 0,
                "x": 520,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 6,
                "c": 7,
                "r": 0,
                "x": 600,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 7,
                "c": 11,
                "r": 0,
                "x": 920,
                "y": 40,
                "occupied": false,
                "tower": null
            },
            {
                "id": 8,
                "c": 0,
                "r": 1,
                "x": 40,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 9,
                "c": 1,
                "r": 1,
                "x": 120,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 10,
                "c": 8,
                "r": 1,
                "x": 680,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 11,
                "c": 11,
                "r": 1,
                "x": 920,
                "y": 120,
                "occupied": false,
                "tower": null
            },
            {
                "id": 12,
                "c": 0,
                "r": 2,
                "x": 40,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 13,
                "c": 1,
                "r": 2,
                "x": 120,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 14,
                "c": 4,
                "r": 2,
                "x": 360,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 15,
                "c": 5,
                "r": 2,
                "x": 440,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 16,
                "c": 9,
                "r": 2,
                "x": 760,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 17,
                "c": 10,
                "r": 2,
                "x": 840,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 18,
                "c": 11,
                "r": 2,
                "x": 920,
                "y": 200,
                "occupied": false,
                "tower": null
            },
            {
                "id": 19,
                "c": 0,
                "r": 3,
                "x": 40,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 20,
                "c": 1,
                "r": 3,
                "x": 120,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 21,
                "c": 4,
                "r": 3,
                "x": 360,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 22,
                "c": 5,
                "r": 3,
                "x": 440,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 23,
                "c": 6,
                "r": 3,
                "x": 520,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 24,
                "c": 10,
                "r": 3,
                "x": 840,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 25,
                "c": 11,
                "r": 3,
                "x": 920,
                "y": 280,
                "occupied": false,
                "tower": null
            },
            {
                "id": 26,
                "c": 0,
                "r": 4,
                "x": 40,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 27,
                "c": 1,
                "r": 4,
                "x": 120,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 28,
                "c": 4,
                "r": 4,
                "x": 360,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 29,
                "c": 5,
                "r": 4,
                "x": 440,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 30,
                "c": 6,
                "r": 4,
                "x": 520,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 31,
                "c": 7,
                "r": 4,
                "x": 600,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 32,
                "c": 11,
                "r": 4,
                "x": 920,
                "y": 360,
                "occupied": false,
                "tower": null
            },
            {
                "id": 33,
                "c": 0,
                "r": 5,
                "x": 40,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 34,
                "c": 1,
                "r": 5,
                "x": 120,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 35,
                "c": 2,
                "r": 5,
                "x": 200,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 36,
                "c": 3,
                "r": 5,
                "x": 280,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 37,
                "c": 4,
                "r": 5,
                "x": 360,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 38,
                "c": 5,
                "r": 5,
                "x": 440,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 39,
                "c": 6,
                "r": 5,
                "x": 520,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 40,
                "c": 7,
                "r": 5,
                "x": 600,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 41,
                "c": 8,
                "r": 5,
                "x": 680,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 42,
                "c": 10,
                "r": 5,
                "x": 840,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 43,
                "c": 11,
                "r": 5,
                "x": 920,
                "y": 440,
                "occupied": false,
                "tower": null
            },
            {
                "id": 44,
                "c": 0,
                "r": 6,
                "x": 40,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 45,
                "c": 1,
                "r": 6,
                "x": 120,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 46,
                "c": 2,
                "r": 6,
                "x": 200,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 47,
                "c": 3,
                "r": 6,
                "x": 280,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 48,
                "c": 4,
                "r": 6,
                "x": 360,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 49,
                "c": 5,
                "r": 6,
                "x": 440,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 50,
                "c": 6,
                "r": 6,
                "x": 520,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 51,
                "c": 7,
                "r": 6,
                "x": 600,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 52,
                "c": 8,
                "r": 6,
                "x": 680,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 53,
                "c": 9,
                "r": 6,
                "x": 760,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 54,
                "c": 10,
                "r": 6,
                "x": 840,
                "y": 520,
                "occupied": false,
                "tower": null
            },
            {
                "id": 55,
                "c": 11,
                "r": 6,
                "x": 920,
                "y": 520,
                "occupied": false,
                "tower": null
            }
        ]
    }
};

export class MapProp {
    constructor(config) {
        this.id = config.id;
        this.type = config.type;
        this.name = config.name || '道具';
        this.c = config.c;
        this.r = config.r;
        this.wCells = config.wCells || 1;
        this.hCells = config.hCells || 1;
        this.width = this.wCells * 80;
        this.height = this.hCells * 80;
        this.x = this.c * 80 + this.width / 2;
        this.y = this.r * 80 + this.height / 2;
        this.spriteSrc = config.spriteSrc;
        this.hp = config.hp || 300;
        this.maxHp = this.hp;
        this.rewardGold = config.rewardGold || 50;
        this.hiddenTower = config.hiddenTower || null;
        this.isDead = false;
        this.hitTimer = 0;
        this.healthBarTimer = 0;

        // 预加载贴图
        this.img = new Image();
        this.img.src = this.spriteSrc;
    }

    coversCell(c, r) {
        return c >= this.c && c < this.c + this.wCells &&
               r >= this.r && r < this.r + this.hCells;
    }

    isHit(px, py) {
        if (this.isDead) return false;
        const halfW = this.width / 2;
        const halfH = this.height / 2;
        return Math.abs(px - this.x) <= halfW && Math.abs(py - this.y) <= halfH;
    }

    takeDamage(amount, isCrit = false) {
        if (this.isDead) return;
        this.hp -= amount;
        this.hitTimer = 0.18;
        this.healthBarTimer = 3.5;
        if (this.hp <= 0) {
            this.hp = 0;
        }
    }

    applySlow() {}
    applyFreeze() {}
    applyPoison() {}
    applyStun() {}

    update(dt) {
        if (this.hitTimer > 0) this.hitTimer -= dt;
        if (this.healthBarTimer > 0) this.healthBarTimer -= dt;
    }

    draw(ctx, time, isTargeted) {
        if (this.isDead) return;
        ctx.save();

        // 1. 地面柔和阴影
        const shadowRx = (this.width * 0.42);
        const shadowRy = 9 * this.hCells;
        const shadowY = this.y + this.height / 2 - 4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(this.x, shadowY, shadowRx, shadowRy, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. 受击弹性果冻形变 / 悬浮呼吸起伏
        let scaleX = 1;
        let scaleY = 1;
        let wobbleX = 0;
        if (this.hitTimer > 0) {
            const progress = this.hitTimer / 0.18; // 1 -> 0
            const spring = Math.sin((1 - progress) * Math.PI * 3) * progress;
            scaleX = 1 + spring * 0.12;
            scaleY = 1 - spring * 0.10;
            wobbleX = spring * 3;
        }

        // 热气球与云朵带有空灵起伏呼吸感
        let floatY = 0;
        if (this.type === 'balloon') {
            floatY = Math.sin(time * 2.5 + this.c) * 4;
        } else if (this.type.includes('cloud')) {
            floatY = Math.sin(time * 2.0 + this.c) * 2.5;
        } else if (this.type.includes('planet')) {
            floatY = Math.sin(time * 2.2 + this.c) * 2.0;
        }

        // 3. 绘制官方高清贴图 (支持受击Q弹缩放)
        ctx.save();
        ctx.translate(this.x + wobbleX, this.y + floatY);
        ctx.scale(scaleX, scaleY);
        if (this.img.complete && this.img.naturalWidth > 0) {
            ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = '#a4b0be';
            ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 12);
            ctx.fill();
        }
        ctx.restore();

        // 4. 浮动血槽 (受损后显示，或处于集火锁定状态时显示，不显示选中框与繁琐文字)
        const showBar = (this.healthBarTimer > 0 || this.hp < this.maxHp || isTargeted);
        if (showBar) {
            const barW = Math.max(50, this.width * 0.65);
            const barH = 6;
            const barX = this.x - barW / 2;
            const barY = this.y - this.height / 2 - 11 + floatY;

            // 阴影底槽
            ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 4);
            ctx.fill();
            ctx.stroke();

            // 血量百分比
            const hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
            let hpColor = '#2ed573';
            if (hpRatio < 0.3) hpColor = '#ff4757';
            else if (hpRatio < 0.6) hpColor = '#ffa502';

            if (hpRatio > 0) {
                ctx.fillStyle = hpColor;
                ctx.beginPath();
                ctx.roundRect(barX, barY, Math.max(3, barW * hpRatio), barH, 3);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}

export class GameMap {
    constructor(canvasWidth = 960, canvasHeight = 560, levelId = 1) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.showGrid = false; // 默认网格关闭，保持界面清爽
        this.bgImages = {};
        this.hoveredSlot = null;
        this.slotHintUntil = (performance.now() / 1000) + 2.8; // 开局短暂提示，随后自动淡出隐形
        this.props = [];

        // 初始化载入指定关卡
        this.setLevel(levelId);
    }

    // 触发建塔槽位短暂闪烁提醒（点击地图空白处或波次备战时触发，2秒后自动淡出消失）
    triggerSlotHint(duration = 2.0) {
        this.slotHintUntil = (performance.now() / 1000) + duration;
    }

    // 检查某个建塔槽位是否被尚未打掉的道具障碍物遮挡
    isSlotBlockedByProp(slot) {
        if (!this.props || this.props.length === 0) return false;
        for (const p of this.props) {
            if (!p.isDead && p.coversCell(slot.c, slot.r)) {
                return true;
            }
        }
        return false;
    }

    // 动态载入指定关卡配置 (优先检查用户在可视化编辑器中保存的本地草稿)
    setLevel(levelId = 1) {
        this.currentLevel = levelId;
        let config = null;
        try {
            const rawCustom = localStorage.getItem('CF_CUSTOM_LEVEL_CONFIGS');
            if (rawCustom) {
                const customMap = JSON.parse(rawCustom);
                if (customMap[levelId] && String(customMap[levelId].id) === String(levelId)) {
                    config = customMap[levelId];
                }
            }
        } catch (e) {
            console.warn('Failed to parse CF_CUSTOM_LEVEL_CONFIGS from localStorage', e);
        }

        if (!config) {
            config = LEVEL_CONFIGS[levelId] || LEVEL_CONFIGS[1];
        } else {
            // 自动同步官方关卡最新可用武器定义（避免本地早期草稿遗留仅4座旧塔的问题）
            const officialTowers = LEVEL_CONFIGS[levelId]?.availableTowers;
            if (officialTowers) {
                config.availableTowers = officialTowers;
            }
            // 自动同步官方道具
            if (LEVEL_CONFIGS[levelId]?.props && (!config.props || config.props.length === 0)) {
                config.props = LEVEL_CONFIGS[levelId].props;
            }
        }
        this.currentLevelConfig = config;
        this.triggerSlotHint(2.8); // 换关时也短暂提示一下点位，随后隐形

        if (!this.bgImages[levelId]) {
            const img = new Image();
            img.src = config.bgSrc;
            this.bgImages[levelId] = img;
        }
        this.mapBgImage = this.bgImages[levelId];
        this.mapLoaded = this.mapBgImage.complete;
        this.mapBgImage.onload = () => {
            this.mapLoaded = true;
        };

        this.waypoints = JSON.parse(JSON.stringify(config.waypoints));
        this.pathCells = new Set(config.pathCells);
        this.startPortal = { ...config.startPortal };
        this.baseCrystal = { ...config.baseCrystal };
        this.towerSlots = JSON.parse(JSON.stringify(config.towerSlots));

        // 实例化当前关卡的场景道具 / 障碍物
        this.props = (config.props || []).map(pConfig => new MapProp(pConfig));
    }

    findSlotAt(px, py) {
        const c = Math.floor(px / 80);
        const r = Math.floor(py / 80);
        const cellSlot = this.towerSlots.find(s => s.c === c && s.r === r);
        if (cellSlot) {
            if (this.isSlotBlockedByProp(cellSlot)) return null;
            return cellSlot;
        }

        for (const slot of this.towerSlots) {
            const dist = Math.hypot(slot.x - px, slot.y - py);
            if (dist <= 38) {
                if (this.isSlotBlockedByProp(slot)) return null;
                return slot;
            }
        }
        return null;
    }

    findPropAt(px, py) {
        if (!this.props || this.props.length === 0) return null;
        for (let i = this.props.length - 1; i >= 0; i--) {
            const p = this.props[i];
            if (p.isHit(px, py)) {
                return p;
            }
        }
        return null;
    }

    // 绘制所有场景道具
    drawProps(ctx, time, targetedProp = null) {
        if (!this.props || this.props.length === 0) return;
        for (const p of this.props) {
            p.draw(ctx, time, p === targetedProp);
        }
    }

    draw(ctx, time, lives = 10, targetedProp = null) {
        // 1. 绘制官方高清大地图底图 (精准裁切 960x560，剔除底部多余纯海域)
        if (this.mapLoaded && this.mapBgImage.complete) {
            ctx.drawImage(this.mapBgImage, 0, 0, 960, 560, 0, 0, this.width, this.height);
        } else {
            // 优雅渐变底色降级
            ctx.fillStyle = '#7bed9f';
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // 2. 绘制起点怪物时空传送门与骷髅路标
        this.drawStartPortal(ctx, time);

        // 3. 绘制建塔基座 (云朵周边全面布局，带悬停微光动效；被道具遮挡的槽位自动隐形)
        this.drawSlots(ctx, time);

        // 3.5 绘制关卡障碍道具 (大宝箱、热气球、松树云、土星等)
        this.drawProps(ctx, time, targetedProp);

        // 4. 绘制终点：保卫萝卜官方大胡萝卜守护点
        this.drawCarrotSanctuary(ctx, time, lives);

        // 5. 绘制网格辅助层与路径可视化 (当开启时)
        if (this.showGrid) {
            this.drawGrid(ctx);
        }
    }

    // 绘制 12x7 网格辅助线与路径透视图
    drawGrid(ctx) {
        ctx.save();
        const cellSize = 80;
        const cols = 12;
        const rows = 7;

        // 1. 绘制网格底色高亮 (路径格与建塔格)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const key = `${c},${r}`;
                const x = c * cellSize;
                const y = r * cellSize;

                if (this.pathCells.has(key)) {
                    // 路径格子：柔和翠绿半透明底色
                    ctx.fillStyle = 'rgba(46, 213, 115, 0.22)';
                    ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                }

                // 检查是否是建塔槽位格子
                const slot = this.towerSlots.find(s => s.c === c && s.r === r);
                if (slot) {
                    // 建塔格子：淡天蓝半透明底色
                    ctx.fillStyle = 'rgba(0, 168, 255, 0.20)';
                    ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                }
            }
        }

        // 2. 绘制网格细线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        for (let c = 0; c <= cols; c++) {
            const x = c * cellSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }

        for (let r = 0; r <= rows; r++) {
            const y = r * cellSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // 3. 绘制路径中心主轨迹线 (带发光与箭头)
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i < this.waypoints.length; i++) {
            const wp = this.waypoints[i];
            if (i === 0) ctx.moveTo(wp.x, Math.max(0, wp.y));
            else ctx.lineTo(wp.x, wp.y);
        }
        ctx.stroke();

        // 绘制拐点圆圈与标号
        for (let i = 1; i < this.waypoints.length; i++) {
            const wp = this.waypoints[i];
            ctx.fillStyle = '#ff4757';
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // 4. 标注每个单元格的 [c, r] 和 (x, y)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const key = `${c},${r}`;
                const cx = c * cellSize + cellSize / 2;
                const cy = r * cellSize + cellSize / 2;
                const isPath = this.pathCells.has(key);
                const slot = this.towerSlots.find(s => s.c === c && s.r === r);

                // 坐标文字
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (isPath) {
                    ctx.fillStyle = '#2ed573';
                    ctx.fillText(`[${c},${r}]`, cx, cy - 18);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '10px sans-serif';
                    ctx.fillText(`${cx},${cy}`, cx, cy + 22);

                    const startC = Math.floor(((this.startPortal && this.startPortal.x !== undefined) ? this.startPortal.x : 120) / cellSize);
                    const startR = Math.floor(((this.startPortal && this.startPortal.y !== undefined) ? this.startPortal.y : 120) / cellSize);
                    const endC = Math.floor(((this.baseCrystal && this.baseCrystal.x !== undefined) ? this.baseCrystal.x : 840) / cellSize);
                    const endR = Math.floor(((this.baseCrystal && this.baseCrystal.y !== undefined) ? this.baseCrystal.y : 360) / cellSize);

                    if (c === startC && r === startR) {
                        ctx.fillStyle = '#ff4757';
                        ctx.font = 'bold 11px sans-serif';
                        ctx.fillText('起点 💀', cx, cy);
                    } else if (c === endC && r === endR) {
                        ctx.fillStyle = '#ffa502';
                        ctx.font = 'bold 11px sans-serif';
                        ctx.fillText('终点 🥕', cx, cy);
                    } else {
                        ctx.fillStyle = '#2ed573';
                        ctx.font = '10px sans-serif';
                        ctx.fillText('道路', cx, cy);
                    }
                } else if (slot) {
                    ctx.fillStyle = '#00d2d3';
                    ctx.fillText(`[${c},${r}]`, cx, cy - 18);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '10px sans-serif';
                    ctx.fillText(`插槽 #${slot.id}`, cx, cy);
                    ctx.fillText(`${cx},${cy}`, cx, cy + 18);
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.font = '10px sans-serif';
                    ctx.fillText(`[${c},${r}]`, cx, cy - 12);
                    ctx.fillText(`${cx},${cy}`, cx, cy + 12);
                }
            }
        }

        // 5. 绘制顶部信息浮条
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.roundRect(10, 10, 580, 32, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`📐 12×7 路径网格 (${this.currentLevelConfig.name}) | 🟩 绿色=怪物云道 | 🟦 蓝色=建塔插槽`, 20, 26);

        ctx.restore();
    }

    // 绘制起点怪物时空传送门与骷髅路标 (精准坐落于起点坐标)
    drawStartPortal(ctx, time) {
        const x = this.startPortal ? this.startPortal.x : 120;
        const y = this.startPortal ? this.startPortal.y : 120;
        ctx.save();

        // 1. 地面投影
        this.drawShadow(ctx, x, y + 26, 28, 9);

        // 2. 传送门旋转光环 (淡红/粉红时空波纹)
        const pulse = Math.sin(time * 4) * 4;
        const glow = ctx.createRadialGradient(x, y, 6, x, y, 36 + pulse);
        glow.addColorStop(0, 'rgba(255, 107, 129, 0.45)');
        glow.addColorStop(0.7, 'rgba(255, 71, 87, 0.15)');
        glow.addColorStop(1, 'rgba(255, 71, 87, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 36 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // 旋转虚线法阵圈
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 1.8);
        ctx.strokeStyle = 'rgba(255, 71, 87, 0.55)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 3. 官方原版骷髅路标 (精准直立木牌)
        if (!this.skullSignImg) {
            this.skullSignImg = new Image();
            this.skullSignImg.src = 'assets/official/official_skull_sign.png';
        }
        if (this.skullSignImg.complete && this.skullSignImg.naturalWidth > 0) {
            ctx.drawImage(this.skullSignImg, x - 26, y - 32, 52, 60);
        } else {
            assetsManager.drawProp(ctx, 'skull_sign', x, y, 46, 68);
        }

        // 4. 起点提示跳动徽章
        const bounce = Math.sin(time * 3.5) * 3;
        ctx.fillStyle = '#ff4757';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - 32, y - 56 + bounce, 64, 20, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚩 出生点', x, y - 46 + bounce);

        ctx.restore();
    }

    // 辅助方法：绘制地面柔和半透明投影
    drawShadow(ctx, x, y, rx, ry) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 绘制云朵建塔空槽位 (保卫萝卜原版：提醒一下自动淡出消失，鼠标悬停即刻高亮，保持画面极度清爽)
    drawSlots(ctx, time) {
        ctx.save();
        const hintRemaining = (this.slotHintUntil || 0) - time;
        const isHintActive = hintRemaining > 0;
        // 缓动渐隐 alpha：在最后 1.0 秒内从 1 平滑淡出到 0
        const hintAlpha = isHintActive ? Math.min(1, hintRemaining / 1.0) : 0;

        for (const slot of this.towerSlots) {
            if (slot.occupied) continue;
            if (this.isSlotBlockedByProp(slot)) continue;

            const isHovered = (this.hoveredSlot && this.hoveredSlot.id === slot.id);

            // 如果既不是鼠标悬停，也没有强制开启网格，且开局/点击提醒期已过，则完全隐藏，保持界面极度清爽
            if (!isHovered && !this.showGrid && !isHintActive) {
                continue;
            }

            ctx.save();
            if (isHovered) {
                // 悬停交互：柔和湖蓝色呼吸光圈 + 高亮清晰小加号 (始终全亮响应)
                this.drawShadow(ctx, slot.x, slot.y + 12, 20, 7);
                const pulse = Math.sin(time * 6) * 2.5;
                ctx.fillStyle = 'rgba(0, 210, 255, 0.28)';
                ctx.beginPath();
                ctx.arc(slot.x, slot.y, 20 + pulse, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#00d2d3';
                ctx.lineWidth = 2.2;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.arc(slot.x, slot.y, 20 + pulse, 0, Math.PI * 2);
                ctx.stroke();

                ctx.setLineDash([]);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.4;
                ctx.beginPath();
                ctx.moveTo(slot.x - 7, slot.y);
                ctx.lineTo(slot.x + 7, slot.y);
                ctx.moveTo(slot.x, slot.y - 7);
                ctx.lineTo(slot.x + 7, slot.y);
                ctx.stroke();
            } else {
                // 提示闪现或开启网格状态：随 hintAlpha 平滑渐隐消失
                const alpha = this.showGrid ? 1 : hintAlpha;
                ctx.globalAlpha = alpha;

                this.drawShadow(ctx, slot.x, slot.y + 12, 16, 5);

                // 清爽半透明云朵虚线建塔圈
                ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
                ctx.beginPath();
                ctx.arc(slot.x, slot.y, 18, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.lineWidth = 1.6;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.arc(slot.x, slot.y, 18, 0, Math.PI * 2);
                ctx.stroke();

                // 简约洁白小加号 +
                ctx.setLineDash([]);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(slot.x - 6, slot.y);
                ctx.lineTo(slot.x + 6, slot.y);
                ctx.moveTo(slot.x, slot.y - 6);
                ctx.lineTo(slot.x + 6, slot.y);
                ctx.stroke();
            }
            ctx.restore();
        }
        ctx.restore();
    }

    triggerCarrotHurt(duration = 0.45) {
        this.carrotHurtUntil = (performance.now() / 1000) + duration;
    }

    // 绘制终点：保卫萝卜官方原版大胡萝卜 (坐落于石板路终点，带实时血量与官方多阶啃咬演变)
    drawCarrotSanctuary(ctx, time, lives = 10) {
        if (!this.baseCrystal) return;
        const x = this.baseCrystal.x !== undefined ? this.baseCrystal.x : 840;
        const y = this.baseCrystal.y !== undefined ? this.baseCrystal.y : 360;
        ctx.save();

        // 守护爱心光环
        const pulse = Math.sin(time * 3) * 4;
        const glow = ctx.createRadialGradient(x, y, 10, x, y, 54 + pulse);
        glow.addColorStop(0, 'rgba(255, 121, 121, 0.35)');
        glow.addColorStop(0.7, 'rgba(46, 213, 115, 0.12)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 54 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // 地面柔和阴影
        this.drawShadow(ctx, x, y + 24, 34, 10);

        // 预加载保卫萝卜官方全阶段萝卜贴图
        if (!this.carrotSprites) {
            const ASSET_VER = '20260923_cf_v5';
            const loadCImg = (src) => {
                const img = new Image();
                img.src = `${src}?v=${ASSET_VER}`;
                return img;
            };
            this.carrotSprites = {
                hp10_smile: loadCImg('assets/official/carrot/carrot_hp10_smile.png'),
                hp10_idle:  loadCImg('assets/official/carrot/carrot_hp10_idle.png'),
                hurt_1:     loadCImg('assets/official/carrot/carrot_hurt_1.png'),
                hurt_2:     loadCImg('assets/official/carrot/carrot_hurt_2.png'),
                hurt_3:     loadCImg('assets/official/carrot/carrot_hurt_3.png'),
                dizzy:      loadCImg('assets/official/carrot/carrot_dizzy.png'),
                shake_1:    loadCImg('assets/official/carrot/carrot_shake_1.png'),
                shake_2:    loadCImg('assets/official/carrot/carrot_shake_2.png')
            };
        }

        const nowSec = performance.now() / 1000;
        const isHurtShake = nowSec < (this.carrotHurtUntil || 0);

        let activeSprite = this.carrotSprites.hp10_smile;
        let shakeX = 0;
        let shakeY = 0;

        if (isHurtShake) {
            // 受击震颤晃动与咬痕烟尘帧
            const shakeFrame = Math.floor(time * 16) % 2;
            activeSprite = shakeFrame ? this.carrotSprites.shake_1 : this.carrotSprites.shake_2;
            shakeX = (Math.random() - 0.5) * 6;
            shakeY = (Math.random() - 0.5) * 4;
        } else if (lives >= 10) {
            // 满血完整健康大萝卜：平时开心笑眼微扬，周期性俏皮圆眼眨眼
            const isBlink = Math.sin(time * 1.8) > 0.85;
            activeSprite = isBlink ? this.carrotSprites.hp10_idle : this.carrotSprites.hp10_smile;
        } else if (lives >= 8) {
            // 咬掉第1口 (8~9血)：忍痛闭眼 (> <)
            activeSprite = this.carrotSprites.hurt_1;
        } else if (lives >= 5) {
            // 咬掉第2口 (5~7血)：缺角扩大，眼角飙泪
            activeSprite = this.carrotSprites.hurt_2;
        } else if (lives >= 2) {
            // 两侧均被咬掉 (2~4血)：重伤哭泣，泪如雨下
            activeSprite = this.carrotSprites.hurt_3;
        } else {
            // 濒死/空血 (0~1血)：几乎被啃光，只剩根部叶片与眩晕圈圈眼
            activeSprite = this.carrotSprites.dizzy;
        }

        const isDizzy = (lives <= 1 && !isHurtShake);
        const cWidth = isDizzy ? 76 : 74;
        const cHeight = isDizzy ? 64 : 96;

        const bounce = isDizzy ? 0 : Math.sin(time * 3.5) * 2.5;
        const drawX = x - cWidth / 2 + shakeX;
        const drawY = y + 24 - cHeight + bounce + shakeY;

        if (activeSprite && activeSprite.complete && activeSprite.naturalWidth > 0) {
            ctx.drawImage(activeSprite, drawX, drawY, cWidth, cHeight);
        } else {
            assetsManager.drawMascot(ctx, 'carrot', x, y - 10 + bounce, 56, 68);
        }

        // 终点生命值徽章 (悬浮于翠绿大叶子上方，根据实时血量变色)
        const badgeY = isDizzy ? (y - 56) : (drawY - 14);
        ctx.fillStyle = lives > 5 ? '#2ed573' : (lives > 2 ? '#ffa502' : '#ff4757');
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - 24, badgeY, 48, 20, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Fredoka", "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`❤️ ${lives}`, x, badgeY + 10);

        ctx.restore();
    }
}
