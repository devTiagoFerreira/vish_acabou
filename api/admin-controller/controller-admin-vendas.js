const mysql = require('../mysql');

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
        .poolConnect('select quantidade, id_anuncio, status_pagamento from tb_vendas where id = ?', [id_venda])
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
            if (results[0].status_pagamento == 2) {
                const id_anuncio = results[0].id_anuncio,
                    quantidade = results[0].quantidade;
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
        })
        .catch((error) => {
            return res.status(500).send({
                erro: {
                    mensagem: error,
                },
            });
        });
};
