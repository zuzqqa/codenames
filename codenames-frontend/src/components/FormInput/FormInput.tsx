import React from "react";
import "./FormInput.css";

interface FormInputProps {
    type: string;
    placeholder: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    button?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({type, placeholder, value, onChange, label, button }) => {
    return (
        <div className="input-container">
            {label && <label className="input-label">{label}</label>}
            <input
                type={type}
                className="input-field"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            {button != null ? button : null}
        </div>
    );
}

export default FormInput;

