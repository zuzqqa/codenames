import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // Hook for programmatic navigation

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
import {logout} from "../../shared/utils.tsx";
import Cookies from 'js-cookie';

interface LoginProps {
    setVolume: (volume: number) => void;
    soundFXVolume: number;
    setSoundFXVolume: (volume: number) => void;
}

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
    const navigate = useNavigate(); // Hook for navigation

    const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLogin(e.target.value);
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        const inputValue = e.target.value;

        if (inputValue.length > password.length) {
            setPassword(password + inputValue[inputValue.length - 1]);
        } else {
            setPassword(password.slice(0, -1)); // Handle backspace
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userData = { username: login, password };

        try {
            const response = await fetch("http://localhost:8080/api/users/authenticate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
                credentials: "include", // Include cookies in the request
            });

            if (response.ok) {
                document.cookie = "loggedIn=true";
                window.location.href = "/loading";
            } else {
                const error = await response.text();
                alert("Failed to log in: " + error);
            }
        } catch (error) {
            alert("An error occurred during login. Please try again later." + error);
        }
    };

    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

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
                customStyle={{ fontSize: "4rem", textAlign: "left", marginLeft: "35%", marginBottom: "-1.2%"}}
                shadowStyle={{ fontSize: "4rem", textAlign: "left", marginLeft: "35%", marginBottom: "-1.2%"}}
            >{ t('login-button-text') }</TitleComponent>
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
                            placeholder={ t('PASSWORD') }
                            value={!isPasswordVisible ? '●'.repeat(password.length) : password}
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
                        <Button type="submit" variant="primary" soundFXVolume={soundFXVolume}>
                            <span className="button-text">{ t('submit-button') }</span>
                        </Button>
                    </form>
                </div>
            </LoginRegisterContainer>
        </BackgroundContainer>
    );
}

export default LoginPage;

