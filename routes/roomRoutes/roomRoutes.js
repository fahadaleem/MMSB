const Room = require("../../models/room");

const express = require("express");

const router = express.Router();

// Add or update room information
router.post("/rooms", async (req, res) => {
  try {
    const {
      room_id, // Room unique identifier
      status = "vacant", // Default to "vacant" if not provided
      media_content, // Object containing {format, url} for media content
      checkin_time, // Date of check-in
      checkout_time, // Date of check-out
      floor_no, // Floor number where the room is located
      meeting_agenda,
    } = req.body;

    let isRoomUpdate = false;
    // Check if a room with the same room_id already exists
    let room = await Room.findOne({ room_id });

    if (room) {
      isRoomUpdate = true;
      // If room exists, update the existing room
      room.status = status;
      room.media_content = media_content;
      room.checkin_time = checkin_time;
      room.checkout_time = checkout_time;
      room.floor_no = floor_no;
      room.meeting_agenda = meeting_agenda;
      room.updated_at = Date.now(); // Update the 'updated_at' timestamp
    } else {
      // If room doesn't exist, create a new one
      room = new Room({
        room_id,
        status,
        media_content,
        checkin_time,
        checkout_time,
        floor_no,
        meeting_agenda,
      });
    }

    // Save the room (either updated or newly created)
    await room.save();

    res.status(200).json({
      message: isRoomUpdate ? "Room updated successfully" : "New room added successfully",
      data: room,
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
// Update existing room
router.put("/rooms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, room_code, hospital_id, assigned_doctor_id, study_id, timing, advertisement_id } = req.body;

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
      return res.status(404).json({ error: "Room not found or no changes made." });
    }

    // find the updated record
    const updatedRoom = await Room.findOne({ _id: id });
    res.status(200).json({ message: "Room updated successfully", data: updatedRoom });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update room" });
  }
});

router.get("/rooms", async (req, res) => {
  try {
    // Fetch all rooms from the database
    const rooms = await Room.find({});

    // Return all room records
    res.status(200).json({
      message: "Rooms retrieved successfully",
      data: rooms,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;
