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

import { logout } from "../../shared/utils.tsx";
import { validatePassword } from "../../utils/validation.tsx";

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
  const [musicVolume, setMusicVolume] = useState(50); // Music volume level
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);

  const handlePasswordRepeatChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordRepeat(e.target.value);
    const inputValue = e.target.value;

    if (inputValue.length > passwordRepeat.length) {
      setPasswordRepeat(passwordRepeat + inputValue[inputValue.length - 1]);
    } else {
      setPasswordRepeat(passwordRepeat.slice(0, -1));
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    const inputValue = e.target.value;

    if (inputValue.length > password.length) {
      setPassword(password + inputValue[inputValue.length - 1]);
    } else {
      setPassword(password.slice(0, -1));
    }
  };

  /**
   * useEffect hook for handling the automatic removal of error messages after a delay.
   *
   * - Adds a fade-out effect to the toast error before removal.
   * - Removes errors from the state after a timeout.
   *
   * @param {Array<{ id: string; message: string }>} errors - Array of error messages with unique IDs.
   */
  useEffect(() => {
    if (errors.length === 0) return;

    const timers: number[] = errors.map((error) => {
      const toastElement = document.getElementById(error.id);

      if (toastElement) {
        // Fade out the toast after 8 seconds
        const fadeOutTimer = setTimeout(() => {
          toastElement.classList.add("hide");
        }, 8000);

        // Remove the error from state after 8.5 seconds
        const removeTimer = setTimeout(() => {
          setErrors((prevErrors) =>
            prevErrors.filter((e) => e.id !== error.id)
          );
        }, 8500);

        return removeTimer;
      } else {
        // Remove error if toast element is not found
        return setTimeout(() => {
          setErrors((prevErrors) =>
            prevErrors.filter((e) => e.id !== error.id)
          );
        }, 8000);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [errors]);

  /**
   * Handles manual closing of a toast error.
   *
   * - Fades out the toast visually before removing it from the state.
   *
   * @param {string} id - The unique identifier of the error toast to be closed.
   */
  const handleCloseErrorToast = (id: string) => {
    const toastElement = document.getElementById(id);
    if (toastElement) {
      toastElement.classList.add("hide");

      setTimeout(() => {
        setErrors((prevErrors) =>
          prevErrors.filter((error) => error.id !== id)
        );
      }, 500);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: { id: string; message: string }[] = [];
    setErrors(newErrors);

    if (!validatePassword(password)) {
      newErrors.push({
        id: generateId(),
        message: t("password-error-message"),
      });

      setErrors(newErrors);

      return;
    }

    try {
      if (password !== passwordRepeat) {
        newErrors.push({
          id: generateId(),
          message: t("passwords-dont-match"),
        });

        setErrors([...newErrors]);
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/users/reset-password/" + token,
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
        newErrors.push({
          id: generateId(),
          message: t("invalid-or-expired-token"),
        });

        setErrors([...newErrors]);
      }
    } catch (error) {
      alert(
        "An error occurred during password reset. Please try again later." +
          error
      );
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
        {t("new-password")}
      </TitleComponent>
      <LoginRegisterContainer>
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
          <form className="page-r" onSubmit={handleSubmit}>
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
                    alt={isPasswordVisible ? "Hide password" : "Show password"}
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
        </div>
      </LoginRegisterContainer>
      {errors.length > 0 && (
        <div className="toast-container">
          {errors.map((error) => (
            <div id={error.id} key={error.id} className="toast active">
              <div className="toast-content">
                <i
                  className="fa fa-exclamation-circle fa-3x"
                  style={{ color: "#561723" }}
                  aria-hidden="true"
                ></i>
                <div className="message">
                  <span className="text text-1">Error</span>
                  <span className="text text-2">{error.message}</span>
                </div>
              </div>
              <i
                className="fa-solid fa-xmark close"
                onClick={() => handleCloseErrorToast(error.id)}
              ></i>
              <div className="progress active"></div>
            </div>
          ))}
        </div>
      )}
    </BackgroundContainer>
  );
};

export default ResetPasswordPage;
