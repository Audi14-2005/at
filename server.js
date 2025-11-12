// server.js
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Get MongoDB URI from environment variables
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/atspeaks";

let connectionStatus = "Checking connection...";

// MongoDB Connection Options
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log("✅ Connected to MongoDB!");
    connectionStatus = "✅ MongoDB Connection Successful!";
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    connectionStatus = `❌ MongoDB Connection Failed: ${err.message}`;
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Initial connection
connectDB();

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
  connectionStatus = `❌ MongoDB Error: ${err.message}`;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  connectionStatus = "❌ MongoDB Disconnected";
  // Try to reconnect
  setTimeout(connectDB, 5000);
});

// Home route
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>MongoDB Connection Test</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #f0f4f8;
          }
          .card {
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            background: white;
            text-align: center;
          }
          h1 { color: #333; }
          .success { color: green; }
          .fail { color: red; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>MongoDB Connection Status</h1>
          <p class="${connectionStatus.includes('✅') ? 'success' : 'fail'}">${connectionStatus}</p>
        </div>
      </body>
    </html>
  `);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
