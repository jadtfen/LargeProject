require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser'); // Optional if using express.json()
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Party = require('./models/Party');
const Poll = require('./models/Poll');
const PartyGuest = require('./models/PartyMembers');
const Movie = require('./models/Movie');

const app = express();

// MongoDB connection
const mongoURI = process.env.MONGO_URI_PARTY;
mongoose.set('strictQuery', true);

console.log('MongoDB URI:', mongoURI);
mongoose
  .connect(mongoURI, {
    dbName: 'party-database',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Middleware
app.use(
  cors({
    origin: 'https://themoviesocial-a63e6cbb1f61.herokuapp.com',
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON requests

// Session Management
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoURI,
      dbName: 'party-database',
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    },
  })
);

// Routes
const authRouter = require('./routes/auth');
const partyRouter = require('./routes/party');
const pollRouter = require('./routes/poll');

app.use('/api/auth', authRouter);
app.use('/api/party', partyRouter);
app.use('/api/poll', pollRouter);

// Display Movies
app.post('/api/displayMovies', async (req, res) => {
  try {
    const movies = await Movie.find({}).sort({ title: 1 }).exec();
    res.status(200).json(movies); // Ensure JSON response
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// Display Watched Movies
app.post('/api/displayWatchedMovies', async (req, res) => {
  const { partyID } = req.body;
  try {
    const polls = await Poll.find({ partyID, watchedStatus: 1 }).populate('movies.movieID');
    const movieIDs = polls.flatMap((poll) => poll.movies.map((movie) => movie.movieID));
    const movies = await Movie.find({ _id: { $in: movieIDs } });
    res.status(200).json(movies); // Ensure JSON response
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// Search Movies
app.post('/api/searchMovie', async (req, res) => {
  const { search } = req.body;
  try {
    const movies = await Movie.find({ title: new RegExp(search, 'i') });
    res.status(200).json(movies.map((movie) => movie.title)); // Ensure JSON response
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// Display User Account
app.post('/api/userAccount', async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user); // Ensure JSON response
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// Change Password
app.post('/api/changePassword', async (req, res) => {
  const { userId, newPassword, validatePassword } = req.body;
  const passwordRegex =
    /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,32}$/;

  if (newPassword !== validatePassword) {
    return res.status(400).json({ error: 'Passwords must match' });
  }
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({ error: 'Weak password' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isSamePassword = bcrypt.compareSync(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({ error: 'Password matches current password' });
    }
    user.password = bcrypt.hashSync(newPassword, 8);
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error Handling for 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// General Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
