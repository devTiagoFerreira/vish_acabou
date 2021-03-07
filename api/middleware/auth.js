const jtw = require('jsonwebtoken');

exports.auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        var decode = jtw.verify(token, process.env.SECRET_KEY);
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

exports.optionalAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        var decode = jtw.verify(token, process.env.SECRET_KEY);
        req.usuario = decode;
        next();
    } catch {
        next();
    }
};
