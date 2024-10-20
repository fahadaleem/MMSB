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
      required: function () {
        return this.status === "vacant"; // Media URL is required only if the room is vacant
      },
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
});

module.exports = mongoose.model("Room", RoomSchema);
