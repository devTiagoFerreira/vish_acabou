const express = require('express');
const app = express();

const morgan = require('morgan');

//Importaçao de rotas
const routeDoc = require('./routes/doc');
const routeAdmin = require('./admin');
const routeEmpresas = require('./routes/empresas');
const routeClientes = require('./routes/clientes');
const routeAnuncios = require('./routes/anuncios');
const routeVendas = require('./routes/vendas');
const routeCidades = require('./routes/cidades');
const routeEstados = require('./routes/estados');
const routeValidador = require('./routes/validador');
const routeImagens = require('./routes/imagens');

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: false })); //Aceita apenas dados simples
app.use(express.json()); //Aceita apenas json

//Configuração de CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', 'Origin , X-Requested-Width, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    }
    next();
});

//Rotas
app.use('/api/docs', routeDoc);
app.use('/api/admin', routeAdmin);
app.use('/api/empresas', routeEmpresas);
app.use('/api/clientes', routeClientes);
app.use('/api/anuncios', routeAnuncios);
app.use('/api/vendas', routeVendas);
app.use('/api/cidades', routeCidades);
app.use('/api/estados', routeEstados);
app.use('/api/imagens', routeImagens);
app.use('/api/validador', routeValidador);

app.use((req, res, next) => {
    const erro = new Error('Rota não encontrada');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            mensagem: error.message,
        },
    });
});

module.exports = app;
