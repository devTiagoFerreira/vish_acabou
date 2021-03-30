const mysql = require('../mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const func = require('../functions/functions');

//Tratamento de imagens
const path = require('path');
const fs = require('fs');
const multer = require('multer');

//Cadasto de empresas
exports.cadastroEmpresas = (req, res, next) => {
    const empresa_geral = {
        nome_fantasia: req.body.nome_fantasia,
        site: req.body.site,
        complemento: req.body.complemento,
    };

    const empresa_contato = {
        telefone: req.body.telefone.replace(/([^\d])+/gim, '') || null,
        whatsapp: req.body.whatsapp.replace(/([^\d])+/gim, '') || null,
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

    if (!func.emailValidator(empresa_obg[0])) {
        return res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'O email informado é inválido.',
                email: empresa_obg[0],
            },
        });
    }

    for (let i = 0; i < empresa_obg.length; ++i) {
        if (!empresa_obg[i]) {
            return res.status(400).send({
                erro: {
                    status: 400,
                    mensagem: 'Campos obrigatórios incompletos.',
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
                mensagem: 'É necessário informar pelo menos um número para contato.',
                contato: {
                    telefone: empresa_contato.telefone,
                    whatsapp: empresa_contato.whatsapp,
                },
            },
        });
    }

    //Validador de CNPJ
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

    //Validador de IE
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
                            mensagem: 'Email e CNPJ já cadastrados.',
                        },
                    });
                } else if (results[0].email == email) {
                    return res.status(422).send({
                        erro: {
                            status: 422,
                            mensagem: 'Email já cadastrado.',
                        },
                    });
                } else {
                    return res.status(422).send({
                        erro: {
                            status: 422,
                            mensagem: 'CNPJ já cadastrado.',
                        },
                    });
                }
            } else if (results.length > 1) {
                return res.status(422).send({
                    erro: {
                        status: 422,
                        mensagem: 'Email e CNPJ já cadastrados.',
                    },
                });
            }

            bcrypt.hash(empresa_obg[1], 10, function (error, hash) {
                if (error) {
                    return res.status(500).send({
                        erro: {
                            status: 500,
                            mensagem: 'Erro interno no servidor.',
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
                    .then((results) => {
                        mysql
                            .poolConnect('insert into tb_contato_empresa values (0, ?, ?, ?)', [results.insertId, empresa_contato.telefone, empresa_contato.whatsapp])
                            .then((results) => {
                                console.log(results);
                            })
                            .catch((error) => {
                                return res.status(500).send({
                                    erro: {
                                        status: 500,
                                        mensagem: error,
                                    },
                                });
                            });
                        jwt.sign({ id: results.insertId, email: empresa_obg[0] }, process.env.EMAIL_SECRET_KEY, { expiresIn: '7d' }, (error, token) => {
                            if (error) {
                                return res.status(500).send({
                                    erro: {
                                        status: 500,
                                        mensagem: 'Casdasto efetuado com sucesso, porém houve uma falha no envio do e-mail de confirmação.',
                                        motivo: 'Erro na geração do token de confirmação.',
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

//Reenviar e-mail de ativação de cadastro
exports.reenviarEmail = (req, res, next) => {
    const email = req.body.email || null;

    if (!email) {
        return res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'E-mail não informado.',
                email: email,
            },
        });
    }

    if (!func.emailValidator(email)) {
        return res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'O email informado é inválido.',
                email: email,
            },
        });
    }

    mysql
        .poolConnect('select id from tb_empresas where email = ?', [email])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Nenhum cadastro com esse e-mail foi encontrado.',
                        email: email,
                    },
                });
            }

            jwt.sign({ id: results[0].id, email: email }, process.env.EMAIL_SECRET_KEY, { expiresIn: '7d' }, (error, token) => {
                if (error) {
                    return res.status(500).send({
                        erro: {
                            status: 500,
                            mensagem: 'Erro interno no servidor.',
                            motivo: 'Erro na geração do token de confirmação.',
                        },
                    });
                }
                //E-mail de ativação
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Bem-vindo(a) a Vish Acabou! - Confirmação de cadastro',
                    html: '<h3>Olá, seja bem-vindo(a) a Vish Acabou!</h3>' + '<p>Para confirmar o seu cadastro na Vish Acabou, clique no link abaixo!</p>' + '<a href="' + token + '">Confirme o seu cadastro aqui!</a>' + '<p>Se você não solicitou nenhum cadastro, desconsidere essa mensagem!</p>' + '<p>' + token + '</p>',
                };

                transporter.sendMail(mailOptions, function (error) {
                    if (error) {
                        return res.status(500).send({
                            erro: {
                                status: 500,
                                mensagem: 'Erro interno no servidor.',
                                motivo: 'Erro no envio do e-mail de confirmação.',
                            },
                        });
                    } else {
                        return res.status(200).send({
                            resposta: {
                                status: 200,
                                mensagem: 'E-mail de confirmação reenviado com sucesso!',
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
};

//Alterar e-mail
exports.alterarEmail = (req, res, next) => {
    const emailAtual = req.body.email_atual || null;
    const novoEmail = req.body.novo_email || null;

    if (!emailAtual) {
        return res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'O e-mail atual não foi informado.',
                email_atual: emailAtual,
            },
        });
    }
    if (!novoEmail) {
        return res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'O novo e-mail não foi informado.',
                novo_email: novoEmail,
            },
        });
    }
    if (!func.emailValidator(emailAtual)) {
        return res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'O email atual informado é inválido.',
                email_atual: emailAtual,
            },
        });
    }
    if (!func.emailValidator(novoEmail)) {
        return res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'O novo email informado é inválido.',
                novo_email: novoEmail,
            },
        });
    }
    mysql
        .poolConnect('select id from tb_empresas where email = ?', [novoEmail])
        .then((results) => {
            if (!results.length == 0) {
                return res.status(422).send({
                    erro: {
                        status: 422,
                        mensagem: 'Já existe um cadastro com o novo email informado.',
                        novo_email: novoEmail,
                    },
                });
            }
            mysql
                .poolConnect('select id from tb_empresas where email = ?', [emailAtual])
                .then((results) => {
                    if (results.length == 0) {
                        return res.status(404).send({
                            erro: {
                                status: 404,
                                mensagem: 'Nenhum cadastro com esse e-mail foi encontrado.',
                                email_atual: emailAtual,
                            },
                        });
                    }
                    const token = {
                        id: results[0].id,
                        email: novoEmail,
                    };
                    mysql
                        .poolConnect('update tb_empresas set email = ? where id = ?', [novoEmail, results[0].id])
                        .then((results) => {
                            jwt.sign(token, process.env.EMAIL_SECRET_KEY, { expiresIn: '7d' }, (error, token) => {
                                if (error) {
                                    return res.status(500).send({
                                        erro: {
                                            status: 500,
                                            mensagem: 'E-mail alterado com sucesso, porém houve uma falha no envio do e-mail de confirmação.',
                                            motivo: 'Erro na geração do token de confirmação.',
                                        },
                                    });
                                }
                                //E-mail de ativação
                                const transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: process.env.EMAIL_USER,
                                        pass: process.env.EMAIL_PASS,
                                    },
                                });

                                const mailOptions = {
                                    from: process.env.EMAIL_USER,
                                    to: novoEmail,
                                    subject: 'Bem-vindo(a) a Vish Acabou! - Confirmação de cadastro',
                                    html: '<h3>Olá, seja bem-vindo(a) a Vish Acabou!</h3>' + '<p>Para confirmar o seu cadastro na Vish Acabou, clique no link abaixo!</p>' + '<a href="' + token + '">Confirme o seu cadastro aqui!</a>' + '<p>Se você não solicitou nenhum cadastro, desconsidere essa mensagem!</p>' + '<p>' + token + '</p>',
                                };

                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        return res.status(500).send({
                                            erro: {
                                                status: 500,
                                                mensagem: 'E-mail alterado com sucesso, porém não foi possível enviar o e-mail de confirmação.',
                                                motivo: 'Erro no envio do e-mail de confirmação.',
                                            },
                                        });
                                    } else {
                                        return res.status(201).send({
                                            resposta: {
                                                status: 201,
                                                mensagem: 'E-mail alterado com sucesso!',
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
};

//Retorna todas as empresas cadastradas - Dados parciais
exports.empresas = (req, res, next) => {
    mysql
        .poolLineToLine(
            'select tb_empresas.logo, tb_empresas.id, tb_empresas.razao_social, tb_empresas.nome_fantasia, tb_cidades.nome as cidade, tb_estados.uf as estado, tb_status_empresa.status_empresa as "status" from tb_empresas inner join tb_cidades inner join tb_estados inner join tb_status_empresa on (tb_empresas.cidade = tb_cidades.id) and (tb_empresas.estado = tb_estados.id) and (tb_empresas.id_status_empresa = tb_status_empresa.id) order by tb_empresas.razao_social'
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Nenhum cadastro encontado.',
                    },
                });
            }
            return res.status(200).send({
                resposta: {
                    status: 200,
                    registros: results.length,
                    empresas: results.map((row) => {
                        return {
                            id: row.id,
                            logo: row.logo,
                            razao_social: row.razao_social,
                            nome_fantasia: row.nome_fantasia,
                            cidade: row.cidade,
                            estado: row.estado,
                            status: row.status,
                            url: process.env.DOMAIN_PORT + 'admin/empresas/' + row.id,
                        };
                    }),
                },
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

//Retorna todas as empresas cadastradas de acordo com os filtros - Dados parciais
exports.filtroEmpresas = (req, res, next) => {
    const chave = req.body.palavra_chave || '%';
    const estado = req.body.id_estado || '%';
    const cidade = req.body.id_cidade || '%';
    const status = req.body.id_status || '%';
    mysql
        .poolLineToLine(
            'select tb_empresas.logo, tb_empresas.id, tb_empresas.razao_social, tb_empresas.nome_fantasia, tb_cidades.nome as cidade, tb_estados.uf as estado, tb_status_empresa.status_empresa as "status" from tb_empresas inner join tb_cidades inner join tb_estados inner join tb_status_empresa on (tb_empresas.cidade = tb_cidades.id) and (tb_empresas.estado = tb_estados.id) and (tb_empresas.id_status_empresa = tb_status_empresa.id) where (tb_empresas.razao_social like "%"?"%" or tb_empresas.nome_fantasia like "%"?"%") and tb_estados.id like ? and tb_cidades.id like ? and tb_status_empresa.id like ? order by tb_empresas.razao_social',
            [chave, chave, estado, cidade, status]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Nenhum cadastro encontado.',
                    },
                });
            }
            return res.status(200).send({
                resposta: {
                    status: 200,
                    registros: results.length,
                    empresas: results.map((row) => {
                        let url = { url: process.env.DOMAIN_PORT + 'admin/empresas/' + row.id };
                        Object.assign(row, url);
                        return row;
                    }),
                },
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

//Retorna a empresa cadastrada de acordo com o id - Quase todos os dados
exports.idEmpresas = (req, res, next) => {
    const id = req.params.id;
    mysql
        .poolLineToLine(
            'select tb_empresas.id, tb_empresas.email, tb_empresas.logo, tb_empresas.razao_social, tb_empresas.nome_fantasia, tb_empresas.ie, tb_empresas.cnpj, tb_empresas.conta, tb_empresas.agencia, tb_empresas.site, tb_empresas.cep, tb_empresas.logradouro, tb_empresas.numero, tb_empresas.bairro, tb_empresas.complemento, tb_cidades.nome as cidade, tb_estados.uf as estado, date_format(tb_empresas.data_cadastro, "%d/%m/%Y às %H:%ih") as data_cadastro, tb_status_empresa.status_empresa as "status" from tb_empresas inner join tb_cidades inner join tb_estados inner join tb_status_empresa on (tb_empresas.cidade = tb_cidades.id) and (tb_empresas.estado = tb_estados.id) and (tb_empresas.id_status_empresa = tb_status_empresa.id) where tb_empresas.id = ? order by tb_empresas.razao_social',
            [id]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Nenhum cadastro encontado.',
                    },
                });
            }
            return res.status(200).send({
                resposta: {
                    status: 200,
                    registros: results.length,
                    empresas: results.map((row) => {
                        let url = { url: process.env.DOMAIN_PORT + 'admin/empresas/' + row.id };
                        Object.assign(row, url);
                        return row;
                    }),
                },
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

//Atualiza a logo da empresa conforme o id
exports.atualizarLogo = (req, res, next) => {
    const id_empresa = req.params.id_empresa;

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './img/empresa/logo');
        },
        filename: (req, file, cb) => {
            cb(null, new Date().toISOString().replace(/:/g, '-') + '-ID-' + id_empresa + '-' + file.originalname);
        },
    });

    const fileFilter = (req, file, cb) => {
        if (file.mimetype === 'image/webp') {
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
    }).single('logo');

    mysql
        .poolConnect('select logo from tb_empresas where id = ?', [id_empresa])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Nenhum cadastro com essa empresa foi encontrado.',
                    },
                });
            }
            upload(req, res, function (error) {
                if (error instanceof multer.MulterError) {
                    //Ocorreu um erro do Multer durante o upload.
                    if (error.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).send({
                            erro: {
                                status: 400,
                                mensagem: 'O tamanho do arquivo ultrapassou o limite permitido.',
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
                            status: 400,
                            mensagem: error.message,
                        },
                    });
                }
                if (!req.file) {
                    return res.status(400).send({
                        erro: {
                            status: 400,
                            mensagem: 'Nenhum arquivo foi enviado.',
                        },
                    });
                }
                const logo = req.file.filename;
                const logobd = results[0].logo;
                mysql
                    .poolConnect('update tb_empresas set logo = ? where id = ?', [logo, id_empresa])
                    .then(() => {
                        if (logobd != null) {
                            const urlLogo = path.join('./img/empresa/logo', logobd);
                            const logoExists = fs.existsSync(urlLogo);
                            if (logoExists) {
                                fs.unlink(urlLogo, (error) => {
                                    if (error) {
                                        return res.status(500).send({
                                            erro: error,
                                        });
                                    }
                                    return res.status(201).send({
                                        resposta: {
                                            status: 201,
                                            mensagem: 'Logo atualizada com sucesso.',
                                        },
                                    });
                                });
                            } else {
                                return res.status(201).send({
                                    resposta: {
                                        status: 201,
                                        mensagem: 'Logo atualizada com sucesso.',
                                    },
                                });
                            }
                        } else {
                            return res.status(201).send({
                                resposta: {
                                    status: 201,
                                    mensagem: 'Logo atualizada com sucesso.',
                                },
                            });
                        }
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

//Deleta a logo da empresa conforme o id
exports.deletaLogo = (req, res, next) => {
    const id_empresa = req.params.id_empresa;
    mysql
        .poolConnect('select logo from tb_empresas where id = ?', [id_empresa])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Nenhum cadastro com essa empresa foi encontrado.',
                    },
                });
            }
            if (results[0].logo === null) {
                return res.status(404).send({
                    erro: {
                        status: 404,
                        mensagem: 'Não existe nenhum arquivo para ser deletado.',
                    },
                });
            }
            const urlLogo = path.join('./img/empresa/logo', results[0].logo);
            const logoExists = fs.existsSync(urlLogo);
            mysql
                .poolConnect('update tb_empresas set logo = null where id = ?', [id_empresa])
                .then(() => {
                    const logoExists = fs.existsSync(urlLogo);
                    if (!logoExists) {
                        return res.status(200).send({
                            resposta: {
                                status: 200,
                                mensagem: 'Logo deletada com sucesso.',
                            },
                        });
                    }
                    fs.unlink(urlLogo, (error) => {
                        if (error) {
                            return res.status(500).send({
                                erro: error,
                            });
                        }
                        return res.status(200).send({
                            resposta: {
                                status: 200,
                                mensagem: 'Logo deletada com sucesso.',
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
