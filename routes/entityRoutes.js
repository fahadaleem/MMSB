const express = require("express");
const router = express.Router();

// const Entity = require("../models/entity");

// POST endpoint to add a new entity
router.post("/entities", async (req, res) => {
  try {
    const Entity = req.db.model("Entity");
    const { name, specialization, education, image } = req.body;

    // Create a new entity using the data from the request
    const newEntity = new Entity({
      name,
      specialization,
      education,
      image,
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

router.get("/entities", async (req, res) => {
  try {
    const Entity = req.db.model("Entity");

    // Extract page and limit from query parameters; set defaults if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);

    let entities;
    let totalEntities = await Entity.countDocuments();

    if (limit === -1) {
      // If limit is -1, retrieve all entities without pagination
      entities = await Entity.find();
    } else {
      // Calculate the starting index of the items for the current page
      const startIndex = (page - 1) * (limit || 10);
      // Retrieve entities with pagination
      entities = await Entity.find()
        .skip(startIndex)
        .limit(limit || 10);
    }

    res.status(200).json({
      status: "success",
      message: "Entities retrieved successfully.",
      data: entities,
      pagination:
        limit === -1
          ? null
          : {
              currentPage: page,
              totalPages: Math.ceil(totalEntities / (limit || 10)),
              totalItems: totalEntities,
              itemsPerPage: limit || 10,
            },
    });
  } catch (error) {
    console.error("Error retrieving entities:", error);
    res.status(500).json({ status: "error", message: "Failed to retrieve entities" });
  }
});

// PUT endpoint to update an entity
router.put("/entities/:id", async (req, res) => {
  try {
    const Entity = req.db.model("Entity");
    const { id } = req.params;
    const updateData = req.body;

    // Update the entity with the provided data
    const updatedEntity = await Entity.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Validate data before updating
    });

    if (!updatedEntity) {
      return res.status(404).json({
        status: "error",
        message: "Entity not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Entity updated successfully.",
      data: updatedEntity,
    });
  } catch (error) {
    console.error("Error updating entity:", error);
    res.status(500).json({ status: "error", message: "Failed to update entity" });
  }
});

router.delete("/entities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Entity = req.db.model("Entity");

    // Find the entity by ID and delete it
    const deletedEntity = await Entity.findByIdAndDelete(id);

    if (!deletedEntity) {
      return res.status(404).json({
        status: "error",
        message: "Entity not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Entity deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting entity:", error);
    res.status(500).json({ status: "error", message: "Failed to delete entity" });
  }
});

module.exports = router;
