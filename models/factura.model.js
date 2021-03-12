'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var facturaSchema = ({
    fecha : String,
    carrito : [{type : Schema.ObjectId, ref: 'carrito'}],
});

module.exports = mongoose.model('factura', facturaSchema);