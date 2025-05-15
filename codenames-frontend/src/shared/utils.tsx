import Cookies from 'js-cookie';
import { apiUrl } from '../config/api.tsx';

/**
 * Logs out the user by clearing localStorage and removing authentication cookies.
 * Then redirects the user to the loading screen.
 */
export const logout = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("gameId");
  
  Cookies.remove("authToken");
  Cookies.remove("loggedIn");

  window.location.href = "/loading";
};

/**
 * Formats a given time in seconds to "mm:ss" format.
 * @param {number} seconds - The number of seconds to format.
 * @returns {string} - The formatted time as "mm:ss".
 */
export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

/**
 * Retrieves the value of a specific cookie by name.
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string | undefined} - The value of the cookie.
 */
export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? undefined;
}

/**
 * Retrieves user's id value.
 *
 */
export async function getUserId() {
  const token = getCookie("authToken");

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/api/users/get-id`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Error while downloading a user:", response.status);
      return null;
    }

    const userId = await response.text();
    return userId !== "null" ? userId : null;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};