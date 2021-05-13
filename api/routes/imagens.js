const route = require('express').Router();

const imagens = require('../controller/controller-imagens');

//Retorna logo da empresa conforme id
route.get('/empresas/:id_empresa/logo', imagens.empresaLogo);

//Retorna foto de perfil do cliente conforme id
route.get('/clientes/:id_cliente/foto', imagens.clienteFoto);

//Retorna banner do anúncio conforme id
route.get('/anuncios/:id_anuncio/banner', imagens.anuncioBanner);

module.exports = route;
