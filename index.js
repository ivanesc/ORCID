// Utilizar funcionalidades del Ecmascript 6
'use strict'

// Cargamos el módulo de mongoose para poder conectarnos a MongoDB
var mongoose = require('mongoose');
// Cargamos datos conexión a BD para usar en proccess.env
require('dotenv').config(); //nos ahorramos poner una variable antes del require para llamar luego a config
// Cargamos el fichero app.js con la configuración de Express
var app = require('./app');
// Creamos la variable PORT para indicar el puerto en el que va a funcionar el servidor
var port = 80;
// Le indicamos a Mongoose que haremos la conexión con Promesas
mongoose.Promise = global.Promise;
// Usamos el método connect para conectarnos a nuestra base de datos con el fichero env. Podría pasarse también la cadena de conexión directamente
mongoose.connect('mongodb://localhost:27017/Orcid', { useNewUrlParser: true, useFindAndModify: false })
    .then(() => {
        // Cuando se realiza la conexión, lanzamos este mensaje por consola
        console.log("La conexión a la base de datos Orcid se ha realizado correctamente")

        // CREAR EL SERVIDOR WEB CON NODEJS
        app.listen(port, () => {
            console.log("servidor corriendo en http://localhost:80");
        });
    })
    // Si no se conecta correctamente lanzamos el error. Se podría poner .catch(function(error) {console.log('Failed with message: ' + error.statusText);}
    .catch(err => console.error(`El error es: ${err.message}`));
