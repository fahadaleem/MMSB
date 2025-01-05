const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  room_id: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["occupied", "vacant"],
    required: true,
  },
  media_content: {
    format: {
      type: String,
      enum: ["video", "image", "text"], // Defines the type of media
    },
    url: {
      type: String,
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  floor_no: {
    type: Number,
  },
  meeting_agenda: {
    type: String,
  },
  entities: [
    {
      entity: {
        type: mongoose.Schema.Types.ObjectId, // Reference to an entity model, if needed
        ref: "Entity",
      },
      check_in: {
        type: Date,
        required: true,
      },
      check_out: {
        type: Date,
      },
    },
  ],
});

module.exports = RoomSchema;
