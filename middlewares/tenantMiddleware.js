const axios = require("axios");
const { getTenantConnection } = require("../config/database");

async function tenantMiddleware(req, res, next) {
  const tenantId = req.headers["x-tenant"]; // Extract tenant ID from headers
  if (!tenantId) {
    return res.status(400).json({ error: "Tenant ID is missing in the headers." });
  }

  try {
    // Fetch the connection string from an external server
    // `https://bop-api.futurconnect.cloud/tenant/${tenantId}`
    const response = await axios.get(`${process.env.TENANT_API}/tenant/${tenantId}`);
    const connectionString = response.data.tenant_database_string;
    if (!connectionString) {
      return res.status(500).json({ error: "Connection string not found for tenant." });
    }

    // Get the tenant's connection
    const connection = await getTenantConnection(tenantId, connectionString);
    // Attach the tenant's connection to the request object
    req.db = connection;

    next();
  } catch (error) {
    console.error("Error in tenant middleware:", error);
    res.status(500).json({ error: "Error establishing database connection." });
  }
}

module.exports = tenantMiddleware;
