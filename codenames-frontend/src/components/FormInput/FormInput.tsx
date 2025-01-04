import React from "react";
import "./FormInput.css";

interface FormInputProps {
    type: string;
    placeholder: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
}

const FormInput: React.FC<FormInputProps> = ({ type, placeholder, value, onChange, label }) => {
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
        </div>
    );
}

export default FormInput;

