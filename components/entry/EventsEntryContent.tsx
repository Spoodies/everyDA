import { forwardRef, useImperativeHandle, useState } from 'react';
import { Alert } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import type { EntryContentRef, EventEntry } from '../../types/experiment';

export const EventsEntryContent = forwardRef<EntryContentRef>(function EventsEntryContent(_, ref) {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [count, setCount] = useState(0);
  const [label, setLabel] = useState('');

  useImperativeHandle(ref, () => ({
    submit(): EventEntry[] | null {
      if (mode === 'auto' && count === 0) {
        Alert.alert('No events', 'Tap + at least once before saving.');
        return null;
      }
      const n = mode === 'auto' ? count : 1;
      const trimmedLabel = label.trim() || undefined;
      return Array.from({ length: n }, () => ({
        timestamp: new Date().toISOString(),
        label: trimmedLabel,
      }));
    },
    reset() {
      setMode('manual');
      setCount(0);
      setLabel('');
    },
  }));

  return (
    <YStack gap={12}>
      <XStack gap={8}>
        {(['manual', 'auto'] as const).map((m) => (
          <Button
            key={m}
            onPress={() => setMode(m)}
            borderWidth={1}
            borderRadius={20}
            borderColor="$borderColor"
            backgroundColor={mode === m ? '$backgroundStrong' : '$background'}
            paddingHorizontal={14}
            size="$2"
          >
            <Text color="$color" fontSize={13}>{m === 'auto' ? 'Counter' : 'Manual'}</Text>
          </Button>
        ))}
      </XStack>

      {mode === 'auto' && (
        <XStack alignItems="center" gap={28} justifyContent="center">
          <Button
            onPress={() => setCount((c) => Math.max(0, c - 1))}
            borderWidth={1}
            borderRadius={999}
            width={44}
            height={44}
            borderColor="$borderColor"
            backgroundColor="$backgroundStrong"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="$color" fontSize={22}>−</Text>
          </Button>
          <Text fontSize={52} fontWeight="200" color="$color">{count}</Text>
          <Button
            onPress={() => setCount((c) => c + 1)}
            borderWidth={1}
            borderRadius={999}
            width={44}
            height={44}
            borderColor="$borderColor"
            backgroundColor="$backgroundStrong"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="$color" fontSize={22}>+</Text>
          </Button>
        </XStack>
      )}

      <Input
        placeholder="Label (optional)"
        value={label}
        onChangeText={setLabel}
        borderColor="$borderColor"
        borderRadius={10}
        color="$color"
        backgroundColor="$background"
        placeholderTextColor="$placeholderColor"
      />
    </YStack>
  );
});
