import React from "react";
import "./FormInput.css";

function FormInput({ type, placeholder, value, onChange, label }) {
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
