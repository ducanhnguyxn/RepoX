const Issue = require("../models/issueModel");
const Repository = require("../models/repoModel");

async function checkIssueOwner(req, res, next) {
  try {
    const issueId = req.params.id;
    const userId = req.user.userId;

    const issue = await Issue.findById(issueId).populate('repository');

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (!issue.repository) {
      return res.status(404).json({ message: "Repository not found for this issue" });
    }

    if (issue.repository.owner.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: "Only the repository owner can modify or delete this issue" 
      });
    }

    req.issue = issue;
    next();
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { checkIssueOwner };

