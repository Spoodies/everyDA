import { useState } from 'react';
import { Modal, StyleSheet } from 'react-native';
import { Button, Input, Text, TextArea, XStack, YStack } from 'tamagui';

// ── Edit this list to define your experiment kinds ──────────────────────────
export const EXPERIMENT_KINDS = [
  'Time',
  'Events'
] as const;

export type ExperimentKind = (typeof EXPERIMENT_KINDS)[number];
// ────────────────────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, notes: string, kind: ExperimentKind) => void;
};

export function AddExperimentModal({ visible, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [kind, setKind] = useState<ExperimentKind>(EXPERIMENT_KINDS[0]);

  const handleSave = () => {
    onSave(title, notes, kind);
    setTitle('');
    setNotes('');
    setKind(EXPERIMENT_KINDS[0]);
  };

  const handleClose = () => {
    setTitle('');
    setNotes('');
    setKind(EXPERIMENT_KINDS[0]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <YStack style={styles.backdrop} onTouchEnd={handleClose}>
        <YStack
          style={styles.sheet}
          onTouchEnd={(e) => e.stopPropagation()}
          gap={12}
          padding={24}
          borderRadius={20}
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Text fontSize={18} fontWeight="600" color="$color">
            New Experiment
          </Text>

        <Input
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            borderColor="$borderColor"
            borderRadius={10}
            color="$color"
            backgroundColor="$background"
            placeholderTextColor="$placeholderColor"
          />

        <Text fontSize={13} color="$colorHover"> Kind </Text>
        <XStack flexWrap="wrap" gap={8}>
            {EXPERIMENT_KINDS.map((k) => {
              const selected = k === kind;
              return (
                <Button
                  key={k}
                  onPress={() => setKind(k)}
                  borderWidth={1}
                  borderRadius={20}
                  borderColor="$borderColor"
                  backgroundColor={selected ? '$backgroundStrong' : '$background'}
                  paddingHorizontal={14}
                  paddingVertical={6}
                  size="$2"
                >
                  <Text color="$color" fontSize={13}>{k}</Text>
                </Button>
              );
            })}
        </XStack>

        <TextArea
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
            borderColor="$borderColor"
            borderRadius={10}
            color="$color"
            backgroundColor="$background"
            placeholderTextColor="$placeholderColor"
            height={90}
            textAlignVertical="top"
        />

        <YStack flexDirection="row" gap={10} justifyContent="flex-end">
            <Button
                onPress={handleClose}
                borderWidth={1}
                borderRadius={12}
                borderColor="$borderColor"
                backgroundColor="$background"
                paddingHorizontal={16}
                paddingVertical={8}
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
              paddingVertical={8}
            >
              <Text color="$color">Save</Text>
            </Button>
          </YStack>
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
