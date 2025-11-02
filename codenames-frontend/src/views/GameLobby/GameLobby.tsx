import React, {useEffect, useState} from "react";
import Button from "../../components/Button/Button";
import BackgroundContainer from "../../containers/Background/Background";
import settingsIcon from "../../assets/icons/settings.png";
import profileIcon from "../../assets/icons/profile.png";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import RoomLobby from "../../components/RoomLobby/RoomLobby";

import UsernameContainer from "../../containers/UsernameContainer/UsernameContainer.tsx";
import {useModal} from "../../providers/ModalProvider";

/**
 * Props interface for GameLobby component.
 * @typedef {Object} GameLobbyProps
 * @property {function(number): void} setVolume - Function to set global volume
 * @property {number} soundFXVolume - Current sound effects volume level
 * @property {function(number): void} setSoundFXVolume - Function to set sound effects volume
 */
interface GameLobbyProps {
    soundFXVolume: number;
}

/**
 * GameLobby component serves as the waiting area before a game starts.
 * It includes settings management and volume adjustments.
 *
 * @component
 * @param {GameLobbyProps} props - Component properties
 * @returns {JSX.Element} The rendered GameLobby component
 */
const GameLobby: React.FC<GameLobbyProps> = ({soundFXVolume}) => {
    const [musicVolume, setMusicVolume] = useState(() => {
        const savedVolume = localStorage.getItem("musicVolume");
        return savedVolume ? parseFloat(savedVolume) : 50;
    });
    const {openSettings, openProfile, canOpenProfile} = useModal();

    const toggleSettings = () => openSettings();
    const toggleProfile = () => openProfile();

    useEffect(() => {
        localStorage.setItem("musicVolume", musicVolume.toString());
    }, [musicVolume]);

    return (
        <>
            <BackgroundContainer>
                <Button variant="circle" soundFXVolume={soundFXVolume} onClick={toggleSettings}>
                    <img src={settingsIcon} alt="Settings"/>
                </Button>

                {/* Settings/Profile modals are rendered by ModalProvider */}
                {canOpenProfile && (
                    <Button variant="circle-profile" soundFXVolume={soundFXVolume} onClick={toggleProfile}>
                        <img src={profileIcon} alt="Profile"/>
                    </Button>
                )}
                <>
                    <GameTitleBar></GameTitleBar>
                    <RoomLobby soundFXVolume={soundFXVolume}/>
                    <UsernameContainer/>
                </>
            </BackgroundContainer>
        </>
    );
};

export default GameLobby;
