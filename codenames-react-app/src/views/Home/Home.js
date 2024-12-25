import React, { useState } from "react";

import "../../styles/App.css";
import "./Home.css";

import BackgroundContainer from "../../containers/Background/Background";
import MenuContainer from "../../containers/Menu/Menu";

import TitleComponent from "../../components/Title/Title";
import SubtitleComponent from "../../components/Subtitle/Subtitle";
import CharactersComponent from "../../components/Characters/Characters";
import Button from "../../components/Button/Button";

import settingsImage from "../../assets/images/settings.png";

function Home() {
  const [isGameStarted, setIsGameStarted] = useState(false);

  const startGame = () => {
    setIsGameStarted(true);
  };

  return (
    <BackgroundContainer>
      <Button variant="circle">
        <img src={settingsImage} alt="Settings" />
      </Button>
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
