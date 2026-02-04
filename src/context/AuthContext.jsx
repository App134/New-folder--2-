import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    sendEmailVerification
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

        // 2. Send Email Verification
        await sendEmailVerification(user);

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

    const loginWithGoogle = async (emailHint = null) => {
        const provider = new GoogleAuthProvider();

        if (emailHint) {
            provider.setCustomParameters({
                login_hint: emailHint
            });
        }

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Verify if the signed-in email matches the hint (if strictly required)
        if (emailHint && user.email.toLowerCase() !== emailHint.toLowerCase()) {
            // Optional: You could sign them out immediately if you want to be strict
            // await signOut(auth);
            // throw new Error("The selected Google account does not match the entered email.");

            // For now, let's just warn or proceed. The user request implies validation.
            // Let's enforce it to match the requirement: "Show a clear validation message".
            // So we will throw an error.
            await signOut(auth); // Sign out the incorrect user
            throw new Error(`Please sign in with ${emailHint}.`);
        }

        try {
            // Check if user document exists
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Create new user document
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    username: user.displayName || 'User',
                    createdAt: new Date().toISOString(),
                    settings: {
                        preferences: {
                            theme: 'dark',
                            currency: '$'
                        }
                    }
                }, { merge: true });
            } else if (!userSnap.data().username) {
                // Update existing doc if username is missing (legacy fix)
                await setDoc(userRef, {
                    username: user.displayName || 'User'
                }, { merge: true });
            }
        } catch (error) {
            console.error("Error creating/checking user document after Google Sign In:", error);
            // We don't block the login, but we log the error
        }

        return result;
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
