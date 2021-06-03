const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');

const routeAdminLogin = require('./admin-routes/admin-login');
const routeAdminEmpresas = require('./admin-routes/admin-empresas');
const routeAdminClientes = require('./admin-routes/admin-clientes');
const routeAdminAnuncios = require('./admin-routes/admin-anuncios');
const routeAdminVendas = require('./admin-routes/admin-vendas');
const routeAdminPagamentos = require('./admin-routes/admin-pagamentos');

//Login Admin
router.use('/login', routeAdminLogin);

//Empresa
router.use('/empresas', auth.adminAuth, routeAdminEmpresas);

//Clientes
router.use('/clientes', auth.adminAuth, routeAdminClientes);

//Anúncios
router.use('/anuncios', auth.adminAuth, routeAdminAnuncios);

//Vendas
router.use('/vendas', auth.adminAuth, routeAdminVendas);

//Pagamentos
router.use('/pagamentos', auth.adminAuth, routeAdminPagamentos);

module.exports = router;
