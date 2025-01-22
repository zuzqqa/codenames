import {ErrorMessage, useFormik} from 'formik';
import * as Yup from 'yup';
import Button from "../Button/Button.tsx";
import backButton from "../../assets/icons/arrow-back.png";
import {useNavigate} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import "./CreateGameForm.css";
import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import React from "react";

// Typ dla CreateGameFormProps
interface CreateGameFormProps {
    soundFXVolume: number;
}

const CreateGameForm: React.FC<CreateGameFormProps> = ({soundFXVolume}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

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
        onSubmit: async (values) => {
            try {
                const requestData = {
                    gameName: values.gameName,
                    maxPlayers: values.playerSlider,
                    durationOfTheRound: `PT${values.gameDuration}S`,  
                    timeForGuessing: `PT${values.hintTime}S`,          
                    timeForAHint: `PT${values.hintTime}S`,          
                    numberOfRounds: values.roundsNumber,
                };

                const response = await fetch('http://localhost:8080/api/game-session/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('gameId', data.gameId);
                    navigate('/game-lobby');
                } else {
                    setError('Failed to create game session');
                }
            } catch (err) {
                setError('Network error');
            }
        },
    });

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
                        <label style={{"gridColumn": "span 2", "gridRow": "2"}}>{ t('slots') }</label>
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
                            style={{"gridColumn": "1", "gridRow": "3"}}
                        />
                        <span className="slider-value">{formik.values.playerSlider || 4}</span>
                        <label>{ t('duration') }</label>
                        <input
                            id="gameDuration"
                            className='input-box'
                            name="gameDuration"
                            type="text"
                            placeholder="Game duration (in seconds)"
                            onChange={formik.handleChange}
                            value={formik.values.gameDuration}
                        />
                        <label>{ t('hint-duration') }</label>
                        <input
                            id="hintTime"
                            className='input-box'
                            name="hintTime"
                            type="text"
                            placeholder="Hint Time (in seconds)"
                            onChange={formik.handleChange}
                            value={formik.values.hintTime}
                        />
                        <label>{ t('number-of-rounds') }</label>
                        <input
                            id="roundsNumber"
                            className='input-box'
                            name="roundsNumber"
                            type="text"
                            placeholder="Rounds No."
                            onChange={formik.handleChange}
                            value={formik.values.roundsNumber}
                        />
                    </div>
                    {error && <div className="error">{error}</div>}
                    <Button type="submit" variant="room" soundFXVolume={soundFXVolume}>
                        <span className="button-text">{ t('create-game-button') }</span>
                    </Button>
                </form>
            </RoomMenu>
        </>
    );
}

export default CreateGameForm;
