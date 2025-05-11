import React, { useState } from 'react';
import { X, Copy, CheckCircle, Mail } from 'lucide-react';
import { sendTemporaryPasswordEmail } from '../../../../api/authApi';

interface TempPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  tempPassword: string;
  userId?: string; // Added userId for email functionality
}

const TempPasswordDialog: React.FC<TempPasswordDialogProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  tempPassword,
  userId = '' // Default to empty string if not provided
}) => {
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState('');

  if (!isOpen) return null;

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendEmail = async () => {
    if (!userEmail || !tempPassword) return;

    try {
      setSending(true);
      setEmailError('');
      
      // Call API to send email
      await sendTemporaryPasswordEmail({
        userId: userId,
        email: userEmail,
        tempPassword: tempPassword
      });
      
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    } catch (error) {
      console.error('Error sending temporary password email:', error);
      setEmailError('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-fadeIn">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-medium text-[#1B0A3F] font-['Unbounded']">
            Temporary Password
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-gray-600 mb-4">
            A temporary password has been generated for <span className="font-semibold">{userName}</span>. 
            The user will be required to change this password on first login.
          </p>
          
          <div className="relative">
            <div className="border border-gray-300 bg-gray-50 rounded-lg p-4 mb-6 pr-12 font-mono text-lg">
              {tempPassword}
              <button 
                onClick={handleCopyPassword} 
                className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-200"
                title="Copy to clipboard"
              >
                {copied ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} className="text-gray-500" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-green-600 text-sm -mt-4 mb-4">
                Password copied to clipboard!
              </p>
            )}
          </div>
          
          {/* Email button */}
          <div className="mb-6">
            <button
              onClick={handleSendEmail}
              disabled={sending || emailSent || !userId} 
              className={`flex items-center justify-center gap-2 w-full rounded-lg py-3 px-4 font-medium transition-colors
                ${emailSent 
                  ? 'bg-green-100 text-green-800 cursor-default' 
                  : !userId
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : sending 
                    ? 'bg-[#F6E6FF] text-[#BF4BF6] cursor-wait' 
                    : 'bg-[#F6E6FF] hover:bg-[#BF4BF6] text-[#BF4BF6] hover:text-white'
                }`}
            >
              {emailSent ? (
                <>
                  <CheckCircle size={18} />
                  Email Sent Successfully
                </>
              ) : sending ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-[#BF4BF6] rounded-full mr-2"></div>
                  Sending Email...
                </>
              ) : (
                <>
                  <Mail size={18} />
                  Email Password to User
                </>
              )}
            </button>
            {emailError && (
              <p className="text-red-600 text-sm mt-2">
                {emailError}
              </p>
            )}
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700 text-sm">
            <p className="font-semibold">Important:</p>
            <p className="mt-1">
              Make sure to communicate this password securely to the user. The password will only be 
              shown once and cannot be retrieved later.
            </p>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg py-2.5 px-5 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TempPasswordDialog;