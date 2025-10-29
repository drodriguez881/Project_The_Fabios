import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInEmail, setLoggedInEmail] = useState(null);
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

      return data; 
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
    const data = await handleApiRequest('/register', { email, password });
    
    if (data) {
      alert(data.message);
      setEmail('');
      setPassword('');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
    const data = await handleApiRequest('/login', { email, password });
    
    if (data) {
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
