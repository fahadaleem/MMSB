const Room = require("../../models/room");
const moment = require("moment-timezone");

const express = require("express");

const router = express.Router();

// utility
function getRoomStatus(roomDetails) {
  // Get the current time in UTC
  const currentTime = new Date().toUTCString();

  // Check each entity's check-in and check-out times
  const isOccupied = roomDetails.entities.some((entity) => {
    // Assuming your local timezone is 'Asia/Karachi' (adjust based on your timezone)

    // Compare current UTC time with the time range (time1 to time2)

    const checkInTime = entity.check_in ? new Date(entity.check_in).toUTCString() : null;
    const checkOutTime = entity.check_out ? new Date(entity.check_out).toUTCString() : null;

    // // Only check if both check-in and check-out times are valid dates
    if (checkInTime && checkOutTime) {
      // Compare current UTC time with check-in and check-out times
      console.log(currentTime >= checkInTime, "currentTime >= checkInTime");
      console.log(currentTime <= checkOutTime, "currentTime <= checkOutTime");
      return currentTime >= checkInTime && currentTime <= checkOutTime;
    }

    return false; // If either time is invalid, skip this entity
  });
  // Return the room status based on the result
  return isOccupied ? "occupied" : "vacant";
}

// Add or update room information
// POST request: Create a new room if it doesn't already exist
router.post("/rooms", async (req, res) => {
  try {
    const { room_id, status = "vacant", media_content, floor_no, meeting_agenda, entities } = req.body;

    // Check if a room with the same room_id already exists
    let room = await Room.findOne({ room_id });

    if (room) {
      // Return an error if the room already exists
      return res.status(400).json({
        status: "error",
        message: "Room already exists.",
      });
    }

    // Create a new room if it doesn't already exist
    room = new Room({
      room_id,
      status,
      media_content,
      floor_no,
      meeting_agenda,
      entities,
    });

    // Save the new room
    await room.save();
    req.io.emit("roomUpdate", room);

    res.status(201).json({
      message: "New room added successfully",
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

// PUT request: Update existing room details
router.put("/rooms/:room_id", async (req, res) => {
  try {
    const { room_id } = req.params;
    const { status, media_content, floor_no, meeting_agenda, entities } = req.body;

    // Find the room by room_id
    let room = await Room.findOne({ room_id });

    if (!room) {
      // Return an error if the room doesn't exist
      return res.status(404).json({
        status: "error",
        message: "Room not found. Please create the room first before updating.",
      });
    }

    // Update room details
    room.status = status || room.status;
    room.media_content = media_content || room.media_content;
    room.floor_no = floor_no || room.floor_no;
    room.meeting_agenda = meeting_agenda || room.meeting_agenda;
    room.updated_at = Date.now();

    // Update entities if provided
    if (entities && Array.isArray(entities)) {
      room.entities = entities;
    }

    // Save the updated room
    await room.save();
    req.io.emit("roomUpdate", room);

    res.status(200).json({
      message: "Room updated successfully",
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

// DELETE request: Delete an existing room by room_id
router.delete("/rooms/:room_id", async (req, res) => {
  try {
    const { room_id } = req.params;

    // Find and delete the room by room_id
    const room = await Room.findOneAndDelete({ room_id });

    if (!room) {
      // Return an error if the room doesn't exist
      return res.status(404).json({
        status: "error",
        message: "Room not found. Unable to delete.",
      });
    }

    // Emit an event to notify about the room deletion
    req.io.emit("roomDeleted", room_id);

    res.status(200).json({
      message: "Room deleted successfully",
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

router.get("/rooms", async (req, res) => {
  try {
    // Extract page and limit from query parameters; set defaults if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);

    let rooms;
    const totalRooms = await Room.countDocuments();

    if (limit === -1) {
      // If limit is -1, retrieve all rooms without pagination
      rooms = await Room.find();
    } else {
      // Calculate the starting index of the items for the current page
      const startIndex = (page - 1) * (limit || 10);
      // Retrieve rooms with pagination
      rooms = await Room.find()
        .populate("entities.entity")
        .skip(startIndex)
        .limit(limit || 10);
    }

    rooms = rooms.map((room) => ({
      ...room.toObject(),
      status: getRoomStatus(room),
    }));

    res.status(200).json({
      status: "success",
      message: "Rooms retrieved successfully",
      data: rooms,
      pagination:
        limit === -1
          ? null
          : {
              currentPage: page,
              totalPages: Math.ceil(totalRooms / (limit || 10)),
              totalItems: totalRooms,
              itemsPerPage: limit || 10,
            },
    });
  } catch (error) {
    console.error("Error retrieving rooms:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get room information by room_id
router.get("/rooms/:id", async (req, res) => {
  try {
    const roomId = req.params.id;

    // Find the room by room_id
    const room = await Room.findOne({ room_id: roomId }).populate("entities.entity");

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }
    // setting room status based on check_in and checkout_time
    console.log("status:", getRoomStatus(room));
    room.status = getRoomStatus(room);

    res.status(200).json({
      status: "success",
      message: "Room retrieved successfully",
      data: room,
    });
  } catch (error) {
    console.error("Error retrieving room:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;
