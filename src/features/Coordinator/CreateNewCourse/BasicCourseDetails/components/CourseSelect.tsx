
import React, { ChangeEvent } from 'react';

interface CourseSelectProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: boolean;
  errorMessage?: string;
  options: string[];
}

export const CourseSelect: React.FC<CourseSelectProps> = ({
  label,
  value,
  onChange,
  error = false,
  errorMessage,
  options
}) => {
  return (
    <div>
      <label className="block text-[15px] text-[#ffffff] mb-2 font-['Nunito_Sans']">{label}</label>
      <select
        className={`w-full p-2 border ${error ? 'border-red-500' : 'border-[#1B0A3F]/60'} rounded-lg focus:outline-none focus:border-[#BF4BF6] font-['Nunito_Sans'] bg-[#1B0A3F]/60 text-white`}
        value={value}
        onChange={onChange}
        style={{ color: 'white' }}
      >
        <option value="">Select Category</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {error && errorMessage && <p className="text-red-500 text-sm mt-1 font-['Nunito_Sans']">{errorMessage}</p>}
    </div>
  );
};