import React, { useState } from "react";

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
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";

import settingsIcon from "../../assets/icons/settings.png";
import closeIcon from "../../assets/icons/close.png";

function Home() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startGame = () => {
    setIsGameStarted(true);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <BackgroundContainer>
      <Button variant="circle">
        <img src={settingsIcon} onClick={toggleModal} alt="Settings" />
      </Button>
      <Modal isOpen={isModalOpen} onClose={toggleModal}>
        <div className="modal-header">
          <TitleModal>Settings</TitleModal>
          <Button variant="primary" onClick={toggleModal} alt="Close">
            <img src={closeIcon} alt="Close" />
          </Button>
        </div>
        <div className="modal-body">
          <div className="settings-grid">
            <div className="settings-item">
              <label>Music</label>
              <input type="range" min="0" max="100" />
            </div>
            <div className="settings-item">
              <label>Sound FX</label>
              <input type="range" min="0" max="100" />
            </div>
            <div className="settings-item">
              <label>Language</label>
              <select>
                <option>English</option>
                <option>Polish</option>
                <option>Spanish</option>
              </select>
            </div>
            <div className="settings-item">
              <label>Help</label>
              <button>Open</button>
            </div>
          </div>
        </div>
        <GameTitleBar></GameTitleBar>
      </Modal>
      {isGameStarted ? (
        <>
          <TitleComponent>Codenames</TitleComponent>
          <CharactersComponent />
          <SubtitleComponent>Your mission begins now</SubtitleComponent>
          <MenuContainer>
            <div className="first-column">
              <div className="row1">
                <Button variant="primary">
                  <span className="button-text">Login</span>
                </Button>
              </div>
              <div className="row2">
                <Button variant="primary">
                  <span className="button-text">Register</span>
                </Button>
              </div>
            </div>
            <div className="gold-bar"></div>
            <div className="second-column">
              <Button variant="primary">
                <span className="button-text">Play as Guest</span>
              </Button>
            </div>
          </MenuContainer>
        </>
      ) : (
        <>
          <Button variant="primary" onClick={startGame}>
            Play
          </Button>
        </>
      )}
    </BackgroundContainer>
  );
}

export default Home;
