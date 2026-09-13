const fs = require('fs').promises;
const path = require('path');
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pushRepo() {
    const repoPath = path.resolve(process.cwd(), ".repox");
    const commitsRoot = path.join(repoPath, "commits");

    try {
        // Check if S3 is configured
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.S3_BUCKET) {
            console.log("AWS S3 not configured, using local storage only");
            const commitDirs = await fs.readdir(commitsRoot);
            console.log(`Found ${commitDirs.length} commits (local storage)`);
            return;
        }

        const commitDirs = await fs.readdir(commitsRoot);
        console.log(`Pushing ${commitDirs.length} commits to S3...`);

        for (const commitDir of commitDirs) {
            const commitFolderPath = path.join(commitsRoot, commitDir);
            const files = await fs.readdir(commitFolderPath);

            for (const file of files) {
                const filePath = path.join(commitFolderPath, file);
                const fileContent = await fs.readFile(filePath);

                const params = {
                    Bucket: S3_BUCKET,
                    Key: `commits/${commitDir}/${file}`,
                    Body: fileContent,
                };

                await s3.upload(params).promise();
                console.log(`Uploaded: commits/${commitDir}/${file}`);
            }
        }
        console.log("Successfully pushed all commits to S3");
    } catch (error) {
        console.error("Error pushing to S3:", error);
        // Fallback to local storage message
        try {
            const commitDirs = await fs.readdir(commitsRoot);
            console.log(`Fallback: Found ${commitDirs.length} commits in local storage`);
        } catch (localError) {
            console.error("Error accessing local commits:", localError);
        }
    }
}

module.exports = { pushRepo };
