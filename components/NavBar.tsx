import { Home, Settings } from '@tamagui/lucide-icons';
import { usePathname, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { XStack } from 'tamagui';

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <XStack
      backgroundColor="$background"
      borderTopWidth={1}
      borderTopColor="$borderColor"
      paddingVertical="$3"
      paddingHorizontal="$8"
      justifyContent="space-between"
      alignItems="center"
    >
      <TouchableOpacity onPress={() => pathname !== '/' && router.replace('/')}>
        <Home
          size={26}
          color={pathname === '/' ? '$color' : '$colorDisabled'}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => pathname !== '/settings' && router.replace('/settings')}>
        <Settings
          size={26}
          color={pathname === '/settings' ? '$color' : '$colorDisabled'}
        />
      </TouchableOpacity>
    </XStack>
  );
}
