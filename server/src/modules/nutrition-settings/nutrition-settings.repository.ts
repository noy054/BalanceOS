import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { UpsertNutritionSettingsDto } from './dto/upsert-nutrition-settings.dto';
import { UserNutritionSettingsModel } from '../../../generated/prisma/models';
import { FoodUnit, Prisma } from '../../../generated/prisma/client';

@Injectable()
export class NutritionSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(
    userId: string,
  ): Promise<UserNutritionSettingsModel | null> {
    return this.prisma.userNutritionSettings.findUnique({
      where: { userId },
    });
  }

  async upsert(
    userId: string,
    dto: UpsertNutritionSettingsDto,
  ): Promise<UserNutritionSettingsModel> {
    const birthDate = this.normalizeDate(dto.birthDate);
    const defaultFoodUnit = this.normalizeFoodUnit(dto.defaultFoodUnit);

    const updateData: Prisma.UserNutritionSettingsUncheckedUpdateInput = {
      experienceMode: dto.experienceMode,
      targetMode: dto.targetMode,
      onboardingCompleted: dto.onboardingCompleted,
      preferredLanguage: dto.preferredLanguage,
      dailyCaloriesTarget: dto.dailyCaloriesTarget,
      proteinTarget: dto.proteinTarget,
      carbsTarget: dto.carbsTarget,
      fatTarget: dto.fatTarget,
      fiberTarget: dto.fiberTarget,
      gender: dto.gender,
      birthDate,
      heightCm: dto.heightCm,
      weightKg: dto.weightKg,
      trainingDaysPerWeek: dto.trainingDaysPerWeek,
      goalType: dto.goalType,
      themeMode: dto.themeMode,
      showFiberOnHome: dto.showFiberOnHome,
      showCarbsOnHome: dto.showCarbsOnHome,
      showFatOnHome: dto.showFatOnHome,
      showProgressPercentages: dto.showProgressPercentages,
      showGuidedSuggestions: dto.showGuidedSuggestions,
      showMotivation: dto.showMotivation,
      defaultFoodUnit,
      breakfastReminderEnabled: dto.breakfastReminderEnabled,
      breakfastReminderTime: dto.breakfastReminderTime,
      lunchReminderEnabled: dto.lunchReminderEnabled,
      lunchReminderTime: dto.lunchReminderTime,
      dinnerReminderEnabled: dto.dinnerReminderEnabled,
      dinnerReminderTime: dto.dinnerReminderTime,
      waterReminderEnabled: dto.waterReminderEnabled,
      waterReminderInterval: dto.waterReminderInterval,
      dailySummaryEnabled: dto.dailySummaryEnabled,
      dailySummaryTime: dto.dailySummaryTime,
      weeklySummaryEnabled: dto.weeklySummaryEnabled,
      weeklySummaryDay: dto.weeklySummaryDay,
      weeklySummaryTime: dto.weeklySummaryTime,
    };

    const createData: Prisma.UserNutritionSettingsUncheckedCreateInput = {
      userId,
      experienceMode: dto.experienceMode,
      targetMode: dto.targetMode,
      onboardingCompleted: dto.onboardingCompleted,
      preferredLanguage: dto.preferredLanguage,
      dailyCaloriesTarget: dto.dailyCaloriesTarget,
      proteinTarget: dto.proteinTarget,
      carbsTarget: dto.carbsTarget,
      fatTarget: dto.fatTarget,
      fiberTarget: dto.fiberTarget,
      gender: dto.gender,
      birthDate,
      heightCm: dto.heightCm,
      weightKg: dto.weightKg,
      trainingDaysPerWeek: dto.trainingDaysPerWeek,
      goalType: dto.goalType,
      themeMode: dto.themeMode,
      showFiberOnHome: dto.showFiberOnHome,
      showCarbsOnHome: dto.showCarbsOnHome,
      showFatOnHome: dto.showFatOnHome,
      showProgressPercentages: dto.showProgressPercentages,
      showGuidedSuggestions: dto.showGuidedSuggestions,
      showMotivation: dto.showMotivation,
      defaultFoodUnit,
      breakfastReminderEnabled: dto.breakfastReminderEnabled,
      breakfastReminderTime: dto.breakfastReminderTime,
      lunchReminderEnabled: dto.lunchReminderEnabled,
      lunchReminderTime: dto.lunchReminderTime,
      dinnerReminderEnabled: dto.dinnerReminderEnabled,
      dinnerReminderTime: dto.dinnerReminderTime,
      waterReminderEnabled: dto.waterReminderEnabled,
      waterReminderInterval: dto.waterReminderInterval,
      dailySummaryEnabled: dto.dailySummaryEnabled,
      dailySummaryTime: dto.dailySummaryTime,
      weeklySummaryEnabled: dto.weeklySummaryEnabled,
      weeklySummaryDay: dto.weeklySummaryDay,
      weeklySummaryTime: dto.weeklySummaryTime,
    };

    return this.prisma.userNutritionSettings.upsert({
      where: { userId },
      create: createData,
      update: updateData,
    });
  }

  private normalizeDate(value?: string | Date | null): Date | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? undefined : value;
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return undefined;
    }

    const dateValue = trimmedValue.includes('T')
      ? trimmedValue
      : `${trimmedValue}T12:00:00.000Z`;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    return date;
  }

  private normalizeFoodUnit(value?: string | FoodUnit): FoodUnit | undefined {
    if (!value) {
      return undefined;
    }

    if (Object.values(FoodUnit).includes(value as FoodUnit)) {
      return value as FoodUnit;
    }

    return undefined;
  }
}
