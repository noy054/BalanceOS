import { ReactNode, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, PanResponder, StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { spacing, useAppTheme, useThemedStyles } from "../../../../shared/theme";

type Props<T> = {
  items: T[];
  keyOf: (item: T) => string;
  labelOf: (item: T) => string;
  renderItem: (item: T, handle: ReactNode) => ReactNode;
  onMove: (from: number, to: number) => void;
  onDragActiveChange?: (active: boolean) => void;
};

export function DraggableList<T>({
  items,
  keyOf,
  labelOf,
  renderItem,
  onMove,
  onDragActiveChange,
}: Props<T>) {
  const heights = useRef<number[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);

  function targetIndex(from: number, dy: number) {
    let index = from;
    let remaining = dy;
    if (dy > 0) {
      while (index < items.length - 1) {
        const next = heights.current[index + 1] ?? 0;
        if (remaining < next / 2) break;
        remaining -= next;
        index += 1;
      }
    } else {
      while (index > 0) {
        const previous = heights.current[index - 1] ?? 0;
        if (-remaining < previous / 2) break;
        remaining += previous;
        index -= 1;
      }
    }
    return index;
  }

  return (
    <View>
      {items.map((item, index) => (
        <DraggableRow
          key={keyOf(item)}
          index={index}
          count={items.length}
          label={labelOf(item)}
          dimmed={dragging !== null && dragging !== index}
          onLayout={(event) => {
            heights.current[index] = event.nativeEvent.layout.height;
          }}
          onDragStart={() => {
            setDragging(index);
            onDragActiveChange?.(true);
          }}
          onDragEnd={(dy) => {
            setDragging(null);
            onDragActiveChange?.(false);
            const to = targetIndex(index, dy);
            if (to !== index) onMove(index, to);
          }}
          onStep={(direction) => onMove(index, index + direction)}
          render={(handle) => renderItem(item, handle)}
        />
      ))}
    </View>
  );
}

type RowProps = {
  index: number;
  count: number;
  label: string;
  dimmed: boolean;
  onLayout: (event: LayoutChangeEvent) => void;
  onDragStart: () => void;
  onDragEnd: (dy: number) => void;
  onStep: (direction: 1 | -1) => void;
  render: (handle: ReactNode) => ReactNode;
};

function DraggableRow({
  index,
  count,
  label,
  dimmed,
  onLayout,
  onDragStart,
  onDragEnd,
  onStep,
  render,
}: RowProps) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const [active, setActive] = useState(false);
  const callbacks = useRef({ onDragStart, onDragEnd });
  callbacks.current = { onDragStart, onDragEnd };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        setActive(true);
        callbacks.current.onDragStart();
      },
      onPanResponderMove: (_, gesture) => translateY.setValue(gesture.dy),
      onPanResponderRelease: (_, gesture) => {
        setActive(false);
        translateY.setValue(0);
        callbacks.current.onDragEnd(gesture.dy);
      },
      onPanResponderTerminate: () => {
        setActive(false);
        translateY.setValue(0);
        callbacks.current.onDragEnd(0);
      },
    }),
  ).current;

  const actions = [
    ...(index > 0 ? [{ name: "moveUp", label: t("form.moveUp") }] : []),
    ...(index < count - 1 ? [{ name: "moveDown", label: t("form.moveDown") }] : []),
  ];

  const handle = (
    <View
      style={styles.handle}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={t("form.reorderItem", { name: label })}
      accessibilityActions={actions}
      onAccessibilityAction={(event) =>
        onStep(event.nativeEvent.actionName === "moveUp" ? -1 : 1)
      }
      hitSlop={6}
      {...responder.panHandlers}
    >
      <MaterialCommunityIcons
        name="drag-vertical"
        size={22}
        color={active ? colors.accent : colors.textMuted}
      />
    </View>
  );

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        active && styles.active,
        dimmed && styles.dimmed,
        { transform: [{ translateY }] },
      ]}
    >
      {render(handle)}
    </Animated.View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      handle: {
        width: 28,
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: -spacing.xs,
      },
      active: {
        zIndex: 2,
        borderRadius: 16,
        backgroundColor: colors.glassSurface,
        boxShadow: `0 8px 24px ${colors.overlay}`,
      },
      dimmed: {
        opacity: 0.6,
      },
    }),
  );
