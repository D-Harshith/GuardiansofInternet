const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

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
  }
});

const Response = mongoose.model('Response', responseSchema);

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
    if (!responseData) {
      responseData = new Response({ userCode });
    }

    // Update the specific round field
    responseData[roundField] = {
      decisions,
      policyChecks,
      ipAddress,
      browser,
      device,
      timestamp
    };

    const savedResponse = await responseData.save();
    console.log('Successfully saved response:', savedResponse._id);
    res.status(200).json({ message: 'Response saved successfully', id: savedResponse._id });
  } catch (error) {
    console.error('Error processing save-response:', error.message, error.stack);
    res.status(500).json({ message: 'Error saving response', error: error.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});