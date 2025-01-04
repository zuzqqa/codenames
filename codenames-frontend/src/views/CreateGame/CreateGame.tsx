import "../../styles/App.css";
import "../SelectGame/SelectGame.css";
import "./CreateGame.css";

import BackgroundContainer from "../../containers/Background/Background";
import Button from "../../components/Button/Button";
import Modal from "../../components/Modal/Modal";
import TitleModal from "../../components/TitleModal/TitleModal";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import settingsIcon from "../../assets/icons/settings.png";
import closeIcon from "../../assets/icons/close.png";
import {useState} from "react";
import CreateGameForm from "../../components/CreateGameForm/CreateGameForm.tsx";

function CreateGame() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <>
            <BackgroundContainer>
                <Button variant="circle">
                    <img src={settingsIcon} onClick={toggleModal} alt="Settings" />
                </Button>
                <Modal isOpen={isModalOpen} onClose={toggleModal}>
                    <TitleModal>Settings</TitleModal>
                    <Button variant="primary" onClick={toggleModal}>
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
                    <CreateGameForm />
                </>
            </BackgroundContainer>
        </>
    );
}

export default CreateGame;