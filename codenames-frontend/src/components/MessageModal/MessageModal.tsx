import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "../Button/Button";
import Modal from "../Modal/Modal";
import TitleModal from "../TitleModal/TitleModal";

import closeIcon from "../../assets/icons/close.png";
import spinner from "../../assets/icons/spinner.svg";

import "./MessageModal.css";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundFXVolume: number;
  setIsConfirmationModalOpen: (open: boolean) => void; // New prop to control the confirmation modal
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  soundFXVolume,
  setIsConfirmationModalOpen,
}) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!email || !message) {
      alert("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    const dataToSend = {
      dataToSend: "E-mail: " + email + "\nMessage: " + message,
    };

    try {
      const response = await fetch("http://localhost:8080/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error("Failed to send email. Please try again later.");
      }

      setError(null);
      setIsConfirmationModalOpen(true);
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <TitleModal>{ t('message-us-title') }</TitleModal>
      <Button variant="circle" soundFXVolume={soundFXVolume}>
        <img src={closeIcon} onClick={onClose} alt="Close" />
      </Button>
      <div className="message-overlay-container">
        <div className="message-grid">
          <div className="message-row-item">
            <p className="message-row-item-message">{ t('message-row-item-message-2') }</p>
          </div>
          <div className="message-row-item">
            <input
              className="message-email-input"
              type="email"
              placeholder="E-MAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="message-row-item">
            <textarea
              placeholder={ t('MESSAGE') }
              className="message-row-item-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="message-row-item">
            <div className="message-row-item-grid">
              <p className="message-row-item-message">
                { t('message-row-item-message') }
              </p>
              {isLoading ? (
                <div className="loading-spinner">
                  {/* Wyświetlenie SVG jako obraz */}
                  <img
                    src={spinner}
                    alt="Loading..."
                    className="spinner-image"
                  />
                </div>
              ) : (
                <Button
                  variant="primary-1"
                  soundFXVolume={soundFXVolume}
                  onClick={handleSubmit} // Triggering the handleSubmit function on button click
                >
                  <span>{ t('submit-button') }</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MessageModal;
