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
import {useNavigate} from "react-router-dom";
import {useState} from "react";

function Home() {
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

    const startGame = () => {
        setIsGameStarted(true);
    };

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
                                <Button variant="primary" onClick={() => navigate('/games')}>
                                    <span className="button-text">Play as Guest</span>
                                </Button>
                            </div>
                        </MenuContainer>
                    </>
                ) : (
                    <>
                        <Button variant="primary" onClick={startGame}>
                          <span className="button-text">Play</span>
                        </Button>
                    </>
                )}
            </BackgroundContainer>
        </>
    );
}

export default Home;