const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Progress = require('./models/Progress');
const User = require('./models/User');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'jamb-secret-key';

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || buildMongoUriFromParts();

if (!MONGODB_URI) {
  console.error('Missing MongoDB connection configuration. Set MONGODB_URI in backend/.env.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    if (error.code === 'ECONNREFUSED' || error.name === 'MongoNetworkError') {
      console.error('Likely DNS/network issue. If using Atlas, allow your IP in Network Access and verify that SRV DNS lookups are permitted.');
      console.error('If you cannot use mongodb+srv://, paste the standard mongodb:// connection string from Atlas into MONGODB_URI.');
    }
    process.exit(1);
  });

function buildMongoUriFromParts() {
  const host = process.env.MONGODB_HOST;
  const port = process.env.MONGODB_PORT || '27017';
  const dbName = process.env.MONGODB_DB || 'jamb-backend';
  const user = process.env.MONGODB_USER;
  const password = process.env.MONGODB_PASS;

  if (!host) return null;
  if (user && password) {
    return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${dbName}?authSource=admin`;
  }
  return `mongodb://${host}:${port}/${dbName}`;
}

app.use(cors());
app.use(express.json());

const subjects = [
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
  { id: 'biology', name: 'Biology' },
];

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/subjects', (req, res) => {
  res.json(subjects);
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashedPassword });
    const token = createToken(user);

    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createToken(user);
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
});

app.get('/api/progress', authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.user.id });
    res.json(progress?.progress || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

app.post('/api/progress', authMiddleware, async (req, res) => {
  try {
    const { progress } = req.body;
    if (typeof progress !== 'object') {
      return res.status(400).json({ error: 'Progress must be an object' });
    }

    const updated = await Progress.findOneAndUpdate(
      { userId: req.user.id },
      { progress },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(updated.progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
