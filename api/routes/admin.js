const express = require("express");
const router = express.Router();

const mysql = require("../mysql").pool;

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const auth = require("../middleware/auth");

require("dotenv").config();

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./img/anuncios");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/webp") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024,
  },
}).single("banner");

//Login
router.post("/login", (req, res, next) => {
  mysql.getConnection((err, conn) => {
    if (err) {
      return res.status(401).send({
        erro: {
          mensagem: "Falha na autenticação",
          motivo: "Falha de conexão com o banco de dados",
        },
      });
    }
    conn.query(
      "select * from tb_admin where email = ?",
      [req.body.email],
      (err, results, field) => {
        conn.release();
        if (err) {
          return res.status(401).send({
            erro: {
              mensagem: "Falha na autenticação",
              motivo: "Falha de conexão com o banco de dados",
            },
          });
        }
        if (results.length === 0) {
          return res.status(401).send({
            erro: {
              mensagem: "Falha na autenticação",
              motivo: "Credenciais não cadastradas",
            },
          });
        }
        bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
          if (err) {
            return res.status(401).send({
              erro: {
                mensagem: "Falha na autenticação",
                motivo: "Credenciais não cadastradas",
              },
            });
          }
          if (!result) {
            return res.status(401).send({
              erro: {
                mensagem: "Falha na autenticação",
                motivo: "Credenciais não cadastradas",
              },
            });
          }
          const token = {
            idUsuario: results[0].id,
            email: results[0].email,
            nome: results[0].nome,
          };
          jwt.sign(
            token,
            process.env.SECRET_KEY,
            { expiresIn: 1000 * 30 },
            (err, token) => {
              if (err) {
                return res.status(401).send({
                  erro: {
                    mensagem: "Falha na autenticação",
                    motivo: "Falha na geração do token",
                  },
                });
              }
              return res.status(200).send({
                resposta: {
                  mensagem: "Autenticação bem-sucedida",
                  token: token,
                },
              });
            }
          );
        });
      }
    );
  });
});

//Registro de anúncios
router.post("/anuncios", auth.optionalAuth, (req, res, next) => {
  upload(req, res, (error) => {
    console.log(req.file);
    if (!req.file) {
      if (error) {
        res.status(400).send({
          erro: {
            mensagem: "Arquivo muito grande",
            limiteAceito: "1 Megabyte",
          },
        });
      } else {
        res.status(400).send({
          erro: {
            mensagem: "Extensão inválida",
            extensaoAceita: "image/webp",
          },
        });
      }
    } else {
      res.status(200).send({
        resposta: "Imagem aceita!",
      });
    }
  });
});

module.exports = router;
