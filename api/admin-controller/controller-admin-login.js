const mysql = require('../mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Login
exports.login = (req, res, next) => {
    mysql
        .poolConnect('select id, email, nome, senha from tb_admin where email = ?', [req.body.email])
        .then((results) => {
            if (results < 1) {
                return res.status(401).send({
                    erro: {
                        status: 401,
                        mensagem: 'Falha na autenticação.',
                        motivo: 'Credenciais não cadastradas.',
                    },
                });
            }
            bcrypt.compare(req.body.senha, results[0].senha, (error, result) => {
                if (error) {
                    return res.status(401).send({
                        erro: {
                            status: 401,
                            mensagem: 'Falha na autenticação.',
                            motivo: 'Credenciais não cadastradas.',
                        },
                    });
                }
                if (!result) {
                    return res.status(401).send({
                        erro: {
                            status: 401,
                            mensagem: 'Falha na autenticação.',
                            motivo: 'Credenciais não cadastradas.',
                        },
                    });
                }
                const token = {
                    id: results[0].id,
                    email: results[0].email,
                    nome: results[0].nome,
                };
                jwt.sign(token, process.env.VISH_SECRET_KEY, { expiresIn: '30m' }, (error, token) => {
                    if (error) {
                        return res.status(500).send({
                            erro: {
                                status: 500,
                                mensagem: 'Falha na autenticação.',
                                motivo: 'Erro interno no servidor.',
                            },
                        });
                    }
                    return res.status(200).send({
                        resposta: {
                            status: 200,
                            mensagem: 'Autenticação bem-sucedida.',
                            token: token,
                        },
                    });
                });
            });
        })
        .catch((error) => {
            return res.status(401).send({ erro: error });
        });
};
