$(function () {
  var Helper = window.Helper = {};

  Helper.drawLines function(x0, y0, x1, y1, callback) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var xo = 1;
    var yo = 1;
    if (x1 == x0){
        xo = 0;
    }
    if (y1 == y0){
        yo=0
    }
    if (y0 > y1){
        var py = -1;
        var yf = y1-1;
    }else{
        var py = 1;
        var yf = y1+1;       
    }
    if (x0 > x1){
        var px = -1;
        var xf = x1-1;
    }else{
        var px = 1;
        var xf = x1+1;
    }
    if (Math.abs(dx) >= Math.abs(dy)){
        var D = (2*dy - dx)*py;
        callback(x0,y0);
        var y = y0;
        var x = x0;
        for (x = (x0+px); x != xf; x = x+px){
            if ((D*yo) > 0){
                //writeToLog("D > 0");
                y = y+py;
                callback(x,y);
                D = D + py*(2*dy-2*dx);
            } else {
                //writeToLog("D =< 0");
                callback(x,y);
                D = D + py*(2*dy);
            }
        }
    } else {
        writeToLog("dy > dx");
        var D = (2*dx - dy)*px;
        callback(x0,y0);
        var y = y0;
        var x = x0;
        for (y = (y0+py); y != yf; y = y+py){
            if ((D*xo) > 0){
                writeToLog("change x");
                x = x+px;
                callback(x,y);
                D = D + px*(2*dx-2*dy);
            } else {
                callback(x,y);
                D = D + px*(2*dx);
            }
        }
    }    
};

})
