import { ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import Button from "../Button/Button.tsx";
import backButton from "../../assets/icons/arrow-back.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import "./CreateGameForm.css";
import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import React from "react";

// Typ dla CreateGameFormProps
interface CreateGameFormProps {
  soundFXVolume: number;
}

const CreateGameForm: React.FC<CreateGameFormProps> = ({ soundFXVolume }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      gameName: "",
      playerSlider: 4,
      gameDuration: 0,
      hintTime: "",
      guessingTime: "",
      deckLanguage: "en",
    },

    validationSchema: Yup.object({
      hintTime: Yup.string()
        .matches(
          /^([0-9]{2}):([0-9]{2})$/,
          "Invalid time format. Please use MM:SS"
        )
        .test(
          "is-greater-than-zero",
          "Time must be greater than 00:00",
          (value) => {
            if (!value) return false;
            const [minutes, seconds] = value.split(":").map(Number);
            return minutes > 0 || seconds > 0;
          }
        )
        .required("Required"),
      guessingTime: Yup.string()
        .matches(
          /^([0-9]{2}):([0-9]{2})$/,
          "Invalid time format. Please use MM:SS"
        )
        .test(
          "is-greater-than-zero",
          "Time must be greater than 00:00",
          (value) => {
            if (!value) return false;
            const [minutes, seconds] = value.split(":").map(Number);
            return minutes > 0 || seconds > 0;
          }
        )
        .required("Required"),
    }),

    onSubmit: async (values) => {
      try {
        const getIdResponse = await fetch(
          "http://localhost:8080/api/users/getId",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!getIdResponse.ok) {
          setError("Failed to fetch ID");
          return;
        }

        const getIdData = await getIdResponse.text();

        const requestData = {
          gameName: values.gameName,
          maxPlayers: values.playerSlider,
          timeForAHint: convertToDuration(values.hintTime),
          timeForGuessing: convertToDuration(values.guessingTime),
          language: values.deckLanguage,
        };

        const response = await fetch(
          "http://localhost:8080/api/game-session/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("gameId", data.gameId);
          navigate("/game-lobby");
        } else {
          setError("Failed to create game session");
        }
      } catch (err) {
        setError("Network error");
      }
    },
  });

  const handleBack = async () => {
    const storedGameId = localStorage.getItem("gameId");

    if (!storedGameId) {
      setError("No game session found");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/game-session/${storedGameId}/finish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: null,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to abort the game");
      }

      navigate("/games");
    } catch (error) {
      setError("Failed to abort the game. Please try again.");
    }
  };

  const formatTimeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    let value = e.target.value.replace(/\D/g, "");

    while (value.length < 4) {
      value = "0" + value;
    }
    value = value.slice(-4);
    const formattedValue = `${value.substring(0, 2)}:${value.substring(2, 4)}`;
    formik.setFieldValue(name, formattedValue);
  };

  const convertToDuration = (time: string) => {
    const [minutes, seconds] = time.split(":").map(Number);
    return `PT${minutes}M${seconds}S`;
  };

  return (
    <>
      <RoomMenu>
        <Button
          className="back-button"
          variant={"circle-back"}
          onClick={handleBack}
          soundFXVolume={soundFXVolume}
        >
          <img src={backButton} alt="Back" className="btn-arrow-back" />
        </Button>
        <span className="room-form-label">{t("create-game-button")}</span>
        <form
          onSubmit={formik.handleSubmit}
          style={{ gridColumn: "2", gridRow: "2" }}
        >
          <div className={"form-content"}>
            <input
              id="gameName"
              className="input-box"
              name="gameName"
              type="text"
              placeholder="GAME NAME"
              onChange={formik.handleChange}
              value={formik.values.gameName}
              style={{ gridColumn: "span 2" }}
            />
            {formik.touched.gameName && formik.errors.gameName ? (
              <ErrorMessage name="gameName">
                {(errorMessage) => <div className="error">{errorMessage}</div>}
              </ErrorMessage>
            ) : null}
            <div
              className="slider-container"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                gridColumn: "span 2",
                gridRow: "2",
              }}
            >
              <label htmlFor="playerSlider" style={{ marginRight: "10px" }}>
                {t("slots")}:
              </label>
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
              <span className="slider-value">
                {formik.values.playerSlider || 4}
              </span>
            </div>
            <label>{t("hint-duration")}</label>
            <input
              id="hintTime"
              className="input-box"
              name="hintTime"
              type="text"
              value={formik.values.hintTime}
              onChange={(e) => formatTimeInput(e, "hintTime")}
              maxLength={6}
            />
            <label>{t("guess-duration")}</label>
            <input
              id="guessingTime"
              className="input-box"
              name="guessingTime"
              type="text"
              value={formik.values.guessingTime}
              onChange={(e) => formatTimeInput(e, "guessingTime")}
              maxLength={6}
            />

            <label htmlFor="deckLanguage">{t("deck-language")}</label>
            <select
              id="deckLanguage"
              name="deckLanguage"
              onChange={formik.handleChange}
              value={formik.values.deckLanguage}
              className="input-box"
            >
              <option value="en">EN</option>
              <option value="pl">PL</option>
            </select>
          </div>
          {error && <div className="error">{error}</div>}
          <Button type="submit" variant="room" soundFXVolume={soundFXVolume}>
            <span className="button-text">{t("create-game-button")}</span>
          </Button>
        </form>
      </RoomMenu>
    </>
  );
};

export default CreateGameForm;
