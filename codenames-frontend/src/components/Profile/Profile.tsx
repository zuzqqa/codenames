//TODO: comment the code
import React, { useEffect, useState } from "react";
import Button from "../Button/Button.tsx";
import profileIcon from "../../assets/icons/profile.png";
import ProfileModal from "../UserProfileOverlay/ProfileModal.tsx";
import { getGuestStatus } from "../../api/userApi.tsx";

interface ProfileProps {
  soundFXVolume: number;
}

const Profile: React.FC<ProfileProps> = ({ soundFXVolume }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchGuestStatus = async () => {
      const guest = await getGuestStatus();
      setIsGuest(guest);
    };

    fetchGuestStatus();
  }, []);

  if (isGuest === null) return null;

  return (
    <>
      {!isGuest && (
        <Button
          variant="circle-profile"
          soundFXVolume={soundFXVolume}
          onClick={toggleProfile}
        >
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
};

export default Profile;
