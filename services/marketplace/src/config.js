const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  env: process.env.NODE_ENV || "development",
  serviceName: "superapp-marketplace",
  apiVersion: "v1",
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 50,
  },
};

module.exports = config;
