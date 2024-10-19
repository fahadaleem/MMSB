const AdvertisementSchema = new Schema({
  advertisement_id: { type: String, required: true, unique: true },
  content_url: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], required: true },
  display_duration: { type: Number }, // Duration in seconds
  target_room_ids: [{ type: String }], // List of rooms where the ad is shown
});

module.exports = mongoose.model("Advertisement", AdvertisementSchema);
