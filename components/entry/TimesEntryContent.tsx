import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import type { EntryContentRef, TimeEntry } from '../../types/experiment';

export const TimesEntryContent = forwardRef<EntryContentRef>(function TimesEntryContent(_, ref) {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [manualDuration, setManualDuration] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  useImperativeHandle(ref, () => ({
    submit(): TimeEntry[] | null {
      const duration = mode === 'auto' ? elapsed : parseInt(manualDuration, 10);
      if (!duration || duration <= 0) {
        Alert.alert('No duration', 'Record a time before saving.');
        return null;
      }
      return [{ timestamp: new Date().toISOString(), duration }];
    },
    reset() {
      setMode('manual');
      setRunning(false);
      setElapsed(0);
      setManualDuration('');
    },
  }));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
            <Text color="$color" fontSize={13}>{m === 'auto' ? 'Timer' : 'Manual'}</Text>
          </Button>
        ))}
      </XStack>

      {mode === 'auto' ? (
        <YStack alignItems="center" gap={12}>
          <Text fontSize={52} fontWeight="200" color="$color">{formatTime(elapsed)}</Text>
          <Button
            onPress={() => setRunning((r) => !r)}
            borderWidth={1}
            borderRadius={12}
            borderColor="$borderColor"
            backgroundColor="$backgroundStrong"
            paddingHorizontal={28}
          >
            <Text color="$color">{running ? 'Stop' : elapsed > 0 ? 'Resume' : 'Start'}</Text>
          </Button>
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
});
