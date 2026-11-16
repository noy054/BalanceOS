import { Injectable } from '@nestjs/common';
import { NutritionSettingsRepository } from './nutrition-settings.repository';
import { UpsertNutritionSettingsDto } from './dto/upsert-nutrition-settings.dto';
import {
  SuggestionWeight,
  TargetProfileField,
  TargetSuggestionResponse,
} from './dto/target-suggestion-response.dto';
import { UserNutritionSettingsModel } from '../../../generated/prisma/models';
import {
  ageOn,
  calculateTargets,
  MEANINGFUL_CALORIE_CHANGE,
  NutritionTargets,
  smoothedWeight,
  TargetGender,
  TargetGoal,
} from '../nutrition-calculator/target-calculator';
import { utcDayKey } from '../../common/date/day-key';

const GENDERS: TargetGender[] = ['MALE', 'FEMALE', 'OTHER'];
const GOALS: TargetGoal[] = ['CUTTING', 'MAINTENANCE', 'BULKING'];

function asGender(value: string | null | undefined): TargetGender | null {
  return GENDERS.find((gender) => gender === value) ?? null;
}

function asGoal(value: string | null | undefined): TargetGoal | null {
  return GOALS.find((goal) => goal === value) ?? null;
}

function currentTargets(
  settings: UserNutritionSettingsModel | null,
): NutritionTargets | null {
  if (!settings?.dailyCaloriesTarget) return null;
  return {
    calories: settings.dailyCaloriesTarget,
    protein: settings.proteinTarget ?? 0,
    carbs: settings.carbsTarget ?? 0,
    fat: settings.fatTarget ?? 0,
    fiber: settings.fiberTarget ?? 0,
  };
}

@Injectable()
export class NutritionSettingsService {
  constructor(private readonly repo: NutritionSettingsRepository) {}

  async getSettings(
    userId: string,
  ): Promise<UserNutritionSettingsModel | null> {
    return this.repo.findByUserId(userId);
  }

  async upsertSettings(
    userId: string,
    dto: UpsertNutritionSettingsDto,
  ): Promise<UserNutritionSettingsModel> {
    return this.repo.upsert(userId, dto);
  }

  async getTargetSuggestion(
    userId: string,
    now: Date = new Date(),
  ): Promise<TargetSuggestionResponse> {
    const [settings, weighIns] = await Promise.all([
      this.repo.findByUserId(userId),
      this.repo.findRecentWeighIns(userId),
    ]);

    const smoothed = smoothedWeight(weighIns);
    const weight: SuggestionWeight | null = smoothed
      ? smoothed
      : settings?.weightKg
        ? {
            value: settings.weightKg,
            basis: 'profile',
            count: 0,
            from: null,
            to: null,
          }
        : null;

    const gender = asGender(settings?.gender);
    const goal = asGoal(settings?.goalType);
    const missing: TargetProfileField[] = [];
    if (!gender) missing.push('gender');
    if (!settings?.birthDate) missing.push('birthDate');
    if (!settings?.heightCm) missing.push('heightCm');
    if (!weight) missing.push('weightKg');
    if (settings?.trainingDaysPerWeek == null)
      missing.push('trainingDaysPerWeek');
    if (!goal) missing.push('goalType');

    const current = currentTargets(settings);
    const experienceMode = settings?.experienceMode ?? 'GUIDED';
    const targetMode =
      experienceMode === 'EXPERT' ? 'MANUAL' : (settings?.targetMode ?? 'AUTO');

    if (
      !gender ||
      !goal ||
      !weight ||
      !settings?.birthDate ||
      !settings.heightCm ||
      settings.trainingDaysPerWeek == null
    ) {
      return {
        available: false,
        missing,
        targetMode,
        experienceMode,
        weight,
        current,
        suggested: null,
        calorieDifference: null,
        meaningful: false,
      };
    }

    const suggested = calculateTargets({
      weightKg: weight.value,
      heightCm: settings.heightCm,
      ageYears: ageOn(settings.birthDate, weight.to ?? utcDayKey(now)),
      gender,
      trainingDaysPerWeek: settings.trainingDaysPerWeek,
      goal,
    });
    const calorieDifference = current
      ? suggested.calories - current.calories
      : null;

    return {
      available: true,
      missing,
      targetMode,
      experienceMode,
      weight,
      current,
      suggested,
      calorieDifference,
      meaningful:
        calorieDifference === null ||
        Math.abs(calorieDifference) >= MEANINGFUL_CALORIE_CHANGE,
    };
  }
}
