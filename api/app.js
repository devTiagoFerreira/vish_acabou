const express = require('express');
const app = express();
const morgan = require('morgan');

const routeAdmin = require('./routes/admin');

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: false })); //Aceita apenas dados simples
app.use(express.json()); //Aceita Apenas json

//Configuração CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', 'Origin , X-Requested-Width, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }
    next();
});

app.use('/admin', routeAdmin);

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
            mensagem: error.message,
        },
    });
});

module.exports = app;
