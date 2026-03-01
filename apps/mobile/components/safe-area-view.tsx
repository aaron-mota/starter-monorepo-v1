import { SafeAreaView as SafeAreaViewBase } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

interface Props extends React.ComponentProps<typeof SafeAreaViewBase> {}

export function SafeAreaView({ children, className, ...props }: Props) {
  return (
    <SafeAreaViewBase className={cn('flex-1 px-4', className)} {...props}>
      {children}
    </SafeAreaViewBase>
  );
}
