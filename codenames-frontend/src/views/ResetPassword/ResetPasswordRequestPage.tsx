import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
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
import spinnerIcon from "../../assets/icons/spinner.svg";

import "../../styles/App.css";
import "../ResetPassword/ResetPasswordRequestPage.css";
import { apiUrl } from "../../config/api.tsx";
import { useToast } from "../../components/Toast/ToastContext.tsx";

/**
 * Generates a unique ID for notifications and errors.
 * @returns A unique identifier string.
 */
const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

/**
 * ResetPasswordRequestProps defines the properties for the ResetPasswordRequestPage component.
 */ 
interface ResetPasswordRequestProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
}

/**
 * ResetPasswordRequestPage is a React functional component that handles the password reset request functionality.
 * @param param0 - The properties for the ResetPasswordRequestPage component.
 * @returns JSX.Element
 */
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
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  /**
   * Handles the change event for the email input field.
   * @param e - The event triggered when the user types in the email input field.
   */
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  /**
   * Handles the form submission for the password reset request.
   * @param e - The event triggered when the form is submitted.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      addToast(t("email-error-message"), "error");
      return;
    }

    setIsLoading(true);
    console.log(apiUrl);
    console.log(import.meta.env.VITE_BACKEND_API_URL);
    
    try {
      const response = await fetch(
        `${apiUrl}/api/email/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (response.status == 200) {
        setIsLoading(false);
        addToast(t("e-mail-reset-sent"), "notification");
      } else if (response.status == 404) {
        addToast(t("e-mail-not-found"), "error");
        setIsLoading(false);
        return;
      }
    } catch (error) {
      addToast("An error occurred while sending reset email. Please try again later.", "error");
      setIsLoading(false);
      return;
    }
  };

  /**
   * Toggles the visibility of the settings modal.
   */
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  /**
   * Updates the music volume level.
   * @param volume - The new volume level to set.
   */
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
      <Button variant="circle" soundFXVolume={soundFXVolume} onClick={toggleSettings}>
        <img src={settingsIcon} alt="Settings" />
      </Button>
      {document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("loggedIn=")) && (
        <Button variant="logout" soundFXVolume={soundFXVolume}>
          <img src={logoutButtonIcon} onClick={logout} alt="Logout" />
        </Button>
      )}
      <LoginRegisterContainer variant="reset">
        <TitleComponent
            soundFXVolume={soundFXVolume}
            customStyle={{

              textAlign: "left",
              position: "relative",
              top: "-5vh",
              whiteSpace: "nowrap"
            }}
            shadowStyle={{
              textAlign: "left",
              position: "absolute",
              top: "-5vh",
              whiteSpace: "nowrap"
            }}
            variant="reset-title"
        >
          {t("password-reset")}
        </TitleComponent>
        <div className="reset-password-container">
          <div className="reset-password-image">
            <div className="icon-circle">
              <img
                  src={lockIcon}
                  className="lock-icon no-select"
                  alt="Lock Icon"
              />
            </div>
          </div>
          <div className="reset-password-information no-select">
            {t("reset-password-instructions")}
          </div>
          <form className="reset-password-form" onSubmit={handleSubmit}>
            <FormInput
                type="text"
                placeholder="E-MAIL"
                value={email}
                onChange={handleEmailChange}
            />
            {isLoading ? (
                <div className="loading-spinner">
                  <img
                      src={spinnerIcon}
                      alt="Loading..."
                      className="spinner-image"
                  />
                </div>
            ) : (
                <Button
                    type="submit"
                    variant="primary"
                    soundFXVolume={soundFXVolume}
                >
                  <span className="button-text">{t("submit-button")}</span>
                </Button>
            )}
          </form>
        </div>
      </LoginRegisterContainer>
    </BackgroundContainer>
  );
};

export default ResetPasswordRequestPage;
