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
    >
        <Text alignItems="center">Settings</Text>
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
        <Text
            position="absolute"
            bottom={24}
            fontSize={12}
            opacity={0.5}
            textAlign="center"
        >
            I would love any feedback at kaleb.pick@gmail.com
        </Text>
    </YStack>

  );
}
