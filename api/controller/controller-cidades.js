const mysql = require('../mysql');

//GET all cities
exports.cidadesGET = (req, res, next) => {
    mysql
        .poolConnect('select tb_cidades.id, tb_cidades.nome, tb_estados.uf from tb_cidades inner join tb_estados on (tb_cidades.id_estado = tb_estados.id) order by tb_cidades.id and tb_estados.uf')
        .then((results) => {
            if (results.length < 1) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Nenhum registro encontrado',
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

//GET cities by uf
exports.cidadesGETUF = (req, res, next) => {
    mysql
        .poolConnect('select tb_cidades.id, tb_cidades.nome, tb_estados.uf from tb_cidades inner join tb_estados on (tb_cidades.id_estado = tb_estados.id) where tb_estados.id = ? order by tb_cidades.nome', [req.params.uf_id])
        .then((results) => {
            if (results.length < 1) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Nenhum registro encontrado',
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

//GET cities by id
exports.cidadesGETId = (req, res, next) => {
    mysql
        .poolConnect('select tb_cidades.id, tb_cidades.nome, tb_estados.uf from tb_cidades inner join tb_estados on (tb_cidades.id_estado = tb_estados.id) where tb_cidades.id = ?', [req.params.cities_id])
        .then((results) => {
            if (results.length < 1) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Nenhum registro encontrado',
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
