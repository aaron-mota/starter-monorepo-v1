import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

export type Scope = 'all' | 'family' | 'myself';

type ScopeFilterProps = {
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  familyId?: string | null;
};

const SCOPE_OPTIONS: { value: Scope; label: string; requiresFamily?: boolean }[] = [
  { value: 'all', label: 'All' },
  { value: 'family', label: 'Group', requiresFamily: true },
  { value: 'myself', label: 'Myself' },
];

export function ScopeFilter({ scope, onScopeChange, familyId }: ScopeFilterProps) {
  const options = SCOPE_OPTIONS.filter((opt) => !opt.requiresFamily || !!familyId);

  return (
    <View className="flex-row gap-2">
      {options.map((opt) => {
        const isActive = scope === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onScopeChange(opt.value)}
            className={`rounded-full px-4 py-1.5 ${isActive ? 'bg-primary' : 'bg-secondary'}`}
          >
            <Text
              className={`text-sm font-medium ${isActive ? 'text-primary-foreground' : 'text-secondary-foreground'}`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
