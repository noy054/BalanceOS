import { useCallback, useEffect, useRef } from "react";
import { Keyboard, LayoutChangeEvent } from "react-native";
import type { ScrollViewInstance } from "react-native";

const SECTION_OFFSET = 12;
const RETURN_DELAY_MS = 250;

export function useReturnToSection(pickerOpen: boolean) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const sectionY = useRef(0);
  const wasOpen = useRef(pickerOpen);

  useEffect(() => {
    const closed = wasOpen.current && !pickerOpen;
    wasOpen.current = pickerOpen;
    if (pickerOpen) {
      Keyboard.dismiss();
      return;
    }
    if (!closed) return;
    Keyboard.dismiss();
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, sectionY.current - SECTION_OFFSET), animated: true });
    }, RETURN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pickerOpen]);

  const onSectionLayout = useCallback((event: LayoutChangeEvent) => {
    sectionY.current = event.nativeEvent.layout.y;
  }, []);

  return { scrollRef, onSectionLayout };
}
