import React from 'react';

interface OptionItemProps {
    id: string;
    name: string;
    value: string;
    label: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    checked?: boolean;
    isCorrectAnswer?: boolean;
    isIncorrectAnswer?: boolean;
}

const OptionItem: React.FC<OptionItemProps> = ({ id, name, value, label, onChange, checked, isCorrectAnswer, isIncorrectAnswer }) => {
    let labelClassName = "text-gray-700 text-base";
    let itemClassName = "option-item mb-3 p-2 rounded hover:bg-indigo-50";
    if (isCorrectAnswer) {
        labelClassName = "text-green-600 font-bold text-base";
        itemClassName = "option-item mb-3 p-2 rounded bg-green-100 border border-green-200";
    } else if (isIncorrectAnswer) {
        labelClassName = "text-red-600 line-through text-base";
        itemClassName = "option-item mb-3 p-2 rounded bg-red-100 border border-red-200";
    }

    return (
        <div className={itemClassName}>
            <input
                type="radio"
                id={id}
                name={name}
                value={value}
                className="mr-3 text-indigo-500 focus:ring-indigo-500 h-5 w-5 border-gray-300 focus:border-indigo-500"
                onChange={onChange}
                checked={checked}
                disabled={isCorrectAnswer || isIncorrectAnswer}
            />
            <label htmlFor={id} className={labelClassName}>{label}</label>
        </div>
    );
};

export default OptionItem;