const mysql = require('../mysql');

//Retorna as pendências de pagamento conforme o id da empresa fornecido
exports.pagamentosEmpresa = (req, res, next) => {
    const id_empresa = req.params.id_empresa;

    mysql
        .poolConnect(
            'select v.id,  v.id_anuncio, an.titulo, an.id_empresa, e.razao_social, v.id_cliente, c.nome, date_format(v.data_compra, "%d/%m/%Y") as data_compra, v.quantidade, v.cod_ticket as ticket,pag.status_pagamento, an.preco - (an.preco / 100 * an.desconto) as preco_unitario, v.quantidade * (an.preco - (an.preco / 100 * an.desconto)) as preco_total, round((v.quantidade * (an.preco - (an.preco / 100 * an.desconto))) / 100 * (select comissao from tb_comissao where id = 1), 1) as comissao, round(v.quantidade * (an.preco - (an.preco / 100 * an.desconto)) - ((v.quantidade * (an.preco - (an.preco / 100 * an.desconto))) / 100 * (select comissao from tb_comissao where id = 1)), 1) as pagamento from tb_vendas v inner join tb_anuncios an on (v.id_anuncio = an.id) inner join tb_clientes c on (v.id_cliente = c.id) inner join tb_empresas e on (an.id_empresa = e.id) inner join tb_status_pagamento pag on (v.status_pagamento = pag.id) where e.id = ? and v.status_pagamento = 3 and v.status_pagamento_empresa = false',
            [id_empresa]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhuma pendência encontrada',
                    },
                });
            }
            let total = 0;
            for (i = 0; i < results.length; i++) {
                total += results[i].pagamento;
            }
            return res.status(200).send({
                vendas: results.map((row) => {
                    let url_anuncio = process.env.DOMAIN + 'admin/anuncios/' + row.id_anuncio,
                        url_empresa = process.env.DOMAIN + 'admin/empresas/' + row.id_empresa,
                        url_cliente = process.env.DOMAIN + 'admin/clientes/' + row.id_cliente;

                    Object.assign(row, { url_anuncio }, { url_empresa }, { url_cliente });

                    return row;
                }),
                total: total,
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};

//Retorna todas as pendências de pagamento
exports.pagamentos = (req, res, next) => {
    mysql
        .poolConnect(
            'select an.id_empresa, e.razao_social, sum(v.quantidade * (an.preco - (an.preco / 100 * an.desconto))) as preco_total, round(sum((v.quantidade * (an.preco - (an.preco / 100 * an.desconto))) / 100 * (select comissao from tb_comissao where id = 1)), 1) as comissao, round(sum(v.quantidade * (an.preco - (an.preco / 100 * an.desconto)) - ((v.quantidade * (an.preco - (an.preco / 100 * an.desconto))) / 100 * (select comissao from tb_comissao where id = 1))), 1) as pagamento from tb_vendas v inner join tb_anuncios an on (v.id_anuncio = an.id) inner join tb_empresas e on (an.id_empresa = e.id) where v.status_pagamento = 3 and v.status_pagamento_empresa = false group by id_empresa order by e.razao_social'
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhuma pendência encontrada',
                    },
                });
            }
            let total = 0;
            for (i = 0; i < results.length; i++) {
                total += results[i].pagamento;
            }
            return res.status(200).send({
                vendas: results.map((row) => {
                    let url_empresa = process.env.DOMAIN + 'admin/empresas/' + row.id_empresa,
                        url_pagamentos_empresa = process.env.DOMAIN + 'admin/pagamentos/' + row.id_empresa;

                    Object.assign(row, { url_empresa }, { url_pagamentos_empresa });

                    return row;
                }),
                total: total,
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};

//Da baixa em pendencias conforme id da venda
exports.baixaVenda = (req, res, next) => {
    const id_venda = req.params.id_venda;
    mysql
        .poolConnect('update tb_vendas set status_pagamento_empresa = true where id = ? and status_pagamento = 3', [id_venda])
        .then((results) => {
            if (results.affectedRows == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum registro encontrado',
                    },
                });
            }
            return res.status(200).send({
                resposta: 'Baixa efetuada com sucesso',
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};

//Da baixa em pendencias conforme id da empresa
exports.baixaVendaEmpresa = (req, res, next) => {
    const id_empresa = req.params.id_empresa;
    mysql
        .poolConnect('update tb_vendas v inner join tb_anuncios an on v.id_anuncio = an.id set v.status_pagamento_empresa = true  where an.id_empresa = ? and v.status_pagamento = 3; ', [id_empresa])
        .then((results) => {
            if (results.affectedRows == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum registro encontrado',
                    },
                });
            }
            return res.status(200).send({
                resposta: 'Baixa efetuada com sucesso',
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};
