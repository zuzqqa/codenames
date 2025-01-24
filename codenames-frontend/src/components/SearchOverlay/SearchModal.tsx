import Modal from "../Modal/Modal";
import searchBar from "../../assets/images/search-bar.png";
import searchIcon from "../../assets/icons/search-icon.png";


import "./SearchModal.css";

// Define the type for the SettingsModal component's props
interface SearchModalProps {
  isOpen: boolean; // Determines if the modal is visible
  onClose: () => void; // Callback to close the modal
  soundFXVolume: number; // Current sound effects volume level
}

// Main component definition
const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose
}) => {

  // If the modal is not open, return null to render nothing
  if (!isOpen) return null;


  // Close the modal when the close button is clicked
  const toggleModal = () => {
    onClose();
  };

  // Open the Message Modal


  // Component rendering logic
  return (
        <Modal isOpen={isOpen} onClose={toggleModal}>
        {/* Modal header with title */}
        <div search-modal-content>
            <img src={searchBar} alt="searchbar" className="search-bar-background"/>
            <div className="search-bar-container">
                <div className="search-input-container">
                <input
                        className="input-field"
                        placeholder="search"
                />
                </div>
                <img src={searchIcon} alt="search" className="search-icon" onClick={toggleModal}/>
            </div>
        </div>
        </Modal>
  );
};

export default SearchModal;
