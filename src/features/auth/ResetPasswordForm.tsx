import React, { useState } from 'react';
import { X, Mail, ArrowLeft } from 'lucide-react';

interface ResetPasswordFormProps {
  onClose: () => void;
  onBackToLogin: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onClose,
  onBackToLogin
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      setError('Failed to send reset link. Please try again.');
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('ResetPasswordForm - Back to login clicked');
    onBackToLogin();
  };

  return (
    <>
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
      >
        <X size={24} />
      </button>

      {/* Back to Login Button */}
      <button
        onClick={handleBackClick}
        className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 flex items-center gap-1"
      >
        <ArrowLeft size={24} />
        <span className="text-sm">Back</span>
      </button>

      {/* Content */}
      <div className="text-center mb-8 mt-6">
        <div className="w-12 h-12 bg-phlox rounded-full mx-auto mb-4 flex items-center justify-center">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-russian-violet">
          {isSubmitted ? 'Check Your Email' : 'Reset Password'}
        </h2>
        <p className="text-gray-500 mt-2">
          {isSubmitted 
            ? `We have sent a password reset link to ${email}`
            : 'Enter your email address to reset your password'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="relative">
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phlox/50 focus:border-phlox transition-colors duration-200"
                placeholder="name@company.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-french-violet hover:bg-indigo text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 text-center">
            Please check your email for the reset link. 
            If you don't receive it within a few minutes, check your spam folder.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full py-2.5 px-4 bg-french-violet hover:bg-indigo text-white rounded-lg transition-all duration-200"
            >
              Try Again
            </button>
            <button
              onClick={handleBackClick}
              className="w-full py-2.5 px-4 border border-french-violet text-french-violet hover:bg-french-violet hover:text-white rounded-lg transition-all duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPasswordForm;