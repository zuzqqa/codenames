import { useFormik } from "formik";
import Button from "../Button/Button.tsx";
import backButton from "../../assets/icons/arrow-back.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import "./CreateGameForm.css";
import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import React from "react";
import { apiUrl } from "../../config/api.tsx";
import { getUserId } from "../../shared/utils.tsx";
import { useToast } from "../Toast/ToastContext.tsx";
import checkmarkIconEmpty from "../../assets/icons/checkbox-empty.png";
import checkmarkIcon from "../../assets/icons/checkbox.png";
import DiscordLoginButton from "../DiscordAuthentication/DiscordLoginButton.tsx";

/**
 * Props for CreateGameForm component.
 * @typedef {Object} CreateGameFormProps
 * @property {number} soundFXVolume - Volume level for sound effects.
 */
interface CreateGameFormProps {
  soundFXVolume: number;
}

/**
 * CreateGameForm component allows users to create a game session.
 * Includes form validation and interaction with the backend API.
 *
 * @param {CreateGameFormProps} props - Component properties.
 * @returns {JSX.Element} The rendered CreateGameForm component.
 */
const CreateGameForm: React.FC<CreateGameFormProps> = ({ soundFXVolume }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isPrivate, setIsPrivate] = useState(false);
  const { addToast } = useToast();

  /**
   * Formik configuration for managing form state and validation.
   */
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      gameName: "",
      playerSlider: 4,
      password: "",
      deckLanguage: "pl",
    },
    onSubmit: async (values) => {
      if (!values.gameName) {
        addToast(t("game-name-required"), "error");
        return;
      }

      if (isPrivate && formik.values.password === "") {
        addToast(t("private-lobby-password-error"), "error");
        return;
      }
      try {
        const getIdResponse = await getUserId();

        if (getIdResponse === null) {
          addToast("Failed to fetch ID.", "error");
          return;
        }

        const requestData = {
          gameName: values.gameName,
          maxPlayers: values.playerSlider,
          password: values.password,
          language: values.deckLanguage,
        };

        const response = await fetch(`${apiUrl}/api/game-session/create-game`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          const data = await response.json();
          sessionStorage.setItem("gameId", data.gameId);
          navigate("/game-lobby");
        } else {
          addToast("Failed to create game session", "error");
        }
      } catch (err) {
        addToast("Network error", "error");
      }
    },
  });

  /**
   * Handles navigation back and optionally aborts a game session.
   */
  const handleBack = () => {
    navigate("/games");
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
          <div className="room-form-divider">
            <span className="room-form-divider-title">Codenames</span>
          </div>
          <div
            className={"form-content"}
            style={{
              gridTemplateRows: isPrivate
                ? "1fr 1fr 1fr 1fr 1fr"
                : "1fr 1fr 1fr 1fr",
            }}
          >
            <input
              id="gameName"
              className="input-box"
              name="gameName"
              type="text"
              placeholder={t("game-name")}
              onChange={formik.handleChange}
              value={formik.values.gameName}
              style={{ gridColumn: "span 2" }}
            />
            <label
              htmlFor="privateRoomPassword"
              style={{
                marginRight: "10px",
                gridColumn: "span 1",
              }}
              className="label-inset"
            >
              {t("private-lobby")}?
            </label>
            <div className="custom-checkbox">
              {!isPrivate ? (
                <img
                  src={checkmarkIconEmpty}
                  alt="Checkmark"
                  onClick={() => setIsPrivate((prev) => !prev)}
                />
              ) : (
                <img
                  src={checkmarkIcon}
                  alt="Checkmark"
                  onClick={() => setIsPrivate((prev) => !prev)}
                />
              )}
            </div>
            <input
              type="password"
              placeholder={t("PASSWORD")}
              className={`password-input ${isPrivate ? "visible" : "hiding"}`}
              style={{ gridColumn: "span 2" }}
              value={formik.values.password}
              name="password"
              onChange={formik.handleChange}
            />
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
              <label
                htmlFor="playerSlider"
                className="label-inset"
                style={{ marginRight: "10px" }}
              >
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
              <span className="slider-value label-inset">
                {formik.values.playerSlider || 4}
              </span>
            </div>
            <label htmlFor="deckLanguage" className="label-inset">
              {t("deck-language")}:
            </label>
            <select
              id="deckLanguage"
              name="deckLanguage"
              onChange={formik.handleChange}
              value={formik.values.deckLanguage}
              className="input-box"
            >
              <option value="pl">PL</option>
              <option value="en">EN</option>
            </select>
          </div>
          <Button type="submit" variant="room" soundFXVolume={soundFXVolume}>
            <span className="button-text">{t("create-game-button")}</span>
          </Button>
        </form>
      </RoomMenu>
      <DiscordLoginButton soundFXVolume={soundFXVolume} />
    </>
  );
};

export default CreateGameForm;
