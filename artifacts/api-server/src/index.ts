import app from "./app.js";
import { logger } from "./lib/logger.js";

const port = parseInt(process.env.PORT ?? "3001", 10);

app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "TypeBlitz API server started");
});
