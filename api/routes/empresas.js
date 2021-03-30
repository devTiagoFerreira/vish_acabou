const express = require('express');
const router = express.Router();
const empresas = require('../controller/controller-empresas');
const auth = require('../middleware/auth');

//Login
router.post('/login', empresas.login);

//Ativação de cadastro
router.get('/ativar', auth.empresaAuth, empresas.activation);

module.exports = router;
