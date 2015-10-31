// BAD!
// TODO: do something smarter here
window.getParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

window.createCookie = function(name,value) {
    var date = new Date();
    date.setTime(date.getTime()+(10*365*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
    document.cookie = name+"="+value+expires+"; path=/";
}

window.readCookie = function(name) {
    var nameEQ = name + "=",
        allCookies = document.cookie.split(';');
    for(var i=0;i < allCookies.length;i++) {
        var cookie = allCookies[i];
        while (cookie.charAt(0)==' ') cookie = cookie.substring(1, cookie.length);
        if (cookie.indexOf(nameEQ) == 0) return cookie.substring(nameEQ.length, cookie.length);
    }
    return undefined;
}
