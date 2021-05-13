const express = require('express');
const router = express.Router();

//Controle de rotas
const anuncios = require('../admin-controller/controller-admin-anuncios');

//Cadastro de anúncios
router.post('/cadastro', anuncios.addAnuncio);

//Retorna todos os anuncios conforme filtros
router.post('/filtros', anuncios.filtroAnuncio);

//Inativa anúncios
router.patch('/:id_anuncio/inativar', anuncios.inativaAnuncio);

//Ativa anúncios
router.patch('/:id_anuncio/ativar', anuncios.ativaAnuncio);

//Retorna anuncio conforme id fornecido
router.get('/:id_anuncio', anuncios.retornaAnuncio);

module.exports = router;
