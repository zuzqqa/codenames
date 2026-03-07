// TODO: commment the code
import { apiRequest } from "./apiClient";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  roles: string;
}

type AuthResponse = {
  token: string;
};

export function loginUser(data: LoginRequest): Promise<AuthResponse> {
  return apiRequest(`/api/users/authenticate`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function registerUser(
  data: RegisterRequest,
  language: string,
): Promise<AuthResponse> {
  return apiRequest(`/api/users?language=${language}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createGuest(): Promise<AuthResponse> {
  return apiRequest(`/api/users/create-guest`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
}
