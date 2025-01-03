import React, { useState, useEffect  } from "react";
import "./Gameplay.css";

import shelfImg from "../../assets/images/shelf.png";
import cardsStackImg from "../../assets/images/cards-stack.png";
import cardWhiteImg from "../../assets/images/card-white.png";
import cardBlackImg from "../../assets/images/card-black.png";
import cardRedImg from "../../assets/images/card-red.jpg";
import polygon1Img from "../../assets/images/polygon1.png";
import polygon2Img from "../../assets/images/polygon2.png";
import BackgroundContainer from "../../containers/Background/Background";
import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import settingsIcon from "../../assets/icons/settings.png";

const Gameplay: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    // Tablica przechowująca stany obrazków dla kart
    const [cards, setCards] = useState<string[]>(new Array(25).fill(cardWhiteImg));

    // Tablica przechowująca stany obrotu kart
    const [flipStates, setFlipStates] = useState<boolean[]>(new Array(25).fill(false));

    // Funkcja do obsługi kliknięcia w kartę z opóźnieniem
    const toggleCardImage = (index: number) => {
        // Ustawienie animacji obrotu
        setFlipStates(prevFlipStates => {
            const newFlipStates = [...prevFlipStates];
            newFlipStates[index] = !newFlipStates[index];
            return newFlipStates;
        });

        // Użycie setTimeout do opóźnienia zmiany obrazka o 0.5s
        setTimeout(() => {
            setCards(prevCards => {
                const newCards = [...prevCards];
                newCards[index] = newCards[index] === cardWhiteImg ? cardRedImg : cardWhiteImg;
                return newCards;
            });
        }, 170);  // 0.17s
    };

  // Stan, który określa, która karta jest kliknięta i powiększona
    const [isCardVisible, setIsCardVisible] = useState(false); // New state for showing black card
    const [cardText, setCardText] = useState(""); // State for the input text
    const [cardDisplayText, setCardDisplayText] = useState(""); // Text displayed on the card
    // Funkcja do obsługi kliknięcia w codename-card-container


     // Funkcja do obsługi kliknięcia w codename-card-container
     const toggleBlackCardVisibility = () => {
        setIsCardVisible(true); // Show overlay
    };

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" && cardText.trim()) {
            setCardDisplayText(cardText);
            setIsCardVisible(false);
            setCardText("");
        }
        if (event.key === "Escape") {
            setIsCardVisible(false);
            setCardText("");
        }
    };
    useEffect(() => {
        document.addEventListener("keydown", handleGlobalKeyDown);
        return () => {
            document.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, [cardText]);

    return (
        <>
            <BackgroundContainer>
                <GameTitleBar />
                <Button variant="circle">
                    <img src={settingsIcon} onClick={toggleModal} alt="Settings" />
                </Button>
                <img className="polygon1" src={polygon1Img} />
                <img className="polygon2" src={polygon2Img} />
                <div className="timer points-red">100</div>
                <div className="timer points-blue">200</div>
                <div className="chat-conatiner">
                    <input type="text" placeholder="type in a message" className="message-input" />
                </div>
                <div className="content-container">
                    <div className="timer-container">
                        <div className="horizontal-gold-bar"></div>
                        <span className='timer'>00:00</span>
                    </div>
                    <div className="cards-section">
                        {/* Renderowanie 25 kart */}
                        {cards.map((cardImage, index) => (
                            <div
                                key={index}
                                className="card-container"
                                onClick={() => toggleCardImage(index)}
                            >
                                <img
                                    className={`card ${flipStates[index] ? 'flip' : ''}`}
                                    src={cardImage}
                                    alt={`card-${index}`}
                                />
                                <span className={`card-text ${cardImage === cardRedImg ? 'gold-text' : ''}`}>word</span>
                            </div>
                        ))}
                    </div>
                    <div className="bottom-section">
                        <div className="item">
                            <img className="shelf" src={shelfImg} />
                        </div>
                        <div className="item">
                            <Button variant="room">
                                <span className="button-text">End Round</span>
                            </Button>
                            <div className="horizontal-gold-bar" />
                        </div>
                        <div className="item">
                        <img className="card-stack" src={cardsStackImg} />
                            <div
                                className="codename-card-container"
                                onClick={toggleBlackCardVisibility} // Handle the toggle
                            >
                                <span className="codename-card-text">{cardDisplayText || ""}</span>
                                <img className="codename-card" src={cardBlackImg} />
                            </div>
                        </div>
                    </div>
                </div>
                {isCardVisible && (
                    <div className="card-black-overlay">
                        <img className="card-black-img" src={cardBlackImg} alt="Black Card" />
                        <input
                            type="text"
                            placeholder="Enter the codename"
                            className="codename-input"
                            value={cardText}
                            onChange={(e) => setCardText(e.target.value)}
                        />
                    </div>
                )}
            </BackgroundContainer>
        </>
    );
};

export default Gameplay;
