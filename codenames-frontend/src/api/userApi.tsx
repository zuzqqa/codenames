// TODO: commment the code
import { apiRequest } from "./apiClient";
import { getCookie } from "../shared/utils";

export async function getUserId(): Promise<string | null> {
  const token = getCookie("authToken");

  if (!token) {
    return null;
  }

  try {
    const userId = await apiRequest("/api/users/get-id", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return userId !== "null" ? userId : null;
  } catch (err) {
    console.error("Failed to get user ID", err);
    return null;
  }
}

export async function getPlayerUsername(token: string): Promise<string> {
  const response = await apiRequest("/api/users/username/" + token);
  return response.username;
}

export async function getGuestStatus(): Promise<boolean> {
  const token = getCookie("authToken");

  if (!token) {
    return true;
  }

  try {
    const guestStatus = await apiRequest("/api/users/is-guest", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return !!guestStatus;
  } catch (err) {
    console.error("Failed to retrieve guest status", err);
    return true;
  }
}