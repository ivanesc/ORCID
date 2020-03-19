// Utilizar funcionalidades del Ecmascript 6
'use strict'

// Cargamos los módulos de express, body-parser y handlebars así como otros necesarios
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var hbs = require('express-handlebars');
require('dotenv').config();

// Importamos las rutas
var works_routes = require('./routes/works');

// Llamamos a express para poder crear el servidor
var app = express();

//cargar middlewares
//un metodo que se ejecuta antes que llegue a un controlador
//configuramos bodyParser para que convierta el body de nuestras peticiones a JSON
//esto nos dejara usar la informacion de los POST. Útil para formularios aunque también puede mandarse el JSON del cuerpo directamente con la petición por ejemplo con AJAX o Axios
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(methodOverride());
//app.use('/assets', express.static(path.join(__dirname, 'assets'))); Esto también serviría como lo de abajo
app.use(process.env.ASSETSDEV, express.static(__dirname + '/assets')); //con esto se configura la ruta a través de la cual nuestro servidor Express sirve los ficheros estáticos al cliente

app.set('views',path.join(__dirname,'views')); //esta línea hace lo mismo en general que lo comentado dos líneas más abajo
app.set('view engine','hbs');
app.engine( 'hbs', hbs( {
    helpers: require("./helpers/handlebars.js").helpers,
    extname: 'hbs',
    defaultLayout: 'layout',
    //layoutsDir: __dirname + '/views/layouts/',
    //partialsDir: __dirname + '/views/partials/'
}));

// Cargamos las rutas
app.use('/membersCEATIC', works_routes);

// exportamos este módulo para poder usar la variable app fuera de este archivo
module.exports = app;
