import { useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import type { ScrollViewInstance } from "react-native";

import { fonts, radius, spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";

type Option = {
  key: string | null;
  label: string;
};

type Props = {
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
};

export function SubcategoryChips({ options, value, onChange }: Props) {
  const styles = useStyles();
  const dir = useDirection();
  const scrollRef = useRef<ScrollViewInstance>(null);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={[styles.content, dir.row]}
      onContentSizeChange={() => {
        if (dir.isRTL) scrollRef.current?.scrollToEnd({ animated: false });
      }}
      accessibilityRole="tablist"
    >
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key ?? "all"}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            hitSlop={{ top: 4, bottom: 4 }}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && !selected && styles.pressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      scroll: {
        flexGrow: 0,
      },
      content: {
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.ms,
      },
      chip: {
        minHeight: 36,
        justifyContent: "center",
        paddingHorizontal: spacing.md,
        borderRadius: radius.round,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      chipSelected: {
        borderColor: colors.accentFill,
        backgroundColor: colors.accentFill,
      },
      pressed: {
        opacity: 0.75,
      },
      label: {
        ...typography.label,
        fontSize: 14,
        color: colors.textSecondary,
      },
      labelSelected: {
        fontFamily: fonts.medium,
        color: colors.onAccent,
      },
    }),
  );
