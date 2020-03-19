'use strict';

const swaggerNodeClient = require('swagger-client')

// Cargamos el módulo de mongoose
const mongoose = require('mongoose')

//Módulo parte del core de Node para hacer comprobaciones
const assert = require('assert')

// Cargamos los modelos para usarlos posteriormente
const miembroOrcid = require('../models/memberOrcid')
const publicacionOrcid = require('../models/workOrcid')

// Método que realiza las operaciones de almacenamiento y actualización de datos asociados a publicaciones en la BD 
// para mantener así mismo referencias de autor-publicaciones para poblar los datos de un autor de manera individualizada
var guardaBDInfoMiembroPubli = async (publi, idAutor) => {

    console.log(publi.publicacion.titulo)
    assert.ok(publi instanceof publicacionOrcid) //pasa el test si no lanza excepción aquí

    try {
        //este proceso de guardar en la BD hay que hacerlo asíncrono para mantener en salida validaciones de trabajos
        //se podría hacer también const publicacion = new publicacionOrcid({jsonPublicacion}).save()
        await publi.save(async (error, trabajo2) => {
            let trabajo = {
                titulo: publi.publicacion.titulo,
                tipo: publi.publicacion.tipo,
                fecha: publi.publicacion.fecha,
                doi: publi.publicacion.doi,
                eid: publi.publicacion.eid
            }
            //console.log("En estado de actualización %s", trabajo.titulo)
            //en caso de encontrarse el trabajo en la BD no se vuelve a insertar y se guarda su id de referencia en la lista de trabajos del miembro que corresponda
            if (error) { //se captura el error con el callback y por tanto en el catch no recoge nada
                //console.log(error)
                console.log("Trabajo que da fallos al parecer por repetirse: " + trabajo.titulo + " Fecha: " + trabajo.fecha + " OrcidID: " + idAutor)
                var actualizaRepetido = async (trabajo3) => {
                    console.log("Intentando actualizar referencias id en miembro de publicacion '" + trabajo3[0].publicacion.titulo + "'")
                    try {
                        await miembroOrcid.findOneAndUpdate(
                        {
                            'miembro.orcidID': idAutor 
                        },
                        {
                            //actualiza en el array de objetos publicaciones sin meter id repetidos. Lo contrario de push
                            //esto se hace para evitar que en un mismo autor se le repitan trabajos
                            $addToSet: { 'miembro.publicaciones': trabajo3[0]._id }
                        },
                        {
                            //permite recuperar el documento una vez actualizado. En caso contrario doc no estaría actualizado aún con la lista de publicaciones
                            new: true
                        },
                        (err, doc) => { //al parecer si se da una excepcion no se mete en este error sino en el de catch
                            if (err) {
                                console.log('Error al actualizar referencias lista publicaciones miembro tras encontrarse trabajo repetido: ' + err)
                            } else {
                                console.log( doc.miembro.orcidID + ' actualizado correctamente al encontrarse una publicación existente anteriormente')
                            }
                        })
                    } catch (error) {
                        console.log(error.message)
                        //console.log('Error al intentar insertar id de trabajo repetido en publicaciones miembro Orcid')
                    }
                }

                // const query = { 'country': new RegExp(`^${countryName}$`, 'i') };
                // const query = { 'country': { $regex: new RegExp(`^${countryName}$`, 'i') } };
                const query = {'publicacion.titulo': {$regex: new RegExp(`^${trabajo.titulo}$`), $options: 'i'}}
                await publicacionOrcid.find(query, async (error, trabajo3) => {
                    error ? console.log(error) : await actualizaRepetido(trabajo3) //al hacer esta función se salta la validación del esquema Moongose
                })
            } else {
                //en este caso al tratarse de un trabajo nuevo se inserta en la BD y se guarda su id de referencia en la lista de trabajos del miembro
                console.log('Trabajo nuevo guardado')

                try {
                    await miembroOrcid.findOneAndUpdate(
                    {
                        'miembro.orcidID': idAutor
                    },
                    {
                        $addToSet: { 'miembro.publicaciones': trabajo2._id }
                    },
                    {
                        new: true
                    },
                    (err, doc) => {
                        if (err) {
                            console.log('Error al actualizar referencias lista publicaciones miembro tras encontrar trabajo nuevo: ' + err)
                        } else {
                            console.log(`${doc.miembro.orcidID} actualizado correctamente tras trabajo nuevo`)
                        }
                    })
                } catch (error) {
                    console.log('Error al intentar insertar id trabajo nuevo en publicaciones miembro Orcid')
                }
            }
        })
    } catch (error) {
        console.log('Detalles de error ' + error.message)
    } 
}

// esta función se usará para actualizar el array de objetos autor de cada publicación buscando la referencia de la publicación respectiva en cada documento del modelo memberOrcid guardado antes
// su utilidad se erige principalmente en mostrar todos los autores de cada publicación en vista global de trabajos CEATIC
var actualizaTodosAutoresPublic = async () => {
    try {
        //se buscan todas las publicaciones para 
        let listaPubliFinal = await publicacionOrcid.find({}).exec()
        for (let publi of listaPubliFinal) {
            var idPubl = mongoose.Types.ObjectId(publi._id)
            let tmpAutores = []
            //se busca el id de cada publicación en el array de ids de publicaciones de un miembro
            const autores = await miembroOrcid.find({ 'miembro.publicaciones': idPubl })
                            .select('miembro.nombre miembro.apellidos')
                            .exec()
            
            //se meten los autores en un nuevo campo "autores" del array de objetos o documentos publicacion encontrados para una fecha en concreto
            //no se puede modificar un documento directamente en memoria sin después tener que guardarlo en la BD
            for (let i = 0; i < autores.length; i++) { //creación de array dinámico para guardarlo en array de objetos autor de una publicacion
                let tmp = { "nombre": autores[i].miembro.nombre, "apellidos": autores[i].miembro.apellidos }
                tmpAutores.push(tmp)

                // podríamos tener 2 alternativas en el modelo de datos a la hora de hacer el save para los autores el cual fallaría por no respetar restricción de clave única
                // publi['publicacion']['autores'] += "; " + autores[i].miembro.apellidos + ", " + autores[i].miembro.nombre  --> Solo sirve para valor string concatenado en clave autores
                // publi['publicacion']['autores'] = tmpAutores --> Solo sirve para array de objetos miembro que solo tienen nombre y apellidos por lo que no es del todo un esquema embebido del modelo memberOrcid
                // await publi.save()
            }
            //Solución idónea para evitar errores de validación ya que el update no incurre en eso al contrario que el save o create
            await publicacionOrcid.updateOne({ 
                '_id': idPubl
            },
            {
                'publicacion.autores': tmpAutores
            }, 
            (err, doc) => {
                if (err) console.log(`Error en actualización autores publicación: ` + console.err)
                console.log(`Publicacion ${publi.publicacion.titulo} con autores actualizados correctamente`)
            });
        }
    } catch (error) {
        console.log(`Error: ` + console.err)
    }
}

// Métodos controlador de trabajos miembros CEATIC

// método controlador principal para actualizar la información de todas las publicaciones ORCID y guardarla en la bd
var parserRegistroInfoOrcidContrPrincipal = (req, res, next) => {
    let orcidIDs = []
    let publicacion

    miembroOrcid.find((err, miembros) => { //es igual que poner miembroOrcid.find({},(error, miembros) => {})
        if (err) {
            return res.status(500).send({ message: 'Error en el servidor' }) //esta excepción de error habría que manejarla de forma genérica
        } else if (miembros) {
            // Devolvemos el resultado
            /*Bucle también válido
            for (const item of miembros) {
                console.log(item.miembro.nombre)
            }*/
            for (const item in miembros) {
                orcidIDs.push(miembros[item].miembro.orcidID)
            }
            //consumir desde cliente http api swagger para parsear el json devuelto como promesa por cada miembro
            new swaggerNodeClient({
                url: 'https://pub.orcid.org/resources/swagger.json',
                usePromise: true
            }) //usaremos programación asíncrona con async/await para tener hacer llamadas a la API de forma secuencial y evitar un exceso de llamadas simultáneas
            .then(async (client) => {
                for (const id of orcidIDs) { //se podria hacer con un for await sin poner el await dentro
                    // se resuelve de manera asíncrona pero secuencialmente para evitar muchas peticiones a la API paralelas
                    await client.apis['Public API v2.0'].viewWorks({ orcid: id }, { responseContentType: 'application/JSON' })
                        .then(async (works) => { //el catch de este then maneja la excepcion de devolver el cliente para consumir la api de orcid y no para lo de después
                            let listaPublMiembroActualizar = []
                            try { //otra manera es meter dentro del find un where entre llaves para especificar la condición de búsqueda
                                await miembroOrcid.findOneAndUpdate({'miembro.orcidID': id},
                                {
                                    $set: { 'miembro.publicaciones': [] } //vaciamos lista referencias publicaciones para que no se mantengan publicaciones anteriores en cada actualizacion
                                },
                                {
                                    new: true
                                },
                                (err, doc) => {
                                    if (err) {
                                        console.log('Error al intentar limpiar lista publicaciones miembro: ' + err)
                                    } else {
                                        console.log(doc.miembro.orcidID + ' con ninguna publicación aún asociada')
                                    }
                                })
                            } catch (error) {
                                console.log('Error en búsqueda y limpieza publicaciones miembro Orcid ' + error)
                                //throw(error)
                            }

                            try{
                                //recorrer json de api orcid para capturar datos y guardarlos en bd para cada investigador de manera individualizada
                                for (let datos1 in works) {
                                    for (let datos2 in works[datos1].group) {
                                        if (works[datos1].group[datos2].hasOwnProperty('work-summary')) {
                                            //comprobar con orcid acabado en 1909 que no tiene nada
                                            for (let datos3 in works[datos1].group[datos2]['work-summary']) {
                                                if (works[datos1].group[datos2]['work-summary'][datos3]['publication-date'] !== null) {
                                                    if (works[datos1].group[datos2]['work-summary'][datos3]['publication-date'].year !== null) {
                                                        let doieid = []
                                                        if (works[datos1].group[datos2]['work-summary'][datos3]['external-ids'] !== null) {
                                                            for (let datos4 in works[datos1].group[datos2]['work-summary'][datos3]['external-ids']['external-id']) {
                                                                doieid.push(works[datos1].group[datos2]['work-summary'][datos3]['external-ids']['external-id'][datos4]['external-id-value'])
                                                            }
                                                        } else {
                                                            (doieid[0] = 'inexistente'),
                                                            (doieid[1] = 'inexistente')
                                                        }
                                                   
                                                        publicacion = new publicacionOrcid({
                                                            'publicacion.titulo': works[datos1].group[datos2]['work-summary'][datos3].title.title.value,
                                                            'publicacion.tipo': works[datos1].group[datos2]['work-summary'][datos3].type,
                                                            'publicacion.fecha': works[datos1].group[datos2]['work-summary'][datos3]['publication-date'].year.value,
                                                            'publicacion.doi': doieid[0],
                                                            'publicacion.eid': doieid[1]
                                                        })

                                                        listaPublMiembroActualizar.push(publicacion)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            } catch (error) {
                                console.log("Se ha encontrado un error al recorrer el json de la api de orcid: " + error)
                            }

                            try {
                                //resolvemos en paralelo cada promesa resultante de guardar cada publicación de un autor en la BD
                                await Promise.all(listaPublMiembroActualizar.map((publ) => guardaBDInfoMiembroPubli(publ,id))) //aqui no devolvemos el array de publicaciones guardadas en la BD puesto que no es necesario
                            } catch (error) {
                                console.log('Detalles de error ' + error.message)
                            } 
                        })
                        .catch((error) => {
                            console.log('Oops! Estado petición fallido ' + error.status + ' con mensaje: ' + error)
                            res.status(error.status).send({ Mensaje: error.message })
                        })
                }
                // hasta aquí se habrían guardado y/o actualizado los datos de publicaciones de todos los miembros
                // ahora se quieren guardar todos los autores de cada publicacion para lo cual buscamos aquellos que tienen una
                // referencia a esa publicacion en su lista de publicaciones. Necesario tener antes todos los miembros con su información actualizada
                await actualizaTodosAutoresPublic()
                
                return res.status(200).send('Datos ORCID de CEATIC actualizados correctamente')
            })
            .catch(console.error)
        } else {
            return res.status(404).send({message: 'No hay miembros de CEATIC vinculados a ORCID'})
        }
    })
}

// método controlador para conseguir todos los trabajos de todos los miembros de CEATIC
var getAllMemberWorks = async (req, res, next) => {
    let publiFecha = {}
    let fechasFinal = {}
    let tiposPubl

    //consulta para filtros donde tendríamos todos los tipos de publicaciones
    var obtenerTodosTiposFechas = async (fechas2) => {
        //console.log(fechas2)
        for (let fecha of fechas2) {
            try {
                tiposPubl = await publicacionOrcid.distinct('publicacion.tipo')
                    .where('publicacion.fecha', fecha)
                    .exec()
            } catch (e) {
                console.error(e)
            }
        }
        tiposPubl.push("ALL")
        //tiposPubl.reverse()
        //filtros ordenados alfabéticamente
        return tiposPubl.sort()
    }

    // El parámetro de entrada debe ser un objeto literal JSON que se incluirá dentro de un array
    var objArray = (obj) => {
        let resultado = []
        for (let key in obj) {
            resultado.push(obj[key])
        }
        //console.log(resultado[0][0]);
        return resultado
    }

    // El parámetro de entrada debe ser un array
    // Devuelve el array invertido
    // Objetivo: tener el array de publicaciones ordenado de mayor fecha a menor. Se podría hacer con el reverse directamente sin implementar esta función
    var reverse = (arr) => {
        let resultado = []
        for (let i = arr.length - 1; i >= 0; i--) {
            resultado.push(arr[i])
        }
        //console.log(resultado[0][0])
        return resultado
    }

    //esta función opera sobre los 10 años más recientes ya
    var obtenerTrabajosAño = async (fechas2) => {
        for (let fecha of fechas2) {
            let listaPubliFinal = []
            try {
                const publ = await publicacionOrcid.find(
                    { 'publicacion.fecha': fecha },
                    {
                        'publicacion.titulo': 1,
                        'publicacion.tipo': 1,
                        'publicacion.fecha': 1,
                        'publicacion.doi': 1,
                        'publicacion.eid': 1,
                        'publicacion.autores': 1,
                        '_id': 1
                    })

                listaPubliFinal.push(publ)
                
                //se tiene un objeto literal JSON que va a contener varios arrays de objetos publicaciones (listaPubliFinal) almacenados en cada propiedad o clave fecha correspondiente
                //listaPubliFinal = clave: fecha  <==> valor: array objetos o documentos de la colección publicacionOrcid
                publiFecha[fecha] = listaPubliFinal
            } catch (e) {
                console.log(e.message)
            }
        }
        // Se tiene que pasar el json a un array para permitir revertir el orden
        // Devuelve un objeto convertido en array donde la primera posición es el menor año y contiene otro array con las publicaciones de ese año
        publiFecha = objArray(publiFecha)
        publiFecha = reverse(publiFecha)

        return publiFecha
    }

    try {
        await publicacionOrcid.distinct('publicacion.fecha', async (err, fechas) => {
            if (err) {
                return res.status(500).send({ message: 'Error en el servidor' })
            } else if (fechas) {
                // Devolvemos el resultado de las distintas fechas del array ordenadas de mayor a menor
                fechas.sort(function (a, b) {
                    return b - a
                })
                let fechas2 = fechas.slice(0, 10) //nos quedamos con los primeros 10 años. Esto siempre cogerá el año más actual en primer  lugar
                //console.log(fechas2)

                let todasPubli = await obtenerTrabajosAño(fechas2)

                tiposPubl = await obtenerTodosTiposFechas(fechas2)

                //console.log(tiposPubl)

                if (todasPubli.length !== undefined) {
                    for (let año of fechas2) {
                        for (let trabajo of todasPubli) { //array de arrays documentos publicacion ordenados por clave fecha
                            //console.table(trabajo)
                            for (let trabajo2 of trabajo[0]) { //se recorre cada array 
                                if (trabajo2.publicacion.fecha == año) {
                                    fechasFinal[año] = trabajo[0]
                                }
                            }
                        }
                    }
                }

                //consigo que las fechas estén en un array porque así se pueden ordenar
                var jsonArr = Object.keys(fechasFinal).map((key) => {
                    return [key, fechasFinal[key]]
                })

                jsonArr = jsonArr.reverse()

                /*console.log(Object.keys(fechasFinal).reduce((accumulator, currentValue) => {
                    accumulator[currentValue] = fechasFinal[currentValue]
                    return accumulator
                }, {}))*/

                //console.log(fechasFinal[2019])

                //console.log(typeof(todasPubli))
                res.render('../views/pages/global_works', { resultados: { trabajosOrdDesc: jsonArr, datos: fechas2 }, tiposPubl })
            } else {
                return res.status(404).send({message: 'No hay ninguna fecha asociada a publicaciones de CEATIC'})
            }
        })
    } catch (e) {
        console.log(e.message)
    }
}

// método para conseguir los trabajos en ORCID de un sólo miembro CEATIC con su OrcidId
// alternativa a router.get('/user/:id',  (req, res) => {}). Esto se haría sin controladores de por medio y en el fichero de rutas pero es mejor de esta forma
var getOneMemberWorks = async (req, res, next) => {

    const orcidId = req.params.id
    console.log('Orcid_ID: ', orcidId)

    //Función para tener ordenados de mayor a menor fecha los trabajos de un miembro
    var ordenarAsc = (p_array_json, p_key1, p_key2) => {
        p_array_json.sort(function (a, b) {
            let prop1 = a[p_key1]
            let elem1 = parseInt(prop1[p_key2])
            //console.log(typeof elem1)
            let prop2 = b[p_key1]
            let elem2 = parseInt(prop2[p_key2])
            //console.log(typeof elem2)
            //console.log(elem1 + " " + elem2)

            return elem2 - elem1
        })
    }

    //Esta consulta vale tanto para un array de objetos miembro como si no es un array como en este caso
    try {
        const miembro = await miembroOrcid.find({ 'miembro.orcidID': orcidId })
            .populate('miembro.publicaciones') //se poblan con datos las referencias de ids de cada publicación almacenadas en array objetos publicacion
            .exec() //se podria poner .exec(async (err, miembro) => {
            //Válida solo para array de objetos miembro
            //memberOrcid.find({miembro: {$elemMatch: {orcidID: orcidId}}}).exec((err, miembro) => {
                
        // Devolvemos el resultado
        var publFechas = miembro[0].miembro.publicaciones
        ordenarAsc(publFechas, 'publicacion', 'fecha')

        //No hay elementos en el array de publicaciones para el miembro
        if (publFechas.length < 1) {
            publFechas = 'No se han encontrado publicaciones asociadas'
        }

        //console.log(' Hola %s',miembro[0].miembro.nombre)
        res.status(200)
        res.render('../views/pages/individual_works', {
                nombre: miembro[0].miembro.nombre,
                apellidos: miembro[0].miembro.apellidos,
                descripción: miembro[0].miembro.descripción,
                posición: miembro[0].miembro.posición,
                orcidID: orcidId,
                experiencia: publFechas
        })
        //res.render('../views/pages/individual_works', {layout: 'layout', datos: works}); Esto se haria si se quiere cambiar el layout para renderizar desde el servidor
    } catch (err) {
        console.log("Detalles de error al completar información miembro: " + console.error)
        return res.status(err.status).send({ Mensaje: err.message })
    }
}

module.exports = {
    parserRegistroInfoOrcidContrPrincipal,
    getAllMemberWorks,
    getOneMemberWorks,
    getAllJournalMemberWorks2018
}
