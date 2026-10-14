import { useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { isAxiosError } from "axios";

import { useGoogleLogin } from "./useAuth";

type GoogleErrorKey =
  | "login.errors.googleNotConfigured"
  | "login.errors.googleRequiresBuild"
  | "login.errors.googlePlayServices"
  | "login.errors.googleMissingToken"
  | "login.errors.googleExistingAccount"
  | "login.errors.googleFailed";

let isConfigured = false;

export function useGoogleSignIn() {
  const googleLogin = useGoogleLogin();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorKey, setErrorKey] = useState<GoogleErrorKey | null>(null);

  const isPending = isSigningIn || googleLogin.isPending;

  async function signIn() {
    if (isPending) return;

    setErrorKey(null);

    if (Platform.OS === "web" || Constants.appOwnership === "expo") {
      setErrorKey("login.errors.googleRequiresBuild");
      return;
    }

    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

    if (!webClientId || (Platform.OS === "ios" && !iosClientId)) {
      setErrorKey("login.errors.googleNotConfigured");
      return;
    }

    setIsSigningIn(true);

    let googleModule:
      | typeof import("@react-native-google-signin/google-signin")
      | null = null;

    try {
      googleModule = await import("@react-native-google-signin/google-signin");

      const { GoogleSignin, isSuccessResponse } = googleModule;

      if (!isConfigured) {
        GoogleSignin.configure({
          webClientId,
          iosClientId: Platform.OS === "ios" ? iosClientId : undefined,
        });

        isConfigured = true;
      }

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) return;

      const idToken = response.data.idToken;

      if (!idToken) {
        setErrorKey("login.errors.googleMissingToken");
        return;
      }

      await googleLogin.mutateAsync({ idToken });
    } catch (error) {
      if (googleModule?.isErrorWithCode(error)) {
        if (
          error.code === googleModule.statusCodes.IN_PROGRESS ||
          error.code === "SIGN_IN_CANCELLED"
        ) {
          return;
        }

        if (
          error.code === googleModule.statusCodes.PLAY_SERVICES_NOT_AVAILABLE
        ) {
          setErrorKey("login.errors.googlePlayServices");
          return;
        }
      }

      if (isAxiosError(error)) {
        if (error.response?.status === 409) {
          setErrorKey("login.errors.googleExistingAccount");
          return;
        }
      }

      setErrorKey("login.errors.googleFailed");
    } finally {
      setIsSigningIn(false);
    }
  }

  function clearError() {
    setErrorKey(null);
  }

  return {
    signIn,
    clearError,
    isPending,
    errorKey,
  };
}
