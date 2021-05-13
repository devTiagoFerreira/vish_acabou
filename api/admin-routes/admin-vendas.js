const express = require('express');
const router = express.Router();

//Controle de rotas
const anuncios = require('../admin-controller/controller-admin-vendas');

//Negativação de venda
router.patch('/:id_venda/negativar', anuncios.negVenda);

//Negativação de venda
router.patch('/:id_venda/aprovar', anuncios.aprVenda);

module.exports = router;
