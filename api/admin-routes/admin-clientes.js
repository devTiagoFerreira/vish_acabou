const express = require('express');
const router = express.Router();

//Controle de rotas
const clientes = require('../admin-controller/controller-admin-clientes');

//Retorna todos os clientes de acordo com o número de linhas requisidado
router.get('/:a_partir_de/:num_linhas', clientes.clientes);

//Retorna cliente conforme id
router.get('/:id_cliente', clientes.idCliente);

module.exports = router;
