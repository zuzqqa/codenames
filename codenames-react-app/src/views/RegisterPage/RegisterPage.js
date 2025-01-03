import React, { useState } from "react";
import "../../styles/App.css";
import "./RegisterPage.css";

import BackgroundContainer from "../../containers/Background/Background";
import Button from "../../components/Button/Button";
import FormInput from "../../components/FormInput/FormInput";
import settingsImage from "../../assets/images/settings.png";
import exitImage from "../../assets/images/exit.png";
import TitleComponent from "../../components/Title/Title";
import MenuContainer from "../../containers/Menu/Menu";
import {useNavigate} from "react-router-dom";

function RegisterPage() {
    const [email, setEmail] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const handleLoginChange = (e) => {
        setLogin(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const navigateHome = () => {
        navigate("/");
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your login logic here
        console.log("Login:", login);
        console.log("Password:", password);
    };

    return (
        <BackgroundContainer>
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
            >REGISTER</TitleComponent>
            <MenuContainer className="register-container">
                <form className="register-form" onSubmit={handleSubmit}>
                    <FormInput
                        type="text"
                        placeholder="EMAIL"
                        value={email}
                        onChange={handleEmailChange}
                    />
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

export default RegisterPage;
