'usu strict'

var express = require('express');
var carritoController = require('../controllers/carrito.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();


api.post('/:idU/setCarrito/:idP', [mdAuth.ensureAuth, mdAuth.ensureAuthCliente], carritoController.setCarrito);

module.exports = api;