import React, { useState } from 'react';
import { X, Copy, Check, Info, Eye, EyeOff } from 'lucide-react';

interface TempPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  tempPassword: string;
}

const TempPasswordDialog: React.FC<TempPasswordDialogProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  tempPassword
}) => {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleCopyClick = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-md animate-scaleIn shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl text-[#1B0A3F] font-['Unbounded']">
            Temporary Password Generated
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#BF4BF6] transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6 text-gray-700">
          <p>A temporary password has been generated for:</p>
          <div className="p-4 bg-gray-50 rounded-lg mt-3">
            <p className="font-semibold">{userName}</p>
            <p className="text-gray-600">{userEmail}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temporary Password
          </label>
          <div className="flex items-center">
            <div className="relative flex-grow">
              <input
                type={showPassword ? "text" : "password"}
                value={tempPassword}
                readOnly
                className="w-full border border-gray-300 rounded-l-lg p-2 bg-gray-50 focus:ring-2 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            <button
              onClick={handleCopyClick}
              className={`px-4 py-2 rounded-r-lg flex items-center gap-1 ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-[#BF4BF6] text-white hover:bg-[#7A00B8]'
              } transition-colors duration-200`}
            >
              {copied ? (
                <>
                  <Check size={18} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 mb-6">
          <div className="flex-shrink-0 mt-0.5">
            <Info size={20} />
          </div>
          <div>
            <p className="font-medium">Important:</p>
            <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
              <li>This password is temporary and will only be shown once.</li>
              <li>The user will be required to change it upon first login.</li>
              <li>Please securely share this password with the user.</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#BF4BF6] text-white rounded-full font-['Nunito_Sans'] 
                     hover:bg-[#7A00B8] transition-all duration-300 flex items-center gap-2"
          >
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TempPasswordDialog;