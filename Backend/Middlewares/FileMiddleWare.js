const { fetchFolderSize } = require("../Controller/GetFolderSize");
const DirectoryModel = require("../Models/DirectoryModel");

const FileUploadMiddleWare = async (req, res,next) => {
  const folderPath = req.params[0];
  const file = req.file;
  const { userName } = req.body;
  if (!file) {
    return res.status(400).json({
      message: "No file uploaded",
      success: false,
    });
  }

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
  console.log(folderSizeMB);

  const fileSizeMB = file.size / (1024 * 1024); // Convert file size from bytes to MB

  if (folderSizeMB + fileSizeMB >= 100) {
    return res.status(409).json({
      message: "Upload exceeds 100 MB limit.",
      success: false,
    });
  }

};

module.exports = { FileUploadMiddleWare };
