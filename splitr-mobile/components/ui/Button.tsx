import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, variant === 'secondary' && styles.secondary]} 
      onPress={onPress}
    >
      <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF7A1A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF7A1A',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryText: {
    color: '#FF7A1A',
  },
});