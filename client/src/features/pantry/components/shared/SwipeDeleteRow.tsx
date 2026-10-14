import { ReactNode, useRef } from "react";
import { Animated, PanResponder, Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useStyles } from "./styles/SwipeDeleteRow.styles";

type Props = {
  children: ReactNode;
  label: string;
  isRTL: boolean;
  disabled?: boolean;
  onDelete: () => void;
};

const ACTION_WIDTH = 92;
const OPEN_DISTANCE = 86;

export function SwipeDeleteRow({
  children,
  label,
  isRTL,
  disabled = false,
  onDelete,
}: Props) {
  const styles = useStyles();
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpenRef = useRef(false);

  const openValue = isRTL ? OPEN_DISTANCE : -OPEN_DISTANCE;

  function close() {
    isOpenRef.current = false;

    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }

  function open() {
    isOpenRef.current = true;

    Animated.spring(translateX, {
      toValue: openValue,
      useNativeDriver: true,
    }).start();
  }

  function handleDelete() {
    close();
    onDelete();
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) => {
        if (disabled) {
          return false;
        }

        return (
          Math.abs(gesture.dx) > 10 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy)
        );
      },

      onPanResponderMove: (_event, gesture) => {
        if (disabled) {
          return;
        }

        const dx = gesture.dx;

        if (isRTL) {
          const value = Math.max(0, Math.min(ACTION_WIDTH, dx));
          translateX.setValue(value);
          return;
        }

        const value = Math.min(0, Math.max(-ACTION_WIDTH, dx));
        translateX.setValue(value);
      },

      onPanResponderRelease: (_event, gesture) => {
        if (disabled) {
          close();
          return;
        }

        const shouldOpen = isRTL
          ? gesture.dx > ACTION_WIDTH / 2
          : gesture.dx < -ACTION_WIDTH / 2;

        if (shouldOpen) {
          open();
          return;
        }

        close();
      },
    }),
  ).current;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.actionContainer,
          isRTL ? styles.actionLeft : styles.actionRight,
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.deleteAction,
            pressed && styles.deleteActionPressed,
            disabled && styles.deleteActionDisabled,
          ]}
          onPress={handleDelete}
          disabled={disabled}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.deleteText}>{label}</Text>
        </Pressable>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}
