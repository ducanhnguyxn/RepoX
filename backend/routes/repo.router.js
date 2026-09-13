const express = require("express");
const repoController = require("../controllers/repoController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { checkRepoOwner } = require("../middleware/checkRepoOwner");

const repoRouter = express.Router();

repoRouter.post("/create", authenticateToken, repoController.createRepository);

// Specific routes MUST come before parameterized routes
repoRouter.get("/repo/all", authenticateToken, repoController.getAllRepository);
repoRouter.get("/repo/name/:name", authenticateToken, repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userID", authenticateToken, repoController.fetchRepositoryForCurrentUser);

// File operations - specific routes before :id
repoRouter.get("/repo/:id/files", authenticateToken, repoController.getRepositoryFiles);
repoRouter.post("/repo/:id/files", authenticateToken, checkRepoOwner, repoController.addFileToRepo);
repoRouter.get("/repo/:id/files/:filePath", authenticateToken, repoController.getFileContent);
repoRouter.delete("/repo/:id/files/:filePath", authenticateToken, checkRepoOwner, repoController.deleteFileFromRepo);

// Parameterized routes come last
repoRouter.get("/repo/:id", authenticateToken, repoController.fetchRepositoryById);
repoRouter.put("/repo/update/:id", authenticateToken, checkRepoOwner, repoController.updateRepositoryById);
repoRouter.delete("/repo/delete/:id", authenticateToken, checkRepoOwner, repoController.deleteRepositoryById);
repoRouter.patch("/repo/update/:id", authenticateToken, checkRepoOwner, repoController.toggleVisibilityById);

module.exports = repoRouter;