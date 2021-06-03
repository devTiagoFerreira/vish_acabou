const mysql = require('../mysql');

//Retorna todos os anúncios ativos
exports.anuncios = (req, res, next) => {
    mysql
        .poolLineToLine(
            'select an.id, an.id_empresa, an.banner, an.titulo, an.descricao, an.regras, an.preco, an.desconto, date_format(an.data_inicial, "%d/%m/%Y às %H:%i h") as data_inicial, datediff(an.vencimento, current_date) as dias_restantes, timediff(an.vencimento, current_timestamp) as horas_restantes, an.quant_tickets, an.quant_tickets - an.vendidos as tickets_restantes, an.vendidos, tb_status_anuncio.status_anuncio from tb_anuncios an inner join tb_status_anuncio on an.id_status_anuncio = tb_status_anuncio.id where an.id_status_anuncio = 2'
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum anúncio encontrado',
                    },
                });
            }
            return res.status(200).send({
                results: results.length,
                anuncios: results.map((row) => {
                    let banner;
                    if (row.banner) {
                        banner = { banner: process.env.DOMAIN + 'imagens/anuncios/' + row.id + '/banner' };
                    }
                    Object.assign(row, banner);
                    let url = { url: process.env.DOMAIN + 'anuncios/' + row.id };
                    Object.assign(row, url);
                    return row;
                }),
            });
        })
        .catch((error) => {
            return res.status(500).send({
                error: error,
            });
        });
};

//Retorna anúncio conforme id
exports.idAnuncio = (req, res, next) => {
    const id_anuncio = req.params.id_anuncio;
    mysql
        .poolConnect(
            'select an.id, an.id_empresa, an.banner, an.titulo, an.descricao, an.regras, an.preco, an.desconto, date_format(an.data_inicial, "%d/%m/%Y às %H:%i h") as data_inicial, datediff(an.vencimento, current_date) as dias_restantes, timediff(an.vencimento, current_timestamp) as horas_restantes, an.quant_tickets, an.quant_tickets - an.vendidos as tickets_restantes, an.vendidos, tb_status_anuncio.status_anuncio from tb_anuncios an inner join tb_status_anuncio on an.id_status_anuncio = tb_status_anuncio.id where an.id_status_anuncio = 2 and an.id = ?',
            [id_anuncio]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum anúncio encontrado',
                    },
                });
            }
            return res.status(200).send({
                anuncios: results.map((row) => {
                    let banner;
                    if (row.banner) {
                        banner = { banner: process.env.DOMAIN + 'imagens/anuncios/' + row.id + '/banner' };
                    }
                    Object.assign(row, banner);
                    let url = { url: process.env.DOMAIN + 'anuncios/' + row.id };
                    Object.assign(row, url);
                    return row;
                }),
            });
        })
        .catch((error) => {
            return res.status(500).send({
                error: error,
            });
        });
};

//Retorna todos os anúncios de acordo com o número de linhas requisidado
exports.linhasAnuncios = (req, res, next) => {
    const a_partir_de = parseInt(req.params.a_partir_de),
        num_linhas = parseInt(req.params.num_linhas);
    mysql
        .poolConnect(
            'select an.id, an.id_empresa, an.banner, an.titulo, an.descricao, an.regras, an.preco, an.desconto, date_format(an.data_inicial, "%d/%m/%Y às %H:%i h") as data_inicial, datediff(an.vencimento, current_date) as dias_restantes, timediff(an.vencimento, current_timestamp) as horas_restantes, an.quant_tickets, an.quant_tickets - an.vendidos as tickets_restantes, an.vendidos, tb_status_anuncio.status_anuncio from tb_anuncios an inner join tb_status_anuncio on an.id_status_anuncio = tb_status_anuncio.id where an.id_status_anuncio = 2 limit ?, ?',
            [a_partir_de, num_linhas]
        )
        .then((results) => {
            if (results.length == 0) {
                return res.status(404).send({
                    erro: {
                        mensagem: 'Nenhum anúncio encontrado',
                    },
                });
            }
            return res.status(200).send({
                results: results.length,
                anuncios: results.map((row) => {
                    let banner;
                    if (row.banner) {
                        banner = { banner: process.env.DOMAIN + 'imagens/anuncios/' + row.id + '/banner' };
                    }
                    Object.assign(row, banner);
                    let url = { url: process.env.DOMAIN + 'anuncios/' + row.id };
                    Object.assign(row, url);
                    return row;
                }),
            });
        })
        .catch((error) => {
            return res.status(500).send({
                error: error,
            });
        });
};
