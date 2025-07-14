// src/features/Learner/Certificates/components/CertificateFormModal.tsx - ExcellyGen Brand
import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { ExternalCertificateFormData, BRAND_COLORS } from '../../../../types/course.types';
import { CERTIFICATE_PLATFORMS } from '../../../../api/services/Course/certificateService';

interface CertificateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExternalCertificateFormData) => void;
  initialData?: ExternalCertificateFormData;
  isEditing?: boolean;
}

export const CertificateFormModal: React.FC<CertificateFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<ExternalCertificateFormData>(
    initialData || {
      title: '',
      issuer: '',
      platform: 'Udemy',
      completionDate: '',
      credentialUrl: '',
      credentialId: '',
      description: ''
    }
  );

  const [showCustomPlatform, setShowCustomPlatform] = useState(
    initialData ? !CERTIFICATE_PLATFORMS.includes(initialData.platform as any) : false
  );

  const [errors, setErrors] = useState<Partial<ExternalCertificateFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ExternalCertificateFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Certificate title is required';
    }

    if (!formData.issuer.trim()) {
      newErrors.issuer = 'Issuing organization is required';
    }

    if (!formData.platform.trim()) {
      newErrors.platform = 'Platform is required';
    }

    if (!formData.completionDate) {
      newErrors.completionDate = 'Completion date is required';
    } else {
      const completionDate = new Date(formData.completionDate);
      const today = new Date();
      if (completionDate > today) {
        newErrors.completionDate = 'Completion date cannot be in the future';
      }
    }

    if (formData.credentialUrl && !isValidUrl(formData.credentialUrl)) {
      newErrors.credentialUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShowCustomPlatform(value === 'Other');
    
    if (value !== 'Other') {
      setFormData({ ...formData, platform: value });
    } else {
      setFormData({ ...formData, platform: '' });
    }
  };

  const updateFormData = (field: keyof ExternalCertificateFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 font-nunito">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg z-10 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: BRAND_COLORS.federalBlue }}
            >
              <ExternalLink className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold" style={{ color: BRAND_COLORS.russianViolet }}>
              {isEditing ? 'Edit External Certificate' : 'Add External Certificate'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Certificate Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Title *
            </label>
            <input
              type="text"
              required
              className={`w-full border rounded-lg p-3 ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:border-transparent`}
              style={{ 
                '--tw-ring-color': BRAND_COLORS.federalBlue 
              } as React.CSSProperties}
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="e.g., Complete Web Development Bootcamp"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Issuing Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issuing Organization *
            </label>
            <input
              type="text"
              required
              className={`w-full border rounded-lg p-3 ${errors.issuer ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:border-transparent`}
              style={{ 
                '--tw-ring-color': BRAND_COLORS.federalBlue 
              } as React.CSSProperties}
              value={formData.issuer}
              onChange={(e) => updateFormData('issuer', e.target.value)}
              placeholder="e.g., Google, Meta, IBM"
            />
            {errors.issuer && <p className="text-red-500 text-xs mt-1">{errors.issuer}</p>}
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform *
            </label>
            <select
              className={`w-full border rounded-lg p-3 ${errors.platform ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:border-transparent`}
              style={{ 
                '--tw-ring-color': BRAND_COLORS.federalBlue 
              } as React.CSSProperties}
              value={showCustomPlatform ? 'Other' : formData.platform}
              onChange={handlePlatformChange}
            >
              {CERTIFICATE_PLATFORMS.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
            {errors.platform && <p className="text-red-500 text-xs mt-1">{errors.platform}</p>}
          </div>

          {/* Custom Platform Input */}
          {showCustomPlatform && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Platform Name *
              </label>
              <input
                type="text"
                required
                className={`w-full border rounded-lg p-3 ${errors.platform ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:border-transparent`}
                style={{ 
                  '--tw-ring-color': BRAND_COLORS.federalBlue 
                } as React.CSSProperties}
                value={formData.platform}
                onChange={(e) => updateFormData('platform', e.target.value)}
                placeholder="Enter platform name"
              />
            </div>
          )}

          {/* Completion Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Completion Date *
            </label>
            <input
              type="date"
              required
              className={`w-full border rounded-lg p-3 ${errors.completionDate ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:border-transparent`}
              style={{ 
                '--tw-ring-color': BRAND_COLORS.federalBlue 
              } as React.CSSProperties}
              value={formData.completionDate}
              onChange={(e) => updateFormData('completionDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.completionDate && <p className="text-red-500 text-xs mt-1">{errors.completionDate}</p>}
          </div>

          {/* Credential URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credential URL (Optional)
            </label>
            <input
              type="url"
              className={`w-full border rounded-lg p-3 ${errors.credentialUrl ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:border-transparent`}
              style={{ 
                '--tw-ring-color': BRAND_COLORS.federalBlue 
              } as React.CSSProperties}
              value={formData.credentialUrl}
              onChange={(e) => updateFormData('credentialUrl', e.target.value)}
              placeholder="https://example.com/certificate/123"
            />
            {errors.credentialUrl && <p className="text-red-500 text-xs mt-1">{errors.credentialUrl}</p>}
          </div>

          {/* Credential ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credential ID (Optional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:border-transparent"
              style={{ 
                '--tw-ring-color': BRAND_COLORS.federalBlue 
              } as React.CSSProperties}
              value={formData.credentialId}
              onChange={(e) => updateFormData('credentialId', e.target.value)}
              placeholder="e.g., UC-12345678"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:border-transparent"
              style={{ 
                '--tw-ring-color': BRAND_COLORS.federalBlue 
              } as React.CSSProperties}
              rows={3}
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Brief description of what you learned..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 text-white rounded-lg py-3 transition-all duration-300 font-medium"
              style={{ 
                background: `linear-gradient(135deg, ${BRAND_COLORS.federalBlue}, ${BRAND_COLORS.mediumBlue})` 
              }}
            >
              {isEditing ? 'Update Certificate' : 'Add Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};