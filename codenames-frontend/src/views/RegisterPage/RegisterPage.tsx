import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

import BackgroundContainer from "../../containers/Background/Background.tsx";
import Button from "../../components/Button/Button.tsx";
import FormInput from "../../components/FormInput/FormInput.tsx";
import TitleComponent from "../../components/Title/Title.tsx";
import LoginRegisterContainer from "../../containers/LoginRegister/LoginRegister.tsx";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar.tsx";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal.tsx";

import settingsIcon from "../../assets/icons/settings.png";
import eyeIcon from "../../assets/icons/eye.svg";
import eyeSlashIcon from "../../assets/icons/eye-slash.svg";
import logoutButton from "../../assets/icons/logout.svg";

import { logout } from "../../shared/utils.tsx";
import { validateEmail, validateUsername, validatePassword } from "../../utils/validation.tsx";

import "../../styles/App.css";
import "./RegisterPage.css";

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

/**
 *
 * Props for the RegisterPage component.
 * @typedef {Object} RegisterProps
 * @property {function(number): void} setVolume - Function to set the global music volume.
 * @property {number} soundFXVolume - Current volume level of sound effects.
 * @property {function(number): void} setSoundFXVolume - Function to set the sound effects volume.
 */
interface RegisterProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
}

/**
 * RegisterPage component handles user registration.
 *
 * @param {RegisterProps} props - Component properties.
 * @returns {JSX.Element} The rendered RegisterPage component.
 */
const RegisterPage: React.FC<RegisterProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [email, setEmail] = useState<string>("");
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [musicVolume, setMusicVolume] = useState(50); // Music volume level
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate(); // Hook for navigation
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);
  const [notifications, setNotifications] = useState<
    { id: string; message: string }[]
  >([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isActivated = searchParams.get("activated") === "false";

  /**
   * Handles email input change.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - Event object.
   */
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  /**
   * Handles login input change.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - Event object.
   */
  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLogin(e.target.value);
  };

  /**
   * Handles password input change.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - Event object.
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
   * - Adds a fade-out effect to the toast notification before removal.
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
   * useEffect hook for handling the automatic removal of error messages after a delay.
   *
   * - Adds a fade-out effect to the toast error before removal.
   * - Removes errors from the state after a timeout.
   *
   * @param {Array<{ id: string; message: string }>} errors - Array of error messages with unique IDs.
   */
  useEffect(() => {
    if (isActivated) {
      setErrors((prevErrors) => {
        const errorExists = prevErrors.some(
          (e) => e.message === t("account-not-activated-error")
        );

        if (!errorExists) {
          return [
            ...prevErrors,
            { id: generateId(), message: t("account-not-activated-error") },
          ];
        }

        return prevErrors;
      });
    }
  }, [isActivated]);

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
   * Handles form submission for user registration.
   *
   * - Validates input fields.
   * - Displays appropriate error messages.
   * - Sends registration request to the server.
   * - Redirects to loading page on success.
   *
   * @param {FormEvent<HTMLFormElement>} e - The form event triggered on submit.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: { id: string; message: string }[] = [];
    const newNotifications: { id: string; message: string }[] = [];

    if (!validateEmail(email))
      newErrors.push({
        id: generateId(),
        message: t("email-error-message"),
      });

    if (!validateUsername(login))
      newErrors.push({
        id: generateId(),
        message: t("username-error-message"),
      });

    if (!validatePassword(password))
      newErrors.push({
        id: generateId(),
        message: t("password-error-message"),
      });

    setErrors(newErrors);
    if (newErrors.length > 0) return;

    const userData = { email, username: login, password, roles: "USER" };
    try {
      const response = await fetch(
        `http://localhost:8080/api/users?language=${
          localStorage.getItem("i18nextLng") || "en"
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
          credentials: "include",
        }
      );

      if (response.ok) {
        newNotifications.push({
          id: generateId(),
          message: t("activation-link-sent"),
        });
        setNotifications([...newNotifications]);
      } else {
        const errorData = await response.json();

        if (errorData.error === "Username already exists.") {
          newErrors.push({
            id: generateId(),
            message: t("username-exists-error"),
          });
        } else if (errorData.error === "E-mail already exists.") {
          newErrors.push({
            id: generateId(),
            message: t("e-mail-exists-error"),
          });
        }
        setErrors([...newErrors]);
      }
    } catch (error) {
      newErrors.push({ id: generateId(), message: t("network-error") });
      setErrors([...newErrors]);
    }
  };

  /**
   * Toggles the settings modal visibility.
   */
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Redirect user to /games if already logged in
  useEffect(() => {
    const loggedIn = Cookies.get("loggedIn"); // Retrieve the cookie value
    const jwtToken = Cookies.get("authToken");

    // Ensure 'loggedIn' is true
    if (loggedIn === "true" && jwtToken) {
      navigate("/games"); // Redirect to /games if logged in
    }
  }, [navigate]);

  return (
    <BackgroundContainer>
      <GameTitleBar />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={toggleSettings}
        musicVolume={musicVolume}
        soundFXVolume={soundFXVolume}
        setMusicVolume={(volume) => {
          setMusicVolume(volume); // Update local music volume
          setVolume(volume / 100); // Update global volume
        }}
        setSoundFXVolume={setSoundFXVolume}
      />
      <Button variant="circle" soundFXVolume={soundFXVolume}>
        <img src={settingsIcon} onClick={toggleSettings} alt="Settings" />
      </Button>
      {document.cookie
        .split("; ")
        .find(
          (cookie) =>
            cookie.startsWith("loggedIn=") && cookie.startsWith("authToken=")
        ) && (
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
          letterSpacing: "3px",
          marginBottom: "-2.2%",
        }}
        shadowStyle={{
          fontSize: "4rem",
          textAlign: "left",
          marginLeft: "35%",
          letterSpacing: "3px",
          marginBottom: "-2.2%",
        }}
      >
        {t("register-button-text")}
      </TitleComponent>
      <LoginRegisterContainer>
        <div className="register-container">
          <form className="register-form" onSubmit={handleSubmit}>
            <FormInput
              type="text"
              placeholder="E-MAIL"
              value={email}
              onChange={handleEmailChange}
            />
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
                  variant="eye2"
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
              text="signup_with"
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

export default RegisterPage;
