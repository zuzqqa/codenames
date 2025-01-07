import React, { useState } from 'react';

import './LanguageSlider.css';

import arrow from '../../assets/icons/arrow.svg';

import clickSoundFile from '../../assets/sounds/ui-click-43196.mp3'; 

const languages = ["English", "Polish"];

interface LanguageSliderProps {
    soundFXVolume: number; 
}

const LanguageSlider: React.FC<LanguageSliderProps> = ({ soundFXVolume }) => {
  const [currentLanguageId, setCurrentLanguageId] = useState(0);

  const playClickSound = () => {
    const audio = new Audio(clickSoundFile);
    audio.volume = soundFXVolume / 100; 
    audio.play(); 
  };

  const handlePreviousLanguage = () => {
    playClickSound();
    setCurrentLanguageId((prevIndex) => (prevIndex === 0 ? languages.length - 1 : prevIndex - 1));
  };

  const handleNextLanguage = () => {
    playClickSound(); 
    setCurrentLanguageId((prevIndex) => (prevIndex === languages.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="language-slider-container">
      <button onClick={handlePreviousLanguage} className="arrow-button">
        <img src={arrow} alt="Previous Language" className="reverse-image" />
      </button>
      <div className="language-display">
        <p>{languages[currentLanguageId]}</p>
      </div>
      <button onClick={handleNextLanguage} className="arrow-button">
        <img src={arrow} alt="Next Language" />
      </button>
    </div>
  );
};

export default LanguageSlider;

