import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, useWindowDimensions } from 'react-native';
import { Button, ScrollView, Text, YStack } from 'tamagui';
import { AddEntryModal } from '../../components/AddEntryModal';
import type { EventEntry, Experiment, TimeEntry } from '../../types/experiment';
import { STORAGE_KEY } from '../../types/experiment';

export default function ExperimentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.8;

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [entryModalVisible, setEntryModalVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Experiment[];
        const found = parsed.find((e) => e.id === id) ?? null;
        if (found) {
          found.data ??= [];
          found.lastEdited ??= found.createdAt;
        }
        setExperiment(found);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Text color="$color">Loading…</Text>
      </YStack>
    );
  }

  if (!experiment) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Text color="$color">Experiment not found.</Text>
        <Button marginTop={16} onPress={() => router.back()}>
          <Text color="$color">Go back</Text>
        </Button>
      </YStack>
    );
  }

  const addEntries = async (newEntries: TimeEntry[] | EventEntry[]) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list: Experiment[] = raw ? (JSON.parse(raw) as Experiment[]) : [];
      const now = new Date().toISOString();
      const updated = list.map((e) =>
        e.id !== id
          ? e
          : { ...e, data: [...(e.data ?? []), ...(newEntries as typeof e.data)], lastEdited: now }
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setExperiment((prev) =>
        prev
          ? { ...prev, data: [...prev.data, ...(newEntries as typeof prev.data)], lastEdited: now }
          : prev
      );
      setEntryModalVisible(false);
    } catch {
      Alert.alert('Save failed', 'Could not save entry.');
    }
  };

  const createdAt = new Date(experiment.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const lastEdited = new Date(experiment.lastEdited).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <YStack
      flex={1}
      paddingTop={56}
      paddingHorizontal={16}
      paddingBottom={24}
      backgroundColor="$background"
    >
      <AddEntryModal
        visible={entryModalVisible}
        kind={experiment.kind}
        onClose={() => setEntryModalVisible(false)}
        onSave={addEntries}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack alignItems="center" gap={16}>

          {/* Title */}
          <Text fontSize={26} fontWeight="700" color="$color" textAlign="center">
            {experiment.title}
          </Text>

          {/* Kind badge */}
          <YStack
            borderWidth={1}
            borderRadius={20}
            borderColor="$borderColor"
            backgroundColor="$backgroundStrong"
            paddingHorizontal={14}
            paddingVertical={4}
          >
            <Text fontSize={13} color="$color">{experiment.kind}</Text>
          </YStack>

          {/* Dates */}
          <YStack width={cardWidth} gap={4}>
            <Text fontSize={12} color="$colorHover">Created: {createdAt}</Text>
            <Text fontSize={12} color="$colorHover">Last edited: {lastEdited}</Text>
          </YStack>

          {/* Notes */}
          {experiment.notes ? (
            <YStack
              width={cardWidth}
              borderWidth={1}
              borderRadius={12}
              borderColor="$borderColor"
              padding={14}
              gap={6}
            >
              <Text fontSize={13} color="$colorHover">Notes</Text>
              <Text fontSize={15} color="$color">{experiment.notes}</Text>
            </YStack>
          ) : null}

          {/* Data */}
          <YStack width={cardWidth} gap={10}>
            <Text fontSize={13} color="$colorHover">Data</Text>
            {experiment.data.length === 0 ? (
              <YStack
                borderWidth={1}
                borderRadius={12}
                borderColor="$borderColor"
                borderStyle="dashed"
                padding={20}
                alignItems="center"
              >
                <Text fontSize={14} color="$colorHover">No entries yet.</Text>
              </YStack>
            ) : (
              experiment.data.map((entry, i) => (
                <YStack
                  key={i}
                  borderWidth={1}
                  borderRadius={12}
                  borderColor="$borderColor"
                  padding={12}
                >
                  <Text fontSize={12} color="$colorHover">
                    {new Date(entry.timestamp).toLocaleString()}
                  </Text>
                  {'duration' in entry && (
                    <Text fontSize={14} color="$color">Duration: {entry.duration}s</Text>
                  )}
                  {'label' in entry && entry.label ? (
                    <Text fontSize={14} color="$color">{entry.label}</Text>
                  ) : null}
                </YStack>
              ))
            )}
          </YStack>

            <Button
                onPress={() => setEntryModalVisible(true)}
                borderWidth={1}
                width={50}
                height={50}
                borderRadius={25}
                borderColor="$borderColor"
                backgroundColor="$backgroundStrong"
                alignItems="center"
                justifyContent="center"
            >
                <Text>+</Text>
            </Button>

        </YStack>
      </ScrollView>
    </YStack>
  );
}
