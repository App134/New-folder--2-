import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Settings, LogOut, PlusCircle, FileSpreadsheet } from 'lucide-react';
import './Sidebar.css';

import { useAuth } from '../../context/AuthContext';

import logo from '../../assets/logo.png';

const Sidebar = ({ isOpen, onClose }) => {
    // Get user from Auth Context
    const { currentUser, userProfile, logout } = useAuth();
    const userName = userProfile?.username || currentUser?.displayName || currentUser?.email || 'User';

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleNavClick = () => {
        if (window.innerWidth <= 768 && onClose) {
            onClose();
        }
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <img src={logo} alt="FinanceFlow Logo" className="sidebar-logo" />
                </div>
                <h1 className="logo-text">FinanceFlow</h1>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li className="nav-item">
                        <Link to="/" onClick={handleNavClick}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/data-entry" onClick={handleNavClick}>
                            <PlusCircle size={20} />
                            <span>Data Entry</span>
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link to="/user" onClick={handleNavClick}>
                            <Settings size={20} />
                            <span>Settings</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/transactions" onClick={handleNavClick}>
                            <Wallet size={20} />
                            <span>Finance History</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/google-sheet" onClick={handleNavClick}>
                            <FileSpreadsheet size={20} />
                            <span>Google Sheets</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
