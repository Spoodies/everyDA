import { forwardRef, useImperativeHandle, useState } from 'react';
import { Alert } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import type { EntryContentRef, EventEntry } from '../../types/experiment';

interface EventsEntryContentProps {
  onModeChange?: (mode: 'manual' | 'counter') => void;
}

export const EventsEntryContent = forwardRef<EntryContentRef, EventsEntryContentProps>(function EventsEntryContent({ onModeChange }, ref) {
  const [mode, setMode] = useState<'manual' | 'counter'>('manual');
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');

  useImperativeHandle(ref, () => ({
    submit(): EventEntry[] | null {
      if (mode === 'counter') {
        return null;
      }
      const num = parseInt(inputValue, 10);
      if (!num || num <= 0) {
        Alert.alert('No events', 'Enter a number.');
        return null;
      }
      return [
        {
          timestamp: new Date().toISOString(),
          count: num,
        }
      ];
    },
    reset() {
      setMode('manual');
      setCount(0);
      setInputValue('');
    },
  }));

  return (
    <YStack gap={16}>
      <XStack gap={8}>
        {(['manual', 'counter'] as const).map((m) => (
          <Button
            key={m}
            onPress={() => {
              setMode(m);
              onModeChange?.(m);
            }}
            borderWidth={1}
            borderRadius={20}
            borderColor="$borderColor"
            backgroundColor={mode === m ? '$backgroundStrong' : '$background'}
            paddingHorizontal={14}
            size="$2"
          >
            <Text color="$color" fontSize={13}>{m === 'manual' ? 'Manual' : 'Counter'}</Text>
          </Button>
        ))}
      </XStack>

      {mode === 'manual' ? (
        <YStack gap={6}>
          <Text fontSize={13} color="$colorHover">Number of events</Text>
          <Input
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="number-pad"
            placeholder="e.g. 5"
            paddingHorizontal={12}
            paddingVertical={10}
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius={8}
            color="$color"
          />
        </YStack>
      ) : (
        <YStack gap={12} alignItems="center">
          <Text fontSize={13} color="$colorHover">Counter will start on screen</Text>
        </YStack>
      )}
    </YStack>
  );
});
