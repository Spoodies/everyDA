import { useState } from 'react';
import { Button, Input, ScrollView, Text, XStack, YStack } from 'tamagui';
import type { EventEntry, ExperimentKind, OccurrenceEntry, TimeEntry } from '../../types/experiment';

interface EditEntryModalProps {
  entry: TimeEntry | EventEntry | OccurrenceEntry;
  kind: ExperimentKind;
  cardWidth: number;
  onSave: (entry: TimeEntry | EventEntry | OccurrenceEntry) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function EditEntryModal({
  entry,
  kind,
  cardWidth,
  onSave,
  onDelete,
  onClose,
}: EditEntryModalProps) {
  const isTimeEntry = 'duration' in entry;
  const isEventEntry = 'count' in entry;
  const [duration, setDuration] = useState(isTimeEntry ? String((entry as TimeEntry).duration) : '');
  const [count, setCount] = useState(isEventEntry ? String((entry as EventEntry).count) : '');
  const [timestamp, setTimestamp] = useState(entry.timestamp.replace('T', ' ').slice(0, 16));

  const handleSave = () => {
    if (isTimeEntry) {
      const dur = parseFloat(duration);
      if (!isNaN(dur) && dur > 0) {
        onSave({ ...entry, duration: dur } as TimeEntry);
      }
    } else if (isEventEntry) {
      const c = parseInt(count, 10);
      if (!isNaN(c) && c > 0) {
        onSave({ ...entry, count: c } as EventEntry);
      }
    } else {
      const parsed = new Date(timestamp.trim()).getTime();
      if (!Number.isNaN(parsed)) {
        onSave({ ...entry, timestamp: new Date(parsed).toISOString() } as OccurrenceEntry);
      }
    }
  };

  return (
    <YStack
      backgroundColor="$backgroundStrong"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={16}
      padding={20}
      gap={16}
      width={cardWidth}
      maxHeight={400}
    >
      <Text fontSize={16} fontWeight="700" color="$color">Edit Entry</Text>

      <ScrollView>
        <YStack gap={12}>
          {isTimeEntry ? (
            <YStack gap={6}>
              <Text fontSize={13} color="$colorHover">Duration (seconds)</Text>
              <Input
                value={duration}
                onChangeText={setDuration}
                keyboardType="decimal-pad"
                placeholder="e.g. 42.5"
                paddingHorizontal={12}
                paddingVertical={8}
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius={8}
                color="$color"
              />
            </YStack>
          ) : isEventEntry ? (
            <YStack gap={6}>
              <Text fontSize={13} color="$colorHover">Count</Text>
              <Input
                value={count}
                onChangeText={setCount}
                keyboardType="number-pad"
                placeholder="e.g. 5"
                paddingHorizontal={12}
                paddingVertical={8}
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius={8}
                color="$color"
              />
            </YStack>
          ) : (
            <YStack gap={6}>
              <Text fontSize={13} color="$colorHover">Date and time (YYYY-MM-DD HH:mm)</Text>
              <Input
                value={timestamp}
                onChangeText={setTimestamp}
                placeholder="e.g. 2026-03-13 14:30"
                paddingHorizontal={12}
                paddingVertical={8}
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius={8}
                color="$color"
                backgroundColor="$background"
                placeholderTextColor="$placeholderColor"
              />
            </YStack>
          )}
        </YStack>
      </ScrollView>

      <XStack gap={12}>
        <Button
          flex={1}
          onPress={handleSave}
          borderWidth={1}
          borderRadius={8}
          borderColor="$borderColor"
          backgroundColor="$color"
          paddingVertical={10}
        >
          <Text color="$background" fontWeight="700">Save</Text>
        </Button>
        <Button
          onPress={onDelete}
          borderWidth={1}
          borderRadius={8}
          borderColor="$colorDestructive"
          backgroundColor="$backgroundStrong"
          paddingVertical={10}
          paddingHorizontal={16}
        >
          <Text color="$colorDestructive" fontWeight="700">Delete</Text>
        </Button>
      </XStack>

      <Button
        onPress={onClose}
        borderWidth={1}
        borderRadius={8}
        borderColor="$borderColor"
        backgroundColor="$background"
        paddingVertical={10}
      >
        <Text color="$color">Cancel</Text>
      </Button>
    </YStack>
  );
}
