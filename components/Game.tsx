import { GameItem, LEVELS } from '@/constants/GameConfig';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { Confetti } from './Confetti';
import { Gift } from './Gift';

const BASKET_WIDTH = 90;
const BASKET_HEIGHT = 60;

export default function Game() {
    const { width, height } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width > 768;

    const [score, setScore] = useState(0);
    const [levelIndex, setLevelIndex] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameover' | 'levelup' | 'win'>('playing');
    const [giftSlots, setGiftSlots] = useState<{ id: number; item: GameItem; speed: number }[]>([]);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [isShielded, setIsShielded] = useState(false);
    const [isSlowMotion, setIsSlowMotion] = useState(false);

    const basketX = useSharedValue(width / 2 - BASKET_WIDTH / 2);
    const screenShake = useSharedValue(0);
    const flashOpacity = useSharedValue(0);
    const rewardScale = useSharedValue(1);

    const currentLevel = LEVELS[levelIndex];

    const getRandomItem = useCallback((items: GameItem[]) => {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        for (const item of items) {
            if (random < item.weight) return item;
            random -= item.weight;
        }
        return items[0];
    }, []);

    const getRandomSpeed = useCallback((min: number, max: number) => {
        return Math.random() * (max - min) + min;
    }, []);

    // Initialize slots
    useEffect(() => {
        const slotCount = 4 + levelIndex; // More items as levels progress
        const slots = Array.from({ length: slotCount }).map((_, i) => ({
            id: Math.random(),
            item: getRandomItem(currentLevel.items),
            speed: getRandomSpeed(currentLevel.minSpeed, currentLevel.maxSpeed),
        }));
        setGiftSlots(slots);
    }, [levelIndex, getRandomItem, getRandomSpeed]);

    const triggerShake = () => {
        screenShake.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
        flashOpacity.value = withSequence(
            withTiming(0.3, { duration: 100 }),
            withTiming(0, { duration: 200 })
        );
    };

    const handleCaught = (item: GameItem) => {
        if (item.type === 'obstacle') {
            if (isShielded) {
                setIsShielded(false);
            } else {
                loseLife();
                triggerShake();
            }
        } else if (item.type === 'life') {
            setLives((l) => Math.min(l + 1, 5));
        } else if (item.type === 'powerup') {
            handlePowerup(item);
        } else {
            setCombo((c) => {
                const newCombo = c + 1;
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                return newCombo;
            });
            setScore((s) => {
                const multiplier = Math.floor(combo / 5) + 1;
                const newScore = s + (item.score * multiplier);
                if (newScore >= currentLevel.targetScore) {
                    if (levelIndex === LEVELS.length - 1) {
                        setGameState('win');
                    } else {
                        setGameState('levelup');
                    }
                }
                return newScore;
            });
        }
    };

    const handleMissed = (item: GameItem) => {
        if (item.type === 'gift') {
            setCombo(0);
            loseLife();
            triggerShake();
        }
    };

    const loseLife = () => {
        setLives((l) => {
            const newLives = l - 1;
            if (newLives <= 0) {
                setGameState('gameover');
            }
            return newLives;
        });
    };

    const handleTapped = (item: GameItem) => {
        if (item.type === 'obstacle') {
            if (isShielded) {
                setIsShielded(false);
            } else {
                loseLife();
                triggerShake();
            }
        } else if (item.type === 'life') {
            setLives((l) => Math.min(l + 1, 5));
        } else if (item.type === 'powerup') {
            handlePowerup(item);
        } else {
            setCombo((c) => {
                const newCombo = c + 1;
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                return newCombo;
            });
            setScore((s) => {
                // Bonus for tapping: Double points + combo multiplier!
                const multiplier = Math.floor(combo / 5) + 1;
                const newScore = s + (item.score * 2 * multiplier);
                if (newScore >= currentLevel.targetScore) {
                    if (levelIndex === LEVELS.length - 1) {
                        setGameState('win');
                    } else {
                        setGameState('levelup');
                    }
                }
                return newScore;
            });
        }
    };

    const handlePowerup = (item: GameItem) => {
        if (item.effect === 'shield') {
            setIsShielded(true);
        } else if (item.effect === 'slow_motion') {
            setIsSlowMotion(true);
            setTimeout(() => setIsSlowMotion(false), 5000);
        }
        setScore((s) => s + (item.score || 0));
    };

    const handleSlotFinished = useCallback((index: number, action: 'caught' | 'tapped' | 'missed', item: GameItem) => {
        if (gameState !== 'playing') return;

        if (action === 'caught') {
            handleCaught(item);
        } else if (action === 'tapped') {
            handleTapped(item);
        } else {
            handleMissed(item);
        }

        setGiftSlots((prev) => {
            const newSlots = [...prev];
            if (newSlots[index]) {
                newSlots[index] = {
                    id: Math.random(),
                    item: getRandomItem(currentLevel.items),
                    speed: getRandomSpeed(currentLevel.minSpeed, currentLevel.maxSpeed) * (isSlowMotion ? 2 : 1),
                };
            }
            return newSlots;
        });
    }, [gameState, levelIndex, getRandomItem, getRandomSpeed]); // levelIndex is needed because currentLevel depends on it

    const nextLevel = () => {
        setLevelIndex((l) => l + 1);
        setGameState('playing');
        rewardScale.value = 1;
    };

    useEffect(() => {
        if (gameState === 'levelup') {
            rewardScale.value = withSequence(
                withTiming(1.5, { duration: 400 }),
                withTiming(1, { duration: 400 }),
                withTiming(1.5, { duration: 400 }),
                withTiming(1, { duration: 400 })
            );
        }
    }, [gameState]);

    const restartGame = () => {
        setScore(0);
        setLives(3);
        setLevelIndex(0);
        setGameState('playing');
    };

    const pan = Gesture.Pan()
        .onChange((event) => {
            basketX.value += event.changeX;
            if (basketX.value < 0) basketX.value = 0;
            if (basketX.value > width - BASKET_WIDTH) basketX.value = width - BASKET_WIDTH;
        });

    const basketStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: basketX.value }],
    }));

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: screenShake.value }],
        backgroundColor: currentLevel.backgroundColor,
    }));

    const flashStyle = useAnimatedStyle(() => ({
        opacity: flashOpacity.value,
    }));

    return (
        <GestureHandlerRootView style={styles.root}>
            <StatusBar barStyle="light-content" />
            <Animated.View style={[styles.container, containerStyle]}>
                <View style={styles.tibebPattern}>
                    {Array.from({ length: 20 }).map((_, i) => (
                        <View key={i} style={[styles.tibebItem, { backgroundColor: i % 3 === 0 ? '#059669' : i % 3 === 1 ? '#fbbf24' : '#dc2626' }]} />
                    ))}
                </View>
                <View style={styles.header}>
                    <View style={styles.topBar}>
                        <View>
                            <Text style={styles.levelLabel}>ደረጃ / LEVEL</Text>
                            <Text style={styles.levelValue}>{currentLevel.level}</Text>
                        </View>
                        <View style={styles.livesContainer}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Text key={i} style={[styles.heart, i >= lives && styles.heartEmpty]}>
                                    ❤️
                                </Text>
                            ))}
                        </View>
                    </View>

                    <View style={styles.scoreContainer}>
                        <View style={styles.powerupIndicators}>
                            {isShielded && <Text style={styles.powerupIcon}>🛡️</Text>}
                            {isSlowMotion && <Text style={styles.powerupIcon}>☕</Text>}
                        </View>
                        <Text style={styles.scoreLabel}>ነጥብ / SCORE</Text>
                        <Text style={styles.scoreValue}>{score}</Text>
                        {combo > 1 && (
                            <View style={styles.comboBadge}>
                                <Text style={styles.comboText}>{combo}X COMBO!</Text>
                            </View>
                        )}
                        <Text style={styles.targetText}>ግብ: {currentLevel.targetScore} / TARGET: {currentLevel.targetScore}</Text>
                    </View>
                </View>

                <View style={styles.gameArea}>
                    {giftSlots.map((slot, index) => (
                        <Gift
                            key={slot.id}
                            id={slot.id}
                            item={slot.item}
                            speed={slot.speed}
                            basketX={basketX}
                            isDesktop={isDesktop}
                            onCaught={(item: GameItem) => handleSlotFinished(index, 'caught', item)}
                            onTapped={(item: GameItem) => handleSlotFinished(index, 'tapped', item)}
                            onMissed={(item: GameItem) => handleSlotFinished(index, 'missed', item)}
                            isGameOver={gameState === 'gameover'}
                            isPaused={gameState !== 'playing'}
                        />
                    ))}

                    {!isDesktop && (
                        <GestureDetector gesture={pan}>
                            <Animated.View style={[styles.basket, basketStyle]}>
                                <View style={styles.agelgilContainer}>
                                    {isShielded && <View style={styles.shieldEffect} />}
                                    <View style={styles.agelgilTop} />
                                    <View style={styles.agelgilBody}>
                                        <Text style={styles.basketText}>🧺</Text>
                                    </View>
                                    <View style={styles.agelgilStrap} />
                                </View>
                            </Animated.View>
                        </GestureDetector>
                    )}
                </View>

                <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />

                {(gameState === 'levelup' || gameState === 'win') && <Confetti />}

                {/* Level Up Modal */}
                <Modal visible={gameState === 'levelup'} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalEmoji}>🎁</Text>
                            <Text style={styles.modalTitle}>ደረጃ {currentLevel.level} ተጠናቋል!</Text>
                            <Text style={styles.modalSubtitle}>{currentLevel.name}</Text>

                            <View style={styles.rewardContainer}>
                                <Text style={styles.rewardLabel}>የተገኘ ስጦታ / REWARD:</Text>
                                <Animated.Text style={[styles.rewardEmoji, { transform: [{ scale: rewardScale }] }]}>
                                    {currentLevel.rewardEmoji}
                                </Animated.Text>
                            </View>

                            <Text style={styles.modalDescription}>{currentLevel.description}</Text>
                            <TouchableOpacity onPress={nextLevel} style={styles.primaryButton}>
                                <Text style={styles.buttonText}>ቀጥል / CONTINUE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Game Over Modal */}
                <Modal visible={gameState === 'gameover'} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, styles.modalGameOver]}>
                            <Text style={styles.modalEmoji}>🕯️</Text>
                            <Text style={styles.modalTitle}>ጨዋታው አብቅቷል</Text>
                            <Text style={styles.modalSubtitle}>GAME OVER</Text>
                            <Text style={styles.modalText}>ያገኙት ነጥብ: {score} / Final Score: {score}</Text>
                            <TouchableOpacity onPress={restartGame} style={styles.secondaryButton}>
                                <Text style={styles.buttonText}>እንደገና ሞክር / TRY AGAIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Win Modal */}
                <Modal visible={gameState === 'win'} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, styles.modalWin]}>
                            <Text style={styles.modalEmoji}>✨ 🎄 ✨</Text>
                            <Text style={styles.modalTitle}>እንኳን አደረሳችሁ!</Text>
                            <Text style={styles.modalSubtitle}>MELKAM GENNA!</Text>
                            <Text style={styles.modalText}>የገናን በዓል በደስታ አሳልፈዋል! የኢትዮጵያ የገና በዓል ልዩ ነው!</Text>
                            <Text style={styles.modalScore}>ጠቅላላ ነጥብ / FINAL SCORE: {score}</Text>
                            <Text style={styles.modalScore}>ከፍተኛ ኮምቦ / MAX COMBO: {maxCombo}</Text>
                            <TouchableOpacity onPress={restartGame} style={styles.winButton}>
                                <Text style={styles.buttonText}>እንደገና ተጫወት / PLAY AGAIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </Animated.View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 25,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    levelLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
    levelValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
    },
    livesContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    heart: {
        fontSize: 18,
    },
    heartEmpty: {
        opacity: 0.2,
        grayscale: 1,
    } as any,
    scoreContainer: {
        alignItems: 'center',
    },
    scoreLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 4,
    },
    scoreValue: {
        color: '#fff',
        fontSize: 56,
        fontWeight: '900',
        marginVertical: -5,
    },
    targetText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 4,
    },
    comboBadge: {
        backgroundColor: '#fbbf24',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        marginTop: 5,
    },
    comboText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '900',
    },
    gameArea: {
        flex: 1,
        marginTop: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    powerupIndicators: {
        flexDirection: 'row',
        gap: 10,
        position: 'absolute',
        top: -30,
    },
    powerupIcon: {
        fontSize: 24,
        textShadowColor: 'rgba(255,255,255,0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    shieldEffect: {
        position: 'absolute',
        width: BASKET_WIDTH + 20,
        height: BASKET_HEIGHT + 20,
        borderRadius: 30,
        borderWidth: 4,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        zIndex: 10,
    },
    basket: {
        position: 'absolute',
        bottom: 40,
        width: BASKET_WIDTH,
        height: BASKET_HEIGHT,
    },
    basketText: {
        fontSize: 35,
    },
    tibebPattern: {
        flexDirection: 'row',
        height: 6,
        width: '100%',
        position: 'absolute',
        top: 0,
    },
    tibebItem: {
        flex: 1,
        height: '100%',
    },
    agelgilContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    agelgilBody: {
        width: BASKET_WIDTH,
        height: BASKET_HEIGHT - 10,
        backgroundColor: '#78350f', // Leather brown
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#451a03',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    agelgilTop: {
        width: BASKET_WIDTH - 20,
        height: 10,
        backgroundColor: '#92400e',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderWidth: 2,
        borderColor: '#451a03',
        marginBottom: -2,
    },
    agelgilStrap: {
        position: 'absolute',
        top: -15,
        width: BASKET_WIDTH + 10,
        height: 40,
        borderWidth: 4,
        borderColor: '#451a03',
        borderRadius: 25,
        zIndex: -1,
    },
    flash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#ef4444',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    modalContent: {
        backgroundColor: '#1e293b',
        width: '100%',
        padding: 40,
        borderRadius: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalEmoji: {
        fontSize: 64,
        marginBottom: 20,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalSubtitle: {
        color: '#10b981',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalDescription: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    rewardContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    rewardLabel: {
        color: '#fbbf24',
        fontSize: 12,
        fontWeight: '900',
        marginBottom: 10,
    },
    rewardEmoji: {
        fontSize: 48,
    },
    modalText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 18,
        marginBottom: 30,
        textAlign: 'center',
    },
    modalScore: {
        color: '#fbbf24',
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 30,
    },
    primaryButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 40,
        paddingVertical: 18,
        borderRadius: 20,
        width: '100%',
    },
    secondaryButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 40,
        paddingVertical: 18,
        borderRadius: 20,
        width: '100%',
    },
    winButton: {
        backgroundColor: '#fbbf24',
        paddingHorizontal: 40,
        paddingVertical: 18,
        borderRadius: 20,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 2,
    },
    modalGameOver: {
        borderColor: '#ef4444',
    },
    modalWin: {
        borderColor: '#fbbf24',
    },
});
