import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";
import { config } from "./config/env.js";

const start = async () => {
  // Connect to MongoDB first — app is useless without it
  await connectDB();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
  });

  // Graceful shutdown — finish in-flight requests before exit
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("✅ HTTP server closed");
      process.exit(0);
    });
    // Force exit if shutdown takes too long
    setTimeout(() => process.exit(1), 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Catch unhandled promise rejections (last resort)
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
    shutdown("unhandledRejection");
  });
};

start();
