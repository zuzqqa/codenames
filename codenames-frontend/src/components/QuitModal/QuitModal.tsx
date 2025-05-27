import React, {useEffect} from "react";
import {useTranslation} from "react-i18next";
import Button from "../Button/Button.tsx";
import "./QuitModal.css";
import Modal from "../Modal/Modal.tsx";
import TitleModal from "../TitleModal/TitleModal.tsx";
import closeIcon from "../../assets/icons/close.png";
import {apiUrl} from "../../config/api.tsx";
import {useNavigate} from "react-router-dom";
import {getCookie} from "../../shared/utils.tsx";

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

    /**
     * Handles manual closing of a toast notification.
     *
     * - Fades out the toast visually before removing it from the state.
     *
     * @param {string} id - The unique identifier of the notification toast to be closed.
     */
    const handleCloseNotificationToast = (id: string) => {
        const toastElement = document.getElementById(id);
        if (toastElement) {
            toastElement.classList.add("hide");

            setTimeout(() => {
                setNotifications((prevNotifications) =>
                    prevNotifications.filter((notification) => notification.id !== id)
                );
            }, 500);
        }
    };

    /**
     * useEffect hook for handling the automatic removal of notification messages after a delay.
     *
     * - Adds a fade-out effect to the toast notification before removal.
     * - Removes notifications from the state after a timeout.
     *
     * @param {Array<{ id: string; message: string }>} errors - Array of notification messages with unique IDs.
     */
    useEffect(() => {
        if (notifications.length === 0) return;

        const timers: number[] = notifications.map((notification) => {
            const toastElement = document.getElementById(notification.id);

            if (toastElement) {
                // Fade out the toast after 8 seconds
                const fadeOutTimer = setTimeout(() => {
                    toastElement.classList.add("hide");
                }, 8000);

                // Remove the message from state after 8.5 seconds
                const removeTimer = setTimeout(() => {
                    setNotifications((prevNotifications) =>
                        prevNotifications.filter((n) => n.id !== notification.id)
                    );
                }, 8500);

                return removeTimer;
            } else {
                // Remove message if toast element is not found
                return setTimeout(() => {
                    setNotifications((prevNotifications) =>
                        prevNotifications.filter((n) => n.id !== notification.id)
                    );
                }, 8000);
            }
        });

        return () => timers.forEach(clearTimeout);
    }, [notifications]);

    /**
     * useEffect hook for handling the copying of the lobby link to the clipboard.
     *
     * - Displays a notification message when the link is copied.
     * - Clears the lobby link state after displaying the notification.
     *
     * @param {string} lobbyLink - The generated lobby link to be copied.
     */
    useEffect(() => {
        if (userQuit) {
            setNotifications((prevNotifications) => {
                const notificationExists = prevNotifications.some(
                    (n) => n.message === t("user") + " " + userName + " " + t('quit')
                );

                if (!notificationExists) {
                    return [
                        ...prevNotifications,
                        { id: generateId(), message: t("user") + " " + userName + " " + t('quit') },
                    ];
                }
                return prevNotifications;
            });
        }
    }, [userQuit]);

    if (!isOpen) return null;

    return (
        <div>
            {notifications.length > 0 && (
                <div className="toast-container">
                    {notifications.map((notification) => (
                        <div
                            id={notification.id}
                            key={notification.id}
                            className="toast active"
                        >
                            <div className="toast-content">
                                <i
                                    className="fa fa-info-circle fa-3x"
                                    style={{ color: "#1B74BB" }}
                                    aria-hidden="true"
                                ></i>
                                <div className="message">
                                    <span className="text text-1">Notification</span>
                                    <span className="text text-2">{notification.message}</span>
                                </div>
                            </div>
                            <i
                                className="fa-solid fa-xmark close"
                                onClick={() => handleCloseNotificationToast(notification.id)}
                            ></i>
                            <div className="progress active notification"></div>
                        </div>
                    ))}
                </div>
            )}
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="quit-modal-title">
            <TitleModal>{ t('settings-title') }</TitleModal>
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