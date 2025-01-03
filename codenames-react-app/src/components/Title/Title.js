import React, {useState} from "react";

import "./Title.css";

import soundFile from "../../assets/sounds/cinematic-hit-159487.mp3";

function TitleComponent({children, customStyle, shadowStyle}) {
    const [audio] = useState(new Audio(soundFile));

    const playHitSound = () => {
        audio.volume = 0.3;
        audio.play();
    };

    const handleAnimationStart = () => {
        playHitSound();
    };

    return (
        <div className="title-container">
            <h1 className="title" style={customStyle} onAnimationStart={handleAnimationStart}>
                {children}
            </h1>

            <h1 className="title-shadow" style={shadowStyle}>{children}</h1>
        </div>
    );
}

export default TitleComponent;
