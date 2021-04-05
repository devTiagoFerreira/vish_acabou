const express = require('express');
const router = express.Router();

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./controller/doc.yaml');

const options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Vish Acabou API - Documentação",
    customfavIcon: ""
  };

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

module.exports = router;