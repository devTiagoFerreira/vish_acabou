const express = require("express");
const mysql = require("../mysql").pool;

const router = express.Router();

//Retorna lista de anúncios
router.get("/", (req, res, next) => {
  mysql.getConnection((error, conn) => {
    let err;
    let count = 0;
    let response = {};
    const query = conn.query('select * from tb_an1uncios');
    query.on('error', (error) => {
      err = error;
    });
    query.on('result', (row) => {
      response[count] = row;
      count++;
    });
    query.on('end', () => {
      if(err) {
        res.status(500).send({
          error: {code: err.code, errno: err.errno}
        });
      }else {
        res.status(200).send(
          response
        )
      }
      conn.release();
    });
  });
});

//Retorna dados do anúncio conforme id
router.get("/:id_anuncio", (req, res, next) => {
  const id_anuncio = req.params.id_anuncio;
  res.status(200).send({
    mensagem: `Dados do anúncio ${id_anuncio}`,
  });
});

router.post("/", (req, res, next) => {
  const anuncio = {
    id_empresa: req.body.id_empresa,
    titulo: req.body.titulo,
    descricao: req.body.descricao,
  };
  res.status(201).send({
    status: "201",
    mensagem: "Anuncio criado com sucesso!",
    anuncio: anuncio,
  });
});

module.exports = router;
