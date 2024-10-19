const Room = require("../../models/room");

const express = require("express");

const router = express.Router();

// Add or update room information
router.post("/rooms", async (req, res) => {
  try {
    const {
      status = "vacant",
      room_code,
      hospital_id,
      assigned_doctor_id,
      study_id,
      timing,
      advertisement_id,
    } = req.body;

    // Create new room
    room = new Room({
      status,
      room_code,
      hospital_id,
      assigned_doctor_id,
      study_id,
      timing,
      advertisement_id,
    });
    await room.save();
    res.status(200).json({
      message: "new room added successfully",
      data: room,
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Failed to add/update room", message: error.message });
  }
});
// Update existing room
router.put("/rooms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      room_code,
      hospital_id,
      assigned_doctor_id,
      study_id,
      timing,
      advertisement_id,
    } = req.body;

    // Use updateOne to update the room in a single operation
    const result = await Room.updateOne(
      { _id: id }, // filter the room by room_id
      {
        $set: {
          status,
          room_code,
          hospital_id,
          assigned_doctor_id,
          study_id,
          timing,
          advertisement_id,
        },
      }
    );

    if (result.nModified === 0) {
      return res
        .status(404)
        .json({ error: "Room not found or no changes made." });
    }

    // find the updated record
    const updatedRoom = await Room.findOne({ _id: id });
    res
      .status(200)
      .json({ message: "Room updated successfully", data: updatedRoom });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update room" });
  }
});

module.exports = router;
