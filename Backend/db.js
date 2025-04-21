const mongoose =require('mongoose')
require('dotenv').config()

const mongo_url=process.env.MONGO_CONN

mongoose.connect(mongo_url)


const db=mongoose.connection

db.on('connected',()=>{
    console.log("MongoDB connected");  
})

db.on('disconnected',()=>{
    console.log('MongoDB disconnected');
})

db.on('error',(error)=>{
    console.log('MongoDB connection error',error); 
})

module.exports=db