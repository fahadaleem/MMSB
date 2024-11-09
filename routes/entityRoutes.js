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

// GET endpoint to retrieve paginated entities
router.get("/entities", async (req, res) => {
  try {
    // Extract page and limit from query parameters; set defaults if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the starting index of the items for the current page
    const startIndex = (page - 1) * limit;

    // Retrieve the entities from the database with pagination
    const entities = await Entity.find().skip(startIndex).limit(limit);

    // Get the total count of entities
    const totalEntities = await Entity.countDocuments();

    res.status(200).json({
      status: "success",
      message: "Entities retrieved successfully.",
      data: entities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalEntities / limit),
        totalItems: totalEntities,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error retrieving entities:", error);
    res.status(500).json({ status: "error", message: "Failed to retrieve entities" });
  }
});

module.exports = router;
