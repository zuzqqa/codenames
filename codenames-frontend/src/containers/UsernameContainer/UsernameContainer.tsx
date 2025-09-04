import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { apiUrl } from "../../config/api";
import { getUserId } from "../../shared/utils.tsx";
import { useTranslation } from "react-i18next";
import "../UsernameContainer/UsernameContainer.css";

/**
 * UsernameContainer Component
 *
 * Displays the logged-in username if available.
 *
 * @returns {JSX.Element | null} The rendered username container.
 */
const UsernameContainer: React.FC = () => {
  const [ownUsername, setOwnUsername] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchUserId();

    const token = Cookies.get("authToken");

    if (token) {
      fetch(`${apiUrl}/api/users/get-username`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.text())
        .then((name) => {
          if (name !== "null") {
            setOwnUsername(name);
          }
        })
        .catch((err) => console.error("Failed to fetch username", err));
    } else {
      console.warn("No auth token found");
    }
  }, []);

  /**
   * Fetches the user ID from local storage and sets it in the state.
   * @returns {void} Fetches the user ID from local storage and sets it in the state.
   */
  const fetchUserId = async () => {
    try {
      const id = await getUserId();

      if (id === null) {
        return;
      }
      localStorage.setItem("userId", id);
      setUserId(id);
    } catch (error) {
      console.error("Error fetching user ID", error);
    }
  };

  return (
    <>
      {ownUsername && (
        <div className="logged-in-user gold-text">
          {t("logged-in-as")} {ownUsername}
        </div>
      )}
    </>
  );
};

export default UsernameContainer;
