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
import backButtonIcon from "../../assets/icons/arrow-back.png";

import LoginRegisterContainer from "../../containers/LoginRegister/LoginRegister.tsx";
import { logout } from "../../shared/utils.tsx";
import { useNavigate, useLocation, createCookie } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { apiUrl } from "../../config/api.tsx";
import {useToast} from "../../components/Toast/ToastContext.tsx";

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
  const { addToast } = useToast();
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
   * useEffect hook for handling the automatic removal of notification messages after a delay.
   *
   * - Adds a fade-out effect to the toast notification before removal.
   * - Removes notifications from the state after a timeout.
   *
   * @param {Array<{ id: string; message: string }>} errors - Array of notification messages with unique IDs.
   */
  useEffect(() => {
    if (isActivated) {
      addToast(t("account-activated-notification"), "notification");
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
   * Handles form submission and sends login credentials to the server.
   *
   * @param {FormEvent<HTMLFormElement>} e - Form submission event.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData = { username: login, password };

      const response = await fetch(
        `${apiUrl}/api/users/authenticate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
          credentials: "include",
        }
      );

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        throw new Error("Failed to parse JSON response");
      }

      if (response.ok) {
        document.cookie = `authToken=${data.token}; max-age=36000; path=/; secure; samesite=none`;
        document.cookie = `loggedIn=true; max-age=36000; path=/; secure; samesite=none`;
        window.location.href = "/loading";
      } else if (response.status === 401) {
        addToast(t("account-not-activated"), "error");
      } else {
        const error = await response.text();
        addToast("Failed to log in: " + error, "error");
      }
    } catch (error) {
      addToast(t("invalid-login-or-password"), "error");
    }
  };

  /**
   * Toggles the visibility of the settings modal.
   */
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
      <Button variant="circle" soundFXVolume={soundFXVolume} onClick={toggleSettings}>
        <img src={settingsIcon} alt="Settings" />
      </Button>
      {document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("loggedIn=")) && (
        <Button variant="logout" soundFXVolume={soundFXVolume}>
          <img src={logoutButton} onClick={logout} alt="Logout" />
        </Button>
      )}
      <LoginRegisterContainer variant="login">
      <TitleComponent
        soundFXVolume={soundFXVolume}
        customStyle={{
          fontSize: "calc(3.6rem + 0.2vw)",
          textAlign: "left",
          position: "absolute",
          top: "calc(-27rem - 1vh)",
          left: "1.2rem"
        }}
        shadowStyle={{
          fontSize: "calc(3.6rem + 0.2vw)",
          textAlign: "left",
          position: "absolute",
          top: "calc(-27rem - 1vh)",
          left: "1.2rem"
        }}
      >
        {t("login-button-text")}
      </TitleComponent>
        <div className="login-form-container">
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
            <div className="google-container">
            <GoogleLogin
              locale="en"
              onSuccess={() => {
                window.location.href =
                  `${apiUrl}/oauth2/authorization/google`;
              }}
              onError={() => {
                console.log("Google login failed");
                addToast("Google login failed", "error");
              }}
            />
            </div>
          </GoogleOAuthProvider>
          <a
          className="login-register-link"
          onClick={() => navigate("/register")}
          >
          {t("dont-have-an-account")}
          </a>
          <a 
          className="login-register-link guest-link"
          onClick={async () => {
            try {
              const response = await fetch(
                `${apiUrl}/api/users/createGuest`,
                {
                  method: "POST",
                  credentials: "include",
                }
              );

              if (response.ok) {
                window.location.href = "/loading";
              } else {
                console.error("Failed to create guest account");
              }
            } catch (error) {
              console.error("Error creating guest account:", error);
            }
          }}          >
          {t("or-continue-as-guset")}
          </a>
        </div>
      </LoginRegisterContainer>
    </BackgroundContainer>
  );
};

export default LoginPage;
