const StarredModel = require("../Models/StarredModel");

const getStarredFiles = async (req, res) => {
  try {
    const { userName } = req.params;
    // If userId is stored in the model, consider using req.user.id
    const data = await StarredModel.find({ userName });
    res
      .status(200)
      .json({ message: "Fetched starred files", success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", success: false, error });
  }
};

const addToStarred = async (req, res) => {
  try {
    const { _id, name, path, parentPath, type, userName } = req.body;
    const newStarredFile = new StarredModel({
      name,
      path,
      parentPath,
      type,
      fileId: _id,
      userName,
    });
    await newStarredFile.save();
    const data = await StarredModel.find({ userName });
    res
      .status(200)
      .json({ message: "File added to starred", success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", success: false, error });
  }
};

const removeFromStarred = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName } = req.query;
    
    await StarredModel.findOneAndDelete({ fileId: id });
    
    const data = await StarredModel.find({userName});
    res
      .status(200)
      .json({ message: "File removed from starred", success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", success: false, error });
  }
};

module.exports = {
  getStarredFiles,
  addToStarred,
  removeFromStarred,
};
