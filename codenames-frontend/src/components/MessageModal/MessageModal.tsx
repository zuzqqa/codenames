import Button from "../Button/Button";
import Modal from "../Modal/Modal";
import TitleModal from "../TitleModal/TitleModal";
import closeIcon from "../../assets/icons/close.png";

import "./MessageModal.css";
import React from "react";

// Define the type for the SettingsModal component's props
interface MessageModalProps {
  isOpen: boolean; // Determines if the modal is visible
  onClose: () => void; // Callback to close the modal
  soundFXVolume: number; // Current sound effects volume level
}

const MessageModal: React.FC<MessageModalProps> = ({
    isOpen,
    onClose,
    soundFXVolume,
    }) => {
    // If the modal is not open, return null to render nothing
    if (!isOpen) return null;
    
    // Close the modal when the close button is clicked
    const toggleModal = () => {
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={toggleModal}>
            {/* Modal header with title */}
            <TitleModal>Message us</TitleModal>
            <Button variant="circle" soundFXVolume={soundFXVolume}>
                <img src={closeIcon} onClick={toggleModal} alt="Close" />
            </Button>
            <div className="message-overlay-container">
                <div className="message-grid">
                    <div className="message-row-item">
                        <p className="message-row-item-message">Need help or have feedback about the game? We're here to assist you! Fill out the form below and let us know how we can help.</p>
                    </div>
                    <div className="message-row-item">
                        <input type="email" placeholder="Email" />
                    </div>
                    <div className="message-row-item">
                        <textarea placeholder="Message" />
                    </div>
                    <div className="message-row-item">
                        <p className="message-row-item-message">We’ll do our best to respond as quickly as possible!</p>
                        <Button variant="primary" soundFXVolume={soundFXVolume}>Submit</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default MessageModal;