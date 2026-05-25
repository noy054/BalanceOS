import { apiClient } from '../../../shared/api/client';
import { AUTH_ENDPOINTS } from '../constants';
import {
  AuthResponse,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  TokenPair,
  UserPublic,
} from '../types';

export const authApi = {
  register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient
      .post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, payload)
      .then((r) => r.data);
  },

  login(payload: LoginPayload): Promise<AuthResponse> {
    return apiClient
      .post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, payload)
      .then((r) => r.data);
  },

  googleLogin(payload: GoogleLoginPayload): Promise<AuthResponse> {
    return apiClient
      .post<AuthResponse>(AUTH_ENDPOINTS.GOOGLE, payload)
      .then((r) => r.data);
  },

  refresh(refreshToken: string): Promise<TokenPair> {
    return apiClient
      .post<TokenPair>(AUTH_ENDPOINTS.REFRESH, { refreshToken })
      .then((r) => r.data);
  },

  logout(): Promise<void> {
    return apiClient.post(AUTH_ENDPOINTS.LOGOUT).then(() => undefined);
  },

  me(): Promise<UserPublic> {
    return apiClient.get<UserPublic>(AUTH_ENDPOINTS.ME).then((r) => r.data);
  },
};
