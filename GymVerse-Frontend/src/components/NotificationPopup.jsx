import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const NotificationPopup = ({ notification, onClose, onView }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    if (onView && notification?.chatId) {
      onView(notification.chatId);
    }
    onClose();
  };

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div 
        onClick={handleClick}
        className="bg-gray-900 rounded-xl shadow-2xl border border-purple-500 w-80 cursor-pointer hover:scale-105 transition-transform"
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{notification.title}</h4>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                  {notification.body}
                </p>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="text-gray-500 hover:text-white transition"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-purple-400 text-xs text-center">Click to view message</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;