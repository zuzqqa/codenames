import React, { useState, ChangeEvent, FormEvent } from "react";
import "../../styles/App.css";
import "./RegisterPage.css";

import BackgroundContainer from "../../containers/Background/Background";
import Button from "../../components/Button/Button";
import FormInput from "../../components/FormInput/FormInput";
import settingsImage from "../../assets/icons/settings.png";
import TitleComponent from "../../components/Title/Title";
import MenuContainer from "../../containers/Menu/Menu";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar.tsx";
import SettingsModal from "../../components/SettingsOverlay/SettingsModal.tsx";
import settingsIcon from "../../assets/icons/settings.png";

interface RegisterProps {
    setVolume: (volume: number) => void;
    soundFXVolume: number;
    setSoundFXVolume: (volume: number) => void;
}

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

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

    const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLogin(e.target.value);
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Add your login logic here
        console.log("Login:", login);
        console.log("Password:", password);
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
            <TitleComponent
                soundFXVolume={soundFXVolume}
                customStyle={{ fontSize: "4rem", textAlign: "left", marginLeft: "34%", marginBottom: "0.01%" }}
                shadowStyle={{fontSize: "4rem", textAlign: "left", marginLeft: "34%", marginBottom: "0.01%"}}
            >REGISTER</TitleComponent>
            <MenuContainer>
                <div className="register-container">
                    <form className="register-form" onSubmit={handleSubmit}>
                        <FormInput
                            type="text"
                            placeholder="EMAIL"
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
                            type="password"
                            placeholder="PASSWORD"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                        <Button type="submit" variant="primary" soundFXVolume={soundFXVolume}>
                            <span className="button-text">SUBMIT</span>
                        </Button>
                    </form>
                </div>
            </MenuContainer>
        </BackgroundContainer>
    );
}

export default RegisterPage;

