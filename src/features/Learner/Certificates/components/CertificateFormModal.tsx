import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CertificateFormModalProps } from '../types/certificates';
import { ExternalCertificate } from '../types/certificates';

export const CertificateFormModal: React.FC<CertificateFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData = {
    title: '',
    issuer: '',
    completionDate: '',
    url: '',
    platform: 'LinkedIn'
  },
  isEditing = false
}) => {
  const [formData, setFormData] = useState(initialData);
  const [showCustomPlatform, setShowCustomPlatform] = useState(
    initialData.platform !== 'LinkedIn' && 
    initialData.platform !== 'Coursera' && 
    initialData.platform !== 'Udemy'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShowCustomPlatform(value === 'Other');
    
    // If "Other" is selected, don't update the platform value yet
    if (value !== 'Other') {
      setFormData({...formData, platform: value});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-xl p-6 w-full max-w-md z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Edit External Certificate' : 'Add External Certificate'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full border rounded-lg p-2"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
            <input
              type="text"
              required
              className="w-full border rounded-lg p-2"
              value={formData.issuer}
              onChange={(e) => setFormData({...formData, issuer: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <select
              className="w-full border rounded-lg p-2"
              value={showCustomPlatform ? 'Other' : formData.platform}
              onChange={handlePlatformChange}
            >
              <option>LinkedIn</option>
              <option>Coursera</option>
              <option>Udemy</option>
              <option>Other</option>
            </select>
          </div>
          
          {/* Custom platform input field */}
          {showCustomPlatform && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Platform</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2"
                value={formData.platform === 'LinkedIn' || 
                      formData.platform === 'Coursera' || 
                      formData.platform === 'Udemy' ? '' : formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                placeholder="Enter platform name"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
            <input
              type="date"
              required
              className="w-full border rounded-lg p-2"
              value={formData.completionDate}
              onChange={(e) => setFormData({...formData, completionDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate URL</label>
            <input
              type="url"
              required
              className="w-full border rounded-lg p-2"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              placeholder="https://"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg py-2 
                      hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300"
          >
            {isEditing ? 'Save Changes' : 'Add Certificate'}
          </button>
        </form>
      </div>
    </div>
  );
};