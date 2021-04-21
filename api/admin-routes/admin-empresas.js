const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

//Controle de rotas
const empresas = require('../admin-controller/controller-admin-empresas');

//Cadasto de empresas
router.post('/cadastro', empresas.cadastraEmpresa);

//Retorna todas as empresas cadastradas de acordo com os filtros - Dados parciais
router.post('/filtro', empresas.filtroEmpresas);

//Adiciona novos contatos
router.post('/:id_empresa/contatos', empresas.addContatos);

//Reenvia e-mail de ativação de cadastro
router.post('/reenviar-email', empresas.reenviaEmail);

//Anativa empresa conforme id fornecido
router.patch('/:id_empresa/inativar', empresas.inativaEmpresa);

//Altera e-mail
router.patch('/:id_empresa/alterar-email', empresas.alteraEmail);

//Atualiza os dados cadastrais da empresa conforme id
router.patch('/:id_empresa/atualizar-cadastro', empresas.alteraDadosCadastrais);

//Atualiza contato conforme id fornecido
router.patch('/atualizar-contato/:id_contato', empresas.atualizaContato);

//Atualiza a logo da empresa conforme o id
router.patch('/:id_empresa/logo', empresas.atualizaLogo);

//Retorna todas as empresas cadastradas - Dados parciais
router.get('/', empresas.empresas);

//Retorna a empresa cadastrada de acordo com o id - Quase todos os dados
router.get('/:id', empresas.idEmpresas);

//Retorna todos os contatos da empresa
router.get('/:id_empresa/exibir-contatos', empresas.contatos);

//Deleta contato conforme id
router.delete('/contatos/:id_contato', empresas.deletaContato);

//Deleta a logo da empresa conforme o id
router.delete('/:id_empresa/deleta-logo', empresas.deletaLogo);

module.exports = router;
