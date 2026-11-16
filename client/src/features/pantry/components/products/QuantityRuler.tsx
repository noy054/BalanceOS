import { ComponentRef, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, PanResponder, Platform, StyleSheet, Text, View } from "react-native";

import { fonts, spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { CalculatorSteps } from "../../helpers/calculatorAmount";
import { formatAmount } from "../../helpers/serving";

type Props = {
  value: number;
  steps: CalculatorSteps;
  accessibilityLabel: string;
  onChange: (value: number) => void;
  onActiveChange?: (active: boolean) => void;
};

const MAJOR_SPACING = 70;
const RULER_HEIGHT = 60;

function snap(value: number, step: number) {
  return Math.round(Math.round(value / step) * step * 100) / 100;
}

export function QuantityRuler({
  value,
  steps,
  accessibilityLabel,
  onChange,
  onActiveChange,
}: Props) {
  const styles = useStyles();
  const [width, setWidth] = useState(0);
  const pixelsPerUnit = MAJOR_SPACING / steps.major;
  const current = Number.isFinite(value) && value > 0 ? value : 0;

  const latest = useRef({ current, steps, pixelsPerUnit, onChange, onActiveChange });
  latest.current = { current, steps, pixelsPerUnit, onChange, onActiveChange };
  const dragStart = useRef(0);
  const rootRef = useRef<ComponentRef<typeof View>>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const node = rootRef.current as unknown as HTMLElement | null;
    if (!node) return;
    node.style.touchAction = "none";
    node.style.overscrollBehaviorX = "contain";
    function handleWheel(event: WheelEvent) {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      const { steps: s, pixelsPerUnit: ppu, onChange: change, current: now } = latest.current;
      const next = Math.max(s.precision, snap(now + event.deltaX / ppu, s.precision));
      if (next !== now) change(next);
    }
    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, []);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        dragStart.current = latest.current.current;
        latest.current.onActiveChange?.(true);
      },
      onPanResponderMove: (_, gesture) => {
        const { steps: s, pixelsPerUnit: ppu, onChange: change, current: now } = latest.current;
        const next = Math.max(s.precision, snap(dragStart.current - gesture.dx / ppu, s.precision));
        if (next !== now) change(next);
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderRelease: () => latest.current.onActiveChange?.(false),
      onPanResponderTerminate: () => latest.current.onActiveChange?.(false),
    }),
  ).current;

  const half = width / 2;
  const span = half / pixelsPerUnit;
  const first = Math.max(0, Math.ceil((current - span) / steps.minor));
  const last = Math.floor((current + span) / steps.minor);
  const ticks = width > 0 ? Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => (first + i) * steps.minor) : [];

  function adjust(direction: 1 | -1) {
    onChange(Math.max(steps.precision, snap(current + direction * steps.precision, steps.precision)));
  }

  return (
    <View
      ref={rootRef}
      style={styles.root}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: formatAmount(current) }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(event) => adjust(event.nativeEvent.actionName === "increment" ? 1 : -1)}
      onTouchStart={() => onActiveChange?.(true)}
      onTouchEnd={() => onActiveChange?.(false)}
      onTouchCancel={() => onActiveChange?.(false)}
      {...responder.panHandlers}
    >
      {ticks.map((tick) => {
        const x = half + (tick - current) * pixelsPerUnit;
        const ratio = Math.round((tick / steps.major) * 1000) / 1000;
        const isMajor = Number.isInteger(ratio);
        const isMid = !isMajor && Number.isInteger(ratio * 2);
        const fade = 1 - Math.min(Math.abs(x - half) / half, 1) * 0.75;
        const isCurrent = Math.abs(tick - current) < steps.minor / 2;

        return (
          <View key={tick} pointerEvents="none" style={[styles.tickBox, { left: x - 20, opacity: fade }]}>
            <View
              style={[
                styles.tick,
                isMajor ? styles.tickMajor : isMid ? styles.tickMid : null,
              ]}
            />
            {isMajor ? (
              <Text style={[styles.label, isCurrent && styles.labelCurrent]} numberOfLines={1}>
                {formatAmount(tick)}
              </Text>
            ) : null}
          </View>
        );
      })}

      {width > 0 ? <View pointerEvents="none" style={[styles.marker, { left: half - 2 }]} /> : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        height: RULER_HEIGHT,
        overflow: "hidden",
      },
      tickBox: {
        position: "absolute",
        top: 6,
        width: 40,
        alignItems: "center",
      },
      tick: {
        width: 1.5,
        height: 10,
        borderRadius: 1,
        backgroundColor: colors.textMuted,
      },
      tickMid: {
        height: 15,
      },
      tickMajor: {
        width: 2,
        height: 22,
        backgroundColor: colors.textSecondary,
      },
      label: {
        ...typography.caption,
        ...typography.number,
        fontFamily: fonts.regular,
        marginTop: spacing.sm,
        color: colors.textSecondary,
      },
      labelCurrent: {
        fontFamily: fonts.medium,
        color: colors.accent,
      },
      marker: {
        position: "absolute",
        top: 0,
        width: 4,
        height: 30,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: colors.accent,
        backgroundColor: colors.accentFill,
      },
    }),
  );
