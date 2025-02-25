const mongoose = require("mongoose");

const connections = {}; // Cache connections for tenants

async function getTenantConnection(tenantId, connectionString) {
  if (connections[tenantId]) {
    return connections[tenantId];
  }

  const connection = mongoose.createConnection(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,  // Force TLS usage
    tlsAllowInvalidCertificates: false, // Ensure proper certificate validation
  });

  // Example of binding models dynamically
  connection.model("User", require("../models/user")); // Add your models here
  connection.model("Doctor", require("../models/doctor"));
  connection.model("Client", require("../models/client"));
  connection.model("Entity", require("../models/entity"));
  connection.model("Room", require("../models/room"));

  connections[tenantId] = connection;
  return connection;
}

module.exports = { getTenantConnection };
