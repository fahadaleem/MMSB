const Room = require("../../models/room");

const express = require("express");

const router = express.Router();

// utility
function getRoomStatus(roomDetails) {
  const currentTime = new Date();
  console.log(currentTime);
  // Check each entity's check-in and check-out times
  const isOccupied = roomDetails.entities.some((entity) => {
    const checkInTime = entity.check_in ? new Date(entity.check_in) : null;
    const checkOutTime = entity.check_out ? new Date(entity.check_out) : null;

    // Only check if both check-in and check-out times are valid dates
    return checkInTime && checkOutTime && currentTime >= checkInTime && currentTime <= checkOutTime;
  });

  // Return the room status based on the result
  return isOccupied ? "occupied" : "vacant";
}

// Add or update room information
router.post("/rooms", async (req, res) => {
  try {
    const {
      room_id, // Room unique identifier
      status = "vacant", // Default to "vacant" if not provided
      media_content, // Object containing {format, url} for media content
      floor_no, // Floor number where the room is located
      meeting_agenda,
      entities, // Array of entities with {entity_id, check_in, check_out} for each
    } = req.body;

    let isRoomUpdate = false;
    // Check if a room with the same room_id already exists
    let room = await Room.findOne({ room_id });

    if (room) {
      isRoomUpdate = true;
      // If room exists, update the existing room
      room.status = status;
      room.media_content = media_content;
      room.floor_no = floor_no;
      room.meeting_agenda = meeting_agenda;
      room.updated_at = Date.now(); // Update the 'updated_at' timestamp

      // If entities are provided, update the entities array
      if (entities && Array.isArray(entities)) {
        room.entities = entities;
      }
    } else {
      // If room doesn't exist, create a new one
      room = new Room({
        room_id,
        status,
        media_content,
        floor_no,
        meeting_agenda,
        entities, // Initialize entities with the provided data
      });
    }

    // Save the room (either updated or newly created)
    await room.save();
    req.io.emit("roomUpdate", room);

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
// router.put("/rooms/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, room_code, hospital_id, assigned_doctor_id, study_id, timing, advertisement_id } = req.body;

//     // Use updateOne to update the room in a single operation
//     const result = await Room.updateOne(
//       { _id: id }, // filter the room by room_id
//       {
//         $set: {
//           status,
//           room_code,
//           hospital_id,
//           assigned_doctor_id,
//           study_id,
//           timing,
//           advertisement_id,
//         },
//       }
//     );

//     if (result.nModified === 0) {
//       return res.status(404).json({ error: "Room not found or no changes made." });
//     }

//     // find the updated record
//     const updatedRoom = await Room.findOne({ _id: id });
//     res.status(200).json({ message: "Room updated successfully", data: updatedRoom });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Failed to update room" });
//   }
// });

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
