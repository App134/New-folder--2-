import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import './Header.css';

const Header = () => {
    // Get user from Auth Context
    const { currentUser } = useAuth();
    const userName = currentUser?.displayName || currentUser?.email || 'User';

    return (
        <header className="header">
            <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input type="text" placeholder="Search transactions..." />
            </div>

            <div className="header-actions">

                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="notification-badge"></span>
                </button>
                <div className="user-profile">
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
