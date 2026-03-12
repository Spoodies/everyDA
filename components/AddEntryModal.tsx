import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, StyleSheet } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import type { EventEntry, ExperimentKind, TimeEntry } from '../types/experiment';

type Props = {
  visible: boolean;
  kind: ExperimentKind;
  onClose: () => void;
  onSave: (entries: TimeEntry[] | EventEntry[]) => void;
};

export function AddEntryModal({ visible, kind, onClose, onSave }: Props) {
  const [mode, setMode] = useState<'auto' | 'manual'>('manual');

  // Times – timer
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Times – manual
  const [manualDuration, setManualDuration] = useState('');

  // Events – counter
  const [count, setCount] = useState(0);
  const [eventLabel, setEventLabel] = useState('');

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const reset = () => {
    setMode('manual');
    setRunning(false);
    setElapsed(0);
    setManualDuration('');
    setCount(0);
    setEventLabel('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = () => {
    const now = new Date().toISOString();

    if (kind === 'Times') {
      const duration = mode === 'auto' ? elapsed : parseInt(manualDuration, 10);
      if (!duration || duration <= 0) {
        Alert.alert('No duration', 'Record a time before saving.');
        return;
      }
      onSave([{ timestamp: now, duration }]);
    } else {
      if (mode === 'auto' && count === 0) {
        Alert.alert('No events', 'Tap + at least once before saving.');
        return;
      }
      const n = mode === 'auto' ? count : 1;
      const label = eventLabel.trim() || undefined;
      onSave(
        Array.from({ length: n }, () => ({ timestamp: new Date().toISOString(), label }))
      );
    }
    reset();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <YStack style={styles.backdrop} onTouchEnd={handleClose}>
        <YStack
          style={styles.sheet}
          onTouchEnd={(e) => e.stopPropagation()}
          gap={16}
          padding={24}
          borderRadius={20}
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Text fontSize={18} fontWeight="600" color="$color">Add Entry</Text>

          {/* Mode toggle */}
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
                <Text color="$color" fontSize={13}>
                  {m === 'auto' ? (kind === 'Times' ? 'Timer' : 'Counter') : 'Manual'}
                </Text>
              </Button>
            ))}
          </XStack>

          {/* Times – Timer */}
          {kind === 'Times' && mode === 'auto' && (
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
          )}

          {/* Times – Manual */}
          {kind === 'Times' && mode === 'manual' && (
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

          {/* Events – Counter */}
          {kind === 'Events' && mode === 'auto' && (
            <YStack alignItems="center" gap={12}>
              <XStack alignItems="center" gap={28}>
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
              <Input
                placeholder="Label (optional)"
                value={eventLabel}
                onChangeText={setEventLabel}
                borderColor="$borderColor"
                borderRadius={10}
                color="$color"
                backgroundColor="$background"
                placeholderTextColor="$placeholderColor"
              />
            </YStack>
          )}

          {/* Events – Manual */}
          {kind === 'Events' && mode === 'manual' && (
            <Input
              placeholder="Label (optional)"
              value={eventLabel}
              onChangeText={setEventLabel}
              borderColor="$borderColor"
              borderRadius={10}
              color="$color"
              backgroundColor="$background"
              placeholderTextColor="$placeholderColor"
            />
          )}

          {/* Actions */}
          <XStack gap={10} justifyContent="flex-end">
            <Button
              onPress={handleClose}
              borderWidth={1}
              borderRadius={12}
              borderColor="$borderColor"
              backgroundColor="$background"
              paddingHorizontal={16}
            >
              <Text color="$color">Cancel</Text>
            </Button>
            <Button
              onPress={handleSave}
              borderWidth={1}
              borderRadius={12}
              borderColor="$borderColor"
              backgroundColor="$backgroundStrong"
              paddingHorizontal={16}
            >
              <Text color="$color">Save</Text>
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: '82%',
  },
});
