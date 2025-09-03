import React from "react";
import Button from "../Button/Button";
import { apiUrl } from "../../config/api";
import googleIcon from '../../assets/icons/google-icon.svg';

interface GoogleLoginButtonProps {
  soundFXVolume: number;
  style?: React.CSSProperties;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ soundFXVolume }) => {
  return (
    <Button
      variant="google" 
      soundFXVolume={soundFXVolume}
      onClick={() =>
        (window.location.href = `${apiUrl}/oauth2/authorization/google`)
      }
    >
      <img src={googleIcon} alt="Google logo" style={{ width: "2rem", height: "2rem", objectFit: "contain" }} />
    </Button>
  );
};

export default GoogleLoginButton;
