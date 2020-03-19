'use strict'
 
// Cargamos el módulo de mongoose
var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')
 
// Usaremos los esquemas
var Schema = mongoose.Schema //también valdría const { Schema } = mongoose; y luego var workOrcidSchema = new Schema({
 
// Creamos el objeto del esquema. Tiene que tener los mismos nombres de campos que en la BD
var workOrcidSchema = Schema({
    publicacion:{
        titulo: {
            type: String,
            trim: true,
            lowercase: true,
            uniqueCaseInsensitive: true,
            index: { unique : true }, //no sirve para case sensitive solo si es exactamente igual
            required: [true, "Un título de publicación es requerido"]
        },
        tipo: {
            type: String,
            trim: true,
            required: [true, "Un tipo de publicación es requerido"]
        },
        fecha: {
            type: String,
            index: true,
            trim: true,
            required: [true, "Un año de publicación es requerido"]
        },
        doi: {
            type: String,
            trim: true,
            unique: true
        },
        eid: {
            type: String,
            trim: true
        },
        autores: [{ //se podria hacer [memberOrcidSchema] dentro de autores pero cogeria todos los campos de miembro
            nombre : {
                type: String,
                required: false,
                trim: true
            },
            apellidos : {
                type: String,
                required: false,
                trim: true
            }
        }]
    }
}, { collection: "worksOrcid" })

workOrcidSchema.plugin(uniqueValidator , { message: 'Error, se espera {PATH} "{VALUE}" como valor único.' }) //PATH se refiere en moongose en este caso a titulo
 
// Exportamos el modelo para usarlo en otros ficheros
module.exports = mongoose.model('trabajoOrcid', workOrcidSchema)