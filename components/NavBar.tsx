import { Home, Settings } from '@tamagui/lucide-icons';
import { usePathname, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { XStack } from 'tamagui';
import { useActiveTab } from './active-tab';

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeTab, setActiveTab } = useActiveTab();
  const isOnDetail = pathname.startsWith('/experiment/');

  const goHome = () => {
    if (isOnDetail) {
      setActiveTab('home');
      router.back();
    } else {
      setActiveTab('home');
    }
  };

  const goSettings = () => {
    if (isOnDetail) {
      setActiveTab('settings');
      router.back();
    } else {
      setActiveTab('settings');
    }
  };

  const homeActive = !isOnDetail && activeTab === 'home';
  const settingsActive = !isOnDetail && activeTab === 'settings';

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
          color={homeActive ? '$color' : '$colorDisabled'}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={goSettings}>
        <Settings
          size={26}
          color={settingsActive ? '$color' : '$colorDisabled'}
        />
      </TouchableOpacity>
    </XStack>
  );
}
