'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var carritoSchema = ({
    idUsuario : String,
    producto : [{type : Schema.ObjectId, ref: 'producto'}],
    cantidad : Number
});

module.exports = mongoose.model('carrito', carritoSchema);
