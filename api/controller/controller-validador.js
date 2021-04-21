const func = require('../functions/functions');

//Validador de CNPJ
exports.cnpjValidator = (req, res, next) => {
    const cnpj = req.params.cnpj.replace(/([^\d])+/gim, '');
    const cnpj_valido = func.cnpjValidator(cnpj);
    if (!cnpj_valido) {
        res.status(400).send({
            erro: {
                mensagem: 'CNPJ inválido',
            },
        });
    }
    res.status(200).send({
        mensagem: 'CNPJ válido.',
    });
};

//Validador de IE
exports.ieValidator = (req, res, next) => {
    const ie = req.params.ie.replace(/([^\d])+/gim, '');
    const ie_valido = func.ieValidator(ie);
    if (!ie_valido) {
        res.status(400).send({
            erro: {
                mensagem: 'Inscrição Estadual inválida',
            },
        });
    }
    res.status(200).send({
        mensagem: 'Inscrição Estadual válida',
    });
};
