import "./Characters.css";

import characterImage from "../../assets/images/characters.png";

function CharactersComponent() {
    return (
        <div className="characters-container">
            <img src={characterImage} alt="character" className="characters" />
        </div>
    );
}

export default CharactersComponent;