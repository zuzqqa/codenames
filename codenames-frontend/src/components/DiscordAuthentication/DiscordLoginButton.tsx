import React from "react";
import Button from "../Button/Button";
import { apiUrl } from "../../config/api";
import discordIcon from "../../assets/icons/discord-icon.png";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

/**
 * Props for DiscordLoginButton component.
 */
interface DiscordLoginButtonProps {
  soundFXVolume: number;
  style?: React.CSSProperties;
}

const DiscordLoginButton: React.FC<DiscordLoginButtonProps> = ({
  soundFXVolume,
}) => {
  const { t } = useTranslation();

  /**
   * Connects the user's Discord account.
   */
  async function connectDiscord(): Promise<void> {
    const token = Cookies.get("authToken");

    const res = await fetch(`${apiUrl}/api/discord/link/begin`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    if (!res.ok) {
      alert("Error");
      return;
    }

    const { redirectUrl } = await res.json();
    window.location.href = `${apiUrl}/oauth2/authorization/discord`;
  }

  return (
    <Button
      variant="discord"
      soundFXVolume={soundFXVolume}
      onClick={connectDiscord}
    >
      <img
        src={discordIcon}
        alt="Discord logo"
        style={{ width: "2rem", height: "2rem", objectFit: "contain" }}
      />
      <span className="button-text">{t("connect-to-discord")}</span>
    </Button>
  );
};

export default DiscordLoginButton;
