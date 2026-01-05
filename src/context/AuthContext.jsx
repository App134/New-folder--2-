import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const signup = async (email, password, name) => {
        // Mock Signup
        const user = { uid: Date.now().toString(), email, displayName: name };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { user };
    };

    const login = async (email, password) => {
        // Mock Login - allow any email/password
        // In a real local-only app, you might want to look up users, 
        // but for this transition we just create a session.
        // We can try to retrieve name if we stored it, else default.
        const stored = localStorage.getItem('currentUser');
        let user;
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.email === email) {
                user = parsed;
            }
        }

        if (!user) {
            user = { uid: Date.now().toString(), email, displayName: email.split('@')[0] };
        }

        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { user };
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
