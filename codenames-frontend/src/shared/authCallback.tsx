import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingPage from "../views/Loading/LoadingPage";

interface AuthCallbackProps {
  setVolume: (volume: number) => void;
  soundFXVolume: number;
  setSoundFXVolume: (volume: number) => void;
  style?: React.CSSProperties;
}

export default function AuthCallback({
  setVolume,
  soundFXVolume,
  setSoundFXVolume,
}: AuthCallbackProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      document.cookie = `authToken=${token}; max-age=36000; path=/; secure; samesite=none`;
      document.cookie = `loggedIn=true; max-age=36000; path=/; secure; samesite=none`;
      window.location.href = "/games";
    }
  }, [navigate]);

  return (
    <LoadingPage
      setVolume={setVolume}
      soundFXVolume={soundFXVolume}
      setSoundFXVolume={setSoundFXVolume}
    />
  );
}
