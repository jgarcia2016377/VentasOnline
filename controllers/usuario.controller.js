'use strict'

var Usuario = require('../models/usuario.model');
var Factura = require('../models/factura.model');
var jwt = require('../services/jwt');
var bcryt = require('bcrypt-nodejs');
//Nombre de los roles:
//ROLE_CLIENTE
//ROLE_ADMIN

//Para obtener el token: "getToken : true"
//No se puede eliminar ni editar el usuario admin.

function createInit(req, res){
    Usuario.findOne({username : 'admin'}, (err, adminFind)=>{
        if(err){
            console.log('Error general al buscar al admin');
        }else if(adminFind){
            console.log('El usuario Admin fue encontrado');
        }else{
            bcryt.hash('12345', null, null, (err, passwordHash)=>{
                if(err){
                    console.log('Error al guardar la contraseña');
                }else if(passwordHash){
                    let usuario = new Usuario();
                    usuario.username = 'admin';
                    usuario.password = passwordHash;
                    usuario.dpi = '00000';
                    usuario.role = 'ROLE_ADMIN';
                    usuario.nombre = 'predeterminado';
                    usuario.save((err, usuarioSave)=>{
                        if(err){
                            console.log('Error al guardar al admin');
                        }else if(usuarioSave){
                            console.log('Usuario Admin creado');
                        }else{
                            console.log('No se pudo agregar al admin');
                        }
                    });
                }else{
                    console.log('No se pudo guardar la contraseña');
                }
            });       
        }
    });
}

//Para el login
//Pedir el token: getToken
function login(req, res){
    var params = req.body;

    if(params.password && params.username){
        Usuario.findOne({username : params.username.toLowerCase()}, (err, usuarioFind)=>{
            if(err){
                return res.status(500).send({mensaje: 'Error general al buscar el usuario'});
            }else if(usuarioFind){
                bcryt.compare(params.password, usuarioFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({mensaje: 'Error general al comprar la contraseña'});
                    }else if(checkPassword){
                        if(params.getToken){
                            if(params.getToken){
                                res.send({token: jwt.createToken(usuarioFind)});
                            }else{
                                res.send({mensaje : 'Usuario logueado'});
                            }
                        }else{
                            return res.send({mensaje : 'Usuario logueado'});
                        }
                    }else{
                        return res.status(404).send({mensaje: 'La contraseña es incorrecta'});
                    }
                });

            }else{
                return res.status(404).send({mensaje: 'Usuario no encontrado'});
            }
        });
    }
}

function saveUsuario(req, res){
    var params = req.body;
    var usuario = new Usuario();
    var adminId = req.params.idA;

    if(req.usuario.sub == adminId){
        Usuario.findById(adminId, (err, adminFind)=>{
            if(err){
                return res.status(500).send({mensaje: 'Error general al buscar usuario admin'});
            }else if(adminFind){
                if(params.username && params.password && params.nombre && params.dpi && params.email && params.role){
                    Usuario.findOne({username : params.username}, (err, usuarioFind)=>{
                        if(err){
                            return res.status(500).send({mensaje: 'Error general al buscar usuario'});              
                        }else if(usuarioFind){
                            return res.send({mensaje: 'El usuario ya esta en uso'});
                        }else{
                            bcryt.hash(params.password, null, null, (err, passwordHash)=>{
                                if(err){
                                    return res.status(500).send({mensaje: 'Error general al encriptar'});
                                }else if(passwordHash){
                                    usuario.nombre = params.nombre;
                                    usuario.apellido = params.apellido;
                                    usuario.username = params.username.toLowerCase();
                                    usuario.password = passwordHash;
                                    usuario.email = params.email.toLowerCase();
                                    usuario.dpi = params.dpi;
                                    usuario.role = params.role;
                                    usuario.save((err, usuarioSave)=>{
                                        if(err){
                                            return res.status(500).send({mensaje: 'Error general al encriptar'});
                                        }else if(usuarioSave){
                                            return res.send({mensaje: 'Se guardo exitosamente el usuario', usuarioSave});
                                        }else{
                                            return res.status(404).send({mensaje: 'No se pudo guardar el usuario'});      
                                        }
                                    })
                                }else{
                                    return res.status(404).send({mensaje: 'No se pudo encriptar la contraseña'});                
                                }
                            });
                        }
                    })
                }else{
                    return res.status(404).send({mensaje: 'Ingresa los campos minímos'});
                }
            }else{
                return res.status(404).send({mensaje: 'No se encontro tu sesión de admin'});
            }
        });
    }else{
        return res.status(404).send({mensaje: 'No coindide la sesión con el id'});
    }
    
}
 
function updateUsuario(req, res){
    var update = req.body;
    let usuarioId = req.params.id;

    
    
        if(usuarioId == req.usuario.sub){      //si el usuario es igual a el mismo
            if(update.password){ //si intenta editar contraseña
                return res.send({mensaje: 'No se puede editar la contraseña en esta ruta'});
            }else if(update.role && req.usuario.role == 'ROLE_CLIENTE'){          //si intenta cambiar de role el mismo role:cliente
                return res.send({mensaje: 'No tienes permisos para cambiar de role'});
            }else if(req.usuario.username == 'admin'){          //si intenta cambiar de role el mismo role:cliente
                return res.send({mensaje: 'No se puede actualizarl usuario admin predeterminado'});
            }
            else{
                if(update.username){
                    Usuario.findOne({username : update.username.toLowerCase()}, (err, usuarioFind)=>{
                        if(err){
                            return res.status(500).send({mensaje: 'Error general en la busqueda de username'});
                        }else if(usuarioFind){
                            return res.send({mensaje: 'El nombre de usuario deseado ya se encuentra en uso'});
                        }else{
                            Usuario.findByIdAndUpdate(usuarioId, update, {new : true}, (err, usuarioUpdate)=>{
                                if(err){
                                    return res.status(500).send({mensaje: 'Error general al actualizar'});
                                }else if(usuarioUpdate){
                                    return res.send({mensaje: 'El usuario fue actualizado', usuarioUpdate});
                                }else{
                                    return res.status(404).send({mensaje: 'No se pudo actualizar el usuario'});
                                }
                            });
                        }
                    });
                }else{
                    Usuario.findByIdAndUpdate(usuarioId, update, {new : true},(err, usuarioUpdate)=>{
                        if(err){
                            return res.status(500).send({mensaje: 'Error general al actualizar'});
                        }else if(usuarioUpdate){
                            return res.send({mensaje: 'El usuario fue actualizado', usuarioUpdate});
                        }else{
                            return res.status(404).send({mensaje: 'No se pudo actualizar el usuario'});
                        }
                    });
                }
            }
        }else if(req.usuario.role == 'ROLE_ADMIN'){  //Si admin cambia a un usuario cliente (puede cambiarle de role)
            if(update.password){ //si intenta editar contraseña
                return res.send({mensaje: 'No se puede editar la contraseña en esta ruta'});
            }else{
                Usuario.findById(usuarioId, (err, usuarioEncontrado)=>{
                    if(err){
                        return res.status(404).send({mensaje: 'Eror general al buscar al usuario'});    
                    }else if(usuarioEncontrado){
                        if(usuarioEncontrado.role == 'ROLE_CLIENTE'){
                            if(update.username){
                                Usuario.findOne({username : update.username.toLowerCase()}, (err, usuarioFind)=>{
                                    if(err){
                                        return res.status(500).send({mensaje: 'Error general en la busqueda de username'});
                                    }else if(usuarioFind){
                                        return res.send({mensaje: 'El nombre de usuario deseado ya se encuentra en uso'});
                                    }else{
                                        Usuario.findByIdAndUpdate(usuarioId, update, {new : true}, (err, usuarioUpdate)=>{
                                            if(err){
                                                return res.status(500).send({mensaje: 'Error general al actualizar'});
                                            }else if(usuarioUpdate){
                                                return res.send({mensaje: 'El usuario fue actualizado', usuarioUpdate});
                                            }else{
                                                return res.status(404).send({mensaje: 'No se pudo actualizar el usuario'});
                                            }
                                        });
                                    }
                                });
                            }else{
                                Usuario.findByIdAndUpdate(usuarioId, update, {new : true}, (err, usuarioUpdate)=>{
                                    if(err){
                                        return res.status(500).send({mensaje: 'Error general al actualizar'});
                                    }else if(usuarioUpdate){
                                        return res.send({mensaje: 'El usuario fue actualizado', usuarioUpdate});
                                    }else{
                                        return res.status(404).send({mensaje: 'No se pudo actualizar el usuario'});
                                    }
                                });
                            }
                        }else{
                            return res.status(404).send({mensaje: 'No puedes actualizar a otros administradores'});    
                        }
                    }else{
                        return res.status(404).send({mensaje: 'No se encontro el usuario a editar'});
                    }
                });      
            }
        }else{
            return res.status(404).send({mensaje: 'El id no coincide con la sesión iniciada'});   
        }
    
}

function removeUsuario(req, res){
    var usuarioId = req.params.id;
    var params = req.body; //para enviar la contraseña

    
    if(req.usuario.username == 'admin'){
        return res.send({mensaje: 'No se puede eliminar al admin predeterminado'});
    }else{
        if(usuarioId == req.usuario.sub){
            Usuario.findOne({_id : usuarioId}, (err, usuarioFind)=>{
                if(err){
                    return res.status(500).send({mensaje: 'Error general al buscar'});
                }else if(usuarioFind){
                    bcryt.compare(params.password, usuarioFind.password, (err, checkPassword)=>{
                        if(err){
                            return res.status(500).send({mensaje: 'Error general al revisar la password'});
                        }else if(checkPassword){
                            Usuario.findByIdAndRemove(usuarioId, (err, usuarioDelete)=>{
                                if(err){
                                    return res.status(500).send({mensaje: 'Error general al eliminar usuario'});
                                }else if(usuarioDelete){
                                    return res.send({mensaje: 'El usuario ha sido eliminado'});
                                }else{
                                    return res.status(404).send({mensaje: 'No se pudo eliminar el usuario'});
                                }
                            });
                        }else{
                            return res.status(404).send({mensaje: 'No se pudo validar la contraseña'});
                        }
                    });
                }else{
                    return res.status(404).send({mensaje: 'El usuario no se encontro'});
                }
            });
        }else if(req.usuario.role == 'ROLE_ADMIN'){
            Usuario.findOne({_id : usuarioId}, (err, usuarioFind)=>{
                if(err){
                    return res.status(500).send({mensaje: 'Error general al buscar'});
                }else if(usuarioFind){
                    if(usuarioFind.role == 'ROLE_CLIENTE'){
                        bcryt.compare(params.password, usuarioFind.password, (err, checkPassword)=>{
                            if(err){
                                return res.status(500).send({mensaje: 'Error general al revisar la password'});
                            }else if(checkPassword){
                                Usuario.findByIdAndRemove(usuarioId, (err, usuarioDelete)=>{
                                    if(err){
                                        return res.status(500).send({mensaje: 'Error general al eliminar usuario'});
                                    }else if(usuarioDelete){
                                        return res.send({mensaje: 'El usuario ha sido eliminado'});
                                    }else{
                                        return res.status(404).send({mensaje: 'No se pudo eliminar el usuario'});
                                    }
                                });
                            }else{
                                return res.status(404).send({mensaje: 'No se pudo validar la contraseña'});
                            }
                        });
                    }else{
                        return res.status(404).send({mensaje: 'No puedes eliminar usuarios administradores'});    
                    }
                }else{
                    return res.status(404).send({mensaje: 'El usuario no se encontro'});
                }
            });
        }else{
            return res.status(404).send({mensaje: 'El id no coincide con la sesión iniciada'});
        }
    }
}


//return res.status(500).send({mensaje: 'Error general '});
//return res.send({mensaje: ' '});
//return res.status(404).send({mensaje: 'La contraseña es incorrecta'});

module.exports = {
    createInit,            //inicio
    login,                //todos
    saveUsuario,         //Admin--falta
    updateUsuario,      //Todos--adminSoloPuedeEditarAClientes
    removeUsuario      //Admin no elimina admin, cliente se puede auto eliminar
}