
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config(); // To load environment variables

const app = express();
const server = http.createServer(app); // Create HTTP server for socket.io
// Initialize socket.io with the HTTP server
const port = process.env.PORT || 5000;
const corsOptions = {
  origin: 'http://localhost:3000', // Allow only requests from Next.js frontend
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
const io = socketIo(server, {
  cors: corsOptions,
});

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});



// Define the User model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Add name to schema
  email: { type: String, required: true, unique: true },
  userid: { type: String, required: true, unique: true }, // Add userId to schema
  password: { type: String, required: true },
  profilePic: { type: String },
});

const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);



app.use(cors(corsOptions));
app.use(express.json()); // To parse JSON request bodies





app.post('/api/signup', async (req, res) => {
  const { name, email, userid, password } = req.body;

  if (!name || !email || !userid || !password) {
    return res.status(400).json({ message: 'All fields are required' });

  }
if (!userid.trim()) {
    return res.status(400).json({ message: 'User ID cannot be empty' });
  }
  try {
    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if userId already exists
    const existingUserByUserId = await User.findOne({ userid });
    if (existingUserByUserId) {
      return res.status(400).json({ message: 'User ID already exists' });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      userid,
      password: hashedPassword,
    });

    // Save the new user
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name }, // Include the user's name in the payload
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token will expire in 1 hour
    );
    // Send the token in the response
    res.status(200).json({ token,user: {
      name: user.name, // Send the user's name along with the token
      email: user.email,
      userId: user._id,
    }, });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/search', async (req, res) => {
  const { query } = req.query; // Get the search query from query parameters

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Search for users by name or userId (case-insensitive)
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Search by name (case-insensitive)
        { userid: { $regex: query, $options: 'i' } }, // Search by userId (case-insensitive)
      ],
    });

    res.status(200).json(users); // Return the found users
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/updateProfile', async (req, res) => {
  const { name, password, profilePic } = req.body;
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's profile details
    if (name) user.name = name;
    if (password) {
      // Hash the new password before saving it
      user.password = await bcrypt.hash(password, 10);
    }
    if (profilePic) user.profilePic = profilePic; // Update the profile picture

    // Save the updated user details to the database
    await user.save();
    

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/getUserProfile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send user details
    res.status(200).json({
      name: user.name,
      profilePic: user.profilePic || null, // Return the profile picture if available
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for "sendMessage" events from clients
  socket.on('sendMessage', async ({ senderId, recipientId, content }) => {
    try {
      // Save message to the database
      const newMessage = new Message({ sender: senderId, recipient: recipientId, content });
      await newMessage.save();

      // Emit the message to the recipient in real-time
      io.to(recipientId).emit('receiveMessage', {
        senderId,
        content,
        timestamp: newMessage.timestamp,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

app.get('/api/messages', async (req, res) => {
  const { userId, recipientId } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    }).sort({ timestamp: 1 }); // Sort by timestamp in ascending order

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


server.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
