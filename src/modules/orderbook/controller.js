const OrderBook = require("../orderbook/schema");
const User = require("../users/user.model");
const History = require("../history/historySchema");
const mongoose = require("mongoose");

async function matchOrder(newOrder) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let match;
    if (newOrder.orderType === "buy") {
      match = await OrderBook.findOne({
        orderType: "sell",
        marketPrice: { $lte: newOrder.marketPrice },
        status: "open",
      }).session(session);
    } else {
      match = await OrderBook.findOne({
        orderType: "buy",
        marketPrice: { $gte: newOrder.marketPrice },
        status: "open",
      }).session(session);
    }
    if (match) {
      const remainingQuantity = newOrder.quantity - match.quantity;
      if (remainingQuantity > 0) {
        newOrder.quantity -= match.quantity;
        newOrder.status = "open";
        match.status = "matched";

        await saveOrderHistory(newOrder, match, session, match.quantity);
        await executeTransaction(newOrder, match, session, match.quantity);
        await match.save({ session });
      } else if (remainingQuantity < 0) {
        match.quantity -= newOrder.quantity;
        newOrder.status = "matched";

        await saveOrderHistory(newOrder, match, session, newOrder.quantity);
        await executeTransaction(newOrder, match, session, newOrder.quantity);
        await newOrder.save({ session });
      } else {
        newOrder.status = "matched";
        match.status = "matched";

        await saveOrderHistory(newOrder, match, session, newOrder.quantity);
        await executeTransaction(newOrder, match, session, newOrder.quantity);
        await newOrder.save({ session });
        await match.save({ session });
      }
      if (newOrder.status === "matched") {
        await OrderBook.findByIdAndDelete(newOrder._id).session(session);
      }
      if (match.status === "matched") {
        await OrderBook.findByIdAndDelete(match._id).session(session);
      }
      await session.commitTransaction();
    } else {
      await newOrder.save({ session });
      await session.commitTransaction();
    }
  } catch (error) {
    await session.abortTransaction();
    console.error("Transaction failed: ", error.message);
    throw error;
  } finally {
    session.endSession();
  }
}

async function executeTransaction(buyOrder, sellOrder, session, quantity) {
  const buyer = await User.findById(buyOrder.userId).session(session);
  const seller = await User.findById(sellOrder.userId).session(session);

  const totalCost = quantity * sellOrder.marketPrice;
  console.log(
    `Buyer balance: ${buyer.balance}, Seller balance: ${seller.bitcoinBalance}`
  );
  console.log(`Total Cost: ${totalCost}, Quantity Sold: ${quantity}`);
  if (buyer.balance < totalCost) {
    throw new Error("Buyer does not have sufficient funds.");
  }
  if (seller.bitcoinBalance < quantity) {
    throw new Error("Seller does not have enough Bitcoin.");
  }

  buyer.balance -= totalCost;
  seller.balance += totalCost;

  buyer.bitcoinBalance += quantity;
  seller.bitcoinBalance -= quantity;

  await buyer.save({ session });
  await seller.save({ session });
}
async function saveOrderHistory(buyOrder, sellOrder, session, quantity) {
  const historyBuy = new History({
    userId: buyOrder.userId,
    walletId: buyOrder.walletId,
    coinId: buyOrder.coinId,
    orderType: "buy",
    quantity: quantity,
    marketPrice: sellOrder.marketPrice,
    status: "matched",
  });

  const historySell = new History({
    userId: sellOrder.userId,
    walletId: sellOrder.walletId,
    coinId: sellOrder.coinId,
    orderType: "sell",
    quantity: quantity,
    marketPrice: sellOrder.marketPrice,
    status: "matched",
  });

  await historyBuy.save({ session });
  await historySell.save({ session });
}

exports.addOrder = async (req, res) => {
  try {
    const newOrder = await OrderBook.create(req.body);
    await matchOrder(newOrder);
    const buyer = await User.findById(newOrder.userId);
    const seller = await User.findById(newOrder.userId);

    res.status(200).json({
      message: "Order processed successfully",
      order: newOrder,
      buyerBalance: buyer.balance,
      sellerBalance: seller.balance,
    });
  } catch (error) {
    console.error("Error processing order: ", error.message);
    res.status(500).json({ message: "Error", error: error.message });
  }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const _id = req.body._id;
    await OrderBook.findByIdAndDelete(_id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting order: ", error.message);
    res.status(500).json({ message: "Error", error: error.message });
  }
};

// Get Orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await OrderBook.find();
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders: ", error.message);
    res.status(500).json({ message: "Error", error: error.message });
  }
};
