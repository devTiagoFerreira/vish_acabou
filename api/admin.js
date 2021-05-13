const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');

const routeAdminLogin = require('./admin-routes/admin-login');
const routeAdminEmpresas = require('./admin-routes/admin-empresas');
const routeAdminAnuncios = require('./admin-routes/admin-anuncios');
const routeAdminVendas = require('./admin-routes/admin-vendas');

//Login Admin
router.use('/login', routeAdminLogin);

//Empresa
router.use('/empresas', auth.adminAuth, routeAdminEmpresas);

//Anúncios
router.use('/anuncios', auth.adminAuth, routeAdminAnuncios);

//Vendas
router.use('/vendas', auth.adminAuth, routeAdminVendas);

module.exports = router;
