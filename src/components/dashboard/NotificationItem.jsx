import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, Clock, Trash2, CreditCard, PiggyBank, DollarSign } from 'lucide-react';
import './NotificationPanel.css'; // Shared CSS

const NotificationItem = ({ notification, onRead, onClear }) => {

    const getIcon = (type) => {
        switch (type) {
            case 'budget': return <DollarSign size={18} className="text-red-500" />;
            case 'savings': return <PiggyBank size={18} className="text-yellow-500" />;
            case 'reminder': return <CreditCard size={18} className="text-blue-500" />;
            case 'info': return <Info size={18} className="text-gray-400" />;
            default: return <Info size={18} />;
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <motion.div
            className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, height: 0 }}
            onClick={() => onRead(notification.id)}
        >
            <div className="notification-icon-box">
                {getIcon(notification.type)}
            </div>
            <div className="notification-content">
                <div className="notification-header">
                    <span className="notification-title">{notification.title}</span>
                    <span className="notification-time">{formatTime(notification.timestamp)}</span>
                </div>
                <p className="notification-message">{notification.message}</p>
            </div>
            <div className="notification-actions">
                {!notification.isRead && <div className="unread-dot" />}
                <button
                    className="clear-btn"
                    onClick={(e) => { e.stopPropagation(); onClear(notification.id); }}
                    title="Clear"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationItem;
