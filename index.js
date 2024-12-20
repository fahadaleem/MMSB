const express = require("express");
const db = require("./config/database");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const roomRoutes = require("./routes/roomRoutes/roomRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const authRoutes = require("./routes/authRoutes");
const screenContentRoutes = require("./routes/screenContentRoutes");
const entityRoutes = require("./routes/entityRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const clientRoutes = require("./routes/clientRoutes");

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin (adjust as necessary)
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

io.on("connection", (socket) => {
  console.log("a user connected");

  // Emit a message back to the client (for testing)
  socket.emit("message", "Welcome to the WebSocket server!");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Use routes after setting up Socket.IO
app.use("/api", roomRoutes, doctorRoutes, screenContentRoutes, authRoutes, entityRoutes, uploadRoutes, clientRoutes);

// Start the server
server.listen(PORT, () => {
  console.log(`Server started at: http://localhost:${PORT}`);
});
