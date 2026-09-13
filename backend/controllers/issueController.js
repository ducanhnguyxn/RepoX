const Issue = require("../models/issueModel");
const Repository = require("../models/repoModel");
const mongoose = require("mongoose");


async function createIssue(req, res) {
  const { title, description, repository } = req.body;

  try {
    if (!title || !description || !repository) {
      return res.status(400).json({ error: "Title, description, and repository are required" });
    }

    const repoExists = await Repository.findById(repository);
    if (!repoExists) {
      return res.status(404).json({ error: "Repository not found" });
    }

    const issue = new Issue({ title, description, repository });
    const result = await issue.save();

    res.status(201).json({ message: "Issue created", issue: result });
  } catch (error) {
    console.error("Create issue error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function getAllIssues(req, res) {
  try {
    const issues = await Issue.find().populate("repository");
    
    res.status(200).json(issues || []);
  } catch (error) {
    console.error("Get all issues error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}




async function getIssueById(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid issue ID" });
    }

    const issue = await Issue.findById(id).populate("repository");
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    res.status(200).json(issue);
  } catch (error) {
    console.error("Get issue by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid issue ID" });
    }

    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    if (title) issue.title = title;
    if (description) issue.description = description;
    if (status && ["open", "closed"].includes(status)) issue.status = status;

    const updated = await issue.save();
    res.status(200).json({ message: "Issue updated", issue: updated });
  } catch (error) {
    console.error("Update issue error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function deleteIssueById(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid issue ID" });
    }

    const issue = await Issue.findByIdAndDelete(id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    res.status(200).json({ message: "Issue deleted", issue });
  } catch (error) {
    console.error("Delete issue error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssueById,
  deleteIssueById,
};
