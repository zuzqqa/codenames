import { BrowserRouter as Router, Navigate, Route, Routes, } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

import soundFile from "./assets/sounds/background-music.mp3";

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
import { getCookie } from "./shared/utils.tsx";
import AuthCallback from "./shared/authCallback.tsx";

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

  const setVolume = (volume: number) => {
    audio.volume = volume / 100;
    localStorage.setItem("musicVolume", volume.toString());
  };

  const setSoundFX = (volume: number) => {
    setSoundFXVolume(volume);
    localStorage.setItem("soundFXVolume", volume.toString());
  };

  useEffect(() => {
    const initialMusicVolume = storedMusicVolume
      ? parseFloat(storedMusicVolume)
      : 0.5;
    const initialSoundFXVolume = storedSoundFXVolume
      ? parseInt(storedSoundFXVolume)
      : 0.5;

    setSoundFXVolume(initialSoundFXVolume);
    audio.volume = initialMusicVolume / 100;

    i18n.changeLanguage(localStorage.getItem("i18nextLng") || "en");

    const checkAuthentication = () => {
      const loggedIn = Cookies.get("loggedIn");
      setIsAuthenticated(loggedIn === "true");
    };

    checkAuthentication();

    const handleFirstInteraction = () => {
      playAudio();
      window.removeEventListener("click", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
    };
  }, []);

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
  }, 1000 * 60 * 15);

  return (
    <Router>
      <Routes>
        <Route path="/win-loss" element={<WinLossView/>}/>
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
              <Navigate to="/games" replace/>
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
            <ResetPasswordPage
              setVolume={setVolume}
              setSoundFXVolume={setSoundFX}
              soundFXVolume={soundFXVolume}
            />
          }
        />
        <Route
          path="/send-reset-password"
          element={
            isAuthenticated ? (
              <Navigate to="/games" replace/>
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
              <Navigate to="/games" replace/>
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
        <Route path="/invite/:gameId" element={<Invite/>}/>
        {/* Fallback route */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/games" replace/>
            ) : (
              <Navigate to="/" replace/>
            )
          }
        />
        <Route
          path="/auth/callback"
          element={
            <AuthCallback
              setVolume={setVolume}
              setSoundFXVolume={setSoundFX}
              soundFXVolume={soundFXVolume}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

