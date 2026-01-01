import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let data;
            if (isLogin) {
                data = await authApi.login(email, password);
            } else {
                data = await authApi.signup(email, password, name);
            }

            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onLogin(data.user);
            navigate('/gallery');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="auth-card glass">
                <header className="auth-header">
                    {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="opacity-70">
                        {isLogin ? 'Sign in to access your private gallery' : 'Start your creative journey today'}
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="input-group">
                            <label>Name</label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="auth-error glass">{error}</div>}

                    <button className="btn-primary w-full" disabled={loading}>
                        {loading ? <Loader2 className="spin" /> : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <footer className="auth-footer">
                    <button className="btn-text" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                    </button>
                </footer>
            </div>
        </div>
    );
}
