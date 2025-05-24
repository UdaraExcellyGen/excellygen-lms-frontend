// features/Coordinator/CreateNewCourse/BasicCourseDetails/components/FormSelect.tsx
import React from 'react';

// Interface for options expects { id: string, title: string }
interface SelectOption {
    id: string;
    title: string;
}

interface FormSelectProps {
    label: string;
    name: string; // <<< CONFIRM this exists
    value: string; // This will be the ID
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    error?: boolean;
    errorMessage?: string;
    options: SelectOption[]; // Updated options type
    placeholder?: string; // Optional placeholder text
}

const FormSelect: React.FC<FormSelectProps> = ({
    label,
    name, // <<< Destructure the name prop
    value,
    onChange,
    error,
    errorMessage,
    options,
    placeholder = "Select..." // Default placeholder
}) => {
    return (
        <div>
            <label htmlFor={name} className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">{label}</label> {/* Optional: Use name for htmlFor */}
            <select
                id={name} // Optional: Link label to input
                name={name} // <<< CONFIRM this exists on the select element
                className={`w-full p-2 border ${error ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white`}
                value={value} // Bind to the ID
                onChange={onChange}
                style={{ color: value ? 'white' : '#9ca3af' }} // Style placeholder differently if needed
                aria-invalid={error ? "true" : "false"} // Accessibility improvement
                aria-describedby={error ? `${name}-error` : undefined} // Accessibility
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
                <p id={`${name}-error`} className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{errorMessage}</p> // Accessibility ID
             )}
        </div>
    );
};

export default FormSelect;