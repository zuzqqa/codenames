import React from 'react';
import {useState} from "react";

import "./Gameplay.css";

import shelfImg from "../../assets/images/shelf.png";
import cardsStackImg from "../../assets/images/cards-stack.png";
import cardWhiteImg from "../../assets/images/card-white.png";
import BackgroundContainer from "../../containers/Background/Background";
import Button from "../../components/Button/Button";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar";
import settingsIcon from "../../assets/icons/settings.png";



const Gameplay: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const toggleModal = () => {
      setIsModalOpen(!isModalOpen);
    };

    return (
        
        <>
        <BackgroundContainer>
            <GameTitleBar></GameTitleBar>
            <Button variant="circle">
            <img src={settingsIcon} onClick={toggleModal} alt="Settings" />
            </Button>

            <div className='content-container'>
            <div>
                <span className='timer'>00:00</span>
            </div>
            <div className='cards-section'>
                <div>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                </div>
                <div>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                </div>
                <div>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                </div>
                <div>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                </div>
                <div>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                    <img className="card" src={cardWhiteImg}/>
                </div>
            </div>
            <div className="bottom-section">
                <div className='item'>
                    <img src={shelfImg}/>
                </div>
                <div className='item'>
                    <Button variant="secondary">
                        <span className="button-text">End Round</span>
                    </Button>
                </div>
                <div className='item'>
                    <img src={cardsStackImg}/>
                </div>   
            </div>
        </div>
        </BackgroundContainer>
      </>
    );
};

export default Gameplay;
