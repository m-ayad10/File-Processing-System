const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const stream = require("stream");
const { promisify } = require("util");
const DirectoryModel = require("../Models/DirectoryModel");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const StarredModel = require("../Models/StarredModel");
const { fetchFolderSize } = require("./GetFolderSize");

const pipeline = promisify(stream.pipeline);

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_SECRET,
  },
});
const BUCKET_NAME = process.env.BUCKET_NAME;

const FileUpload = async (req, res) => {
  try {
    const folderPath = req.params[0];
    const file = req.file;
    const { userName } = req.body;

    // 1. Check if file already exists in DB
    const existingFile = await DirectoryModel.findOne({
      name: file.originalname,
      type: file.mimetype,
      parentPath: folderPath,
    });

    if (existingFile) {
      return res.status(409).json({
        message: "File already exists in this folder",
        success: false,
      });
    }

    const folderSizeMB = await fetchFolderSize(userName); // Ensure you await async call

    const fileSizeMB = file.size / (1024 * 1024); // Convert file size from bytes to MB

    if (folderSizeMB + fileSizeMB >= 100) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${folderPath}/${file.originalname}`,
      });

      await s3Client.send(deleteCommand);
      return res.status(409).json({
        message: "Upload exceeds 100 MB limit.",
        success: false,
      });
    }

    const newFile = new DirectoryModel({
      name: file.originalname,
      path: `${folderPath}/${file.originalname}`,
      parentPath: folderPath,
      type: file.mimetype,
    });

    await newFile.save();

    const updatedFolderData = await DirectoryModel.find({
      parentPath: folderPath,
    });

    return res.status(200).json({
      message: "File uploaded successfully",
      success: true,
      data: updatedFolderData,
    });
  } catch (err) {
    console.error("File upload error:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
const downloadFile = async (req, res) => {
  try {
    const filePath = req.params[0];

    if (!filePath || filePath.includes("..")) {
      return res
        .status(400)
        .json({ message: "Invalid file path", success: false });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
    });

    const response = await s3Client.send(command);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filePath.split("/").pop()}"`
    );
    res.setHeader(
      "Content-Type",
      response.ContentType || "application/octet-stream"
    );
    res.setHeader("Content-Length", response.ContentLength);

    response.Body.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).end("File stream error");
    });

    response.Body.pipe(res);
  } catch (error) {
    if (error.name === "NoSuchKey") {
      return res
        .status(404)
        .json({ message: "File not found", success: false });
    }
    console.error("Download error:", error.stack || error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const listAllFiles = async (req, res) => {
  try {
    const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
    const response = await s3Client.send(command);
    const keys = response.Contents;

    res.json({ keys });
  } catch (error) {
    res.json({ error });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { path, parentPath } = req.body;
    const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: path });
    await s3Client.send(command);
    await DirectoryModel.findOneAndDelete({ path: path });
    await StarredModel.findOneAndDelete({ path });
    const folderData = await DirectoryModel.find({ parentPath });
    res
      .status(200)
      .json({
        message: "File deleted successfully",
        success: true,
        data: folderData,
      });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const SignedUrl = async (req, res) => {
  try {
    const path = req.params[0]; // if your route is router.get("/*", SignedUrl)

    if (!path) {
      return res.status(400).json({
        message: "Missing file path in request",
        success: false,
      });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    }); // 1 hour expiry

    res.status(200).json({
      success: true,
      message: "Signed URL generated",
      url: signedUrl,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  FileUpload,
  downloadFile,
  listAllFiles,
  deleteFile,
  SignedUrl,
};
