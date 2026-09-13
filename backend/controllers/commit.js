const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), ".repox");
  const stagedPath = path.join(repoPath, "staging"); 
  const commitPath = path.join(repoPath, "commits");

  try {
    const commitId = uuidv4();
    const commitDir = path.join(commitPath, commitId);
    await fs.mkdir(commitDir, { recursive: true });

    const files = await fs.readdir(stagedPath);
    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      ); // added await
    }

    const commitData = {
      message,
      date: new Date().toISOString()
    };

    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify(commitData, null, 2) 
    );

    console.log(`Commit ${commitId} created with ${message}`);
  } catch (error) {
    console.error("Error committing files:", error);
  }
}

module.exports = { commitRepo };
