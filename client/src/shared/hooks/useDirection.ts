import { useTranslation } from "react-i18next";

import { getDirection } from "../theme/direction";

export function useDirection() {
  const { i18n } = useTranslation();
  return getDirection(i18n.dir(i18n.language) === "rtl");
}
