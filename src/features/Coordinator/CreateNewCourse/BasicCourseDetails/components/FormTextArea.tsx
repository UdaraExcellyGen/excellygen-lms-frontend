// features/Coordinator/CreateNewCourse/BasicCourseDetails/components/FormTextArea.tsx
import React from 'react';

interface FormTextAreaProps {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    error?: boolean;
    errorMessage?: string;
    rows?: number;
}

const FormTextArea: React.FC<FormTextAreaProps> = ({
    label,
    placeholder,
    value,
    onChange,
    error,
    errorMessage,
    rows = 4
}) => {
    return (
        <div>
            <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">{label}</label>
            <textarea
                placeholder={placeholder}
                rows={rows}
                className={`w-full p-2 border ${error ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white`}
                value={value}
                onChange={onChange}
                style={{ color: 'white' }}
            />
            {error && errorMessage && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{errorMessage}</p>}
        </div>
    );
};

export default FormTextArea;