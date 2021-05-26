const mysql = require('../mysql');
const func = require('../functions/functions');

//Tratamento de imagens
const path = require('path');
const fs = require('fs');
const multer = require('multer');

//Cadastro de anúncios
exports.addAnuncio = (req, res, next) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './img/anuncios/banner');
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
            cb(new Error('A extensão do arquivo é inválida'));
        }
    };

    const upload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: (1024 * 1024) / 2,
        },
    }).single('banner');

    upload(req, res, function (error) {
        if (error instanceof multer.MulterError) {
            //Ocorreu um erro do Multer durante o upload.
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send({
                    erro: {
                        mensagem: 'O tamanho do arquivo enviado ultrapassou o limite permitido',
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
                    mensagem: 'Nenhuma imagem para usar como banner foi enviada',
                },
            });
        }
        const banner = req.file.filename;
        const urlbanner = path.join('./img/anuncios/banner', banner);

        const anuncio = {
            id_empresa: req.body.id_empresa || null,
            titulo: req.body.titulo || null,
            descricao: req.body.descricao || null,
            regras: req.body.regras || null,
            preco: req.body.preco || null,
            desconto: req.body.desconto || null,
            vencimento: req.body.vencimento || null,
            quant_tickets: req.body.quant_tickets || null,
        };

        if (!func.verificaObjetoVazio(anuncio)) {
            fs.unlinkSync(urlbanner);
            return res.status(400).send({
                erro: {
                    mensagem: 'Campos obrigatórios incompletos',
                    campos_obrigatorios: anuncio,
                },
            });
        }

        mysql
            .poolConnect('select nome_fantasia from tb_empresas where id = ?', [anuncio.id_empresa])
            .then((results) => {
                if (results.length == 0) {
                    fs.unlinkSync(urlbanner);
                    return res.status(404).send({
                        erro: {
                            mensagem: 'Nenhum cadastro de empresa foi encontrado com o id fornecido ',
                        },
                    });
                }
                mysql
                    .poolConnect('insert into tb_anuncios values (0, ?, ?, ?, ?, ?, ?, ?, default, ?, ?, default, default)', [anuncio.id_empresa, banner, anuncio.titulo, anuncio.descricao, anuncio.regras, anuncio.preco, anuncio.desconto, anuncio.vencimento, anuncio.quant_tickets])
                    .then((results) => {
                        const urlBannerResult = { banner: process.env.DOMAIN + 'imagens/anuncios/' + results.insertId + '/banner' };
                        const urlAnuncio = { url: process.env.DOMAIN + 'anuncios/' + results.insertId };
                        Object.assign(anuncio, urlBannerResult);
                        Object.assign(anuncio, urlAnuncio);
                        return res.status(201).send({
                            mensagem: 'Anúncio criado com sucesso',
                            anuncio: anuncio,
                        });
                    })
                    .catch((error) => {
                        fs.unlinkSync(urlbanner);
                        return res.status(500).send({
                            erro: {
                                mensagem: error,
                            },
                        });
                    });
            })
            .catch((error) => {
                fs.unlinkSync(urlbanner);
                return res.status(500).send({
                    erro: {
                        mensagem: error,
                    },
                });
            });
    });
};

//Retorna todos os anuncios conforme filtros
exports.filtroAnuncio = (req, res, next) => {
    const id_empresa = req.body.id_empresa || '%',
        data_inicial = req.body.data_inicial || '0000-00-00',
        data_final = req.body.data_final || 'current_date',
        status = req.body.status || '%';

    mysql
        .poolConnect(
            'select an.id, an.id_empresa, an.banner, an.titulo, an.descricao, an.regras, an.preco, an.desconto, date_format(an.data_inicial, "%d/%m/%Y às %H:%i h") as data_inicial, datediff(an.vencimento, current_date) as dias_restantes,timediff(an.vencimento, current_timestamp) as horas_restantes,an.quant_tickets, an.quant_tickets - an.vendidos as tickets_restantes, an.vendidos,tb_status_anuncio.status_anuncio from tb_anuncios an inner join tb_status_anuncio on an.id_status_anuncio = tb_status_anuncio.id where an.id_empresa like ? and (date_format(an.data_inicial,"%Y-%m-%d") >= ? and date_format(an.data_inicial, "%Y-%m-%d") <= ?) and an.id_status_anuncio like ?',
            [id_empresa, data_inicial, data_final, status]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum cadastro encontado',
                    },
                });
            }
            return res.status(200).send({
                registros: results.length,
                anuncios: results.map((row) => {
                    let banner;
                    if (row.banner) {
                        banner = { banner: process.env.DOMAIN + 'imagens/anuncios/' + row.id + '/banner' };
                    }
                    Object.assign(row, banner);
                    let url = { url: process.env.DOMAIN + 'admin/anuncios/' + row.id };
                    Object.assign(row, url);
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

//Inativa anúncio
exports.inativaAnuncio = (req, res, next) => {
    const id_anuncio = req.params.id_anuncio;

    mysql
        .poolConnect('select * from tb_anuncios where id = ?', [id_anuncio])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum registro encontrado. Não foi possível inativar o anúncio',
                    },
                });
            }
            mysql
                .poolConnect('update tb_anuncios set id_status_anuncio = 1 where id = ?', [id_anuncio])
                .then((results) => {
                    res.status(200).send({
                        mensagem: 'Anúncio inativado com sucesso',
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

//Ativa anúncio
exports.ativaAnuncio = (req, res, next) => {
    const id_anuncio = req.params.id_anuncio;

    mysql
        .poolConnect('select * from tb_anuncios where id = ?', [id_anuncio])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum registro encontrado. Não foi possível ativar o anúncio',
                    },
                });
            }
            mysql
                .poolConnect('update tb_anuncios set id_status_anuncio = 2 where id = ?', [id_anuncio])
                .then((results) => {
                    res.status(200).send({
                        mensagem: 'Anúncio Ativado com sucesso',
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

//Retorna anuncio conforme id fornecido
exports.retornaAnuncio = (req, res, next) => {
    const id_anuncio = req.params.id_anuncio;

    mysql
        .poolConnect(
            'select an.id, an.id_empresa, an.banner, an.titulo, an.descricao, an.regras, an.preco, an.desconto, date_format(an.data_inicial, "%d/%m/%Y às %H:%i h") as data_inicial, datediff(an.vencimento, current_date) as dias_restantes, timediff(an.vencimento, current_timestamp) as horas_restantes, an.quant_tickets, an.quant_tickets - an.vendidos as tickets_restantes, an.vendidos, tb_status_anuncio.status_anuncio from tb_anuncios an inner join tb_status_anuncio on an.id_status_anuncio = tb_status_anuncio.id where an.id = ?',
            [id_anuncio]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum cadastro encontado',
                    },
                });
            }
            return res.status(200).send({
                registros: results.length,
                anuncios: results.map((row) => {
                    let banner;
                    if (row.banner) {
                        banner = { banner: process.env.DOMAIN + 'imagens/anuncios/' + row.id + '/banner' };
                    }
                    Object.assign(row, banner);
                    let url = { url: process.env.DOMAIN + 'admin/anuncios/' + row.id };
                    Object.assign(row, url);
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
