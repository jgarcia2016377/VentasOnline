'usu strict'

var express = require('express');
var categoriaController = require('../controllers/categoria.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();
api.post('/setCategoria/:idU', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], categoriaController.setCategoria);
api.delete('/:idU/removeCategoria/:idC', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], categoriaController.removeCategoria);
api.get('/getCategorias', mdAuth.ensureAuth, categoriaController.getCategorias);
api.post('/updateCategoria/:idC', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], categoriaController.updateCategoria);


module.exports = api;