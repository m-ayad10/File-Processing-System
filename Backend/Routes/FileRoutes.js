const express=require('express')
const router=express.Router()
const multer = require("multer")
const multerS3 = require("multer-s3");
const {FileUpload, downloadFile, listAllFiles, deleteFile, downloadS3Folder, SignedUrl }= require('../Controller/FileController')
const { S3Client } = require('@aws-sdk/client-s3');
const { FileUploadMiddleWare } = require('../Middlewares/FileMiddleWare');


const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_SECRET,
  },
});
const BUCKET_NAME = process.env.BUCKET_NAME;

const upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: BUCKET_NAME,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const folderPath = req.params[0]; // Folder where the file will be stored
        const filePath = `${folderPath}/${file.originalname}`;
        cb(null, filePath);
      },
    }),
  });
router.post('/*',upload.single('file'),FileUpload)//checks file existence in req.file and in s3 and db then upload files to s3  and MongoDB  
router.get('/download/*',downloadFile)//download file using file path recieved from frontend
router.get('/list',listAllFiles)// to list all files in s3 bucket
router.delete('/delete',deleteFile)//to delete file based on file path
router.get('/signed-url/*',SignedUrl)//to view file in frontend by passing signed url of file

module.exports=router