const Repository = require("../models/repoModel");

async function checkRepoOwner(req, res, next) {
  try {
    const repoId = req.params.id;
    const userId = req.user.userId;

    const repository = await Repository.findById(repoId);

    if (!repository) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (repository.owner.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: "You don't have permission to perform this action" 
      });
    }

    req.repository = repository;
    next();
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { checkRepoOwner };

