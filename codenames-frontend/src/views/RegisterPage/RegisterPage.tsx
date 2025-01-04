import React, { useState, ChangeEvent, FormEvent } from "react";
import "../../styles/App.css";
import "./RegisterPage.css";

import BackgroundContainer from "../../containers/Background/Background";
import Button from "../../components/Button/Button";
import FormInput from "../../components/FormInput/FormInput";
import settingsImage from "../../assets/icons/settings.png";
//import exitImage from "../../assets/images/exit.png";
import TitleComponent from "../../components/Title/Title";
import MenuContainer from "../../containers/Menu/Menu";
import GameTitleBar from "../../components/GameTitleBar/GameTitleBar.tsx";

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [login, setLogin] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

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
                shadowStyle={{fontSize: "4rem", textAlign: "left", marginLeft: "34%", marginBottom: "0.01%"}}
            >REGISTER</TitleComponent>
            <MenuContainer>
                <div className="register-container">
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
                </div>
            </MenuContainer>
        </BackgroundContainer>
    );
}

export default RegisterPage;

