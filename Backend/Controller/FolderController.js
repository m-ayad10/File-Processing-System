const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { pipeline } = require("stream/promises");
const archiver = require("archiver");
const {
  ListObjectsV2Command,
  GetObjectCommand,
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const DirectoryModel = require("../Models/DirectoryModel");
const StarredModel = require("../Models/StarredModel");

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_SECRET,
  },
});
const BUCKET_NAME = process.env.BUCKET_NAME;

const FetchFolder = async (req, res) => {
  try {
    const folderPath = req.params[0]; 
    if (!folderPath) {
      return res
        .status(400)
        .json({ message: "Folder path is required", success: false });
    }

    const routeUser = folderPath.split("/")[0];

    const token = req.cookies.token;
    const key = process.env.JWT_SECRET_KEY;
    const verify = jwt.verify(token, key);

    if (routeUser !== verify.userName) {
      return res.status(403).json({
        message: "Unauthorized access to this path.",
        success: false,
      });
    }

    const folderData = await DirectoryModel.find({ parentPath: folderPath });
    res
      .status(200)
      .json({ message: "Folder fetched", success: true, data: folderData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", success: false, error });
  }
};

const CreateFolder = async (req, res) => {
  try {
    const folderPath = req.params[0];
    const { folderName } = req.body;
    if (!folderName) {
      return res
        .status(409)
        .json({ message: "Folder name required", success: false });
    }
    const filePath = `${folderPath}/${folderName}`;
    const isFolderExist = await DirectoryModel.findOne({
      name: folderName,
      parentPath: folderPath,
      type: "folder",
    });
    if (isFolderExist) {
      return res
        .status(409)
        .json({ message: "Folder already exist", success: false });
    }
    const command = new PutObjectCommand({
      Key: `${filePath}/`,
      Bucket: BUCKET_NAME,
    });
    await s3Client.send(command);
    const newFolder = new DirectoryModel({
      name: folderName,
      parentPath: folderPath,
      path: filePath,
      type: "folder",
    });
    await newFolder.save();
    const folderData = await DirectoryModel.find({ parentPath: folderPath });
    res
      .status(200)
      .json({ message: "Folder created", success: true, data: folderData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", success: false, error });
  }
};

const DeleteFolder = async (req, res) => {
  try {
    const { path, parentPath } = req.body;
    const folderKey = `${path}/`;
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: folderKey,
    });
    const listedObjects = await s3Client.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return res
        .status(404)
        .json({ message: "Folder not found or empty folder" });
    }

    const objectsToDelete = listedObjects.Contents.map((item) => ({
      Key: item.Key,
    }));

    const deleteCommand = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: objectsToDelete,
      },
    });
    await s3Client.send(deleteCommand);
    await StarredModel.deleteMany({
      $or: [
        { path: { $regex: `^${path}` } },
        { parentPath: { $regex: `^${path}` } },
      ],
    }); 
    await DirectoryModel.deleteMany({
      $or: [
        { path: { $regex: `^${path}` } },
        { parentPath: { $regex: `^${path}` } },
      ],
    });
    const folderData = await DirectoryModel.find({ parentPath });
    res
      .status(200)
      .json({ message: "Folder deleted", success: true, data: folderData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", success: false, error });
  }
};

const getFolderSizeInMB = async (req, res) => {
  try {
    let continuationToken = undefined;
    let totalSizeInBytes = 0;
    const folderPath = req.params[0];

    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: `${folderPath}/`,
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

      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined;
    } while (continuationToken);

    const sizeInMB = totalSizeInBytes / (1024 * 1024);
    res
      .status(200)
      .json({
        message: "Size fetched",
        size: sizeInMB.toFixed(2),
        success: true,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error, success: false });
  }
};

module.exports = { FetchFolder, CreateFolder, DeleteFolder, getFolderSizeInMB };
