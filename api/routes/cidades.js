const router = require('express').Router();
const cidades = require('../controller/controller-cidades');

router.get('/', cidades.cidadesGET);

router.get('/uf/:id_uf', cidades.cidadesGETUF);

router.get('/:id_cidade', cidades.cidadesGETId);

module.exports = router;
