import "../../styles/App.css";
import "./Home.css";

import BackgroundContainer from "../../containers/Background/Background";
import MenuContainer from "../../containers/Menu/Menu";

import TitleComponent from "../../components/Title/Title";
import SubtitleComponent from "../../components/Subtitle/Subtitle";
import CharactersComponent from "../../components/Characters/Characters";
import Button from "../../components/Button/Button";
import Modal from "../../components/Modal/Modal";
import TitleModal from "../../components/TitleModal/TitleModal";
import SettingsFooter from "../../components/SettingsOverlay/SettingsFooter";
import LanguageSlider from "../../components/LanguageSlider/LanguageSlider";

import settingsIcon from "../../assets/icons/settings.png";
import closeIcon from "../../assets/icons/close.png";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface HomeProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
}

const Home: React.FC<HomeProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [musicVolume, setMusicVolume] = useState(50);

  const navigate = useNavigate();

  const startGame = () => {
    setIsGameStarted(true);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleMusicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setMusicVolume(value);
    setVolume(value / 100);
  };

  const handleSoundFXVolumeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value);
    setSoundFXVolume(value);
  };

  return (
    <>
      <BackgroundContainer>
        <Button variant="circle" soundFXVolume={soundFXVolume}>
          <img src={settingsIcon} onClick={toggleModal} alt="Settings" />
        </Button>
        <Modal isOpen={isModalOpen} onClose={toggleModal}>
          <TitleModal>Settings</TitleModal>
          <Button variant="circle" soundFXVolume={soundFXVolume}>
            <img src={closeIcon} onClick={toggleModal} alt="Close" />
          </Button>
          <div className="settings-overlay-container">
            <div className="settings-grid">
              <div className="settings-row-item">
                <div className="settings-row-item-title">
                  <p className="settings-modal-p">Music</p>
                  <p className="settings-modal-p-shadow">Music</p>
                </div>
                <div className="slider">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={handleMusicChange}
                    className="slider"
                  />
                </div>
              </div>
              <div className="settings-row-item">
                <div className="settings-row-item-title">
                  <p className="settings-modal-p">Sound FX</p>
                  <p className="settings-modal-p-shadow">Sound FX</p>
                </div>
                <div className="slider">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundFXVolume}
                    onChange={handleSoundFXVolumeChange}
                    className="slider"
                  />
                </div>
              </div>
              <div className="settings-row-item">
                <div className="settings-row-item-title">
                  <p className="settings-modal-p">Language</p>
                  <p className="settings-modal-p-shadow">Language</p>
                </div>
                <LanguageSlider soundFXVolume={soundFXVolume} />
              </div>
              <div className="settings-row-item">
                <div className="settings-row-item-title">
                  <p className="settings-modal-p">Help</p>
                  <p className="settings-modal-p-shadow">Help</p>
                </div>
                <div className="settings-row-help-btn">
                  <Button variant="help" soundFXVolume={soundFXVolume}>
                    <span className="button-text">Send Message</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <SettingsFooter />
        </Modal>
        {isGameStarted ? (
          <>
            <TitleComponent soundFXVolume={soundFXVolume}>
              Codenames
            </TitleComponent>
            <CharactersComponent />
            <SubtitleComponent>Your mission begins now</SubtitleComponent>
            <MenuContainer>
              <div className="first-column">
                <div className="row1">
                  <Button variant="primary" soundFXVolume={soundFXVolume}>
                    <span className="button-text">Login</span>
                  </Button>
                </div>
                <div className="row2">
                  <Button variant="primary" soundFXVolume={soundFXVolume}>
                    <span className="button-text">Register</span>
                  </Button>
                </div>
              </div>
              <div className="gold-bar"></div>
              <div className="second-column">
                <Button
                  variant="primary"
                  onClick={() => navigate("/games")}
                  soundFXVolume={soundFXVolume}
                >
                  <span className="button-text">Play as Guest</span>
                </Button>
              </div>
            </MenuContainer>
          </>
        ) : (
          <>
            <Button
              variant="primary"
              onClick={startGame}
              soundFXVolume={soundFXVolume}
            >
              <span className="button-text">Play</span>
            </Button>
          </>
        )}
      </BackgroundContainer>
    </>
  );
};

export default Home;
