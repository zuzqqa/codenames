import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button.tsx";
import "./QuitModal.css";
import Modal from "../Modal/Modal.tsx";
import TitleModal from "../TitleModal/TitleModal.tsx";
import closeIcon from "../../assets/icons/close.png";

interface QuitModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundFXVolume: number;
  children: React.ReactNode;
}

const QuitModal: React.FC<QuitModalProps> = ({
                                               isOpen,
                                               onClose,
                                               soundFXVolume,
                                               children
                                             }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div>
      <Modal isOpen={isOpen} onClose={onClose} variant="small">
        <div className="quit-modal-title">
          <TitleModal variant="tiny">{t('leave-title')}</TitleModal>
        </div>
        <div className="quit-modal-container">
          <Button variant="circle" soundFXVolume={soundFXVolume} onClick={onClose}>
            <img className="close-icon" src={closeIcon} alt="Close"/>
          </Button>
          <div className="quit-modal-content">
            {children}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default QuitModal;