const mysql = require('../mysql');

//GET all states
exports.estadosGET = (req, res, next) => {
    mysql
        .poolConnect('select * from tb_estados order by nome')
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
                    estados: results.map((row) => {
                        return {
                            id: row.id,
                            nome: row.nome,
                            uf: row.uf,
                            url: process.env.DOMAIN_PORT + 'estados/' + row.id,
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

//GET states by id
exports.estadosGETId = (req, res, next) => {
    mysql
        .poolConnect('select * from tb_estados where id = ?', [req.params.states_id])
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
                    estado: { id: results[0].id, nome: results[0].nome, uf: results[0].uf, url: process.env.DOMAIN_PORT + 'estados/' + results[0].id },
                },
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};
