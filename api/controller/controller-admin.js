const mysql = require('../mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const func = require('../functions/functions');
// const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './img/empresas');
//     },
//     filename: (req, file, cb) => {
//         cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
//     },
// });
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/webp') {
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// };

// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 1024 * 1024,
//     },
// });

//Login
exports.login = (req, res, next) => {
    mysql
        .poolConnect('select id, email, nome, senha from tb_admin where email = ?', [req.body.email])
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
                    nome: results[0].nome,
                };
                jwt.sign(token, process.env.VISH_SECRET_KEY, { expiresIn: '30m' }, (error, token) => {
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

//Company POST
exports.empresasPOST = (req, res, next) => {
    const empresa_geral = {
        nome_fantasia: req.body.nome_fantasia,
        site: req.body.site,
        complemento: req.body.complemento,
    };

    const empresa_contato = {
        telefone: req.body.telefone || null,
        whatsapp: req.body.whatsapp || null,
    };

    const empresa_obg = [
        (email = req.body.email || null),
        (senha = req.body.senha || null),
        (razao_social = req.body.razao_social || null),
        (ie = req.body.ie.replace(/([^\d])+/gim, '') || null),
        (cnpj = req.body.cnpj.replace(/([^\d])+/gim, '') || null),
        (conta = req.body.conta || null),
        (agencia = req.body.agencia || null),
        (cep = req.body.cep || null),
        (logradouro = req.body.logradouro || null),
        (numero = req.body.numero || null),
        (bairro = req.body.bairro || null),
        (cidade = req.body.cidade || null),
        (estado = req.body.estado || null),
    ];

    for (let i = 0; i < empresa_obg.length; ++i) {
        if (!empresa_obg[i]) {
            return res.status(400).send({
                erro: {
                    status: 400,
                    mensagem: 'Campos obrigatórios incompletos',
                    campos_obrigatorios: {
                        email: empresa_obg[0],
                        senha: empresa_obg[1],
                        razao_social: empresa_obg[2],
                        ie: empresa_obg[3],
                        cnpj: empresa_obg[4],
                        conta: empresa_obg[5],
                        agencia: empresa_obg[6],
                        cep: empresa_obg[7],
                        logradouro: empresa_obg[8],
                        numero: empresa_obg[9],
                        bairro: empresa_obg[10],
                        cidade: empresa_obg[11],
                        estado: empresa_obg[12],
                    },
                },
            });
        }
    }

    if (!empresa_contato.telefone && !empresa_contato.whatsapp) {
        return res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'É necessário informar pelo menos um número para contato',
                contato: {
                    telefone: empresa_contato.telefone,
                    whatsapp: empresa_contato.whatsapp,
                },
            },
        });
    }

    //CNPJ validator
    const cnpj_valido = func.cnpjValidator(empresa_obg[4]);

    if (!cnpj_valido) {
        return res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'O CNPJ informado é inválido.',
                contato: empresa_obg[4],
            },
        });
    }

    //IE validator
    const ei_valido = func.ieValidator(empresa_obg[3]);

    if (!ei_valido) {
        return res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'A Inscrição Estadual informada é inválida.',
                contato: empresa_obg[3],
            },
        });
    }

    mysql
        .poolConnect('select email, cnpj from tb_empresas where email = ? or cnpj = ?', [empresa_obg[0], empresa_obg[4]])
        .then((results) => {
            if (results.length == 1) {
                if (results[0].email == email && results[0].cnpj == cnpj) {
                    return res.status(422).send({
                        erro: {
                            status: 422,
                            mensagem: 'Email e CNPJ já cadastrados',
                        },
                    });
                } else if (results[0].email == email) {
                    return res.status(422).send({
                        erro: {
                            status: 422,
                            mensagem: 'Email já cadastrado',
                        },
                    });
                } else {
                    return res.status(422).send({
                        erro: {
                            status: 422,
                            mensagem: 'CNPJ já cadastrado',
                        },
                    });
                }
            } else if (results.length > 1) {
                return res.status(422).send({
                    erro: {
                        status: 422,
                        mensagem: 'Email e CNPJ já cadastrados',
                    },
                });
            }

            bcrypt.hash(empresa_obg[1], 10, function (error, hash) {
                if (error) {
                    return res.status(500).send({
                        erro: {
                            status: 500,
                            mensagem: 'Erro interno no servidor',
                        },
                    });
                }
                mysql
                    .poolConnect('insert into tb_empresas values (0, ?, ?, null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, default, default)', [
                        empresa_obg[0], //email
                        hash, //senha
                        empresa_obg[2], //razao_social
                        empresa_geral.nome_fantasia,
                        empresa_obg[3], //ie
                        empresa_obg[4], //cnpj
                        empresa_obg[5], //conta
                        empresa_obg[6], //agencia
                        empresa_geral.site,
                        empresa_obg[7], //cep
                        empresa_obg[8], //logradouro
                        empresa_obg[9], //numero
                        empresa_obg[10], //bairro
                        empresa_geral.complemento,
                        empresa_obg[11], //cidade
                        empresa_obg[12], //estado
                    ])
                    .then(() => {
                        jwt.sign({ email: empresa_obg[0] }, process.env.EMAIL_SECRET_KEY, { expiresIn: '7d' }, (error, token) => {
                            if (error) {
                                return res.status(500).send({
                                    erro: {
                                        status: 500,
                                        mensagem: 'Casdasto efetuado com sucesso, porém houve uma falha no envio do e-mail de confirmação.',
                                        motivo: 'Erro na geração do token.',
                                    },
                                });
                            }
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
                                to: empresa_obg[0],
                                subject: 'Bem-vindo(a) a Vish Acabou! - Confirmação de cadastro',
                                html: '<h3>Olá, seja bem-vindo(a) a Vish Acabou!</h3>' + '<p>Para confirmar o seu cadastro na Vish Acabou, clique no link abaixo!</p>' + '<a href="' + token + '">Confirme o seu cadastro aqui!</a>' + '<p>Se você não solicitou nenhum cadastro, desconsidere essa mensagem!</p>' + '<p>' + token + '</p>',
                            };

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    return res.status(500).send({
                                        erro: {
                                            status: 500,
                                            mensagem: 'Cadastro efetuado com sucesso, porém não foi possível enviar o e-mail de confirmação.',
                                            motivo: 'Erro no envio do e-mail de confirmação.',
                                        },
                                    });
                                } else {
                                    return res.status(201).send({
                                        resposta: {
                                            status: 201,
                                            mensagem: 'Cadastro efetuado com sucesso!',
                                        },
                                    });
                                }
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
        })
        .catch((error) => {
            return res.status(500).send({
                erro: {
                    status: 500,
                    mensagem: error,
                },
            });
        });
};
