const fs = require("fs-extra");
const path = require("path");
const archiver = require("archiver");
const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");


const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.ACCESS_SECRET,
    },
  });
  const BUCKET_NAME = process.env.BUCKET_NAME;

// Download folder as zip
const DownloadFolder= async (req, res) => {
  const folderKey = req.params[0]; // e.g. 'projects/demo'
  
  const tempFolder = path.join(__dirname, "temp", folderKey); // temp/projects/demo
  const zipPath = path.join(__dirname, "temp", `${path.basename(folderKey)}.zip`);

  try {
    // Step 1: List all S3 objects with the given prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${folderKey}/`, // trailing slash to limit to the folder
    });
    const listedObjects = await s3Client.send(listCommand);
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return res.status(404).json({ message: "Folder not found", success: false });
    }
    console.log('step 1');
    
    // Step 2: Download each file to temp directory
    for (const object of listedObjects.Contents) {
      const key = object.Key;
      console.log(key);
      
      if (key.endsWith("/")) continue; // skip empty folders

      const localPath = path.join(__dirname, "temp", key);
      await fs.ensureDir(path.dirname(localPath));

      const getCommand = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
      const s3File = await s3Client.send(getCommand);
      await fs.writeFile(localPath, await streamToBuffer(s3File.Body));
    }

    console.log('step 2');
    
    // Step 3: Zip the downloaded folder
    await zipFolder(path.join(__dirname, "temp", folderKey), zipPath);

    console.log('step 3');
    let stat;
    try {
      stat = fs.statSync(zipPath);
      res.setHeader('Content-Length', stat.size);
    } catch (err) {
      console.error('Stat error:', err);
      return res.status(500).json({ message: "Error preparing file", success: false });
    }
    
    // Step 4: Send the zip file
    res.download(zipPath, `${path.basename(folderKey)}.zip`, async (err) => {
      // Optional: cleanup temp files after sending
      await fs.remove(path.join(__dirname, "temp"));
      if (err) {
        console.error("Download error:", err);
      }
    });
    console.log('step 4');
    
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
}

// Helper to stream to buffer
const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

// Helper to zip a folder
const zipFolder = (sourceFolder, outPath) => {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const output = fs.createWriteStream(outPath);

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(sourceFolder, false);
    archive.finalize();
  });
};

module.exports = {DownloadFolder}
