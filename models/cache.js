const CacheSchema = new Schema({
  room_id: { type: String, required: true, unique: true }, // Reference to Room schema
  cached_data: { type: Object }, // JSON containing cached room data
  last_fetched: { type: Date, default: Date.now },
  expiry_time: { type: Date }, // Cache expiration time
});

module.exports = mongoose.model("Cache", CacheSchema);
