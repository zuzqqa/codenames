import React, {useState, ChangeEvent, FormEvent, useEffect} from "react";
import { useTranslation } from "react-i18next";

import "../../styles/App.css";
import "./RegisterPage.css";

import BackgroundContainer from "../../containers/Background/Background";
import Button from "../../components/Button/Button";
import FormInput from "../../components/FormInput/FormInput";
import TitleComponent from "../../components/Title/Title";
import LoginRegisterContainer from "../../containers/LoginRegister/LoginRegister.tsx";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar.tsx";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal.tsx";
import settingsIcon from "../../assets/icons/settings.png";
import eyeIcon from "../../assets/icons/eye.svg";
import eyeSlashIcon from "../../assets/icons/eye-slash.svg";
import logoutButton from "../../assets/icons/logout.svg";
import {logout} from "../../shared/utils.tsx";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";

/**
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
    const [emailError, setEmailError] = useState<string | null>(null);

    /**
     * Handles email input change.
     *
     * @param {ChangeEvent<HTMLInputElement>} e - Event object.
     */
    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

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
     * Validates email format.
     *
     * @param {string} email - The email to validate.
     * @returns {boolean} True if the email is valid, false otherwise.
     */
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    /**
     * Handles form submission and sends registration request.
     *
     * @param {FormEvent<HTMLFormElement>} e - Event object.
     */
    const handleSubmit  = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setEmailError("Invalid email format.");
            return;
        }
        setEmailError(null);

        const userData = { email, username: login, password, roles: "USER" };

        try {
            const response = await fetch("http://localhost:8080/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
                credentials: "include", // Include cookies in the request
            });

            if (response.ok) {
                const result = await response.text();
                window.location.href = "/loading";
                document.cookie = "loggedIn=true";
            } else {
                const error = await response.text();
                console.error("Registration failed:", error);
                alert("Failed to register: " + error);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred during registration. Please try again later.");
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
        const loggedIn = Cookies.get('loggedIn'); // Retrieve the cookie value

        // Ensure 'loggedIn' is true
        if (loggedIn === 'true') {
            navigate('/games'); // Redirect to /games if logged in
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
            {document.cookie.split('; ').find(cookie => cookie.startsWith('loggedIn=')) && (
                <Button variant="logout" soundFXVolume={soundFXVolume}>
                    <img
                        src={logoutButton}
                        onClick={logout}
                        alt="Logout"
                    />
                </Button>
            )}
            <TitleComponent
                soundFXVolume={soundFXVolume}
                customStyle={{ fontSize: "4rem", textAlign: "left", marginLeft: "35%", letterSpacing: "3px", marginBottom: "-1.2%" }}
                shadowStyle={{fontSize: "4rem", textAlign: "left", marginLeft: "35%",  letterSpacing: "3px", marginBottom: "-1.2%"}}
            >{ t('register-button-text') }</TitleComponent>
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
                            placeholder={ t('PASSWORD') }
                            value={!isPasswordVisible ? '●'.repeat(password.length) : password}
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
                        <Button type="submit" variant="primary" soundFXVolume={soundFXVolume}>
                            <span className="button-text">{ t('submit-button') }</span>
                        </Button>
                    </form>
                </div>
            </LoginRegisterContainer>
        </BackgroundContainer>
    );
}

export default RegisterPage;

