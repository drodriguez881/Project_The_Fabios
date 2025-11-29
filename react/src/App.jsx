import { useState, useEffect } from 'react'
import './App.css'

function renderStars(count) {
  return '★★★★★☆☆☆☆☆'.slice(5 - count, 10 - count);
}

function StarSelector({ value, onChange }) {
  return (
    <span style={{ cursor: 'pointer', fontSize: '1.3em', color: '#f5b301', verticalAlign: 'middle' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          onMouseOver={e => e.target.style.filter = 'brightness(1.2)'}
          onMouseOut={e => e.target.style.filter = ''}
          style={{ marginRight: 2, fontWeight: value >= star ? 700 : 400, opacity: value >= star ? 1 : 0.4 }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

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

      const success = response.ok;
      const result = { success, data };

      return result; 
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
    const { success, data } = await handleApiRequest('/register', { email, password });

    const email_format = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_format.test(email)) {
      alert('Error: Invalid email format, must be in this format -> _@_._');
      return;
    }
    if (success) {
      alert(data.message);
      setLoggedInEmail(email);
      setEmail('');
      setPassword('');
    } else {
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
    setShowDeleteConfirm(false);
    setDeletePassword('');
  };

  const [selectedBuilding, setSelectedBuilding] = useState('Joseph Weil Hall');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmittedFor, setReviewSubmittedFor] = useState(null);
  const [starRatings, setStarRatings] = useState({ cleanliness: 0, supplies: 0, privacy: 0 });
  const defaultReviews = {
    'Joseph Weil Hall': [
      {
        cleanliness: 4,
        supplies: 5,
        privacy: 4,
        text: 'Very clean, well-stocked, and usually quiet. Highly recommended for a quick break between classes!',
        user: 'Anonymous',
      },
    ],
  };
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('bathroomReviews');
    return saved ? JSON.parse(saved) : defaultReviews;
  });
  useEffect(() => {
    localStorage.setItem('bathroomReviews', JSON.stringify(reviews));
  }, [reviews]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleDeleteAccount = async () => {
    if (!deletePassword) return alert("Please enter your password to confirm.");
    
    const { success, data } = await handleApiRequest('/delete', { email: loggedInEmail, password: deletePassword });
    
    if (success) {
      alert(data.message);
      setLoggedInEmail(null);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    } else {
      alert(data.message);
    }
  };

  const fetchReviewsFromServer = async (building) => {
    try {
      const res = await fetch(`${API_URL}/reviews?building=${encodeURIComponent(building)}`);
      if (!res.ok) throw new Error('fetch failed');
      const body = await res.json();
      if (body && Array.isArray(body.reviews)) {
        setReviews(prev => ({ ...prev, [building]: body.reviews }));
      }
    } catch (err) {
      
      console.warn('Could not fetch reviews from server', err);
    }
  };

  useEffect(() => {
    if (selectedBuilding) {
      fetchReviewsFromServer(selectedBuilding);
    }
  }, [selectedBuilding]);

  async function handleSubmitReview(e) {
    e.preventDefault();
    const payload = {
      building: selectedBuilding,
      cleanliness: starRatings.cleanliness,
      supplies: starRatings.supplies,
      privacy: starRatings.privacy,
      text: reviewText,
      user: loggedInEmail || 'Anonymous',
    };

    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('server error');
      const body = await res.json();
      const newReview = body.review;
      
      setReviews(prev => ({ ...prev, [selectedBuilding]: [ ...(prev[selectedBuilding] || []), newReview ] }));
    } catch (err) {
      
      setReviews(prev => ({ ...prev, [selectedBuilding]: [ ...(prev[selectedBuilding] || []), payload ] }));
    }

    setShowReviewForm(false);
    setReviewSubmittedFor(selectedBuilding);
    setTimeout(() => setReviewSubmittedFor(null), 3000);
  }
  if (loggedInEmail) {
    const buildings = [
      "Joseph Weil Hall",
      "Frederick N. Rhines Hall",
      "Computer Sciences",
      "Nuclear Sciences",
      "Materials Engineering",
      "Mechanical and Aerospace Engineering B",
      "Mechanical and Aerospace Engineering C",
      "Nuclear Reactor",
      "Percy L. Reed Lab",
      "Engineering Building",
      "Chemical Engineering",
      "Nanoscale Research Facility",
      "Biomedical Sciences",
      "Mechanical and Aerospace Engineering A",
      "Merwin J. Larsen Hall",
      "Particle Science",
      "Alvin P. Black Hall",
      "John R. Benton Hall",
      "Earle B Phelps Lab",
      "East Campus Office Building",
      "Sustainable Materials Management Research Lab East",
      "Coastal Field Lab",
      "Solar Energy Test House",
      "The Powell Family Structures and Materials Lab",
      "Malachowsky Hall",
      "Autonomy Park",
      "Herbert Wertheim Laboratory for Engineering Excellence",
    ];
    return (
      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
          <div style={{
            width: '260px',
            height: '100vh',
            overflowY: 'auto',
            background: 'var(--blue-1)',
            padding: '32px 16px 32px 16px',
            boxSizing: 'border-box',
            color: '#fff',
            fontWeight: 500
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {buildings.map((b, i) => (
                <li
                  key={i}
                  style={{ marginBottom: '18px', fontSize: '1.1em', cursor: 'pointer', background: selectedBuilding === b ? '#fff' : 'transparent', color: selectedBuilding === b ? 'var(--blue-1)' : '#fff', borderRadius: '4px', padding: '6px 8px' }}
                  onClick={() => setSelectedBuilding(b)}
                >
                  {b}
                </li>
              ))}
              <li style={{ marginTop: '32px' }}>
                <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#fff', color: 'var(--blue-1)', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>Logout</button>
              </li>
              <li style={{ marginTop: '12px' }}>
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)} style={{ width: '100%', padding: '10px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>Delete Account</button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="password" 
                      placeholder="Confirm Password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                    <button onClick={handleDeleteAccount} style={{ width: '100%', padding: '8px', background: '#cc0000', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>Confirm Delete</button>
                    <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }} style={{ width: '100%', padding: '8px', background: '#888', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  </div>
                )}
              </li>
            </ul>
          </div>
          <div style={{ flex: 1, padding: '40px' }}>
            {selectedBuilding && !showReviewForm && !reviewSubmittedFor && (
              <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '24px', maxWidth: '600px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <h2>{selectedBuilding} Bathroom Reviews</h2>
                {reviews[selectedBuilding] && reviews[selectedBuilding].length > 0 ? (
                  <ul style={{ padding: 0, listStyle: 'none', marginBottom: '24px' }}>
                    {reviews[selectedBuilding].map((r, idx) => (
                      <li key={idx} style={{ marginBottom: '18px', background: '#fff', borderRadius: '6px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <div style={{ marginBottom: '6px', fontWeight: 500 }}>{r.user || 'Anonymous'}</div>
                        <div style={{ marginBottom: '4px' }}><strong>Cleanliness:</strong> {renderStars(r.cleanliness)}</div>
                        <div style={{ marginBottom: '4px' }}><strong>Supplies:</strong> {renderStars(r.supplies)}</div>
                        <div style={{ marginBottom: '4px' }}><strong>Privacy:</strong> {renderStars(r.privacy)}</div>
                        <div style={{ marginTop: '8px' }}>{r.text}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ color: '#888', fontSize: '1.1em', marginBottom: '24px' }}>
                    <p>No reviews yet for <strong>{selectedBuilding}</strong>.</p>
                  </div>
                )}
                <button
                  style={{ marginTop: '8px', padding: '10px 18px', background: 'var(--blue-1)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => { setShowReviewForm(true); setReviewText(""); setReviewSubmittedFor(null); setStarRatings({ cleanliness: 0, supplies: 0, privacy: 0 }); }}
                >
                  Submit a Review
                </button>
              </div>
            )}
            {showReviewForm && selectedBuilding && !reviewSubmittedFor && (
              <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '24px', maxWidth: '500px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <h2>Submit a Review for {selectedBuilding}</h2>
                <form onSubmit={handleSubmitReview}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontWeight: 500 }}>Cleanliness: </label>
                    <StarSelector value={starRatings.cleanliness} onChange={v => setStarRatings(s => ({ ...s, cleanliness: v }))} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontWeight: 500 }}>Supplies: </label>
                    <StarSelector value={starRatings.supplies} onChange={v => setStarRatings(s => ({ ...s, supplies: v }))} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontWeight: 500 }}>Privacy: </label>
                    <StarSelector value={starRatings.privacy} onChange={v => setStarRatings(s => ({ ...s, privacy: v }))} />
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Write your review here..."
                    rows={5}
                    style={{ width: '100%', marginBottom: '16px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1em' }}
                    required
                  />
                  <div>
                    <button type="submit" style={{ padding: '10px 18px', background: 'var(--blue-1)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', marginRight: '10px' }}>
                      Submit
                    </button>
                    <button type="button" style={{ padding: '10px 18px', background: '#bbb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowReviewForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            {reviewSubmittedFor === selectedBuilding && (
              <div style={{ background: '#e6ffe6', borderRadius: '8px', padding: '24px', maxWidth: '500px', color: '#225522', fontWeight: 600, fontSize: '1.1em', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '18px' }}>
                Thank you for submitting your review for <strong>{selectedBuilding}</strong>!
              </div>
            )}
            
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
