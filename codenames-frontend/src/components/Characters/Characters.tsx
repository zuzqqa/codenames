import "./Characters.css";

import characterImage from "../../assets/images/characters.png";

/**
 * CharactersComponent displays a character image inside a styled container.
 * @returns {JSX.Element} A div containing the character image.
 */
function CharactersComponent() {
  return (
    <div className="characters-container">
      <img src={characterImage} alt="character" className="characters"/>
    </div>
  );
}

export default CharactersComponent;