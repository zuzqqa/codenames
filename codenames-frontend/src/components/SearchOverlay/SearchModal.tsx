import Modal from "../Modal/Modal";
import searchBar from "../../assets/images/search-bar.png";
import searchIcon from "../../assets/icons/search-icon.png";

import "./SearchModal.css";

/**
 * Props interface for the SearchModal component.
 */
interface SearchModalProps {
  isOpen: boolean; // Determines if the modal is visible
  onClose: () => void; // Callback to close the modal
  soundFXVolume: number; // Current sound effects volume level
}

/**
 * SearchModal Component
 *
 * A modal containing a search input field and a close button.
 *
 * @component
 * @param {SearchModalProps} props - Component properties
 * @returns {JSX.Element | null} - Rendered component or null if modal is closed
 */
const SearchModal: React.FC<SearchModalProps> = ({
                                                   isOpen,
                                                   onClose
                                                 }) => {
  // If the modal is not open, return null to render nothing
  if (!isOpen) return null;

  /**
   * Handles closing the modal when triggered.
   */
  const toggleModal = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={toggleModal}>
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
