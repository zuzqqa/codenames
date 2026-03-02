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

export function loginUser(data: LoginRequest) {
  return apiRequest(`/api/users/authenticate`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function registerUser(data: RegisterRequest, language: string) {
  return apiRequest(`/api/users?language=${language}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
