import Button from "../../components/Button/Button";
import BackgroundContainer from "../../containers/Background/Background";
import settingsIcon from "../../assets/icons/settings.png";
import Modal from "../../components/Modal/Modal";
import TitleModal from "../../components/TitleModal/TitleModal";
import closeIcon from "../../assets/icons/close.png";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import RoomLobby from "../../components/RoomLobby/RoomLobby";
import {useState} from "react";

const GameLobby = () => {

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
                    <RoomLobby />
                </>
            </BackgroundContainer>
        </>
    );
}

export default GameLobby;