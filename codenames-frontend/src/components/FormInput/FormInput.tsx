import React from "react";
import "./FormInput.css";

/**
 * Props interface for FormInput component.
 */
interface FormInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  button?: React.ReactNode;
}

/**
 * A reusable form input component.
 *
 * @component
 * @param {FormInputProps} props - The component props
 * @returns {JSX.Element} The rendered input field component
 */
const FormInput: React.FC<FormInputProps> = ({
                                               type,
                                               placeholder,
                                               value,
                                               onChange,
                                               label,
                                               button,
                                             }) => {
  return (
    <div className="input-container">
      {/* Render label if provided */}
      {label && <label className="input-label">{label}</label>}

      {/* Main input field */}
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />

      {/* Render button if provided */}
      {button != null ? button : null}
    </div>
  );
};

export default FormInput;
