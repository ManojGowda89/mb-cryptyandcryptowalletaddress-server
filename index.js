require('dotenv').config();
const express = require("express");
const cors = require("cors");

const connectDB = require("mb64-connect");
const Wallet = require('./walletmodel.js');

connectDB(process.env.MONGODB_URI); // Use the environment variable for MongoDB URI

const app = express();
const port = process.env.PORT || 3000; // Use the environment variable for the port

app.use(cors());
app.use(express.json()); // Add this to parse JSON bodies

// Route to create or update wallet address
app.post("/create", async (req, res) => {
  const { crypto, walletAddress } = req.body;

  // Debugging log
  console.log("Received data:", req.body);

  try {
    if (typeof walletAddress !== 'string') {
      return res.status(400).json({ message: 'walletAddress should be a string' });
    }

    const result = await Wallet.findOne({ crypto });

    if (result) {
      // If crypto exists, add the new wallet address to the array if it doesn't already exist
      if (!result.walletAddress.includes(walletAddress)) {
        result.walletAddress.push(walletAddress);
        await result.save();
        res.status(200).json({ message: 'Wallet address added to existing crypto', result });
      } else {
        res.status(400).json({ message: 'Wallet address already exists for this crypto' });
      }
    } else {
      // If crypto does not exist, create a new document
      const newWallet = new Wallet({ crypto, walletAddress: [walletAddress] });
      const savedWallet = await newWallet.save();
      res.status(201).json({ message: 'New crypto and wallet address created', savedWallet });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to fetch wallet addresses by crypto
app.get("/wallets/:crypto", async (req, res) => {
  const { crypto } = req.params;

  try {
    const result = await Wallet.findOne({ crypto });

    if (result) {
      res.status(200).json({ Crypto: result.crypto, walletAddresses: result.walletAddress });
    } else {
      res.status(404).json({ message: 'Crypto not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New route to fetch all cryptos
app.get("/cryptos", async (req, res) => {
  try {
    // Find all documents in the Wallet collection and extract the crypto field
    const wallets = await Wallet.find({}, 'crypto');
    const cryptos = wallets.map(wallet => wallet.crypto);

    res.status(200).json({ cryptos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New route to keep the server active
app.get("/ping", (req, res) => {
  console.log('Ping received');
  res.status(200).json({ message: 'Server is active' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
