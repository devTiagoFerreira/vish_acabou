const mysql = require('../mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

//Login
exports.login = (req, res, next) => {
    mysql
        .poolConnect('select id, email, razao_social, senha from tb_empresas where email = ?', [req.body.email])
        .then((results) => {
            if (results < 1) {
                return res.status(401).send({
                    erro: {
                        mensagem: 'Falha na autenticação',
                        motivo: 'Credenciais não cadastradas',
                    },
                });
            }
            bcrypt.compare(req.body.senha, results[0].senha, (error, result) => {
                if (error) {
                    return res.status(401).send({
                        erro: {
                            mensagem: 'Falha na autenticação',
                            motivo: 'Credenciais não cadastradas',
                        },
                    });
                }
                if (!result) {
                    return res.status(401).send({
                        erro: {
                            mensagem: 'Falha na autenticação',
                            motivo: 'Credenciais não cadastradas',
                        },
                    });
                }
                const token = {
                    id: results[0].id,
                    email: results[0].email,
                    razao_social: results[0].razao_social,
                };
                jwt.sign(token, process.env.COMPANY_SECRET_KEY, { expiresIn: '1h' }, (error, token) => {
                    if (error) {
                        return res.status(500).send({
                            erro: {
                                mensagem: 'Falha na autenticação',
                                motivo: 'Erro interno no servidor',
                            },
                        });
                    }
                    return res.status(200).send({
                        mensagem: 'Autenticação bem-sucedida',
                        token: token,
                    });
                });
            });
        })
        .catch((error) => {
            return res.status(401).send({ erro: error });
        });
};

//Ativação de cadastro
exports.validarEmail = (req, res, next) => {
    const token = req.body.token_ativacao || null;
    if (!token) {
        return res.status(400).send({
            erro: {
                mensagem: 'Token de ativação de e-mail não informado',
            },
        });
    }
    jwt.verify(token, process.env.EMAIL_SECRET_KEY, function (error, decode) {
        if (error) {
            return res.status(401).send({
                erro: {
                    mensagem: 'Token de ativação de e-mail não autorizado ou expirado',
                },
            });
        }
        if (decode.id != req.usuario.id) {
            return res.status(401).send({
                erro: {
                    mensagem: 'Token de ativação de e-mail inválido',
                },
            });
        }
        mysql
            .poolConnect('select email, id_status_empresa from tb_empresas where id = ?', [decode.id])
            .then((results) => {
                if (results.length == 0) {
                    return res.status(401).send({
                        erro: {
                            mensagem: 'Token de ativação de e-mail inválido',
                        },
                    });
                }
                if (decode.email != results[0].email) {
                    return res.status(401).send({
                        erro: {
                            mensagem: 'Token de ativação de e-mail inválido',
                        },
                    });
                }
                if (results[0].id_status_empresa != 1) {
                    return res.status(401).send({
                        erro: {
                            mensagem: 'Token de ativação de e-mail inválido',
                        },
                    });
                }
                mysql
                    .poolConnect('update tb_empresas set id_status_empresa = 2 where id = ?', [decode.id])
                    .then(() => {
                        //Email confirmation
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: process.env.EMAIL_USER,
                                pass: process.env.EMAIL_PASS,
                            },
                        });

                        const mailOptions = {
                            from: process.env.EMAIL_USER,
                            to: decode.email,
                            subject: 'Bem-vindo(a) a Vish Acabou! - Confirmação de cadastro bem-sucedida!',
                            html: '<h3>Olá, seja bem-vindo(a) a Vish Acabou!</h3>' + '<p>Parabéns, seu cadastro foi ativado!</p>',
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                return res.status(500).send({
                                    erro: {
                                        mensagem: 'Cadastro ativado com sucesso, porém não foi possível enviar o email de aviso.',
                                        motivo: 'Erro no envio do e-mail de aviso.',
                                    },
                                });
                            } else {
                                return res.status(200).send({
                                    mensagem: 'Cadastro ativado com sucesso!',
                                });
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
            })
            .catch((error) => {
                return res.status(500).send({
                    erro: {
                        mensagem: error,
                    },
                });
            });
    });
};

//Retorna dados da venda de acordo com o ticket
exports.ticket = (req, res, next) => {
    const id_empresa = req.usuario.id,
        ticket = req.params.ticket;

    mysql
        .poolConnect(
            'select v.id, v.id_cliente, date_format(v.data_compra, "%d/%m/%Y") as data_compra, v.quantidade, v.cod_ticket, v.status_entrega, v.id_anuncio, a.titulo, round(a.preco / 100 * a.desconto, 2) as preco, a.banner, c.email, c.nome, c.sobrenome, c.foto from tb_vendas v inner join tb_anuncios a on v.id_anuncio = a.id inner join tb_clientes c on v.id_cliente = c.id where v.cod_ticket = ? and a.id_empresa = ?',
            [ticket, id_empresa]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(400).send({
                    erro: {
                        mensagem: 'Ticket inválido',
                    },
                });
            }
            const url_anuncio = process.env.DOMAIN + 'empresas/anuncios/' + results[0].id_anuncio,
                banner = process.env.DOMAIN + 'imagens/anuncios/' + results[0].id_anuncio + '/banner',
                foto = process.env.DOMAIN + 'imagens/clientes/' + results[0].id_cliente + '/foto';

            Object.assign(results[0], { url_anuncio }, { banner }, { foto });
            return res.status(200).send({
                venda: results,
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};

//Retorna anuncio conforme id fornecido
exports.retornaAnuncio = (req, res, next) => {
    const id_empresa = req.usuario.id,
        id_anuncio = req.params.id_anuncio;

    mysql
        .poolConnect(
            'select an.id, an.id_empresa, an.banner, an.titulo, an.descricao, an.regras, an.preco as preco_padrao, an.desconto, an.preco - (an.preco / 100 * an.desconto) as preco, date_format(an.data_inicial, "%d/%m/%Y às %H:%i h") as data_inicial, datediff(an.vencimento, current_date) as dias_restantes, timediff(an.vencimento, current_timestamp) as horas_restantes, an.quant_tickets, an.quant_tickets - an.vendidos as tickets_restantes, an.vendidos, tb_status_anuncio.status_anuncio from tb_anuncios an inner join tb_status_anuncio on an.id_status_anuncio = tb_status_anuncio.id where an.id = ? and an.id_empresa = ?',
            [id_anuncio, id_empresa]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum cadastro encontado',
                    },
                });
            }
            return res.status(200).send({
                registros: results.length,
                anuncios: results.map((row) => {
                    let banner;
                    if (row.banner) {
                        banner = { banner: process.env.DOMAIN + 'imagens/anuncios/' + row.id + '/banner' };
                    }
                    Object.assign(row, banner);
                    let url = { url: process.env.DOMAIN + 'empresas/anuncios/' + row.id };
                    Object.assign(row, url);
                    return row;
                }),
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

//Retorna todos os anuncios conforme filtros
exports.filtroAnuncio = (req, res, next) => {
    const id_empresa = req.usuario.id,
        data_inicial = req.body.data_inicial || '0000-00-00',
        data_final = req.body.data_final || 'current_date',
        status = req.body.status || '%';
    mysql
        .poolConnect(
            'select an.id, an.id_empresa, an.banner, an.titulo, an.descricao, an.regras, an.preco as preco_padrao, an.desconto, an.preco - (an.preco / 100 * an.desconto) as preco, date_format(an.data_inicial, "%d/%m/%Y às %H:%i h") as data_inicial, datediff(an.vencimento, current_date) as dias_restantes,timediff(an.vencimento, current_timestamp) as horas_restantes,an.quant_tickets, an.quant_tickets - an.vendidos as tickets_restantes, an.vendidos,tb_status_anuncio.status_anuncio from tb_anuncios an inner join tb_status_anuncio on an.id_status_anuncio = tb_status_anuncio.id where an.id_empresa = ? and (date_format(an.data_inicial,"%Y-%m-%d") >= ? and date_format(an.data_inicial, "%Y-%m-%d") <= ?) and an.id_status_anuncio like ?',
            [id_empresa, data_inicial, data_final, status]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum cadastro encontado',
                    },
                });
            }
            return res.status(200).send({
                registros: results.length,
                anuncios: results.map((row) => {
                    let banner;
                    if (row.banner) {
                        banner = { banner: process.env.DOMAIN + 'imagens/anuncios/' + row.id + '/banner' };
                    }
                    Object.assign(row, banner);
                    let url = { url: process.env.DOMAIN + 'empresas/anuncios/' + row.id };
                    Object.assign(row, url);
                    return row;
                }),
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
    const id_empresa = req.usuario.id,
        data_inicial = req.body.data_inicial || '0000-00-00',
        data_final = req.body.data_final || data.getFullYear() + '-' + (data.getMonth() + 1) + '-' + data.getDate(),
        status_pagamento = req.body.status || '%';

    mysql
        .poolConnect(
            'select tb_vendas.id, tb_vendas.quantidade, tb_vendas.id_anuncio, tb_vendas.cod_ticket, concat (tb_clientes.nome, " ", tb_clientes.sobrenome) as cliente, tb_clientes.email as email_cliente, tb_anuncios.titulo as produto, tb_anuncios.preco - (tb_anuncios.preco / 100 * tb_anuncios.desconto) as preco_unitario, tb_vendas.quantidade * (tb_anuncios.preco - (tb_anuncios.preco / 100 * tb_anuncios.desconto)) as preco_total, date_format(tb_vendas.data_compra, "%d/%m/%Y") as data_compra, tb_vendas.status_pagamento_empresa from tb_vendas inner join tb_clientes on tb_vendas.id_cliente = tb_clientes.id inner join tb_anuncios on tb_vendas.id_anuncio = tb_anuncios.id inner join tb_empresas on tb_anuncios.id_empresa = tb_empresas.id where tb_empresas.id = ? and tb_vendas.status_pagamento = 3 and (tb_vendas.data_compra between ? and ? + interval 1 day) and tb_vendas.status_pagamento_empresa like ?',
            [id_empresa, data_inicial, data_final, status_pagamento]
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
                        email_cliente: row.email_cliente,
                        id_venda: row.id_venda,
                        id_anuncio: row.id_anuncio,
                        produto: row.produto,
                        quantidade: row.quantidade,
                        preco_unitario: row.preco_unitario,
                        preco_total: row.preco_total,
                        data_compra: row.data_compra,
                        ticket: row.cod_ticket,
                        url_anuncio: process.env.DOMAIN + 'empresas/anuncios/' + row.id_anuncio,
                        pagamento: row.status_pagamento_empresa,
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

//Retorna total a receber
exports.totalReceber = (req, res, next) => {
    const id_empresa = req.usuario.id;

    mysql
        .poolConnect('select round((sum(v.quantidade * (an.preco - (an.preco / 100 * an.desconto)))) / 100 * (select comissao from tb_comissao where id = 1), 1) as total from tb_vendas v inner join tb_anuncios an on v.id_anuncio = an.id where v.status_pagamento = 3 and v.status_pagamento_empresa = false and an.id_empresa = ?', [id_empresa])
        .then((results) => {
            if (!results[0].total) {
                return res.status(200).send({
                    total: 0,
                });
            }
            return res.status(200).send({
                total: results[0].total,
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};
