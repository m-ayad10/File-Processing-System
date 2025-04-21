const express =require('express')
const app =express()
const cors=require('cors')
const { configDotenv } = require('dotenv')
const multer=require('multer')
const path=require('path')
const db=require('./db')
var cookieParser = require('cookie-parser')


configDotenv()

const PORT=process.env.PORT


app.use(cookieParser())

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const fs = require('fs');
const router = require('./Routes/AuthRoutes')
const fileRouter=require('./Routes/FileRoutes')
const folderRouter=require('./Routes/FolderRoutes')
const starredRouter=require('./Routes/StarredRoutes')

app.listen(PORT,()=>
{
    console.log('server started');
})

app.use('/',router)//AuthRouter
app.use('/file',fileRouter)//file Router
app.use('/folder',folderRouter)//Folder router
app.use('/starred',starredRouter)//Starred router