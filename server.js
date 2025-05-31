const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io'); // Add Socket.IO for real-time communication
require('dotenv').config();

const app = express();
const server = require('http').createServer(app); // Create HTTP server for Socket.IO
const io = new Server(server); // Initialize Socket.IO

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public')); // Serve static files from a 'public' directory

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Response Schema
const responseSchema = new mongoose.Schema({
  userCode: { type: String, required: true, unique: true },
  Round1: {
    decisions: [{
      card: String,
      decision: String,
      timeSpent: Number,
      round: Number
    }],
    policyChecks: [{
      card: String,
      round: Number,
      time: Date
    }],
    ipAddress: String,
    browser: String,
    device: String,
    timestamp: Date
  },
  Round2: {
    decisions: [{
      card: String,
      decision: String,
      timeSpent: Number,
      round: Number
    }],
    policyChecks: [{
      card: String,
      round: Number,
      time: Date
    }],
    ipAddress: String,
    browser: String,
    device: String,
    timestamp: Date
  },
  Round3: {
    decisions: [{
      card: String,
      decision: String,
      timeSpent: Number,
      round: Number
    }],
    policyChecks: [{
      card: String,
      round: Number,
      time: Date
    }],
    ipAddress: String,
    browser: String,
    device: String,
    timestamp: Date
  },
  Round4: {
    decisions: [{
      card: String,
      decision: String,
      timeSpent: Number,
      round: Number
    }],
    policyChecks: [{
      card: String,
      round: Number,
      time: Date
    }],
    ipAddress: String,
    browser: String,
    device: String,
    timestamp: Date
  },
  Round5: {
    decisions: [{
      card: String,
      decision: String,
      timeSpent: Number,
      round: Number
    }],
    policyChecks: [{
      card: String,
      round: Number,
      time: Date
    }],
    ipAddress: String,
    browser: String,
    device: String,
    timestamp: Date
  },
  Round6: {
    decisions: [{
      card: String,
      decision: String,
      timeSpent: Number,
      round: Number
    }],
    policyChecks: [{
      card: String,
      round: Number,
      time: Date
    }],
    ipAddress: String,
    browser: String,
    device: String,
    timestamp: Date
  },
  currentRound: { type: Number, default: 1 } // Track the current round
});

const Response = mongoose.model('Response', responseSchema);

// Socket.IO Logic for Round Transitions
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinGame', async ({ userCode }) => {
    const responseData = await Response.findOne({ userCode });
    const currentRound = responseData ? responseData.currentRound || 1 : 1;
    socket.join(userCode); // Join a room based on userCode
    socket.emit('gameState', { currentRound });
    console.log(`User ${userCode} joined, current round: ${currentRound}`);
  });

  socket.on('submitResponse', async ({ userCode, decisions, policyChecks, ipAddress, browser, device, timestamp, round }) => {
    console.log(`Received submitResponse for user ${userCode}, round ${round}`);
    try {
      if (!userCode || !round) throw new Error('Missing userCode or round');

      const roundField = `Round${round}`;
      let responseData = await Response.findOne({ userCode });
      if (!responseData) responseData = new Response({ userCode });

      responseData[roundField] = {
        decisions,
        policyChecks,
        ipAddress,
        browser,
        device,
        timestamp
      };

      // Check if this is the last submission for the round (e.g., all decisions submitted)
      const isRoundComplete = decisions.length > 0 && policyChecks.length > 0; // Adjust condition based on your game logic
      if (isRoundComplete && round < 6) {
        responseData.currentRound = round + 1;
        await responseData.save();
        io.to(userCode).emit('startNextRound', { currentRound: round + 1 });
        console.log(`Advanced ${userCode} to round ${round + 1}`);
      } else {
        await responseData.save();
        console.log(`Saved response for ${userCode}, round ${round}`);
      }

      socket.emit('responseSaved', { message: 'Response saved successfully', currentRound: responseData.currentRound });
    } catch (error) {
      console.error('Error processing submitResponse:', error.message, error.stack);
      socket.emit('error', { message: 'Error saving response', error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.post('/save-response', async (req, res) => {
  console.log('Received POST request with body:', req.body);
  try {
    if (!req.body || !req.body.userCode || !req.body.round) {
      throw new Error('Missing userCode or round in request body');
    }

    const { userCode, decisions, policyChecks, ipAddress, browser, device, timestamp, round } = req.body;
    const roundField = `Round${round}`;

    let responseData = await Response.findOne({ userCode });
    if (!responseData) responseData = new Response({ userCode });

    responseData[roundField] = {
      decisions,
      policyChecks,
      ipAddress,
      browser,
      device,
      timestamp
    };

    await responseData.save();
    console.log('Successfully saved response:', responseData._id);
    res.status(200).json({ message: 'Response saved successfully', id: responseData._id });
  } catch (error) {
    console.error('Error processing save-response:', error.message, error.stack);
    res.status(500).json({ message: 'Error saving response', error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});