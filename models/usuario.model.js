'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usuarioSchema = Schema({
    nombre : String,
    apellido : String,
    username : String,
    password : String,
    email : String,
    dpi : Number,
    role : String,
    //producto : [{type : Schema.ObjectId, ref: 'producto'}],       No puede tener las categorias pero si puede manejarlas
    //categoria : [{type : Schema.ObjectId, ref: 'categoria'}],
    carrito : [{type : Schema.ObjectId, ref: 'carrito'}],
    factura : [{type : Schema.ObjectId, ref: 'factura'}]

});

module.exports = mongoose.model('usuario', usuarioSchema);