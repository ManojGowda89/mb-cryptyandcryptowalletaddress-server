const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  crypto: {
    type: String,
    required: true,
    unique: true
  },
  walletAddress: {
    type: [String],  // Define this as an array of strings
    default: []
  }
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
    