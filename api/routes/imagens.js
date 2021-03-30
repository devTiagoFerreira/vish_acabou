const route = require('express').Router();

const imagens = require('../controller/controller-imagens');

//Retorna logo da empresa conforme id
route.get('/empresas/:id_empresa/logo', imagens.empresaLogo)

module.exports = route;