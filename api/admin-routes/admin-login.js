const express = require('express');
const router = express.Router();

const adminLogin = require('../admin-controller/controller-admin-login');

//Login Admin
router.post('/', adminLogin.login);

module.exports = router;
