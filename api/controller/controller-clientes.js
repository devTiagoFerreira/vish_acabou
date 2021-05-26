const mysql = require('../mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const func = require('../functions/functions');

//Tratamento de imagens
const path = require('path');
const fs = require('fs');
const multer = require('multer');

//Login
exports.login = (req, res, next) => {
    mysql
        .poolConnect('select id, email, nome, senha from tb_clientes where email = ?', [req.body.email])
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
                    nome: results[0].nome,
                };
                jwt.sign(token, process.env.CLIENT_SECRET_KEY, { expiresIn: '1h' }, (error, token) => {
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

//Cadastro de clientes
exports.cadastro = (req, res, next) => {
    const cliente_geral = {
        data_nasc: req.body.data_nasc || null,
        genero: req.body.genero || null,
        complemento: req.body.complemento || null,
    };

    let cep = req.body.cep || null;
    if (cep != null) {
        cep = cep.replace(/([^\d])+/gim, '');
    }

    const cliente_obg = [(email = req.body.email || null), (senha = req.body.senha || null), (nome = req.body.nome || null), (sobrenome = req.body.sobrenome || null), (cep = cep), (logradouro = req.body.logradouro || null), (numero = req.body.numero || null), (bairro = req.body.bairro || null), (cidade = req.body.cidade || null), (estado = req.body.estado || null)];

    for (let i = 0; i < cliente_obg.length; ++i) {
        if (!cliente_obg[i]) {
            return res.status(400).send({
                erro: {
                    mensagem: 'Campos obrigatórios incompletos',
                    campos_obrigatorios: {
                        email: cliente_obg[0],
                        senha: cliente_obg[1],
                        nome: cliente_obg[2],
                        sobrenome: cliente_obg[3],
                        cep: cliente_obg[4],
                        logradouro: cliente_obg[5],
                        numero: cliente_obg[6],
                        bairro: cliente_obg[7],
                        cidade: cliente_obg[8],
                        estado: cliente_obg[9],
                    },
                },
            });
        }
    }

    if (!func.emailValidator(cliente_obg[0])) {
        return res.status(400).send({
            erro: {
                mensagem: 'O email informado é inválido',
                email: cliente_obg[0],
            },
        });
    }

    mysql
        .poolConnect('select email from tb_clientes where email = ?', [cliente_obg[0]])
        .then((results) => {
            if (!results.length == 0) {
                return res.status(422).send({
                    erro: {
                        mensagem: 'Já existe um cadastro com o email informado',
                    },
                });
            }
            bcrypt.hash(cliente_obg[1], 10, function (error, hash) {
                if (error) {
                    return res.status(500).send({
                        erro: {
                            mensagem: 'Erro interno no servidor',
                        },
                    });
                }

                mysql
                    .poolConnect('insert into tb_clientes values (0, ?, ?, null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, default, default)', [
                        cliente_obg[0], //email
                        hash, //senha
                        cliente_obg[2], //nome
                        cliente_obg[3], //sobrenome
                        cliente_geral.data_nasc,
                        cliente_geral.genero,
                        cliente_obg[4], //cep
                        cliente_obg[5], //logradouro
                        cliente_obg[6], //numero
                        cliente_obg[7], //bairro
                        cliente_geral.complemento,
                        cliente_obg[8], //cidade
                        cliente_obg[9], //estado
                    ])
                    .then((results) => {
                        jwt.sign({ id: results.insertId, email: cliente_obg[0] }, process.env.EMAIL_SECRET_KEY, { expiresIn: '7d' }, (error, token) => {
                            if (error) {
                                return res.status(500).send({
                                    erro: {
                                        mensagem: 'Casdasto efetuado com sucesso, porém houve uma falha no envio do e-mail de confirmação',
                                        motivo: 'Erro na geração do token de confirmação',
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
                                to: cliente_obg[0],
                                subject: 'Bem-vindo(a) a Vish Acabou! - Confirmação de cadastro',
                                html: '<h3>Olá, seja bem-vindo(a) a Vish Acabou!</h3>' + '<p>Para confirmar o seu cadastro na Vish Acabou, clique no link abaixo!</p>' + '<a href="' + token + '">Confirme o seu cadastro aqui!</a>' + '<p>Se você não solicitou nenhum cadastro, desconsidere essa mensagem!</p>' + '<p>' + token + '</p>',
                            };

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    return res.status(500).send({
                                        erro: {
                                            mensagem: 'Cadastro efetuado com sucesso, porém não foi possível enviar o e-mail de confirmação',
                                            motivo: 'Erro no envio do e-mail de confirmação',
                                        },
                                    });
                                } else {
                                    return res.status(201).send({
                                        mensagem: 'Cadastro efetuado com sucesso',
                                    });
                                }
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
        })
        .catch((error) => {
            return res.status(500).send({
                erro: {
                    mensagem: error,
                },
            });
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
            .poolConnect('select email, id_status_cliente from tb_clientes where id = ?', [decode.id])
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
                if (results[0].id_status_cliente != 1) {
                    return res.status(401).send({
                        erro: {
                            mensagem: 'Token de ativação de e-mail inválido',
                        },
                    });
                }
                mysql
                    .poolConnect('update tb_clientes set id_status_cliente = 2 where id = ?', [decode.id])
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

//Inativação de cadastro
exports.inativaEmail = (req, res, next) => {
    const cliente = req.usuario.id;
    mysql
        .poolConnect('update tb_clientes set id_status_cliente = 1 where id = ?', [cliente])
        .then((results) => {
            res.status(200).send({
                mensagem: 'Cadastro inativado com sucesso',
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

//Atualização de foto de perfil
exports.attFoto = (req, res, next) => {
    const id_cliente = req.usuario.id;

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './img/clientes/foto');
        },
        filename: (req, file, cb) => {
            cb(null, new Date().toISOString().replace(/:/g, '-') + '-ID-' + id_cliente + '-' + file.originalname);
        },
    });

    const fileFilter = (req, file, cb) => {
        if ((file.mimetype === 'image/webp', 'image/jpg', 'image/jpeg', 'image/png')) {
            cb(null, true);
        } else {
            cb(null, false);
            cb(new Error('A extensão do arquivo é inválida'));
        }
    };

    const upload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: (1024 * 1024) / 2,
        },
    }).single('foto');

    mysql
        .poolConnect('select foto from tb_clientes where id = ?', [id_cliente])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum cadastro foi encontrado',
                    },
                });
            }
            upload(req, res, function (error) {
                if (error instanceof multer.MulterError) {
                    //Ocorreu um erro do Multer durante o upload.
                    if (error.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).send({
                            erro: {
                                mensagem: 'O tamanho do arquivo ultrapassou o limite permitido',
                                limite: 500 + ' kilobytes',
                            },
                        });
                    } else {
                        return res.status(500).send({
                            erro: error.message,
                        });
                    }
                } else if (error) {
                    // Ocorreu um erro desconhecido durante o upload.
                    return res.status(400).send({
                        erro: {
                            mensagem: error.message,
                        },
                    });
                }
                if (!req.file) {
                    return res.status(400).send({
                        erro: {
                            mensagem: 'Nenhum arquivo foi enviado',
                        },
                    });
                }
                const foto = req.file.filename;
                const fotobd = results[0].foto;
                mysql
                    .poolConnect('update tb_clientes set foto = ? where id = ?', [foto, id_cliente])
                    .then(() => {
                        if (fotobd != null) {
                            const urlFoto = path.join('./img/clientes/foto', fotobd);
                            const fotoExists = fs.existsSync(urlFoto);
                            if (fotoExists) {
                                fs.unlink(urlFoto, (error) => {
                                    if (error) {
                                        return res.status(500).send({
                                            erro: error,
                                        });
                                    }
                                    return res.status(200).send({
                                        mensagem: 'Foto atualizada com sucesso',
                                    });
                                });
                            } else {
                                return res.status(200).send({
                                    mensagem: 'Foto atualizada com sucesso',
                                });
                            }
                        } else {
                            return res.status(200).send({
                                mensagem: 'Foto atualizada com sucesso',
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

//Atualização de email
exports.attEmail = (req, res, next) => {
    const id_cliente = req.usuario.id,
        novo_email = req.body.novo_email || null;
    if (!novo_email) {
        return res.status(500).send({
            erro: {
                mensagem: 'Informe o novo endereço de email',
            },
        });
    }
    if (!func.emailValidator(novo_email)) {
        return res.status(400).send({
            erro: {
                mensagem: 'O novo email informado é inválido',
                novo_email: novo_email,
            },
        });
    }
    mysql
        .poolConnect('select id from tb_clientes where email = ?', [novo_email])
        .then((results) => {
            if (results.length > 0) {
                return res.status(422).send({
                    erro: {
                        mensagem: 'Já existe um cadastro com o novo email',
                    },
                });
            }
            jwt.sign({ id: id_cliente, email: novo_email }, process.env.EMAIL_SECRET_KEY, { expiresIn: '7d' }, (error, token) => {
                if (error) {
                    return res.status(500).send({
                        erro: {
                            mensagem: 'Falha no envio do e-mail de confirmação',
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
                    to: novo_email,
                    subject: 'Bem-vindo(a) a Vish Acabou! - Confirmação de cadastro',
                    html: '<h3>Olá, seja bem-vindo(a) a Vish Acabou!</h3>' + '<p>Para confirmar o seu cadastro na Vish Acabou, clique no link abaixo!</p>' + '<a href="' + token + '">Confirme o seu cadastro aqui!</a>' + '<p>Se você não solicitou nenhum cadastro, desconsidere essa mensagem!</p>' + '<p>' + token + '</p>',
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        return res.status(500).send({
                            erro: {
                                mensagem: 'Falha no envio do e-mail de confirmação',
                            },
                        });
                    } else {
                        return res.status(200).send({
                            mensagem: 'Enviamos um link de confirmação para o seu novo endereço, confirme o cadastro para validar o seu novo email.',
                        });
                    }
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

//Confirmação atualização de email
exports.confirmaAttEmail = (req, res, next) => {
    const id_cliente = req.usuario.id,
        email_cliente = req.usuario.email,
        token_ativacao = req.body.token_ativacao || null;

    if (!token_ativacao) {
        return res.status(400).send({
            erro: {
                mensagem: 'Informe o token de ativação de email',
                token_ativacao: token_ativacao,
            },
        });
    }
    jwt.verify(token_ativacao, process.env.EMAIL_SECRET_KEY, function (error, decode) {
        if (error) {
            return res.status(401).send({
                erro: {
                    mensagem: 'Token de ativação de e-mail não autorizado ou expirado',
                },
            });
        }
        if (decode.id != id_cliente) {
            return res.status(401).send({
                erro: {
                    mensagem: 'Token de ativação de e-mail inválido',
                },
            });
        }

        mysql
            .poolConnect('select id from tb_clientes where email = ?', [email_cliente])
            .then((results) => {
                if (results.length > 0) {
                    return res.status(422).send({
                        erro: {
                            mensagem: 'Já existe um cadastro com o novo email',
                        },
                    });
                }
                mysql
                    .poolConnect('update tb_clientes set email = ? where id = ?', [decode.id, decode.email])
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
                                    mensagem: 'Novo endereço de email ativado com sucesso!',
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

//Atualização de senha
exports.attSenha = (req, res, next) => {
    const id_cliente = req.usuario.id,
        email_cliente = req.usuario.email,
        senha_atual = req.body.senha_atual || null,
        nova_senha = req.body.nova_senha || null;

    if (!senha_atual) {
        res.status(400).send({
            erro: {
                mensagem: 'Informe a senha atual',
                senha_atual: senha_atual,
            },
        });
    }

    if (!nova_senha) {
        return res.status(400).send({
            erro: {
                mensagem: 'Informe a nova senha',
                nova_senha: nova_senha,
            },
        });
    }

    mysql
        .poolConnect('select senha from tb_clientes where id = ?', [id_cliente])
        .then((results) => {
            bcrypt.compare(senha_atual, results[0].senha, (error, result) => {
                if (error) {
                    return res.status(401).send({
                        erro: {
                            mensagem: 'Falha na autenticação',
                        },
                    });
                }
                if (!result) {
                    return res.status(401).send({
                        erro: {
                            mensagem: 'Falha na autenticação',
                        },
                    });
                }
                bcrypt.hash(nova_senha, 10, (error, hash) => {
                    if (error) {
                        return res.status(500).send({
                            erro: error,
                        });
                    }
                    mysql
                        .poolConnect('update tb_clientes set senha = ? where id = ?', [hash, id_cliente])
                        .then(() => {
                            const transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: process.env.EMAIL_USER,
                                    pass: process.env.EMAIL_PASS,
                                },
                            });

                            const mailOptions = {
                                from: process.env.EMAIL_USER,
                                to: email_cliente,
                                subject: 'Aviso de alteração de senha',
                                html: '<h3>Atenção!</h3>' + '<p>Sua senha foi alterada para <strong>' + nova_senha + '</strong>!</p>',
                            };

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    return res.status(500).send({
                                        erro: {
                                            mensagem: 'Senha atualizada com sucesso, porém não foi possível enviar o email de aviso',
                                        },
                                    });
                                } else {
                                    return res.status(200).send({
                                        mensagem: 'Senha atualizada com sucesso',
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

//Atualiza dados de cadastro
exports.attCadastro = (req, res, next) => {
    const id_cliente = req.usuario.id;
    const cliente_geral = {
        data_nasc: req.body.data_nasc || null,
        genero: req.body.genero || null,
        complemento: req.body.complemento || null,
    };

    let cep = req.body.cep || null;
    if (cep != null) {
        cep = cep.replace(/([^\d])+/gim, '');
    }

    const cliente_obg = [(nome = req.body.nome || null), (sobrenome = req.body.sobrenome || null), (cep = cep), (logradouro = req.body.logradouro || null), (numero = req.body.numero || null), (bairro = req.body.bairro || null), (cidade = req.body.cidade || null), (estado = req.body.estado || null)];

    for (let i = 0; i < cliente_obg.length; ++i) {
        if (!cliente_obg[i]) {
            return res.status(400).send({
                erro: {
                    mensagem: 'Campos obrigatórios incompletos',
                    campos_obrigatorios: {
                        nome: cliente_obg[0],
                        sobrenome: cliente_obg[1],
                        cep: cliente_obg[2],
                        logradouro: cliente_obg[3],
                        numero: cliente_obg[4],
                        bairro: cliente_obg[5],
                        cidade: cliente_obg[6],
                        estado: cliente_obg[7],
                    },
                },
            });
        }
    }

    mysql
        .poolConnect('update tb_clientes set nome = ?, sobrenome = ?, cep = ?, logradouro = ?, numero = ?, bairro = ?, cidade = ?, estado = ?, data_nasc = ?, genero = ?, complemento = ? where id = ?', [
            cliente_obg[0],
            cliente_obg[1],
            cliente_obg[2],
            cliente_obg[3],
            cliente_obg[4],
            cliente_obg[5],
            cliente_obg[6],
            cliente_obg[7],
            cliente_geral.data_nasc,
            cliente_geral.genero,
            cliente_geral.complemento,
            id_cliente,
        ])
        .then(() => {
            return res.status(200).send({
                mensagem: 'Dados atualizados com sucesso',
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

//Renorna dados de cadastro
exports.dados = (req, res, next) => {
    const id_cliente = req.usuario.id;
    mysql
        .poolConnect(
            'select c.id, c.email, c.foto, c.nome, c.sobrenome, date_format(c.data_nasc, "%d/%m/%Y") as data_nasc, c.genero, c.cep, c.logradouro, c.numero, c.bairro, c.complemento, date_format(c.data_cadastro, "%d/%m/%Y às %H:%i h") as data_cadastro, tb_status_cliente.status_cliente, tb_estados.nome as estado, tb_cidades.nome as cidade from tb_clientes c inner join tb_status_cliente on c.id_status_cliente = tb_status_cliente.id inner join tb_estados on c.estado = tb_estados.id inner join tb_cidades on c.cidade = tb_cidades.id where c.id = 1'
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Cadastro não encontrado',
                    },
                    sd,
                });
            }
            const foto = { foto: process.env.DOMAIN + 'imagens/clientes/' + results[0].id + '/foto' };
            Object.assign(results[0], foto);
            return res.status(200).send({
                cliente: results[0],
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

//Deleta foto de perfil
exports.excFoto = (req, res, next) => {
    const id_cliente = req.usuario.id;
    mysql
        .poolConnect('select foto from tb_clientes where id = ?', [id_cliente])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum cadastro foi encontrado',
                    },
                });
            }
            if (results[0].foto === null) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Não existe nenhum arquivo para ser deletado.',
                    },
                });
            }
            const urlFoto = path.join('./img/clientes/foto', results[0].foto);
            const fotoExists = fs.existsSync(urlFoto);
            mysql
                .poolConnect('update tb_clientes set foto = null where id = ?', [id_cliente])
                .then(() => {
                    if (!fotoExists) {
                        return res.status(200).send({
                            mensagem: 'Foto excluída com sucesso',
                        });
                    }
                    fs.unlink(urlFoto, (error) => {
                        if (error) {
                            return res.status(500).send({
                                erro: error,
                            });
                        }
                        return res.status(200).send({
                            mensagem: 'Foto excluída com sucesso',
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

//Retorna todas as empresas que o cliente ja comprou
exports.empresaCompra = (req, res, next) => {
    const id_cliente = req.usuario.id;

    mysql
        .poolConnect('select tb_empresas.id as id_empresa, tb_empresas.razao_social as empresa from tb_vendas inner join tb_anuncios on tb_vendas.id_anuncio = tb_anuncios.id inner join tb_empresas on tb_anuncios.id_empresa = tb_empresas.id where tb_vendas.id_cliente = ? group by empresa', [id_cliente])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: 'Não existe nenhuma compra efetuada',
                });
            }
            return res.status(200).send({
                resultados: results.length,
                empresa: results.map((row) => {
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

//Retorna compras conforme filtros
exports.compras = (req, res, next) => {
    const id_cliente = req.usuario.id;
    const data = new Date();
    const id_empresa = req.body.id_empresa || '%',
        data_inicial = req.body.data_inicial || '0000-00-00',
        data_final = req.body.data_final || data.getFullYear() + '-' + (data.getMonth() + 1) + '-' + data.getDate(),
        status = req.body.status || '%';
    mysql
        .poolConnect(
            'select tb_vendas.id, tb_vendas.quantidade, tb_vendas.id_anuncio, tb_empresas.id as id_empresa, tb_empresas.razao_social as empresa, tb_vendas.cod_ticket, tb_status_pagamento.status_pagamento, tb_anuncios.titulo as produto, tb_anuncios.preco - (tb_anuncios.preco / 100 * tb_anuncios.desconto) as preco_unitario, tb_vendas.quantidade * (tb_anuncios.preco - (tb_anuncios.preco / 100 * tb_anuncios.desconto)) as preco_total, date_format(tb_vendas.data_compra, "%d/%m/%Y") as data_compra from tb_vendas inner join tb_clientes on tb_vendas.id_cliente = tb_clientes.id inner join tb_anuncios on tb_vendas.id_anuncio = tb_anuncios.id inner join tb_empresas on tb_anuncios.id_empresa = tb_empresas.id inner join tb_status_pagamento on tb_vendas.status_pagamento = tb_status_pagamento.id where tb_clientes.id = ? and tb_empresas.id like ? and (tb_vendas.data_compra between ? and ? + interval 1 day) and tb_vendas.status_pagamento like ?',
            [id_cliente, id_empresa, data_inicial, data_final, status]
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
                    if (row.status_pagamento == 'Aprovado') {
                        return {
                            id_empresa: row.id_empresa,
                            empresa: row.empresa,
                            id_venda: row.id_venda,
                            id_anuncio: row.id_anuncio,
                            produto: row.produto,
                            quantidade: row.quantidade,
                            preco_unitario: row.preco_unitario,
                            preco_total: row.preco_total,
                            data_compra: row.data_compra,
                            ticket: row.cod_ticket,
                            pagamento: row.status_pagamento,
                        };
                    } else {
                        return {
                            id_empresa: row.id_empresa,
                            empresa: row.empresa,
                            id_venda: row.id_venda,
                            id_anuncio: row.id_anuncio,
                            produto: row.produto,
                            quantidade: row.quantidade,
                            preco_unitario: row.preco_unitario,
                            preco_total: row.preco_total,
                            data_compra: row.data_compra,
                            ticket: '',
                            pagamento: row.status_pagamento,
                        };
                    }
                }),
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};
