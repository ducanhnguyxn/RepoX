const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (issues && !mongoose.Types.ObjectId.isValid(issues)) {
      return res.status(400).json({ error: "Invalid issue id" });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues,
    });

    const result = await newRepository.save();

    res.status(201).json({
      message: "Repo created ",
      repositoryId: result._id,
    });
  } catch (error) {
    console.error("Create repository error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getAllRepository(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    res.status(200).json(repositories);
  } catch (error) {
    console.error("Get all repositories error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function fetchRepositoryById(req, res) {
  const repoID = req.params.id;
  try {
    const repository = await Repository.findById(repoID)
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ message: "Repository not found" });
    }

    res.status(200).json(repository);
  } catch (error) {
    console.error("Fetch repository by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function fetchRepositoryByName(req, res) {
  const repoName = req.params.name; 
  try {
    const repository = await Repository.findOne({ name: repoName })
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ message: "Repository not found" });
    }

    res.status(200).json(repository);
  } catch (error) {
    console.error("Fetch repository by name error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function fetchRepositoryForCurrentUser(req, res) {
  const userId = req.params.userID; // Get from URL parameter

  try {
    const repositories = await Repository.find({ owner: userId })
      .populate("owner")
      .populate("issues");

    if (!repositories || repositories.length === 0) {
      return res.status(200).json({ message: "No repositories found", repositories: [] });
    }

    res.status(200).json({ message: "Repositories found", repositories });
  } catch (error) {
    console.error("Error during fetching repository:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    
    if (content) {
      if (!Array.isArray(repository.content)) {
        repository.content = []; 
      }
      repository.content.push(content);
    }

    if (description) {
      repository.description = description;
    }

    const updated = await repository.save();

    res.status(200).json({ message: "Repository updated successfully", repository: updated });
  } catch (error) {
    console.error("Error during updating repository:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    repository.visibility = repository.visibility === "public" ? "private" : "public";

    const updated = await repository.save();

    res.status(200).json({
      message: `Repository visibility toggled to ${updated.visibility}`,
      repository: updated,
    });
  } catch (error) {
    console.error("Error during toggling visibility:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function deleteRepositoryById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findByIdAndDelete(id);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    res.status(200).json({
      message: "Repository deleted successfully",
      repository, 
    });
  } catch (error) {
    console.error("Error during deleting repository:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


// Git-like operations for repositories
async function addFileToRepo(req, res) {
  const { id } = req.params;
  const { fileName, content, path: filePath } = req.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    // Initialize files array if it doesn't exist
    if (!repository.files) {
      repository.files = [];
    }

    // Check if file already exists
    const existingFileIndex = repository.files.findIndex(
      file => file.path === (filePath || fileName)
    );

    const fileObject = {
      name: fileName,
      path: filePath || fileName,
      content: content,
      lastModified: new Date(),
      size: content.length
    };

    if (existingFileIndex !== -1) {
      // Update existing file
      repository.files[existingFileIndex] = fileObject;
    } else {
      // Add new file
      repository.files.push(fileObject);
    }

    await repository.save();

    res.status(200).json({ 
      message: "File added successfully", 
      file: fileObject,
      repository 
    });
  } catch (error) {
    console.error("Error adding file to repository:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getRepositoryFiles(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id).populate("owner");
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    res.status(200).json({ 
      files: repository.files || [],
      repository: {
        id: repository._id,
        name: repository.name,
        description: repository.description,
        owner: repository.owner
      }
    });
  } catch (error) {
    console.error("Error fetching repository files:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getFileContent(req, res) {
  const { id, filePath } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    const file = repository.files?.find(f => f.path === filePath);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.status(200).json({ file });
  } catch (error) {
    console.error("Error fetching file content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteFileFromRepo(req, res) {
  const { id, filePath } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    if (!repository.files) {
      return res.status(404).json({ error: "File not found" });
    }

    repository.files = repository.files.filter(f => f.path !== filePath);
    await repository.save();

    res.status(200).json({ 
      message: "File deleted successfully",
      repository 
    });
  } catch (error) {
    console.error("Error deleting file from repository:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createRepository,
  getAllRepository,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoryForCurrentUser,
  updateRepositoryById,
  deleteRepositoryById,
  toggleVisibilityById,
  addFileToRepo,
  getRepositoryFiles,
  getFileContent,
  deleteFileFromRepo,
};
