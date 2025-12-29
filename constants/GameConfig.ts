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
        targetScore: 50,
        minSpeed: 3000,
        maxSpeed: 4500,
        spawnRate: 1200,
        backgroundColor: '#ffffff',
        description: "Catch the candles and gifts for the eve. (ለዋዜማው ሻማዎችን እና ስጦታዎችን ይሰብስቡ።)",
        rewardEmoji: "🕯️",
        items: [
            { type: 'gift', emoji: '🕯️', score: 5, weight: 40 },
            { type: 'gift', emoji: '🎁', score: 2, weight: 60 },
        ],
    },
    {
        level: 2,
        name: "Traditional Feast (የባህል ማዕድ)",
        targetScore: 150,
        minSpeed: 2200,
        maxSpeed: 3500,
        spawnRate: 1000,
        backgroundColor: '#ffffff',
        description: "Collect Doro Wat and Agelgil for the feast! (ለበዓሉ ማዕድ ዶሮ ወጥ እና አገልግል ይሰብስቡ!)",
        rewardEmoji: "🥘",
        items: [
            { type: 'gift', emoji: '🥘', score: 15, weight: 25 },
            { type: 'gift', emoji: '🧺', score: 8, weight: 35 },
            { type: 'gift', emoji: '🎁', score: 3, weight: 40 },
        ],
    },
    {
        level: 3,
        name: "The Rur Match (የገና ጨዋታ)",
        targetScore: 300,
        minSpeed: 1600,
        maxSpeed: 2800,
        spawnRate: 800,
        backgroundColor: '#ffffff',
        description: "Catch the Genna balls (Rur) but avoid the traps! (የገና ኳሶችን (ሩር) ይሰብስቡ፣ ወጥመዶችን ይጠንቀቁ!)",
        rewardEmoji: "🏒",
        items: [
            { type: 'gift', emoji: '⚪', score: 25, weight: 15 },
            { type: 'gift', emoji: '🏒', score: 12, weight: 25 },
            { type: 'obstacle', emoji: '💣', score: 0, effect: 'lose_life', weight: 35 },
            { type: 'gift', emoji: '🎁', score: 5, weight: 25 },
        ],
    },
    {
        level: 4,
        name: "Coffee Ceremony (የቡና ቁርስ)",
        targetScore: 600,
        minSpeed: 1200,
        maxSpeed: 2200,
        spawnRate: 600,
        backgroundColor: '#ffffff',
        description: "Time for Buna! Catch the coffee cups for slow motion. (የቡና ሰዓት ደርሷል! ሲኒዎቹን ለዝግታ ይሰብስቡ።)",
        rewardEmoji: "☕",
        items: [
            { type: 'powerup', emoji: '☕', score: 30, effect: 'slow_motion', weight: 15 },
            { type: 'gift', emoji: '🍿', score: 10, weight: 25 },
            { type: 'obstacle', emoji: '💣', score: 0, effect: 'lose_life', weight: 40 },
            { type: 'life', emoji: '❤️', score: 0, effect: 'gain_life', weight: 20 },
        ],
    },
    {
        level: 5,
        name: "Genna Miracle (የገና ተአምር)",
        targetScore: 1200,
        minSpeed: 800,
        maxSpeed: 1600,
        spawnRate: 400,
        backgroundColor: '#ffffff',
        description: "The ultimate celebration! Use the shield to survive. (ታላቁ የገና በዓል! ለመትረፍ ጋሻውን ይጠቀሙ።)",
        rewardEmoji: "👑",
        items: [
            { type: 'powerup', emoji: '🛡️', score: 0, effect: 'shield', weight: 10 },
            { type: 'gift', emoji: '✨', score: 100, weight: 5 },
            { type: 'gift', emoji: '👑', score: 50, weight: 10 },
            { type: 'gift', emoji: '🥘', score: 20, weight: 20 },
            { type: 'obstacle', emoji: '💣', score: 0, effect: 'lose_life', weight: 40 },
            { type: 'life', emoji: '❤️', score: 0, effect: 'gain_life', weight: 15 },
        ],
    },
];
