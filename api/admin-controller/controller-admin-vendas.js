const mysql = require('../mysql');
const nodemailer = require('nodemailer');

exports.negVenda = (req, res, next) => {
    const id_venda = req.params.id_venda;
    mysql
        .poolConnect('select quantidade, id_anuncio, status_pagamento from tb_vendas where id = ?', [id_venda])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Venda não encontrada',
                    },
                });
            }
            if (results[0].status_pagamento == 2) {
                return res.status(400).send({
                    erro: {
                        mensagem: 'Esta venda já foi negativada',
                    },
                });
            }
            const id_anuncio = results[0].id_anuncio,
                quantidade = results[0].quantidade;

            mysql
                .poolConnect('update tb_vendas set status_pagamento = 2 where id = ?', [id_venda])
                .then(() => {
                    mysql
                        .poolConnect('update tb_anuncios set vendidos = vendidos - ? where id = ?', [quantidade, id_anuncio])
                        .then(() => {
                            return res.status(200).send({
                                mensagem: 'Venda negativada',
                            });
                        })
                        .catch((error) => {
                            return res.status(500).send({
                                erro: {
                                    mensagem: error,
                                },
                            });
                        });
                })
                .catch((error) => {
                    return res.status(500).send({
                        erro: {
                            mensagem: error,
                        },
                    });
                });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: {
                    mensagem: error,
                },
            });
        });
};

exports.aprVenda = (req, res, next) => {
    const id_venda = req.params.id_venda;
    mysql
        .poolConnect(
            'select tb_vendas.quantidade, tb_vendas.id_anuncio, tb_vendas.cod_ticket, tb_vendas.status_pagamento, tb_clientes.email, tb_anuncios.titulo, tb_vendas.quantidade * (tb_anuncios.preco - (tb_anuncios.preco / 100 * tb_anuncios.desconto)) as valor from tb_vendas inner join tb_clientes on tb_vendas.id_cliente = tb_clientes.id inner join tb_anuncios on tb_vendas.id_anuncio = tb_anuncios.id where tb_vendas.id = ?',
            [id_venda]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Venda não encontrada',
                    },
                });
            }
            if (results[0].status_pagamento == 3) {
                return res.status(400).send({
                    erro: {
                        mensagem: 'Esta venda já foi aprovada',
                    },
                });
            }
            const email_cliente = results[0].email,
                titulo_anuncio = results[0].titulo,
                quantidade = results[0].quantidade,
                valor_compra = results[0].valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }),
                ticket = results[0].cod_ticket;
            //Email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email_cliente,
                subject: 'VishAcabou - Compra Aprovada!',
                html: '<h3>Olá, sua compra foi aprovada e seu pedido já pode ser retirado!</h3>' + '<p>Produto: ' + titulo_anuncio + '</p>' + '<p>Quantidade: ' + quantidade + '</p>' + '<p>Valor: ' + valor_compra + '</p>' + '<p>Seu ticket: <strong>' + ticket + '</strong></p>' + '<p>Retire seu produto levando seu <strong>TICKET</strong> e um documento com foto!</p>',
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return res.status(500).send({
                        erro: error,
                    });
                } else {
                    if (results[0].status_pagamento == 2) {
                        const id_anuncio = results[0].id_anuncio;
                        mysql
                            .poolConnect('update tb_vendas set status_pagamento = 3 where id = ?', [id_venda])
                            .then(() => {
                                mysql
                                    .poolConnect('update tb_anuncios set vendidos = vendidos + ? where id = ?', [quantidade, id_anuncio])
                                    .then(() => {
                                        return res.status(200).send({
                                            mensagem: 'Venda aprovada',
                                        });
                                    })
                                    .catch((error) => {
                                        return res.status(500).send({
                                            erro: {
                                                mensagem: error,
                                            },
                                        });
                                    });
                            })
                            .catch((error) => {
                                return res.status(500).send({
                                    erro: {
                                        mensagem: error,
                                    },
                                });
                            });
                    } else {
                        mysql
                            .poolConnect('update tb_vendas set status_pagamento = 3 where id = ?', [id_venda])
                            .then(() => {
                                return res.status(200).send({
                                    mensagem: 'Venda aprovada',
                                });
                            })
                            .catch((error) => {
                                return res.status(500).send({
                                    erro: {
                                        mensagem: error,
                                    },
                                });
                            });
                    }
                }
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: {
                    mensagem: error,
                },
            });
        });
};

//Retorna vendas conforme filtros
exports.filtroVenda = (req, res, next) => {
    const data = new Date();
    const id_empresa = req.body.id_empresa || '%',
        data_inicial = req.body.data_inicial || '0000-00-00',
        data_final = req.body.data_final || data.getFullYear() + '-' + (data.getMonth() + 1) + '-' + data.getDate(),
        status = req.body.status || '%';

    mysql
        .poolConnect(
            'select tb_vendas.id, tb_vendas.quantidade, tb_vendas.id_anuncio, tb_empresas.id as id_empresa, tb_empresas.razao_social as empresa, tb_vendas.cod_ticket, tb_status_pagamento.status_pagamento, tb_clientes.email as cliente, tb_anuncios.titulo as produto, tb_anuncios.preco - (tb_anuncios.preco / 100 * tb_anuncios.desconto) as preco_unitario, tb_vendas.quantidade * (tb_anuncios.preco - (tb_anuncios.preco / 100 * tb_anuncios.desconto)) as preco_total, date_format(tb_vendas.data_compra, "%d/%m/%Y") as data_compra from tb_vendas inner join tb_clientes on tb_vendas.id_cliente = tb_clientes.id inner join tb_anuncios on tb_vendas.id_anuncio = tb_anuncios.id inner join tb_empresas on tb_anuncios.id_empresa = tb_empresas.id inner join tb_status_pagamento on tb_vendas.status_pagamento = tb_status_pagamento.id where tb_empresas.id like ? and (tb_vendas.data_compra between ? and ? + interval 1 day) and tb_vendas.status_pagamento like ?',
            [id_empresa, data_inicial, data_final, status]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    mensagem: 'Nenhum resultado encontrado',
                });
            }
            return res.status(200).send({
                resultados: results.length,
                vendas: results.map((row) => {
                    return {
                        cliente: row.cliente,
                        id_empresa: row.id_empresa,
                        empresa: row.empresa,
                        id_venda: row.id_venda,
                        id_anuncio: row.id_anuncio,
                        produto: row.produto,
                        quantidade: row.quantidade,
                        preco_unitario: row.preco_unitario,
                        preco_total: row.preco_total,
                        data_compra: row.data_compra,
                        ticket: row.cod_ticket,
                        pagamento: row.status_pagamento,
                    };
                }),
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};
