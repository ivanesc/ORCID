// Utilizar funcionalidades del Ecmascript 6
'use strict'

// Cargamos los módulos de express y body-parser
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var hbs = require('express-handlebars');

// Importamos las rutas
var users_routes = require('./routes/works');

// Llamamos a express para poder crear el servidor
var app = express();

//cargar middlewares
//un metodo que se ejecuta antes que llegue a un controlador
//configuramos bodyParser para que convierta el body de nuestras peticiones a JSON
//esto nos dejara usar la informacion de los POST
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(methodOverride());
//poner especial atención en esta línea puesto que aquí se define la url para coger bien los assets 
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.set('views',path.join(__dirname,'views')); //esta línea hace lo mismo en general que lo comentado dos líneas más abajo
app.engine( 'hbs', hbs( {
    helpers: require("./helpers/handlebars.js").helpers,
    extname: 'hbs',
    defaultLayout: 'layout',
    //layoutsDir: __dirname + '/views/layouts/',
    //partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine','hbs');

// Cargamos las rutas
app.use('/membersCEATIC', users_routes);

// exportamos este módulo para poder usar la variable app fuera de este archivo
// existen otras maneras de exportar variables al igual que métodos
module.exports = app;