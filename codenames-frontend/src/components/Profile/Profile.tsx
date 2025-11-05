import React, {useEffect, useState} from "react";
import {apiUrl} from "../../config/api.tsx";
import Button from "../Button/Button.tsx";
import profileIcon from "../../assets/icons/profile.png";
import {getCookie} from "../../shared/utils.tsx";
import ProfileModal from "../UserProfileOverlay/ProfileModal.tsx";

interface ProfileProps {
  soundFXVolume: number;
}

const Profile: React.FC<ProfileProps> = ({ soundFXVolume }) => {

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const toggleProfile = () => {
    setIsProfileOpen(prev => !prev);
  };

  useEffect(() => {
    const fetchGuestStatus = async () => {
      const token = getCookie("authToken");

      if (!token) {
        // if there is no token treat as guest (or keep as null) — we choose guest
        setIsGuest(true);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/users/is-guest`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const guestStatus = await response.json();
          setIsGuest(!!guestStatus);
        } else {
          console.error("Failed to retrieve guest status.");
          setIsGuest(true);
        }
      } catch (error) {
        console.error("Error retrieving guest status: ", error);
        setIsGuest(true);
      }
    };

    fetchGuestStatus();
  }, []);

  // While we don't know guest status render nothing
  if (isGuest === null) return null;

  return (
    <>
      {!isGuest && (
        <Button variant="circle-profile" soundFXVolume={soundFXVolume} onClick={toggleProfile}>
          <img src={profileIcon} alt="Profile" />
        </Button>
      )}

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={toggleProfile}
        soundFXVolume={soundFXVolume}
      />
    </>
  );
}

export default Profile;