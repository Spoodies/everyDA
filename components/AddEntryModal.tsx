import { useRef, useState } from 'react';
import { Modal, StyleSheet } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import type { EntryContentRef, EventEntry, ExperimentKind, OccurrenceEntry, TimeEntry } from '../types/experiment';
import { EventsEntryContent } from './entry/EventsEntryContent';
import { OccurrencesEntryContent } from './entry/OccurrencesEntryContent';
import { TimesEntryContent } from './entry/TimesEntryContent';

type Props = {
  visible: boolean;
  kind: ExperimentKind;
  onClose: () => void;
  onSave: (entries: TimeEntry[] | EventEntry[] | OccurrenceEntry[]) => void;
  onStartTimer?: () => void;
  onStartCounter?: () => void;
};

export function AddEntryModal({ visible, kind, onClose, onSave, onStartTimer, onStartCounter }: Props) {
  const contentRef = useRef<EntryContentRef>(null);
  const [timesMode, setTimesMode] = useState<'manual' | 'auto'>('manual');
  const [eventsMode, setEventsMode] = useState<'manual' | 'counter'>('manual');
  const [occurrencesMode, setOccurrencesMode] = useState<'now' | 'manual'>('now');

  const handleClose = () => {
    contentRef.current?.reset();
    onClose();
  };

  const handleSave = () => {
    if (kind === 'Times' && timesMode === 'auto') {
      onStartTimer?.();
      contentRef.current?.reset();
      return;
    }
    if (kind === 'Events' && eventsMode === 'counter') {
      onStartCounter?.();
      contentRef.current?.reset();
      return;
    }
    const entries = contentRef.current?.submit();
    if (!entries) return;
    onSave(entries);
    contentRef.current?.reset();
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

          {kind === 'Times' && <TimesEntryContent ref={contentRef} onModeChange={setTimesMode} />}
          {kind === 'Events' && <EventsEntryContent ref={contentRef} onModeChange={setEventsMode} />}
          {kind === 'Occurrences' && <OccurrencesEntryContent ref={contentRef} onModeChange={setOccurrencesMode} />}

          <XStack gap={10} justifyContent="flex-end">
            <Button
              onPress={handleClose}
              borderWidth={1}
              borderRadius={12}
              borderColor="$borderColor"
              backgroundColor="$background"
              paddingHorizontal={16}
            >
              <Text color="$color">Close</Text>
            </Button>
            <Button
              onPress={handleSave}
              borderWidth={1}
              borderRadius={12}
              borderColor="$borderColor"
              backgroundColor="$backgroundStrong"
              paddingHorizontal={16}
            >
              <Text color="$color">
                {kind === 'Times' && timesMode === 'auto'
                  ? 'Start Timer'
                  : kind === 'Events' && eventsMode === 'counter'
                    ? 'Start Counter'
                    : kind === 'Occurrences' && occurrencesMode === 'now'
                      ? 'Record Now'
                      : 'Add'}
              </Text>
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
