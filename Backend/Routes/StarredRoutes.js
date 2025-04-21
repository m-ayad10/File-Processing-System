const { addToStarred, getStarredFiles, removeFromStarred } = require('../Controller/StarredContoller')

const router=require('express').Router()


router.post('/',addToStarred)//put to starred
router.get('/:userName',getStarredFiles)//fetch starred
router.delete('/:id',removeFromStarred)//remove from starred

module.exports=router