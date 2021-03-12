'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'ventas-2016377@';

exports.createToken = (usuario)=>{
    var payload = {
        sub : usuario._id,
        nombre : usuario.nombre,
        apellido : usuario.apellido,
        username : usuario.username,
        password : usuario.password,
        email : usuario.email,
        dpi : usuario.dpi,
        role : usuario.role,
        iat : moment.unix(),
        exp : moment().add(5, 'hours').unix()
    }
    return jwt.encode(payload, secretKey);
}