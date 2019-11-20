'use strict'
 
// Cargamos el módulo de mongoose
var mongoose = require('mongoose');
 
// Usaremos los esquemas
var Schema = mongoose.Schema;
 
// Creamos el objeto del esquema. Tiene que tener los mismos nombres de campos que en la BD
var workOrcidSchema = Schema({
    publicacion:{
        titulo: {
            type: String,
            trim: true,
            unique: true,
            required: true
        },
        tipo: {
            type: String,
            trim: true,
            required: true
        },
        fecha: {
            type: String,
            trim: true,
            required: true
        },
        doi: {
            type: String,
            trim: true,
            unique: true
        },
        eid: {
            type: String,
            trim: true
        }
    }
}, { collection: "worksOrcid" });
 
// Exportamos el modelo para usarlo en otros ficheros
module.exports = mongoose.model('trabajoOrcid', workOrcidSchema);