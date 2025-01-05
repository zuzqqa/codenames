import { useState } from "react";
import BackgroundContainer from "../../containers/Background/Background.tsx";
import Button from "../../components/Button/Button.tsx";
import settingsIcon from "../../assets/icons/settings.png";
import Modal from "../../components/Modal/Modal.tsx";
import TitleModal from "../../components/TitleModal/TitleModal.tsx";
import closeIcon from "../../assets/icons/close.png";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar.tsx";
import GameList from "../../components/GameList/GameList.tsx";

interface JoinGameProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
}

const JoinGame: React.FC<JoinGameProps> = ({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <BackgroundContainer>
        <Button variant="circle" soundFXVolume={soundFXVolume}>
          <img src={settingsIcon} onClick={toggleModal} alt="Settings" />
        </Button>
        <Modal isOpen={isModalOpen} onClose={toggleModal}>
          <TitleModal>Settings</TitleModal>
          <Button
            variant="primary"
            onClick={toggleModal}
            soundFXVolume={soundFXVolume}
          >
            <img src={closeIcon} alt="Close" />
          </Button>
          <p>Music</p>
          <p>Sound FX</p>
          <p>Language</p>
          <p>Help</p>
          <GameTitleBar></GameTitleBar>
        </Modal>
        <>
          <GameTitleBar></GameTitleBar>
          <GameList />
        </>
      </BackgroundContainer>
    </>
  );
};

export default JoinGame;
