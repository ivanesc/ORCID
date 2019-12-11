//esto nos servirá para añadir un helper global con varias funciones para aplicar con plantilla handlebars
var register = Handlebars => {
    var helpers = {
        //en este caso esta será la función que se maneje en el template dinámico con Handlebars
    if_eq: (a, b, opts) => {
        if(a == b){ // Or === depending on your needs
            return true;
            //return opts.fn(this);
        }
    },
    foo: (var1, var2) => { //esto sería en caso de querer añadir otra función al helper global
        return; 
    }
};

if (Handlebars && typeof Handlebars.registerHelper === "function") {
    for (var prop in helpers) {
        Handlebars.registerHelper(prop, helpers[prop]);
    }
} else {
    return helpers;
}

};

module.exports.register = register;
module.exports.helpers = register(null);