const express = require("express");
const router = express.Router();

const Entity = require("../models/entity");

// POST endpoint to add a new entity
router.post("/entities", async (req, res) => {
  try {
    const { name, specialization, education } = req.body;

    // Create a new entity using the data from the request
    const newEntity = new Entity({
      name,
      specialization,
      education,
    });

    // Save the entity to the database
    await newEntity.save();

    // Respond with the saved entity
    res.status(201).json({
      status: "success",
      message: "New entity added successfully.",
      data: newEntity,
    });
  } catch (error) {
    console.error("Error adding entity:", error);
    res.status(500).json({ status: "error", message: "Failed to add entity" });
  }
});

// GET endpoint to retrieve all entities
router.get("/entities", async (req, res) => {
  try {
    const entities = await Entity.find(); // Retrieve all entities from the database
    res.status(200).json({
      status: "success",
      message: "Entities retrieved successfully.",
      data: entities,
    });
  } catch (error) {
    console.error("Error retrieving entities:", error);
    res.status(500).json({ status: "error", message: "Failed to retrieve entities" });
  }
});

module.exports = router;
