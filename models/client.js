const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  client_name: String,
  client_image_url: String,
  settings: {
    clock_type: String
  }
});

module.exports = ClientSchema;
