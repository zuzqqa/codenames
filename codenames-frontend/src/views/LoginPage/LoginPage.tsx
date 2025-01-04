import React, { useState, ChangeEvent, FormEvent } from "react";
import "../../styles/App.css";
import "./LoginPage.css";

import BackgroundContainer from "../../containers/Background/Background";
import Button from "../../components/Button/Button";
import FormInput from "../../components/FormInput/FormInput";
import MenuContainer from "../../containers/Menu/Menu";
import TitleComponent from "../../components/Title/Title";
import settingsImage from "../../assets/icons/settings.png";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar.tsx";
//import exitImage from "../../assets/icons/exit.png";

const LoginPage: React.FC = () => {
    const [login, setLogin] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLogin(e.target.value);
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Add your login logic here
        console.log("Login:", login);
        console.log("Password:", password);
    };

    return (
        <BackgroundContainer>
            <GameTitleBar />
            <Button variant="circle">
                <img src={settingsImage} alt="Settings"/>
            </Button>
            <TitleComponent
                customStyle={{ fontSize: "4rem", textAlign: "left", marginLeft: "34%", marginBottom: "0.01%" }}
                shadowStyle={{ fontSize: "4rem", textAlign: "left", marginLeft: "34%", marginBottom: "0.01%" }}
            >LOGIN</TitleComponent>
            <MenuContainer>
                <div className="login-container">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <FormInput
                            type="text"
                            placeholder="LOGIN"
                            value={login}
                            onChange={handleLoginChange}
                        />
                        <FormInput
                            type="password"
                            placeholder="PASSWORD"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                        <Button type="submit" variant="primary">
                            <span className="button-text">SUBMIT</span>
                        </Button>
                    </form>
                </div>
            </MenuContainer>
        </BackgroundContainer>
    );
}

export default LoginPage;

