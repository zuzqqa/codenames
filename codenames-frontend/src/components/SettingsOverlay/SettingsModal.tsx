import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button";
import TitleModal from "../TitleModal/TitleModal";
import LanguageSlider from "../LanguageSlider/LanguageSlider";
import SettingsFooter from "../SettingsOverlay/SettingsFooter";
import Modal from "../Modal/Modal";
import MessageModal from "../MessageModal/MessageModal";

import closeIcon from "../../assets/icons/close.png";
import BackgroundImg from "../../assets/images/main-page-container.png";

import "./SettingsModal.css";

/**
 * Props interface for the SettingsModal component.
 */
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  musicVolume: number;
  soundFXVolume: number;
  setMusicVolume: (volume: number) => void;
  setSoundFXVolume: (volume: number) => void;
}

/**
 * SettingsModal Component
 *
 * A modal that allows users to adjust settings such as music volume,
 * sound effects volume, language preferences, and help messages.
 *
 * @param {SettingsModalProps} props - The properties that define the SettingsModal component.
 * @returns {JSX.Element | null} The rendered settings modal or null if not open.
 */
const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  musicVolume,
  soundFXVolume,
  setMusicVolume,
  setSoundFXVolume,
}) => {
  const { t } = useTranslation();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // Manage visibility of MessageModal
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // Manage visibility of ConfirmationModal

   /**
   * Closes all modals, including the settings, message, and confirmation modals.
   */
    const handleCloseAllModals = () => {
    setIsMessageModalOpen(false); 
    setIsConfirmationModalOpen(false);
    onClose(); 
  };

  /**
   * Opens the message modal.
   */
  const openMessageModal = () => {
    setIsMessageModalOpen(true);
  };

  /**
   * Closes the confirmation modal and ensures the message modal is also closed.
   */
  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setIsMessageModalOpen(false); 
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-container">
      <Modal isOpen={isOpen} onClose={handleCloseAllModals}>
        <TitleModal>{ t('settings-title') }</TitleModal>
        <Button variant="circle" soundFXVolume={soundFXVolume} onClick={handleCloseAllModals}>
          <img className="close-icon" src={closeIcon} alt="Close" />
        </Button>

        <div className="settings-overlay-container">
          <div className="settings-grid">
            <div className="settings-row-item">
              <div className="settings-row-item-title">
                <p className="settings-modal-p">{ t('settings-modal-p-music') }</p>
              </div>
              <div className="slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                  className="slider"
                />
              </div>
            </div>

            <div className="settings-row-item">
              <div className="settings-row-item-title">
                <p className="settings-modal-p">{ t('settings-modal-p-sound-fx') }</p>
              </div>
              <div className="slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundFXVolume}
                  onChange={(e) => setSoundFXVolume(parseInt(e.target.value))}
                  className="slider"
                />
              </div>
            </div>

            <div className="settings-row-item">
              <div className="settings-row-item-title">
                <p className="settings-modal-p">{ t('settings-modal-p-language') }</p>
              </div>
              <LanguageSlider soundFXVolume={soundFXVolume} />
            </div>

            <div className="settings-row-item">
              <div className="settings-row-item-title">
                <p className="settings-modal-p">{ t('settings-modal-p-help') }</p>
              </div>
              <div className="settings-row-help-btn">
                <Button variant="help" soundFXVolume={soundFXVolume} onClick={openMessageModal}>
                  <span className="button-text">{ t('settings-modal-p-send-message') }</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <SettingsFooter />
      </Modal>

      {/* MessageModal */}
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={handleCloseAllModals} 
        soundFXVolume={soundFXVolume}
        setIsConfirmationModalOpen={setIsConfirmationModalOpen} 
      />

      {/* ConfirmationModal */}
      {isConfirmationModalOpen && (
        <div className="confirmation-modal-container">
            <img src={ BackgroundImg } className="confirmation-modal-background-img" alt="Modal background" />
            <div className="confirmation-modal-content">
              <p>Your message has been sent successfully!</p>
              <Button variant="primary-1" soundFXVolume={soundFXVolume} onClick={closeConfirmationModal}>
                <span>OK</span>
              </Button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;