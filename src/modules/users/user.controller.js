const User = require("./user.model");

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ message: "User created successfully", user: user });
  } catch (error) {
    console.error("Error creating user: ", error.message);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};
