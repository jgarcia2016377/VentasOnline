'use strict'
//Se exportan los modelos de la base de datos
var Categoria = require('../models/categoria.model');
var Usuario = require('../models/usuario.model');
var Producto = require('../models/producto.model');

function categoriaGeneral(req, res){
    Categoria.findOne({nombre : 'general'}, (err, categoriaFind)=>{
        if(err){
            console.log('La categoria no se pudo buscar');
        }else if(categoriaFind){
            console.log('La categoria fue encontrada');
        }else{
            let categoria = new Categoria();
            categoria.nombre = 'general';
            categoria.descripcion = 'Todo tipo de productos';
            categoria.save((err, categoriaSave)=>{
                if(err){
                    console.log('Error al guardar la categoria');
                }else if(categoriaSave){
                    console.log('Se creo la categoria general');
                }else{
                    console.log('No se pudo crear la categoria general');
                }
            })
        }
    });
}

function setCategoria(req, res){
    var params = req.body;
    var categoria = new Categoria();
    var usuarioId = req.params.idU;     
    if(req.usuario.sub == usuarioId){
        if(params.nombre == 'general'){
            return res.status(404).send({mensaje: 'No puedes agregar una categoria igual a la  predeterminada'});
        }else{
            if(params.nombre && params.descripcion){
                Categoria.findOne({nombre : params.nombre.toLowerCase()}, (err, categoraFind)=>{
                    if(err){
                        return res.status(500).send({mensaje: 'Error general al buscar'});
                    }else if(categoraFind){
                        return res.send({mensaje: 'Ya existe esta categoria'});
                    }else{
                        categoria.nombre = params.nombre.toLowerCase();        
                        categoria.descripcion = params.descripcion;
                        categoria.save((err, categoriaSave)=>{
                            if(err){
                                return res.status(500).send({mensaje: 'Error general al guardar la categoria'});
                            }else if(categoriaSave){
                                return res.send({mensaje: 'La categoria fue guardada', categoriaSave});
                            }else{
                                return res.status(404).send({mensaje: 'La contraseña es incorrecta'});
                            }
                        });
                    }
                });
            }else{
                return res.status(404).send({mensaje: 'Ingresa los datos minimos para agregar una categoria'});
            }
        }   
    }else{
        return res.status(404).send({mensaje: 'El id no coincide con la sesión iniciada de token'});
    }
    
}

function removeCategoria(req, res){
    var categoriaId = req.params.idC;
    var usuarioId = req.params.idU;
    if(req.usuario.sub == usuarioId){
        Categoria.findById(categoriaId, (err, categoriaFind)=>{
            if(err){
                return res.status(500).send({mensaje: 'Error general al buscar la categoria'});
            }else if(categoriaFind){
                if(categoriaFind.nombre == 'general'){
                    return res.status(404).send({mensaje: 'No puedes eliminar la categoria predeterminada'});
                }else{
                    if(renombrarCategoria(categoriaId)){
                        Categoria.findByIdAndRemove(categoriaId, (err, categoriaRemove)=>{
                            if(err){
                                return res.status(500).send({mensaje: 'Error general al eliminar la categoria'});
                            }else if(categoriaRemove){
                                return res.send({mensaje: 'Se elimino exitosamente la categoria y se reemplazo su categoria'});
                            }else{
                                return res.status(404).send({mensaje: 'No se pudo eliminar la categoria'});
                            }
                        });
                    }else{
                        return res.status(404).send({mensaje: 'Error al eliminar la categoria en los productos'});
                    }   
                    
                }
            }else{
                return res.status(404).send({mensaje: 'No se encontro la categoria'});
            }
        });
    }else{
        return res.status(500).send({mensaje: 'El id no coincide con la sesión iniciada del token'});
    }
}

function renombrarCategoria(categoriaId){
    let bien = true;
    Producto.find({categoria : categoriaId}, (err, productosFind)=>{
        if(err){
            console.log('Error al buscar productos por categoria');
        }else if(productosFind){
            productosFind.forEach(producto => {
                console.log('El producto es: ' + producto.nombre + ' con categoria: ' + producto.categoria);
                Producto.findOneAndUpdate({_id : producto._id, categoria : categoriaId}, {$pull: {categoria : categoriaId}}, {new : true}, (err, productoPull)=>{
                    if(err){
                        console.log('Error general al hacer pull');
                    }else if(productoPull){
                        Categoria.findOne({nombre : 'general'}, (err, generalFind)=>{
                            if(err){
                                return res.status(500).send({mensaje: 'Error general al buscar la categoria general'});
                            }else if(generalFind){
                                console.log( 'El id general es  ------ '+ generalFind._id);
                                Producto.findOneAndUpdate({_id : producto._id}, {$push : {categoria : generalFind._id}}, {new : true}, (err, categoriaPush)=>{
                                    if(err){
                                        console.log('Error general al pushear');
                                    }else if(categoriaPush){
                                        console.log('Se logro hacer el push de categoria general');
                                        
                                    }else{
                                        console.log('NOo se pudo hacer el push');
                                        bien = false;
                                    }
                                });
                            }else{
                                return res.status(404).send({mensaje: 'No se encontro la categoria general'});
                            }
                        });
                        
                    }else{
                        console.log('No se pudo eliminar la categoria');
                    }
                });
            });
            console.log('Las categorias fueron actualizadas');
        }else{
            console.log('No se encontraron productos con la categoria');
        }
    });
    console.log('Ya paso la funcion de renombrar la categoria');
    return bien;         
}

function getCategorias(req, res){
    Categoria.find({}, (err, categoriasFind)=>{
        if(err){
            return res.status(500).send({mensaje: 'Error general al encontrar categorias'});
        }else if(categoriasFind){
            return res.send({mensaje: 'Categorias encontradas', categoriasFind});
        }else{
            return res.status(404).send({mensaje: 'No se encontraron categorias'});
        }
    });
}

function updateCategoria(req, res){
    var categoriaId = req.params.idC;
    var update = req.body;

    Categoria.findById(categoriaId, (err, categoriaFind)=>{
        if(err){
            return res.status(500).send({mensaje: 'Error general al buscar la categoria'});
        }else if(categoriaFind){
            Categoria.findOne({nombre : update.nombre}, (err, categoriaE)=>{
                if(err){
                    return res.status(500).send({mensaje: 'Error general al buscar por el parametro'});
                }else if(categoriaE){
                    return res.status(404).send({mensaje: 'El nombre ya se encuentra en uso'});
                }else{
                    Categoria.findByIdAndUpdate(categoriaId, update, {new : true}, (err, categoriaUpdate)=>{
                        if(err){
                            return res.status(500).send({mensaje: 'Error general al actualizar'});
                        }else if(categoriaUpdate){
                            return res.send({mensaje: 'La categoria se actualizo', categoriaUpdate});
                        }else{
                            return res.status(404).send({mensaje: 'No se pudo actualizar'});
                        }
                    });
                }
            })
        }else{
            return res.status(404).send({mensaje: 'No se encontro la categoria deseada'});
        }
    })
}


//return res.status(500).send({mensaje: 'Error general '});
//return res.send({mensaje: ' '});
//return res.status(404).send({mensaje: 'La contraseña es incorrecta'});

module.exports = {
    setCategoria,           //mdAuthAdmin
    removeCategoria,        //mdAuthAdmin
    categoriaGeneral,       //inicializable, no remplazable
    getCategorias,           //Todos
    updateCategoria
}

