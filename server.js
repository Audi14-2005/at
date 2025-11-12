// server.js
const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Your MongoDB connection string (with # encoded as %23)
const MONGO_URI = "mongodb+srv://atspeaks_db_user:Atspeaks%232819@cluster0.9b27gax.mongodb.net/atspeaks";

let connectionStatus = "Checking connection...";

// Try connecting to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB!");
    connectionStatus = "✅ MongoDB Connection Successful!";
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    connectionStatus = `❌ MongoDB Connection Failed: ${err.message}`;
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
