const express = require('express');
const router = express.Router();
const { UsersController } = require('../controllers');
const UserCtrl = new UsersController();

router.get('/', UserCtrl.getAllUsers)
router.post('/login', UserCtrl.loginUser)
router.post('/register', UserCtrl.registerUser)


module.exports = router