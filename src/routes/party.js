const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Party = require('../models/Party');
const PartyMembers = require('../models/PartyMembers');
const Poll = require('../models/Poll');
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://lyrenee02:tSGwv9viMBFajw3u@cluster.muwwbsd.mongodb.net/party-database?retryWrites=true&w=majority&appName=cluster';
const client = new MongoClient(url);

// Helper function to generate a unique party code
const generateUniquePartyCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const existingParty = await Party.findOne({ partyInviteCode: code });
    if (!existingParty) {
      isUnique = true;
    }
  }
  return code;
};

// Route to edit party name
router.post('/EditPartyName', async (req, res) => {
  const { newPartyName, hostID } = req.body;

  if (!hostID) {
    return res.status(400).json({ message: 'Host ID is required' });
  }

  try {
    const party = await Party.findOne({ hostID });

    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }

    party.partyName = newPartyName;
    await party.save();

    res.status(200).json({ message: 'Party name updated successfully', party });
  } catch (err) {
    console.error('Error updating party name:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Route to create a party and poll
router.post('/create', async (req, res) => {
  const { partyName, userId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'User ID not provided' });
  }

  try {
    // Check if the user already has a party
    const existingParty = await Party.findOne({ hostID: userId });

    if (existingParty) {
      return res.status(200).json({
        message: 'User already has a party',
        partyInviteCode: existingParty.partyInviteCode,
        partyID: existingParty._id,
      });
    }

    // Generate a unique party code
    const partyInviteCode = await generateUniquePartyCode();

    // Create a new party with the provided name and generated invite code
    const newParty = new Party({
      partyName,
      hostID: userId, // Ensure your schema still supports this field
      partyInviteCode,
    });

    const savedParty = await newParty.save();

    res.status(201).json({
      message: 'Party created successfully',
      partyInviteCode: savedParty.partyInviteCode,
    });
  } catch (err) {
    console.error('Error creating party:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Route to get home page details
router.get('/home', async (req, res) => {
  const { partyID } = req.query;
  console.log(`Fetching home page for partyID: ${partyID}`);

  try {
    const party = await Party.findById(partyID).populate('hostID');
    if (!party) {
      console.log('Party not found');
      return res.status(404).json({ error: 'Party not found' });
    }

    console.log('Party found:', party);

    const guests = await PartyMembers.find({ partyID }).populate('userI');
    console.log('Guests found:', guests);

    const guestDetails = guests.map((guest) => ({
      userName: guest.userId.name,
      userEmail: guest.userId.email,
    }));
    console.log('Guest details:', guestDetails);

    const polls = await Poll.find({ partyID });
    console.log('Polls found:', polls);

    const moviesWithDetails = await Promise.all(
      polls.map(async (poll) => {
        return await Promise.all(
          poll.movies.map(async (movieEntry) => {
            const movie = await Movie.findOne({ movieID: movieEntry.movieID });
            if (!movie) {
              console.log('Movie not found for movieID:', movieEntry.movieID);
              return null;
            }
            return {
              movieName: movie.title,
              votes: movieEntry.votes,
              watchedStatus: movieEntry.watchedStatus,
              genre: movie.genre,
              description: movie.description,
            };
          })
        );
      })
    );

    const topVotedMovie = moviesWithDetails.flat().reduce((top, movie) => {
      if (!movie) return top;
      return movie.votes > (top.votes || 0) ? movie : top;
    }, {});

    res.status(200).json({
      partyName: party.partyName,
      partyInviteCode: party.partyInviteCode,
      hostName: party.hostID.name,
      guests: guestDetails,
      topVotedMovie: topVotedMovie.movieName || 'No votes yet',
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Route to join a party
router.post('/joinParty', async (req, res) => {
  const { partyInviteCode, userId } = req.body;
  const db = client.db('party-database');

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const party = await Party.findOne({ partyInviteCode });
    if (!party) {
      console.log('Invalid party invite code');
      return res.status(400).json({ error: 'Invalid code' });
    }

    const userObjectId = new ObjectId(userId);
    const partyObjectId = new ObjectId(party._id);

    const existingMember = await db
      .collection('PartyMembers')
      .findOne({ userI: userObjectId, partyID: partyObjectId });
    if (existingMember) {
      console.log('User is already a member of the party');
      return res
        .status(400)
        .json({ message: 'User is already a member of the party' });
    }

    const newMember = {
      userId: userObjectId,
      partyID: partyObjectId,
    };

    const insertResult = await db
      .collection('PartyMembers')
      .insertOne(newMember);
    console.log('Insert result:', insertResult);

    const updateResult = await db
      .collection('users')
      .updateOne({ _id: userObjectId }, { $set: { status: 1 } });

    res.status(200).json({
      userId: userId,
      partyID: party._id,
      message: 'Joined party successfully',
    });
  } catch (e) {
    console.error('Error joining party:', e);
    res.status(500).json({ error: e.toString() });
  }
});

module.exports = router;
