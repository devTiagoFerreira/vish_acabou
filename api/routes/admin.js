const express = require('express');
const router = express.Router();
const admin = require('../controller/controller-admin');
const auth = require('../middleware/auth');

//Login
router.post('/login', admin.login);

module.exports = router;
