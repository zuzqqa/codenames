import React from "react";

import BackgroundContainer from "../../containers/Background/Background";

import "../../styles/App.css";
import MenuContainer from "../../containers/Menu/Menu";
import TitleComponent from "../../components/Title/Title";
import SubtitleComponent from "../../components/Subtitle/Subtitle";
import CharactersComponent from "../../components/Characters/Characters";

function Home() {
  return (
    <BackgroundContainer>
      <TitleComponent>Codenames</TitleComponent>
      <CharactersComponent />
      <SubtitleComponent>Your mission begins now</SubtitleComponent>
      <MenuContainer></MenuContainer>
    </BackgroundContainer>
  );
}

export default Home;
