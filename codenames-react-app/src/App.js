import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import React, { useState, useEffect } from 'react';

import Home from './views/Home/Home';
import soundFile from "./assets/sounds/background-music.mp3";
import LoginPage from "./views/LoginPage/LoginPage";
import RegisterPage from "./views/RegisterPage/RegisterPage";

function App() {
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
