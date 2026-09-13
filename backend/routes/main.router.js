const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");

const mainRouter = express.Router();

// Routers with base paths
mainRouter.use("/api", userRouter);
mainRouter.use("/api", repoRouter);
mainRouter.use("/api", issueRouter);

// Root route
mainRouter.get("/", (req, res) => {
  res.send("Welcome");
});

module.exports = mainRouter;
