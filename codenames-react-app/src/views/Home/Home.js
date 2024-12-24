import React from "react";

import "../../styles/App.css";
import "../../styles/Home.css";

import BackgroundContainer from "../../containers/Background/Background";
import MenuContainer from "../../containers/Menu/Menu";

import TitleComponent from "../../components/Title/Title";
import SubtitleComponent from "../../components/Subtitle/Subtitle";
import CharactersComponent from "../../components/Characters/Characters";
import Button from "../../components/Button/Button";

function Home() {
  return (
    <BackgroundContainer>
      <TitleComponent>Codenames</TitleComponent>
      <CharactersComponent />
      <SubtitleComponent>Your mission begins now</SubtitleComponent>
      <MenuContainer>
        <div className="first-column">
          <div className="row1">
            <Button variant="primary">Login</Button>
          </div>
          <div className="row2">
            <Button variant="danger">Register</Button>
          </div>
        </div>
        <div className="gold-bar"></div>
        <div className="second-column">
          <Button variant="success">Play as Guest</Button>
        </div>
      </MenuContainer>
    </BackgroundContainer>
  );
}

export default Home;
