import "../../styles/App.css";
import "./SelectGame.css";

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
import {useNavigate} from "react-router-dom";
import {useState} from "react";

function SelectGame() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

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
                        <TitleComponent>Codenames</TitleComponent>
                        <CharactersComponent />
                        <SubtitleComponent>Your mission begins now</SubtitleComponent>
                        <MenuContainer>
                            <div className="first-column">
                                <Button variant="room">
                                    <span className="button-text">Create room</span>
                                </Button>
                            </div>
                            <div className="gold-bar"></div>
                            <div className="second-column">
                                <Button variant="room" onClick={() => navigate('/games')}>
                                    <span className="button-text">Join room</span>
                                </Button>
                            </div>
                        </MenuContainer>
                    </>
            </BackgroundContainer>
        </>
    );
}

export default SelectGame;