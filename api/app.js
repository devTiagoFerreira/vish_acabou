const express = require('express');
const app = express();
const routeAnuncios = require('./routes/anuncios');

app.use('/anuncios', routeAnuncios);

app.use((req, res, next) => {
    const erro = new Error('Rota não encontrada');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            status: error.status,
            mensagem: error.message
        }
    });

});

module.exports = app;