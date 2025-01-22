
import {ErrorMessage, useFormik} from 'formik';
import * as Yup from 'yup';
import Button from "../Button/Button.tsx";
import backButton from "../../assets/icons/arrow-back.png";
import {useNavigate} from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./CreateGameForm.css";
import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";

interface CreateGameFormProps {
    soundFXVolume: number;
}

const CreateGameForm: React.FC<CreateGameFormProps> = ({soundFXVolume}) => {
    const { t } = useTranslation();
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            gameName: '',
            playerSlider: 4,
            gameDuration: 0,
            hintTime: 0,
            roundsNumber: 0,
        },
        validationSchema: Yup.object({
            gameName: Yup.string().required('Required'),
            playerSlider: Yup.number().required('Required').min(4).max(16),
            gameDuration: Yup.number().required('Required'),
            hintTime: Yup.number().required('Required'),
            roundsNumber: Yup.number().required('Required'),
        }),
        onSubmit: () => {
            // apiCreateGame();
        },
    });

    const navigate = useNavigate()

    return (
        <>
            <RoomMenu>
                <Button className="back-button" variant={"circle-back"} onClick={() => navigate('/games')} soundFXVolume={soundFXVolume}>
                    <img src={backButton} alt="Back" className="btn-arrow-back" />
                </Button>
                <span className="room-form-label">{ t('create-game-button') }</span>
                <form onSubmit={formik.handleSubmit} style={{"gridColumn": "2", "gridRow": "2"}}>
                    <div className={"form-content"}>
                        <input
                            id="gameName"
                            className='input-box'
                            name="gameName"
                            type="text"
                            placeholder="Game name"
                            onChange={formik.handleChange}
                            value={formik.values.gameName}
                            style={{"gridColumn": "span 2"}}
                        />
                        {formik.touched.gameName && formik.errors.gameName ? (
                            <ErrorMessage name="gameName">
                                {(errorMessage) => <div className="error">{errorMessage}</div>}
                            </ErrorMessage>
                        ) : null}
                        <div className="slider-container" style={{ display: "flex", alignItems: "center", gap: "20px", gridColumn: "span 2", gridRow: "2" }}>
                            <label htmlFor="playerSlider" style={{ marginRight: "10px" }}>{t('slots')}:</label>
                            <input
                                id="playerSlider"
                                name="playerSlider"
                                className="slider"
                                type="range"
                                min="4"
                                max="16"
                                step="1"
                                onChange={formik.handleChange}
                                value={formik.values.playerSlider || 4}
                            />
                            <span className="slider-value">{formik.values.playerSlider || 4}</span>
                        </div>
                        <label>{ t('duration') }</label>
                        <input
                            id="gameDuration"
                            className='input-box'
                            name="gameDuration"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.gameDuration}
                        />
                        <label>{ t('hint-duration') }</label>
                        <input
                            id="hintTime"
                            className='input-box'
                            name="hintTime"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.hintTime}
                        />
                        <label>{ t('guess-duration') }</label>  
                        {/* dodać tłumaczenie "time to guess" */}
                        <input
                            id="guessTime"
                            className='input-box'
                            name="guessTime"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.hintTime}
                        />
                    </div>
                    <Button type="submit" variant="room" soundFXVolume={soundFXVolume}>
                        <span className="button-text">{ t('create-game-button') }</span>
                    </Button>
                </form>
            </RoomMenu>
        </>
    );
}

export default CreateGameForm;