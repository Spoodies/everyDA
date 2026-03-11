import { useWindowDimensions } from 'react-native';
import { Button, Text, YStack } from 'tamagui';
import { useThemeMode } from '../components/theme-mode';


export default function SettingsScreen() {
    const { themeName, cycleTheme } = useThemeMode();
    const { width: screenWidth } = useWindowDimensions();
    const cardWidth = screenWidth * 0.8;
    const cardHeight = Math.min(cardWidth / 5, 70);
  return (
    <YStack
      flex={1}
      paddingTop={56}
      paddingHorizontal={16}
      paddingBottom={24}
      gap={16}
      alignItems="center"
      backgroundColor="$background"
      justifyContent="space-between"
    >
        <YStack>
            <Text>Settings</Text>
            <Button
                onPress={cycleTheme}
                width={cardWidth}
                height={cardHeight}
                borderWidth={2}
                borderRadius={20}
                borderColor="$borderColor"
                backgroundColor="$backgroundStrong"
                alignItems="center"
                justifyContent="center"
                >
                Theme: {themeName}
            </Button>
        </ YStack>
    </YStack>

  );
}
