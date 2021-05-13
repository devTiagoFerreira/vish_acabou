const jtw = require('jsonwebtoken');

exports.adminAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        var decode = jtw.verify(token, process.env.VISH_SECRET_KEY);
        req.usuario = decode;
        next();
    } catch {
        return res.status(401).send({
            erro: {
                mensagem: 'Falha na autenticação',
                motivo: 'Token não informado, não autorizado ou expirado',
            },
        });
    }
};

exports.adminOptionalAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        var decode = jtw.verify(token, process.env.VISH_SECRET_KEY);
        req.usuario = decode;
        next();
    } catch {
        next();
    }
};

exports.empresaAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        var decode = jtw.verify(token, process.env.COMPANY_SECRET_KEY);
        req.usuario = decode;
        next();
    } catch {
        return res.status(401).send({
            erro: {
                mensagem: 'Falha na autenticação',
                motivo: 'Token não informado, não autorizado ou expirado',
            },
        });
    }
};

exports.clienteAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        var decode = jtw.verify(token, process.env.CLIENT_SECRET_KEY);
        req.usuario = decode;
        next();
    } catch {
        return res.status(401).send({
            erro: {
                mensagem: 'Falha na autenticação',
                motivo: 'Token não informado, não autorizado ou expirado',
            },
        });
    }
};
