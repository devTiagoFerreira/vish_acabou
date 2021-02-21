const express = require('express');
const router = express.Router();

//Retorna lista de anúncios
router.get('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'Lista de anúncios'
    });
});

//Retorna dados do anúncio conforme id
router.get('/:id_anuncio', (req, res, next) => {
    const id_anuncio = req.params.id_anuncio;
    res.status(200).send({
        mensagem: `Dados do anúncio ${id_anuncio}`
    });
});

module.exports = router;

