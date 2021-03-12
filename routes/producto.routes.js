'usu strict'

var express = require('express');
var productoController = require('../controllers/producto.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/:idU/createProducto/:idC', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], productoController.createProducto);
api.put('/updateProducto/:idP', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], productoController.updateProducto);
api.delete('/removeProducto/:idP', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], productoController.removeProducto);
api.get('/getProductos', mdAuth.ensureAuth, productoController.getProductos);
module.exports = api;