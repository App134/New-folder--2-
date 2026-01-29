import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const signup = async (email, password, name) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 1. Update Auth Profile
        await updateProfile(user, {
            displayName: name
        });

        // 2. Create Firestore User Document (Single Source of Truth)
        try {
            await setDoc(doc(db, 'users', user.uid), {
                username: name,
                email: email,
                createdAt: new Date().toISOString(),
                settings: {
                    preferences: {
                        theme: 'dark', // Default
                        currency: '$'  // Default
                    }
                }
            }, { merge: true });
        } catch (error) {
            console.error("Error creating user document:", error);
            // Don't block signup success even if firestore fails (rare)
        }

        return userCredential;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const logout = () => {
        setUserProfile(null);
        return signOut(auth);
    };

    const updateAuthProfile = async (profileData) => {
        if (currentUser) {
            await updateProfile(currentUser, profileData);
            // Force refresh of current user object to reflect changes
            setCurrentUser({ ...auth.currentUser });
        }
    };

    const updateUserProfileDoc = async (data) => {
        if (!currentUser) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, data, { merge: true });
            await fetchUserProfile(currentUser.uid); // Refresh local state
        } catch (error) {
            console.error("Error updating user profile doc:", error);
            throw error;
        }
    };

    const fetchUserProfile = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUserProfile(userSnap.data());
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        signup,
        login,
        loginWithGoogle,
        logout,
        loading,
        updateAuthProfile,
        updateUserProfileDoc,
        fetchUserProfile // Expose if we need to manually refresh
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
