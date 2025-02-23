const express = require("express");
// const db = require("./config/database");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const tenantMiddleware = require("./middlewares/tenantMiddleware");

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
app.use(tenantMiddleware);

const PORT = process.env.PORT || 5104;

// Middleware for passing Socket.io to routes
app.use((req, res, next) => {
  req.io = io; // Attach `io` instance to the request object
  next();
});
let activeAdmins = {}; // Track active admin sessions
let tenantAdmins = {}; // Stores active admin sessions per tenant

io.on("connection", (socket) => {
  console.log("a user connected");

  // Emit a message back to the client (for testing)
  socket.emit("message", "Welcome to the WebSocket server!");

  // socket.on("disconnect", () => {
  //   console.log("user disconnected");
  // });

  socket.on("admin_login", ({ adminId, tenantId }) => {
    console.log("tenantAdmins", { adminId, tenantId })
    if (!tenantAdmins[tenantId]) {
      tenantAdmins[tenantId] = { currentAdmin: null, activeSockets: [] };
    }

    if (
      tenantAdmins[tenantId].currentAdmin &&
      tenantAdmins[tenantId].currentAdmin !== adminId
    ) {
      // Logout all previous admin sessions for this tenant
      tenantAdmins[tenantId].activeSockets.forEach((sock) =>
        io.to(sock).emit("force_logout")
      );
      tenantAdmins[tenantId].activeSockets = []; // Clear previous sessions
    }

    tenantAdmins[tenantId].currentAdmin = adminId;
    tenantAdmins[tenantId].activeSockets.push(socket.id);
    io.emit("active_admins", tenantAdmins); // Notify frontend
  });

  socket.on("logout", ({ tenantId }) => {
    if (tenantAdmins[tenantId]) {
      console.log("reove ", tenantId)
      tenantAdmins[tenantId].activeSockets = tenantAdmins[tenantId].activeSockets.filter(
        (id) => id !== socket.id
      );
      if (tenantAdmins[tenantId].activeSockets.length === 0) {
        delete tenantAdmins[tenantId];
      }
      io.emit("active_admins", tenantAdmins);
    }
  });

  socket.on("disconnect", () => {
    Object.keys(tenantAdmins).forEach((tenantId) => {
      tenantAdmins[tenantId].activeSockets = tenantAdmins[tenantId].activeSockets.filter(
        (id) => id !== socket.id
      );
      if (tenantAdmins[tenantId].activeSockets.length === 0) {
        delete tenantAdmins[tenantId];
      }
    });
    io.emit("active_admins", tenantAdmins);
  });



});

// Use routes after setting up Socket.IO
app.use("/api", roomRoutes, doctorRoutes, screenContentRoutes, authRoutes, entityRoutes, uploadRoutes, clientRoutes);

// Start the server
server.listen(PORT, () => {
  console.log(`Server started at: http://localhost:${PORT}`);
});
