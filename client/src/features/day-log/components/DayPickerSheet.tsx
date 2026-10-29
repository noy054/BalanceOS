import { useTranslation } from "react-i18next";

import { BottomSheet } from "../../../shared/components/ui/BottomSheet";
import { Button } from "../../../shared/components/ui/Button";
import { DateKey } from "../../../shared/helpers/dateKey";
import { DayCalendar } from "./DayCalendar";

type Props = {
  visible: boolean;
  date: DateKey;
  today: DateKey;
  onSelect: (date: DateKey) => void;
  onClose: () => void;
  title?: string;
  showMarkers?: boolean;
  minDate?: DateKey;
  maxDate?: DateKey;
};

export function DayPickerSheet({
  visible,
  date,
  today,
  onSelect,
  onClose,
  title,
  showMarkers = true,
  minDate,
  maxDate,
}: Props) {
  const { t } = useTranslation("dashboard");

  function select(key: DateKey) {
    onSelect(key);
    onClose();
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title ?? t("date.calendarTitle")}
      footer={
        date !== today ? (
          <Button
            label={t("date.goToToday")}
            variant="secondary"
            icon="calendar-today"
            onPress={() => select(today)}
            fullWidth
          />
        ) : undefined
      }
    >
      <DayCalendar
        date={date}
        today={today}
        onSelect={select}
        active={visible}
        showMarkers={showMarkers}
        minDate={minDate}
        maxDate={maxDate}
      />
    </BottomSheet>
  );
}
