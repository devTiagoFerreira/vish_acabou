const express = require('express');
const router = express.Router();
const empresas = require('../controller/controller-empresas');
const auth = require('../middleware/auth');

//Admin Login
router.post('/login', empresas.login);

//Company Activation
router.get('/ativar', auth.empresaAuth, empresas.activation);

module.exports = router;
