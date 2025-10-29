import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import bcrypt from 'bcrypt';

// Constants
const app = express();
const PORT = 3001;
const SALT_ROUNDS = 10;

// Middleware
app.use(express.json());
app.use(cors());

// Make db
const db = await open({
  filename: './database.db',
  driver: sqlite3.Database
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password_hash TEXT
  )
`);

console.log('Db is made');

// [POST] /register - New users
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Missing fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Checks for current user
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert the new user
    const result = await db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);

    console.log(`User registered: ${email}`);
    res.status(201).json({ message: `User ${email} created successfully!`, userId: result.lastID });

  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
});

// [POST] /login - Handles user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Missing info
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Find the user by email
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare the submitted password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      console.log(`User logged in: ${email}`);
      res.status(200).json({ message: `Welcome back, ${email}!` });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
});


// [POST] /delete - Remove user
app.post('/delete', async (req, res) => {
  const { email, password } = req.body;

  // Missing info
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Find the user by email
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare the submitted password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      console.log(`User deleted in: ${email}`);
      await db.run('DELETE FROM users WHERE id = ?', user.id);
      res.status(200).json({ message: `Goodbye, ${email}!` });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ message: 'An error occurred during deletion.' });
  }
});

// Actual main
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
