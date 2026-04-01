const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ✅ Increase payload limit for large images (50MB)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/gyms', require('./routes/gymRoutes'));
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/trainers', require('./routes/trainerRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Gym Verse API Running 🚀' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});