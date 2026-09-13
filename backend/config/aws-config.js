const AWS = require('aws-sdk');

// Configure AWS with environment variables or defaults
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();

const S3_BUCKET = process.env.S3_BUCKET || "repoxp";

module.exports = {s3, S3_BUCKET};