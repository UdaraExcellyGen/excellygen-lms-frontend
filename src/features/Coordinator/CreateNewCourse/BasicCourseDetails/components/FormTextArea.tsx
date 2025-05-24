// features/Coordinator/CreateNewCourse/BasicCourseDetails/components/FormTextArea.tsx
import React from 'react';

interface FormTextAreaProps {
    label: string;
    name: string; // <<< ADD THIS LINE
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    error?: boolean;
    errorMessage?: string;
    rows?: number;
}

const FormTextArea: React.FC<FormTextAreaProps> = ({
    label,
    name, // <<< Destructure the name prop
    placeholder,
    value,
    onChange,
    error,
    errorMessage,
    rows = 4
}) => {
    return (
        <div>
            <label htmlFor={name} className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">{label}</label> {/* Optional: Use name for htmlFor */}
            <textarea
                id={name} // Optional: Link label to input
                name={name} // <<< ADD THIS LINE to the textarea element
                placeholder={placeholder}
                rows={rows}
                className={`w-full p-2 border ${error ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white`}
                value={value}
                onChange={onChange}
                style={{ color: 'white' }}
                aria-invalid={error ? "true" : "false"} // Accessibility improvement
                aria-describedby={error ? `${name}-error` : undefined} // Accessibility
            />
            {error && errorMessage && (
                <p id={`${name}-error`} className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{errorMessage}</p> // Accessibility ID
            )}
        </div>
    );
};

export default FormTextArea;