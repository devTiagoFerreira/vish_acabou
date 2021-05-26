const express = require('express');
const router = express.Router();
const empresas = require('../controller/controller-empresas');
const auth = require('../middleware/auth');

//Login
router.post('/login', empresas.login);

//Ativação de cadastro
router.patch('/ativar', auth.empresaAuth, empresas.validarEmail);

//Retorna dados da venda de acordo com o ticket
router.get('/venda/:ticket', auth.empresaAuth, empresas.ticket);


module.exports = router;
