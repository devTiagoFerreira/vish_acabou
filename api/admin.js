const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');

const routeAdminLogin = require('./admin-routes/admin-login');
const routeAdminEmpresas = require('./admin-routes/admin-empresas');

//Login
router.use('/login', routeAdminLogin);

//Empresa
router.use('/empresas', auth.adminAuth, routeAdminEmpresas);

module.exports = router;
