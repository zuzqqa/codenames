import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './styles/App.css';
import * as React from 'react';

import Home from './views/Home/Home';
import Gameplay from './views/Gameplay/Gameplay'; // import nowego komponentu


import soundFile from "./assets/sounds/background-music.mp3";
import {useEffect, useState} from "react";
import SelectGame from "./views/SelectGame/SelectGame.tsx";

const App : React.FC = () => {
    const [audio] = useState(new Audio(soundFile));
    const [isPlaying, setIsPlaying] = useState(false);
    const [musicVolume, setMusicVolume] = useState(50);
    const [soundFXVolume, setSoundFXVolume] = useState(50); 
    
    const playAudio = () => {
        if (!isPlaying) {
            audio.loop = true;
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
            <Route path="/gameplay" element={<Gameplay />} /> 
            <Route path="/games" element={<SelectGame />} />
            </Routes>
        </Router>
    );
};

export default App;
