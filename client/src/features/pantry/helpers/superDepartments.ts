import type { ComponentProps } from "react";
import type { ImageSourcePropType } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { CatalogDepartment } from "../types";

export const DEPARTMENT_ICONS: Record<
  CatalogDepartment,
  ComponentProps<typeof MaterialCommunityIcons>["name"]
> = {
  DAIRY_EGGS: "egg-outline",
  MEAT_FISH: "food-drumstick-outline",
  PRODUCE: "carrot",
  BAKERY: "bread-slice-outline",
  BREAKFAST: "bowl-outline",
  GRAINS_LEGUMES: "grain",
  SNACKS_SWEETS: "cookie-outline",
  SPREADS_CANNED: "peanut-outline",
  SAUCES_OILS: "shaker-outline",
  FROZEN: "ice-cream",
  BEVERAGES: "bottle-soda-outline",
  SPORTS_NUTRITION: "dumbbell",
  OTHER: "basket-outline",
};

export const DEPARTMENT_IMAGES: Record<CatalogDepartment, ImageSourcePropType> = {
  DAIRY_EGGS: require("../../../../assets/super/dairy-eggs.jpg"),
  MEAT_FISH: require("../../../../assets/super/meat-fish.jpg"),
  PRODUCE: require("../../../../assets/super/produce.jpg"),
  BAKERY: require("../../../../assets/super/bakery.jpg"),
  BREAKFAST: require("../../../../assets/super/breakfast.jpg"),
  GRAINS_LEGUMES: require("../../../../assets/super/grains-legumes.jpg"),
  SNACKS_SWEETS: require("../../../../assets/super/snacks-sweets.jpg"),
  SPREADS_CANNED: require("../../../../assets/super/spreads-canned.jpg"),
  SAUCES_OILS: require("../../../../assets/super/sauces-oils.jpg"),
  FROZEN: require("../../../../assets/super/frozen.jpg"),
  BEVERAGES: require("../../../../assets/super/beverages.jpg"),
  SPORTS_NUTRITION: require("../../../../assets/super/sports-nutrition.jpg"),
  OTHER: require("../../../../assets/super/other.jpg"),
};

export const SUPER_HERO_IMAGE: ImageSourcePropType = require("../../../../assets/super/hero.jpg");

export const SUPER_BANNER_IMAGE: ImageSourcePropType = require("../../../../assets/super/banner.jpg");

export const SUPER_BANNER_DEPARTMENT: CatalogDepartment = "PRODUCE";

export function isCatalogDepartment(value: string | undefined): value is CatalogDepartment {
  return value !== undefined && value in DEPARTMENT_ICONS;
}
