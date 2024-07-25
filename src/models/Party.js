const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Party Schema
const PartySchema = new Schema({
  partyName: {
    type: String,
    required: true,
  },
  hostID: {
    type: Schema.Types.ObjectId,  
    ref: 'User',
    required: true,
  },
  partyInviteCode: {
    type: String,
    required: true,
    unique: true,
  },
});

const Party = mongoose.model('Party', PartySchema);

module.exports = Party;
