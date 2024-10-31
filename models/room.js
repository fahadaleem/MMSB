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
  checkin_time: {
    type: Date,
  },
  checkout_time: {
    type: Date,
  },
  floor_no: {
    type: Number,
  },
  meeting_agenda: {
    type: String,
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
});

module.exports = mongoose.model("Room", RoomSchema);
