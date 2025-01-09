import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './styles/App.css';
import * as React from 'react';

import Home from './views/Home/Home';
import SelectGame from "./views/SelectGame/SelectGame";
import CreateGame from "./views/CreateGame/CreateGame";
import JoinGame from "./views/JoinGame/JoinGame";
import Gameplay from './views/Gameplay/Gameplay';

import soundFile from "./assets/sounds/background-music.mp3";
import {useEffect, useState} from "react";
import RegisterPage from "./views/RegisterPage/RegisterPage.tsx";
import LoginPage from "./views/LoginPage/LoginPage.tsx";

const App : React.FC = () => {
    const [audio] = useState(new Audio(soundFile));
    const [isPlaying, setIsPlaying] = useState(false);
    const [musicVolume, setMusicVolume] = useState(50);
    const [soundFXVolume, setSoundFXVolume] = useState(50);

    const playAudio = () => {
        if (!isPlaying) {
            audio.loop = true;
            audio.volume = 0.2;
            audio.play();
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
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </Router>
    );
};

export default App;
