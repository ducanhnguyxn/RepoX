const fs = require('fs').promises;
const path = require('path');
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".repox");
    const commitsPath = path.join(repoPath, "commits");

    try {
        // Check if S3 is configured
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.S3_BUCKET) {
            console.log("AWS S3 not configured, using local storage only");
            const commitDirs = await fs.readdir(commitsPath);
            console.log(`Found ${commitDirs.length} commits locally`);
            return;
        }

        console.log("Pulling commits from S3...");
        const data = await s3.listObjectsV2({
            Bucket: S3_BUCKET,
            Prefix: "commits/",
        }).promise();

        const objects = data.Contents || [];
        console.log(`Found ${objects.length} files in S3`);

        for (const object of objects) {
            const key = object.Key;
            const localPath = path.join(repoPath, key);
            const commitDir = path.dirname(localPath);

            // Create directory structure
            await fs.mkdir(commitDir, { recursive: true });

            // Download file from S3
            const params = {
                Bucket: S3_BUCKET,
                Key: key,
            };

            const fileContent = await s3.getObject(params).promise();
            await fs.writeFile(localPath, fileContent.Body);
            console.log(`Downloaded: ${key}`);
        }
        console.log("Successfully pulled all commits from S3");
    } catch (error) {
        console.error("Error pulling from S3:", error);
        // Fallback to local storage check
        try {
            const commitDirs = await fs.readdir(commitsPath);
            console.log(`Fallback: Found ${commitDirs.length} commits in local storage`);
        } catch (localError) {
            console.error("Error accessing local commits:", localError);
        }
    }
}

module.exports = {pullRepo};