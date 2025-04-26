import { ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import Button from "../Button/Button.tsx";
import backButton from "../../assets/icons/arrow-back.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import "./CreateGameForm.css";
import RoomMenu from "../../containers/RoomMenu/RoomMenu.tsx";
import React from "react";

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

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
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);

  /**
   * Formik configuration for managing form state and validation.
   */
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      gameName: "",
      playerSlider: 4,
      password: "",
      deckLanguage: "en",
    },

    /**
     * Handles form submission and creates a new game session.
     * @param {Object} values - Form values.
     */
    onSubmit: async (values) => {
      const newErrors: { id: string; message: string }[] = [];
      setErrors(newErrors);
      
      if(isPrivate && formik.values.password === '') {
        newErrors.push({
          id: generateId(),
          message: t("private-lobby-password-error"),
        });

        setErrors([...newErrors]);
        return;
      }
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

        const requestData = {
          gameName: values.gameName,
          maxPlayers: values.playerSlider,
          password: values.password,
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

  /**
   * useEffect hook for handling the automatic removal of error messages after a delay.
   *
   * - Adds a fade-out effect to the toast error before removal.
   * - Removes errors from the state after a timeout.
   *
   * @param {Array<{ id: string; message: string }>} errors - Array of error messages with unique IDs.
   */
  useEffect(() => {
    if (errors.length === 0) return;

    const timers: number[] = errors.map((error) => {
      const toastElement = document.getElementById(error.id);

      if (toastElement) {
        // Fade out the toast after 8 seconds
        const fadeOutTimer = setTimeout(() => {
          toastElement.classList.add("hide");
        }, 8000);

        // Remove the error from state after 8.5 seconds
        const removeTimer = setTimeout(() => {
          setErrors((prevErrors) =>
            prevErrors.filter((e) => e.id !== error.id)
          );
        }, 8500);

        return removeTimer;
      } else {
        // Remove error if toast element is not found
        return setTimeout(() => {
          setErrors((prevErrors) =>
            prevErrors.filter((e) => e.id !== error.id)
          );
        }, 8000);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [errors]);

  /**
   * Handles navigation back and optionally aborts a game session.
   */
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

  /**
   * Handles manual closing of a toast error.
   *
   * - Fades out the toast visually before removing it from the state.
   *
   * @param {string} id - The unique identifier of the error toast to be closed.
   */
  const handleCloseErrorToast = (id: string) => {
    const toastElement = document.getElementById(id);
    if (toastElement) {
      toastElement.classList.add("hide");

      setTimeout(() => {
        setErrors((prevErrors) =>
          prevErrors.filter((error) => error.id !== id)
        );
      }, 500);
    }
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
              {t("private-lobby")}:
            </label>
            <label className="cr-wrapper" style={{ gridColumn: "span 1" }}>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={() => setIsPrivate((prev) => !prev)}
              />
              <div className="cr-input"></div>
            </label>
            <input
              type="password"
              placeholder={t("PASSWORD")}
              className={`password-input ${isPrivate ? "visible" : "hiding"}`}
              style={{ gridColumn: "span 2" }}
              value={formik.values.password}
              name="password"
              onChange={formik.handleChange}
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
              <option value="en">EN</option>
              <option value="pl">PL</option>
            </select>
          </div>
          {error && <div className="error">{error}</div>}
          <Button type="submit" variant="room" soundFXVolume={soundFXVolume}>
            <span className="button-text">{t("create-game-button")}</span>
          </Button>
        </form>
        {errors.length > 0 && (
          <div className="toast-container">
            {errors.map((error) => (
              <div id={error.id} key={error.id} className="toast active">
                <div className="toast-content">
                  <i
                    className="fa fa-exclamation-circle fa-3x"
                    style={{ color: "#561723" }}
                    aria-hidden="true"
                  ></i>
                  <div className="message">
                    <span className="text text-1">Error</span>
                    <span className="text text-2">{error.message}</span>
                  </div>
                </div>
                <i
                  className="fa-solid fa-xmark close"
                  onClick={() => handleCloseErrorToast(error.id)}
                ></i>
                <div className="progress active"></div>
              </div>
            ))}
          </div>
        )}
      </RoomMenu>
    </>
  );
};

export default CreateGameForm;
