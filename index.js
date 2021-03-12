'use strict'

var mongoose = require('mongoose');
var port = 3200;
var app = require('./app');
var usuario = require('./controllers/usuario.controller');
var categoria = require('./controllers/categoria.controller');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

mongoose.connect('mongodb://localhost:27017/Ventas2016377', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log('Conectado a la db');
        usuario.createInit();
        categoria.categoriaGeneral();
        app.listen(port, ()=>{
            console.log('Servidor de express corriendo');
        });
    }).catch((error)=>{
        console.log('Error al conectar a la db');
    }
);




