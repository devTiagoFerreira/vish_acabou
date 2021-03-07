const router = require('express').Router();
const estados = require('../controller/controller-estados');

router.get('/', estados.estadosGET);

router.get('/:states_id', estados.estadosGETId);

module.exports = router;
