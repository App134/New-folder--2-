import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import './Header.css';
import logo from '../../assets/logo.png';

const Header = ({ onMenuClick }) => {
    // Get user from Auth Context
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();
    const userName = userProfile?.username || currentUser?.displayName || currentUser?.email || 'User';

    return (
        <header className="header">
            {/* Mobile Menu Button - Hidden on desktop via CSS */}
            {/* Mobile Menu Button - Hidden on desktop via CSS */}
            <div className="mobile-header-left">
                <button className="menu-btn icon-btn" onClick={onMenuClick}>
                    <Menu size={24} />
                </button>
                <div className="mobile-logo-container">
                    <img src={logo} alt="FinanceFlow" className="mobile-logo" />
                    <span className="mobile-logo-text">FinanceFlow</span>
                </div>
            </div>

            <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input type="text" placeholder="Search transactions..." />
            </div>

            <div className="header-actions">

                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="notification-badge"></span>
                </button>
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
