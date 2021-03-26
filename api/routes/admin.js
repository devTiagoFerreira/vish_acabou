const express = require('express');
const router = express.Router();
const admin = require('../controller/controller-admin');
const auth = require('../middleware/auth');

//Admin Login
router.post('/login', admin.login);

//Company POST
router.post('/empresas', auth.vishAuth, admin.empresasPOST);

module.exports = router;
