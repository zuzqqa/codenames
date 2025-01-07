import React, { useState } from "react";

import Button from "../Button/Button";
import TitleModal from "../TitleModal/TitleModal";
import LanguageSlider from "../LanguageSlider/LanguageSlider";
import SettingsFooter from "../SettingsOverlay/SettingsFooter";
import Modal from "../Modal/Modal";
import MessageModal from "../MessageModal/MessageModal";

import closeIcon from "../../assets/icons/close.png";

import "./SettingsModal.css";

// Define the type for the SettingsModal component's props
interface SettingsModalProps {
  isOpen: boolean; // Determines if the modal is visible
  onClose: () => void; // Callback to close the modal
  musicVolume: number; // Current music volume level
  soundFXVolume: number; // Current sound effects volume level
  setMusicVolume: (volume: number) => void; // Function to update music volume
  setSoundFXVolume: (volume: number) => void; // Function to update sound effects volume
}

// Main component definition
const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  musicVolume,
  soundFXVolume,
  setMusicVolume,
  setSoundFXVolume,
}) => {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // State to control MessageModal visibility

  // If the modal is not open, return null to render nothing
  if (!isOpen) return null;

  // Handle changes to the music volume slider
  const handleMusicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setMusicVolume(value);
  };

  // Handle changes to the sound effects volume slider
  const handleSoundFXChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setSoundFXVolume(value);
  };

  // Close the modal when the close button is clicked
  const toggleModal = () => {
    onClose();
    setIsMessageModalOpen(false);
  };

  // Open the Message Modal
  const openMessageModal = () => {
    setIsMessageModalOpen(true);
  };

  // Component rendering logic
  return (
    <Modal isOpen={isOpen} onClose={toggleModal}>
      {/* Modal header with title */}
      <TitleModal>Settings</TitleModal>

      {/* Close button for the modal */}
      <Button variant="circle" soundFXVolume={soundFXVolume}>
        <img src={closeIcon} onClick={toggleModal} alt="Close" />
      </Button>

      {/* Main settings container */}
      <div className="settings-overlay-container">
        <div className="settings-grid">
          {/* Music volume slider */}
          <div className="settings-row-item">
            <div className="settings-row-item-title">
              <p className="settings-modal-p">Music</p>
              <p className="settings-modal-p-shadow">Music</p>
            </div>
            <div className="slider">
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={handleMusicChange}
                className="slider"
              />
            </div>
          </div>

          {/* Sound FX volume slider */}
          <div className="settings-row-item">
            <div className="settings-row-item-title">
              <p className="settings-modal-p">Sound FX</p>
              <p className="settings-modal-p-shadow">Sound FX</p>
            </div>
            <div className="slider">
              <input
                type="range"
                min="0"
                max="100"
                value={soundFXVolume}
                onChange={handleSoundFXChange}
                className="slider"
              />
            </div>
          </div>

          {/* Language selection slider */}
          <div className="settings-row-item">
            <div className="settings-row-item-title">
              <p className="settings-modal-p">Language</p>
              <p className="settings-modal-p-shadow">Language</p>
            </div>
            <LanguageSlider soundFXVolume={soundFXVolume} />
          </div>

          {/* Help button */}
          <div className="settings-row-item">
            <div className="settings-row-item-title">
              <p className="settings-modal-p">Help</p>
              <p className="settings-modal-p-shadow">Help</p>
            </div>
            <div className="settings-row-help-btn">
              <Button variant="help" soundFXVolume={soundFXVolume} onClick={openMessageModal}>
                <span className="button-text">Send Message</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with additional settings */}
      <SettingsFooter />

      {/* Message modal */}
      <MessageModal
          isOpen={isMessageModalOpen}
          onClose={toggleModal}
          soundFXVolume={soundFXVolume}
        />

    </Modal>
  );
};

export default SettingsModal;
