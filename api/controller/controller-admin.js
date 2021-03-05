const mysql = require('../mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');

require('dotenv').config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './img/anuncios');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/webp') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
exports.upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024,
    },
});

//Login
exports.login = (req, res, next) => {
    mysql
        .poolConnect('select * from tb_admin where email = ?', [req.body.email])
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
                    idUsuario: results[0].id,
                    email: results[0].email,
                    nome: results[0].nome,
                };
                jwt.sign(token, process.env.SECRET_KEY, { expiresIn: '30m' }, (error, token) => {
                    if (error) {
                        return res.status(401).send({
                            erro: {
                                mensagem: 'Falha na autenticação',
                                motivo: 'Credenciais não cadastradas',
                            },
                        });
                    }
                    return res.status(200).send({
                        resposta: {
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

//States POST
exports.estadosPOST = (req, res, next) => {
    const sigla = req.body.sigla || null;
    const nome = req.body.nome || null;
    if (!sigla || !nome) {
        return res.status(400).send({
            erro: {
                mensagem: 'Campo não definido ou vazio',
                estado: {
                    sigla: sigla,
                    nome: nome,
                },
            },
        });
    }
    if (sigla.length > 2 || nome.length > 20) {
        return res.status(400).send({
            erro: {
                mensagem: 'Quantidade de caracteres excedida',
                estado: {
                    sigla: sigla,
                    nome: nome,
                },
                limite_caracteres: {
                    sigla: 2,
                    nome: 20,
                },
                quantidade_caracteres_informada: {
                    sigla: sigla.length,
                    nome: nome.length,
                },
            },
        });
    }
    mysql
        .poolConnect('select sigla, nome from tb_estados where sigla = ? or nome = ?', [sigla, nome])
        .then((results) => {
            if (results.length > 0) {
                return res.status(422).send({
                    erro: {
                        mensagem: 'Estado já cadastrado',
                        estado: results,
                    },
                });
            }
            mysql.poolConnect('insert into tb_estados values (0, ?, ?)', [sigla, nome]).then(() => {
                return res
                    .status(200)
                    .send({
                        resposta: {
                            Mensagem: 'Cadastro efetuado com sucesso!',
                            estado: { sigla: sigla, nome: nome },
                        },
                    })
                    .catch((error) => {
                        return res.status(500).send({
                            erro: error,
                        });
                    });
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};

//States PATCH
exports.estadosPATCH = (req, res, next) => {
    const id_estado = req.body.id_estado || null;
    const sigla = req.body.sigla || null
    const nome = req.body.nome || null;
    if (!sigla || !nome || !id_estado) {
        return res.status(400).send({
            erro: {
                mensagem: 'Campo não definido ou vazio',
                estado: {
                    id_estado: id_estado,
                    sigla: sigla,
                    nome: nome,
                },
            },
        });
    }
    if (sigla.length > 2 || nome.length > 20) {
        return res.status(400).send({
            erro: {
                mensagem: 'Quantidade de caracteres excedida',
                estado: {
                    id_estado: id_estado,
                    sigla: sigla,
                    nome: nome,
                },
                limite_caracteres: {
                    sigla: 2,
                    nome: 20,
                },
                quantidade_caracteres_informada: {
                    sigla: sigla.length,
                    nome: nome.length,
                },
            },
        });
    }
    mysql
        .poolConnect('select sigla, nome from tb_estados where sigla = ? or nome = ?', [sigla, nome])
        .then((results) => {
            if (results.length > 0) {
                return res.status(422).send({
                    erro: {
                        mensagem: 'Estado já cadastrado',
                        estado: results,
                    },
                });
            }
            mysql.poolConnect('insert into tb_estados values (0, ?, ?)', [sigla, nome]).then(() => {
                return res
                    .status(200)
                    .send({
                        resposta: {
                            Mensagem: 'Cadastro efetuado com sucesso!',
                            estado: { sigla: sigla, nome: nome },
                        },
                    })
                    .catch((error) => {
                        return res.status(500).send({
                            erro: error,
                        });
                    });
            });
        })
        .catch((error) => {
            return res.status(500).send({
                erro: error,
            });
        });
};
