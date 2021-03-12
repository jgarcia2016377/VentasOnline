'use strict'

var usuarioController = require('../controllers/usuario.controller');
var express = require('express');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/login', usuarioController.login);
api.post('/saveUsuario/:idA', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], usuarioController.saveUsuario);
api.put('/updateUsuario/:id', mdAuth.ensureAuth, usuarioController.updateUsuario);
api.post('/removeUsuario/:id', mdAuth.ensureAuth, usuarioController.removeUsuario);

module.exports = api;