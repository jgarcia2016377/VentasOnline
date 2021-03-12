'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
//importación de rutas 
var usuarioRoutes = require('./routes/usuario.routes');
var categoriaRoutes = require('./routes/categoria.routes');
var productoRoutes = require('./routes/producto.routes');
var carritoRoutes = require('./routes/carrito.routes');
var facturaRoutes = require('./routes/factura.routes');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});

app.use('/ventas', usuarioRoutes);
app.use('/ventas', categoriaRoutes);
app.use('/ventas', productoRoutes);
app.use('/ventas', carritoRoutes);
app.use('/ventas', facturaRoutes);

module.exports = app;