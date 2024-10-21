const mongoose = require("mongoose");

const orderBookSchema = new mongoose.Schema({
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
  targetPrice: {
    type: Number,
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
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  filledQuantity: {
    type: Number,
    default: 0,
  },
  filledPrice: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OrderBook = mongoose.model("OrderBook", orderBookSchema);
module.exports = OrderBook;
