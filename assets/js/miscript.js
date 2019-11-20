$(document).ready(function() {
    var años=[];
    $('.doi').each(function(){
        if($(this).text().substr(0,3) == "doi"){
            //console.log($(this).text());
            var link="http://dx.doi.org/"+$(this).text().substr(6);
            var doi=$(this).text().substr(6);
            $(this).html($(this).html().split(" ").splice(0,2).join(""));
            $(this).append('&nbsp <a href='+link+'>'+doi+'</a>');
            //$(this).attr('href', link);
        }
    })

    /*$('.fecha').each(function(){
        for(const valor in años){
            if($(this).text() != años[valor]){
                años.push($(this).text());
            }
        }
    })
    for(const valor in años){
        console.log("Hola "+años[valor]);
    }*/
});      