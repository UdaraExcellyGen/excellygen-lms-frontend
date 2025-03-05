
import React, { ChangeEvent } from 'react';

interface CourseTextAreaProps {
  label: string;
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  error?: boolean;
  errorMessage?: string;
}

export const CourseTextArea: React.FC<CourseTextAreaProps> = ({
  label,
  placeholder,
  rows = 4,
  value,
  onChange,
  error = false,
  errorMessage
}) => {
  return (
    <div>
      <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans'] ">{label}</label>
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