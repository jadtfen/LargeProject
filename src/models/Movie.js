const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  movieID: { type: Number, unique: true },
  title: { type: String, required: true },
  genre: { type: String, required: true },
  description: { type: String, required: true },
});

const Movie = mongoose.model('Movie', movieSchema, 'movie'); // Ensure 'movie' is the correct collection name

module.exports = Movie;
