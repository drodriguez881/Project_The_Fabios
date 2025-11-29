import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
const PORT = 3001;
const SALT_ROUNDS = 10;

app.use(express.json());
app.use(cors({
  origin: 'https://fabio.serralq.dev'
}));

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

await db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building TEXT NOT NULL,
    cleanliness INTEGER,
    supplies INTEGER,
    privacy INTEGER,
    text TEXT,
    user TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Db is made');

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);

    console.log(`User registered: ${email}`);
    res.status(201).json({ message: `User ${email} created successfully!`, userId: result.lastID });

  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

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


app.post('/delete', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

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

app.get('/reviews', async (req, res) => {
  const building = req.query.building;
  if (!building) return res.status(400).json({ message: 'Missing building query param' });
  try {
    const rows = await db.all('SELECT id, building, cleanliness, supplies, privacy, text, user, created_at FROM reviews WHERE building = ? ORDER BY created_at DESC', building);
    res.status(200).json({ reviews: rows });
  } catch (err) {
    console.error('Get reviews error', err);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

app.post('/reviews', async (req, res) => {
  const { building, cleanliness, supplies, privacy, text, user } = req.body;
  if (!building) return res.status(400).json({ message: 'Missing building' });
  try {
    const result = await db.run(
      'INSERT INTO reviews (building, cleanliness, supplies, privacy, text, user) VALUES (?, ?, ?, ?, ?, ?)',
      [building, cleanliness || null, supplies || null, privacy || null, text || '', user || null]
    );
    const inserted = await db.get('SELECT id, building, cleanliness, supplies, privacy, text, user, created_at FROM reviews WHERE id = ?', result.lastID);
    res.status(201).json({ review: inserted });
  } catch (err) {
    console.error('Post review error', err);
    res.status(500).json({ message: 'Error saving review' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
