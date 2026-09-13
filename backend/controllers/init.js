const fs = require("fs").promises;
const path = require("path");

async function initRepo() {
    const repoPath = path.resolve(process.cwd(), ".repox");
    const commitsPath = path.join(repoPath, "commits");

    try {
        await fs.mkdir(repoPath, { recursive: true });
        await fs.mkdir(commitsPath, { recursive: true });

        await fs.writeFile(
            path.join(repoPath, "config.json"),
            JSON.stringify({ initialized: true, timestamp: new Date().toISOString() }, null, 2) 
        );

        console.log("Repository initialized");
    } catch (error) {
        console.error("Error initializing repository", error);
    }
}

module.exports = { initRepo };
