export interface GameItem {
    type: 'gift' | 'obstacle' | 'life' | 'powerup';
    emoji: string;
    score: number;
    effect?: 'lose_life' | 'gain_life' | 'slow_motion' | 'shield' | 'none';
    weight: number;
    color?: string;
}

export interface LevelConfig {
    level: number;
    name: string;
    targetScore: number;
    minSpeed: number;
    maxSpeed: number;
    spawnRate: number;
    backgroundColor: string;
    items: GameItem[];
    description: string;
    rewardEmoji: string;
}

export const LEVELS: LevelConfig[] = [
    {
        level: 1,
        name: "Genna Eve (የገና ዋዜማ)",
        targetScore: 30,
        minSpeed: 3000,
        maxSpeed: 4500,
        spawnRate: 1200,
        backgroundColor: '#021715ff', // Deep Green
        description: "Catch the candles and gifts for the eve. (ለዋዜማው ሻማዎችን እና ስጦታዎችን ይሰብስቡ።)",
        rewardEmoji: "🕯️",
        items: [
            { type: 'gift', emoji: '🕯️', score: 2, weight: 40 },
            { type: 'gift', emoji: '🎁', score: 1, weight: 60 },
        ],
    },
    {
        level: 2,
        name: "Traditional Feast (የባህል ማዕድ)",
        targetScore: 70,
        minSpeed: 2200,
        maxSpeed: 3500,
        spawnRate: 1000,
        backgroundColor: '#420d09', // Dark Red/Burgundy
        description: "Collect Doro Wat and Agelgil for the feast! (ለበዓሉ ማዕድ ዶሮ ወጥ እና አገልግል ይሰብስቡ!)",
        rewardEmoji: "🥘",
        items: [
            { type: 'gift', emoji: '🥘', score: 5, weight: 30 },
            { type: 'gift', emoji: '🧺', score: 3, weight: 40 },
            { type: 'gift', emoji: '🎁', score: 1, weight: 30 },
        ],
    },
    {
        level: 3,
        name: "The Rur Match (የገና ጨዋታ)",
        targetScore: 150,
        minSpeed: 1600,
        maxSpeed: 2800,
        spawnRate: 800,
        backgroundColor: '#b45309', // Golden Brown
        description: "Catch the Genna balls (Rur) but avoid the traps! (የገና ኳሶችን (ሩር) ይሰብስቡ፣ ወጥመዶችን ይጠንቀቁ!)",
        rewardEmoji: "🏒",
        items: [
            { type: 'gift', emoji: '⚪', score: 10, weight: 20 },
            { type: 'gift', emoji: '🏒', score: 5, weight: 30 },
            { type: 'obstacle', emoji: '💣', score: 0, effect: 'lose_life', weight: 30 },
            { type: 'gift', emoji: '🎁', score: 1, weight: 20 },
        ],
    },
    {
        level: 4,
        name: "Coffee Ceremony (የቡና ቁርስ)",
        targetScore: 300,
        minSpeed: 1200,
        maxSpeed: 2200,
        spawnRate: 600,
        backgroundColor: '#064e3b', // Emerald Green
        description: "Time for Buna! Catch the coffee cups for slow motion. (የቡና ሰዓት ደርሷል! ሲኒዎቹን ለዝግታ ይሰብስቡ።)",
        rewardEmoji: "☕",
        items: [
            { type: 'powerup', emoji: '☕', score: 15, effect: 'slow_motion', weight: 15 },
            { type: 'gift', emoji: '🍿', score: 5, weight: 25 },
            { type: 'obstacle', emoji: '💣', score: 0, effect: 'lose_life', weight: 40 },
            { type: 'life', emoji: '❤️', score: 0, effect: 'gain_life', weight: 20 },
        ],
    },
    {
        level: 5,
        name: "Genna Miracle (የገና ተአምር)",
        targetScore: 600,
        minSpeed: 800,
        maxSpeed: 1600,
        spawnRate: 400,
        backgroundColor: '#4c1d95', // Royal Purple
        description: "The ultimate celebration! Use the shield to survive. (ታላቁ የገና በዓል! ለመትረፍ ጋሻውን ይጠቀሙ።)",
        rewardEmoji: "👑",
        items: [
            { type: 'powerup', emoji: '🛡️', score: 0, effect: 'shield', weight: 10 },
            { type: 'gift', emoji: '✨', score: 50, weight: 5 },
            { type: 'gift', emoji: '👑', score: 25, weight: 10 },
            { type: 'gift', emoji: '🥘', score: 10, weight: 20 },
            { type: 'obstacle', emoji: '💣', score: 0, effect: 'lose_life', weight: 40 },
            { type: 'life', emoji: '❤️', score: 0, effect: 'gain_life', weight: 15 },
        ],
    },
];
