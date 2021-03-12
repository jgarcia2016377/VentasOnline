'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productoSchema = Schema({
    nombre : String,
    productoName : String,
    stock : Number,
    ventas : Number,
    categoria : [{type : Schema.ObjectId, ref: 'categoria'}]
});

module.exports = mongoose.model('producto', productoSchema);