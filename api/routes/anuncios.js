const router = require('express').Router();

const anuncios = require('../controller/controller-anuncios');

router.get('/', anuncios.anuncios);

router.get('/:id_anuncio', anuncios.idAnuncio);

router.get('/:a_partir_de/:num_linhas', anuncios.linhasAnuncios);

module.exports = router;
