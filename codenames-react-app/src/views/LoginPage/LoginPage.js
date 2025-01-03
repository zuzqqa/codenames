import React, { useState } from "react";
import "../../styles/App.css";
import "./LoginPage.css";

import BackgroundContainer from "../../containers/Background/Background";
import Button from "../../components/Button/Button";
import FormInput from "../../components/FormInput/FormInput";
import MenuContainer from "../../containers/Menu/Menu";
import TitleComponent from "../../components/Title/Title";
import settingsImage from "../../assets/images/settings.png";
import exitImage from "../../assets/images/exit.png";
import {useNavigate} from "react-router-dom";

function LoginPage() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        setLogin(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your login logic here
        console.log("Login:", login);
        console.log("Password:", password);
    };

    const navigateHome = () => {
        navigate("/");
    }

    return (
        <BackgroundContainer className="login-page">
            <Button variant="settings">
                <img src={settingsImage} alt="Settings"/>
            </Button>
            <Button variant="header" onClick={navigateHome}>
                <span className="button-text">CODENAMES</span>
            </Button>
            <Button variant="exit">
                <img src={exitImage} alt="Exit"/>
            </Button>
            <TitleComponent
                            customStyle={{ fontSize: "4rem", textAlign: "left", marginLeft: "34%", marginBottom: "0.01%" }}
                            shadowStyle={{fontSize: "4rem", textAlign: "left", marginLeft: "34%", marginBottom: "0.01%"}}
            >LOGIN</TitleComponent>
            <MenuContainer className="login-container">
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
            </MenuContainer>
        </BackgroundContainer>
    );
}

export default LoginPage;
