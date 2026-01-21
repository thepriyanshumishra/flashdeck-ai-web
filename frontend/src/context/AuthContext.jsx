import { createContext, useContext, useEffect, useState } from "react";
import {
    auth,
    onAuthStateChanged,
    signInAnonymously,
    sendSignInLinkToEmail,
    signInWithEmailLink
} from "../lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginAnonymously = () => {
        return signInAnonymously(auth);
    };

    const sendPasswordlessLink = (email, settings) => {
        return sendSignInLinkToEmail(auth, email, settings);
    };

    const loginWithEmailLink = (email, link) => {
        return signInWithEmailLink(auth, email, link);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginAnonymously,
            sendPasswordlessLink,
            loginWithEmailLink
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
