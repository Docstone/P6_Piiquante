const express = require('express');
const router = express.Router();
const valPassword = require('../middleware/val-password');


const userCtrl = require('../controllers/user')

router.post('/signup', valPassword, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;

