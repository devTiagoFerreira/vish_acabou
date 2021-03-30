const mysql = require('../mysql');

//Retorna todas as cidades
exports.cidadesGET = (req, res, next) => {
    mysql
        .poolConnect('select tb_cidades.id, tb_cidades.nome, tb_estados.uf from tb_cidades inner join tb_estados on (tb_cidades.id_estado = tb_estados.id) order by tb_cidades.id and tb_estados.uf')
        .then((results) => {
            if (results.length < 1) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Nenhum registro encontrado.',
                    },
                });
            }
            return res.status(200).send({
                resposta: {
                    status: 200,
                    registros: results.length,
                    cidades: results.map((row) => {
                        return {
                            id: row.id,
                            nome: row.nome,
                            uf: row.uf,
                            url: process.env.DOMAIN_PORT + 'cidades/' + row.id,
                        };
                    }),
                },
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};

//Retorna todas as cidades conforme o estado
exports.cidadesGETUF = (req, res, next) => {
    mysql
        .poolConnect('select tb_cidades.id, tb_cidades.nome, tb_estados.uf from tb_cidades inner join tb_estados on (tb_cidades.id_estado = tb_estados.id) where tb_estados.id = ? order by tb_cidades.nome', [req.params.id_uf])
        .then((results) => {
            if (results.length < 1) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Nenhum registro encontrado.',
                    },
                });
            }
            return res.status(200).send({
                resposta: {
                    status: 200,
                    registros: results.length,
                    cidades: results.map((row) => {
                        return {
                            id: row.id,
                            nome: row.nome,
                            uf: row.uf,
                            url: process.env.DOMAIN_PORT + 'cidades/' + row.id,
                        };
                    }),
                },
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};

//Retorna a cidade conforme o seu id
exports.cidadesGETId = (req, res, next) => {
    mysql
        .poolConnect('select tb_cidades.id, tb_cidades.nome, tb_estados.uf from tb_cidades inner join tb_estados on (tb_cidades.id_estado = tb_estados.id) where tb_cidades.id = ?', [req.params.id_cidade])
        .then((results) => {
            if (results.length < 1) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Nenhum registro encontrado.',
                    },
                });
            }
            return res.status(200).send({
                resposta: {
                    status: 200,
                    registros: results.length,
                    cidade: { id: results[0].id, nome: results[0].nome, uf: results[0].uf, url: process.env.DOMAIN_PORT + 'cidades/' + results[0].id },
                },
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};
