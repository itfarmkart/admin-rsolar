
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import logo from '../assets/logo.png';

const Login = () => {
    const navigate = useNavigate();

    const handleGoogleLoginSuccess = async (tokenResponse) => {
        try {
            console.log('Google Auth Success. Fetching user info...');
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });

            if (!userInfoResponse.ok) {
                const errorText = await userInfoResponse.text();
                throw new Error(`Google UserInfo failed: ${userInfoResponse.status} ${errorText}`);
            }

            const userInfo = await userInfoResponse.json();
            const email = userInfo.email;
            console.log('User verified:', email);

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error('Backend returned non-JSON:', text);
                throw new Error(`Backend returned non-JSON response. Status: ${response.status}`);
            }

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/');
            } else {
                alert(data.error || 'Login failed: Access Denied');
            }
        } catch (error) {
            console.error('Login Process Error:', error);
            alert(`Authentication Error: ${error.message}`);
        }
    };

    const login = useGoogleLogin({
        onSuccess: handleGoogleLoginSuccess,
        onError: () => alert('Google Login Failed'),
    });

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            backgroundColor: '#0B0D10', // Dark background
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                backgroundColor: '#16191D', // Card background
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '400px'
            }}>
                {/* Logo */}
                <div style={{
                    marginBottom: '24px',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#1E3E1A', // Dark green background for the circle
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 50px rgba(180, 244, 0, 0.4)', // Stronger green glow
                    border: '2px solid rgba(180, 244, 0, 0.3)'
                }}>
                    <img src={logo} alt="r-solar logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                </div>

                {/* Title */}
                <h1 style={{
                    color: '#fff',
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    marginBottom: '40px',
                    letterSpacing: '-0.025em'
                }}>
                    r-solar Admin
                </h1>

                {/* Google Sign In Button */}
                <button
                    onClick={() => login()}
                    style={{
                        backgroundColor: '#fff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '24px',
                        padding: '12px 24px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease',
                        width: '100%',
                        justifyContent: 'center'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.744 42.389 C -8.804 40.469 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                        </g>
                    </svg>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default Login;
