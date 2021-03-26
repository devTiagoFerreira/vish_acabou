const express = require('express');
const app = express();
const morgan = require('morgan');

const routeAdmin = require('./routes/admin');
const routeEstados = require('./routes/estados');
const routeCidades = require('./routes/cidades');
const routeValidador = require('./routes/validador');
const routeEmpresas = require('./routes/empresas');

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: false })); //Accepts only simple data
app.use(express.json()); //Only accepts json

//CORS Configuration
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
app.use('/estados', routeEstados);
app.use('/cidades', routeCidades);
app.use('/validador', routeValidador);
app.use('/empresas', routeEmpresas);

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
