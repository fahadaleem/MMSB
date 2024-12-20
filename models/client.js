const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  client_name: String,
  client_image_url: String,
});

module.exports = mongoose.model("Client", ClientSchema);
