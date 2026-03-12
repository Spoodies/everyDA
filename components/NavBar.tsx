import { Home, Settings } from '@tamagui/lucide-icons';
import { usePathname, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { XStack } from 'tamagui';

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const isOnDetail = pathname.startsWith('/experiment/');

  const goHome = () => {
    if (pathname === '/') return;
    if (isOnDetail) {
      router.back(); // pop detail → lands on home
    } else {
      router.replace('/');
    }
  };

  const goSettings = () => {
    if (pathname === '/settings') return;
    // From detail, replace detail with settings (stack stays [Home, Settings])
    // From home, replace home with settings (stack stays [Settings])
    router.replace('/settings');
  };

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
      <TouchableOpacity onPress={goHome}>
        <Home
          size={26}
          color={pathname === '/' ? '$color' : '$colorDisabled'}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={goSettings}>
        <Settings
          size={26}
          color={pathname === '/settings' ? '$color' : '$colorDisabled'}
        />
      </TouchableOpacity>
    </XStack>
  );
}
