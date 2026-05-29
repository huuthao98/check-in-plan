import { memo, ReactElement, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme, useStyles } from '../theme/useTheme';
import { ThemeColors } from '../theme/colors';

interface TabOption<T extends string> {
  value: T;
  label: string;
}

interface TabSelectorProps<T extends string> {
  activeTab: T;
  setActiveTab: (tab: T) => void;
  options: TabOption<T>[];
  containerStyle?: any;
}

const TabSelectorComponent = <T extends string>({
  activeTab,
  setActiveTab,
  options,
  containerStyle,
}: TabSelectorProps<T>) => {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  const activeIndex = options.findIndex((opt) => opt.value === activeTab);
  const tabWidthPercent = 100 / options.length;

  const leftPosition = useSharedValue(activeIndex * tabWidthPercent);

  useEffect(() => {
    leftPosition.value = withTiming(activeIndex * tabWidthPercent, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIndex, tabWidthPercent, leftPosition]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: `${leftPosition.value}%`,
      width: `${tabWidthPercent}%`,
    };
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inner}>
        {/* Nền trượt (Sliding Background) */}
        <Animated.View style={[styles.slider, animatedStyle]} />

        {options.map((option) => {
          const isSelected = activeTab === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.8}
              onPress={() => setActiveTab(option.value)}
              style={styles.button}
            >
              <Text style={[styles.text, isSelected ? styles.activeText : styles.inactiveText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const TabSelector = memo(TabSelectorComponent) as <T extends string>(
  props: TabSelectorProps<T>,
) => ReactElement | null;

(TabSelector as any).displayName = 'TabSelector';

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      padding: 4,
      borderRadius: 12,
      marginBottom: 24,
    },
    inner: {
      flexDirection: 'row',
      position: 'relative',
    },
    slider: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      zIndex: 2,
    },
    text: {
      fontSize: 14,
      fontWeight: '600',
    },
    activeText: {
      color: colors.textLight,
    },
    inactiveText: {
      color: colors.textSecondary,
    },
  });
