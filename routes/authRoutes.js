// routes/auth.js
const express = require("express");
const User = require("../models/user");
const Client = require("../models/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, password, client_name, client_image_url } = req.body;
  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ status: "error", message: "User already exists" });
    }

    // Check if the client already exists
    let client = await Client.findOne({ client_name });

    // If client doesn't exist, create a new client
    if (!client) {
      client = new Client({ client_name, client_image_url });
      await client.save();
    }

    // Create a new user and associate it with the client
    user = new User({ name, email, password, client: client._id }); // Add client reference to user

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
        client: { client_name: client.client_name, client_image_url: client.client_image_url },
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne({ email }).populate("client"); // Populate client info

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
      client: user.client
        ? { client_name: user.client.client_name, client_image_url: user.client.client_image_url }
        : null,
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

router.patch("/update-profile", async (req, res) => {
  const { email, current_password, new_password, client_name, client_image_url } = req.body;

  try {
    // Check if the request is to update both user and client fields
    let user;
    let client;
    user = await User.findOne({ email });
    if (client_image_url) {
      client = await Client.findById(user.client); // Assuming client email is unique
      if (!client) {
        return res.status(404).json({
          status: "error",
          message: "Client not found",
        });
      }

      // Update client_img_url if provided
      if (client_image_url) {
        await client.updateOne({ client_image_url });
      }
    }

    // If the current_password and new_password are provided, validate and update the password
    if (current_password && new_password) {
      user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      const isMatch = await user.matchPassword(current_password);
      if (!isMatch) {
        return res.status(400).json({
          status: "error",
          message: "Current password is incorrect",
        });
      }

      // Update the user's password
      user.password = new_password;

      // Save the updated user details
      await user.save();
    }

    // Send a combined success response

    user = await User.findOne({ email }).populate("client");
    user = { ...user.toObject() };
    delete user["password"];

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully!!",
      data: {
        ...user,
      },
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
