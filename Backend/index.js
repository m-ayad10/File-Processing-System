const express =require('express')
const app =express()
const cors=require('cors')
const { configDotenv } = require('dotenv')
const multer=require('multer')
const path=require('path')
const multers3=require('multer-s3')
const createExpression = require('path-to-regexp');  // this package in correct version is automatically attached by Express.js to construct routes expressions



configDotenv()

const PORT=process.env.PORT



app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const fs = require('fs');
const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.listen(PORT,()=>
{
    console.log('server started');
})

const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.ACCESS_SECRET,
    },
}); 
const BUCKET_NAME = process.env.BUCKET_NAME;


const storage = multers3({
    s3:s3Client,
    bucket:BUCKET_NAME,
    metadata:(req,file,cb)=>
        {
            cb(null,{fieldName:file.fieldname})
        },
    key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);                
        cb(null,  file.originalname);
    }
});


const upload=multer({storage:storage})

app.post('/file',upload.single('file'),(req,res)=>
{    
    console.log(req.file);    
    res.json({ message: `File uploaded successfully${req.file.location}` });
})

app.get('/list',async(req,res)=>{
    try {
        const command=new ListObjectsV2Command({Bucket:BUCKET_NAME})
        const response=await s3Client.send(command)
        const keys=response.Contents
        
        res.json({keys})
    } catch (error) {
        res.json({error})
    }
})

app.get('/download/*', async (req, res) => {
    const fileKey = req.params[0];
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        const response = await s3Client.send(command);

        res.setHeader('Content-Disposition', `attachment; filename="${fileKey.split('/').pop()}"`);
        res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');

        response.Body.pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(404).send('File Not Found');
    }
});
app.post('/folder/*', async (req, res) => {
    const folder = req.params[0];

    if (!folder) {
        return res.status(400).json({ error: 'Folder name is required' });
    }

    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${folder}/` // The trailing slash makes it a folder in S3
        });

        const response = await s3Client.send(command);

        res.status(200).json({ message: `Folder "${folder}" created successfully`, response });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ error: 'Failed to create folder' });
    }
});
app.delete('/delete/*', async (req, res) => {
    const  filename  = req.params[0];
    try {
        const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: filename });
        await s3Client.send(command);
        res.send('File Deleted Successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/addFolder',upload.array('files'),async(req,res)=>{
    try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ message: 'No files uploaded' });
        }
        const uploadedFiles = req.files.map(file => ({
          key: file.key,
          originalName: file.originalname,
          path: file.location
        }));
        res.status(200).json({ message: 'Uploaded successfully', uploadedFiles });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Upload failed' });
      }
})