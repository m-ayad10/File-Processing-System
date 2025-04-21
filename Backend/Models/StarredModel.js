const mongoose=require('mongoose')

const StarredSchema=new mongoose.Schema({
    fileId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Directory',
        required:true
    },
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
    },
    userName:{
        required:true,
        type:String
    }
})

const StarredModel=mongoose.model('Starred',StarredSchema)

module.exports=StarredModel