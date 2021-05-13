const router = require('express').Router();
const auth = require('../middleware/auth');

const vendas = require('../controller/controller-vendas');

//Adiciona uma venda
router.post('/add', auth.clienteAuth, vendas.addVenda);

module.exports = router;
