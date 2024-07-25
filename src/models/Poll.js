const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Poll Schema
const pollSchema = new Schema({
  partyID: {
    type: Schema.Types.ObjectId,  // Ensure this matches the Party _id type
    ref: 'Party',
    required: true,
  },
  movies: [
    {
      movieID: {
        type: Schema.Types.ObjectId,  // Use ObjectId if referencing Movie schema
        ref: 'Movie',
        required: true,
      },
      votes: { type: Number, default: 0 },
      watchedStatus: { type: Boolean, default: false },
    },
  ],
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
