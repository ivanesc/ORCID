Publicaciones Orcid miembros CEATIC (UJAEN)
==========

Desarrollo de aplicación web a medida con NodeJS, Express, MongoDB y Handlebars con el objeto de permitir acceder a una visualización web actualizada e inmediata de las publicaciones ORCID asociadas a un grupo de investigadores del Centro de Estudios Avanzados en Tecnologías de la Información y la Comunicación (CEATIC) con detalles como el título, tipo de publicación, fecha y DOI además de otros datos asociados al perfil del investigador.

Se contempla una API REST con Node y Express compuesta de 3 partes: 

+ Breve perfil y publicaciones Orcid de un miembro investigador mediante su Orcid ID
+ Visualización del conjunto de todas las publicaciones Orcid de CEATIC ordenadas y agrupadas por año y con filtro      según tipo de publicación
+ Método de actualización de toda la información de trabajos Orcid consumiendo una API de terceros con un cliente       Swagger y almacenando dicha información en dos colecciones de una BD  Mongo: miembros y publicaciones. Esto se        programa con una tarea CRON para ejecutarse diariamente a las 00:00 horas en el servidor de producción 

Implementación de panel de administración asociado para gestionar datos de investigadores en la plataforma con sistema de login.
