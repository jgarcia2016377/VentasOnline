'usu strict'

var express = require('express');
var facturaController = require('../controllers/factura.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/facturar/:idU', [mdAuth.ensureAuth, mdAuth.ensureAuthCliente], facturaController.facturar);

module.exports = api;