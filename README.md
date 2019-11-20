Publicaciones Orcid miembros CEATIC (UJAEN)
==========

Desarrollo de aplicación web a medida con NodeJS, Express, MongoDB y Handlebars con el objeto de permitir acceder a una visualización web actualizada e inmediata de las publicaciones ORCID asociadas a un grupo de investigadores del Centro de Estudios Avanzados en Tecnologías de la Información y la Comunicación (CEATIC) con detalles como el título, tipo de publicación, fecha y DOI además de otros datos asociados al perfil del investigador.

Se contempla una API REST con Node y Express compuesta de 3 partes: 

+ Breve perfil y publicaciones Orcid de un miembro investigador mediante su Orcid ID
+ Visualización del conjunto de todas las publicaciones Orcid de CEATIC ordenadas y agrupadas por año y con filtro      según tipo de publicación
+ Método de actualización de toda la información de trabajos Orcid consumiendo una API de terceros con un cliente       Swagger y almacenando dicha información en dos colecciones de una BD  Mongo: miembros y publicaciones. Esto se        programa con una tarea CRON para ejecutarse diariamente a las 00:00 horas en el servidor de producción 

Implementación de panel de administración asociado para gestionar datos de investigadores en la plataforma con sistema de login.

# Despliegue producción
1. curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
2. sudo apt install nodejs
3. npm --version
4. npm install
5. wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
6. echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.2 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
7. sudo apt update
8. sudo apt install -y mongodb-org
9. Lock packages
```
echo "mongodb-org hold" | sudo dpkg --set-selections
echo "mongodb-org-server hold" | sudo dpkg --set-selections
echo "mongodb-org-shell hold" | sudo dpkg --set-selections
echo "mongodb-org-mongos hold" | sudo dpkg --set-selections
echo "mongodb-org-tools hold" | sudo dpkg --set-selections
```
10. User admininstrator
```
use admin

db.createUser(
  {
    user: "administrator",
    pwd: "kljdkljdfdshfjdsaqwedscn",
    roles: [ { role: "readWrite", db: "Orcid" }, { role: "dbAdmin", db: "Orcid" }, { role: "userAdmin", db: "Orcid" } ]
  }
)
```
11. Editar /etc/mongod.conf para habilitar la autenticación
```
security:
  authorization: "enabled"
```
12. Reiniciar el servicio
```
service mongod restart
```
13. 