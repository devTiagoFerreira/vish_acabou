const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

//Controle de rotas
const empresas = require('../admin-controller/controller-admin-empresas');

//Cadasto de empresas
router.post('/cadastro', empresas.cadastroEmpresas);

//Reenviar e-mail de ativação de cadastro
router.post('/cadastro/reenviaremail', empresas.reenviarEmail);

//Alterar e-mail
router.post('/cadastro/alteraremail', empresas.alterarEmail);

//Retorna todas as empresas cadastradas - Dados parciais
router.get('/', empresas.empresas);

//Retorna todas as empresas cadastradas de acordo com os filtros - Dados parciais
router.get('/filtro', empresas.filtroEmpresas);

//Retorna a empresa cadastrada de acordo com o id - Quase todos os dados
router.get('/:id', empresas.idEmpresas);

//Atualiza a logo da empresa conforme o id
router.patch('/:id_empresa/logo', empresas.atualizarLogo);

//Deleta a logo da empresa conforme o id
router.delete('/:id_empresa/logo', empresas.deletaLogo);

module.exports = router;
