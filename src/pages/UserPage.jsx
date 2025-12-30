import React, { useState, useEffect } from 'react';
import { User, LogOut, Save, Moon, DollarSign } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './Auth.css'; // Reusing Auth styles for consistency

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
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>User Settings</h2>

            <div className="auth-card" style={{ width: '100%', maxWidth: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '1rem'
                    }}>
                        <User size={40} color="white" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{currentUser?.displayName || 'User'}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{currentUser?.email || 'No email'}</p>
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>

                    {message && <p style={{ color: 'var(--accent-secondary)', marginBottom: '1rem' }}>{message}</p>}

                    <button type="submit" className="auth-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Save size={20} />
                        Save Changes
                    </button>
                </form>

                <div className="auth-divider">
                    <span>Preferences</span>
                </div>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={16} /> Currency
                    </label>
                    <select
                        value={currency}
                        onChange={(e) => updateCurrency(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            marginBottom: '1rem'
                        }}
                    >
                        <option value="$">USD ($)</option>
                        <option value="₹">INR (₹)</option>
                        <option value="€">EUR (€)</option>
                        <option value="£">GBP (£)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Moon size={16} /> Theme
                    </label>
                    <select
                        value={theme}
                        onChange={(e) => updateTheme(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="midnight">Midnight</option>
                        <option value="ocean">Ocean</option>
                    </select>
                </div>

                <div className="auth-divider">
                    <span>Account Actions</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="google-button" // Reusing this class for style
                    style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)' }}
                >
                    <LogOut size={20} style={{ marginRight: '0.5rem' }} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default UserPage;
