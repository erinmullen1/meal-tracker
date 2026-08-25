import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { logMeal } from '@/lib/api';

type LogMealFormProps = {
  onMealAdded: () => void;
};

export function LogMealForm({ onMealAdded }: LogMealFormProps) {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!value.trim()) return;
    setLoading(true);
    setError('');
    try {
      await logMeal(value.trim());
      setValue('');
      onMealAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.form}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="e.g. 2 scrambled eggs on sourdough with avocado"
        placeholderTextColor={theme.textSecondary}
        editable={!loading}
        multiline
        style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
      />
      {error ? (
        <ThemedText type="small" themeColor="textSecondary">
          ❌ {error}
        </ThemedText>
      ) : null}
      <Pressable
        onPress={handleSubmit}
        disabled={loading || !value.trim()}
        style={[
          styles.button,
          { backgroundColor: theme.text, opacity: loading || !value.trim() ? 0.4 : 1 },
        ]}
      >
        <ThemedText type="smallBold" style={{ color: theme.background }}>
          {loading ? 'Analysing…' : 'Log meal'}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.two,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
