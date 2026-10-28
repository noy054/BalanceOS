import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { radius, spacing, typography, useThemedStyles } from "../../../shared/theme";
import { formatDateTime, personName } from "../helpers/format";
import { AdminHistoryEntry, JsonValue } from "../types";

type Props = {
  entries: AdminHistoryEntry[];
  showEntity?: boolean;
  onPressEntry?: (entry: AdminHistoryEntry) => void;
};

const MAX_CHANGES = 6;

type ChangeMap = Record<string, { from: JsonValue; to: JsonValue }>;

function asRecord(value: JsonValue): Record<string, JsonValue> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function readChanges(details: JsonValue): ChangeMap {
  const changes = asRecord(asRecord(details)?.changes ?? null);
  if (!changes) return {};
  const result: ChangeMap = {};
  for (const [key, entry] of Object.entries(changes)) {
    const pair = asRecord(entry);
    if (pair) result[key] = { from: pair.from ?? null, to: pair.to ?? null };
  }
  return result;
}

function readText(details: JsonValue, key: string) {
  const value = asRecord(details)?.[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function formatValue(value: JsonValue): string {
  if (value === null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.map(formatValue).join(", ") : "—";
  if (typeof value === "object") return "…";
  return String(value);
}

export function AdminHistoryList({ entries, showEntity = false, onPressEntry }: Props) {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const dir = useDirection();

  if (entries.length === 0) {
    return <Text style={[styles.empty, dir.text]}>{t("admin.history.empty")}</Text>;
  }

  return (
    <View style={styles.list}>
      {entries.map((entry, index) => {
        const changes = Object.entries(readChanges(entry.details));
        const reason = readText(entry.details, "reason") ?? readText(entry.details, "note");
        const content = (
          <View style={[styles.row, index > 0 && styles.rowDivider]}>
            <View style={[styles.headline, dir.row]}>
              <Text style={[styles.action, dir.text]} numberOfLines={2}>
                {t(`admin.actions.${entry.action}`, { defaultValue: entry.action })}
              </Text>
              <Text style={styles.date}>{formatDateTime(entry.createdAt, i18n.language)}</Text>
            </View>
            {showEntity && entry.summary ? (
              <Text style={[styles.entity, dir.text]} numberOfLines={1}>
                {`${t(`admin.entities.${entry.entityType}`)} · ${entry.summary}`}
              </Text>
            ) : null}
            <Text style={[styles.meta, dir.text]} numberOfLines={1}>
              {t("admin.history.by", { name: personName(entry.actor) })}
            </Text>
            {reason ? (
              <Text style={[styles.reason, dir.text]} numberOfLines={3}>
                {`“${reason}”`}
              </Text>
            ) : null}
            {changes.length > 0 ? (
              <View style={styles.changes}>
                {changes.slice(0, MAX_CHANGES).map(([key, change]) => (
                  <Text key={key} style={[styles.change, dir.text]} numberOfLines={2}>
                    {`${t(`admin.fields.${key}`, { defaultValue: key })}: ${formatValue(change.from)} → ${formatValue(change.to)}`}
                  </Text>
                ))}
                {changes.length > MAX_CHANGES ? (
                  <Text style={[styles.change, dir.text]}>
                    {t("admin.history.moreChanges", { count: changes.length - MAX_CHANGES })}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        );

        return onPressEntry ? (
          <Pressable
            key={entry.id}
            onPress={() => onPressEntry(entry)}
            accessibilityRole="button"
            style={({ pressed }) => pressed && styles.pressed}
          >
            {content}
          </Pressable>
        ) : (
          <View key={entry.id}>{content}</View>
        );
      })}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      list: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        overflow: "hidden",
      },
      row: {
        gap: 2,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.ms,
      },
      rowDivider: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
      },
      pressed: { backgroundColor: colors.surfaceMuted },
      headline: {
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: spacing.sm,
      },
      action: {
        flex: 1,
        ...typography.label,
        color: colors.textPrimary,
      },
      date: {
        ...typography.caption,
        ...typography.number,
        color: colors.textMuted,
      },
      entity: {
        ...typography.footnote,
        color: colors.textPrimary,
      },
      meta: {
        ...typography.caption,
        color: colors.textSecondary,
      },
      reason: {
        ...typography.footnote,
        color: colors.textSecondary,
        fontStyle: "italic",
        marginTop: 2,
      },
      changes: {
        marginTop: spacing.xs,
        gap: 2,
      },
      change: {
        ...typography.caption,
        ...typography.number,
        color: colors.textSecondary,
      },
      empty: {
        ...typography.footnote,
        color: colors.textMuted,
        paddingHorizontal: spacing.xs,
      },
    }),
  );
