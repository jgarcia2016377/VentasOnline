'use strict'

var Usuario = require('../models/usuario.model');
var Carrito = require('../models/carrito.model');
var Factura = require('../models/factura.model');
var Producto = require('../models/producto.model');

function facturar(req, res){
    var usuarioId = req.params.idU;

    if(req.usuario.sub == usuarioId){
        Usuario.findById(usuarioId, (err, usuarioFind)=>{
            if(err){
                return res.status(500).send({mensaje: 'Error general al buscar el usuario'});
            }else if(usuarioFind){
                var factura = new Factura();
                factura.fecha = new Date();
                Carrito.find({idUsuario : usuarioId}, (err, carritosFind)=>{
                    if(err){
                        return res.status(500).send({mensaje: 'Error general al buscar por carritos'});
                    }else if(carritosFind){  
                        factura.save((err, facturaSave)=>{
                            if(err){
                                return res.status(500).send({mensaje: 'Error general al crear la factura'});
                            }else if(facturaSave){
                                carritosFind.forEach( carrito =>{
                                    Producto.findOne({_id: carrito.producto}, (err, productoFind)=>{
                                        if(err){
                                            console.log('Error general al buscar el producto');
                                        }else if(productoFind){
                                            if(parseInt(carrito.cantidad) <= parseInt(productoFind.stock)){
                                                let nStock = (parseInt(productoFind.stock) - parseInt(carrito.cantidad));
                                                Factura.findByIdAndUpdate(facturaSave._id, {$push:{carrito : carrito._id}}, {new:true}, (err, facturaPush)=>{
                                                    if(err){
                                                        console.log('Error general al pushear el carrito a la factura');
                                                    }else if(facturaPush){
                                                        console.log('Se cargo el carrito a la factura');
                                                        nuevoStock(productoFind._id, nStock);
                                                        ventasUpdate(productoFind._id, parseInt(productoFind.ventas));
                                                    }else{
                                                        console.log('No se pudo cargar el carrito a la factura');
                                                    }
                                                });
                                            }else{
                                                console.log('No hay suficientes ' + productoFind.nombre + ' para facturar');
                                            }
                                        }else{
                                            console.log('No se encontro el producto');
                                        }
                                    }); 
                                });  //Limpiar los carritos del usuario ya que se facturaron o no.
                                if(limpiarCarritosUsuario(usuarioId)){
                                    Usuario.findByIdAndUpdate(usuarioId, {$push :{factura : facturaSave._id}}, {new : true}, (err, usuarioUpdate)=>{
                                        if(err){
                                            return res.status(404).send({mensaje: 'Error general al pushear la factura'});
                                        }else if(usuarioUpdate){
                                             res.send({mensaje : 'Se agrego la factura al usuario', usuarioUpdate});
                                        }else{
                                            return res.status(404).send({mensaje: 'No se pudo hacer el push de factura'});
                                        }
                                    });
                                }else{
                                    return res.status(404).send({mensaje: 'Ocurrio un error al limpiar los carritos'});
                                }
                            }else{
                                return res.status(404).send({mensaje: 'No pudo crear la factura'});
                            }
                        });
                        
                    }else{
                        return res.status(404).send({mensaje: 'No se encontraron carritos para facturar'});
                    }
                });
            }else{
                return res.status(404).send({mensaje: 'No se encontro el usuario deseado'});
            }
        });

    }else{
        return res.status(404).send({mensaje: 'No coincide el parametro de usuario con la sesión iniciada'});
    }
    
}

function nuevoStock(productoId, nStock){
    Producto.findByIdAndUpdate(productoId, {stock : nStock}, (err, productoUpdate)=>{
        if(err){
            console.log('Error al realizar el nuevo stock');
        }else if(productoUpdate){
            console.log('Se actualizo el nuevo stock de ' + productoUpdate.nombre);
        }else{
            console.log('No se pudo realizar el cambio de stock')
        }
    });
}

function limpiarCarritosPendientes(usuarioId){
    Usuario.findOneAndUpdate({_id: usuarioId}, {$pullAll : {carrito : []}}, {new: true}, (err, usuarioUpdate)=>{
        if(err){
            console.log('Error general al limpiar los carritos');
        }else if(usuarioUpdate){
            console.log('Se limpio los carritos ' + usuarioUpdate)
        }else{
            console.log('No se pudo actualizar el usuario');
        }
    });
}

function ventasUpdate(productoId, ventas){
    Producto.findOneAndUpdate({_id : productoId}, {ventas : (ventas + 1)}, {new : true}, (err, productoUpdate)=>{
        if(err){
            console.log('No se pudo buscar el producto');
        }else if(productoUpdate){
            console.log('Se actualizo el campo de ventas en el producto', productoUpdate.ventas);
        }else{
            console.log('No se encontro el producto a actualizar');
        }
    })
}

function limpiarCarritosUsuario(usuarioId){
    var proceso = true;
    Usuario.findOne({_id : usuarioId}, (err, usuarioFind)=>{
        if(err){
            console.log('NO se pudo buscar usuario');
        }else if(usuarioFind){
            usuarioFind.carrito.forEach( carritoF =>{ 
                Usuario.findOneAndUpdate({_id : usuarioId}, {$pull : { carrito : carritoF._id}}, {new : true}, (err, usuarioPull)=>{
                    if(err){
                        console.log('Error general al hacer el pull');
                        proceso = false;
                    }else if(usuarioPull){
                        console.log('Se hizo el pull');
                    }else{
                        console.log('No se pudo hacer el pull');
                        proceso = false;
                    }
                }); 
            });
            console.log('Concluyo el forEach');
        }else{
            console.log('No se encontro el usuario');
        }
    });
    return proceso;
}

//return res.status(500).send({mensaje: 'Error general '});
//return res.send({mensaje: ' '});
//return res.status(404).send({mensaje: ' '});

module.exports = {
    facturar
}