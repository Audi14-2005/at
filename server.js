// server.js
require('dotenv').config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require("mongoose");

const app = express();

// Get MongoDB URI from environment variables
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/atspeaks";

let connectionStatus = "Checking connection...";
let isConnected = false;

// MongoDB Connection Handler
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("Using existing MongoDB connection");
    return mongoose.connection.getClient();
  }

  try {
    console.log("🔌 Attempting to connect to MongoDB Atlas...");
    
    const options = {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    };

    // Create a new MongoClient
    const client = new MongoClient(MONGO_URI, options);
    
    // Connect the client to the server
    await client.connect();
    
    // Set up Mongoose connection
    await mongoose.connect(MONGO_URI, {
      ...options,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log("✅ Successfully connected to MongoDB Atlas!");
    isConnected = true;
    connectionStatus = "✅ MongoDB Connection Successful!";
    
    return client;
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    connectionStatus = `❌ MongoDB Error: ${error.message}`;
    isConnected = false;
    throw error;
  }
};

// Handle connection in Vercel serverless environment
let client;
if (process.env.VERCEL) {
  // In Vercel, we want to connect on each request
  app.use(async (req, res, next) => {
    try {
      client = await connectDB();
      req.dbClient = client;
      next();
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).send('Database connection error');
    }
  });
} else {
  // In development, maintain a persistent connection
  connectDB().catch(console.error);
}

// Close the connection when the Node process ends
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  }
});

// Serverless-compatible connection handling
if (process.env.VERCEL) {
  // For Vercel, handle connection per-request
  app.use(async (req, res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) { // 1 = connected
        await connectDB();
      }
      next();
    } catch (error) {
      console.error('Connection error:', error);
      next(error);
    }
  });
} else {
  // For local development, maintain persistent connection
  connectDB();
  
  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
    connectionStatus = `❌ MongoDB Error: ${err.message}`;
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    connectionStatus = "❌ MongoDB Disconnected";
    isConnected = false;
    // Only attempt to reconnect in non-serverless environment
    if (!process.env.VERCEL) {
      setTimeout(connectDB, 5000);
    }
  });
}

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
