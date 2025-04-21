const { SignUp, Login, verifyToken, SignOut } = require('../Controller/AuthController')
const { LoginValidation, SignUpValidation } = require('../Middlewares/AuthMiddleware')

const router=require('express').Router()

router.post('/login',LoginValidation,Login)//for login validation middleware and login and passing jwtToken through cookie
router.post('/signup',SignUpValidation,SignUp)//for Sign Up validation middleware and login
router.get('/verify-token',verifyToken)//to verify user and pass userName
router.post('/logout',SignOut)//to logout


module.exports=router