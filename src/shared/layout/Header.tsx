import { StyleSheet, Text, View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { colors } from '../theme/colors';

interface HeaderProps {
  title?: string;
  type?: 'screen' | 'modal';
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  alignTitle?: 'left' | 'center';
}

export default function Header({
  title,
  type = 'screen',
  leftElement,
  rightElement,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  style,
  titleStyle,
  alignTitle,
}: HeaderProps) {
  const isModal = type === 'modal';

  const defaultAlign = leftIcon || leftElement ? 'center' : 'left';
  const finalAlign = alignTitle || (isModal ? 'left' : defaultAlign);

  const showLeft = !!leftElement || !!(leftIcon && onLeftPress);
  const showRight = !!rightElement || !!(rightIcon && onRightPress);

  return (
    <View style={[isModal ? styles.modalHeader : styles.screenHeader, style]}>
      {showLeft ? (
        leftElement || (
          <TouchableOpacity style={styles.iconBtn} onPress={onLeftPress}>
            <Ionicons name={leftIcon} size={24} color={colors.textLight} />
          </TouchableOpacity>
        )
      ) : finalAlign === 'center' && showRight ? (
        <View style={styles.placeholder} />
      ) : null}
      {title && (
        <Text
          numberOfLines={1}
          style={[
            isModal ? styles.modalTitle : styles.screenTitle,
            finalAlign === 'center' && styles.centerTitle,
            titleStyle,
          ]}
        >
          {title}
        </Text>
      )}

      {showRight ? (
        rightElement || (
          <TouchableOpacity
            style={rightIcon === 'add' ? styles.addBtn : styles.iconBtn}
            onPress={onRightPress}
          >
            <Ionicons name={rightIcon} size={24} color={colors.textLight} />
          </TouchableOpacity>
        )
      ) : finalAlign === 'center' && showLeft ? (
        <View style={styles.placeholder} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 65,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  centerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
});
