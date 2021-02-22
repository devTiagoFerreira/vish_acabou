const express = require("express");
const router = express.Router();

//Retorna lista de anúncios
router.get("/", (req, res, next) => {
  res.status(200).send({
    mensagem: "Lista de anúncios",
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
