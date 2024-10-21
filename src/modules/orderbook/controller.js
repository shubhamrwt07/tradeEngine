const Schema = require("./schema");

exports.addOrder = async (req, res) => {
  try {
    const order = req.body;
    await Schema.create(req.body);
    res.status(200).json({ message: "added successfully" });
  } catch (error) {
    res.status(500).json({ message: "error", error });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const _id = req.body._id;
    await Schema.findByIdAndDelete(_id);
    res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "error", error });
  }
};

exports.getorders = async (req, res) => {
  try {
    const orderbook = await Schema.find();
    res.status(200).json({ orderbook });
  } catch (error) {
    res.status(500).json({ message: "error", error });
  }
};
