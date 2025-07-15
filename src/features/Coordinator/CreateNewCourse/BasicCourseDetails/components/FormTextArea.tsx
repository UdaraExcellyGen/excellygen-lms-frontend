// features/Coordinator/CreateNewCourse/BasicCourseDetails/components/FormTextArea.tsx
import React from 'react';

interface FormTextAreaProps {
    label: string;
    name: string; 
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    error?: boolean;
    errorMessage?: string;
    rows?: number;
}

const FormTextArea: React.FC<FormTextAreaProps> = ({
    label,
    name, 
    placeholder,
    value,
    onChange,
    error,
    errorMessage,
    rows = 4
}) => {
    return (
        <div>
            <label htmlFor={name} className="block text-[15px] text-[#1B0A3F] mb-2 font-['Nunito_Sans']">{label}</label> 
            <textarea
                id={name} 
                name={name} 
                placeholder={placeholder}
                rows={rows}
                className={`w-full p-2 border-2 ${error ? 'border-red-500' : 'border-[#52007C]'} rounded-lg focus:outline-none focus:border-gray-400 font-['Nunito_Sans'] bg-white/90 text-[#1B0A3F]`}
                value={value}
                onChange={onChange}
                style={{ color: '[#1B0A3F]' }}
                aria-invalid={error ? "true" : "false"} 
                aria-describedby={error ? `${name}-error` : undefined}
            />
            {error && errorMessage && (
                <p id={`${name}-error`} className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{errorMessage}</p>
            )}
        </div>
    );
};

export default FormTextArea;