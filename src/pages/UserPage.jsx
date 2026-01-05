import React, { useState, useEffect } from 'react';
import { User, LogOut, Save, Moon, DollarSign } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './UserPage.css'; // New premium styles
import Footer from '../components/layout/Footer';

const UserPage = () => {
    const { currency, updateCurrency, theme, updateTheme } = useData();
    const { currentUser, logout } = useAuth();
    const [newName, setNewName] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (currentUser) {
            setNewName(currentUser.displayName || '');
        }
    }, [currentUser]);

    const handleSave = (e) => {
        e.preventDefault();
        // TODO: Implement updateProfile in AuthContext
        setMessage('Profile update not yet connected to Firebase backend.');
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="user-page-container">
            <div className="user-content-wrapper">
                <h2 className="page-title">User Settings</h2>

                <div className="settings-card">
                    <div className="profile-section">
                        <div className="avatar-wrapper">
                            <User size={48} color="white" />
                        </div>
                        <div>
                            <h3 className="user-display-name">{currentUser?.displayName || 'User'}</h3>
                            <p className="user-email">{currentUser?.email || 'No email'}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="settings-form">
                        <div className="setting-item">
                            <label>Display Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>

                        {message && <div className="success-msg">{message}</div>}

                        <button type="submit" className="auth-btn save-btn">
                            <Save size={20} />
                            Save Changes
                        </button>
                    </form>

                    <div className="preferences-divider">
                        <span>Preferences</span>
                    </div>

                    <div className="settings-form">
                        <div className="setting-item">
                            <label>
                                <DollarSign size={16} /> Currency
                            </label>
                            <select
                                value={currency}
                                onChange={(e) => updateCurrency(e.target.value)}
                            >
                                <option value="$">USD ($)</option>
                                <option value="₹">INR (₹)</option>
                                <option value="€">EUR (€)</option>
                                <option value="£">GBP (£)</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <label>
                                <Moon size={16} /> Theme
                            </label>
                            <select
                                value={theme}
                                onChange={(e) => updateTheme(e.target.value)}
                            >
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                                <option value="midnight">Midnight</option>
                                <option value="ocean">Ocean</option>
                            </select>
                        </div>
                    </div>

                    <div className="actions-divider">
                        <span>Account Actions</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="google-button logout-action-btn"
                    >
                        <LogOut size={20} style={{ marginRight: '0.5rem' }} />
                        Logout
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default UserPage;
