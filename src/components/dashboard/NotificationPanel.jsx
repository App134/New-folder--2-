import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import NotificationItem from './NotificationItem';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './NotificationPanel.css';

const NotificationPanel = ({ isOpen, onClose }) => {
    const { notifications, markAsRead, markAllAsRead, clearNotification, clearAllNotifications } = useData();
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread'
    const panelRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target) && isOpen) {
                // Check if click was on the bell icon (handled in Header)
                // Actually easier to let Header pass a close handler or handle outside click globally
                // For now, relies on onClose being called.
            }
        };
        // document.addEventListener('mousedown', handleClickOutside);
        // return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredNotifications = activeTab === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <motion.div
            className="notification-panel"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            ref={panelRef}
        >
            <div className="panel-header">
                <div className="panel-title-area">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && <span className="panel-badge">{unreadCount} New</span>}
                </div>
                <div className="panel-controls">
                    <button onClick={markAllAsRead} className="icon-action" title="Mark all read">
                        <CheckCheck size={18} />
                    </button>
                    <button onClick={clearAllNotifications} className="icon-action" title="Clear all">
                        <Trash2 size={18} />
                    </button>
                    <button onClick={onClose} className="close-panel-btn">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="panel-tabs">
                <button
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All
                </button>
                <button
                    className={`tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
                    onClick={() => setActiveTab('unread')}
                >
                    Unread
                </button>
            </div>

            <div className="panel-content">
                <AnimatePresence>
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map(notif => (
                            <NotificationItem
                                key={notif.id}
                                notification={notif}
                                onRead={markAsRead}
                                onClear={clearNotification}
                            />
                        ))
                    ) : (
                        <motion.div
                            className="empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Bell size={40} className="text-gray-600 mb-2" />
                            <p>No notifications yet</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default NotificationPanel;
