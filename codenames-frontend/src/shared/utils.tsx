export const logout = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/users/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in the request
    });

    if (response.ok) {
      document.cookie = `loggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      window.location.href = "/loading";
    } else {
      const error = await response.text();
      alert("Failed to log out: " + error);
    }
  } catch (error) {
    alert("An error occurred during logout. Please try again later." + error);
  }
};

export function convertDurationToSeconds(duration: string | number): number {
  if (typeof duration === "string") {
    const regex = /^PT(\d+)([SMH])$/;
    const match = duration.match(regex);

    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];

      if (unit === "S") {
        return value;
      } else if (unit === "M") {
        return value * 60;
      } else if (unit === "H") {
        return value * 3600;
      } else {
        console.warn("Unhandled unit:", unit);
        return 0;
      }
    } else {
      console.warn("Invalid duration format:", duration);
    }
  }

  return typeof duration === "number" ? duration : 0;
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}
