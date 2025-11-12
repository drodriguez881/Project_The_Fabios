import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInEmail, setLoggedInEmail] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const API_URL = 'http://localhost:3001';

  const handleApiRequest = async (endpoint, body) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
      }

      const success = response.ok;
      const result = { success, data };

      return result; 
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
    const email_format = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email_format.test(email)) {
      alert('Error: Invalid email format, must be in this format -> _@_._');
      return;
    }

    const { success, data } = await handleApiRequest('/register', { email, password });

    if (success) {
      alert(data.message);
      setPendingEmail(email);
      setShowVerification(true);
      setEmail('');
      setPassword('');
    }
    else {
      alert(data.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
    const { success, data } = await handleApiRequest('/login', { email, password });

    if (!success) {
      alert('Error: Invalid email or password');
      return;
    }  
    
    if (success) {
      alert(data.message); 
      setLoggedInEmail(email);
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setLoggedInEmail(null);
    alert('Logged out successfully.');
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      alert('Please enter the verification code.');
      return;
    }
    const { success, data } = await handleApiRequest('/verify-email', { email: pendingEmail, verificationCode });

    if (success) {
      alert('Email verified! You can now log in.');
      setShowVerification(false);
      setVerificationCode('');
      setPendingEmail('');
    } else {
      alert(data.message || 'Verification failed.');
    }
  };

  if (loggedInEmail) {
    return (
      <div className="container">
        <div className="right-side" style={{ backgroundColor: 'var(--blue-1)' }}>
          <h2>Welcome, {loggedInEmail}!</h2>
          
          <div style={{ width: '100%', maxWidth: '360px' }}>
            <button type="submit" style={{ marginBottom: '10px', width: '100%' }}>
              Placeholder Button 1
            </button>
            <button type="submit" style={{ marginBottom: '10px', width: '100%' }}>
              Placeholder Button 2
            </button>
            
            <button type="submit" onClick={handleLogout} className="delete-btn" style={{ width: '100%' }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showVerification) {
    return (
      <div className="container">
        <div className="left-side">
          <h1>Verify Your Email</h1>
          <p>We sent a verification code to {pendingEmail}</p>
        </div>

        <div className="right-side">
          <h2>Enter Verification Code</h2>
          
          <div style={{ width: '100%', maxWidth: '360px' }}>
            <input
              type="text"
              placeholder="6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength="6"
              required
            />
            <button type="submit" onClick={handleVerifyEmail}>
              Verify
            </button>
            <button 
              type="submit" 
              onClick={() => {
                setShowVerification(false);
                setVerificationCode('');
                setPendingEmail('');
              }}
              style={{ marginTop: '10px', backgroundColor: '#gray' }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="left-side">
        <h1>Welcome to RestroomReviewer</h1>
        <p>Where you can give your opinion of UF's bathrooms.</p>
      </div>

      <div className="right-side">
        <h2>Login or Sign Up</h2>
        
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" onClick={handleLogin}>
            Login
          </button>
          <button type="submit" onClick={handleSignUp} style={{ marginTop: '10px' }}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
