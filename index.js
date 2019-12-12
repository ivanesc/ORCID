// Utilizar funcionalidades del Ecmascript 6
'use strict'
// Cargamos el módulo de mongoose para poder conectarnos a MongoDB
var mongoose = require('mongoose');
// Cargamos datos conexión a BD para usar en proccess.env
require('dotenv').config(); //nos ahorramos poner una variable antes del require para llamar luego a config
// Cargamos el fichero app.js con la configuración de Express
var app = require('./app');
// Creamos la variable PORT para indicar el puerto en el que va a funcionar el servidor
var port = 3800;
// Le indicamos a Mongoose que haremos la conexión con Promesas
mongoose.Promise = global.Promise;
// Usamos el método connect para conectarnos a nuestra base de datos
mongoose.connect('mongodb://root:ceatOrc19_20Adm@localhost:27017/Orcid', { useNewUrlParser: true })
    .then(() => {
        // Cuando se realiza la conexión, lanzamos este mensaje por consola
        console.log("La conexión a la base de datos Orcid se ha realizado correctamente")
    
        // CREAR EL SERVIDOR WEB CON NODEJS
        app.listen(port, () => {
            console.log("Servidor corriendo en http://localhost:3800");
        });
    })
    // Si no se conecta correctamente escupimos el error. Se podría poner .catch(function(error) {console.log('Failed with message: ' + error.statusText);}
    .catch(err => console.log(`El error es: ${err.message}`));