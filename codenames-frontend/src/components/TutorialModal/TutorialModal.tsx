import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button";
import TitleModal from "../TitleModal/TitleModal";
import Modal from "../Modal/Modal";

import closeIcon from "../../assets/icons/close.png";
import engPage1 from "../../assets/images/eng-page-1.png";
import engPage2 from "../../assets/images/eng-page-2.png";
import engPage3 from "../../assets/images/eng-page-3.png";
import engPage4 from "../../assets/images/eng-page-4.png";
import plPage1 from "../../assets/images/pl-page-1.png";
import plPage2 from "../../assets/images/pl-page-2.png";
import plPage3 from "../../assets/images/pl-page-3.png";
import plPage4 from "../../assets/images/pl-page-4.png";

import "./TutorialModal.css";

/**
 * Props interface for the TutorialModal component.
 */
interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    soundFXVolume: number;
}

/**
 * TutorialModal Component
 *
 * A modal that allows users to adjust tutorial such as music volume,
 * sound effects volume, language preferences, and help messages.
 *
 * @param {TutorialModalProps} props - The properties that define the TutorialModal component.
 * @returns {JSX.Element | null} The rendered tutorial modal or null if not open.
 */
const TutorialModal: React.FC<TutorialModalProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         soundFXVolume,
                                                     }) => {
    const { t, i18n } = useTranslation();
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState<string[]>([
        engPage1, engPage2, engPage3, engPage4
    ]);

    /**
     * Closes modal
     */
    const handleCloseModal = () => {
        onClose();
    };

    React.useEffect(() => {
        if (i18n.language === "pl") {
            setPages([plPage1, plPage2, plPage3, plPage4]);
        } else {
            setPages([engPage1, engPage2, engPage3, engPage4]);
        }
    }, [i18n.language]);

    const pageCount = pages.length;

    const handleNext = () => {
        if (currentPage < pageCount - 1) setCurrentPage(currentPage + 1);
    };
    const handlePrev = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    if (!isOpen) return null;

    return (
        <div className="tutorial-modal-container">
            <Modal isOpen={isOpen} onClose={handleCloseModal} variant="large">
                <TitleModal>{ t('tutorial-title') }</TitleModal>
                <Button variant="circle" soundFXVolume={soundFXVolume} onClick={handleCloseModal}>
                    <img className="close-icon" src={closeIcon} alt="Close" />
                </Button>

                <div className="tutorial-overlay-container">
                    <img src={pages[currentPage]} alt={`Page ${currentPage + 1}`} />
                </div>
                <div className="paging-controls">
                    <Button variant="primary" soundFXVolume={soundFXVolume} onClick={handlePrev} disabled={currentPage === 0}>{t('prev')}</Button>
                    <span>{currentPage + 1} / {pageCount}</span>
                    <Button variant="primary" soundFXVolume={soundFXVolume} onClick={handleNext} disabled={currentPage === pageCount - 1}>{t('next')}</Button>
                </div>
            </Modal>

        </div>
    );
};

export default TutorialModal;