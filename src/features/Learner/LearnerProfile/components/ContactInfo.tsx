import React from 'react';
import { ProfileData } from '../types';
import { Mail, Phone, Briefcase } from 'lucide-react';

const ContactInfo: React.FC<{ profileData: ProfileData }> = ({ profileData }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-3 mb-4">Contact Information</h3>
    <div className="flex items-center text-gray-600 text-sm">
      <Mail size={16} className="mr-4 text-indigo-500 flex-shrink-0"/>
      <span className="truncate">{profileData.email}</span>
    </div>
    <div className="flex items-center text-gray-600 text-sm">
      <Phone size={16} className="mr-4 text-indigo-500 flex-shrink-0"/>
      <span>{profileData.phone}</span>
    </div>
    <div className="flex items-center text-gray-600 text-sm">
      <Briefcase size={16} className="mr-4 text-indigo-500 flex-shrink-0"/>
      <span>{profileData.department} Department</span>
    </div>
  </div>
);

export default ContactInfo;