import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { logExercise, type ExerciseIntensity } from '@/lib/api';

const INTENSITIES: ExerciseIntensity[] = ['light', 'moderate', 'intense'];

type LogExerciseFormProps = {
  onExerciseLogged: () => void;
};

export function LogExerciseForm({ onExerciseLogged }: LogExerciseFormProps) {
  const theme = useTheme();
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<ExerciseIntensity>('moderate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!type.trim()) return;
    setLoading(true);
    setError('');
    try {
      await logExercise({
        type: type.trim(),
        duration_minutes: duration ? parseInt(duration, 10) : undefined,
        intensity,
      });
      setType('');
      setDuration('');
      setIntensity('moderate');
      onExerciseLogged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.form}>
      <View style={styles.row}>
        <TextInput
          value={type}
          onChangeText={setType}
          placeholder="Activity (e.g. run, gym, yoga)"
          placeholderTextColor={theme.textSecondary}
          editable={!loading}
          style={[styles.typeInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
        <TextInput
          value={duration}
          onChangeText={setDuration}
          placeholder="mins"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          editable={!loading}
          style={[styles.durationInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
      </View>

      <View style={styles.row}>
        {INTENSITIES.map((level) => {
          const active = intensity === level;
          return (
            <Pressable
              key={level}
              onPress={() => setIntensity(level)}
              style={[
                styles.intensityButton,
                {
                  backgroundColor: active ? theme.text : theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{ color: active ? theme.background : theme.text, textTransform: 'capitalize' }}
              >
                {level}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <ThemedText type="small" themeColor="textSecondary">
          ❌ {error}
        </ThemedText>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        disabled={loading || !type.trim()}
        style={[
          styles.submitButton,
          { backgroundColor: theme.text, opacity: loading || !type.trim() ? 0.4 : 1 },
        ]}
      >
        <ThemedText type="smallBold" style={{ color: theme.background }}>
          {loading ? 'Logging…' : 'Log exercise'}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  typeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  durationInput: {
    width: 70,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  intensityButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
  },
  submitButton: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
