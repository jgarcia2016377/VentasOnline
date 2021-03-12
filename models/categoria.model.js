'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categoriaSchema = ({
    nombre : String,
    descripcion : String
});

module.exports = mongoose.model('categoria', categoriaSchema);