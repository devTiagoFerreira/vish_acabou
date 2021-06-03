const mysql = require('../mysql');
const nodemailer = require('nodemailer');

//Retorna todos os clientes de acordo com o número de linhas requisidado
exports.clientes = (req, res, next) => {
    const a_partir_de = parseInt(req.params.a_partir_de),
        num_linhas = parseInt(req.params.num_linhas);
    mysql
        .poolConnect(
            'select c.id, c.foto as url_foto, concat(c.nome, " ", c.sobrenome) as nome, date_format(c.data_nasc, "%d/%m/%Y") as data_nascimento, c.genero, c.cep, c.logradouro, c.numero, c.bairro, c.complemento, cid.nome as cidade, est.uf, date_format(c.data_cadastro, "%d/%m/%Y") as data_cadastro, stc.status_cliente from tb_clientes c inner join tb_cidades cid on c.cidade = cid.id inner join tb_estados est on c.estado = est.id inner join tb_status_cliente stc on c.id_status_cliente = stc.id order by c.nome limit ?, ?',
            [a_partir_de, num_linhas]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum registro encontrado',
                    },
                });
            }
            const url_foto = process.env.DOMAIN + 'imagens/clientes/' + results;
            return res.status(200).send({
                results: results.length,
                clientes: results.map((row) => {
                    let url_cliente = process.env.DOMAIN + 'admin/clientes/' + row.id;
                    let url_foto = null;
                    if (row.url_foto) {
                        url_foto = process.env.DOMAIN + 'imagens/clientes/' + row.id + '/foto';
                    }
                    Object.assign(row, { url_foto }, { url_cliente });
                    return row;
                }),
            });
        })
        .catch((error) => {
            return res.status(500).send({
                error: error,
            });
        });
};

//Retorna cliente conforme id
exports.idCliente = (req, res, next) => {
    const id_cliente = req.params.id_cliente;
    mysql
        .poolConnect(
            'select c.id, c.foto as url_foto, concat(c.nome, " ", c.sobrenome) as nome, date_format(c.data_nasc, "%d/%m/%Y") as data_nascimento, c.genero, c.cep, c.logradouro, c.numero, c.bairro, c.complemento, cid.nome as cidade, est.uf, date_format(c.data_cadastro, "%d/%m/%Y") as data_cadastro, stc.status_cliente from tb_clientes c inner join tb_cidades cid on c.cidade = cid.id inner join tb_estados est on c.estado = est.id inner join tb_status_cliente stc on c.id_status_cliente = stc.id where c.id = ?',
            [id_cliente]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum registro encontrado',
                    },
                });
            }
            if (results[0].url_foto) {
                let url_foto = process.env.DOMAIN + 'imagens/clientes/' + results[0].id + '/foto';
                Object.assign(results[0], { url_foto });
            }
            return res.status(200).send({
                cliente: results,
            });
        })
        .catch((error) => {
            return res.status(500).send({
                error: error,
            });
        });
};
