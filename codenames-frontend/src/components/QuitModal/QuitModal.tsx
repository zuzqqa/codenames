import React from "react";
import {useTranslation} from "react-i18next";
import Button from "../Button/Button.tsx";
import "./QuitModal.css";
import Modal from "../Modal/Modal.tsx";
import TitleModal from "../TitleModal/TitleModal.tsx";
import closeIcon from "../../assets/icons/close.png";
import {apiUrl} from "../../config/api.tsx";
import {useNavigate} from "react-router-dom";

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
    const navigate = useNavigate();
    const [notifications, setNotifications] = React.useState<{ id: string; message: string }[]>([]);
    const [userQuit, setUserQuit] = React.useState(false);
    const [userName, setUserName] = React.useState<string | null>(null);

    /**
     * @returns {string} - The URL of the API.
     */
    const generateId = () =>
        Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

    const disconnectUser = () => {
        setUserQuit(true);
        setUserName("Test");
        const storedGameId = localStorage.getItem("gameId");
        const userId = localStorage.getItem("userId");
        if (!storedGameId) return;

        fetch(`${apiUrl}/api/game-session/${storedGameId}/disconnect?userId=${userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            credentials: "include",
          },
        })
          .then(() => {
            localStorage.removeItem("gameId");
            navigate("/games");
          })
          .catch((error) => {
            console.error("Error disconnecting user:", error);
          });
    }

    if (!isOpen) return null;

    return (
        <div>
            <Modal isOpen={isOpen} onClose={onClose}>
                <div className="quit-modal-title">
                    <TitleModal>{ t('leave-title') }</TitleModal>
                </div>
                <div className="quit-modal-container">
                    <Button variant="circle" soundFXVolume={soundFXVolume} onClick={onClose}>
                        <img className="close-icon" src={closeIcon} alt="Close" />
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