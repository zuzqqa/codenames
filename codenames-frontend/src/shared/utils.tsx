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