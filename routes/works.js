'use strict'

// Cargamos el módulo de express para poder crear rutas
var express = require('express');

// Cargamos el controlador
var WorksController = require('../controllers/works');

// Llamamos al router. También podría ser const routes = require('express').Router();
var router = express.Router();

// Creamos las rutas para los métodos que tenemos en nuestros controladores

router.get('/actualizaTodasPublicaciones/',WorksController.actualizaPublicacionesOrcid);

router.get('/works/:id',WorksController.getOneMemberWorks);

router.get('/allWorks',WorksController.getAllMemberWorks);

router.get('/allJournalWorks2018',WorksController.getAllJournalMemberWorks2018);


module.exports = router;