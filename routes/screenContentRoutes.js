const express = require("express");
const router = express.Router();
const Room = require("../models/room"); // Ensure correct path to Room model
const Doctor = require("../models/doctor"); // Import Doctor model to verify doctor exists

// API to create a new room
router.post("/screen-content", async (req, res) => {
  try {
    const { room_id, status, doctor_id, media_content } = req.body;

    // Validate required fields
    if (!room_id || !status) {
      return res
        .status(400)
        .json({ status: "error", message: "room_id and status are required" });
    }

    // Check if the room already exists
    let room = await Room.findOne({ room_id });

    // If room doesn't exist, create a new room
    if (!room) {
      if (status === "occupied" && !doctor_id) {
        return res.status(400).json({
          status: "error",
          message: "doctor_id is required for occupied rooms",
        });
      }
      if (
        status === "vacant" &&
        (!media_content || !media_content.format || !media_content.url)
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "media_content with format and url is required for vacant rooms",
        });
      }

      // If the room is occupied, verify doctor exists
      if (status === "occupied") {
        const doctor = await Doctor.findById(doctor_id);
        if (!doctor) {
          return res
            .status(404)
            .json({ status: "error", message: "Doctor not found" });
        }
      }

      // Create new room object
      room = new Room({
        room_id,
        status,
        doctor_id: status === "occupied" ? doctor_id : null,
        media_content: status === "vacant" ? media_content : null,
      });

      // Save the new room to the database
      await room.save();

      return res.status(201).json({
        status: "success",
        message: "Room created successfully",
        room,
      });
    }

    // If room exists, update it based on status
    if (status === "occupied") {
      if (!doctor_id) {
        return res.status(400).json({
          status: "error",
          message: "doctor_id is required for occupied rooms",
        });
      }

      // Verify the doctor exists
      const doctor = await Doctor.findById(doctor_id);
      if (!doctor) {
        return res
          .status(404)
          .json({ status: "error", message: "Doctor not found" });
      }

      // Update room to be occupied with doctor details
      room.status = "occupied";
      room.doctor_id = doctor_id;
      room.media_content = null; // Clear media content if room is now occupied
    } else if (status === "vacant") {
      if (!media_content || !media_content.format || !media_content.url) {
        return res.status(400).json({
          status: "error",
          message:
            "media_content with format and url is required for vacant rooms",
        });
      }

      // Update room to be vacant with media content
      room.status = "vacant";
      room.media_content = media_content;
      room.doctor_id = null; // Clear doctor_id if room is now vacant
    }

    // Save the updated room information
    await room.save();

    res.status(200).json({
      status: "success",
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/screen-content/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    // Find the room by room_id
    const room = await Room.findOne({ room_id: roomId }).populate(
      "doctor_id",
      "name specialization education availability"
    ); // Populate doctor details
    console.log(room, "testing!!");
    // Check if room exists
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Prepare response based on room status
    let responseContent;

    if (room.status === "occupied") {
      responseContent = {
        status: "success",
        data: {
          status: room.status,
          doctor: {
            name: room.doctor_id.name,
            specialization: room.doctor_id.specialization,
            education: room.doctor_id.education,
            availability: room.doctor_id.availability,
          },
        },
      };
    } else if (room.status === "vacant") {
      responseContent = {
        status: "success",
        data: {
          status: room.status,
          media_content: room.media_content,
        },
      };
    }

    // Return the content for the screen
    res.status(200).json(responseContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
