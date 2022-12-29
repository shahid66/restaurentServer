const express =require('express');
const { test, register, login, logout, getUser, loggedin, updateUser, changepassword, CreatePassword, RecoveryVerifyOTP, recoveryEmail } = require('../controllers/UserController');
const { protect } = require('../middleware/AuthMiddleware');
const router=express.Router()

router.get('/',test)
router.post('/register',register)
router.post('/login',login)
router.get('/logout',logout)
router.get('/getuser', protect ,getUser)
router.get('/loggedin' ,loggedin)
router.patch('/updateuser', protect ,updateUser)


router.get('/recoveryEmail/:email',recoveryEmail)
router.get('/verifyOTP/:email/:OTP',RecoveryVerifyOTP)

router.post('/passwordUpdate',CreatePassword)

router.patch('/changepassword', protect ,changepassword)

module.exports=router;