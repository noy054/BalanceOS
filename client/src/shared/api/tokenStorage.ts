import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'balance_access_token';
const REFRESH_TOKEN_KEY = 'balance_refresh_token';

async function secureGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return AsyncStorage.getItem(key);
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function secureDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    await AsyncStorage.removeItem(key);
  }
}

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return secureGet(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return secureGet(REFRESH_TOKEN_KEY);
  },

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      secureSet(ACCESS_TOKEN_KEY, accessToken),
      secureSet(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      secureDelete(ACCESS_TOKEN_KEY),
      secureDelete(REFRESH_TOKEN_KEY),
    ]);
  },
};
