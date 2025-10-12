import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = (e) => {
    e.preventDefault()
    console.log('Signed up with:', { email, password })
    alert(`Account created for ${email}`)
    setEmail('')
    setPassword('')
  }

  return (
    <div className="container">
      <div className="left-side">
        <h1>Welcome to RestroomReviewer</h1>
        <p>Where you can give your opinion of UF's bathrooms.</p>
      </div>

      <div className="right-side">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignUp}>
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
          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  )
}

export default App
