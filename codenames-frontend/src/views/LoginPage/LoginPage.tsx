import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";

import "../../styles/App.css";
import "./LoginPage.css";

import BackgroundContainer from "../../containers/Background/Background";
import Button from "../../components/Button/Button";
import FormInput from "../../components/FormInput/FormInput";
import TitleComponent from "../../components/Title/Title";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar.tsx";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal.tsx";
import settingsIcon from "../../assets/icons/settings.png";
import eyeIcon from "../../assets/icons/eye.svg";
import eyeSlashIcon from "../../assets/icons/eye-slash.svg";
import logoutButton from "../../assets/icons/logout.svg";

import LoginRegisterContainer from "../../containers/LoginRegister/LoginRegister.tsx";
import { logout } from "../../shared/utils.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

/**
 * Props type definition for the LoginPage component.
 */
interface LoginProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
}

/**
 * LoginPage component responsible for user authentication.
 *
 * @param {LoginProps} props - Component props.
 * @returns {JSX.Element} The rendered LoginPage component.
 */
const LoginPage: React.FC<LoginProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [musicVolume, setMusicVolume] = useState(50); // Music volume level
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);
  const [notifications, setNotifications] = useState<
    { id: string; message: string }[]
  >([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isActivated = searchParams.get("activated") === "true";
  const username = searchParams.get("username");

  /**
   * Handles changes to the login input field.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - Event containing the input value.
   */
  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLogin(e.target.value);
  };

  /**
   * Handles changes to the password input field.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - Event containing the input value.
   */
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    const inputValue = e.target.value;

    if (inputValue.length > password.length) {
      setPassword(password + inputValue[inputValue.length - 1]);
    } else {
      setPassword(password.slice(0, -1)); // Handle backspace
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
   * useEffect hook for handling the automatic removal of notification messages after a delay.
   *
   * - Adds a fade-out effect to the toast notification before removal.
   * - Removes notifications from the state after a timeout.
   *
   * @param {Array<{ id: string; message: string }>} errors - Array of notification messages with unique IDs.
   */
  useEffect(() => {
    if (isActivated) {
      setNotifications((prevNotifications) => {
        const notificationExists = prevNotifications.some(
          (n) => n.message === t("account-activated-notification")
        );

        if (!notificationExists) {
          return [
            ...prevNotifications,
            { id: generateId(), message: t("account-activated-notification") },
          ];
        }

        return prevNotifications;
      });
    }
  }, [isActivated]);

  /**
   * Updates the `login` state whenever `username` changes.
   *
   * This effect listens for changes in `username`. If a new `username` is available,
   * it updates the `login` state accordingly.
   *
   * @effect Syncs `login` state with `username` whenever `username` updates.
   */
  useEffect(() => {
    if (username) {
      setLogin(username);
    }
  }, [username]);

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

  /**
   * Handles form submission and sends login credentials to the server.
   *
   * @param {FormEvent<HTMLFormElement>} e - Form submission event.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: { id: string; message: string }[] = [];
    setErrors(newErrors);

    const userData = { username: login, password };

    try {
      const response = await fetch(
        "http://localhost:8080/api/users/authenticate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
          credentials: "include",
        }
      );

      if (response.ok) {
        window.location.href = "/loading";
      } else if (response.status === 401) {
        newErrors.push({
          id: generateId(),
          message: t("account-not-activated"),
        });

        setErrors([...newErrors]);
      } else {
        const error = await response.text();
        alert("Failed to log in: " + error);
      }
    } catch (error) {
      newErrors.push({
        id: generateId(),
        message: t("invalid-login-or-password"), // albo bez tłumaczenia: "Nieprawidłowy login lub hasło"
      });
      setErrors([...newErrors]);
    }
  };

  /** Toggles the visibility of the settings modal. */
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  /**
   * Updates the music volume both locally and globally.
   *
   * @param {number} volume - New volume level.
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
      <Button variant="circle" soundFXVolume={soundFXVolume}>
        <img src={settingsIcon} onClick={toggleSettings} alt="Settings" />
      </Button>
      {document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("loggedIn=")) && (
        <Button variant="logout" soundFXVolume={soundFXVolume}>
          <img src={logoutButton} onClick={logout} alt="Logout" />
        </Button>
      )}
      <TitleComponent
        soundFXVolume={soundFXVolume}
        customStyle={{
          fontSize: "4rem",
          textAlign: "left",
          marginLeft: "35%",
          marginBottom: "-2.2%",
        }}
        shadowStyle={{
          fontSize: "4rem",
          textAlign: "left",
          marginLeft: "35%",
          marginBottom: "-2.2%",
        }}
      >
        {t("login-button-text")}
      </TitleComponent>
      <LoginRegisterContainer>
        <div className="login-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <FormInput
              type="text"
              placeholder="LOGIN"
              value={login}
              onChange={handleLoginChange}
            />
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
            <div
              className="reset-password"
            >
              <a
                className="reset-password-link"
                onClick={() => navigate("/send-reset-password")}
              >
                {t("forgot-password-text")}
              </a>
            </div>
            <Button
              type="submit"
              variant="primary"
              soundFXVolume={soundFXVolume}
            >
              <span className="button-text">{t("submit-button")}</span>
            </Button>
          </form>
          <div className="or-container">
            <div className="gold-line"></div>
            <span className="or-text">{t("or")}</span>
            <div className="gold-line"></div>
          </div>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              locale="en"
              onSuccess={() => {
                window.location.href =
                  "http://localhost:8080/oauth2/authorization/google";
              }}
              onError={() => {
                console.log("Google login failed");
              }}
            />
          </GoogleOAuthProvider>
        </div>
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
      </LoginRegisterContainer>
    </BackgroundContainer>
  );
};

export default LoginPage;
