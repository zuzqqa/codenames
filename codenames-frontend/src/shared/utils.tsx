import apiUrl from "../../api/api.ts";

/**
 * Logs out the user by sending a request to the server and clearing session cookies.
 * If successful, the user is redirected to the loading screen.
 * @async
 * @function logout
 */
export const logout = async () => {
  try {
    const response = await fetch(apiUrl + "/api/users/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in the request
    });

    if (response.ok) {
      localStorage.removeItem("userId");
      localStorage.removeItem("gameId");

      window.location.href = "/loading";
    } else {
      const error = await response.text();
      alert("Failed to log out: " + error);
    }
  } catch (error) {
    alert("An error occurred during logout. Please try again later." + error);
  }
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
