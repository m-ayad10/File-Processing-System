const mongoose=require('mongoose')

const UserSchema=new mongoose.Schema({
    userName:{
        required:true,
        type:String,
        unique:true
    },
    email:{
        required:true,
        type:String,
        unique:true
    },
    password:{
        required:true,
        type:String,
    },
  
})

const UserModel=mongoose.model('users',UserSchema)
module.exports=UserModel