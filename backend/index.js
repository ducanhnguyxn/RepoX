// index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

// Load environment variables
dotenv.config();

// Import your modules
const mainRouter = require("./routes/main.router.js");
const { initRepo } = require("./controllers/init.js");
const { addRepo } = require("./controllers/add.js");
const { commitRepo } = require("./controllers/commit.js");
const { pushRepo } = require("./controllers/push.js");
const { pullRepo } = require("./controllers/pull.js");
const { revertRepo } = require("./controllers/revert.js");

// Yargs CLI commands
yargs(hideBin(process.argv))
  .command("start", "Starts a new server", {}, startServer)
  .command("init", "Initialize a new repository", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to repository",
    (yargs) => {
      yargs.positional("file", { describe: "File to add", type: "string" });
    },
    (argv) => addRepo(argv.file)
  )
  .command(
    "commit <message>",
    "Commit the staged files",
    (yargs) => {
      yargs.positional("message", { describe: "Commit message", type: "string" });
    },
    (argv) => commitRepo(argv.message)
  )
  .command("push", "Push commits", {}, pushRepo)
  .command("pull", "Pull commits from repo", {}, pullRepo)
  .command(
    "revert <commitId>",
    "Revert to a specific commit",
    (yargs) => {
      yargs.positional("commitId", { describe: "Commit ID", type: "string" });
    },
    (argv) => revertRepo(argv.commitId)
  )
  .demandCommand(1, "Please provide at least one command")
  .help()
  .argv;

// Start server function
async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Enable CORS
  app.use(
    cors({
      origin: [
        "https://repox-frontend.onrender.com",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      credentials: true,
    })
  );

  // Parse JSON requests
  app.use(express.json());

  // Health check endpoint for Kubernetes/Render
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Connect to MongoDB
  const mongoURI = process.env.MONGO_URI;
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // Exit so Kubernetes pod knows something is wrong
  }

  // Main routes
  app.use("/", mainRouter);

  // Start server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
