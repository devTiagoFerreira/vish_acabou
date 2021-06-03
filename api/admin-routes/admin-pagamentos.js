const router = require('express').Router();

const pagamentos = require('../admin-controller/controller-admin-pagamentos');

//Retorna as pendências de pagamento conforme o id da empresa fornecido
router.get('/:id_empresa', pagamentos.pagamentosEmpresa);   

//Retorna todas as pendências de pagamento
router.get('/', pagamentos.pagamentos);

//Da baixa em pendencias conforme id da venda
router.patch('/vendas/:id_venda', pagamentos.baixaVenda);

//Da baixa em pendencias conforme id da empresa
router.patch('/empresas/:id_empresa', pagamentos.baixaVendaEmpresa);

module.exports = router;
