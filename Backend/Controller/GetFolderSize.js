const { ListObjectsV2Command, S3Client } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_SECRET,
  },
});
const BUCKET_NAME = process.env.BUCKET_NAME;

const fetchFolderSize = async (folderPath) => {
  try {
    let continuationToken = undefined;
    let totalSizeInBytes = 0;

    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: folderPath.endsWith("/") ? folderPath : folderPath + "/",
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);

      if (response.Contents) {
        response.Contents.forEach((object) => {
          if (!object.Key.endsWith("/")) {
            totalSizeInBytes += object.Size || 0;
          }
        });
      }

      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken);

    const sizeInMB = totalSizeInBytes / (1024 * 1024);
    return sizeInMB.toFixed(2); // return as string with 2 decimal places
  } catch (error) {
    console.error("Error fetching folder size:", error);
    throw error;
  }
};

module.exports={fetchFolderSize}