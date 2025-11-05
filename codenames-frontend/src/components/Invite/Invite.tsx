import {useNavigate, useParams} from "react-router-dom";

interface InviteProps {

}

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BackgroundContainer from "../../containers/Background/Background.tsx";

const Invite: React.FC<InviteProps> = () => {
    const { t } = useTranslation();
    const { gameId } = useParams<{ gameId: string }>();
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (gameId) {
            sessionStorage.setItem("gameId", gameId);
            navigate("/loading");
        }
    }, [gameId]);

    return (
        <BackgroundContainer>
        <div className="invite-container">
            Invitation
        </div>
        </BackgroundContainer>
    );
}

export default Invite;