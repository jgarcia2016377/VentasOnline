'use strict'

var Categoria = require('../models/categoria.model');
var Producto = require('../models/producto.model');

//CRUD Completo

function createProducto(req, res){
    var params = req.body;
    var categoriaId = req.params.idC;
    var usuarioId = req.params.idU;
    var producto = new Producto();

    if(req.usuario.sub == usuarioId){
        if(params.nombre && params.stock && params.stock >=0){
            Categoria.findOne({_id : categoriaId}, (err, categoriaFind)=>{
                if(err){
                    return res.status(500).send({mensaje: 'Error al busacar la categoria'});      
                }else if(categoriaFind){
                    Producto.findOne({productoName : params.productoName.toLowerCase()}, (err, productoFind)=>{
                        if(err){
                            return res.status(500).send({mensaje: 'Error general al buscar'});      
                        }else if(productoFind){
                            return res.send({mensaje: 'El productoName ya esta en uso'});
                        }else{
                            producto.nombre = params.nombre;
                            producto.productoName = params.productoName.toLowerCase();
                            producto.stock = params.stock;
                            producto.ventas = params.ventas;
                            producto.save((err, productoSave)=>{
                                if(err){
                                    return res.status(500).send({mensaje: 'Error al guardar el producto'});      
                                }else if (productoSave){
                                    Producto.findByIdAndUpdate(productoSave._id, {$push:{categoria : categoriaId}}, {new : true}).populate('categoria').exec((err, productoPush)=>{
                                        if(err){
                                            return res.status(500).send({mensaje: 'Error al guardar la categoria'}); 
                                        }else if(productoPush){
                                            return res.send({mensaje: 'El producto se guardo con exito', productoPush});
                                        }else{
                                            return res.status(404).send({mensaje: 'No se pudo hacer push de categoria'});        
                                        }
                                    });
                                }else{
                                    return res.status(404).send({mensaje: 'No se pudo guardar el producto'});      
                                }
                            });
                        }
                    });
                }else{
                    return res.status(404).send({mensaje: 'Ingresa una categoria existente'});      
                }
            });
        }else{
            return res.status(404).send({mensaje: 'Revisa el ingreso de tus parametros'});      
        }
    }else{
        return res.status(404).send({mensaje: 'El id de usuario no coincide con el token'});      
    }

    
}

function updateProducto(req, res){
    var params = req.body;
    var productoId = req.params.idP;

    Producto.findById(productoId, (err, productoFind)=>{
        if(err){
            return res.status(500).send({mensaje: 'Error general al buscar el producto'});          
        }else if(productoFind){
            if(params.productoName){
                Producto.findOne({productoName : params.productoName}, (err, productoFind2)=>{
                    if(err){
                        return res.status(500).send({mensaje: 'Error general al buscar el productoName'});
                    }else if(productoFind2){
                        return res.send({mensaje: 'El productoName ya esta en uso'});
                    }else{
                        if(params.stock >= '0'){
                            Producto.findByIdAndUpdate(productoId, params, {new : true}, (err, productoUpdate)=>{
                                if(err){
                                    return res.status(500).send({mensaje: 'Error general al actualizar el producto'});
                                }else if(productoUpdate){
                                    return res.send({mensaje: 'El producto se actualizo exitosamente', productoUpdate});
                                }else{
                                    return res.status(404).send({mensaje: 'No se pudo actualizar el producto'});
                                }
                            });
                        }else{
                            return res.send({mensaje: 'El stock no puede ser menor a 0'});
                        }
                    }
                });
            }else{
                if(params.stock >= '0'){
                    Producto.findByIdAndUpdate(productoId, params, {new : true}, (err, productoUpdate)=>{
                        if(err){
                            return res.status(500).send({mensaje: 'Error general al actualizar el producto'});
                        }else if(productoUpdate){
                            return res.send({mensaje: 'El producto se actualizo exitosamente', productoUpdate});
                        }else{
                            return res.status(404).send({mensaje: 'No se pudo actualizar el producto'});
                        }
                    });
                }else{
                    return res.send({mensaje: 'El stock no puede ser menor a 0'});
                }
            }
        }else{
            return res.status(404).send({mensaje: 'No se encontro ningun producto con este id'});          
        }
    });
}



//return res.status(500).send({mensaje: 'Error general '});
//return res.send({mensaje: ' '});
//return res.status(404).send({mensaje: ' '});

function removeProducto(req, res){
    var productoId = req.params.idP;
    Producto.findOne({_id : productoId}, (err, productoFind)=>{
        if(err){
            return res.status(500).send({mensaje: 'Error general al buscar el producto'});
        }else if(productoFind){
            Producto.findByIdAndRemove(productoId, (err, productoDelete)=>{
                if(err){
                    return res.status(500).send({mensaje: 'Error general al eliminar el producto'});
                }else if(productoDelete){
                    return res.send({mensaje: 'Se elimino el producto exitosamente'});
                }else{
                    return res.status(404).send({mensaje: 'No se pudo eliminar el producto'});   
                }
            });
        }else{
            return res.status(404).send({mensaje: 'No se encontro el producto a eliminar'});          
        }
    });
}

function getProductos (req, res){
    Producto.find({}).populate('categoria').exec((err, productosFind)=>{
        if(err){
            return res.status(500).send({mensaje: 'Error general al buscar'});
        }else if(productosFind){
            return res.send({mensaje: 'Productos encontrados', productosFind});
        }else{
            return res.status(404).send({mensaje: 'No se encontraron productos'});
        }
    });
}

function masVendidos(req, res){
    Producto.find({}).populate().exec((err, productosFind)=>{
        if(err){
            return res.status(500).send({mensaje: 'Error general al buscar'});
        }else if(productosFind){
            let cursor = productosFind.find().sort({ventas : -1});
            return res.send({mensaje: 'Los productos mas vendidos', cursor});           
        }else{
            return res.status(404).send({mensaje: 'No se encontraron productos'});
        }
    });
}

function searchProductoNombre(req, res){
    var params = req.body;

    if(params.search){
        Producto.find({$or : [{$nombre}]}, (err, resultados)=>{
            if(err){
                return res.status(500).send({mensaje: 'Error general en servidor para buscar'});
            }else if (resultados){
                return res.send({mensaje: 'Coincidencias '. resultados});
            }else{
                return res.status(404).send({mensaje: 'No se encontraron coincidencias'});
            }
        });
    }
}
//return res.status(500).send({mensaje: 'Error general '});
//return res.send({mensaje: ' '});
//return res.status(404).send({mensaje: ' '});

module.exports = {
    createProducto,                   //Admin
    updateProducto,                  //admin
    removeProducto,
    getProductos,
    masVendidos,
    searchProductoNombre
}