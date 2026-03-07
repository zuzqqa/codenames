import React from "react";
import Button from "../Button/Button";
import { apiUrl } from "../../config/api";
import discordIcon from "../../assets/icons/discord-icon.png";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { connectDiscordAccount } from "../../api/authApi";

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
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        alert("No auth token found");
        return;
      }

      await connectDiscordAccount(token);
      window.location.href = `${apiUrl}/oauth2/authorization/discord`;
    } catch (err) {
      console.error("Error connecting Discord:", err);
      alert("Error");
    }
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
