'use strict'
 
// Cargamos el módulo de mongoose
var mongoose = require('mongoose')
 
// Usaremos los esquemas
var Schema = mongoose.Schema
 
// Creamos el objeto del esquema. Tiene que tener los mismos nombres de campos que en la BD
var memberOrcidSchema = Schema({
    miembro:{
        nombre: {
            type: String,
            trim: true,
            required: true
        },
        apellidos: {
            type: String,
            trim: true,
            required: true
        },
        posición: {
            type: String,
            trim: true,
            required: true
        },
        descripción: {
            type: String,
            required: true
        },
        orcidID: {
            type: String,
            required: true,
            unique: true
        }, 
        publicaciones: [{
            type: Schema.Types.ObjectId,
            ref: "trabajoOrcid"
        }] 
    }
}, { collection: "membersOrcid" })
 
// Exportamos el modelo para usarlo en otros ficheros
module.exports = mongoose.model('memberOrcid', memberOrcidSchema)