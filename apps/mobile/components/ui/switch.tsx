import { Pressable, View } from 'react-native';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onCheckedChange, disabled, className }: SwitchProps) {
  return (
    <Pressable
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      className={cn(
        'h-7 w-12 rounded-full p-0.5',
        checked ? 'bg-primary' : 'bg-input',
        disabled && 'opacity-50',
        className
      )}
    >
      <View
        className={cn(
          'h-6 w-6 rounded-full bg-background shadow-sm',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </Pressable>
  );
}
