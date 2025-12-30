import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Settings, LogOut, PlusCircle } from 'lucide-react';
import './Sidebar.css';

import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    // Get user from Auth Context
    const { currentUser, logout } = useAuth();
    const userName = currentUser?.displayName || currentUser?.email || 'User';

    const handleLogout = async () => {
        try {
            await logout();
            // Redirect is handled by ProtectedRoute/AuthContext state change
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">
                    <Wallet size={28} color="white" />
                </div>
                <h1 className="logo-text">FinanceFlow</h1>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li className="nav-item">
                        <Link to="/">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/data-entry">
                            <PlusCircle size={20} />
                            <span>Data Entry</span>
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link to="/user">
                            <Settings size={20} />
                            <span>Settings</span>
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
