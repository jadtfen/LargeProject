const API_URL = 'https://lighthearted-moxie-82edfd.netlify.app/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Used to register new users. POST request that expects an email, name, and password
export const register = async (email, name, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, name, password }),
  });
  return handleResponse(response);
};

// Used to login new users. POST request that expects an email and password.
// The generated token is stored for the specific user for later use that requires stricter authentication.
export const login = async (email, password) => {
  console.log('Sending login request', { email, password });
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Include credentials in the request
  });
  return handleResponse(response);
};

// Creates a party. POST request that requires a party name. Token is required from the user (they have to be logged in) in order to create a party.
export const createParty = async (partyName) => {
  const response = await fetch(`${API_URL}/party/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ partyName }),
    credentials: 'include', // Include credentials in the request
  });
  return handleResponse(response);
};

// Allows a user to join a party. POST request that expects the party invite code and user ID.
export const joinParty = async (partyInviteCode, userID) => {
  const response = await fetch(`${API_URL}/party/joinParty`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ partyInviteCode, userID }),
    credentials: 'include', // Include credentials in the request
  });
  return handleResponse(response);
};

// Gets the homepage of the party. GET request that expects the partyID as a query parameter.
export const getPartyHomePage = async (partyID) => {
  const response = await fetch(`${API_URL}/party/home?partyID=${partyID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include credentials in the request
  });
  return handleResponse(response);
};

// Edits the party name. POST request that requires the new party name and host ID.
export const editPartyName = async (newPartyName, hostID) => {
  const response = await fetch(`${API_URL}/party/EditPartyName`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newPartyName, hostID }),
    credentials: 'include', // Include credentials in the request
  });
  return handleResponse(response);
};

// Allows a user to leave a party. POST request that expects the user ID and party ID.
export const leaveParty = async (userID, partyID) => {
  const response = await fetch(`${API_URL}/party/leaveParty`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userID, partyID }),
    credentials: 'include', // Include credentials in the request
  });
  return handleResponse(response);
};

// Gets the vote page for a specific poll ID. GET request that expects the pollID as a query parameter.
export const getVotePage = async (pollID) => {
  const response = await fetch(`${API_URL}/poll/votePage?pollID=${pollID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include credentials in the request
  });
  return handleResponse(response);
};

// Adds a movie to a poll. POST request that requires partyID and movieID.
export const addMovieToPoll = async (partyID, movieID) => {
  const response = await fetch(`${API_URL}/poll/addMovieToPoll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ partyID, movieID }),
    credentials: 'include', // Include credentials in the request
  });
  return handleResponse(response);
};

// Upvotes a movie in a poll. POST request that requires partyID and movieID.
export const upvoteMovie = async (partyID, movieID) => {
  const response = await fetch(`${API_URL}/poll/upvoteMovie`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ partyID, movieID }),
    credentials: 'include', // Include credentials in the request
  });
  return handleResponse(response);
};

// Removes a movie from a poll. DELETE request that requires partyID and movieID.
export const removeMovieFromPoll = async (partyID, movieID) => {
  const response = await fetch(`${API_URL}/poll/removeMovie`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ partyID, movieID }),
    credentials: 'include', // Include credentials in the request
  });
  return handleResponse(response);
};

// Marks a movie as watched in a poll. POST request that requires partyID and movieID.
export const markMovieAsWatched = async (partyID, movieID) => {
  const response = await fetch(`${API_URL}/poll/markWatched`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ partyID, movieID }),
    credentials: 'include', // Include credentials in the request
  });
  return handleResponse(response);
};
