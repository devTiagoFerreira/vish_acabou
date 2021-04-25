const express = require('express');
const router = express.Router();

//Controle de rotas
const anuncios = require('../admin-controller/controller-admin-anuncios');

router.post('/cadastro', anuncios.addAnuncio)

module.exports = router;
