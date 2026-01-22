import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const signup = async (email, password, name) => {
        // Get existing users
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

        // Check if email already exists
        if (existingUsers.some(user => user.email === email)) {
            throw new Error('Email already already in use');
        }

        const newUser = {
            uid: Date.now().toString(),
            email,
            password, // In a real app, this should be hashed
            displayName: name
        };

        const updatedUsers = [...existingUsers, newUser];
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        // Set current user session
        // Don't store password in session
        const { password: _, ...userSession } = newUser;
        setCurrentUser(userSession);
        localStorage.setItem('currentUser', JSON.stringify(userSession));

        return { user: userSession };
    };

    const login = async (email, password) => {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const user = existingUsers.find(u => u.email === email && u.password === password);

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Create session without password
        const { password: _, ...userSession } = user;
        setCurrentUser(userSession);
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        return { user: userSession };
    };

    const loginWithGoogle = async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const googleEmail = 'user@gmail.com'; // Mock Google email

        let user = existingUsers.find(u => u.email === googleEmail);

        if (!user) {
            // Create mock Google user if not exists
            user = {
                uid: 'google_' + Date.now(),
                email: googleEmail,
                password: 'google_oauth_mock_password', // Internal use only
                displayName: 'Google User',
                photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c' // Generic avatar
            };
            const updatedUsers = [...existingUsers, user];
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        }

        // Create session
        const { password: _, ...userSession } = user;
        setCurrentUser(userSession);
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        return { user: userSession };
    };



    const logout = async () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    const updateAuthProfile = async (profileData) => {
        if (currentUser) {
            const updated = { ...currentUser, ...profileData };
            setCurrentUser(updated);
            localStorage.setItem('currentUser', JSON.stringify(updated));
        }
    };

    useEffect(() => {
        // Check local storage on load
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            setCurrentUser(JSON.parse(stored));
        }
        setLoading(false);
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        loginWithGoogle,
        logout,
        loading,
        updateAuthProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--bg-primary, #0f172a)',
                    color: 'var(--text-primary, white)'
                }}>
                    Loading...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
