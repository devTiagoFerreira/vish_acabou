const router = require('express').Router();
const cidades = require('../controller/controller-cidades');

router.get('/', cidades.cidadesGET);

router.get('/uf/:uf_id', cidades.cidadesGETUF);

router.get('/:cities_id', cidades.cidadesGETId);

module.exports = router;