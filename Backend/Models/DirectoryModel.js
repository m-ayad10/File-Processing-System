const mongoose=require('mongoose')

const DirectorySchema=new mongoose.Schema({
    name:{
        required:true,
        type:String,
    },
    path:{
        required:true,
        type:String,
    },
    parentPath:{
        required:true,
        type:String,
        default:"Users"
    },
    type:{
        required:true,
        type:String
    }
})

const DirectoryModel=mongoose.model('Directory',DirectorySchema)

module.exports=DirectoryModel