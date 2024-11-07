const mongoose = require("mongoose");

const entitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
  },
  education: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Entity = mongoose.model("Entity", entitySchema);

module.exports = Entity;
