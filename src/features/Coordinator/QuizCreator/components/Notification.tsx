import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) {
        return null;
    }

    return (
        <div
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-md z-50 animate-fadeIn ${
                type === 'error' ? 'bg-red-500/90' :
                    type === 'success' ? 'bg-green-500/90' :
                        'bg-[#BF4BF6]/90'
            } text-white backdrop-blur-sm border ${
                type === 'error' ? 'border-red-400' :
                    type === 'success' ? 'border-green-400' :
                        'border-[#D68BF9]'
            } font-nunito`}
        >
            <div className="flex items-center gap-2">
                {type === 'error' && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                {type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                {type === 'info' && <HelpCircle className="w-5 h-5 flex-shrink-0" />}
                <span>{message}</span>
            </div>
        </div>
    );
};

export default Notification;