import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './styles/App.css';
import * as React from 'react';

import Home from './views/Home/Home';
import SelectGame from "./views/SelectGame/SelectGame";
import CreateGame from "./views/CreateGame/CreateGame";

import soundFile from "./assets/sounds/background-music.mp3";
import {useEffect, useState} from "react";

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
                <Route path="/games" element={<SelectGame />} />
                {/*<Route path="/joinGame" element={<JoinGame />} />*/}
                <Route path="/create-game" element={<CreateGame />} />
            </Routes>
        </Router>
    );
};

export default App;
