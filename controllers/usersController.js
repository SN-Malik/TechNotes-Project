const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get all users
// @route Get /users
// @access Private

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.status(200).json(users);
});

// @desc create new user
// @route POST /users
// @access Private

const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;
  // Confirm Data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for Duplicate
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate UserName" });
  }

  // Hash Password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const userObject = { username, password: hashedPwd, roles };

  // Create and store new User
  const user = await User.create(userObject);

  if (user) {
    //created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid User Data received" });
  }
});

// @desc update a user
// @route PATCH /users
// @access Private

const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;
  // Confirm Data

  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  // Check for Duplicate
  const duplicate = await User.findOne({ username }).lean().exec();
  // Allow updated to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate User name" });
  }
  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    //Hash password
    user.password = await bcrypt.hash(password, 10); //salt rounds
  }
  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @desc delete a user
// @route DELETE /users
// @access Private

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }
  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const reply = `Username ${user.username} with ID ${user._id} deleted`;
  const result = await User.deleteOne();

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
