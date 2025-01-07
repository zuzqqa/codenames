import React, { useState } from "react";

// Importing components and resources
import Button from "../Button/Button";
import Modal from "../Modal/Modal";
import TitleModal from "../TitleModal/TitleModal";
import closeIcon from "../../assets/icons/close.png";

import "./MessageModal.css";

// Defining the type for the props of the MessageModal component
interface MessageModalProps {
  isOpen: boolean; // Determines whether the modal is visible
  onClose: () => void; // Callback function to close the modal
  soundFXVolume: number; // The current sound effects volume level
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  soundFXVolume,
}) => {
  // States to store the form data
  const [email, setEmail] = useState(""); // State for the email input
  const [message, setMessage] = useState(""); // State for the message textarea
  const [isSubmitted, setIsSubmitted] = useState(false); // State to track whether the form has been submitted

  // If the modal is not open, return null to render nothing
  if (!isOpen) return null;

  // Function to close the modal
  const toggleModal = () => {
    onClose(); // Calling the callback function to close the modal
  };

  // Function to handle form submission
  const handleSubmit = () => {
    // Validation for the form fields (checking if email and message are filled)
    if (!email || !message) {
      alert("Please fill in all fields.");
      return; // Stop further action if any field is empty
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Set the state to indicate that the form has been submitted
    setIsSubmitted(true);

    // Placeholder for future API call or sending data
    console.log("Form submitted:", { email, message });
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email); // Return true if email matches the regex
  };

  return (
    <Modal isOpen={isOpen} onClose={toggleModal}>
      {/* Modal header with title */}
      <TitleModal>Message us</TitleModal>
      {/* Button to close the modal */}
      <Button variant="circle" soundFXVolume={soundFXVolume}>
        <img src={closeIcon} onClick={toggleModal} alt="Close" />
      </Button>
      {/* Form container */}
      <div className="message-overlay-container">
        <div className="message-grid">
          {/* First row with a description of the form purpose */}
          <div className="message-row-item">
            <p className="message-row-item-message">
              Need help or have feedback about the game? We're here to assist
              you! Fill out the form below and let us know how we can help.
            </p>
          </div>
          {/* Email input field */}
          <div className="message-row-item">
            <input
              className="message-email-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Updating the email state
              disabled={isSubmitted} // Disable input after submission
            />
          </div>
          {/* Message textarea */}
          <div className="message-row-item">
            <textarea
              placeholder="Message"
              className="message-row-item-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)} // Updating the message state
              disabled={isSubmitted} // Disable textarea after submission
            />
          </div>
          {/* Row with the submit button or confirmation message */}
          <div className="message-row-item">
            {isSubmitted ? (
              // Display a confirmation message after the form is submitted
              <p className="message-row-item-message">
                Your message has been sent!
              </p>
            ) : (
              // Form displayed before submission
              <div className="message-row-item-grid">
                <p className="message-row-item-message">
                  We’ll do our best to respond as quickly as possible!
                </p>
                <Button
                  variant="primary-1"
                  soundFXVolume={soundFXVolume}
                  onClick={handleSubmit} // Triggering the handleSubmit function on button click
                >
                  <span>Submit</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MessageModal;
