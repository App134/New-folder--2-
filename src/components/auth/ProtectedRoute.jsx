import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-primary)' }}>Loading...</div>;
    }

    if (!currentUser) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    if (!currentUser.emailVerified) {
        // Redirect to login if email not verified
        // Ideally we should show a message, but logic in LoginPage handles logout if they try to login unverified.
        // If they are here, it means they have a session but aren't verified.
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
