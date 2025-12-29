import { GameItem } from '@/constants/GameConfig';
import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    Easing,
    Extrapolate,
    interpolate,
    runOnJS,
    SharedValue,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const GIFT_SIZE = 55;
const BASKET_WIDTH = 90;
const BASKET_HEIGHT = 60;

interface GiftProps {
    id: number;
    item: GameItem;
    speed: number;
    basketX: SharedValue<number>;
    isGameOver: boolean;
    isPaused: boolean;
    isDesktop?: boolean;
    onCaught: (item: GameItem) => void;
    onTapped: (item: GameItem) => void;
    onMissed: (item: GameItem) => void;
}

export const Gift = React.memo(({ id, item, speed, basketX, isGameOver, isPaused, isDesktop, onCaught, onTapped, onMissed }: GiftProps) => {
    const { width, height } = useWindowDimensions();
    const GAME_HEIGHT = height - 120;

    const translateY = useSharedValue(-GIFT_SIZE);
    const translateX = useSharedValue(Math.random() * (width - GIFT_SIZE));
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const isActive = useSharedValue(true);

    // Shared values for the floating point animation
    const bonusOpacity = useSharedValue(0);
    const bonusTranslateY = useSharedValue(0);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showPoints = () => {
        'worklet';
        bonusOpacity.value = 1;
        bonusTranslateY.value = 0;
        bonusTranslateY.value = withTiming(-80, { duration: 800 });
        bonusOpacity.value = withTiming(0, { duration: 800 });
    };

    const startFalling = useCallback(() => {
        if (isGameOver || isPaused) return;

        translateY.value = -GIFT_SIZE;
        translateX.value = Math.random() * (width - GIFT_SIZE);
        scale.value = 1;
        opacity.value = 1;
        isActive.value = true;
        bonusOpacity.value = 0;
        bonusTranslateY.value = 0;

        translateY.value = withTiming(GAME_HEIGHT + 100, { duration: speed, easing: Easing.linear }, (finished) => {
            if (finished && isActive.value) {
                runOnJS(onMissed)(item);
            }
        });
    }, [isGameOver, isPaused, speed, item, onMissed, GAME_HEIGHT, width]);

    useEffect(() => {
        if (isGameOver || isPaused) {
            cancelAnimation(translateY);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        } else {
            const delay = Math.random() * 2000;
            timeoutRef.current = setTimeout(startFalling, delay);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [id, isGameOver, isPaused, startFalling]);

    useAnimatedReaction(
        () => translateY.value,
        (y) => {
            if (isGameOver || !isActive.value || isPaused || isDesktop) return;

            // Collision with Basket
            if (y >= GAME_HEIGHT - BASKET_HEIGHT - GIFT_SIZE && y < GAME_HEIGHT) {
                const giftX = translateX.value;
                const bX = basketX.value;
                if (giftX + GIFT_SIZE > bX && giftX < bX + BASKET_WIDTH) {
                    isActive.value = false;
                    cancelAnimation(translateY);
                    scale.value = withTiming(1.5, { duration: 100 });
                    opacity.value = withTiming(0, { duration: 100 });
                    showPoints();
                    runOnJS(onCaught)(item);
                }
            }
        }
    );

    const tap = Gesture.Tap().onEnd(() => {
        if (isActive.value && !isPaused && !isGameOver) {
            isActive.value = false;
            cancelAnimation(translateY);

            showPoints();

            scale.value = withTiming(2, { duration: 150 });
            opacity.value = withTiming(0, { duration: 150 });
            runOnJS(onTapped)(item);
        }
    });

    const bonusStyle = useAnimatedStyle(() => ({
        opacity: bonusOpacity.value,
        transform: [{ translateY: bonusTranslateY.value }],
        position: 'absolute',
        top: -20,
        zIndex: 100,
    }));

    const giftBodyStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    const style = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateY.value,
            [0, GAME_HEIGHT],
            [0, item.type === 'obstacle' ? 360 : 15],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotate}deg` }
            ],
        };
    });

    return (
        <GestureDetector gesture={tap}>
            <Animated.View style={[styles.gift, style]}>
                <Animated.View style={bonusStyle}>
                    <Text style={styles.bonusText}>+{item.score}</Text>
                </Animated.View>
                <Animated.View style={[
                    styles.itemContainer,
                    giftBodyStyle,
                    item.type === 'obstacle' && styles.obstacleGlow,
                    item.type === 'life' && styles.lifeGlow,
                    item.type === 'gift' && item.score > 10 && styles.rareGlow,
                    item.emoji === '☕' && styles.bunaGlow,
                    (item.emoji === '🥘' || item.emoji === '🧺') && styles.rareGlow
                ]}>
                    <Text style={styles.giftText}>{item.emoji}</Text>
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
});

const styles = StyleSheet.create({
    gift: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: GIFT_SIZE,
        height: GIFT_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bonusText: {
        color: '#fbbf24',
        fontSize: 16,
        fontWeight: '900',
        // @ts-ignore
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
    },
    itemContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: GIFT_SIZE / 2,
    },
    giftText: {
        fontSize: 40,
    },
    obstacleGlow: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 0, 0.3)',
    },
    lifeGlow: {
        backgroundColor: 'rgba(255, 105, 180, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 105, 180, 0.5)',
    },
    rareGlow: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.5)',
    },
    bunaGlow: {
        backgroundColor: 'rgba(139, 69, 19, 0.3)',
        borderWidth: 2,
        borderColor: '#fbbf24',
    }
});
