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

export function convertDurationToMMSS(duration: string | number): string {
  let totalSeconds: number;

  if (typeof duration === "number") {
    totalSeconds = duration;
  } else {
    if (/^\d{1,2}:\d{2}$/.test(duration)) {
      // Obsługuje format "mm:ss"
      const [minutes, seconds] = duration.split(":").map(Number);
      totalSeconds = minutes * 60 + seconds;
    } else {
      // Obsługuje format "PTxxMxxS"
      const regex = /^PT(?:(\d+)M)?(?:(\d+)S)?$/;
      const match = duration.match(regex);

      if (match) {
        const minutes = parseInt(match[1] || "0", 10);
        const seconds = parseInt(match[2] || "0", 10);
        totalSeconds = minutes * 60 + seconds;
      } else {
        console.warn("Invalid duration format:", duration);
        return "00:00"; // Jeśli niepoprawny format
      }
    }
  }

  // Konwertuje sekundy na format "mm:ss"
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Zwraca w formacie "mm:ss"
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}


export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}
