const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Wallet",
  },
  coinId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Coin",
  },
  orderType: {
    type: String,
    enum: ["buy", "sell"],
    required: true,
  },
  marketPrice: {
    type: Number,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["matched", "closed"],
    default: "matched",
  },
  filledQuantity: {
    type: Number,
    default: 0,
  },
  filledPrice: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const History = mongoose.model("History", historySchema);
module.exports = History;
