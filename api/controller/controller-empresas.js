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
                        status: 401,
                        mensagem: 'Falha na autenticação',
                        motivo: 'Credenciais não cadastradas',
                    },
                });
            }
            bcrypt.compare(req.body.senha, results[0].senha, (error, result) => {
                if (error) {
                    return res.status(401).send({
                        erro: {
                            status: 401,
                            mensagem: 'Falha na autenticação',
                            motivo: 'Credenciais não cadastradas',
                        },
                    });
                }
                if (!result) {
                    return res.status(401).send({
                        erro: {
                            status: 401,
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
                                status: 500,
                                mensagem: 'Falha na autenticação',
                                motivo: 'Erro interno no servidor',
                            },
                        });
                    }
                    return res.status(200).send({
                        resposta: {
                            status: 200,
                            mensagem: 'Autenticação bem-sucedida',
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

//Ativação de cadastro
exports.validarEmail = (req, res, next) => {
    const token = req.body.token_ativacao || null;
    if (!token) {
        return res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'Token de ativação de e-mail não informado.',
            },
        });
    }
    jwt.verify(token, process.env.EMAIL_SECRET_KEY, function (error, decode) {
        if (error) {
            return res.status(401).send({
                erro: {
                    status: 401,
                    mensagem: 'Token de ativação de e-mail não autorizado ou expirado.',
                },
            });
        }
        if (decode.id != req.usuario.id) {
            return res.status(401).send({
                erro: {
                    status: 401,
                    mensagem: 'Token de ativação de e-mail inválido.',
                },
            });
        }
        mysql
            .poolConnect('select email, id_status_empresa from tb_empresas where id = ?', [decode.id])
            .then((results) => {
                if (results.length == 0) {
                    return res.status(401).send({
                        erro: {
                            status: 401,
                            mensagem: 'Token de ativação de e-mail inválido.',
                        },
                    });
                }
                if (decode.email != results[0].email) {
                    return res.status(401).send({
                        erro: {
                            status: 401,
                            mensagem: 'Token de ativação de e-mail inválido.',
                        },
                    });
                }
                if (results[0].id_status_empresa != 1) {
                    return res.status(401).send({
                        erro: {
                            status: 401,
                            mensagem: 'Token de ativação de e-mail inválido.',
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
                                        status: 500,
                                        mensagem: 'Cadastro ativado com sucesso, porém não foi possível enviar o email de aviso.',
                                        motivo: 'Erro no envio do e-mail de aviso.',
                                    },
                                });
                            } else {
                                return res.status(201).send({
                                    resposta: {
                                        status: 201,
                                        mensagem: 'Cadastro ativado com sucesso!',
                                    },
                                });
                            }
                        });
                    })
                    .catch((error) => {
                        return res.status(500).send({
                            erro: {
                                status: 500,
                                mensagem: error,
                            },
                        });
                    });
            })
            .catch((error) => {
                return res.status(500).send({
                    erro: {
                        status: 500,
                        mensagem: error,
                    },
                });
            });
    });
};
