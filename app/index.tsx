import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  useWindowDimensions
} from 'react-native';
import { Button, Text, YStack } from 'tamagui';
import { useThemeMode } from '../components/theme-mode';

type Experiment = {
  id: string;
  title: string;
  notes: string;
  createdAt: string;
};

const STORAGE_KEY = 'experiments:v1';

export default function HomeScreen() {
  const { themeName, cycleTheme } = useThemeMode();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.8;
  const cardHeight = Math.min(cardWidth / 5, 70);

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadExperiments = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setExperiments([]);
          return;
        }

        const parsed = JSON.parse(raw) as Experiment[];
        setExperiments(Array.isArray(parsed) ? parsed : []);
      } catch {
        setExperiments([]);
      } finally {
        setLoading(false);
      }
    };

    loadExperiments();
  }, []);

  const addExperiment = async () => {
    const trimmedTitle = title.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedTitle) {
      Alert.alert('Missing title', 'Enter a title for your experiment.');
      return;
    }

    const nextItem: Experiment = {
      id: `${Date.now()}`,
      title: trimmedTitle,
      notes: trimmedNotes,
      createdAt: new Date().toISOString(),
    };

    const nextList = [nextItem, ...experiments];
    setSaving(true);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      setExperiments(nextList);
      setTitle('');
      setNotes('');
    } catch {
      Alert.alert('Save failed', 'Could not save experiment to device storage.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <YStack
      flex={1}
      paddingTop={56}
      paddingHorizontal={16}
      paddingBottom={24}
      gap={16}
      alignItems="center"
      backgroundColor="$background"
      justifyContent="space-between"
    >
      <YStack>
        {experiments.map((experiment) => (
          <Button
            key={experiment.id}
            width={cardWidth}
            height={cardHeight}
            borderWidth={1}
            borderRadius={20}
            borderColor="$borderColor"
            backgroundColor="$backgroundButton"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="$color">{experiment.title || 'Hello'}</Text>
          </Button>
        ))}
        <Button
          onPress={addExperiment}
          width={cardWidth}
          height={cardHeight}
          borderWidth={1}
          borderRadius={20}
          backgroundColor="$background"
          borderColor="$borderColor"
          borderStyle="dashed"
          alignItems="center"
          justifyContent="center"
        >
          +
        </Button>
      </YStack>

      <Button
        onPress={cycleTheme}
        width={cardWidth}
        height={cardHeight}
        borderWidth={1}
        borderRadius={20}
        borderColor="$borderColor"
        backgroundColor="$backgroundStrong"
        alignItems="center"
        justifyContent="center"
      >
        Theme: {themeName}
      </Button>

    </YStack>
  );
}