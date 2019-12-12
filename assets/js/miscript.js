$(document).ready(function() {
    var años=[];
    var contador=0;
    $('.doi').each(function(){
        //EID: scopus.com/record/display.uri?eid=codigoeid&origin=resultslist
        //WOS: onlinelibrary.wiley.com/resolve/reference/ISI?id=codigoWOS

        if($(this).text().substr(0,3) == "doi"){
            console.log("hola");
            var link="http://dx.doi.org/"+$(this).text().substr(6);
            var doi=$(this).text().substr(6);
            $(this).html($(this).html().split(" ").splice(0,2).join(""));
            $(this).append('&nbsp <a href='+link+'>'+doi+'</a>');
            //$(this).attr('href', link);
        }

        if($(this).text().substr(0,3) == "eid"){
            var link="http://scopus.com/record/display.uri?eid="+$(this).text().substr(6)+"&origin=resultslist";
            console.log(link);
            var eid=$(this).text().substr(6);
            $(this).html($(this).html().split(" ").splice(0,2).join(""));
            $(this).append('&nbsp <a href='+link+'>'+eid+'</a>');
            //$(this).attr('href', link);
        }
    })

    //console.log(allWorks);

    /*$('.fecha').each(function(){

        if(contador < 1){
            años.push($(this).text()); 
        }

        for(const valor in años){
            if($(this).text() != años[valor]){
                años.push($(this).text());
            }
        }
        contador++;
    })*/
    
    /*for(const valor in años){
        console.log("Hola "+años[valor]);
    }*/
});    