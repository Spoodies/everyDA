import { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet } from 'react-native';
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui';
import type { EventEntry, ExperimentKind, TimeEntry } from '../types/experiment';
import { formatStatDisplay } from '../utils/statistics';

export type StatisticOption = {
  id: string;
  label: string;
};

type Props = {
  visible: boolean;
  options: StatisticOption[];
  selectedStatIds: string[];
  data: TimeEntry[] | EventEntry[];
  kind: ExperimentKind;
  onClose: () => void;
  onSave: (selectedStatIds: string[]) => void;
};

export function StatisticsPickerModal({
  visible,
  options,
  selectedStatIds,
  data,
  kind,
  onClose,
  onSave,
}: Props) {
  const [draftSelected, setDraftSelected] = useState<string[]>(selectedStatIds);

  useEffect(() => {
    if (!visible) return;
    setDraftSelected(selectedStatIds);
  }, [visible, selectedStatIds]);

  const optionById = useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options]
  );

  const selectedOptions = draftSelected
    .map((id) => optionById.get(id))
    .filter((option): option is StatisticOption => Boolean(option));

  const availableOptions = options.filter((option) => !draftSelected.includes(option.id));

  const toggleStat = (statId: string) => {
    setDraftSelected((current) =>
      current.includes(statId)
        ? current.filter((id) => id !== statId)
        : [...current, statId]
    );
  };

  const moveStat = (index: number, direction: 'up' | 'down') => {
    setDraftSelected((current) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const updated = [...current];
      const [item] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, item);
      return updated;
    });
  };

  const handleClose = () => {
    setDraftSelected(selectedStatIds);
    onClose();
  };

  const handleSave = () => {
    onSave(draftSelected);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <YStack style={styles.backdrop} onTouchEnd={handleClose}>
        <YStack
          style={styles.sheet}
          onTouchEnd={(e) => e.stopPropagation()}
          gap={14}
          padding={20}
          borderRadius={20}
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Text fontSize={18} fontWeight="600" color="$color">
            Select Statistics
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} maxHeight={420}>
            <YStack gap={14}>
              <YStack gap={8}>
                <Text fontSize={13} color="$colorHover">Selected</Text>
                {selectedOptions.length === 0 ? (
                  <YStack
                    borderWidth={1}
                    borderRadius={10}
                    borderColor="$borderColor"
                    borderStyle="dashed"
                    padding={12}
                  >
                    <Text fontSize={13} color="$colorHover">No statistics selected.</Text>
                  </YStack>
                ) : (
                  <YStack gap={8}>
                    {selectedOptions.map((option, index) => (
                      <XStack
                        key={option.id}
                        alignItems="center"
                        justifyContent="space-between"
                        borderWidth={1}
                        borderRadius={10}
                        borderColor="$borderColor"
                        paddingVertical={8}
                        paddingHorizontal={10}
                        gap={8}
                      >
                        <Button
                          onPress={() => toggleStat(option.id)}
                          flex={1}
                          borderWidth={0}
                          backgroundColor="transparent"
                          paddingHorizontal={0}
                          justifyContent="flex-start"
                        >
                          <XStack width="100%" justifyContent="space-between" alignItems="center">
                            <Text color="$color">{option.label}</Text>
                            <Text color="$colorHover">{formatStatDisplay(option.id, data, kind)}</Text>
                          </XStack>
                        </Button>
                        <XStack gap={6}>
                          <Button
                            onPress={() => moveStat(index, 'up')}
                            disabled={index === 0}
                            borderWidth={1}
                            borderRadius={8}
                            borderColor="$borderColor"
                            backgroundColor="$backgroundStrong"
                            height={30}
                            width={30}
                            paddingHorizontal={0}
                          >
                            <Text color="$color">↑</Text>
                          </Button>
                          <Button
                            onPress={() => moveStat(index, 'down')}
                            disabled={index === selectedOptions.length - 1}
                            borderWidth={1}
                            borderRadius={8}
                            borderColor="$borderColor"
                            backgroundColor="$backgroundStrong"
                            height={30}
                            width={30}
                            paddingHorizontal={0}
                          >
                            <Text color="$color">↓</Text>
                          </Button>
                        </XStack>
                      </XStack>
                    ))}
                  </YStack>
                )}
              </YStack>

              <YStack gap={8}>
                <Text fontSize={13} color="$colorHover">Available</Text>
                <YStack gap={8}>
                  {availableOptions.map((option) => (
                    <Button
                      key={option.id}
                      onPress={() => toggleStat(option.id)}
                      borderWidth={1}
                      borderRadius={10}
                      borderColor="$borderColor"
                      backgroundColor="$backgroundStrong"
                      justifyContent="flex-start"
                      paddingHorizontal={12}
                    >
                      <XStack width="100%" justifyContent="space-between" alignItems="center">
                        <Text color="$color">{option.label}</Text>
                        <Text color="$colorHover">{formatStatDisplay(option.id, data, kind)}</Text>
                      </XStack>
                    </Button>
                  ))}
                </YStack>
              </YStack>
            </YStack>
          </ScrollView>

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
    width: '86%',
  },
});
