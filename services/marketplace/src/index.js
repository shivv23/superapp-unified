const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config");
const marketplaceRoutes = require("./routes/marketplace");
const { notFound, errorHandler } = require("./middleware/common");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use(`/api/${config.apiVersion}`, marketplaceRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[${config.serviceName}] running on port ${config.port} [${config.env}]`);
});
