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

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

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
  const [notifications, setNotifications] = useState<
    { id: string; message: string }[]
  >([]);
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newNotifications: { id: string; message: string }[] = [];
    const newErrors: { id: string; message: string }[] = [];

    if (!email) {
      newErrors.push({
        id: generateId(),
        message: t("email-error-message"),
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

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
        newNotifications.push({
          id: generateId(),
          message: t("e-mail-reset-sent"),
        });
        setNotifications([...newNotifications]);

        navigate("/login");
      } else if (response.status == 404) {
        newNotifications.push({
          id: generateId(),
          message: t("e-mail-not-found"),
        });
        setNotifications([...newNotifications]);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      newErrors.push({
        id: generateId(),
        message:
          "An error occurred while sending reset email. Please try again later.",
      });
      setErrors([...newErrors]);
      setIsLoading(false);
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

  /**
   * useEffect hook for handling the automatic removal of notification messages after a delay.
   *
   * - Adds a fade-out effect to the toast notification before removal.
   * - Removes notifications from the state after a timeout.
   *
   * @param {Array<{ id: string; message: string }>} errors - Array of notification messages with unique IDs.
   */
  useEffect(() => {
    if (notifications.length === 0) return;

    const timers: number[] = notifications.map((notification) => {
      const toastElement = document.getElementById(notification.id);

      if (toastElement) {
        // Fade out the toast after 8 seconds
        const fadeOutTimer = setTimeout(() => {
          toastElement.classList.add("hide");
        }, 8000);

        // Remove the message from state after 8.5 seconds
        const removeTimer = setTimeout(() => {
          setNotifications((prevNotifications) =>
            prevNotifications.filter((n) => n.id !== notification.id)
          );
        }, 8500);

        return removeTimer;
      } else {
        // Remove message if toast element is not found
        return setTimeout(() => {
          setNotifications((prevNotifications) =>
            prevNotifications.filter((n) => n.id !== notification.id)
          );
        }, 8000);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [notifications]);

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

  /**
   * useEffect hook for handling the automatic removal of notification messages after a delay.
   *
   * - Adds a fade-out effect to the toast notification before removal.
   * - Removes notifications from the state after a timeout.
   *
   * @param {Array<{ id: string; message: string }>} errors - Array of notification messages with unique IDs.
   */
  useEffect(() => {
    if (notifications.length === 0) return;

    const timers: number[] = notifications.map((notification) => {
      const toastElement = document.getElementById(notification.id);

      if (toastElement) {
        // Fade out the toast after 8 seconds
        const fadeOutTimer = setTimeout(() => {
          toastElement.classList.add("hide");
        }, 8000);

        // Remove the message from state after 8.5 seconds
        const removeTimer = setTimeout(() => {
          setNotifications((prevNotifications) =>
            prevNotifications.filter((n) => n.id !== notification.id)
          );
        }, 8500);

        return removeTimer;
      } else {
        // Remove message if toast element is not found
        return setTimeout(() => {
          setNotifications((prevNotifications) =>
            prevNotifications.filter((n) => n.id !== notification.id)
          );
        }, 8000);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [notifications]);

  /**
   * Handles manual closing of a toast notification.
   *
   * - Fades out the toast visually before removing it from the state.
   *
   * @param {string} id - The unique identifier of the notification toast to be closed.
   */
  const handleCloseNotificationToast = (id: string) => {
    const toastElement = document.getElementById(id);
    if (toastElement) {
      toastElement.classList.add("hide");

      setTimeout(() => {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification.id !== id)
        );
      }, 500);
    }
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
              <img
                src={lockIcon}
                className="lock-icon no-select"
                alt="Lock Icon"
              />
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
        {notifications.length > 0 && (
          <div className="toast-container">
            {notifications.map((notification) => (
              <div
                id={notification.id}
                key={notification.id}
                className="toast active"
              >
                <div className="toast-content">
                  <i
                    className="fa fa-info-circle fa-3x"
                    style={{ color: "#1B74BB" }}
                    aria-hidden="true"
                  ></i>
                  <div className="message">
                    <span className="text text-1">Notification</span>
                    <span className="text text-2">{notification.message}</span>
                  </div>
                </div>
                <i
                  className="fa-solid fa-xmark close"
                  onClick={() => handleCloseNotificationToast(notification.id)}
                ></i>
                <div className="progress active notification"></div>
              </div>
            ))}
          </div>
        )}
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
      </LoginRegisterContainer>
    </BackgroundContainer>
  );
};

export default ResetPasswordRequestPage;
