import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './views/Home/Home';
import SelectGame from "./views/SelectGame/SelectGame";
import CreateGame from "./views/CreateGame/CreateGame";
import JoinGame from "./views/JoinGame/JoinGame";
import GameLobby from "./views/GameLobby/GameLobby";
import Gameplay from './views/Gameplay/Gameplay';
import ChooseLeader from './views/ChooseLeader/ChooseLeader';

import soundFile from "./assets/sounds/background-music.mp3";

import './styles/App.css';
import React, {useEffect, useState} from "react";
import LoginPage from "./views/LoginPage/LoginPage.tsx";
import RegisterPage from "./views/RegisterPage/RegisterPage.tsx";

const App : React.FC = () => {
    const [audio] = useState(new Audio(soundFile));
    const [isPlaying, setIsPlaying] = useState(false);
    const [, setMusicVolume] = useState(50);
    const [soundFXVolume, setSoundFXVolume] = useState(50);

    const playAudio = () => {
        if (!isPlaying) {
            audio.loop = true;
            audio.play().then();
            setIsPlaying(true);
        }
    };

    const setVolume = (volume: number) => {
        audio.volume = volume;
        setMusicVolume(volume);
    };

        useEffect(() => {
        const handleFirstInteraction = () => {
            playAudio();
            window.removeEventListener('click', handleFirstInteraction);
        };

        window.addEventListener('click', handleFirstInteraction);

        return () => {
            window.removeEventListener('click', handleFirstInteraction);
        };
        // eslint-disable-next-line
    }, [audio]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home setVolume={setVolume}  soundFXVolume={soundFXVolume} setSoundFXVolume={setSoundFXVolume}/>} />
                <Route path="/gameplay" element={<Gameplay setVolume={setVolume}  soundFXVolume={soundFXVolume} setSoundFXVolume={setSoundFXVolume}/>} />
                <Route path="/games" element={<SelectGame setVolume={setVolume}  soundFXVolume={soundFXVolume} setSoundFXVolume={setSoundFXVolume}/>} />
                <Route path="/join-game" element={<JoinGame setVolume={setVolume}  soundFXVolume={soundFXVolume} setSoundFXVolume={setSoundFXVolume}/>} />
                <Route path="/create-game" element={<CreateGame setVolume={setVolume}  soundFXVolume={soundFXVolume} setSoundFXVolume={setSoundFXVolume}/>} />
                <Route path="/game-lobby/:gameId" element={<GameLobby setVolume={setVolume}  soundFXVolume={soundFXVolume} setSoundFXVolume={setSoundFXVolume}/>} />
                <Route path={"/login"} element={<LoginPage setVolume={setVolume}  soundFXVolume={soundFXVolume} setSoundFXVolume={setSoundFXVolume}/>} />
                <Route path={"/register"} element={<RegisterPage setVolume={setVolume}  soundFXVolume={soundFXVolume} setSoundFXVolume={setSoundFXVolume}/>} />
                <Route path="/choose-leader" element={<ChooseLeader setVolume={setVolume}  soundFXVolume={soundFXVolume} setSoundFXVolume={setSoundFXVolume}/>} />
            </Routes>
        </Router>
    );
};

export default App;