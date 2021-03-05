const express = require('express');
const router = express.Router();
const admin = require('../controller/controller-admin');
const auth = require('../middleware/auth');

//Login
router.post('/login', admin.login);

//Cidades
router.post('/estados', auth.optionalAuth, admin.estadosPOST);

router.patch('/estados', auth.optionalAuth, admin.estadosPATCH);

module.exports = router;
