import { TargetSuggestion } from "../types";

export function shouldOfferWeightSuggestion(suggestion: TargetSuggestion | null | undefined) {
  return Boolean(
    suggestion &&
      (suggestion.targetMode === "AUTO" || suggestion.experienceMode === "EXPERT") &&
      suggestion.available &&
      suggestion.suggested &&
      suggestion.meaningful &&
      suggestion.weight?.basis !== "profile",
  );
}

export function differsFromCurrent(suggestion: TargetSuggestion | null | undefined) {
  if (!suggestion?.suggested) return false;
  const current = suggestion.current;
  if (!current) return true;
  const next = suggestion.suggested;
  return (
    current.calories !== next.calories ||
    current.protein !== next.protein ||
    current.carbs !== next.carbs ||
    current.fat !== next.fat ||
    current.fiber !== next.fiber
  );
}
