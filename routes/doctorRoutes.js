const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctor"); // Make sure to adjust the path based on your project structure

// API to create a new doctor
router.post("/doctor", async (req, res) => {
  try {
    const {
      name,
      specialization,
      education,
      availability,
      email,
      contact_number,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !specialization ||
      !education ||
      !availability ||
      !email ||
      !contact_number
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if a doctor with the same email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res
        .status(409)
        .json({
          status: "error",
          message: "Doctor with this email already exists",
        });
    }

    // Create new doctor object
    const newDoctor = new Doctor({
      name,
      specialization,
      education,
      availability,
      email,
      contact_number,
    });

    // Save the doctor to the database
    await newDoctor.save();

    // Return the saved doctor
    res.status(201).json({
      message: "Doctor created successfully",
      doctor: newDoctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
