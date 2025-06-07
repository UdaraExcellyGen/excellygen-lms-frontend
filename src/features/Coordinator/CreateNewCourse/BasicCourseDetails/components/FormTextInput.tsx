// features/Coordinator/CreateNewCourse/BasicCourseDetails/components/FormTextInput.tsx
import React from 'react';

interface FormTextInputProps {
    label: string;
    name: string; 
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: boolean;
    errorMessage?: string;
    type?: string;
}

const FormTextInput: React.FC<FormTextInputProps> = ({
    label,
    name, 
    placeholder,
    value,
    onChange,
    error,
    errorMessage,
    type = "text"
}) => {
    return (
        <div>
            <label htmlFor={name} className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">{label}</label> 
            <input
                id={name} 
                type={type}
                name={name}
                placeholder={placeholder}
                className={`w-full p-2 border ${error ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white`}
                value={value}
                onChange={onChange}
                style={{ color: 'white' }}
                aria-invalid={error ? "true" : "false"} 
                aria-describedby={error ? `${name}-error` : undefined} 
            />
            {error && errorMessage && (
                <p id={`${name}-error`} className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{errorMessage}</p> 
            )}
        </div>
    );
};

export default FormTextInput;