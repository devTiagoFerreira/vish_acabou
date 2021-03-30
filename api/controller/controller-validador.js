const func = require('../functions/functions');

//Validador de CNPJ
exports.cnpjValidator = (req, res, next) => {
    const cnpj = req.params.cnpj.replace(/([^\d])+/gim, '');
    const cnpj_valido = func.cnpjValidator(cnpj);
    if (!cnpj_valido) {
        res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'CNPJ inválido.',
            },
        });
    }
    res.status(200).send({
        erro: {
            status: 200,
            mensagem: 'CNPJ válido.',
        },
    });
};

//Validador de IE
exports.ieValidator = (req, res, next) => {
    const ie = req.params.ie.replace(/([^\d])+/gim, '');
    const ie_valido = func.ieValidator(ie);
    if (!ie_valido) {
        res.status(400).send({
            erro: {
                status: 400,
                mensagem: 'Inscrição Estadual inválida.',
            },
        });
    }
    res.status(200).send({
        erro: {
            status: 200,
            mensagem: 'Inscrição Estadual válida.',
        },
    });
};
