'use strict'
var Producto = require('../models/producto.model');
var Carrito = require('../models/carrito.model');
var Usuario = require('../models/usuario.model');

function setCarrito(req, res){
    var usuarioId = req.params.idU;
    var idProducto = req.params.idP;
    var params = req.body;  //cantidad
    var carrito = new Carrito();

    //volver a dar "ctrl+s" para pueda agregar mas al carrito, no encontre ese error -Da error de respuesta headers http-
    if(req.usuario.sub == usuarioId){
        Usuario.findById(usuarioId, (err, usuarioFind)=>{ //Se busca que el usuario este bien
            if(err){
                return res.status(500).send({mensaje: 'Error general al buscar el usuario'});
            }else if(usuarioFind){ //Si se encuentra el usuario luego se buscara si existe el carrito
                Carrito.findOne({idUsuario : usuarioId, producto : idProducto}, (err, carritoFind)=>{
                    if(err){
                        return res.status(500).send({mensaje: 'Error general al buscar el producto'});
                    }else if(carritoFind){ //Existe el carrito, ahora hay que evaluar la existencia del producto en la db y la nueva cantidad deseada
                        if(params.cantidad > 0){
                            Producto.findOne({_id: idProducto}, (err, productoFind)=>{ //Si existe el carrito se buscara el producto y su stock
                                if(err){
                                    return res.status(500).send({mensaje: 'Error general al buscar el producto'});
                                }else if(productoFind){
                                    if(productoFind.stock <= '0'){ //Si cuenta con el stock deseado se acutalizara su cantidad al carrito
                                        return res.send({mensaje: 'No hay existencia del producto, lo siento'});
                                    }else{
                                        var pedido = parseInt(params.cantidad);
                                        var existencia = parseInt(carritoFind.cantidad);
                                        let nuevaCantidad = (pedido + existencia);
                                        console.log('La nueva cantidad es  ' +nuevaCantidad);
                                        if(parseInt(nuevaCantidad) <= parseInt(productoFind.stock)){
                                            Carrito.findOneAndUpdate({_id :carritoFind._id}, {cantidad : nuevaCantidad}, {new : true}, (err, carritoUpdate)=>{
                                                if(err){
                                                    return res.status(500).send({mensaje: 'Error general al actualizar el carrito'});
                                                }else if(carritoUpdate){
                                                    return res.send({mensaje: 'Se pudo agregar la cantidad deseada al carrito'});
                                                }else{
                                                    return res.status(404).send({mensaje: 'No se pudo actualizar la cantidad al carrito'});        
                                                }
                                            });
                                        }else{
                                            return res.status(404).send({mensaje: 'No hay la cantidad deseada para agregar al carrito'});
                                        }
                                    }
                                }else{
                                    return res.status(404).send({mensaje: 'No se encontro el produto deseado'});
                                }
                            })
                        }else{
                            return res.status(404).send({mensaje: 'Ingresa una cantidad mayor'});
                        }
                    }else{          //Si no se encontró el carrito hay que crearlo verificando la existencia y stock del producto
                        if(parseInt(params.cantidad) > 0){
                            Producto.findById(idProducto, (err, productoFind)=>{
                                if(err){
                                    return res.status(500).send({mensaje: 'Error general al buscar el producto'});
                                }else if(productoFind){
                                    if(parseInt(productoFind.stock) <= '0'){
                                        return res.send({mensaje: 'No hay existencia del producto, lo siento'});
                                    }else{
                                        if(parseInt(params.cantidad) <= parseInt(productoFind.stock)){
                                            carrito.idUsuario = usuarioId;
                                            carrito.cantidad = params.cantidad;
                                            carrito.save((err, carritoSave)=>{
                                                if(err){
                                                    return res.status(500).send({mensaje: 'Error general al guardar el carrito'});
                                                }else if(carritoSave){
                                                    Carrito.findByIdAndUpdate(carritoSave._id, {$push :{producto : idProducto}}, {new : true}, (err, carritoPush)=>{
                                                        if(err){
                                                            return res.status(500).send({mensaje: 'Error general al pushear el carrito'});
                                                        }else if(carritoPush){
                                                            res.send({mensaje: 'El producto se agrego al carrito', carritoPush});
                                                            Usuario.findOneAndUpdate({_id : usuarioId}, {$push : {carrito :  carritoPush._id}}, {new : true}, (err, usuarioUpdate)=>{
                                                                if(err){
                                                                    return res.status(500).send({mensaje: 'Error general al agregar el carrito al usuario'});
                                                                }else if(usuarioUpdate){
                                                                    return res.send({mensaje: 'Se agrego el carrito al usuario'});
                                                                }else{
                                                                    return res.status(404).send({mensaje: 'No se pudo guardar el carrito en el usuario'});
                                                                }
                                                            });
                                                        }else{
                                                            return res.status(404).send({mensaje: 'No se pudo hacer el push al carrito'});        
                                                        }
                                                    });
                                                }else{
                                                    return res.status(404).send({mensaje: 'No se pudo generar el carrito'});        
                                                }
                                            });
                                        }else{
                                            return res.status(404).send({mensaje: 'No hay la cantidad deseada para agregar'});
                                        }
                                    }
                                }else{
                                    return res.status(404).send({mensaje: 'No se encontro el produto deseado'});
                                }
                            })
                        }else{
                            return res.status(404).send({mensaje: 'Ingresa una cantidad mayor'});
                        }
                    }
                });
            }else{
                return res.status(404).send({mensaje: 'No se encontro el usuario ingresado'});
            }
        });
    }else{
        return res.status(404).send({mensaje: 'El id no coincide con la sesión iniciada'});      
    }       
}




//return res.status(500).send({mensaje: 'Error general '});
//return res.send({mensaje: ' '});
//return res.status(404).send({mensaje: ' '});

module.exports = {
    setCarrito,
    
}