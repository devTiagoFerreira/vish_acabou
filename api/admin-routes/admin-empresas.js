const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

//Controle de rotas
const empresas = require('../admin-controller/controller-admin-empresas');

//Cadasto de empresas
router.post('/cadastro', empresas.cadastraEmpresa);

//Adiciona novos contatos
router.post('/cadastro/contatos/:id_empresa', empresas.addContatos);

//Reenvia e-mail de ativação de cadastro
router.get('/cadastro/reenviaremail', empresas.reenviarEmail);

//Altera e-mail
router.patch('/cadastro/alteraremail', empresas.alterarEmail);

//Atualiza os dados cadastrais da empresa conforme id
router.patch('/cadastro/atualizar/:id_empresa', empresas.alterarDadosCadastrais);

//Atualiza contato conforme id fornecido
router.patch('/contatos/:id_contato', empresas.atualizaContato);

//Atualiza a logo da empresa conforme o id
router.patch('/:id_empresa/logo', empresas.atualizarLogo);

//Retorna todas as empresas cadastradas - Dados parciais
router.get('/', empresas.empresas);

//Retorna todas as empresas cadastradas de acordo com os filtros - Dados parciais
router.get('/filtro', empresas.filtroEmpresas);

//Retorna a empresa cadastrada de acordo com o id - Quase todos os dados
router.get('/:id', empresas.idEmpresas);

//Retorna todos os contatos da empresa
router.get('/:id_empresa/contatos', empresas.contatos);

//Anativa empresa conforme id fornecido
router.patch('/inativar/:id_empresa', empresas.inativaEmpresa);

//Deleta contato conforme id
router.delete('/contatos/:id_contato', empresas.deletaContato);

//Deleta a logo da empresa conforme o id
router.delete('/:id_empresa/logo', empresas.deletaLogo);

module.exports = router;
