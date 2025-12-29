import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const MARGIN = 20;
const BAR_HEIGHT = 75;

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function CurvedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const CONTAINER_WIDTH = SCREEN_WIDTH - MARGIN * 2;

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Professional Color Palette
    const activeColor = '#3b82f6'; // Professional Blue
    const inactiveColor = '#94a3b8'; // Slate 400
    const barBgColor = '#ffffff';
    const screenBgColor = '#020617'; // Midnight Slate

    const numTabs = state.routes.length;
    const TAB_WIDTH = CONTAINER_WIDTH / numTabs;

    const animatedIndex = useSharedValue(state.index);

    React.useEffect(() => {
        animatedIndex.value = withSpring(state.index, { damping: 15, stiffness: 120 });
    }, [state.index]);

    // Create the mathematically perfect SVG path for the concave dip
    const animatedProps = useAnimatedProps(() => {
        const centerX = animatedIndex.value * TAB_WIDTH + TAB_WIDTH / 2;
        const dipWidth = 45;
        const dipDepth = 28;

        const leftSide = centerX - dipWidth;
        const rightSide = centerX + dipWidth;

        // This path creates a single, perfectly smooth concave cutout
        // using cubic Bezier curves. No "three dots" look.
        const d = `
            M 0 0 
            L ${leftSide} 0 
            C ${leftSide + 15} 0, ${centerX - 20} ${dipDepth}, ${centerX} ${dipDepth} 
            C ${centerX + 20} ${dipDepth}, ${rightSide - 15} 0, ${rightSide} 0 
            L ${CONTAINER_WIDTH} 0 
            L ${CONTAINER_WIDTH} ${BAR_HEIGHT} 
            L 0 ${BAR_HEIGHT} 
            Z
        `;

        return { d };
    });

    const animatedDotStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: animatedIndex.value * TAB_WIDTH + TAB_WIDTH / 2 - 4 },
            ],
        };
    });

    return (
        <View style={styles.floatingContainer}>
            <View style={[styles.contentContainer, { width: CONTAINER_WIDTH }]}>
                {/* The SVG Background with the smooth cutout */}
                <View style={StyleSheet.absoluteFill}>
                    <Svg width={CONTAINER_WIDTH} height={BAR_HEIGHT} viewBox={`0 0 ${CONTAINER_WIDTH} ${BAR_HEIGHT}`}>
                        <AnimatedPath
                            animatedProps={animatedProps}
                            fill={barBgColor}
                        />
                    </Svg>
                </View>

                {/* The single floating dot from the reference image */}
                <Animated.View style={[styles.dot, { backgroundColor: barBgColor }, animatedDotStyle]} />

                {/* Tab Buttons */}
                <View style={styles.tabsWrapper}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const label = options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });
                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        const getIcon = (name: string) => {
                            switch (name.toLowerCase()) {
                                case 'index': return 'house.fill';
                                case 'explore': return 'paperplane.fill';
                                default: return 'circle.fill';
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={styles.tabItem}
                                activeOpacity={1}
                            >
                                <IconSymbol
                                    name={getIcon(route.name)}
                                    size={24}
                                    color={isFocused ? activeColor : inactiveColor}
                                />
                                <Text style={[
                                    styles.label,
                                    { color: isFocused ? activeColor : inactiveColor }
                                ]}>
                                    {label as string}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    floatingContainer: {
        position: 'absolute',
        bottom: 25,
        width: '100%',
        alignItems: 'center',
        zIndex: 100,
    },
    contentContainer: {
        height: BAR_HEIGHT,
        borderRadius: 35,
        // @ts-ignore
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
        elevation: 15,
        overflow: 'hidden', // Clips the SVG to the pill shape
    },
    tabsWrapper: {
        flexDirection: 'row',
        flex: 1,
        zIndex: 20,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 12,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 8, // Floating inside the dip
        zIndex: 30,
        // @ts-ignore
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    }
});