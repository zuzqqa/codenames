
import {ErrorMessage, useFormik} from 'formik';
import * as Yup from 'yup';
import Button from "../Button/Button.tsx";
import Subtitle from "../Subtitle/Subtitle.tsx";
import backButton from "../../assets/icons/arrow-back.png";
import {useNavigate} from "react-router-dom";

import "./CreateGameForm.css";
import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";

interface CreateGameFormProps {
    soundFXVolume: number;
}

const CreateGameForm: React.FC<CreateGameFormProps> = ({soundFXVolume}) => {
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            gameName: 'NewGame',
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
            <Subtitle variant={"room"}>Create Room</Subtitle>
            <RoomMenu>
                <Button variant={"circle-back"} onClick={() => navigate('/games')} soundFXVolume={soundFXVolume}>
                    <img src={backButton} alt="Back" className="btn-arrow-back" />
                </Button>
                <form onSubmit={formik.handleSubmit} style={{"gridColumn": "2", "gridRow": "2"}}>
                    <div className={"form-content"}>
                        <input
                            id="gameName"
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
                        <label style={{"gridColumn": "span 2", "gridRow": "2"}}>Number of players:</label>
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
                        <label>Duration of the round:</label>
                        <input
                            id="gameDuration"
                            name="gameDuration"
                            type="text"
                            placeholder="Game duration"
                            onChange={formik.handleChange}
                            value={formik.values.gameDuration}
                        />
                        <label>Time to select a hint:</label>
                        <input
                            id="hintTime"
                            name="hintTime"
                            type="text"
                            placeholder="Hint Time"
                            onChange={formik.handleChange}
                            value={formik.values.hintTime}
                        />
                        <label>Number of rounds:</label>
                        <input
                            id="roundsNumber"
                            name="roundsNumber"
                            type="text"
                            placeholder="Rounds No."
                            onChange={formik.handleChange}
                            value={formik.values.roundsNumber}
                        />
                    </div>
                    <Button type="submit" variant="room" soundFXVolume={soundFXVolume}>
                        <span className="button-text">Create game</span>
                    </Button>
                </form>
            </RoomMenu>
        </>
    );
}

export default CreateGameForm;