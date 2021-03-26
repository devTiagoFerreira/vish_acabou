const router = require('express').Router();
const validador = require('../controller/controller-validador');

router.get('/cnpj/:cnpj', validador.cnpjValidator);

router.get('/ie/:ie', validador.ieValidator);

module.exports = router;
