const { DownloadFolder } = require('../Controller/DownloadFolder')
const { FetchFolder, CreateFolder, DeleteFolder, getFolderSizeInMB } = require('../Controller/FolderController')

const router=require('express').Router()

router.get('/fetch/*',FetchFolder)//to fetch folder and list all files and folder under path
router.post('/*',CreateFolder)//to create new folder
router.delete('/',DeleteFolder)//delete folder and files under folder path
router.get('/download/*',DownloadFolder)//to download folder and files under folder path
router.get('/size/*',getFolderSizeInMB)//to get of folder path


module.exports=router