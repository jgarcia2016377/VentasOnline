'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

var secretKey = 'ventas-2016377@';

exports.ensureAuth = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({mensaje : 'La peticion no tiene la cabecera de auntentificación'});
    }else{
        var token = req.headers.authorization.replace(/['"']+/g, '');

        try{
            var payload = jwt.decode(token, secretKey);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({mensaje: 'Token ha expirado'});
            }
        }catch(error){
            return res.status(404).send({mensaje: 'Token invalido'});
        }
        req.usuario = payload;
        next();
    }
}

exports.ensureAuthAdmin = (req, res, next)=>{
    var payload = req.usuario;
    if(payload.role != 'ROLE_ADMIN'){
        return res.status(404).send({mensaje: 'No tienes permisos para esta ruta'});
    }else{
        return next();
    }
}

exports.ensureAuthCliente = (req, res, next)=>{
    var payload = req.usuario;
    if(payload.role != 'ROLE_CLIENTE'){
        return res.status(404).send({mensaje: 'No tienes permisos para esta ruta'});
    }else{
        return next();
    }
}