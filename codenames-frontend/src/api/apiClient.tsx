import { apiUrl } from "../config/api";

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(apiUrl + endpoint, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  });

  let data;

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new ApiError(data?.error || "Request failed", response.status, data);
  }

  return data;
}
