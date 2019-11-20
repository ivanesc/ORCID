'use strict'

var swaggerNodeClient = require('swagger-client');

// Cargamos los modelos para usarlos posteriormente
var miembroOrcid = require('../models/memberOrcid');
var publicacionOrcid = require('../models/workOrcid');


// Métodos controlador de trabajos miembros CEATIC

// método para actualizar la información de todas las publicaciones ORCID y guardarla en la bd
var actualizaPublicacionesOrcid = (req, res, next) => {
    let orcidIDs = [];
    let trabajo;
    let publicacion;

    miembroOrcid.find((err, miembros) => {
        if (err) {
            return res.status(500).send({ message: 'Error en el servidor' });
        }
        // Devolvemos el resultado
        else if (miembros) {
            /*Bucle también válido
            for (const item of miembros) {
                console.log(item.miembro.nombre);
            }*/
            for (const item in miembros) {
                orcidIDs.push(miembros[item].miembro.orcidID);
            }

            new swaggerNodeClient({
                url: 'https://pub.orcid.org/resources/swagger.json',
                usePromise: true
            }) //usaremos programación asíncrona con async/await para tener hacer llamadas a la API de forma secuencial y evitar un exceso de llamadas simultáneas
                .then(async client => {
                    for (const id of orcidIDs) {
                        // se resuelve de manera asíncrona pero secuencialmente para evitar muchas peticiones a la API paralelas
                        await client.apis['Public API v2.0'].viewWorks({ orcid: id }, { responseContentType: "application/JSON" })
                            .then(async works => {
                                try {
                                    await miembroOrcid.findOneAndUpdate({
                                        'miembro.orcidID': id,
                                    }, {
                                            $set: { 'miembro.publicaciones': [] }
                                        }, {
                                            new: true
                                        }, (err, doc) => {
                                            if (err) {
                                                console.log(`Error al intentar limpiar lista publicaciones miembro: ` + err)
                                            } else {
                                                console.log(doc.miembro.orcidID + " con ninguna publicación aún asociada");
                                            }
                                        });
                                }
                                catch (error) {
                                    console.log("Error en búsqueda y limpieza publicaciones miembro Orcid " + error);
                                }
                                if (works) {
                                    for (let datos1 in works) {
                                        for (let datos2 in works[datos1].group) {
                                            if (works[datos1].group[datos2].hasOwnProperty('work-summary')) { //comprobar con orcid acabado en 1909 que no tiene nada
                                                for (let datos3 in works[datos1].group[datos2]['work-summary']) {
                                                    if (works[datos1].group[datos2]['work-summary'][datos3]['publication-date'] !== null) {
                                                        if ((works[datos1].group[datos2]['work-summary'][datos3]['publication-date'].year !== null)) {
                                                            let doieid = [];
                                                            if (works[datos1].group[datos2]['work-summary'][datos3]['external-ids'] !== null) {
                                                                for (let datos4 in works[datos1].group[datos2]['work-summary'][datos3]['external-ids']['external-id']) {
                                                                    doieid.push(works[datos1].group[datos2]['work-summary'][datos3]['external-ids']['external-id'][datos4]['external-id-value']);
                                                                }
                                                            }
                                                            else {
                                                                doieid[0] = "inexistente", doieid[1] = "inexistente";
                                                            }

                                                            publicacion = new publicacionOrcid({
                                                                "publicacion.titulo": works[datos1].group[datos2]['work-summary'][datos3].title.title.value,
                                                                "publicacion.tipo": works[datos1].group[datos2]['work-summary'][datos3].type,
                                                                "publicacion.fecha": works[datos1].group[datos2]['work-summary'][datos3]['publication-date'].year.value,
                                                                "publicacion.doi": doieid[0],
                                                                "publicacion.eid": doieid[1]
                                                            });

                                                            try {
                                                                await publicacion.save(async (error, trabajo2) => {
                                                                    trabajo = { titulo: works[datos1].group[datos2]['work-summary'][datos3].title.title.value, tipo: works[datos1].group[datos2]['work-summary'][datos3].type, fecha: works[datos1].group[datos2]['work-summary'][datos3]['publication-date'].year.value, doi: doieid[0], eid: doieid[1] }
                                                                    //en caso de encontrarse el trabajo en la BD no se vuelve a insertar y se guarda su id de referencia en la lista de trabajos del miembro que corresponda
                                                                    if (error) {
                                                                        console.log("Trabajo: " + trabajo.titulo + " Fecha: " + trabajo.fecha + " OrcidID: " + id);
                                                                        let actualizaRepetido = async (trabajo3) => {
                                                                            try {
                                                                                await miembroOrcid.findOneAndUpdate({
                                                                                    'miembro.orcidID': id,
                                                                                }, { //actualiza en el array de objetos publicaciones sin meter id repetidos. Lo contrario de push
                                                                                        $addToSet: { 'miembro.publicaciones': trabajo3[0]._id }
                                                                                    }, { //permite recuperar el documento una vez actualizado. En caso contrario doc no estaría actualizado aún con la lista de publicaciones
                                                                                        new: true
                                                                                    },
                                                                                    (err, doc) => {
                                                                                        if (err) {
                                                                                            console.log(`Error al actualizar lista publicaciones miembro tras encontrarse trabajo repetido: ` + err)
                                                                                        } else {
                                                                                            console.log(doc.miembro.orcidID + " actualizado correctamente al encontrarse una publicación existente anteriormente");
                                                                                        }
                                                                                    });
                                                                            }
                                                                            catch (error) {
                                                                                console.log("Error al intentar insertar id de trabajo repetido en publicaciones miembro Orcid")
                                                                            }
                                                                        }

                                                                        publicacionOrcid.find({ 'publicacion.titulo': trabajo.titulo }, async (error, trabajo3) => {
                                                                            error ? console.log(error) : await actualizaRepetido(trabajo3);
                                                                        });
                                                                    }
                                                                    else { //en este caso al tratarse de un trabajo nuevo se inserta en la BD y se guarda su id de referencia en la lista de trabajos del miembro
                                                                        console.log("Trabajo nuevo guardado");

                                                                        try {
                                                                            await miembroOrcid.findOneAndUpdate({
                                                                                'miembro.orcidID': id,
                                                                            }, {
                                                                                    $addToSet: { 'miembro.publicaciones': trabajo2._id }
                                                                                }, {
                                                                                    new: true
                                                                                }, (err, doc) => {
                                                                                    if (err) {
                                                                                        console.log(`Error al actualizar lista publicaciones miembro tras encontrar trabajo nuevo: ` + err)
                                                                                    } else {
                                                                                        console.log(doc.miembro.orcidID + " actualizado correctamente tras trabajo nuevo");
                                                                                    }
                                                                                });
                                                                        }
                                                                        catch (error) {
                                                                            console.log("Error al intentar insertar id trabajo nuevo en publicaciones miembro Orcid")
                                                                        }
                                                                    }
                                                                })
                                                                return res.status(200).send("Datos ORCID de CEATIC actualizados correctamente");
                                                            }
                                                            catch (error) {
                                                                console.log("Detalles de error " + error.message);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            })
                            .catch(error => {
                                console.log('Oops!  failed status ' + error.status + ' with message: ' + error);
                                res.status(error.status).send({ Mensaje: error.message });
                            });
                    }
                })
                .catch(console.error);
        } else {
            return res.status(404).send({
                message: 'No hay miembros de CEATIC vinculados a ORCID'
            });
        }
    });
}

// método para conseguir todos los trabajos de todos los miembros de CEATIC
// equivalente a hacer var getAllMemberWorks = (req, res, next)
async function getAllMemberWorks(req, res, next) {
    let publiFecha = {};
    let fechasFinal = {};

    // Devuelve un objeto convertido en array donde la primera posición es el menor año y contiene otro array con las
    // publicaciones de ese año
    function objArray( obj ) {
        let resultado = [];
        for ( let key in obj ) {
            resultado.push( obj[key] );
        }
        console.log(resultado[0][0]);
        return resultado
    }
 
    // El parámetro de entrada debe ser un array
    // Devuelve el array invertido
    // Objetivo: tener el array de publicaciones ordenado de mayor fecha a menor
    function reverse( obj ) {
        let resultado = [];
        for (let i=obj.length-1; i>=0; i--) {
            resultado.push( obj[i] );
        }
        console.log(resultado[0][0]);
        return resultado;
    }

    var obtenerTrabajosAño = async (fechas2) => {
        for (let fecha in fechas2) {
            try {
                await publicacionOrcid.find({ 'publicacion.fecha': fechas2[fecha] }, { 'publicacion.titulo': 1, 'publicacion.tipo': 1, 'publicacion.fecha': 1, 'publicacion.doi': 1, 'publicacion.eid': 1, '_id': 0 }, (error, publ) => {
                    if(error){
                        return console.error;
                    }
                    //tenemos un literal que contiene varios arrays de objetos publicaciones almacenados en cada propiedad fecha
                    publiFecha[fechas2[fecha]] = publ;
                    //console.log(publiFecha);
                })
            }
            catch (e) {
                console.log(e.message);
            }
        }
        publiFecha = objArray(publiFecha);
        publiFecha = reverse(publiFecha);
        //console.log(publiFecha);
        return publiFecha;
    }

    await publicacionOrcid.distinct('publicacion.fecha', async (err, fechas) => {
        if (err) {
            return res.status(500).send({ message: 'Error en el servidor' });
        }
        // Devolvemos el resultado de las distintas fechas del array ordenadas de mayor a menor
        else if (fechas) {

            fechas.sort(function (a, b) { return b - a });
            //console.log(fechas);

            let todasPubli = await obtenerTrabajosAño(fechas);

            if(todasPubli.length !== undefined){
                for(let año of fechas){
                    for(let trabajo of todasPubli){
                        if(trabajo[0].publicacion.fecha == año){
                            fechasFinal[año] = trabajo;
                        }
                    }
                }
            }

            var jsonArr = Object.keys(fechasFinal).map(function(key) {
                return [key,fechasFinal[key]];
            });
                    
            jsonArr = jsonArr.reverse();

            console.log(jsonArr);

            /*console.log(Object.keys(fechasFinal).reduce((accumulator, currentValue) => {
                accumulator[currentValue] = fechasFinal[currentValue];
                return accumulator;
            }, {}));*/

            //console.log(fechasFinal[2019]);
           
            //console.log(typeof(todasPubli));
            res.render('../views/pages/global_works', { datos: fechas, fechasFinal });
        } else {
            return res.status(404).send({
                message: 'No hay ninguna fecha asociada a publicaciones de CEATIC'
            });
        }
    })
}

// método para conseguir los trabajos en ORCID de un sólo miembro CEATIC con su OrcidId
// alternativa a router.get('/user/:id',  (req, res) => {}). Esto se haría sin controladores de por medio y en el fichero de rutas
async function getOneMemberWorks(req, res, next) {                   //en lugar de usar esta function getOneMemberWorks(req,res) para poder usarlo en el fichero de rutas

    const orcidId = req.params.id;
    console.log("Orcid_ID: ", orcidId);

    //Función para tener ordenados de mayor a menor fecha los trabajos de un miembro
    var ordenarAsc = (p_array_json, p_key1, p_key2) => {

        p_array_json.sort(function (a, b) {
            let prop1 = a[p_key1];
            let elem1 = parseInt(prop1[p_key2]);
            //console.log(typeof elem1);
            let prop2 = b[p_key1];
            let elem2 = parseInt(prop2[p_key2]);
            //console.log(typeof elem2);
            console.log(elem1 + " " + elem2);

            return elem2 - elem1;
        });
    }

    //Esta consulta vale tanto para un array de objetos miembro como si no es un array como en este caso
    await miembroOrcid.find({ 'miembro.orcidID': orcidId }).
        populate('miembro.publicaciones').
        exec(async (err, miembro) => {
            //Válida solo para array de objetos miembro
            //memberOrcid.find({miembro: {$elemMatch: {orcidID: orcidId}}}).exec((err, miembro) => {
            if (err) {
                return res.status(500).send({ message: 'Error en el servidor' });
            }
            // Devolvemos el resultado
            else if (miembro) {
                var publFechas = miembro[0].miembro.publicaciones;
                ordenarAsc(publFechas, 'publicacion', 'fecha');

                //console.log(' Hola %s',miembro[0].miembro.nombre);
                res.status(200);
                res.render('../views/pages/individual_works', { nombre: miembro[0].miembro.nombre, apellidos: miembro[0].miembro.apellidos, descripción: miembro[0].miembro.descripción, posición: miembro[0].miembro.posición, orcidID: orcidId, experiencia: publFechas });
                //res.render('../views/pages/individual_works', {layout: 'layout', datos: works});
            } else {
                return res.status(404).send({
                    message: 'No existe el miembro'
                });
            }
        });
}

// sacar publicaciones de 2018 y que sean journal_Article
function getAllJournalMemberWorks2018(req, res, next) {
    const validos = [];
    const orcidIDs = [];
    let trabajo;
    let contadorMiembros = 0;

    let orcidIDs = [];
    const allWorks = [];

    function delay() {
        return new Promise(resolve => setTimeout(resolve, 300));
    }

    async function delayedLog(item) {
        await delay();
        console.log(item);
    }

    const getWorks = async (id, client) => {
        return await client.apis['Public API v2.0'].viewWorks({ orcid: id }, { responseContentType: "application/JSON" });
    }

    /*async function getWorks(client, orcidIDs) {
        for (const id of orcidIDs) {
        //orcidIDs.forEach(async id => {
          await client.apis['Public API v2.0'].viewWorks({ orcid: id }, { responseContentType: "application/JSON" });
          //console.log("id: " + id);
        //});
        }
    }*/

    miembroOrcid.find(function (err, miembros) {
        if (err) {
            return res.status(500).send({ message: 'Error en el servidor' });
        }
        // Devolvemos el resultado
        else if (miembros) {
            /*Bucle también válido
            for (const item of miembros) {
                console.log(item.miembro.nombre);
            }*/
            for (const item in miembros) {
                orcidIDs.push(miembros[item].miembro.orcidID);
            }
            orcidIDs.forEach(function (id, index, lista) {
                new swaggerNodeClient({
                    url: 'https://pub.orcid.org/resources/swagger.json',
                    usePromise: true
                })
                    .then(function (client) {
                        //console.log("Cliente "+JSON.stringify(client));
                        //for (const id of orcidIDs) {
                        //await delayedLog(id);
                        //orcidIDs.forEach(function (id, index, lista) {
                        //await Promise.all(orcidIDs.map((id) => getWorks(id, client)))

                        console.log("Orcid " + id);
                        client.apis['Public API v2.0'].viewWorks({ orcid: id }, { responseContentType: "application/JSON" })
                            .then(function (works) {
                                console.log("numMiembros " + contadorMiembros + "numOrcidId " + orcidIDs.length);
                                //console.log(works);

                                //console.log("Hola");
                                if (works) {
                                    for (let datos1 in works) {
                                        for (let datos2 in works[datos1].group) {
                                            if (works[datos1].group[datos2].hasOwnProperty('work-summary')) { //comprobar con orcid acabado en 1909 que no tiene nada
                                                for (let datos3 in works[datos1].group[datos2]['work-summary']) {
                                                    if (works[datos1].group[datos2]['work-summary'][datos3]['publication-date'] !== null) {
                                                        if ((works[datos1].group[datos2]['work-summary'][datos3]['publication-date'].year !== null) && (works[datos1].group[datos2]['work-summary'][datos3]['publication-date'].year.value == '2018') && (works[datos1].group[datos2]['work-summary'][datos3].type) == 'JOURNAL_ARTICLE') {
                                                            let doieid = [];
                                                            for (let datos4 in works[datos1].group[datos2]['work-summary'][datos3]['external-ids']['external-id']) {
                                                                doieid.push(works[datos1].group[datos2]['work-summary'][datos3]['external-ids']['external-id'][datos4]['external-id-value']);
                                                            }
                                                            trabajo = { titulo: works[datos1].group[datos2]['work-summary'][datos3].title.title.value, año: works[datos1].group[datos2]['work-summary'][datos3]['publication-date'].year.value, tipo: works[datos1].group[datos2]['work-summary'][datos3].type, DOI: doieid[0] }
                                                            console.log("Trabajo: " + trabajo.titulo + " Fecha: " + trabajo.año + " OrcidID: " + id);
                                                            validos.push(trabajo);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                contadorMiembros++;
                                console.log("Num Miembros: " + contadorMiembros)

                                //contadorMiembros++;

                                //console.log("numMiembros "+contadorMiembros+ "numOrcidId "+orcidIDs.length);
                                if (contadorMiembros == orcidIDs.length) {
                                    console.log("Listo");
                                    //res.status(200);
                                    //res.render('../pages/todos2018Journal', { validos });
                                }
                            })
                            .catch(function (error) {
                                console.log('Oops!  failed status ' + error.status + ' with message: ' + error);
                                res.status(404).send({ Mensaje: 'Recurso no encontrado u orcid_ID mal especificado' });
                            });
                    })
                    .catch(console.error);
            })

        } else {
            return res.status(404).send({
                message: 'No hay miembros de CEATIC vinculados a ORCID'
            });
        }
    });
}


module.exports = {
    actualizaPublicacionesOrcid,
    getAllMemberWorks,
    getOneMemberWorks,
    getAllJournalMemberWorks2018,
};