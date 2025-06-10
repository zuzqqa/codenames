import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // Importing React Router components
import React, { useEffect, useState } from "react"; // Importing React hooks
import Cookies from "js-cookie"; // Importing cookie management library
import { useTranslation } from "react-i18next";

import soundFile from "./assets/sounds/background-music.mp3"; // Importing background music file

// Importing components for different views in the app
import Home from "./views/Home/Home";
import SelectGame from "./views/SelectGame/SelectGame";
import CreateGame from "./views/CreateGame/CreateGame";
import JoinGame from "./views/JoinGame/JoinGame";
import GameLobby from "./views/GameLobby/GameLobby";
import Gameplay from "./views/Gameplay/Gameplay";
import ChooseLeader from "./views/ChooseLeader/ChooseLeader";
import LoginPage from "./views/LoginPage/LoginPage";
import RegisterPage from "./views/RegisterPage/RegisterPage";
import PrivateRoute from "./utils/PrivateRoute";
import WinLossView from "./views/WinLossView/WinLossView";
import LoadingPage from "./views/Loading/LoadingPage";
import ResetPasswordPage from "./views/ResetPassword/ResetPasswordPage.tsx";
import ResetPasswordRequestPage from "./views/ResetPassword/ResetPasswordRequestPage.tsx";
import Invite from "./components/Invite/Invite.tsx";
import { apiUrl } from "./config/api.tsx";
import {getCookie} from "./shared/utils.tsx"; // Importing API URL

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [soundFXVolume, setSoundFXVolume] = useState(50);
  const [audio] = useState(new Audio(soundFile));
  const [isPlaying, setIsPlaying] = useState(false);
  const { i18n } = useTranslation();
  let userId = localStorage.getItem("userId") || "";

  const playAudio = () => {
    if (!isPlaying) {
      audio.loop = true;
      audio.play().then();
      setIsPlaying(true);
    }
  };

  const storedMusicVolume = localStorage.getItem("musicVolume");
  const storedSoundFXVolume = localStorage.getItem("soundFXVolume");

  // Function to set the background music volume
  const setVolume = (volume: number) => {
    audio.volume = volume / 100; // Adjust the background music volume
    localStorage.setItem("musicVolume", volume.toString());
  };

  // Function to set the sound effects volume
  const setSoundFX = (volume: number) => {
    setSoundFXVolume(volume); // Adjust the sound effects volume
    localStorage.setItem("soundFXVolume", volume.toString());
  };

  // useEffect hook to check authentication and handle audio setup
  useEffect(() => {
    const initialMusicVolume = storedMusicVolume
      ? parseFloat(storedMusicVolume)
      : 0.5;
    const initialSoundFXVolume = storedSoundFXVolume
      ? parseInt(storedSoundFXVolume)
      : 0.5;

    setSoundFXVolume(initialSoundFXVolume);
    audio.volume = initialMusicVolume / 100; // Set initial volume from localStorage

    i18n.changeLanguage(localStorage.getItem("i18nextLng") || "en");

    // Function to check if the user is authenticated by checking cookies
    const checkAuthentication = () => {
      const loggedIn = Cookies.get("loggedIn");
      setIsAuthenticated(loggedIn === "true"); // Set the authentication state based on the cookie
    };

    checkAuthentication(); // Call authentication check on component mount

    // Function to play audio after the first user interaction (click)
    const handleFirstInteraction = () => {
      playAudio(); // Play audio on first interaction
      window.removeEventListener("click", handleFirstInteraction); // Remove the event listener after the first interaction
    };

    window.addEventListener("click", handleFirstInteraction); // Add event listener for first user interaction

    // Cleanup event listener when the component unmounts or the effect reruns
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // If authentication status is still null (loading), show a loading indicator
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  setInterval(async () => {
      if (!isAuthenticated) return;
      const token = getCookie("authToken");

      if (!userId || userId == "") {
          const getIdResponse = await fetch(apiUrl + "/api/users/get-id", {
              headers: {
                  "Authorization": `Bearer ${token}`,
              },
              method: "GET",
              credentials: "include",
          });
          userId = await getIdResponse.text();
          localStorage.setItem("userId", userId);
      }
      await fetch(apiUrl + '/api/users/activity', {
          method: 'POST',
          body: userId,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
          credentials: "include"
      });
    }, 10000);

  return (
    <Router>
      <Routes>
        <Route path="/win-loss" element={<WinLossView />} />
        {/* Public routes */}
        <Route
          path="/"
          element={
            <Home
              setVolume={setVolume}
              setSoundFXVolume={setSoundFX}
              soundFXVolume={soundFXVolume}
            />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/games" replace />
            ) : (
              <LoginPage
                setVolume={setVolume}
                setSoundFXVolume={setSoundFX}
                soundFXVolume={soundFXVolume}
              />
            )
          }
        />
        <Route
          path="/reset-password/*"
          element={
              isAuthenticated ? (
                  <Navigate to="/games" replace />
              ) : (
                  <ResetPasswordPage
                      setVolume={setVolume}
                      setSoundFXVolume={setSoundFX}
                      soundFXVolume={soundFXVolume}
                  />
              )
          }
        />
        <Route
          path="/send-reset-password"
          element={
              isAuthenticated ? (
                  <Navigate to="/games" replace />
              ) : (
                  <ResetPasswordRequestPage
                      setVolume={setVolume}
                      setSoundFXVolume={setSoundFX}
                      soundFXVolume={soundFXVolume}
                  />
              )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/games" replace />
            ) : (
              <RegisterPage
                setVolume={setVolume}
                setSoundFXVolume={setSoundFX}
                soundFXVolume={soundFXVolume}
              />
            )
          }
        />

        {/* Protected routes wrapped with PrivateRoute */}
        <Route
          path="/games"
          element={
            <PrivateRoute
              element={
                <SelectGame
                  setVolume={setVolume}
                  setSoundFXVolume={setSoundFX}
                  soundFXVolume={soundFXVolume}
                />
              }
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/create-game"
          element={
            <PrivateRoute
              element={
                <CreateGame
                  setVolume={setVolume}
                  setSoundFXVolume={setSoundFX}
                  soundFXVolume={soundFXVolume}
                />
              }
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/gameplay"
          element={
            <PrivateRoute
              element={
                <Gameplay
                  setVolume={setVolume}
                  setSoundFXVolume={setSoundFX}
                  soundFXVolume={soundFXVolume}
                />
              }
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/join-game"
          element={
            <PrivateRoute
              element={
                <JoinGame
                  setVolume={setVolume}
                  setSoundFXVolume={setSoundFX}
                  soundFXVolume={soundFXVolume}
                />
              }
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/game-lobby"
          element={
            <PrivateRoute
              element={
                <GameLobby
                  setVolume={setVolume}
                  setSoundFXVolume={setSoundFX}
                  soundFXVolume={soundFXVolume}
                />
              }
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/choose-leader"
          element={
            <PrivateRoute
              element={
                <ChooseLeader
                  setVolume={setVolume}
                  setSoundFXVolume={setSoundFX}
                  soundFXVolume={soundFXVolume}
                />
              }
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/loading"
          element={
            <LoadingPage
              setVolume={setVolume}
              setSoundFXVolume={setSoundFX}
              soundFXVolume={soundFXVolume}
              duration={2}
            />
          }
        />
        <Route
          path="/invite/:gameId"
          element={
            <Invite/>
          }
        />
        {/* Fallback route */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/games" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
