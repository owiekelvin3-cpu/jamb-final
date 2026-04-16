import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Login successful, navigate to dashboard
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '40px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '30px',
        color: '#1a1a2e',
        fontFamily: 'Sora, sans-serif',
        fontWeight: '600'
      }}>
        Welcome Back
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563EB'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563EB'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {error && (
          <div style={{
            color: '#dc2626',
            fontSize: '14px',
            textAlign: 'center',
            padding: '8px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px 24px',
            background: loading ? '#94a3b8' : '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: 'DM Sans, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => !loading && (e.target.style.background = '#1d4ed8')}
          onMouseOut={(e) => !loading && (e.target.style.background = '#2563EB')}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '14px',
        color: '#64748b'
      }}>
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onToggleMode}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563EB',
            fontWeight: '600',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '14px'
          }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
};

export default Login;
