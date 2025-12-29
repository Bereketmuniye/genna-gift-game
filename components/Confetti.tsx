import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const CONFETTI_COUNT = 50;
const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];

const ConfettiPiece = ({ index }: { index: number }) => {
    const translateY = useSharedValue(-20);
    const translateX = useSharedValue(Math.random() * width);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        const duration = 2000 + Math.random() * 3000;
        const delay = Math.random() * 2000;

        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(height + 20, { duration, easing: Easing.linear }),
                    withTiming(-20, { duration: 0 })
                ),
                -1
            )
        );

        rotate.value = withRepeat(
            withTiming(360, { duration: 1000 + Math.random() * 1000, easing: Easing.linear }),
            -1
        );

        translateX.value = withRepeat(
            withSequence(
                withTiming(translateX.value + 50, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
                withTiming(translateX.value - 50, { duration: 1000, easing: Easing.inOut(Easing.sin) })
            ),
            -1
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
        backgroundColor: COLORS[index % COLORS.length],
    }));

    return <Animated.View style={[styles.confetti, animatedStyle]} />;
};

export const Confetti = () => {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
                <ConfettiPiece key={i} index={i} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    confetti: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 2,
    },
});
