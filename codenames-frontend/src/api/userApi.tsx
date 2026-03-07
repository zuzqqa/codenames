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
  const data = await apiRequest("/api/users/username/" + token);
  return data.username;
}