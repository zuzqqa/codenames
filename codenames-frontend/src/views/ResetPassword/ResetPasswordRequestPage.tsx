import React, { useState, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { logout } from "../../shared/utils.tsx";
import { useNavigate } from "react-router-dom";

import BackgroundContainer from "../../containers/Background/Background";
import LoginRegisterContainer from "../../containers/LoginRegister/LoginRegister.tsx";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar.tsx";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal.tsx";
import Button from "../../components/Button/Button.tsx";
import FormInput from "../../components/FormInput/FormInput.tsx";
import TitleComponent from "../../components/Title/Title.tsx";

import settingsIcon from "../../assets/icons/settings.png";
import logoutButtonIcon from "../../assets/icons/logout.svg";
import lockIcon from "../../assets/icons/lock-solid-1.png";

import "../../styles/App.css";
import "../ResetPassword/ResetPasswordRequestPage.css";

interface ResetPasswordRequestProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
}

const ResetPasswordRequestPage: React.FC<ResetPasswordRequestProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [email, setEmail] = useState<string>("");
  const [musicVolume, setMusicVolume] = useState(soundFXVolume); // Music volume level
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      alert("Give your email address.");
      return;
    }
    try {
      console.log("Sending reset email to: " + email);
      const response = await fetch(
        "http://localhost:8080/api/email/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send email. Please try again later.");
      } else {
        alert("Password reset email sent successfully to your mailbox.");
        navigate("/login");
      }
    } catch (error) {
      alert(
        "An error occurred while sending reset email. Please try again later." +
          error
      );
      return;
    }
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const updateMusicVolume = (volume: number) => {
    setMusicVolume(volume);
    setVolume(volume); // Update global volume
  };

  return (
    <BackgroundContainer>
      <GameTitleBar />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={toggleSettings}
        musicVolume={musicVolume}
        soundFXVolume={soundFXVolume}
        setMusicVolume={updateMusicVolume}
        setSoundFXVolume={setSoundFXVolume}
      />
      <Button variant="circle" soundFXVolume={soundFXVolume}>
        <img src={settingsIcon} onClick={toggleSettings} alt="Settings" />
      </Button>
      {document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("loggedIn=")) && (
        <Button variant="logout" soundFXVolume={soundFXVolume}>
          <img src={logoutButtonIcon} onClick={logout} alt="Logout" />
        </Button>
      )}
      <TitleComponent
        soundFXVolume={soundFXVolume}
        customStyle={{
          fontSize: "4rem",
          textAlign: "left",
          marginLeft: "35%",
          marginBottom: "-1.2%",
        }}
        shadowStyle={{
          fontSize: "4rem",
          textAlign: "left",
          marginLeft: "35%",
          marginBottom: "-1.2%",
        }}
      >
        {t("password-reset")}
      </TitleComponent>
      <LoginRegisterContainer>
        <div className="reset-password-container">
          <div className="reset-password-image">
            <div className="icon-circle">
              <img src={lockIcon} className="lock-icon no-select" alt="Lock Icon" />
            </div>
          </div>
          <div className="reset-password-information no-select">
          Enter your email to receive a link to recover your account.
          </div>
          <form className="reset-password-form" onSubmit={handleSubmit}>
            <FormInput
              type="text"
              placeholder="E-MAIL"
              value={email}
              onChange={handleEmailChange}
            />
            <Button
              type="submit"
              variant="primary"
              soundFXVolume={soundFXVolume}
            >
              <span className="button-text">{t("submit-button")}</span>
            </Button>
          </form>
        </div>
      </LoginRegisterContainer>
    </BackgroundContainer>
  );
};

export default ResetPasswordRequestPage;
