// routes/auth.js
const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, password, client_name, client_img_url } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ status: "error", message: "User already exists" });
    }

    // Create a new user
    user = new User({ name, email, password, client_name, client_img_url });

    // Save user to database
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

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
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne({ email });

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

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
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

// Change Password Route
router.patch("/update-profile", async (req, res) => {
  const { email, current_password, new_password, client_name, client_img_url } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // If the current_password and new_password are provided, validate and update the password
    if (current_password && new_password) {
      const isMatch = await user.matchPassword(current_password);
      if (!isMatch) {
        return res.status(400).json({
          status: "error",
          message: "Current password is incorrect",
        });
      }

      // Update the user's password
      user.password = new_password;
    }

    // Update client_name if provided
    if (client_name) {
      user.client_name = client_name;
    }

    // Update client_img_url if provided
    if (client_img_url) {
      user.client_img_url = client_img_url;
    }

    // Save the updated user details
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

module.exports = router;
