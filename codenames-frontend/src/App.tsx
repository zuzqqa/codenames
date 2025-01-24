import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // Importing React Router components
import React, { useEffect, useState } from "react"; // Importing React hooks
import Cookies from "js-cookie"; // Importing cookie management library
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
import PrivateRoute from "./utils/PrivateRoute"; // Importing PrivateRoute for protecting routes
import LoadingPage from "./views/Loading/LoadingPage";

const App: React.FC = () => {
  // State hooks for managing authentication, sound settings, and audio state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Authentication state (null means not yet checked)
  const [soundFXVolume, setSoundFXVolume] = useState(50); // Sound effects volume state
  const [audio] = useState(new Audio(soundFile)); // Audio element for background music
  const [isPlaying, setIsPlaying] = useState(false); // State to track if music is playing

  // Function to play background audio if it's not already playing
  const playAudio = () => {
    if (!isPlaying) {
      audio.loop = true; // Loop the background music
      audio.play().then(); // Play the audio
      setIsPlaying(true); // Update state to indicate the music is playing
    }
  };

  // Function to set the background music volume
  const setVolume = (volume: number) => {
    audio.volume = volume; // Adjust the background music volume
  };

  // Function to set the sound effects volume
  const setSoundFX = (volume: number) => {
    setSoundFXVolume(volume); // Adjust the sound effects volume
  };

  // useEffect hook to check authentication and handle audio setup
  useEffect(() => {
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

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home setVolume={setVolume} setSoundFXVolume={setSoundFX} soundFXVolume={soundFXVolume} />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/loading" replace /> : <LoginPage setVolume={setVolume} setSoundFXVolume={setSoundFX} soundFXVolume={soundFXVolume} />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/loading" replace /> : <RegisterPage setVolume={setVolume} setSoundFXVolume={setSoundFX} soundFXVolume={soundFXVolume} />}
        />

        {/* Protected routes wrapped with PrivateRoute */}
        <Route
          path="/games"
          element={
            <PrivateRoute
              element={<SelectGame setVolume={setVolume} setSoundFXVolume={setSoundFX} soundFXVolume={soundFXVolume} />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/create-game"
          element={
            <PrivateRoute
              element={<CreateGame setVolume={setVolume} setSoundFXVolume={setSoundFX} soundFXVolume={soundFXVolume} />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/gameplay"
          element={
            <PrivateRoute
              element={<Gameplay setVolume={setVolume} setSoundFXVolume={setSoundFX} soundFXVolume={soundFXVolume} />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/join-game"
          element={
            <PrivateRoute
              element={<JoinGame setVolume={setVolume} setSoundFXVolume={setSoundFX} soundFXVolume={soundFXVolume} />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/game-lobby"
          element={
            <PrivateRoute
              element={<GameLobby setVolume={setVolume} setSoundFXVolume={setSoundFX} soundFXVolume={soundFXVolume} />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/choose-leader"
          element={
            <PrivateRoute
              element={<ChooseLeader setVolume={setVolume} setSoundFXVolume={setSoundFX} soundFXVolume={soundFXVolume} />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route path="/loading" element={<LoadingPage setVolume={setVolume} setSoundFXVolume={setSoundFX} soundFXVolume={soundFXVolume}/>} />
        {/* Fallback route */}
        <Route
          path="*"
          element={
            isAuthenticated ? <Navigate to="/games" replace /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
