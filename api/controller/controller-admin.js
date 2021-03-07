const mysql = require('../mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');

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
                jwt.sign(token, process.env.VISH_SECRET_KEY, { expiresIn: '30m' }, (error, token) => {
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
