import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './styles/App.css';
import * as React from 'react';

import Home from './views/Home/Home';
import Gameplay from './views/Gameplay/Gameplay'; // import nowego komponentu


import soundFile from "./assets/sounds/background-music.mp3";
import {useEffect, useState} from "react";
import SelectGame from "./views/SelectGame/SelectGame.tsx";
import RegisterPage from "./views/RegisterPage/RegisterPage.tsx";
import LoginPage from "./views/LoginPage/LoginPage.tsx";

const App : React.FC = () => {
    const [audio] = useState(new Audio(soundFile));
    const [isPlaying, setIsPlaying] = useState(false);

    const playAudio = () => {
        if (!isPlaying) {
            audio.loop = true;
            audio.volume = 0.2;
            audio.play();
            setIsPlaying(true);
        }
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
            <Route path="/" element={<Home />} />
            <Route path="/gameplay" element={<Gameplay />} /> 
            <Route path="/games" element={<SelectGame />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </Router>
    );
};

export default App;
