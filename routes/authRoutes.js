// routes/auth.js
const express = require("express");
// const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const User = req.db.model("User");
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ status: "error", message: "User already exists" });
    }

    // Create a new user and associate it with the client
    user = new User({ name, email, password }); // Add client reference to user

    // Hash password before saving
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Remove password from user data before sending response
    user = { ...user.toObject() };
    delete user["password"];

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        ...user,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});
router.post("/register-users", async (req, res) => {
  const users = req.body.users; // Expecting an array of users [{ name, email, password }, ...]
  
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ status: "error", message: "Invalid user data" });
  }

  try {
    const User = req.db.model("User");
    const existingUsers = await User.find({ email: { $in: users.map(u => u.email) } });

    // Filter out users that already exist
    const newUsers = users.filter(user => !existingUsers.some(eu => eu.email === user.email));

    if (newUsers.length === 0) {
      return res.status(400).json({ status: "error", message: "All users already exist" });
    }

    // Hash passwords
    const bcrypt = require("bcryptjs");
    const hashedUsers = await Promise.all(
      newUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    // Insert new users into the database
    const createdUsers = await User.insertMany(hashedUsers);

    // Generate JWT tokens for each user
    const usersWithTokens = createdUsers.map(user => ({
      ...user.toObject(),
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }),
    }));

    res.status(201).json({
      status: "success",
      message: `${createdUsers.length} users created successfully`,
      data: usersWithTokens.map(({ password, ...user }) => user), // Remove passwords before sending response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const User = req.db.model("User");
    // Check if the user exists
    let user = await User.findOne({ email }); // Populate client info

    if (!user) {
      return res.status(400).json({ status: "error", message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ status: "error", message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    user = { ...user.toObject() };
    delete user["password"];

    // Include client information in the response
    const responseData = {
      ...user,
      token,
    };

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      data: responseData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Change Password Route

router.patch("/change-password", async (req, res) => {
  const { email, current_password, new_password } = req.body;

  try {
    const User = req.db.model("User");
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Verify the current password
    const isMatch = await user.matchPassword(current_password);
    if (!isMatch) {
      return res.status(400).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    // Update the user's password
    user.password = new_password;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

module.exports = router;
