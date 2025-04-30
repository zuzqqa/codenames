import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import './LanguageSlider.css';

import arrow from '../../assets/icons/arrow.svg';

import clickSoundFile from '../../assets/sounds/ui-click-43196.mp3'; 

const languages = ["English", "Polski"];
const language_code = ["en", "pl"];

/**
 * Props for the LanguageSlider component.
 * @typedef {Object} LanguageSliderProps
 * @property {number} soundFXVolume - Volume level for sound effects.
 */
interface LanguageSliderProps {
    soundFXVolume: number; 
}

/**
 * Language slider component allowing users to switch between languages.
 *
 * @param {Object} props - Component props
 * @param {number} props.soundFXVolume - Volume level for sound effects
 * @returns {JSX.Element} The rendered LanguageSlider component
 */
const LanguageSlider: React.FC<LanguageSliderProps> = ({ soundFXVolume }) => {
  const [currentLanguageId, setCurrentLanguageId] = useState(localStorage.getItem("i18nextLng") === "pl" ? 1 : 0);
  const { t, i18n } = useTranslation();

  /**
   * Plays a click sound effect when changing language.
   */
  const playClickSound = () => {
    const audio = new Audio(clickSoundFile);
    audio.volume = soundFXVolume / 100; 
    audio.play(); 
  };

  /**
   * Switches to the previous language in the list.
   */
  const handlePreviousLanguage = () => {
    playClickSound();
    setCurrentLanguageId((prevIndex) => {
      const newIndex = prevIndex === 0 ? languages.length - 1 : prevIndex - 1;
      i18n.changeLanguage(language_code[newIndex]); 
      localStorage.setItem("i18nextLng", language_code[newIndex]);
      return newIndex;
    });
  };

  /**
   * Switches to the next language in the list.
   */
  const handleNextLanguage = () => {
    playClickSound(); 
    setCurrentLanguageId((prevIndex) => {
      const newIndex = prevIndex === 0 ? languages.length - 1 : prevIndex - 1;
      i18n.changeLanguage(language_code[newIndex]); 
      localStorage.setItem("i18nextLng", language_code[newIndex]);
      return newIndex;
    });  
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

