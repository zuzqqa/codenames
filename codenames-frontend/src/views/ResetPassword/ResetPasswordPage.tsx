import React, { useState, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";

import "../../styles/App.css";
import "../LoginPage/LoginPage.css";

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
import {useNavigate, useParams} from "react-router-dom";

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
    const [login, setLogin] = useState<string>("");
    const [musicVolume, setMusicVolume] = useState(50); // Music volume level
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Tracks if the settings modal is open
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const serviceId = params.get('id');


    const handlePasswordRepeatChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPasswordRepeat(e.target.value);
        const inputValue = e.target.value;

        if (inputValue.length > passwordRepeat.length) {
            setPasswordRepeat(passwordRepeat + inputValue[inputValue.length - 1]);
        } else {
            setPasswordRepeat(passwordRepeat.slice(0, -1)); // Handle backspace
        }
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
        try {
            if (password !== passwordRepeat) {
                alert("Passwords do not match!");
                return;
            }
            console.log("Resetting password for service ID: " + serviceId);
            console.log("New password: " + password);
            const response = await fetch("http://localhost:8080/api/users/reset-password/" + serviceId, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(password)
            });

            if (response.ok) {
                navigate("/login");
            } else {
                const error = await response.text();
                alert("Failed to reset password: " + error);
            }
        } catch (error) {
            alert("An error occurred during password reset. Please try again later." + error);
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
            >{ t('new-password') }</TitleComponent>
            <LoginRegisterContainer>
                <div className="login-container">
                    <form className="login-form" onSubmit={handleSubmit}>
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
                        <FormInput
                            type="text"
                            placeholder={ t('REPEAT-PASSWORD') }
                            value={!isPasswordVisible ? '●'.repeat(passwordRepeat.length) : passwordRepeat}
                            onChange={handlePasswordRepeatChange}
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

export default ResetPasswordPage;

