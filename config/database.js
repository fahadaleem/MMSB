const mongoose = require("mongoose");
require("dotenv").config();

const connectionString =
  "mongodb+srv://muhammadfahadaleem:ImGlGuQHFGlWJPPM@cluster0.poek6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

module.exports = mongoose.connection;
