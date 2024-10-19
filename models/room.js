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
  doctor_id: {
    type: Schema.Types.ObjectId,
    ref: "Doctor", // Reference to the Doctor schema
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
});

module.exports = mongoose.model("Room", RoomSchema);
