const router = require('express').Router();
const estados = require('../controller/controller-estados');

router.get('/', estados.estadosGET);

router.get('/:id_estado', estados.estadosGETId);

module.exports = router;
