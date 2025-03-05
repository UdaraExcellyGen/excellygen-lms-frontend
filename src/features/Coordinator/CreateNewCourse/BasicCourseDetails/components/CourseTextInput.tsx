
import React, { ChangeEvent } from 'react';

interface CourseTextInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  errorMessage?: string;
  type?: string;
}

export const CourseTextInput: React.FC<CourseTextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error = false,
  errorMessage,
  type = "text"
}) => {
  return (
    <div>
      <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full p-2 border ${error ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white`}
        value={value}
        onChange={onChange}
        style={{ color: 'white' }}
      />
      {error && errorMessage && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{errorMessage}</p>}
    </div>
  );
};