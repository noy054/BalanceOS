import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "balanceos-settings-notification-ids";

type ReminderConfig = {
  enabled: boolean;
  time?: string | null;
  title: string;
  body: string;
};

type WaterReminderConfig = {
  enabled: boolean;
  intervalMinutes?: number | null;
  title: string;
  body: string;
};

type WeeklyReminderConfig = {
  enabled: boolean;
  day?: number | null;
  time?: string | null;
  title: string;
  body: string;
};

type ScheduleSettingsNotificationsPayload = {
  breakfast: ReminderConfig;
  lunch: ReminderConfig;
  dinner: ReminderConfig;
  dailySummary: ReminderConfig;
  weeklySummary: WeeklyReminderConfig;
  water: WaterReminderConfig;
};

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }) as Notifications.NotificationBehavior,
});

function parseTime(value?: string | null) {
  if (!value) {
    return null;
  }

  const [hourRaw, minuteRaw] = value.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return { hour, minute };
}

async function getStoredNotificationIds() {
  const rawValue = await SecureStore.getItemAsync(STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    return Array.isArray(parsedValue) ? parsedValue.filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function storeNotificationIds(ids: string[]) {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(ids));
}

async function requestNotificationPermission() {
  const currentPermissions = await Notifications.getPermissionsAsync();

  if (currentPermissions.status === "granted") {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();

  return requestedPermissions.status === "granted";
}

async function configureAndroidChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#31D86B",
  });
}

export async function cancelSettingsNotifications() {
  const ids = await getStoredNotificationIds();

  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => null),
    ),
  );

  await storeNotificationIds([]);
}

async function scheduleDailyReminder(config: ReminderConfig) {
  const parsedTime = parseTime(config.time);

  if (!config.enabled || !parsedTime) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: config.title,
      body: config.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: parsedTime.hour,
      minute: parsedTime.minute,
    },
  });
}

async function scheduleWeeklyReminder(config: WeeklyReminderConfig) {
  const parsedTime = parseTime(config.time);

  if (
    !config.enabled ||
    !parsedTime ||
    config.day === null ||
    config.day === undefined
  ) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: config.title,
      body: config.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: config.day + 1,
      hour: parsedTime.hour,
      minute: parsedTime.minute,
    },
  });
}

async function scheduleWaterReminder(config: WaterReminderConfig) {
  if (
    !config.enabled ||
    !config.intervalMinutes ||
    config.intervalMinutes <= 0
  ) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: config.title,
      body: config.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: config.intervalMinutes * 60,
      repeats: true,
    },
  });
}

export async function scheduleSettingsNotifications(
  payload: ScheduleSettingsNotificationsPayload,
) {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    throw new Error("NOTIFICATIONS_PERMISSION_DENIED");
  }

  await configureAndroidChannel();
  await cancelSettingsNotifications();

  const ids = await Promise.all([
    scheduleDailyReminder(payload.breakfast),
    scheduleDailyReminder(payload.lunch),
    scheduleDailyReminder(payload.dinner),
    scheduleDailyReminder(payload.dailySummary),
    scheduleWeeklyReminder(payload.weeklySummary),
    scheduleWaterReminder(payload.water),
  ]);

  await storeNotificationIds(ids.filter(Boolean) as string[]);
}
