import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import Footer from '../components/layout/Footer';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Simple validation
        if (!name) newErrors.name = 'Full Name is required';
        else if (name.trim().length < 5) newErrors.name = 'Full Name must be at least 5 characters';

        if (!email) newErrors.email = 'Email is required';

        if (!password) {
            newErrors.password = 'Password is required';
        } else {
            if (password.length < 6) {
                newErrors.password = 'Password should be at least 6 characters';
            } else {
                const hasUpperCase = /[A-Z]/.test(password);
                const hasNumber = /[0-9]/.test(password);
                const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

                if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
                    newErrors.password = 'Password must contain at least one uppercase letter, one number, and one special character';
                }
            }
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            return setErrors(newErrors);
        }

        try {
            setErrors({});
            setLoading(true);
            await signup(email, password, name);
            navigate('/'); // Redirect to dashboard after signup
        } catch (err) {
            console.error(err);
            setErrors({ global: 'Failed to create an account: ' + err.message });
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="auth-container" style={{ flexDirection: 'column', gap: '2rem' }}>
            <div className="auth-card" style={{ flex: 0 }}>
                <div className="auth-header">
                    <h2>Create Account</h2>
                    <p>Start managing your finances today</p>
                </div>

                {errors.global && <div className="auth-error" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{errors.global}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        {errors.name && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {errors.email && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {errors.password && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input
                            type="password"
                            id="confirm-password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        {errors.confirmPassword && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.confirmPassword}</span>}
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default RegisterPage;
