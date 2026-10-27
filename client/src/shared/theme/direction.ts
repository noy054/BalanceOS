export function getDirection(isRTL: boolean) {
  return {
    isRTL,
    row: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    },
    text: {
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const),
    },
    alignStart: {
      alignItems: isRTL ? ("flex-end" as const) : ("flex-start" as const),
    },
    alignEnd: {
      alignItems: isRTL ? ("flex-start" as const) : ("flex-end" as const),
    },
    forwardIcon: isRTL ? ("chevron-left" as const) : ("chevron-right" as const),
    backIcon: isRTL ? ("chevron-right" as const) : ("chevron-left" as const),
  };
}

export type Direction = ReturnType<typeof getDirection>;
