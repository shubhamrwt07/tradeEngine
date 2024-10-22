const History = require("../history/historySchema");

exports.getHistory = async (req, res) => {
  try {
    const historyOrders = await History.find();
    res.status(200).json({ historyOrders });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};
