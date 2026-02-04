import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import AnimatedPage from '../components/common/AnimatedPage';

const VerifyEmailPage = () => {
    const location = useLocation();
    const email = location.state?.email || 'your email';

    return (
        <AnimatedPage>
            <div className="login-page" style={{ justifyContent: 'center' }}>
                {/* Visual Background */}
                <div className="login-visual" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                    background: 'radial-gradient(circle at center, #1e293b, #0f172a)'
                }}>
                    <div className="shape shape-1" style={{ top: '10%', left: '10%' }}></div>
                    <div className="shape shape-2" style={{ bottom: '10%', right: '10%' }}></div>
                </div>

                <div className="login-form-container" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                    <div className="login-card" style={{ textAlign: 'center' }}>
                        <div className="login-header">
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem auto'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </div>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Verify Your Email</h2>
                            <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#94a3b8' }}>
                                We've sent a verification email to <br />
                                <strong style={{ color: 'white' }}>{email}</strong>
                            </p>
                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                                Please check your inbox and click the verification link to activate your account.
                            </p>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <Link to="/login" className="login-btn" style={{
                                textDecoration: 'none',
                                display: 'inline-block',
                                width: '100%',
                                background: 'linear-gradient(to right, #3b82f6, #2563eb)'
                            }}>
                                Go to Login
                            </Link>
                        </div>

                        <div className="login-footer" style={{ marginTop: '1.5rem' }}>
                            <p>
                                Didn't receive the email? <br />
                                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Check your spam folder or try logging in to resend.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default VerifyEmailPage;
