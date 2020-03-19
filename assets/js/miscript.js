
$(document).ready(function() {

    //se limpia todo lo puesto en el input de búsqueda
    let condBuscar = $('.form-control').val("")

    let contadorNoResultados = 0,
        contadorResParcial = 0,
        contadorResParcial2 = 0,
        comparaResParcial = []

    $('.doi').each(function()  {
        //EID: scopus.com/record/display.uri?eid=codigoeid&origin=resultslist
        //WOS: onlinelibrary.wiley.com/resolve/reference/ISI?id=codigoWOS
       
        if($(this).text().substr(0,3) == "doi"){
            var link="http://dx.doi.org/"+$(this).text().substr(6)
            var doi=$(this).text().substr(6)
            $(this).html($(this).html().split(" ").splice(0,2).join(""))
            $(this).append('&nbsp <a href='+link+'>'+doi+'</a>')
            //$(this).attr('href', link)
        }

        if($(this).text().substr(0,3) == "eid"){
            var link="http://scopus.com/record/display.uri?eid="+$(this).text().substr(6)+"&origin=resultslist"
            //console.log(link)
            var eid=$(this).text().substr(6)
            $(this).html($(this).html().split(" ").splice(0,2).join(""))
            $(this).append('&nbsp <a href='+link+'>'+eid+'</a>')
            //$(this).attr('href', link)
        }
    });

    //función para implementar la funcionalidad de los filtros correctamente en vista global de publicaciones
    //los filtros funcionan sin MixItUp aunque en esta función se prepara para que funcione con dicho plugin si se quiere
    $('.boton-linea-ext').click(function() {
        //con esta línea se permite tener activado un filtro a la vez que los otros permanecerían desactivados
        $(this).addClass("active").siblings().removeClass("active")
        var self = $(this)
        //en el caso de seleccionar el filtro "ALL" se añade el display: flex a todas las publicaciones
        //en caso contrario se sacan de pantalla los elementos que no coincidan con el filtro seleccionado
        $('div.collapse').each(function() {
            let contadorFiltroSi = 0
            let tipo = []
            //nos quedamos con todos los tipos de publicación dentro de un año que corresponde al div.collapse
            let datacat = $(this).find('div.subheading')
            //console.log(datacat.length)
            for (let i = 0; i < datacat.length; i++) {
                tipo.push($(datacat[i]).text())
                //esta línea sirve si se usa el plugin MixItUp de JQuery
                let elem = $(datacat[i]).closest('.resume-item').addClass(`mix ${tipo[0]}`).removeClass('d-flex')
                tipo.pop()
                if (($(datacat[i]).text() !== self.find('.filter').text()) && (self.find('.filter').text() !== "ALL")) {
                    contadorFiltroSi++
                    //dar efectos de salida de contenidos
                    //probar con opacity y desplazamiento en lugar de display none (no se puede aplicar con transiciones) para después hacer que el elemento aparezca de nuevo. También valdría un position absolute
                    $(datacat[i]).closest('.resume-item').css('opacity', '0.035')
                    $(datacat[i]).closest('.resume-item').css('position', 'absolute')
                    $(datacat[i]).closest('.resume-item').css('transform', 'translate(-200%, 0px)')
                    $(datacat[i]).closest('.resume-item').css('transition', 'transform 1500ms ease-out 0ms', 'opacity 1500ms linear 0ms')
                } else {
                    //en este caso coincide el filtro y aparecen los resultados
                    $(this).closest('.accordion').css('display','block')
                    $(datacat[i]).closest('.resume-item').css('transform', 'translate(0px, 0px)')
                    $(datacat[i]).closest('.resume-item').css('opacity', '1')
                    $(datacat[i]).closest('.resume-item').css('position', 'static')
                    //$(datacat[i]).closest('.resume-item').addClass('d-flex')
                    $(datacat[i]).closest('.resume-item').css('transition', 'all 2000ms ease 0ms')
                }
            }
           
            //esto hace que desaparezca el bloque entero de un año si no se encuentran resultados del filtro seleccionado
            if (contadorFiltroSi == datacat.length) {
                $(this).closest('.accordion').css('display','none')
            }
         })
    })

    //Manejador evento ir arriba en documento web
    $('.ir-arriba').click(function(){
        $('body, html').animate({
            scrollTop: '0px'
        }, 300)
    })
 
    $(window).scroll(function() { //evento scroll. Explicar de nuevo que con una función anónima con operador flecha el $(this) no funcionaría
        if ( $(this).scrollTop() > 0 ) {
            $('.ir-arriba').slideDown(300)
        } else {
            $('.ir-arriba').slideUp(300)
        }
    })

    //función para buscar por título en vista de publicaciones individuales
    var buscar = (e) => {
        let cambiaResPaginacion = false,
        todasCoincPublBusq = [],
        tituloPubl = "",
        regex = ""
        //e.preventDefault()
        condBuscar = $('.form-control').val()
        let numCaractBusc = condBuscar.length
        //en este caso se comprueba si en el buscador hay algo o no para controlar lo que se muestra en la paginación
        if (condBuscar.length === 0) {
            apply_pagination(cambiaResPaginacion)
        } else {
            tituloPubl = $('.resume-item .resume-content h3.titulo')
            regex = new RegExp(condBuscar, 'gi')
            //console.log(condBuscar)
            //console.log("Longitud busqueda: " + condBuscar.length)
            $(tituloPubl).each((index, elemento) => { //Parece que con el operador flecha no sirve el this y por eso pongo elemento en la funcion
                /* tituloPubl = $(elemento).contents().filter(() => {
                        return this.nodeType === 3
                    }  ) --> Esta función puede ser correcta pero no acaba de funcionar
                    Nos quedamos solo con los nodeType 3 que son los de texto. En vez de .childrens(), uso .contents(), que selecciona también
                    los nodos de texto  */
           
                //aquí evaluamos si el texto de cada título de publicación coincide con la expresión que se busca
                if ($(elemento).text().match(regex)) { //No funciona con this porque cogería el contexto de todo el documento
                    //console.log("Coincidencia: " + $(elemento).text())
                    todasCoincPublBusq.push($(elemento))
                }
            })
        
            let noResultados = "No se encuentran coincidencias de publicaciones para su búsqueda"
            (todasCoincPublBusq.length !== 0)?apply_pagination(cambiaResPaginacion = true, todasCoincPublBusq, tituloPubl, numCaractBusc):apply_pagination(cambiaResPaginacion, noResultados, tituloPubl, numCaractBusc)
        }
    }

    $('[aria-label="Search"').on('input', (buscar)) //también podría ser con onchange

    //función general para paginar los resultados de búsqueda o por defecto que se muestran en la vista de publicaciones de un miembro en función del nº publ./pág y el total de pág.
    var muestraTodos = (itemPubli, publPorPag, limit, page, totalPubli) => { //Podría usarse rest con los parámetros
        comienzo = Math.max(page - 1, 0) * publPorPag
        final = (comienzo) + publPorPag
                 
        // este trozo equivale a si selecciona la primera página
        if (comienzo == 0) {
            for (let i = comienzo; i < final; i++) {
                $(itemPubli[i]).addClass('d-flex').removeClass('d-none')
            }
            for (let i = final; i < totalPubli; i++) {
                $(itemPubli[i]).removeClass('d-flex').addClass('d-none')
            }
        }
        // este trozo equivale a si selecciona una página intermedia
        else if (final < limit) {
            for (let i = 0; i < comienzo; i++) {
                $(itemPubli[i]).removeClass('d-flex').addClass('d-none')
            }
            for (let i = comienzo; i < final; i++) {
                $(itemPubli[i]).addClass('d-flex').removeClass('d-none')
            }
            for (let i = final; i < limit; i++) {
                $(itemPubli[i]).removeClass('d-flex').addClass('d-none')
            }
        } else {
            // este trozo equivale a si selecciona la última página
            for (let i = 0; i < comienzo; i++) {
                $(itemPubli[i]).removeClass('d-flex').addClass('d-none')
            }
            for (let i = comienzo; i < final; i++) {
                $(itemPubli[i]).addClass('d-flex').removeClass('d-none')
            }
        }
    }
   
    //Función para controlar la paginación en la vista de publicaciones de un miembro. Uso de plugin twbsPagination con componente Bootstrap
    //Aquí habría que tener en cuenta como mantenemos la paginación en caso de hacer búsquedas
    var apply_pagination = (condPag, ...otros) => {

      let pagination = $('#pagination'),
      totalPubli = 0,
      publPorPag = 10,
      totalPages = 0,
      itemPubli = $('.wmod1-100 div.resume-item') //array con elementos del DOM que se encargan de mostrar o no cada publicacion
      totalPubli = $('.wmod1-100 div.resume-item').length

      var acotaBusq = (elemGeneral, resBusq, contadorResParcial) => { //en la parte de busqueda se podria simplificar más mostrando solo lo que haya en resBusq sin tener marcas de selección anterior
        //Cada elemGeneral es un resultado encontrado justo anteriormente y resBusq es el conjunto de resultados de este momento al buscar
        let contNoCoinc = 0,
            resAnt = $(elemGeneral).find('.resume-content .titulo') //devuelve array de titulos de publicaciones en el DOM
        
        for (let tituloPublBusq of resBusq) {
            for (let elem of resAnt) {
                //console.log("Buscando para: " +  $(elem).text())
                if ($(tituloPublBusq).text() !== $(elem).text()) {
                    contNoCoinc++
                }
            }
        }
        if(contNoCoinc === resBusq.length)
            $(resAnt).closest('.wmod1-100 div.resume-item').addClass('d-none').removeClass('d-flex').attr("marca","false"+contadorResParcial)
      }

      //aqui me encargo de indicar que el número de páginas vaya en función del número total de elementos resultantes en la busqueda
      (condPag && otros.length !== 0)?totalPages = Math.ceil(otros[0].length / publPorPag):totalPages = Math.ceil(totalPubli / publPorPag)
      
      limit = totalPages * publPorPag

      if (otros.length !== 0) {
        //console.log("num coincidencias: " + otros[0].length)
        //console.log("num paginas: " + totalPages)
      }

      pagination.twbsPagination('destroy') //con esto se consigue anular que el evento onPageClick esté siempre ejecutando y no atienda a más llamadas
   
      //console.log("Longitud busqueda parte 2: " + condBuscar.length)

      var twb_options = {
        first: '<<',
        last: '>>',
        next: '>',
        prev: '<',
        totalPages: totalPages,
        visiblePages: 4,
        onPageClick: (event, page) => { //siempre que haya resultados condPag será true
            if (!condPag && condBuscar.length === 0) { //aquí solo se meteria si no hay nada escrito en el buscador, por ejemplo la primera vez que se renderiza la pagina
                muestraTodos(itemPubli, publPorPag, limit, page, totalPubli) //con esta función se quiere mostrar todas las publicaciones con paginación
                $('[seleccionado="true"]').each(function() { //esto se hace para no mostrar resultados de anteriores búsquedas, es como reiniciar las marcas
                    $(this).removeAttr("seleccionado")
                })
                //itemPubli.addClass('d-flex').removeClass('d-none').attr('seleccionado','true')
                contadorResParcial = 0
            } else if (!condPag || (otros[0].length === otros[1].length)) { //si no se tienen resultados con algo escrito en el buscador o coinciden todos los elementos del miembro con la busqueda
                if (typeof otros[0] === 'string') { //No hay coincidencias para la búsqueda por lo tanto no puede haber paginación y se muestra mensaje de no hay resultados
                    for (let i = 0; i < otros[1].length; i++) {
                        $(otros[1][i]).closest('.wmod1-100 div.resume-item').addClass('d-none').removeClass('d-flex')
                        $('#pagination').addClass('d-none') //aqui quitamos la paginacion porque no tenemos resultados. En cuanto hay resultados vuelve a aparecer
                    }
                    let mensaje = '<div class="resume-item d-flex flex-column flex-md-row justify-content-between mb-5">' +
                                  '<div class="resume-content resume-content-anchor">' +
                                  '<h3 class="noResult d-block mb-0">' + otros[0] + '</h3> </div></div>'
                    if (contadorNoResultados < 1) {
                        $('.resume-section1 .wmod1-100').append(mensaje) //añadimos el mensaje de "no se encuentran coincidencias"
                        $('section.resume-section1').css('min-height','0vh')
                        contadorNoResultados++
                    } else { //esto se hace para no añadir más mensajes del mismo tipo cuando no hay resultados de busqueda
                        $('.resume-item .resume-content .noResult').addClass('d-block').removeClass('d-none')
                    }
                } else { //esto seria el caso de que coincidieran de nuevo todos los resultados
                    //console.log("Prueba muestra todo")
                    $('.resume-item .resume-content .noResult').addClass('d-none').removeClass('d-block')
                    $('section.resume-section1').css('min-height','80vh')
                    contadorResParcial = 0
                    muestraTodos(itemPubli, publPorPag, limit, page, totalPubli) //con esta función se quiere mostrar todas las publicaciones con paginación
                }
            } else { //esto quiere decir que se está buscando una publicación y deseamos que aparezca eso en la vista teniendo resultados parciales, es decir no coinciden todos los elementos
                $('#pagination').removeClass('d-none') //volvemos a hacer visible en el DOM la paginación
                if (contadorResParcial < 1) { //solo vale para la primera letra introducida en el buscador
                    for (let tituloPublBusq of otros[0]) { //recorremos los elementos que coinciden con parte de la cadena de texto de búsqueda para mostrarlos y no quitarlos del DOM
                        //cuantas más letras el otros[0] tendrá menos elementos o incluso ninguno si no se encuentran coincidencias con la expresion
                        $(tituloPublBusq).closest('.wmod1-100 div.resume-item').addClass('d-flex').removeClass('d-none').attr('seleccionado','true')
                    }
                    for (let tituloPublGeneral of otros[1]) { //aqui buscamos los elementos que no tengan el atributo 'seleccionado' y se quitan del DOM
                        if ($(tituloPublGeneral).closest('.wmod1-100 div.resume-item').attr('seleccionado') !== 'true') {
                            $(tituloPublGeneral).closest('.wmod1-100 div.resume-item').addClass('d-none').removeClass('d-flex')
                        }
                    }
                    //console.log("Paso 1 parcial")
                    contadorResParcial++
                } else { //esto quiere decir que ya estamos trabajando con una busqueda mas acotada en la que cada vez se descartan más resultados
                    if ($('.resume-item .resume-content .noResult').hasClass('d-block')) {
                        $('.resume-item .resume-content .noResult').addClass('d-none').removeClass('d-block')
                        for (let tituloPublBusq of otros[0]) {
                            $(tituloPublBusq).closest('.wmod1-100 div.resume-item').addClass('d-flex').removeClass('d-none')
                        }
                    } else {
                        $('[seleccionado=true]').each((index, element) => { //buscamos los elementos que en la búsqueda anterior fueron seleccionados pero en esta busqueda no son
                            if (comparaResParcial.length === 0) {
                                acotaBusq(element, otros[0], contadorResParcial2)
                                if (index === ($('[seleccionado=true]').length - 1))
                                    contadorResParcial2++
                            } else {
                                if (otros[0].length < comparaResParcial[0]) { //aqui se mete si vamos acotando aún más la busqueda
                                    acotaBusq(element, otros[0], contadorResParcial2)
                                    if (index === ($('[seleccionado=true]').length - 1)) 
                                        contadorResParcial2++
                                } else if (otros[0].length > comparaResParcial[0]) { //aqui se mete si volvemos a resultados anteriores
                                    $(`[marca=false${contadorResParcial2}]`).removeClass('d-none').addClass('d-flex')
                                    $(`[marca=false${contadorResParcial2}]`).attr('seleccionado','true').removeAttr('marca')
                                    contadorResParcial2--
                                } else { //en este caso se mantienen los resultados si el número de coincidencias es igual a antes
                                    acotaBusq(element, otros[0], contadorResParcial2)
                                } 
                            }
                        })
                    }
                    if (comparaResParcial.length !== 0) {
                        comparaResParcial.splice(0)
                    }
                    comparaResParcial.push(otros[0].length) //vaciamos el array antes y después se almacena la cantidad de resultados obtenidos ahora para comparar con los obtenidos después
                    //console.log("Paso 2 parcial")
                }
            }
        }
      }
     
      if (condBuscar.length > 1) {
         console.log("Total coincidencias: " + otros[0].length)
      }
      
      //aqui twb_options tiene que tener el valor de su variable totalPages modificado en funcion del total de resultados a mostrar
      //debe estar activado siempre para que se meta la función apply_pagination en todo lo que pase en el evento onPageClick
      pagination.twbsPagination(twb_options)
    }


    //solo aplicamos paginación en caso de encontrarnos en la vista de publicaciones de un miembro en particular
    if (($(location).attr('pathname')) !== "/membersCEATIC/allWorks") {
        apply_pagination(false) //tener cuidado porque la primera vez que se llama a esta función no se pasan más parámetros
    }

    /* Este trozo de función para usar el plugin Mixitup para los filtros no sirve con handlebars
        $(function () {
       
        var filterList = {
       
            init: function () {
           
                // MixItUp plugin
                // http://mixitup.io
                var mixer = mixitup('.wmod2-100', {
                    selectors: {
                        control: '[data-mixitup-control]'
                    },
                    animation: {
                        enable: true,
                        effects: 'fade scale',
                        queue: true,
                        queueLimit: 10,
                        duration: 500
                    },
                    load: { //funcionan bien los filtros al cargarse con el load pero sólo la primera vez que se accede a la web
                        filter: '.CONFERENCE_PAPER' // show ALL tab on first load
                    }    
                });                            
           
            }
   
        };
       
        // Run the show!
        filterList.init();
       
    });*/

})
