const express = require('express');
const multer = require('multer');
const mysql = require('../mysql').pool;

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './anuncios/');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpeg'){
    cb (null, true);
  }else {
    cb (null, false);
  }
};

const upload = multer({ 
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024
  // },
  fileFilter: fileFilter
});

//Retorna lista de anúncios
router.get('/', (req, res, next) => {
  mysql.getConnection((error, conn) => {
    let err;
    let count = 0;
    let response = {};
    const query = conn.query('select * from tb_anuncios');
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
router.get('/:id_anuncio', (req, res, next) => {
  const id_anuncio = req.params.id_anuncio;
  res.status(200).send({
    mensagem: `Dados do anúncio ${id_anuncio}`,
  });
});

router.post('/', upload.single('anuncio_img'), (req, res, next) => {
  console.log(req.file);
 
  if(!req.file) {
    res.status(400).send({
      erro: 'Extensão da imagem não aceita',
      extensaoAceita: 'webp'
    });
  }
  res.status(200).send({
    message: "imagem aceita"
  });
});

module.exports = router;
