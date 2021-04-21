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
