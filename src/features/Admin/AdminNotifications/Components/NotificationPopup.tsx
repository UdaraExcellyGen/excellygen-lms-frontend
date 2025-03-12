import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { DeleteModalProps } from '../types/AdminNotification';

const AdminPopup: React.FC<DeleteModalProps> = ({ isOpen, notification, onClose, onConfirmDelete }) => {
  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
     
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>

      
      <div className="bg-white rounded-lg p-6 shadow-xl z-10 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4 text-red-500">
          <AlertTriangle className="h-6 w-6" />
          <h3 className="text-lg font-bold">Confirm Deletion</h3>
        </div>
        
      
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-bold text-[#1B0A3F] mb-2">{notification.courseName}</h4>
          
          <div className="mb-2">
            <p className="text-sm text-gray-700">{notification.courseDescription}</p>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">Enrollment count:</span>
            <span className="ml-2 px-2 py-1 bg-[#F6E6FF] text-[#52007C] rounded-md">
              {notification.enrollmentCount} students
            </span>
          </div>
        </div>
        
        <p className="mb-6 text-gray-700">
          Are you sure you want to delete this course?
          This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirmDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPopup;