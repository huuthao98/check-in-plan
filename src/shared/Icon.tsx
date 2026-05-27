import { Ionicons, Feather } from '@expo/vector-icons';
import { FC } from 'react';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: FC<IconProps> = ({ name, size = 24, color = '#000', style }) => {
  switch (name) {
    case 'Eye':
      return <Feather name="eye" size={size} color={color} style={style} />;
    case 'EyeOff':
      return <Feather name="eye-off" size={size} color={color} style={style} />;
    case 'X':
      return <Feather name="x" size={size} color={color} style={style} />;
    default:
      // Fallback to Ionicons if name matches Ionicons glyphs
      return <Ionicons name={name as any} size={size} color={color} style={style} />;
  }
};
