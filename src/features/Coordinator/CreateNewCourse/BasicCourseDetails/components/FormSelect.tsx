import React from 'react';

// Interface for options expects 
interface SelectOption {
    id: string;
    title: string;
}

interface FormSelectProps {
    label: string;
    name: string; 
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    error?: boolean;
    errorMessage?: string;
    options: SelectOption[]; 
    placeholder?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
    label,
    name, 
    value,
    onChange,
    error,
    errorMessage,
    options,
    placeholder = "Select..." 
}) => {
    return (
        <div>
            <label htmlFor={name} className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">{label}</label> 
            <select
                id={name} 
                name={name} 
                className={`w-full p-2 border ${error ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white`}
                value={value} 
                onChange={onChange}
                style={{ color: value ? 'white' : '#9ca3af' }} 
                aria-invalid={error ? "true" : "false"} 
                aria-describedby={error ? `${name}-error` : undefined} 
            >
                 {/* Use the placeholder */}
                 <option value="" disabled hidden={value !== ""}>
                    {placeholder}
                </option>
                 {/* Map over the options using id and title */}
                 {options.map(option => (
                    <option key={option.id} value={option.id}>{option.title}</option>
                ))}
            </select>
             {error && errorMessage && (
                <p id={`${name}-error`} className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{errorMessage}</p> 
             )}
        </div>
    );
};

export default FormSelect;