import { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import TitleModal from "../TitleModal/TitleModal";
import closeIcon from "../../assets/icons/close.png";
import checkmarkIcon from "../../assets/icons/check.png";
import Button from "../Button/Button";
import { useTranslation } from "react-i18next";
import arrow from "../../assets/icons/arrow.svg";
import editIcon from "../../assets/icons/edit.svg";
import friendsIcon from "../../assets/icons/friends.png";
import friendsIconPicked from "../../assets/icons/friends-picked.png";
import friendRequestsIcon from "../../assets/icons/friends-requests.png";
import friendRequestsIconPicked from "../../assets/icons/friends-requests-picked.png";
import removeRequestsIcon from "../../assets/icons/remove-request.png";
import searchIcon from "../../assets/icons/search-icon.png";
import searchIconPicked from "../../assets/icons/search-picked.png";
import moreIcon from "../../assets/icons/more-icon.png";
import trashIcon from "../../assets/icons/trash.png";
import useFriendRequestsWebSocket from "./useFriendRequestsWebSocket.tsx"
import "./ProfileModal.css";

interface ProfileModalProps {
  soundFXVolume: number;
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  username: string;
  email: string;
  description: string;
  profilePic: number;
  friends: string[];
  invitations: string[];
}

const availableProfilePics = [0, 1, 2, 3, 4];

const ProfileModal: React.FC<ProfileModalProps> = ({ soundFXVolume, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editedUsername, setEditedUsername] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicIndex, setProfilePicIndex] = useState(0);
  const [profilePic, setProfilePic] = useState<string>("../../assets/images/profile-pic-default.png");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"friends" | "invitations" | "search">("friends");

  const { friends, sentRequests, receivedRequests, sendFriendRequest, removeFriend, acceptFriendRequest, declineFriendRequest, undoFriendRequest } = useFriendRequestsWebSocket(currentUser?.username || "");

  const tabIcons = {
    friends: { default: friendsIcon, picked: friendsIconPicked },
    invitations: { default: friendRequestsIcon, picked: friendRequestsIconPicked },
    search: { default: searchIcon, picked: searchIconPicked },
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const getIdResponse = await fetch("http://localhost:8080/api/users/getId", {
          method: "GET",
          credentials: "include",
        });
        const id = await getIdResponse.text();

        const userResponse = await fetch(`http://localhost:8080/api/users/${id}`, {
          method: "GET",
          credentials: "include",
        });

        if (userResponse.ok) {
          const userData: User = await userResponse.json();
          setCurrentUser(userData);
          setEditedUsername(userData.username);
          setEditedEmail(userData.email);
          setEditedDescription(userData.description);

          const picIndex = availableProfilePics.indexOf(userData.profilePic);
          setProfilePicIndex(picIndex !== -1 ? picIndex : 0);

          loadProfilePic(userData.profilePic);
        } else {
          console.error("Cannot fetch user data");
        }
      } catch (error) {
        console.error("Error while fetching user data", error);
      }
    };

    if (isOpen) {
      fetchCurrentUser();
    }
  }, [isOpen]);

  const loadProfilePic = async (profilePicId: number) => {
    try {
      const image = await import(`../../assets/images/profile-pic-${profilePicId}.png`);
      setProfilePic(image.default);
    } catch (error) {
      console.error("Image not found, using default", error);
      setProfilePic("../../assets/images/profile-pic-default.png");
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    const selectedProfilePic = availableProfilePics[profilePicIndex];

    try {
      const response = await fetch(`http://localhost:8080/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: currentUser.id,
          username: editedUsername,
          email: editedEmail,
          description: editedDescription,
          profilePic: selectedProfilePic
        }),
      });

      if (response.ok) {
        setCurrentUser({ ...currentUser, username: editedUsername, email: editedEmail, description:editedDescription, profilePic: selectedProfilePic });
        setIsEditing(false);
        loadProfilePic(selectedProfilePic);
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error while updating user", error);
    }
  };

  const handleNextProfilePic = () => {
    const newIndex = (profilePicIndex + 1) % availableProfilePics.length;
    setProfilePicIndex(newIndex);
    loadProfilePic(availableProfilePics[newIndex]);
  };

  const handlePrevProfilePic = () => {
    const newIndex = (profilePicIndex - 1 + availableProfilePics.length) % availableProfilePics.length;
    setProfilePicIndex(newIndex);
    loadProfilePic(availableProfilePics[newIndex]);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/search?username=${searchQuery}`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data: User[] = await response.json();
        setSearchResults(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error while searching users", error);
    }
  };
  

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="large">
      <TitleModal variant="small">{t("profile-title")}</TitleModal>
      <Button variant="circle" soundFXVolume={soundFXVolume}>
        <img className="close-icon" src={closeIcon} onClick={onClose} alt="Close" />
      </Button>
      <div className="profile-modal-wrapper">
          {isEditing ? (
            <>
              <div className="profile-modal-content">
                <div className="user-details-container">
                  <div className="first-col">
                    <div className="profile-pic-selector">
                      <button onClick={handlePrevProfilePic} className="arrow-button pic-arrow">
                        <img src={arrow} alt="Previous" className="reverse-image" />
                      </button>
                      <img className="user-profile-pic" src={profilePic} alt="Profile" />
                      <button onClick={handleNextProfilePic} className="arrow-button pic-arrow">
                        <img src={arrow} alt="Next" />
                      </button>
                    </div>
                    <p className="gold-text username">{currentUser ? currentUser.username : t("unknown user")}</p>
                  </div>
                  <div className="sec-col">
                    <p className="gold-text">{t("email")}: {currentUser ? currentUser.email : t("unknown user")}</p>
                    <div>
                      <label className="gold-text">{t("description")}:<br /></label>
                      <textarea
                        className="description-textarea gold-text"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                      />
                    </div>
                    <Button className="edit-button" variant="edit" soundFXVolume={soundFXVolume} onClick={() => setIsEditing(!isEditing)}>
                      <img src={editIcon} alt="Profile" />
                    </Button>
                    <Button variant="navy-blue" className="save-btn" soundFXVolume={soundFXVolume} onClick={handleSave}>
                      <span className="gold-text">{t("save")}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="profile-modal-content">
                <div className="user-details-container">
                  <div className="first-col">
                    <img className="user-profile-pic" src={profilePic} alt="Profile" />
                    <p className="gold-text username">{currentUser ? currentUser.username : t("unknown user")}</p>
                  </div>
                  <div className="sec-col">
                    <p className="gold-text">{t("email")}: {currentUser ? currentUser.email : t("unknown user")}</p>
                    <p className="gold-text">{t("description")}:</p>
                    <div className="gold-text">{currentUser ? currentUser.description : t("unknown user")}</div>
                  </div>
                  <Button className="edit-button" variant="edit" soundFXVolume={soundFXVolume} onClick={() => setIsEditing(!isEditing)}>
                    <img src={editIcon} alt="Profile" />
                  </Button>
                </div>
              </div>
            </>
          )}

        <div className="profile-modal-content">
        <div className="tabs">
          <Button variant="transparent" soundFXVolume={soundFXVolume} onClick={() => setActiveTab("friends")}>
            <img src={activeTab === "friends" ? tabIcons.friends.picked : tabIcons.friends.default} alt="Friends" />
          </Button>
          <Button variant="transparent" soundFXVolume={soundFXVolume} onClick={() => setActiveTab("invitations")}>
            <img src={activeTab === "invitations" ? tabIcons.invitations.picked : tabIcons.invitations.default} alt="Friend Requests" />
          </Button>
          <Button variant="transparent" soundFXVolume={soundFXVolume} onClick={() => setActiveTab("search")}>
            <img src={activeTab === "search" ? tabIcons.search.picked : tabIcons.search.default} alt="Search" />
          </Button>
        </div>

          {activeTab === "search" && (
          <div className="tabs-item">
            <div className="search-container ">
              <input
                type="text"
                placeholder={t("find friends...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyUp={handleSearch}
              />
            </div>
            {searchResults.length > 0 && searchQuery.length > 0 && (
              <div className="search-results">
                <ul>
                {searchResults
                .filter((user) => user.username !== currentUser?.username)
                .slice(0, 3)
                .map((user) => (
                    <li key={user.id} className="search-result-item">
                      <p className="username">{user.username}</p>

                      <Button
                        variant="transparent"
                        soundFXVolume={soundFXVolume}
                        onClick={() =>
                          friends.includes(user.username)
                            ? console.log("Already friends")
                            : sentRequests.includes(user.username)
                            ? undoFriendRequest(user.username)
                            : receivedRequests.includes(user.username)
                            ? acceptFriendRequest(user.username)
                            : sendFriendRequest(user.username)
                        }
                      >
                        <img
                          src={
                            friends.includes(user.username)
                              ? moreIcon
                              : sentRequests.includes(user.username)
                              ? removeRequestsIcon
                              : receivedRequests.includes(user.username)
                              ? checkmarkIcon
                              : friendRequestsIcon
                          }
                          alt="Friend request action"
                        />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          )}

          {activeTab === "friends" && (
          <div className="friends-list gold-text tabs-item">
          {friends.length > 0 && (
          <div className="search-results">
            <ul>
              {friends.map((friendId) => (
                <li key={friendId}>
                  <p className="username">{friendId}</p>
                  <Button
                    variant="transparent"
                    soundFXVolume={soundFXVolume}
                    onClick={() => removeFriend(friendId)}
                  >
                    <img src={trashIcon} alt="deleteIcon" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>
        )}

        {activeTab === "invitations" && (
          <div className="friend-invitations gold-text tabs-item">
          {receivedRequests.length > 0 && (
            <div className="search-results">
              <ul>
                {receivedRequests.map((senderId) => (
                  <li key={senderId} className="search-result-item">
                    <p className="username">{senderId}</p>
                    <div>
                      <Button
                        variant="transparent"
                        soundFXVolume={soundFXVolume}
                        onClick={() => acceptFriendRequest(senderId)}
                      >
                        <img src={checkmarkIcon} alt="acceptIcon" />
                      </Button>
                      <Button
                        variant="transparent"
                        soundFXVolume={soundFXVolume}
                        onClick={() => declineFriendRequest(senderId)}
                      >
                        <img src={closeIcon} alt="rejectIcon" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          </div>
        )}

        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
