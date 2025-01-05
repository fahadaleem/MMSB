const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DoctorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  education: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures that the email is unique for each doctor
    match: [/.+\@.+\..+/, "Please enter a valid email address"], // Basic email validation
  },
  contact_number: {
    type: String,
    required: true,
    match: [/^\d{10,15}$/, "Please enter a valid contact number"], // Validates a number with 10-15 digits
  },
});

module.exports = DoctorSchema;
