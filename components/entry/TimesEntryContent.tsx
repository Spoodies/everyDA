import { forwardRef, useImperativeHandle, useState } from 'react';
import { Alert } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import type { EntryContentRef, TimeEntry } from '../../types/experiment';

type TimesProps = {
  onModeChange?: (mode: 'manual' | 'auto') => void;
};

export const TimesEntryContent = forwardRef<EntryContentRef, TimesProps>(
  function TimesEntryContent({ onModeChange }, ref) {
    const [mode, setMode] = useState<'manual' | 'auto'>('manual');
    const [manualDuration, setManualDuration] = useState('');

    const handleSetMode = (m: 'manual' | 'auto') => {
      setMode(m);
      onModeChange?.(m);
    };

    useImperativeHandle(ref, () => ({
      submit(): TimeEntry[] | null {
        if (mode === 'auto') return null;
        const duration = parseFloat(manualDuration);
        if (!duration || duration <= 0) {
          Alert.alert('No duration', 'Enter a duration before saving.');
          return null;
        }
        return [{ timestamp: new Date().toISOString(), duration }];
      },
      reset() {
        setMode('manual');
        setManualDuration('');
        onModeChange?.('manual');
      },
    }));

    return (
      <YStack gap={12}>
        <XStack gap={8}>
          {(['manual', 'auto'] as const).map((m) => (
            <Button
              key={m}
              onPress={() => handleSetMode(m)}
              borderWidth={1}
              borderRadius={20}
              borderColor="$borderColor"
              backgroundColor={mode === m ? '$backgroundStrong' : '$background'}
              paddingHorizontal={14}
              size="$2"
            >
              <Text color="$color" fontSize={13}>{m === 'auto' ? 'Timer' : 'Manual'}</Text>
            </Button>
          ))}
        </XStack>

        {mode === 'auto' ? (
          <YStack alignItems="center" padding={12}>
            <Text color="$colorHover" fontSize={14} textAlign="center">
              Timer will start on the experiment screen.
            </Text>
          </YStack>
        ) : (
          <Input
            placeholder="Duration in seconds"
            value={manualDuration}
            onChangeText={setManualDuration}
            keyboardType="numeric"
            borderColor="$borderColor"
            borderRadius={10}
            color="$color"
            backgroundColor="$background"
            placeholderTextColor="$placeholderColor"
          />
        )}
      </YStack>
    );
  }
);
