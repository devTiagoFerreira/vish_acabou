const express = require('express');
const router = express.Router();
const empresas = require('../controller/controller-empresas');
const auth = require('../middleware/auth');

//Login
router.get('/login', empresas.login);

//Ativação de cadastro
router.patch('/ativar', auth.empresaAuth, empresas.validarEmail);

module.exports = router;
