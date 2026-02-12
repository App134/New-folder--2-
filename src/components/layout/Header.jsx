import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import NotificationPanel from '../dashboard/NotificationPanel';

import './Header.css';
import logo from '../../assets/logo.png';

const Header = ({ onMenuClick }) => {
    // Get user from Auth Context
    const { currentUser, userProfile } = useAuth();
    const { alerts, notifications } = useData(); // Use persistent notifications for count
    const navigate = useNavigate();
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

    const userName = userProfile?.username || currentUser?.displayName || currentUser?.email || 'User';

    // Calculate unread persistent notifications
    const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

    // Combine robust alert badge logic (either transient alerts OR persistent unread)
    // For now, let's strictly use the Persistent Notifications for the badge
    const badgeCount = unreadCount;

    return (
        <header className="header" style={{ position: 'relative' }}>
            {/* Mobile Menu Button - Hidden on desktop via CSS */}
            <div className="mobile-header-left">
                <button className="menu-btn icon-btn" onClick={onMenuClick}>
                    <Menu size={24} />
                </button>
                <div className="mobile-logo-container">
                    <img src={logo} alt="FinanceFlow" className="mobile-logo w-8 h-8 object-contain mix-blend-screen" style={{ borderRadius: '50%' }} />
                    <span className="mobile-logo-text">FinanceFlow</span>
                </div>
            </div>

            <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input type="text" placeholder="Search transactions..." />
            </div>

            <div className="header-actions">

                <button
                    className="icon-btn"
                    style={{ position: 'relative' }}
                    onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                >
                    <Bell size={20} />
                    {badgeCount > 0 && (
                        <span className="notification-badge" style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            background: '#ef4444',
                            color: 'white',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '2px solid var(--bg-primary)'
                        }}>
                            {badgeCount}
                        </span>
                    )}
                </button>

                <NotificationPanel
                    isOpen={isNotificationPanelOpen}
                    onClose={() => setIsNotificationPanelOpen(false)}
                />

                <div
                    className="user-profile"
                    onClick={() => navigate('/user')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-role">Premium User</span>
                    </div>
                    <div className="avatar">
                        <User size={24} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
