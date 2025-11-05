import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import "../../styles/App.css";
import "../LoginPage/LoginPage.css";
import "../../views/ResetPassword/ResetPasswordPage.css";

import BackgroundContainer from "../../containers/Background/Background.tsx";
import LoginRegisterContainer from "../../containers/LoginRegister/LoginRegister.tsx";

import Button from "../../components/Button/Button.tsx";
import FormInput from "../../components/FormInput/FormInput.tsx";
import TitleComponent from "../../components/Title/Title.tsx";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar.tsx";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal.tsx";

import settingsIcon from "../../assets/icons/settings.png";
import eyeIcon from "../../assets/icons/eye.svg";
import eyeSlashIcon from "../../assets/icons/eye-slash.svg";
import logoutButtonIcon from "../../assets/icons/logout.svg";
import lockIcon from "../../assets/icons/lock-solid-1.png";
import sadFaceIcon from "../../assets/icons/sad-face.svg";

import { logout } from "../../shared/utils.tsx";
import { validatePassword } from "../../utils/validation.tsx";
import { apiUrl } from "../../config/api.tsx";
import { useToast } from "../../components/Toast/ToastContext.tsx";

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

interface ResetPasswordProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
}

const ResetPasswordPage: React.FC<ResetPasswordProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [password, setPassword] = useState<string>("");
  const [passwordRepeat, setPasswordRepeat] = useState<string>("");
  const [musicVolume, setMusicVolume] = useState(() => {
    const savedVolume = localStorage.getItem("musicVolume");
    return savedVolume ? parseFloat(savedVolume) : 50;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const [tokenExpired, setTokenExpired] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (!token) {
      addToast("Token is missing", "error");
      return;
    }

    const validateToken = async () => {
      try {
        const url = `${apiUrl}/api/users/token-validation/${token}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status !== 200) {
          setTokenExpired(true);
        }
      } catch (error) {
        let errorMessage = "Unknown error";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        addToast(`Connection error: ${errorMessage}`, "error");
      }
    };

    validateToken();
  }, []);

  /**
   * Handles the change event for the password repeat input field.
   * @param e - The event triggered when the password input changes.
   */
  const handlePasswordRepeatChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordRepeat(e.target.value);
    const inputValue = e.target.value;

    if (inputValue.length > passwordRepeat.length) {
      setPasswordRepeat(passwordRepeat + inputValue[inputValue.length - 1]);
    } else {
      setPasswordRepeat(passwordRepeat.slice(0, -1));
    }
  };

  /**
   * Handles the change event for the password input field.
   * @param e - The event triggered when the password input changes.
   */
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    const inputValue = e.target.value;

    if (inputValue.length > password.length) {
      setPassword(password + inputValue[inputValue.length - 1]);
    } else {
      setPassword(password.slice(0, -1));
    }
  };

  useEffect(() => {
    localStorage.setItem("musicVolume", musicVolume.toString());
  }, [musicVolume]);

  /**
   * Handles the form submission for resetting the password.
   * @param e - The form event triggered on submission.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      addToast(t("password-error-message"), "error");
      return;
    }

    try {
      if (password !== passwordRepeat) {
        addToast(t("passwords-dont-match"), "error");
        return;
      }

      const response = await fetch(
        `${apiUrl}/api/users/reset-password/` + token,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: password }),
        }
      );

      if (response.ok) {
        navigate("/login");
      } else if (response.status === 400) {
        addToast(t("invalid-or-expired-token"), "error");
      }
    } catch (error) {
      addToast("Unknown error. Try again later.", "error");
    }
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const updateMusicVolume = (volume: number) => {
    setMusicVolume(volume);
    setVolume(volume);
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
      <Button
        variant="circle"
        soundFXVolume={soundFXVolume}
        onClick={toggleSettings}
      >
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
            fontSize: "calc(3.6rem + 0.2vw)",
            textAlign: "left",
            position: "absolute",
            top: "calc(-2rem - 1vh)",
            left: "-1rem",
          }}
          shadowStyle={{
            fontSize: "calc(3.6rem + 0.2vw)",
            textAlign: "left",
            position: "absolute",
            top: "calc(-2rem - 1vh)",
            left: "-1rem",
          }}
          variant="reset-title"
        >
          {t("new-password")}
        </TitleComponent>
        <div className="reset-password-container">
          <div className="reset-password-image">
            <div className="icon-circle">
              <img
                src={tokenExpired ? sadFaceIcon : lockIcon}
                className="lock-icon no-select"
                alt="Lock Icon"
              />
            </div>
          </div>
          {tokenExpired ? (
            <p className="token-expired-message">
              {t("token-expired-message")}{" "}
              <a href="/send-reset-password" className="text-link">
                {t("try-reset-password")}
              </a>{" "}
              {t("or")}{" "}
              <a href="/" className="text-link">
                {t("go-back-to-homepage")}
              </a>
              .
            </p>
          ) : (
            <form className="reset-password-form" onSubmit={handleSubmit}>
              <FormInput
                type="text"
                placeholder={t("PASSWORD")}
                value={
                  !isPasswordVisible ? "●".repeat(password.length) : password
                }
                onChange={handlePasswordChange}
                button={
                  <Button
                    variant="eye"
                    soundFXVolume={soundFXVolume}
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <img
                      src={isPasswordVisible ? eyeSlashIcon : eyeIcon}
                      alt={
                        isPasswordVisible ? "Hide password" : "Show password"
                      }
                    />
                  </Button>
                }
              />
              <FormInput
                type="text"
                placeholder={t("REPEAT-PASSWORD")}
                value={
                  !isPasswordVisible
                    ? "●".repeat(passwordRepeat.length)
                    : passwordRepeat
                }
                onChange={handlePasswordRepeatChange}
              />
              <Button
                type="submit"
                variant="primary"
                soundFXVolume={soundFXVolume}
              >
                <span className="button-text">{t("submit-button")}</span>
              </Button>
            </form>
          )}
        </div>
      </LoginRegisterContainer>
    </BackgroundContainer>
  );
};

export default ResetPasswordPage;
