const express = require("express");
const router = express.Router();
// const Client = require("../models/client"); // Adjust path to Client model

// API to create a new client
router.post("/client", async (req, res) => {
  const { client_name, client_image_url } = req.body;
  try {
    const Client = req.db.model("Client");
    // Validate request body
    if (!client_name || !client_image_url) {
      return res.status(400).json({
        status: "error",
        message: "Client name and image URL are required",
      });
    }

    // Create a new client instance
    const newClient = new Client({
      client_name,
      client_image_url,
    });

    // Save the client to the database
    await newClient.save();

    res.status(201).json({
      status: "success",
      message: "Client created successfully",
      data: newClient,
    });
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

router.get("/client/:client_name", async (req, res) => {
  const { client_name } = req.params;

  try {
    const Client = req.db.model("Client");
    const client = await Client.findOne({ client_name });

    if (!client) {
      return res.status(404).json({
        status: "error",
        message: "Client not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: client,
    });
  } catch (error) {
    console.error("Error fetching client details:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

module.exports = router;
