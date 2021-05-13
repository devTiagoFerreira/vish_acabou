const mysql = require('../mysql');

const path = require('path');
const mime = require('mime');
const fs = require('fs');

//Retorna logo da empresa conforme id
exports.empresaLogo = (req, res, next) => {
    const id_empresa = req.params.id_empresa;
    mysql
        .poolConnect('select logo from tb_empresas where id = ?', [id_empresa])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum cadastro com essa empresa foi encontrado',
                    },
                });
            }

            const url = './img/empresa/logo';
            const logo = results[0].logo || 'logo.webp';
            const logoPath = path.join(url, logo);
            if (!fs.existsSync(logoPath)) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'O arquivo não existe no servidor',
                    },
                });
            }
            const nomeLogo = path.basename(logoPath);
            const mimetype = mime.getType(logoPath);

            res.setHeader('Content-disposition', 'attachment; filename=' + nomeLogo);

            res.setHeader('Content-type', mimetype);

            const filestream = fs.createReadStream(logoPath);
            filestream.pipe(res);
        })
        .catch((error) => {
            return res.status(500).send({
                erro: {
                    mensagem: error,
                },
            });
        });
};

//Retorna foto de perfil do cliente conforme id
exports.clienteFoto = (req, res, next) => {
    const id_cliente = req.params.id_cliente;
    mysql
        .poolConnect('select foto from tb_clientes where id = ?', [id_cliente])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum cadastro de cliente foi encontrado',
                    },
                });
            }

            const url = './img/clientes/foto';
            const foto = results[0].foto || 'foto.webp';
            const fotoPath = path.join(url, foto);
            if (!fs.existsSync(fotoPath)) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'O arquivo não existe no servidor',
                    },
                });
            }
            const nomeFoto = path.basename(fotoPath);
            const mimetype = mime.getType(fotoPath);

            res.setHeader('Content-disposition', 'attachment; filename=' + nomeFoto);

            res.setHeader('Content-type', mimetype);

            const filestream = fs.createReadStream(fotoPath);
            filestream.pipe(res);
        })
        .catch((error) => {
            return res.status(500).send({
                erro: {
                    mensagem: error,
                },
            });
        });
}

//Retorna banner do anúncio conforme id
exports.anuncioBanner = (req, res, next) => {
    const id_anuncio = req.params.id_anuncio;
    mysql
        .poolConnect('select banner from tb_anuncios where id = ?', [id_anuncio])
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum anúncio foi encontrado',
                    },
                });
            }

            const url = './img/anuncios/banner';
            const banner = results[0].banner || 'banner.webp';
            const bannerPath = path.join(url, banner);
            if (!fs.existsSync(bannerPath)) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'O arquivo não existe no servidor',
                    },
                });
            }
            const nomeBanner = path.basename(bannerPath);
            const mimetype = mime.getType(bannerPath);

            res.setHeader('Content-disposition', 'attachment; filename=' + nomeBanner);

            res.setHeader('Content-type', mimetype);

            const filestream = fs.createReadStream(bannerPath);
            filestream.pipe(res);
        })
        .catch((error) => {
            return res.status(500).send({
                erro: {
                    mensagem: error,
                },
            });
        });
}

