import React, { useState, useEffect } from 'react';
import { User, LogOut, Save, Moon, DollarSign, Mail, Shield, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/layout/Footer';

const UserPage = () => {
    const { currency, updateCurrency, theme, updateTheme } = useData();
    const { currentUser, userProfile, logout, updateUserProfileDoc, updateAuthProfile } = useAuth();
    const [newName, setNewName] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (userProfile?.username) {
            setNewName(userProfile.username);
        } else if (currentUser?.displayName) {
            setNewName(currentUser.displayName);
        }
    }, [currentUser, userProfile]);

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            // Update Firestore Doc (Single Source of Truth)
            await updateUserProfileDoc({ username: newName });

            // Optionally update Auth Profile for consistency
            if (currentUser) {
                await updateAuthProfile({ displayName: newName });
            }

            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
            setMessage('Failed to update profile.');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 lg:p-10 min-h-screen bg-background text-primary-foreground font-sans">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">User Settings</h1>
                <p className="text-muted text-sm mt-1">Manage your profile and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-8 rounded-[32px] text-center relative overflow-hidden shadow-lg border border-white/5">
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary p-[3px] mb-4 shadow-neon">
                                <div className="w-full h-full rounded-full bg-background-secondary flex items-center justify-center">
                                    <User size={40} className="text-foreground" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-1">{userProfile?.username || currentUser?.displayName || 'User'}</h2>
                            <p className="text-sm text-muted mb-6">{currentUser?.email || 'No email'}</p>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-colors font-bold text-sm border border-danger/20"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings Forms */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Public Profile Form */}
                    <div className="glass-panel p-8 rounded-[32px] border border-white/5 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="p-2 rounded-lg bg-primary/10 text-primary"><User size={20} /></span>
                            <h3 className="text-lg font-bold text-foreground">Public Profile</h3>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-background-card border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder-white/10"
                                />
                            </div>

                            {message && (
                                <div className={`px-4 py-3 rounded-xl text-sm font-bold ${message.includes('success') ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-electric hover:shadow-neon text-background-secondary font-bold rounded-xl flex items-center gap-2 transition-all"
                            >
                                <Save size={18} />
                                Save Changes
                            </button>
                        </form>
                    </div>

                    {/* Preferences */}
                    <div className="glass-panel p-8 rounded-[32px] border border-white/5 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="p-2 rounded-lg bg-warning/10 text-warning"><Shield size={20} /></span>
                            <h3 className="text-lg font-bold text-foreground">Preferences</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Currency</label>
                                <div className="relative">
                                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <select
                                        value={currency}
                                        onChange={(e) => updateCurrency(e.target.value)}
                                        className="w-full bg-background-card border border-white/10 rounded-xl pl-12 pr-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                                    >
                                        <option value="$" className="bg-background-card">USD ($)</option>
                                        <option value="₹" className="bg-background-card">INR (₹)</option>
                                        <option value="€" className="bg-background-card">EUR (€)</option>
                                        <option value="£" className="bg-background-card">GBP (£)</option>
                                    </select>
                                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted rotate-90" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted font-bold uppercase tracking-wider block mb-2">Theme</label>
                                <div className="relative">
                                    <Moon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <select
                                        value={theme}
                                        onChange={(e) => updateTheme(e.target.value)}
                                        className="w-full bg-background-card border border-white/10 rounded-xl pl-12 pr-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                                    >
                                        <option value="dark" className="bg-background-card">Dark</option>
                                        <option value="light" className="bg-background-card">Light</option>
                                        <option value="midnight" className="bg-background-card">Midnight</option>
                                        <option value="ocean" className="bg-background-card">Ocean</option>
                                    </select>
                                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default UserPage;
