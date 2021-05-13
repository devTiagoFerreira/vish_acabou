const mysql = require('../mysql');

exports.addVenda = (req, res, next) => {
    const id_cliente = req.usuario.id,
        id_anuncio = req.body.id_anuncio || null,
        quantidade = req.body.quantidade || null;
    var ticket = '';

    const base_ticket = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (i = 0; i < 6; i++) {
        let numero = Math.floor(Math.random() * (base_ticket.length - 0)) + 0;
        ticket += base_ticket[numero];
    }

    if (!id_anuncio || !quantidade) {
        return res.status(400).send({
            erro: {
                mensagem: 'Campo obrigátório não preenchido',
                id_anuncio: id_anuncio,
                quantidade: quantidade,
            },
        });
    }

    mysql
        .poolConnect('select id from tb_anuncios where id = ?', [id_anuncio])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Não existe cadastro de anúncio com o id fornecido',
                    },
                });
            }

            mysql
                .poolConnect('update tb_anuncios set vendidos = vendidos + ? where id = ?', [quantidade, id_anuncio])
                .then(() => {
                    mysql
                        .poolConnect('insert into tb_vendas values (0, ?, ?, default, ?, ?, default)', [id_anuncio, id_cliente, quantidade, ticket])
                        .then(() => {
                            return res.status(201).send({
                                mensagem: 'Compra efetuada com sucesso, aguarde confirmação de pagamento',
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
