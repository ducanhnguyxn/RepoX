const express = require("express");
const issueController = require("../controllers/issueController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { checkIssueOwner } = require("../middleware/checkIssueOwner");

const issueRouter = express.Router();

issueRouter.post("/issue/create", authenticateToken, issueController.createIssue);
issueRouter.get("/issue/all", authenticateToken, issueController.getAllIssues);
issueRouter.get("/issue/:id", authenticateToken, issueController.getIssueById);
issueRouter.put("/issue/:id", authenticateToken, checkIssueOwner, issueController.updateIssueById);
issueRouter.delete("/issue/:id", authenticateToken, checkIssueOwner, issueController.deleteIssueById);

module.exports = issueRouter;