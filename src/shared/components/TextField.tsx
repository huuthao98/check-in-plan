import { useState, forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Icon } from '../Icon';
import { colors } from '../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | boolean;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      containerStyle,
      value,
      onFocus,
      onBlur,
      onChangeText,
      placeholder,
      isPassword,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<TextInput>(null);
    useImperativeHandle(ref, () => innerRef.current as TextInput);
    
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Support both controlled and uncontrolled states
    const [localValue, setLocalValue] = useState(props.defaultValue || '');
    const displayValue = value !== undefined ? value : localValue;
    const hasValue = displayValue !== undefined && displayValue !== null && displayValue !== '';
    const isError = !!error;

    const isActive = isFocused || hasValue;

    // Keep local state in sync if value prop changes from outside
    useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value);
      }
    }, [value]);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleContainerPress = () => {
      innerRef.current?.focus();
    };

    const handleChangeText = (text: string) => {
      setLocalValue(text);
      onChangeText?.(text);
    };

    const handleClear = () => {
      setLocalValue('');
      onChangeText?.('');
      innerRef.current?.focus();
    };

    const animatedLabelStyle = useAnimatedStyle(() => {
      return {
        top: withTiming(isActive ? -10 : 16, { duration: 150 }),
        fontSize: withTiming(isActive ? 12 : 16, { duration: 150 }),
        color: withTiming(
          isError ? colors.error : isFocused ? colors.info : colors.textMuted,
          { duration: 150 }
        ),
      };
    });

    const animatedBorderStyle = useAnimatedStyle(() => {
      return {
        borderColor: withTiming(
          isError ? colors.error : isFocused ? colors.info : colors.borderLight,
          { duration: 150 }
        ),
        borderWidth: withTiming(isFocused || isError ? 2 : 1, {
          duration: 150,
        }),
      };
    });

    return (
      <View style={[styles.outerContainer, containerStyle]}>
        <AnimatedPressable
          onPress={handleContainerPress}
          style={[styles.inputContainer, animatedBorderStyle]}
        >
          <TextInput
            ref={innerRef}
            style={styles.input}
            value={displayValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={handleChangeText}
            placeholder={isFocused ? placeholder : ''}
            placeholderTextColor={colors.borderLight}
            secureTextEntry={isPassword && !showPassword}
            autoCapitalize={props.autoCapitalize ?? 'none'}
            {...props}
          />
          {isPassword ? (
            <Pressable
              onPress={() => setShowPassword(prev => !prev)}
              hitSlop={10}
              style={styles.rightButton}
            >
              <Icon
                name={!showPassword ? 'EyeOff' : 'Eye'}
                size={16}
                color={colors.borderLight}
              />
            </Pressable>
          ) : isFocused && hasValue ? (
            <Pressable
              onPress={handleClear}
              hitSlop={10}
              style={styles.rightButton}
            >
              <Icon name="X" size={16} color={colors.borderLight} />
            </Pressable>
          ) : null}
        </AnimatedPressable>
        <Animated.Text
          style={[styles.label, animatedLabelStyle]}
          pointerEvents="none"
        >
          {label}
        </Animated.Text>
        {(!!helperText || typeof error === 'string') && (
          <Text style={[styles.helperText, isError && styles.errorText]}>
            {typeof error === 'string' ? error : helperText}
          </Text>
        )}
      </View>
    );
  },
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  inputContainer: {
    height: 56,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  label: {
    position: 'absolute',
    left: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
    zIndex: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.textDark,
    paddingVertical: 0, // Prevent clipping on Android
  },
  helperText: {
    marginTop: 4,
    marginLeft: 14,
    fontSize: 12,
    color: colors.textMuted,
  },
  errorText: {
    color: colors.error,
  },
  rightButton: {
    marginLeft: 8,
  },
});

export const TextFieldPassword = forwardRef<
  TextInput,
  Omit<TextFieldProps, 'isPassword'>
>((props, ref) => <TextField ref={ref} isPassword {...props} />);
TextFieldPassword.displayName = 'TextFieldPassword';
