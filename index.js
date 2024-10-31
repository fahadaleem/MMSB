const express = require("express");
const db = require("./config/database");
const app = express();
const cors = require("cors");

const roomRoutes = require("./routes/roomRoutes/roomRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const authRoutes = require("./routes/authRoutes");
const screenContentRoutes = require("./routes/screenContentRoutes");

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5104;

app.use("/api", roomRoutes, doctorRoutes, screenContentRoutes, authRoutes);

app.listen(PORT, () => {
  console.log("Server started at: ", PORT);
});
