import { useState } from 'react';
import Login from './Login';
import Register from './Register';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {isLogin ? (
        <Login onToggleMode={toggleMode} />
      ) : (
        <Register onToggleMode={toggleMode} />
      )}
    </div>
  );
};

export default Auth;
