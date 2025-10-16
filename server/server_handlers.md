const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const API_URL = 'http://localhost:3001';

// Api request template
const handleApiRequest = async (endpoint, body) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          // Error spots
        }

        return data;

    } catch (err) {
      // Error spots
    } finally {
      // Hook for execution after finish loading
    }
};

const handleRegister = async () => {
    const data = await handleApiRequest('/register', { email, password });
    if (data) {
      // After login
    }
};

const handleLogin = async () => {
    const data = await handleApiRequest('/login', { email, password });
    if (data) {
      // After login
    }
};

const handleLogout = () => {
  // Logout functions
};
