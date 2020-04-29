## Publicaciones Orcid miembros CEATIC (UJAEN)

### Descripción y características generales 

Desarrollo de 3 módulos web que integran una aplicación de soporte a medida con **NodeJS**, **Express**, **MongoDB** y **Handlebars** con el objeto de permitir acceder, desde la web de la UJAEN asociada al **CEATIC** (Centro de Estudios Avanzados en Tecnologías de la Información y la Comunicación), a una visualización web actualizada e inmediata de las publicaciones **ORCID** asociadas a un grupo de investigadores ligados al centro con detalles como el título, tipo de publicación, fecha y DOI además de otros datos asociados
al perfil del investigador.

Se tiene un servidor montado con Express compuesto de 3 rutas principales que dan acceso a los métodos centralizados de un controlador de publicaciones **ORCID** que se atienden a través de peticiones a una API REST que, por su parte, interopera con una BD Mongo haciendo operaciones de inserción, actualización o consulta de documentos atendiendo a 2 modelos (**memberOrcid** y **workOrcid**) que mantienen un esquema de datos definido para el mapeo de objetos JSON a documentos de la colección respectiva.

* * *

Los 3 módulos/rutas que componen la aplicación atendiendo peticiones con Express son:

**-> membersCEATIC/actualizaTodasPublicaciones** -> Ejecución método persistencia de publicaciones **ORCID** en BD Mongo (no se trabaja con datos asociados al perfil de un miembro **ORCID** excepto para actualizar su lista de publicaciones)

**IMPORTANTE:** En caso de partir de una BD limpia de datos en la colección de publicaciones se tendría que hacer una petición a este endpoint para poblar dicha colección de datos una vez que se tengan los importados para cada perfil de miembro **ORCID** dado que así se sacarían los **ORCID** Ids para la recuperación de información de la API de **ORCID**

+ Permite procesar las peticiones de almacenamiento y/o actualización de datos referentes a publicaciones **ORCID** para cada miembro del **CEATIC** en la BD de forma que siempre se recupere información precisa y veraz

+ Para cada investigador se parsean los datos devueltos en JSON de forma asíncrona consumiendo una API Swagger pública de **ORCID** (no propia) desde la url https://pub.orcid.org/resources/swagger.json

+ Se guardan aquellas publicaciones nuevas mientras que, para las que sean duplicadas, se evita guardarlas de nuevo y sólo se actualiza la referencia al _id del documento correspondiente a la publicación del modelo o esquema de datos **workOrcid** en el esquema **memberOrcid** de la colección **membersOrcid**

+ Para completar el proceso de persistencia en la BD una vez guardada y/o actualizada la información de publicaciones para todos los miembros se obtiene una lista de autores que servirá para complementar la información correspondiente de cada publicación en la vista 2 o vista general de trabajos

> + **NOTA 1:**  Al no tener un panel de administración la información asociada al perfil de un miembro ORCID, exceptuando la referente a publicaciones, se tendría que gestionar inicialmente a través de un fichero de volcado de datos que contiene un conjunto de documentos de la colección **membersOrcid** para disponer de un abanico de perfiles ya creados con información de cada investigador del CEATIC. Esto sólo será necesario si se quiere replicar este proyecto en local teniendo previamente una BD creada en MongoDB llamada **Orcid** o en caso de hacer un despliegue partiendo desde cero en producción como se explicará en el apartado de ***"Instrucciones para despliegue e instalación"***

> + **NOTA 2:** Cualquier dato relevante que deba ser actualizado para alguna publicación en primer lugar tiene que estar registrado en la  plataforma de **Orcid** para todos los miembros **CEATIC** que tengan dicha publicación en su perfil, ya que de otra forma habría que modificar el consecuente documento asociado a la publicación manualmente en la BD. 
Para agregar, editar o eliminar un miembro **CEATIC** al sistema implementado debe hacerse de forma manual por consola o a través de un IDE que conecte con la BD Mongo para ejecutar operaciones siguiendo en todo caso la estructura y tipos de datos del esquema definido para el modelo de datos **memberOrcid**

> + **NOTA 3:** Cierta información auxiliar de una publicación como, por ejemplo, el nombre de una revista, cuartil, etc. no puede ser obtenida a partir de la API de **ORCID**

**-> membersCEATIC/works/:id** -> Vista 1 o vista perfil miembro **ORCID**

+ Path param o parámetro requerido en el endpoint para parseo: id <-->  **Orcid** ID del investigador que envía la petición para acceder a su información de perfil **ORCID** 
+ Vista de un breve perfil y listado de publicaciones **Orcid** de un miembro investigador mediante su **Orcid** ID
+ Información proporcionada para cualquier publicación: título, tipo (libro, revista, congreso, etc.), DOI (opcional), EID (opcional) y año. Todo ello definido en el esquema de datos **"workOrcid"** para su mapeo en la BD
+ Trabajos ordenados de mayor a menor año de publicación
+ Paginación de resultados
+ Permite el acceso a la vista 2 desde el menú lateral

**-> membersCEATIC/allWorks** -> Vista 2 o vista de consulta general publicaciones **CEATIC**

+ Visualización del conjunto de todas las publicaciones **Orcid** de **CEATIC** ordenadas y agrupadas por año desde las más recientes y con filtro según tipo de publicación. Solo se permite seleccionar un filtro y ver aquellas publicaciones incluidas dentro de un rango de diez años atrás desde el más reciente para los cuales se hayan recuperado resultados
+ Se puede ver el conjunto de autores que han participado en cada publicación. Importante tener en cuenta que sólo aparecerán los nombres y apellidos de autores que tengan registrada la publicación correspondiente en su **ORCID**
+ Función de imprimir a través de un botón habilitado para poder exportar en pdf la información de todas las publicaciones con sus datos relativos sin aplicar estilos

### Comenzando 🚀

_Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas o para ayudar al mantenimiento y posible puesta a punto de nuevas características futuras en producción_

Mira **[Instrucciones para despliegue e instalación]** para conocer cómo desplegar el proyecto.

### Pre-requisitos 📋

Tanto en un entorno local de pruebas como en el servidor de producción se hace uso del siguiente software y assets de terceros: 

**Backend**

1. **NodeJS** -> versión 8.10.0 recomendable
2. **npm**
3. **MongoDB**
4. **forever**

**Frontend** 

1. **Bootstrap 4**
2. **JQuery** (uso de plugin **twbs-pagination**)
3. **Font-awesome**
4. **Material Design for Bootstrap 4** (usado en componente collapse acordeón para agrupar publicaciones por año)

Dependencias o módulos de terceros que deben ser instaladas en producción desde el package.json del proyecto:

***1. moongose ->*** ODM para permitir CRUD y otras funciones como validación de datos con BD MongoDB mediante NodeJS

***2. dotenv ->*** Permite definir un fichero de variables de entorno para configurar parámetros que, por ejemplo, sean o no válidos según si estamos en un entorno local o en producción

***3. swagger-client* ->** Permite definir un cliente http para consumir un fichero JSON de cualquier API Swagger

***4. express ->*** Necesario para operar con el framework Express de Node que facilite el trabajo con la API REST y el mapeo de peticiones http para generar códigos de respuesta, cabeceras de petición personalizados, operaciones adicionales como redireccionamientos, renderizado de layouts, etc

***5. hbs y express-handlebars ->*** Habilita a Express para hacer uso de un motor de generación de plantillas dinámico denominado Handlebars que permita renderizar la información desde el lado del servidor, ya que no se cuenta en este caso con un framework frontend que permita construir una SPA liberando al servidor de esa carga gestionando sólo servicios y recursos estáticos

### Instrucciones para despliegue e instalación 🛠️
Tanto para un entorno local como en producción dirigirse al directorio donde se ubicará este proyecto y descargarlo desde el repositorio:

 `git clone https://ceatic.ujaen.es/gitlab/ceatic/orcid.git`

#### Despliegue producción en servidor Linux Debian

**Instalación NodeJS**

Alternativa 1:

```bash
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt install nodejs npm
node -v --> Ver versión de Node (cambiar a la 8.10.0 recomendada con gestor n por ejemplo)
```

Alternativa 2 (con **NVM**): -> **RECOMENDADO**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash (también wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash) -> Este comando clonará el repositorio nvm en ~/.nvm y agregará la línea fuente a tu perfil (~/.bash_profile, ~/.zshrc, ~/.profile, o ~/.bashrc)
Reiniciar la terminal para empezar a usar NVM o ejecutar export NVM_DIR="$HOME/.nvm"
command -v nvm --> Asegurarse que NVM está instalado
nvm ls-remote --> Ver lista versiones disponibles NodeJS
nvm install v8.10.0 (versión funcional para aplicación)
```

**Instalación MongoDB y poblado de datos inicial para colección membersOrcid**

```bash
sudo apt install dirmngr gnupg apt-transport-https software-properties-common ca-certificates curl
curl -fsSL https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
sudo add-apt-repository 'deb https://repo.mongodb.org/apt/debian buster/mongodb-org/4.2 main'
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable mongod --now --> Arranca el demonio mongod y habilita el servicio MongoDB para poder volver a ejecutarse en un posible reinicio de la máquina
service mongod status
mongo --eval 'db.runCommand({ connectionStatus: 1 })' --> Comprueba que se ha instalado bien
mongoimport --db Orcid --collection membersOrcid --drop --file ./docsVolcadoInicialBD/membersOrcid.json --> Importación de los datos que se usaron al comienzo del proyecto para tener un conjunto de miembros CEATIC reales con los que trabajar
```

**Configuración adicional para variables de entorno**

Será necesario crear un fichero denominado **.env** que contenga lo siguiente:

DATABASEPROD =**"mongodb://localhost:27017/Orcid"**

PORTPROD = **80**

ASSETSPROD = **"/membersCEATIC/assets/"**

En caso de cambiar la cadena de conexión a la BD, el puerto de escucha del servidor Express o la ruta en la que Express sirve los recursos estáticos se cambiaría editando este fichero, pero tal y como se indica debe funcionar con lo implementado en el código

**Pasos a ejecutar con npm y forever para puesta en marcha app**
 
 Situarse en la carpeta raíz del proyecto y ejecutar:
 ```bash
npm install -g --> Instala los módulos y dependencias del package.json en el directorio node_modules
npm install -g forever --> permite un reinicio de la aplicación o script de  forma automática en caso de excepción para seguir recibiendo peticiones HTTP
npm install -g forever-service
forever-service install orcid --script index.js --> inicia el script index.js del directorio raíz como un servicio de forma que se arranque de forma automática en un posible reinicio de la máquina. Esto se hace también para no ejecutar por defecto el app.js
forever list --> ver lista de servicios o procesos forever en ejecución
```

**Planificación tarea CRON para mantener actualizada BD**
 
 Por último, es aconsejable programar una tarea CRON para su ejecución diaria en segundo plano (en este caso se ha programado en el servidor de ejecución para llevarse a cabo cada día a las 00:00 horas), de forma que sea esta tarea la que se encargue de ejecutar un script para hacer una petición HTTP a la ruta:  
 **/membersCEATIC/actualizaTodasPublicaciones**
 
 Con ello se consiguen realizar de forma secuencial varias peticiones a la API de **ORCID** a través del cliente Swagger para mantener actualizada la BD y mostrar las vistas con la información adecuada y sin dar errores en Node a la vez que se mejora el rendimiento de la aplicación en términos de velocidad de carga del contenido al disponer de toda la información necesaria para todos los miembros **CEATIC** sin esperar que acabe el parseo de los datos de publicación procedentes del JSON Swagger consumido de la API de **ORCID** para cada miembro y las operaciones de escritura en la BD de dichos datos
 
 Necesario darle permisos al script:
 
 `chmod +x /ruta/al/archivo.sh`
 
 El contenido del script sería el siguiente:
 ```bash
#!/bin/bash
curl -H "Content-Type: application/json" http://localhost:80/membersCEATIC/actualizaTodasPublicaciones -X GET
```

La tarea se programa de la siguiente forma:

Ejecutar comando **crontab -e**
En el fichero que se abre para editar, al final del todo, poner la línea indicada más abajo donde "orcidActualiza.sh" es el nombre de ejemplo del script implementado que se ha indicado anteriormente y debe existir un directorio llamado cronjobs en el que se encuentra el script


    00 0 * * * /root/cronjobs/orcidActualiza.sh 1> /dev/null 2> /root/cronjobs/erroresActualizaOrcid.log


