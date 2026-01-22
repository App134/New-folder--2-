import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css'; // Reusing Login styles for consistency
import AnimatedPage from '../components/common/AnimatedPage';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signup, loginWithGoogle } = useAuth();
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
        <AnimatedPage>
            <div className="login-page">
                {/* Right Side - Visuals (Flipped) */}
                {/* Note: In CSS, we need to handle the flip. By default flex-direction is row. 
                    We can just swap the order of divs here or use flex-direction: row-reverse.
                    Let's swap divs for simplicity in DOM, but visually we might want to ensure responsiveness works.
                    Actually, swapping divs is safer.
                */}

                {/* Form Side - Left now */}
                <div className="login-form-container">
                    <div className="login-card">
                        <div className="login-header">
                            <h2>Join FinanceFlow</h2>
                            <p>Start your journey to financial freedom</p>
                        </div>

                        {errors.global && <div className="auth-error" style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{errors.global}</div>}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="name">Full Name</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
                            </div>

                            <div className="input-group">
                                <label htmlFor="email">Email</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
                            </div>

                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type="password"
                                        id="password"
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.password && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.password}</span>}
                            </div>

                            <div className="input-group">
                                <label htmlFor="confirm-password">Confirm Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type="password"
                                        id="confirm-password"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.confirmPassword}</span>}
                            </div>

                            <button type="submit" className="login-btn" style={{ background: 'linear-gradient(to right, #10b981, #059669)' }} disabled={loading}>
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>

                            <div className="auth-divider">
                                <span>OR</span>
                            </div>

                            <button
                                type="button"
                                className="google-btn"
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        await loginWithGoogle();
                                        navigate('/');
                                    } catch (err) {
                                        setErrors({ global: 'Google sign up failed' });
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Continue with Google
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>
                                Already have an account?{' '}
                                <Link to="/login" className="login-link">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Visual Side - Right now */}
                <div className="login-visual" style={{ background: 'radial-gradient(circle at bottom right, #1e293b, #0f172a)' }}>
                    {/* Alter animation/shapes slightly for uniqueness */}
                    <div className="shape shape-1" style={{ background: '#10b981', right: '-100px', left: 'auto' }}></div>
                    <div className="shape shape-2" style={{ background: '#3b82f6', left: '10%', right: 'auto' }}></div>
                    <div className="shape shape-3" style={{ background: '#f59e0b', top: '20%', left: '-50px' }}></div>
                    <div className="visual-content">
                        <h1 style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Join the Future
                        </h1>
                        <p>Sign up now to take control of your financial destiny.</p>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default RegisterPage;
