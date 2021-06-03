const express = require('express');
const router = express.Router();
const empresas = require('../controller/controller-empresas');
const auth = require('../middleware/auth');

//Login
router.post('/login', empresas.login);

//Ativação de cadastro
router.patch('/ativar', auth.empresaAuth, empresas.validarEmail);

//Retorna dados da venda de acordo com o ticket
router.get('/vendas/:ticket', auth.empresaAuth, empresas.ticket);

//Retorna dados da venda de acordo com o ticket
router.get('/anuncios/:id_anuncio', auth.empresaAuth, empresas.retornaAnuncio);

//Retorna todos os anuncios conforme filtros
router.post('/anuncios/filtros', auth.empresaAuth, empresas.filtroAnuncio);

//Retorna vendas conforme filtros
router.post('/vendas/filtros', auth.empresaAuth, empresas.filtroVenda);

//Retorna vendas conforme filtros
router.get('/vendas/receber', auth.empresaAuth, empresas.totalReceber);

module.exports = router;
