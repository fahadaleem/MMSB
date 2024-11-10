const express = require("express");
const db = require("./config/database");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");

const roomRoutes = require("./routes/roomRoutes/roomRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const authRoutes = require("./routes/authRoutes");
const screenContentRoutes = require("./routes/screenContentRoutes");
const entityRoutes = require("./routes/entityRoutes");

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = socketIO(server, {
  cors: {
    origin: "*", // Allow all origins, adjust as needed for security
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5104;

// Middleware for passing Socket.io to routes
app.use((req, res, next) => {
  req.io = io; // Attach `io` instance to the request object
  next();
});

app.use("/api", roomRoutes, doctorRoutes, screenContentRoutes, authRoutes, entityRoutes);

app.listen(PORT, () => {
  console.log("Server started at: ", PORT);
});
