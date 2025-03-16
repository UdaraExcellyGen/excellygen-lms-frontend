import React from 'react';
import { SuccessNotificationProps } from '../../../../../../../../Certificates/Certificates/types/certificates';

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({ message }) => (
  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative">
    <span className="block sm:inline">{message}</span>
  </div>
);