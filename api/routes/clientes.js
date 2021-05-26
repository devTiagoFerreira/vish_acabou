const express = require('express');
const router = express.Router();
const clientes = require('../controller/controller-clientes');
const auth = require('../middleware/auth');

//Login
router.post('/login', clientes.login);

//Cadastro de clientes
router.post('/cadastro', clientes.cadastro);

//Ativação de cadastro
router.patch('/ativar', auth.clienteAuth, clientes.validarEmail);

//inativação de cadastro
router.patch('/inativar', auth.clienteAuth, clientes.inativaEmail);

//Atualização de foto de perfil
router.patch('/foto', auth.clienteAuth, clientes.attFoto);

//Atualização de email
router.patch('/att-email', auth.clienteAuth, clientes.attEmail);

//Confirmação atualização de email
router.patch('/confirma-att-email', auth.clienteAuth, clientes.confirmaAttEmail);

//Atualização de senha
router.patch('/att-senha', auth.clienteAuth, clientes.attSenha);

//Atualiza dados de cadastro
router.patch('/att-cadastro', auth.clienteAuth, clientes.attCadastro);

//Renorna dados de cadastro
router.get('/', auth.clienteAuth, clientes.dados);

//Deleta foto de perfil
router.delete('/excluir-foto', auth.clienteAuth, clientes.excFoto);

//Retorna todas as empresas que o cliente ja comprou
router.get('/compras/empresas', auth.clienteAuth, clientes.empresaCompra);

//Retorna compras conforme filtros
router.post('/compras/filtros', auth.clienteAuth, clientes.compras);

module.exports = router;
