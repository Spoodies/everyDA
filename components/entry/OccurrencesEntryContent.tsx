import { forwardRef, useImperativeHandle, useState } from 'react';
import { Alert } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import type { EntryContentRef, OccurrenceEntry } from '../../types/experiment';

type OccurrencesEntryContentProps = {
  onModeChange?: (mode: 'now' | 'manual') => void;
};

export const OccurrencesEntryContent = forwardRef<EntryContentRef, OccurrencesEntryContentProps>(
  function OccurrencesEntryContent({ onModeChange }, ref) {
    const [mode, setMode] = useState<'now' | 'manual'>('now');
    const [manualTimestamp, setManualTimestamp] = useState('');

    const setEntryMode = (nextMode: 'now' | 'manual') => {
      setMode(nextMode);
      onModeChange?.(nextMode);
    };

    useImperativeHandle(ref, () => ({
      submit(): OccurrenceEntry[] | null {
        if (mode === 'now') {
          return [{ timestamp: new Date().toISOString() }];
        }

        const trimmed = manualTimestamp.trim();
        const parsed = new Date(trimmed).getTime();
        if (!trimmed || Number.isNaN(parsed)) {
          Alert.alert('Invalid time', 'Enter a valid date/time (for example: 2026-03-13 14:30).');
          return null;
        }

        return [{ timestamp: new Date(parsed).toISOString() }];
      },
      reset() {
        setMode('now');
        setManualTimestamp('');
        onModeChange?.('now');
      },
    }));

    return (
      <YStack gap={12}>
        <XStack gap={8}>
          {(['now', 'manual'] as const).map((entryMode) => (
            <Button
              key={entryMode}
              onPress={() => setEntryMode(entryMode)}
              borderWidth={1}
              borderRadius={20}
              borderColor="$borderColor"
              backgroundColor={mode === entryMode ? '$backgroundStrong' : '$background'}
              paddingHorizontal={14}
              size="$2"
            >
              <Text color="$color" fontSize={13}>{entryMode === 'now' ? 'Now' : 'Manual Time'}</Text>
            </Button>
          ))}
        </XStack>

        {mode === 'now' ? (
          <YStack alignItems="center" padding={12}>
            <Text color="$colorHover" fontSize={14} textAlign="center">
              Tap record to save an event happening right now.
            </Text>
          </YStack>
        ) : (
          <YStack gap={6}>
            <Text fontSize={13} color="$colorHover">Date and time</Text>
            <Input
              placeholder="YYYY-MM-DD HH:mm"
              value={manualTimestamp}
              onChangeText={setManualTimestamp}
              borderColor="$borderColor"
              borderRadius={10}
              color="$color"
              backgroundColor="$background"
              placeholderTextColor="$placeholderColor"
            />
          </YStack>
        )}
      </YStack>
    );
  }
);
